# Spec 002 — Red-and-white design refresh, copy rewrite and SEO

**Status:** in progress
**Branch:** `feat/design-refresh-2026-09` (cut from `origin/develop` at `6c52084`, `--no-track`)
**Depends on:** PR #6 (`fix/blog-crash-on-upgraded-runtime`), merged into this branch first (`ea3fcbc`). It fixes the blog crash under vinext 1.0 and makes the smoke suite read a seeded, migrated D1.
**Date:** 2026-09-13

Companion documents: [`seo.md`](seo.md) (research, audit, decisions), [`design.md`](design.md) (brand source, system, page designs), [`copy.md`](copy.md) (every copy change, facts check), [`tasks.md`](tasks.md) (checklist).

## What

Redesign the public Mobil Garage Door website (mobilgaragedoor.com) in the logo's colours — its two reds and white — rewrite its copy in the brand's own voice, and bring its technical and on-page SEO to current practice, without changing what any route, form, link, API or dashboard does.

## Why

- **The site is not in the brand's colours.** The logo is red on white. The site is navy (`#2c3e50`) and yellow (`#f1c40f`), colours that appear nowhere in the logo. Tobias: *"They're hellbent on red and white."*
- **The copy fights the brand's own voice guidelines.** The business stored its voice in the database (`settings.brand_voice`, migration `0005`): *"Professional yet approachable… Avoid corporate jargon—sound like a trusted neighbor who happens to be an expert"*, and *"Avoid fear-mongering language"*. The site says *"We kill the risks"*, *"System Critical?"*, *"Establishing Uplink…"*, *"Deployment Zones"*, *"Don't get trapped."*
- **Some UI claims are false by construction.** "ID: 4871-VERIFIED" badges are computed from the array index. "Real-time fleet metrics", "System Online • Accepting Jobs" and "SYSTEMS OPERATIONAL" are static strings. "In Your Area" sits under a constant. The "Sort By" controls do nothing.
- **SEO is below current guidance** (measured, see `seo.md` §3): every page has the same English `<title>` and description in all three locales, no page has a canonical, HTML hreflang points every page at the home pages, there is no JSON-LD, no sitemap and no robots.txt of the site's own, and home and services each render two `<h1>`s.
- **Loading is slow on mobile.** Baseline Lighthouse LCP is 3.5–3.7 s on every measured page. The render-blocking Google Fonts `@import` costs ~0.77 s and a 465 KB JPEG logo is shown at 40×40 px.

## Audience and business (inferred from the pages, confirmed below)

Mobile garage door repair and installation around Houston, TX, since 2000. There are two audiences:

1. **A homeowner with a door that won't work** — stressed, on a phone, often standing in the garage. They need the phone number or a request form within one thumb-reach, and proof the company is local and real.
2. **Builders and general contractors** planning installs — on a laptop, checking reliability, past projects and the builder portal.

The confirmation comes from the site itself: the services it lists (springs, openers, off-track doors, stuck doors, new installations, builder programmes), its service areas (Greater Katy & West Houston, The Woodlands & North Houston, Sugar Land & Richmond, Houston Interior & Heights), the $99 trip-fee service request flow on `/contact`, the AI diagnosis tool and the builder portal.

## Scope

**In scope**
- Public localized pages under `src/app/(site)/(public)/(localized)/[locale]/`: home, services, about, portfolio (index and detail), blog (index and detail), contact, privacy.
- The shared public layout and its parts: header, footer, skip link, loading state, the site-wide floating AI button (restyle only), the mobile action bar.
- Blog and portfolio visuals, including the featured-image component.
- Site-level SEO files: `src/app/sitemap.ts`, `src/app/robots.ts`, and metadata, canonicals, hreflang, Open Graph and JSON-LD for the public pages.
- Copy for every public namespace in `messages/en.json`, `es.json` and `vi.json`.
- Tests: the SEO smoke tests, updates to the header unit test, unit tests for the SEO helpers and the design scale.

**Out of scope (untouched)**
- Portal, dashboard, admin, auth (`login`, `signup`, `auth/complete`, `profile/complete`), payments, booking components, `diagnose`, and every API route. These keep their current look inside the new header and footer.
- `src/proxy.ts`, `src/i18n/*` (i18n routing), `next.config.js`, `vite.config.ts`, `wrangler.jsonc`, CI workflows.
- Database content: service, testimonial, project and post text, and the About page stats and values.
- Known defects, reported but not fixed: the undefined `squareClient` in `api/service-requests/route.ts`, the ~166 pre-existing type errors, the missing eslint config, the failing Vercel check, and `booking.trip_fee`/`booking.authorize`, which read "The 9 Trip Fee"/"AUTHORIZE 9" in all locales (booking namespace, out of scope).
- Content generation or blog automation (Tobias's separate SEO engine product).

## Hard constraints

1. **No functionality changes.** Routes, redirects, rewrites and i18n routing stay the same. Forms keep their fields, `name`s, handlers and endpoints. Links keep their destinations; the dead anchor `#repair` now resolves because the hero section carries `id="repair"`. Auth, Square, booking, service requests and tracking behave identically.
2. **No invented facts** in copy or structured data. Every claim is classified in `copy.md`: tier A facts Tobias set deliberately (commit evidence) versus tier B template-era claims (preserved, never amplified, flagged). UI the code proves fake is removed.
3. **Palette:** the logo reds `#ba233f` and `#cb243c`, white, a near-black ink at the logo's hue, and tints/shades derived from them in OKLCH. No new hues.
4. **No new UI, component or animation framework.** Tailwind stays. Native CSS first, with Baseline status checked in MDN's browser-compat-data and a real fallback wherever a feature is not Baseline widely available.
5. **Private routes look the same.** New Tailwind theme names are unique (`--color-brand-*`), so no existing utility changes meaning. The only shared change is that the same Work Sans variable font is now served from the site instead of Google Fonts.

## Acceptance criteria

| # | Criterion | Verified by |
|---|---|---|
| AC1 | Every public page renders one `<h1>`, in all three locales | smoke: `SEO › one h1` |
| AC2 | Every public page has a unique, localized `<title>` and meta description | smoke + `seo.md` §6 table |
| AC3 | Each localized URL has exactly one self-referencing absolute canonical on `https://mobilgaragedoor.com` | smoke: `SEO › canonical per locale` |
| AC4 | HTML hreflang is reciprocal across en/es/vi plus `x-default`, and matches next-intl's `Link` header cluster | smoke: `SEO › reciprocal hreflang` |
| AC5 | JSON-LD parses, uses `HomeAndConstructionBusiness`, `WebSite`, `Service` (and `BlogPosting` on posts) with Google's required properties, and carries no rating, review, price, hours or address | smoke: `SEO › structured data` + unit tests |
| AC6 | `/sitemap.xml` returns 200 XML listing every public page in every locale with alternates, plus published posts and projects from D1 | smoke: `SEO › sitemap` |
| AC7 | `/robots.txt` allows public pages and disallows `/dashboard`, `/portal` (and their locale prefixes) | smoke: `SEO › robots` |
| AC8 | The characterization suite stays green, keeping the Server Components error-row guard on every page it fetches | `npm run test:smoke` |
| AC9 | Translations stay in sync | `npm run lint:i18n` |
| AC10 | Unit tests pass, including the design-scale checker (tokens match the generator, scales increase monotonically, contrast pairs meet AA) | `npm test -- --run` |
| AC11 | Production build succeeds | `npm run build` |
| AC12 | Lighthouse (mobile, local production build, median of 3) improves LCP on the measured pages, keeps CLS ≤ 0.1 and TBT ≤ 200 ms, and reaches Accessibility ≥ 95 and SEO 100 | `seo.md` §8 |
| AC13 | Before/after screenshots of home and services at 390 and 1440 px, from local builds with synthetic data | `screenshots/` |
| AC14 | No secret, credential or real customer datum is added to this public repository | pre-commit scanner + review |
| AC15 | The Access-gated preview (`design-refresh` alias) returns 302 to `jrcodex.cloudflareaccess.com` logged out; production returns 200 | `curl --doh-url` in the PR |

## Baseline (measured before any change, 2026-09-13)

- **Lighthouse 13.4.1**, mobile defaults, local production build, synthetic D1 data, median of 3:

  | Page | LCP | CLS | TBT | Perf | A11y | SEO |
  |---|---|---|---|---|---|---|
  | `/` | 3,575 ms | 0.020 | 0 ms | 86 | 95 | 100 |
  | `/services` | 3,504 ms | 0 | 0 ms | 86 | 95 | 100 |
  | `/contact` | 3,661 ms | 0.006 | 0 ms | 85 | 89 | 100 |
  | `/blog/<post>` | 3,737 ms | 0 | 0 ms | 85 | 93 | 100 |

  Failing accessibility audits: `color-contrast` on all four pages, `heading-order` on the blog post, `label` on contact.
- **HTML audit:** see `seo.md` §3.
- **Gates:** `npm ci` ✅, `npm run lint:i18n` ✅ (302 references), `npm run build` ✅, smoke ✅ (as of PR #6).
