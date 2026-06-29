"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Upload, BookOpen, BarChart2, User } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { name: "Home",     path: "/home",     icon: Home },
  { name: "Upload",   path: "/upload",   icon: Upload },
  { name: "Library",  path: "/library",  icon: BookOpen },
  { name: "Progress", path: "/progress", icon: BarChart2 },
  { name: "Profile",  path: "/profile",  icon: User },
] as const;

export default function Navigation() {
  const pathname = usePathname();

  // Hide navigation entirely on the landing / login screens
  if (pathname === "/" || pathname === "/login") return null;

  return (
    <>
      {/* ── DESKTOP HEADER ─────────────────────────────────────────────────── */}
      <header className="hidden md:block fixed top-0 inset-x-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-50 transition-colors duration-300">
        <div className="w-full max-w-4xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo — shrink-0 prevents it from ever collapsing */}
          <Link
            href="/home"
            className="flex items-center gap-2 shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <Image
              src="/OmniLearn.jpg"
              alt="OmniLearn"
              width={30}
              height={30}
              className="rounded-lg object-cover"
              priority
            />
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-50 leading-none">
              OmniLearn
            </span>
          </Link>

          {/* Nav links — centered via flex with auto margins */}
          <nav
            className="flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map(({ name, path, icon: Icon }) => {
              const isActive = pathname === path;
              return (
                <Link
                  key={path}
                  href={path}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold
                    transition-colors duration-200 whitespace-nowrap
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
                    ${isActive
                      ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40"
                      : "text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }
                  `}
                >
                  <Icon
                    size={16}
                    aria-hidden="true"
                    className="shrink-0"
                  />
                  {name}
                </Link>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center shrink-0">
            <ThemeToggle />
          </div>

        </div>
      </header>

      {/* ── MOBILE HEADER ──────────────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 inset-x-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-50 transition-colors duration-300">
        <div className="px-5 h-14 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 focus:outline-none">
            <Image
              src="/OmniLearn.jpg"
              alt="OmniLearn"
              width={28}
              height={28}
              className="rounded-lg object-cover"
            />
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-50 leading-none">
              OmniLearn
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Spacer — pushes page content below the fixed mobile header */}
      <div className="md:hidden h-14 shrink-0" aria-hidden="true" />

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-around items-center z-50 transition-colors duration-300"
        aria-label="Main navigation"
        style={{ paddingTop: "0.5rem", paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {NAV_ITEMS.map(({ name, path, icon: Icon }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              href={path}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-[3rem] focus:outline-none"
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  size={22}
                  aria-hidden="true"
                  className={`transition-colors duration-200 ${
                    isActive
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                />
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-violet-600 dark:bg-violet-400 rounded-full"
                    aria-hidden="true"
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-bold transition-colors duration-200 ${
                  isActive
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
