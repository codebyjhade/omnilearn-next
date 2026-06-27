"use client";

import { useState } from "react";
import { Upload, FileText, Sparkles, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<'idle' | 'uploading' | 'analyzing' | 'done'>('idle');
  const router = useRouter();

  // 🔥 THE GUARD: Check login status on page load
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/"); // Kick unauthenticated users out
      }
    }
    checkAuth();
  }, [router]); 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      // Step 1: Uploading to Supabase
      setUploadStep('uploading');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in first.");

      const safeFileName = selectedFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const filePath = `${user.id}/${Date.now()}_${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('study_materials')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Step 2: AI is Analyzing
      setUploadStep('analyzing');
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });

      if (!response.ok) throw new Error('AI generation failed');

      // Step 3: Done!
      setUploadStep('done');
      
      // Give the user 1.5 seconds to see the "100% Complete" state, then redirect to the lesson view
      setTimeout(() => {
        router.push('/library'); // We will build the exact lesson view next!
      }, 1500);

    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to process file.');
      setUploadStep('idle');
    }
  };

  // Helper to format file size
  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-slate-50 px-6 pt-12 pb-24">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Upload Material</h1>
        <p className="text-sm text-slate-500 mt-1">
          Drop a PDF and let AI create your study kit
        </p>
      </div>

      {uploadStep === 'idle' ? (
        <div className="animate-in fade-in duration-300 flex flex-col space-y-6">
          
          {/* Dashed Upload Area */}
          <div className="relative flex flex-col items-center justify-center w-full py-12 border-2 border-dashed border-violet-200 rounded-3xl bg-white hover:bg-violet-50/50 transition-colors">
            <input 
              type="file" 
              accept=".pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 mb-4 shadow-sm">
                <Upload size={24} strokeWidth={2.5} />
              </div>
              {!selectedFile ? (
                <>
                  <p className="font-semibold text-slate-700">Select a file</p>
                  <p className="text-xs text-slate-400 mt-1">PDF up to 10MB</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-900 truncate max-w-[200px]">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatSize(selectedFile.size)} MB</p>
                </>
              )}
            </div>
          </div>

          {/* Selected File Card & Button */}
          {selectedFile && (
            <div className="flex flex-col space-y-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center space-x-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="text-violet-600">
                  <FileText size={28} strokeWidth={2} />
                </div>
                <div className="flex-1 truncate">
                  <p className="text-sm font-semibold text-slate-900 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{formatSize(selectedFile.size)} MB</p>
                </div>
              </div>

              <button 
                onClick={handleUpload}
                className="flex items-center justify-center w-full py-4 space-x-2 font-semibold text-white bg-violet-600 rounded-2xl shadow-md hover:bg-violet-700 transition-all active:scale-[0.98]"
              >
                <Sparkles size={20} />
                <span>Generate Study Kit</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Progress State UI */
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm animate-in zoom-in-95 duration-300">
          <div className="space-y-6">
            
            {/* Step 1: Uploading */}
            <div className="flex items-center space-x-4">
              {uploadStep === 'uploading' ? (
                <Loader2 className="text-violet-600 animate-spin" size={24} />
              ) : (
                <CheckCircle2 className="text-emerald-500" size={24} />
              )}
              <span className={`text-sm font-medium ${uploadStep === 'uploading' ? 'text-slate-900' : 'text-slate-500'}`}>
                Uploading PDF...
              </span>
            </div>

            {/* Step 2: Analyzing */}
            <div className="flex items-center space-x-4">
              {uploadStep === 'uploading' ? (
                <Circle className="text-slate-200" size={24} />
              ) : uploadStep === 'analyzing' ? (
                <Loader2 className="text-violet-600 animate-spin" size={24} />
              ) : (
                <CheckCircle2 className="text-emerald-500" size={24} />
              )}
              <span className={`text-sm font-medium ${uploadStep === 'analyzing' ? 'text-slate-900' : 'text-slate-400'}`}>
                AI is analyzing your material...
              </span>
            </div>

            {/* Step 3: Done */}
            <div className="flex items-center space-x-4">
              {uploadStep === 'done' ? (
                <CheckCircle2 className="text-emerald-500" size={24} />
              ) : (
                <Circle className="text-slate-200" size={24} />
              )}
              <span className={`text-sm font-medium ${uploadStep === 'done' ? 'text-slate-900' : 'text-slate-400'}`}>
                All study assets ready!
              </span>
            </div>

            {/* Progress Bar */}
            <div className="pt-4 space-y-2">
              <div className="w-full h-2.5 bg-violet-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet-600 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: uploadStep === 'uploading' ? '33%' : 
                           uploadStep === 'analyzing' ? '66%' : '100%' 
                  }}
                />
              </div>
              <p className="text-xs text-center text-slate-500 font-medium">
                {uploadStep === 'uploading' ? '33% complete' : 
                 uploadStep === 'analyzing' ? '66% complete' : '100% complete'}
              </p>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}