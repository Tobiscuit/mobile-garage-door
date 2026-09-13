# SEO — research, audit and decisions

Every source below was checked on **2026-09-13**. "Updated" is the page's own last-updated stamp, where it shows one. Nothing here comes from memory.

**How the research was done**
- **General SEO ground.** Five research reports written for sibling client sites earlier the same day: Google Search Central (titles, canonicals, robots, sitemaps, LocalBusiness), structured data, AI-search readiness, Core Web Vitals / Lighthouse 13 / Open Graph, and on-page and language. I built only on items those reports verified with quotes. Every item they list as unverifiable is excluded here too, notably the X/Twitter card specs.
- **Research done for this site specifically.** Fetched again with WebFetch/WebSearch: localized versions and canonicals, LocalBusiness and schema.org types for a garage door business, service-area businesses, tel: URIs, WCAG, Texas licensing, the FTC reviews rule and Cloudflare's managed robots.txt.
- **Framework APIs.** context7: `/cloudflare/vinext`, `/vercel/next.js/v16.2.9`, `/mdn/content`, `/mdn/browser-compat-data`, `/websites/tailwindcss`. The context7 quota did not run out. Where context7 returned no specific entry, I read the installed package source (`node_modules/vinext/dist`, vinext 1.0.0-beta.9) or queried `@mdn/browser-compat-data` 8.1.1 (2026-09-10) and `web-features` 3.38.0 directly.

---

## 1. Sources

### Google Search Central
| Topic | URL | Updated | What it settles here |
|---|---|---|---|
| Title links | developers.google.com/search/docs/appearance/title-link | 2025-12-10 | Unique, descriptive titles; brand at start or end after a delimiter; "Avoid keyword stuffing"; the home page may carry more; same language as the content |
| Snippets | …/appearance/snippet | 2026-04-20 | Unique page-level descriptions; site-level only on the home page; no keyword strings |
| Canonicalization | …/crawling-indexing/consolidate-duplicate-urls | 2026-07-10 | "Use absolute paths"; self-referential canonical; only honoured in `<head>`; don't mix canonicalization techniques |
| Localized versions | …/specialty/international/localized-versions | 2025-12-22 | "Each language version must list itself as well as all other language versions"; "If two pages don't both point to each other, the tags will be ignored"; `x-default`; ISO 639-1 codes; HTML, HTTP header and sitemap methods "are equivalent"; untranslated main content = duplicates |
| Multi-regional and multilingual | …/specialty/international/managing-multi-regional-sites | 2025-12-10 | "Avoid automatically redirecting users from one language version… to a different language version"; Google detects language from visible content, not `lang` |
| robots.txt intro | …/crawling-indexing/robots/intro | 2025-12-10 | robots.txt "is not a mechanism for keeping a web page out of Google" |
| robots.txt spec | …/crawling-indexing/robots/robots_txt | 2026-08-31 | Longest matching path wins, ties go to allow; prefix matching; `sitemap:` must be fully qualified |
| Block indexing | …/crawling-indexing/block-indexing | 2025-12-10 | A robots.txt Disallow hides that path's `noindex` from Google |
| Sitemaps | …/crawling-indexing/sitemaps/build-sitemap | 2026-07-08 | Absolute URLs; "Google ignores `<priority>` and `<changefreq>`"; `<lastmod>` only if verifiably accurate |
| Structured data guidelines | …/appearance/structured-data/sd-policies | 2026-07-10 | JSON-LD recommended; "Don't mark up content that is not visible"; "most specific applicable type"; no fake reviews |
| LocalBusiness | …/appearance/structured-data/local-business | 2026-09-08 | **Required: `address`, `name`.** Recommended include `telephone` ("include the country code"), `url`, `openingHoursSpecification`, `priceRange`. `aggregateRating`/`review` only for sites reviewing *other* businesses. "`additionalType` isn't supported"; use a type array instead. `areaServed` appears nowhere on the page |
| Organization | …/appearance/structured-data/organization | 2026-09-08 | No required properties; home or about page; `logo` ≥ 112×112, crawlable; `foundingDate` ISO 8601 |
| Site names | …/appearance/site-names | 2025-12-10 | `WebSite` with `name` + `url` on the home page; same markup on duplicate home pages |
| Sitelinks search box | …/search/updates (entry 2024-11-29) | 2026-09-08 | Feature removed; no `SearchAction` |
| Core Web Vitals | …/appearance/core-web-vitals | 2025-12-10 | LCP within 2.5 s, INP under 200 ms, CLS under 0.1; "used by our ranking systems" |
| Page experience | …/appearance/page-experience | 2025-12-10 | CWV help; "doesn't guarantee" top rankings |
| SEO Starter Guide | …/fundamentals/seo-starter-guide | 2025-12-10 | Heading order doesn't matter to Google ("fantastic for screen readers"); Google ignores meta keywords |
| Links | …/crawling-indexing/links-crawlable | 2025-12-10 | Crawlable `<a href>`; descriptive, concise anchor text |
| Spam policies | …/essentials/spam-policies | 2026-08-28 | Keyword stuffing includes "Blocks of text that list cities and regions that a web page is trying to rank for" |
| Image SEO | …/appearance/google-images | 2026-03-02 | `<img>` not CSS backgrounds; descriptive alt without keyword stuffing |
| JS SEO basics | …/crawling-indexing/javascript/javascript-seo-basics | 2026-03-04 | Server rendering recommended; keep canonical and noindex in the server HTML |
| AI features | …/appearance/ai-features | 2025-12-10 | "No additional requirements… nor other special optimizations"; "don't need to create new machine readable files, AI text files, or markup" |
| Optimizing for generative AI | …/fundamentals/ai-optimization-guide | 2026-07-10 | llms.txt: "Google Search ignores them"; no chunking, no special writing; structured data optional; Business Profile for local businesses |
| Local ranking (Business Profile Help) | support.google.com/business/answer/7091 | not shown | Relevance, distance, prominence, all from the Business Profile |
| Service areas (Business Profile Help) | support.google.com/business/answer/9157481 | not shown | "If you don't serve customers at your business address, remove your address"; up to 20 service areas by city or postal code, not radius |

### web.dev and Chrome
| Topic | URL | Updated | Relevance |
|---|---|---|---|
| Optimize LCP | web.dev/articles/optimize-lcp | 2025-03-31 | `fetchpriority="high"` on the LCP image, never lazy-load it, discoverable in the HTML, no render-blocking CSS or fonts |
| LCP definition | web.dev/articles/lcp | 2025-09-04 | Opacity-0 elements are not LCP candidates, and text is not "rendered" during the font block period. **So the hero gets no entrance fade.** |
| Optimize CLS | web.dev/articles/optimize-cls | 2025-02-07 | `width`/`height` or `aspect-ratio`; `size-adjust` / `ascent-override` / `descent-override` / `line-gap-override` for font fallbacks; animate with `transform` |
| Optimize INP | web.dev/articles/optimize-inp | 2025-09-02 | Script evaluation during startup delays input; less client JS |
| Fetch Priority | web.dev/articles/fetch-priority | 2023-11-14 | A hint, not a directive; Chrome 102, Firefox 132, Safari 17.2 |
| Lighthouse SEO audits | github.com/GoogleChrome/lighthouse `core/config/default-config.js` (main) | — | The ten weighted SEO audits; `structured-data` is manual; canonical cross-origin check removed (#13412), so a local run with the production canonical passes; `robots-txt` fetches `/robots.txt` from the tested origin |
| Lighthouse llms.txt audit | developer.chrome.com/docs/lighthouse/agentic-browsing/llms-txt | 2026-05-05 | 404 is "Not Applicable"; Agentic Browsing is unscored |

### schema.org (V30.0, 2026-03-19)
- `HomeAndConstructionBusiness`: "A LocalBusiness that provides services around homes and buildings." Its subtypes are Electrician, GeneralContractor, HVACBusiness, HousePainter, Locksmith ("A locksmith."), MovingCompany, Plumber and RoofingContractor. **None covers garage doors**, so `HomeAndConstructionBusiness` is the most specific applicable type.
- `Service`: `name`, `description`, `serviceType`, `provider`, `areaServed` (AdministrativeArea / GeoShape / Place / Text), `hasOfferCatalog`.
- `areaServed`: "The geographic area where a service or offered item is provided. Supersedes serviceArea." It is used by schema.org consumers, not documented by Google.
- `additionalType`: "typically used for adding more specific types from external vocabularies". Not supported by Google (see LocalBusiness above).

### Standards, law and platform
| Topic | Source | Date | Relevance |
|---|---|---|---|
| tel: URIs | RFC 3966, rfc-editor.org/rfc/rfc3966 | Dec 2004 | "All phone numbers MUST use the global form unless they cannot be represented as such" → `tel:+18324191293` |
| Open Graph | ogp.me | no date | `og:title/type/image/url` required; `og:locale` is `language_TERRITORY`; `og:image:alt` |
| Facebook link shares | developers.facebook.com/docs/sharing/webmasters/images | no date | At least 1200×630, ~1.91:1, declare width and height |
| X / Twitter cards | developer.x.com | — | **Not verified.** developer.x.com returns HTTP 402 to fetchers. Tags are emitted from Open Graph, but their specs are unconfirmed |
| WCAG 2.2 1.4.3 | w3.org/WAI/WCAG22/Understanding/contrast-minimum | 2026-06-01 | 4.5:1; 3:1 for large text (≈24 px, or ≈18.5 px bold) |
| WCAG 2.2 1.4.11 | …/non-text-contrast | 2026-06-15 | 3:1 for UI boundaries and focus indicators |
| WCAG 2.2 2.5.8 | …/target-size-minimum | 2026-05-11 | AA 24×24 CSS px minimum |
| WCAG 2.2 2.4.13 | …/focus-appearance | 2026-08-10 | AAA: 2 px perimeter, 3:1 change |
| FTC Consumer Reviews and Testimonials Rule | ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers | Nov 2024; effective 2024-10-21 | Prohibits fake reviews and testimonials. Context for removing the index-generated "VERIFIED" badges |
| Texas DPS, garage door openers | dps.texas.gov/section/private-security/gate-operatorsgarage-door-openers | 2019/2020 | Opener installers need no DPS license unless the operator connects to an alarm or monitoring. Context for asking Tobias to verify the footer's "State License #9942-B-RES" |
| Cloudflare managed robots.txt | developers.cloudflare.com/bots/additional-configurations/managed-robots-txt | 2026-08-03 | Cloudflare prepends its managed block to a Worker's own 200 `/robots.txt` |
| llms.txt proposal | llmstxt.org | modified 2026-08-10 | Still a proposal; used "on demand" by agents |
| OpenAI crawlers | developers.openai.com/api/docs/bots | no date | Allow OAI-SearchBot to appear in ChatGPT search; a wildcard allow covers it |

---

## 2. What vinext 1.0.0-beta.9 supports

vinext reimplements the Next.js API surface. I checked each API against the installed code (`dist/shims/metadata.js`, `dist/server/metadata-routes.js`, `dist/server/metadata-route-response.js`) and context7's `/cloudflare/vinext`, not just its README.

| API | vinext beta.9 | Notes |
|---|---|---|
| `export const metadata` | ✅ | `resolveModuleMetadata` falls back to it |
| `generateMetadata({ params, searchParams }, parent)` | ✅ | Called first when present; `params` is a thenable, `parent` a promise of merged ancestors |
| `title.template` / `title.absolute` / `title.default` | ✅ | Templates come from layouts, not the page that defines them |
| `alternates.canonical` | ✅ | `<link rel="canonical">`. Relative values resolve against `metadataBase`; the root resolves to `https://host` with no trailing slash |
| `alternates.languages` (incl. `x-default`) | ✅ | One `<link rel="alternate" hreflang>` per key |
| `openGraph` title/description/url/siteName/type/locale/images(+width/height/type/alt)/publishedTime/modifiedTime/authors | ✅ | |
| `openGraph.alternateLocale`, article `section`/`tags`, `determiner`, `emails`, `phoneNumbers` | ❌ | **Not rendered by `MetadataHead`** (Next.js renders them). The site doesn't use them. |
| `twitter` | ✅ | Missing title, description and images are filled from Open Graph (`postProcessMetadata`) |
| `robots` / `googleBot`, `icons`, `manifest`, `verification`, `appleWebApp`, `other` | ✅ | |
| Merge semantics | ✅ like Next.js | Shallow per top-level key, so a page's `openGraph` replaces the layout's. Pages build complete objects through one helper. |
| `app/sitemap.ts` → `/sitemap.xml` | ✅ | Runs per request (only `"use cache"` routes prerender), so D1 is available. Supports `alternates.languages` → `xhtml:link`, `lastModified`, `images`, `generateSitemaps`. Served as `application/xml`, `Cache-Control: public, max-age=0, must-revalidate` |
| `app/robots.ts` → `/robots.txt` | ✅ | Must sit at the app root (`nestable: false`); rules, `host`, `sitemap`; `text/plain` |
| JSON-LD | n/a | Neither Next.js nor vinext has a Metadata field for it. Next.js's JSON-LD guide (v16.2.9) renders a native `<script type="application/ld+json">` and escapes `<` as `<`. |
| Client component page + `generateMetadata` | ❌ (same as Next.js) | `/contact` is `'use client'`, so its metadata comes from a new server `contact/layout.tsx` that renders its children unchanged. |

**Behaviour of the stack around metadata** (observed on the local build and live site):
- **next-intl `Link` header.** The middleware already sends a `Link` header with reciprocal `hreflang` for en, es, vi and `x-default` on every matched route (`alternateLinks` defaults to on), using the request origin.
- **Locale detection.** With `Accept-Language: es`, `/` answers **307 → `/es`**, and a `NEXT_LOCALE` cookie is set. Google advises against automatic language redirects, but this is i18n routing and stays unchanged (question Q7).
- **Streaming order.** `(public)/loading.tsx` wraps pages in Suspense, so page content streams after the footer in the raw HTML and moves into place during load. Google renders pages, so the order it sees is the final DOM. JSON-LD placed in the page body is present in both.
- **Host variants.** `www.mobilgaragedoor.com` 301s to the apex. `http://mobilgaragedoor.com/` answers 200 without redirecting to HTTPS (question Q8).

---

## 3. Audit of the current site (before)

Rendered HTML of the local production build (same code as develop + PR #6):

| Page | `<title>` | Canonical | HTML hreflang | `h1` count | JSON-LD | Other |
|---|---|---|---|---|---|---|
| `/` `/es` `/vi` | "Mobil Garage Door - Your Trusted Partner for Garage Doors" (English, identical everywhere) | none | en/es/vi → the three **home** URLs; no `x-default` | **2** | none | `og:url` = home on every page |
| `/services` `/es/services` | same | none | → home URLs | **2** | none | |
| `/about` | same | none | → home URLs | 1 | none | |
| `/portfolio`, `/portfolio/<id>` | same | none | → home URLs | 1 | none | **nested `<main>`** |
| `/blog`, `/blog/<slug>` | same | none | → home URLs | 1 | none | featured image `?w=0&q=75` |
| `/contact` | same | none | → home URLs | 1 | none | inputs without labels |
| `/privacy` | same | none | → home URLs | 1 | none | **nested `<main>`** |

Site-wide:
- **Descriptions.** Every page carries the same English meta description.
- **robots.txt.** `/robots.txt` and `/sitemap.xml` are 404 from the Worker. Live, Cloudflare serves a managed robots.txt that holds only its content-signals comment block, with no directives.
- **Meta keywords.** Ignored by Google, and removed.
- **Dead links.** Footer "Deployment Zones", "SLA Documentation", "Terms of Service" and "Sitemap" all use `href="#"`. The home services card anchor `#repair` has no target.
- **Skip link.** None. Headings start at `h3`/`h4` in DOM order because the footer streams first.

---

## 4. Decisions

### 4.1 Titles and descriptions
Every public page gets a unique title and description in each locale, built by one helper (`src/lib/seo/metadata.ts`) from the `seo` message namespace:
- **Title.** `<title>` = page title + `" | Mobil Garage Door"`. Google recommends the site name at the end after a delimiter.
- **Social title.** `og:title` omits the brand, as Facebook recommends ("without any branding").
- **Home title** says what and where: *"Garage Door Repair & Installation in Houston"*.
- **Detail pages.** Blog and portfolio detail titles come from the D1 record: post title and excerpt, project title.
- **Drafts.** Blog posts that aren't `published` get `robots: noindex`. The page still renders exactly as before.
- **Removed.** The `keywords` meta tag (Google Search doesn't use it).

The full title and description table per locale is in `copy.md` §SEO.

### 4.2 Canonicals
- Each localized URL has one absolute, self-referencing canonical on `https://mobilgaragedoor.com`, formatted exactly like vinext's resolver (root is `https://mobilgaragedoor.com`, `/es/services` stays unslashed).
- Query strings are dropped: `/contact?type=repair` canonicalizes to `/contact`.
- `og:url`, sitemap `<loc>`, JSON-LD `url` and hreflang `href` all use the same string from the same function. Google says not to specify different canonicals through different techniques.

### 4.3 hreflang and languages
- **Every localized URL** — home, services, about, portfolio, blog, contact, privacy, **and** each blog post and project — carries the full cluster: `en` → unprefixed, `es` → `/es…`, `vi` → `/vi…`, `x-default` → the English URL.
- **Matches next-intl.** The cluster is identical to the one next-intl already sends in the `Link` header. Google accepts both methods, and they must never disagree.
- **Why posts and projects keep the cluster** although their main content (from D1) is English in every locale:
  1. i18n routing and the next-intl header are out of scope, so an English-only canonical for `/es/blog/*` would contradict the header's hreflang.
  2. Spanish- and Vietnamese-speaking visitors keep a translated call-to-action around the article.
  3. Google will fold the untranslated duplicates itself ("only considered duplicates if the main content… remains untranslated") without penalty.
- **Alternative** if Tobias prefers: turn `alternateLinks` off and canonicalize untranslated posts to English (question Q6).
- **`<html lang>`** was already correct (`en`/`es`/`vi`) and stays. Google doesn't use it for language detection, but screen readers do (WCAG 3.1.1).
- **`og:locale`**: `en_US`, `es_US`, `vi_US`. The audience is in the US in all three languages. Facebook's list of supported locale codes was not verified.

### 4.4 Open Graph and Twitter
- **Image.** A new brand image, `/images/social/og-default.jpg`: 1200×630, the logo on white above a red band, with its dimensions declared correctly. The old `og-image.png` is really a 1408×768 JPEG, declared as 1200×630 and off-brand blue-green.
- **Alt text.** Localized `og:image:alt`.
- **Type.** `og:type` is `website`, or `article` with `article:published_time` on blog posts.
- **Twitter.** `twitter:card` is `summary_large_image`, derived from Open Graph. X's own card specifications are unverified (HTTP 402).

### 4.5 Structured data (JSON-LD)
Built by `src/lib/seo/structured-data.ts` and serialized with `<` escaped. **Only facts the site shows, and only tier-A facts** (see `copy.md` §Facts):

| Node | Where | Properties |
|---|---|---|
| `HomeAndConstructionBusiness` `@id …/#business` | home, about, contact, services | `name` "Mobil Garage Door"; `url`; `logo` (`/images/logos/logo.jpg`, 1200×896, white background); `telephone` "+1-832-419-1293"; `foundingDate` "2000" (visible "Since 2000"); `areaServed`: Houston, Katy, The Woodlands, Sugar Land and Richmond, TX (the footer's service areas); `description` = the visible intro sentence |
| `WebSite` `@id …/#website` | the three home pages (same markup on each, as Google asks for duplicate home pages) | `name`, `alternateName` "Mobil Garage", `url` (root), `inLanguage` ["en","es","vi"], `publisher` → business |
| `Service` | home and services | One node per D1 service row as rendered on that page: `name`, `description`, `provider` → business (with `@id`, `name`, `url` inline), `areaServed`, `url` |
| `BlogPosting` | each blog post | `headline`, `description` (excerpt), `image` (featured image, absolute), `datePublished` (visible date), `author` and `publisher` → business, `mainEntityOfPage`, `inLanguage` |

**Deliberately omitted.** Each needs a fact the site doesn't show, or one I can't verify; see the questions in §6:
- **`address`.** None is shown, and Tobias removed the placeholder street address in Feb 2026. **Without it the business node is not eligible for Google's LocalBusiness rich result**, but it still describes the entity.
- **Ratings, prices, hours.** `aggregateRating` and `review` (Google limits them to sites reviewing *other* businesses, and the testimonials are first-party); `priceRange`; `openingHoursSpecification`. The "24/7" claim is tier B.
- **Other.** `geo`; `sameAs` (the footer's "IG"/"LN" circles link nowhere); `email` (the contact page's `dispatch@mobilgarage.com` is on a different domain from the site); licence and insurance numbers (tier B); dealer brands (tier B); `additionalType` (unsupported); `SearchAction` (feature removed); `FAQPage`; breadcrumbs.

### 4.6 Sitemap
`src/app/sitemap.ts` returns, at request time:
- **Pages.** Every public page (`/`, `/services`, `/portfolio`, `/blog`, `/about`, `/contact`, `/privacy`) × en/es/vi, each with `xhtml:link` alternates including `x-default`.
- **Content.** Every **published** post (`status = 'published'`) and every project × en/es/vi, from D1, with `lastModified` = the row's `updated_at`. The static pages carry no lastmod, since Google uses lastmod only when "verifiably accurate".
- **Failure mode.** If D1 is unavailable, the static entries are still returned.
- **Omitted.** No `changefreq` or `priority` (Google ignores both).

### 4.7 robots.txt
`src/app/robots.ts`:
```
User-Agent: *
Allow: /
Disallow: /dashboard
Disallow: /portal
Disallow: /admin
Disallow: /es/dashboard
Disallow: /es/portal
Disallow: /es/admin
Disallow: /vi/dashboard
Disallow: /vi/portal
Disallow: /vi/admin

Sitemap: https://mobilgaragedoor.com/sitemap.xml
```
- **Locale prefixes are listed explicitly** rather than with `/*/dashboard`, which would also block a future `/blog/dashboard-…` slug (robots paths are prefix matches).
- **`/api/` is not blocked.** Blog images are served from `/api/media/…`, and Google says not to block resources pages need.
- **`/login` and `/signup` stay crawlable.** A Disallow would hide any future `noindex` from Google, and the right tool is a `noindex` on those auth pages, which are out of scope (question Q9).
- **Portal and dashboard** already redirect logged-out visitors to `/login`, so their content can't be indexed. The Disallow stops wasted crawling.
- **Cloudflare.** It will prepend its managed content-signals block. Today that block contains only comments, so the combined file stays valid (§1). The wildcard group covers Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot and PerplexityBot (RFC 9309: bots without their own group follow `*`).

### 4.8 Headings, landmarks, links
- **One `h1` per page.**
  - The home hero's second "h1" (the contractor panel) becomes an `h2`.
  - The services hero's two `h1`s become one page `h1` plus two `h2` path cards.
- **Heading order has no gaps.** The portfolio "Technical Breakdown" `h3` becomes an `h2`; the blog empty state `h3` becomes a `p`.
- **One `<main id="main">`** from the public layout. The nested `<main>`s on portfolio, portfolio detail and privacy become `div`s. A skip link comes first in the body.
- **Descriptive link text.**
  - "Configure Service" → "Request this service"; "Access Pro Portal" → "Contractor inquiry"; "Read our Service Level Agreement" (it linked to the contact form) → "Ask about our service terms".
  - Dead `href="#"` links are removed.
  - The footer adds crawlable links to every main page (Google: "Every page you care about should have a link from at least one other page").

### 4.9 Core Web Vitals
- **LCP.**
  - **Fonts.** The render-blocking `@import` of Google Fonts is replaced with the **same Work Sans variable font, self-hosted**: latin, latin-ext and vietnamese subsets by `unicode-range`, SIL OFL included. It uses `font-display: swap` and a `<link rel="preload">` for the latin subset. Lighthouse attributed ~774 ms of render blocking to the old import.
  - **Hero.** It is server-rendered text with no entrance animation (opacity-0 elements are not LCP candidates).
  - **Blog hero image.** It keeps `fetchpriority="high"` and eager loading, with a correct `sizes`.
- **Logo weight.** The 465 KB `logo.jpg` shown at 40×40 is replaced in the header by a tight crop in AVIF and WebP at 1×/2×/3× (a few KB), with explicit `width`/`height`.
- **CLS.**
  - The fallback font is metric-matched to Work Sans with `size-adjust: 111.9334%`, `ascent-override: 83.0851%`, `descent-override: 21.7093%` and `line-gap-override: 0%`. These are computed from Work Sans's `hhea`/`OS/2` metrics, which match `@capsizecss/metrics`, against Arial.
  - Images have explicit dimensions or an `aspect-ratio` box, and nothing animates layout properties.
- **INP / TBT.**
  - `Hero`, `Services`, `TrustIndicators` and `ValueStack` were client components only because they called a hook for translations. They become server components, so they no longer hydrate.
  - The mobile menu needs no JS scroll locking (CSS `:has()`).
  - Header elevation on scroll is a scroll-driven animation, not a scroll listener.
- **The `?w=0` images.**
  - **Root cause.** The claim that "no `sizes`" causes it doesn't match vinext's code. In `shims/image.js`, when a `loader` is passed, vinext calls it once with `width: imgWidth ?? 0` and emits no `srcset`. A `fill` image has no width, so the URL is always `?w=0`, whatever `sizes` says.
  - **Why the old loader earned nothing.** `/api/media` ignores `w` and `q` (it serves the stored object), and `images.unoptimized: true` is set globally.
  - **Fix.** `BlogFeaturedImage` drops the loader (so no function prop can cross the server/client boundary either) and passes a real `sizes`. The request becomes the plain object URL: one cache key per image instead of one per bogus query.
  - **Not done.** True responsive resizing would need an image-resizing route (an API change) or turning image optimization on (a platform cost). Recorded as a follow-up.

### 4.10 Local SEO
- **Service area.** Named naturally, once, in the visible copy: the hero eyebrow says "Houston & surrounding areas", and the footer lists the four areas the site already names. There is no city list in headings or repeated blocks, which is keyword stuffing per Google's spam policies.
- **Click-to-call** only for the number the site already shows, `832-419-1293`. It was set by Tobias (commit `18ad1a7`, which replaced placeholder `555-000-0000`). Every `tel:` uses the RFC 3966 global form `tel:+18324191293`, while the display format stays `832-419-1293`.
- **Consistency.** Name, phone and areas are identical in the header, hero, footer, contact page and JSON-LD.
- **Off-site factors.** Local ranking comes from the Google Business Profile: relevance, distance and prominence (reviews). Nothing on the website replaces it (questions Q1, Q2).

### 4.11 AI-search readiness
What I adopted, because the research supports it:
- Crawlable, server-rendered pages with snippets allowed.
- Key facts as visible text, never only in images: name, services, service areas, phone, "since 2000".
- JSON-LD that matches the visible text.
- Clear headings, with title and `h1` in agreement.
- A robots.txt wildcard that admits search crawlers (OAI-SearchBot, Claude-SearchBot, PerplexityBot), plus page experience.

What I **rejected**, and why:
- **`llms.txt`.** Google: "Google Search ignores them". No official source says ChatGPT, Claude, Perplexity or Copilot use third-party llms.txt, and a missing file is "Not Applicable" in Lighthouse.
- **Content chunking, "writing for AI", separate Markdown copies.** Google says none are needed.
- **An FAQ block written for AI.** It would be new content, not a rephrase. Microsoft's guidance favours FAQs, but Google's does not require them.

The Search Console generative-AI control defaults to "Include" (Google blog, 2026-06-03, updated 2026-08-31), so nothing needs enabling.

### 4.12 What this PR does not do (SEO follow-ups)
- `noindex` on `/login`, `/signup`, `/auth/complete`, `/profile/complete`: auth pages are out of scope.
- Real image resizing: needs an API route change or paid image optimization.
- A language switcher. None exists today, and it would be new functionality.
- `localeDetection: false` (Q7) and "Always Use HTTPS" (Q8): routing and zone settings.
- The PWA `theme_color` and manifest colours (the dispatch app shares them).

---

## 5. Tests

Added to `tests/smoke/worker-routes.test.ts`, against the built Worker on workerd with synthetic D1 fixtures:
- **one h1:** every public page (en) plus the es and vi home and services, each still guarded against Server Components error rows.
- **canonical per locale:** exactly one `<link rel="canonical">` in `<head>`, equal to the production URL of that locale's path.
- **reciprocal hreflang:** for each page, the en/es/vi documents each list en, es, vi and `x-default`, the three sets are identical, and each document's own canonical is in its set.
- **structured data:** every `application/ld+json` block parses. The home page has `HomeAndConstructionBusiness` (`name`, `url`, `telephone`), `WebSite` (`name`, `url`) and one `Service` per fixture service (`name`, `provider`). The post has `BlogPosting` (`headline`, `datePublished`, `image`). No node contains `aggregateRating`, `review`, `priceRange`, `openingHoursSpecification` or `address`.
- **sitemap:** 200 `application/xml`, contains every static path × locale, `xhtml:link` alternates with `x-default`, and the fixture post and project.
- **robots:** 200 `text/plain`; a small matcher implementing Google's longest-match rule confirms public paths are allowed and `/dashboard`, `/portal` and the `/es/*`, `/vi/*` variants are disallowed; `Sitemap:` is absolute.

Unit tests (`npm test`): the URL, alternates and metadata helpers; the JSON-LD builders (no forbidden properties, `<` escaped); the design-scale checker.

---

## 6. Questions for Tobias

| # | Question | Why it matters |
|---|---|---|
| Q1 | Is there a Google Business Profile? Is it set up as a service-area business, with the four areas the footer lists? | Local pack ranking comes from the profile, not the site |
| Q2 | Is there a public street address customers can visit? | LocalBusiness rich results require `address`. If it's service-area only, leave it out, as now |
| Q3 | Is `832-419-1293` the live business line, and is the "24/7" claim true for phone *and* dispatch? | It is now the click-to-call in the header and on mobile, and it's in the JSON-LD. Hours stay out of the markup until confirmed |
| Q4 | Which email is real: `dispatch@mobilgarage.com` (contact page), `privacy@mobilegaragedoor.com` (privacy page) or `service@mobilgaragedoor.com` (settings default)? Two use a domain that isn't the site's | NAP consistency and the privacy policy's contact route. Emails stay as they are and out of the JSON-LD |
| Q5 | Are there real social profiles (the footer had "IG"/"LN" circles that linked nowhere)? | `sameAs` in JSON-LD and footer links |
| Q6 | Should untranslated blog posts canonicalize to English? | It needs next-intl `alternateLinks: false` to avoid a header/HTML conflict (§4.3) |
| Q7 | Keep automatic `Accept-Language` redirects on `/`? | Google advises against automatic language redirects; changing it is i18n routing |
| Q8 | Turn on Cloudflare "Always Use HTTPS"? | `http://mobilgaragedoor.com/` serves 200 without a redirect, which splits signals |
| Q9 | Should the login, signup and auth pages be `noindex`? | Keeps thin auth pages out of results; they're out of this PR's scope |
| Q10 | Verify or remove the tier-B claims listed in `copy.md` §Facts, especially "State License #9942-B-RES", "Liberty Mutual • $2M Agg", "A+ BBB Accredited", "IDA member" and "Rated #1 by Local Contractors" | Unsubstantiated licence and rating claims are a legal and trust risk. None of them are in the structured data |

## 7. Could not verify
- **X/Twitter card specifications.** developer.x.com returns HTTP 402.
- **Facebook's supported `og:locale` values.** Not on the fetched pages.
- **Partial PostalAddress.** Whether a partial address (city/region only) satisfies Google's LocalBusiness `address` requirement; the docs don't say.
- **Search Console's generative-AI "Include" default** for properties never verified in Search Console.
- **Other AI crawlers.** Whether OAI-SearchBot, Claude-SearchBot and PerplexityBot run JavaScript. The site is server-rendered, so it doesn't depend on it.
- **Two dates.** The exact removal date in the "Farewell, Sitelinks Search Box" post body (only the 2024-11-29 changelog entry was verified), and when Lighthouse removed its `tap-targets`/`plugins` audits.

## 8. Lighthouse before → after

Lighthouse 13.4.1 via `npx` (not a dependency), mobile defaults (Moto G Power emulation, simulated Slow 4G, 4× CPU), headless Chromium 1243, against the local production build on workerd (port 4421) with synthetic D1 data. Median of 3 runs per page, measured serially on the same machine.

*(Filled in after the redesign build; see §8 table below.)*
