import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/ProfilePage'
import ResumePage from './pages/ResumePage'
import CompaniesPage from './pages/CompaniesPage'
import StudyPlanPage from './pages/StudyPlanPage'
import InterviewPage from './pages/InterviewPage'
import ChatAssistant from './pages/ChatAssistant'
import AdminDashboard from './pages/AdminDashboard'

// Components
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'

// Contexts
export const AuthContext = createContext(null)
export const ThemeContext = createContext(null)

// Configure base API URL
axios.defaults.baseURL = 'http://127.0.0.1:8000'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark')

  // Set Auth token headers globally
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('token', token)
      fetchUser()
    } else {
      delete axios.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
      setUser(null)
      setLoading(false)
    }
  }, [token])

  // Handle Dark/Light Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/auth/me')
      setUser(res.data)
    } catch (err) {
      console.error("Error fetching user session:", err)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = (newToken) => {
    setToken(newToken)
  }

  const logout = () => {
    setToken('')
    setUser(null)
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, refreshUser: fetchUser }}>
      <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
            <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

            {/* Student Dashboard Paths */}
            <Route path="/*" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="resume" element={<ResumePage />} />
                    <Route path="companies" element={<CompaniesPage />} />
                    <Route path="planner" element={<StudyPlanPage />} />
                    <Route path="interview" element={<InterviewPage />} />
                    <Route path="chat" element={<ChatAssistant />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Admin Paths */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  )
}

function DashboardLayout({ children }) {
  const { user } = useContext(AuthContext)
  
  return (
    <div className="relative flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-800 dark:text-slate-200">
      {/* Decorative Lights */}
      <div className="glow-spot w-[400px] h-[400px] top-[-100px] left-[-100px] bg-emerald-500/10 dark:bg-emerald-500/5"></div>
      <div className="glow-spot w-[600px] h-[600px] bottom-[-200px] right-[-100px] bg-indigo-500/10 dark:bg-indigo-500/5"></div>
      
      {/* Sidebar navigation */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Navbar */}
        <Navbar />

        {/* Content Section */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/20">
          {children}
        </main>
      </div>
    </div>
  )
}
