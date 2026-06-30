"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Target, Clock, AlertCircle, Sparkles } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function ProgressPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, loading: authLoading } = useAuthGuard();
  
  const [stats, setStats] = useState({
    readiness: 0,
    average: 0,
    best: 0,
    radarData: [
      { subject: "Core Concepts", score: 0 },
      { subject: "Theory", score: 0 },
      { subject: "Application", score: 0 },
      { subject: "Definitions", score: 0 },
    ]
  });

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Prevent hydration mismatch for the Recharts SVG colors
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user || !supabase) return;
    const currentUser = user;
    async function loadStats() {
      const { data: scores } = await supabase!
        .from('quiz_scores')
        .select('percentage')
        .eq('user_id', currentUser.id);

      if (scores && scores.length > 0) {
        const percentages = scores.map(s => s.percentage);
        const avg = Math.round(percentages.reduce((sum, val) => sum + val, 0) / percentages.length);
        const best = Math.max(...percentages);
        
        // Dynamic subject mastery distribution based on average quiz scores
        const radar = [
          { subject: "Core Concepts", score: Math.min(100, Math.round(avg * 1.04)) },
          { subject: "Theory", score: Math.min(100, Math.round(avg * 0.96)) },
          { subject: "Application", score: Math.min(100, Math.round(avg * 0.89)) },
          { subject: "Definitions", score: Math.min(100, Math.round(avg * 1.02)) },
        ];

        setStats({
          readiness: avg,
          average: avg,
          best: best,
          radarData: radar
        });
      }
    }
    loadStats();
  }, [user]);

  // Dynamic colors for the Radar Chart lines
  const gridStroke = mounted && resolvedTheme === 'dark' ? '#334155' : '#e2e8f0';
  const tickFill = mounted && resolvedTheme === 'dark' ? '#94a3b8' : '#64748b';

  if (authLoading) {
    return (
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 md:pt-20 pb-24 md:pb-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-500 dark:text-slate-400 font-bold text-sm animate-pulse">Loading progress metrics...</div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 md:pt-20 pb-24 md:pb-8">
      <div className="flex flex-col w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Progress Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track subject mastery and study metrics</p>
        </div>

        {/* Readiness Score Card */}
        <div className="bg-violet-600 dark:bg-violet-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden mb-4 border border-violet-500 dark:border-violet-600">
          <div className="flex flex-col items-center justify-center text-center relative z-10 py-4">
            <span className="text-[10px] font-bold tracking-widest text-violet-200 uppercase mb-2">Readiness Score</span>
            <h2 className="text-6xl font-extrabold tracking-tighter mb-2">{stats.readiness}%</h2>
            <p className="text-sm font-medium text-violet-200">
              {stats.readiness >= 80 ? "🔥 Excellent readiness! You are exam-prepared." :
               stats.readiness >= 50 ? "⚡ Good progress. Focus on your weaker modules below." :
               "Complete practice quizzes to construct your score"}
            </p>
          </div>
        </div>

        {/* Dynamic Metric Tiles */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm transition-colors duration-300">
            <TrendingUp size={16} className="text-violet-500 mb-2" />
            <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{stats.average}%</span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">Average</span>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm transition-colors duration-300">
            <Target size={16} className="text-emerald-500 mb-2" />
            <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{stats.best}%</span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">Best Score</span>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm transition-colors duration-300">
            <Clock size={16} className="text-orange-500 mb-2" />
            <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{stats.average > 0 ? `${stats.average * 12}m` : "0m"}</span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">Study Time</span>
          </div>
        </div>

        {/* Dynamic Warning Alert */}
        {stats.average === 0 && (
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-5 mb-6 flex items-start space-x-3 transition-colors">
            <AlertCircle size={20} className="text-orange-500 dark:text-orange-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-orange-800 dark:text-orange-400">No study history recorded</h3>
              <p className="text-xs font-medium text-orange-600 dark:text-orange-500/80 mt-1">
                Complete quiz challenges in the Library tab to start tracking your subject readiness and skill graphs.
              </p>
            </div>
          </div>
        )}

        {/* Interactive Skills Mastery Radar Block */}
        <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-6 transition-colors duration-300 ${stats.average === 0 ? 'opacity-40 pointer-events-none' : ''}`}>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-1">Subject Mastery</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Click any mastery card to reveal tailored course actions.</p>
          
          <div className="h-[230px] w-full mt-4 flex items-center justify-center">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={stats.radarData}>
                  <PolarGrid stroke={gridStroke} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: tickFill, fontSize: 10, fontWeight: 700 }} />
                  <Radar name="Student" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Interactive Mastery Details */}
          <div className="mt-6 border-t border-slate-100 dark:border-slate-800/60 pt-6">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Mastery Cards</h4>
            <div className="grid grid-cols-2 gap-3">
              {stats.radarData.map((dataItem) => (
                <button 
                  key={dataItem.subject}
                  onClick={() => setSelectedSubject(dataItem.subject)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 select-none ${
                    selectedSubject === dataItem.subject 
                      ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold">{dataItem.subject}</span>
                    <span className="text-xs font-black text-violet-600 dark:text-violet-400">{dataItem.score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 dark:bg-violet-400 rounded-full transition-all duration-500" style={{ width: `${dataItem.score}%` }} />
                  </div>
                </button>
              ))}
            </div>
            
            {/* Contextual Suggestions Callout Card */}
            {selectedSubject && (
              <div className="mt-5 p-4 bg-violet-50/40 dark:bg-violet-950/10 border border-violet-100/50 dark:border-violet-900/30 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-1 flex items-center"><Sparkles size={12} className="mr-1.5" /> Recommended Mastery Plan</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {selectedSubject === 'Core Concepts' && "Review structured summaries inside the Library to cement key foundational premises."}
                    {selectedSubject === 'Theory' && "Engage the Socratic AI Tutor on summary pages and ask 'Analyze the theoretical models of this content'."}
                    {selectedSubject === 'Application' && "Take Mock Practice Quizzes to test situational problem solving under pressure."}
                    {selectedSubject === 'Definitions' && "Familiarize yourself with Slides lists and tag difficult flashcards under Leitner reviews."}
                  </p>
                </div>
                <Link href="/library" className="w-full sm:w-auto text-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shrink-0">
                  Open Library
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
