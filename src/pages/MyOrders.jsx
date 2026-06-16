import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { getMyOrders, primaryImage } from '../lib/supabase'

const STATUS_COLORS = {
  pending: { bg: '#fff8e1', color: '#f57f17' },
  confirmed: { bg: '#e3f2fd', color: '#1565c0' },
  processing: { bg: '#f3e5f5', color: '#6a1b9a' },
  shipped: { bg: '#e8f5e9', color: '#2e7d32' },
  delivered: { bg: '#e8f5e9', color: '#1b5e20' },
  cancelled: { bg: '#fdecea', color: '#c62828' },
}

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { state: { from: '/my-orders' } })
  }, [user, authLoading])

  useEffect(() => {
    if (user) {
      getMyOrders(user.id)
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setLoading(false))
    }
  }, [user])

  if (authLoading || loading) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <>
      <Helmet><title>My Orders – RamSetu Divine Stones</title></Helmet>

      <div className="page-header" style={{ background: 'var(--dark)', padding: '60px 20px', textAlign: 'center', borderBottom: '2px solid var(--gold)' }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 8 }}>My Orders</h1>
        <div className="breadcrumb" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Home / My Orders</div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px' }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📦</div>
            <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--dark)', marginBottom: 10 }}>No orders yet</h3>
            <p style={{ color: '#888', marginBottom: 24 }}>Start your divine shopping journey today</p>
            <Link to="/shop" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {orders.map(order => {
              const status = order.order_status || 'pending'
              const statusStyle = STATUS_COLORS[status] || STATUS_COLORS.pending
              return (
                <div key={order.id} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--dark)', fontSize: '0.9rem' }}>
                        Order #{String(order.id).slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: 3 }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ ...statusStyle, padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
                        {status}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#666' }}>
                        {order.payment_method === 'cod' ? '📦 COD' : '💳 Paid'}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    {(order.order_items || []).map(item => (
                      <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <img
                          src={primaryImage(item.products)}
                          alt={item.products?.name}
                          style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', background: '#f8f8f8' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--dark)' }}>{item.products?.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#888' }}>Qty: {item.qty} × ₹{Math.round(item.price)}</div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹{Math.round(item.price * item.qty)}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: '#888' }}>
                      {(order.order_items || []).length} item{(order.order_items || []).length !== 1 ? 's' : ''}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--dark)' }}>
                      Total: ₹{Math.round(order.total_amount)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
