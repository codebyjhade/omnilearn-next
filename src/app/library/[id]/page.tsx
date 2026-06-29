"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft, BookOpen, BrainCircuit, Presentation, FileQuestion, Sparkles, MessageSquare, Loader2, Settings2, Clock, AlertTriangle, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/Skeleton";

export default function LessonView() {
  const { id } = useParams();
  const router = useRouter();
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
    async function fetchLesson() {
      if (!supabase) { setLoading(false); return; }
      const { data: note } = await supabase.from('study_notes').select('*').eq('id', id).single();
      if (note) setData(note);
      setLoading(false);
    }
    fetchLesson();
  }, [id]);

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
    setIsRestored(true);
  }, [id]);

  useEffect(() => {
    if (!isRestored) return;
    localStorage.setItem(`omni_lesson_${id}`, JSON.stringify({
      activeTab, quizState, currentQ, score, examState, timeLeft, examAnswers
    }));
  }, [activeTab, quizState, currentQ, score, examState, timeLeft, examAnswers, id, isRestored]);

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
    setIsSubmitting(true);
    let calculatedScore = 0;
    const questions = getActiveExamQuestions();
    
    questions.forEach((q: any, i: number) => {
      if (examAnswers[i] === q.correctAnswerIndex) calculatedScore++;
    });
    
    setExamScore(calculatedScore);
    const percentage = Math.round((calculatedScore / questions.length) * 100);

    try {
      if (!supabase) { setExamState('results'); setIsSubmitting(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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
    if (selectedAns === questions[currentQ].correctAnswerIndex) setScore(s => s + 1);
    
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setSelectedAns(null);
    } else {
      setQuizState('results');
    }
  };

  if (loading || !isRestored) {
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
      
      {/* HEADER SECTION */}
      {quizState !== 'playing' && examState !== 'playing' && (
        <>
          <div className="bg-slate-50 dark:bg-slate-950 px-6 pt-10 pb-4 sticky top-0 z-20 transition-colors duration-300">
            <button onClick={() => router.push('/library')} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 mb-4 transition-colors">
              <ArrowLeft size={16} className="mr-1" /> <span className="text-sm font-medium">Back to Library</span>
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 truncate tracking-tight">{title}</h1>
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
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
              <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} icon={<BookOpen size={14}/>} label="Summary" />
              <TabButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={<BrainCircuit size={14}/>} label="Quiz" />
              <TabButton active={activeTab === 'slides'} onClick={() => setActiveTab('slides')} icon={<Presentation size={14}/>} label="Slides" />
              <TabButton active={activeTab === 'exam'} onClick={() => setActiveTab('exam')} icon={<FileQuestion size={14}/>} label="Past Exam" />
            </div>
          </div>
        </>
      )}

      <div className="px-6 mt-6 animate-in fade-in duration-300">
        
        {/* ================= SUMMARY TAB ================= */}
        {activeTab === 'summary' && (
          <div className="space-y-6 pb-6">
            <button 
              onClick={() => handleAskQuestion("Explain this entire summary to me like I am 5 years old using a fun, easy analogy.")}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
            >
              <Sparkles size={14} className="text-violet-600 dark:text-violet-400" />
              <span>Explain Like I'm 5</span>
            </button>
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
              <p className="text-sm leading-8 text-slate-700 dark:text-slate-300 whitespace-pre-line">{data.summary}</p>
            </div>
            
            {/* Socratic Chat Engine */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mt-6 transition-colors duration-300 flex flex-col h-[500px]">
              
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
                          <p className="leading-relaxed whitespace-pre-wrap">
                            {/* Animate only the latest AI message */}
                            {msg.role === 'ai' && idx === chatHistory.length - 1 ? (
                              <Typewriter text={msg.text} />
                            ) : (
                              msg.text
                            )}
                          </p>
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
          <div className="flex flex-col">
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
                         <button key={val} onClick={() => setQuizLimit(val as any)} className={`py-2 rounded-xl text-sm font-bold border transition-colors ${quizLimit === val ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-700' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                           {val === 'all' ? 'All' : val}
                         </button>
                       );
                    })}
                  </div>
                </div>

                <button onClick={() => { setCurrentQ(0); setScore(0); setSelectedAns(null); setQuizState('playing'); }} className="w-full max-w-sm mt-6 py-4 bg-violet-600 dark:bg-violet-700 text-white font-bold rounded-2xl shadow-md active:scale-[0.98] transition-transform hover:bg-violet-700 dark:hover:bg-violet-600">
                  Start Quiz
                </button>
              </div>
            )}

            {quizState === 'playing' && (
              <div className="flex flex-col animate-in slide-in-from-right-4 min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 -mx-6 px-6 pt-6 transition-colors duration-300">
                <div className="flex items-center justify-between mb-8">
                  <button onClick={() => setQuizState('start')} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
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
                <div className="space-y-4 mb-8">
                  {getActiveQuizQuestions()[currentQ].options.map((opt: string, idx: number) => (
                    <button key={idx} onClick={() => setSelectedAns(idx)} className={`w-full text-left p-5 rounded-2xl border transition-all text-sm font-medium shadow-sm ${selectedAns === idx ? 'border-violet-600 dark:border-violet-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ring-1 ring-violet-600 dark:ring-violet-500' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-violet-200 dark:hover:border-violet-800'}`}>
                      <span className="font-bold mr-3 text-slate-900 dark:text-slate-50">{String.fromCharCode(65 + idx)}.</span>{opt}
                    </button>
                  ))}
                </div>
                <button disabled={selectedAns === null} onClick={handleQuizAnswer} className="mt-auto w-full py-4 bg-violet-600 dark:bg-violet-700 text-white font-bold rounded-2xl disabled:opacity-50 transition-colors hover:bg-violet-700 dark:hover:bg-violet-600">
                  Next Question
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
          <div className="flex flex-col">
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
                           <button key={val} onClick={() => setExamLimit(val as any)} className={`py-2 rounded-xl text-sm font-bold border transition-colors ${examLimit === val ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                             {val === 'all' ? 'All' : val}
                           </button>
                         );
                      })}
                    </div>

                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Time Limit</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 30, 45].map(val => (
                         <button key={val} onClick={() => setExamTimerSetting(val * 60)} className={`py-2 rounded-xl text-sm font-bold border flex items-center justify-center transition-colors ${examTimerSetting === val * 60 ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
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
                  <button onClick={() => setExamState('start')} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
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
          <div className="pt-4 flex flex-col">
            <div className="flex justify-between items-center mb-4 px-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Slide {currentSlide + 1} of {data.flashcards.length}</span>
            </div>
            
            {/* The Animated Deck Container */}
            <div className="relative overflow-hidden rounded-[32px] shadow-lg bg-violet-600 dark:bg-violet-700 min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 50, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -50, filter: "blur(4px)" }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute inset-0 p-8 text-white flex flex-col"
                >
                  <span className="text-[10px] font-bold tracking-widest text-violet-300 dark:text-violet-200 uppercase mb-4">Slide {currentSlide + 1}</span>
                  <h2 className="text-2xl font-bold mb-8 leading-tight">{data.flashcards[currentSlide].front}</h2>
                  <ul className="space-y-4 flex-1">
                    <li className="flex items-start text-sm text-violet-50 leading-relaxed">
                      <span className="mr-3 mt-1.5 w-1.5 h-1.5 bg-violet-300 dark:bg-violet-400 rounded-full shrink-0" />
                      {data.flashcards[currentSlide].back}
                    </li>
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex space-x-4 mt-6">
              <button onClick={() => setCurrentSlide(s => Math.max(0, s - 1))} disabled={currentSlide === 0} className="flex-1 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-50 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700">Previous</button>
              <button onClick={() => setCurrentSlide(s => Math.min(data.flashcards.length - 1, s + 1))} disabled={currentSlide === data.flashcards.length - 1} className="flex-1 py-4 bg-violet-600 dark:bg-violet-700 rounded-2xl text-white font-semibold disabled:opacity-50 transition-colors hover:bg-violet-700 dark:hover:bg-violet-600">Next</button>
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
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${active ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
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
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 15); // Adjust this number to make it type faster or slower

    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
}
