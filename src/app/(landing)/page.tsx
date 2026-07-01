"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sparkles, ArrowRight, BookOpen, BrainCircuit, Target,
  Upload, BarChart2, BookOpenText, Flame, Home, User,
  FileText, X, Bell, UploadCloud,
  Trash2, TrendingUp, Clock, AlertCircle, LogIn, Shield,
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = "home" | "upload" | "library" | "progress" | "profile";

interface MockNote {
  id: string;
  file_path: string;
  flashcards: { front: string }[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK = {
  username: "Guest Explorer",
  email: "explorer@omnilearn.app",
  docCount: 14,
  quizzesTaken: 28,
  avgScore: 92,
  xp: 1750,
  streak: 12,
  notes: [
    {
      id: "mock-1",
      file_path: "user_Advanced_Algorithms.pdf",
      flashcards: [
        { front: "Big O Notation" },
        { front: "Dynamic Programming" },
        { front: "Graph Theory" },
      ],
    },
    {
      id: "mock-2",
      file_path: "user_Anatomy_Ch4.pdf",
      flashcards: [
        { front: "Skeletal System" },
        { front: "Muscular Tissues" },
        { front: "Nervous System" },
      ],
    },
    {
      id: "mock-3",
      file_path: "user_Macroeconomics_Midterm.pdf",
      flashcards: [
        { front: "Supply and Demand" },
        { front: "Inflation" },
        { front: "Fiscal Policy" },
      ],
    },
  ] as MockNote[],
  chartData: [
    { subject: "Core Concepts", score: 0 },
    { subject: "Theory", score: 0 },
    { subject: "Application", score: 0 },
    { subject: "Definitions", score: 0 },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getCleanTitle = (path: string) =>
  path.split("_").slice(1).join("_").replace(".pdf", "") || "Study Material";

const getTopics = (flashcards: { front: string }[]) =>
  flashcards.slice(0, 3).map((f) => f.front).join(" · ");

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS: { name: string; id: TabId; icon: React.ElementType }[] = [
  { name: "Home",     id: "home",     icon: Home },
  { name: "Upload",   id: "upload",   icon: Upload },
  { name: "Library",  id: "library",  icon: BookOpen },
  { name: "Progress", id: "progress", icon: BarChart2 },
  { name: "Profile",  id: "profile",  icon: User },
];

// ─── Sub-tab props ────────────────────────────────────────────────────────────
interface TabProps {
  requireAuth: (e?: React.MouseEvent) => void;
  setActiveTab: (id: TabId) => void;
}

interface UploadTabProps extends TabProps {
  guestFile: File | null;
  setGuestFile: (f: File | null) => void;
}

interface ChartTabProps extends TabProps {
  mounted: boolean;
  gridStroke: string;
  tickFill: string;
}

// ─── HomeTab ──────────────────────────────────────────────────────────────────
const HomeTab = memo(function HomeTab({ requireAuth, setActiveTab }: TabProps) {
  const currentLevel = Math.floor(MOCK.xp / 500) + 1;
  const currentLevelXp = MOCK.xp % 500;
  const xpProgress = (currentLevelXp / 500) * 100;

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 md:mb-8 gap-4 md:gap-6">
        <div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
            Welcome back,
          </p>
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">
            {MOCK.username}
          </h1>
        </div>

        {/* Streak + Level badges */}
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 text-orange-500 shrink-0">
              <Flame size={20} className="fill-orange-500" aria-hidden="true" />
            </div>
            <div className="flex flex-col pr-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Day Streak</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-50 leading-none mt-0.5">{MOCK.streak}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
            <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
              <svg className="absolute w-12 h-12 -rotate-90" aria-hidden="true">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="125" strokeDashoffset={125 - (125 * xpProgress) / 100} className="text-violet-600 dark:text-violet-500 transition-all duration-1000" strokeLinecap="round" />
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

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 md:gap-6 mb-5 md:mb-8">
        {[
          { icon: BookOpen,     color: "text-violet-500 dark:text-violet-400",  value: MOCK.docCount,       label: "Documents" },
          { icon: BrainCircuit, color: "text-emerald-500 dark:text-emerald-400", value: MOCK.quizzesTaken,  label: "Quizzes"   },
          { icon: Target,       color: "text-orange-500 dark:text-orange-400",   value: `${MOCK.avgScore}%`, label: "Avg Score" },
        ].map(({ icon: Icon, color, value, label }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm transition-colors">
            <Icon className={`${color} mb-2 md:w-8 md:h-8`} size={20} aria-hidden="true" />
            <span className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50">{value}</span>
            <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">{label}</span>
          </div>
        ))}
      </div>

      {/* Upload CTA */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setActiveTab("upload")}
        onKeyDown={(e) => e.key === "Enter" && setActiveTab("upload")}
        className="cursor-pointer bg-violet-600 dark:bg-violet-700 rounded-3xl p-5 md:p-8 text-white shadow-lg relative overflow-hidden mb-6 md:mb-8 group active:scale-[0.98] transition-transform border border-violet-500 dark:border-violet-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <div className="absolute right-0 top-0 opacity-20 group-hover:scale-110 transition-transform duration-700 pointer-events-none translate-x-1/4 -translate-y-1/4" aria-hidden="true">
          <svg width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18"/><path d="M3 12h18"/>
            <path d="m18.36 5.64-12.72 12.72"/><path d="m5.64 5.64 12.72 12.72"/>
          </svg>
        </div>
        <div className="relative z-10">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 md:mb-5 backdrop-blur-sm">
            <Upload size={20} className="text-white md:hidden" aria-hidden="true" />
            <Upload size={24} className="text-white hidden md:block" aria-hidden="true" />
          </div>
          <h2 className="text-xl md:text-3xl font-extrabold mb-2 md:mb-3">Upload a PDF</h2>
          <p className="text-sm text-violet-200 mb-4 md:mb-6 max-w-md leading-relaxed">
            Drop your study material and get instant quizzes, summaries, and slide decks.
          </p>
          <div className="inline-flex items-center px-5 py-2.5 md:px-6 md:py-3.5 bg-white text-violet-700 font-extrabold rounded-xl shadow-sm text-sm md:text-base">
            Get Started <ArrowRight size={16} className="ml-2" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Recent Activity</h3>
          <button onClick={() => setActiveTab("library")} className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 focus:outline-none">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {MOCK.notes.map((note) => (
            <div
              key={note.id}
              onClick={requireAuth}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && requireAuth()}
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:border-violet-200 dark:hover:border-violet-800/50 transition-colors cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-violet-50 dark:bg-violet-900/20 rounded-xl shrink-0 flex items-center justify-center text-violet-500 dark:text-violet-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/40 transition-colors">
                  <BookOpenText size={18} aria-hidden="true" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-900 dark:text-slate-50 text-sm truncate" title={getCleanTitle(note.file_path)}>
                    {getCleanTitle(note.file_path)}
                  </span>
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
});

// ─── UploadTab ────────────────────────────────────────────────────────────────
const UploadTab = memo(function UploadTab({ requireAuth, guestFile, setGuestFile }: UploadTabProps) {
  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Upload Material</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Transform any PDF into an interactive study session.</p>
      </div>

      {!guestFile ? (
        <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-10 py-20 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 cursor-pointer shadow-sm group">
          <input
            type="file"
            accept=".pdf"
            aria-label="Upload PDF file"
            onChange={(e) => e.target.files && setGuestFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="w-20 h-20 bg-violet-50 dark:bg-violet-900/20 rounded-full flex items-center justify-center text-violet-500 dark:text-violet-400 mb-6 group-hover:scale-110 transition-transform duration-300">
            <UploadCloud size={32} aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Tap or Drag a PDF</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium max-w-[200px] leading-relaxed">
            Test the AI engine instantly. Max file size 10 MB.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-sm animate-in zoom-in-95 duration-300 transition-colors">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0 transition-colors">
              <FileText size={24} aria-hidden="true" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-bold text-slate-900 dark:text-slate-50 truncate">{guestFile.name}</span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                {(guestFile.size / 1024 / 1024).toFixed(2)} MB · PDF Document
              </span>
            </div>
            <button onClick={() => setGuestFile(null)} aria-label="Remove file" className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <button
            onClick={requireAuth}
            className="w-full py-4 bg-violet-600 dark:bg-violet-700 text-white font-bold rounded-2xl shadow-md hover:bg-violet-700 dark:hover:bg-violet-600 active:scale-[0.98] flex justify-center items-center gap-2 transition-all"
          >
            Generate Study Kit <Sparkles size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
});

// ─── LibraryTab ───────────────────────────────────────────────────────────────
const LibraryTab = memo(function LibraryTab({ requireAuth }: TabProps) {
  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Library</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All your processed study materials</p>
      </div>
      <div className="flex flex-col gap-4">
        {MOCK.notes.map((note) => (
          <div
            key={note.id}
            onClick={requireAuth}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && requireAuth()}
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800/50 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center text-violet-500 dark:text-violet-400 shrink-0 transition-colors">
                <FileText size={20} aria-hidden="true" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-900 dark:text-slate-50 text-sm truncate" title={getCleanTitle(note.file_path)}>
                  {getCleanTitle(note.file_path)}
                </span>
                <div className="flex items-center mt-1">
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
                    Ready
                  </span>
                </div>
              </div>
            </div>
            <button onClick={requireAuth} aria-label="Delete" className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors z-10 shrink-0">
              <Trash2 size={18} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

// ─── ProgressTab ──────────────────────────────────────────────────────────────
const ProgressTab = memo(function ProgressTab({ mounted, gridStroke, tickFill }: ChartTabProps) {
  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Progress</h1>
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
        {[
          { icon: TrendingUp, value: "0%", label: "Average" },
          { icon: Target,     value: "0%", label: "Best Score" },
          { icon: Clock,      value: "0s", label: "Study Time" },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm transition-colors">
            <Icon size={16} className="text-slate-400 dark:text-slate-500 mb-2" aria-hidden="true" />
            <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{value}</span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">{label}</span>
          </div>
        ))}
      </div>

      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-5 mb-6 flex items-start gap-3 transition-colors">
        <AlertCircle size={20} className="text-orange-500 dark:text-orange-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-bold text-orange-800 dark:text-orange-400">No data available yet</h3>
          <p className="text-xs font-medium text-orange-600 dark:text-orange-500/80 mt-1">
            Complete quizzes in the Library tab to start tracking your subject mastery.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-6 opacity-50 transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-4">Subject Mastery</h3>
        <div className="h-[250px] w-full mt-4">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={MOCK.chartData}>
                <PolarGrid stroke={gridStroke} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: tickFill, fontSize: 10, fontWeight: 500 }} />
                <Radar name="Student" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
});

// ─── ProfileTab ───────────────────────────────────────────────────────────────
const ProfileTab = memo(function ProfileTab({ requireAuth }: TabProps) {
  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300">
      <div className="flex flex-col items-center justify-center pt-6 mb-8">
        <div className="w-24 h-24 bg-violet-600 dark:bg-violet-700 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4 uppercase transition-colors">
          {MOCK.username.charAt(0)}
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{MOCK.username}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{MOCK.email}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: BookOpen,     color: "text-violet-500 dark:text-violet-400",  value: MOCK.docCount,       label: "Documents" },
          { icon: BrainCircuit, color: "text-emerald-500 dark:text-emerald-400", value: MOCK.quizzesTaken,  label: "Quizzes"   },
          { icon: Target,       color: "text-orange-500 dark:text-orange-400",   value: `${MOCK.avgScore}%`, label: "Avg Score" },
        ].map(({ icon: Icon, color, value, label }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm transition-colors">
            <Icon size={16} className={`${color} mb-2`} aria-hidden="true" />
            <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{value}</span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">{label}</span>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-3 px-1">Account</h3>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
          <div onClick={requireAuth} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && requireAuth()} className="flex items-center gap-4 p-5 border-b border-slate-50 dark:border-slate-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none">
            <User size={20} className="text-slate-400 dark:text-slate-500 shrink-0" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-50">Name</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{MOCK.username}</span>
            </div>
          </div>
          <div onClick={requireAuth} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && requireAuth()} className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none">
            <Shield size={20} className="text-slate-400 dark:text-slate-500 shrink-0" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-50">Email</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{MOCK.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-3 px-1">Notifications</h3>
        <div onClick={requireAuth} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && requireAuth()} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none">
          <div className="flex items-center gap-4 p-5">
            <Bell size={20} className="text-slate-500 dark:text-slate-400 shrink-0" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-50">Daily Practice Reminders</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Not set up yet — go to Progress tab</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={requireAuth}
        className="flex items-center justify-center gap-3 p-5 bg-violet-600 dark:bg-violet-700 rounded-3xl w-full shadow-md hover:bg-violet-700 dark:hover:bg-violet-600 active:scale-[0.98] transition-all"
      >
        <LogIn size={20} className="text-white" aria-hidden="true" />
        <span className="text-sm font-bold text-white">Create Free Account</span>
      </button>
    </div>
  );
});

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const supabase = createClient();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [guestFile, setGuestFile] = useState<File | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Redirect already-authenticated users
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && session) router.replace("/home");
    });
    return () => { cancelled = true; };
  }, [router]);

  const requireAuth = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    router.push("/login");
  }, [router]);

  const gridStroke = mounted && resolvedTheme === "dark" ? "#1e293b" : "#f1f5f9";
  const tickFill   = mounted && resolvedTheme === "dark" ? "#94a3b8" : "#64748b";

  // Stable tab content — no remounting because all tab components are
  // defined at module scope (not inside the parent's function body).
  const tabContent: Record<TabId, React.ReactNode> = {
    home:     <HomeTab     requireAuth={requireAuth} setActiveTab={setActiveTab} />,
    upload:   <UploadTab   requireAuth={requireAuth} setActiveTab={setActiveTab} guestFile={guestFile} setGuestFile={setGuestFile} />,
    library:  <LibraryTab  requireAuth={requireAuth} setActiveTab={setActiveTab} />,
    progress: <ProgressTab requireAuth={requireAuth} setActiveTab={setActiveTab} mounted={mounted} gridStroke={gridStroke} tickFill={tickFill} />,
    profile:  <ProfileTab  requireAuth={requireAuth} setActiveTab={setActiveTab} />,
  };

  // ─── Shell ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* ── DESKTOP HEADER ────────────────────────────────────────────────── */}
      <header className="hidden md:block fixed top-0 inset-x-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 z-50 transition-colors duration-300">
        <div className="w-full max-w-4xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <button
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg"
            aria-label="Go to home"
          >
            <Image src="/OmniLearn.jpg" alt="OmniLearn" width={30} height={30} className="rounded-lg object-cover" priority />
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-50 leading-none">OmniLearn</span>
          </button>

          {/* Nav — pill-style for zoom stability */}
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map(({ name, id, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold
                    transition-colors duration-200 whitespace-nowrap
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
                    ${isActive
                      ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40"
                      : "text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }
                  `}
                >
                  <Icon size={16} aria-hidden="true" className="shrink-0" />
                  {name}
                </button>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
            <button
              onClick={requireAuth}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-700 dark:hover:bg-slate-100 active:scale-[0.97] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 whitespace-nowrap"
            >
              Sign In <LogIn size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE HEADER ─────────────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 inset-x-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 z-50 transition-colors duration-300">
        <div className="px-5 h-14 flex items-center justify-between">
          <button onClick={() => setActiveTab("home")} className="flex items-center gap-2 focus:outline-none" aria-label="Go to home">
            <Image src="/OmniLearn.jpg" alt="OmniLearn" width={28} height={28} className="rounded-lg object-cover" priority />
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-50 leading-none">OmniLearn</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Spacer — matches mobile h-14 / desktop h-16 */}
      <div className="h-14 md:h-16 shrink-0" aria-hidden="true" />

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 md:pt-6 pb-24 md:pb-8">
        {tabContent[activeTab]}
      </main>

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/50 flex justify-around items-center z-50 transition-colors duration-300"
        aria-label="Main navigation"
        style={{ paddingTop: "0.5rem", paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {NAV_ITEMS.map(({ name, id, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-[3rem] focus:outline-none"
            >
              <div className="relative flex items-center justify-center">
                <Icon size={22} aria-hidden="true" className={`transition-colors duration-200 ${isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-violet-600 dark:bg-violet-400 rounded-full" aria-hidden="true" />
                )}
              </div>
              <span className={`text-[10px] font-bold transition-colors duration-200 ${isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"}`}>
                {name}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
