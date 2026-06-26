import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  UserSquare2, 
  FileText, 
  Building2, 
  BookOpen, 
  MessageSquare, 
  Bot, 
  Sparkles 
} from 'lucide-react'
import { AuthContext } from '../App'

export default function Sidebar() {
  const { user } = useContext(AuthContext)

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/profile', icon: UserSquare2 },
    { name: 'Resume Analyzer', path: '/resume', icon: FileText },
    { name: 'Company Matcher', path: '/companies', icon: Building2 },
    { name: 'Study Planner', path: '/planner', icon: BookOpen },
    { name: 'Mock Interview', path: '/interview', icon: MessageSquare },
    { name: 'Career Assistant', path: '/chat', icon: Bot },
  ]

  return (
    <aside className="w-64 border-r border-slate-200/50 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md flex flex-col h-screen z-20">
      {/* Brand Header Logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-200/50 dark:border-slate-800/80">
        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
          <Sparkles size={16} className="animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-none text-slate-800 dark:text-slate-100 font-display">Campus AI</span>
          <span className="text-[10px] text-slate-400 font-medium">Placement Strategist</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive 
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'}
              `}
            >
              <Icon size={18} className="transition-transform group-hover:scale-105 duration-200" />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Logged in as</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
