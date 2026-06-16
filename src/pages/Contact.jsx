import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    toast.success("Message sent! We'll respond within 24 hours. 🙏")
    setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    setLoading(false)
  }

  return (
    <>
      <Helmet>
        <title>Contact Us – RamSetu Divine Stones</title>
        <meta name="description" content="Get in touch with RamSetu Divine Stones. We're here to help with your sacred purchase — call, WhatsApp, or send us a message." />
      </Helmet>

      <div className="page-header" style={{ background: 'var(--dark)', padding: '60px 20px', textAlign: 'center', borderBottom: '2px solid var(--gold)' }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 8 }}>Contact Us</h1>
        <div className="breadcrumb" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Home / Contact</div>
      </div>

      <div className="contact-page">
        <div className="contact-form-card">
          <h2>Send us a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Name *</label>
              <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="form-group">
              <label>Subject *</label>
              <input type="text" name="subject" required value={form.subject} onChange={handleChange} placeholder="How can we help?" />
            </div>
            <div className="form-group">
              <label>Message *</label>
              <textarea name="message" required value={form.message} onChange={handleChange} placeholder="Your message…" rows={5} />
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="contact-info-card">
          <h2>Get in Touch</h2>
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.7 }}>
              We're here to help you with your sacred purchase. Reach out to us anytime.
            </p>
          </div>
          {[
            { icon: '📞', label: 'Phone', value: '+91 98765 43210' },
            { icon: '✉️', label: 'Email', value: 'info@ramsetudivinestones.com' },
            { icon: '💬', label: 'WhatsApp', value: '+91 98765 43210' },
            { icon: '📍', label: 'Address', value: 'Ayodhya, Uttar Pradesh, India' },
            { icon: '🕐', label: 'Hours', value: 'Mon–Sat: 9:00 AM – 7:00 PM' },
          ].map(c => (
            <div key={c.label} style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{c.icon}</span>
              <div>
                <div style={{ color: 'var(--gold-pale)', fontWeight: 700, fontSize: '0.8rem', marginBottom: 2 }}>{c.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>{c.value}</div>
              </div>
            </div>
          ))}
          <a
            href="https://wa.me/919876543210?text=Hello! I have a query about Ram Setu Divine Stones."
            className="btn-primary"
            style={{ display: 'inline-block', marginTop: 16 }}
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>
    </>
  )
}
