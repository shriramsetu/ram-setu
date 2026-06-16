import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const s = {
  wrap: { minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Poppins', sans-serif" },
  header: { background: 'var(--dark)', color: '#fff', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  body: { maxWidth: 1100, margin: '0 auto', padding: '32px 20px' },
  card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 28 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #eee', fontWeight: 700, color: '#444', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' },
  btn: { padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
}

export default function Dashboard() {
  const { user, isAdmin, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [tab, setTab] = useState('products')
  const [fetching, setFetching] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/login')
  }, [user, isAdmin, loading])

  useEffect(() => {
    if (user && isAdmin) fetchProducts()
  }, [user, isAdmin])

  async function fetchProducts() {
    setFetching(true)
    const { data } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setFetching(false)
  }

  function openAdd() {
    setForm({ name: '', slug: '', price: '', compare_price: '', description: '', is_active: true, is_featured: false, stock_qty: 10 })
    setModal('add')
    setMsg('')
  }

  function openEdit(p) {
    setForm({ ...p })
    setModal('edit')
    setMsg('')
  }

  async function saveProduct() {
    setSaving(true)
    setMsg('')
    try {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        price: parseFloat(form.price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        description: form.description,
        is_active: form.is_active,
        is_featured: form.is_featured,
        stock_qty: parseInt(form.stock_qty) || 0,
      }
      if (modal === 'add') {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
        setMsg('Product added!')
      } else {
        const { error } = await supabase.from('products').update(payload).eq('id', form.id)
        if (error) throw error
        setMsg('Product updated!')
      }
      await fetchProducts()
      setTimeout(() => setModal(null), 1000)
    } catch (err) {
      setMsg('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(p) {
    await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id)
    fetchProducts()
  }

  async function deleteProduct(id) {
    if (!window.confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  if (loading || (!user && !loading)) return null

  return (
    <>
      <Helmet><title>Admin Dashboard – RamSetu Divine Stones</title></Helmet>
      <div style={s.wrap}>
        {/* Header */}
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.4rem' }}>🪨</span>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: 'var(--gold)' }}>Admin Dashboard</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{user?.email}</span>
            <a href="/" style={{ color: 'var(--gold)', fontSize: '0.82rem', textDecoration: 'none' }}>← View Site</a>
            <button onClick={signOut} style={{ ...s.btn, background: 'rgba(255,255,255,0.1)', color: '#fff' }}>Logout</button>
          </div>
        </div>

        <div style={s.body}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
            {['products'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ ...s.btn, background: tab === t ? 'var(--primary)' : '#fff', color: tab === t ? '#fff' : '#444', padding: '8px 20px', textTransform: 'capitalize' }}>
                {t}
              </button>
            ))}
          </div>

          {/* Products Tab */}
          {tab === 'products' && (
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'Cinzel, serif' }}>Products ({products.length})</h2>
                <button onClick={openAdd} style={{ ...s.btn, background: 'var(--primary)', color: '#fff', padding: '8px 20px' }}>+ Add Product</button>
              </div>
              {fetching ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Loading…</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Name</th>
                        <th style={s.th}>Price</th>
                        <th style={s.th}>Stock</th>
                        <th style={s.th}>Active</th>
                        <th style={s.th}>Featured</th>
                        <th style={s.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td style={s.td}><strong>{p.name}</strong><br /><span style={{ color: '#aaa', fontSize: '0.75rem' }}>{p.slug}</span></td>
                          <td style={s.td}>₹{p.price}{p.compare_price ? <><br /><del style={{ color: '#aaa' }}>₹{p.compare_price}</del></> : null}</td>
                          <td style={s.td}>{p.stock_qty}</td>
                          <td style={s.td}>
                            <button onClick={() => toggleActive(p)} style={{ ...s.btn, background: p.is_active ? '#e8f5e9' : '#fdecea', color: p.is_active ? '#2e7d32' : '#c62828' }}>
                              {p.is_active ? 'Active' : 'Hidden'}
                            </button>
                          </td>
                          <td style={s.td}>{p.is_featured ? '⭐ Yes' : '—'}</td>
                          <td style={s.td}>
                            <button onClick={() => openEdit(p)} style={{ ...s.btn, background: '#e3f2fd', color: '#1565c0', marginRight: 6 }}>Edit</button>
                            <button onClick={() => deleteProduct(p.id)} style={{ ...s.btn, background: '#fdecea', color: '#c62828' }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 24px', fontFamily: 'Cinzel, serif' }}>{modal === 'add' ? 'Add Product' : 'Edit Product'}</h3>
            {[
              { label: 'Product Name *', key: 'name', type: 'text', placeholder: 'e.g. Sacred Ram Setu Stone' },
              { label: 'Slug (URL)', key: 'slug', type: 'text', placeholder: 'auto-generated if blank' },
              { label: 'Price (₹) *', key: 'price', type: 'number', placeholder: '299' },
              { label: 'Compare Price (₹)', key: 'compare_price', type: 'number', placeholder: '499 (optional)' },
              { label: 'Stock Quantity', key: 'stock_qty', type: 'number', placeholder: '10' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 5 }}>{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key] ?? ''}
                  onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 5 }}>Description</label>
              <textarea
                rows={3}
                placeholder="Product description…"
                value={form.description ?? ''}
                onChange={e => setForm(x => ({ ...x, description: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: '0.88rem', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!form.is_active} onChange={e => setForm(x => ({ ...x, is_active: e.target.checked }))} />
                Active (visible on site)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!form.is_featured} onChange={e => setForm(x => ({ ...x, is_featured: e.target.checked }))} />
                Featured (homepage)
              </label>
            </div>
            {msg && <div style={{ padding: '10px 14px', borderRadius: 8, background: msg.startsWith('Error') ? '#fdecea' : '#e8f5e9', color: msg.startsWith('Error') ? '#c62828' : '#2e7d32', fontSize: '0.85rem', marginBottom: 16 }}>{msg}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveProduct} disabled={saving} style={{ ...s.btn, background: 'var(--primary)', color: '#fff', padding: '10px 24px', flex: 1 }}>
                {saving ? 'Saving…' : 'Save Product'}
              </button>
              <button onClick={() => setModal(null)} style={{ ...s.btn, background: '#f5f5f5', color: '#444', padding: '10px 20px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
