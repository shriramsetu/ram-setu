import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <>
      <footer id="contact">
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, background: 'radial-gradient(var(--gold-light),var(--dark))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                🪨
              </div>
              <div>
                <div className="brand-name">RamSetu</div>
                <div style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>— Divine Stones —</div>
              </div>
            </div>
            <p>A sacred symbol of faith from the legendary Ram Setu. Bringing divine energy into every home.</p>
            <div className="footer-social-icons">
              <a href="#">📘</a>
              <a href="#">📷</a>
              <a href="#">▶</a>
              <a href="https://wa.me/919876543210">💬</a>
            </div>
          </div>

          <div>
            <h5>Quick Links</h5>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h5>Customer Care</h5>
            <ul>
              <li><Link to="/my-orders">My Orders</Link></li>
              <li><Link to="/cart">My Cart</Link></li>
              <li><Link to="/login">Login / Register</Link></li>
              <li><a href="/#faq">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h5>Contact Us</h5>
            <div className="contact-item"><span>📞</span><span>+91 98765 43210</span></div>
            <div className="contact-item"><span>✉️</span><span>info@ramsetudivinestones.com</span></div>
            <div className="contact-item"><span>📍</span><span>Ayodhya, Uttar Pradesh, India</span></div>
            <div className="contact-item"><span>🕐</span><span>Mon–Sat: 9:00 AM – 7:00 PM</span></div>
          </div>

          <div>
            <h5>We Accept</h5>
            <div className="payments">
              <span className="pay-badge">VISA</span>
              <span className="pay-badge">MC</span>
              <span className="pay-badge">UPI</span>
              <span className="pay-badge">PayTM</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="contact-item"><span>📦</span><span style={{ fontSize: '0.78rem' }}>COD Available</span></div>
              <div className="contact-item"><span>↩️</span><span style={{ fontSize: '0.78rem' }}>Easy Returns</span></div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2024 RamSetu Divine Stones. All Rights Reserved.</span>
          <span>Note: Sold as a spiritual and devotional collectible.</span>
        </div>
      </footer>

      {/* Floating Buttons */}
      <div className="float-buttons">
        <a href="tel:+919876543210" className="float-call" title="Call Us">📞</a>
        <a href="https://wa.me/919876543210" className="float-wa" title="Chat on WhatsApp">💬</a>
      </div>
    </>
  )
}
