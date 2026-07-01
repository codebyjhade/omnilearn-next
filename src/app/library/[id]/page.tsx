"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { ArrowLeft, BookOpen, BrainCircuit, Presentation, FileQuestion, Sparkles, MessageSquare, Loader2, Settings2, Clock, AlertTriangle, Flame, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/Skeleton";
import { useAuthGuard } from "../../../hooks/useAuthGuard";

export default function LessonView() {
  const supabase = createClient();
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthGuard();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRestored, setIsRestored] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'slides' | 'exam'>('summary');

  // QUIZ STATE
  const [quizState, setQuizState] = useState<'start' | 'playing' | 'results'>('start');
  const [quizLimit, setQuizLimit] = useState<number | 'all'>('all');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizAnswerChecked, setQuizAnswerChecked] = useState(false);

  // SLIDES STATE
  const [currentSlide, setCurrentSlide] = useState(0);

  // EXAM STATE
  const [examState, setExamState] = useState<'start' | 'playing' | 'results'>('start');
  const [examLimit, setExamLimit] = useState<number | 'all'>('all');
  const [examTimerSetting, setExamTimerSetting] = useState<number>(45 * 60); 
  const [timeLeft, setTimeLeft] = useState(45 * 60); 
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examScore, setExamScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CHAT SCROLL REF
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // GAMIFICATION TOAST STATE
  const [xpReward, setXpReward] = useState<{xp: number, streakBonus: boolean} | null>(null);

  // HIGHLIGHT TO ASK & 3D FLASHCARDS & LEITNER STATE
  const [selectedText, setSelectedText] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [leitnerIntervals, setLeitnerIntervals] = useState<Record<number, 'new' | 'hard' | 'easy'>>({});

  // Highlight Selection Listener
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const summaryTextElement = document.getElementById("summary-text");
        if (summaryTextElement && summaryTextElement.contains(selection.anchorNode)) {
          setSelectedText(selection.toString().trim());
          return;
        }
      }
      setSelectedText("");
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  const updateLeitnerRating = (cardIndex: number, rating: 'hard' | 'easy') => {
    const nextIntervals = { ...leitnerIntervals, [cardIndex]: rating };
    setLeitnerIntervals(nextIntervals);
    localStorage.setItem(`omni_leitner_${id}`, JSON.stringify(nextIntervals));
  };

  // CHAT STATE
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Auto-scroll to bottom when chat updates
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isChatLoading]);

  useEffect(() => {
    if (!user || !supabase) return;
    async function fetchLesson() {
      const { data: note } = await supabase!.from('study_notes').select('*').eq('id', id).single();
      if (note) setData(note);
      setLoading(false);
    }
    fetchLesson();
  }, [id, user]);

  useEffect(() => {
    const memory = localStorage.getItem(`omni_lesson_${id}`);
    if (memory) {
      const s = JSON.parse(memory);
      setActiveTab(s.activeTab || 'summary');
      setQuizState(s.quizState || 'start');
      setCurrentQ(s.currentQ || 0);
      setScore(s.score || 0);
      setExamState(s.examState || 'start');
      setTimeLeft(s.timeLeft || 45 * 60);
      setExamAnswers(s.examAnswers || {});
    }
    const leitnerMemory = localStorage.getItem(`omni_leitner_${id}`);
    if (leitnerMemory) {
      setLeitnerIntervals(JSON.parse(leitnerMemory));
    }
    setIsRestored(true);
  }, [id]);

  useEffect(() => {
    if (!isRestored) return;
    localStorage.setItem(`omni_lesson_${id}`, JSON.stringify({
      activeTab, quizState, currentQ, score, examState, timeLeft, examAnswers
    }));
  }, [activeTab, quizState, currentQ, score, examState, examAnswers, id, isRestored]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (examState === 'playing' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && examState === 'playing') {
      submitExam();
    }
    return () => clearInterval(interval);
  }, [examState, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getActiveQuizQuestions = () => {
    if (!data) return [];
    return quizLimit === 'all' ? data.quizzes : data.quizzes.slice(0, quizLimit);
  };

  const getActiveExamQuestions = () => {
    if (!data) return [];
    return examLimit === 'all' ? data.quizzes : data.quizzes.slice(0, examLimit);
  };

  const submitExam = async () => {
    if (!supabase || !user) return;
    setIsSubmitting(true);
    let calculatedScore = 0;
    const questions = getActiveExamQuestions();
    
    questions.forEach((q: any, i: number) => {
      if (examAnswers[i] === q.correctAnswerIndex) calculatedScore++;
    });
    
    setExamScore(calculatedScore);
    const percentage = Math.round((calculatedScore / questions.length) * 100);

    try {
      // 1. Save the quiz score to history
      await supabase.from('quiz_scores').insert({
        user_id: user.id, lesson_id: id, score: calculatedScore,
        total_questions: questions.length, percentage: percentage
      });

        // ==========================================
        // 2. THE GAMIFICATION ENGINE (XP & Streaks)
        // ==========================================
        const xpEarned = calculatedScore * 50; // 50 XP per correct answer
        
        // Fetch their current stats
        const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', user.id).single();

        if (stats) {
          // Use ISO strings to safely compare dates (YYYY-MM-DD)
          const today = new Date().toISOString().split('T')[0];
          let newStreak = stats.current_streak;
          let newHighest = stats.highest_streak;

          // Only run streak math if they haven't already studied today
          if (stats.last_study_date !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toISOString().split('T')[0];

            if (stats.last_study_date === yesterdayString) {
              // They studied yesterday! Keep the fire alive.
              newStreak += 1; 
            } else {
              // They broke the streak. Reset to 1.
              newStreak = 1; 
            }

            if (newStreak > newHighest) newHighest = newStreak;
          }

          // Push the new XP and Streak data back to the server
          await supabase.from('user_stats').update({
            xp: stats.xp + xpEarned,
            current_streak: newStreak,
            highest_streak: newHighest,
            last_study_date: today
          }).eq('user_id', user.id);

          // 🔥 Trigger the animated Toast here, where the variables exist! 🔥
          setXpReward({ 
            xp: xpEarned, 
            streakBonus: newStreak > stats.current_streak // True if they extended their streak today
          });
          
          setTimeout(() => {
            setXpReward(null);
          }, 4000);
        }
    } catch (err) { 
      console.error("Failed to update gamification stats:", err); 
    }

    setExamState('results');
    setIsSubmitting(false);
  };

  const handleAskQuestion = async (overrideText?: string) => {
    const textToSend = overrideText || chatInput;
    if (!textToSend.trim()) return;

    setChatHistory(prev => [...prev, { role: 'user', text: textToSend }]);
    if (!overrideText) setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, summary: data.summary })
      });
      const result = await res.json();
      if (result.reply) setChatHistory(prev => [...prev, { role: 'ai', text: result.reply }]);
    } catch (err) { console.error(err); } 
    finally { setIsChatLoading(false); }
  };

  const handleQuizAnswer = () => {
    const questions = getActiveQuizQuestions();
    
    if (!quizAnswerChecked) {
      // First click: "Check Answer"
      if (selectedAns === questions[currentQ].correctAnswerIndex) {
        setScore(s => s + 1);
      }
      setQuizAnswerChecked(true);
    } else {
      // Second click: "Next Question"
      setQuizAnswerChecked(false);
      setSelectedAns(null);
      
      if (currentQ < questions.length - 1) {
        setCurrentQ(q => q + 1);
      } else {
        setQuizState('results');
      }
    }
  };

  if (loading || !isRestored || authLoading) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative transition-colors duration-300 px-6 pt-10">
        {/* Ghost Header */}
        <Skeleton className="w-24 h-4 mb-6 rounded-md" />
        <Skeleton className="w-3/4 h-8 mb-4" />
        <div className="flex gap-2 mb-8">
          <Skeleton className="w-16 h-6 rounded-full" />
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
        
        {/* Ghost Tabs */}
        <div className="flex space-x-2 mb-6">
          <Skeleton className="w-24 h-10 rounded-full" />
          <Skeleton className="w-20 h-10 rounded-full" />
          <Skeleton className="w-20 h-10 rounded-full" />
        </div>

        {/* Ghost Content Box */}
        <Skeleton className="w-full h-[300px] rounded-3xl" />
      </div>
    );
  }
  if (!data) return <div className="p-6 text-slate-900 dark:text-slate-50">Lesson not found.</div>;

  const title = data.file_path.split('_').slice(1).join('_').replace('.pdf', '') || "Study Session";
  const topics = data.flashcards?.slice(0, 4).map((f: any) => f.front) || ["Study"];

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col flex-1">
      
      {/* HEADER SECTION */}
      {quizState !== 'playing' && examState !== 'playing' && (
        <>
          <div className="bg-slate-50 dark:bg-slate-950 pt-10 pb-4 sticky top-0 z-20 transition-colors duration-300 w-full">
            {/* Dynamic Breadcrumbs */}
            <nav className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-wider select-none">
              <button onClick={() => router.push('/library')} className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                Library
              </button>
              <ChevronRight size={10} className="mx-0.5" />
              <span className="truncate max-w-[120px] text-slate-500 dark:text-slate-400">{title}</span>
              <ChevronRight size={10} className="mx-0.5" />
              <span className="text-violet-600 dark:text-violet-400">
                {activeTab === 'summary' && "Summary Study"}
                {activeTab === 'quiz' && "Practice Quiz"}
                {activeTab === 'slides' && "Concept Cards"}
                {activeTab === 'exam' && "Exam Simulator"}
              </span>
            </nav>

            {/* Redesigned Eyebrow */}
            <span className="text-xs font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest block mb-2">
              {topics[0] || "STUDY MATERIAL"}
            </span>

            {/* Redesigned Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight select-text mb-2">
              {title}
            </h1>

            {/* Redesigned Metadata Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
              <span>Study Module</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span>{data.flashcards?.length || 0} Concept Cards</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span>{data.quizzes?.length || 0} Quiz Questions</span>
            </div>

            {/* Topic Chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {topics.map((topic: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setActiveTab('summary');
                    setChatInput(`Can you explain ${topic} in more detail?`);
                  }}
                  className="px-3 py-1.5 bg-violet-100/70 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-800/50 transition-colors rounded-full text-xs font-medium truncate max-w-[150px] cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-2 sticky top-[130px] bg-slate-50 dark:bg-slate-950 z-10 border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2" role="tablist" aria-label="Study room modes">
              <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} icon={<BookOpen size={14}/>} label="Summary" id="tab-summary" controls="panel-summary" />
              <TabButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={<BrainCircuit size={14}/>} label="Quiz" id="tab-quiz" controls="panel-quiz" />
              <TabButton active={activeTab === 'slides'} onClick={() => setActiveTab('slides')} icon={<Presentation size={14}/>} label="Slides" id="tab-slides" controls="panel-slides" />
              <TabButton active={activeTab === 'exam'} onClick={() => setActiveTab('exam')} icon={<FileQuestion size={14}/>} label="Past Exam" id="tab-exam" controls="panel-exam" />
            </div>
          </div>

          {/* Help Banner */}
          <div className="px-6 mt-4">
            <div className="bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100/50 dark:border-violet-900/30 rounded-2xl p-4 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 select-none transition-colors">
              <span className="flex items-center"><Sparkles size={14} className="text-violet-600 dark:text-violet-400 mr-2 shrink-0 animate-pulse" /> Stuck on a difficult concept? Our AI Socratic Tutor is ready on the Summary tab to clarify.</span>
              <button onClick={() => { setActiveTab('summary'); }} className="text-violet-600 dark:text-violet-400 font-extrabold hover:underline ml-3 shrink-0">Ask Tutor →</button>
            </div>
          </div>
        </>
      )}

      <div className="px-6 mt-6 animate-in fade-in duration-300">
        
        {/* ================= SUMMARY TAB ================= */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 items-start" role="tabpanel" id="panel-summary" aria-labelledby="tab-summary">
            
            {/* Left Column: Summary Text */}
            <div className="max-w-3xl mx-auto space-y-6 lg:sticky lg:top-[190px] w-full">
              <button 
                onClick={() => handleAskQuestion("Explain this entire summary to me like I am 5 years old using a fun, easy analogy.")}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all w-max"
              >
                <Sparkles size={14} className="text-violet-600 dark:text-violet-400" />
                <span>Explain Like I'm 5</span>
              </button>
              
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300 relative group">
                <div className="absolute top-4 right-4 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full text-[9px] font-bold text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Highlight text to ask tutor
                </div>
                <p className="text-sm leading-8 text-slate-700 dark:text-slate-300 whitespace-pre-line select-text" id="summary-text">
                  {data.summary}
                </p>
              </div>
            </div>
            
            {/* Right Column: Socratic Chat Engine */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300 flex flex-col h-[500px] lg:h-[600px] lg:sticky lg:top-[190px]">
              
              {/* Chat Header */}
              <div className="flex items-center space-x-2 px-5 py-4 border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Sparkles size={14} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 leading-none">OmniLearn AI</h3>
                  <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider mt-1">Online</span>
                </div>
              </div>

              {/* Chat History Area */}
              <div ref={chatScrollRef} className="p-5 flex-1 overflow-y-auto flex flex-col space-y-4 scroll-smooth">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-3 opacity-70">
                    <MessageSquare size={32} className="text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      I've read this document.<br/>Ask me anything about it!
                    </p>
                  </div>
                ) : (
                  <>
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                          p-4 max-w-[85%] text-sm shadow-sm
                          ${msg.role === 'user' 
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-3xl rounded-tr-sm border border-slate-200 dark:border-slate-700' 
                            : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-3xl rounded-tl-sm border border-violet-500/50'
                          }
                        `}>
                          <div className="leading-relaxed whitespace-pre-wrap">
                            {/* Animate only the latest AI message */}
                            {msg.role === 'ai' && idx === chatHistory.length - 1 ? (
                              <Typewriter text={msg.text} />
                            ) : (
                              msg.role === 'ai' ? formatMessageText(msg.text) : msg.text
                            )}

                            {/* Contextual Smart Suggestion Chips */}
                            {msg.role === 'ai' && idx === chatHistory.length - 1 && !isChatLoading && (
                              <div className="flex flex-wrap gap-2 mt-3 animate-in fade-in slide-in-from-top-1 duration-300">
                                {[
                                  "Explain key formula",
                                  "List real-world examples",
                                  "Create a memory hook"
                                ].map((suggestion, sIdx) => (
                                  <button
                                    key={sIdx}
                                    onClick={() => handleAskQuestion(suggestion)}
                                    className="px-2.5 py-1 bg-violet-700/50 hover:bg-violet-800 text-white rounded-xl text-[9px] font-bold transition-all active:scale-[0.97] border border-violet-500/20"
                                  >
                                    💡 {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isChatLoading && (
                      <div className="flex w-full justify-start animate-in fade-in zoom-in duration-300">
                        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white p-4 rounded-3xl rounded-tl-sm shadow-sm flex items-center space-x-3">
                           <Loader2 size={16} className="animate-spin" />
                           <span className="font-medium text-sm">Synthesizing...</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Input & Smart Chips Area */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800/50">
                {/* Highlight Selection Chip */}
                {selectedText && (
                  <div className="p-3 mb-3 bg-violet-50/70 dark:bg-violet-950/20 border border-violet-100/50 dark:border-violet-900/30 rounded-2xl flex items-center justify-between text-xs animate-in slide-in-from-bottom-2 duration-300">
                    <div className="truncate flex-1 pr-2">
                      <span className="font-bold text-violet-600 dark:text-violet-400">Selected text: </span>
                      <span className="text-slate-600 dark:text-slate-400 italic">"{selectedText}"</span>
                    </div>
                    <button 
                      onClick={() => {
                        handleAskQuestion(`Regarding this segment: "${selectedText}". Can you explain this concept in more detail?`);
                        setSelectedText("");
                        window.getSelection()?.removeAllRanges(); // Clear highlight
                      }}
                      className="px-3 py-1.5 bg-violet-600 dark:bg-violet-700 text-white rounded-xl font-bold hover:bg-violet-700 dark:hover:bg-violet-600 transition-colors shrink-0"
                    >
                      Ask Tutor
                    </button>
                  </div>
                )}
                
                {/* Smart Suggestion Chips */}
                <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-3 mb-1">
                  {[
                    { icon: <BookOpen size={12}/>, text: "Summarize key terms" },
                    { icon: <FileQuestion size={12}/>, text: "Quiz me on this" },
                    { icon: <Sparkles size={12}/>, text: "Explain like I'm 5" },
                  ].map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleAskQuestion(chip.text)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors whitespace-nowrap shrink-0"
                    >
                      {chip.icon} <span>{chip.text}</span>
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                    placeholder="Ask a question..." 
                    className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800 transition-colors border border-slate-100 dark:border-slate-700" 
                  />
                  <button 
                    onClick={() => handleAskQuestion()}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="bg-violet-600 dark:bg-violet-700 text-white px-6 rounded-2xl font-bold hover:bg-violet-700 dark:hover:bg-violet-600 transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= QUIZ TAB ================= */}
        {activeTab === 'quiz' && (
          <div className="flex flex-col" role="tabpanel" id="panel-quiz" aria-labelledby="tab-quiz">
            {quizState === 'start' && (
              <div className="flex flex-col items-center justify-center text-center pt-10 space-y-6">
                <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-3xl flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-sm">
                  <BrainCircuit size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Practice Quiz</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Test your knowledge casually.</p>
                </div>

                <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-left transition-colors duration-300">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center"><Settings2 size={14} className="mr-2"/> Configuration</h3>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Number of Questions</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 'all'].map(val => {
                       if (val !== 'all' && data.quizzes.length < val) return null;
                       return (
                         <button key={val} onClick={() => setQuizLimit(val as any)} className={`py-3 rounded-xl text-sm font-bold border transition-colors ${quizLimit === val ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-700' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                           {val === 'all' ? 'All' : val}
                         </button>
                       );
                    })}
                  </div>
                </div>

                <button onClick={() => { setCurrentQ(0); setScore(0); setSelectedAns(null); setQuizAnswerChecked(false); setQuizState('playing'); }} className="w-full max-w-sm mt-6 py-4 bg-violet-600 dark:bg-violet-700 text-white font-bold rounded-2xl shadow-md active:scale-[0.98] transition-transform hover:bg-violet-700 dark:hover:bg-violet-600">
                  Start Quiz
                </button>
              </div>
            )}

            {quizState === 'playing' && (
              <div className="flex flex-col animate-in slide-in-from-right-4 min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 -mx-6 px-6 pt-6 transition-colors duration-300">
                <div className="flex items-center justify-between mb-8">
                  <button onClick={() => setQuizState('start')} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors p-2 -m-2">
                    <ArrowLeft size={16} className="mr-1" /> <span className="text-sm font-medium">Exit Quiz</span>
                  </button>
                </div>
                <div className="mb-8">
                  <div className="flex justify-between text-xs font-bold text-violet-600 dark:text-violet-400 mb-2">
                    <span>Question {currentQ + 1} of {getActiveQuizQuestions().length}</span>
                  </div>
                  <div className="w-full h-2 bg-violet-100 dark:bg-violet-900/30 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 dark:bg-violet-400 rounded-full transition-all duration-300" style={{ width: `${((currentQ) / getActiveQuizQuestions().length) * 100}%` }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-8 leading-relaxed">
                  {getActiveQuizQuestions()[currentQ].question}
                </h3>
                <div className="space-y-4 mb-6">
                  {getActiveQuizQuestions()[currentQ].options.map((opt: string, idx: number) => {
                    const isSelected = selectedAns === idx;
                    const isCorrect = idx === getActiveQuizQuestions()[currentQ].correctAnswerIndex;
                    
                    let optionStyle = "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-violet-200 dark:hover:border-violet-800";
                    
                    if (quizAnswerChecked) {
                      if (isCorrect) {
                        optionStyle = "border-emerald-500 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500";
                      } else if (isSelected) {
                        optionStyle = "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-300 ring-1 ring-red-500";
                      } else {
                        optionStyle = "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60 text-slate-400 dark:text-slate-500";
                      }
                    } else if (isSelected) {
                      optionStyle = "border-violet-600 dark:border-violet-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ring-1 ring-violet-600 dark:ring-violet-500";
                    }

                    return (
                      <button 
                        key={idx} 
                        disabled={quizAnswerChecked}
                        onClick={() => setSelectedAns(idx)} 
                        className={`w-full text-left p-5 rounded-2xl border transition-all text-sm font-medium shadow-sm flex items-center justify-between ${optionStyle}`}
                      >
                        <div>
                          <span className="font-bold mr-3 text-slate-900 dark:text-slate-50">{String.fromCharCode(65 + idx)}.</span>{opt}
                        </div>
                        {quizAnswerChecked && isCorrect && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">Correct</span>
                        )}
                        {quizAnswerChecked && isSelected && !isCorrect && (
                          <span className="text-red-600 dark:text-red-400 font-bold text-xs bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-md">Incorrect</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                {quizAnswerChecked && (
                  <div className="p-5 rounded-2xl bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100/50 dark:border-violet-900/30 animate-in fade-in slide-in-from-bottom-2 duration-300 mb-6">
                    <h4 className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-2">Explanation</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {getActiveQuizQuestions()[currentQ].explanation || "Correct! Moving to the next concept is recommended."}
                    </p>
                  </div>
                )}

                <button disabled={selectedAns === null} onClick={handleQuizAnswer} className="mt-auto w-full py-4 bg-violet-600 dark:bg-violet-700 text-white font-bold rounded-2xl disabled:opacity-50 transition-colors hover:bg-violet-700 dark:hover:bg-violet-600">
                  {quizAnswerChecked ? (currentQ < getActiveQuizQuestions().length - 1 ? "Next Question" : "View Results") : "Check Answer"}
                </button>
              </div>
            )}

            {quizState === 'results' && (
              <div className="flex flex-col items-center justify-center text-center pt-16 space-y-6">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-4xl shadow-sm">🏆</div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Quiz Complete!</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">You scored {score} out of {getActiveQuizQuestions().length}</p>
                </div>
                <button onClick={() => setQuizState('start')} className="w-full max-w-[250px] py-4 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-bold rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 mt-4 transition-colors">
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= EXAM TAB (Serious Strict Mode) ================= */}
        {activeTab === 'exam' && (
          <div className="flex flex-col" role="tabpanel" id="panel-exam" aria-labelledby="tab-exam">
            {examState === 'start' && (
              <div className="flex flex-col items-center justify-center text-center pt-10 space-y-6">
                 <div className="w-16 h-16 bg-[#fff7ed] dark:bg-orange-950/30 rounded-3xl flex items-center justify-center text-[#ea580c] dark:text-orange-500 shadow-sm border border-orange-100 dark:border-orange-900/50">
                   <AlertTriangle size={32} />
                 </div>
                 <div>
                   <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight">Board Exam Simulator</h2>
                   <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Strict grading. Timed environment.</p>
                 </div>

                 <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-orange-100 dark:border-orange-900/50 shadow-sm text-left transition-colors duration-300">
                    <h3 className="text-xs font-bold text-[#ea580c] dark:text-orange-500 uppercase tracking-wider mb-5 flex items-center"><Settings2 size={14} className="mr-2"/> Exam Parameters</h3>
                    
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Question Pool</label>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {[10, 20, 'all'].map(val => {
                         if (val !== 'all' && data.quizzes.length < val) return null;
                         return (
                           <button key={val} onClick={() => setExamLimit(val as any)} className={`py-3 rounded-xl text-sm font-bold border transition-colors ${examLimit === val ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                             {val === 'all' ? 'All' : val}
                           </button>
                         );
                      })}
                    </div>

                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Time Limit</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 30, 45].map(val => (
                         <button key={val} onClick={() => setExamTimerSetting(val * 60)} className={`py-3 rounded-xl text-sm font-bold border flex items-center justify-center transition-colors ${examTimerSetting === val * 60 ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                           <Clock size={12} className="mr-1"/> {val}m
                         </button>
                      ))}
                    </div>
                 </div>

                 <button onClick={() => { setTimeLeft(examTimerSetting); setExamAnswers({}); setExamState('playing'); }} className="w-full max-w-sm mt-6 py-4 bg-[#ea580c] text-white font-black uppercase tracking-wider rounded-2xl shadow-md active:scale-[0.98] transition-transform hover:bg-[#c2410c]">
                   Begin Exam
                 </button>
              </div>
            )}

            {examState === 'playing' && (
              <div className="flex flex-col animate-in slide-in-from-bottom-4 min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 -mx-6 px-6 pt-6 transition-colors duration-300">
                
                <div className="flex items-center justify-between mb-8 sticky top-4 z-50 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                  <button onClick={() => setExamState('start')} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors p-2 -m-2">
                    <ArrowLeft size={16} className="mr-1" /> <span className="text-sm font-bold">Abort</span>
                  </button>
                  <span className={`text-sm font-black px-4 py-2 rounded-full border ${timeLeft < 300 ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-500 border-red-200 dark:border-red-900/50 animate-pulse' : 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/50'}`}>
                    ⏱ {formatTime(timeLeft)}
                  </span>
                </div>
                
                <div className="space-y-8">
                  {getActiveExamQuestions().map((q: any, i: number) => (
                     <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                       <p className="font-bold text-slate-900 dark:text-slate-50 mb-5 leading-relaxed">
                         <span className="text-orange-500 dark:text-orange-400 mr-2">{i + 1}.</span> {q.question}
                       </p>
                       <div className="space-y-3">
                         {q.options.map((opt: string, j: number) => (
                           <label key={j} className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer transition-colors ${examAnswers[i] === j ? 'border-orange-500 dark:border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-orange-200 dark:hover:border-orange-800/50'}`}>
                             <input 
                               type="radio" name={`question-${i}`} checked={examAnswers[i] === j}
                               onChange={() => setExamAnswers(prev => ({ ...prev, [i]: j }))}
                               className="w-4 h-4 text-orange-500 dark:text-orange-400 focus:ring-orange-500 border-slate-300 dark:border-slate-600" 
                             />
                             <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{opt}</span>
                           </label>
                         ))}
                       </div>
                     </div>
                  ))}
                </div>

                <button 
                  onClick={submitExam} 
                  disabled={isSubmitting || Object.keys(examAnswers).length < getActiveExamQuestions().length}
                  className="w-full mt-10 py-5 bg-[#ea580c] text-white font-black uppercase tracking-wider rounded-2xl shadow-md active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center hover:bg-[#c2410c]"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Submit Final Answers"}
                </button>
                {Object.keys(examAnswers).length < getActiveExamQuestions().length && (
                  <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-3 font-bold uppercase tracking-wider">Answer all questions to submit</p>
                )}
              </div>
            )}

            {examState === 'results' && (
              <div className="flex flex-col items-center justify-center text-center pt-16 space-y-6">
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-4xl shadow-sm">🎯</div>
                <div>
                  <h2 className="text-2xl font-black uppercase text-slate-900 dark:text-slate-50">Exam Graded</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    Score: <strong className="text-orange-600 dark:text-orange-500">{examScore}</strong> / {getActiveExamQuestions().length}
                  </p>
                  <p className="text-4xl font-black text-slate-900 dark:text-slate-50 mt-4">
                    {Math.round((examScore / getActiveExamQuestions().length) * 100)}%
                  </p>
                </div>
                
                <div className="w-full max-w-[250px] space-y-3 mt-6">
                  <button onClick={() => router.push('/progress')} className="w-full py-4 bg-[#ea580c] text-white font-bold rounded-2xl shadow-md hover:bg-[#c2410c] transition-colors">
                    View Progress
                  </button>
                  <button onClick={() => { setExamState('start'); }} className="w-full py-4 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-bold rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                    Exit Exam Mode
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SLIDES TAB ================= */}
        {activeTab === 'slides' && data.flashcards && (
          <div className="pt-4 flex flex-col" role="tabpanel" id="panel-slides" aria-labelledby="tab-slides">
            
            {/* The 3D Flashcard Deck Container */}
            <div 
              className="relative group [perspective:1000px] rounded-[32px] min-h-[380px] w-full select-none cursor-pointer mb-6 animate-in zoom-in-95 duration-200"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Inner card with 3D rotate transition */}
              <div 
                className="relative w-full h-full min-h-[380px] rounded-[32px] transition-transform duration-500 ease-in-out [transform-style:preserve-3d] shadow-lg"
                style={{ 
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                }}
              >
                
                {/* 🔴 CARD FRONT: Term (Rotates 0deg) */}
                <div 
                  className="absolute inset-0 w-full h-full [backface-visibility:hidden] p-8 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-[32px] flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-extrabold tracking-widest text-violet-200 uppercase">Flashcard {currentSlide + 1} of {data.flashcards.length}</span>
                    {leitnerIntervals[currentSlide] && (
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        leitnerIntervals[currentSlide] === 'easy' ? 'bg-emerald-500/30 text-emerald-200' : 'bg-red-500/30 text-red-200'
                      }`}>
                        {leitnerIntervals[currentSlide]}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug tracking-tight">{data.flashcards[currentSlide].front}</h2>
                  </div>

                  <div className="text-center text-[10px] font-bold text-violet-200/80 uppercase tracking-widest animate-pulse">
                    Tap card to reveal definition
                  </div>
                </div>

                {/* 🟢 CARD BACK: Definition (Rotates 180deg) */}
                <div 
                  className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-[32px] flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Definition</span>
                    {leitnerIntervals[currentSlide] && (
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        leitnerIntervals[currentSlide] === 'easy' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                      }`}>
                        {leitnerIntervals[currentSlide]}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center items-center text-center px-4 overflow-y-auto">
                    <p className="text-base font-semibold leading-relaxed text-slate-700 dark:text-slate-200">
                      {data.flashcards[currentSlide].back}
                    </p>
                  </div>

                  {/* Leitner Feedback Buttons */}
                  <div className="mt-4 flex flex-col space-y-2.5" onClick={(e) => e.stopPropagation()}>
                    <p className="text-[10px] font-bold text-center text-slate-400 uppercase tracking-wide">How well do you know this term?</p>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => updateLeitnerRating(currentSlide, 'hard')}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                          leitnerIntervals[currentSlide] === 'hard' 
                            ? 'bg-red-50 dark:bg-red-950/30 border-red-400 text-red-600 dark:text-red-400' 
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-red-200'
                        }`}
                      >
                        🔴 Hard
                      </button>
                      <button 
                        onClick={() => updateLeitnerRating(currentSlide, 'easy')}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                          leitnerIntervals[currentSlide] === 'easy' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-200'
                        }`}
                      >
                        🟢 Easy
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex space-x-4">
              <button onClick={() => { setCurrentSlide(s => Math.max(0, s - 1)); setIsFlipped(false); }} disabled={currentSlide === 0} className="flex-1 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-50 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700">Previous</button>
              <button onClick={() => { setCurrentSlide(s => Math.min(data.flashcards.length - 1, s + 1)); setIsFlipped(false); }} disabled={currentSlide === data.flashcards.length - 1} className="flex-1 py-4 bg-violet-600 dark:bg-violet-700 rounded-2xl text-white font-semibold disabled:opacity-50 transition-colors hover:bg-violet-700 dark:hover:bg-violet-600">Next</button>
            </div>
          </div>
        )}

        {/* ================= GAMIFICATION TOAST ================= */}
      <AnimatePresence>
        {xpReward && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-0 right-0 mx-auto w-max z-50 flex flex-col items-center pointer-events-none"
          >
            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-3xl shadow-2xl flex items-center space-x-4 border border-slate-700 dark:border-slate-200">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Exam Complete</span>
                <div className="flex items-center space-x-3">
                  <span className="text-xl font-black text-violet-400 dark:text-violet-600">+{xpReward.xp} XP</span>
                  {xpReward.streakBonus && (
                    <>
                      <span className="w-1.5 h-1.5 bg-slate-700 dark:bg-slate-200 rounded-full" />
                      <span className="text-sm font-bold text-orange-400 dark:text-orange-500 flex items-center">
                        <Flame size={16} className="mr-1 fill-orange-400 dark:fill-orange-500" /> Streak Kept!
                      </span>
                    </>
                  )}
                  
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, id, controls }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, id: string, controls: string }) {
  return (
    <button 
      onClick={onClick} 
      id={id}
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${active ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}

function Typewriter({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      i += 3; // Chunk characters to optimize renders
      if (i >= text.length) {
        setDisplayedText(text);
        clearInterval(interval);
      } else {
        setDisplayedText(text.slice(0, i));
      }
    }, 25);

    return () => clearInterval(interval);
  }, [text]);

  return <>{formatMessageText(displayedText)}</>;
}

function formatMessageText(text: string) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 leading-relaxed text-sm select-text">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const isNumbered = /^\d+\.\s/.test(trimmed);
        
        let cleanLine = line;
        if (isBullet) {
          cleanLine = trimmed.substring(2);
        } else if (isNumbered) {
          cleanLine = trimmed.replace(/^\d+\.\s/, '');
        }

        const boldParts = cleanLine.split(/\*\*(.*?)\*\*/g);
        const lineElement = (
          <span key={lIdx}>
            {boldParts.map((part, pIdx) => {
              if (pIdx % 2 === 1) {
                return <strong key={pIdx} className="font-extrabold text-white underline decoration-violet-300/40">{part}</strong>;
              }
              return part;
            })}
          </span>
        );

        if (isBullet) {
          return (
            <div key={lIdx} className="flex items-start pl-3 my-0.5">
              <span className="mr-2 text-violet-300 font-bold shrink-0">•</span>
              <span>{lineElement}</span>
            </div>
          );
        }
        if (isNumbered) {
          const num = trimmed.match(/^(\d+)\.\s/)?.[1] || "1";
          return (
            <div key={lIdx} className="flex items-start pl-3 my-0.5">
              <span className="mr-2 text-violet-200 font-black shrink-0">{num}.</span>
              <span>{lineElement}</span>
            </div>
          );
        }

        return <p key={lIdx} className="min-h-[1rem]">{lineElement}</p>;
      })}
    </div>
  );
}
