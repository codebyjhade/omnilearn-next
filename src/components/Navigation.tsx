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
      <header className="hidden md:block fixed top-0 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-50 shadow-sm transition-colors duration-300">
        <div className="w-full max-w-5xl mx-auto px-8 h-16 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg">
            <Image
              src="/OmniLearn.jpg"
              alt="OmniLearn Logo"
              width={32}
              height={32}
              className="rounded-lg object-cover"
              priority
            />
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-50">
              OmniLearn
            </span>
          </Link>

          {/* Center nav links */}
          <nav className="flex items-center gap-6" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  href={item.path}
                  key={item.name}
                  aria-current={isActive ? "page" : undefined}
                  className="flex items-center gap-1.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
                >
                  <Icon
                    size={18}
                    aria-hidden="true"
                    className={`transition-colors duration-200 ${
                      isActive
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-violet-400 dark:group-hover:text-violet-300"
                    }`}
                  />
                  <span
                    className={`text-sm font-bold transition-colors duration-200 ${
                      isActive
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-slate-500 dark:text-slate-400 group-hover:text-violet-500 dark:group-hover:text-violet-300"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right-side controls */}
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ================= MOBILE TOP HEADER ================= */}
      <header className="md:hidden fixed top-0 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-50 transition-colors duration-300">
        <div className="px-6 h-16 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 focus:outline-none">
            <Image
              src="/OmniLearn.jpg"
              alt="OmniLearn Logo"
              width={28}
              height={28}
              className="rounded-lg object-cover"
            />
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-50">
              OmniLearn
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Spacer — prevents content from hiding under the fixed header */}
      <div className="md:hidden h-16 w-full" aria-hidden="true" />

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav
        className="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-around items-center z-50 transition-colors duration-300 px-2"
        aria-label="Bottom navigation"
        style={{ paddingTop: "0.5rem", paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              href={item.path}
              key={item.name}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[52px] focus:outline-none"
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  size={22}
                  aria-hidden="true"
                  className={`transition-colors duration-200 ${isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"}`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-violet-600 dark:bg-violet-400 rounded-full" aria-hidden="true" />
                )}
              </div>
              <span className={`text-[10px] font-bold transition-colors duration-200 ${isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
