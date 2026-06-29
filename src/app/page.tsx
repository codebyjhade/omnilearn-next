"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient"; 
import { UploadCloud, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [username, setUsername] = useState<string>("Loading...");
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user && session.user.email) {
        const name = session.user.email.split('@')[0];
        setUsername(name);
        setIsGuest(false);
      } else {
        // We keep the illusion alive. It looks like a real account.
        setUsername("Student");
        setIsGuest(true);
      }
    };
    fetchUser();
  }, []);

  // THE INVISIBLE TRAPDOOR: Only triggers when they actually try to click
  const handleGatedAction = (e: React.MouseEvent) => {
    if (isGuest) {
      e.preventDefault(); // Stop the upload
      router.push('/login'); // Send to the sign-up page
    }
  };

  return (
    <div className="flex flex-col w-full px-6 pt-12 pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      
      {/* Dynamic Greeting Section (Restored to original) */}
      <div className="space-y-1">
        <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back,</p>
        <h1 className="text-2xl font-bold tracking-tight">{username} 👋</h1>
      </div>

      {/* Quick Stats Row (Restored to original beautiful numbers) */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center justify-center p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-500">1</span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Documents</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-500">1</span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quizzes</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-500">100%</span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Score</span>
        </div>
      </div>

      {/* Primary Upload CTA (Restored UI, but with the invisible trapdoor) */}
      <Link href="/upload" onClick={handleGatedAction} className="block group">
        <div className="relative overflow-hidden bg-slate-900 dark:bg-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 transition-all duration-300 active:scale-[0.98] group-hover:border-emerald-500/50">
          
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-900/20 opacity-50" />
          
          <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20 text-emerald-500">
            <Sparkles size={100} />
          </div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-5 border border-emerald-500/30">
              <UploadCloud size={24} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-black mb-2 text-white">Upload a PDF</h2>
            <p className="text-sm text-slate-400 mb-8 max-w-[85%] font-medium leading-relaxed">
              Drop your study material and get instant quizzes, summaries, and slide decks.
            </p>
            
            <div className="inline-flex items-center px-5 py-2.5 text-xs font-black tracking-widest uppercase text-slate-950 bg-emerald-500 rounded-full transition-colors group-hover:bg-emerald-400">
              Get Started <span className="ml-2">→</span>
            </div>
          </div>
        </div>
      </Link>

    </div>
  );
}