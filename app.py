import os
import tempfile

from flask import Flask
from flask import send_from_directory, abort
from flask_login import LoginManager
from sqlalchemy import inspect, text
from flask_migrate import Migrate

from config import Config
from models import DEFAULT_SETTINGS, SiteSetting, User, db
from werkzeug.security import generate_password_hash
from datetime import datetime, timezone

login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message_category = 'info'


def create_app():
    instance_path = None
    if os.environ.get('VERCEL'):
        tmp = tempfile.gettempdir()
        instance_path = os.path.join(tmp, 'ram_setu_instance')
        instance_path = os.path.abspath(instance_path)
    # Ensure Flask serves the `static/` folder at `/static` explicitly. Some hosts
    # rewrite routes and it's safer to set these values explicitly.
    if instance_path:
        app = Flask(__name__, static_folder='static', static_url_path='/static', instance_path=instance_path)
    else:
        app = Flask(__name__, static_folder='static', static_url_path='/static')
    app.config.from_object(Config)
    Config.init_cloudinary()

    db.init_app(app)
    Migrate(app, db)
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(user_id)

    from routes.auth import auth_bp
    from routes.admin import admin_bp
    from routes.storefront import store_bp

    # Fallback route to serve static files directly from the repository. This
    # helps when hosting platforms route /static/* to the function rather than
    # serving files automatically. send_from_directory will return the file
    # from the `static/` folder if present.
    @app.route('/static/<path:filename>')
    def _static(filename):
        try:
            return send_from_directory(app.static_folder, filename)
        except Exception:
            abort(404)

    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(store_bp)

    with app.app_context():
        db.create_all()
        _ensure_legacy_schema()
        _seed_defaults()

    return app


def _ensure_legacy_schema():
    """Patch older tables that predate the current model.

    Adds missing non-primary-key columns based on SQLAlchemy model metadata.
    This is conservative: skips primary keys and does not alter existing column types.
    """
    inspector = inspect(db.engine)
    existing_tables = set(inspector.get_table_names())

    def sqlalchemy_type_to_sql(col):
        tname = type(col.type).__name__.lower()
        if 'string' in tname or 'varchar' in tname:
            length = getattr(col.type, 'length', None)
            return f"VARCHAR({length})" if length else "VARCHAR"
        if 'text' in tname:
            return 'TEXT'
        if 'integer' in tname or 'int' in tname:
            return 'INTEGER'
        if 'float' in tname or 'numeric' in tname or 'decimal' in tname:
            return 'FLOAT'
        if 'boolean' in tname:
            return 'BOOLEAN'
        if 'datetime' in tname or 'date' in tname:
            return 'TIMESTAMP WITH TIME ZONE'
        return 'TEXT'

    for table_name, table in db.metadata.tables.items():
        if table_name not in existing_tables:
            continue

        existing_cols = {c['name'] for c in inspector.get_columns(table_name)}

        for col in table.columns:
            if col.name in existing_cols:
                continue
            if col.primary_key:
                continue

            sql_type = sqlalchemy_type_to_sql(col)
            nullable = 'NULL' if col.nullable else 'NOT NULL'
            stmt = f"ALTER TABLE {table_name} ADD COLUMN {col.name} {sql_type} {nullable}"
            try:
                db.session.execute(text(stmt))
                db.session.commit()
            except Exception:
                db.session.rollback()


def _seed_defaults():
    """Seed admin user and default site settings."""
    admin = User.query.filter_by(email=Config.ADMIN_EMAIL).first()
    inspector = inspect(db.engine)
    id_col = next((c for c in inspector.get_columns('users') if c['name'] == 'id'), None)
    id_type_str = str(id_col['type']).lower() if id_col else ''

    uses_integer_id = 'int' in id_type_str or 'integer' in id_type_str

    if not admin:
        # If DB uses integer primary keys, avoid inserting a UUID id — use raw INSERT so DB assigns id
        if uses_integer_id:
            pw_hash = generate_password_hash(Config.ADMIN_PASSWORD)
            now = datetime.now(timezone.utc)
            stmt = text(
                "INSERT INTO users (email, password_hash, name, phone, is_admin, is_active_user, created_at)"
                " VALUES (:email, :password_hash, :name, :phone, :is_admin, :is_active_user, :created_at)"
            )
            db.session.execute(stmt, {
                'email': Config.ADMIN_EMAIL,
                'password_hash': pw_hash,
                'name': 'Admin',
                'phone': None,
                'is_admin': True,
                'is_active_user': True,
                'created_at': now,
            })
            db.session.commit()
            print(f'[SEED] Admin created (int-id DB): {Config.ADMIN_EMAIL} / {Config.ADMIN_PASSWORD}')
        else:
            admin = User(
                name='Admin',
                email=Config.ADMIN_EMAIL,
                is_admin=True,
            )
            admin.set_password(Config.ADMIN_PASSWORD)
            db.session.add(admin)
            db.session.commit()
            print(f'[SEED] Admin created: {Config.ADMIN_EMAIL} / {Config.ADMIN_PASSWORD}')
    else:
        if not admin.password_hash:
            if uses_integer_id:
                pw_hash = generate_password_hash(Config.ADMIN_PASSWORD)
                stmt = text("UPDATE users SET password_hash = :pw WHERE email = :email")
                db.session.execute(stmt, {'pw': pw_hash, 'email': Config.ADMIN_EMAIL})
                db.session.commit()
                print(f'[SEED] Admin password hash repaired (int-id DB) for: {Config.ADMIN_EMAIL}')
            else:
                admin.set_password(Config.ADMIN_PASSWORD)
                db.session.commit()
                print(f'[SEED] Admin password hash repaired for: {Config.ADMIN_EMAIL}')

    for key, value in DEFAULT_SETTINGS.items():
        if not SiteSetting.query.filter_by(key=key).first():
            db.session.add(SiteSetting(key=key, value=value))
    db.session.commit()


app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
