# Tasks 002 — Red-and-white design refresh, copy rewrite and SEO

`[x]` done, `[ ]` outstanding, `[-]` deliberately not done (with reason).

## 0. Setup
- [x] Worktree `/home/link/worktrees/mobile-garage-door-design-refresh`, branch `feat/design-refresh-2026-09` from `origin/develop` (`6c52084`), `--no-track`
- [x] Merge `origin/fix/blog-crash-on-upgraded-runtime` (PR #6) first (`ea3fcbc`)
- [x] `npm ci`; baseline build green

## 1. Research and baseline (before any change)
- [x] Read the pages to infer business and audience; read brand voice from migration `0005`
- [x] Read the five saved SEO research reports; build only on their verified items
- [x] context7: vinext metadata, Next.js 16.2.9 metadata/sitemap/robots/JSON-LD, MDN and BCD, Tailwind 4 `@theme` and layers
- [x] Verify vinext beta.9 metadata support in the installed source (`seo.md` §2)
- [x] Business-specific research: schema.org type for a garage door business, service-area profiles, RFC 3966, WCAG 2.2, FTC reviews rule, Texas DPS, Cloudflare managed robots.txt
- [x] Observe next-intl `Link` hreflang headers and the locale-detection redirect
- [x] Baseline HTML SEO audit (`seo.md` §3)
- [x] Baseline Lighthouse 13.4.1, median of 3, on `/`, `/services`, `/contact`, a blog post
- [x] Baseline screenshots (390 and 1440) of home, services, contact and a blog post, from a local build with synthetic data
- [x] Extract the logo reds by sampling interior pixels (`design.md` §2)
- [x] Trace every claim to its commit (tier A / tier B / fake UI)

## 2. Spec
- [x] `spec.md`, `seo.md`, `design.md`, `copy.md`, `tasks.md`
- [x] `scripts/design-scale.mjs`: generator and checker for the fluid scales and colour tokens
- [x] Copy change set applied to `messages/{en,es,vi}.json` (237 changes; out-of-scope namespaces byte-identical)

## 3. Design system
- [x] `src/app/brand-theme.css` (generated `@theme` colours), imported by `globals.css`
- [x] Self-host Work Sans (latin, latin-ext, vietnamese) + `OFL.txt`; replace the Google Fonts `@import`; metric-matched fallback (generated); preload latin
- [x] `site.css` for public routes: generated scales, base typography scoped to `.page`, component layer
- [x] Logo mark `<picture>` (AVIF/WebP, header by density, hero by width) and `og-default.jpg`
- [x] Unit test running `checkAll()` (tokens match the generator, monotonic scales, contrast pairs)

## 4. Shared layout
- [x] Skip link, single `<main id="main">`
- [x] Header: logo + wordmark, localized nav with `aria-current`, call and request actions, `inert` mobile menu with Escape, `:has()` scroll lock, scroll-driven elevation; breakpoints measured in en/es/vi from 360 to 1440 px
- [x] Mobile action bar (phones), hidden on the request form via `:has([data-request-form])`
- [x] Footer in the page locale: service areas as text, crawlable page links, support links, phone, licence block; dead links and fake status removed
- [x] Floating AI button restyle (utilities, shared with private routes); loading state restyle
- [x] `Header.test.tsx`: the mock maps `nav.dashboard` like `nav.login` (same assertions)

## 5. Pages
- [x] Home: hero (`id="repair"`, one `h1`, proof card, builders panel), services (subgrid + container queries), value stack, by-the-numbers + testimonials; all server components now
- [x] Services: one `h1`, two `h2` path cards, capability cards, brands band
- [x] About: `h1`, stats, standard + values, licensing tiles, call-to-action with phone
- [x] Portfolio index and detail: no nested `<main>`, localized placeholder instead of "IMG_MISSING_001", headings in order, fake sort controls removed
- [x] Blog index and post: `BlogFeaturedImage` without the loader and with `sizes`; locale dates; reading progress; call-to-action with phone
- [x] Contact: same fields, names, handlers and endpoints (verified line by line against `origin/develop`); associated labels; `aria-pressed`; localized strings; `contact/layout.tsx` for metadata
- [x] Privacy: localized labels, no nested `<main>`, localized date

## 6. SEO
- [x] `src/lib/seo/site.ts`: origin, business facts, localized paths, absolute URLs, alternates
- [x] `src/lib/seo/metadata.ts`: page metadata (title, description, canonical, hreflang, Open Graph, Twitter, robots)
- [x] `generateMetadata` in every page (blog post and project from D1; non-published posts `noindex`)
- [x] `htmlLimitedBots: /.*/` so metadata is in `<head>` for every user agent (found: vinext streams it into `<body>` otherwise)
- [x] `src/lib/seo/structured-data.ts` + `JsonLd`: business, WebSite, Service, BlogPosting
- [x] `src/app/sitemap.ts` (static pages × locales + published posts + projects from D1)
- [x] `src/app/robots.ts`
- [x] Unit tests for the helpers

## 7. Tests and gates
- [x] Smoke fixture `public-content.sql` (synthetic services, testimonials, project) loaded in `beforeAll`
- [x] Smoke SEO suite: 101 new tests (one h1, canonical per locale, head placement per user agent, unique titles, `lang`, reciprocal hreflang vs `Link` header, JSON-LD, sitemap, robots)
- [x] `npm run lint:i18n` (458 keys × 3, 352 references) · `npm test -- --run` (113) · `npm run build` · `npm run test:smoke` (113, ports 4421/9253)
- [x] `tsc --noEmit`: 166 errors, the pre-existing count (no new errors)

## 8. Evidence
- [x] Lighthouse after (same method); `seo.md` §8
- [x] After screenshots; before/after WebP for home and services at 390/1440 in `screenshots/`
- [x] Test changes recorded (`seo.md` §5)

## 9. Delivery
- [ ] Push branch; open PR into `develop` stating it depends on #6; watch CI `verify` to green
- [ ] Preview: `wrangler versions upload --preview-alias design-refresh` with credentials from Vault via env only
- [ ] Gate check over DoH: preview → 302 to Access; production → 200
- [-] Merge — never (Tobias merges)
