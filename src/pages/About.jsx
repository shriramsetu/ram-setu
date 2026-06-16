import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import ScrollReveal from '../components/ScrollReveal'

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Ram Setu – RamSetu Divine Stones</title>
        <meta name="description" content="Learn the sacred story of Ram Setu — the legendary bridge built by Lord Ram, and the divine floating stones we carefully collect from Rameswaram." />
      </Helmet>

      {/* Page Header */}
      <div className="page-header" style={{ background: 'var(--dark)', padding: '60px 20px', textAlign: 'center', borderBottom: '2px solid var(--gold)' }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 8 }}>About Ram Setu</h1>
        <div className="breadcrumb" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Home / About</div>
      </div>

      {/* Story Section */}
      <ScrollReveal className="story-section" style={{ display: 'grid' }}>
        <div className="story-img">
          <img src="/images/ram-setu-story.webp" alt="Ram Setu Story" />
        </div>
        <div className="story-content">
          <div className="label">Ancient Legend</div>
          <h2>The Story of Ram Setu</h2>
          <p>According to the Ramayana, Lord Ram and his army built the mighty bridge across the sea to Lanka. These stones are believed to be a part of that divine legacy — a reminder of faith, devotion and the power of belief. Carrying one brings the blessings of Lord Ram into your home.</p>
          <p>Scientists have noted the unique pumice-like composition of these stones which allows them to float on water — a phenomenon that devotees across the world regard as a divine miracle and a physical proof of the ancient epic.</p>
          <p>All our stones are devotionally collected from the Ram Setu (Adam's Bridge) region near Rameswaram, Tamil Nadu — the sacred site mentioned in the Valmiki Ramayana. Each stone is verified, blessed, and packaged with care before it reaches you.</p>
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
            { icon: '🏛️', title: '100% Authentic', desc: 'Carefully collected from the sacred shores of Ram Setu near Rameswaram' },
            { icon: '💧', title: 'Floats on Water', desc: 'Each stone is tested and verified to float — a natural divine miracle' },
            { icon: '✍️', title: 'Custom Engraving', desc: 'Free engraving of "राम", "ॐ" or any sacred text of your choice' },
            { icon: '🎁', title: 'Premium Gifting', desc: 'Beautifully packaged — perfect for gifting to devotees and loved ones' },
            { icon: '🚚', title: 'Pan India Delivery', desc: 'Fast and secure delivery to every corner of India within 3–7 days' },
            { icon: '🙏', title: 'Blessed with Prayers', desc: 'Every stone is blessed with Vedic prayers before being dispatched' },
          ].map(f => (
            <div className="feature-card" key={f.title}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p style={{ color: '#666', fontSize: '0.82rem', marginTop: 8, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
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

      {/* CTA */}
      <ScrollReveal className="offer-banner" style={{ display: 'flex' }}>
        <div className="offer-text">
          <span className="offer-icon">🪨</span>
          <h3>Own a Piece of Divine History</h3>
          <p>Sacred Ram Setu stones with free engraving &amp; pan-India delivery</p>
        </div>
        <Link to="/shop" className="btn-order">SHOP NOW →</Link>
      </ScrollReveal>
    </>
  )
}
