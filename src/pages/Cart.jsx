import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const { items, removeFromCart, updateQty, cartTotal } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  function handleCheckout() {
    if (!user) { navigate('/login', { state: { from: '/checkout' } }); return }
    navigate('/checkout')
  }

  if (items.length === 0) return (
    <>
      <Helmet><title>Cart – RamSetu Divine Stones</title></Helmet>
      <div className="page-header" style={{ background: 'var(--dark)', padding: '60px 20px', textAlign: 'center', borderBottom: '2px solid var(--gold)' }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 8 }}>Your Cart</h1>
        <div className="breadcrumb" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Home / Cart</div>
      </div>
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: 20 }}>🛒</div>
        <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--dark)', marginBottom: 10 }}>Your cart is empty</h2>
        <p style={{ color: '#888', marginBottom: 24 }}>Discover our sacred Ram Setu stones collection</p>
        <Link to="/shop" className="btn-primary">Browse Products</Link>
      </div>
    </>
  )

  const shipping = cartTotal >= 499 ? 0 : 79
  const total = cartTotal + shipping

  return (
    <>
      <Helmet><title>Cart – RamSetu Divine Stones</title></Helmet>
      <div className="page-header" style={{ background: 'var(--dark)', padding: '60px 20px', textAlign: 'center', borderBottom: '2px solid var(--gold)' }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 8 }}>Your Cart</h1>
        <div className="breadcrumb" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Home / Cart</div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px', display: 'grid', gridTemplateColumns: '1fr', gap: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28, alignItems: 'start' }}>
          {/* Items */}
          <div style={{ gridColumn: 'span 2' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 20, padding: '20px 0', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                <div style={{ width: 90, height: 90, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#f8f8f8' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: '0.95rem', color: 'var(--dark)', marginBottom: 4 }}>{item.name}</h4>
                  <div style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: 10 }}>₹{Math.round(item.price)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>−</button>
                      <span style={{ padding: '6px 14px', fontWeight: 700 }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#e53935', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Remove</button>
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--dark)', flexShrink: 0 }}>
                  ₹{Math.round(item.price * item.qty)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.07)', position: 'sticky', top: 100 }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', marginBottom: 20, fontSize: '1.1rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.9rem', color: '#555' }}>
              <span>Subtotal</span><span>₹{Math.round(cartTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.9rem', color: '#555' }}>
              <span>Shipping</span>
              <span style={{ color: shipping === 0 ? '#2e7d32' : 'inherit' }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            {shipping > 0 && <p style={{ fontSize: '0.76rem', color: '#aaa', marginBottom: 12 }}>Add ₹{499 - cartTotal} more for free shipping</p>}
            <div style={{ borderTop: '1px solid #eee', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.15rem', color: 'var(--dark)', marginBottom: 20 }}>
              <span>Total</span><span>₹{Math.round(total)}</span>
            </div>
            <button onClick={handleCheckout} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
              Proceed to Checkout →
            </button>
            <Link to="/shop" style={{ display: 'block', textAlign: 'center', marginTop: 14, fontSize: '0.85rem', color: '#888', textDecoration: 'none' }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
