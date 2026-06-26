import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2, UserCheck } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await axios.post('/api/auth/register', {
        email,
        password,
        is_admin: isAdmin
      })
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      console.error(err)
      if (!err.response) {
        setError('Cannot connect to server. Please wait a moment and try again.')
      } else {
        setError(err.response?.data?.detail || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative font-sans">
      <div className="glow-spot w-[300px] h-[300px] top-1/4 right-1/4 bg-indigo-500/10 dark:bg-indigo-500/5"></div>
      
      <div className="w-full max-w-md glass-panel p-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white mb-3">
            <Sparkles size={20} />
          </div>
          <h2 className="text-2xl font-bold font-display">Create an account</h2>
          <p className="text-xs text-slate-400 mt-1">Get custom placement coaching</p>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2 animate-bounce">
            <UserCheck size={16} />
            <span>Registration successful! Redirecting to login...</span>
          </div>
        )}

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
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
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

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input pl-10 pr-10"
              />
            </div>
          </div>

          {/* Test Admin Option */}
          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="admin-check"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-transparent"
            />
            <label htmlFor="admin-check" className="text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
              Register as Administrator (for testing dashboards)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-emerald-600 transition-all shadow-lg dark:shadow-emerald-500/10 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Register Account'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-500 hover:underline font-bold">Sign in here</Link>
        </p>
      </div>
    </div>
  )
}
