import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Building2, 
  Users, 
  FileText, 
  Award, 
  Plus, 
  Trash2, 
  Edit, 
  Sparkles, 
  TrendingUp, 
  Database,
  CheckCircle,
  HelpCircle,
  FileCheck
} from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function AdminDashboard() {
  const [students, setStudents] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [seedSuccess, setSeedSuccess] = useState(false)

  // Company CRUD form modal states
  const [showCompModal, setShowCompModal] = useState(false)
  const [editingCompId, setEditingCompId] = useState(null)
  const [compName, setCompName] = useState('')
  const [compMinCgpa, setCompMinCgpa] = useState('6.0')
  const [compSkills, setCompSkills] = useState('')
  const [compEligibility, setCompEligibility] = useState('')
  const [compPattern, setCompPattern] = useState('')
  const [compPackage, setCompPackage] = useState('')
  const [compPrepTips, setCompPrepTips] = useState('')
  
  // Custom round / faq lists inside modal
  const [compRounds, setCompRounds] = useState([])
  const [newRound, setNewRound] = useState('')
  const [compFaqs, setCompFaqs] = useState([])
  const [newFaqQ, setNewFaqQ] = useState('')
  const [newFaqA, setNewFaqA] = useState('')

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      const [studentsRes, analyticsRes, companiesRes] = await Promise.all([
        axios.get('/api/admin/students'),
        axios.get('/api/admin/analytics'),
        axios.get('/api/companies')
      ])
      setStudents(studentsRes.data)
      setAnalytics(analyticsRes.data)
      setCompanies(companiesRes.data)
    } catch (err) {
      console.error("Error loading admin information:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    setSeedSuccess(false)
    try {
      await axios.post('/api/admin/seed')
      setSeedSuccess(true)
      await fetchAdminData()
      setTimeout(() => setSeedSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      alert("Failed to seed database.")
    } finally {
      setSeeding(false)
    }
  }

  const handleOpenCreateModal = () => {
    setEditingCompId(null)
    setCompName('')
    setCompMinCgpa('6.5')
    setCompSkills('')
    setCompEligibility('')
    setCompPattern('')
    setCompPackage('')
    setCompPrepTips('')
    setCompRounds([])
    setCompFaqs([])
    setShowCompModal(true)
  }

  const handleOpenEditModal = (comp) => {
    setEditingCompId(comp.id)
    setCompName(comp.name)
    setCompMinCgpa(comp.min_cgpa.toString())
    setCompSkills(comp.required_skills?.join(', ') || '')
    setCompEligibility(comp.eligibility)
    setCompPattern(comp.pattern)
    setCompPackage(comp.package)
    setCompPrepTips(comp.preparation_tips)
    setCompRounds(comp.rounds || [])
    setCompFaqs(comp.faqs || [])
    setShowCompModal(true)
  }

  const handleDeleteCompany = async (companyId) => {
    if (!confirm("Are you sure you want to delete this company? It will remove FAISS index mappings.")) return
    try {
      await axios.delete(`/api/admin/companies/${companyId}`)
      await fetchAdminData()
    } catch (err) {
      console.error(err)
      alert("Failed to delete company.")
    }
  }

  const handleAddRound = () => {
    if (!newRound.trim()) return
    setCompRounds([...compRounds, newRound.trim()])
    setNewRound('')
  }

  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return
    setCompFaqs([...compFaqs, { question: newFaqQ.trim(), answer: newFaqA.trim() }])
    setNewFaqQ('')
    setNewFaqA('')
  }

  const handleSaveCompany = async (e) => {
    e.preventDefault()
    
    const payload = {
      name: compName,
      min_cgpa: parseFloat(compMinCgpa) || 6.0,
      required_skills: compSkills,
      eligibility: compEligibility,
      pattern: compPattern,
      rounds: compRounds,
      package: compPackage,
      preparation_tips: compPrepTips,
      faqs: compFaqs
    }

    try {
      if (editingCompId) {
        await axios.put(`/api/admin/companies/${editingCompId}`, payload)
      } else {
        await axios.post('/api/admin/companies', payload)
      }
      setShowCompModal(false)
      await fetchAdminData()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || "Failed to save company listings.")
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
    <div className="space-y-8 font-sans pb-12">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">Admin Control Center</h2>
          <p className="text-xs text-slate-400">View college analytics, manage database listings, and track student scores.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {seedSuccess && (
            <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl">Seeded successfully!</span>
          )}
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-4 py-2 text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Database size={14} />
            <span>{seeding ? 'Seeding Index...' : 'Re-seed Vectors'}</span>
          </button>
          
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 text-xs rounded-xl shadow-md transition-all"
          >
            <Plus size={14} />
            <span>Add Employer</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass-panel p-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Students</span>
            <span className="text-2xl font-bold font-display mt-1 block">{analytics.total_students}</span>
            <span className="text-[10px] text-slate-400">registered users</span>
          </div>
          <div className="glass-panel p-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mock Interviews</span>
            <span className="text-2xl font-bold font-display mt-1 block">{analytics.total_interviews}</span>
            <span className="text-[10px] text-slate-450">overall conducted</span>
          </div>
          <div className="glass-panel p-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resumes Scored</span>
            <span className="text-2xl font-bold font-display mt-1 block">{analytics.total_resumes}</span>
            <span className="text-[10px] text-slate-450">CV copies parsed</span>
          </div>
          <div className="glass-panel p-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg readiness</span>
            <span className="text-2xl font-bold font-display mt-1 block">{analytics.avg_readiness_score}%</span>
            <span className="text-[10px] text-emerald-500">platform rating</span>
          </div>
        </div>
      )}

      {/* Role Targets chart */}
      {analytics?.role_distribution?.length > 0 && (
        <div className="glass-panel p-6 max-w-2xl">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Target Careers Distribution</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.role_distribution} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b20" />
                <XAxis dataKey="role" stroke="#94a3b880" fontSize={10} />
                <YAxis stroke="#94a3b880" fontSize={10} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Students Roster table */}
      <div className="glass-panel p-6 overflow-hidden">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Student Roster</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wide">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">GPA</th>
                <th className="py-3 px-4">CV</th>
                <th className="py-3 px-4">Interviews</th>
                <th className="py-3 px-4 text-center">Readiness</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stud) => (
                <tr key={stud.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <td className="py-3 px-4 font-semibold">
                    <div>{stud.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{stud.email}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{stud.branch}</td>
                  <td className="py-3 px-4 font-semibold">{stud.cgpa?.toFixed(2) || 'N/A'}</td>
                  <td className="py-3 px-4">
                    {stud.resume_uploaded ? (
                      <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-bold text-[10px] uppercase">Uploaded</span>
                    ) : (
                      <span className="text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-semibold">{stud.interviews_count} logs</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-extrabold font-display text-emerald-500">{stud.readiness_score}%</span>
                  </td>
                </tr>
              ))}

              {students.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-450 italic">No registered student profiles yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Companies List Editor */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Management Directory</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((comp) => (
            <div key={comp.id} className="bg-slate-50 dark:bg-slate-950/45 border border-slate-200/50 dark:border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                  <Building2 size={16} className="text-slate-400" />
                  <span>{comp.name}</span>
                </h4>
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 mt-2 font-semibold">
                  <span>GPA Target: <strong>{comp.min_cgpa}</strong></span>
                  <span>•</span>
                  <span>Package: <strong>{comp.package}</strong></span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200/50 dark:border-slate-850 mt-4 text-xs font-bold">
                <button
                  onClick={() => handleOpenEditModal(comp)}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <Edit size={12} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteCompany(comp.id)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Company CRUD Modal */}
      {showCompModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[85vh] space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-1.5">
                <Building2 className="text-emerald-500" size={18} />
                <span>{editingCompId ? `Modify ${compName} Profile` : 'Add New Corporate Partner'}</span>
              </h3>
              <button onClick={() => setShowCompModal(false)} className="text-slate-400 hover:text-slate-200 font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase">Name</label>
                  <input type="text" required value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="e.g. Google" className="glass-input py-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold uppercase">Min CGPA</label>
                    <input type="number" step="0.1" required value={compMinCgpa} onChange={(e) => setCompMinCgpa(e.target.value)} placeholder="8.5" className="glass-input py-1.5" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold uppercase">Salary Package</label>
                    <input type="text" required value={compPackage} onChange={(e) => setCompPackage(e.target.value)} placeholder="30 LPA" className="glass-input py-1.5" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase">Required Skills (Comma-separated)</label>
                <input type="text" required value={compSkills} onChange={(e) => setCompSkills(e.target.value)} placeholder="Data Structures, Algorithms, C++, Java" className="glass-input py-1.5" />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase">Eligibility Criteria</label>
                <textarea required value={compEligibility} onChange={(e) => setCompEligibility(e.target.value)} placeholder="CS/IT branch specializations, no active logs..." className="glass-input h-16 resize-none py-1.5" />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase">Interview Pattern</label>
                <textarea required value={compPattern} onChange={(e) => setCompPattern(e.target.value)} placeholder="Assessment followed by 3 Technical rounds..." className="glass-input h-16 resize-none py-1.5" />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase">AI Preparation Tips</label>
                <textarea required value={compPrepTips} onChange={(e) => setCompPrepTips(e.target.value)} placeholder="Focus heavily on Dynamic programming and graph structures..." className="glass-input h-16 resize-none py-1.5" />
              </div>

              {/* Dynamic Rounds and FAQs */}
              <div className="grid md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                {/* Rounds */}
                <div className="space-y-3">
                  <span className="font-bold text-slate-450 uppercase block">Interview Rounds List</span>
                  <div className="flex gap-2">
                    <input type="text" value={newRound} onChange={(e) => setNewRound(e.target.value)} placeholder="e.g. Coding Assessment" className="glass-input py-1" />
                    <button type="button" onClick={handleAddRound} className="bg-slate-900 dark:bg-slate-800 px-3 rounded-xl border border-slate-205 dark:border-slate-800">+</button>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {compRounds.map((round, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/20 px-2 py-1 border border-slate-200/50 dark:border-slate-850 rounded">
                        <span>{round}</span>
                        <button type="button" onClick={() => setCompRounds(compRounds.filter((_, i) => i !== idx))} className="text-red-500">✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQs */}
                <div className="space-y-3">
                  <span className="font-bold text-slate-450 uppercase block">Prep FAQs</span>
                  <div className="space-y-2">
                    <input type="text" value={newFaqQ} onChange={(e) => setNewFaqQ(e.target.value)} placeholder="Question" className="glass-input py-1" />
                    <input type="text" value={newFaqA} onChange={(e) => setNewFaqA(e.target.value)} placeholder="Answer" className="glass-input py-1" />
                    <button type="button" onClick={handleAddFaq} className="text-xs font-semibold text-emerald-500 hover:underline flex items-center gap-0.5">
                      <Plus size={12} /> Add FAQ
                    </button>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {compFaqs.map((faq, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/20 p-2 border border-slate-200/50 dark:border-slate-850 rounded">
                        <div className="truncate pr-2">
                          <strong>Q: {faq.question}</strong>
                        </div>
                        <button type="button" onClick={() => setCompFaqs(compFaqs.filter((_, i) => i !== idx))} className="text-red-500">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowCompModal(false)} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 font-bold px-5 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-1">
                  <FileCheck size={14} />
                  <span>{editingCompId ? 'Apply Changes' : 'Save Partner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
