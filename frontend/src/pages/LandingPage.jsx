import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  BrainCircuit, 
  SearchCode, 
  FileCheck, 
  Award, 
  ArrowRight, 
  ChevronDown, 
  UserCheck, 
  Target, 
  CheckCircle2, 
  GraduationCap
} from 'lucide-react'

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null)
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const features = [
    {
      icon: FileCheck,
      title: "AI Resume Analyzer",
      description: "Extract resume fields automatically and evaluate ATS compatibility score. Get concrete suggestions to increase shortlist odds."
    },
    {
      icon: SearchCode,
      title: "Company Recommendation",
      description: "Compare your CGPA, projects, and skill matrix against eligibility thresholds of top companies to check your admission probability."
    },
    {
      icon: BrainCircuit,
      title: "AI Mock Interviews",
      description: "Conduct realistic technical and HR interviews. Enter replies textually, and receive immediate scores and model-level revisions."
    },
    {
      icon: Target,
      title: "Custom Study Planner",
      description: "Generates step-by-step daily and weekly prep roadmaps covering DSA, SQL, and core CS based on study hour constraints."
    }
  ]

  const faqs = [
    {
      q: "How does the Placement Readiness Score work?",
      a: "Our algorithm compiles multiple indicators: academic CGPA, resume quality rating, completeness of technical skills, and average scores from mock interviews to calculate your overall readiness out of 100 points."
    },
    {
      q: "What companies are supported in the database?",
      a: "We support pre-populated records for major hiring companies including Google, Microsoft, NVIDIA, Amazon, Oracle, Deloitte, TCS, Infosys, and Accenture, detailing CGPA cuts and rounds."
    },
    {
      q: "Is the resume parsing automatic?",
      a: "Yes. Simply upload your PDF resume, and the platform extracts your college details, grades, skills, projects, and achievements using NLP parser layers to seed your profile details."
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  }

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200 overflow-x-hidden relative">
      {/* Decorative Lights */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full filter blur-[150px] bg-emerald-500/10 dark:bg-emerald-500/5 pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full filter blur-[150px] bg-indigo-500/10 dark:bg-indigo-500/5 pointer-events-none"></div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-md">
            <Sparkles size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight font-display">Campus AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold hover:text-emerald-500 transition-colors">Sign In</Link>
          <Link to="/register" className="text-sm font-semibold bg-emerald-500 text-white px-5 py-2 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10">Get Started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-6 border border-emerald-500/20"
        >
          <BrainCircuit size={14} />
          <span>Supercharged by Gemini 1.5 & RAG</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-display max-w-4xl mx-auto leading-tight"
        >
          Crack Your Dream Campus Placements with <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 bg-clip-text text-transparent">Generative AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-6 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
        >
          Upload your resume, find technical skill gaps, build weekly custom schedules, and practice conversational mock interviews tailored to top employers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/register" className="group flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 dark:shadow-emerald-500/10">
            <span>Analyze Resume Now</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <span>Student Dashboard</span>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-slate-800/50 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight font-display">Four Core Pillars of Success</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3">An end-to-end strategist preparing you step-by-step for placement day.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feat, index) => {
            const Icon = feat.icon
            return (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="glass-card p-6"
              >
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-slate-800/50 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight font-display">Student Success Stories</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3">Read reviews from engineering graduates who landed SDE offers.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 flex flex-col justify-between">
            <p className="text-sm italic text-slate-500 dark:text-slate-400 leading-relaxed">
              "The AI resume review was a game-changer. It highlighted my missing SQL tags. After updating my project sections, I got calls from Amazon and Oracle!"
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="h-10 w-10 rounded-full bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold">RD</div>
              <div>
                <h4 className="text-sm font-bold">Rohan Deshmukh</h4>
                <p className="text-xs text-slate-400">Placed at Amazon (SDE-1)</p>
              </div>
            </div>
          </div>
          <div className="glass-panel p-6 flex flex-col justify-between">
            <p className="text-sm italic text-slate-500 dark:text-slate-400 leading-relaxed">
              "The mock interview engine evaluates confidence and accuracy. Practicing role-specific questions for NVIDIA helped me tackle core OS theory effortlessly during the final rounds."
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">PS</div>
              <div>
                <h4 className="text-sm font-bold">Priya Sharma</h4>
                <p className="text-xs text-slate-400">Placed at NVIDIA (Hardware-Software SDE)</p>
              </div>
            </div>
          </div>
          <div className="glass-panel p-6 flex flex-col justify-between">
            <p className="text-sm italic text-slate-500 dark:text-slate-400 leading-relaxed">
              "Having a weekly study schedule mapped around my target CGPA cutoffs kept me accountable. The RAG assistant answered normalization questions in detail."
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="h-10 w-10 rounded-full bg-teal-500/20 text-teal-600 flex items-center justify-center font-bold">AK</div>
              <div>
                <h4 className="text-sm font-bold">Amit Kulkarni</h4>
                <p className="text-xs text-slate-400">Placed at Deloitte (Consultant)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="max-w-3xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-slate-800/50 relative z-10">
        <h2 className="text-3xl font-extrabold tracking-tight font-display text-center mb-12">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel overflow-hidden transition-all duration-300">
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left font-bold"
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} className={`transform transition-transform duration-200 ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-900 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Dummy Pricing */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-slate-800/50 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight font-display">Student Friendly Pricing</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3">Prepare for placement day without financial stress.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="glass-panel p-8 relative flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold">Standard Plan</h3>
              <p className="text-slate-400 text-xs mt-1">For basic profile preparation</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight font-display">$0</span>
                <span className="text-slate-400 text-sm">/ forever</span>
              </div>
              <ul className="mt-8 space-y-3.5 text-sm text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Resume Parsing</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Company Matching</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> 1 Mock Interview / month</li>
              </ul>
            </div>
            <Link to="/register" className="mt-8 block text-center w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 py-3 rounded-xl font-bold text-sm">Sign Up Free</Link>
          </div>

          <div className="glass-panel p-8 relative border-2 border-emerald-500 flex flex-col justify-between shadow-2xl shadow-emerald-500/5">
            <span className="absolute top-0 right-6 transform -translate-y-1/2 bg-emerald-500 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">Recommended</span>
            <div>
              <h3 className="text-lg font-bold">Premium Strategist</h3>
              <p className="text-slate-400 text-xs mt-1">Best for active job hunters</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight font-display">$9</span>
                <span className="text-slate-400 text-sm">/ month</span>
              </div>
              <ul className="mt-8 space-y-3.5 text-sm text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Unlimited Resume scoring</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Unlimited AI Mock Interviews</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Full custom study plans</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> 24/7 RAG Career Assistant</li>
              </ul>
            </div>
            <Link to="/register" className="mt-8 block text-center w-full bg-emerald-500 hover:bg-emerald-600 py-3 rounded-xl font-bold text-white text-sm shadow-lg shadow-emerald-500/25">Join Premium</Link>
          </div>

          <div className="glass-panel p-8 relative flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold">College License</h3>
              <p className="text-slate-400 text-xs mt-1">For placement departments</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight font-display">Custom</span>
              </div>
              <ul className="mt-8 space-y-3.5 text-sm text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Admin panel for department heads</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Bulk resume imports</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Student analytics console</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Single Sign-On (SSO)</li>
              </ul>
            </div>
            <Link to="/register" className="mt-8 block text-center w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 py-3 rounded-xl font-bold text-sm">Contact Support</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/80 mt-12 bg-white/30 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <GraduationCap className="text-emerald-500" size={20} />
            <span className="font-semibold text-slate-500 dark:text-slate-300">AI Campus Placement Strategist</span>
          </div>
          <p>© 2026 AI Campus Placement Strategist. Built for showcase purposes.</p>
        </div>
      </footer>
    </div>
  )
}
