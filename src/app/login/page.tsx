"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { LogIn, AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // Force dark mode for a premium login experience
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      const savedTheme = localStorage.getItem('theme') || 'system';
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isActuallyDark = savedTheme === 'dark' || (savedTheme === 'system' && systemPrefersDark);
      if (!isActuallyDark) {
        document.documentElement.classList.remove('dark');
      }
    };
  }, []);

  // BOUNCER: If they are somehow already logged in, push them back to the app
  useEffect(() => {
    if (!supabase) return;
    const checkSession = async () => {
      const { data: { session } } = await supabase!.auth.getSession();
      if (session) {
        router.push('/');
      }
    };
    checkSession();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("Supabase is not configured. Please add your environment variables.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Register a new user
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // On success, switch to login view so they can sign in
        setIsSignUp(false);
        alert("Account created! Please log in.");
      } else {
        // Log in an existing user
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Redirect straight to the main app dashboard!
        router.push("/home");
      }
    } catch (err: any) {
      const message = err?.message || 'Unable to authenticate. Please check your Supabase configuration.';
      setError(
        message.includes('Invalid API key')
          ? `${message} — verify NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart the dev server.`
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-background relative animate-in fade-in duration-500">
      
      {/* Back to App Button */}
      <button 
        onClick={() => router.push('/')}
        className="absolute top-8 left-8 lg:top-12 lg:left-12 flex items-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
      >
        <ArrowLeft size={14} className="mr-2" /> Back to App
      </button>

      {/* Branding Header */}
      <div className="flex flex-col items-center space-y-4 mb-8 text-center">
        <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg">
          <LogIn size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isSignUp ? "Create an account to start studying." : "Log in to your account."}
          </p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-sm p-6 bg-card border border-border rounded-3xl shadow-xl">
        <form onSubmit={handleAuth} className="space-y-4">
          
          {error && (
            <div className="flex items-center space-x-2 p-3 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all text-foreground"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all text-foreground"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center justify-center w-full py-3 mt-2 space-x-2 font-bold text-background bg-foreground rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>{isSignUp ? "Create Account" : "Log in"}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? "Already have an account? Log in" : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
      
    </div>
  );
}
