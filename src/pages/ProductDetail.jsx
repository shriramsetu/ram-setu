import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { getProductBySlug, primaryImage, supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { Award, Waves, PenTool, Truck, Calendar, RotateCcw, CreditCard, ShoppingCart, Star, ChevronUp, ChevronDown } from 'lucide-react'

export default function ProductDetail() {
  const { slug } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const thumbRef = useRef(null)

  useEffect(() => {
    getProductBySlug(slug)
      .then(async (p) => {
        if (p) {
          try {
            const { data } = await supabase
              .from('site_settings')
              .select('value')
              .eq('key', `seo_prod_${p.id}`)
              .single()
            if (data && data.value) {
              const seo = JSON.parse(data.value)
              p.meta_title = seo.meta_title
              p.meta_description = seo.meta_description
              p.seo_keywords = seo.seo_keywords
            }
          } catch (e) {
            // ignore
          }
        }
        setProduct(p)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  const scrollThumbnails = (direction) => {
    if (thumbRef.current) {
      const scrollAmount = 100
      thumbRef.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

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
        <title>{product.meta_title || `${product.name} – RamSetu Divine Stones`}</title>
        <meta name="description" content={product.meta_description || product.description || `Buy ${product.name} — authentic sacred Ram Setu stone with free engraving and pan-India delivery.`} />
        {product.seo_keywords && <meta name="keywords" content={product.seo_keywords} />}
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
      <div className="product-detail-grid" style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px', gap: 48 }}>
        {/* Images */}
        <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: 16, alignItems: 'start' }}>
          <div style={{ flex: 1, borderRadius: 16, overflow: 'hidden', aspectRatio: '1', background: '#f8f8f8' }}>
            <img
              src={displayImages[activeImg]?.url || primaryImage(product)}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {displayImages.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {displayImages.length > 4 && (
                <button
                  type="button"
                  onClick={() => scrollThumbnails('up')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--gold)',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <ChevronUp className="w-6 h-6" />
                </button>
              )}
              <div
                ref={thumbRef}
                className="no-scrollbar"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  maxHeight: 380,
                  overflowY: 'auto',
                  paddingRight: 4,
                  flexShrink: 0,
                  scrollBehavior: 'smooth'
                }}
              >
                {displayImages.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 10,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: i === activeImg ? '3px solid var(--gold)' : '2.5px solid transparent',
                      transform: i === activeImg ? 'scale(1.05)' : 'scale(1)',
                      opacity: i === activeImg ? 1 : 0.6,
                      boxShadow: i === activeImg ? '0 4px 12px rgba(200, 134, 10, 0.25)' : 'none',
                      transition: 'all 0.3s ease',
                      flexShrink: 0
                    }}
                  >
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
              {displayImages.length > 4 && (
                <button
                  type="button"
                  onClick={() => scrollThumbnails('down')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--gold)',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
              )}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 2 }} className="text-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current text-gold" />
              ))}
            </div>
            <span style={{ fontSize: '0.82rem', color: '#888', fontWeight: 400 }}>(Verified buyers)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 24 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark)' }}>₹{Math.round(product.price)}</span>
            {product.compare_price && <del style={{ fontSize: '1.2rem', color: '#aaa' }}>₹{Math.round(product.compare_price)}</del>}
            {product.price < product.compare_price && (
              <span style={{ background: '#e8f5e9', color: '#2e7d32', borderRadius: 6, padding: '3px 10px', fontSize: '0.8rem', fontWeight: 700 }}>
                ON SALE
              </span>
            )}
          </div>

          {product.description && (
            <p style={{ color: '#555', lineHeight: 1.8, fontSize: '0.92rem', marginBottom: 24 }}>{product.description}</p>
          )}

          {/* Trust badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff8ec', border: '1px solid var(--gold-pale)', borderRadius: 20, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--dark)' }}>
              <Award className="w-4 h-4 text-gold" /> 100% Authentic
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff8ec', border: '1px solid var(--gold-pale)', borderRadius: 20, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--dark)' }}>
              <Waves className="w-4 h-4 text-gold" /> Floats on Water
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff8ec', border: '1px solid var(--gold-pale)', borderRadius: 20, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--dark)' }}>
              <PenTool className="w-4 h-4 text-gold" /> Free Engraving
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff8ec', border: '1px solid var(--gold-pale)', borderRadius: 20, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--dark)' }}>
              <Truck className="w-4 h-4 text-gold" /> Free Shipping
            </span>
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
              <button onClick={handleAddToCart} className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          )}

          <Link to="/cart" style={{ display: 'block', textAlign: 'center', padding: '12px', background: 'var(--dark)', color: 'var(--gold)', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', marginBottom: 20 }}>
            View Cart →
          </Link>

          <div style={{ borderTop: '1px solid #eee', paddingTop: 20, fontSize: '0.82rem', color: '#777', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar className="w-4 h-4 text-gold" /> Usually ships in 1–2 business days</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><RotateCcw className="w-4 h-4 text-gold" /> 7-day hassle-free returns</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CreditCard className="w-4 h-4 text-gold" /> COD available across India</div>
          </div>
        </div>
      </div>
    </>
  )
}
