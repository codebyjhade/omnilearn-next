# OmniLearn Architecture Guidelines

## 1. Tech Stack Overview
* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Database & Auth:** Supabase (PostgreSQL, Edge Functions, Auth)
* **AI Engine:** Google Gemini API
* **Styling:** Tailwind CSS + Shadcn UI
* **Deployment:** Vercel

## 2. Server vs. Client Components (The Leaf Node Pattern)
To maximize performance and SEO, OmniLearn defaults to Server Components.
* **Pages (`page.tsx`):** Must be Server Components. Fetch data securely via `@supabase/ssr` server client here. No `"use client"` directives at the page level.
* **Interactivity:** Extract buttons, forms, and interactive UI into isolated components (e.g., `components/UploadForm.tsx`). Only these specific "leaf node" components should use the `"use client"` directive.

## 3. Data Fetching & Security Rules
* **No Client-Side Supabase Mutations:** Client components must never write directly to the database. All writes (inserts, updates, deletes) must be routed through Next.js Server Actions or protected API Route Handlers.
* **API Route Protection:** Every `/api/...` route handler MUST verify the user session using `@supabase/ssr` before processing the request or calling the Gemini API. Never use the `SUPABASE_SERVICE_ROLE_KEY` to bypass Row Level Security.
* **Authentication Flow:** Handled exclusively via Next.js Edge Middleware (`middleware.ts`). Do not rely on client-side hooks (`useAuthGuard`) to redirect unauthenticated users, as this causes layout flashing.

## 4. State Management
* **Global State:** Keep it minimal. Rely on Next.js Server Component data passing via props.
* **Local State:** Use standard React hooks (`useState`, `useReducer`) inside Client Components.