"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UploadCloud, Library, TrendingUp, User } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Upload", href: "/upload", icon: UploadCloud },
    { name: "Library", href: "/library", icon: Library },
    { name: "Progress", href: "/progress", icon: TrendingUp },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md h-16 bg-background border-t border-border flex items-center justify-around px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.name} 
            href={item.href}
            className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}