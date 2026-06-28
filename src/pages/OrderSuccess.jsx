import { Link, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react'

export default function OrderSuccess() {
  const { state } = useLocation()
  const orderId = state?.orderId

  return (
    <>
      <Helmet><title>Order Confirmed – RamSetu Divine Stones</title></Helmet>
      <div className="bg-gradient-to-b from-cream2 via-[#fdfbf7] to-cream2 py-16 md:py-24 min-h-[75vh] flex items-center justify-center font-sans px-4 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute opacity-[0.03] w-[500px] h-[500px] rounded-full border-2 border-gold -top-20 -left-20 pointer-events-none" />
        
        <div className="bg-white/80 backdrop-blur-md border border-gold/15 rounded-[2rem] p-8 md:p-12 w-full max-w-lg shadow-[0_20px_50px_rgba(212,165,55,0.06)] text-center relative z-10">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <CheckCircle className="w-10 h-10" />
          </div>
          
          <h1 className="font-black text-slate-900 text-3xl mb-4 tracking-tight">
            Order Placed Successfully!
          </h1>
          
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Thank you for your sacred purchase. Your consecrated Ram Setu stone is being prepared with holy prayers and will be dispatched soon.
          </p>

          {orderId && (
            <div className="bg-slate-50 border border-gold/10 rounded-2xl p-4 mb-8 inline-block">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Order Transaction ID</span>
              <span className="font-mono text-xs font-black text-slate-800">#{String(orderId).toUpperCase()}</span>
            </div>
          )}

          <div className="space-y-4">
            <Link 
              to="/my-orders" 
              className="w-full py-4 px-6 bg-gold text-dark font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-dark hover:text-gold transition-all duration-300 shadow-md hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              View My Orders
            </Link>
            
            <Link 
              to="/shop" 
              className="w-full py-4 px-6 bg-white border border-gold/20 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl hover:border-gold/45 hover:bg-gold/5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
