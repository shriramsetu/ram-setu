import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { getFeaturedProducts, primaryImage } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import ScrollReveal from '../components/ScrollReveal'

export default function Home() {
  const [products, setProducts] = useState([])
  const { addToCart } = useCart()
  const [testiIndex, setTestiIndex] = useState(0)
  const testiTrackRef = useRef(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [proofPlaying, setProofPlaying] = useState(false)
  const proofVideoRef = useRef(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    getFeaturedProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [])

  // Testimonial auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setTestiIndex(i => (i + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (testiTrackRef.current) {
      testiTrackRef.current.style.transform = `translateX(-${testiIndex * 100}%)`
    }
  }, [testiIndex])

  function scrollTesti(dir) {
    setTestiIndex(i => (i + dir + 3) % 3)
  }

  function toggleFaq(idx) {
    setOpenFaq(o => o === idx ? null : idx)
  }

  function playProofVideo() {
    if (proofVideoRef.current) {
      proofVideoRef.current.controls = true
      proofVideoRef.current.play()
      setProofPlaying(true)
    }
  }

  function handleSubscribe(e) {
    e.preventDefault()
    if (!email) return
    toast.success('Subscribed! Thank you 🙏')
    setEmail('')
  }

  const faqs = [
    { q: 'Do these stones really float on water?', a: 'Yes! Ram Setu stones float naturally on water due to their unique pumice-like composition. This is a naturally occurring property that has amazed devotees and scientists alike. We verify every stone before shipping.' },
    { q: 'Where are these stones collected from?', a: "All our stones are carefully and devotionally collected from the Ram Setu (Adam's Bridge) region near Rameswaram, Tamil Nadu — the sacred site mentioned in the Valmiki Ramayana." },
    { q: 'How long does delivery take?', a: 'We deliver across India typically within 3–7 working days. Express delivery options are available. All orders come with tracking. COD is available on all orders above ₹299.' },
    { q: 'Can I get a custom engraving?', a: 'Absolutely! We offer custom engraving of "राम", "ॐ", "जय श्री राम" or any sacred text of your choice. Currently we are offering FREE engraving on all orders during this limited offer period.' },
    { q: 'What is your return policy?', a: "We offer hassle-free returns within 7 days of delivery. If your stone doesn't float, we will replace it at no charge. We stand by the authenticity and quality of every product we ship." },
    { q: 'Is COD (Cash on Delivery) available?', a: 'Yes! Cash on Delivery is available across India. You can also place your order directly on WhatsApp and pay on delivery.' },
  ]

  return (
    <>
      <Helmet>
        <title>RamSetu Divine Stones – A Sacred Symbol of Faith</title>
        <meta name="description" content="Authentic Ram Setu stones – sacred floating stones from the legendary Ram Setu bridge. Order via WhatsApp with free engraving and pan-India delivery." />
      </Helmet>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-badge">🙏 Sacred &amp; Authentic</div>
        <div className="hero-content">
          <h1>A Sacred<br />Symbol of Faith<br />from <span>Ram Setu</span></h1>
          <div className="hero-btns">
            <a href="#shop" className="btn-primary">Shop Now</a>
          </div>
        </div>
        <div className="hero-dots">
          <span className="active" />
          <span />
          <span />
        </div>
      </section>

      {/* Products Section */}
      <ScrollReveal className="products-section" id="shop" style={{ display: 'block' }}>
        <div className="section-header">
          <span className="ornament">⟐ ⟐ ⟐</span>
          <h2>Our Popular Products</h2>
          <p>Handpicked sacred stones from Ram Setu, each carrying centuries of faith</p>
          <div className="gold-line" />
        </div>
        <div className="products-grid">
          {products.length === 0 ? (
            <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#999', padding: '40px 0' }}>
              Loading sacred collection…
            </p>
          ) : (
            products.map(product => (
              <div className="product-card" key={product.id}>
                <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div className="product-img">
                    <img src={primaryImage(product)} alt={product.name} loading="lazy" />
                    {product.is_featured && <div className="product-badge">Featured</div>}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <div className="stars">★★★★★</div>
                    <div className="product-price">
                      ₹{Math.round(product.price)}
                      {product.compare_price && <del>₹{Math.round(product.compare_price)}</del>}
                    </div>
                  </div>
                </Link>
                <div className="product-info" style={{ paddingTop: 0 }}>
                  <button
                    className="btn-cart"
                    onClick={() => { addToCart({ id: product.id, name: product.name, price: product.price, image: primaryImage(product), slug: product.slug }); toast.success('Added to cart!') }}
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="view-all-wrap">
          <Link to="/shop" className="btn-view-all">VIEW ALL PRODUCTS</Link>
        </div>
      </ScrollReveal>

      {/* Proof + Testimonials */}
      <ScrollReveal className="proof-section" id="proof" style={{ display: 'grid' }}>
        <div>
          <div className="section-header" style={{ textAlign: 'left', marginBottom: 24 }}>
            <span className="ornament" style={{ textAlign: 'left', display: 'block' }}>⟐ ⟐</span>
            <h2>See the Proof</h2>
            <p>Watch how Ram Setu stones float on water naturally</p>
            <div className="gold-line" style={{ marginLeft: 0 }} />
          </div>
          <div className="proof-video-wrap">
            <video
              ref={proofVideoRef}
              src="/images/gallery/gallery-video-1.mp4"
              playsInline
              preload="metadata"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {!proofPlaying && (
              <div className="play-btn" id="proofPlayBtn" onClick={playProofVideo}>
                <span>▶</span>
              </div>
            )}
          </div>
          <Link to="/gallery" style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.9rem', display: 'block', marginTop: 16, textDecoration: 'none' }}>
            View More Videos →
          </Link>
        </div>

        <div id="testimonials">
          <div className="section-header" style={{ textAlign: 'left', marginBottom: 24 }}>
            <span className="ornament" style={{ textAlign: 'left', display: 'block' }}>⟐ ⟐</span>
            <h2>What Devotees Say</h2>
            <p>Stories of faith and divine connection from across India</p>
            <div className="gold-line" style={{ marginLeft: 0 }} />
          </div>
          <div className="testimonials-container">
            <div className="testimonials-track" ref={testiTrackRef}>
              <div className="testimonial-card">
                <blockquote>"I felt a divine connection when I received this sacred stone. Truly blessed! The stone floats exactly as promised. This is a genuine piece of faith."</blockquote>
                <div className="testimonial-author">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" alt="Ramesh Sharma" />
                  <div>
                    <strong>Ramesh Sharma</strong>
                    <small>Ayodhya &nbsp; ★★★★★</small>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <blockquote>"The stone floats perfectly on water. A symbol of faith and miracles. I gifted it to my mother and she was overjoyed. Beautifully packaged."</blockquote>
                <div className="testimonial-author">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" alt="Pooja Iyer" />
                  <div>
                    <strong>Pooja Iyer</strong>
                    <small>Chennai &nbsp; ★★★★★</small>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <blockquote>"Beautiful packaging and genuine product. Thank you RamSetu Divine Stones! I've placed my order three times already. Each stone is unique and powerful."</blockquote>
                <div className="testimonial-author">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" alt="Amit Verma" />
                  <div>
                    <strong>Amit Verma</strong>
                    <small>Lucknow &nbsp; ★★★★★</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="testi-nav">
            <button onClick={() => scrollTesti(-1)}>←</button>
            <button onClick={() => scrollTesti(1)}>→</button>
          </div>
        </div>
      </ScrollReveal>

      {/* Story of Ram Setu */}
      <ScrollReveal className="story-section" id="about" style={{ display: 'grid' }}>
        <div className="story-img">
          <img src="/images/ram-setu-story.webp" alt="Ram Setu Story" />
        </div>
        <div className="story-content">
          <div className="label">Ancient Legend</div>
          <h2>The Story of Ram Setu</h2>
          <p>According to the Ramayana, Lord Ram and his army built the mighty bridge across the sea to Lanka. These stones are believed to be a part of that divine legacy, a reminder of faith, devotion and the power of belief. Carrying one brings the blessings of Lord Ram into your home.</p>
          <p>Scientists have noted the unique pumice-like composition of these stones which allows them to float on water — a phenomenon that devotees across the world regard as a divine miracle and a physical proof of the ancient epic.</p>
          <Link to="/about" className="btn-primary" style={{ alignSelf: 'flex-start' }}>KNOW MORE</Link>
        </div>
      </ScrollReveal>

      {/* Divine Gallery */}
      <ScrollReveal className="gallery-section" id="gallery" style={{ display: 'block' }}>
        <div className="section-header">
          <span className="ornament" style={{ color: 'var(--gold-pale)' }}>⟐ ⟐ ⟐</span>
          <h2>Divine Gallery</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Sacred Ram Setu stones — each one a piece of divine history</p>
          <div className="gold-line" />
        </div>
        <div className="gallery-grid">
          <div className="gallery-item gallery-hero">
            <img src="/images/gallery/gallery-1.jpeg" alt="Ram Setu Stone" />
            <div className="gallery-caption">
              <span>Authentic Ram Setu Stones</span>
              <small>Directly collected from the sacred shores</small>
            </div>
          </div>
          <div className="gallery-item gallery-tall">
            <img src="/images/gallery/gallery-2.jpeg" alt="Sacred Floating Stone" />
            <div className="gallery-caption">
              <span>Sacred Floating Stones</span>
              <small>Each stone floats naturally on water</small>
            </div>
          </div>
          <div className="gallery-item">
            <img src="/images/gallery/gallery-3.jpeg" alt="Stone Collection" />
            <div className="gallery-caption">
              <span>Stone Collection</span>
              <small>Hand-picked with devotion and care</small>
            </div>
          </div>
          <div className="gallery-item gallery-wide">
            <img src="/images/gallery/gallery-4.jpeg" alt="Divine Stone" />
            <div className="gallery-caption">
              <span>Divine Stone — Proof of Legend</span>
              <small>The miracle that amazed the world</small>
            </div>
          </div>
          <div className="gallery-item">
            <img src="/images/gallery/gallery-5.jpeg" alt="Ram Setu Heritage" />
            <div className="gallery-caption">
              <span>Ram Setu Heritage</span>
              <small>Centuries of faith in every stone</small>
            </div>
          </div>
          <div className="gallery-item">
            <img src="/images/gallery/gallery-6.jpeg" alt="Divine Stone Set" />
            <div className="gallery-caption">
              <span>Divine Stone Set</span>
              <small>Three sacred stones — one legacy</small>
            </div>
          </div>
          <div className="gallery-item gallery-wide">
            <img src="/images/gallery/gallery-7.jpeg" alt="Sacred Collector's Edition" />
            <div className="gallery-caption">
              <span>Sacred Collector's Edition</span>
              <small>Limited — for the devoted soul</small>
            </div>
          </div>
        </div>
        <div className="view-all-wrap" style={{ marginTop: 32 }}>
          <Link to="/gallery" className="btn-view-all">VIEW FULL GALLERY</Link>
        </div>
      </ScrollReveal>

      {/* Features Section */}
      <ScrollReveal className="features-section" style={{ display: 'block' }}>
        <div className="section-header">
          <span className="ornament">⟐ ⟐ ⟐</span>
          <h2>Why Choose RamSetu Stones?</h2>
          <p>Every stone is sacred, every delivery is divine</p>
          <div className="gold-line" />
        </div>
        <div className="features-grid">
          {[
            { icon: '🏛️', title: '100% Authentic' },
            { icon: '💧', title: 'Floats on Water' },
            { icon: '✍️', title: 'Custom Engraving' },
            { icon: '🎁', title: 'Premium Gifting' },
            { icon: '🚚', title: 'Pan India Delivery' },
            { icon: '🙏', title: 'Blessed with Prayers' },
          ].map(f => (
            <div className="feature-card" key={f.title}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Social Section */}
      <ScrollReveal className="social-section" style={{ display: 'block' }}>
        <div className="section-header">
          <span className="ornament">⟐ ⟐ ⟐</span>
          <h2>Our Divine Community</h2>
          <p>Join 50,000+ devotees on social media sharing their spiritual journey</p>
          <div className="gold-line" />
        </div>
        <div className="social-grid">
          <div className="social-item"><img src="/images/gallery/gallery-1.jpeg" alt="Ram Setu Stone" /></div>
          <div className="social-item"><img src="/images/gallery/gallery-2.jpeg" alt="Floating Stone" /></div>
          <div className="social-item social-video-item">
            <video src="/images/gallery/gallery-video-2.mp4" autoPlay muted loop playsInline />
          </div>
          <div className="social-item"><img src="/images/gallery/gallery-4.jpeg" alt="Sacred Stone" /></div>
          <div className="social-item social-video-item">
            <video src="/images/gallery/gallery-video-3.mp4" autoPlay muted loop playsInline />
          </div>
          <div className="social-item"><img src="/images/gallery/gallery-6.jpeg" alt="Stone Collection" /></div>
          <div className="social-item social-video-item">
            <video src="/images/gallery/gallery-video-4.mp4" autoPlay muted loop playsInline />
          </div>
          <div className="social-item"><img src="/images/gallery/gallery-7.jpeg" alt="Divine Stone" /></div>
        </div>
        <div className="social-cta">
          <p style={{ color: '#888', fontSize: '0.95rem' }}>Follow us and share your divine experience</p>
          <div className="social-links">
            <a href="#" className="social-btn insta">📷 Instagram</a>
            <a href="#" className="social-btn yt">▶ YouTube</a>
            <a href="#" className="social-btn fb">f Facebook</a>
            <a href="https://wa.me/919876543210" className="social-btn wa">💬 WhatsApp</a>
          </div>
        </div>
      </ScrollReveal>

      {/* Offer Banner */}
      <ScrollReveal className="offer-banner" style={{ display: 'flex' }}>
        <div className="offer-text">
          <span className="offer-icon">🎁</span>
          <h3>Limited Time Offer!</h3>
          <p>Free Engraving + Free Shipping on all orders</p>
        </div>
        <a href="https://wa.me/919876543210?text=I want to place an order!" className="btn-order" target="_blank" rel="noopener noreferrer">ORDER NOW →</a>
      </ScrollReveal>

      {/* Trust Bar */}
      <div className="trust-bar">
        {[
          { icon: '🏛️', title: 'Authentic Source', sub: 'Carefully collected with devotion' },
          { icon: '💧', title: 'Tested & Verified', sub: 'Floats naturally on water' },
          { icon: '📦', title: 'Secure Packaging', sub: 'Packed with care & protection' },
          { icon: '🚚', title: 'Fast & Safe Delivery', sub: 'Pan India Delivery' },
          { icon: '🛡️', title: 'Trusted by 1000+', sub: 'Faith & trust we value' },
        ].map(t => (
          <div className="trust-item" key={t.title}>
            <div className="trust-icon">{t.icon}</div>
            <div>
              <h4>{t.title}</h4>
              <p>{t.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <ScrollReveal className="faq-section" id="faq" style={{ display: 'block' }}>
        <div className="section-header">
          <span className="ornament">⟐ ⟐ ⟐</span>
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about Ram Setu stones</p>
          <div className="gold-line" />
        </div>
        <div className="faq-grid">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`faq-item${openFaq === i ? ' open' : ''}`}
              onClick={() => toggleFaq(i)}
            >
              <h4>{faq.q} <span>+</span></h4>
              <div className="faq-answer">{faq.a}</div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Newsletter */}
      <ScrollReveal className="newsletter-section" style={{ display: 'flex' }}>
        <div className="newsletter-text">
          <h3>Stay Connected with Divine Updates</h3>
          <p>Get special offers, spiritual stories &amp; new product updates</p>
        </div>
        <form className="newsletter-form" onSubmit={handleSubscribe}>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button type="submit" className="btn-subscribe">SUBSCRIBE</button>
        </form>
        <div className="newsletter-wa">
          <span>💬</span>
          Join us on WhatsApp for exclusive offers &amp; updates
        </div>
      </ScrollReveal>
    </>
  )
}
