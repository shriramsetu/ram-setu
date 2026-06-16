import { useState, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import ScrollReveal from '../components/ScrollReveal'

const images = [
  { src: '/images/gallery/gallery-1.jpeg', alt: 'Authentic Ram Setu Stones', caption: 'Authentic Ram Setu Stones', sub: 'Directly collected from the sacred shores' },
  { src: '/images/gallery/gallery-2.jpeg', alt: 'Sacred Floating Stone', caption: 'Sacred Floating Stones', sub: 'Each stone floats naturally on water' },
  { src: '/images/gallery/gallery-3.jpeg', alt: 'Stone Collection', caption: 'Stone Collection', sub: 'Hand-picked with devotion and care' },
  { src: '/images/gallery/gallery-4.jpeg', alt: 'Divine Stone', caption: 'Divine Stone — Proof of Legend', sub: 'The miracle that amazed the world' },
  { src: '/images/gallery/gallery-5.jpeg', alt: 'Ram Setu Heritage', caption: 'Ram Setu Heritage', sub: 'Centuries of faith in every stone' },
  { src: '/images/gallery/gallery-6.jpeg', alt: 'Divine Stone Set', caption: 'Divine Stone Set', sub: 'Three sacred stones — one legacy' },
  { src: '/images/gallery/gallery-7.jpeg', alt: "Sacred Collector's Edition", caption: "Sacred Collector's Edition", sub: 'Limited — for the devoted soul' },
]

const videos = [
  { src: '/images/gallery/gallery-video-1.mp4', label: 'Stone floating on water' },
  { src: '/images/gallery/gallery-video-2.mp4', label: 'Sacred rituals & blessings' },
  { src: '/images/gallery/gallery-video-3.mp4', label: 'Devotee testimonials' },
  { src: '/images/gallery/gallery-video-4.mp4', label: 'Collection showcase' },
]

function VideoCard({ src, label }) {
  const [playing, setPlaying] = useState(false)
  const ref = useRef(null)

  function play() {
    if (ref.current) {
      ref.current.controls = true
      ref.current.play()
      setPlaying(true)
    }
  }

  return (
    <div className="gallery-item" style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
      <video ref={ref} src={src} playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      {!playing && (
        <div className="play-btn" onClick={play} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)' }}>
          <span>▶</span>
        </div>
      )}
      <div className="gallery-caption">
        <span>{label}</span>
      </div>
    </div>
  )
}

export default function Gallery() {
  return (
    <>
      <Helmet>
        <title>Divine Gallery – RamSetu Divine Stones</title>
        <meta name="description" content="Explore our divine gallery of sacred Ram Setu stones — authentic floating stones, videos, and devotee experiences from across India." />
      </Helmet>

      {/* Page Header */}
      <div className="page-header" style={{ background: 'var(--dark)', padding: '60px 20px', textAlign: 'center', borderBottom: '2px solid var(--gold)' }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 8 }}>Divine Gallery</h1>
        <div className="breadcrumb" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Home / Gallery</div>
      </div>

      {/* Photo Gallery */}
      <ScrollReveal className="gallery-section" style={{ display: 'block' }}>
        <div className="section-header">
          <span className="ornament" style={{ color: 'var(--gold-pale)' }}>⟐ ⟐ ⟐</span>
          <h2>Sacred Stone Gallery</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Each stone carries centuries of faith and divine energy</p>
          <div className="gold-line" />
        </div>
        <div className="gallery-grid">
          <div className="gallery-item gallery-hero">
            <img src={images[0].src} alt={images[0].alt} />
            <div className="gallery-caption">
              <span>{images[0].caption}</span>
              <small>{images[0].sub}</small>
            </div>
          </div>
          <div className="gallery-item gallery-tall">
            <img src={images[1].src} alt={images[1].alt} />
            <div className="gallery-caption">
              <span>{images[1].caption}</span>
              <small>{images[1].sub}</small>
            </div>
          </div>
          <div className="gallery-item">
            <img src={images[2].src} alt={images[2].alt} />
            <div className="gallery-caption">
              <span>{images[2].caption}</span>
              <small>{images[2].sub}</small>
            </div>
          </div>
          <div className="gallery-item gallery-wide">
            <img src={images[3].src} alt={images[3].alt} />
            <div className="gallery-caption">
              <span>{images[3].caption}</span>
              <small>{images[3].sub}</small>
            </div>
          </div>
          <div className="gallery-item">
            <img src={images[4].src} alt={images[4].alt} />
            <div className="gallery-caption">
              <span>{images[4].caption}</span>
              <small>{images[4].sub}</small>
            </div>
          </div>
          <div className="gallery-item">
            <img src={images[5].src} alt={images[5].alt} />
            <div className="gallery-caption">
              <span>{images[5].caption}</span>
              <small>{images[5].sub}</small>
            </div>
          </div>
          <div className="gallery-item gallery-wide">
            <img src={images[6].src} alt={images[6].alt} />
            <div className="gallery-caption">
              <span>{images[6].caption}</span>
              <small>{images[6].sub}</small>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Video Gallery */}
      <ScrollReveal className="gallery-section" style={{ display: 'block', paddingTop: 0 }}>
        <div className="section-header">
          <span className="ornament" style={{ color: 'var(--gold-pale)' }}>⟐ ⟐ ⟐</span>
          <h2>Videos — See the Miracle</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Watch Ram Setu stones float on water — the divine miracle</p>
          <div className="gold-line" />
        </div>
        <div className="gallery-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gridAutoRows: '280px' }}>
          {videos.map(v => (
            <VideoCard key={v.src} src={v.src} label={v.label} />
          ))}
        </div>
      </ScrollReveal>

      {/* Social Section */}
      <ScrollReveal className="social-section" style={{ display: 'block' }}>
        <div className="section-header">
          <span className="ornament">⟐ ⟐ ⟐</span>
          <h2>Our Divine Community</h2>
          <p>Join 50,000+ devotees sharing their spiritual journey</p>
          <div className="gold-line" />
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
    </>
  )
}
