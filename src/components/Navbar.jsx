import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, signOut, isAdmin } = useAuth()
  const { cartCount } = useCart()

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
    <header className="site-header">
      {/* Announcement Bar */}
      <div className="ann-bar">
        <span>🙏 A Sacred Symbol of Faith from Ram Setu</span>
        <span>👥 1000+ Happy Devotees &nbsp;|&nbsp; 🚚 COD Available &nbsp;|&nbsp; 📍 Pan India Delivery</span>
      </div>

      {/* Navigation */}
      <nav>
        <Link to="/" className="logo">
          <div className="logo-icon">🪨</div>
          <div className="logo-text">
            <div className="brand">RamSetu</div>
            <div className="tagline">— Divine Stones —</div>
          </div>
        </Link>

        <ul className="nav-links">
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/shop">Shop</NavLink></li>
          <li><NavLink to="/gallery">Gallery</NavLink></li>
          <li><NavLink to="/about">About</NavLink></li>
          <li><NavLink to="/contact">Contact</NavLink></li>
        </ul>

        <div className="nav-actions">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>
                  Admin
                </Link>
              )}
              <Link to="/my-orders" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}>
                My Orders
              </Link>
              <Link to="/cart" style={{ fontSize: '1.2rem', cursor: 'pointer', position: 'relative', textDecoration: 'none' }}>
                🛒
                {cartCount > 0 && (
                  <sup className="cart-count" style={{ background: 'var(--gold)', color: '#fff', borderRadius: '50%', fontSize: '0.6rem', padding: '1px 4px', position: 'absolute', top: '-4px', right: '-6px' }}>
                    {cartCount}
                  </sup>
                )}
              </Link>
              <button onClick={signOut} style={{ background: 'none', border: 'none', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/cart" style={{ fontSize: '1.2rem', cursor: 'pointer', position: 'relative', textDecoration: 'none' }}>
                🛒
                {cartCount > 0 && (
                  <sup className="cart-count" style={{ background: 'var(--gold)', color: '#fff', borderRadius: '50%', fontSize: '0.6rem', padding: '1px 4px', position: 'absolute', top: '-4px', right: '-6px' }}>
                    {cartCount}
                  </sup>
                )}
              </Link>
              <Link to="/login" className="btn-login">Login / Register</Link>
            </>
          )}
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <span /><span /><span />
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} id="mobileMenu">
        <button className="mobile-menu-close" onClick={closeMenu}>✕</button>
        <NavLink to="/" onClick={closeMenu}>Home</NavLink>
        <NavLink to="/shop" onClick={closeMenu}>Shop</NavLink>
        <NavLink to="/gallery" onClick={closeMenu}>Gallery</NavLink>
        <NavLink to="/about" onClick={closeMenu}>About</NavLink>
        <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
        <NavLink to="/cart" onClick={closeMenu}>Cart ({cartCount})</NavLink>
        {user ? (
          <>
            <NavLink to="/my-orders" onClick={closeMenu}>My Orders</NavLink>
            <button
              onClick={() => { signOut(); closeMenu() }}
              style={{ background: 'none', border: 'none', fontFamily: 'Cinzel,serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--dark)', textAlign: 'left', cursor: 'pointer', borderBottom: '1px solid #eee', paddingBottom: 16 }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" onClick={closeMenu}>Login</NavLink>
            <NavLink to="/register" onClick={closeMenu}>Register</NavLink>
          </>
        )}
      </div>
    </header>
  )
}
