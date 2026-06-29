# OmniLearn: AI-Powered Study Gym 🧠✨
**Progressive Web App (PWA) Development Process & Project Specification**

## Phase 1: Project Initiation & Planning

### 1. Problem Identification
* **Problem:** Students and board exam reviewees waste hours manually reading PDFs and creating flashcards/quizzes.
* **Target Users:** High school/college students, self-learners, and board exam candidates who need to optimize their study time.
* **Value Proposition:** An "AI-Powered Study Gym" that instantly converts static study materials (PDFs) into interactive, testable, and trackable study sessions.

### 2. Requirement Gathering
**Functional Requirements:**
* Secure user registration and authentication.
* File upload system (PDFs up to 10MB).
* AI-automated generation of Summaries, Flashcards, and Quizzes.
* Interactive Lesson View featuring a Socratic Chat tutor and a simulated Board Exam with a live countdown timer and auto-grading.
* Dynamic Progress Dashboard calculating readiness scores based on past performance.

**Non-Functional Requirements:**
* Premium, app-like UI/UX (App Store aesthetic).
* Fully responsive layout (Mobile bottom-navigation, Desktop top-navigation).
* Fast loading times with instant state updates.
* Secure database with Row Level Security (RLS) to protect user data.

### 3. Minimum Viable Product (MVP)
* Secure Login/Signup gate.
* PDF Upload interface with progress tracking.
* Library to view saved materials.
* Functional Exam simulator with auto-grading.
* Real-time Progress tracking (Radar chart).

## Phase 2: System Design

### 4. User Experience (UX) Design
* **Navigation Flow:** Locked routing (unauthenticated users are kicked to the login screen) -> Dashboard -> Upload -> Library -> Lesson View -> Progress/Profile.
* **Journey:** Upload a document -> Wait for AI processing -> Review Summary & Slides -> Take Practice Exam -> View Results on Dashboard.

### 5. User Interface (UI) Design
* **Color Palette:** Slate/White background (Minimalist Light Theme), Violet-600 (Primary Action), Emerald-500 (Success/Ready), Orange-500 (Exams/Alerts).
* **Typography:** Inter (Next.js default) with high-contrast font weights (Extrabold for headers, Medium for subtitles).
* **Components:** Soft-shadow cards (shadow-sm, rounded-3xl), dynamic interactive tabs, animated progress bars, and custom geometric brain logo.

## Phase 3: Technical Architecture

### 6. Select Technology Stack
* **Frontend:** Next.js (React), Tailwind CSS.
* **Charting & Icons:** Recharts (Radar charts), Lucide-React (UI Icons).
* **Backend & Database:** Supabase (PostgreSQL, Auth, Storage).
* **AI Engine:** Google Gemini API (LLM for Socratic Chat and PDF processing).

### 7. Application Architecture
```text
User ➔ Next.js Frontend (Route Guards) ➔ Next.js API Routes (Gemini AI) ➔ Supabase (PostgreSQL / Storage)


Phase 4: PWA-Specific Implementation (Upcoming)
8. Web App Manifest
Name: OmniLearn

Short Name: OmniLearn

Theme Color: #7c3aed (Violet-600)

Background Color: #f8fafc (Slate-50)

Display: standalone

9. Service Worker Strategy
Cache First: For UI assets, custom fonts, and the geometric brain logo (OmniLearn.jpg).

Network First: For fetching recent study notes and quiz scores from Supabase.

Phase 5: Development
10. Frontend Development
Built Pages: /, /home, /upload, /library, /library/[id], /progress, /profile.

Key Components: Responsive Navigation.tsx (adapts from mobile-bottom to desktop-top), Interactive Tab system, Live Exam Timer.

11. Backend Development
Implemented Supabase Auth (Email/Password).

Next.js server-side API integration setup for Gemini generation.

12. Database Development (Supabase)
Table 1: study_notes (id, user_id, file_path, summary, flashcards, quizzes, created_at).

Table 2: quiz_scores (id, user_id, lesson_id, score, total_questions, percentage, created_at).

Phase 6: Progressive Enhancement
13. Offline Functionality (Planned)
Implement local caching so users can review generated Flashcards and Summaries even when disconnected from the internet (perfect for commuting).

Phase 7: Testing & Quality Assurance
14. Functional Testing
Route Guards: Verified unauthorized users cannot bypass / to access /home or /upload.

Exam Engine: Verified 45-minute countdown logic, radio button state management, and accurate percentage calculation upon submission.

Layout: Verified breakpoints (md:, lg:) correctly toggle between mobile and desktop views without horizontal scrolling.

Phase 8: Security
15. Security Implementation
Route Protection: Next.js useEffect session checks.

Database Security: Supabase Row Level Security (RLS) policies strictly enforced so users can only INSERT and SELECT their own user_id data.

Phase 9: Deployment
16. Deploy Application
Platform: Vercel (Optimized for Next.js and Turbopack).

Checklist: Environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY) secured in production.

Phase 10: Maintenance & Improvement
17. Continuous Improvement (Roadmap)
Build the /api/chat route to power the Socratic Chatbot using Gemini.

Build the /api/generate route to parse PDFs and map JSON outputs to the Supabase study_notes table.

Integrate real data fetching into the Recharts Radar chart on the Progress page.
