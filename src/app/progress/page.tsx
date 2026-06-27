"use client";

import { TrendingUp, Target, Clock, AlertCircle } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

// Empty chart data for realistic zero-state
const chartData = [
  { subject: "Core Concepts", score: 0 },
  { subject: "Theory", score: 0 },
  { subject: "Application", score: 0 },
  { subject: "Definitions", score: 0 },
];

export default function ProgressPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 px-6 pt-12 pb-24 animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Progress</h1>
        <p className="text-sm text-slate-500 mt-1">Track your study journey</p>
      </div>

      <div className="bg-violet-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden mb-4">
        <div className="flex flex-col items-center justify-center text-center relative z-10 py-4">
          <span className="text-[10px] font-bold tracking-widest text-violet-200 uppercase mb-2">Readiness Score</span>
          <h2 className="text-6xl font-extrabold tracking-tighter mb-2">0%</h2>
          <p className="text-sm font-medium text-violet-200">Take a quiz to see your score</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <TrendingUp size={16} className="text-slate-400 mb-2" />
          <span className="text-lg font-bold text-slate-900">0%</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-1">Average</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <Target size={16} className="text-slate-400 mb-2" />
          <span className="text-lg font-bold text-slate-900">0%</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-1">Best Score</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <Clock size={16} className="text-slate-400 mb-2" />
          <span className="text-lg font-bold text-slate-900">0s</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-1">Study Time</span>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6 flex items-start space-x-3">
        <AlertCircle size={20} className="text-orange-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-orange-800">No data available yet</h3>
          <p className="text-xs font-medium text-orange-600 mt-1">
            Complete quizzes in the Library tab to start tracking your subject mastery and readiness score.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-6 opacity-50">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Subject Mastery</h3>
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} />
              <Radar name="Student" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}