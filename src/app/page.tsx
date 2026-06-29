"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  Sparkles, ArrowRight, BookOpen, BrainCircuit, Target, 
  Upload, BarChart2, BookOpenText, Flame, Home, User, 
  FileText, X, Settings, CreditCard, Bell, LogIn, UploadCloud
} from "lucide-react";

export default function InteractiveLandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [guestFile, setGuestFile] = useState<File | null>(null);

  // Bouncer: If they are ALREADY a real logged-in user, send them to the real dashboard route.
  // (Assuming your protected dashboard is at /home or /dashboard)
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/home"); 
      }
    }
    checkSession();
  }, [router]);

  // ==========================================
  // MOCK DATA FOR THE "GUEST EXPLORER" ILLUSION
  // ==========================================
  const username = "Guest Explorer";
  const docCount = 14;
  const quizzesTaken = 28;
  const avgScore = 92;
  const xp = 1750; 
  const streak = 12; 

  const recentNotes = [
    { id: 'mock-1', file_path: 'user_Advanced_Algorithms.pdf', flashcards: [{front: 'Big O Notation'}, {front: 'Dynamic Programming'}, {front: 'Graph Theory'}] },
    { id: 'mock-2', file_path: 'user_Anatomy_Ch4.pdf', flashcards: [{front: 'Skeletal System'}, {front: 'Muscular Tissues'}, {front: 'Nervous System'}] },
    { id: 'mock-3', file_path: 'user_Macroeconomics_Midterm.pdf', flashcards: [{front: 'Supply and Demand'}, {front: 'Inflation'}, {front: 'Fiscal Policy'}] }
  ];

  const currentLevel = Math.floor(xp / 500) + 1;
  const currentLevelXp = xp % 500;
  const xpProgress = (currentLevelXp / 500) * 100;

  // Helper functions
  const getCleanTitle = (path: string) => path.split('_').slice(1).join('_').replace('.pdf', '');
  const getTopics = (flashcards: any) => flashcards.map((f: any) => f.front).join(' · ');

  // ==========================================
  // THE TRAPDOOR: Hijacks clicks and demands Auth
  // ==========================================
  const requireAuth = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    router.push('/login'); 
  };

  // ==========================================
  // TAB COMPONENTS (The App Simulations)
  // ==========================================

  const renderHomeTab = () => (
    <div className="flex flex-col w-full animate-in fade-in duration-500">
      {/* Gamified Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-6 md:space-y-0">
        <div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Welcome to OmniLearn,</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
            {username} 👋
          </h1>
        </div>
        
        {/* Level & Streak Badges */}
        <div className="flex items-center space-x-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center space-x-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 text-orange-500">
              <Flame size={20} className="fill-orange-500" />
            </div>
            <div className="flex flex-col pr-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Day Streak</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-50 leading-none mt-0.5">{streak}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center space-x-4 shadow-sm">
            <div className="relative flex items-center justify-center w-12 h-12">
              <svg className="absolute w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="125" strokeDashoffset={125 - (125 * xpProgress) / 100} className="text-violet-600 dark:text-violet-500" strokeLinecap="round" />
              </svg>
              <span className="text-sm font-black text-violet-600 dark:text-violet-400">{currentLevel}</span>
            </div>
            <div className="flex flex-col pr-2 w-20">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Level {currentLevel}</span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-50 mt-0.5 truncate">{currentLevelXp} / 500 XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Classic Stats Row */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm">
          <BookOpen className="text-violet-500 dark:text-violet-400 mb-2 md:w-8 md:h-8" size={20} />
          <span className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50">{docCount}</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Documents</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm">
          <BrainCircuit className="text-emerald-500 dark:text-emerald-400 mb-2 md:w-8 md:h-8" size={20} />
          <span className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50">{quizzesTaken}</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Quizzes</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm">
          <Target className="text-orange-500 dark:text-orange-400 mb-2 md:w-8 md:h-8" size={20} />
          <span className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50">{avgScore}%</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Avg Score</span>
        </div>
      </div>

      {/* Upload Call to Action - Routes to the Mock Upload Tab */}
      <div onClick={() => setActiveTab('upload')} className="cursor-pointer bg-violet-600 dark:bg-violet-700 rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden mb-10 border border-violet-500 dark:border-violet-600 group">
        <div className="absolute -right-10 -top-10 opacity-20 group-hover:scale-110 transition-transform duration-700">
          <Sparkles size={200} />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
            <Upload size={24} className="text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Upload a PDF</h2>
          <p className="text-sm md:text-base text-violet-100 mb-8 max-w-md leading-relaxed">
            Drop your study material and get instant quizzes, summaries, and slide decks.
          </p>
          <div className="inline-flex items-center px-6 py-3.5 bg-white text-violet-700 font-extrabold rounded-xl shadow-sm">
            Get Started <ArrowRight size={18} className="ml-2" />
          </div>
        </div>
      </div>

      {/* Recent Materials - Clicking any triggers Auth Trapdoor */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Recent Activity</h3>
          <button onClick={() => setActiveTab('library')} className="text-xs font-bold text-violet-600 dark:text-violet-400">View All</button>
        </div>
        
        <div className="space-y-3">
          {recentNotes.map((note) => (
            <div onClick={requireAuth} key={note.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:border-violet-200 dark:hover:border-violet-800 transition-colors cursor-pointer group">
              <div className="flex items-center space-x-4 overflow-hidden">
                <div className="w-10 h-10 bg-violet-50 dark:bg-violet-900/20 rounded-xl shrink-0 flex items-center justify-center text-violet-500 dark:text-violet-400 group-hover:bg-violet-100">
                  <BookOpenText size={18} />
                </div>
                <div className="flex flex-col truncate pr-4">
                  <span className="font-bold text-slate-900 dark:text-slate-50 text-sm truncate">{getCleanTitle(note.file_path)}</span>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {getTopics(note.flashcards)}
                  </span>
                </div>
              </div>
              <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider rounded-md shrink-0">
                Ready
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUploadTab = () => (
    <div className="flex flex-col w-full animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Upload Material</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Transform any PDF into an interactive study session.</p>
      </div>

      {!guestFile ? (
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-10 py-24 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group relative cursor-pointer shadow-sm">
          {/* We let them pick a file for the illusion, but process nothing yet */}
          <input 
            type="file" 
            accept=".pdf" 
            onChange={(e) => e.target.files && setGuestFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="w-20 h-20 bg-violet-50 dark:bg-violet-900/20 rounded-full flex items-center justify-center text-violet-500 dark:text-violet-400 mb-6 group-hover:scale-110 transition-transform duration-300">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Tap or Drag a PDF</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium max-w-[200px] leading-relaxed">
            Test the AI engine instantly. Max file size 10MB.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-sm animate-in zoom-in-95 duration-300">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-14 h-14 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
              <FileText size={24} />
            </div>
            <div className="flex flex-col flex-1 truncate">
              <span className="font-bold text-slate-900 dark:text-slate-50 truncate">{guestFile.name}</span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                {(guestFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
              </span>
            </div>
            <button onClick={() => setGuestFile(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* THE TRAPDOOR IS HERE! */}
          <button 
            onClick={requireAuth} 
            className="w-full py-5 bg-violet-600 dark:bg-violet-700 text-white font-bold rounded-2xl shadow-md hover:bg-violet-700 flex justify-center items-center group"
          >
            Generate Study Kit <Sparkles size={18} className="ml-2 group-hover:animate-pulse" />
          </button>
        </div>
      )}
    </div>
  );

  const renderMockLibrary = () => (
    <div className="flex flex-col w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Your Library</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All your generated study materials in one place.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...recentNotes, ...recentNotes].map((note, idx) => (
          <div onClick={requireAuth} key={idx} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:border-violet-300 cursor-pointer transition-all">
            <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center text-violet-500 mb-4">
              <BookOpenText size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-50 truncate">{getCleanTitle(note.file_path)}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{getTopics(note.flashcards)}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMockProfile = () => (
    <div className="flex flex-col w-full animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="flex items-center space-x-6 mb-10 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-black">
          G
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">{username}</h1>
          <p className="text-sm text-emerald-500 font-bold mt-1">Free Explorer Plan</p>
        </div>
      </div>
      <div className="space-y-3">
        <div onClick={requireAuth} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-violet-300 transition-colors">
          <div className="flex items-center space-x-4 text-slate-700 dark:text-slate-300"><Settings size={20}/> <span className="font-bold">Account Settings</span></div>
          <ArrowRight size={16} className="text-slate-400" />
        </div>
        <div onClick={requireAuth} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-violet-300 transition-colors">
          <div className="flex items-center space-x-4 text-slate-700 dark:text-slate-300"><CreditCard size={20}/> <span className="font-bold">Upgrade to Premium</span></div>
          <ArrowRight size={16} className="text-slate-400" />
        </div>
        <div onClick={requireAuth} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-violet-300 transition-colors">
          <div className="flex items-center space-x-4 text-slate-700 dark:text-slate-300"><Bell size={20}/> <span className="font-bold">Notifications</span></div>
          <ArrowRight size={16} className="text-slate-400" />
        </div>
      </div>
      <button onClick={requireAuth} className="mt-8 w-full py-4 text-center font-bold text-white bg-slate-900 dark:bg-emerald-500 rounded-2xl shadow-md">
        Create Your Free Account
      </button>
    </div>
  );


  // ==========================================
  // NAVIGATION HELPERS
  // ==========================================
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'upload', icon: UploadCloud, label: 'Upload' },
    { id: 'library', icon: BookOpen, label: 'Library' },
    { id: 'progress', icon: BarChart2, label: 'Progress' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 pb-24 md:pb-0 md:pt-20">
      
      {/* DESKTOP TOP NAV */}
      <nav className="hidden md:flex fixed top-0 w-full items-center justify-between px-10 py-4 border-b border-slate-200 dark:border-slate-800/50 bg-white/70 dark:bg-[#0a0f1c]/70 backdrop-blur-xl z-50">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
            <BrainCircuit className="text-violet-500" size={18} />
          </div>
          <span className="text-xl font-black tracking-tight">OmniLearn.</span>
        </div>
        
        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 text-sm font-bold transition-colors ${activeTab === item.id ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <item.icon size={16} /> <span>{item.label}</span>
            </button>
          ))}
        </div>

        <button onClick={requireAuth} className="flex items-center px-5 py-2.5 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-black uppercase tracking-widest rounded-full shadow-lg hover:scale-105 transition-transform">
          Sign In <LogIn size={14} className="ml-2" />
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="w-full max-w-5xl mx-auto px-6 py-8">
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'upload' && renderUploadTab()}
        {activeTab === 'library' && renderMockLibrary()}
        {activeTab === 'progress' && renderHomeTab()} {/* Routing progress back to dashboard visual for brevity */}
        {activeTab === 'profile' && renderMockProfile()}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-[#0a0f1c] border-t border-slate-200 dark:border-slate-800/50 pb-safe pt-2 px-6 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center p-2 transition-colors ${activeTab === item.id ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <item.icon size={22} className="mb-1" />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
      
    </div>
  );
}