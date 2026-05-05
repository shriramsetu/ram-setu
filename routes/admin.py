from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from functools import wraps
from models import (db, Product, ProductImage, Category, Order, OrderItem,
                    Coupon, SiteSetting, User)
from utils.cloudinary_helper import upload_image, delete_image
from slugify import slugify
from datetime import datetime, timezone

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


def admin_required(f):
    @wraps(f)
    @login_required
    def decorated(*args, **kwargs):
        if not current_user.is_admin:
            flash('Access denied.', 'error')
            return redirect(url_for('storefront.index'))
        return f(*args, **kwargs)
    return decorated


@admin_bp.route('/')
@admin_required
def dashboard():
    total_products = Product.query.count()
    total_orders = Order.query.count()
    total_users = User.query.filter_by(is_admin=False).count()
    total_revenue = db.session.query(
        db.func.coalesce(db.func.sum(Order.total), 0)
    ).filter(Order.payment_status == 'paid').scalar()
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(10).all()
    pending_orders = Order.query.filter_by(status='pending').count()
    low_stock = Product.query.filter(Product.stock <= 5, Product.is_active == True).all()
    return render_template('admin/dashboard.html',
                           total_products=total_products, total_orders=total_orders,
                           total_users=total_users, total_revenue=total_revenue,
                           recent_orders=recent_orders, pending_orders=pending_orders,
                           low_stock=low_stock)


@admin_bp.route('/categories')
@admin_required
def categories():
    cats = Category.query.order_by(Category.sort_order, Category.name).all()
    return render_template('admin/categories.html', categories=cats)


@admin_bp.route('/categories/add', methods=['POST'])
@admin_required
def add_category():
    name = request.form.get('name', '').strip()
    if not name:
        flash('Category name is required.', 'error')
        return redirect(url_for('admin.categories'))
    slug = slugify(name)
    if Category.query.filter_by(slug=slug).first():
        flash('Category already exists.', 'error')
        return redirect(url_for('admin.categories'))
    image_url = None
    file = request.files.get('image')
    if file and file.filename:
        result = upload_image(file, folder='ramsetu/categories')
        if result:
            image_url = result['url']
    cat = Category(name=name, slug=slug,
                   description=request.form.get('description', '').strip(),
                   image_url=image_url)
    db.session.add(cat)
    db.session.commit()
    flash('Category created!', 'success')
    return redirect(url_for('admin.categories'))


@admin_bp.route('/categories/<cat_id>/edit', methods=['POST'])
@admin_required
def edit_category(cat_id):
    cat = Category.query.get_or_404(cat_id)
    cat.name = request.form.get('name', cat.name).strip()
    cat.slug = slugify(cat.name)
    cat.description = request.form.get('description', '').strip()
    cat.is_active = request.form.get('is_active') == 'on'
    file = request.files.get('image')
    if file and file.filename:
        result = upload_image(file, folder='ramsetu/categories')
        if result:
            cat.image_url = result['url']
    db.session.commit()
    flash('Category updated!', 'success')
    return redirect(url_for('admin.categories'))


@admin_bp.route('/categories/<cat_id>/delete', methods=['POST'])
@admin_required
def delete_category(cat_id):
    cat = Category.query.get_or_404(cat_id)
    Product.query.filter_by(category_id=cat.id).update({'category_id': None})
    db.session.delete(cat)
    db.session.commit()
    flash('Category deleted.', 'success')
    return redirect(url_for('admin.categories'))


@admin_bp.route('/products')
@admin_required
def products():
    page = request.args.get('page', 1, type=int)
    q = request.args.get('q', '')
    query = Product.query
    if q:
        query = query.filter(Product.name.ilike(f'%{q}%'))
    products_list = query.order_by(Product.created_at.desc()).paginate(page=page, per_page=20, error_out=False)
    categories_list = Category.query.order_by(Category.name).all()
    return render_template('admin/products.html', products=products_list, categories=categories_list, q=q)


@admin_bp.route('/products/add', methods=['GET', 'POST'])
@admin_required
def add_product():
    categories_list = Category.query.filter_by(is_active=True).order_by(Category.name).all()
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        slug = slugify(name)
        base_slug = slug
        counter = 1
        while Product.query.filter_by(slug=slug).first():
            slug = f'{base_slug}-{counter}'
            counter += 1
        product = Product(
            name=name, slug=slug,
            short_description=request.form.get('short_description', '').strip(),
            description=request.form.get('description', '').strip(),
            category_id=request.form.get('category_id') or None,
            price=float(request.form.get('price', 0)),
            compare_price=float(request.form.get('compare_price', 0) or 0),
            sku=request.form.get('sku', '').strip() or None,
            stock=int(request.form.get('stock', 0)),
            weight=float(request.form.get('weight', 0) or 0),
            is_active=request.form.get('is_active') == 'on',
            is_featured=request.form.get('is_featured') == 'on',
        )
        db.session.add(product)
        db.session.flush()
        files = request.files.getlist('images')
        for i, file in enumerate(files):
            if file and file.filename:
                result = upload_image(file, folder='ramsetu/products')
                if result:
                    img = ProductImage(product_id=product.id, image_url=result['url'],
                                      cloudinary_public_id=result['public_id'],
                                      is_primary=(i == 0), sort_order=i)
                    db.session.add(img)
        db.session.commit()
        flash('Product created!', 'success')
        return redirect(url_for('admin.products'))
    return render_template('admin/product_form.html', product=None, categories=categories_list)


@admin_bp.route('/products/<product_id>/edit', methods=['GET', 'POST'])
@admin_required
def edit_product(product_id):
    product = Product.query.get_or_404(product_id)
    categories_list = Category.query.filter_by(is_active=True).order_by(Category.name).all()
    if request.method == 'POST':
        product.name = request.form.get('name', product.name).strip()
        product.short_description = request.form.get('short_description', '').strip()
        product.description = request.form.get('description', '').strip()
        product.category_id = request.form.get('category_id') or None
        product.price = float(request.form.get('price', product.price))
        product.compare_price = float(request.form.get('compare_price', 0) or 0)
        product.sku = request.form.get('sku', '').strip() or None
        product.stock = int(request.form.get('stock', product.stock))
        product.weight = float(request.form.get('weight', 0) or 0)
        product.is_active = request.form.get('is_active') == 'on'
        product.is_featured = request.form.get('is_featured') == 'on'
        files = request.files.getlist('images')
        existing_count = product.images.count()
        for i, file in enumerate(files):
            if file and file.filename:
                result = upload_image(file, folder='ramsetu/products')
                if result:
                    img = ProductImage(product_id=product.id, image_url=result['url'],
                                      cloudinary_public_id=result['public_id'],
                                      is_primary=(existing_count == 0 and i == 0),
                                      sort_order=existing_count + i)
                    db.session.add(img)
        db.session.commit()
        flash('Product updated!', 'success')
        return redirect(url_for('admin.products'))
    return render_template('admin/product_form.html', product=product, categories=categories_list)


@admin_bp.route('/products/<product_id>/delete', methods=['POST'])
@admin_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    for img in product.images.all():
        if img.cloudinary_public_id:
            delete_image(img.cloudinary_public_id)
    db.session.delete(product)
    db.session.commit()
    flash('Product deleted.', 'success')
    return redirect(url_for('admin.products'))


@admin_bp.route('/products/image/<image_id>/delete', methods=['POST'])
@admin_required
def delete_product_image(image_id):
    img = ProductImage.query.get_or_404(image_id)
    if img.cloudinary_public_id:
        delete_image(img.cloudinary_public_id)
    db.session.delete(img)
    db.session.commit()
    return jsonify({'success': True})


@admin_bp.route('/products/image/<image_id>/primary', methods=['POST'])
@admin_required
def set_primary_image(image_id):
    img = ProductImage.query.get_or_404(image_id)
    ProductImage.query.filter_by(product_id=img.product_id).update({'is_primary': False})
    img.is_primary = True
    db.session.commit()
    return jsonify({'success': True})


@admin_bp.route('/orders')
@admin_required
def orders():
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status', '')
    q = request.args.get('q', '')
    query = Order.query
    if status:
        query = query.filter_by(status=status)
    if q:
        query = query.filter(db.or_(Order.order_number.ilike(f'%{q}%'), Order.customer_name.ilike(f'%{q}%')))
    orders_list = query.order_by(Order.created_at.desc()).paginate(page=page, per_page=20, error_out=False)
    return render_template('admin/orders.html', orders=orders_list, current_status=status, q=q)


@admin_bp.route('/orders/<order_id>')
@admin_required
def order_detail(order_id):
    order = Order.query.get_or_404(order_id)
    return render_template('admin/order_detail.html', order=order)


@admin_bp.route('/orders/<order_id>/status', methods=['POST'])
@admin_required
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    new_status = request.form.get('status')
    if new_status:
        order.status = new_status
        if new_status == 'delivered' and order.payment_method == 'cod':
            order.payment_status = 'paid'
    order.tracking_number = request.form.get('tracking_number', '').strip() or order.tracking_number
    order.tracking_url = request.form.get('tracking_url', '').strip() or order.tracking_url
    db.session.commit()
    flash(f'Order #{order.order_number} updated.', 'success')
    return redirect(url_for('admin.order_detail', order_id=order.id))


@admin_bp.route('/coupons')
@admin_required
def coupons():
    coupons_list = Coupon.query.order_by(Coupon.created_at.desc()).all()
    return render_template('admin/coupons.html', coupons=coupons_list)


@admin_bp.route('/coupons/add', methods=['POST'])
@admin_required
def add_coupon():
    code = request.form.get('code', '').strip().upper()
    if not code:
        flash('Coupon code is required.', 'error')
        return redirect(url_for('admin.coupons'))
    if Coupon.query.filter_by(code=code).first():
        flash('Coupon code already exists.', 'error')
        return redirect(url_for('admin.coupons'))
    valid_from = request.form.get('valid_from')
    valid_until = request.form.get('valid_until')
    coupon = Coupon(
        code=code,
        discount_type=request.form.get('discount_type', 'percentage'),
        discount_value=float(request.form.get('discount_value', 0)),
        min_order_amount=float(request.form.get('min_order_amount', 0) or 0),
        max_discount=float(request.form.get('max_discount', 0) or 0) or None,
        usage_limit=int(request.form.get('usage_limit', 0) or 0) or None,
        is_active=request.form.get('is_active') == 'on',
        valid_from=datetime.fromisoformat(valid_from) if valid_from else None,
        valid_until=datetime.fromisoformat(valid_until) if valid_until else None,
    )
    db.session.add(coupon)
    db.session.commit()
    flash('Coupon created!', 'success')
    return redirect(url_for('admin.coupons'))


@admin_bp.route('/coupons/<coupon_id>/toggle', methods=['POST'])
@admin_required
def toggle_coupon(coupon_id):
    coupon = Coupon.query.get_or_404(coupon_id)
    coupon.is_active = not coupon.is_active
    db.session.commit()
    flash(f'Coupon {"activated" if coupon.is_active else "deactivated"}.', 'success')
    return redirect(url_for('admin.coupons'))


@admin_bp.route('/coupons/<coupon_id>/delete', methods=['POST'])
@admin_required
def delete_coupon(coupon_id):
    coupon = Coupon.query.get_or_404(coupon_id)
    db.session.delete(coupon)
    db.session.commit()
    flash('Coupon deleted.', 'success')
    return redirect(url_for('admin.coupons'))


@admin_bp.route('/customers')
@admin_required
def customers():
    page = request.args.get('page', 1, type=int)
    users_list = User.query.filter_by(is_admin=False).order_by(
        User.created_at.desc()).paginate(page=page, per_page=20, error_out=False)
    return render_template('admin/customers.html', users=users_list)


@admin_bp.route('/settings', methods=['GET', 'POST'])
@admin_required
def settings():
    if request.method == 'POST':
        keys = ['cod_enabled', 'razorpay_enabled', 'razorpay_key_id', 'razorpay_key_secret',
                'shipping_charge', 'free_shipping_threshold', 'tax_rate',
                'store_name', 'store_phone', 'store_email', 'store_address', 'whatsapp_number']
        for key in keys:
            value = request.form.get(key, '')
            if key in ('cod_enabled', 'razorpay_enabled'):
                value = 'true' if request.form.get(key) == 'on' else 'false'
            SiteSetting.set(key, value)
        flash('Settings saved!', 'success')
        return redirect(url_for('admin.settings'))
    all_settings = {s.key: s.value for s in SiteSetting.query.all()}
    return render_template('admin/settings.html', settings=all_settings)
