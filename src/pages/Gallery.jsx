import { useState, useRef, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import ScrollReveal from '../components/ScrollReveal'
import { Play, X, ChevronLeft, ChevronRight, Instagram, Youtube, Facebook, MessageSquare, ExternalLink, Video } from 'lucide-react'
import { supabase } from '../lib/supabase'

const defaultImages = [
  {
    key: 'gallery_img_1',
    src: '',
    alt: 'Sacred Ram Setu Stones',
    caption: 'Sacred Ram Setu Stones',
    sub: 'Floating stones displayed with devotion and prayer'
  },
  {
    key: 'gallery_img_2',
    src: '',
    alt: 'Divine Floating Stones',
    caption: 'Divine Floating Stones',
    sub: 'Witness the sacred stones floating gracefully on water'
  },
  {
    key: 'gallery_img_3',
    src: '',
    alt: 'Authentic Stone Collection',
    caption: 'Authentic Stone Collection',
    sub: 'A blessed collection of revered Ram Setu stones'
  },
  {
    key: 'gallery_img_4',
    src: '',
    alt: 'Blessings of Hanuman',
    caption: 'Blessings of Hanuman',
    sub: 'A symbol of faith, strength, and devotion to Lord Ram'
  }
]

const defaultVideos = [
  { key: 'proof_video_1', src: '', label: 'Stone Floating on Water', desc: 'Watch the miracle live — authentic Ram Setu stone floats effortlessly' },
  { key: 'proof_video_2', src: '', label: 'Sacred Rituals & Blessings', desc: 'Daily abhishek and consecration at the holy shores of Rameswaram' },
  { key: 'proof_video_3', src: '', label: 'Devotee Testimonials', desc: 'Real stories of faith and divine connection from across India' },
  { key: 'proof_video_4', src: '', label: 'Collection Showcase', desc: 'Our complete range of authenticated Ram Setu sacred stones' },
]

function VideoCard({ src, label, desc, index }) {
  const [playing, setPlaying] = useState(false)
  const ref = useRef(null)

  function togglePlay() {
    if (ref.current) {
      if (playing) {
        ref.current.pause()
        setPlaying(false)
      } else {
        ref.current.play()
        setPlaying(true)
      }
    }
  }

  return (
    <div
      onClick={togglePlay}
      className="group relative rounded-[2rem] overflow-hidden border-2 border-gold/20 bg-white shadow-xl hover:shadow-[0_25px_60px_-10px_rgba(212,165,55,0.2)] hover:-translate-y-2 hover:border-gold/50 transition-all duration-500 aspect-[9/16] cursor-pointer"
    >
      {/* Shine sweep */}
      <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out z-20 pointer-events-none" />

      <video
        ref={ref}
        src={src}
        playsInline
        loop
        preload="metadata"
        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
      />

      {!playing && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-dark/70 via-dark/20 to-transparent backdrop-blur-[1px] group-hover:backdrop-blur-0 transition-all duration-300"
        >
          <div className="relative mb-3">
            <div className="absolute inset-0 rounded-full bg-gold/40 animate-ping scale-125" />
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-2xl shadow-gold/40 hover:scale-110 transition-transform duration-300 pl-1.5">
              <Play className="w-6 h-6 md:w-7 md:h-7 text-dark fill-current" />
            </div>
          </div>
          <span className="text-white/90 text-xs font-semibold tracking-widest uppercase font-sans">Tap to Watch</span>
        </div>
      )}

      {/* Bottom label */}
      {!playing && (label || desc) && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-dark/90 via-dark/60 to-transparent px-5 py-5 pt-12">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase text-gold/80 mb-1">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                Video {String(index + 1).padStart(2, '0')}
              </span>
              {label && <p className="text-white font-black text-sm md:text-base leading-snug font-sans">{label}</p>}
              {desc && <p className="text-white/50 text-[10px] mt-1 font-sans leading-snug hidden sm:block">{desc}</p>}
            </div>
            <div className="shrink-0 w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-dark transition-all duration-300">
              <Video className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)

  function prev() { setIdx(i => (i - 1 + images.length) % images.length) }
  function next() { setIdx(i => (i + 1) % images.length) }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-dark/95 backdrop-blur-xl" onClick={onClose}>
      <button
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-gold hover:text-dark hover:border-gold transition-all duration-300 z-10 cursor-pointer"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>

      <button
        className="absolute left-3 md:left-8 w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-gold hover:text-dark hover:border-gold transition-all duration-300 z-10 cursor-pointer"
        onClick={e => { e.stopPropagation(); prev() }}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="relative max-w-4xl w-full px-16 md:px-24" onClick={e => e.stopPropagation()}>
        <img
          src={images[idx].src}
          alt={images[idx].alt}
          className="w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl border border-gold/20"
        />
        <div className="mt-5 text-center">
          <p className="text-white font-black text-lg font-sans">{images[idx].caption}</p>
          <p className="text-gold/70 text-xs font-sans mt-1 uppercase tracking-widest">{images[idx].sub}</p>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${i === idx ? 'bg-gold w-6 h-2' : 'bg-white/30 hover:bg-gold/50 w-2 h-2'}`}
            />
          ))}
        </div>
      </div>

      <button
        className="absolute right-3 md:right-8 w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-gold hover:text-dark hover:border-gold transition-all duration-300 z-10 cursor-pointer"
        onClick={e => { e.stopPropagation(); next() }}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  )
}

export default function Gallery() {
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])
  const [settings, setSettings] = useState({
    social_instagram: '',
    social_youtube: '',
    social_facebook: '',
    whatsapp_number: '919876543210'
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase.from('site_settings').select('*')
        const loaded = {}
        if (!error && data && data.length > 0) {
          data.forEach(item => {
            loaded[item.key] = item.value
          })
        }
        const local = localStorage.getItem('admin_settings')
        const localParsed = local ? JSON.parse(local) : {}
        setSettings(prev => ({ ...prev, ...localParsed, ...loaded }))

        // Fetch Site Media
        const { data: mediaData } = await supabase.from('site_media').select('*').order('updated_at', { ascending: true })
        if (mediaData && mediaData.length > 0) {
          const dbImages = mediaData.filter(m => m.media_type === 'image' && m.media_key !== 'site_logo' && m.media_key !== 'story_img' && m.url)
          setImages(dbImages.map(img => ({
            src: img.url,
            alt: img.title || 'Sacred Ram Setu Stone',
            caption: img.title || '',
            sub: img.description || ''
          })))

          const dbVideos = mediaData.filter(m => m.media_type === 'video' && m.media_key !== 'hero_video' && m.url)
          setVideos(dbVideos.map(vid => ({
            src: vid.url,
            label: vid.title || '',
            desc: vid.description || ''
          })))
        }
      } catch {
        const local = localStorage.getItem('admin_settings')
        if (local) setSettings(JSON.parse(local))
      }
    }
    loadSettings()
  }, [])

  return (
    <>
      <Helmet>
        <title>Divine Gallery – RamSetu Divine Stones</title>
        <meta name="description" content="Explore our divine gallery of sacred Ram Setu stones — authentic floating stones, videos, and devotee experiences from across India." />
      </Helmet>

      {lightboxIdx !== null && (
        <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}



      {/* ── PHOTO GALLERY ── */}
      <section className="relative bg-cream2 pt-8 pb-4 md:py-24 overflow-hidden border-b border-gold/10">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #B8893A 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">

          <ScrollReveal className="text-center mb-8 md:mb-16">
            <span className="text-gold text-xs font-black tracking-[0.25em] uppercase block mb-3 font-sans">✦ Photo Exhibition</span>
            <h2 className="font-sans text-3xl md:text-5xl font-extrabold text-dark tracking-tight">
              Sacred  <span className="bg-gradient-to-r from-gold to-[#B8893A] bg-clip-text text-transparent">Miracle Gallery</span>
            </h2>
            <p className="mt-3 text-gray-500 font-sans text-sm max-w-md mx-auto leading-relaxed">
              Each floating stone is hand-picked and carries centuries of faith and Lord Ram's divine energy
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto mt-5 rounded-full" />
          </ScrollReveal>

          {/* Uniform Grid */}
          <ScrollReveal>
            {images.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="group relative aspect-[9/16] sm:aspect-[2/3] overflow-hidden rounded-2xl md:rounded-[2rem] cursor-pointer border-2 border-gold/15 hover:border-gold hover:shadow-[0_20px_60px_-10px_rgba(212,165,55,0.25)] transition-all duration-500 bg-[#FAF6EE]"
                    onClick={() => setLightboxIdx(i)}
                  >
                    {/* Corner ornaments */}
                    <div className="absolute top-3 left-3 md:top-4 md:left-4 w-4 h-4 md:w-5 md:h-5 border-t-2 border-l-2 border-gold/0 group-hover:border-gold/50 transition-all duration-500 rounded-tl-md md:rounded-tl-lg pointer-events-none z-20" />
                    <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 w-4 h-4 md:w-5 md:h-5 border-b-2 border-r-2 border-gold/0 group-hover:border-gold/50 transition-all duration-500 rounded-br-md md:rounded-br-lg pointer-events-none z-20" />

                    {/* Shine sweep */}
                    <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out z-20 pointer-events-none" />

                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Dark gradient overlay with text */}
                    {(img.caption || img.sub) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/30 to-transparent flex flex-col justify-end p-3.5 sm:p-6 z-10 text-left">
                        <div className="transform translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 transition-transform duration-500">
                          {img.caption && <span className="text-white font-black text-xs sm:text-sm md:text-base tracking-tight block font-sans group-hover:text-gold-light transition-colors duration-300">{img.caption}</span>}
                          {img.sub && <small className="text-gold-pale font-sans font-semibold text-[8px] sm:text-[10px] mt-1 sm:mt-1.5 block opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500 delay-100 uppercase tracking-wider">{img.sub}</small>}
                        </div>
                      </div>
                    )}

                    {/* Expand icon */}
                    <div className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/30 border border-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-cream2/50 border border-gold/15 rounded-3xl">
                <p className="text-slate-500 text-sm font-semibold">No gallery photos added yet in Admin Panel.</p>
              </div>
            )}
          </ScrollReveal>

          {images.length > 0 && (
            <ScrollReveal className="text-center mt-3 md:mt-10">
              <p className="text-gray-400 text-xs font-sans">Click any photo to view full size</p>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ── VIDEO GALLERY ── */}
      <section className="relative bg-gradient-to-b from-[#FAF3E0] to-cream2 pt-3 pb-20 md:py-24 overflow-hidden border-b border-gold/10">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #B8893A 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-gold/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal className="text-center mb-8 md:mb-16">
            <span className="text-gold text-xs font-black tracking-[0.25em] uppercase block mb-3 font-sans">✦ Watch the Miracle</span>
            <h2 className="font-sans text-3xl md:text-5xl font-extrabold text-dark tracking-tight">
              Floating <span className="bg-gradient-to-r from-gold to-orange-500 bg-clip-text text-transparent">Proof Videos</span>
            </h2>
            <p className="mt-3 text-gray-500 font-sans text-sm max-w-md mx-auto leading-relaxed">
              Observe consecration rituals and the natural floating miracle in breathtaking detail
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto mt-5 rounded-full" />
          </ScrollReveal>

          <ScrollReveal>
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {videos.map((v, i) => (
                  <VideoCard key={v.src || i} src={v.src} label={v.label} desc={v.desc} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/50 border border-gold/15 rounded-3xl">
                <p className="text-slate-500 text-sm font-semibold">No proof videos added yet in Admin Panel.</p>
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* ── SOCIAL / COMMUNITY CTA ── */}
      <ScrollReveal className="relative bg-cream2 pt-8 pb-20 md:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/8 rounded-full blur-[120px] pointer-events-none" />

        {/* Spinning mandala */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-gold/8 rounded-full animate-[spin_100s_linear_infinite] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-gradient-to-br from-white via-[#FFFDFB]/98 to-[#FFF9EE]/95 border-2 border-gold/20 rounded-2xl md:rounded-[3rem] p-6 sm:p-10 md:p-16 text-center relative overflow-hidden shadow-[0_30px_80px_-20px_rgba(212,165,55,0.15)]">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/30 rounded-tl-2xl pointer-events-none md:w-10 md:h-10 md:rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/30 rounded-br-2xl pointer-events-none md:w-10 md:h-10 md:rounded-br-3xl" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-[9px] sm:text-[10px] font-black tracking-widest uppercase mb-4 sm:mb-6">
              ✦ Devoted Community
            </span>

            <h2 className="font-sans text-xl sm:text-3xl md:text-5xl font-extrabold text-dark tracking-tight mb-3 sm:mb-4">
              Join Our{' '}
              <span className="bg-gradient-to-r from-gold to-orange-500 bg-clip-text text-transparent">Divine Family</span>
            </h2>

            <p className="text-gray-500 font-sans text-xs sm:text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-6 sm:mb-10 font-semibold">
              Connect with 50,000+ devotees sharing stories of faith, puja videos, and Lord Ram's blessings across our sacred community.
            </p>

            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
              <a
                href={settings.social_instagram || "https://www.instagram.com/ramsetustones/"}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 px-4 py-3 sm:px-7 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#f09433] via-[#e6683c] via-[#dc2743] to-[#bc1888] text-white font-black text-xs uppercase tracking-wider hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20 transition-all duration-300 shadow-md truncate"
              >
                <Instagram className="w-4 h-4 shrink-0" />
                <span className="truncate">Instagram</span>
              </a>
              <a
                href={settings.social_youtube || "#"}
                target={settings.social_youtube ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 px-4 py-3 sm:px-7 sm:py-3.5 rounded-2xl bg-[#FF0000] text-white font-black text-xs uppercase tracking-wider hover:scale-105 hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300 shadow-md truncate"
              >
                <Youtube className="w-4 h-4 shrink-0" />
                <span className="truncate">YouTube</span>
              </a>
              <a
                href={settings.social_facebook || "#"}
                target={settings.social_facebook ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 px-4 py-3 sm:px-7 sm:py-3.5 rounded-2xl bg-[#1877F2] text-white font-black text-xs uppercase tracking-wider hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 shadow-md truncate"
              >
                <Facebook className="w-4 h-4 shrink-0" />
                <span className="truncate">Facebook</span>
              </a>
              <a
                href={settings.whatsapp_number ? (String(settings.whatsapp_number).startsWith('http') ? String(settings.whatsapp_number) : `https://wa.me/${String(settings.whatsapp_number).replace(/[^0-9]/g, '')}`) : 'https://wa.me/919876543210'}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 px-4 py-3 sm:px-7 sm:py-3.5 rounded-2xl bg-[#25D366] text-white font-black text-xs uppercase tracking-wider hover:scale-105 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 shadow-md truncate"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate">WhatsApp</span>
              </a>
            </div>

            {/* Bottom CTA */}
            <div className="pt-6 sm:pt-10 border-t border-gold/15">
              <p className="text-gray-400 text-[10px] sm:text-xs font-sans uppercase tracking-widest mb-4 sm:mb-5 font-semibold">
                Ready to bring the divine home?
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 sm:px-10 sm:py-4 rounded-full bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-dark font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:shadow-gold/30 hover:-translate-y-0.5 transition-all duration-300 border-none justify-center"
              >
                Order Your Sacred Stone
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </>
  )
}
