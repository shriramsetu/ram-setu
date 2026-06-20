import { Link } from 'react-router-dom'
import {
  Facebook,
  Instagram,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Clock,
  Package,
  RefreshCw,
  ChevronRight,
  CreditCard,
  QrCode,
  Wallet,
  MessageCircle
} from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

// Keeping custom Lotus icon specifically for brand identity matching Navbar.jsx
const IconLotus = ({ className = "w-6 h-6 text-gold" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2s-8 6-8 10.5a8 8 0 0016 0c0-4.5-8-10.5-8-10.5zm0 13c-1.38 0-2.5-1.12-2.5-2.5S10.62 10 12 10s2.5 1.12 2.5 2.5S13.38 15 12 15z" />
  </svg>
)

export default function Footer() {
  return (
    <>
      <footer id="contact" className="relative bg-[#0b0b0c] text-cream border-t border-gold/15 pt-24 pb-12 overflow-hidden font-sans">
        {/* Absolute glow elements for deep premium feeling */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-gold/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[450px] h-[250px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

            {/* Col 1: Brand (Span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-6 pr-0 lg:pr-8">
              <div className="flex items-center">
                <img src="/images/logo/logo.png" alt="RamSetu Logo" className="h-12 md:h-14 w-auto object-contain" />
              </div>
              <p className="text-xs md:text-sm text-cream/70 leading-relaxed max-w-sm font-sans">
                Authentic sacred symbols of faith sourced directly from Rameswaram, hand-consecrated and guaranteed to float naturally on water. Invite divine protection and prosperity.
              </p>

              {/* Social links */}
              <div className="flex items-center gap-3 mt-2">
                {[
                  { icon: Facebook, label: 'Facebook', href: '#' },
                  { icon: Instagram, label: 'Instagram', href: '#' },
                  { icon: Youtube, label: 'YouTube', href: '#' },
                  { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/919876543210' },
                ].map((s, idx) => (
                  <a
                    key={idx}
                    href={s.href}
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="w-9 h-9 rounded-xl border border-gold/15 bg-white/5 flex items-center justify-center text-gold-pale hover:text-dark hover:bg-gold hover:border-gold transition-all duration-300 hover:-translate-y-0.5"
                    aria-label={s.label}
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Quick Links (Span 2) */}
            <div className="lg:col-span-2">
              <h5 className="font-sans text-xs font-black text-white tracking-widest uppercase mb-6 pb-2 border-b border-gold/15 inline-block">
                Navigation
              </h5>
              <ul className="flex flex-col gap-3.5 text-xs md:text-sm">
                {[
                  { to: '/', name: 'Home' },
                  { to: '/shop', name: 'Shop Stones' },
                  { to: '/gallery', name: 'Miracle Gallery' },
                  { to: '/about', name: 'Our Legend' },
                  { to: '/contact', name: 'Contact' },
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.to} className="group flex items-center gap-1.5 text-cream/70 hover:text-gold-pale transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-gold opacity-0 -ml-1.5 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Customer Care (Span 2) */}
            <div className="lg:col-span-2">
              <h5 className="font-sans text-xs font-black text-white tracking-widest uppercase mb-6 pb-2 border-b border-gold/15 inline-block">
                Support
              </h5>
              <ul className="flex flex-col gap-3.5 text-xs md:text-sm">
                {[
                  { to: '/my-orders', name: 'Track Order' },
                  { to: '/cart', name: 'My Cart' },
                  { to: '/login', name: 'Devotee Login' },
                  { to: '/#faq', name: 'Help & FAQs' },
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.to} className="group flex items-center gap-1.5 text-cream/70 hover:text-gold-pale transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-gold opacity-0 -ml-1.5 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Contact Us (Span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div>
                <h5 className="font-sans text-xs font-black text-white tracking-widest uppercase mb-6 pb-2 border-b border-gold/15 inline-block">
                  Sacred Contact
                </h5>
                <ul className="flex flex-col gap-4 text-xs md:text-sm">
                  <li className="flex items-start gap-3 group">
                    <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/15 group-hover:bg-gold group-hover:text-dark transition-colors duration-300">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-cream/80 hover:text-white transition-colors pt-0.5 font-bold">+91 98765 43210</span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/15 group-hover:bg-gold group-hover:text-dark transition-colors duration-300">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-cream/80 hover:text-white transition-colors pt-0.5 break-all font-bold">info@ramsetudivinestones.com</span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/15 group-hover:bg-gold group-hover:text-dark transition-colors duration-300">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-cream/80 hover:text-white transition-colors pt-0.5">Ayodhya Dham, UP, India</span>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <div className="p-1.5 rounded-lg bg-gold/10 text-gold border border-gold/15 group-hover:bg-gold group-hover:text-dark transition-colors duration-300">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-cream/70 pt-0.5">Mon–Sat: 9:00 AM – 7:00 PM</span>
                  </li>
                </ul>
              </div>

              {/* Security and checkout assurance badges */}
              <div className="pt-4 border-t border-gold/10">
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { icon: CreditCard, text: 'VISA' },
                    { icon: CreditCard, text: 'MC' },
                    { icon: QrCode, text: 'UPI' },
                    { icon: Wallet, text: 'PAYTM' }
                  ].map((pay, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-black text-gold-pale border border-gold/15 rounded-lg bg-white/5 uppercase hover:bg-gold/5 transition-colors">
                      <pay.icon className="w-3 h-3" />
                      <span>{pay.text}</span>
                    </span>
                  ))}
                </div>
                <div className="flex gap-4 text-[10px] text-cream/70">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-gold" />
                    COD Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-gold" />
                    7-Day Returns
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gold/15 to-transparent mb-8" />

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs text-cream/50 text-center md:text-left">
            <span>© 2026 RamSetu Divine Stones. All Rights Reserved.</span>
            <span className="text-gold-pale/35 italic">Note: Handcrafted and consecrated purely for devotional and spiritual settings.</span>
          </div>
        </div>
      </footer>

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
        {/* Call Button */}
        <a 
          href="tel:+919876543210" 
          className="relative w-9 h-9 sm:w-[52px] sm:h-[52px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-dark flex items-center justify-center shadow-lg hover:shadow-[0_0_20px_rgba(212,165,55,0.4)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer border border-gold/25" 
          title="Call Us"
        >
          <Phone className="w-4 h-4 sm:w-6 sm:h-6 text-dark group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
        </a>

        {/* WhatsApp Button */}
        <a 
          href="https://wa.me/919876543210" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="relative w-9 h-9 sm:w-[52px] sm:h-[52px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1ebd54] text-white flex items-center justify-center shadow-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer border border-green-500/30" 
          title="Chat on WhatsApp"
        >
          <FaWhatsapp className="w-5 h-5 sm:w-7 sm:h-7 text-white group-hover:scale-115 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
        </a>
      </div>
    </>
  )
}
