"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen, BrainCircuit, Target, Upload, BarChart2, BookOpenText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [docCount, setDocCount] = useState(0);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      setUsername(user.email?.split('@')[0] || "Student");

      // Get Total Count
      const { count } = await supabase
        .from('study_notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      setDocCount(count || 0);

      // 🔥 NEW: Fetch the 3 most recent study materials
      const { data: recent } = await supabase
        .from('study_notes')
        .select('id, file_path, flashcards')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (recent) setRecentNotes(recent);
    }
    loadData();
  }, [router]);

  // Helper functions for formatting titles and topics
  const getCleanTitle = (path: string) => {
    const parts = path.split('_');
    return parts.slice(1).join('_').replace('.pdf', '') || "Study Material";
  };

  const getTopics = (flashcards: any) => {
    if (!flashcards || flashcards.length === 0) return "General Study Notes";
    return flashcards.slice(0, 3).map((f: any) => f.front).join(' · ');
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <p className="text-slate-500 font-medium">Welcome back,</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            {username} 👋
          </h1>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <BookOpen className="text-violet-500 mb-2 md:w-8 md:h-8" size={20} />
          <span className="text-xl md:text-3xl font-extrabold text-slate-900">{docCount}</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Documents</span>
        </div>
        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <BrainCircuit className="text-emerald-500 mb-2 md:w-8 md:h-8" size={20} />
          <span className="text-xl md:text-3xl font-extrabold text-slate-900">0</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Quizzes</span>
        </div>
        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <Target className="text-orange-500 mb-2 md:w-8 md:h-8" size={20} />
          <span className="text-xl md:text-3xl font-extrabold text-slate-900">0%</span>
          <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Avg Score</span>
        </div>
      </div>

      {/* Upload Call to Action */}
      <div className="bg-violet-600 rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden mb-10">
        <div className="absolute -right-10 -top-10 opacity-20">
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
          <Link href="/upload" className="inline-flex items-center px-6 py-3.5 bg-white text-violet-700 font-extrabold rounded-xl hover:bg-violet-50 transition-transform hover:scale-105 active:scale-95 shadow-sm">
            Get Started <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </div>

      {/* 🔥 NEW: Quick Actions */}
      <div className="mb-10">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 px-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/library" className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
              <BookOpenText size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm">Library</span>
              <span className="text-[10px] text-slate-500 font-medium">Your materials</span>
            </div>
          </Link>
          <Link href="/progress" className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <BarChart2 size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm">Progress</span>
              <span className="text-[10px] text-slate-500 font-medium">Your stats</span>
            </div>
          </Link>
        </div>
      </div>

      {/* 🔥 NEW: Recent Materials */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Recent</h3>
          <Link href="/library" className="text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors">View All</Link>
        </div>
        
        {recentNotes.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-3xl">
            No recent materials. Upload a PDF to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {recentNotes.map((note) => (
              <Link href={`/library/${note.id}`} key={note.id}>
                <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-violet-200 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-4 overflow-hidden">
                    <div className="w-10 h-10 bg-violet-50 rounded-xl shrink-0 flex items-center justify-center text-violet-500">
                      <BookOpenText size={18} />
                    </div>
                    <div className="flex flex-col truncate pr-4">
                      <span className="font-bold text-slate-900 text-sm truncate">{getCleanTitle(note.file_path)}</span>
                      <span className="text-[10px] font-medium text-slate-400 truncate mt-0.5">
                        {getTopics(note.flashcards)}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wider rounded-md shrink-0">
                    Ready
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}