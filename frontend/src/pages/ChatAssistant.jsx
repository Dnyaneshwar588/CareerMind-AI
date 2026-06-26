import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { 
  Bot, 
  Send, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Bookmark,
  Building2,
  FileText,
  Loader2
} from 'lucide-react'

// Simple client-side markdown to html compiler
function compileMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Lists
  html = html.replace(/^\s*-\s+(.*?)$/gm, '<li class="ml-4 list-disc pl-1 py-0.5">$1</li>');
  html = html.replace(/^\s*\*\s+(.*?)$/gm, '<li class="ml-4 list-disc pl-1 py-0.5">$1</li>');
  
  // Code block
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-3 rounded-lg text-[11px] overflow-x-auto my-2 border border-slate-800">$1</pre>');
  
  // Inline code
  html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded font-mono text-[11px]">$1</code>');
  
  // Linebreaks
  html = html.replace(/\n/g, '<br/>');
  
  return html;
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  const suggestionPrompts = [
    "Explain DBMS normalization 1NF, 2NF, 3NF.",
    "Which companies am I eligible for?",
    "Suggest SDE projects for my resume.",
    "How do I prepare for Oracle?"
  ]

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (queryText) => {
    const query = queryText.trim()
    if (!query || loading) return

    setInput('')
    // Add user question to screen
    const userMsg = { text: query, sender: 'user' }
    setMessages(prev => [...prev, userMsg])
    
    setLoading(true)

    try {
      const res = await axios.post('/api/chat/ask', { question: query })
      
      const assistantMsg = {
        text: res.data.answer,
        sender: 'assistant',
        sources: res.data.sources
      }
      
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      console.error(err)
      const errorMsg = {
        text: "Sorry, I encountered an error searching the database or contacting the AI server.",
        sender: 'assistant',
        error: true
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">AI Career Assistant</h2>
        <p className="text-xs text-slate-400">Ask career preparation questions. Responses are verified using RAG context search from FAISS.</p>
      </div>

      <div className="glass-panel flex flex-col h-[70vh] relative overflow-hidden">
        {/* Chat Timeline */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Welcome Message */}
          <div className="flex items-start gap-3 max-w-[85%]">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="space-y-3">
              <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-2xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                Hi! I am your Placement Strategist Assistant. Ask me anything about eligibility cuts, study guides, interview rounds, resume improvements, or DBMS/SQL notes. I retrieve accurate context from our vector database before answering!
              </div>
              
              {/* Suggestions chips */}
              {messages.length === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
                  {suggestionPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="text-left bg-white/80 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-[11px] font-semibold transition-all duration-200 flex items-start gap-1.5"
                    >
                      <HelpCircle size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conversations logs */}
          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-2">
              <div className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'assistant' && (
                  <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <Bot size={16} />
                  </div>
                )}
                
                <div 
                  className={`p-4 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-500/10 border border-emerald-500/10 text-slate-800 dark:text-slate-200' 
                      : msg.error 
                        ? 'bg-red-500/10 border border-red-500/20 text-red-500 font-semibold'
                        : 'bg-slate-100 dark:bg-slate-900/60 text-slate-850 dark:text-slate-200'
                  }`}
                  dangerouslySetInnerHTML={{ __html: msg.sender === 'assistant' ? compileMarkdown(msg.text) : msg.text }}
                />

                {msg.sender === 'user' && (
                  <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-855 text-slate-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    U
                  </div>
                )}
              </div>

              {/* Citations / Sources tags */}
              {msg.sender === 'assistant' && msg.sources?.length > 0 && (
                <div className="pl-11 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1 uppercase tracking-wide">Context Sources:</span>
                  {msg.sources.map((src, sIdx) => (
                    <span 
                      key={sIdx} 
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-450 flex items-center gap-1"
                    >
                      {src.type === 'company' ? <Building2 size={10} className="text-indigo-400" /> : src.type === 'resume' ? <FileText size={10} className="text-emerald-400" /> : <BookOpen size={10} className="text-teal-400" />}
                      <span>{src.name}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3 pl-11 text-xs text-slate-400">
              <Loader2 size={12} className="animate-spin" />
              <span>AI Assistant researching vector database index...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            handleSend(input)
          }} 
          className="h-16 border-t border-slate-200/50 dark:border-slate-800/80 px-4 md:px-6 flex items-center gap-3 bg-white/50 dark:bg-slate-900/30"
        >
          <input
            type="text"
            required
            disabled={loading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about database, SQL, company preparation, or resume optimization..."
            className="flex-1 bg-transparent border-none text-xs text-slate-850 dark:text-slate-100 focus:outline-none placeholder:text-slate-450"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="h-9 w-9 bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md disabled:opacity-40 transition-colors"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}
