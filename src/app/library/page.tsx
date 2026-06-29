"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import { FileText, Trash2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

export default function LibraryPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("User not logged in");
        return;
      }

      // Fetch actual data from your Supabase table
      const { data, error } = await supabase
        .from('study_notes')
        .select('id, file_path, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setNotes(data);
      }
    } catch (err) {
      console.error("Error fetching library:", err);
    } finally {
      // This guarantees the spinner stops even if there's no data!
      setLoading(false); 
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevents Next.js from navigating to the lesson page
    e.stopPropagation(); // Prevents the click from bubbling up
    
    // 1. Delete from Supabase Database
    const { error } = await supabase.from('study_notes').delete().eq('id', id);
    
    if (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete the document.");
      return;
    }

    // 2. Remove from Local Screen State only AFTER database confirms deletion
    setNotes(notes.filter(note => note.id !== id));
  };

  const getCleanTitle = (path: string) => {
    const parts = path.split('_');
    const fileName = parts.slice(1).join('_'); 
    return fileName.replace('.pdf', '') || "Study Material";
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-slate-950 px-6 pt-12 pb-24 transition-colors duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Library</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All your processed study materials</p>
      </div>

      {loading ? (
        <div className="flex flex-col space-y-4">
          {/* Render 4 ghost cards to mimic the real library */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
              <div className="flex items-center space-x-4 w-full">
                <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                <div className="flex flex-col space-y-2 w-full max-w-[200px]">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
          No study materials yet. Go to Upload!
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {notes.map((note) => (
            <Link href={`/library/${note.id}`} key={note.id}>
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center text-violet-500 dark:text-violet-400 transition-colors">
                    <FileText size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-slate-50 text-sm truncate max-w-[180px]">
                      {getCleanTitle(note.file_path)}
                    </span>
                    <div className="flex items-center mt-1">
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors">
                        Ready
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDelete(note.id, e)}
                  className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors z-10"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}