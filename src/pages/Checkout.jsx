import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder, createOrderItems } from '../lib/supabase'

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart()
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

  const shipping = cartTotal >= 499 ? 0 : 79
  const total = cartTotal + shipping

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleCOD(e) {
    e.preventDefault()
    if (items.length === 0) { toast.error('Your cart is empty'); return }
    setLoading(true)
    try {
      const order = await createOrder({
        user_id: user.id,
        total_amount: total,
        shipping_amount: shipping,
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
      clearCart()
      navigate('/order-success', { state: { orderId: order.id } })
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleRazorpay(e) {
    e.preventDefault()
    if (items.length === 0) { toast.error('Your cart is empty'); return }
    setLoading(true)
    try {
      const res = await fetch('/.netlify/functions/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100) }),
      })
      const { orderId, key } = await res.json()

      const options = {
        key,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'RamSetu Divine Stones',
        description: `Order for ${items.length} item(s)`,
        order_id: orderId,
        prefill: { name: form.full_name, email: form.email, contact: form.phone },
        theme: { color: '#C0392B' },
        handler: async (response) => {
          try {
            const order = await createOrder({
              user_id: user.id,
              total_amount: total,
              shipping_amount: shipping,
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
            clearCart()
            navigate('/order-success', { state: { orderId: order.id } })
          } catch {
            toast.error('Payment captured but order creation failed. Please contact support.')
          }
        },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error('Payment initiation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <>
      <Helmet><title>Checkout – RamSetu Divine Stones</title></Helmet>
      <script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="page-header" style={{ background: 'var(--dark)', padding: '60px 20px', textAlign: 'center', borderBottom: '2px solid var(--gold)' }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 8 }}>Checkout</h1>
        <div className="breadcrumb" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Home / Cart / Checkout</div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, alignItems: 'start' }}>
        {/* Address Form */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
          <h3 style={{ fontFamily: 'Cinzel, serif', marginBottom: 24, fontSize: '1.1rem' }}>Delivery Address</h3>
          <form>
            {[
              { label: 'Full Name *', name: 'full_name', type: 'text', placeholder: 'Your full name' },
              { label: 'Email *', name: 'email', type: 'email', placeholder: 'your@email.com' },
              { label: 'Phone Number *', name: 'phone', type: 'tel', placeholder: '+91 XXXXX XXXXX' },
              { label: 'Address *', name: 'address', type: 'text', placeholder: 'House no., Street, Area' },
              { label: 'City *', name: 'city', type: 'text', placeholder: 'City' },
              { label: 'State *', name: 'state', type: 'text', placeholder: 'State' },
              { label: 'Pincode *', name: 'pincode', type: 'text', placeholder: '110001' },
            ].map(f => (
              <div className="form-group" key={f.name} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  required
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </form>
        </div>

        {/* Order Summary + Payment */}
        <div>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.07)', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', marginBottom: 20, fontSize: '1.1rem' }}>Order Summary</h3>
            {items.map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <img src={i.image} alt={i.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                  <span style={{ color: '#444' }}>{i.name} × {i.qty}</span>
                </div>
                <span style={{ fontWeight: 700 }}>₹{Math.round(i.price * i.qty)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#666', marginBottom: 8 }}>
                <span>Subtotal</span><span>₹{Math.round(cartTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#666', marginBottom: 14 }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? '#2e7d32' : 'inherit' }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                <span>Total</span><span>₹{Math.round(total)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={handleRazorpay}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Processing…' : '💳 Pay Online — ₹' + Math.round(total)}
            </button>
            <button
              onClick={handleCOD}
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: 700, background: '#fff', border: '2px solid var(--dark)', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', color: 'var(--dark)', opacity: loading ? 0.7 : 1 }}
            >
              📦 Cash on Delivery
            </button>
          </div>

          <div style={{ marginTop: 16, fontSize: '0.78rem', color: '#aaa', textAlign: 'center', lineHeight: 1.8 }}>
            🔒 Secured by Razorpay &nbsp;|&nbsp; 🛡️ 100% Safe Checkout
          </div>
        </div>
      </div>
    </>
  )
}
