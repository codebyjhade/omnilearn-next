"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import { FileText, Trash2, Loader2 } from "lucide-react";

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

  const deleteNote = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); 
    const confirm = window.confirm("Delete this study material?");
    if (!confirm) return;

    await supabase.from('study_notes').delete().eq('id', id);
    setNotes(notes.filter(n => n.id !== id));
  };

  const getCleanTitle = (path: string) => {
    const parts = path.split('_');
    const fileName = parts.slice(1).join('_'); 
    return fileName.replace('.pdf', '') || "Study Material";
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 px-6 pt-12 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Library</h1>
        <p className="text-sm text-slate-500 mt-1">All your processed study materials</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-violet-600" size={32} /></div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No study materials yet. Go to Upload!</div>
      ) : (
        <div className="flex flex-col space-y-4">
          {notes.map((note) => (
            <Link href={`/library/${note.id}`} key={note.id}>
              <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-500">
                    <FileText size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-sm truncate max-w-[180px]">
                      {getCleanTitle(note.file_path)}
                    </span>
                    <div className="flex items-center mt-1">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        Ready
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => deleteNote(note.id, e)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors z-10"
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