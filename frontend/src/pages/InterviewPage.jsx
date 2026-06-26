import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { 
  MessageSquare, 
  User, 
  Send, 
  Award, 
  TrendingUp, 
  BookOpen, 
  Volume2, 
  VolumeX,
  Loader2, 
  ShieldCheck, 
  ChevronDown,
  Sparkles,
  ClipboardList,
  Video,
  VideoOff,
  Mic,
  MicOff
} from 'lucide-react'

export default function InterviewPage() {
  const [inSession, setInSession] = useState(false)
  const [sessionInfo, setSessionInfo] = useState(null)
  const [history, setHistory] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [loadingAnswer, setLoadingAnswer] = useState(false)
  const [companies, setCompanies] = useState([])
  
  // Setup Form States
  const [role, setRole] = useState('Software Engineer')
  const [type, setType] = useState('Technical')
  const [company, setCompany] = useState('')
  
  // Completed states
  const [finalScore, setFinalScore] = useState(null)
  const [finalFeedback, setFinalFeedback] = useState('')

  // Accordion details index for feedback turns
  const [openFeedbackIdx, setOpenFeedbackIdx] = useState(null)

  // Camera & Mic states
  const [cameraActive, setCameraActive] = useState(false)
  const [stream, setStream] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [silenceCountdown, setSilenceCountdown] = useState(null)

  const chatEndRef = useRef(null)
  const videoRef = useRef(null)
  const recognitionRef = useRef(null)
  const silenceTimeoutRef = useRef(null)
  const countdownIntervalRef = useRef(null)
  const transcriptContainerRef = useRef(null)

  // Refs to prevent stale closure bugs in SpeechRecognition callback
  const sessionInfoRef = useRef(null)
  const currentQuestionRef = useRef('')
  const loadingAnswerRef = useRef(false)

  // Helper wrappers to sync state and refs
  const setSessionInfoWithRef = (info) => {
    setSessionInfo(info)
    sessionInfoRef.current = info
  }

  const setCurrentQuestionWithRef = (q) => {
    setCurrentQuestion(q)
    currentQuestionRef.current = q
  }

  const setLoadingAnswerWithRef = (loading) => {
    setLoadingAnswer(loading)
    loadingAnswerRef.current = loading
  }

  useEffect(() => {
    fetchCompanies()
    return () => {
      // Cleanup camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      // Cleanup recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      // Cancel speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [stream])

  useEffect(() => {
    // Auto-scroll only the local transcript container
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTo({
        top: transcriptContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [history, currentQuestion, loadingAnswer])

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('/api/companies')
      setCompanies(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const startCamera = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      setStream(userStream)
      setCameraActive(true)
      // Ensure video element gets stream once rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = userStream
        }
      }, 100)
    } catch (err) {
      console.error("Camera access blocked:", err)
      alert("Failed to access camera. Please check browser permissions.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setCameraActive(false)
  }

  const speak = (text, onEndCallback) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95 // slightly slower for better clarity
      
      utterance.onstart = () => {
        setAiSpeaking(true)
      }
      utterance.onend = () => {
        setAiSpeaking(false)
        if (onEndCallback) onEndCallback()
      }
      utterance.onerror = (e) => {
        console.error("Speech synthesis error:", e)
        setAiSpeaking(false)
        if (onEndCallback) onEndCallback()
      }
      
      let voices = window.speechSynthesis.getVoices()
      
      const doSpeak = () => {
        const englishVoice = voices.find(v => v.lang.startsWith('en'))
        if (englishVoice) {
          utterance.voice = englishVoice
        }
        window.speechSynthesis.speak(utterance)
      }
      
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices()
          doSpeak()
        }
      } else {
        doSpeak()
      }
    } else {
      if (onEndCallback) onEndCallback()
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Please use Chrome or Edge.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setUserAnswer(transcript)

      // Clear any existing silence timers
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }

      // If voice is enabled and user has spoken, start silence countdown to auto-submit
      if (voiceEnabled && transcript.trim()) {
        setSilenceCountdown(3)
        let secondsLeft = 3
        countdownIntervalRef.current = setInterval(() => {
          secondsLeft -= 1
          if (secondsLeft <= 0) {
            clearInterval(countdownIntervalRef.current)
            setSilenceCountdown(null)
          } else {
            setSilenceCountdown(secondsLeft)
          }
        }, 1000)

        silenceTimeoutRef.current = setTimeout(() => {
          setSilenceCountdown(null)
          sendAnswer(transcript.trim())
        }, 3000)
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
    recognitionRef.current = recognition
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const handleStart = async (e) => {
    e.preventDefault()
    setHistory([])
    setFinalScore(null)
    setFinalFeedback('')
    
    try {
      setLoadingAnswerWithRef(true)
      const res = await axios.post('/api/interview/start', {
        role,
        type,
        company
      })
      setSessionInfoWithRef(res.data)
      setCurrentQuestionWithRef(res.data.first_question)
      setInSession(true)
      
      // Auto-start camera and voice readout
      startCamera()
      if (voiceEnabled) {
        speak(res.data.first_question, () => {
          startListening()
        })
      } else {
        startListening()
      }
    } catch (err) {
      console.error(err)
      alert("Failed to start interview session.")
    } finally {
      setLoadingAnswerWithRef(false)
    }
  }

  const handleSendAnswer = (e) => {
    if (e) e.preventDefault()
    sendAnswer(userAnswer.trim())
  }

  const sendAnswer = async (answerText) => {
    if (!answerText || loadingAnswerRef.current) return

    // Clear any active silence timers
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }
    setSilenceCountdown(null)
    setUserAnswer('')
    stopListening() // Stop listening after sending answer
    
    // Add student's response to layout immediately
    const tempTurn = { q: currentQuestionRef.current, a: answerText, loading: true }
    setHistory(prev => [...prev, tempTurn])
    
    setLoadingAnswerWithRef(true)

    try {
      const res = await axios.post(`/api/interview/${sessionInfoRef.current?.session_id}/answer`, {
        current_question: currentQuestionRef.current,
        user_answer: answerText
      })
      
      const data = res.data
      
      // Update history with parsed scores and feedback
      setHistory(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          q: currentQuestionRef.current,
          a: answerText,
          score: data.score,
          accuracy_score: data.accuracy_score,
          communication_score: data.communication_score,
          confidence_score: data.confidence_score,
          completeness_score: data.completeness_score,
          feedback: data.feedback,
          better_answer: data.better_answer
        }
        return updated
      })

      // Set open accordion for the newly graded turn
      setOpenFeedbackIdx(history.length)

      if (data.is_complete) {
        setFinalScore(data.overall_score)
        setFinalFeedback(data.overall_feedback)
        setInSession(false)
        setCurrentQuestionWithRef('')
        stopCamera()
        if (voiceEnabled) {
          speak("The mock interview session is complete. Thank you.")
        }
      } else {
        setCurrentQuestionWithRef(data.next_question)
        if (voiceEnabled) {
          speak(data.next_question, () => {
            startListening()
          })
        } else {
          startListening()
        }
      }
    } catch (err) {
      console.error(err)
      alert("Error grading answer. Please try resubmitting.")
    } finally {
      setLoadingAnswerWithRef(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">AI Mock Interview</h2>
        <p className="text-xs text-slate-400">Conduct mock interviews evaluated by Gemini. Use camera stream feed and voice composition for a real live simulation.</p>
      </div>

      {/* Setup screen */}
      {!inSession && !finalScore && (
        <div className="glass-panel p-8 max-w-xl mx-auto">
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-lg font-bold">Configure Mock Interview Console</h3>
            <p className="text-xs text-slate-400 mt-1">Select targets to align mock questions to specific formats.</p>
          </div>

          <form onSubmit={handleStart} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase tracking-wider">Target Job Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="glass-input">
                <option value="Software Engineer">Software Engineer</option>
                <option value="AI Engineer">AI Engineer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Database Administrator">Database Administrator</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase tracking-wider">Interview Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="glass-input">
                <option value="Technical">Technical Interview (Core CS & DSA)</option>
                <option value="HR">HR Interview (General suitability)</option>
                <option value="Behavioral">Behavioral Interview (STAR method cases)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase tracking-wider">Target Employer (Optional)</label>
              <select value={company} onChange={(e) => setCompany(e.target.value)} className="glass-input">
                <option value="">Generic Tech Firm</option>
                {companies.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md text-sm transition-all">
              Initialize Mock Session
            </button>
          </form>
        </div>
      )}

      {/* Interview Dashboard Layout Grid */}
      {(inSession || finalScore) && (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Main Interview Box (col-span-2) */}
          <div className="lg:col-span-2 glass-panel flex flex-col h-[75vh] relative overflow-hidden">
            {/* Console Header */}
            <div className="h-14 border-b border-slate-200/50 dark:border-slate-800/80 px-6 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
                <span className="text-xs font-bold">{sessionInfo?.type} Interview • {sessionInfo?.role}</span>
              </div>
              {sessionInfo?.company && (
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-bold uppercase">
                  {sessionInfo.company}
                </span>
              )}
            </div>

            {/* Transcript logs list */}
            <div ref={transcriptContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {history.map((turn, idx) => (
                <div key={idx} className="space-y-4">
                  {/* Question */}
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs flex-shrink-0">AI</div>
                    <div className="space-y-1">
                      <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl text-xs text-slate-800 dark:text-slate-200">
                        {turn.q}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => speak(turn.q)} 
                        className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-semibold ml-2"
                      >
                        <Volume2 size={10} />
                        <span>Repeat question</span>
                      </button>
                    </div>
                  </div>

                  {/* Student Answer */}
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-emerald-500/10 border border-emerald-500/10 p-4 rounded-2xl text-xs text-slate-800 dark:text-slate-200 max-w-[80%]">
                      {turn.a}
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">ME</div>
                  </div>

                  {/* Score & AI feedback widget */}
                  {turn.loading ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
                      <Loader2 size={12} className="animate-spin" />
                      <span>AI Interviewer evaluating response...</span>
                    </div>
                  ) : turn.feedback ? (
                    <div className="pl-11 max-w-[90%] animate-fade-in">
                      <div className="border border-slate-200/50 dark:border-slate-800/80 rounded-xl overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() => setOpenFeedbackIdx(openFeedbackIdx === idx ? null : idx)}
                          className="w-full flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20 px-4 py-2.5 font-bold"
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            <span>Evaluation: Score {turn.score}/10</span>
                          </div>
                          <ChevronDown size={14} className={`transform transition-transform ${openFeedbackIdx === idx ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {openFeedbackIdx === idx && (
                          <div className="p-4 bg-white dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-900 space-y-4 leading-normal text-slate-500 dark:text-slate-400">
                            {/* Scoring criteria progress bars */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px]">
                              {[
                                { label: 'Technical', val: turn.accuracy_score, col: 'bg-emerald-500' },
                                { label: 'Communication', val: turn.communication_score, col: 'bg-indigo-500' },
                                { label: 'Confidence', val: turn.confidence_score, col: 'bg-teal-500' },
                                { label: 'Completeness', val: turn.completeness_score, col: 'bg-indigo-600' }
                              ].map((crit, cIdx) => (
                                <div key={cIdx} className="space-y-1">
                                  <span className="font-bold uppercase tracking-wide">{crit.label}</span>
                                  <div className="flex items-center gap-1.5 font-semibold">
                                    <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                      <div className={`h-full ${crit.col}`} style={{ width: `${crit.val * 10}%` }}></div>
                                    </div>
                                    <span>{crit.val}/10</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-450 uppercase block">Critique</span>
                              <p>{turn.feedback}</p>
                            </div>

                            {turn.better_answer && turn.better_answer !== 'N/A' && (
                              <div className="space-y-1 bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/10">
                                <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                                  <Sparkles size={10} />
                                  <span>Suggested Model Answer</span>
                                </span>
                                <p className="text-[11px] text-slate-650 dark:text-slate-350 italic mt-1 leading-relaxed">
                                  {turn.better_answer}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}

              {/* Current Question */}
              {currentQuestion && !loadingAnswer && (
                <div className="flex items-start gap-3 max-w-[80%] animate-fade-in">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs flex-shrink-0">AI</div>
                  <div className="space-y-1">
                    <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl text-xs text-slate-800 dark:text-slate-200">
                      {currentQuestion}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => speak(currentQuestion, () => startListening())} 
                      className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-semibold ml-2"
                    >
                      <Volume2 size={10} />
                      <span>Read Question Aloud</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Final Completed Summary card */}
              {finalScore && (
                <div className="max-w-xl mx-auto glass-panel p-6 border border-emerald-500 space-y-6 text-center animate-fade-in">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <Award size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide font-display">Final Evaluation Complete</span>
                    <h3 className="text-xl font-bold mt-1">Average Response Rating</h3>
                    <span className="text-4xl font-extrabold font-display bg-gradient-to-r from-emerald-500 to-indigo-600 bg-clip-text text-transparent block mt-2">{finalScore} / 100</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-left">
                    <strong className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block mb-1">Coaching Summary</strong>
                    {finalFeedback}
                  </div>
                  <button 
                    onClick={() => {
                      setFinalScore(null)
                      setInSession(false)
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md"
                  >
                    Restart New Interview
                  </button>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Typing input bar */}
            {inSession && (
              <form onSubmit={handleSendAnswer} className="h-16 border-t border-slate-200/50 dark:border-slate-800/80 px-4 md:px-6 flex items-center gap-3 bg-white/50 dark:bg-slate-900/30">
                {/* Speech Recognition Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center border transition-all ${
                    isListening 
                      ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' 
                      : 'bg-slate-100 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-250'
                  }`}
                  title={isListening ? "Stop Voice Recognition" : "Start Voice Recognition"}
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                </button>

                <input
                  type="text"
                  required
                  disabled={loadingAnswer}
                  value={userAnswer}
                  onChange={(e) => {
                    setUserAnswer(e.target.value)
                    // Clear silence timeout if user manually starts typing
                    if (silenceTimeoutRef.current) {
                      clearTimeout(silenceTimeoutRef.current)
                    }
                    if (countdownIntervalRef.current) {
                      clearInterval(countdownIntervalRef.current)
                    }
                    setSilenceCountdown(null)
                  }}
                  placeholder={
                    isListening 
                      ? (silenceCountdown !== null 
                          ? `Auto-submitting in ${silenceCountdown}s...` 
                          : "Listening... Speak now...") 
                      : "Type your response to the question..."
                  }
                  className="flex-1 bg-transparent border-none text-xs text-slate-850 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!userAnswer.trim() || loadingAnswer}
                  className="h-9 w-9 bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md disabled:opacity-40 transition-colors"
                >
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Live Feed & Settings Panel */}
          <div className="lg:col-span-1 glass-panel p-6 flex flex-col justify-between bg-slate-950/20 border-l border-slate-200/50 dark:border-slate-800/80 h-[75vh]">
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
              
              {/* Part 1: AI Interviewer Avatar */}
              <div className="glass-panel p-4 bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/40 flex flex-col items-center justify-center min-h-[190px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-4">AI Interviewer</span>
                
                {loadingAnswer ? (
                  <div className="flex flex-col items-center justify-center animate-fade-in">
                    <div className="relative h-20 w-20 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                      <div className="absolute inset-2 rounded-full border-4 border-emerald-500/20 border-b-emerald-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                      <Sparkles className="text-indigo-400 animate-pulse" size={24} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mt-3 animate-pulse">Evaluating Answer...</p>
                  </div>
                ) : aiSpeaking ? (
                  <div className="flex flex-col items-center justify-center animate-fade-in">
                    <div className="relative h-20 w-20 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: '2s' }}></div>
                      <div className="absolute inset-2 rounded-full bg-indigo-500/20 animate-ping" style={{ animationDuration: '1.5s' }}></div>
                      <div className="absolute inset-4 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center z-10">
                        <Volume2 className="text-white animate-bounce" size={22} />
                      </div>
                    </div>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider text-center mt-3 animate-pulse">Asking Question...</p>
                  </div>
                ) : isListening ? (
                  <div className="flex flex-col items-center justify-center animate-fade-in">
                    <div className="relative h-20 w-20 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-pulse"></div>
                      <div className="absolute inset-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                        <Mic className="text-emerald-500 animate-pulse" size={22} />
                      </div>
                    </div>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider text-center mt-3 animate-pulse">Listening to Response...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center animate-fade-in">
                    <div className="relative h-20 w-20 flex items-center justify-center">
                      <div className="absolute inset-2 rounded-full border border-slate-350 dark:border-slate-850 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50">
                        <User className="text-slate-400" size={22} />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mt-3">Ready to Start</p>
                  </div>
                )}
              </div>

              {/* Part 2: Candidate Live Feed (Webcam) */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Candidate Camera Feed</span>
                <div className="relative w-full h-32 rounded-xl bg-slate-950 overflow-hidden border border-slate-200/40 dark:border-slate-800 flex flex-col items-center justify-center text-center p-2">
                  {cameraActive ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute top-2 left-2 bg-red-500 text-white font-bold text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 z-10 shadow-md">
                        <span className="h-1 w-1 rounded-full bg-white animate-ping"></span>
                        <span>LIVE</span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                        <VideoOff size={14} />
                      </div>
                      <p className="text-[9px] text-slate-400 leading-relaxed max-w-[180px] mx-auto">
                        Camera disabled.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {cameraActive ? (
                    <button
                      onClick={stopCamera}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 font-bold py-1.5 rounded-lg text-[10px] transition-all shadow-sm"
                    >
                      <VideoOff size={10} />
                      <span>Stop Camera</span>
                    </button>
                  ) : (
                    <button
                      onClick={startCamera}
                      className="flex-1 flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 rounded-lg text-[10px] transition-all shadow-sm shadow-emerald-500/10"
                    >
                      <Video size={10} />
                      <span>Start Camera</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Part 3: Voice Controls */}
              <div className="border-t border-slate-200/20 dark:border-slate-800/80 pt-3 space-y-3">
                {/* Voice assistant toggle */}
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold block">AI Voice Assistant</span>
                    <span className="text-[9px] text-slate-400 block">AI asks question aloud</span>
                  </div>
                  <button
                    onClick={() => {
                      const newEnabled = !voiceEnabled
                      setVoiceEnabled(newEnabled)
                      if (newEnabled && currentQuestion) {
                        speak(currentQuestion, () => startListening())
                      } else {
                        window.speechSynthesis.cancel()
                        setAiSpeaking(false)
                      }
                    }}
                    className={`h-7 px-2 rounded-lg border font-semibold text-[10px] flex items-center gap-1 transition-all ${
                      voiceEnabled 
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500 dark:text-indigo-400' 
                        : 'bg-slate-100 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    {voiceEnabled ? <Volume2 size={10} /> : <VolumeX size={10} />}
                    <span>{voiceEnabled ? "Mute AI" : "Unmute AI"}</span>
                  </button>
                </div>

                {/* Voice Input dictation info */}
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold block">Voice Dictation</span>
                    <span className="text-[9px] text-slate-400 block">Auto-opens microphone</span>
                  </div>
                  <button
                    onClick={toggleListening}
                    className={`h-7 px-2 rounded-lg border font-semibold text-[10px] flex items-center gap-1 transition-all ${
                      isListening 
                        ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' 
                        : 'bg-slate-100 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    {isListening ? <MicOff size={10} /> : <Mic size={10} />}
                    <span>{isListening ? "Listening" : "Speak Now"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live coaching banner */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl text-[9px] text-slate-450 leading-relaxed mt-3 flex-shrink-0">
              <strong className="text-emerald-500 block mb-0.5">💡 Pro-Tip:</strong>
              Look directly at the camera, maintain posture, and speak clearly. The AI evaluates your technical details and communication delivery.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
