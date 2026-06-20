import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import ScrollReveal from '../components/ScrollReveal'

import { FaWhatsapp } from 'react-icons/fa'

// SVG Icons
const IconTemple = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)
const IconWater = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2" />
  </svg>
)

const IconGift = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm-2 2h4M5 10h14v10H5V10z" />
  </svg>
)
const IconTruck = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
  </svg>
)
const IconPray = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13M12 3c-1 2-3 5-3 8v3h3M12 3c1 2 3 5 3 8v3h-3M9 14v4a2 2 0 002 2h2a2 2 0 002-2v-4M5.5 13c0 2 1.5 4 3.5 4M18.5 13c0 2-1.5 4-3.5 4" />
  </svg>
)
const IconShield = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)
const IconStar = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)
const IconWhatsApp = () => (
  <FaWhatsapp className="w-5 h-5" />
)
const IconArrowRight = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-7l7 7-7 7" />
  </svg>
)
const IconDiya = () => (
  <svg className="w-8 h-8 text-gold animate-pulse" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2s-4 4.5-4 7.5c0 2.2 1.8 4 4 4s4-1.8 4-4c0-3-4-7.5-4-7.5zm5.5 13.5c-.7-.3-1.5-.5-2.3-.6.6.6.8 1.4.8 2.1 0 2.2-1.8 4-4 4s-4-1.8-4-4c0-.7.2-1.5.8-2.1-.8.1-1.6.3-2.3.6C3.9 16.4 2 18.5 2 21h20c0-2.5-1.9-4.6-4.5-5.5z" />
  </svg>
)

// Recurring water motif for transition
const WaveDivider = ({ className = '' }) => (
  <div className={className} aria-hidden="true">
    <svg className="absolute bottom-0 left-0 w-full h-full text-dark" viewBox="0 0 1440 100" preserveAspectRatio="none">
      <path d="M0 55 Q 240 8 480 55 T 960 55 T 1440 55 V100 H0 Z" fill="currentColor" />
    </svg>
    <svg className="absolute bottom-2 left-0 w-full h-full text-gold/40" viewBox="0 0 1440 100" preserveAspectRatio="none">
      <path d="M0 55 Q 240 8 480 55 T 960 55 T 1440 55" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  </div>
)

const stats = [
  { value: '1000+', label: 'Devotees Served', Icon: IconPray },
  { value: '100%', label: 'Authentic Stones', Icon: IconTemple },
  { value: '3–7', label: 'Days Delivery', Icon: IconTruck },
  { value: '5★', label: 'Customer Rating', Icon: IconStar },
]



const timeline = [
  { year: 'Ancient', title: 'The Legend Begins', desc: 'Lord Ram commands his army to build a bridge across the sea to Lanka, using stones that miraculously float on water.' },
  { year: 'Discovery', title: 'Sacred Stones Found', desc: 'Near Rameswaram, these sacred pumice-like stones are found along the shores of the mythical Ram Setu — still floating to this day.' },
  { year: 'Mission', title: 'Our Journey Starts', desc: 'Inspired by devotion, we began carefully collecting, verifying, and delivering these sacred stones to devotees across India.' },
  { year: 'Today', title: '1000+ Happy Devotees', desc: 'We have delivered sacred Ram Setu stones to over a thousand homes across India, spreading faith and divine blessings.' },
]

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Ram Setu – RamSetu Divine Stones</title>
        <meta name="description" content="Learn the sacred story of Ram Setu — the legendary bridge built by Lord Ram, and the divine floating stones we carefully collect from Rameswaram." />
      </Helmet>

      {/* Sanskrit Shloka Banner */}
      <div className="bg-[#120700] py-10 border-b border-gold/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-repeat" style={{ backgroundImage: 'radial-gradient(circle, #D4A537 1.2px, transparent 1.2px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center relative z-10">
          <div className="text-gold-light/60 text-[10px] md:text-xs tracking-[0.35em] uppercase mb-3 font-semibold font-sans">
            ✦ Mangala Charanam ✦
          </div>
          <p className="font-cinzel text-base sm:text-xl md:text-3xl text-gold-pale/95 font-black leading-relaxed tracking-wider animate-pulse select-none">
            “ रामाय रामभद्राय रामचन्द्राय वेधसे । <br /> रघुनाथाय नाथाय सीतायाः पतये नमः ॥ ”
          </p>
          <p className="text-white/40 text-xs md:text-sm font-sans mt-3.5 italic tracking-wide font-medium">
            "Salutations to Rama, the auspicious one, the lord of Raghus, and the beloved consort of Sita."
          </p>
        </div>
      </div>

      {/* Story Section */}
      <ScrollReveal className="pt-10 pb-24 md:py-28 bg-[#FAF6EE] relative overflow-hidden">
        {/* Subtle background graphics */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Image with Spiritual Aura */}
          <div className="relative group flex justify-center">
            {/* Sacred Halos behind image */}
            <div className="absolute w-[520px] h-[520px] rounded-full border border-gold/15 border-dashed animate-[spin_60s_linear_infinite] pointer-events-none hidden md:block" />
            <div className="absolute w-[480px] h-[480px] rounded-full border-2 border-gold/10 animate-[spin_40s_linear_infinite] pointer-events-none hidden md:block" />
            <div className="absolute -inset-4 bg-gradient-to-br from-gold/30 via-[#5c1a0e]/20 to-transparent rounded-[2.5rem] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-750" />

            {/* Temple Arch corner lines decoration */}
            <div className="absolute -top-3 -left-3 w-16 h-16 border-t-4 border-l-4 border-gold rounded-tl-3xl hidden md:block z-10" aria-hidden="true" />
            <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-4 border-r-4 border-gold rounded-br-3xl hidden md:block z-10" aria-hidden="true" />

            <div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-dark/20 border-2 border-gold/30 max-w-lg lg:max-w-full">
              <img
                src="/images/ram-setu-story.webp"
                alt="Ram Setu Story"
                className="w-full h-[320px] sm:h-[450px] md:h-[600px] object-cover group-hover:scale-[1.03] transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <span className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-dark/85 border border-gold/45 backdrop-blur-md text-gold-pale font-black text-xs uppercase tracking-widest rounded-full shadow-xl">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-ping" />
                  ✦ Sacred Ram Setu Stones
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <IconDiya />
              <span className="text-gold font-bold tracking-[0.25em] text-xs uppercase font-sans">Ancient Legend &amp; Miracle</span>
            </div>

            <h2 className="font-sans text-4xl md:text-5xl font-extrabold text-dark mb-8 leading-[1.15] tracking-tight">
              The Story of <br />
              <span className="relative inline-block text-gold mt-2">
                Ram Setu
                <svg className="absolute -bottom-3.5 left-0 w-full h-4 text-gold/80" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M 0,5 Q 50,8 100,5" stroke="currentColor" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h2>

            <div className="space-y-6 text-gray-700 font-sans font-semibold text-base md:text-lg leading-relaxed md:pr-4">
              <p>According to the epic Ramayana, Lord Ram and his Vanara army constructed a floating causeway across the ocean to Lanka to rescue Goddess Sita. These sacred stones are believed to be the living legacy of that monumental bridge of faith.</p>
              <p>While geological perspectives highlight their unique volcanic pumice formulation which lets them float effortlessly on water, devotees across the world revere this continuous phenomenon as an enduring divine miracle.</p>
              <p>Every single stone we offer is gathered from the sacred shores of Rameswaram, Tamil Nadu — the exact launching site of the legendary bridge. Each stone is carefully hand-selected, verified to float, and blessed at our local puja.</p>
            </div>

            <div className="mt-11 flex flex-wrap sm:flex-nowrap gap-3 md:gap-5">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 md:gap-3 px-4 py-3.5 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-dark font-black tracking-wider shadow-lg shadow-gold/25 hover:shadow-xl hover:shadow-gold/45 hover:-translate-y-1 transition-all duration-300 text-xs md:text-sm uppercase cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Shop Now</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                  <IconArrowRight />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Water transition into the journey */}
      <WaveDivider className="relative h-16 md:h-24 bg-[#FAF6EE] overflow-hidden" />

      {/* Stats Bar */}
      <div className="relative bg-gradient-to-b from-dark to-[#120700] border-b border-gold/15 py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="group relative flex flex-col justify-between h-full">
              {/* Ambient glow backing */}
              <div className="absolute -inset-1.5 bg-gradient-to-br from-gold/25 via-gold/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

              <div className="relative h-full w-full bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center gap-2 hover:border-gold/50 hover:-translate-y-2 transition-all duration-500 shadow-xl">
                {/* Gold decorative border top-left corner */}
                <div className="absolute top-3 left-3 w-4.5 h-4.5 border-t border-l border-transparent group-hover:border-gold/50 transition-colors duration-300" />
                <div className="absolute bottom-3 right-3 w-4.5 h-4.5 border-b border-r border-transparent group-hover:border-gold/50 transition-colors duration-300" />

                <div className="text-gold-light/80 mb-1 group-hover:text-gold-light transition-colors duration-300">
                  <s.Icon />
                </div>

                <span className="font-sans text-2xl md:text-4xl font-bold bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent tracking-tight group-hover:scale-105 transition-transform duration-300">
                  {s.value}
                </span>
                <span className="font-sans text-xs md:text-sm font-medium text-white/70 text-center leading-snug group-hover:text-white/95 transition-colors duration-300">
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline — "The Setu Path" */}
      <ScrollReveal className="py-28 bg-[#120700] relative overflow-hidden">
        {/* Sacred water waves lines */}
        <svg className="absolute left-0 right-0 top-1/2 -translate-y-1/2 w-full h-40 opacity-[0.04] hidden lg:block text-gold" viewBox="0 0 1400 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,60 Q175,10 350,60 T700,60 T1050,60 T1400,60" stroke="currentColor" strokeWidth="2.5" fill="none" />
        </svg>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="text-gold text-2xl tracking-[0.25em] block mb-3 font-sans font-bold" aria-hidden="true">✦ ✦ ✦</span>
            <h2 className="font-sans text-3xl md:text-5xl font-extrabold text-white tracking-tight">The Setu Path</h2>
            <p className="mt-4 text-white/55 font-sans max-w-lg mx-auto text-sm md:text-base leading-relaxed font-medium">
              Tracing the journey from ancient epic to a sacred offering in your home sanctuary.
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto mt-5 rounded-full" />
          </div>

          <div className="relative flex flex-col lg:flex-row lg:items-stretch gap-8 lg:gap-6 mt-12">
            {/* Visual connecting dashed line for desktop */}
            <div className="absolute top-0 left-12 right-12 h-[2px] border-t border-dashed border-gold/25 hidden lg:block" aria-hidden="true" />

            {/* Visual connecting dashed line for mobile/tablet */}
            <div className="absolute left-[45px] top-4 bottom-4 w-[2px] border-l border-dashed border-gold/25 lg:hidden" aria-hidden="true" />

            {timeline.map((item) => (
              <div className="flex-1 flex flex-col relative" key={item.year}>
                <div className="relative h-full bg-[#1C0F00]/50 backdrop-blur-md border border-white/10 hover:border-gold/50 rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2.5 hover:shadow-[0_20px_50px_rgba(200,134,10,0.18)] flex flex-col justify-between group">
                  <div className="absolute -top-3.5 left-8 w-7 h-7 rounded-full bg-gradient-to-r from-gold to-gold-light border-4 border-[#120700] group-hover:scale-115 group-hover:shadow-[0_0_20px_rgba(228,168,32,0.8)] transition-all duration-300 flex items-center justify-center shadow-[0_0_12px_rgba(200,134,10,0.3)]" />

                  <div>
                    <span className="inline-block px-3.5 py-1.5 bg-gold/10 text-gold-pale text-[11px] font-bold tracking-wider uppercase rounded-full mb-6 border border-gold/30">
                      {item.year}
                    </span>
                    <h3 className="font-sans font-semibold text-white text-lg mb-3 tracking-wide">{item.title}</h3>
                    <p className="text-white/60 font-sans text-[13.5px] leading-relaxed font-normal">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>



      {/* Mission Statement */}
      <ScrollReveal className="py-28 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-[1.5px] bg-gold" aria-hidden="true" />
              <span className="text-gold font-bold tracking-[0.25em] text-xs uppercase font-sans">Our Mission &amp; Purpose</span>
            </div>
            <h2 className="font-sans text-3xl md:text-5xl font-extrabold text-dark mb-7 leading-tight tracking-tight">
              Bringing Divine Blessings <br />
              <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">to Every Home Sanctuary</span>
            </h2>
            <div className="space-y-5 text-gray-700 font-sans font-semibold text-base md:text-lg leading-relaxed mb-10">
              <p>
                We are a fellowship of devotees called to build a connection between the sacred soil of Rameswaram and the homes of believers across Bharat. Our simple mission is to deliver authentic, floating Ram Setu stones to everyone seeking a physical symbol of faith and miracles.
              </p>
              <p>
                Every single stone undergoes strict authenticity checks to verify its buoyancy, followed by purification rituals and Vedic chanting before it leaves the sacred bounds of Rameswaram.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { Icon: IconShield, text: 'Authenticity guaranteed — every stone is verified to float before shipping', accent: 'gold' },
                { Icon: IconStar, text: 'Rated 5 stars by over a thousand devotees across India', accent: 'maroon' },
                { Icon: IconPray, text: 'Blessed with Vedic chants at our sacred local puja before dispatch', accent: 'gold' },
              ].map(item => (
                <div key={item.text} className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border shadow-sm ${item.accent === 'maroon'
                      ? 'bg-[#5c1a0e]/10 border-[#5c1a0e]/25 text-[#8b3a1f]'
                      : 'bg-gold/10 border-gold/25 text-gold-light'
                      }`}
                  >
                    <item.Icon />
                  </div>
                  <p className="text-gray-500 font-sans font-semibold text-sm leading-relaxed mt-1 group-hover:text-gray-700 transition-colors duration-300">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quote Card */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-br from-gold/30 via-[#5c1a0e]/15 to-transparent rounded-[2.5rem] blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
            <div className="relative bg-gradient-to-br from-[#1c0f00] via-[#2a1500] to-[#120700] rounded-[2.5rem] p-6 sm:p-10 md:p-14 text-center border-2 border-gold/25 hover:border-gold/50 shadow-2xl transition-all duration-500 hover:-translate-y-1.5 overflow-hidden">
              {/* Concentric counter-rotating background mandala rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-gold/5 border-dashed animate-[spin_60s_linear_infinite]" aria-hidden="true" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-gold/10 border-dotted animate-[spin_40s_linear_reverse_infinite]" aria-hidden="true" />

              {/* Corner decor arches */}
              <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-gold/30 group-hover:border-gold/60 rounded-tl-xl transition-colors duration-300" aria-hidden="true" />
              <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-gold/30 group-hover:border-gold/60 rounded-br-xl transition-colors duration-300" aria-hidden="true" />

              <span className="text-gold-pale/20 font-sans text-8xl block mb-4 select-none group-hover:scale-105 group-hover:text-gold-light/35 transition-all duration-500 leading-none" aria-hidden="true">“</span>
              <blockquote className="font-sans text-xl md:text-2xl font-bold text-white leading-relaxed -mt-8 tracking-wide relative z-10 transition-all duration-500 group-hover:text-white/95">
                These are not mere stones.<br />
                They are <span className="text-gold-light bg-gradient-to-r from-gold-light to-gold-pale bg-clip-text text-transparent group-hover:from-gold-light group-hover:to-white transition-all duration-500">sacred fragments of Ram's legacy</span> — a timeless bridge of absolute faith and devotion.
              </blockquote>
              <div className="mt-11 flex items-center justify-center gap-3.5 relative z-10">
                <div className="w-12 h-12 rounded-full bg-gold/15 border-2 border-gold/35 flex items-center justify-center shadow-lg relative group-hover:scale-105 group-hover:border-gold/60 transition-all duration-300">
                  {/* Pulsing visual halo */}
                  <div className="absolute -inset-1 rounded-full border border-gold/30 animate-ping opacity-75 pointer-events-none" />

                  <svg className="w-5.5 h-5.5 text-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2s-8 6-8 10.5a8 8 0 0016 0c0-4.5-8-10.5-8-10.5zm0 13c-1.38 0-2.5-1.12-2.5-2.5S10.62 10 12 10s2.5 1.12 2.5 2.5S13.38 15 12 15z" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="text-white font-bold text-sm block tracking-wider font-sans">RamSetu Divine Stones</span>
                  <span className="text-white/40 text-xs font-semibold font-sans">Ayodhya, Uttar Pradesh, India</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* CTA Banner */}
      <div className="relative bg-gradient-to-r from-[#3a140f] via-[#5c1a0e] to-[#120700] py-12 border-t border-gold/25 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #D4A537 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          aria-hidden="true"
        />
        {/* Rotating celestial background ring */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] border border-gold/10 border-dashed rounded-full animate-[spin_100s_linear_infinite] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10 px-4 md:px-8">
          <div className="text-left max-w-2xl">
            <h3 className="font-sans font-extrabold text-gold-light text-2xl md:text-4xl mb-3 tracking-tight leading-tight">Own a Piece of Divine History</h3>
            <p className="text-white/80 font-sans font-semibold text-sm md:text-base leading-relaxed">
              Invite the blessing of Lord Ram into your home. Authentic Rameswaram stones with free devotional custom engraving &amp; pan-India delivery. Cash on delivery available.
            </p>
          </div>
          <div className="relative flex flex-wrap sm:flex-nowrap gap-3 md:gap-5 shrink-0 z-10">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 md:gap-3 px-4 py-3.5 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold hover:from-gold-light hover:to-gold text-dark font-black tracking-widest shadow-xl shadow-black/35 hover:shadow-gold/45 hover:-translate-y-1 transition-all duration-300 text-xs md:text-sm whitespace-nowrap uppercase shrink-0"
            >
              Shop Now
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                <IconArrowRight />
              </span>
            </Link>
            <a
              href="https://wa.me/919876543210?text=I want to know more about Ram Setu stones"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-4 py-3.5 md:px-8 md:py-4 rounded-full border-2 border-white/20 text-white font-black hover:border-gold hover:bg-gold/10 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-xs md:text-sm whitespace-nowrap flex items-center gap-2 md:gap-2.5 tracking-wider uppercase shrink-0"
            >
              <span className="group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                <IconWhatsApp />
              </span>
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}