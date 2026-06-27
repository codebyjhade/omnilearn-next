"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { UploadCloud, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [username, setUsername] = useState<string>("Loading...");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        // Extract the part of the email before the '@' symbol to use as a username
        const name = user.email.split('@')[0];
        setUsername(name);
      } else {
        setUsername("Student"); // Fallback just in case
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col w-full px-6 pt-12 pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Dynamic Greeting Section */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-2xl font-bold tracking-tight">{username} 👋</h1>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center justify-center p-4 space-y-1 bg-card border border-border/50 rounded-2xl shadow-sm">
          <span className="text-xl font-bold text-primary">1</span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Documents</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 space-y-1 bg-card border border-border/50 rounded-2xl shadow-sm">
          <span className="text-xl font-bold text-primary">1</span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quizzes</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 space-y-1 bg-card border border-border/50 rounded-2xl shadow-sm">
          <span className="text-xl font-bold text-orange-500">100%</span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Avg Score</span>
        </div>
      </div>

      {/* Primary Upload CTA */}
      <Link href="/upload" className="block">
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-purple-800 rounded-3xl p-6 text-white shadow-md transition-transform active:scale-[0.98]">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Sparkles size={80} />
          </div>
          <UploadCloud size={28} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Upload a PDF</h2>
          <p className="text-sm text-purple-200 mb-6 max-w-[80%]">
            Drop your study material and get instant quizzes, summaries, and slide decks.
          </p>
          <div className="inline-flex items-center px-4 py-2 text-sm font-semibold text-purple-900 bg-white rounded-full">
            Get Started <span className="ml-2">→</span>
          </div>
        </div>
      </Link>

    </div>
  );
}