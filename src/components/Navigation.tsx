"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Upload, BookOpen, BarChart2, User } from "lucide-react";
import Image from "next/image";

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
      {/* DESKTOP TOP NAVIGATION (Hidden on mobile) */}
      <div className="hidden md:flex fixed top-0 w-full bg-white border-b border-slate-100 px-8 py-4 z-50 justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
          {/* 🔥 Your Custom Logo! */}
          <Image 
            src="/OmniLearn.jpg" 
            alt="OmniLearn Logo" 
            width={32} 
            height={32} 
            className="rounded-lg object-cover"
          />
          <span className="font-extrabold text-xl tracking-tight text-slate-900">OmniLearn</span>
        </div>
        
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (pathname === '/' && item.path === '/home');
            const Icon = item.icon;
            return (
              <Link href={item.path} key={item.name} className="flex items-center space-x-2 group">
                <Icon size={18} className={`transition-colors duration-200 ${isActive ? 'text-violet-600' : 'text-slate-400 group-hover:text-violet-400'}`} />
                <span className={`text-sm font-bold transition-colors duration-200 ${isActive ? 'text-violet-600' : 'text-slate-500 group-hover:text-violet-500'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION (Hidden on desktop) */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (pathname === '/' && item.path === '/home');
          const Icon = item.icon;
          return (
            <Link href={item.path} key={item.name} className="flex flex-col items-center gap-1">
              <Icon size={22} className={`transition-colors duration-200 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-bold transition-colors duration-200 ${isActive ? 'text-violet-600' : 'text-slate-400'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}