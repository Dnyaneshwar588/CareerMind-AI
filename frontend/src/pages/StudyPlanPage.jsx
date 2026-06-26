import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Trash2, 
  CheckCircle, 
  ChevronDown, 
  Clock, 
  Sparkles, 
  Layers,
  Save
} from 'lucide-react'

export default function StudyPlanPage() {
  const [plan, setPlan] = useState(null)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeWeek, setActiveWeek] = useState(0)

  // Questionnaire form states
  const [targetRole, setTargetRole] = useState('')
  const [targetCompany, setTargetCompany] = useState('')
  const [availableHours, setAvailableHours] = useState('15')
  const [weakSubjects, setWeakSubjects] = useState('')
  const [strongSubjects, setStrongSubjects] = useState('')

  // Progress Logging Form States
  const [studyHoursLogged, setStudyHoursLogged] = useState('2.5')
  const [completedTopicDraft, setCompletedTopicDraft] = useState('')
  const [completedTopics, setCompletedTopics] = useState([])
  const [dsaProgress, setDsaProgress] = useState(30)
  const [sqlProgress, setSqlProgress] = useState(20)
  const [aiProgress, setAiProgress] = useState(10)
  const [loggingProgress, setLoggingProgress] = useState(false)
  const [logSuccess, setLogSuccess] = useState(false)

  useEffect(() => {
    fetchPlanAndCompanies()
  }, [])

  const fetchPlanAndCompanies = async () => {
    try {
      setLoading(true)
      const compRes = await axios.get('/api/companies')
      setCompanies(compRes.data)
      
      const planRes = await axios.get('/api/planner/latest')
      setPlan(planRes.data)
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Error loading planner detail:", err)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenerating(true)
    
    const weakList = weakSubjects.split(',').map(s => s.trim()).filter(Boolean)
    const strongList = strongSubjects.split(',').map(s => s.trim()).filter(Boolean)

    const payload = {
      target_role: targetRole,
      target_company: targetCompany,
      available_hours: parseInt(availableHours) || 15,
      weak_subjects: weakList,
      strong_subjects: strongList
    }

    try {
      const res = await axios.post('/api/planner/generate', payload)
      // Refresh to load latest
      await fetchPlanAndCompanies()
    } catch (err) {
      console.error(err)
      alert("Failed to generate plan. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const handleAddTopic = () => {
    if (!completedTopicDraft.trim()) return
    setCompletedTopics([...completedTopics, completedTopicDraft.trim()])
    setCompletedTopicDraft('')
  }

  const handleRemoveTopic = (idx) => {
    setCompletedTopics(completedTopics.filter((_, i) => i !== idx))
  }

  const handleLogProgressSubmit = async (e) => {
    e.preventDefault()
    setLoggingProgress(true)
    setLogSuccess(false)

    // Today's date YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0]

    const payload = {
      date: today,
      study_hours: parseFloat(studyHoursLogged) || 0.0,
      completed_topics: completedTopics,
      dsa_progress: dsaProgress,
      sql_progress: sqlProgress,
      ai_progress: aiProgress
    }

    try {
      await axios.post('/api/planner/progress', payload)
      setLogSuccess(true)
      setCompletedTopics([])
      setTimeout(() => setLogSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      alert("Failed to log progress.")
    } finally {
      setLoggingProgress(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">AI Study Planner</h2>
        <p className="text-xs text-slate-400">Generate weeks-long interview preparation roadmaps and track daily study logs.</p>
      </div>

      {/* Empty State: Generate Form */}
      {!plan && !generating && (
        <div className="glass-panel p-8 max-w-2xl mx-auto">
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
              <BookOpen size={24} />
            </div>
            <h3 className="text-lg font-bold">Generate Personalized Preparation Roadmap</h3>
            <p className="text-xs text-slate-400 mt-1">Specify target parameters to generate tailored study guides via Gemini.</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-semibold">Target SDE Role</label>
                <input type="text" required value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Software Engineer" className="glass-input" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-semibold">Target Recruiter</label>
                <select required value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)} className="glass-input">
                  <option value="">Select Employer</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-semibold">Weak Subjects (Comma-separated)</label>
                <input type="text" value={weakSubjects} onChange={(e) => setWeakSubjects(e.target.value)} placeholder="Graphs, DP, Database Indexing" className="glass-input" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-450 font-semibold">Strong Subjects (Comma-separated)</label>
                <input type="text" value={strongSubjects} onChange={(e) => setStrongSubjects(e.target.value)} placeholder="Arrays, SQL Joins, Basic Networking" className="glass-input" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-450 font-semibold">Available Hours Per Week</label>
              <input type="number" required value={availableHours} onChange={(e) => setAvailableHours(e.target.value)} placeholder="15" className="glass-input" />
            </div>

            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 text-sm">
              Generate AI Schedule
            </button>
          </form>
        </div>
      )}

      {/* Loading generation trigger */}
      {generating && (
        <div className="glass-panel p-12 text-center max-w-md mx-auto">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-sm font-bold">Creating Custom Study Roadmap</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Gemini AI is reviewing target company selection rounds and building custom weekly prep milestones...
          </p>
        </div>
      )}

      {/* Study Plan Content & Progress Logger Grid */}
      {plan && (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Timeline and Details Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header info */}
            <div className="glass-panel p-6 flex justify-between items-center bg-gradient-to-tr from-emerald-500/5 via-transparent to-indigo-500/5">
              <div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Active Study Plan</span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{plan.target_role} Candidate</h3>
                <span className="text-xs text-slate-400">Customized for <strong>{plan.target_company}</strong></span>
              </div>
              <button 
                onClick={() => {
                  if (confirm("Reset current plan and generate a new one?")) setPlan(null)
                }}
                className="text-xs text-red-500 hover:underline font-bold"
              >
                Reset Planner
              </button>
            </div>

            {/* Today's Focus Card */}
            <div className="glass-panel p-6 border-l-4 border-l-emerald-500 space-y-2">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide flex items-center gap-1">
                <Sparkles size={14} className="animate-pulse" />
                <span>Today's Daily Target</span>
              </span>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                {plan.plan_json.daily_plan}
              </p>
            </div>

            {/* Weekly Milestones Accordion */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Weekly Roadmap Milestones</span>
              {plan.plan_json.weekly_plan?.map((week, idx) => (
                <div key={idx} className="glass-panel overflow-hidden border border-slate-200/50 dark:border-slate-800/80 transition-all duration-200">
                  <button
                    onClick={() => setActiveWeek(activeWeek === idx ? null : idx)}
                    className="w-full flex justify-between items-center p-5 text-left font-bold text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-[10px]">W{week.week}</div>
                      <span>Week {week.week}: {week.focus.slice(0, 45)}...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-400 font-semibold flex items-center gap-1">
                        <Clock size={10} />
                        {week.hours} Hours
                      </span>
                      <ChevronDown size={14} className={`transform transition-transform ${activeWeek === idx ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  
                  {activeWeek === idx && (
                    <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-900 text-xs text-slate-600 dark:text-slate-350 leading-relaxed space-y-2">
                      <strong className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Week Objective:</strong>
                      <p>{week.focus}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Monthly roadmap goals */}
            <div className="grid md:grid-cols-2 gap-6 pt-2">
              {plan.plan_json.monthly_roadmap?.map((month, idx) => (
                <div key={idx} className="glass-panel p-5 space-y-3">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">{month.month} Goal</span>
                  <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">
                    {month.objective}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Logger Column */}
          <div className="glass-panel p-6 space-y-6 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-150 dark:border-slate-800 flex items-center gap-1.5">
              <CheckCircle size={16} className="text-emerald-500" />
              <span>Log Study Progress</span>
            </h3>

            {logSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold rounded-xl animate-bounce">
                Study session successfully logged! Graph updated.
              </div>
            )}

            <form onSubmit={handleLogProgressSubmit} className="space-y-5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Hours Studied Today</label>
                <input 
                  type="number" 
                  step="0.1" 
                  required 
                  value={studyHoursLogged} 
                  onChange={(e) => setStudyHoursLogged(e.target.value)} 
                  className="glass-input py-1.5" 
                />
              </div>

              {/* Slider for DSA */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[10px]">
                  <span className="text-slate-400 uppercase">DSA Target Progress</span>
                  <span>{dsaProgress}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={dsaProgress} 
                  onChange={(e) => setDsaProgress(parseInt(e.target.value))} 
                  className="w-full accent-emerald-500 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none h-1.5" 
                />
              </div>

              {/* Slider for SQL */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[10px]">
                  <span className="text-slate-400 uppercase">SQL Query Progress</span>
                  <span>{sqlProgress}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sqlProgress} 
                  onChange={(e) => setSqlProgress(parseInt(e.target.value))} 
                  className="w-full accent-indigo-500 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none h-1.5" 
                />
              </div>

              {/* Slider for AI */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[10px]">
                  <span className="text-slate-400 uppercase">AI & Tech Electives</span>
                  <span>{aiProgress}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={aiProgress} 
                  onChange={(e) => setAiProgress(parseInt(e.target.value))} 
                  className="w-full accent-teal-500 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none h-1.5" 
                />
              </div>

              {/* List topics completed */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Topics Completed Today</span>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={completedTopicDraft} 
                    onChange={(e) => setCompletedTopicDraft(e.target.value)} 
                    placeholder="e.g. Graph BFS Traversal" 
                    className="glass-input py-1 text-xs" 
                  />
                  <button 
                    type="button" 
                    onClick={handleAddTopic} 
                    className="bg-slate-900 dark:bg-slate-850 text-slate-300 px-3 rounded-xl font-bold border border-slate-250 dark:border-slate-800 hover:text-white"
                  >
                    +
                  </button>
                </div>

                <div className="space-y-1 max-h-24 overflow-y-auto mt-2">
                  {completedTopics.map((topic, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-950/20 px-2.5 py-1.5 border border-slate-250 dark:border-slate-850 rounded text-[10px]">
                      <span>{topic}</span>
                      <button type="button" onClick={() => handleRemoveTopic(i)} className="text-red-500">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loggingProgress}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                {loggingProgress ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <Save size={14} />
                )}
                <span>Log Study Metrics</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
