import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { getFeaturedProducts, primaryImage } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import ScrollReveal from '../components/ScrollReveal'
import { Award, Waves, PenTool, Truck, Sparkles, Navigation, ShieldCheck, RefreshCw, ShoppingCart, HelpCircle, Star, ChevronUp, ChevronDown } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

// SVG Icons
const IconTemple = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

const IconWater = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2" />
  </svg>
)

const IconBox = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const IconTruck = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1m-6 0a2 2 0 11-4 0" />
  </svg>
)

const IconShield = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const IconCart = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const IconLotus = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2s-8 6-8 10.5a8 8 0 0016 0c0-4.5-8-10.5-8-10.5zm0 13c-1.38 0-2.5-1.12-2.5-2.5S10.62 10 12 10s2.5 1.12 2.5 2.5S13.38 15 12 15z" />
  </svg>
)

const IconWriting = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
)

const IconGift = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm-2 2h4M5 10h14v10H5V10z" />
  </svg>
)

const IconPray = ({ className = "w-6 h-6" }) => (
  <svg className={`${className} text-gold-light`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-4m0 0l-3-3m3 3l3-3M8 10h8m-8 4h8m-9-9h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
  </svg>
)

const IconWhatsApp = ({ className = "w-5 h-5 fill-current" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.623-1.023-5.086-2.885-6.948C16.59 2.012 14.125.99 11.505.992c-5.437 0-9.862 4.371-9.866 9.8-.001 1.762.47 3.487 1.362 5.034L1.97 20.479l4.677-1.325z" />
  </svg>
)

const IconInstagram = () => (
  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const IconYouTube = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.107C19.528 3.545 12 3.545 12 3.545s-7.528 0-9.388.511a3.002 3.002 0 00-2.11 2.107C0 8.021 0 12 0 12s0 3.979.502 5.837a3.003 3.003 0 002.11 2.107c1.86.511 9.388.511 9.388.511s7.528 0 9.388-.511a3.002 3.002 0 002.11-2.107c.502-1.858.502-5.837.502-5.837s0-3.979-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const IconFacebook = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

export default function Home() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const { addToCart } = useCart()
  const [testiIndex, setTestiIndex] = useState(0)
  const testiTrackRef = useRef(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [proofPlaying, setProofPlaying] = useState(false)
  const proofVideoRef = useRef(null)
  const [email, setEmail] = useState('')
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
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
    const threshold = 40

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

      {/* Hero Section */}
      <section className="relative min-h-[30vh] sm:min-h-[60vh] md:min-h-[90vh] flex items-center justify-start overflow-hidden bg-dark">
        {/* Background visual layers */}
        <div className="absolute inset-0 bg-[url('/images/banner/ram-setu-banner.webp')] bg-cover bg-[75%_center] md:bg-center opacity-100 scale-100 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/50 to-transparent pointer-events-none" />

        {/* Glowing aura blobs */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-[#4A2500]/40 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-24 flex items-center justify-start">
          <div className="max-w-3xl text-left border-l-4 border-gold pl-4 md:pl-5 py-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold-pale text-xs font-semibold tracking-wider uppercase mb-6 shadow-lg backdrop-blur-sm">
              <svg className="w-3.5 h-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13M12 3c-1 2-3 5-3 8v3h3M12 3c1 2 3 5 3 8v3h-3M9 14v4a2 2 0 002 2h2a2 2 0 002-2v-4M5.5 13c0 2 1.5 4 3.5 4M18.5 13c0 2-1.5 4-3.5 4" />
              </svg> Sacred &amp; Authentic
            </span>
            <h1 className="font-sans text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Get Divine and Positive Energy from <span className="bg-gradient-to-r from-gold-light via-gold to-gold-pale bg-clip-text text-transparent">Ram Setu</span>
            </h1>
            <p className="mt-6 text-cream/90 text-sm md:text-base lg:text-lg leading-relaxed font-sans max-w-2xl hidden md:block">
              Bring the divine presence and positive vibrations of Lord Ram into your home with authentic floating stones collected near Rameswaram.
            </p>

            <div className="mt-6 md:mt-10 flex flex-wrap gap-3 md:gap-4">
              <a href="#shop" className="px-5 py-3 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-dark font-black tracking-wider shadow-lg hover:shadow-gold/30 hover:-translate-y-0.5 transition-all duration-300 text-[10px] md:text-xs lg:text-sm uppercase flex items-center gap-2 border-none cursor-pointer group">
                Shop Now
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
              <a href="#about" className="px-5 py-3 md:px-8 md:py-4 rounded-full border-2 border-white/20 text-white font-bold hover:border-white hover:-translate-y-0.5 transition-all duration-300 text-[10px] md:text-xs lg:text-sm uppercase cursor-pointer">
                Our Story
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* Homepage Featured Product Showcase */}
      <ScrollReveal className="relative py-20 bg-cream2 overflow-hidden" id="shop">
        {/* Soft background aura glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="text-gold text-xs font-black tracking-[0.2em] uppercase block mb-2 font-sans">✦ Consecrated &amp; Blessed</span>
            <h2 className="font-sans text-3xl md:text-5xl font-extrabold text-dark tracking-tight">Bring Home the Sacred Blessing</h2>
            <p className="mt-3 text-gray-500 font-sans max-w-lg mx-auto text-sm md:text-base">
              Authentic floating stone collected from the sacred shores near Rameswaram. Custom engraved and consecrated with Vedic prayers.
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto mt-4 rounded-full" />
          </div>

          {products.length === 0 ? (
            <div className="py-16 text-center text-gray-400 font-sans">
              Loading sacred product details…
            </div>
          ) : (
            (() => {
              const product = products[0];
              const images = product.product_images || [];
              const baseImages = images.length > 0 ? images : [{ url: primaryImage(product) }];
              const fallbackUrls = [
                '/images/gallery/gallery-1.jpeg',
                '/images/gallery/gallery-2.jpeg',
                '/images/gallery/gallery-3.jpeg',
                '/images/gallery/gallery-4.jpeg'
              ];
              const tempImages = [...baseImages];
              for (let i = 0; i < fallbackUrls.length; i++) {
                if (tempImages.length >= 4) break;
                const fallbackUrl = fallbackUrls[i];
                if (!tempImages.some(img => img.url === fallbackUrl)) {
                  tempImages.push({ url: fallbackUrl });
                }
              }
              const displayImages = tempImages.map(img => ({
                ...img,
                url: (img.url && img.url.trim() && !img.url.includes('placeholder') && !img.url.includes('placeholder.co'))
                  ? img.url
                  : '/images/gallery/gallery-1.jpeg'
              }));

              const handleBuyNow = () => {
                for (let i = 0; i < qty; i++) {
                  addToCart({ id: product.id, name: product.name, price: product.price, image: primaryImage(product), slug: product.slug });
                }
                navigate('/checkout');
              };

              return (
                <div className="bg-gradient-to-br from-white to-[#FFFDF9]/90 rounded-3xl border border-gold/20 p-6 md:p-10 shadow-xl hover:shadow-2xl hover:shadow-gold/10 transition-all duration-500 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start relative overflow-hidden">
                  {/* Decorative golden corner accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/30 rounded-tl-2xl pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/30 rounded-br-2xl pointer-events-none" />
                  {/* Left: Images */}
                  <div className="w-full md:col-span-7">
                    <div className="flex flex-col-reverse sm:flex-row-reverse gap-4 sm:gap-8 items-center">
                      <div 
                        className="flex-1 rounded-2xl overflow-hidden aspect-square bg-[#FAF6EE] border-2 border-gold/25 shadow-lg relative group/img cursor-grab active:cursor-grabbing"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={() => handleSwipe(displayImages.length)}
                      >
                        <img
                          src={displayImages[activeImg]?.url || primaryImage(product)}
                          alt={product.name}
                          className="w-full h-full object-contain transition-transform duration-700 group-hover/img:scale-105 pointer-events-none"
                        />
                      </div>
                      {displayImages.length > 1 && (
                        <div className="flex flex-row sm:flex-col items-center gap-3 shrink-0 w-full sm:w-auto justify-center px-1 sm:px-2">
                          {displayImages.length > 4 && (
                            <button
                              type="button"
                              onClick={() => scrollThumbnails('up')}
                              className="text-gold p-1 hover:scale-125 transition-transform duration-200 cursor-pointer"
                            >
                              <ChevronUp className="w-5 h-5 hidden sm:block" />
                              <span className="block sm:hidden text-gold font-bold text-lg leading-none">◀</span>
                            </button>
                          )}
                          <div
                            ref={thumbRef}
                            className="flex sm:flex-col gap-3 max-h-[350px] overflow-y-auto pr-1.5 scrollbar-none shrink-0 overflow-x-auto w-full sm:w-auto scroll-smooth py-2 px-2"
                          >
                            {displayImages.map((img, i) => (
                              <button
                                key={i}
                                onClick={() => setActiveImg(i)}
                                className={`w-14 h-14 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 shrink-0 ${
                                  i === activeImg 
                                    ? 'border-gold shadow-[0_0_12px_rgba(212,165,55,0.4)] bg-white scale-105 opacity-100' 
                                    : 'border-gold/10 opacity-60 hover:opacity-100 hover:border-gold/35 bg-white/50 scale-100'
                                }`}
                              >
                                <img src={img.url} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                          {displayImages.length > 4 && (
                            <button
                              type="button"
                              onClick={() => scrollThumbnails('down')}
                              className="text-gold p-1 hover:scale-125 transition-transform duration-200 cursor-pointer"
                            >
                              <ChevronDown className="w-5 h-5 hidden sm:block" />
                              <span className="block sm:hidden text-gold font-bold text-lg leading-none">▶</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Right: Product details */}
                  <div className="flex flex-col h-full justify-between md:col-span-5">
                    <div>
                      <h3 className="font-sans font-black text-dark text-2xl md:text-4xl leading-snug mb-3 tracking-tight bg-gradient-to-r from-dark via-[#4A2500] to-gold bg-clip-text text-transparent">
                        {product.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 mb-4 bg-gold/5 border border-gold/10 px-3 py-1.5 rounded-full w-fit">
                        <div className="flex gap-0.5 text-gold">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-gold font-bold text-[10px] sm:text-xs">(128 Consecrated Buyer Reviews)</span>
                      </div>

                      <div className="flex items-center gap-3.5 mb-5 bg-[#FFFDF9]/80 border border-gold/10 px-4 py-2.5 rounded-2xl w-fit shadow-sm">
                        <span className="font-sans font-black text-dark text-3xl">₹{Math.round(product.price)}</span>
                        {product.compare_price && (
                          <del className="text-gray-400 text-sm font-semibold">₹{Math.round(product.compare_price)}</del>
                        )}
                        {product.price < product.compare_price && (
                          <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                            SAVE {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 font-sans text-sm md:text-base leading-relaxed mb-6 font-medium">
                        {product.description || 'Bring home a piece of Ramayana history. Consecrated on the shores of Rameswaram, this sacred stone floats naturally on water and spreads positive energy throughout your space.'}
                      </p>

                      {/* Benefits & Trust Badges */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="inline-flex items-center gap-1.5 bg-gold/5 border border-gold/15 rounded-full px-3 py-1.5 text-xs font-bold text-dark hover:bg-gold/10 hover:border-gold/35 transition-colors duration-300">
                          <Award className="w-3.5 h-3.5 text-gold" /> 100% Authentic
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-gold/5 border border-gold/15 rounded-full px-3 py-1.5 text-xs font-bold text-dark hover:bg-gold/10 hover:border-gold/35 transition-colors duration-300">
                          <Waves className="w-3.5 h-3.5 text-gold" /> Floats on Water
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-gold/5 border border-gold/15 rounded-full px-3 py-1.5 text-xs font-bold text-dark hover:bg-gold/10 hover:border-gold/35 transition-colors duration-300">
                          <PenTool className="w-3.5 h-3.5 text-gold" /> Free Engraving
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-gold/5 border border-gold/15 rounded-full px-3 py-1.5 text-xs font-bold text-dark hover:bg-gold/10 hover:border-gold/35 transition-colors duration-300">
                          <Truck className="w-3.5 h-3.5 text-gold" /> Pan India Free Shipping
                        </span>
                      </div>
                    </div>

                    <div>
                      {/* Qty and Actions */}
                      {product.stock_qty === 0 ? (
                        <div className="bg-red-50 text-red-700 font-bold p-4 rounded-xl text-center border border-red-100">
                          Currently Consecrating Next Batch (Out of Stock)
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="flex gap-4 items-center">
                            <div className="flex items-center border-2 border-gold/20 rounded-full overflow-hidden bg-white/80 backdrop-blur-sm shadow-inner shrink-0 hover:border-gold/45 transition-colors duration-300">
                              <button
                                onClick={() => setQty(q => Math.max(1, q - 1))}
                                className="px-4 py-2 text-dark font-black hover:bg-gold/10 bg-transparent border-none cursor-pointer text-lg transition-colors"
                              >
                                −
                              </button>
                              <span className="px-3 font-sans font-black text-sm text-dark min-w-[20px] text-center">{qty}</span>
                              <button
                                onClick={() => setQty(q => q + 1)}
                                className="px-4 py-2 text-dark font-black hover:bg-gold/10 bg-transparent border-none cursor-pointer text-lg transition-colors"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                for (let i = 0; i < qty; i++) {
                                  addToCart({ id: product.id, name: product.name, price: product.price, image: primaryImage(product), slug: product.slug });
                                }
                                toast.success('Added to Cart!');
                              }}
                              className="flex-1 h-12 rounded-full border-2 border-dark text-dark hover:bg-dark hover:text-white font-bold text-xs tracking-wider bg-transparent transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer uppercase"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                            </button>
                          </div>

                          <button
                            onClick={handleBuyNow}
                            className="w-full py-4 rounded-full bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-dark font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-gold/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border-none"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Buy Now (Instant Checkout)
                          </button>
                        </div>
                      )}

                      {/* Payment/Shipping reassurance */}
                      <div className="border-t border-gold/15 pt-5 mt-6 grid grid-cols-2 gap-4 text-left text-[11px] text-gray-500 font-sans leading-normal font-semibold">
                        <div className="flex items-center gap-2 hover:text-gold transition-colors duration-300"><Navigation className="w-4 h-4 text-gold" /> Consecrated in Rameswaram</div>
                        <div className="flex items-center gap-2 hover:text-gold transition-colors duration-300"><Truck className="w-4 h-4 text-gold" /> Fast Pan-India Delivery</div>
                        <div className="flex items-center gap-2 hover:text-gold transition-colors duration-300"><ShieldCheck className="w-4 h-4 text-gold" /> Secure Online Pay &amp; COD</div>
                        <div className="flex items-center gap-2 hover:text-gold transition-colors duration-300"><RefreshCw className="w-4 h-4 text-gold" /> 7-Day Float Guarantee</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </ScrollReveal>

      {/* Proof & Testimonials — Premium Light Section */}
      <section id="proof" className="relative bg-cream2 overflow-hidden">
        {/* Decorative background glow blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 text-center pt-20 pb-14 px-4 md:px-8 max-w-7xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-semibold tracking-widest uppercase mb-5">
            ✦ Real. Verified. Divine.
          </span>
          <h2 className="font-sans text-3xl md:text-5xl font-extrabold text-dark tracking-tight">
            See the <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">Proof</span>
          </h2>
          <p className="mt-3 text-gray-500 font-sans max-w-lg mx-auto text-sm md:text-base">
            Watch the miracle with your own eyes — sacred Ram Setu stones floating on water, just as described in the Ramayana
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto mt-5 rounded-full" />
        </div>

        {/* Video + Testimonials Grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Video Player */}
          <div className="group relative">
            {/* Concentric Rotating Halos */}
            <div className="absolute -inset-10 border border-dashed border-gold/15 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none hidden md:block" />
            <div className="absolute -inset-6 border border-dotted border-gold/25 rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none hidden md:block" />

            {/* Glow ring */}
            <div className="absolute -inset-1 bg-gradient-to-br from-gold/30 via-gold/10 to-transparent rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />
            <div className="relative rounded-3xl overflow-hidden border-2 border-gold/30 shadow-2xl shadow-gold/15 transition-all duration-500 hover:border-gold/60">
              <video
                ref={proofVideoRef}
                src="/images/gallery/gallery-video-1.mp4"
                playsInline
                preload="metadata"
                className="w-full aspect-[16/10] object-cover"
              />
              {!proofPlaying && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-gradient-to-t from-dark/70 via-dark/20 to-transparent backdrop-blur-[1px] transition-all duration-300 group-hover:backdrop-blur-0"
                  onClick={playProofVideo}
                >
                  {/* Play button with pulse ring */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gold/40 animate-ping scale-125" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-2xl shadow-gold/40 hover:scale-110 transition-transform duration-300 pl-1.5">
                      <svg className="w-8 h-8 text-dark" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <span className="mt-4 text-white/90 text-sm font-sans font-semibold tracking-wide">Tap to Watch</span>
                </div>
              )}
              {/* Bottom label bar */}
              {!proofPlaying && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark via-dark/60 to-transparent px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white/80 text-xs font-sans font-semibold tracking-wider">LIVE FLOATING PROOF</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Row below video */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { val: '1000+', label: 'Verified Orders' },
                { val: '100%', label: 'Float Guaranteed' },
                { val: '5★', label: 'Avg. Rating' },
              ].map(s => (
                <div key={s.label} className="bg-white/80 border border-gold/15 rounded-2xl py-3.5 px-2.5 text-center hover:border-gold/45 hover:shadow-md hover:shadow-gold/5 transition-all duration-300 backdrop-blur-sm shadow-sm">
                  <div className="font-sans text-lg md:text-xl font-extrabold bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">{s.val}</div>
                  <div className="text-gray-400 text-[10px] font-sans uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <Link to="/gallery" className="inline-flex items-center gap-2 mt-5 text-gold hover:text-gold-light font-bold text-sm transition-colors group/link">
              View Full Gallery
              <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Testimonials */}
          <div id="testimonials" className="flex flex-col">
            <div className="mb-7">
              <span className="text-gold text-sm font-sans tracking-widest uppercase block mb-1 font-bold">Devotee Stories</span>
              <h3 className="font-sans text-2xl md:text-3xl font-extrabold text-dark tracking-tight">What Our Devotees Say</h3>
              <p className="mt-2 text-gray-500 font-sans text-sm">Stories of faith &amp; divine connection from across India</p>
            </div>

            {/* Slider */}
            <div className="relative overflow-hidden w-full flex-1">
              <div className="flex transition-transform duration-500 ease-out" ref={testiTrackRef}>
                {[
                  {
                    quote: "I felt a divine connection when I received this sacred stone. Truly blessed! The stone floats exactly as promised. This is a genuine piece of faith.",
                    author: "Ramesh Sharma",
                    loc: "Ayodhya, UP",
                    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
                  },
                  {
                    quote: "The stone floats perfectly on water. A symbol of faith and miracles. I gifted it to my mother and she was overjoyed. Beautifully packaged with love.",
                    author: "Pooja Iyer",
                    loc: "Chennai, TN",
                    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
                  },
                  {
                    quote: "Beautiful packaging and genuine product. Thank you RamSetu Divine Stones! I've placed my order three times already. Each stone is unique and powerful.",
                    author: "Amit Verma",
                    loc: "Lucknow, UP",
                    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80"
                  }
                ].map((testi, i) => (
                  <div key={i} className="min-w-full">
                    <div className="relative bg-gradient-to-br from-white to-[#FFFDF9]/60 border border-gold/15 rounded-3xl p-7 md:p-9 overflow-hidden shadow-md hover:shadow-xl hover:shadow-gold/5 transition-all duration-350 group/testi">
                      {/* Golden corner brackets */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold/20 rounded-tl-2xl pointer-events-none group-hover/testi:border-gold transition-colors duration-300" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold/20 rounded-br-2xl pointer-events-none group-hover/testi:border-gold transition-colors duration-300" />

                      {/* Decorative quote mark */}
                      <span className="absolute top-4 right-6 text-gold/10 font-sans font-black text-8xl leading-none select-none">"</span>

                      {/* Stars */}
                      <div className="flex gap-0.5 mb-5">
                        {[...Array(5)].map((_, j) => (
                          <svg key={j} className="w-4 h-4 text-gold fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>

                      <blockquote className="text-gray-600 text-sm md:text-base leading-relaxed mb-8 font-sans relative z-10 italic">
                        "{testi.quote}"
                      </blockquote>

                      <div className="flex items-center gap-4 border-t border-gray-100 pt-5">
                        <div className="relative">
                          <img src={testi.img} alt={testi.author} className="w-12 h-12 rounded-full object-cover border-2 border-gold/30" />
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-dark fill-current" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </div>
                        <div>
                          <strong className="block text-dark font-sans text-sm font-bold">{testi.author}</strong>
                          <span className="text-gold font-sans text-xs font-semibold">{testi.loc} · Verified Buyer</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation + Dots */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <button
                    key={i}
                    onClick={() => setTestiIndex(i)}
                    className={`rounded-full transition-all duration-300 ${testiIndex === i ? 'bg-gold w-6 h-2.5' : 'bg-gray-300 hover:bg-gold/40 w-2.5 h-2.5'}`}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => scrollTesti(-1)}
                  className="w-11 h-11 rounded-full border-2 border-gold/20 text-gray-400 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={() => scrollTesti(1)}
                  className="w-11 h-11 rounded-full bg-gold/15 border-2 border-gold/30 text-gold hover:bg-gold hover:text-dark transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Trust note */}
            <div className="mt-8 flex items-center gap-3 bg-gold/5 border border-gold/15 rounded-xl px-5 py-4">
              <svg className="w-8 h-8 text-gold shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-gray-500 font-sans text-xs leading-relaxed">
                All reviews are from verified customers who have purchased and received their sacred stones from RamSetu Divine Stones.
              </p>
            </div>
          </div>
        </div>
      </section>

     



      {/* Story of Ram Setu */}
      <ScrollReveal className="relative overflow-hidden bg-gradient-to-b from-cream to-[#FAF3E0] py-24 border-t border-b border-gold/15" id="about">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">

            {/* Visual Column */}
            <div className="relative group/story flex justify-center w-full">
              {/* Rotating Sacred Mandala rings behind image container */}
              <div className="absolute -inset-8 border border-dashed border-gold/15 rounded-full animate-[spin_100s_linear_infinite] pointer-events-none" />
              <div className="absolute -inset-4 border border-dotted border-gold/20 rounded-full animate-[spin_60s_linear_infinite_reverse] pointer-events-none" />
              <div className="absolute -inset-12 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

              <div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl border-2 border-gold/30 max-w-lg lg:max-w-full bg-[#120700] hover:border-gold hover:shadow-gold/10 transition-all duration-500">
                {/* Image overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent z-10 pointer-events-none" />

                <img
                  src="/images/ram-setu-story.webp"
                  alt="Ram Setu Story"
                  className="w-full h-[320px] sm:h-[450px] md:h-[600px] object-cover block group-hover/story:scale-105 transition-transform duration-700"
                />

                {/* Image Floating Badge */}
                <span className="absolute bottom-6 left-6 z-20 bg-dark/85 border border-gold/45 backdrop-blur-md text-gold-pale px-4 py-2 rounded-full text-[10px] sm:text-xs font-extrabold tracking-widest uppercase shadow-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-ping" />
                  ✦ Sacred Rameswaram
                </span>
              </div>
            </div>

            {/* Text & Story Column */}
            <div className="flex flex-col justify-center text-left relative py-4 lg:pl-4">
              {/* Luxury Corner Ornaments */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/30 rounded-tl-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/30 rounded-br-2xl pointer-events-none" />

              <div className="pl-6 pr-6 py-6 sm:py-8">
                <span className="text-gold font-extrabold tracking-widest text-xs uppercase mb-3 block font-sans">
                  ✦ Ancient Legend
                </span>
                <h2 className="font-sans text-3xl md:text-5xl font-black text-dark mb-6 leading-tight tracking-tight">
                  The Story of <span className="bg-gradient-to-r from-gold to-orange-600 bg-clip-text text-transparent">Ram Setu</span>
                </h2>

                <div className="w-20 h-[3px] bg-gradient-to-r from-gold to-orange-500 mb-8 rounded-full" />

                <p className="text-gray-700 font-sans leading-relaxed text-sm md:text-base mb-6 font-medium">
                  According to the Ramayana, Lord Ram and his army built the mighty bridge across the sea to Lanka. These stones are believed to be a part of that divine legacy, a reminder of faith, devotion and the power of belief. Carrying one brings the blessings of Lord Ram into your home.
                </p>

                {/* Highlighted Quote Callout */}
                <div className="border-l-4 border-gold bg-gold/5 rounded-r-2xl p-5 mb-6 border-y border-r border-gold/10">
                  <p className="text-dark font-sans leading-relaxed text-xs md:text-sm italic font-semibold">
                    "Scientists have noted the unique pumice-like composition of these stones which allows them to float on water — a phenomenon that devotees across the world regard as a divine miracle."
                  </p>
                </div>

                <p className="text-gray-600 font-sans leading-relaxed text-xs md:text-sm mb-8 font-medium">
                  Each stone is hand-picked with devotion, consecrated with sacred prayers, and carries the eternal essence of Ram Bhakti.
                </p>

                <div className="flex flex-wrap gap-4 items-center">
                  <Link
                    to="/about"
                    className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-dark font-extrabold shadow-lg hover:shadow-gold/25 hover:-translate-y-0.5 transition-all duration-300 text-xs uppercase tracking-wider border-none"
                  >
                    Know Our Story
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </ScrollReveal>

      {/* Divine Gallery */}
      <ScrollReveal className="relative py-24 bg-gradient-to-b from-[#FAF3E0] to-cream2 border-t border-b border-gold/15 overflow-hidden" id="gallery">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#B8893A 1px, transparent 1px)', backgroundSize: '24px 24px' }} />



        {/* Soft glow blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-gold text-xs font-bold tracking-[0.25em] uppercase block mb-3 font-sans">✦ Sacred Visuals</span>
            <h2 className="font-sans text-3xl md:text-5xl font-extrabold text-dark tracking-tight">Divine Gallery</h2>
            <p className="mt-4 text-gray-500 font-sans max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              Sacred Ram Setu stones — each one a piece of divine history captured in its purest form.
            </p>
            <div className="w-20 h-[3px] bg-gradient-to-r from-gold to-orange-500 mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { src: '/images/gallery/gallery-1.jpeg', alt: 'Ram Setu Stone', caption: 'Authentic Ram Setu Stones', sub: 'Collected from sacred shores' },
              { src: '/images/gallery/gallery-2.jpeg', alt: 'Sacred Floating Stone', caption: 'Sacred Floating Stones', sub: 'Floats naturally on water' },
              { src: '/images/gallery/gallery-3.jpeg', alt: 'Stone Collection', caption: 'Stone Collection', sub: 'Hand-picked with devotion' },
              { src: '/images/gallery/gallery-4.jpeg', alt: 'Divine Stone', caption: 'Divine Proof of Legend', sub: 'The miracle that amazed the world' },
            ].map((img, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-[2rem] group cursor-pointer border-2 border-gold/15 hover:border-gold hover:shadow-[0_20px_50px_rgba(212,165,55,0.2)] transition-all duration-500 bg-[#FAF6EE]">
                <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-out z-20 pointer-events-none" />
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/20 to-transparent flex flex-col justify-end p-4 sm:p-5 z-10">
                  <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-white font-sans font-black text-sm sm:text-base tracking-tight block group-hover:text-gold transition-colors duration-300">{img.caption}</span>
                    <small className="text-gold-pale font-sans font-semibold text-[10px] mt-1 block opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{img.sub}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              to="/gallery"
              className="group inline-flex items-center gap-2.5 px-10 py-4 rounded-full border-2 border-gold text-gold hover:bg-gold hover:text-dark font-black tracking-widest transition-all duration-300 text-xs uppercase"
            >
              See Full Gallery
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* Our Divine Community */}
      <ScrollReveal className="relative py-20 bg-cream2 overflow-hidden border-b border-gold/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">

          {/* Centered title */}
          <div className="text-center mb-16">
            <span className="text-gold text-xs font-bold tracking-[0.25em] uppercase block mb-3 font-sans">✦ Sacred Fellowship</span>
            <h2 className="font-sans text-3xl md:text-5xl font-black text-dark tracking-tight">Our Divine Community</h2>
            <p className="mt-4 text-gray-500 font-sans max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              Join 50,000+ devotees on social media sharing their spiritual journey and miracle experiences.
            </p>
            <div className="w-20 h-[3px] bg-gradient-to-r from-gold to-orange-500 mx-auto mt-6 rounded-full" />
          </div>

          {/* 2 videos side by side + social below */}
          <div className="max-w-3xl mx-auto">

            {/* 2 portrait reel videos */}
            <div className="grid grid-cols-2 gap-5 mb-10">
              {[
                { src: '/images/gallery/gallery-video-2.mp4', label: 'Live Proof', badge: 'bg-red-600/90 text-white', caption: 'Daily Abhishek & Floating Test' },
                { src: '/images/gallery/gallery-video-3.mp4', label: 'Devotee Proof', badge: 'bg-gold/90 text-dark', caption: 'Consecration Rituals & Stories' },
              ].map((v, i) => (
                <a
                  key={i}
                  href="https://www.instagram.com/ramsetustones/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block relative rounded-[2rem] overflow-hidden shadow-xl border-2 border-gold/20 hover:border-gold hover:shadow-[0_20px_50px_-10px_rgba(212,165,55,0.35)] hover:-translate-y-1.5 transition-all duration-500 aspect-[9/16] bg-dark"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-out z-20 pointer-events-none" />
                  <video src={v.src} autoPlay muted loop playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-3 inset-x-3 flex justify-between items-center z-20 pointer-events-none">
                    <span className={`px-2.5 py-1 rounded-full ${v.badge} text-[8px] font-black uppercase tracking-widest shadow-md backdrop-blur-sm`}>{v.label}</span>
                    <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </div>
                  </div>
                  <div className="absolute inset-x-3 bottom-3 z-20">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-2.5 rounded-2xl group-hover:border-gold/30 transition-colors duration-300">
                      <p className="text-white font-black text-[10px] leading-snug">{v.caption}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Social pill buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="https://www.instagram.com/ramsetustones/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-black text-xs uppercase tracking-wider hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-md">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                Instagram
              </a>
              <a href="#" className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#FF0000] text-white font-black text-xs uppercase tracking-wider hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-md">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.107C19.528 3.545 12 3.545 12 3.545s-7.528 0-9.388.511a3.002 3.002 0 00-2.11 2.107C0 8.021 0 12 0 12s0 3.979.502 5.837a3.003 3.003 0 002.11 2.107c1.86.511 9.388.511 9.388.511s7.528 0 9.388-.511a3.002 3.002 0 002.11-2.107C24 15.979 24 12 24 12s0-3.979-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                YouTube
              </a>
              <a href="#" className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#1877F2] text-white font-black text-xs uppercase tracking-wider hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-md">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
              <a href="https://wa.me/919876543210" className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#25D366] text-white font-black text-xs uppercase tracking-wider hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-md">
                <FaWhatsapp className="w-4 h-4" />
                WhatsApp
              </a>
            </div>

          </div>
        </div>
      </ScrollReveal>

      {/* Why Choose Us */}

      <ScrollReveal className="py-24 bg-gradient-to-b from-[#FAF3E0] to-[#FFFBF2] relative overflow-hidden">
        {/* Pattern overlays */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C8860A 1.2px, transparent 1.2px)', backgroundSize: '32px 32px' }} />

        {/* Large Slow-Spinning Sacred Mandala Outline behind the section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-gold/5 rounded-full animate-[spin_120s_linear_infinite] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-gold/5 rounded-full animate-[spin_80s_linear_infinite_reverse] pointer-events-none" />

        {/* Ambient atmospheric glows */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="text-gold text-xs font-bold tracking-[0.25em] uppercase block mb-3 font-sans flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
              ✦ Spiritual Authenticity
              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            </span>
            <h2 className="font-sans text-3xl md:text-5xl font-black text-dark tracking-tight">Why Choose RamSetu Stones?</h2>
            <p className="mt-4 text-gray-500 font-sans max-w-lg mx-auto text-sm md:text-base leading-relaxed font-medium">
              Every stone carries ancient sanctity, verified by modern testing, and packaged with ultimate respect.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-gold via-orange-500 to-gold mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { Icon: IconTemple, title: '100% Authentic', desc: 'Sourced directly from the legendary bridge shores near Rameswaram.' },
              { Icon: IconWater, title: 'Floats on Water', desc: 'Tested and verified floating capacity naturally due to geological properties.' },
              { Icon: IconWriting, title: 'Custom Engraving', desc: 'Free devotional engraving of Ram, Om, or custom texts by expert craftsmen.' },
              { Icon: IconGift, title: 'Premium Gifting', desc: 'Packaged beautifully in decorative boxes suitable for temples and altars.' },
              { Icon: IconTruck, title: 'Pan India Delivery', desc: 'Sent safely across India with complete tracking details and helpline support.' },
              { Icon: IconPray, title: 'Blessed with Prayers', desc: 'Every stone is consecrated with chants and sacred rituals before shipment.' },
            ].map(f => (
              <div
                className="group relative bg-gradient-to-br from-white to-[#FFFDF6]/90 rounded-[2rem] p-8 text-left shadow-sm hover:shadow-[0_20px_50px_rgba(200,134,10,0.12)] hover:-translate-y-2 transition-all duration-500 border border-gold/15 hover:border-gold/45 flex flex-col justify-between overflow-hidden"
                key={f.title}
              >
                {/* Glowing gold vertical indicator strip on left side */}
                <div className="absolute left-0 top-10 bottom-10 w-[3.5px] bg-gradient-to-b from-gold via-orange-500 to-gold-light rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Rotating dashed celestial rings in background */}
                <div className="absolute -top-14 -right-14 w-36 h-36 border border-dashed border-gold/10 rounded-full group-hover:scale-150 group-hover:rotate-90 group-hover:border-gold/25 transition-all duration-700 pointer-events-none" />
                <div className="absolute -top-10 -right-10 w-28 h-28 border border-dotted border-gold/10 rounded-full group-hover:scale-125 group-hover:-rotate-90 group-hover:border-gold/25 transition-all duration-700 pointer-events-none" />

                {/* Inner Corner Accents */}
                <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t border-l border-transparent group-hover:border-gold/30 transition-colors duration-500 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b border-r border-transparent group-hover:border-gold/30 transition-colors duration-500 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-start">
                  {/* Icon Wrapper with glowing background */}
                  <div className="relative w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/25 group-hover:bg-gradient-to-br group-hover:from-gold group-hover:to-gold-light group-hover:text-dark group-hover:scale-110 transition-all duration-500 shadow-sm shrink-0">
                    <div className="absolute inset-0 bg-gold/30 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <f.Icon className="w-7 h-7 relative z-10" />
                  </div>

                  <h3 className="font-sans font-black text-dark text-lg mb-3 mt-6 tracking-tight group-hover:text-gold transition-colors duration-300">
                    {f.title}
                  </h3>
                  <p className="text-gray-500 font-sans text-xs md:text-sm leading-relaxed font-semibold transition-colors duration-300 group-hover:text-gray-700">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      

      <ScrollReveal className="relative bg-gradient-to-r from-[#3D140E] via-[#6E1C12] to-[#1C0907] py-12 border-t border-b border-gold/20 overflow-hidden">
        {/* Dotted overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#D4A537 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Rotating background mandala */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] border border-gold/5 border-dashed rounded-full animate-[spin_90s_linear_infinite] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10 px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/35 flex items-center justify-center text-gold-light shadow-lg shrink-0">
              <svg className="w-7 h-7 text-gold-light animate-bounce" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm-2 2h4M5 10h14v10H5V10z" />
              </svg>
            </div>
            <div>
              <span className="text-gold text-xs font-bold tracking-[0.2em] uppercase block mb-1.5 font-sans">✦ Special Devotional Gift</span>
              <h3 className="font-sans font-black text-gold-light text-2xl md:text-3xl tracking-tight leading-tight">Limited Time Devotional Offer!</h3>
              <p className="text-white/80 font-sans text-xs md:text-sm mt-1.5 font-semibold">Free Sacred Engraving + Free Shipping across India on all orders</p>
            </div>
          </div>

          <Link
            to="/shop"
            className="relative px-8 py-4 rounded-full bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-dark font-black tracking-widest shadow-xl hover:shadow-[0_0_30px_rgba(212,165,55,0.5)] hover:-translate-y-1 transition-all duration-300 text-xs uppercase flex items-center gap-3 shrink-0 z-10 group cursor-pointer"
          >
            <ShoppingCart className="w-6 h-6 text-dark" />
            <span>ORDER NOW</span>
            <svg className="w-4 h-4 text-dark transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </ScrollReveal>

      {/* FAQ Accordion */}
      <ScrollReveal className="py-24 bg-gradient-to-b from-[#FFFBF2] to-[#FAF5E6] relative overflow-hidden" id="faq">
        {/* Decorative background elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-orange-500/5 rounded-full blur-[110px] pointer-events-none" />

        {/* Slow-Spinning Sacred Mandala Outline behind FAQ */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-dashed border-gold/5 rounded-full animate-[spin_100s_linear_infinite] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-gold text-xs font-bold tracking-[0.25em] uppercase block mb-3 font-sans">✦ Divine Clarifications</span>
            <h2 className="font-sans text-3xl md:text-5xl font-black text-dark tracking-tight">Frequently Asked Questions</h2>
            <p className="mt-4 text-gray-500 font-sans text-sm md:text-base max-w-md mx-auto leading-relaxed">
              Everything you need to know about authentic floating Ram Setu stones
            </p>
            <div className="w-20 h-[3px] bg-gradient-to-r from-gold to-orange-500 mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`group relative bg-white/95 backdrop-blur-md rounded-2xl border transition-all duration-500 overflow-hidden cursor-pointer ${isOpen
                    ? 'shadow-[0_15px_35px_rgba(200,134,10,0.12)] border-gold bg-[#FFFDF5]'
                    : 'border-gold/20 hover:border-gold/50 hover:shadow-md'
                    }`}
                  onClick={() => toggleFaq(i)}
                >
                  {/* Left Side Glow Strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold to-orange-500 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                  <h4 className="flex justify-between items-center gap-6 p-6 font-sans font-black text-dark text-sm sm:text-base md:text-lg text-left transition-colors duration-300">
                    <div className="flex gap-3.5 items-center">
                      <span className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] sm:text-xs font-black tracking-wider transition-all duration-300 shrink-0 ${isOpen
                        ? 'bg-gold text-dark shadow-sm shadow-gold/30'
                        : 'bg-gold/10 text-gold group-hover:bg-gold group-hover:text-dark'
                        }`}>
                        Q
                      </span>
                      <span className={`relative z-10 transition-colors duration-300 ${isOpen ? 'text-[#8A3305] font-black' : 'group-hover:text-orange-800'}`}>
                        {faq.q}
                      </span>
                    </div>

                    {/* Circle Toggle Button */}
                    <span className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen
                      ? 'bg-gold border-gold text-dark rotate-180 shadow-sm shadow-gold/25'
                      : 'border-gold/20 text-gold bg-gold/5 group-hover:bg-gold group-hover:text-dark group-hover:border-gold'
                      }`}>
                      <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </h4>

                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-6 pt-4 border-t border-gold/10 bg-gradient-to-br from-gold/5 via-transparent to-transparent">
                      <p className="text-xs sm:text-sm leading-relaxed font-semibold flex gap-2.5 items-start">
                        <span className="text-gold shrink-0 text-xs mt-1">✦</span>
                        <span className="text-[#5C4A3F] font-sans">{faq.a}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal className="relative bg-gradient-to-r from-[#120700] via-[#1A0C02] to-[#0A0400] py-16 border-t border-gold/15 overflow-hidden">
        {/* Pattern overlays */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C8860A 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Spinning Mandala outline in background */}
        <div className="absolute -right-32 -bottom-32 w-[400px] h-[400px] border border-gold/5 rounded-full animate-[spin_100s_linear_infinite] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10 w-full px-4 md:px-8">
          <div className="text-left max-w-lg">
            <span className="text-gold text-xs font-bold tracking-[0.25em] uppercase block mb-2 font-sans">✦ Spiritual Community</span>
            <h3 className="font-sans font-black text-gold-light text-2xl md:text-3xl mb-2.5 tracking-tight leading-tight">
              Stay Connected with Divine Updates
            </h3>
            <p className="text-white/60 font-sans text-xs md:text-sm font-medium leading-relaxed">
              Get spiritual stories, consecration updates &amp; exclusive devotional offers delivered directly to you.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto items-center justify-center">
            <form className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto" onSubmit={handleSubscribe}>
              <div className="relative w-full sm:w-72">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-full pl-5 pr-12 py-3.5 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 placeholder:text-white/40 text-sm font-sans transition-all duration-300"
                  required
                />
                {/* Mail Icon */}
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-dark font-black rounded-full px-8 py-3.5 transition-all duration-300 text-xs sm:text-sm font-sans uppercase tracking-wider hover:shadow-[0_0_20px_rgba(200,134,10,0.35)] hover:-translate-y-0.5 flex justify-center cursor-pointer"
              >
                Subscribe
              </button>
            </form>

            {/* WhatsApp Capsule */}
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/25 hover:border-green-500/40 rounded-full transition-all duration-300 text-xs font-bold w-full sm:w-auto"
            >
              <FaWhatsapp className="w-6 h-6 text-green-400 animate-pulse" />
              <span>Join WhatsApp Updates</span>
            </a>
          </div>
        </div>
      </ScrollReveal>
    </>
  )
}
