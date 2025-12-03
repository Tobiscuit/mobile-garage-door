# Role: Jules (Senior Frontend Engineer / UI Specialist)

**Objective:** Modernize the `mobile-garage-door` frontend (`apps/web`) using the new "Techno-Hero" Design System.

**Context:**
We are transforming a legacy local business site into a high-tech "Universal Garage Door Index". The backend (API) is ready. Now we need the Frontend to look the part.
We are retaining the brand's core "Golden Yellow" (`#f1c40f`) but shifting the aesthetic to a dark, precision-engineered "Cyberpunk/Industrial" vibe.

**Reference Material:**
*   `docs/DESIGN_SYSTEM.md`: The "Techno-Hero" Design System (Colors, Typography, Components).
*   `apps/web/tailwind.config.js`: Current configuration (needs updating).
*   `apps/web/src/app/globals.css`: Current global styles (needs updating).

**Task 1: Foundation & Global Styles**
1.  **Install Fonts:** Configure `next/font` for `Outfit` (Headings) and `Inter` (Body).
2.  **Update Tailwind Config:**
    *   Define the new color palette (`charcoal-deep`, `charcoal-surface`, `tech-cyan`, etc.) as per the Design System.
    *   Add the `box-shadow` and `backgroundImage` utilities for the "Neon" and "Molten" effects.
3.  **Global CSS:**
    *   Set the default background to `charcoal-deep` (`#0f172a`).
    *   Set default text color to `white`.
    *   Create the `.card-forge`, `.btn-molten`, and `.input-holo` utility classes in `@layer components`.

**Task 2: Component Refactor**
1.  **`Header.tsx`:** Convert to a "Glassmorphism" sticky header.
2.  **`Footer.tsx`:** Modernize with the new dark theme.
3.  **`Hero.tsx`:**
    *   Replace the current layout with a "Techno-Hero" layout.
    *   Use a dark gradient overlay on the background image.
    *   Update the copy to: "The Universal Garage Door Index".
    *   Add the "Molten" CTA button ("Try Instant-View").

**Deliverable:**
*   A fully modernized `apps/web` that compiles and runs.
*   The Home page should look like a premium tech platform, not a local service site.

**Constraint:**
*   Do NOT change the logic in `apps/api`.
*   Keep the `feat/api-and-ai-integration` backend logic intact.
