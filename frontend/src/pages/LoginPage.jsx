import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { AuthContext } from '../App'

export default function LoginPage() {
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)

    try {
      const res = await axios.post('/api/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      login(res.data.access_token)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative font-sans">
      <div className="glow-spot w-[300px] h-[300px] top-1/4 left-1/4 bg-emerald-500/10 dark:bg-emerald-500/5"></div>
      
      <div className="w-full max-w-md glass-panel p-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white mb-3">
            <Sparkles size={20} />
          </div>
          <h2 className="text-2xl font-bold font-display">Sign in to Campus AI</h2>
          <p className="text-xs text-slate-400 mt-1">Get ready for placement season</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="glass-input pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <a href="#" className="text-xs text-emerald-500 hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-emerald-600 transition-all shadow-lg dark:shadow-emerald-500/10 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-500 hover:underline font-bold">Register here</Link>
        </p>
      </div>
    </div>
  )
}
