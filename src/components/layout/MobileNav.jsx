import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Upload, BarChart3, BookOpen, UserCircle } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/upload", icon: Upload, label: "Upload" },
  { path: "/library", icon: BookOpen, label: "Library" },
  { path: "/dashboard", icon: BarChart3, label: "Progress" },
  { path: "/profile", icon: UserCircle, label: "Profile" },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] min-h-[48px] rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}