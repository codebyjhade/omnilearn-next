"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Mail, Lock, UploadCloud, Loader2, ArrowRight, Sparkles, Moon, Sun } from "lucide-react";

export default function EntryPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // THE BAIT STATE
  const [baitState, setBaitState] = useState<'idle' | 'analyzing' | 'hooked'>('idle');

  // Force dark mode on mount for that premium feel
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // THE BOUNCER: If already logged in, teleport to dashboard
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/home');
      }
    };
    checkSession();
  }, [router]);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Optional: you can show a "check your email" message here
      }
      router.push('/home'); // Redirect to dashboard after success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerBait = () => {
    setBaitState('analyzing');
    setTimeout(() => {
      setBaitState('hooked');
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-500 selection:bg-emerald-500/30">
      
      {/* ================= LEFT SIDE: THE HOOK & BRANDING ================= */}
      <div className="hidden lg:flex flex-col flex-1 relative p-12 lg:p-20 overflow-hidden border-r border-slate-200 dark:border-slate-800/50 justify-between">
        
        {/* Abstract Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 dark:opacity-20 pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <BrainCircuit className="text-emerald-500" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">OmniLearn<span className="text-emerald-500">.</span></span>
        </div>

        {/* Main Value Prop & Bait Zone */}
        <div className="relative z-10 max-w-xl">
          <h1 className="text-5xl font-black leading-[1.1] tracking-tight mb-6 text-slate-900 dark:text-white">
            Crush your board exams with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">AI-powered</span> study sessions.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 font-medium">
            Upload your lectures, notes, or PDFs. OmniLearn instantly generates smart flashcards, strict mock exams, and acts as your personal Socratic tutor.
          </p>

          {/* THE DRAG & DROP BAIT */}
          <div 
            onClick={baitState === 'idle' ? triggerBait : undefined}
            className={`
              relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-10 text-center
              ${baitState === 'hooked' 
                ? 'border-emerald-500/50 bg-emerald-500/5' 
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 dark:bg-slate-900/50 bg-white'
              }
            `}
          >
            <AnimatePresence mode="wait">
              {baitState === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-500 dark:text-slate-400 shadow-sm">
                    <UploadCloud size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Drag & Drop a PDF here</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Test the AI engine instantly (up to 50MB)</p>
                </motion.div>
              )}

              {baitState === 'analyzing' && (
                <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                  <Loader2 size={32} className="animate-spin text-emerald-500 mb-4" />
                  <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Extracting context...</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Generating flashcards & quiz questions</p>
                </motion.div>
              )}

              {baitState === 'hooked' && (
                <motion.div key="hooked" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4 shadow-sm border border-emerald-200 dark:border-emerald-800">
                    <Sparkles size={28} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Material Generated!</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Sign in to the right to view your new study deck.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative z-10 text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
          Enterprise Grade • End-to-End Encrypted
        </div>
      </div>


      {/* ================= RIGHT SIDE: GLASSMORPHIC AUTH ================= */}
      <div className="w-full lg:w-[500px] flex flex-col justify-center relative bg-white dark:bg-slate-950 px-8 py-12 lg:px-16 shadow-2xl z-20">
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="absolute top-8 right-8 p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors border border-slate-200 dark:border-slate-800"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Mobile Logo (Only visible on small screens) */}
        <div className="flex lg:hidden items-center justify-center space-x-2 mb-12">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <BrainCircuit className="text-emerald-500" size={20} />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">OmniLearn.</span>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            {isLogin ? 'Welcome back.' : 'Create account.'}
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">
            {isLogin ? 'Enter your credentials to access your gym.' : 'Start your journey to better grades today.'}
          </p>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs font-semibold px-2 py-1 bg-red-500/10 rounded-lg border border-red-500/20">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-4 mt-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center shadow-lg active:scale-[0.98]
                ${baitState === 'hooked' 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 animate-pulse' 
                  : 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-emerald-400 dark:shadow-emerald-500/20'
                }
                disabled:opacity-50 disabled:active:scale-100
              `}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}