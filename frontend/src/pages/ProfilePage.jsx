import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { Save, Plus, Trash2, CheckCircle, Sparkles } from 'lucide-react'
import { AuthContext } from '../App'

export default function ProfilePage() {
  const { refreshUser } = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Form Fields
  const [name, setName] = useState('')
  const [college, setCollege] = useState('')
  const [branch, setBranch] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [cgpa, setCgpa] = useState('')
  const [skills, setSkills] = useState('')
  const [programmingLanguages, setProgrammingLanguages] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [targetCompanies, setTargetCompanies] = useState('')
  const [studyHours, setStudyHours] = useState('')
  const [preferredLang, setPreferredLang] = useState('Python')
  
  // Lists for projects and certifications
  const [projects, setProjects] = useState([])
  const [certifications, setCertifications] = useState([])

  // New list item draft states
  const [newProjTitle, setNewProjTitle] = useState('')
  const [newProjDesc, setNewProjDesc] = useState('')
  const [newCert, setNewCert] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/profile')
      const data = res.data
      
      setName(data.name || '')
      setCollege(data.college || '')
      setBranch(data.branch || '')
      setGradYear(data.grad_year || '')
      setCgpa(data.cgpa || '')
      setSkills(data.skills ? data.skills.join(', ') : '')
      setProgrammingLanguages(data.programming_languages ? data.programming_languages.join(', ') : '')
      setTargetRole(data.target_role || '')
      setTargetCompanies(data.target_companies ? data.target_companies.join(', ') : '')
      setStudyHours(data.study_hours || '')
      setPreferredLang(data.preferred_lang || 'Python')
      setProjects(data.projects || [])
      setCertifications(data.certifications || [])
    } catch (err) {
      if (err.response?.status !== 444) {
        console.error("Error loading profile:", err)
        setError("Failed to fetch profile details.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddProject = () => {
    if (!newProjTitle.trim() || !newProjDesc.trim()) return
    setProjects([...projects, { title: newProjTitle.trim(), description: newProjDesc.trim() }])
    setNewProjTitle('')
    setNewProjDesc('')
  }

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index))
  }

  const handleAddCert = () => {
    if (!newCert.trim()) return
    setCertifications([...certifications, newCert.trim()])
    setNewCert('')
  }

  const handleRemoveCert = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    // Form mappings
    const skillsList = skills.split(',').map(s => s.trim()).filter(Boolean)
    const languagesList = programmingLanguages.split(',').map(s => s.trim()).filter(Boolean)
    const companiesList = targetCompanies.split(',').map(s => s.trim()).filter(Boolean)

    const payload = {
      name,
      college,
      branch,
      grad_year: gradYear ? parseInt(gradYear) : null,
      cgpa: cgpa ? parseFloat(cgpa) : 0.0,
      skills: skillsList,
      programming_languages: languagesList,
      projects,
      certifications,
      target_role: targetRole,
      target_companies: companiesList,
      study_hours: studyHours ? parseInt(studyHours) : 0,
      preferred_lang: preferredLang
    }

    try {
      await axios.post('/api/profile', payload)
      setSuccess(true)
      await refreshUser()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      setError("Failed to save profile changes.")
    } finally {
      setSaving(false)
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
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">Student Profile</h2>
          <p className="text-xs text-slate-400">Keep your education and skills details up to date.</p>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2 animate-pulse">
          <CheckCircle size={16} />
          <span>Profile saved successfully! Dashboard readiness scores updated.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Profile */}
        <div className="glass-panel p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <Sparkles size={14} className="text-emerald-500" />
            <span>Academic & Personal</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="glass-input" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">College / University</label>
              <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} placeholder="State University of Tech" className="glass-input" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Branch / Specialization</label>
              <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Computer Science & Engineering" className="glass-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Grad Year</label>
                <input type="number" value={gradYear} onChange={(e) => setGradYear(e.target.value)} placeholder="2026" className="glass-input" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Current CGPA</label>
                <input type="number" step="0.01" min="0" max="10" value={cgpa} onChange={(e) => setCgpa(e.target.value)} placeholder="8.50" className="glass-input" />
              </div>
            </div>
          </div>
        </div>

        {/* Skill Matrix */}
        <div className="glass-panel p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <span>Skill Matrix & Target Specs</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Skills (Comma-separated)</label>
              <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js, SQL, Machine Learning" className="glass-input" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Programming Languages (Comma-separated)</label>
              <input type="text" value={programmingLanguages} onChange={(e) => setProgrammingLanguages(e.target.value)} placeholder="Python, Java, C++, JavaScript" className="glass-input" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Target SDE Role</label>
              <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Software Engineer" className="glass-input" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Target Companies (Comma-separated)</label>
              <input type="text" value={targetCompanies} onChange={(e) => setTargetCompanies(e.target.value)} placeholder="Google, Microsoft, Amazon" className="glass-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Prep Hours / Week</label>
                <input type="number" value={studyHours} onChange={(e) => setStudyHours(e.target.value)} placeholder="15" className="glass-input" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Preferred Lang</label>
                <select value={preferredLang} onChange={(e) => setPreferredLang(e.target.value)} className="glass-input">
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                  <option value="JavaScript">JavaScript</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Lists: Certifications & Projects */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Projects Card */}
          <div className="glass-panel p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">Projects</h3>
              
              {/* Existing Projects List */}
              <div className="space-y-3 max-h-56 overflow-y-auto mb-4 pr-1">
                {projects.map((proj, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-2 p-3 bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{proj.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{proj.description}</p>
                    </div>
                    <button type="button" onClick={() => handleRemoveProject(idx)} className="text-red-500 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No projects listed. Add one below.</p>
                )}
              </div>
            </div>

            {/* Project Draft Inputs */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-850">
              <input type="text" value={newProjTitle} onChange={(e) => setNewProjTitle(e.target.value)} placeholder="Project Title" className="glass-input py-1.5 text-xs" />
              <textarea value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)} placeholder="Short description of tech stack and impact" className="glass-input py-1.5 text-xs h-16 resize-none" />
              <button type="button" onClick={handleAddProject} className="flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:underline">
                <Plus size={14} /> Add Project
              </button>
            </div>
          </div>

          {/* Certifications Card */}
          <div className="glass-panel p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">Certifications</h3>
              
              {/* Existing Certs List */}
              <div className="space-y-3 max-h-56 overflow-y-auto mb-4 pr-1">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-2 p-3 bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs">
                    <span className="font-semibold">{cert}</span>
                    <button type="button" onClick={() => handleRemoveCert(idx)} className="text-red-500 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {certifications.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No certifications listed. Add one below.</p>
                )}
              </div>
            </div>

            {/* Cert Draft Inputs */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-850">
              <input type="text" value={newCert} onChange={(e) => setNewCert(e.target.value)} placeholder="AWS Cloud Architect / Coursera SQL" className="glass-input py-1.5 text-xs" />
              <button type="button" onClick={handleAddCert} className="flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:underline">
                <Plus size={14} /> Add Certification
              </button>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <Save size={16} />
            )}
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  )
}
