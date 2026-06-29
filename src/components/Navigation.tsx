"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Upload, BookOpen, BarChart2, User } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";

export default function Navigation() {
  const pathname = usePathname();

  // Hide navigation entirely on the login screen
  if (pathname === "/") return null;

  const navItems = [
    { name: "Home", path: "/home", icon: Home },
    { name: "Upload", path: "/upload", icon: Upload },
    { name: "Library", path: "/library", icon: BookOpen },
    { name: "Progress", path: "/progress", icon: BarChart2 },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <>
      {/* ================= DESKTOP TOP NAVIGATION ================= */}
      <div className="hidden md:flex fixed top-0 w-full bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 px-8 py-4 z-50 justify-between items-center shadow-sm transition-colors duration-300">
        <div className="flex items-center space-x-2">
          {/* 🔥 Your Custom Logo */}
          <Image 
            src="/OmniLearn.jpg" 
            alt="OmniLearn Logo" 
            width={32} 
            height={32} 
            className="rounded-lg object-cover"
            priority // 🔥 This fixes the warning!
          />
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-50">OmniLearn</span>
        </div>
        
        <div className="flex items-center space-x-8">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (pathname === '/' && item.path === '/home');
              const Icon = item.icon;
              return (
                <Link href={item.path} key={item.name} className="flex items-center space-x-2 group">
                  <Icon size={18} className={`transition-colors duration-200 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-violet-400 dark:group-hover:text-violet-300'}`} />
                  <span className={`text-sm font-bold transition-colors duration-200 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-violet-500 dark:group-hover:text-violet-300'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
          
          {/* Divider and Theme Toggle */}
          <div className="pl-6 border-l border-slate-200 dark:border-slate-800 flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ================= MOBILE TOP HEADER (For Logo & Theme Toggle) ================= */}
      <div className="md:hidden fixed top-0 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-50 transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <Image 
            src="/OmniLearn.jpg" 
            alt="OmniLearn Logo" 
            width={28} 
            height={28} 
            className="rounded-lg object-cover"
          />
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-50">OmniLearn</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Invisible spacer to prevent mobile content from hiding under the new top header */}
      <div className="md:hidden h-16 w-full" />

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <div className="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] dark:shadow-none transition-colors duration-300">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (pathname === '/' && item.path === '/home');
          const Icon = item.icon;
          return (
            <Link href={item.path} key={item.name} className="flex flex-col items-center gap-1 relative w-12">
              {/* Active Indicator Dot */}
              {isActive && (
                <span className="absolute -top-3 w-1 h-1 bg-violet-600 dark:bg-violet-400 rounded-full" />
              )}
              <Icon size={22} className={`transition-colors duration-200 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className={`text-[10px] font-bold transition-colors duration-200 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}