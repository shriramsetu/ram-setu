import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Trash2, ShoppingCart, ArrowRight, ArrowLeft, ShieldCheck, Truck, RefreshCw, ShoppingBag } from 'lucide-react'

export default function Cart() {
  const { items, removeFromCart, updateQty, cartTotal } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  function handleCheckout() {
    if (!user) { navigate('/login', { state: { from: '/checkout' } }); return }
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <>
        <Helmet><title>Your Cart – RamSetu Divine Stones</title></Helmet>
        <div className="bg-cream2 min-h-screen py-20 flex flex-col items-center justify-center px-4 font-sans text-center relative overflow-hidden">
          {/* Dotted grid overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle, #D4A537 1px, transparent 1px)', backgroundSize: '30px 30px' }}
          />
          
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-6 border border-gold/20 mx-auto shadow-md">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-dark mb-3 tracking-tight uppercase">Your Cart is Empty</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              Invite peace, faith, and positive energy into your home. Browse our collection of consecrated floating stones.
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gold text-dark border border-gold/20 hover:bg-dark hover:text-gold hover:border-gold/35 font-bold text-xs uppercase tracking-widest shadow-lg transition-all duration-300"
            >
              Browse Stones <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </>
    )
  }

  // Load settings dynamically
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
      } catch {
        const local = localStorage.getItem('admin_settings')
        if (local) setSettings(JSON.parse(local))
      }
    }
    loadSettings()
  }, [])

  const shipping = cartTotal >= settings.shipping_threshold ? 0 : settings.shipping_flat_rate
  const total = cartTotal + shipping

  return (
    <>
      <Helmet><title>Your Cart – RamSetu Divine Stones</title></Helmet>
      
      <div className="bg-gradient-to-b from-cream2 via-[#fdfbf7] to-cream2 min-h-screen py-16 md:py-24 font-sans text-left relative overflow-hidden">
        {/* Dotted grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle, #D4A537 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />

        {/* Slow-spinning sacred mandalas */}
        <div className="absolute opacity-[0.04] w-[500px] h-[500px] -left-20 top-10 pointer-events-none select-none">
          <svg viewBox="0 0 100 100" className="w-full h-full text-gold animate-spin-slow">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2,2" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.2" />
            <path d="M 50 5 L 50 95 M 5 50 L 95 50 M 18 18 L 82 82 M 18 82 L 82 18" stroke="currentColor" strokeWidth="0.15" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="border-b border-gold/15 pb-6 mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase block mb-1">✦ Sacred Basket ✦</span>
              <h1 className="text-3xl md:text-4xl font-black text-dark tracking-wide uppercase">Your Cart</h1>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Review your selected divine items</p>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:text-gold-light transition-colors uppercase tracking-wider group">
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Continue Shopping
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Items Column (Span 7) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-5">
                {items.map(item => (
                  <div key={item.id} className="bg-white rounded-[2rem] border border-gold/15 p-4 sm:p-6 shadow-md hover:shadow-xl hover:border-gold/30 transition-all duration-350 flex gap-4 sm:gap-6 items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-xl pointer-events-none"></div>
                    
                    {/* Image Container */}
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-cream2 border border-gold/15 shrink-0 shadow-inner">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Details Container */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5 text-left">
                        <h4 className="font-black text-xs sm:text-lg lg:text-xl text-dark tracking-wide leading-tight">{item.name}</h4>
                        <div className="text-[10px] sm:text-sm font-bold text-gold">₹{Math.round(item.price)} each</div>
                        
                        {/* Quantity Selector & Remove Button */}
                        <div className="flex items-center gap-3 pt-1">
                          <div className="flex items-center border border-gold/25 bg-cream2/20 rounded-xl overflow-hidden h-7 sm:h-9 shrink-0">
                            <button 
                              onClick={() => updateQty(item.id, item.qty - 1)} 
                              className="px-2 sm:px-3.5 text-dark font-black hover:bg-gray-100 bg-transparent border-none cursor-pointer h-full transition-colors text-xs"
                            >
                              −
                            </button>
                            <span className="px-1 font-bold text-[10px] sm:text-sm text-dark min-w-[12px] text-center">{item.qty}</span>
                            <button 
                              onClick={() => updateQty(item.id, item.qty + 1)} 
                              className="px-2 sm:px-3.5 text-dark font-black hover:bg-gray-100 bg-transparent border-none cursor-pointer h-full transition-colors text-xs"
                            >
                              +
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-red-600 hover:text-red-500 bg-transparent border-none cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> 
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* Total Item Price */}
                      <div className="text-left sm:text-right font-black text-sm sm:text-xl text-dark">
                        ₹{Math.round(item.price * item.qty)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Devotional trust notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[9px] uppercase font-black tracking-widest text-dark/70">
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gold/15 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center border border-gold/20 shrink-0"><ShieldCheck className="w-4.5 h-4.5" /></div>
                  <span>100% Consecrated</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gold/15 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center border border-gold/20 shrink-0"><Truck className="w-4.5 h-4.5" /></div>
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gold/15 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center border border-gold/20 shrink-0"><RefreshCw className="w-4.5 h-4.5" /></div>
                  <span>7-Day Return</span>
                </div>
              </div>
            </div>

            {/* Summary Column (Span 5) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-white to-[#fcfaf4] rounded-[2.5rem] p-8 border border-gold/15 shadow-2xl sticky top-28 space-y-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <h3 className="text-xs font-black text-dark uppercase tracking-widest pb-3 border-b border-gold/15">Order Summary</h3>
              
              <div className="space-y-4 text-xs md:text-base font-bold text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Items Subtotal</span>
                  <span className="text-dark">₹{Math.round(cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Shipping Fee</span>
                  {shipping === 0 ? (
                    <span className="text-green-700 bg-green-50 border border-green-200/50 px-2.5 py-0.5 rounded-md uppercase font-black tracking-widest text-[9px] sm:text-[10px]">FREE</span>
                  ) : (
                    <span className="text-dark">₹{shipping}</span>
                  )}
                </div>
                {shipping > 0 && (
                  <div className="p-3.5 bg-gold/5 border border-gold/25 rounded-2xl text-[10px] sm:text-xs text-gold font-bold leading-normal uppercase text-center flex items-center justify-center gap-1.5">
                    <Truck className="w-4 h-4 text-gold shrink-0 animate-bounce" />
                    <span>Add ₹{settings.shipping_threshold - cartTotal} more for FREE shipping</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gold/10 pt-5 flex justify-between items-center font-black text-lg sm:text-2xl text-dark">
                <span>Total Amount</span>
                <span>₹{Math.round(total)}</span>
              </div>

              <button 
                onClick={handleCheckout} 
                className="w-full py-4.5 h-14 rounded-2xl bg-gold text-dark border border-gold/20 hover:bg-dark hover:text-gold hover:border-gold/35 font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl hover:shadow-gold/15 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 group"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>Proceed to Checkout</span> 
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
