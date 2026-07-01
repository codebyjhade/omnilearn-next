"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen, BrainCircuit, Target, Upload, BarChart2, BookOpenText, Flame, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [docCount, setDocCount] = useState(0);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [quizzesTaken, setQuizzesTaken] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  
  // Gamification State
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  // Modal State
  const [activeModal, setActiveModal] = useState<'docs' | 'quizzes' | 'scores' | null>(null);
  const [statsHistory, setStatsHistory] = useState<{
    docs: any[];
    quizzes: any[];
  }>({ docs: [], quizzes: [] });
  
  const router = useRouter();
  const { user } = useAuthGuard();

  useEffect(() => {
    if (!user || !supabase) return;
    const currentUser = user;
    async function loadData() {
      setUsername(currentUser.email?.split('@')[0] || "Student");

      // Fetch standard stats
      const { count } = await supabase!.from('study_notes').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.id);
      setDocCount(count || 0);

      const { data: scores } = await supabase!.from('quiz_scores').select('percentage').eq('user_id', currentUser.id);
      if (scores && scores.length > 0) {
        setQuizzesTaken(scores.length);
        const totalPercentage = scores.reduce((sum, current) => sum + current.percentage, 0);
        setAvgScore(Math.round(totalPercentage / scores.length));
      } else {
        setQuizzesTaken(0);
        setAvgScore(0);
      }

      const { data: recent } = await supabase!.from('study_notes').select('id, file_path, flashcards').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(3);
      if (recent) setRecentNotes(recent);

      // Fetch details for modals
      const { data: allNotes } = await supabase!.from('study_notes').select('id, file_path, created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false });
      const { data: allScores } = await supabase!.from('quiz_scores').select('id, lesson_id, score, total_questions, percentage, created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false });
      setStatsHistory({
        docs: allNotes || [],
        quizzes: allScores || []
      });

      // Fetch Gamification Stats!
      const { data: stats } = await supabase!.from('user_stats').select('*').eq('user_id', currentUser.id).single();
      if (stats) {
        setXp(stats.xp);
        setStreak(stats.current_streak);
      }
    }
    loadData();
  }, [user]);

  const getCleanTitle = (path: string) => {
    const parts = path.split('_');
    return parts.slice(1).join('_').replace('.pdf', '') || "Study Material";
  };

  const getTopics = (flashcards: any) => {
    if (!flashcards || flashcards.length === 0) return "General Study Notes";
    return flashcards.slice(0, 3).map((f: any) => f.front).join(' · ');
  };

  // Math for the Level System (500 XP per level)
  const currentLevel = Math.floor(xp / 500) + 1;
  const currentLevelXp = xp % 500;
  const xpProgress = (currentLevelXp / 500) * 100;
  const svgDashoffset = 175 - (175 * xpProgress) / 100;

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 md:pt-20 pb-24 md:pb-8">
    <div className="flex flex-col w-full">
      
      {/* Gamified Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 md:mb-8 gap-4 md:gap-0">
        <div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Welcome back,</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
            {username} 👋
          </h1>
        </div>
        
        {/* Level & Streak Badges */}
        <div className="flex items-center space-x-4">
          
          {/* Daily Streak Badge */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center space-x-3 shadow-sm transition-colors duration-300">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${streak > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
              <Flame size={20} className={streak > 0 ? "fill-orange-500" : ""} />
            </div>
            <div className="flex flex-col pr-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Day Streak</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-50 leading-none mt-0.5">{streak}</span>
            </div>
          </div>

          {/* XP & Level Badge with SVG Ring */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center space-x-4 shadow-sm transition-colors duration-300">
            <div className="relative flex items-center justify-center w-12 h-12">
              <svg className="absolute w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-slate-800 transition-colors" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="125" strokeDashoffset={125 - (125 * xpProgress) / 100} className="text-violet-600 dark:text-violet-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
              </svg>
              <span className="text-sm font-black text-violet-600 dark:text-violet-400">{currentLevel}</span>
            </div>
            <div className="flex flex-col pr-2 w-32">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Level {currentLevel} Rank</span>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-1 overflow-hidden">
                <div className="bg-violet-600 dark:bg-violet-400 h-full rounded-full transition-all duration-1000" style={{ width: `${xpProgress}%` }} />
              </div>
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-1 truncate">{currentLevelXp} / 500 XP to Lvl {currentLevel + 1}</span>
            </div>
          </div>
          
        </div>
      </div>

      {/* Classic Stats Row */}
      <div className="grid grid-cols-3 gap-2 md:gap-6 mb-5 md:mb-8">
        <div 
          onClick={() => setActiveModal('docs')} 
          className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm hover:border-violet-300 dark:hover:border-violet-700 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] select-none"
        >
          <BookOpen className="text-violet-500 dark:text-violet-400 mb-2 md:w-8 md:h-8" size={20} />
          <span className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50">{docCount}</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Documents</span>
        </div>
        <div 
          onClick={() => setActiveModal('quizzes')} 
          className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] select-none"
        >
          <BrainCircuit className="text-emerald-500 dark:text-emerald-400 mb-2 md:w-8 md:h-8" size={20} />
          <span className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50">{quizzesTaken}</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Quizzes</span>
        </div>
        <div 
          onClick={() => setActiveModal('scores')} 
          className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm hover:border-orange-300 dark:hover:border-orange-700 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] select-none"
        >
          <Target className="text-orange-500 dark:text-orange-400 mb-2 md:w-8 md:h-8" size={20} />
          <span className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50">{avgScore}%</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Avg Score</span>
        </div>
      </div>

      {/* Upload Call to Action */}
      <div className="bg-violet-600 dark:bg-violet-700 rounded-3xl p-5 md:p-8 text-white shadow-lg relative overflow-hidden mb-6 md:mb-8 border border-violet-500 dark:border-violet-600">
        <div className="absolute -right-10 -top-10 opacity-20 pointer-events-none" aria-hidden="true">
          <Sparkles size={200} />
        </div>
        <div className="relative z-10">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 md:mb-5 backdrop-blur-sm">
            <Upload size={20} className="text-white md:hidden" aria-hidden="true" />
            <Upload size={24} className="text-white hidden md:block" aria-hidden="true" />
          </div>
          <h2 className="text-xl md:text-3xl font-extrabold mb-2 md:mb-3">Upload a PDF</h2>
          <p className="text-sm text-violet-100 mb-4 md:mb-6 max-w-md leading-relaxed">
            Drop your study material and get instant quizzes, summaries, and slide decks.
          </p>
          <Link href="/upload" className="inline-flex items-center px-5 py-2.5 md:px-6 md:py-3.5 bg-white text-violet-700 font-extrabold rounded-xl hover:bg-violet-50 transition-transform hover:scale-[1.02] active:scale-[0.97] shadow-sm text-sm md:text-base">
            Get Started <ArrowRight size={16} className="ml-2" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4 px-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/library" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-900 dark:text-slate-200 group-hover:bg-violet-50 dark:group-hover:bg-violet-900/30 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              <BookOpenText size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-slate-50 text-sm">Library</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Your materials</span>
            </div>
          </Link>
          <Link href="/progress" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
              <BarChart2 size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-slate-50 text-sm">Progress</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Your stats</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Materials */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Recent</h3>
          <Link href="/library" className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-800 transition-colors">View All</Link>
        </div>
        
        {recentNotes.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl transition-colors">
            No recent materials. Upload a PDF to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {recentNotes.map((note) => (
              <Link href={`/library/${note.id}`} key={note.id}>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:border-violet-200 dark:hover:border-violet-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-violet-50 dark:bg-violet-900/20 rounded-xl shrink-0 flex items-center justify-center text-violet-500 dark:text-violet-400">
                      <BookOpenText size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-900 dark:text-slate-50 text-sm truncate" title={getCleanTitle(note.file_path)}>{getCleanTitle(note.file_path)}</span>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {getTopics(note.flashcards)}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider rounded-md shrink-0 transition-colors">
                    Ready
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialogs */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-all duration-300" onClick={() => setActiveModal(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-colors duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight">
                  {activeModal === 'docs' && "Study Documents"}
                  {activeModal === 'quizzes' && "Quiz History"}
                  {activeModal === 'scores' && "Average Performance"}
                </h3>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {activeModal === 'docs' && (
                  statsHistory.docs.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-10 font-medium">No documents uploaded yet.</p>
                  ) : (
                    statsHistory.docs.map((doc) => (
                      <div key={doc.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl">
                        <div className="flex flex-col truncate pr-4">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{getCleanTitle(doc.file_path)}</span>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1">{new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                        <Link href={`/library/${doc.id}`} className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shrink-0">
                          Open
                        </Link>
                      </div>
                    ))
                  )
                )}

                {activeModal === 'quizzes' && (
                  statsHistory.quizzes.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-10 font-medium">No quizzes completed yet.</p>
                  ) : (
                    statsHistory.quizzes.map((quiz) => (
                      <div key={quiz.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl">
                        <div className="flex flex-col truncate pr-4">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                            {getCleanTitle(statsHistory.docs.find(d => d.id === quiz.lesson_id)?.file_path || "Practice Quiz")}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1">{new Date(quiz.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${
                          quiz.percentage >= 80 ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30' :
                          quiz.percentage >= 60 ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/30' :
                          'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30'
                        }`}>
                          {quiz.score}/{quiz.total_questions} ({quiz.percentage}%)
                        </span>
                      </div>
                    ))
                  )
                )}

                {activeModal === 'scores' && (
                  <div className="space-y-6">
                    <div className="p-5 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-3xl text-center">
                      <span className="text-3xl font-black">{avgScore}%</span>
                      <p className="text-[10px] font-bold text-violet-200 uppercase tracking-wider mt-1.5">Average Performance score</p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Historical Scores</h4>
                      {statsHistory.quizzes.slice(0, 5).map((quiz) => (
                        <div key={quiz.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                          <span className="font-bold">{quiz.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
    </main>
  );
}
