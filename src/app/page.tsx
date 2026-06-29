"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { 
  Sparkles, ArrowRight, BookOpen, BrainCircuit, Target, 
  Upload, BarChart2, BookOpenText, Flame, Home, User, 
  FileText, X, Settings, CreditCard, Bell, UploadCloud,
  Trash2, TrendingUp, Clock, AlertCircle, Sun, Moon, LogIn,
  Shield, LogOut
} from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { supabase } from "../lib/supabaseClient";

export default function InteractiveLandingPage() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [activeTab, setActiveTab] = useState("home");
  const [guestFile, setGuestFile] = useState<File | null>(null);

  // Prevent hydration mismatch for themes/recharts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Bouncer: If they are ALREADY a real logged-in user, send them to the real dashboard.
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
  const email = "explorer@omnilearn.app";
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

  const chartData = [
    { subject: "Core Concepts", score: 0 },
    { subject: "Theory", score: 0 },
    { subject: "Application", score: 0 },
    { subject: "Definitions", score: 0 },
  ];

  const currentLevel = Math.floor(xp / 500) + 1;
  const currentLevelXp = xp % 500;
  const xpProgress = (currentLevelXp / 500) * 100;

  const getCleanTitle = (path: string) => path.split('_').slice(1).join('_').replace('.pdf', '');
  const getTopics = (flashcards: any) => flashcards.map((f: any) => f.front).join(' · ');

  const gridStroke = mounted && resolvedTheme === 'dark' ? '#1e293b' : '#f1f5f9';
  const tickFill = mounted && resolvedTheme === 'dark' ? '#94a3b8' : '#64748b';

  // ==========================================
  // THE TRAPDOOR: Hijacks clicks and demands Auth
  // ==========================================
  const requireAuth = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    router.push('/login'); 
  };

  // ==========================================
  // APP NAVIGATION COMPONENTS
  // ==========================================
  const navItems = [
    { name: "Home", id: "home", icon: Home },
    { name: "Upload", id: "upload", icon: Upload },
    { name: "Library", id: "library", icon: BookOpen },
    { name: "Progress", id: "progress", icon: BarChart2 },
    { name: "Profile", id: "profile", icon: User },
  ];

  const ThemeToggleMock = () => (
    <button 
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} 
      className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="Toggle Dark Mode"
    >
      {mounted && resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );

  // ==========================================
  // TAB COMPONENTS (The App Simulations)
  // ==========================================

  const renderHomeTab = () => (
    <div className="flex flex-col w-full fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-6 md:space-y-0">
        <div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Welcome back,</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
            {username} 👋
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-white dark:bg-[#111627] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3 flex items-center space-x-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 text-orange-500">
              <Flame size={20} className="fill-orange-500" />
            </div>
            <div className="flex flex-col pr-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Day Streak</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-50 leading-none mt-0.5">{streak}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111627] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3 flex items-center space-x-4 shadow-sm">
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

      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
        <div className="bg-white dark:bg-[#111627] rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center text-center shadow-sm">
          <BookOpen className="text-violet-500 dark:text-violet-400 mb-2 md:w-8 md:h-8" size={20} />
          <span className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50">{docCount}</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Documents</span>
        </div>
        <div className="bg-white dark:bg-[#111627] rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center text-center shadow-sm">
          <BrainCircuit className="text-emerald-500 dark:text-emerald-400 mb-2 md:w-8 md:h-8" size={20} />
          <span className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50">{quizzesTaken}</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Quizzes</span>
        </div>
        <div className="bg-white dark:bg-[#111627] rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center text-center shadow-sm">
          <Target className="text-orange-500 dark:text-orange-400 mb-2 md:w-8 md:h-8" size={20} />
          <span className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50">{avgScore}%</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Avg Score</span>
        </div>
      </div>

      <div onClick={() => setActiveTab('upload')} className="cursor-pointer bg-[#7c3aed] rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden mb-10 group transition-transform active:scale-[0.98]">
        <div className="absolute right-0 top-0 opacity-20 group-hover:scale-110 transition-transform duration-700 pointer-events-none translate-x-1/4 -translate-y-1/4">
          <svg width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M3 12h18"/><path d="m18.36 5.64-12.72 12.72"/><path d="m5.64 5.64 12.72 12.72"/></svg>
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
            <Upload size={24} className="text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Upload a PDF</h2>
          <p className="text-sm md:text-base text-violet-200 mb-8 max-w-md leading-relaxed">
            Drop your study material and get instant quizzes, summaries, and slide decks.
          </p>
          <div className="inline-flex items-center px-6 py-3.5 bg-white text-violet-700 font-extrabold rounded-xl shadow-sm">
            Get Started <ArrowRight size={18} className="ml-2" />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Recent Activity</h3>
          <button onClick={() => setActiveTab('library')} className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500">View All</button>
        </div>
        
        <div className="space-y-3">
          {recentNotes.map((note) => (
            <div onClick={requireAuth} key={note.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#111627] border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-sm hover:border-violet-200 dark:hover:border-violet-800/50 transition-colors cursor-pointer group">
              <div className="flex items-center space-x-4 overflow-hidden">
                <div className="w-10 h-10 bg-violet-50 dark:bg-violet-900/20 rounded-xl shrink-0 flex items-center justify-center text-violet-500 dark:text-violet-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/40">
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
    <div className="flex flex-col w-full fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Upload Material</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Transform any PDF into an interactive study session.</p>
      </div>

      {!guestFile ? (
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-white dark:bg-[#111627] flex flex-col items-center justify-center p-10 py-24 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 cursor-pointer shadow-sm group">
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
        <div className="bg-white dark:bg-[#111627] border border-slate-100 dark:border-slate-800/80 rounded-[32px] p-6 shadow-sm">
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
          <button 
            onClick={requireAuth} 
            className="w-full py-5 bg-violet-600 dark:bg-violet-700 text-white font-bold rounded-2xl shadow-md hover:bg-violet-700 flex justify-center items-center transition-colors"
          >
            Generate Study Kit <Sparkles size={18} className="ml-2" />
          </button>
        </div>
      )}
    </div>
  );

  const renderLibraryTab = () => (
    <div className="flex flex-col w-full fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Library</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All your processed study materials</p>
      </div>

      <div className="flex flex-col space-y-4">
        {recentNotes.map((note) => (
          <div onClick={requireAuth} key={note.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#111627] border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800/50 transition-all cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center text-violet-500 dark:text-violet-400 transition-colors">
                <FileText size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-slate-50 text-sm truncate max-w-[180px]">
                  {getCleanTitle(note.file_path)}
                </span>
                <div className="flex items-center mt-1">
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors">
                    Ready
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={requireAuth}
              className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors z-10"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProgressTab = () => (
    <div className="flex flex-col w-full fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Progress</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your study journey</p>
      </div>

      <div className="bg-violet-600 dark:bg-violet-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden mb-4 border border-violet-500 dark:border-violet-600">
        <div className="flex flex-col items-center justify-center text-center relative z-10 py-4">
          <span className="text-[10px] font-bold tracking-widest text-violet-200 uppercase mb-2">Readiness Score</span>
          <h2 className="text-6xl font-extrabold tracking-tighter mb-2">0%</h2>
          <p className="text-sm font-medium text-violet-200">Take a quiz to see your score</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-[#111627] rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center text-center shadow-sm">
          <TrendingUp size={16} className="text-slate-400 dark:text-slate-500 mb-2" />
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">0%</span>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">Average</span>
        </div>
        <div className="bg-white dark:bg-[#111627] rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center text-center shadow-sm">
          <Target size={16} className="text-slate-400 dark:text-slate-500 mb-2" />
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">0%</span>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">Best Score</span>
        </div>
        <div className="bg-white dark:bg-[#111627] rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center text-center shadow-sm">
          <Clock size={16} className="text-slate-400 dark:text-slate-500 mb-2" />
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">0s</span>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">Study Time</span>
        </div>
      </div>

      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-5 mb-6 flex items-start space-x-3">
        <AlertCircle size={20} className="text-orange-500 dark:text-orange-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-orange-800 dark:text-orange-400">No data available yet</h3>
          <p className="text-xs font-medium text-orange-600 dark:text-orange-500/80 mt-1">
            Complete quizzes in the Library tab to start tracking your subject mastery.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111627] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm mb-6 opacity-50">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-4">Subject Mastery</h3>
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke={gridStroke} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: tickFill, fontSize: 10, fontWeight: 500 }} />
              <Radar name="Student" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="flex flex-col w-full fade-in duration-300">
      <div className="flex flex-col items-center justify-center pt-6 mb-8">
        <div className="w-24 h-24 bg-violet-600 dark:bg-violet-700 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4 uppercase">
          {username.charAt(0)}
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{username}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{email}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white dark:bg-[#111627] rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center text-center shadow-sm">
          <BookOpen className="text-violet-500 dark:text-violet-400 mb-2 md:w-8 md:h-8" size={20} />
          <span className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50">{docCount}</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Documents</span>
        </div>
        <div className="bg-white dark:bg-[#111627] rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center text-center shadow-sm">
          <BrainCircuit className="text-emerald-500 dark:text-emerald-400 mb-2 md:w-8 md:h-8" size={20} />
          <span className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50">{quizzesTaken}</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Quizzes</span>
        </div>
        <div className="bg-white dark:bg-[#111627] rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center text-center shadow-sm">
          <Target className="text-orange-500 dark:text-orange-400 mb-2 md:w-8 md:h-8" size={20} />
          <span className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50">{avgScore}%</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Avg Score</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-3 px-2">Account</h3>
        <div className="bg-white dark:bg-[#111627] border border-slate-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
          <div onClick={requireAuth} className="flex items-center space-x-4 p-5 border-b border-slate-50 dark:border-slate-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <User size={20} className="text-slate-400 dark:text-slate-500" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-50">Name</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{username}</span>
            </div>
          </div>
          <div onClick={requireAuth} className="flex items-center space-x-4 p-5 border-b border-slate-50 dark:border-slate-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <Shield size={20} className="text-slate-400 dark:text-slate-500" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-50">Email</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-3 px-2">Notifications</h3>
        <div onClick={requireAuth} className="bg-white dark:bg-[#111627] border border-slate-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
          <div className="flex items-center space-x-4 p-5">
            <Bell size={20} className="text-slate-500 dark:text-slate-400" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-50">Daily Practice Reminders</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Not set up yet — go to Progress tab</span>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={requireAuth}
        className="flex items-center justify-center space-x-3 p-5 bg-violet-600 dark:bg-violet-700 rounded-3xl w-full shadow-md hover:bg-violet-700 transition-colors"
      >
        <span className="text-sm font-bold text-white">Create Free Account</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0f1c] font-sans transition-colors duration-300">
      
      {/* ================= DESKTOP TOP NAVIGATION ================= */}
      <div className="hidden md:flex fixed top-0 w-full bg-white/90 dark:bg-[#0a0f1c]/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 px-8 py-4 z-50 justify-between items-center transition-colors duration-300">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <Image 
            src="/OmniLearn.jpg" 
            alt="OmniLearn Logo" 
            width={32} 
            height={32} 
            className="rounded-lg object-cover"
            priority 
          />
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-50">OmniLearn</span>
        </div>
        
        <div className="flex items-center space-x-8">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button 
                  key={item.id} 
                  onClick={() => setActiveTab(item.id)}
                  className="flex items-center space-x-2 group focus:outline-none"
                >
                  <Icon size={18} className={`transition-colors duration-200 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-violet-400 dark:group-hover:text-violet-300'}`} />
                  <span className={`text-sm font-bold transition-colors duration-200 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-violet-500 dark:group-hover:text-violet-300'}`}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
          
          <div className="pl-6 border-l border-slate-200 dark:border-slate-800 flex items-center space-x-4">
            <ThemeToggleMock />
            <button 
              onClick={requireAuth} 
              className="flex items-center px-5 py-2.5 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-black uppercase tracking-widest rounded-full shadow-md hover:scale-105 transition-transform"
            >
              Sign In <LogIn size={14} className="ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE TOP HEADER ================= */}
      <div className="md:hidden fixed top-0 w-full bg-white/90 dark:bg-[#0a0f1c]/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 px-6 py-4 flex justify-between items-center z-50 transition-colors duration-300">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <Image 
            src="/OmniLearn.jpg" 
            alt="OmniLearn Logo" 
            width={28} 
            height={28} 
            className="rounded-lg object-cover"
            priority
          />
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-50">OmniLearn</span>
        </div>
        <ThemeToggleMock />
      </div>

      {/* Accurate Desktop Spacing to match real application padding */}
      <div className="h-16 md:h-24 w-full shrink-0" />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6">
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'upload' && renderUploadTab()}
        {activeTab === 'library' && renderLibraryTab()}
        {activeTab === 'progress' && renderProgressTab()} 
        {activeTab === 'profile' && renderProfileTab()}
      </main>

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <div className="md:hidden fixed bottom-0 w-full bg-white dark:bg-[#0a0f1c] border-t border-slate-200 dark:border-slate-800/50 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] dark:shadow-none transition-colors duration-300 pb-safe">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center gap-1 relative w-12 focus:outline-none"
            >
              {isActive && (
                <span className="absolute -top-3 w-1 h-1 bg-violet-600 dark:bg-violet-400 rounded-full" />
              )}
              <Icon size={22} className={`transition-colors duration-200 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className={`text-[10px] font-bold transition-colors duration-200 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
      
    </div>
  );
}