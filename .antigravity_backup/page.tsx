'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Loader2, CheckCircle2, ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreatorDashboard from '../components/creator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function App() {
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [surveyTitle, setSurveyTitle] = useState('');
  
  // Theme state (default to dark)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Respondent state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hydrate query params & theme on mount
  useEffect(() => {
    // 1. Theme initialization from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.classList.add(initialTheme);
    document.documentElement.classList.remove(initialTheme === 'dark' ? 'light' : 'dark');

    // 2. Hydrate query params & load dynamic survey title
    const params = new URLSearchParams(window.location.search);
    const id = params.get('surveyId');
    if (id) {
      setSurveyId(id);
      
      // Load custom survey title from DB
      fetch('/api/survey/list')
        .then((res) => res.json())
        .then((data) => {
          if (data.surveys) {
            const current = data.surveys.find((s: any) => s.id === id);
            if (current) {
              setSurveyTitle(current.title);
            } else {
              setSurveyTitle("Interactive Survey Interview");
            }
          }
        })
        .catch(() => setSurveyTitle("Interactive Survey Interview"));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.add(nextTheme);
    document.documentElement.classList.remove(theme);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setIsLoading(true);

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: userText };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages, surveyId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const body = response.body;
      if (!body) return;

      const reader = body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantMessageContent = '';
      
      const assistantMessageId = (Date.now() + 1).toString();
      
      setMessages((prev) => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (done) break;

        const chunkValue = decoder.decode(value, { stream: true });
        
        const lines = chunkValue.split('\n');
        let hasDataProtocol = false;
        let parsedText = '';

        for (const line of lines) {
          if (line.startsWith('0:')) {
            hasDataProtocol = true;
            try {
              const text = JSON.parse(line.substring(2));
              parsedText += text;
            } catch (err) {
              parsedText += line.substring(2).replace(/^"(.*)"$/, '$1');
            }
          }
        }

        if (hasDataProtocol) {
          assistantMessageContent += parsedText;
        } else {
          assistantMessageContent += chunkValue;
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: assistantMessageContent } : msg
          )
        );
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeSurvey = async () => {
    if (messages.length < 2 || isSubmittingSession) return;

    setIsSubmittingSession(true);
    try {
      const res = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId, messages }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
      }
    } catch (e) {
      console.error("Failed to submit session data:", e);
    } finally {
      setIsSubmittingSession(false);
    }
  };

  const exitSurvey = () => {
    window.location.href = '/';
  };

  // Sticky SaaS Navbar Component
  const Navbar = () => (
    <nav className="sticky-navbar px-6 py-4 flex items-center justify-between border-b border-border-subtle shadow-sm">
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.href = '/'}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-tertiary flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_var(--color-shadow-primary)]">
          G
        </div>
        <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
          Glacier
        </span>
      </div>

      <div className="flex items-center gap-4">
        {surveyId && (
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 border border-primary/20 text-primary">
            Respondent Portal
          </span>
        )}
        {!surveyId && (
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-tertiary/10 border border-tertiary/20 text-tertiary">
            Creator Studio
          </span>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 border border-border-subtle rounded-lg text-on_surface_variant hover:text-primary transition-all flex items-center justify-center shadow-sm cursor-pointer hover:scale-105"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </svg>
          )}
        </button>
      </div>
    </nav>
  );

  // Pure CSS Confetti Animation
  const ConfettiBlast = () => (
    <div className="confetti-wrapper">
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
    </div>
  );

  // If no surveyId is present in URL, render Creator Studio by default
  if (!surveyId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">
          <CreatorDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-4 md:p-8 relative">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between border-b border-border-subtle pb-4">
          <button
            onClick={exitSurvey}
            className="p-2 border border-border-subtle rounded-lg text-on_surface_variant hover:text-primary transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit Portal
          </button>
          <div className="text-right">
            <h1 className="text-lg font-bold tracking-tight text-primary font-display">{surveyTitle || "Dynamic AI Survey"}</h1>
            <p className="text-xs text-on_surface_variant mt-0.5">Glacier Respondent Terminal</p>
          </div>
        </header>

        {/* Main Chat Mode vs Success Submitted Page */}
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center gap-6 relative"
            >
              <ConfettiBlast />
              <div className="p-5 rounded-full bg-primary/10 text-primary border-3 border-primary/20 drop-shadow-[0_0_20px_var(--color-shadow-primary)]">
                <CheckCircle2 className="w-16 h-16 animate-bounce text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-on_surface font-display">Survey Completed Successfully!</h2>
                <p className="text-sm text-on_surface_variant mt-2 max-w-[340px] leading-relaxed">
                  Thank you! Your conversational answers have been dynamically analyzed and saved. The researcher has been notified.
                </p>
              </div>
              <button
                onClick={exitSurvey}
                className="mt-4 px-6 py-3 border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-semibold transition-all"
              >
                Return to Creator Studio
              </button>
            </motion.div>
          ) : (
            <motion.div key="chat-screen" className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-6 scrollbar-hide">
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-on_surface_variant">
                    <p className="text-sm">Start the conversation to begin the survey...</p>
                  </div>
                )}
                
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 ${
                        m.role === 'user'
                          ? 'bg-primary/20 text-primary border border-primary/30 rounded-2xl rounded-tr-sm'
                          : 'glass-panel rounded-2xl rounded-tl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                  <div className="flex justify-start">
                    <div className="glass-panel rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-xs text-on_surface_variant">AI is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Floating Finalize Bar */}
              {messages.length >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-tertiary/15 border border-tertiary/40 rounded-xl flex items-center justify-between gap-4 breathing-border shadow-lg"
                >
                  <div className="text-xs text-on_surface_variant">
                    Are you finished answering the questions?
                  </div>
                  <button
                    onClick={handleFinalizeSurvey}
                    disabled={isSubmittingSession}
                    className="px-4 py-2 bg-tertiary/20 text-tertiary hover:bg-tertiary/30 border border-tertiary/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmittingSession ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Submit & Finalize Survey
                  </button>
                </motion.div>
              )}

              {/* Input Area */}
              <div className="mt-auto">
                <form onSubmit={handleFormSubmit} className="relative flex items-center">
                  <input
                    className="w-full glass-input py-4 pl-6 pr-14 text-on_surface placeholder:text-on_surface_variant/50"
                    value={input}
                    placeholder="Type your answer here..."
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-3 p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
