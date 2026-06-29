"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useUpload } from "../../context/UploadContext";
import { UploadCloud, FileText, AlertCircle, X } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();
  
  // Connect to our new Global Upload Manager
  const { startUpload, updateProgress, finishUpload, isUploading } = useUpload();

  useEffect(() => {
    // Check if they are a real user or a guest when they enter the upload room
    const checkUser = async () => {
      if (!supabase) { setIsGuest(true); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsGuest(true);
      }
    };
    checkUser();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError("Only PDF files are supported at this time.");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be under 10MB.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    // THE TRAPDOOR: If they are a guest, stop the AI and send them to log in!
    if (isGuest) {
      router.push('/login');
      return; // Stops the rest of the function from running
    }

    try {
      setError(null);
      if (!supabase) throw new Error("Supabase is not configured.");
      
      // 1. Trigger the Global Widget
      startUpload();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication error");

      // 2. Upload to Supabase Storage
      updateProgress(20, "Encrypting & uploading to server...");
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const filePath = `${user.id}/${Date.now()}_${cleanFileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('study_materials')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;

      // 3. Trigger Gemini AI Backend
      updateProgress(60, "AI is reading and extracting data...");
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });

      if (!response.ok) throw new Error('AI generation failed');

      // 4. Success!
      updateProgress(100, "Study Kit ready! Redirecting...");
      
      setTimeout(() => {
        finishUpload();
        setFile(null);
        router.push('/library');
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process the document.");
      finishUpload(); // Kill the global widget on error
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 md:pt-20 pb-24 md:pb-8">
    <div className="flex flex-col w-full">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Upload</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Transform any PDF into an interactive study session.</p>
      </div>

      <div className="flex-1 flex flex-col">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-start space-x-3 text-red-600 dark:text-red-400 animate-in fade-in transition-colors">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span className="text-sm font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {!file ? (
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-10 py-20 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group relative cursor-pointer">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-20 h-20 bg-violet-50 dark:bg-violet-900/20 rounded-full flex items-center justify-center text-violet-500 dark:text-violet-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Tap or Drag a PDF</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium max-w-[200px] leading-relaxed">
              Max file size 10MB. We'll handle the rest.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-sm animate-in zoom-in-95 duration-300 transition-colors">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-14 h-14 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0 transition-colors">
                <FileText size={24} />
              </div>
              <div className="flex flex-col flex-1 truncate">
                <span className="font-bold text-slate-900 dark:text-slate-50 truncate">{file.name}</span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                </span>
              </div>
              {!isUploading && (
                <button onClick={() => setFile(null)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            <button 
              onClick={handleUpload} 
              disabled={isUploading}
              className="w-full py-5 bg-violet-600 dark:bg-violet-700 text-white font-bold rounded-2xl shadow-md hover:bg-violet-700 dark:hover:bg-violet-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              {isUploading ? "Processing in background..." : "Generate Study Kit"}
            </button>
            
            {isUploading && (
               <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-4 font-medium">
                 You can safely navigate away. We'll notify you when it's ready!
               </p>
            )}
          </div>
        )}
      </div>
    </div>
    </main>
  );
}
