"use client";

import { User, Shield, Bell, LogOut, BookOpen, BrainCircuit, Target } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // <--- ADD THIS LINE

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [docCount, setDocCount] = useState(0);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [notificationsOn, setNotificationsOn] = useState(false);

  useEffect(() => {
    async function loadRealUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 🔥 THE GUARD: If no user is logged in, kick them to the login page
      if (!user) {
        router.push("/");
        return;
      }

      // If they are logged in, load their real data
      setEmail(user.email || "");
      setUsername(user.email?.split('@')[0] || "Student");
      
      const { count } = await supabase
        .from('study_notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      setDocCount(count || 0);
      setIsAuthLoading(false); // Turn off the loading screen
    }
    loadRealUserData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/"); 
  };

  // Show a clean spinner while verifying the login session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 px-6 pt-12 pb-24 animate-in fade-in duration-300">
      
      <div className="flex flex-col items-center justify-center pt-6 mb-8">
        <div className="w-24 h-24 bg-violet-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4 uppercase">
          {username.charAt(0)}
        </div>
        <h2 className="text-xl font-bold text-slate-900">{username}</h2>
        <p className="text-sm text-slate-500 mt-1">{email}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <BookOpen size={16} className="text-violet-500 mb-2" />
          <span className="text-lg font-bold text-slate-900">{docCount}</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-1">Documents</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <BrainCircuit size={16} className="text-emerald-500 mb-2" />
          <span className="text-lg font-bold text-slate-900">0</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-1">Quizzes</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <Target size={16} className="text-orange-500 mb-2" />
          <span className="text-lg font-bold text-slate-900">0%</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-1">Avg Score</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 px-2">Account</h3>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex items-center space-x-4 p-5 border-b border-slate-50">
            <User size={20} className="text-slate-400" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">Name</span>
              <span className="text-xs text-slate-500">{username}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-5 border-b border-slate-50">
            <Shield size={20} className="text-slate-400" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">Email</span>
              <span className="text-xs text-slate-500">{email}</span>
            </div>
          </div>
        </div>
      </div>

{/* Notifications */}
      <div className="mb-8">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 px-2">Notifications</h3>
        {/* Wrap in a Link to make it functional */}
        <Link href="/progress" className="block bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:border-violet-200 transition-colors">
          <div className="flex items-center space-x-4 p-5">
            <Bell size={20} className="text-slate-500" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">Daily Practice Reminders</span>
              <span className="text-xs text-slate-500">Not set up yet — go to Progress tab</span>
            </div>
          </div>
        </Link>
      </div>

      <button 
        onClick={handleSignOut}
        className="flex items-center justify-center space-x-3 p-5 bg-white border border-red-100 rounded-3xl w-full shadow-sm hover:bg-red-50 transition-colors"
      >
        <LogOut size={20} className="text-red-500" />
        <span className="text-sm font-bold text-red-600">Sign Out</span>
      </button>

    </div>
  );
}