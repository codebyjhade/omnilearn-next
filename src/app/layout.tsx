import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation"; 
import { UploadProvider } from "../context/UploadContext";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OmniLearn",
  description: "AI-Powered Study Gym",
};

import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};  

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-slate-50 dark:bg-slate-950">
      <body className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 min-h-screen transition-colors duration-300`}>
        
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UploadProvider>
            
            <Navigation />

            {/*
              Each page is responsible for its own padding and max-width.
              The landing page (/) manages its own full-screen shell.
              Authenticated pages each declare their own page container.
            */}
            {children}
            
          </UploadProvider>
        </ThemeProvider>
        
      </body>
    </html>
  );
}
