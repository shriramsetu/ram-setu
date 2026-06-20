import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../context/AuthContext'
import { supabase, primaryImage } from '../../lib/supabase'
import toast from 'react-hot-toast'
import {
  Package,
  ShoppingBag,
  Users as UsersIcon,
  Tag,
  Settings as SettingsIcon,
  LogOut,
  Globe,
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  Truck,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Percent,
  Search,
  Loader2,
  Star,
  Check
} from 'lucide-react'

export default function Dashboard() {
  const { user, isAdmin, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Data States
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [usersList, setUsersList] = useState([])
  const [coupons, setCoupons] = useState([])
  const [categoriesList, setCategoriesList] = useState([])
  const [contacts, setContacts] = useState([])
  const [adminReviews, setAdminReviews] = useState([])

  // Settings States
  const [settings, setSettings] = useState({
    shipping_threshold: 499,
    shipping_flat_rate: 79,
    razorpay_key_id: '',
    razorpay_key_secret: '',
    enable_razorpay: true,
    enable_cod: true
  })

  // UI States
  const [fetching, setFetching] = useState(true)
  const [modal, setModal] = useState(null) // 'add' | 'edit'
  const [viewOrder, setViewOrder] = useState(null) // selected order for details modal
  const [viewReview, setViewReview] = useState(null) // selected review for details modal
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState('')
  const [couponType, setCouponType] = useState('percent') // 'percent' | 'flat'
  const [searchQuery, setSearchQuery] = useState('')

  // Route protection
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/login')
    }
  }, [user, isAdmin, loading])

  // Load all tab data when tab changes or initially
  useEffect(() => {
    if (user && isAdmin) {
      loadTabData()
    }
  }, [user, isAdmin, tab])

  async function loadTabData() {
    setFetching(true)
    try {
      // Load orders and users list regardless of tab to ensure dashboard metrics are accurate
      await fetchOrders()
      await fetchUsers()

      // Fetch categories
      const { data: cats, error: catErr } = await supabase.from('categories').select('*').order('name')
      if (!catErr) setCategoriesList(cats || [])

      if (tab === 'products') {
        await fetchProducts()
      } else if (tab === 'coupons') {
        await fetchCoupons()
      } else if (tab === 'settings') {
        await fetchSettings()
      } else if (tab === 'contacts') {
        await fetchContacts()
      } else if (tab === 'reviews') {
        await fetchAllReviews()
      }
    } catch (err) {
      console.error('Error loading admin data:', err)
      toast.error(`Error fetching data: ${err.message || 'Check Console logs'}`)
    } finally {
      setFetching(false)
    }
  }

  // ─── Products Logic ───
  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    setProducts((data || []).map(p => {
      const sortedImages = p.product_images ? [...p.product_images].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) : []
      return { ...p, product_images: sortedImages, stock_qty: p.stock }
    }))
  }

  async function quickUpdateStock(id, newStock) {
    const stock = Math.max(0, parseInt(newStock) || 0)
    const { error } = await supabase
      .from('products')
      .update({ stock: stock })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update stock')
    } else {
      toast.success('Stock updated successfully')
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_qty: stock } : p))
    }
  }

  function openAddProduct() {
    setForm({
      name: '',
      slug: '',
      price: '',
      compare_price: '',
      description: '',
      is_active: true,
      is_featured: false,
      stock_qty: 10,
      meta_title: '',
      meta_description: '',
      seo_keywords: '',
      category_slug: '',
      product_images: []
    })
    setModal('add')
  }

  async function openEditProduct(p) {
    setForm({ 
      ...p, 
      product_images: p.product_images ? [...p.product_images] : [] 
    })
    setModal('edit')
    // Fetch SEO details from site_settings
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', `seo_prod_${p.id}`)
        .single()
      if (data && data.value) {
        const seo = JSON.parse(data.value)
        setForm(prev => ({
          ...prev,
          meta_title: seo.meta_title || '',
          meta_description: seo.meta_description || '',
          seo_keywords: seo.seo_keywords || '',
        }))
      }
    } catch {
      setForm(prev => ({
        ...prev,
        meta_title: '',
        meta_description: '',
        seo_keywords: '',
      }))
    }
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadingImage(true)
    const uploadedImages = []

    const toBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })

    try {
      for (const file of files) {
        const base64Image = await toBase64(file)
        const res = await fetch('/.netlify/functions/cloudinary-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image })
        })
        if (!res.ok) {
          const contentType = res.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await res.json()
            throw new Error(errorData.error || 'Upload failed')
          } else {
            const errorText = await res.text()
            throw new Error(errorText || `Upload failed with status ${res.status}. Is the Netlify server running?`)
          }
        }

        const data = await res.json()
        uploadedImages.push({
          url: data.url,
          is_primary: false
        })
      }

      setForm(prev => {
        const currentImages = prev.product_images || []
        const updatedImages = [...currentImages, ...uploadedImages]
        if (updatedImages.length > 0 && !updatedImages.some(img => img.is_primary)) {
          updatedImages[0].is_primary = true
        }
        return {
          ...prev,
          product_images: updatedImages
        }
      })
      toast.success('Images uploaded successfully!')
    } catch (err) {
      console.error('Cloudinary upload error:', err)
      toast.error(`Upload error: ${err.message}`)
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  function removeProductImage(indexToRemove) {
    setForm(prev => {
      const updated = (prev.product_images || []).filter((_, i) => i !== indexToRemove)
      if (updated.length > 0 && !updated.some(img => img.is_primary)) {
        updated[0].is_primary = true
      }
      return { ...prev, product_images: updated }
    })
  }

  function setProductImagePrimary(indexToPrimary) {
    setForm(prev => {
      const updated = (prev.product_images || []).map((img, i) => ({
        ...img,
        is_primary: i === indexToPrimary
      }))
      return { ...prev, product_images: updated }
    })
  }

  function moveProductImage(index, direction) {
    setForm(prev => {
      const updated = [...(prev.product_images || [])]
      const targetIndex = direction === 'left' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= updated.length) return prev
      const temp = updated[index]
      updated[index] = updated[targetIndex]
      updated[targetIndex] = temp
      return { ...prev, product_images: updated }
    })
  }

  async function saveProduct() {
    if (!form.name || !form.price) {
      toast.error('Please fill in required fields')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        price: parseFloat(form.price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        description: form.description,
        is_active: form.is_active,
        is_featured: form.is_featured,
        stock: parseInt(form.stock_qty) || 0,
        category_slug: form.category_slug || null,
      }

      let productId = form.id
      if (modal === 'add') {
        const { data, error } = await supabase.from('products').insert(payload).select().single()
        if (error) throw error
        productId = data.id
        toast.success('Product created!')
      } else {
        const { error } = await supabase.from('products').update(payload).eq('id', form.id)
        if (error) throw error
        toast.success('Product updated!')
      }

      // Save SEO details
      if (productId) {
        const seoData = {
          meta_title: form.meta_title || '',
          meta_description: form.meta_description || '',
          seo_keywords: form.seo_keywords || '',
        }
        await supabase
          .from('site_settings')
          .upsert({
            key: `seo_prod_${productId}`,
            value: JSON.stringify(seoData)
          }, { onConflict: 'key' })

        // Save product images
        const { error: deleteError } = await supabase
          .from('product_images')
          .delete()
          .eq('product_id', productId)
        if (deleteError) throw deleteError

        if (form.product_images && form.product_images.length > 0) {
          const imagesToInsert = form.product_images.map((img, idx) => ({
            product_id: productId,
            url: img.url,
            is_primary: img.is_primary || false,
            order_index: idx
          }))
          const { error: insertError } = await supabase
            .from('product_images')
            .insert(imagesToInsert)
          if (insertError) throw insertError
        }
      }

      await fetchProducts()
      setModal(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleProductActive(p) {
    const { error } = await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id)
    if (error) {
      toast.error('Failed to update status')
    } else {
      setProducts(prev => prev.map(item => item.id === p.id ? { ...item, is_active: !p.is_active } : item))
      toast.success('Product status updated')
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      toast.error('Could not delete product')
    } else {
      toast.success('Product deleted')
      fetchProducts()
    }
  }

  // ─── Orders / Sales Logic ───
  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .order('created_at', { ascending: false })
    if (error) throw error
    setOrders(data || [])
  }

  async function updateOrderStatus(orderId, newStatus) {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .eq('id', orderId)
    if (error) {
      toast.error('Failed to update order status')
    } else {
      toast.success(`Order marked as ${newStatus}`)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o))
    }
  }

  // ─── Reviews Logic ───
  async function fetchAllReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false })
    if (error) throw error
    setAdminReviews(data || [])
  }

  async function approveReview(reviewId) {
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: true })
      .eq('id', reviewId)

    if (error) {
      toast.error('Failed to approve review')
    } else {
      toast.success('Review approved successfully')
      setAdminReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_approved: true } : r))
    }
  }

  async function deleteReview(reviewId) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (error) {
      toast.error('Failed to delete review')
    } else {
      toast.success('Review deleted successfully')
      setAdminReviews(prev => prev.filter(r => r.id !== reviewId))
    }
  }

  // ─── Users Logic ───
  async function fetchUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true })
    if (error) throw error
    setUsersList(data || [])
  }

  // ─── Coupons Logic ───
  async function fetchCoupons() {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setCoupons(data || [])
    } catch {
      // Fallback to local storage if table doesn't exist
      const local = localStorage.getItem('admin_coupons')
      setCoupons(local ? JSON.parse(local) : [])
    }
  }

  async function addCoupon() {
    if (!couponCode || !couponDiscount) {
      toast.error('Coupon details missing')
      return
    }
    const newCoupon = {
      id: Date.now().toString(),
      code: couponCode.toUpperCase().trim(),
      discount_value: parseFloat(couponDiscount),
      discount_type: couponType,
      is_active: true,
      created_at: new Date().toISOString()
    }

    try {
      const { error } = await supabase.from('coupons').insert(newCoupon)
      if (error) throw error
      toast.success('Coupon added successfully')
      fetchCoupons()
    } catch {
      // Save locally
      const updated = [newCoupon, ...coupons]
      localStorage.setItem('admin_coupons', JSON.stringify(updated))
      setCoupons(updated)
      toast.success('Coupon added (Saved Locally)')
    }

    setCouponCode('')
    setCouponDiscount('')
  }

  async function deleteCoupon(id) {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id)
      if (error) throw error
      toast.success('Coupon removed')
      fetchCoupons()
    } catch {
      const updated = coupons.filter(c => c.id !== id)
      localStorage.setItem('admin_coupons', JSON.stringify(updated))
      setCoupons(updated)
      toast.success('Coupon removed (Locally)')
    }
  }

  // ─── Contacts Logic ───
  async function fetchContacts() {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setContacts(data || [])
    } catch (err) {
      console.error(err)
      setContacts([])
    }
  }

  async function deleteContact(id) {
    if (!window.confirm('Are you sure you want to delete this message?')) return
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id)
      if (error) throw error
      toast.success('Message deleted')
      fetchContacts()
    } catch (err) {
      toast.error('Failed to delete message')
    }
  }

  // ─── Settings Logic ───
  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
      if (error) throw error

      const loaded = {}
      if (data && data.length > 0) {
        data.forEach(item => {
          let val = item.value
          if (val === 'true') val = true
          if (val === 'false') val = false
          if (!isNaN(val) && typeof val === 'string' && val.trim() !== '') val = parseFloat(val)

          if (item.key === 'free_shipping_threshold') loaded['shipping_threshold'] = parseFloat(val) || 0
          else if (item.key === 'shipping_charge') loaded['shipping_flat_rate'] = parseFloat(val) || 0
          else if (item.key === 'razorpay_enabled') loaded['enable_razorpay'] = val === 'true' || val === true
          else if (item.key === 'cod_enabled') loaded['enable_cod'] = val === 'true' || val === true
          else loaded[item.key] = val
        })
      }

      // Merge local storage settings as fallback/cache
      const local = localStorage.getItem('admin_settings')
      const localParsed = local ? JSON.parse(local) : {}

      setSettings(prev => ({ ...prev, ...localParsed, ...loaded }))
    } catch {
      loadLocalSettings()
    }
  }

  function loadLocalSettings() {
    const local = localStorage.getItem('admin_settings')
    if (local) {
      setSettings(JSON.parse(local))
    }
  }

  async function saveSettings(e) {
    e.preventDefault()

    // Always persist to local storage first
    localStorage.setItem('admin_settings', JSON.stringify(settings))

    try {
      const rows = [
        { key: 'free_shipping_threshold', value: String(settings.shipping_threshold) },
        { key: 'shipping_charge', value: String(settings.shipping_flat_rate) },
        { key: 'razorpay_enabled', value: String(settings.enable_razorpay) },
        { key: 'cod_enabled', value: String(settings.enable_cod) },
      ]

      const { error } = await supabase
        .from('site_settings')
        .upsert(rows, { onConflict: 'key' })

      if (error) throw error
      toast.success('Settings saved successfully!')
    } catch (err) {
      console.error('Supabase settings save failed:', err)
      toast.error(`Database Error: ${err.message || 'Permission Denied'}. Settings saved locally instead!`)
    }
  }

  if (loading || (!user && !loading)) return null

  // Metric calculations
  const totalSales = orders
    .filter(o => o.payment_status === 'paid' || o.order_status === 'delivered')
    .reduce((acc, curr) => acc + curr.total_amount, 0)

  const pendingOrders = orders.filter(o => o.order_status === 'pending').length
  const avgOrderValue = orders.length > 0 ? totalSales / orders.length : 0

  // Filter products or orders based on search query
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredOrders = orders.filter(o =>
    String(o.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.shipping_address?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Helmet><title>Admin Control Panel – RamSetu</title></Helmet>

      <div className="relative min-h-screen bg-cream2 text-slate-800 font-sans flex flex-col">
        {/* Decorative ambient backgrounds */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-12 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #B8893A 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* Modern Light Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gold/15 px-6 py-4 flex items-center justify-between shadow-[0_2px_20px_-10px_rgba(184,137,58,0.1)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-md shadow-gold/25">
              <IconLotus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-sans text-lg font-bold text-slate-900 leading-tight">RamSetu Admin</h1>
              <p className="text-[10px] text-gold font-bold tracking-widest uppercase">Management Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden md:inline text-xs font-semibold text-slate-500">{user?.email}</span>

            {/* View Site Button (Icon only on mobile) */}
            <Link to="/" className="text-xs font-bold text-gold hover:text-gold-light bg-gold/10 p-2 md:px-3 md:py-1.5 rounded-lg transition-colors flex items-center gap-1.5" title="View Site">
              <Globe className="w-4 h-4 md:w-3.5 md:h-3.5" />
              <span className="hidden md:inline">View Site</span>
            </Link>

            {/* Logout Button (Icon only on mobile) */}
            <button
              onClick={signOut}
              className="p-2 md:px-3 md:py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors flex items-center gap-1.5 text-xs font-bold border border-transparent cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4 md:w-3.5 md:h-3.5" />
              <span className="hidden md:inline">Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="lg:hidden p-1.5 rounded-xl text-slate-600 hover:text-gold hover:bg-gold/10 transition-colors border-none cursor-pointer flex flex-col gap-1 w-9 h-9 items-center justify-center bg-slate-50 border border-gold/10"
              aria-label="Toggle Navigation"
            >
              <span className={`h-0.5 bg-current rounded transition-all duration-300 ${mobileMenuOpen ? 'w-5 rotate-45 translate-y-1.5' : 'w-5'}`} />
              <span className={`h-0.5 bg-current rounded transition-all duration-300 ${mobileMenuOpen ? 'w-0 opacity-0' : 'w-5'}`} />
              <span className={`h-0.5 bg-current rounded transition-all duration-300 ${mobileMenuOpen ? 'w-5 -rotate-45 -translate-y-1.5' : 'w-5'}`} />
            </button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">

          {/* Mobile Menu Drawer Overlay */}
          <div className={`fixed inset-0 z-[1099] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileMenuOpen(false)} />

          {/* Mobile Menu Drawer Sidebar */}
          <div className={`fixed top-0 right-0 bottom-0 z-[1100] w-72 max-w-[80vw] bg-white border-l border-gold/15 shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col p-6 gap-6 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex justify-between items-center pb-4 border-b border-gold/15">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gold rounded-xl flex items-center justify-center shadow-md shadow-gold/25">
                  <IconLotus className="w-5.5 h-5.5 text-white" />
                </div>
                <div className="leading-tight">
                  <div className="font-sans text-base font-bold text-slate-900">RamSetu Admin</div>
                  <div className="text-[9px] text-gold font-bold tracking-wider uppercase">Portal Navigation</div>
                </div>
              </div>
              <button className="p-2 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold hover:text-dark transition-all duration-300 border-none cursor-pointer flex items-center justify-center" onClick={() => setMobileMenuOpen(false)}>
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto flex-grow pr-1 no-scrollbar">
              {[
                { id: 'dashboard', label: 'Sales Overview', icon: TrendingUp },
                { id: 'products', label: 'Products & Stock', icon: Package },
                { id: 'orders', label: 'Sales & Orders', icon: ShoppingBag },
                { id: 'reviews', label: 'Product Reviews', icon: Star },
                { id: 'users', label: 'Customer Accounts', icon: UsersIcon },
                { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
                { id: 'contacts', label: 'Contact Inquiries', icon: Mail },
                { id: 'settings', label: 'Portal Settings', icon: SettingsIcon },
              ].map(t => {
                const IconComp = t.icon
                return (
                  <button
                    key={t.id}
                    onClick={() => { setTab(t.id); setSearchQuery(''); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all border ${tab === t.id
                      ? 'bg-gold border-gold/50 text-white shadow-md'
                      : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100'
                      }`}
                  >
                    <IconComp className="w-4.5 h-4.5" />
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="pt-4 border-t border-gold/15 flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-slate-400 block px-2 truncate">{user?.email}</span>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 rounded-xl border border-gold/20 bg-transparent text-gold hover:bg-gold/5 text-center font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>View Site</span>
                </Link>
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className="w-full py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-center font-bold text-xs uppercase tracking-widest border border-red-200/50 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Elegant Sidebar (Desktop) */}
          <aside className="hidden lg:flex lg:w-64 shrink-0 flex-col gap-1 relative z-10 lg:sticky lg:top-[90px] self-start transform-gpu">
            {[
              { id: 'dashboard', label: 'Sales Overview', icon: TrendingUp },
              { id: 'products', label: 'Products & Stock', icon: Package },
              { id: 'orders', label: 'Sales & Orders', icon: ShoppingBag },
              { id: 'reviews', label: 'Product Reviews', icon: Star },
              { id: 'users', label: 'Customer Accounts', icon: UsersIcon },
              { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
              { id: 'contacts', label: 'Contact Inquiries', icon: Mail },
              { id: 'settings', label: 'Portal Settings', icon: SettingsIcon },
            ].map(t => {
              const IconComp = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer border ${tab === t.id
                    ? 'bg-gold border-gold/50 text-white shadow-[0_8px_25px_-8px_rgba(200,134,10,0.45)]'
                    : 'bg-white/85 backdrop-blur-sm text-slate-600 border-gold/15 hover:border-gold/30 hover:bg-white hover:text-dark'
                    }`}
                >
                  <IconComp className="w-4.5 h-4.5" />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </aside>

          {/* Main Panel */}
          <main className="flex-1 min-w-0">
            {fetching ? (
              <div className="h-96 bg-white border border-gold/10 rounded-3xl flex items-center justify-center flex-col gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Loading Data…</span>
              </div>
            ) : (
              <div className="relative z-10 bg-white/90 backdrop-blur-md border border-gold/15 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_-20px_rgba(184,137,58,0.12)]">

                {/* ─── 0. Sales Dashboard Tab ─── */}
                {tab === 'dashboard' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-950">Sales Overview</h2>
                      <p className="text-xs text-slate-500 mt-1">Real-time store activity, sales statistics, and metrics overview.</p>
                    </div>

                    {/* Dashboard Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Revenue Card */}
                      <div className="group relative bg-white border border-gold/10 rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_15px_35px_-10px_rgba(16,185,129,0.18)] hover:border-emerald-500/30">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-500/80" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Revenue</span>
                          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tracking-tight">₹{Math.round(totalSales)}</h3>
                          <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold inline-flex items-center gap-0.5 mt-2">✦ Paid &amp; Delivered</span>
                        </div>
                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-inner">
                          <DollarSign className="w-5.5 h-5.5" />
                        </div>
                      </div>

                      {/* Orders Card */}
                      <div className="group relative bg-white border border-gold/10 rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_15px_35px_-10px_rgba(245,158,11,0.18)] hover:border-amber-500/30">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500/80" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Orders</span>
                          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tracking-tight">{orders.length}</h3>
                          <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold inline-flex items-center gap-0.5 mt-2">✦ Store Checkout</span>
                        </div>
                        <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-inner">
                          <ShoppingBag className="w-5.5 h-5.5" />
                        </div>
                      </div>

                      {/* Avg Order Value Card */}
                      <div className="group relative bg-white border border-gold/10 rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_15px_35px_-10px_rgba(59,130,246,0.18)] hover:border-blue-500/30">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500/80" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Avg. Order Value</span>
                          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tracking-tight">₹{Math.round(avgOrderValue)}</h3>
                          <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold inline-flex items-center gap-0.5 mt-2">✦ Average Basket</span>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-inner">
                          <TrendingUp className="w-5.5 h-5.5" />
                        </div>
                      </div>

                      {/* Users Card */}
                      <div className="group relative bg-white border border-gold/10 rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_15px_35px_-10px_rgba(139,92,246,0.18)] hover:border-violet-500/30">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-violet-500/80" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Registered Users</span>
                          <h3 className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tracking-tight">{usersList.length}</h3>
                          <span className="text-[9px] text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded font-bold inline-flex items-center gap-0.5 mt-2">✦ Devotees</span>
                        </div>
                        <div className="w-12 h-12 bg-violet-500/10 text-violet-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300 shadow-inner">
                          <UsersIcon className="w-5.5 h-5.5" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Recent Orders Widget */}
                      <div className="border border-gold/10 rounded-2xl p-6 bg-gradient-to-b from-[#FFFDF9] to-white shadow-[0_4px_20px_rgba(200,134,10,0.02)]">
                        <div className="flex justify-between items-center mb-5">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Recent Sales Activity</h3>
                            <p className="text-[10px] text-slate-400">Latest shop orders and status updates</p>
                          </div>
                          <button onClick={() => setTab('orders')} className="text-xs font-bold text-gold hover:text-white hover:bg-gold bg-white border border-gold/15 px-3.5 py-2 rounded-xl shadow-sm transition-all duration-200 cursor-pointer">View All</button>
                        </div>
                        <div className="space-y-3.5">
                          {orders.slice(0, 5).map(o => (
                            <div key={o.id} className="bg-white p-4 rounded-xl border border-gold/10 hover:border-gold/30 shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-slate-950 font-mono">#{String(o.id).slice(0, 8).toUpperCase()}</span>
                                <div className="text-[10px] font-semibold text-slate-600 mt-1">{o.shipping_address?.full_name}</div>
                              </div>
                              <div className="text-right">
                                <span className="font-extrabold text-slate-950">₹{Math.round(o.total_amount)}</span>
                                <div className="mt-1">
                                  <span className={`inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${o.order_status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                    {o.order_status || 'Pending'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {orders.length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-xs font-semibold">No orders recorded yet.</div>
                          )}
                        </div>
                      </div>

                      {/* Recent Registrations Widget */}
                      <div className="border border-gold/10 rounded-2xl p-6 bg-gradient-to-b from-[#FFFDF9] to-white shadow-[0_4px_20px_rgba(200,134,10,0.02)]">
                        <div className="flex justify-between items-center mb-5">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">New Customer Registrations</h3>
                            <p className="text-[10px] text-slate-400">Newly registered user profiles</p>
                          </div>
                          <button onClick={() => setTab('users')} className="text-xs font-bold text-gold hover:text-white hover:bg-gold bg-white border border-gold/15 px-3.5 py-2 rounded-xl shadow-sm transition-all duration-200 cursor-pointer">View All</button>
                        </div>
                        <div className="space-y-3.5">
                          {usersList.slice(0, 5).map(u => (
                            <div key={u.id} className="bg-white p-4 rounded-xl border border-gold/10 hover:border-gold/30 shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-slate-950">{u.name || 'Anonymous User'}</span>
                                <div className="text-[10px] text-slate-500 font-semibold mt-1">{u.email}</div>
                              </div>
                              <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${u.is_admin ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                                {u.is_admin ? 'Admin' : 'Customer'}
                              </span>
                            </div>
                          ))}
                          {usersList.length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-xs font-semibold">No registered users yet.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── 1. Products Inventory Tab ─── */}
                {tab === 'products' && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                      <div>
                        <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-950">Products Catalog</h2>
                        <p className="text-xs text-slate-500 mt-1">Manage single product configurations, SEO information, and stock levels.</p>
                      </div>
                      <button onClick={openAddProduct} className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-gold hover:bg-dark text-white border border-gold/20 font-bold text-xs uppercase tracking-wider shadow-[0_8px_20px_-6px_rgba(200,134,10,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer">
                        <Plus className="w-4 h-4" />
                        <span>Add Product</span>
                      </button>
                    </div>

                    {/* Search bar */}
                    <div className="relative mb-6">
                      <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search products by name or slug..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-gold/15 focus:border-gold focus:ring-1 focus:ring-gold/30 focus:bg-white rounded-xl text-sm outline-none text-slate-800 transition-all duration-300"
                      />
                    </div>

                    <div className="overflow-hidden border border-gold/10 rounded-2xl bg-white">
                      {/* Desktop Table View */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-gold/10 text-gold font-bold uppercase tracking-wider text-[10px] bg-gradient-to-r from-[#FFFDF9] to-white">
                              <th className="p-4">Product Details</th>
                              <th className="p-4">Price</th>
                              <th className="p-4 w-44">Stock Status</th>
                              <th className="p-4 text-center">Store Visibility</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredProducts.map(p => (
                              <tr key={p.id} className="group hover:bg-[#FFFDF9]/40 transition-colors duration-150">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl border border-gold/15 bg-cream2 overflow-hidden shadow-sm shrink-0">
                                      <img src={primaryImage(p)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <div>
                                      <div className="font-bold text-slate-900 group-hover:text-gold transition-colors duration-150">{p.name}</div>
                                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{p.slug}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="font-extrabold text-slate-950 font-mono text-sm">₹{Math.round(p.price)}</div>
                                  {p.compare_price && (
                                    <del className="text-[10px] text-slate-400 font-normal font-mono block">₹{Math.round(p.compare_price)}</del>
                                  )}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      defaultValue={p.stock_qty}
                                      onBlur={(e) => quickUpdateStock(p.id, e.target.value)}
                                      className="w-16 px-2.5 py-1 bg-slate-50 border border-gold/15 hover:border-gold/30 focus:border-gold focus:bg-white rounded-lg text-slate-900 text-center text-xs font-bold font-mono focus:outline-none transition-all"
                                    />
                                    <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${p.stock_qty > 0
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                      : 'bg-red-50 text-red-700 border-red-100'}`}>
                                      {p.stock_qty > 0 ? 'In Stock' : 'Out'}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => toggleProductActive(p)}
                                    className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider cursor-pointer border transition-all duration-300 ${p.is_active
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
                                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/70'
                                      }`}
                                  >
                                    {p.is_active ? 'Active' : 'Hidden'}
                                  </button>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button onClick={() => openEditProduct(p)} className="p-2 rounded-lg hover:bg-gold/10 text-gold hover:text-gold-light transition-all duration-200 cursor-pointer border border-transparent" title="Edit">
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200 cursor-pointer border border-transparent" title="Delete">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards List View */}
                      <div className="block sm:hidden divide-y divide-slate-100 p-4 space-y-4">
                        {filteredProducts.map(p => (
                          <div key={p.id} className="pt-4 first:pt-0 flex flex-col gap-3">
                            <div className="flex gap-3 min-w-0">
                              <div className="w-14 h-14 rounded-xl border border-gold/15 bg-cream2 overflow-hidden shadow-sm shrink-0">
                                <img src={primaryImage(p)} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0 flex-grow">
                                <div className="font-bold text-slate-900 leading-snug truncate">{p.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">{p.slug}</div>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="font-extrabold text-slate-950 font-mono">₹{Math.round(p.price)}</span>
                                  {p.compare_price && (
                                    <del className="text-[10px] text-slate-450 font-mono">₹{Math.round(p.compare_price)}</del>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-50">
                              {/* Stock status configuration */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Stock:</span>
                                <input
                                  type="number"
                                  defaultValue={p.stock_qty}
                                  onBlur={(e) => quickUpdateStock(p.id, e.target.value)}
                                  className="w-12 px-1.5 py-0.5 bg-slate-50 border border-gold/15 focus:border-gold focus:bg-white rounded-lg text-slate-900 text-center text-xs font-bold font-mono focus:outline-none transition-all"
                                />
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide border ${p.stock_qty > 0
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-red-50 text-red-700 border-red-100'}`}>
                                  {p.stock_qty > 0 ? 'In' : 'Out'}
                                </span>
                              </div>

                              {/* Visibility */}
                              <button
                                onClick={() => toggleProductActive(p)}
                                className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider cursor-pointer border transition-all duration-300 ${p.is_active
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}
                              >
                                {p.is_active ? 'Active' : 'Hidden'}
                              </button>

                              {/* Action triggers */}
                              <div className="flex items-center gap-0.5">
                                <button onClick={() => openEditProduct(p)} className="p-1 rounded-lg hover:bg-gold/10 text-gold transition-all duration-200 cursor-pointer border border-transparent" title="Edit">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteProduct(p.id)} className="p-1 rounded-lg hover:bg-red-50 text-red-650 transition-all duration-200 cursor-pointer border border-transparent" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── 2. Orders Panel Tab ─── */}
                {tab === 'orders' && (
                  <div>
                    <div className="flex justify-between items-center gap-4 mb-8">
                      <div>
                        <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-950">Customer Orders</h2>
                        <p className="text-xs text-slate-500 mt-1">Review orders, update status, and manage deliveries.</p>
                      </div>
                    </div>

                    {/* Search bar */}
                    <div className="relative mb-6">
                      <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search orders by customer name or ID..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-gold/15 focus:border-gold focus:ring-1 focus:ring-gold/30 focus:bg-white rounded-xl text-sm outline-none text-slate-800 transition-all duration-300"
                      />
                    </div>

                    <div className="overflow-hidden border border-gold/10 rounded-2xl bg-white">
                      {/* Desktop Table View */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-gold/10 text-gold font-bold uppercase tracking-wider text-[10px] bg-gradient-to-r from-[#FFFDF9] to-white">
                              <th className="p-4">Order ID</th>
                              <th className="p-4">Customer Details</th>
                              <th className="p-4">Items &amp; Method</th>
                              <th className="p-4">Amount</th>
                              <th className="p-4 text-center">Status</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredOrders.map(o => {
                              const date = new Date(o.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                              return (
                                <tr key={o.id} className="group hover:bg-[#FFFDF9]/40 transition-colors duration-150">
                                  <td className="p-4">
                                    <span className="font-bold text-slate-950 font-mono text-xs group-hover:text-gold transition-colors">#{String(o.id).slice(0, 8).toUpperCase()}</span>
                                    <div className="text-[10px] text-slate-400 mt-0.5">{date}</div>
                                  </td>
                                  <td className="p-4 text-xs">
                                    <div className="font-extrabold text-slate-850">{o.shipping_address?.full_name}</div>
                                    <div className="text-slate-500 mt-0.5 font-medium">{o.shipping_address?.phone}</div>
                                    <div className="text-[10px] text-slate-455 mt-0.5 max-w-[200px] truncate" title={o.shipping_address?.address}>
                                      {o.shipping_address?.address}, {o.shipping_address?.city}
                                    </div>
                                  </td>
                                  <td className="p-4 text-xs">
                                    <div className="font-bold text-slate-800">
                                      {o.order_items?.map(item => `${item.products?.name || 'Stone'} (x${item.qty})`).join(', ')}
                                    </div>
                                    <div className="text-[9px] mt-1.5 inline-flex items-center gap-1 font-extrabold uppercase tracking-wide">
                                      {o.payment_method === 'cod' ? (
                                        <span className="text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md">📦 COD</span>
                                      ) : (
                                        <span className="text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">💳 Online</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-extrabold text-slate-950 font-mono text-sm">₹{Math.round(o.total_amount)}</div>
                                    <div className="text-[9px] text-slate-400 font-normal font-mono">Ship: ₹{o.shipping_amount}</div>
                                  </td>
                                  <td className="p-4 text-center">
                                    <select
                                      value={o.order_status || 'pending'}
                                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                      className="px-2.5 py-1.5 bg-slate-50 border border-gold/15 hover:border-gold/30 text-slate-800 text-xs font-semibold rounded-lg focus:outline-none cursor-pointer transition-all"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="confirmed">Confirmed</option>
                                      <option value="processing">Processing</option>
                                      <option value="shipped">Shipped</option>
                                      <option value="delivered">Delivered</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                  </td>
                                  <td className="p-4 text-right">
                                    <button
                                      onClick={() => setViewOrder(o)}
                                      className="p-2 rounded-lg hover:bg-gold/10 text-gold hover:text-gold-light transition-all duration-200 cursor-pointer border border-transparent"
                                      title="View Details"
                                    >
                                      <Eye className="w-4.5 h-4.5" />
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards List View */}
                      <div className="block sm:hidden divide-y divide-slate-100 p-4 space-y-4">
                        {filteredOrders.map(o => {
                          const date = new Date(o.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                          return (
                            <div key={o.id} className="pt-4 first:pt-0 flex flex-col gap-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-bold text-slate-950 font-mono text-xs">#{String(o.id).slice(0, 8).toUpperCase()}</span>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{date}</div>
                                </div>
                                <div className="text-right">
                                  <span className="font-extrabold text-slate-950 font-mono">₹{Math.round(o.total_amount)}</span>
                                  <div className="text-[9px] text-slate-400 font-mono">Ship: ₹{o.shipping_amount}</div>
                                </div>
                              </div>

                              <div className="text-xs">
                                <div className="font-extrabold text-slate-850">{o.shipping_address?.full_name} ({o.shipping_address?.phone})</div>
                                <div className="text-[10px] text-slate-500 mt-0.5 truncate">{o.shipping_address?.address}, {o.shipping_address?.city}</div>
                                <div className="text-slate-700 font-semibold mt-1">
                                  {o.order_items?.map(item => `${item.products?.name || 'Stone'} (x${item.qty})`).join(', ')}
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                  {o.payment_method === 'cod' ? (
                                    <span className="text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase">📦 COD</span>
                                  ) : (
                                    <span className="text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase">💳 Online</span>
                                  )}
                                </div>

                                <select
                                  value={o.order_status || 'pending'}
                                  onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                  className="px-2 py-1 bg-slate-50 border border-gold/15 hover:border-gold/30 text-slate-800 text-[10px] font-semibold rounded-lg focus:outline-none cursor-pointer uppercase transition-all"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>

                                <button
                                  onClick={() => setViewOrder(o)}
                                  className="p-1 rounded-lg hover:bg-gold/10 text-gold transition-all duration-250 cursor-pointer border border-transparent flex items-center justify-center shrink-0"
                                  title="View Details"
                                >
                                  <Eye className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── 3. Users Accounts Tab ─── */}
                {tab === 'users' && (
                  <div>
                    <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-950">Customer Accounts</h2>
                        <p className="text-xs text-slate-500 mt-1">Review registered customer profiles and access roles.</p>
                      </div>
                      <div className="bg-gradient-to-br from-[#FFFDF9] to-white border border-gold/15 rounded-2xl px-5 py-3 flex items-center gap-3.5 shadow-sm">
                        <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                          <UsersIcon className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Total Devotees</span>
                          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">{usersList.length}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden border border-gold/10 rounded-2xl bg-white">
                      {/* Desktop Table View */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-gold/10 text-gold font-bold uppercase tracking-wider text-[10px] bg-gradient-to-r from-[#FFFDF9] to-white">
                              <th className="p-4">Full Name</th>
                              <th className="p-4">Email</th>
                              <th className="p-4">User ID</th>
                              <th className="p-4 text-right">Access Role</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {usersList.map(u => (
                              <tr key={u.id} className="group hover:bg-[#FFFDF9]/40 transition-colors duration-150">
                                <td className="p-4 font-bold text-slate-900 group-hover:text-gold transition-colors">{u.name || 'Anonymous User'}</td>
                                <td className="p-4 text-slate-600 font-medium">{u.email}</td>
                                <td className="p-4 font-mono text-xs text-slate-400">{u.id}</td>
                                <td className="p-4 text-right">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${u.is_admin
                                    ? 'bg-gold/10 text-gold border-gold/20 shadow-sm shadow-gold/5'
                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                    }`}>
                                    {u.is_admin ? 'Administrator' : 'Customer'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards List View */}
                      <div className="block sm:hidden divide-y divide-slate-100 p-4 space-y-4">
                        {usersList.map(u => (
                          <div key={u.id} className="pt-4 first:pt-0 flex flex-col gap-2">
                            <div className="flex justify-between items-start gap-4">
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 leading-snug truncate">{u.name || 'Anonymous User'}</div>
                                <div className="text-xs text-slate-550 font-medium mt-0.5 truncate">{u.email}</div>
                              </div>
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase border shrink-0 ${u.is_admin
                                ? 'bg-gold/10 text-gold border-gold/20 shadow-sm shadow-gold/5'
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                {u.is_admin ? 'Admin' : 'Customer'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-1 break-all">ID: {u.id}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}


                {/* ─── 4. Coupons & Promos Tab ─── */}
                {tab === 'coupons' && (
                  <div>
                    <div className="mb-8">
                      <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-950">Coupons &amp; Promos</h2>
                      <p className="text-xs text-slate-500 mt-1">Create and manage coupon codes to offer discounts during checkout.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Create Coupon Form Card */}
                      <div className="bg-slate-50/50 border border-gold/10 p-6 rounded-2xl h-fit space-y-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-gold flex items-center gap-2 pb-2 border-b border-gold/10">
                          <Plus className="w-4.5 h-4.5" />
                          <span>Create New Coupon</span>
                        </h3>
                        
                        <div className="space-y-4 pt-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Coupon Code *</label>
                            <input
                              type="text"
                              placeholder="e.g. RAMNAVAMI20"
                              value={couponCode}
                              onChange={e => setCouponCode(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-white border border-gold/15 focus:border-gold rounded-xl text-slate-800 text-sm font-bold uppercase focus:outline-none transition-all"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Discount Value *</label>
                            <input
                              type="number"
                              placeholder="e.g. 10 or 150"
                              value={couponDiscount}
                              onChange={e => setCouponDiscount(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-white border border-gold/15 focus:border-gold rounded-xl text-slate-800 text-sm font-bold focus:outline-none transition-all"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Discount Type</label>
                            <select
                              value={couponType}
                              onChange={e => setCouponType(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-white border border-gold/15 focus:border-gold rounded-xl text-slate-800 text-sm font-bold focus:outline-none cursor-pointer"
                            >
                              <option value="percent">Percentage (%)</option>
                              <option value="flat">Flat Amount (₹)</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={addCoupon}
                            className="w-full py-3.5 rounded-xl bg-gold hover:bg-dark text-white font-bold text-xs uppercase tracking-wider shadow-[0_8px_20px_-6px_rgba(200,134,10,0.4)] transition-all duration-350 cursor-pointer"
                          >
                            Add Coupon
                          </button>
                        </div>
                      </div>

                      {/* Coupons List Table */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="overflow-hidden border border-gold/10 rounded-2xl bg-white">
                          {/* Desktop Table View */}
                          <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                              <thead>
                                <tr className="border-b border-gold/10 text-gold font-bold uppercase tracking-wider text-[10px] bg-gradient-to-r from-[#FFFDF9] to-white">
                                  <th className="p-4">Coupon Code</th>
                                  <th className="p-4">Discount</th>
                                  <th className="p-4">Type</th>
                                  <th className="p-4 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {coupons.length === 0 ? (
                                  <tr>
                                    <td colSpan={4} className="p-8 text-center text-xs text-slate-400 font-bold">
                                      No coupons available. Create one to get started!
                                    </td>
                                  </tr>
                                ) : (
                                  coupons.map(c => (
                                    <tr key={c.id} className="group hover:bg-[#FFFDF9]/40 transition-colors duration-150">
                                      <td className="p-4 font-mono font-bold text-slate-900 group-hover:text-gold transition-colors">{c.code}</td>
                                      <td className="p-4 text-slate-800 font-extrabold">{c.discount_value}</td>
                                      <td className="p-4 text-slate-650 font-bold uppercase text-xs">
                                        {c.discount_type === 'percent' ? 'Percentage' : 'Flat Amount'}
                                      </td>
                                      <td className="p-4 text-right">
                                        <button
                                          type="button"
                                          onClick={() => deleteCoupon(c.id)}
                                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-transparent cursor-pointer inline-flex items-center justify-center"
                                          title="Delete Coupon"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Cards List View */}
                          <div className="block sm:hidden divide-y divide-slate-100 p-4 space-y-4">
                            {coupons.length === 0 ? (
                              <p className="text-center text-xs text-slate-400 font-bold py-4">No coupons available.</p>
                            ) : (
                              coupons.map(c => (
                                <div key={c.id} className="pt-4 first:pt-0 flex justify-between items-center gap-4">
                                  <div>
                                    <div className="font-mono font-bold text-slate-900">{c.code}</div>
                                    <div className="text-xs text-slate-500 font-semibold mt-0.5">
                                      {c.discount_type === 'percent' ? `${c.discount_value}% Off` : `₹${c.discount_value} Off`}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => deleteCoupon(c.id)}
                                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-transparent cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                {/* ─── 5. Portal Settings Tab ─── */}
                {tab === 'settings' && (
                  <div>
                    <div className="mb-8">
                      <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-950">Portal Settings</h2>
                      <p className="text-xs text-slate-500 mt-1">Configure shipping rules, toggle payment methods, and manage API keys.</p>
                    </div>

                    <form onSubmit={saveSettings} className="space-y-8 max-w-2xl">
                      {/* Shipping charge settings */}
                      <div className="space-y-4 bg-slate-50/50 border border-gold/10 p-6 rounded-2xl">
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-gold flex items-center gap-2 pb-2 border-b border-gold/10">
                          <Truck className="w-4.5 h-4.5" />
                          <span>Delivery &amp; Shipping Charges</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Free Shipping Threshold (₹)</label>
                            <input
                              type="number"
                              value={settings.shipping_threshold}
                              onChange={e => setSettings(s => ({ ...s, shipping_threshold: parseFloat(e.target.value) || 0 }))}
                              className="w-full px-3.5 py-2.5 bg-white border border-gold/15 focus:border-gold rounded-xl text-slate-800 text-sm focus:outline-none font-mono transition-all"
                            />
                            <p className="text-[9px] text-slate-400 font-medium">Orders above this qualify for free shipping.</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Flat Shipping Fee (₹)</label>
                            <input
                              type="number"
                              value={settings.shipping_flat_rate}
                              onChange={e => setSettings(s => ({ ...s, shipping_flat_rate: parseFloat(e.target.value) || 0 }))}
                              className="w-full px-3.5 py-2.5 bg-white border border-gold/15 focus:border-gold rounded-xl text-slate-800 text-sm focus:outline-none font-mono transition-all"
                            />
                            <p className="text-[9px] text-slate-400 font-medium">Shipping fee for orders under threshold limit.</p>
                          </div>
                        </div>
                      </div>

                      {/* Payment gateway toggles */}
                      <div className="space-y-4 bg-slate-50/50 border border-gold/10 p-6 rounded-2xl">
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-gold flex items-center gap-2 pb-2 border-b border-gold/10">
                          <CreditCard className="w-4.5 h-4.5" />
                          <span>Payment Gateways Configuration</span>
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-6 pt-2">
                          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={settings.enable_razorpay}
                              onChange={e => setSettings(s => ({ ...s, enable_razorpay: e.target.checked }))}
                              className="w-4.5 h-4.5 accent-gold cursor-pointer rounded border-gold/30"
                            />
                            <span className="group-hover:text-gold transition-colors">Enable Razorpay Gateway</span>
                          </label>
                          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={settings.enable_cod}
                              onChange={e => setSettings(s => ({ ...s, enable_cod: e.target.checked }))}
                              className="w-4.5 h-4.5 accent-gold cursor-pointer rounded border-gold/30"
                            />
                            <span className="group-hover:text-gold transition-colors">Enable Cash on Delivery (COD)</span>
                          </label>
                        </div>
                      </div>

                      {/* Razorpay specific inputs removed for environment security */}


                      <button type="submit" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gold hover:bg-dark text-white font-bold text-xs uppercase tracking-wider shadow-[0_8px_20px_-6px_rgba(200,134,10,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer">
                        Save Configurations
                      </button>
                    </form>
                  </div>
                )}

                {/* ─── 6. Contact Inquiries Tab ─── */}
                {tab === 'contacts' && (
                  <div>
                    <div className="mb-8 flex justify-between items-center">
                      <div>
                        <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-950">Contact Inquiries</h2>
                        <p className="text-xs text-slate-500 mt-1">Read and manage inquiries submitted by users via the contact form.</p>
                      </div>
                      <span className="bg-gold/10 border border-gold/20 text-gold text-xs font-bold px-3 py-1.5 rounded-full">
                        {contacts.length} Message{contacts.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="bg-white rounded-3xl border border-gold/15 overflow-hidden shadow-sm">
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-gold border-b border-gold/10 bg-gradient-to-r from-[#FFFDF9] to-white">
                              <th className="px-6 py-4">Sender Details</th>
                              <th className="px-6 py-4">Subject</th>
                              <th className="px-6 py-4">Message</th>
                              <th className="px-6 py-4">Received Date</th>
                              <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {contacts.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-8 text-xs text-slate-400 font-bold">
                                  No contact inquiries found.
                                </td>
                              </tr>
                            ) : (
                              contacts.map(c => (
                                <tr key={c.id} className="text-xs hover:bg-[#FFFDF9]/40 transition-colors">
                                  <td className="px-6 py-4 space-y-1">
                                    <div className="font-bold text-slate-900">{c.name}</div>
                                    <div className="text-slate-500 font-semibold">{c.email}</div>
                                    {c.phone && <div className="text-slate-400 font-semibold">{c.phone}</div>}
                                  </td>
                                  <td className="px-6 py-4 font-bold text-slate-800">{c.subject}</td>
                                  <td className="px-6 py-4 text-slate-600 max-w-xs break-words leading-relaxed whitespace-pre-wrap">{c.message}</td>
                                  <td className="px-6 py-4 text-slate-400 font-semibold">
                                    {new Date(c.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <button
                                      type="button"
                                      onClick={() => deleteContact(c.id)}
                                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-transparent cursor-pointer inline-flex items-center justify-center transition-colors"
                                      title="Delete Inquiry"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards View */}
                      <div className="block md:hidden divide-y divide-slate-100 p-4 space-y-4">
                        {contacts.length === 0 ? (
                          <p className="text-center text-xs text-slate-400 font-bold py-4">No contact inquiries found.</p>
                        ) : (
                          contacts.map(c => (
                            <div key={c.id} className="pt-4 first:pt-0 space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                                  <div className="text-xs text-slate-500 font-semibold mt-0.5">{c.email}</div>
                                  {c.phone && <div className="text-xs text-slate-400 font-semibold">{c.phone}</div>}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => deleteContact(c.id)}
                                  className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-transparent cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="bg-slate-50 p-4 rounded-xl border border-gold/5 text-xs">
                                <div className="font-bold text-slate-800 mb-1.5">Subject: {c.subject}</div>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{c.message}</p>
                              </div>
                              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-right">
                                {new Date(c.created_at).toLocaleString('en-IN')}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}


                {/* ─── 7. Product Reviews Tab ─── */}
                {tab === 'reviews' && (
                  <div>
                    <div className="mb-8 flex justify-between items-center">
                      <div>
                        <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-950">Product Reviews</h2>
                        <p className="text-xs text-slate-500 mt-1">Approve or delete customer reviews submitted for products.</p>
                      </div>
                      <span className="bg-gold/10 border border-gold/20 text-gold text-xs font-bold px-3 py-1.5 rounded-full">
                        {adminReviews.length} Review{adminReviews.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="bg-white rounded-3xl border border-gold/15 overflow-hidden shadow-sm">
                      {/* Desktop Table View */}
                      <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-gold border-b border-gold/10 bg-gradient-to-r from-[#FFFDF9] to-white">
                              <th className="px-6 py-4">Product</th>
                              <th className="px-6 py-4">Devotee Info</th>
                              <th className="px-6 py-4">Rating</th>
                              <th className="px-6 py-4">Review Content</th>
                              <th className="px-6 py-4 text-center">Status</th>
                              <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {adminReviews.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="text-center py-8 text-xs text-slate-400 font-bold">
                                  No reviews found.
                                </td>
                              </tr>
                            ) : (
                              adminReviews.map(r => (
                                <tr key={r.id} className="text-xs hover:bg-[#FFFDF9]/40 transition-colors">
                                  <td className="px-6 py-4 font-bold text-slate-900 max-w-[120px] truncate">
                                    {r.products?.name || 'Divine Stone'}
                                  </td>
                                  <td className="px-6 py-4 space-y-0.5">
                                    <div className="font-bold text-slate-800">{r.name}</div>
                                    <div className="text-[10px] text-slate-400 font-semibold">
                                      Order: #{r.order_id ? r.order_id.slice(0, 8).toUpperCase() : 'N/A'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex gap-0.5 text-gold">
                                      {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`w-3.5 h-3.5 ${
                                            i < r.rating ? 'fill-current' : 'text-gray-200'
                                          }`} 
                                        />
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 max-w-xs space-y-1">
                                    {r.title && <div className="font-bold text-slate-950">{r.title}</div>}
                                    <p className="text-slate-600 leading-relaxed italic">"{r.comment.length > 40 ? r.comment.slice(0, 40) + '...' : r.comment}"</p>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    {r.is_approved ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/30 rounded-full font-bold text-[9px] uppercase tracking-wider">Approved</span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/30 rounded-full font-bold text-[9px] uppercase tracking-wider animate-pulse">Pending</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => setViewReview(r)}
                                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-transparent cursor-pointer inline-flex items-center justify-center transition-colors"
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    {!r.is_approved && (
                                      <button
                                        type="button"
                                        onClick={() => approveReview(r.id)}
                                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-transparent cursor-pointer inline-flex items-center justify-center transition-colors"
                                        title="Approve Review"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => deleteReview(r.id)}
                                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-transparent cursor-pointer inline-flex items-center justify-center transition-colors"
                                      title="Delete Review"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards View */}
                      <div className="block lg:hidden divide-y divide-slate-100 p-4 space-y-4">
                        {adminReviews.length === 0 ? (
                          <p className="text-center text-xs text-slate-400 font-bold py-4">No reviews found.</p>
                        ) : (
                          adminReviews.map(r => (
                            <div key={r.id} className="pt-4 first:pt-0 space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <div className="text-[10px] uppercase font-black tracking-wider text-gold">{r.products?.name || 'Divine Stone'}</div>
                                  <div className="font-bold text-slate-900 text-sm mt-0.5">{r.name}</div>
                                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Order: #{r.order_id ? r.order_id.slice(0, 8).toUpperCase() : 'N/A'}</div>
                                </div>
                                <div className="shrink-0">
                                  {r.is_approved ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/30 rounded-full font-bold text-[9px] uppercase tracking-wider">Approved</span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/30 rounded-full font-bold text-[9px] uppercase tracking-wider animate-pulse">Pending</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-0.5 text-gold">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3.5 h-3.5 ${
                                      i < r.rating ? 'fill-current' : 'text-gray-200'
                                    }`} 
                                  />
                                ))}
                              </div>

                              <div className="bg-slate-50 p-4 rounded-xl border border-gold/5 text-xs">
                                {r.title && <div className="font-bold text-slate-800 mb-1.5">{r.title}</div>}
                                <p className="text-slate-600 leading-relaxed italic">"{r.comment.length > 50 ? r.comment.slice(0, 50) + '...' : r.comment}"</p>
                              </div>

                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setViewReview(r)}
                                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors border border-transparent cursor-pointer flex items-center gap-1.5"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View
                                </button>
                                {!r.is_approved && (
                                  <button
                                    type="button"
                                    onClick={() => approveReview(r.id)}
                                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors border border-transparent cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Approve
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => deleteReview(r.id)}
                                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors border border-transparent cursor-pointer flex items-center gap-1.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white border border-gold/20 rounded-[2rem] p-6 sm:p-8 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl relative flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gold/15">
              <h3 className="font-sans text-base sm:text-lg md:text-xl font-black text-slate-900 uppercase tracking-widest">
                {modal === 'add' ? 'Add New Product' : 'Edit Product Details'}
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="p-1.5 rounded-full hover:bg-gold/10 text-slate-400 hover:text-gold transition-all cursor-pointer border border-transparent"
                title="Close"
              >
                <XCircle className="w-6 h-6 sm:w-6.5 sm:h-6.5" />
              </button>
            </div>

            <div className="space-y-5 flex-1">
              <div>
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Divine Ram Setu Stone"
                  value={form.name ?? ''}
                  onChange={e => setForm(x => ({ ...x, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-gold/15 focus:border-gold focus:bg-white rounded-xl text-slate-800 text-sm sm:text-base font-bold focus:outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">Sale Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="799"
                    value={form.price ?? ''}
                    onChange={e => setForm(x => ({ ...x, price: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-gold/15 focus:border-gold focus:bg-white rounded-xl text-slate-800 text-sm sm:text-base font-bold focus:outline-none font-mono transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">Original Price (₹)</label>
                  <input
                    type="number"
                    placeholder="999"
                    value={form.compare_price ?? ''}
                    onChange={e => setForm(x => ({ ...x, compare_price: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-gold/15 focus:border-gold focus:bg-white rounded-xl text-slate-800 text-sm sm:text-base font-bold focus:outline-none font-mono transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">Stock Quantity</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={form.stock_qty ?? ''}
                    onChange={e => setForm(x => ({ ...x, stock_qty: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-gold/15 focus:border-gold focus:bg-white rounded-xl text-slate-800 text-sm sm:text-base font-bold focus:outline-none font-mono transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">Slug (URL)</label>
                  <input
                    type="text"
                    placeholder="auto-generated if empty"
                    value={form.slug ?? ''}
                    onChange={e => setForm(x => ({ ...x, slug: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-gold/15 focus:border-gold focus:bg-white rounded-xl text-slate-800 text-sm sm:text-base font-bold focus:outline-none font-mono transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Product description details..."
                  value={form.description ?? ''}
                  onChange={e => setForm(x => ({ ...x, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-gold/15 focus:border-gold focus:bg-white rounded-xl text-slate-800 text-sm sm:text-base font-bold focus:outline-none resize-none transition-all"
                />
              </div>

              {/* Product Images Management */}
              <div className="mt-6 pt-5 border-t border-gold/10 space-y-4">
                <h4 className="text-xs sm:text-sm font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-gold" /> Product Images
                </h4>
                <div className="bg-slate-50/50 border border-gold/10 p-6 rounded-[1.5rem] space-y-4">
                  {/* Grid of current images */}
                  {form.product_images && form.product_images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {form.product_images.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl border border-gold/15 bg-white overflow-hidden shadow-sm aspect-square flex flex-col justify-between">
                          <img src={img.url} alt="" className="w-full h-full object-cover absolute inset-0" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => moveProductImage(idx, 'left')}
                                className="p-1.5 rounded-lg bg-white hover:bg-gold hover:text-white text-slate-800 text-xs font-bold transition-all cursor-pointer"
                                title="Move Left"
                              >
                                ←
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setProductImagePrimary(idx)}
                              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                img.is_primary 
                                  ? 'bg-gold text-white cursor-default' 
                                  : 'bg-white hover:bg-gold hover:text-white text-slate-800'
                              }`}
                              title={img.is_primary ? 'Primary Image' : 'Set as Primary'}
                            >
                              ★
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProductImage(idx)}
                              className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all cursor-pointer"
                              title="Delete Image"
                            >
                              🗑
                            </button>
                            {idx < form.product_images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveProductImage(idx, 'right')}
                                className="p-1.5 rounded-lg bg-white hover:bg-gold hover:text-white text-slate-800 text-xs font-bold transition-all cursor-pointer"
                                title="Move Right"
                              >
                                →
                              </button>
                            )}
                          </div>
                          {img.is_primary && (
                            <span className="absolute top-1.5 left-1.5 bg-gold text-white text-[8px] font-black px-2 py-0.5 rounded shadow-sm tracking-widest uppercase">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-semibold text-center py-4">No images uploaded yet.</p>
                  )}

                  {/* Upload button with Loader Spinner */}
                  <div>
                    <label className="relative cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gold/25 hover:border-gold/50 rounded-xl p-5 bg-white hover:bg-[#FFFDF9] transition-all duration-300">
                      {uploadingImage ? (
                        <Loader2 className="w-8 h-8 text-gold mb-1.5 animate-spin" />
                      ) : (
                        <Plus className="w-8 h-8 text-gold mb-1.5" />
                      )}
                      <span className="text-[10px] sm:text-xs font-black text-gold uppercase tracking-wider">
                        {uploadingImage ? 'Uploading to Cloudinary...' : 'Upload Images'}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-1">Select one or more image files</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* SEO Management Fields */}
              <div className="mt-6 pt-5 border-t border-gold/10 space-y-4">
                <h4 className="text-xs sm:text-sm font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-gold" /> SEO Management
                </h4>
                <div className="bg-slate-50/50 border border-gold/10 p-6 rounded-[1.5rem] space-y-4">
                  <div>
                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">Meta Title</label>
                    <input
                      type="text"
                      placeholder="SEO Page Title"
                      value={form.meta_title ?? ''}
                      onChange={e => setForm(x => ({ ...x, meta_title: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-gold/15 focus:border-gold rounded-xl text-slate-800 text-sm sm:text-base font-bold focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">Meta Description</label>
                    <textarea
                      rows={2}
                      placeholder="SEO Page Description snippet..."
                      value={form.meta_description ?? ''}
                      onChange={e => setForm(x => ({ ...x, meta_description: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-gold/15 focus:border-gold rounded-xl text-slate-800 text-sm sm:text-base font-bold focus:outline-none resize-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 block mb-1.5">SEO Keywords</label>
                    <input
                      type="text"
                      placeholder="ram setu, sacred stone, floating stone"
                      value={form.seo_keywords ?? ''}
                      onChange={e => setForm(x => ({ ...x, seo_keywords: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-gold/15 focus:border-gold rounded-xl text-slate-800 text-sm sm:text-base font-bold focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Checkbox fields */}
              <div className="flex flex-col sm:flex-row gap-5 py-3 border-t border-gold/10 mt-6">
                <label className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 cursor-pointer group font-bold">
                  <input
                    type="checkbox"
                    checked={!!form.is_active}
                    onChange={e => setForm(x => ({ ...x, is_active: e.target.checked }))}
                    className="accent-gold w-5 h-5 cursor-pointer rounded"
                  />
                  <span className="group-hover:text-gold transition-colors">Active (visible in store)</span>
                </label>
                <label className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 cursor-pointer group font-bold">
                  <input
                    type="checkbox"
                    checked={!!form.is_featured}
                    onChange={e => setForm(x => ({ ...x, is_featured: e.target.checked }))}
                    className="accent-gold w-5 h-5 cursor-pointer rounded"
                  />
                  <span className="group-hover:text-gold transition-colors">Featured (homepage grid)</span>
                </label>
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="flex gap-4 mt-8 pt-4 border-t border-gold/15">
              <button
                type="button"
                onClick={saveProduct}
                disabled={saving}
                className="flex-1 py-4 rounded-xl bg-gold hover:bg-dark text-white font-black text-xs uppercase tracking-widest shadow-[0_8px_20px_-6px_rgba(200,134,10,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
              >
                {saving ? 'Saving Changes…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="px-6 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-colors duration-300 cursor-pointer border border-transparent"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Order Details */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white border border-gold/20 rounded-[2rem] w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl relative flex flex-col">
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-gold/15 flex flex-wrap justify-between items-start gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-gold mb-1.5">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Order Profile</span>
                </div>
                <h3 className="font-sans text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-2 sm:gap-4 break-all">
                  #{String(viewOrder.id).slice(0, 12).toUpperCase()}
                  <span className={`px-3 py-1 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest border ${viewOrder.order_status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {viewOrder.order_status || 'Pending'}
                  </span>
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gold" /> {new Date(viewOrder.created_at).toLocaleString('en-IN')}</span>
                  <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-gold/45" />
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gold" /> {viewOrder.payment_status === 'paid' ? 'Payment Captured' : 'Payment Awaiting'}</span>
                </div>
              </div>
              <button
                onClick={() => setViewOrder(null)}
                className="p-2 rounded-full hover:bg-gold/10 text-slate-400 hover:text-gold transition-all cursor-pointer border border-transparent shrink-0"
                title="Close"
              >
                <XCircle className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              {/* Customer & Shipping Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Profile Card */}
                <div className="space-y-4">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-gold border-b border-gold/15 pb-2.5 flex items-center gap-2">
                    <User className="w-4 h-4" /> Customer Profile
                  </h4>
                  <div className="space-y-4 bg-slate-50/50 border border-gold/10 p-6 rounded-[1.5rem]">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gold/10 flex items-center justify-center shrink-0 shadow-sm"><User className="w-5 h-5 text-gold" /></div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</div>
                        <div className="text-base sm:text-lg font-black text-slate-800">{viewOrder.shipping_address?.full_name}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 pt-3.5 border-t border-gold/10">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gold/10 flex items-center justify-center shrink-0 shadow-sm"><Mail className="w-5 h-5 text-gold" /></div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</div>
                        <div className="text-base sm:text-lg font-black text-slate-800">{viewOrder.shipping_address?.email || viewOrder.users?.email || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 pt-3.5 border-t border-gold/10">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gold/10 flex items-center justify-center shrink-0 shadow-sm"><Phone className="w-5 h-5 text-gold" /></div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</div>
                        <div className="text-base sm:text-lg font-black text-slate-800">{viewOrder.shipping_address?.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address Card */}
                <div className="space-y-4">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-gold border-b border-gold/15 pb-2.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Shipping Address
                  </h4>
                  <div className="bg-slate-50/50 border border-gold/10 rounded-[1.5rem] p-6 space-y-5">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivery Address</div>
                      <div className="text-base sm:text-lg font-black text-slate-800 leading-relaxed">
                        {viewOrder.shipping_address?.address}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gold/10">
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">City</div>
                        <div className="text-sm sm:text-base font-black text-slate-800">{viewOrder.shipping_address?.city}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">State</div>
                        <div className="text-sm sm:text-base font-black text-slate-800">{viewOrder.shipping_address?.state}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pincode</div>
                        <div className="text-sm sm:text-base font-black text-slate-850 font-mono">{viewOrder.shipping_address?.pincode}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-4">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-gold border-b border-gold/15 pb-2.5 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Items Summary
                </h4>
                <div className="overflow-hidden rounded-[1.5rem] border border-gold/10 bg-white">
                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="text-[10px] font-black uppercase tracking-widest text-gold border-b border-gold/10 bg-gradient-to-r from-[#FFFDF9] to-white">
                          <th className="px-6 py-4">Product</th>
                          <th className="px-6 py-4 text-center">Qty</th>
                          <th className="px-6 py-4 text-right">Unit Price</th>
                          <th className="px-6 py-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {viewOrder.order_items?.map((item, idx) => (
                          <tr key={idx} className="text-sm group hover:bg-[#FFFDF9]/40 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl border border-gold/15 bg-cream2 overflow-hidden shrink-0 shadow-sm">
                                  <img src={primaryImage(item.products)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <div className="font-black text-slate-800 text-sm sm:text-base">{item.products?.name || 'Product'}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center font-black text-slate-600 text-base">{item.qty}</td>
                            <td className="px-6 py-4 text-right font-black text-slate-500 font-mono text-sm sm:text-base">₹{Math.round(item.price)}</td>
                            <td className="px-6 py-4 text-right font-black text-slate-900 font-mono text-sm sm:text-base">₹{Math.round(item.price * item.qty)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="block sm:hidden divide-y divide-slate-100 p-4 space-y-4">
                    {viewOrder.order_items?.map((item, idx) => (
                      <div key={idx} className="flex gap-4 pt-4 first:pt-0 items-center justify-between text-sm">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-14 h-14 rounded-xl border border-gold/15 bg-cream2 overflow-hidden shrink-0 shadow-sm">
                            <img src={primaryImage(item.products)} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-slate-800 leading-snug truncate text-sm">{item.products?.name || 'Product'}</div>
                            <div className="text-xs text-slate-500 font-mono mt-1">Qty: {item.qty} × ₹{Math.round(item.price)}</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-black text-slate-900 font-mono text-base">₹{Math.round(item.price * item.qty)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary & Payment Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Payment Card */}
                <div className="space-y-4">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-gold border-b border-gold/15 pb-2.5 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Payment Details
                  </h4>
                  <div className="bg-slate-50/50 border border-gold/10 rounded-[1.5rem] p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Mode</span>
                      <span className="text-xs font-black uppercase">
                        {viewOrder.payment_method === 'cod' ? (
                          <span className="text-orange-700 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">📦 COD</span>
                        ) : (
                          <span className="text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">💳 Razorpay (Online)</span>
                        )}
                      </span>
                    </div>
                    {viewOrder.razorpay_order_id && (
                      <div className="pt-3.5 border-t border-gold/10 flex justify-between items-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Razorpay Order ID</div>
                        <div className="text-xs font-mono font-black text-gold">{viewOrder.razorpay_order_id}</div>
                      </div>
                    )}
                    {viewOrder.razorpay_payment_id && (
                      <div className="pt-3.5 border-t border-gold/10 flex justify-between items-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Razorpay Payment ID</div>
                        <div className="text-xs font-mono font-black text-gold">{viewOrder.razorpay_payment_id}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Billing Summary */}
                <div className="space-y-4">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-gold border-b border-gold/15 pb-2.5 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Billing Summary
                  </h4>
                  <div className="space-y-4 px-2">
                    <div className="flex justify-between text-sm sm:text-base font-bold">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="text-slate-800 font-mono">₹{Math.round(viewOrder.total_amount - viewOrder.shipping_amount + (viewOrder.discount_amount || 0))}</span>
                    </div>
                    {viewOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-sm sm:text-base text-emerald-600 font-bold">
                        <span>Discount {viewOrder.coupon_code && `(${viewOrder.coupon_code})`}</span>
                        <span className="font-mono">- ₹{Math.round(viewOrder.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm sm:text-base font-bold">
                      <span className="text-slate-400">Shipping Fee</span>
                      <span className="text-slate-800 font-mono">₹{Math.round(viewOrder.shipping_amount)}</span>
                    </div>
                    <div className="pt-4 border-t border-gold/15 flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-gold">Total Charged</span>
                      <span className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">₹{Math.round(viewOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update section in modal */}
              <div className="pt-6 border-t border-gold/15 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Update Order Status:</label>
                  <select
                    value={viewOrder.order_status || 'pending'}
                    onChange={(e) => {
                      updateOrderStatus(viewOrder.id, e.target.value)
                      setViewOrder(prev => ({ ...prev, order_status: e.target.value }))
                    }}
                    className="px-4 py-2 bg-slate-50 border border-gold/15 text-slate-850 text-xs font-black rounded-xl focus:outline-none cursor-pointer uppercase tracking-widest"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <button
                  onClick={() => setViewOrder(null)}
                  className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer border border-transparent"
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Details Modal */}
      {viewReview && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white border border-gold/20 rounded-[2.5rem] p-6 sm:p-8 w-full max-w-lg shadow-2xl relative flex flex-col text-left max-h-[90vh] overflow-y-auto no-scrollbar">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gold/15 shrink-0">
              <div>
                <span className="text-gold text-[9px] font-bold tracking-[0.2em] uppercase block mb-1">✦ Devotee Feedback Details ✦</span>
                <h3 className="font-sans text-base sm:text-lg md:text-xl font-black text-slate-900 uppercase tracking-widest">
                  Review Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewReview(null)}
                className="p-1.5 rounded-full hover:bg-gold/10 text-slate-400 hover:text-gold transition-all cursor-pointer border border-transparent"
                title="Close"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5 flex-1">
              {/* Product Info */}
              <div className="bg-slate-50 border border-gold/10 p-4 rounded-2xl">
                <span className="text-slate-400 text-[9px] uppercase font-black tracking-widest block mb-1">Product</span>
                <div className="font-bold text-slate-900 text-sm sm:text-base">{viewReview.products?.name || 'Divine Stone'}</div>
              </div>

              {/* Devotee Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-gold/10 p-4 rounded-2xl">
                  <span className="text-slate-400 text-[9px] uppercase font-black tracking-widest block mb-1">Devotee Name</span>
                  <div className="font-bold text-slate-800 text-xs sm:text-sm">{viewReview.name}</div>
                </div>
                <div className="bg-slate-50 border border-gold/10 p-4 rounded-2xl">
                  <span className="text-slate-400 text-[9px] uppercase font-black tracking-widest block mb-1">Order Identifier</span>
                  <div className="font-mono font-bold text-slate-800 text-xs sm:text-sm">
                    #{viewReview.order_id ? viewReview.order_id.slice(0, 8).toUpperCase() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Stars & Date */}
              <div className="flex justify-between items-center bg-slate-50 border border-gold/10 p-4 rounded-2xl">
                <div>
                  <span className="text-slate-400 text-[9px] uppercase font-black tracking-widest block mb-1">Rating</span>
                  <div className="flex gap-0.5 text-gold mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < viewReview.rating ? 'fill-current' : 'text-gray-200'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[9px] uppercase font-black tracking-widest block mb-1">Submitted At</span>
                  <span className="text-xs font-semibold text-slate-600">
                    {new Date(viewReview.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Comment Comment */}
              <div className="bg-slate-50 border border-gold/10 p-4 rounded-2xl space-y-2">
                <span className="text-slate-400 text-[9px] uppercase font-black tracking-widest block">Review Text</span>
                {viewReview.title && <div className="font-black text-slate-900 text-sm">{viewReview.title}</div>}
                <p className="text-slate-650 text-xs sm:text-sm leading-relaxed italic whitespace-pre-wrap">"{viewReview.comment}"</p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between border-t border-gold/10 pt-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Approval Status</span>
                {viewReview.is_approved ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/30 rounded-full font-bold text-xs uppercase tracking-wider">Approved &amp; Public</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200/30 rounded-full font-bold text-xs uppercase tracking-wider animate-pulse">Awaiting Approval</span>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gold/10 flex gap-3">
                {!viewReview.is_approved && (
                  <button
                    type="button"
                    onClick={() => {
                      approveReview(viewReview.id)
                      setViewReview(prev => ({ ...prev, is_approved: true }))
                    }}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border-none"
                  >
                    <Check className="w-4 h-4" /> Approve Review
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    deleteReview(viewReview.id)
                    setViewReview(null)
                  }}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border-none"
                >
                  <Trash2 className="w-4 h-4" /> Delete Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Inline lotus icon logo
const IconLotus = ({ className = "w-6 h-6 text-amber-500" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2s-8 6-8 10.5a8 8 0 0016 0c0-4.5-8-10.5-8-10.5zm0 13c-1.38 0-2.5-1.12-2.5-2.5S10.62 10 12 10s2.5 1.12 2.5 2.5S13.38 15 12 15z" />
  </svg>
)
