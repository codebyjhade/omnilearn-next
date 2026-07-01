# OmniLearn Task Board

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
- [ ] **TASK-004:** Server Component Migration: Refactor `home`, `library`, and `profile` pages to remove `"use client"` and fetch data securely on the server.
- [ ] **TASK-005:** Design System Enforcement: Overhaul `tailwind.config.ts` and `globals.css` to match the exact Neon Green (`#39FF14`) and Zinc (`#18181B`) variables.
- [ ] **TASK-006:** Shadcn UI Integration: Strip raw HTML elements from core pages and replace them with standard Shadcn `<Button>`, `<Card>`, and `<Input>`.

### ✅ Done
- [x] **TASK-003D:** Auth Migration (Phase 3 - Deprecate): Permanently deleted `supabaseClient.js`. Retained `useAuthGuard.ts` for state management.
- [x] **TASK-003C:** Auth Migration (Phase 2 - Validate): Performed rigorous E2E authentication testing. All tests passed.
- [x] **TASK-003B:** Auth Migration (Phase 1 - Migrate): Replaced legacy Supabase imports and stripped routing from `useAuthGuard`.
- [x] **TASK-003A:** Auth Infrastructure (Phase A): Introduce parallel `@supabase/ssr` clients and Edge Middleware.
- [x] **TASK-002:** API Security Patch: Implement Supabase session verification.
- [x] **TASK-001:** Surgical Cleanup: Remove unused Next.js starter artifacts.
- [x] **DOC-005:** Perform Codebase Audit & Generate `GAP_ANALYSIS.md`.
- [x] **DOC-001 - DOC-004:** Core Documentation Phase (Spec, Architecture, Design, Agents).