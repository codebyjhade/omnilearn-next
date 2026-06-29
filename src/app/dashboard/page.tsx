"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { UploadCloud, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [username, setUsername] = useState<string>("Loading...");

  useEffect(() => {
    const fetchUser = async () => {
      if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user && session.user.email) {
        // Logged in user gets their real name
        const name = session.user.email.split('@')[0];
        setUsername(name);
      } else {
        // THE ILLUSION: We give the guest a default name so the UI looks active
        setUsername("Student");
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col w-full px-6 pt-12 pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      
      {/* Dynamic Greeting Section - Looks exactly like a real account */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome back,
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{username} 👋</h1>
        </div>
      </div>

      {/* Quick Stats Row - Hardcoded to look populated & premium for guests */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center justify-center p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-500">1</span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Documents</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-500">7</span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quizzes</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-500">46%</span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Score</span>
        </div>
      </div>

      {/* Primary Upload CTA - NO TRAPDOOR HERE! Let them walk right into the Upload room. */}
      <Link href="/upload" className="block group">
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-purple-800 rounded-3xl p-6 text-white shadow-xl transition-all duration-300 active:scale-[0.98]">
          
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Sparkles size={100} />
          </div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5 backdrop-blur-sm border border-white/10">
              <UploadCloud size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-black mb-2 text-white">Upload a PDF</h2>
            <p className="text-sm text-purple-200 mb-8 max-w-[85%] font-medium leading-relaxed">
              Drop your study material and get instant quizzes, summaries, and slide decks.
            </p>
            
            <div className="inline-flex items-center px-5 py-2.5 text-xs font-black tracking-widest uppercase text-purple-900 bg-white rounded-full transition-colors hover:bg-slate-100">
              Get Started <ArrowRight size={14} className="ml-2" />
            </div>
          </div>
        </div>
      </Link>

    </div>
  );
}
