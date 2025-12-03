# Design System: Mobile Garage Door (Modernized)

**Archetype:** The Techno-Hero (Hero + Magician)
**Vibe:** Precision, Mastery, Transformation. "We don't just fix doors; we upgrade your home's reality."

## 1. Brand Identity Evolution
We are retaining the core "Flame" identity but refining it from "Local Service" to "Tech Platform".

### Color Palette (The "Forge" Theme)
We keep the Uncle's "Flame" (`golden-yellow`) but elevate the context.

*   **Primary Brand (The Flame):**
    *   `brand-yellow`: `#f1c40f` (Legacy) -> **Modern Usage:** Use sparingly for high-impact CTAs and "sparks" of energy.
    *   `brand-glow`: `box-shadow: 0 0 20px rgba(241, 196, 15, 0.4)` (Neon effect).
*   **Primary Background (The Void):**
    *   `charcoal-deep`: `#0f172a` (Slate 900) - Replaces the lighter `charcoal-blue` as the main canvas.
    *   `charcoal-surface`: `#1e293b` (Slate 800) - For cards and panels.
*   **Accents (The Tech):**
    *   `tech-cyan`: `#06b6d4` (Cyan 500) - Represents the AI/Magician aspect. Used for "Instant-View" features.
    *   `steel-light`: `#94a3b8` (Slate 400) - For secondary text and borders.

### Typography
*   **Headings:** `Outfit` (Google Fonts). Bold, geometric, modern.
*   **Body:** `Inter` (Google Fonts). Clean, legible, standard for tech.
*   **Code/Data:** `JetBrains Mono`. For the "Universal Index" specs.

## 2. UI Component Specs (Tailwind v4)

### A. The "Glass Forge" Card
Instead of flat solid cards, we use dark glass to imply depth and sophistication.
```css
.card-forge {
  @apply bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl;
  transition: all 0.3s ease;
}
.card-forge:hover {
  @apply border-yellow-500/50 shadow-[0_0_30px_rgba(241,196,15,0.1)];
  transform: translateY(-2px);
}
```

### B. The "Molten" Button (Primary CTA)
Modernizing the yellow button.
```css
.btn-molten {
  @apply relative overflow-hidden bg-yellow-500 text-slate-950 font-bold px-8 py-3 rounded-lg;
  background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
}
.btn-molten::after {
  content: '';
  @apply absolute inset-0 bg-white/20 opacity-0 transition-opacity;
}
.btn-molten:hover::after {
  @apply opacity-100;
}
```

### C. The "Holographic" Input (Search/AI)
For the Universal Index search bar.
```css
.input-holo {
  @apply bg-slate-950/50 border border-cyan-500/30 text-white px-4 py-3 rounded-lg w-full;
  @apply focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 focus:outline-none;
}
```

## 3. Layout Strategy
*   **Hero Section:** Full-screen immersive video or high-res image with a "Dark Gradient Overlay" (`bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent`).
*   **Grid System:** Spacious 12-column grid. More whitespace = more premium feel.
*   **Micro-Interactions:** All interactive elements must have immediate feedback (hover glow, scale, or color shift).

## 4. Implementation Plan for Jules
1.  **Setup:** Install `Outfit` and `Inter` fonts. Update `tailwind.config.js` (or CSS variables) with the new palette.
2.  **Global Styles:** Update `globals.css` to set the dark theme default (`bg-slate-950 text-white`).
3.  **Components:** Refactor `Hero`, `Header`, and `Footer` to use the "Glass Forge" aesthetic.
4.  **Pages:** Apply the new design system to `/doors` (Index) and `/visualize` (AI).
