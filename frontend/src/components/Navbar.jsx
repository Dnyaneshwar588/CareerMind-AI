import React, { useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, LogOut, ShieldAlert, User as UserIcon } from 'lucide-react'
import { AuthContext, ThemeContext } from '../App'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const { darkMode, toggleTheme } = useContext(ThemeContext)
  const navigate = useNavigate()
  const location = useLocation()
  
  const handleLogout = () => {
    logout()
    navigate('/')
  }
  
  // Format current page header title based on route
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Student Dashboard'
    if (path.includes('/profile')) return 'Placement Profile'
    if (path.includes('/resume')) return 'AI Resume Analyzer'
    if (path.includes('/companies')) return 'Company Matcher'
    if (path.includes('/planner')) return 'Study Planner'
    if (path.includes('/interview')) return 'Mock Interview Console'
    if (path.includes('/chat')) return 'AI Career Assistant'
    if (path.includes('/admin')) return 'Admin Panel'
    return 'Placement Strategist'
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200/50 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md px-6 md:px-8 z-20">
      <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-indigo-600 bg-clip-text text-transparent font-display">
        {getHeaderTitle()}
      </h1>

      <div className="flex items-center gap-4">
        {/* Toggle Theme Button */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
          title="Toggle Light/Dark Mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Admin Dashboard Navigation */}
        {user?.is_admin && (
          <Link
            to={location.pathname === '/admin' ? '/dashboard' : '/admin'}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/30 transition-all"
          >
            <ShieldAlert size={14} />
            {location.pathname === '/admin' ? 'Student View' : 'Admin Console'}
          </Link>
        )}

        {/* User Card */}
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {user?.email.split('@')[0]}
            </span>
            <span className="text-xs text-slate-400">
              {user?.is_admin ? 'Administrator' : 'Student'}
            </span>
          </div>
          
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-400 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/10">
            <UserIcon size={16} />
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition-colors"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
