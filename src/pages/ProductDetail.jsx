import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { getProductBySlug, primaryImage } from '../lib/supabase'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { slug } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    getProductBySlug(slug)
      .then(p => { setProduct(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  function handleAddToCart() {
    if (!product) return
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: primaryImage(product),
        slug: product.slug,
      })
    }
    toast.success(`${qty} item${qty > 1 ? 's' : ''} added to cart!`)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 20px' }}><div className="spinner" /></div>

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>😔</div>
      <h2>Product not found</h2>
      <Link to="/shop" className="btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>Back to Shop</Link>
    </div>
  )

  const images = product.product_images || []
  const displayImages = images.length > 0 ? images : [{ url: '/images/gallery/gallery-1.jpeg' }]

  return (
    <>
      <Helmet>
        <title>{product.name} – RamSetu Divine Stones</title>
        <meta name="description" content={product.description || `Buy ${product.name} — authentic sacred Ram Setu stone with free engraving and pan-India delivery.`} />
      </Helmet>

      <section className="shop-banner" style={{ padding: '36px 20px' }}>
        <div className="breadcrumb">
          <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home</Link>
          {' / '}
          <Link to="/shop" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Shop</Link>
          {' / '}
          <span style={{ color: 'var(--gold-pale)' }}>{product.name}</span>
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48 }}>
        {/* Images */}
        <div>
          <div style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '1', background: '#f8f8f8', marginBottom: 16 }}>
            <img
              src={displayImages[activeImg]?.url || primaryImage(product)}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {displayImages.length > 1 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {displayImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: i === activeImg ? '2px solid var(--gold)' : '2px solid transparent', flexShrink: 0 }}
                >
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.categories && (
            <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              {product.categories.name}
            </div>
          )}
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--dark)', marginBottom: 12 }}>{product.name}</h1>
          <div className="stars" style={{ fontSize: '1.1rem', marginBottom: 16 }}>★★★★★ <span style={{ fontSize: '0.82rem', color: '#888', fontWeight: 400 }}>(Verified buyers)</span></div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 24 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark)' }}>₹{Math.round(product.price)}</span>
            {product.compare_price && <del style={{ fontSize: '1.2rem', color: '#aaa' }}>₹{Math.round(product.compare_price)}</del>}
            {product.compare_price && (
              <span style={{ background: '#e8f5e9', color: '#2e7d32', borderRadius: 6, padding: '3px 10px', fontSize: '0.8rem', fontWeight: 700 }}>
                {Math.round((1 - product.price / product.compare_price) * 100)}% OFF
              </span>
            )}
          </div>

          {product.description && (
            <p style={{ color: '#555', lineHeight: 1.8, fontSize: '0.92rem', marginBottom: 24 }}>{product.description}</p>
          )}

          {/* Trust badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
            {['🏛️ 100% Authentic', '💧 Floats on Water', '✍️ Free Engraving', '🚚 Free Shipping'].map(b => (
              <span key={b} style={{ background: '#fff8ec', border: '1px solid var(--gold-pale)', borderRadius: 20, padding: '5px 14px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--dark)' }}>{b}</span>
            ))}
          </div>

          {/* Qty + Cart */}
          {product.stock_qty === 0 ? (
            <div style={{ padding: '14px 20px', background: '#fdecea', borderRadius: 10, color: '#c62828', fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>
              Out of Stock
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #ddd', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '10px 16px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>−</button>
                <span style={{ padding: '10px 20px', fontWeight: 700, fontSize: '1rem' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ padding: '10px 16px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>+</button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '0.95rem' }}>
                🛒 Add to Cart
              </button>
            </div>
          )}

          <Link to="/cart" style={{ display: 'block', textAlign: 'center', padding: '12px', background: 'var(--dark)', color: 'var(--gold)', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', marginBottom: 20 }}>
            View Cart →
          </Link>

          <div style={{ borderTop: '1px solid #eee', paddingTop: 20, fontSize: '0.82rem', color: '#777', lineHeight: 2 }}>
            <div>📦 Usually ships in 1–2 business days</div>
            <div>🔄 7-day hassle-free returns</div>
            <div>💳 COD available across India</div>
          </div>
        </div>
      </div>
    </>
  )
}
