import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../App'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user, loading } = useContext(AuthContext)

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user && !user.is_admin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
