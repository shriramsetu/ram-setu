import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

/* ─── Products ─── */
export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)
  if (error) throw error
  return data || []
}

export async function getProducts({ q = '', category = '', sort = 'newest', page = 1, pageSize = 12 } = {}) {
  let query = supabase
    .from('products')
    .select('*, product_images(*), categories(name,slug)', { count: 'exact' })
    .eq('is_active', true)

  if (q) query = query.ilike('name', `%${q}%`)
  if (category) query = query.eq('category_slug', category)

  switch (sort) {
    case 'price_low': query = query.order('price', { ascending: true }); break
    case 'price_high': query = query.order('price', { ascending: false }); break
    case 'name': query = query.order('name', { ascending: true }); break
    default: query = query.order('created_at', { ascending: false })
  }

  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  const { data, error, count } = await query
  if (error) throw error
  return { items: data || [], total: count || 0, pages: Math.ceil((count || 0) / pageSize) }
}


export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data || []
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*), categories(name,slug)')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

/* ─── Orders ─── */
export async function createOrder(orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createOrderItems(items) {
  const { error } = await supabase.from('order_items').insert(items)
  if (error) throw error
}

export async function getMyOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, product_images(*)))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

/* ─── Helper: primary image URL ─── */
export function primaryImage(product) {
  if (!product) return '/images/gallery/gallery-1.jpeg'
  const imgs = product.product_images || []
  const primary = imgs.find(i => i.is_primary) || imgs[0]
  return primary?.url || '/images/gallery/gallery-1.jpeg'
}
