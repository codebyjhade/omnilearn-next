"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft, BookOpen, BrainCircuit, Presentation, FileQuestion, Sparkles, MessageSquare, Loader2 } from "lucide-react";

export default function LessonView() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'slides' | 'exam'>('summary');

  // Quiz State
  const [quizState, setQuizState] = useState<'start' | 'playing' | 'results'>('start');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  // Slides State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Exam State & Timer Logic
  const [examState, setExamState] = useState<'start' | 'playing' | 'results'>('start');
  const [timeLeft, setTimeLeft] = useState(45 * 60); 
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examScore, setExamScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchLesson() {
      const { data: note, error } = await supabase.from('study_notes').select('*').eq('id', id).single();
      if (note) setData(note);
      setLoading(false);
    }
    fetchLesson();
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (examState === 'playing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && examState === 'playing') {
      submitExam(); // Auto-submit when time is up!
    }
    return () => clearInterval(interval);
  }, [examState, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 🔥 NEW: The Auto-Grader & Database Saver
  const submitExam = async () => {
    setIsSubmitting(true);
    let calculatedScore = 0;
    
    // Grade the exam
    data.quizzes.forEach((q: any, i: number) => {
      if (examAnswers[i] === q.correctAnswerIndex) {
        calculatedScore++;
      }
    });
    
    setExamScore(calculatedScore);
    const percentage = Math.round((calculatedScore / data.quizzes.length) * 100);

    // Save to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('quiz_scores').insert({
          user_id: user.id,
          lesson_id: id,
          score: calculatedScore,
          total_questions: data.quizzes.length,
          percentage: percentage
        });
      }
    } catch (err) {
      console.error("Failed to save score:", err);
    }

    setExamState('results');
    setIsSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-violet-600" size={32} /></div>;
  if (!data) return <div className="p-6">Lesson not found.</div>;

  const title = data.file_path.split('_').slice(1).join('_').replace('.pdf', '') || "Study Session";
  const topics = data.flashcards?.slice(0, 3).map((f: any) => f.front) || ["Study", "Review", "Notes"];

  const handleQuizAnswer = () => {
    const isCorrect = selectedAns === data.quizzes[currentQ].correctAnswerIndex;
    if (isCorrect) setScore(s => s + 1);
    
    if (currentQ < data.quizzes.length - 1) {
      setCurrentQ(q => q + 1);
      setSelectedAns(null);
    } else {
      setQuizState('results');
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 pb-24 relative">
      
      {quizState !== 'playing' && examState !== 'playing' && (
        <>
          <div className="bg-slate-50 px-6 pt-10 pb-4 sticky top-0 z-20">
            <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-slate-900 mb-4 transition-colors">
              <ArrowLeft size={16} className="mr-1" /> <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-slate-900 truncate tracking-tight">{title}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {topics.map((topic: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-violet-100/70 text-violet-600 rounded-full text-xs font-medium truncate max-w-[150px]">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="px-4 py-2 sticky top-[130px] bg-slate-50 z-10">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
              <TabButton active={activeTab === 'summary'} onClick={() => {setActiveTab('summary'); setQuizState('start'); setExamState('start');}} icon={<BookOpen size={14}/>} label="Summary" />
              <TabButton active={activeTab === 'quiz'} onClick={() => {setActiveTab('quiz'); setExamState('start');}} icon={<BrainCircuit size={14}/>} label="Quiz" />
              <TabButton active={activeTab === 'slides'} onClick={() => {setActiveTab('slides'); setQuizState('start'); setExamState('start');}} icon={<Presentation size={14}/>} label="Slides" />
              <TabButton active={activeTab === 'exam'} onClick={() => {setActiveTab('exam'); setQuizState('start'); setExamState('start'); setTimeLeft(45*60); setExamAnswers({});}} icon={<FileQuestion size={14}/>} label="Past Exam" />
            </div>
          </div>
        </>
      )}

      <div className="px-6 animate-in fade-in duration-300">
        
        {/* SUMMARY TAB */}
        {activeTab === 'summary' && quizState === 'start' && (
          <div className="space-y-6 pb-6">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <Sparkles size={14} className="text-violet-600" />
              <span>Explain Like I'm 5</span>
            </button>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-sm leading-8 text-slate-700 whitespace-pre-line">{data.summary}</p>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-6">
              <div className="flex items-center space-x-2 px-5 py-4 border-b border-slate-50">
                <MessageSquare size={16} className="text-violet-600" />
                <h3 className="text-sm font-bold text-slate-900">Ask a Question</h3>
              </div>
              <div className="p-5 flex flex-col items-center text-center space-y-4">
                <p className="text-xs text-slate-500 max-w-[200px]">Ask anything about this material — I'll guide you Socratically!</p>
                <div className="w-full flex space-x-2">
                  <input type="text" placeholder="Ask a question..." className="flex-1 bg-slate-100 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-200" />
                  <button className="bg-violet-600 text-white px-5 rounded-xl font-medium hover:bg-violet-700 transition-colors">Send</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === 'quiz' && (
          <div className="flex flex-col">
            {quizState === 'start' && (
              <div className="flex flex-col items-center justify-center text-center pt-16 space-y-6">
                <div className="w-16 h-16 bg-violet-100 rounded-3xl flex items-center justify-center text-violet-600 shadow-sm">
                  <BrainCircuit size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Ready to Quiz?</h2>
                  <p className="text-slate-500 text-sm mt-2">{data.quizzes?.length || 0} questions from your material</p>
                </div>
                <button onClick={() => setQuizState('playing')} className="w-full max-w-[250px] mt-6 py-4 bg-violet-600 text-white font-bold rounded-2xl shadow-md active:scale-[0.98] transition-transform">
                  Start Quiz
                </button>
              </div>
            )}

            {quizState === 'playing' && (
              <div className="flex flex-col animate-in slide-in-from-right-4 min-h-screen bg-slate-50 pb-20 -mx-6 px-6 pt-6">
                <div className="flex items-center justify-between mb-8">
                  <button onClick={() => setQuizState('start')} className="flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> <span className="text-sm font-medium">Exit Quiz</span>
                  </button>
                </div>
                <div className="mb-8">
                  <div className="flex justify-between text-xs font-bold text-violet-600 mb-2">
                    <span>Question {currentQ + 1} of {data.quizzes.length}</span>
                    <span>{Math.round(((currentQ) / data.quizzes.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-violet-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-300 rounded-full transition-all duration-300" style={{ width: `${((currentQ) / data.quizzes.length) * 100}%` }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">
                  {data.quizzes[currentQ].question}
                </h3>
                <div className="space-y-4 mb-8">
                  {data.quizzes[currentQ].options.map((opt: string, idx: number) => (
                    <button key={idx} onClick={() => setSelectedAns(idx)} className={`w-full text-left p-5 rounded-2xl border transition-all text-sm font-medium shadow-sm ${selectedAns === idx ? 'border-violet-600 bg-white text-slate-900 ring-1 ring-violet-600' : 'border-slate-100 bg-white text-slate-700 hover:border-violet-200'}`}>
                      <span className="font-bold mr-3 text-slate-900">{String.fromCharCode(65 + idx)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
                <button disabled={selectedAns === null} onClick={handleQuizAnswer} className="mt-auto w-full py-4 bg-violet-400 text-white font-bold rounded-2xl disabled:opacity-50 transition-colors" style={{ backgroundColor: selectedAns !== null ? '#7c3aed' : '#a78bfa' }}>
                  Confirm Answer
                </button>
              </div>
            )}

            {quizState === 'results' && (
              <div className="flex flex-col items-center justify-center text-center pt-16 space-y-6 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-4xl shadow-sm">🏆</div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Quiz Complete!</h2>
                  <p className="text-slate-500 mt-2">You scored {score} out of {data.quizzes.length}</p>
                </div>
                <button onClick={() => { setQuizState('start'); setCurrentQ(0); setScore(0); setSelectedAns(null); }} className="w-full max-w-[250px] py-4 bg-slate-200 text-slate-900 font-bold rounded-2xl hover:bg-slate-300 transition-colors mt-4">
                  Retake Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {/* SLIDES TAB */}
        {activeTab === 'slides' && data.flashcards && (
          <div className="pt-4 flex flex-col animate-in fade-in">
            <div className="flex justify-between items-center mb-4 px-1">
              <span className="text-xs font-semibold text-slate-500">Slide {currentSlide + 1} of {data.flashcards.length}</span>
              <div className="flex space-x-1">
                {data.flashcards.map((_: any, i: number) => (
                  <div key={i} className={`h-1.5 rounded-full ${i === currentSlide ? 'w-4 bg-violet-600' : 'w-1.5 bg-slate-200'}`} />
                ))}
              </div>
            </div>
            <div className="bg-violet-600 rounded-[32px] p-8 text-white shadow-lg min-h-[400px] flex flex-col relative overflow-hidden">
              <span className="text-[10px] font-bold tracking-widest text-violet-300 uppercase mb-4">Slide {currentSlide + 1}</span>
              <h2 className="text-2xl font-bold mb-8 leading-tight">{data.flashcards[currentSlide].front}</h2>
              <ul className="space-y-4 flex-1">
                <li className="flex items-start text-sm text-violet-50 leading-relaxed">
                  <span className="mr-3 mt-1.5 w-1.5 h-1.5 bg-violet-300 rounded-full shrink-0" />
                  {data.flashcards[currentSlide].back}
                </li>
              </ul>
              <div className="mt-8 bg-violet-500/50 rounded-2xl p-5 border border-violet-400/30 backdrop-blur-sm">
                <div className="flex items-center text-[10px] font-bold tracking-widest text-violet-200 uppercase mb-2">
                  <Sparkles size={12} className="mr-1.5" /> Key Takeaway
                </div>
                <p className="text-sm font-semibold leading-relaxed">Review this concept carefully as it forms the foundation for the next topic.</p>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button onClick={() => setCurrentSlide(s => Math.max(0, s - 1))} disabled={currentSlide === 0} className="flex-1 py-4 bg-white border border-slate-100 rounded-2xl text-slate-700 font-semibold disabled:opacity-50 shadow-sm">Previous</button>
              <button onClick={() => setCurrentSlide(s => Math.min(data.flashcards.length - 1, s + 1))} disabled={currentSlide === data.flashcards.length - 1} className="flex-1 py-4 bg-violet-600 rounded-2xl text-white font-semibold disabled:opacity-50 shadow-sm">Next</button>
            </div>
          </div>
        )}

        {/* EXAM TAB WITH GRADING LOGIC */}
        {activeTab === 'exam' && (
          <div className="flex flex-col">
            {examState === 'start' && (
              <div className="flex flex-col items-center justify-center text-center pt-16 space-y-6 animate-in fade-in">
                 <div className="w-16 h-16 bg-orange-50 rounded-3xl flex items-center justify-center text-orange-500 shadow-sm">
                   <FileQuestion size={32} />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-slate-900">Past Exam Practice</h2>
                   <p className="text-slate-500 text-sm mt-2">{data.quizzes?.length || 0} simulated exam questions</p>
                 </div>
                 <button onClick={() => setExamState('playing')} className="w-full max-w-[250px] mt-6 py-4 bg-[#ea580c] text-white font-bold rounded-2xl shadow-md active:scale-[0.98] transition-transform hover:bg-[#c2410c]">
                   Practice Now
                 </button>
              </div>
            )}

            {examState === 'playing' && (
              <div className="flex flex-col animate-in slide-in-from-bottom-4 min-h-screen bg-slate-50 pb-20 -mx-6 px-6 pt-6">
                
                <div className="flex items-center justify-between mb-8">
                  <button onClick={() => setExamState('start')} className="flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> <span className="text-sm font-medium">Exit Exam</span>
                  </button>
                  <span className="text-xs font-bold px-4 py-2 bg-white text-orange-600 rounded-full shadow-sm border border-orange-100">
                    ⏱ {formatTime(timeLeft)}
                  </span>
                </div>
                
                <div className="space-y-6">
                  {data.quizzes.map((q: any, i: number) => (
                     <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                       <p className="font-bold text-slate-900 mb-5 leading-relaxed">
                         <span className="text-orange-500 mr-2">{i + 1}.</span> 
                         {q.question}
                       </p>
                       <div className="space-y-3">
                         {q.options.map((opt: string, j: number) => (
                           <label key={j} className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer transition-colors ${examAnswers[i] === j ? 'border-orange-500 bg-orange-50' : 'border-slate-100 bg-slate-50 hover:border-orange-200'}`}>
                             <input 
                               type="radio" 
                               name={`question-${i}`} 
                               checked={examAnswers[i] === j}
                               onChange={() => setExamAnswers(prev => ({ ...prev, [i]: j }))}
                               className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-slate-300" 
                             />
                             <span className="text-sm font-medium text-slate-700">{opt}</span>
                           </label>
                         ))}
                       </div>
                     </div>
                  ))}
                </div>

                <button 
                  onClick={submitExam} 
                  disabled={isSubmitting || Object.keys(examAnswers).length < data.quizzes.length}
                  className="w-full mt-8 py-4 bg-[#ea580c] text-white font-bold rounded-2xl shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:bg-slate-300 flex justify-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Submit Exam"}
                </button>
                {Object.keys(examAnswers).length < data.quizzes.length && (
                  <p className="text-xs text-center text-slate-400 mt-3 font-medium">Please answer all questions to submit.</p>
                )}
              </div>
            )}

            {/* NEW: Exam Results Screen */}
            {examState === 'results' && (
              <div className="flex flex-col items-center justify-center text-center pt-16 space-y-6 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-4xl shadow-sm">🎯</div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Exam Graded!</h2>
                  <p className="text-slate-500 mt-2">
                    You scored <strong className="text-orange-600">{examScore}</strong> out of {data.quizzes.length}
                  </p>
                  <p className="text-3xl font-black text-slate-900 mt-4">
                    {Math.round((examScore / data.quizzes.length) * 100)}%
                  </p>
                </div>
                
                <div className="w-full max-w-[250px] space-y-3 mt-6">
                  <button onClick={() => router.push('/progress')} className="w-full py-4 bg-[#ea580c] text-white font-bold rounded-2xl shadow-md hover:bg-[#c2410c] transition-colors">
                    View Progress
                  </button>
                  <button onClick={() => { setExamState('start'); setTimeLeft(45*60); setExamAnswers({}); }} className="w-full py-4 bg-slate-200 text-slate-900 font-bold rounded-2xl hover:bg-slate-300 transition-colors">
                    Retake Exam
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
        active ? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-slate-100' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}