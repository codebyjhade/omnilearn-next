import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation"; // Updated import!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OmniLearn",
  description: "AI-Powered Study Gym",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen text-slate-900`}>
        
        {/* The new responsive navigation */}
        <Navigation />
        
        {/* RESPONSIVE CONTAINER:
          - max-w-4xl: Stops it from getting TOO wide on giant screens
          - mx-auto: Centers it
          - pt-6 md:pt-28: Adds padding at the top for the desktop navbar
          - pb-24 md:pb-12: Adds padding at the bottom for the mobile navbar
        */}
        <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-28 pb-24 md:pb-12">
          {children}
        </main>
        
      </body>
    </html>
  );
}