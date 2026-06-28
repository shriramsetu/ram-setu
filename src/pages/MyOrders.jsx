import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getMyOrders, primaryImage, createReview, supabase } from '../lib/supabase'
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
  CircleDot,
  ChevronDown,
  ChevronUp,
  Printer,
  MapPin,
  User,
  Phone,
  Info,
  Star,
  X
} from 'lucide-react'

const STATUS_CONFIG = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/50', icon: Clock, label: 'Pending' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/50', icon: CircleDot, label: 'Confirmed' },
  processing: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/50', icon: CircleDot, label: 'Processing' },
  shipped: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200/50', icon: Truck, label: 'Shipped' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/50', icon: CheckCircle2, label: 'Delivered' },
  cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/50', icon: AlertCircle, label: 'Cancelled' },
}

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [expandedOrders, setExpandedOrders] = useState({})

  // Rating & Review Modal States
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewProduct, setReviewProduct] = useState(null)
  const [reviewOrderId, setReviewOrderId] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewName, setReviewName] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [ratedItems, setRatedItems] = useState({})

  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.full_name || user.user_metadata?.name || ''
      setReviewName(name)
    }
  }, [user])

  const openReviewModal = (productId, productName, orderId) => {
    setReviewProduct({ id: productId, name: productName })
    setReviewOrderId(orderId)
    setRating(5)
    setReviewTitle('')
    setReviewComment('')
    setReviewName(user?.user_metadata?.full_name || user?.user_metadata?.name || '')
    setReviewModalOpen(true)
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a star rating')
      return
    }
    if (!reviewName.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment')
      return
    }

    setSubmittingReview(true)
    const reviewData = {
      product_id: reviewProduct.id,
      user_id: user?.id || null,
      order_id: reviewOrderId,
      rating,
      title: reviewTitle.trim() || null,
      comment: reviewComment.trim(),
      name: reviewName.trim()
    }

    try {
      await createReview(reviewData)
      toast.success('Thank you! Your review has been submitted and is pending approval.')
      setRatedItems(prev => ({
        ...prev,
        [`${reviewOrderId}_${reviewProduct.id}`]: true
      }))
      setReviewModalOpen(false)
    } catch (err) {
      console.error('Database review submission failed', err)
      toast.error('Failed to submit review. Database/table connection error.')
    } finally {
      setSubmittingReview(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { state: { from: '/my-orders' } })
  }, [user, authLoading])

  useEffect(() => {
    if (user) {
      getMyOrders(user.id)
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setLoading(false))

      supabase
        .from('reviews')
        .select('product_id, order_id')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) {
            const mapped = {}
            data.forEach(r => {
              if (r.order_id && r.product_id) {
                mapped[`${r.order_id}_${r.product_id}`] = true
              }
            })
            setRatedItems(mapped)
          }
        })
    }
  }, [user])

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  const handlePrint = (e, order) => {
    e.stopPropagation()
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const itemsHtml = (order.order_items || []).map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.products?.name || 'Divine Stones'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${Math.round(item.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${Math.round(item.price * item.qty)}</td>
      </tr>
    `).join('')

    const shipping = order.shipping_address || {}

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Order #${order.id.slice(0, 8).toUpperCase()}</title>
          <style>
            body { font-family: 'DM Sans', sans-serif; color: #333; margin: 40px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #b8893a; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #b8893a; }
            .title { font-size: 28px; font-weight: 900; text-transform: uppercase; margin: 0; }
            .meta { margin-top: 20px; display: flex; justify-content: space-between; }
            .meta-block { width: 48%; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th { background-color: #fcf9f2; border-bottom: 2px solid #b8893a; padding: 10px; text-align: left; }
            .totals { margin-top: 20px; text-align: right; width: 100%; }
            .totals table { width: 300px; margin-left: auto; }
            .totals td { padding: 5px 10px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">RAMSETU DIVINE STONES</div>
              <div>Authentic Floating Stones from Rameswaram</div>
            </div>
            <div style="text-align: right;">
              <h1 class="title">INVOICE</h1>
              <div>Order ID: #${order.id.slice(0, 8).toUpperCase()}</div>
              <div>Date: ${new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
          <div class="meta">
            <div class="meta-block">
              <strong>Billed To:</strong><br>
              ${shipping.full_name || order.full_name || 'Customer'}<br>
              ${shipping.email || order.email || ''}<br>
              Phone: ${shipping.phone || 'N/A'}
            </div>
            <div class="meta-block">
              <strong>Delivery Address:</strong><br>
              ${shipping.address || 'N/A'}<br>
              ${shipping.city || ''}, ${shipping.state || ''} - ${shipping.pincode || ''}<br>
              Payment Method: ${order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Paid Online'}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="totals">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td>₹${Math.round(order.total_amount - (order.shipping_amount || 0) + (order.discount_amount || 0))}</td>
              </tr>
              ${order.discount_amount ? `
              <tr>
                <td style="color: green;">Discount (${order.coupon_code || 'Coupon'}):</td>
                <td style="color: green;">- ₹${Math.round(order.discount_amount)}</td>
              </tr>` : ''}
              <tr>
                <td>Shipping:</td>
                <td>${order.shipping_amount ? `₹${Math.round(order.shipping_amount)}` : 'FREE'}</td>
              </tr>
              <tr style="font-weight: bold; border-top: 1px solid #333; font-size: 16px;">
                <td>Grand Total:</td>
                <td>₹${Math.round(order.total_amount)}</td>
              </tr>
            </table>
          </div>
          <div class="footer">
            Thank you for bringing home the positive vibrations of Ram Setu.<br>
            For any queries, contact support at care@ramsetudivinestones.com
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

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
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border whitespace-nowrap cursor-pointer ${selectedStatus === 'all'
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
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-all duration-300 border whitespace-nowrap cursor-pointer ${selectedStatus === status
                        ? 'bg-gold border-gold text-dark shadow-md scale-102'
                        : 'bg-white border-gold/10 text-gray-400 hover:text-dark hover:border-gold/25'
                      }`}
                  >
                    {STATUS_CONFIG[status]?.label} ({count})
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
                  const isExpanded = !!expandedOrders[order.id]
                  const shipping = order.shipping_address || {}

                  // Calculate pricing values
                  const total = order.total_amount
                  const discount = order.discount_amount || 0
                  const shippingCharge = order.shipping_amount || 0
                  const subtotal = total - shippingCharge + discount

                  // Tracking timeline configuration helper
                  const getTimelineSteps = () => {
                    if (status === 'cancelled') {
                      return [
                        { name: 'Ordered', done: true, active: false },
                        { name: 'Cancelled', done: true, active: true, error: true }
                      ]
                    }
                    return [
                      { name: 'Placed', done: true, active: status === 'pending' },
                      { name: 'Processing', done: ['confirmed', 'processing', 'shipped', 'delivered'].includes(status), active: ['confirmed', 'processing'].includes(status) },
                      { name: 'Shipped', done: ['shipped', 'delivered'].includes(status), active: status === 'shipped' },
                      { name: 'Delivered', done: status === 'delivered', active: status === 'delivered' }
                    ]
                  }

                  return (
                    <div
                      key={order.id}
                      onClick={() => toggleExpand(order.id)}
                      className="bg-white rounded-[2rem] border border-gold/15 p-5 sm:p-7 shadow-md hover:shadow-xl hover:border-gold/30 transition-all duration-300 relative overflow-hidden cursor-pointer"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

                      {/* Card Header Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center text-gold">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-extrabold text-dark text-sm sm:text-base tracking-wide flex items-center gap-2">
                              <span>Order #{String(order.id).slice(0, 8).toUpperCase()}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-gold" /> : <ChevronDown className="w-4 h-4 text-gold" />}
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
                            <span>{statusConfig.label}</span>
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
                              {status === 'delivered' && (
                                ratedItems[`${order.id}_${item.product_id}`] ? (
                                  <button
                                    type="button"
                                    disabled
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-250/50 rounded-lg text-[10px] font-bold uppercase tracking-wider opacity-80 cursor-not-allowed shadow-sm"
                                  >
                                    ✓ Rated
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openReviewModal(item.product_id, item.products?.name, order.id)
                                    }}
                                    className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-gold/10 hover:bg-gold text-gold hover:text-dark border border-gold/20 hover:border-gold/30 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm"
                                  >
                                    ★ Rate & Review
                                  </button>
                                )
                              )}
                            </div>

                            {/* Item Total */}
                            <div className="text-right shrink-0">
                              <span className="font-extrabold text-dark text-sm sm:text-base">₹{Math.round(item.price * item.qty)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* EXPANDED AREA FOR FULL DETAILS */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-dashed border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 text-left">

                          {/* Shipping Details */}
                          <div className="bg-cream2/20 border border-gold/10 p-5 rounded-2xl">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase text-gold tracking-wider mb-3">
                              <MapPin className="w-4 h-4" />
                              <span>Shipping & Contact</span>
                            </div>
                            <div className="space-y-2 text-xs text-gray-600 font-sans">
                              <div className="flex items-center gap-2 font-bold text-dark">
                                <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span>{shipping.full_name || order.full_name || 'N/A'}</span>
                              </div>
                              {shipping.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span>{shipping.phone}</span>
                                </div>
                              )}
                              <div className="flex items-start gap-2 pt-1 border-t border-gold/5 mt-1">
                                <div className="font-semibold text-dark shrink-0">Address:</div>
                                <div>
                                  {shipping.address || 'N/A'}<br />
                                  {shipping.city || ''}, {shipping.state || ''} - {shipping.pincode || ''}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Detailed Payment & Cost breakdown */}
                          <div className="bg-cream2/20 border border-gold/10 p-5 rounded-2xl flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 text-xs font-bold uppercase text-gold tracking-wider mb-3">
                                <Info className="w-4 h-4" />
                                <span>Cost Summary</span>
                              </div>
                              <div className="space-y-2 text-xs text-gray-500 font-sans">
                                <div className="flex justify-between">
                                  <span>Subtotal</span>
                                  <span className="font-bold text-dark">₹{Math.round(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                  <div className="flex justify-between text-green-700">
                                    <span>Discount ({order.coupon_code || 'Coupon'})</span>
                                    <span className="font-bold">- ₹{Math.round(discount)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span>Shipping Fee</span>
                                  <span className="font-bold text-dark">{shippingCharge > 0 ? `₹${Math.round(shippingCharge)}` : 'FREE'}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gold/5 font-semibold text-gray-600">
                                  <span>Payment Status</span>
                                  <span className={`capitalize font-bold ${order.payment_status === 'paid' ? 'text-green-700' : 'text-amber-700'}`}>
                                    {order.payment_status || 'Pending'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {status === 'delivered' && (
                              <div className="flex items-center justify-start gap-3 mt-4 pt-3 border-t border-gold/10">
                                <button
                                  type="button"
                                  onClick={(e) => handlePrint(e, order)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gold hover:bg-dark text-dark hover:text-gold border border-gold/20 hover:border-gold/30 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm shrink-0"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>Print Invoice</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Visual Progress Timeline */}
                          <div className="md:col-span-2 pt-4">
                            <div className="text-xs font-bold uppercase text-gold tracking-wider mb-4 pl-1">
                              Order Progress Tracker
                            </div>
                            <div className="flex items-center justify-between relative pl-2 pr-2">
                              {/* Horizontal track line wrapper */}
                              <div className="absolute left-[12.5%] right-[12.5%] top-4 h-[2px] bg-gray-100 -z-10">
                                <div
                                  className="h-full bg-gold transition-all duration-500"
                                  style={{
                                    width: status === 'cancelled'
                                      ? '100%'
                                      : status === 'pending'
                                        ? '0%'
                                        : status === 'confirmed' || status === 'processing'
                                          ? '33.33%'
                                          : status === 'shipped'
                                            ? '66.66%'
                                            : '100%'
                                  }}
                                />
                              </div>

                              {getTimelineSteps().map((step, idx) => (
                                <div key={idx} className="flex flex-col items-center flex-1">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step.error
                                        ? 'bg-rose-50 border-rose-500 text-rose-500'
                                        : step.active
                                          ? 'bg-gold border-gold text-dark animate-pulse shadow-md scale-110'
                                          : step.done
                                            ? 'bg-gold border-gold text-dark'
                                            : 'bg-white border-gray-200 text-gray-300'
                                      }`}
                                  >
                                    {step.error ? (
                                      <AlertCircle className="w-4 h-4" />
                                    ) : step.done ? (
                                      <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                      <span className="text-[10px] font-black">{idx + 1}</span>
                                    )}
                                  </div>
                                  <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${step.error
                                      ? 'text-rose-600'
                                      : step.active
                                        ? 'text-gold'
                                        : step.done
                                          ? 'text-dark font-black'
                                          : 'text-gray-400'
                                    }`}>
                                    {step.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      )}

                      {/* Card Footer Summary (only visible when collapsed) */}
                      {!isExpanded && (
                        <div className="border-t border-gray-100 pt-5 flex justify-between items-center relative z-10">
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <span>{(order.order_items || []).length} item{(order.order_items || []).length !== 1 ? 's' : ''}</span>
                            <span className="text-[10px] text-gold-light bg-gold/5 px-2 py-0.5 rounded-full border border-gold/10 ml-2 animate-pulse">Click to expand</span>
                          </span>
                          <div className="text-right">
                            <span className="text-xs text-gray-400 font-semibold mr-1.5">Total Amount:</span>
                            <span className="font-black text-lg text-dark">
                              ₹{Math.round(order.total_amount)}
                            </span>
                          </div>
                        </div>
                      )}

                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && reviewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-dark/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gold/20 shadow-2xl p-5 sm:p-8 animate-scale-up text-left max-h-[92vh] overflow-y-auto no-scrollbar">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gold/15 mb-6">
              <div>
                <span className="text-gold text-[9px] font-bold tracking-[0.2em] uppercase block mb-1">✦ Share Your Experience ✦</span>
                <h3 className="text-xl font-extrabold text-dark uppercase tracking-wide">Write a Review</h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gold/10 hover:bg-gold hover:text-dark text-gold flex items-center justify-center transition-all duration-300 cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-5 relative z-10">
              {/* Product Info */}
              <div className="bg-cream2/30 border border-gold/10 p-4 rounded-2xl">
                <span className="text-gray-400 text-[9px] uppercase font-black tracking-widest block mb-1">Product</span>
                <h4 className="font-bold text-dark text-sm sm:text-base">{reviewProduct.name}</h4>
              </div>

              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-gold tracking-wider mb-2">Rating *</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isFilled = hoverRating ? starValue <= hoverRating : starValue <= rating
                    return (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-125 bg-transparent border-none cursor-pointer"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors duration-200 ${isFilled ? 'text-gold fill-current' : 'text-gray-200'
                            }`}
                        />
                      </button>
                    )
                  })}
                  <span className="ml-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {rating === 5 && 'Excellent'}
                    {rating === 4 && 'Very Good'}
                    {rating === 3 && 'Good'}
                    {rating === 2 && 'Fair'}
                    {rating === 1 && 'Poor'}
                  </span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="review-name" className="block text-xs font-bold uppercase text-gold tracking-wider mb-1.5">Your Name *</label>
                <input
                  id="review-name"
                  type="text"
                  required
                  autoComplete="off"
                  disabled={!!user}
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-gold/25 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-sm transition-all duration-300 bg-[#FAF6EE] text-dark placeholder:text-gray-400 font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              {/* Title */}
              <div>
                <label htmlFor="review-title" className="block text-xs font-bold uppercase text-gold tracking-wider mb-1.5">Review Title (Optional)</label>
                <input
                  id="review-title"
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Deeply Divine Experience"
                  className="w-full px-4 py-3 rounded-xl border border-gold/25 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-sm transition-all duration-300 bg-[#FAF6EE] text-dark placeholder:text-gray-400 font-medium"
                />
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="review-comment" className="block text-xs font-bold uppercase text-gold tracking-wider mb-1.5">Review Comment *</label>
                <textarea
                  id="review-comment"
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your spiritual connection or testing experience with this sacred stone..."
                  className="w-full px-4 py-3 rounded-xl border border-gold/25 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-sm transition-all duration-300 bg-[#FAF6EE] text-dark placeholder:text-gray-400 font-medium resize-none leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-500 hover:bg-gray-50 font-bold text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer text-center bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-3 rounded-xl bg-gold hover:bg-dark text-dark hover:text-gold border border-gold/20 font-black text-xs uppercase tracking-widest shadow-lg transition-all duration-300 cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
