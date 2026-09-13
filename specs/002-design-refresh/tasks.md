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
- [ ] `src/app/brand-theme.css` (generated `@theme` colours), imported by `globals.css`
- [ ] Self-host Work Sans (latin, latin-ext, vietnamese) + `OFL.txt`; replace the Google Fonts `@import`; metric-matched fallback; preload latin
- [ ] `site.css` for public routes: generated scales, base typography scoped to `.page`, component layer
- [ ] Header logo mark (`<picture>` AVIF/WebP 1×/2×/3×) and `og-default.jpg`
- [ ] Unit test running `checkAll()` (tokens match the generator, monotonic scales, contrast pairs)

## 4. Shared layout
- [ ] Skip link, single `<main id="main">`
- [ ] Header: logo + wordmark, localized nav with `aria-current`, call and request actions, accessible `inert` mobile menu, `:has()` scroll lock, scroll-driven elevation
- [ ] Mobile action bar (phones), hidden on the request form
- [ ] Footer in the page locale: service areas as text, crawlable page links, support links, phone, licence block; dead links and fake status removed
- [ ] Floating AI button restyle; loading state restyle
- [ ] Update `Header.test.tsx` for the localized dashboard label (same behaviour asserted)

## 5. Pages
- [ ] Home: hero (`id="repair"`, one `h1`, proof card, builders panel), services (subgrid + container queries), value stack, by-the-numbers + testimonials; server components
- [ ] Services: one `h1`, two path cards, capability cards, brands band
- [ ] About: `h1`, stats, standard + values, licensing tiles, call-to-action with phone
- [ ] Portfolio index and detail: no nested `<main>`, placeholder without debug text, headings in order
- [ ] Blog index and post: `BlogFeaturedImage` without the loader and with `sizes`; locale dates; reading progress; call-to-action with phone
- [ ] Contact: same fields, names, handlers and endpoints; associated labels; `aria-pressed`; localized strings; `contact/layout.tsx` for metadata
- [ ] Privacy: localized labels, no nested `<main>`

## 6. SEO
- [ ] `src/lib/seo/site.ts`: origin, business facts, localized paths, absolute URLs, alternates
- [ ] `src/lib/seo/metadata.ts`: page metadata (title, description, canonical, hreflang, Open Graph, Twitter, robots)
- [ ] `generateMetadata` in the public layout and every page (blog post and project from D1; non-published posts `noindex`)
- [ ] `src/lib/seo/structured-data.ts` + `JsonLd`: business, WebSite, Service, BlogPosting
- [ ] `src/app/sitemap.ts` (static × locales + published posts + projects from D1)
- [ ] `src/app/robots.ts`
- [ ] Unit tests for the helpers

## 7. Tests and gates
- [ ] Smoke fixture `public-content.sql` (synthetic services, testimonials, project) loaded in `beforeAll`
- [ ] Smoke `SEO` suite: one h1, canonical per locale, reciprocal hreflang, JSON-LD, sitemap, robots
- [ ] `npm run lint:i18n` · `npm test -- --run` · `npm run build` · `npm run test:smoke` (ports 4421/9253)

## 8. Evidence
- [ ] Lighthouse after (same method); fill `seo.md` §8
- [ ] After screenshots; commit compressed before/after for home and services at 390/1440
- [ ] Record test changes in the PR

## 9. Delivery
- [ ] Push branch; open PR into `develop` stating it depends on #6; watch CI `verify` to green
- [ ] Preview: `wrangler versions upload --preview-alias design-refresh` with credentials from Vault via env only
- [ ] Gate check over DoH: preview → 302 to Access; production → 200
- [-] Merge — never (Tobias merges)
