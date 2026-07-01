# OmniLearn Design System

## 1. Core Aesthetic
Premium, minimalist, high-contrast, and focused. The UI relies on extremely dark backgrounds to reduce eye strain during long study sessions, punctuated by vibrant, high-energy accents.

## 2. Color Palette
The exact CSS variables to be injected into Tailwind:
* **Base Background (Zinc 950):** `#09090B` (Used for the main app body)
* **Card/Surface (Zinc 900):** `#18181B` (Used for cards, dropdowns, and modals)
* **Primary Brand (Neon Green):** `#39FF14` (Used for primary buttons, progress bars, and active states)
* **Primary Foreground (Text on Green):** `#09090B` (Text placed on top of Neon Green must ALWAYS be this high-contrast dark color)
* **Accent (Gold):** `#FFD700` (Used for streaks, premium features, or achievements)
* **Borders (Zinc 800):** `#27272A` (Subtle separation lines)
* **Destructive (Red):** `#EF4444` (For delete actions)

## 3. Typography
* **Primary Font:** Inter (or Next.js standard Sans).
* **Headings:** Bold, clean, minimal letter-spacing.
* **Readability:** Text contrast is paramount. Avoid low-contrast gray text on dark backgrounds.

## 4. UI Patterns
* **Cards:** Soft rounded corners (`rounded-xl`), 1px solid borders using the `--border` color. No heavy drop shadows; rely on border contrast instead.
* **Buttons:** Standard Shadcn UI button dimensions. Primary buttons use the Neon Green fill with black text. Secondary buttons use a transparent background with a visible border.
* **Hover States:** Subtle background opacity shifts or border color changes (e.g., hovering a card turns the border Neon Green).