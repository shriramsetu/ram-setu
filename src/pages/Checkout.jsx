import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder, createOrderItems, supabase } from '../lib/supabase'
import { Ticket, ShieldAlert, Lock, CreditCard, ShoppingBag, Truck, ChevronLeft, Plus, Minus } from 'lucide-react'

export default function Checkout() {
  const { items, cartTotal, clearCart, updateQty } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [isProcessingCod, setIsProcessingCod] = useState(false)
  const [isProcessingOnline, setIsProcessingOnline] = useState(false)
  const [isOrderCompleted, setIsOrderCompleted] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')

  // Configuration settings (loaded dynamically from database/local storage)
  const [settings, setSettings] = useState({
    shipping_threshold: 499,
    shipping_flat_rate: 79,
    enable_razorpay: true,
    enable_cod: true
  })

  // Coupon states
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase.from('site_settings').select('*')
        const loaded = {}
        if (!error && data && data.length > 0) {
          data.forEach(item => {
            let val = item.value
            if (val === 'true') val = true
            if (val === 'false') val = false
            if (!isNaN(val) && typeof val === 'string' && val.trim() !== '') val = parseFloat(val)
            
            if (item.key === 'free_shipping_threshold') loaded['shipping_threshold'] = parseFloat(val) || 0
            else if (item.key === 'shipping_charge') loaded['shipping_flat_rate'] = parseFloat(val) || 0
            else if (item.key === 'razorpay_enabled') loaded['enable_razorpay'] = val === 'true' || val === true
            else if (item.key === 'cod_enabled') loaded['enable_cod'] = val === 'true' || val === true
            else loaded[item.key] = val
          })
        }
        
        // Merge with local storage settings as fallback/cache
        const local = localStorage.getItem('admin_settings')
        const localParsed = local ? JSON.parse(local) : {}
        setSettings(prev => ({ ...prev, ...localParsed, ...loaded }))
      } catch {
        loadLocalSettings()
      }
    }

    function loadLocalSettings() {
      const local = localStorage.getItem('admin_settings')
      if (local) {
        try {
          setSettings(JSON.parse(local))
        } catch (e) {
          console.error(e)
        }
      }
    }

    loadSettings()

    // Fetch Site Logo URL for Razorpay
    supabase.from('site_media').select('url').eq('media_key', 'site_logo').single()
      .then(({ data }) => {
        if (data && data.url) setLogoUrl(data.url)
      })
  }, [])

  // Load Razorpay checkout script dynamically
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Calculate pricing values
  const shipping = cartTotal >= settings.shipping_threshold ? 0 : settings.shipping_flat_rate
  
  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0
    if (appliedCoupon.discount_type === 'percent') {
      return (cartTotal * appliedCoupon.discount_value) / 100
    } else {
      return appliedCoupon.discount_value
    }
  }

  const discount = getDiscountAmount()
  const discountedSubtotal = Math.max(0, cartTotal - discount)
  const total = discountedSubtotal + shipping

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  // Handle coupon validation
  async function handleApplyCoupon(e) {
    e.preventDefault()
    setCouponError('')
    if (!couponInput.trim()) return

    const code = couponInput.toUpperCase().trim()
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single()
      
      if (error || !data) throw new Error('Invalid coupon')
      setAppliedCoupon(data)
      toast.success(`Coupon "${code}" applied successfully!`)
    } catch {
      // Try local fallback
      const local = localStorage.getItem('admin_coupons')
      const localCoupons = local ? JSON.parse(local) : []
      const found = localCoupons.find(c => c.code === code && c.is_active)
      if (found) {
        setAppliedCoupon(found)
        toast.success(`Coupon "${code}" applied successfully!`)
      } else {
        setCouponError('Invalid or expired coupon code')
        toast.error('Invalid or expired coupon code')
      }
    }
  }

  function validateCheckoutForm() {
    if (!form.full_name || !form.full_name.trim()) {
      toast.error('Please enter your full name')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email || !emailRegex.test(form.email.trim())) {
      toast.error('Please enter a valid email address')
      return false
    }
    const cleanPhone = (form.phone || '').replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return false
    }
    if (!form.address || !form.address.trim()) {
      toast.error('Please enter your shipping address')
      return false
    }
    if (!form.city || !form.city.trim()) {
      toast.error('Please enter your city')
      return false
    }
    if (!form.state || !form.state.trim()) {
      toast.error('Please enter your state')
      return false
    }
    const cleanPincode = (form.pincode || '').replace(/\D/g, '')
    if (cleanPincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode')
      return false
    }
    return true
  }

  // Place Cash on Delivery order
  async function handleCOD(e) {
    e.preventDefault()
    if (!user) {
      toast.error('Please log in to your account to place an order.')
      return
    }
    if (!settings.enable_cod) {
      toast.error('COD option is currently unavailable')
      return
    }
    if (items.length === 0) { toast.error('Your cart is empty'); return }
    
    // Validate form
    if (!validateCheckoutForm()) return

    setLoading(true)
    setIsProcessingCod(true)
    try {
      const order = await createOrder({
        user_id: user?.id || null,
        email: form.email,
        full_name: form.full_name,
        total_amount: total,
        shipping_amount: shipping,
        discount_amount: discount,
        coupon_code: appliedCoupon?.code || null,
        payment_method: 'cod',
        payment_status: 'pending',
        order_status: 'confirmed',
        shipping_address: form,
      })
      await createOrderItems(items.map(i => ({
        order_id: order.id,
        product_id: i.id,
        qty: i.qty,
        price: i.price,
      })))
      setIsOrderCompleted(true)
      clearCart()
      navigate('/order-success', { state: { orderId: order.id } })
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
      setIsProcessingCod(false)
    }
  }

  // Place Razorpay order
  async function handleRazorpay(e) {
    e.preventDefault()
    if (!user) {
      toast.error('Please log in to your account to place an order.')
      return
    }
    if (!settings.enable_razorpay) {
      toast.error('Online Payment option is currently unavailable')
      return
    }
    if (items.length === 0) { toast.error('Your cart is empty'); return }
    
    // Validate form
    if (!validateCheckoutForm()) return

    if (!window.Razorpay) {
      toast.error('Razorpay SDK failed to load. Please check your internet connection.')
      return
    }

    setLoading(true)
    setIsProcessingOnline(true)
    try {
      // 1. Fetch Razorpay Order from Server
      const res = await fetch('/.netlify/functions/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100) }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Server error initiating order')
      }
      const { orderId, key } = await res.json()

      const options = {
        key: key,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'RamSetu Divine Stones',
        description: `Order for ${items.length} item(s)`,
        image: logoUrl || undefined,
        order_id: orderId,
        prefill: { name: form.full_name, email: form.email, contact: form.phone },
        theme: { color: '#C8860A' },
        handler: async (response) => {
          try {
            const order = await createOrder({
              user_id: user?.id || null,
              email: form.email,
              full_name: form.full_name,
              total_amount: total,
              shipping_amount: shipping,
              discount_amount: discount,
              coupon_code: appliedCoupon?.code || null,
              payment_method: 'razorpay',
              payment_status: 'paid',
              order_status: 'confirmed',
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              shipping_address: form,
            })
            await createOrderItems(items.map(i => ({
              order_id: order.id,
              product_id: i.id,
              qty: i.qty,
              price: i.price,
            })))
            setIsOrderCompleted(true)
            clearCart()
            navigate('/order-success', { state: { orderId: order.id } })
            setIsProcessingOnline(false)
          } catch {
            toast.error('Payment captured but order creation failed. Please contact support.')
            setLoading(false)
            setIsProcessingOnline(false)
          }
        },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error(`Payment initiation failed: ${err.message || 'Please try again.'}`)
      setLoading(false)
      setIsProcessingOnline(false)
    } finally {
      // Don't set loading false here as handler/rzp.open is async
    }
  }

  // Redirect to cart only if cart is empty and order is not successfully completed
  useEffect(() => {
    if (items.length === 0 && !isOrderCompleted) {
      navigate('/cart')
    }
  }, [items, navigate, isOrderCompleted])

  return (
    <>
      <Helmet><title>Checkout – RamSetu Divine Stones</title></Helmet>

      <div className="relative min-h-screen bg-cream2 py-10 sm:py-16 overflow-hidden text-left font-sans">
        {/* Ambient background atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream2 via-[#FBF7EE] to-cream2 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #B8893A 1px, transparent 1px)', backgroundSize: '26px 26px' }}
          aria-hidden="true"
        />

        {/* Glowing orbs for depth */}
        <div className="absolute -top-24 -left-24 w-64 h-64 sm:w-96 sm:h-96 bg-gold/10 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 sm:w-96 sm:h-96 bg-gold/10 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />

        {/* Top Header Detail directly styled on the layout */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase mb-3.5">
            ✦ Secure Checkout ✦
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-dark mb-2">
            Checkout
          </h1>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Link to="/" className="hover:text-gold transition-colors focus-visible:outline-none rounded">Home</Link>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <Link to="/cart" className="hover:text-gold transition-colors focus-visible:outline-none rounded">Cart</Link>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-gold/70">Checkout</span>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Delivery Details Form */}
            <div className="lg:col-span-7 relative bg-white rounded-[1.75rem] sm:rounded-[2rem] border border-gold/20 p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_-20px_rgba(184,137,58,0.15)]">
              {/* Corner accents */}
              <div className="absolute top-5 left-5 w-4 h-4 border-t border-l border-gold/40 rounded-tl pointer-events-none" />
              <div className="absolute bottom-5 right-5 w-4 h-4 border-b border-r border-gold/40 rounded-br pointer-events-none" />

              <div className="flex items-center gap-3 border-b border-gold/10 pb-5 mb-6">
                <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                  <Truck className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-dark text-lg uppercase tracking-wider">
                  Delivery Address
                </h2>
              </div>
              
              <form className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-sans pl-1">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      value={form.full_name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full h-11 sm:h-12 px-4 rounded-xl border border-gold/20 bg-cream2/40 text-dark placeholder:text-gray-300 text-sm font-sans outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 focus:bg-white transition-all duration-300 shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-sans pl-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full h-11 sm:h-12 px-4 rounded-xl border border-gold/20 bg-cream2/40 text-dark placeholder:text-gray-300 text-sm font-sans outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 focus:bg-white transition-all duration-300 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-sans pl-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full h-11 sm:h-12 px-4 rounded-xl border border-gold/20 bg-cream2/40 text-dark placeholder:text-gray-300 text-sm font-sans outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 focus:bg-white transition-all duration-300 shadow-inner"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-sans pl-1">Shipping Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House no., Street, Area, Landmark"
                    className="w-full h-11 sm:h-12 px-4 rounded-xl border border-gold/20 bg-cream2/40 text-dark placeholder:text-gray-300 text-sm font-sans outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 focus:bg-white transition-all duration-300 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-sans pl-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full h-11 sm:h-12 px-4 rounded-xl border border-gold/20 bg-cream2/40 text-dark placeholder:text-gray-300 text-sm font-sans outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 focus:bg-white transition-all duration-300 shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-sans pl-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={form.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full h-11 sm:h-12 px-4 rounded-xl border border-gold/20 bg-cream2/40 text-dark placeholder:text-gray-300 text-sm font-sans outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 focus:bg-white transition-all duration-300 shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-sans pl-1">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="110001"
                      className="w-full h-11 sm:h-12 px-4 rounded-xl border border-gold/20 bg-cream2/40 text-dark placeholder:text-gray-300 text-sm font-sans outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 focus:bg-white transition-all duration-300 shadow-inner"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Right: Order Summary & Actions */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative bg-white rounded-[1.75rem] sm:rounded-[2rem] border border-gold/20 p-6 sm:p-8 shadow-[0_20px_60px_-20px_rgba(184,137,58,0.15)]">
                {/* Corner accents */}
                <div className="absolute top-5 left-5 w-4 h-4 border-t border-l border-gold/40 rounded-tl pointer-events-none" />
                <div className="absolute bottom-5 right-5 w-4 h-4 border-b border-r border-gold/40 rounded-br pointer-events-none" />

                <div className="flex items-center gap-3 border-b border-gold/10 pb-4 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-dark text-base uppercase tracking-wider">
                    Order Summary
                  </h2>
                </div>

                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
                  {items.map(i => (
                    <div key={i.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                      <div className="flex gap-3.5 items-center">
                        <img src={i.image} alt={i.name} className="w-12 h-12 rounded-xl object-cover border border-gold/10 shadow-sm shrink-0" />
                        <div>
                          <span className="block font-bold text-dark text-sm leading-tight">{i.name}</span>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400 font-semibold">
                            <span>Qty:</span>
                            <div className="flex items-center gap-2 bg-cream2/60 border border-gold/10 px-2 py-0.5 rounded-lg">
                              <button
                                type="button"
                                onClick={() => i.qty > 1 && updateQty(i.id, i.qty - 1)}
                                disabled={i.qty <= 1}
                                className="text-gray-400 hover:text-gold transition-colors focus:outline-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-dark text-xs font-bold w-4 text-center select-none">{i.qty}</span>
                              <button
                                type="button"
                                onClick={() => updateQty(i.id, i.qty + 1)}
                                className="text-gray-400 hover:text-gold transition-colors focus:outline-none cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-dark text-sm">₹{Math.round(i.price * i.qty)}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon Code section */}
                <div className="border-t border-gray-100 pt-5 mt-5">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2.5">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      disabled={!!appliedCoupon}
                      className="flex-1 h-10 px-4 rounded-xl border border-gold/20 bg-cream2/40 text-dark placeholder:text-gray-300 text-xs font-sans outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 focus:bg-white transition-all duration-300 shadow-inner uppercase"
                    />
                    <button
                      type="submit"
                      disabled={!!appliedCoupon || !couponInput.trim()}
                      className="h-10 px-5 bg-gold hover:bg-dark text-dark hover:text-gold border border-gold/30 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>

                  {appliedCoupon && (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-xs mt-3">
                      <span className="flex items-center gap-2 font-semibold">
                        <Ticket className="w-4 h-4 text-green-600" />
                        <span>Code <strong>{appliedCoupon.code}</strong> active</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => { setAppliedCoupon(null); setCouponInput('') }}
                        className="bg-transparent border-none text-red-600 hover:text-red-800 font-bold cursor-pointer text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <div className="text-red-600 text-xs font-semibold mt-2 pl-1">
                      {couponError}
                    </div>
                  )}
                </div>

                {/* Pricing Table */}
                <div className="border-t border-gray-100 pt-5 mt-5 space-y-3 font-sans text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-dark">₹{Math.round(cartTotal)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-bold">- ₹{Math.round(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className={`font-bold ${shipping === 0 ? 'text-green-600' : 'text-dark'}`}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-4 border-t border-dashed border-gray-200 text-dark">
                    <span className="font-bold text-base uppercase">Total</span>
                    <span className="font-black text-2xl text-dark">₹{Math.round(total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Buttons Card */}
              <div className="flex flex-col gap-3">
                {!user ? (
                  <div className="flex flex-col items-center gap-3 bg-red-50 border border-red-200/60 p-5 rounded-2xl text-center font-sans">
                    <ShieldAlert className="w-6 h-6 text-red-600 mb-1" />
                    <p className="text-xs font-bold text-red-950">Login Required to Checkout</p>
                    <p className="text-[11px] text-red-700/80 leading-normal max-w-xs">
                      You must be signed in to your account to make a payment and place an order.
                    </p>
                    <Link
                      to="/login"
                      state={{ from: '/checkout' }}
                      className="mt-2 inline-flex items-center justify-center px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-red-600/10 focus-visible:outline-none"
                    >
                      Login / Sign Up
                    </Link>
                  </div>
                ) : (
                  <>
                    {settings.enable_razorpay && (
                      <button
                        onClick={handleRazorpay}
                        disabled={loading}
                        className="group w-full h-12 bg-gold hover:bg-dark text-dark hover:text-gold border border-gold/30 rounded-xl font-bold text-xs uppercase tracking-widest shadow-[0_8px_24px_-8px_rgba(200,134,10,0.3)] hover:shadow-[0_10px_32px_-6px_rgba(200,134,10,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 mt-1 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CreditCard className="w-4 h-4" /> {isProcessingOnline ? 'Processing…' : `Pay Online — ₹${Math.round(total)}`}
                      </button>
                    )}

                    {settings.enable_cod && (
                      <button
                        onClick={handleCOD}
                        disabled={loading}
                        className="w-full h-11 border-2 border-dark text-dark hover:bg-dark hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="w-4 h-4" /> {isProcessingCod ? 'Processing…' : 'Cash on Delivery (COD)'}
                      </button>
                    )}

                    {!settings.enable_razorpay && !settings.enable_cod && (
                      <div className="flex gap-3 items-start bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs leading-relaxed font-sans">
                        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
                        <span>We are currently updating our payment gateways. Please contact support to complete your checkout.</span>
                      </div>
                    )}
                  </>
                )}

                <div className="text-center text-[10px] text-gray-400 tracking-wider uppercase py-2 flex items-center justify-center gap-1.5 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-gold" /> Secured Checkout  |  100% Safe Payments
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
