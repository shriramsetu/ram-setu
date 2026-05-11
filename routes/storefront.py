from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, session
from flask_login import login_required, current_user
from models import db, Product, ProductImage, Category, Order, OrderItem, Coupon, SiteSetting

# Import razorpay lazily; on deployments without the package, disable razorpay features
try:
    import razorpay
except Exception:
    razorpay = None

store_bp = Blueprint('storefront', __name__)


def get_cart():
    return session.get('cart', {})

def save_cart(cart):
    session['cart'] = cart

def get_cart_count():
    return sum(item['qty'] for item in get_cart().values())

def get_shipping_charge(subtotal):
    charge = float(SiteSetting.get('shipping_charge', 49))
    threshold = float(SiteSetting.get('free_shipping_threshold', 999))
    return 0 if subtotal >= threshold else charge


@store_bp.context_processor
def inject_cart_count():
    return dict(cart_count=get_cart_count())


# ───────── Pages ─────────
@store_bp.route('/')
def index():
    featured = Product.query.filter_by(is_active=True, is_featured=True).limit(8).all()
    categories = Category.query.filter_by(is_active=True).order_by(Category.sort_order).all()
    return render_template('index.html', featured_products=featured, categories=categories)


@store_bp.route('/shop')
def shop():
    page = request.args.get('page', 1, type=int)
    q = request.args.get('q', '')
    cat_slug = request.args.get('category', '')
    sort = request.args.get('sort', 'newest')
    price_min = request.args.get('price_min', type=float)
    price_max = request.args.get('price_max', type=float)

    query = Product.query.filter_by(is_active=True)
    if q:
        query = query.filter(Product.name.ilike(f'%{q}%'))
    if cat_slug:
        cat = Category.query.filter_by(slug=cat_slug).first()
        if cat:
            query = query.filter_by(category_id=cat.id)
    if price_min is not None:
        query = query.filter(Product.price >= price_min)
    if price_max is not None:
        query = query.filter(Product.price <= price_max)

    if sort == 'price_low':
        query = query.order_by(Product.price.asc())
    elif sort == 'price_high':
        query = query.order_by(Product.price.desc())
    elif sort == 'name':
        query = query.order_by(Product.name.asc())
    else:
        query = query.order_by(Product.created_at.desc())

    products = query.paginate(page=page, per_page=12, error_out=False)
    categories = Category.query.filter_by(is_active=True).order_by(Category.name).all()

    return render_template('shop.html', products=products, categories=categories,
                           q=q, current_category=cat_slug, current_sort=sort)


@store_bp.route('/product/<slug>')
def product_detail(slug):
    product = Product.query.filter_by(slug=slug, is_active=True).first_or_404()
    related = Product.query.filter(
        Product.category_id == product.category_id,
        Product.id != product.id,
        Product.is_active == True
    ).limit(4).all()
    return render_template('storefront/product_detail.html', product=product, related=related)


# ───────── Cart ─────────
@store_bp.route('/cart')
def cart():
    cart_data = get_cart()
    items = []
    subtotal = 0
    for pid, item in cart_data.items():
        product = Product.query.get(pid)
        if product:
            line_total = product.price * item['qty']
            subtotal += line_total
            items.append({'product': product, 'qty': item['qty'], 'total': line_total})

    shipping = get_shipping_charge(subtotal)
    threshold = float(SiteSetting.get('free_shipping_threshold', 999))
    return render_template('storefront/cart.html', items=items, subtotal=subtotal,
                           shipping=shipping, total=subtotal + shipping,
                           free_shipping_threshold=threshold)


@store_bp.route('/cart/add', methods=['POST'])
def add_to_cart():
    product_id = request.form.get('product_id')
    qty = int(request.form.get('qty', 1))
    product = Product.query.get(product_id)
    if not product or not product.in_stock:
        return jsonify({'success': False, 'message': 'Product not available'}), 400

    cart = get_cart()
    if product_id in cart:
        cart[product_id]['qty'] = min(cart[product_id]['qty'] + qty, product.stock)
    else:
        cart[product_id] = {'qty': min(qty, product.stock)}
    save_cart(cart)

    return jsonify({'success': True, 'cart_count': get_cart_count(),
                    'message': 'Added to cart!'})


@store_bp.route('/cart/update', methods=['POST'])
def update_cart():
    product_id = request.form.get('product_id')
    qty = int(request.form.get('qty', 1))
    cart = get_cart()
    if product_id in cart:
        if qty <= 0:
            del cart[product_id]
        else:
            product = Product.query.get(product_id)
            cart[product_id]['qty'] = min(qty, product.stock) if product else qty
    save_cart(cart)
    return redirect(url_for('storefront.cart'))


@store_bp.route('/cart/remove', methods=['POST'])
def remove_from_cart():
    product_id = request.form.get('product_id')
    cart = get_cart()
    cart.pop(product_id, None)
    save_cart(cart)
    return redirect(url_for('storefront.cart'))


@store_bp.route('/cart/apply-coupon', methods=['POST'])
def apply_coupon():
    code = request.form.get('coupon_code', '').strip().upper()
    cart = get_cart()
    subtotal = 0
    for pid, item in cart.items():
        product = Product.query.get(pid)
        if product:
            subtotal += product.price * item['qty']

    coupon = Coupon.query.filter_by(code=code).first()
    if not coupon:
        flash('Invalid coupon code.', 'error')
        return redirect(url_for('storefront.cart'))

    valid, msg = coupon.is_valid(subtotal)
    if not valid:
        flash(msg, 'error')
        return redirect(url_for('storefront.cart'))

    session['coupon_code'] = code
    discount = coupon.calculate_discount(subtotal)
    flash(f'Coupon applied! You save ₹{discount:.0f}', 'success')
    return redirect(url_for('storefront.cart'))


# ───────── Checkout ─────────
@store_bp.route('/checkout', methods=['GET', 'POST'])
def checkout():
    cart_data = get_cart()
    if not cart_data:
        flash('Your cart is empty.', 'error')
        return redirect(url_for('storefront.shop'))

    items = []
    subtotal = 0
    for pid, item in cart_data.items():
        product = Product.query.get(pid)
        if product:
            line_total = product.price * item['qty']
            subtotal += line_total
            items.append({'product': product, 'qty': item['qty'], 'total': line_total})

    discount = 0
    coupon_code = session.get('coupon_code')
    if coupon_code:
        coupon = Coupon.query.filter_by(code=coupon_code).first()
        if coupon:
            valid, _ = coupon.is_valid(subtotal)
            if valid:
                discount = coupon.calculate_discount(subtotal)

    shipping = get_shipping_charge(subtotal - discount)
    total = subtotal - discount + shipping

    cod_enabled = SiteSetting.get('cod_enabled', 'true') == 'true'
    razorpay_enabled = SiteSetting.get('razorpay_enabled', 'false') == 'true'
    razorpay_key = SiteSetting.get('razorpay_key_id', '')

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        phone = request.form.get('phone', '').strip()
        address = request.form.get('address', '').strip()
        city = request.form.get('city', '').strip()
        state = request.form.get('state', '').strip()
        pincode = request.form.get('pincode', '').strip()
        payment_method = request.form.get('payment_method', 'cod')
        notes = request.form.get('notes', '').strip()

        if not all([name, phone, address, city, state, pincode]):
            flash('Please fill all required fields.', 'error')
            return redirect(url_for('storefront.checkout'))

        order = Order(
            user_id=current_user.id if current_user.is_authenticated else None,
            order_number=Order.generate_order_number(),
            subtotal=subtotal, discount=discount,
            shipping_charge=shipping, total=total,
            payment_method=payment_method,
            payment_status='pending',
            coupon_code=coupon_code,
            customer_name=name, customer_email=email,
            customer_phone=phone,
            shipping_address=address, shipping_city=city,
            shipping_state=state, shipping_pincode=pincode,
            notes=notes,
        )
        db.session.add(order)
        db.session.flush()

        for item in items:
            oi = OrderItem(
                order_id=order.id,
                product_id=item['product'].id,
                product_name=item['product'].name,
                product_image=item['product'].primary_image,
                price=item['product'].price,
                quantity=item['qty'],
            )
            db.session.add(oi)
            item['product'].stock -= item['qty']

        if coupon_code:
            coupon = Coupon.query.filter_by(code=coupon_code).first()
            if coupon:
                coupon.used_count += 1

        db.session.commit()
        session.pop('cart', None)
        session.pop('coupon_code', None)

        if payment_method == 'razorpay' and razorpay_enabled:
            try:
                rz_key = SiteSetting.get('razorpay_key_id', '')
                rz_secret = SiteSetting.get('razorpay_key_secret', '')
                client = razorpay.Client(auth=(rz_key, rz_secret))
                rz_order = client.order.create({
                    'amount': int(total * 100),
                    'currency': 'INR',
                    'receipt': order.order_number,
                })
                order.razorpay_order_id = rz_order['id']
                db.session.commit()
                return render_template('storefront/razorpay_payment.html',
                                       order=order, rz_order=rz_order,
                                       razorpay_key=rz_key)
            except Exception as e:
                flash(f'Payment error: {str(e)}', 'error')
                order.payment_method = 'cod'
                db.session.commit()

        flash(f'Order #{order.order_number} placed successfully!', 'success')
        return redirect(url_for('storefront.order_success', order_id=order.id))

    return render_template('storefront/checkout.html', items=items,
                           subtotal=subtotal, discount=discount,
                           shipping=shipping, total=total,
                           coupon_code=coupon_code,
                           cod_enabled=cod_enabled,
                           razorpay_enabled=razorpay_enabled,
                           razorpay_key=razorpay_key)


@store_bp.route('/payment/verify', methods=['POST'])
def verify_payment():
    data = request.get_json()
    order_id = data.get('order_id')
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'success': False}), 404

    try:
        rz_key = SiteSetting.get('razorpay_key_id', '')
        rz_secret = SiteSetting.get('razorpay_key_secret', '')
        client = razorpay.Client(auth=(rz_key, rz_secret))
        client.utility.verify_payment_signature({
            'razorpay_order_id': data.get('razorpay_order_id'),
            'razorpay_payment_id': data.get('razorpay_payment_id'),
            'razorpay_signature': data.get('razorpay_signature'),
        })
        order.razorpay_payment_id = data.get('razorpay_payment_id')
        order.razorpay_signature = data.get('razorpay_signature')
        order.payment_status = 'paid'
        order.status = 'confirmed'
        db.session.commit()
        return jsonify({'success': True, 'redirect': url_for('storefront.order_success', order_id=order.id)})
    except Exception:
        order.payment_status = 'failed'
        db.session.commit()
        return jsonify({'success': False}), 400


@store_bp.route('/order/success/<order_id>')
def order_success(order_id):
    order = Order.query.get_or_404(order_id)
    return render_template('storefront/order_success.html', order=order)


@store_bp.route('/my-orders')
@login_required
def my_orders():
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
    return render_template('storefront/my_orders.html', orders=orders)


# ───────── Legal Pages for Razorpay ─────────

@store_bp.route('/terms')
def terms():
    return render_template('legal/terms.html', title="Terms & Conditions")

@store_bp.route('/privacy')
def privacy():
    return render_template('legal/privacy.html', title="Privacy Policy")

@store_bp.route('/shipping-policy')
def shipping_policy():
    return render_template('legal/shipping.html', title="Shipping & Delivery Policy")

@store_bp.route('/refund-policy')
def refund_policy():
    return render_template('legal/refund.html', title="Return & Refund Policy")

@store_bp.route('/contact')
def contact():
    return render_template('legal/contact.html', title="Contact Us")
