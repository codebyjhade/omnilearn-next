"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Target, Clock, AlertCircle } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";

// Empty chart data for realistic zero-state
const chartData = [
  { subject: "Core Concepts", score: 0 },
  { subject: "Theory", score: 0 },
  { subject: "Application", score: 0 },
  { subject: "Definitions", score: 0 },
];

export default function ProgressPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for the Recharts SVG colors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic colors for the Radar Chart lines
  const gridStroke = mounted && resolvedTheme === 'dark' ? '#1e293b' : '#f1f5f9';
  const tickFill = mounted && resolvedTheme === 'dark' ? '#94a3b8' : '#64748b';

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 md:pt-20 pb-24 md:pb-8">
    <div className="flex flex-col w-full">
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm transition-colors">
          <TrendingUp size={16} className="text-slate-400 dark:text-slate-500 mb-2" />
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">0%</span>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">Average</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm transition-colors">
          <Target size={16} className="text-slate-400 dark:text-slate-500 mb-2" />
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">0%</span>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">Best Score</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-sm transition-colors">
          <Clock size={16} className="text-slate-400 dark:text-slate-500 mb-2" />
          <span className="text-lg font-bold text-slate-900 dark:text-slate-50">0s</span>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">Study Time</span>
        </div>
      </div>

      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-5 mb-6 flex items-start space-x-3 transition-colors">
        <AlertCircle size={20} className="text-orange-500 dark:text-orange-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-orange-800 dark:text-orange-400">No data available yet</h3>
          <p className="text-xs font-medium text-orange-600 dark:text-orange-500/80 mt-1">
            Complete quizzes in the Library tab to start tracking your subject mastery and readiness score.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-6 opacity-50 transition-colors">
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
    </main>
  );
}
