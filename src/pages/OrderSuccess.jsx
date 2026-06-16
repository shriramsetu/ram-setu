import { Link, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function OrderSuccess() {
  const { state } = useLocation()
  const orderId = state?.orderId

  return (
    <>
      <Helmet><title>Order Confirmed – RamSetu Divine Stones</title></Helmet>
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: 520 }}>
          <div style={{ width: 100, height: 100, background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', margin: '0 auto 24px' }}>
            🙏
          </div>
          <h1 style={{ fontFamily: 'Cinzel, serif', color: 'var(--dark)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginBottom: 12 }}>
            Order Confirmed!
          </h1>
          <p style={{ color: '#555', lineHeight: 1.8, marginBottom: 8 }}>
            Thank you for your sacred purchase. Your Ram Setu stone is on its way to you with divine blessings.
          </p>
          {orderId && (
            <p style={{ fontSize: '0.82rem', color: '#aaa', marginBottom: 28 }}>
              Order ID: <strong style={{ color: '#555' }}>#{String(orderId).slice(0, 8).toUpperCase()}</strong>
            </p>
          )}
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 32 }}>
            You will receive a confirmation email shortly. Track your order from <strong>My Orders</strong>.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/my-orders" className="btn-primary">View My Orders</Link>
            <Link to="/shop" style={{ padding: '12px 28px', background: '#fff', border: '2px solid var(--dark)', borderRadius: 10, color: 'var(--dark)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>Continue Shopping</Link>
          </div>
        </div>
      </div>
    </>
  )
}
