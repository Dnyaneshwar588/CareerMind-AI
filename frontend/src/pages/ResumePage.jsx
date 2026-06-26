import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  Wrench, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react'

export default function ResumePage() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLatestAnalysis()
  }, [])

  const fetchLatestAnalysis = async () => {
    try {
      const res = await axios.get('/api/resume/analysis')
      setReport(res.data)
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Error fetching resume analysis:", err)
      }
    }
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected && selected.type === "application/pdf") {
      setFile(selected)
      setError('')
    } else {
      setError("Please select a valid PDF file")
      setFile(null)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setError('')
    setReport(null)

    // Simulate loading steps for user engagement
    const steps = [
      "PyMuPDF reading PDF content structures...",
      "spaCy scanning for technical entities & projects...",
      "Gemini checking ATS compliance rules..."
    ]

    setLoadingStep(0)
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < 2) return prev + 1
        clearInterval(interval)
        return prev
      })
    }, 2000)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post('/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      clearInterval(interval)
      setReport(res.data)
      setFile(null)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || "Failed to analyze resume. Please try again.")
    } finally {
      clearInterval(interval)
      setUploading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">AI Resume Analyzer</h2>
        <p className="text-xs text-slate-400">Upload your PDF resume to evaluate scores, check ATS match rating, and extract skills.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone */}
      {!uploading && !report && (
        <form onSubmit={handleUpload} className="glass-panel p-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl hover:border-emerald-500 dark:hover:border-emerald-500/50 transition-colors group">
          <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-105 transition-transform">
            <UploadCloud size={32} />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Drag & drop your PDF resume here</p>
          <p className="text-xs text-slate-450 mt-1 mb-6">File format: PDF (max size: 10MB)</p>
          
          <div className="flex flex-col items-center gap-3">
            <label className="bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl cursor-pointer text-sm shadow-md transition-all">
              <span>Choose PDF File</span>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            </label>
            {file && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                <FileText size={14} />
                <span>{file.name}</span>
              </div>
            )}
          </div>

          {file && (
            <button type="submit" className="mt-8 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-md">
              Start AI Analysis
            </button>
          )}
        </form>
      )}

      {/* Loading Steps Prompt */}
      {uploading && (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-6"></div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Analyzing Resume Content</h3>
          
          {/* Steps animation */}
          <div className="mt-6 space-y-3 max-w-sm mx-auto text-left">
            {[
              "PyMuPDF reading PDF content structures...",
              "spaCy scanning for technical entities & projects...",
              "Gemini checking ATS compliance rules..."
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-medium">
                <div className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] ${
                  loadingStep > idx 
                    ? 'bg-emerald-500 text-white' 
                    : loadingStep === idx 
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' 
                      : 'bg-slate-100 dark:bg-slate-850 text-slate-400'
                }`}>
                  {loadingStep > idx ? '✓' : idx + 1}
                </div>
                <span className={loadingStep === idx ? 'text-slate-800 dark:text-slate-200 font-semibold' : 'text-slate-400'}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Report View */}
      {report && (
        <div className="space-y-6 animate-fade-in">
          {/* Action Trigger */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400">File: <strong className="text-slate-700 dark:text-slate-200">{report.filename}</strong></span>
            <button onClick={() => setReport(null)} className="text-xs font-bold text-emerald-500 hover:underline">
              Upload Different File
            </button>
          </div>

          {/* Scores Card */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Overall Score</span>
              <span className="text-5xl font-extrabold font-display bg-gradient-to-r from-emerald-500 to-indigo-600 bg-clip-text text-transparent">{report.resume_score}</span>
              <span className="text-xs text-slate-400 mt-2">out of 100 points</span>
            </div>

            <div className="glass-panel p-6 col-span-2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">ATS Compatibility Rating</span>
                <span className="text-3xl font-extrabold font-display">{report.ats_score}%</span>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  An ATS compatibility rating above 80% increases your CV shortlisting rates significantly. Align keywords dynamically to improve.
                </p>
              </div>
              <div className="space-y-2 mt-4">
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${report.ats_score}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                  <span>Weak</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed analysis suggestions */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Strengths */}
            <div className="glass-panel p-6 space-y-4 col-span-1">
              <h3 className="text-sm font-bold text-emerald-500 flex items-center gap-1.5 border-b border-slate-150 dark:border-slate-800 pb-2">
                <ShieldCheck size={16} />
                <span>Resume Strengths</span>
              </h3>
              <ul className="space-y-3">
                {report.strengths?.map((str, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="glass-panel p-6 space-y-4 col-span-1">
              <h3 className="text-sm font-bold text-indigo-500 flex items-center gap-1.5 border-b border-slate-150 dark:border-slate-800 pb-2">
                <AlertCircle size={16} />
                <span>Identified Issues</span>
              </h3>
              <ul className="space-y-3">
                {report.weaknesses?.map((weak, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="glass-panel p-6 space-y-4 col-span-1">
              <h3 className="text-sm font-bold text-teal-500 flex items-center gap-1.5 border-b border-slate-150 dark:border-slate-800 pb-2">
                <Wrench size={16} />
                <span>Improvement Steps</span>
              </h3>
              <ul className="space-y-3">
                {report.suggestions?.map((sug, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                    <span className="text-teal-500 font-bold">+</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Profile Extracted Details Preview */}
          {report.extracted_profile && (
            <div className="glass-panel p-6 space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <Sparkles size={14} className="text-emerald-500" />
                <span>Information Extracted by AI Parser</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                    <span className="text-slate-400">Name</span>
                    <span className="font-semibold">{report.extracted_profile.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                    <span className="text-slate-400">College</span>
                    <span className="font-semibold">{report.extracted_profile.college}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                    <span className="text-slate-400">Branch</span>
                    <span className="font-semibold">{report.extracted_profile.branch}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2">
                    <span className="text-slate-400">CGPA</span>
                    <span className="font-semibold">{report.extracted_profile.cgpa}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-col border-b border-slate-100 dark:border-slate-900 pb-2">
                    <span className="text-slate-400 mb-1">Skills Identified</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {report.extracted_profile.skills?.map((skill, idx) => (
                        <span key={idx} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-semibold">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col border-b border-slate-100 dark:border-slate-900 pb-2">
                    <span className="text-slate-400 mb-1">Languages Extracted</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {report.extracted_profile.programming_languages?.map((lang, idx) => (
                        <span key={idx} className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px] font-semibold">{lang}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
