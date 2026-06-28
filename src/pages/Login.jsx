import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Lock, Mail, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn(email, password)
      const userId = result?.user?.id

      if (userId) {
        const { data: profile } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', userId)
          .single()

        if (profile?.is_admin === true) {
          navigate('/admin', { replace: true })
          return
        }
      }

      navigate(from === '/admin' ? '/' : from, { replace: true })
    } catch (err) {
      const msg = typeof err?.message === 'string' ? err.message : 'Invalid email or password. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Login – RamSetu Divine Stones</title></Helmet>

      <div className="relative min-h-screen bg-cream2 flex items-center justify-center px-4 py-10 sm:py-16 overflow-hidden">
        {/* Ambient background atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream2 via-[#FBF7EE] to-cream2 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #B8893A 1px, transparent 1px)', backgroundSize: '26px 26px' }}
          aria-hidden="true"
        />
        {/* Glowing orbs for depth */}
        <div className="absolute -top-24 -left-24 w-64 h-64 sm:w-96 sm:h-96 bg-gold/15 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 sm:w-96 sm:h-96 bg-gold/15 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22rem] h-[22rem] sm:w-[36rem] sm:h-[36rem] bg-gold/10 rounded-full blur-[120px] sm:blur-[160px] pointer-events-none" />

        {/* Card */}
        <div className="relative z-10 w-full max-w-md">
          {/* Glow ring behind the card */}
          <div className="absolute -inset-px rounded-[1.75rem] sm:rounded-[2rem] bg-gradient-to-b from-gold/50 via-gold/15 to-transparent blur-sm pointer-events-none" />

          <div className="relative bg-white rounded-[1.75rem] sm:rounded-[2rem] border border-gold/20 p-6 sm:p-8 md:p-11 shadow-[0_20px_60px_-20px_rgba(184,137,58,0.35)]">
            {/* Corner accents */}
            <div className="absolute top-5 left-5 sm:top-6 sm:left-6 w-5 h-5 sm:w-6 sm:h-6 border-t border-l border-gold/40 rounded-tl-lg pointer-events-none" />
            <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 w-5 h-5 sm:w-6 sm:h-6 border-b border-r border-gold/40 rounded-br-lg pointer-events-none" />

            <div className="text-center mb-7 sm:mb-9">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase mb-4 sm:mb-5 font-sans">
                ✦ Sacred Circle ✦
              </span>
              <h1 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide leading-tight">
                <span className="bg-gradient-to-r from-gold via-gold-light to-gold-pale bg-clip-text text-transparent whitespace-nowrap">
                  Welcome Back
                </span>
              </h1>
              <p className="text-gray-500 font-sans text-[11px] sm:text-xs uppercase tracking-widest font-bold mt-3 sm:mt-4">
                Sign in to your sacred account
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3.5 sm:p-4 rounded-xl text-xs border border-red-100 flex items-center gap-2 mb-5 sm:mb-6 font-sans">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-sans flex items-center gap-1.5 pl-1">
                  <Mail className="w-3.5 h-3.5 text-gold/70" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full h-11 sm:h-12 px-4 rounded-xl border border-gold/20 bg-cream2/40 text-dark placeholder:text-gray-300 text-sm font-sans outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 focus:bg-white transition-all duration-300 shadow-inner"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-sans flex items-center gap-1.5 pl-1">
                  <Lock className="w-3.5 h-3.5 text-gold/70" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 sm:h-12 pl-4 pr-11 rounded-xl border border-gold/20 bg-cream2/40 text-dark placeholder:text-gray-300 text-sm font-sans outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 focus:bg-white transition-all duration-300 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full h-11 sm:h-12 bg-gold hover:bg-dark text-dark hover:text-gold border border-gold/30 rounded-xl font-bold text-xs uppercase tracking-widest shadow-[0_8px_24px_-8px_rgba(200,134,10,0.3)] hover:shadow-[0_10px_32px_-6px_rgba(200,134,10,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 mt-1 sm:mt-2 font-sans disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Signing in…' : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Redirect Option */}
            <div className="mt-7 sm:mt-8 pt-5 sm:pt-6 border-t border-gold/10 text-center">
              <p className="text-xs text-gray-500 font-sans">
                Don't have an account?{' '}
                <Link to="/register" className="text-gold font-bold hover:text-gold-light transition-colors underline pl-1">
                  Register here
                </Link>
              </p>
            </div>
          </div>

          {/* Breadcrumb below the card */}
          <div className="flex items-center justify-center gap-2 mt-5 sm:mt-6 text-gray-400 text-xs font-sans">
            <Link to="/" className="hover:text-gold transition-colors focus-visible:outline-none rounded">Home</Link>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-gold/70">Login</span>
          </div>
        </div>
      </div>
    </>
  )
}