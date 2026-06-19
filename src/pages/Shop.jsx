import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { getProducts, primaryImage } from '../lib/supabase'
import { useCart } from '../context/CartContext'
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
  ArrowRight
} from 'lucide-react'

export default function Shop() {
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('legend')
  const [openFaq, setOpenFaq] = useState(null)
  const { addToCart } = useCart()
  const thumbRef = useRef(null)

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-cream2 px-4 text-center font-sans">
        <span className="text-6xl mb-4">🙏</span>
        <h2 className="font-bold text-2xl text-dark mb-4">Sacred Artifact Not Found</h2>
        <Link to="/" className="px-6 py-3 bg-dark text-gold font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-gold hover:text-dark transition-all duration-300">
          Return Home
        </Link>
      </div>
    )
  }

  const dbImages = (product.product_images || [])
    .filter(img => img && img.url && typeof img.url === 'string' && img.url.trim() !== '' && !img.url.includes('placeholder'))

  const fallbackImages = [
    { url: '/images/gallery/gallery-1.jpeg' },
    { url: '/images/gallery/gallery-2.jpeg' },
    { url: '/images/gallery/gallery-3.jpeg' },
    { url: '/images/gallery/gallery-4.jpeg' }
  ]

  const displayImages = [...dbImages]
  fallbackImages.forEach(fb => {
    if (displayImages.length < 4 && !displayImages.some(img => img.url === fb.url)) {
      displayImages.push(fb)
    }
  })

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

        {/* Slow-spinning sacred mandalas */}
        <div className="absolute opacity-[0.05] w-[500px] h-[500px] -left-20 top-10 pointer-events-none select-none">
          <svg viewBox="0 0 100 100" className="w-full h-full text-gold animate-spin-slow">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2,2" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.2" />
            <path d="M 50 5 L 50 95 M 5 50 L 95 50 M 18 18 L 82 82 M 18 82 L 82 18" stroke="currentColor" strokeWidth="0.15" />
            {[...Array(8)].map((_, i) => (
              <circle key={i} cx={50 + 20 * Math.cos((i * Math.PI) / 4)} cy={50 + 20 * Math.sin((i * Math.PI) / 4)} r="2" fill="none" stroke="currentColor" strokeWidth="0.2" />
            ))}
          </svg>
        </div>

        <div className="absolute opacity-[0.03] w-[700px] h-[700px] -right-32 top-1/4 pointer-events-none select-none">
          <svg viewBox="0 0 100 100" className="w-full h-full text-gold" style={{ animation: 'spin 120s linear infinite' }}>
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.3" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1,1" />
            <path d="M 50 0 L 50 100 M 0 50 L 100 50" stroke="currentColor" strokeWidth="0.1" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Premium Images Gallery */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-col-reverse sm:flex-row-reverse gap-4 sm:gap-8 items-center">
                <div 
                  className="flex-1 rounded-[2.5rem] overflow-hidden aspect-square bg-[#FAF6EE] border-2 border-gold/25 shadow-[0_25px_60px_-15px_rgba(212,165,55,0.12)] hover:shadow-[0_35px_80px_-10px_rgba(212,165,55,0.22)] hover:border-gold/45 relative group transition-all duration-500 cursor-grab active:cursor-grabbing"
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
                  <div className="flex flex-row sm:flex-col items-center gap-3 shrink-0 w-full sm:w-auto justify-center px-1 sm:px-2">
                    {displayImages.length > 4 && (
                      <button
                        type="button"
                        onClick={() => scrollThumbnails('up')}
                        className="text-gold p-1 hover:scale-125 transition-transform duration-200"
                      >
                        <ChevronUp className="w-5 h-5 hidden sm:block" />
                        <span className="block sm:hidden text-gold font-bold text-lg leading-none">◀</span>
                      </button>
                    )}
                    <div
                      ref={thumbRef}
                      className="flex sm:flex-col gap-3 max-h-[380px] overflow-y-auto pr-1.5 scrollbar-none shrink-0 overflow-x-auto w-full sm:w-auto scroll-smooth py-2 px-2"
                    >
                      {displayImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          className={`w-16 h-16 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 shrink-0 ${
                            i === activeImg 
                              ? 'border-gold shadow-[0_0_12px_rgba(212,165,55,0.4)] bg-white scale-105 opacity-100' 
                              : 'border-gold/10 opacity-60 hover:opacity-100 hover:border-gold/35 bg-white/50 scale-100'
                          }`}
                        >
                          <img src={img.url} alt="" className="w-full h-full object-contain p-2" />
                        </button>
                      ))}
                    </div>
                    {displayImages.length > 4 && (
                      <button
                        type="button"
                        onClick={() => scrollThumbnails('down')}
                        className="text-gold p-1 hover:scale-125 transition-transform duration-200"
                      >
                        <ChevronDown className="w-5 h-5 hidden sm:block" />
                        <span className="block sm:hidden text-gold font-bold text-lg leading-none">▶</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              {/* Consecration Note / Quote Card */}
              <div className="bg-gradient-to-br from-white via-[#FFFDFB]/95 to-[#FFFDF9]/90 backdrop-blur-md rounded-[2rem] p-7 border border-gold/20 shadow-md relative overflow-hidden text-left group">
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
            <div className="lg:col-span-5 flex flex-col space-y-8">
              {/* Product Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[9px] text-green-700 bg-green-50 border border-green-200/60 px-3.5 py-1.5 rounded-full uppercase font-black tracking-widest shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    In Stock
                  </span>
                </div>
                <h2 className="text-2xl md:text-3.5xl font-black text-dark leading-tight tracking-tight bg-gradient-to-r from-dark via-[#4A2500] to-gold bg-clip-text text-transparent">
                  {product.name}
                </h2>

                {/* Review Metric */}
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <div className="flex gap-0.5 text-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-dark/80">4.9 / 5.0</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gold underline cursor-pointer hover:text-gold-light transition-colors font-bold">(128 Devotional Reviews)</span>
                </div>
              </div>

              {/* Price Details */}
              <div className="bg-gradient-to-br from-white via-[#FFFDFB]/98 to-[#FFF9EE]/90 rounded-[2rem] p-6 border-2 border-gold/20 shadow-[0_15px_35px_-5px_rgba(212,165,55,0.08)] flex items-center justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-xl pointer-events-none group-hover:bg-gold/10 transition-colors duration-750"></div>
                <div>
                  <span className="text-gray-400 text-[9px] uppercase font-black tracking-widest block mb-1.5">Divine Offering Price</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-dark">₹{Math.round(product.price)}</span>
                    {product.compare_price && (
                      <del className="text-gray-400 text-sm font-semibold">₹{Math.round(product.compare_price)}</del>
                    )}
                  </div>
                </div>
                {product.price < product.compare_price && (
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3.5 py-2 rounded-2xl text-center relative z-10 shadow-md animate-pulse">
                    <span className="text-[9px] font-black block uppercase tracking-wider">Save</span>
                    <span className="text-sm font-black block">{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%</span>
                  </div>
                )}
              </div>

              {/* Product Backend Description */}
              {product.description && (
                <p className="text-gray-600 text-sm leading-relaxed font-sans font-medium px-2 py-1">
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
                  <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                      {/* Quantity counter */}
                      <div className="flex items-center border border-gold/30 rounded-full overflow-hidden bg-white shadow-inner shrink-0 h-12">
                        <button
                          onClick={() => setQty(q => Math.max(1, q - 1))}
                          className="px-4 text-dark font-black hover:bg-gold/10 bg-transparent border-none cursor-pointer h-full transition-colors text-lg"
                        >
                          −
                        </button>
                        <span className="px-3 font-black text-sm text-dark min-w-[20px] text-center select-none">{qty}</span>
                        <button
                          onClick={() => setQty(q => q + 1)}
                          className="px-4 text-dark font-black hover:bg-gold/10 bg-transparent border-none cursor-pointer h-full transition-colors text-lg"
                        >
                          +
                        </button>
                      </div>

                      {/* Add to Cart */}
                      <button
                        onClick={() => {
                          for (let i = 0; i < qty; i++) {
                            addToCart({ id: product.id, name: product.name, price: product.price, image: primaryImage(product), slug: product.slug });
                          }
                          toast.success('Divine stone added to your cart!');
                        }}
                        className="flex-1 h-12 rounded-full border-2 border-dark text-dark hover:bg-dark hover:text-white font-black text-xs tracking-wider bg-transparent transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer uppercase shadow-sm"
                      >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </button>
                    </div>

                    {/* Buy Now */}
                    <button
                      onClick={handleBuyNow}
                      className="w-full py-3 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold hover:from-gold-light hover:to-gold text-dark font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-gold/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border-none h-12"
                    >
                      <Sparkles className="w-4 h-4" /> Buy Now (Instant Checkout)
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                )}
              </div>

              {/* Trust assurances */}
              <div className="grid grid-cols-2 gap-4 text-xs text-dark/85 pt-6 border-t border-gold/15">
                {[
                  { icon: <Award className="w-4.5 h-4.5" />, title: '100% Authentic', sub: 'Pure Vedic Origin' },
                  { icon: <Waves className="w-4.5 h-4.5" />, title: 'Natural Float', sub: 'Guaranteed to Float' },
                  { icon: <Flame className="w-4.5 h-4.5" />, title: 'Consecrated', sub: 'Purified at Dham' },
                  { icon: <RefreshCw className="w-4.5 h-4.5" />, title: '7-Day Guarantee', sub: 'Hassle-free Returns' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gradient-to-b from-white to-[#FAF6EE] border border-gold/15 rounded-2xl p-3 shadow-sm hover:border-gold/45 hover:shadow-md transition-all duration-300">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/15 shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="font-black text-[10px] uppercase tracking-wider">{item.title}</h4>
                      <span className="text-[9px] text-gray-400 font-bold">{item.sub}</span>
                    </div>
                  </div>
                ))}
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
                    <span className="transition-transform group-hover:translate-x-1.5">→</span>
                  </Link>
                </div>
              </div>
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-gold/25 shadow-xl group">
                <img
                  src="/images/gallery/gallery-2.jpeg"
                  alt="Ram Setu Stone Floating"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-dark/40 flex items-center justify-center">
                  <Link
                    to="/gallery"
                    className="w-16 h-16 rounded-full bg-gold flex items-center justify-center text-dark hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg"
                  >
                    <Waves className="w-7 h-7 text-dark" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews & Ratings Section */}
          <div className="mt-24 md:mt-28 border-t border-gold/15 pt-20">
            <div className="text-center mb-12">
              <span className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase">REVIEWS</span>
              <h3 className="text-3xl font-black text-dark mt-2 tracking-wide">Devotee Feedback &amp; Ratings</h3>
              <div className="w-12 h-0.5 bg-gold mx-auto mt-3"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
              {/* Left Column: Summary (Span 4) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-8 border border-gold/15 shadow-sm text-center">
                <h4 className="text-sm font-black text-dark uppercase tracking-wider mb-4">Devotee Rating</h4>
                <div className="text-5xl font-black text-dark mb-2">4.9</div>
                <div className="flex justify-center gap-1 text-gold mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Based on 128 Verified Ratings</div>
                
                {/* Rating bars */}
                <div className="space-y-2">
                  {[
                    { stars: 5, pct: 92 },
                    { stars: 4, pct: 6 },
                    { stars: 3, pct: 2 },
                    { stars: 2, pct: 0 },
                    { stars: 1, pct: 0 }
                  ].map((bar, i) => (
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
                {[
                  {
                    author: "Ramesh Sharma",
                    loc: "Ayodhya, UP",
                    date: "May 20, 2026",
                    rating: 5,
                    title: "Deeply Divine Experience",
                    comment: "I felt a deep divine connection the moment I unwrapped this sacred stone. I put it in a copper bowl filled with water in my pooja room, and it floats beautifully. Packaging was secure and included a authenticity certificate."
                  },
                  {
                    author: "Pooja Iyer",
                    loc: "Chennai, TN",
                    date: "June 02, 2026",
                    rating: 5,
                    title: "Floats Perfectly as Promised!",
                    comment: "I was skeptical about the floating aspect, but it floats effortlessly. My family was amazed. The 'SRI RAMA' engraving is clean and beautiful. Highly recommended for every spiritual household."
                  },
                  {
                    author: "Amit Verma",
                    loc: "Lucknow, UP",
                    date: "June 14, 2026",
                    rating: 5,
                    title: "Genuine and Sacred Stone",
                    comment: "Beautiful packaging and genuine quality stone. Sourced from Rameswaram and consecrated, which brings incredibly positive vibes into the home. Fast delivery across India."
                  }
                ].map((rev, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-6 border border-gold/10 shadow-sm flex flex-col gap-4 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-dark">{rev.author}</span>
                          <span className="text-[9px] text-green-700 bg-green-50 border border-green-200/50 px-2 py-0.5 rounded-md uppercase font-black tracking-widest">Verified Buyer</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold">{rev.loc} • {rev.date}</span>
                      </div>
                      <div className="flex gap-0.5 text-gold shrink-0">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm text-dark mb-1">{rev.title}</h5>
                      <p className="text-gray-500 text-xs md:text-sm leading-relaxed italic">"{rev.comment}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive FAQ Accordion */}
          <div className="mt-24 md:mt-28 max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase">FAQS</span>
              <h3 className="text-3xl font-black text-dark mt-2 tracking-wide">Questions &amp; Answers</h3>
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