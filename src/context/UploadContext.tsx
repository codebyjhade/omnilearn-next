"use client";

import React, { createContext, useContext, useState } from 'react';

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

  const startUpload = () => { setIsUploading(true); setUploadProgress(0); setUploadText("Initializing..."); };
  const updateProgress = (p: number, t: string) => { setUploadProgress(p); setUploadText(t); };
  const finishUpload = () => { setIsUploading(false); setUploadProgress(0); setUploadText(""); };

  return (
    <UploadContext.Provider value={{ isUploading, uploadProgress, uploadText, startUpload, updateProgress, finishUpload }}>
      {children}
      
      {/* THE GLOBAL FLOATING WIDGET - Now with Dark Mode support! */}
      {isUploading && (
        <div className="fixed bottom-24 md:bottom-6 right-6 left-6 md:left-auto md:w-80 bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-2xl border border-violet-100 dark:border-slate-800 z-[9999] animate-in slide-in-from-bottom-5 transition-colors duration-300">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">AI Generation</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-100">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2 transition-colors duration-300">
            <div className="h-full bg-violet-600 dark:bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{uploadText}</p>
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