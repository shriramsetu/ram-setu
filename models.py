from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
import uuid

db = SQLAlchemy()


def generate_uuid():
    return str(uuid.uuid4())


def utcnow():
    return datetime.now(timezone.utc)


class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(512), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20))
    is_admin = db.Column(db.Boolean, default=False)
    is_active_user = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=utcnow)

    orders = db.relationship('Order', backref='user', lazy='dynamic')
    addresses = db.relationship('Address', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)


class Address(db.Model):
    __tablename__ = 'addresses'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    label = db.Column(db.String(50), default='Home')
    name = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address_line1 = db.Column(db.String(255), nullable=False)
    address_line2 = db.Column(db.String(255))
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utcnow)


class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(150), nullable=False, unique=True)
    slug = db.Column(db.String(200), nullable=False, unique=True, index=True)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(512))
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=utcnow)

    products = db.relationship('Product', backref='category', lazy='dynamic')


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(300), nullable=False, unique=True, index=True)
    short_description = db.Column(db.String(500))
    description = db.Column(db.Text)
    category_id = db.Column(db.String(36), db.ForeignKey('categories.id'), nullable=True)
    price = db.Column(db.Float, nullable=False)
    compare_price = db.Column(db.Float)
    sku = db.Column(db.String(50), unique=True)
    stock = db.Column(db.Integer, default=0)
    weight = db.Column(db.Float)  # in grams
    is_active = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utcnow)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    images = db.relationship('ProductImage', backref='product', lazy='dynamic',
                             order_by='ProductImage.sort_order',
                             cascade='all, delete-orphan')

    @property
    def primary_image(self):
        img = self.images.filter_by(is_primary=True).first()
        if not img:
            img = self.images.first()
        return img.image_url if img else None

    @property
    def discount_percent(self):
        if self.compare_price and self.compare_price > self.price:
            return round(((self.compare_price - self.price) / self.compare_price) * 100)
        return 0

    @property
    def in_stock(self):
        return self.stock > 0


class ProductImage(db.Model):
    __tablename__ = 'product_images'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    image_url = db.Column(db.String(512), nullable=False)
    cloudinary_public_id = db.Column(db.String(255))
    is_primary = db.Column(db.Boolean, default=False)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=utcnow)


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    order_number = db.Column(db.String(20), unique=True, nullable=False)
    status = db.Column(db.String(30), default='pending')
    # pending, confirmed, processing, shipped, delivered, cancelled, returned

    subtotal = db.Column(db.Float, default=0)
    discount = db.Column(db.Float, default=0)
    shipping_charge = db.Column(db.Float, default=0)
    tax = db.Column(db.Float, default=0)
    total = db.Column(db.Float, default=0)

    payment_method = db.Column(db.String(30))  # cod, razorpay
    payment_status = db.Column(db.String(30), default='pending')
    # pending, paid, failed, refunded
    razorpay_order_id = db.Column(db.String(100))
    razorpay_payment_id = db.Column(db.String(100))
    razorpay_signature = db.Column(db.String(255))

    coupon_code = db.Column(db.String(50))

    # Customer info
    customer_name = db.Column(db.String(150), nullable=False)
    customer_email = db.Column(db.String(255))
    customer_phone = db.Column(db.String(20), nullable=False)

    # Shipping address
    shipping_address = db.Column(db.Text, nullable=False)
    shipping_city = db.Column(db.String(100))
    shipping_state = db.Column(db.String(100))
    shipping_pincode = db.Column(db.String(10))

    notes = db.Column(db.Text)
    tracking_number = db.Column(db.String(100))
    tracking_url = db.Column(db.String(512))

    created_at = db.Column(db.DateTime, default=utcnow)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    items = db.relationship('OrderItem', backref='order', lazy='dynamic',
                            cascade='all, delete-orphan')

    @staticmethod
    def generate_order_number():
        prefix = 'RS'
        timestamp = datetime.now(timezone.utc).strftime('%y%m%d%H%M')
        random_part = str(uuid.uuid4().int)[:4]
        return f'{prefix}{timestamp}{random_part}'


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    order_id = db.Column(db.String(36), db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=True)
    product_name = db.Column(db.String(255), nullable=False)
    product_image = db.Column(db.String(512))
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    @property
    def total(self):
        return self.price * self.quantity


class Coupon(db.Model):
    __tablename__ = 'coupons'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    code = db.Column(db.String(50), unique=True, nullable=False)
    discount_type = db.Column(db.String(20), nullable=False)  # percentage, fixed
    discount_value = db.Column(db.Float, nullable=False)
    min_order_amount = db.Column(db.Float, default=0)
    max_discount = db.Column(db.Float)  # cap for percentage discount
    usage_limit = db.Column(db.Integer)
    used_count = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    valid_from = db.Column(db.DateTime)
    valid_until = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=utcnow)

    def is_valid(self, order_total):
        now = utcnow()
        if not self.is_active:
            return False, 'Coupon is not active'
        if self.valid_from and now < self.valid_from:
            return False, 'Coupon is not yet valid'
        if self.valid_until and now > self.valid_until:
            return False, 'Coupon has expired'
        if self.usage_limit and self.used_count >= self.usage_limit:
            return False, 'Coupon usage limit reached'
        if order_total < self.min_order_amount:
            return False, f'Minimum order amount is ₹{self.min_order_amount:.0f}'
        return True, 'Valid'

    def calculate_discount(self, order_total):
        if self.discount_type == 'percentage':
            discount = order_total * (self.discount_value / 100)
            if self.max_discount:
                discount = min(discount, self.max_discount)
        else:
            discount = self.discount_value
        return round(discount, 2)


class SiteSetting(db.Model):
    __tablename__ = 'site_settings'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    key = db.Column(db.String(100), unique=True, nullable=False, index=True)
    value = db.Column(db.Text)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    @staticmethod
    def get(key, default=None):
        setting = SiteSetting.query.filter_by(key=key).first()
        return setting.value if setting else default

    @staticmethod
    def set(key, value):
        setting = SiteSetting.query.filter_by(key=key).first()
        if setting:
            setting.value = str(value)
        else:
            setting = SiteSetting(key=key, value=str(value))
            db.session.add(setting)
        db.session.commit()
        return setting


# Default settings to seed
DEFAULT_SETTINGS = {
    'cod_enabled': 'true',
    'razorpay_enabled': 'false',
    'razorpay_key_id': '',
    'razorpay_key_secret': '',
    'shipping_charge': '49',
    'free_shipping_threshold': '999',
    'tax_rate': '0',
    'store_name': 'RamSetu Divine Stones',
    'store_phone': '+91 98765 43210',
    'store_email': 'info@ramsetudivinestones.com',
    'store_address': 'Ayodhya, Uttar Pradesh, India',
    'whatsapp_number': '919876543210',
}
