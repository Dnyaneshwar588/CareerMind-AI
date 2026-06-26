import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts'
import { 
  TrendingUp, 
  BookOpen, 
  Award, 
  FileText, 
  CheckSquare, 
  Briefcase, 
  AlertCircle, 
  UserPlus 
} from 'lucide-react'
import { AuthContext } from '../App'

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  const [stats, setStats] = useState(null)
  const [progressData, setProgressData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, progressRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/planner/progress')
      ])
      setStats(statsRes.data)
      setProgressData(progressRes.data)
    } catch (err) {
      console.error("Error loading dashboard details:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  // Handle empty profile state
  if (stats && !stats.has_profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-4">
        <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-2xl mx-auto mb-6">
          <UserPlus size={32} />
        </div>
        <h2 className="text-2xl font-bold font-display">Setup Your Student Profile</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
          Welcome to Campus AI! To start generating customized study planners, analyzing resume scores, and practicing mock interviews, let's complete your profile first.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/profile" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/10">
            Fill Out Profile Manual
          </Link>
          <Link to="/resume" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold px-6 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            Upload PDF Resume (Auto-fill)
          </Link>
        </div>
      </div>
    )
  }

  // Default charts dummy data if student hasn't logged logs yet
  const chartData = progressData.length > 0 ? progressData : [
    { date: 'Mon', study_hours: 2, dsa_progress: 10, sql_progress: 15, ai_progress: 20 },
    { date: 'Tue', study_hours: 4, dsa_progress: 15, sql_progress: 20, ai_progress: 25 },
    { date: 'Wed', study_hours: 3, dsa_progress: 20, sql_progress: 30, ai_progress: 30 },
    { date: 'Thu', study_hours: 5, dsa_progress: 30, sql_progress: 35, ai_progress: 40 },
    { date: 'Fri', study_hours: 6, dsa_progress: 45, sql_progress: 50, ai_progress: 45 },
    { date: 'Sat', study_hours: 2, dsa_progress: 55, sql_progress: 55, ai_progress: 50 },
    { date: 'Sun', study_hours: 4, dsa_progress: 60, sql_progress: 60, ai_progress: 60 },
  ]

  const mockInterviewChart = [
    { name: 'Attempt 1', score: 65 },
    { name: 'Attempt 2', score: 72 },
    { name: 'Attempt 3', score: 80 },
    { name: 'Attempt 4', score: 85 },
  ]

  const latestLog = chartData[chartData.length - 1] || {}

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">
            Welcome back, {stats?.student_name || 'Student'}!
          </h2>
          <p className="text-sm text-slate-400">Here's your placement preparation report for today.</p>
        </div>
        <Link to="/interview" className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 text-sm rounded-xl transition-all shadow-md shadow-emerald-500/10">
          <TrendingUp size={16} />
          <span>Launch Mock Interview</span>
        </Link>
      </div>

      {/* Main Grid Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        {/* Placement Readiness Gauge */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center col-span-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Readiness Score</span>
          <div className="relative flex items-center justify-center h-32 w-32">
            {/* SVG circle gauge */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="50" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="10" fill="transparent" />
              <circle cx="64" cy="64" r="50" className="stroke-emerald-500" strokeWidth="10" fill="transparent"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * (stats?.readiness_score || 0)) / 100}
                strokeLinecap="round" />
            </svg>
            <span className="absolute text-2xl font-bold font-display">{stats?.readiness_score || 0}%</span>
          </div>
          <span className="text-xs text-slate-400 mt-4 leading-tight">
            {stats?.readiness_score >= 80 ? 'Placement Ready!' : stats?.readiness_score >= 60 ? 'Nearly Eligible' : 'Needs Preparation'}
          </span>
        </div>

        {/* ATS & Resume Scores */}
        <div className="glass-panel p-6 col-span-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resume Quality</span>
              <FileText size={16} className="text-emerald-500" />
            </div>
            <div>
              <span className="text-3xl font-bold font-display">{stats?.resume_score || 0}</span>
              <span className="text-slate-400 text-sm">/ 100</span>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">ATS Match Rating</span>
              <span className="font-bold text-emerald-500">{stats?.ats_score || 0}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats?.ats_score || 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Company Matches */}
        <div className="glass-panel p-6 col-span-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eligible Companies</span>
              <Briefcase size={16} className="text-indigo-500" />
            </div>
            <div>
              <span className="text-3xl font-bold font-display">{stats?.eligible_companies_count || 0}</span>
              <span className="text-slate-400 text-sm"> matched</span>
            </div>
          </div>
          <Link to="/companies" className="text-xs text-indigo-500 dark:text-indigo-400 hover:underline font-bold mt-4 flex items-center gap-1">
            <span>View eligibility list</span>
            <span>→</span>
          </Link>
        </div>

        {/* Action Item / Next Step */}
        <div className="glass-panel p-6 col-span-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Focus</span>
              <CheckSquare size={16} className="text-teal-500" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal line-clamp-3">
              {stats?.today_plan}
            </p>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-3">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wide">Target Skill Gap</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-350 truncate block mt-0.5">{stats?.skills_gap_summary}</span>
          </div>
        </div>
      </div>

      {/* Progress Levels */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500">DSA Progress</span>
            <span className="font-bold text-emerald-500">{latestLog.dsa_progress || 0}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${latestLog.dsa_progress || 0}%` }}></div>
          </div>
        </div>
        <div className="glass-panel p-5 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500">SQL & Database Progress</span>
            <span className="font-bold text-indigo-500">{latestLog.sql_progress || 0}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${latestLog.sql_progress || 0}%` }}></div>
          </div>
        </div>
        <div className="glass-panel p-5 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500">AI / Tech Electives Progress</span>
            <span className="font-bold text-teal-500">{latestLog.ai_progress || 0}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${latestLog.ai_progress || 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Study Hours Graph */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-bold text-slate-500 mb-6">Weekly Study Log (Hours)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b20" />
                <XAxis dataKey="date" stroke="#94a3b880" fontSize={11} />
                <YAxis stroke="#94a3b880" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="study_hours" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mock Interview Scores */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-bold text-slate-500 mb-6">Mock Interview History</h3>
          {stats?.upcoming_mock_interview ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockInterviewChart} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b20" />
                  <XAxis dataKey="name" stroke="#94a3b880" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#94a3b880" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Award className="h-10 w-10 text-slate-400 mb-3" />
              <p className="text-xs text-slate-400 max-w-xs leading-normal">
                You haven't completed any mock interviews yet. Start one now to test your confidence and communication scores!
              </p>
              <Link to="/interview" className="mt-4 text-xs font-bold text-indigo-500 hover:underline">
                Start Mock Interview →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
