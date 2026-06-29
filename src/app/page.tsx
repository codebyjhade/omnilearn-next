"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { Flame, BookOpen, BrainCircuit, Target, Upload, ArrowRight } from "lucide-react";

export default function Home() {
  const [username, setUsername] = useState<string>("Student");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user && session.user.email) {
        setUsername(session.user.email.split('@')[0]);
      } else {
        // THE ILLUSION: Guest sees "Student". No redirect block here.
        setUsername("Student");
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0a0f1c] text-white px-6 pt-10 pb-24 font-sans selection:bg-purple-500/30">
      
      {/* Greeting */}
      <div className="mb-8 space-y-1">
        <p className="text-[15px] text-slate-400 font-medium">Welcome back,</p>
        <h1 className="text-4xl font-extrabold tracking-tight">{username} <span className="inline-block animate-wave">👋</span></h1>
      </div>

      {/* Streaks & Level Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        
        {/* Streak Card */}
        <div className="bg-[#111627] border border-[#1e253c] rounded-3xl p-5 flex items-center space-x-4 shadow-lg">
          <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
            <Flame size={24} className="text-orange-500 fill-orange-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Day Streak</p>
            <p className="text-2xl font-bold">1</p>
          </div>
        </div>

        {/* Level Card */}
        <div className="bg-[#111627] border border-[#1e253c] rounded-3xl p-5 flex items-center space-x-4 shadow-lg">
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Fake Circular Progress */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" className="stroke-[#1e253c] stroke-[4] fill-none" />
              <circle cx="24" cy="24" r="20" className="stroke-purple-500 stroke-[4] fill-none" strokeDasharray="125" strokeDashoffset="85" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-bold text-purple-400">2</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Level 2</p>
            <p className="text-xs font-bold text-slate-300 mt-0.5">150 / 500 XP</p>
          </div>
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#111627] border border-[#1e253c] rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-lg">
          <BookOpen size={24} className="text-purple-400 mb-3" />
          <span className="text-2xl font-bold mb-1">1</span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Documents</span>
        </div>
        
        <div className="bg-[#111627] border border-[#1e253c] rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-lg">
          <BrainCircuit size={24} className="text-emerald-400 mb-3" />
          <span className="text-2xl font-bold mb-1">7</span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Quizzes</span>
        </div>

        <div className="bg-[#111627] border border-[#1e253c] rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-lg">
          <Target size={24} className="text-orange-400 mb-3" />
          <span className="text-2xl font-bold mb-1">46%</span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Avg Score</span>
        </div>
      </div>

      {/* Upload Card - The Gateway to the Upload Room */}
      <Link href="/upload" className="block group">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#6b21a8] via-[#7e22ce] to-[#581c87] rounded-[32px] p-8 text-white shadow-2xl transition-transform duration-300 active:scale-[0.98]">
          
          {/* Abstract background graphics */}
          <div className="absolute right-0 top-0 opacity-20 pointer-events-none translate-x-1/4 -translate-y-1/4">
             <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M3 12h18"/><path d="m18.36 5.64-12.72 12.72"/><path d="m5.64 5.64 12.72 12.72"/></svg>
          </div>
          <div className="absolute bottom-8 right-12 w-16 h-16 border-[8px] border-white/10 rounded-full pointer-events-none"></div>

          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner">
              <Upload size={28} className="text-white" />
            </div>
            
            <h2 className="text-3xl font-black mb-3 tracking-tight">Upload a PDF</h2>
            <p className="text-[15px] text-purple-200 mb-10 max-w-[85%] font-medium leading-relaxed">
              Drop your study material and get instant quizzes, summaries, and slide decks.
            </p>
            
            <div className="inline-flex items-center px-6 py-3.5 text-sm font-black tracking-widest uppercase text-purple-900 bg-white rounded-full transition-all group-hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Get Started <ArrowRight size={16} className="ml-2" />
            </div>
          </div>
        </div>
      </Link>

    </div>
  );
}