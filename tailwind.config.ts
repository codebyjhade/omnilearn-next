import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // 🔥 This tells Tailwind to use class-based dark mode
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5', // OmniLearn Blue/Indigo (Trust)
          700: '#4338ca',
        },
        ai: {
          50: '#faf5ff',
          100: '#f3e8ff',
          500: '#a855f7',
          600: '#9333ea', // Innovation Purple
        },
        success: { 500: '#10b981', 50: '#ecfdf5' },
        warning: { 500: '#f59e0b', 50: '#fffbeb' },
        error: { 500: '#ef4444', 50: '#fef2f2' },
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.1)',
        'ai-glow': '0 0 20px rgba(168, 85, 247, 0.15)', 
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};
export default config;