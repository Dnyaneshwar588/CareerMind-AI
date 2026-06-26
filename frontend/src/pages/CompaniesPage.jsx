import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Building2, 
  MapPin, 
  Wallet, 
  CheckCircle, 
  AlertTriangle, 
  XOctagon, 
  Sparkles, 
  BookOpen, 
  Terminal, 
  ChevronRight,
  HelpCircle
} from 'lucide-react'

export default function CompaniesPage() {
  const [recommendations, setRecommendations] = useState(null)
  const [companiesList, setCompaniesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('eligible')
  
  // Modals state
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [skillGapData, setSkillGapData] = useState(null)
  const [loadingModal, setLoadingModal] = useState(false)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const [recRes, compRes] = await Promise.all([
        axios.get('/api/companies/recommendations'),
        axios.get('/api/companies')
      ])
      setRecommendations(recRes.data)
      setCompaniesList(compRes.data)
    } catch (err) {
      console.error("Error loading recommendations:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetails = (companyId) => {
    const comp = companiesList.find(c => c.id === companyId)
    setSelectedCompany(comp)
  }

  const handleOpenSkillGap = async (companyId) => {
    try {
      setLoadingModal(true)
      setSkillGapData(null)
      const res = await axios.get(`/api/companies/${companyId}/skill-gap`)
      setSkillGapData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    )
  }

  const getCompanyListForTab = () => {
    if (!recommendations) return []
    if (activeTab === 'eligible') return recommendations.eligible
    if (activeTab === 'nearly_eligible') return recommendations.nearly_eligible
    return recommendations.not_eligible
  }

  const currentList = getCompanyListForTab()

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">Company Matcher</h2>
          <p className="text-xs text-slate-400">Match your academic CGPA and skills portfolio against criteria of top corporate recruiters.</p>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {[
          { key: 'eligible', label: 'Eligible', count: recommendations?.eligible?.length || 0, color: 'text-emerald-500 border-emerald-500' },
          { key: 'nearly_eligible', label: 'Nearly Eligible', count: recommendations?.nearly_eligible?.length || 0, color: 'text-amber-500 border-amber-500' },
          { key: 'not_eligible', label: 'Not Eligible', count: recommendations?.not_eligible?.length || 0, color: 'text-red-500 border-red-500' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 border-b-2 text-sm font-semibold transition-all ${
              activeTab === tab.key 
                ? `${tab.color} bg-slate-100/50 dark:bg-slate-900/30` 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cards List Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentList.map((comp) => (
          <div key={comp.id} className="glass-panel p-6 flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300">
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl flex items-center justify-center text-slate-500">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{comp.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-0.5">
                      <Wallet size={10} />
                      <span>{comp.package}</span>
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <div className="text-xs">
                  {activeTab === 'eligible' && <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-semibold text-[10px] uppercase">Ready</span>}
                  {activeTab === 'nearly_eligible' && <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-semibold text-[10px] uppercase">Nearly</span>}
                  {activeTab === 'not_eligible' && <span className="bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded font-semibold text-[10px] uppercase">Locked</span>}
                </div>
              </div>

              {/* Match Score */}
              <div className="space-y-1.5 mb-6">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-slate-400">Match Probability</span>
                  <span className={activeTab === 'eligible' ? 'text-emerald-500' : activeTab === 'nearly_eligible' ? 'text-amber-500' : 'text-red-500'}>
                    {comp.probability_score}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${
                    activeTab === 'eligible' ? 'bg-emerald-500' : activeTab === 'nearly_eligible' ? 'bg-amber-500' : 'bg-red-500'
                  }`} style={{ width: `${comp.probability_score}%` }}></div>
                </div>
              </div>

              {/* Missing skills tags */}
              {comp.missing_skills?.length > 0 && (
                <div className="mb-6">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block mb-1.5">Missing Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {comp.missing_skills.slice(0, 4).map((s, i) => (
                      <span key={i} className="bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded text-[10px] font-semibold">{s}</span>
                    ))}
                    {comp.missing_skills.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-semibold px-1.5">+{comp.missing_skills.length - 4} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-900 mt-4">
              <button
                onClick={() => handleOpenDetails(comp.id)}
                className="text-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 transition-colors"
              >
                View Pattern
              </button>
              <button
                onClick={() => handleOpenSkillGap(comp.id)}
                className="text-center bg-emerald-500 hover:bg-emerald-600 py-2.5 rounded-xl font-bold text-xs text-white transition-colors shadow-md shadow-emerald-500/10"
              >
                Skill Gap
              </button>
            </div>
          </div>
        ))}

        {currentList.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-sm text-slate-450 italic">No companies matching this category currently.</p>
          </div>
        )}
      </div>

      {/* Company Details Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[85vh] space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedCompany.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>Package: <strong>{selectedCompany.package}</strong></span>
                    <span>Min CGPA: <strong>{selectedCompany.min_cgpa}</strong></span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedCompany(null)} className="text-slate-400 hover:text-slate-200 font-bold text-sm">✕</button>
            </div>

            {/* Selection Rounds */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-450 uppercase tracking-wide block border-b border-slate-100 dark:border-slate-850 pb-1">Selection Rounds</span>
              <div className="space-y-2 pt-1">
                {selectedCompany.rounds?.map((round, idx) => (
                  <div key={idx} className="flex gap-2 text-xs text-slate-600 dark:text-slate-350">
                    <ChevronRight size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{round}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pattern Description */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-450 uppercase tracking-wide block border-b border-slate-100 dark:border-slate-850 pb-1">Pattern Detail</span>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed pt-1">
                {selectedCompany.pattern}
              </p>
            </div>

            {/* Preparation Tips */}
            <div className="space-y-2 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 p-4 rounded-xl">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide block flex items-center gap-1">
                <Sparkles size={14} />
                <span>AI Preparation Tips</span>
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed mt-1">
                {selectedCompany.preparation_tips}
              </p>
            </div>

            {/* FAQs */}
            {selectedCompany.faqs?.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-450 uppercase tracking-wide block border-b border-slate-100 dark:border-slate-850 pb-1">Frequently Asked Questions</span>
                <div className="space-y-3 pt-1">
                  {selectedCompany.faqs.map((faq, idx) => (
                    <div key={idx} className="text-xs space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-200/40 dark:border-slate-800/40">
                      <h4 className="font-bold flex items-center gap-1">
                        <HelpCircle size={12} className="text-indigo-400" />
                        <span>{faq.question}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skill Gap Analysis Modal */}
      {(skillGapData || loadingModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[85vh] space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold flex items-center gap-1.5">
                <BookOpen className="text-emerald-500" size={20} />
                <span>Skill Gap Analyzer: {skillGapData?.company_name || 'Loading'}</span>
              </h3>
              <button onClick={() => setSkillGapData(null)} className="text-slate-400 hover:text-slate-200 font-bold text-sm">✕</button>
            </div>

            {loadingModal ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Missing priority skills */}
                <div className="space-y-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 p-4 rounded-xl text-xs">
                  <span className="font-bold text-red-500 uppercase tracking-wide block">Priority Missing Skills</span>
                  {skillGapData.missing_skills?.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {skillGapData.skill_priorities?.high?.length > 0 && (
                        <div>
                          <strong className="text-red-400 text-[10px] uppercase font-bold tracking-wide">High Priority (DSA/Lang):</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {skillGapData.skill_priorities.high.map((s, i) => (
                              <span key={i} className="bg-red-500/15 text-red-400 px-2 py-0.5 rounded text-[10px] font-semibold">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {skillGapData.skill_priorities?.medium?.length > 0 && (
                        <div className="mt-1">
                          <strong className="text-amber-400 text-[10px] uppercase font-bold tracking-wide">Medium Priority (Web/DB):</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {skillGapData.skill_priorities.medium.map((s, i) => (
                              <span key={i} className="bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded text-[10px] font-semibold">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No missing skills. You are fully aligned!</p>
                  )}
                </div>

                {/* Estimated learning time */}
                <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-slate-400">Estimated Prep Time</span>
                  <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full text-[10px]">{skillGapData.estimated_learning_time}</span>
                </div>

                {/* Learning order */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-450 uppercase tracking-wide block">Recommended Learning Order</span>
                  <div className="space-y-2 pt-1 text-xs">
                    {skillGapData.learning_order?.map((step, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <div className="h-5 w-5 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-slate-500 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">{idx + 1}</div>
                        <span className="text-slate-600 dark:text-slate-350 mt-0.5">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended courses */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-450 uppercase tracking-wide block">Recommended Courses</span>
                  <div className="space-y-2 pt-1">
                    {skillGapData.recommended_courses?.map((course, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/40 p-3 border border-slate-200/40 dark:border-slate-800/40 rounded-xl text-xs">
                        <div>
                          <h4 className="font-bold">{course.name}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold">{course.platform}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{course.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested projects */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-450 uppercase tracking-wide block">Suggested Projects</span>
                  <div className="space-y-2 pt-1">
                    {skillGapData.suggested_projects?.map((proj, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-950/40 p-3 border border-slate-200/40 dark:border-slate-800/40 rounded-xl text-xs space-y-1">
                        <h4 className="font-bold flex items-center gap-1">
                          <Terminal size={12} className="text-emerald-500" />
                          <span>{proj.title}</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
