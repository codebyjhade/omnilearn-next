"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Loader2 } from "lucide-react";

type UploadContextType = {
  isUploading: boolean;
  uploadProgress: number;
  uploadText: string;
  startUpload: () => void;
  updateProgress: (progress: number, text: string) => void;
  finishUpload: () => void;
};

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadText, setUploadText] = useState("");
  const [targetProgress, setTargetProgress] = useState(0);

  // Smooth generation progression ticker to eliminate 'frozen loader' anxiety
  useEffect(() => {
    if (!isUploading) return;
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev < targetProgress) {
          return prev + 1;
        }
        // Hold at 85% during active AI generation until API responds and updates targets
        if (prev >= 85 && targetProgress < 90) {
          return prev;
        }
        return prev;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isUploading, targetProgress]);

  const startUpload = () => { 
    setIsUploading(true); 
    setUploadProgress(0); 
    setTargetProgress(10);
    setUploadText("Initializing study assets..."); 
  };

  const updateProgress = (p: number, t: string) => { 
    setTargetProgress(p); 
    setUploadText(t); 
    if (p === 100 || p === 0) {
      setUploadProgress(p);
    }
  };

  const finishUpload = () => { 
    setIsUploading(false); 
    setUploadProgress(0); 
    setTargetProgress(0);
    setUploadText(""); 
  };

  return (
    <UploadContext.Provider value={{ isUploading, uploadProgress, uploadText, startUpload, updateProgress, finishUpload }}>
      {children}
      
      {/* THE GLOBAL FLOATING PROGRESS WIDGET - SaaS Stepper */}
      {isUploading && (
        <div className="fixed bottom-24 md:bottom-6 right-6 left-6 md:left-auto md:w-80 bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-2xl border border-violet-100 dark:border-slate-800/80 z-[9999] animate-in slide-in-from-bottom-5 transition-colors duration-300">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">AI Ingestion</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-100">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800/65 rounded-full overflow-hidden mb-3 transition-colors duration-300">
            <div className="h-full bg-violet-600 dark:bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mb-3 tracking-wide">{uploadText}</p>
          
          <hr className="border-slate-100 dark:border-slate-800/60 mb-3" />

          {/* Step List Checklist */}
          <div className="space-y-2.5">
            {[
              { label: "Uploading study materials", threshold: 40 },
              { label: "AI parsing & key concept extraction", threshold: 70 },
              { label: "Compiling interactive quiz suite", threshold: 90 },
              { label: "Finalizing study suite dashboard", threshold: 100 }
            ].map((step, idx) => {
              const isCompleted = uploadProgress >= step.threshold;
              const thresholds = [40, 70, 90, 100];
              const prevThreshold = idx > 0 ? thresholds[idx - 1] : 0;
              const isActive = !isCompleted && uploadProgress >= prevThreshold;
              
              let icon = <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />;
              let textStyle = "text-slate-400 dark:text-slate-500";

              if (isCompleted) {
                icon = <span className="text-emerald-500 font-bold shrink-0">✓</span>;
                textStyle = "text-slate-400 dark:text-slate-500 line-through decoration-slate-200 dark:decoration-slate-800/50";
              } else if (isActive) {
                icon = <Loader2 size={12} className="animate-spin text-violet-500 shrink-0" />;
                textStyle = "text-slate-800 dark:text-slate-200 font-semibold";
              }

              return (
                <div key={idx} className="flex items-center space-x-2.5 text-xs transition-colors duration-300">
                  <div className="w-4 h-4 flex items-center justify-center">
                    {icon}
                  </div>
                  <span className={`${textStyle} transition-colors duration-300`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </UploadContext.Provider>
  );
}

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) throw new Error("useUpload must be used within UploadProvider");
  return context;
};