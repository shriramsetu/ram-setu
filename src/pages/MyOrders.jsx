import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { getMyOrders, primaryImage } from '../lib/supabase'
import { 
  Package, 
  Calendar, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  ChevronRight, 
  ArrowLeft,
  ShoppingBag,
  CircleDot
} from 'lucide-react'

const STATUS_CONFIG = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/50', icon: Clock },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/50', icon: CircleDot },
  processing: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/50', icon: CircleDot },
  shipped: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200/50', icon: Truck },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/50', icon: CheckCircle2 },
  cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/50', icon: AlertCircle },
}

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { state: { from: '/my-orders' } })
  }, [user, authLoading])

  useEffect(() => {
    if (user) {
      getMyOrders(user.id)
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setLoading(false))
    }
  }, [user])

  if (authLoading || loading) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-cream2 font-sans">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gold/20 animate-ping"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-gold border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
    </div>
  )

  return (
    <>
      <Helmet><title>My Orders – RamSetu Divine Stones</title></Helmet>

      <div className="bg-gradient-to-b from-cream2 via-[#fdfbf7] to-cream2 min-h-screen py-16 md:py-24 font-sans text-left relative overflow-hidden">
        {/* Dotted grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle, #B8893A 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />

        {/* Glowing aura blobs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="border-b border-gold/15 pb-6 mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase block mb-1">✦ Your Sacred Journey ✦</span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-dark tracking-tight uppercase">My Orders</h1>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Track and manage your order history</p>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:text-gold-light transition-colors uppercase tracking-wider group">
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Continue Shopping
            </Link>
          </div>

          {orders.length > 0 && (
            <div className="flex gap-2.5 overflow-x-auto pb-4 mb-8 no-scrollbar scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedStatus('all')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border whitespace-nowrap cursor-pointer ${
                  selectedStatus === 'all'
                    ? 'bg-gold border-gold text-dark shadow-md scale-102'
                    : 'bg-white border-gold/10 text-gray-400 hover:text-dark hover:border-gold/25'
                }`}
              >
                All Orders ({orders.length})
              </button>
              {Object.keys(STATUS_CONFIG).map(status => {
                const count = orders.filter(o => (o.order_status || 'pending') === status).length
                if (count === 0) return null
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-all duration-300 border whitespace-nowrap cursor-pointer ${
                      selectedStatus === status
                        ? 'bg-gold border-gold text-dark shadow-md scale-102'
                        : 'bg-white border-gold/10 text-gray-400 hover:text-dark hover:border-gold/25'
                    }`}
                  >
                    {status} ({count})
                  </button>
                )
              })}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="bg-white rounded-[2rem] border border-gold/15 p-8 sm:p-12 md:p-16 text-center shadow-lg relative overflow-hidden max-w-lg mx-auto">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
              <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-6 border border-gold/20 mx-auto shadow-md">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-dark mb-2 uppercase tracking-wide">No Orders Yet</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
                Bring home the positive vibrations of Ram Setu. Sourced from Rameswaram, hand-consecrated.
              </p>
              <Link 
                to="/shop" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gold hover:bg-dark text-dark hover:text-gold border border-gold/20 hover:border-gold/30 font-bold text-xs uppercase tracking-widest shadow-lg transition-all duration-300"
              >
                Shop Now <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {(() => {
                const filteredOrders = selectedStatus === 'all'
                  ? orders
                  : orders.filter(o => (o.order_status || 'pending') === selectedStatus)
                
                return filteredOrders.map(order => {
                  const status = order.order_status || 'pending'
                  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending
                  const StatusIcon = statusConfig.icon
                  
                  return (
                    <div 
                      key={order.id} 
                      className="bg-white rounded-[2rem] border border-gold/15 p-5 sm:p-7 shadow-md hover:shadow-xl hover:border-gold/30 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
                      
                      {/* Card Header Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center text-gold">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-extrabold text-dark text-sm sm:text-base tracking-wide">
                              Order #{String(order.id).slice(0, 8).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium mt-1">
                              <Calendar className="w-3.5 h-3.5 text-gold/60" />
                              <span>
                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center flex-wrap gap-2.5">
                          {/* Status Badge */}
                          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold capitalize ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                            <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>{status}</span>
                          </div>

                          {/* Payment Method Badge */}
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200/60 rounded-full text-xs font-bold text-gray-500">
                            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                            <span>{order.payment_method === 'cod' ? 'COD' : 'Online Paid'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-4 mb-6">
                        {(order.order_items || []).map(item => (
                          <div key={item.id} className="flex gap-4 items-center relative z-10">
                            {/* Item Image */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-cream2 border border-gold/10 shrink-0 shadow-inner">
                              <img
                                src={primaryImage(item.products)}
                                alt={item.products?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-dark text-sm sm:text-base truncate">{item.products?.name}</h4>
                              <p className="text-xs text-gray-400 font-semibold mt-1">
                                Qty: {item.qty} <span className="mx-1.5 text-gray-300">•</span> ₹{Math.round(item.price)} each
                              </p>
                            </div>

                            {/* Item Total */}
                            <div className="text-right shrink-0">
                              <span className="font-extrabold text-dark text-sm sm:text-base">₹{Math.round(item.price * item.qty)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Card Footer Summary */}
                      <div className="border-t border-gray-100 pt-5 flex justify-between items-center relative z-10">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                          {(order.order_items || []).length} item{(order.order_items || []).length !== 1 ? 's' : ''}
                        </span>
                        <div className="text-right">
                          <span className="text-xs text-gray-400 font-semibold mr-1.5">Total Amount:</span>
                          <span className="font-black text-lg text-dark">
                            ₹{Math.round(order.total_amount)}
                          </span>
                        </div>
                      </div>

                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
