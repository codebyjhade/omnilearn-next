# Antigravity CLI Developer Commandments

## 1. Safety & Rollbacks
Every destructive action MUST include a rollback plan. Never delete files before proving the new infrastructure compiles and functions.

## 2. UI & Layout Integrity
**CRITICAL:** When swapping colors or refactoring components, you are strictly forbidden from altering grid structures, flexbox layouts, or responsive utility classes (`md:grid`, `w-full`, etc.). Never break mobile responsiveness to achieve a styling goal.

## 3. Strict Compliance
Do not hallucinate features. Execute the prompt exactly as requested.