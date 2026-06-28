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
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gold text-dark border border-gold/20 hover:bg-dark hover:text-gold hover:border-gold/35 font-bold text-xs uppercase tracking-widest shadow-lg transition-all duration-300 justify-center"
            >
              Browse Stones
            </Link>
          </div>
        </div>
      </>
    )
  }

  const shipping = cartTotal >= settings.shipping_threshold ? 0 : settings.shipping_flat_rate
  const total = cartTotal + shipping

  return (
    <>
      <Helmet><title>Your Cart – RamSetu Divine Stones</title></Helmet>
      
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

        {/* Top Header Detail */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase mb-3.5">
            ✦ Sacred Basket ✦
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-dark mb-2">
            Your Cart
          </h1>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Link to="/" className="hover:text-gold transition-colors focus-visible:outline-none rounded">Home</Link>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-gold/70">Cart</span>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Items Card */}
            <div className="lg:col-span-7 relative bg-white rounded-[1.75rem] sm:rounded-[2rem] border border-gold/20 p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_-20px_rgba(184,137,58,0.15)]">
              {/* Corner accents */}
              <div className="absolute top-5 left-5 w-4 h-4 border-t border-l border-gold/40 rounded-tl pointer-events-none" />
              <div className="absolute bottom-5 right-5 w-4 h-4 border-b border-r border-gold/40 rounded-br pointer-events-none" />

              <div className="flex items-center gap-3 border-b border-gold/10 pb-5 mb-6">
                <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-dark text-lg uppercase tracking-wider">
                  Cart Items
                </h2>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100 pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 sm:gap-6 items-center py-5 first:pt-0 last:pb-0 justify-between">
                    {/* Image Container */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-cream2 border border-gold/15 shrink-0 shadow-sm">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Details Container */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5 text-left">
                        <span className="block font-extrabold text-dark text-base sm:text-lg leading-tight">{item.name}</span>
                        <div className="text-sm font-semibold text-gold">₹{Math.round(item.price)} each</div>
                        
                        {/* Quantity Selector & Remove Button */}
                        <div className="flex items-center gap-3.5 pt-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-400 font-semibold">
                            <span>Qty:</span>
                            <div className="flex items-center gap-2.5 bg-cream2/60 border border-gold/10 px-2.5 py-0.5 rounded-lg">
                              <button 
                                onClick={() => updateQty(item.id, item.qty - 1)} 
                                className="text-gray-400 hover:text-gold transition-colors focus:outline-none cursor-pointer text-sm"
                              >
                                −
                              </button>
                              <span className="text-dark text-sm font-bold w-4 text-center select-none">{item.qty}</span>
                              <button 
                                onClick={() => updateQty(item.id, item.qty + 1)} 
                                className="text-gray-400 hover:text-gold transition-colors focus:outline-none cursor-pointer text-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            className="flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-500 bg-transparent border-none cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> 
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* Total Item Price */}
                      <span className="font-extrabold text-dark text-base sm:text-lg">
                        ₹{Math.round(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Devotional trust notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[9px] uppercase font-black tracking-widest text-dark/70 mt-8 pt-6 border-t border-gold/10">
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gold/15 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center border border-gold/20 shrink-0"><ShieldCheck className="w-4.5 h-4.5" /></div>
                  <span>100% Consecrated</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gold/15 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center border border-gold/20 shrink-0"><Truck className="w-4.5 h-4.5" /></div>
                  <span>{shipping === 0 ? "Free Shipping" : `Shipping: ₹${shipping}`}</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gold/15 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center border border-gold/20 shrink-0"><RefreshCw className="w-4.5 h-4.5" /></div>
                  <span>7-Day Return</span>
                </div>
              </div>
            </div>

            {/* Right: Summary Column (Span 5) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative bg-white rounded-[1.75rem] sm:rounded-[2rem] border border-gold/20 p-6 sm:p-8 shadow-[0_20px_60px_-20px_rgba(184,137,58,0.15)]">
                {/* Corner accents */}
                <div className="absolute top-5 left-5 w-4 h-4 border-t border-l border-gold/40 rounded-tl pointer-events-none" />
                <div className="absolute bottom-5 right-5 w-4 h-4 border-b border-r border-gold/40 rounded-br pointer-events-none" />

                <div className="flex items-center gap-3 border-b border-gold/10 pb-4 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-dark text-base uppercase tracking-wider">
                    Order Summary
                  </h2>
                </div>

                <div className="space-y-3 font-sans text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-dark">₹{Math.round(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className={`font-bold ${shipping === 0 ? 'text-green-600' : 'text-dark'}`}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <div className="p-3 bg-gold/5 border border-gold/25 rounded-2xl text-xs text-gold font-bold leading-normal uppercase text-center flex items-center justify-center gap-1.5 mt-2">
                      <Truck className="w-4 h-4 text-gold shrink-0 animate-bounce" />
                      <span>Add ₹{settings.shipping_threshold - cartTotal} more for FREE shipping</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-4 border-t border-dashed border-gray-200 text-dark">
                    <span className="font-bold text-base uppercase">Total</span>
                    <span className="font-black text-2xl text-dark">₹{Math.round(total)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <button 
                onClick={handleCheckout} 
                className="group w-full h-12 bg-gold hover:bg-dark text-dark hover:text-gold border border-gold/30 rounded-xl font-bold text-xs uppercase tracking-widest shadow-[0_8px_24px_-8px_rgba(200,134,10,0.3)] hover:shadow-[0_10px_32px_-6px_rgba(200,134,10,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 mt-1 font-sans"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>Proceed to Checkout</span> 
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
