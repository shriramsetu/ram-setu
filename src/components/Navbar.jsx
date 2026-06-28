import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { X, User, LogOut, ShoppingBag } from 'lucide-react'
import { supabase } from '../lib/supabase'

// Navigation SVG Icons
const IconLotus = ({ className = "w-6 h-6 text-gold" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2s-8 6-8 10.5a8 8 0 0016 0c0-4.5-8-10.5-8-10.5zm0 13c-1.38 0-2.5-1.12-2.5-2.5S10.62 10 12 10s2.5 1.12 2.5 2.5S13.38 15 12 15z" />
  </svg>
)

const IconCart = ({ className = "w-5 h-5" }) => (
  <svg className={`${className} text-dark group-hover:text-gold transition-colors duration-300`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const IconLotusSmall = () => <IconLotus className="w-3.5 h-3.5 text-gold-pale" />

const IconUsersSmall = () => (
  <svg className="w-3.5 h-3.5 text-gold-pale" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const IconTruckSmall = () => (
  <svg className="w-3.5 h-3.5 text-gold-pale" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1m-6 0a2 2 0 11-4 0" />
  </svg>
)

const IconMapPinSmall = () => (
  <svg className="w-3.5 h-3.5 text-gold-pale" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

export default function Navbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [logoUrl, setLogoUrl] = useState('/images/logo/logo.png')
  const { user, signOut, isAdmin } = useAuth()
  const { cartCount } = useCart()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    supabase.from('site_media').select('url').eq('media_key', 'site_logo').single()
      .then(({ data }) => {
        if (data && data.url && data.url.trim() !== '') {
          setLogoUrl(data.url)
          // Dynamically update favicon in browser tab
          const link = document.querySelector("link[rel*='icon']")
          if (link) {
            link.href = data.url
          }
        }
      })
  }, [])

  function toggleMenu() {
    setMenuOpen(o => {
      document.body.style.overflow = !o ? 'hidden' : ''
      return !o
    })
  }

  function closeMenu() {
    setMenuOpen(false)
    document.body.style.overflow = ''
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 w-full transition-all duration-300 ${menuOpen ? 'z-[9999]' : 'z-50'}`}>
        {/* Announcement Bar */}
        <div className={`bg-[#0b0b0c] text-gold-pale px-4 md:px-8 text-center text-[10px] md:text-xs font-bold tracking-widest flex justify-between items-center flex-wrap gap-2 border-b border-gold/15 py-2 transition-all duration-300 ${isScrolled ? 'opacity-95' : ''}`}>
          <span className="flex items-center gap-1.5 mx-auto md:mx-0 font-sans uppercase">
            <IconLotusSmall /> Consecrated Artifacts from Rameswaram Dham
          </span>
          <span className="hidden md:flex items-center gap-5 font-sans uppercase">
            <span className="flex items-center gap-1.5"><IconUsersSmall /> 1000+ Devotees</span>
            <span className="w-1 h-1 rounded-full bg-gold/30" />
            <span className="flex items-center gap-1.5"><IconTruckSmall /> COD Available</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className={`px-4 md:px-8 flex items-center justify-between transition-all duration-300 font-sans h-16 ${isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gold/20 shadow-[0_10px_35px_rgba(212,165,55,0.06)]' : 'bg-white/98 backdrop-blur-sm border-b border-gold/10 shadow-sm'}`}>
          <Link to="/" className="flex items-center group ml-10 md:ml-24" onClick={closeMenu}>
            <img src={logoUrl} alt="RamSetu Logo" className="h-12 md:h-14 w-auto object-contain group-hover:scale-[1.03] transition-all duration-500" />
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest">
            {[
              { to: "/", label: "Home", end: true },
              { to: "/about", label: "About Ram Setu" },
              { to: "/shop", label: "Shop" },
              { to: "/gallery", label: "Gallery" },
              { to: "/contact", label: "Contact" }
            ].map((item) => (
              <li key={item.to}>
                {item.isAnchor ? (
                  <a href={item.to} className="relative py-2 text-dark hover:text-gold transition-colors duration-300 group">
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-gold to-gold-light transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                  </a>
                ) : (
                  <NavLink to={item.to} end={item.end} className={({ isActive }) => `relative py-2 transition-colors duration-300 group ${isActive ? 'text-gold' : 'text-dark hover:text-gold'}`}>
                    {({ isActive }) => (
                      <>
                        {item.label}
                        <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-gold to-gold-light transform origin-left transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                      </>
                    )}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="px-4 py-2 rounded-xl bg-gold hover:bg-dark text-dark hover:text-gold border border-gold/25 font-black text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm">
                    Admin Panel
                  </Link>
                )}
                <Link to="/my-orders" className="px-4 py-2 rounded-xl border border-gold/20 hover:border-gold/40 bg-gold/5 hover:bg-gold/10 text-dark font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-sm">
                  <ShoppingBag className="w-3.5 h-3.5 text-gold" />
                  <span>My Orders</span>
                </Link>
                <Link to="/cart" className="relative group p-2.5 rounded-xl hover:bg-gold/10 transition-all duration-300">
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    <IconCart />
                  </div>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-gold to-gold-light text-dark font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button onClick={handleLogout} className="text-xs font-black uppercase tracking-wider text-red-600 hover:text-red-700 transition-all duration-300 cursor-pointer bg-transparent border-none flex items-center gap-1.5 hover:scale-105 active:scale-95">
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/cart" className="relative group p-2.5 rounded-xl hover:bg-gold/10 transition-all duration-300">
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    <IconCart />
                  </div>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-gold to-gold-light text-dark font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/login" className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-dark font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
                  Login / Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Controls Group (Cart & Hamburger) */}
          <div className="flex md:hidden items-center gap-2 mr-1">
            <Link to="/cart" className="p-2 rounded-lg text-dark transition-colors hover:bg-gold/10 flex items-center justify-center">
              <div className="relative">
                <IconCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-gold to-gold-light text-dark font-black text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-md">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            <button className="flex flex-col gap-1.5 p-2 bg-transparent border-none cursor-pointer group" onClick={toggleMenu} aria-label="Toggle Menu">
              <span className={`w-6 h-0.5 bg-dark transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2 bg-gold' : 'group-hover:bg-gold'}`} />
              <span className={`w-6 h-0.5 bg-dark transition-opacity duration-300 ${menuOpen ? 'opacity-0' : 'group-hover:bg-gold'}`} />
              <span className={`w-6 h-0.5 bg-dark transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2 bg-gold' : 'group-hover:bg-gold'}`} />
            </button>
          </div>
        </nav>

        {/* Mobile Drawer Menu Overlay */}
        <div className={`fixed inset-0 z-[1099] bg-dark/60 backdrop-blur-md transition-opacity duration-300 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={closeMenu} />

        {/* Mobile Drawer Menu */}
        <div className={`fixed top-0 right-0 bottom-0 z-[1100] w-80 max-w-[85vw] bg-gradient-to-b from-white via-[#FFFBF4] to-white border-l border-gold/20 shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col p-6 sm:p-8 gap-6 md:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'} overflow-hidden`}>
          {/* Glow orbs inside the mobile menu */}
          <div className="absolute top-1/4 -right-16 w-48 h-48 bg-gold/10 rounded-full blur-[65px] pointer-events-none" />
          <div className="absolute bottom-1/4 -left-16 w-48 h-48 bg-gold/5 rounded-full blur-[65px] pointer-events-none" />

          <div className="flex flex-col gap-3 relative z-10 shrink-0">
            <div className="flex justify-between items-center pb-4 border-b border-gold/15 font-sans">
              <Link to="/" className="flex items-center" onClick={closeMenu}>
                <img src={logoUrl} alt="RamSetu Logo" className="h-9 w-auto object-contain" />
              </Link>
              <button className="p-2 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold hover:text-dark transition-all duration-300 border-none cursor-pointer flex items-center justify-center" onClick={closeMenu}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Logged in devotee profile tag (if user is authenticated) */}
            {user && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-cream2/60 rounded-xl border border-gold/15 font-sans shrink-0 mx-0.5">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-[8px] text-gray-400 uppercase tracking-wider font-bold">Logged In</p>
                  <p className="text-xs text-dark/95 font-bold truncate max-w-[170px]">{user.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable links */}
          <div className="flex flex-col gap-2 overflow-y-auto flex-grow pr-1 font-sans relative z-10">
            {[
              { to: "/", label: "Home", end: true },
              { to: "/about", label: "About Ram Setu" },
              { to: "/shop", label: "Shop" },
              { to: "/gallery", label: "Gallery" },
              { to: "/contact", label: "Contact" }
            ].map((item) => (
              item.isAnchor ? (
                <a
                  key={item.to}
                  href={item.to}
                  onClick={closeMenu}
                  className="flex items-center justify-between text-xs font-black py-3.5 px-4 rounded-xl border border-transparent text-dark/80 hover:text-gold hover:bg-gold/5 hover:border-gold/10 transition-all duration-300 uppercase tracking-widest"
                >
                  <span>{item.label}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/30" />
                </a>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeMenu}
                  className={({ isActive }) => `flex items-center justify-between text-xs font-black py-3.5 px-4 rounded-xl border transition-all duration-300 uppercase tracking-widest ${isActive ? 'text-gold bg-gold/10 border-gold/20' : 'text-dark/80 hover:text-gold hover:bg-gold/5 border-transparent'}`}
                >
                  <span>{item.label}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/30" />
                </NavLink>
              )
            ))}
          </div>

          {/* Footer Area inside Menu */}
          <div className="mt-auto pt-6 border-t border-gold/15 relative z-10 flex flex-col gap-3">
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="w-full py-3 rounded-xl bg-gold hover:bg-dark text-dark hover:text-gold border border-gold/25 text-center font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-sm"
                  >
                    Admin Panel
                  </Link>
                )}

                <div className="flex gap-3 w-full">
                  <Link
                    to="/my-orders"
                    onClick={closeMenu}
                    className="flex-1 py-3 rounded-xl border border-gold/20 bg-gold/5 hover:bg-gold/10 text-dark font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 truncate"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-gold" />
                    <span>My Orders</span>
                  </Link>

                  <Link
                    to="/cart"
                    onClick={closeMenu}
                    className="flex-1 py-3 rounded-xl border border-gold/20 bg-transparent text-dark hover:bg-gold/5 text-center font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 truncate"
                  >
                    <IconCart />
                    <span>Cart ({cartCount})</span>
                  </Link>
                </div>

                <button
                  onClick={() => { handleLogout(); closeMenu() }}
                  className="w-full py-3 rounded-xl bg-red-50 hover:bg-red-100/80 text-red-600 hover:text-red-700 text-center font-bold text-xs uppercase tracking-widest border border-red-200/50 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/cart"
                  onClick={closeMenu}
                  className="w-full py-3 rounded-xl border border-gold/20 bg-transparent text-dark hover:bg-gold/5 text-center font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 mb-1"
                >
                  <IconCart />
                  <span>Cart ({cartCount})</span>
                </Link>

                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="w-full py-3.5 rounded-xl bg-gold hover:bg-dark text-dark hover:text-gold border border-gold/30 text-center font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-gold/15"
                >
                  Login / Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="h-[95px] md:h-[96px] w-full shrink-0" />
    </>
  )
}
