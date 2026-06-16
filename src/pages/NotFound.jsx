import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 – Page Not Found – RamSetu Divine Stones</title></Helmet>
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px', background: 'var(--cream2)' }}>
        <div style={{ fontSize: '5rem', marginBottom: 16 }}>🪨</div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, color: 'var(--dark)', marginBottom: 12 }}>
          404
        </h1>
        <p style={{ color: '#888', fontSize: '1.1rem', marginBottom: 8 }}>This sacred path leads nowhere.</p>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: 28 }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">Return Home</Link>
      </div>
    </>
  )
}
