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
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' }, // slate-50
    { media: '(prefers-color-scheme: dark)', color: '#020617' }   // slate-950
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
              The landing page (/) renders its own full-screen shell including
              its own nav and main container, so we must NOT add extra padding
              on that route. For all other routes the Navigation adds a 64px
              spacer on mobile via the .md:hidden h-16 div; on desktop the
              fixed header is 64px (h-16) so pt-20 (5rem ≈ 80px) gives a
              comfortable 16px breathing room below the bar.
            */}
            <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-20 pb-24 md:pb-12">
              {children}
            </main>
            
          </UploadProvider>
        </ThemeProvider>
        
      </body>
    </html>
  );
}
