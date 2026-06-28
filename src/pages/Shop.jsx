import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { getProducts, primaryImage, getProductReviews, supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import {
  Award,
  Waves,
  Sparkles,
  Navigation,
  ShieldCheck,
  RefreshCw,
  ShoppingCart,
  Star,
  ChevronDown,
  ChevronUp,
  Compass,
  Flame,
  ArrowRight,
  Truck
} from 'lucide-react'

export default function Shop() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [metrics, setMetrics] = useState({
    average: 5.0,
    total: 0,
    breakdown: [
      { stars: 5, pct: 0, count: 0 },
      { stars: 4, pct: 0, count: 0 },
      { stars: 3, pct: 0, count: 0 },
      { stars: 2, pct: 0, count: 0 },
      { stars: 1, pct: 0, count: 0 }
    ]
  })
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('legend')
  const [openFaq, setOpenFaq] = useState(null)
  const { addToCart } = useCart()
  const thumbRef = useRef(null)

  const [videoIndex, setVideoIndex] = useState(0)
  const videoRefs = useRef([])
  const [playingVideoIdx, setPlayingVideoIdx] = useState(null)
  const [proofVideos, setProofVideos] = useState([
    { key: 'proof_video_1', src: '', title: 'Stone Floating on Water', desc: 'Watch the miracle live' },
    { key: 'proof_video_2', src: '', title: 'Daily Consecration Rituals', desc: 'Abhishek at Rameswaram' },
    { key: 'proof_video_3', src: '', title: 'Devotee Unboxing & Test', desc: 'Real floating proof at home' },
    { key: 'proof_video_4', src: '', title: 'Collection Showcase', desc: 'Authenticated sacred stones' }
  ])

  const handleVideoChange = (newIdx) => {
    if (playingVideoIdx !== null && videoRefs.current[playingVideoIdx]) {
      videoRefs.current[playingVideoIdx].pause()
    }
    setPlayingVideoIdx(null)
    setVideoIndex(newIdx)
  }

  const [settings, setSettings] = useState({
    shipping_threshold: 499,
    shipping_flat_rate: 79,
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase.from('site_settings').select('*')
        const loaded = {}
        if (!error && data && data.length > 0) {
          data.forEach(item => {
            let val = item.value
            if (!isNaN(val) && typeof val === 'string' && val.trim() !== '') val = parseFloat(val)
            if (item.key === 'free_shipping_threshold') loaded['shipping_threshold'] = parseFloat(val) || 0
            else if (item.key === 'shipping_charge') loaded['shipping_flat_rate'] = parseFloat(val) || 0
          })
        }
        const local = localStorage.getItem('admin_settings')
        const localParsed = local ? JSON.parse(local) : {}
        setSettings(prev => ({ ...prev, ...localParsed, ...loaded }))

        // Fetch Site Media strictly from DB
        const { data: mediaData } = await supabase.from('site_media').select('*')
        if (mediaData && mediaData.length > 0) {
          const mMap = {}
          mediaData.forEach(m => { mMap[m.media_key] = m.url })
          setProofVideos(prev => prev.map(v => ({
            ...v,
            src: mMap[v.key] || ''
          })))
        }
      } catch {
        const local = localStorage.getItem('admin_settings')
        if (local) setSettings(JSON.parse(local))
      }
    }
    loadSettings()
  }, [])

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchEndX = useRef(0)
  const touchEndY = useRef(0)

  const handleTouchStart = (e) => {
    if (!e.touches || !e.touches[0]) return
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchEndX.current = e.touches[0].clientX
    touchEndY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e) => {
    if (!e.touches || !e.touches[0]) return
    touchEndX.current = e.touches[0].clientX
    touchEndY.current = e.touches[0].clientY
  }

  const handleSwipe = (numImages) => {
    if (!numImages) return
    const diffX = touchStartX.current - touchEndX.current
    const diffY = touchStartY.current - touchEndY.current
    const threshold = 40 // lower threshold for easier swiping

    // Only swipe if movement is primarily horizontal and exceeds the threshold
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        setActiveImg((prev) => (prev + 1) % numImages)
      } else {
        setActiveImg((prev) => (prev - 1 + numImages) % numImages)
      }
    }
  }

  const scrollThumbnails = (direction) => {
    if (thumbRef.current) {
      const isMobile = window.innerWidth < 640
      const scrollAmount = 100
      if (isMobile) {
        thumbRef.current.scrollBy({
          left: direction === 'up' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        })
      } else {
        thumbRef.current.scrollBy({
          top: direction === 'up' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        })
      }
    }
  }

  useEffect(() => {
    setLoading(true)
    getProducts({ pageSize: 1 })
      .then(({ items }) => {
        if (items && items.length > 0) {
          setProduct(items[0])
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!product) return

    const loadReviews = async () => {
      let dbReviews = []
      try {
        dbReviews = await getProductReviews(product.id)
      } catch (err) {
        console.warn('Failed to fetch reviews from database.', err)
      }

      // Combine: db reviews
      const combined = dbReviews.map(r => ({
        id: r.id,
        user_id: r.user_id,
        name: r.name || 'Anonymous',
        location: r.location || 'India',
        date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently',
        rating: Number(r.rating) || 5,
        title: r.title || '',
        comment: r.comment || '',
        isReal: true
      }))

      const finalReviews = combined
      setReviews(finalReviews)

      // Calculate metrics
      const total = finalReviews.length
      const sum = finalReviews.reduce((acc, r) => acc + r.rating, 0)
      const average = total > 0 ? Number((sum / total).toFixed(1)) : 5.0

      // Star breakdown counts
      const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      finalReviews.forEach(r => {
        const rate = Math.round(r.rating)
        if (counts[rate] !== undefined) {
          counts[rate]++
        }
      })

      const breakdown = [5, 4, 3, 2, 1].map(stars => {
        const count = counts[stars]
        const pct = total > 0 ? Math.round((count / total) * 100) : 0
        return { stars, pct, count }
      })

      setMetrics({
        average,
        total,
        breakdown
      })
    }

    loadReviews()
  }, [product])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-cream2 font-sans">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gold/20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-gold border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#FFFDF9] px-4 text-center font-sans relative overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-48 h-48 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-md bg-white/60 backdrop-blur-md border border-gold/15 p-8 sm:p-12 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:shadow-gold/5 transition-all duration-500 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-3xl mb-6 shadow-sm border border-gold/15 animate-bounce">
            🙏
          </div>
          <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-dark leading-tight tracking-tight mb-3">
            Offerings Temporarily Unavailable
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
            Our sacred stones are currently undergoing consecration or are out of stock. Please check back later or visit our home page to join the waiting list.
          </p>
          <Link to="/" className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-dark font-black text-xs uppercase tracking-widest shadow-md hover:shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border-none cursor-pointer text-center">
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  const dbImages = (product.product_images || [])
    .filter(img => img && img.url && typeof img.url === 'string' && img.url.trim() !== '' && !img.url.includes('placeholder'))

  const displayImages = dbImages.length > 0 ? dbImages : (product.image_url ? [{ url: product.image_url }] : [])

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) {
      addToCart({ id: product.id, name: product.name, price: product.price, image: primaryImage(product), slug: product.slug })
    }
    navigate('/checkout')
  }

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      q: "Does this stone really float on water?",
      a: "Yes. Every single stone is hand-tested to ensure it floats naturally in water. Due to its porous volcanic/pumice composition, it holds natural floating attributes, mirroring the miraculous properties described in the Ramayana."
    },
    {
      q: "How should I care for and display the stone?",
      a: "Place the stone in a clean, decorative brass or copper bowl filled with fresh water. We recommend placing it in your Pooja room, at the main entrance of your home, or in the north-east corner of your living room to invite prosperity and positive energy. You may refresh the water weekly."
    },
    {
      q: "What does the consecration process involve?",
      a: "Each stone is purified at the holy shores of Rameswaram (where Lord Rama built the bridge). They undergo traditional Vedic prayers, Gangajal wash, application of sacred sandalwood paste, and energy consecration under the guidance of local temple priests."
    },
    {
      q: "Can I customize the engraving on the stone?",
      a: "Yes. By default, the stones are engraved with 'SRI RAMA' in clean Sanskrit lettering. If you wish to customize or opt for a plain stone, you can coordinate with our support team immediately after placing your order."
    }
  ]

  return (
    <>
      <Helmet>
        <title>{product.meta_title || `${product.name} – RamSetu Divine Stones`}</title>
        <meta name="description" content={product.meta_description || product.description || `Buy ${product.name} — authentic sacred Ram Setu stone.`} />
      </Helmet>

      {/* Premium Shop Layout */}
      <div className="bg-gradient-to-b from-cream2 via-[#fdfbf7] to-cream2 py-16 md:py-24 min-h-screen font-sans relative overflow-hidden">
        {/* Dotted grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #D4A537 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />



        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Premium Images Gallery */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-col sm:flex-row-reverse gap-4 sm:gap-8 items-center">
                <div
                  className="w-full sm:flex-1 rounded-[2.5rem] overflow-hidden aspect-square bg-[#FAF4E8] border-2 border-gold/25 shadow-[0_25px_60px_-15px_rgba(212,165,55,0.12)] hover:shadow-[0_35px_80px_-10px_rgba(212,165,55,0.22)] hover:border-gold/45 relative group transition-all duration-500 cursor-grab active:cursor-grabbing"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() => handleSwipe(displayImages.length)}
                >
                  {/* Shimmer sweep */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-10 pointer-events-none" />

                  <img
                    src={displayImages[activeImg]?.url || primaryImage(product)}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-1000 ease-out group-hover:scale-105 pointer-events-none"
                  />
                </div>
                {/* Thumbnails */}
                {displayImages.length > 1 && (
                  <div className="w-full sm:w-auto shrink-0 px-0 sm:px-2">
                    {displayImages.length > 4 && (
                      <button
                        type="button"
                        onClick={() => scrollThumbnails('up')}
                        className="text-gold p-1 hover:scale-125 transition-transform duration-200 hidden sm:block mx-auto mb-1"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>
                    )}
                    <div
                      ref={thumbRef}
                      className="flex flex-row sm:flex-col gap-2.5 sm:gap-3 sm:h-[400px] sm:max-h-[400px] overflow-x-auto sm:overflow-x-hidden sm:overflow-y-auto pr-0 sm:pr-1.5 scrollbar-none shrink-0 w-full sm:w-auto scroll-smooth py-1 sm:py-2 px-0.5 justify-between sm:justify-start"
                    >
                      {displayImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          className={`w-[calc((100%-1.875rem)/4)] sm:w-16 h-auto sm:h-16 aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 shrink-0 ${i === activeImg
                            ? 'border-gold shadow-[0_0_12px_rgba(212,165,55,0.4)] bg-[#FAF4E8] scale-105 opacity-100'
                            : 'border-gold/10 opacity-60 hover:opacity-100 hover:border-gold/35 bg-[#FAF4E8]/50 scale-100'
                            }`}
                        >
                          <img src={img.url} alt="" className="w-full h-full object-contain p-1.5 sm:p-2" />
                        </button>
                      ))}
                    </div>
                    {displayImages.length > 4 && (
                      <button
                        type="button"
                        onClick={() => scrollThumbnails('down')}
                        className="text-gold p-1 hover:scale-125 transition-transform duration-200 hidden sm:block mx-auto mt-1"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Consecration Note / Quote Card - Desktop (below image) */}
              <div className="hidden lg:block bg-gradient-to-br from-white via-[#FFFDFB]/95 to-[#FFFDF9]/90 backdrop-blur-md rounded-[2rem] p-7 border border-gold/20 shadow-md relative overflow-hidden text-left group">
                {/* Accent line */}
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-gold to-gold-light" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none group-hover:bg-gold/10 transition-colors duration-700"></div>
                <h3 className="text-xs font-black text-dark tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-gold animate-spin-slow" /> SPIRITUAL SIGNIFICANCE
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm italic leading-relaxed font-semibold pl-2">
                  "By chanting the holy name of Rama, even heavy stones float like rafts on the surface of the great ocean."
                  <span className="block mt-2 font-black not-italic text-gold">— Valmiki Ramayana</span>
                </p>
              </div>
            </div>

            {/* Right Column: Premium Product Details & Purchase Form */}
            <div className="lg:col-span-5 flex flex-col space-y-8 text-left">
              {/* Product Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[9px] text-gold bg-gold/5 border border-gold/25 px-3.5 py-1.5 rounded-full uppercase font-black tracking-widest shadow-sm">
                    <Truck className="w-3.5 h-3.5" />
                    {(product && product.price >= settings.shipping_threshold) || settings.shipping_flat_rate === 0 ? 'Free Delivery' : `Free Delivery above ₹${settings.shipping_threshold}`}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5.5xl font-extrabold text-dark leading-tight tracking-tight bg-gradient-to-r from-dark via-[#4A2500] to-gold bg-clip-text text-transparent">
                  {product.name}
                </h1>

                {/* Review Metric */}
                <div className="flex items-center gap-2.5 text-xs font-bold text-gray-500">
                  <div className="flex gap-0.5 text-gold">
                    {[...Array(5)].map((_, i) => {
                      const starVal = i + 1
                      const isHalf = metrics.average >= starVal - 0.5 && metrics.average < starVal
                      return (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${starVal <= Math.round(metrics.average)
                            ? 'text-gold fill-current'
                            : isHalf
                              ? 'text-gold fill-current opacity-70'
                              : 'text-gray-200'
                            }`}
                        />
                      )
                    })}
                  </div>
                  <span className="text-dark/80 font-black">{metrics.average} / 5.0</span>
                  <span className="text-gray-300">|</span>
                  <span
                    onClick={() => {
                      const el = document.getElementById('devotee-reviews-section')
                      if (el) el.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="text-gold underline cursor-pointer hover:text-gold-light transition-colors font-extrabold uppercase tracking-wider text-[10px]"
                  >
                    {metrics.total} Devotional Review{metrics.total !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Price Details */}
              <div className="bg-gradient-to-br from-white via-[#FFFDFB]/98 to-[#FFF9EE]/95 rounded-[2rem] p-6 border border-gold/15 shadow-sm flex items-center justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-xl pointer-events-none group-hover:bg-gold/10 transition-colors duration-750"></div>
                <div>
                  <span className="text-gray-400 text-[9px] uppercase font-black tracking-widest block mb-1.5">Divine Offering Price</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-dark tracking-tight">₹{Math.round(product.price)}</span>
                    {product.compare_price && (
                      <del className="text-gray-400 text-sm font-semibold">₹{Math.round(product.compare_price)}</del>
                    )}
                  </div>
                </div>
                {product.stock_qty > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] font-sans font-black ml-2 z-10">
                    <span className="text-gray-400 tracking-wider">STOCK:</span>
                    <span className="px-3.5 py-1 rounded-lg border border-gold/20 bg-cream2 text-dark min-w-[2.5rem] text-center">
                      {product.stock_qty}
                    </span>
                    <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-extrabold text-[9px] border border-emerald-100/50">
                      IN
                    </span>
                  </div>
                )}
              </div>

              {/* Product Backend Description */}
              {product.description && (
                <p className="text-gray-600 text-sm leading-relaxed font-sans font-medium px-2 py-1 border-l-2 border-gold/20">
                  {product.description}
                </p>
              )}

              {/* Purchase Options */}
              <div className="space-y-4">
                {product.stock_qty === 0 ? (
                  <div className="bg-red-50 text-red-700 font-bold p-4 rounded-2xl text-center text-xs border border-red-100 uppercase tracking-wide">
                    Consecrating Next Batch (Temporarily Out of Stock)
                  </div>
                ) : (
                  <div className="bg-white/50 backdrop-blur-sm border border-gold/10 p-5 rounded-[2rem] shadow-inner space-y-4">
                    <div className="flex gap-2 sm:gap-3.5 items-center">
                      {/* Quantity counter */}
                      <div className="flex items-center border border-gold/25 rounded-full overflow-hidden bg-white shadow-sm shrink-0 h-12">
                        <button
                          type="button"
                          onClick={() => setQty(q => Math.max(1, q - 1))}
                          className="px-3 sm:px-4 text-dark font-black hover:bg-gold/10 bg-transparent border-none cursor-pointer h-full transition-colors text-lg"
                        >
                          −
                        </button>
                        <span className="px-1.5 sm:px-3 font-extrabold text-sm text-dark min-w-[20px] sm:min-w-[24px] text-center select-none">{qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(q => q + 1)}
                          className="px-3 sm:px-4 text-dark font-black hover:bg-gold/10 bg-transparent border-none cursor-pointer h-full transition-colors text-lg"
                        >
                          +
                        </button>
                      </div>

                      {/* Add to Cart */}
                      <button
                        type="button"
                        onClick={() => {
                          for (let i = 0; i < qty; i++) {
                            addToCart({ id: product.id, name: product.name, price: product.price, image: primaryImage(product), slug: product.slug });
                          }
                          toast.success('Divine stone added to your cart!');
                        }}
                        className="flex-1 h-12 rounded-full border-2 border-dark text-dark hover:bg-dark hover:text-white font-extrabold text-[10px] sm:text-xs tracking-wider sm:tracking-widest bg-transparent transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer uppercase shadow-sm"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add to Cart
                      </button>
                    </div>

                    {/* Buy Now */}
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="w-full py-3 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold hover:scale-[1.01] active:scale-99 text-dark font-black text-xs uppercase tracking-widest shadow-md hover:shadow-gold/25 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border-none h-12"
                    >
                      <Sparkles className="w-4.5 h-4.5" /> Buy Now
                    </button>
                  </div>
                )}
              </div>

              {/* Trust assurances */}
              <div className="grid grid-cols-2 gap-4 text-xs text-dark/85 pt-6 border-t border-gold/15 mb-4">
                {[
                  { icon: <Award className="w-4.5 h-4.5" />, title: '100% Authentic', sub: 'Pure Vedic Origin' },
                  { icon: <Waves className="w-4.5 h-4.5" />, title: 'Natural Float', sub: 'Guaranteed to Float' },
                  { icon: <Flame className="w-4.5 h-4.5" />, title: 'Consecrated', sub: 'Purified at Dham' },
                  { icon: <RefreshCw className="w-4.5 h-4.5" />, title: '7-Day Guarantee', sub: 'Hassle-free Returns' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gradient-to-b from-white to-[#FAF6EE] border border-gold/15 rounded-2xl p-3 shadow-sm hover:border-gold/30 hover:shadow-md transition-all duration-300">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/15 shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="font-black text-[10px] uppercase tracking-wider">{item.title}</h4>
                      <span className="text-[9px] text-gray-400 font-bold">{item.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Consecration Note / Quote Card - Mobile (below details) */}
              <div className="block lg:hidden bg-gradient-to-br from-white via-[#FFFDFB]/95 to-[#FFFDF9]/90 backdrop-blur-md rounded-[2rem] p-7 border border-gold/20 shadow-md relative overflow-hidden text-left group">
                {/* Accent line */}
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-gold to-gold-light" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none group-hover:bg-gold/10 transition-colors duration-700"></div>
                <h3 className="text-xs font-black text-dark tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-gold animate-spin-slow" /> SPIRITUAL SIGNIFICANCE
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm italic leading-relaxed font-semibold pl-2">
                  "By chanting the holy name of Rama, even heavy stones float like rafts on the surface of the great ocean."
                  <span className="block mt-2 font-black not-italic text-gold">— Valmiki Ramayana</span>
                </p>
              </div>
            </div>
          </div>

          {/* Miracle Showcase Video Callout Section */}
          <div className="mt-24 md:mt-28 bg-dark rounded-[2.5rem] p-8 md:p-12 border border-gold/15 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-dark via-[#1a0f02] to-dark pointer-events-none" />
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5 text-left">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-gold tracking-widest uppercase py-1.5 px-3.5 bg-gold/15 rounded-full border border-gold/30">
                  ✦ WATCH THE WONDER
                </span>
                <h3 className="text-3xl md:text-4xl font-black text-white tracking-wide leading-tight">
                  Watch it float in real-time
                </h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                  We don't just tell; we demonstrate. Our holy stones are gathered with meticulous care from Rameswaram, clean-washed, inscribed with the holy name of Lord Rama, and blessed so you can witness the same mythical miracle in your living room or Pooja room.
                </p>
                <div className="pt-2">
                  <Link to="/gallery" className="inline-flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-widest hover:text-gold-light transition-colors group">
                    View Miracle Video Gallery
                  </Link>
                </div>
              </div>
              {/* Video Player Slider */}
              <div className="group relative">
                {/* Glow ring */}
                <div className="absolute -inset-1 bg-gradient-to-br from-gold/30 via-gold/10 to-transparent rounded-[2.5rem] blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

                <div className="relative rounded-[2rem] overflow-hidden border-4 border-gold/30 shadow-2xl shadow-gold/15 transition-all duration-500 hover:border-gold/60 bg-black max-w-[320px] mx-auto">
                  {/* Slide Track */}
                  <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${videoIndex * 100}%)` }}>
                    {proofVideos.map((video, idx) => (
                      <div key={idx} className="min-w-full relative aspect-[9/16] flex items-center justify-center">
                        <video
                          ref={el => videoRefs.current[idx] = el}
                          src={video.src}
                          playsInline
                          controls={playingVideoIdx === idx}
                          preload="metadata"
                          className="w-full h-full object-cover"
                          onPlay={() => setPlayingVideoIdx(idx)}
                          onPause={() => {
                            if (playingVideoIdx === idx) setPlayingVideoIdx(null)
                          }}
                        />

                        {playingVideoIdx !== idx && (
                          <div
                            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-gradient-to-t from-dark/85 via-dark/30 to-transparent backdrop-blur-[0.5px] transition-all duration-300 group-hover:backdrop-blur-0 p-6 text-center"
                            onClick={() => {
                              if (videoRefs.current[idx]) {
                                videoRefs.current[idx].play()
                                setPlayingVideoIdx(idx)
                              }
                            }}
                          >
                            <div className="relative mb-3">
                              <div className="absolute inset-0 rounded-full bg-gold/40 animate-ping scale-110" />
                              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-2xl pl-1">
                                <svg className="w-6 h-6 text-dark" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                            <span className="text-white font-sans font-bold text-xs uppercase tracking-widest">{video.title}</span>
                            <span className="text-white/60 text-[10px] font-sans mt-0.5">{video.desc}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    type="button"
                    onClick={() => handleVideoChange((videoIndex - 1 + proofVideos.length) % proofVideos.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 border border-white/25 text-white flex items-center justify-center cursor-pointer backdrop-blur-sm z-20 hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVideoChange((videoIndex + 1) % proofVideos.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 border border-white/25 text-white flex items-center justify-center cursor-pointer backdrop-blur-sm z-20 hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>

                  {/* Indicator Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {proofVideos.map((_, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleVideoChange(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${videoIndex === idx ? 'bg-gold w-4' : 'bg-white/40 hover:bg-white/60'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews & Ratings Section */}
          <div id="devotee-reviews-section" className="mt-24 md:mt-28 border-t border-gold/15 pt-20">
            <div className="text-center mb-12">
              <span className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase">REVIEWS</span>
              <h3 className="text-2xl sm:text-3xl font-black text-dark mt-2 tracking-wide">Devotee Feedback &amp; Ratings</h3>
              <div className="w-12 h-0.5 bg-gold mx-auto mt-3"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
              {/* Left Column: Summary (Span 4) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-8 border border-gold/15 shadow-sm text-center">
                <h4 className="text-sm font-black text-dark uppercase tracking-wider mb-4">Devotee Rating</h4>
                <div className="text-5xl font-black text-dark mb-2">{metrics.average}</div>
                <div className="flex justify-center gap-1 text-gold mb-2">
                  {[...Array(5)].map((_, i) => {
                    const starVal = i + 1
                    return (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${starVal <= Math.round(metrics.average)
                          ? 'text-gold fill-current'
                          : 'text-gray-200'
                          }`}
                      />
                    )
                  })}
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Based on {metrics.total} Verified Ratings</div>

                {/* Rating bars */}
                <div className="space-y-2">
                  {metrics.breakdown.map((bar, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-bold text-gray-500">
                      <span className="w-3 text-right">{bar.stars}</span>
                      <Star className="w-3 h-3 text-gold fill-current shrink-0" />
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gold rounded-full" style={{ width: `${bar.pct}%` }}></div>
                      </div>
                      <span className="w-8 text-right text-gray-400">{bar.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Reviews List (Span 8) */}
              <div className="lg:col-span-8 space-y-6">
                {reviews.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 border border-gold/10 shadow-sm text-center text-gray-500 font-bold text-sm">
                    No reviews yet. Be the first to purchase and review this divine stone!
                  </div>
                ) : (
                  reviews.map((rev, idx) => (
                    <div key={rev.id || idx} className="bg-gradient-to-br from-white to-[#FFFDF9]/60 rounded-3xl p-6 border border-gold/10 shadow-sm hover:shadow-md hover:border-gold/20 transition-all duration-300 flex flex-col gap-4 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-dark text-left">
                              {rev.name}{user && rev.user_id === user.id ? ' (You)' : ''}
                            </span>
                            <span className="text-[9px] text-green-700 bg-green-50 border border-green-200/50 px-2 py-0.5 rounded-md uppercase font-black tracking-widest">Verified Buyer</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-semibold">{rev.date}</span>
                        </div>
                        <div className="flex gap-0.5 text-gold shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-gold fill-current' : 'text-gray-200'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        {rev.title && <h5 className="font-extrabold text-sm text-dark mb-1">{rev.title}</h5>}
                        <p className="text-gray-500 text-xs md:text-sm leading-relaxed italic">"{rev.comment}"</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Interactive FAQ Accordion */}
          <div className="mt-24 md:mt-28 max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase">FAQS</span>
              <h3 className="text-2xl sm:text-3xl font-black text-dark mt-2 tracking-wide">Questions &amp; Answers</h3>
              <div className="w-12 h-0.5 bg-gold mx-auto mt-3"></div>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div key={idx} className="bg-white rounded-2xl border border-gold/15 shadow-sm overflow-hidden transition-all duration-300 text-left">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full py-5 px-6 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className="font-bold text-sm md:text-base text-dark tracking-wide pr-4 flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-gold/10 text-gold font-bold flex items-center justify-center text-xs shrink-0">Q</span>
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4.5 h-4.5 text-gold shrink-0" />
                      ) : (
                        <ChevronDown className="w-4.5 h-4.5 text-gold shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-gray-500 text-xs md:text-sm leading-relaxed border-t border-gold/5 pt-4 pl-16">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}