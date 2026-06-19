import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Phone, Mail, MessageCircle, MapPin, Clock, Send, ArrowRight } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

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

      <div className="relative min-h-screen bg-cream2 py-10 sm:py-16 overflow-hidden text-left font-sans">
        {/* Ambient background atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream2 via-[#FBF7EE] to-cream2 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #B8893A 1px, transparent 1px)', backgroundSize: '26px 26px' }}
          aria-hidden="true"
        />

        {/* Glowing orbs for depth */}
        <div className="absolute -top-24 -left-24 w-64 h-64 sm:w-96 sm:h-96 bg-gold/10 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 sm:w-96 sm:h-96 bg-gold/10 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />

        {/* Top Header Section directly written */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase mb-3.5">
            ✦ Get in Touch ✦
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-dark mb-2">
            Contact Us
          </h1>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Link to="/" className="hover:text-gold transition-colors focus-visible:outline-none rounded">Home</Link>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-gold/70">Contact Us</span>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left: Message Form */}
            <div className="lg:col-span-7 relative bg-white rounded-[1.75rem] sm:rounded-[2rem] border border-gold/20 p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_-20px_rgba(184,137,58,0.15)] flex flex-col justify-between">
              {/* Corner accents */}
              <div className="absolute top-5 left-5 w-4 h-4 border-t border-l border-gold/40 rounded-tl pointer-events-none" />
              <div className="absolute bottom-5 right-5 w-4 h-4 border-b border-r border-gold/40 rounded-br pointer-events-none" />

              <div>
                <div className="flex items-center gap-3.5 border-b border-gold/10 pb-5 mb-8">
                  <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-dark text-lg uppercase tracking-wider">
                      Send a Message
                    </h2>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">We typically reply within 2 hours</p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-sans pl-1">Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Full name"
                        className="w-full h-11 sm:h-12 px-4 rounded-xl border border-gold/20 bg-cream2/40 text-dark placeholder:text-gray-300 text-sm font-sans outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 focus:bg-white transition-all duration-300 shadow-inner"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-sans pl-1">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="w-full h-11 sm:h-12 px-4 rounded-xl border border-gold/20 bg-cream2/40 text-dark placeholder:text-gray-300 text-sm font-sans outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 focus:bg-white transition-all duration-300 shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-sans pl-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full h-11 sm:h-12 px-4 rounded-xl border border-gold/20 bg-cream2/40 text-dark placeholder:text-gray-300 text-sm font-sans outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 focus:bg-white transition-all duration-300 shadow-inner"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-sans pl-1">Subject *</label>
                      <input
                        type="text"
                        name="subject"
                        required
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        className="w-full h-11 sm:h-12 px-4 rounded-xl border border-gold/20 bg-cream2/40 text-dark placeholder:text-gray-300 text-sm font-sans outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 focus:bg-white transition-all duration-300 shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-sans pl-1">Message *</label>
                    <textarea
                      name="message"
                      required
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Type your message here..."
                      rows={4}
                      className="w-full p-4 rounded-xl border border-gold/20 bg-cream2/40 text-dark placeholder:text-gray-300 text-sm font-sans outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 focus:bg-white transition-all duration-300 shadow-inner resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group px-8 py-3.5 bg-gold hover:bg-dark text-dark hover:text-gold border border-gold/30 rounded-xl font-bold text-xs uppercase tracking-widest shadow-[0_8px_24px_-8px_rgba(200,134,10,0.3)] hover:shadow-[0_10px_32px_-6px_rgba(200,134,10,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 mt-1 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" /> 
                    {loading ? 'Sending Request...' : 'Send Inquiry'}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Contact Information */}
            <div className="lg:col-span-5 relative bg-white rounded-[1.75rem] sm:rounded-[2rem] border border-gold/20 p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_-20px_rgba(184,137,58,0.15)] text-dark flex flex-col justify-between overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-5 left-5 w-4 h-4 border-t border-l border-gold/40 rounded-tl pointer-events-none" />
              <div className="absolute bottom-5 right-5 w-4 h-4 border-b border-r border-gold/40 rounded-br pointer-events-none" />

              <div>
                <div className="flex items-center gap-3.5 border-b border-gold/10 pb-5 mb-8">
                  <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-dark text-lg uppercase tracking-wider">
                      Contact Details
                    </h2>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Direct channels</p>
                  </div>
                </div>
                
                <p className="text-gray-500 text-xs md:text-sm mb-8 leading-relaxed">
                  We welcome devotees, collectors, and seekers. Connect with us directly via phone, email, or visit our Ayodhya office.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: Phone, label: 'Call Support', value: '+91 98765 43210' },
                    { icon: Mail, label: 'Email Address', value: 'info@ramsetudivinestones.com' },
                    { icon: MapPin, label: 'Main Office', value: 'Ayodhya Dham, Uttar Pradesh, India' },
                    { icon: Clock, label: 'Service Hours', value: 'Mon – Sat: 9:00 AM – 7:00 PM' },
                  ].map((c, idx) => (
                    <div key={idx} className="flex gap-4 items-center group/item">
                      <div className="p-3 bg-cream2 text-gold rounded-xl border border-gold/15 shrink-0 group-hover/item:bg-gold group-hover/item:text-dark transition-all duration-300">
                        <c.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[9px] text-gold font-bold uppercase tracking-widest mb-0.5">{c.label}</div>
                        <div className="text-dark text-xs md:text-sm font-extrabold">{c.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-gold/10 mt-10">
                <a
                  href="https://wa.me/919876543210?text=Hello! I have a query about Ram Setu Divine Stones."
                  className="inline-flex w-full sm:w-auto px-8 py-4 rounded-xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 items-center justify-center gap-2 cursor-pointer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp className="w-5 h-5 text-white" /> Chat on WhatsApp
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
