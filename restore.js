const fs = require('fs');
const path = require('path');

const docsDir = path.join(process.cwd(), 'docs');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
}

const files = {
  'TASKS.md': `# OmniLearn Task Board

Status: Active
Current Phase: Phase 5 - Engineering Execution (Sprint 2)

---

## 🎯 Sprint 2 Goal: Component Architecture & UI Refactoring
Migrate core pages to Server Components, enforce the Design System, and integrate standard Shadcn UI components.

---

## 📋 Kanban Board

### 📝 Backlog (Future Sprints)
- [ ] **Sprint 3:** Spaced Repetition Engine logic and progress batching.
- [ ] **Sprint 4:** PWA configuration and offline fallback.

### ⏳ To Do (Sprint 2)
- [ ] **TASK-004:** Server Component Migration: Refactor \`home\`, \`library\`, and \`profile\` pages to remove \`"use client"\` and fetch data securely on the server.
- [ ] **TASK-005:** Design System Enforcement: Overhaul \`tailwind.config.ts\` and \`globals.css\` to match the exact Neon Green (\`#39FF14\`) and Zinc (\`#18181B\`) variables.
- [ ] **TASK-006:** Shadcn UI Integration: Strip raw HTML elements from core pages and replace them with standard Shadcn \`<Button>\`, \`<Card>\`, and \`<Input>\`.

### ✅ Done
- [x] **TASK-003D:** Auth Migration (Phase 3 - Deprecate): Permanently deleted \`supabaseClient.js\`. Retained \`useAuthGuard.ts\` for state management.
- [x] **TASK-003C:** Auth Migration (Phase 2 - Validate): Performed rigorous E2E authentication testing. All tests passed.
- [x] **TASK-003B:** Auth Migration (Phase 1 - Migrate): Replaced legacy Supabase imports and stripped routing from \`useAuthGuard\`.
- [x] **TASK-003A:** Auth Infrastructure (Phase A): Introduce parallel \`@supabase/ssr\` clients and Edge Middleware.
- [x] **TASK-002:** API Security Patch: Implement Supabase session verification.
- [x] **TASK-001:** Surgical Cleanup: Remove unused Next.js starter artifacts.
- [x] **DOC-005:** Perform Codebase Audit & Generate \`GAP_ANALYSIS.md\`.
- [x] **DOC-001 - DOC-004:** Core Documentation Phase (Spec, Architecture, Design, Agents).`,

  'CHANGELOG_AI.md': `# AI Developer Changelog

## Development History

### July 1, 2026 - Sprint 1 (Task 003D): Auth Migration (Phase 3 - Deprecate)
* **Tasks Completed:** TASK-003D
* **Key Files Deleted:** \`src/lib/supabaseClient.js\` permanently removed.
* **Architectural Decisions Made:** Retained the refactored \`useAuthGuard.ts\` (state-only version) after a build failure confirmed UI components still require its loading and user state. Sprint 1 is officially complete.

### July 1, 2026 - Sprint 1 (Task 003C): Auth Migration (Phase 2 - Validate)
* **Tasks Completed:** TASK-003C
* **Testing Executed:** Validated Edge Middleware Guest redirection, Browser Client cookie creation, Authenticated route access, API Authorization, and Session Refresh.

### July 1, 2026 - Sprint 1 (Task 003B): Auth Migration (Phase 1)
* **Tasks Completed:** TASK-003B
* **Key Files Modified:** Replaced legacy \`supabaseClient.js\` imports with context-aware \`@supabase/ssr\` clients. Surgically removed client-side routing logic from \`useAuthGuard.ts\`.

### July 1, 2026 - Sprint 1 (Task 003A): Auth Infrastructure (Phase A)
* **Tasks Completed:** TASK-003A
* **Key Files Modified:** Created \`client.ts\`, \`server.ts\`, and \`middleware.ts\`.

### July 1, 2026 - Sprint 1 (Task 002): API Security Patch
* **Tasks Completed:** TASK-002
* **Key Files Modified:** Secured \`/api/chat\` & \`/api/generate\`. Removed \`SUPABASE_SERVICE_ROLE_KEY\`.`,

  'DESIGN_SYSTEM.md': `# OmniLearn Design System

## Core Aesthetic
Premium, minimalist, and high-contrast. The UI relies on extremely dark backgrounds to reduce eye strain, punctuated by vibrant, high-energy accents.

## Color Palette
* **Base Background (Zinc 950):** \`#09090B\`
* **Card/Surface (Zinc 900):** \`#18181B\`
* **Primary Brand (Neon Green):** \`#39FF14\`
* **Primary Foreground (Text on Green):** \`#09090B\`
* **Accent (Gold):** \`#FFD700\`
* **Borders (Zinc 800):** \`#27272A\`

## Typography
* **Primary Font:** Inter (or standard Sans)
* High contrast reads: Text on Neon Green must ALWAYS be black/Zinc 950.`,

  'ARCHITECTURE.md': `# Architecture Guidelines

## Tech Stack
* **Framework:** Next.js 14 (App Router)
* **Database & Auth:** Supabase (PostgreSQL)
* **Styling:** Tailwind CSS + Shadcn UI

## Data Fetching & Security
* **Authentication:** Handled exclusively via Next.js Edge Middleware and \`@supabase/ssr\` cookies.
* **Server Components:** Default to fetching data on the server in \`page.tsx\`.
* **Client Components:** Use the "Leaf Node" pattern. Push \`"use client"\` down to the smallest possible interactive component (e.g., buttons, modals).`,

  'GAP_ANALYSIS.md': `# Architecture & Codebase Gap Analysis

## Resolved Gaps (Sprint 1)
* **Security Bypass:** Route handlers were using the Service Role Key. Resolved by implementing \`@supabase/ssr\` validation.
* **Auth Flash:** Client-side routing caused layout flashing. Resolved by implementing Edge Middleware.
* **Token Persistence:** \`persistSession: false\` was dropping tokens. Resolved via SSR cookies.

## Current Gaps (Sprint 2 Focus)
* **Performance Gap:** Core pages (\`home\`, \`library\`, \`profile\`) are currently Client Components, delaying database queries.
* **Visual Gap:** The UI uses generic Tailwind colors (violet, slate) instead of the authorized Neon Green/Zinc design system.
* **Component Gap:** UI elements are built with raw HTML/CSS strings instead of modular Shadcn components.`,

  'AGENTS.md': `# Antigravity CLI Developer Commandments

## 1. Safety & Rollbacks
Every destructive action MUST include a rollback plan. Never delete files before proving the new infrastructure compiles and functions.

## 2. UI & Layout Integrity
**CRITICAL:** When swapping colors or refactoring components, you are strictly forbidden from altering grid structures, flexbox layouts, or responsive utility classes (\`md:grid\`, \`w-full\`, etc.). Never break mobile responsiveness to achieve a styling goal.

## 3. Strict Compliance
Do not hallucinate features. Execute the prompt exactly as requested.`
};

for (const [filename, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(docsDir, filename), content);
    console.log(`✅ Restored: ${filename}`);
}

console.log('\\n🎉 All documents successfully restored! You can now safely delete this restore.js file.');