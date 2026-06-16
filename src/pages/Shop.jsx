import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { getProducts, getCategories, primaryImage } from '../lib/supabase'
import { useCart } from '../context/CartContext'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const { addToCart } = useCart()

  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    getProducts({ q, category, sort, page })
      .then(({ items, total, pages }) => {
        setProducts(items)
        setTotal(total)
        setPages(pages)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [q, category, sort, page])

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  function handleMobileFilter(e) {
    const val = e.target.value
    if (!val) return
    const next = new URLSearchParams(searchParams)
    if (val.startsWith('cat-')) {
      const slug = val.substring(4)
      if (slug === 'all') next.delete('category')
      else next.set('category', slug)
    } else if (val.startsWith('sort-')) {
      next.set('sort', val.substring(5))
    }
    next.delete('page')
    setSearchParams(next)
  }

  return (
    <>
      <Helmet>
        <title>Shop Sacred Stones – RamSetu Divine Stones</title>
        <meta name="description" content="Browse our collection of authentic Ram Setu sacred stones. Order on WhatsApp for fast pan-India delivery with free engraving." />
      </Helmet>

      {/* Shop Banner */}
      <section className="shop-banner">
        <h1>Sacred Collection</h1>
        <div className="breadcrumb">Home / Shop</div>
      </section>

      {/* Mobile Filter */}
      <div className="mobile-filter-dropdown">
        <select onChange={handleMobileFilter} defaultValue="">
          <option value="">-- All Filters --</option>
          <optgroup label="Categories">
            <option value="cat-all">All Products</option>
            {categories.map(c => (
              <option key={c.id} value={`cat-${c.slug}`}>{c.name}</option>
            ))}
          </optgroup>
          <optgroup label="Sort By">
            <option value="sort-newest">Newest First</option>
            <option value="sort-price_low">Price: Low to High</option>
            <option value="sort-price_high">Price: High to Low</option>
            <option value="sort-name">Name: A-Z</option>
          </optgroup>
        </select>
      </div>

      <div className="shop-container">
        {/* Sidebar */}
        <aside className="shop-sidebar">
          <div className="filter-group">
            <h3>Search</h3>
            <form onSubmit={e => { e.preventDefault(); setParam('q', e.target.q.value) }}>
              <div className="search-box">
                <input type="text" name="q" placeholder="Search sacred stones..." defaultValue={q} />
                <button type="submit" className="search-icon" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🔍</button>
              </div>
            </form>
          </div>

          <div className="filter-group">
            <h3>Categories</h3>
            <ul className="filter-list">
              <li>
                <a
                  href="#"
                  onClick={e => { e.preventDefault(); setParam('category', '') }}
                  style={{ textDecoration: 'none', color: !category ? 'var(--gold)' : '#555', fontWeight: !category ? 700 : 400, fontSize: '0.88rem' }}
                >
                  All Products
                </a>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <a
                    href="#"
                    onClick={e => { e.preventDefault(); setParam('category', cat.slug) }}
                    style={{ textDecoration: 'none', color: category === cat.slug ? 'var(--gold)' : '#555', fontWeight: category === cat.slug ? 700 : 400, fontSize: '0.88rem' }}
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group">
            <h3>Sort By</h3>
            <select
              className="sort-dropdown"
              value={sort}
              onChange={e => setParam('sort', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </aside>

        {/* Main */}
        <section className="shop-main">
          <div className="shop-content-header">
            <div className="result-count">
              Showing {products.length} of {total} results{q ? ` for "${q}"` : ''}
            </div>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : (
            <div className="shop-products-grid">
              {products.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
                  <p style={{ color: '#888' }}>No products found{q ? ` for "${q}"` : ''}.</p>
                  <a href="#" onClick={e => { e.preventDefault(); setSearchParams({}) }} style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none', marginTop: 8, display: 'inline-block' }}>
                    View all products →
                  </a>
                </div>
              ) : (
                products.map(product => (
                  <div className="product-card-wrapper" key={product.id}>
                    <Link to={`/product/${product.slug}`} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="product-img">
                        <img src={primaryImage(product)} alt={product.name} loading="lazy" />
                        {product.discount_percent
                          ? <div className="product-badge">{product.discount_percent}% OFF</div>
                          : product.is_featured && <div className="product-badge">Featured</div>}
                      </div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <div className="stars">★★★★★</div>
                        <div className="product-price">
                          ₹{Math.round(product.price)}
                          {product.compare_price && <del>₹{Math.round(product.compare_price)}</del>}
                        </div>
                        {product.stock_qty === 0 && <span style={{ color: '#e53935', fontSize: '0.78rem', fontWeight: 700 }}>Out of Stock</span>}
                      </div>
                    </Link>
                    <div className="product-card-form">
                      <button
                        className="product-card-btn"
                        disabled={product.stock_qty === 0}
                        onClick={() => { addToCart({ id: product.id, name: product.name, price: product.price, image: primaryImage(product), slug: product.slug }); toast.success('Added to cart!') }}
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => { const n = new URLSearchParams(searchParams); n.set('page', p); setSearchParams(n) }}
                  style={{ padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', border: p === page ? 'none' : '1px solid #ddd', background: p === page ? 'var(--gold)' : '#fff', color: p === page ? '#fff' : 'var(--text)' }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
