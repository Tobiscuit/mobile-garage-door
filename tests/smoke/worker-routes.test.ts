import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';

/**
 * Smoke tests for the built Worker, served by the real Workers runtime
 * (workerd, via `wrangler dev`) rather than a Node shim.
 *
 * Prerequisite, which CI performs before this suite: `npm run build` —
 * `wrangler dev` serves the build output.
 *
 * The suite prepares its own local D1 in `beforeAll`, because two independent
 * problems meant the server never read the database the migrations built:
 *
 *   1. `wrangler dev -c dist/server/wrangler.json` persists local state beside
 *      that config, in dist/server/.wrangler/state, while
 *      `wrangler d1 migrations apply --local` writes to ./.wrangler/state. The
 *      server was reading an empty database. Every command here now passes the
 *      same --persist-to.
 *   2. On an empty database, 0005_seed_settings.sql fails a foreign key: it
 *      inserts rows referencing production's singleton settings row, which
 *      does not exist yet. That stopped the run, so every later migration —
 *      including 0011_blog_pipeline — was skipped. The suite recreates the
 *      precondition instead of editing a migration production already applied.
 *
 * Bindings are local-only miniflare state. The three vars below are dummy
 * values injected on the command line: nothing is read from `.dev.vars`, and
 * no real credential is required to run this suite. `BETTER_AUTH_SECRET` in
 * particular must be set to *something*, or better-auth refuses to start and
 * every server-rendered page returns 500.
 */

const PORT = Number(process.env.SMOKE_PORT ?? 4401);
const INSPECTOR_PORT = Number(process.env.SMOKE_INSPECTOR_PORT ?? 9234);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const PERSIST_TO = '.wrangler/state';
const DATABASE_TIMEOUT_MS = 120_000;
const READY_TIMEOUT_MS = 180_000;

let server: ChildProcess | undefined;

function runWrangler(args: string[]): void {
  execFileSync('npx', ['wrangler', ...args], { stdio: 'pipe', timeout: 60_000 });
}

function prepareLocalDatabase(): void {
  const applyMigrations = ['d1', 'migrations', 'apply', 'DB', '--local', '--persist-to', PERSIST_TO];
  const executeFile = (file: string) => [
    'd1', 'execute', 'DB', '--local', '--persist-to', PERSIST_TO, '--file', file,
  ];

  try {
    runWrangler(applyMigrations);
  } catch {
    // Expected on an empty database: 0005_seed_settings.sql stops the run.
  }
  runWrangler(executeFile('tests/smoke/fixtures/settings-singleton.sql'));
  // With the precondition in place, every remaining migration must apply.
  runWrangler(applyMigrations);
  runWrangler(executeFile('tests/smoke/fixtures/blog-posts.sql'));
  // Synthetic services, testimonials and a project, so the data-driven parts
  // of the public pages (service cards, their Service JSON-LD, the sitemap's
  // project entries) render instead of their empty states.
  runWrangler(executeFile('tests/smoke/fixtures/public-content.sql'));
}

async function waitUntilServing(deadline: number): Promise<void> {
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      await fetch(BASE_URL, { signal: AbortSignal.timeout(5_000) });
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(
    `wrangler dev did not start within ${READY_TIMEOUT_MS}ms: ${String(lastError)}`,
  );
}

/**
 * A Server Component that fails to render or serialize does not change the
 * response status. The server streams an error row (`"<id>:E{"digest":…}`)
 * into the inline RSC payload, and the browser then throws React error #441
 * into the nearest error boundary. A 200 alone proves nothing: the payload has
 * to be free of error rows.
 */
function expectNoServerComponentsRenderError(html: string): void {
  expect(html).not.toMatch(/"\d+:E\{/);
}

beforeAll(async () => {
  prepareLocalDatabase();
  server = spawn(
    'npx',
    [
      'wrangler',
      'dev',
      // Serve the plugin-generated config, not the source wrangler.jsonc.
      // vinext 1.0 sets `main` to the bare specifier
      // "vinext/server/fetch-handler", which wrangler's own bundler cannot
      // resolve; @cloudflare/vite-plugin emits a complete, deployable config
      // alongside the build output, and that is what actually runs.
      '-c',
      'dist/server/wrangler.json',
      // Without this, state persists beside dist/server/wrangler.json and the
      // server reads an empty database instead of the one prepared above.
      '--persist-to',
      PERSIST_TO,
      '--port',
      String(PORT),
      '--inspector-port',
      String(INSPECTOR_PORT),
      '--var',
      'BETTER_AUTH_SECRET:local-smoke-test-value-not-a-real-secret',
      '--var',
      `BETTER_AUTH_BASE_URL:${BASE_URL}`,
      '--var',
      `NEXT_PUBLIC_SERVER_URL:${BASE_URL}`,
    ],
    { stdio: 'ignore', detached: true },
  );
  await waitUntilServing(Date.now() + READY_TIMEOUT_MS);
}, DATABASE_TIMEOUT_MS + READY_TIMEOUT_MS + 10_000);

afterAll(() => {
  if (server?.pid !== undefined) {
    try {
      process.kill(-server.pid, 'SIGTERM');
    } catch {
      // already gone
    }
  }
});

describe('public pages render', () => {
  it('serves the home page with its real title', async () => {
    const response = await fetch(BASE_URL);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/text\/html/);

    const html = await response.text();
    expect(html).toContain('<title>');
    expect(html).toContain('Mobil Garage Door');
    expectNoServerComponentsRenderError(html);
  });

  it.each(['/services', '/portfolio', '/contact'])(
    'serves %s without a Server Components error',
    async (path) => {
      const response = await fetch(`${BASE_URL}${path}`);
      expect(response.status).toBe(200);
      expectNoServerComponentsRenderError(await response.text());
    },
  );
});

describe('blog', () => {
  // The fixture post has a featured image, like every published production
  // post. That branch renders next/image; an empty blog never does, which is
  // how a crash on every real post went unnoticed.
  const FIXTURE_TITLE = 'Smoke Fixture Post With A Featured Image';

  it.each(['/blog', '/blog/smoke-fixture-post-with-featured-image'])(
    'renders %s with its featured image and no Server Components error',
    async (path) => {
      const response = await fetch(`${BASE_URL}${path}`);
      expect(response.status).toBe(200);

      const html = await response.text();
      expect(html).toContain(FIXTURE_TITLE);
      expect(html).toMatch(/<img[^>]+smoke-fixture-cover\.webp/);
      expectNoServerComponentsRenderError(html);
    },
  );
});

describe('localized routing', () => {
  // next-intl is configured with localePrefix "as-needed": en is unprefixed,
  // es and vi are served under their prefix.
  it.each(['/es', '/vi'])('serves the %s locale prefix', async (path) => {
    const response = await fetch(`${BASE_URL}${path}`);
    expect(response.status).toBe(200);

    const html = await response.text();
    expect(html).toContain('<title>');
    expectNoServerComponentsRenderError(html);
  });
});

describe('unknown routes', () => {
  it('returns 404 rather than an error page', async () => {
    const response = await fetch(`${BASE_URL}/this-route-does-not-exist`);
    expect(response.status).toBe(404);
  });
});

/*
 * SEO — specs/002-design-refresh/seo.md. What a crawler receives in the HTML,
 * so everything is asserted on the server response without running scripts.
 */
const SITE_ORIGIN = 'https://mobilgaragedoor.com';
const LOCALES = ['en', 'es', 'vi'] as const;
type Locale = (typeof LOCALES)[number];
const GOOGLEBOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const BROWSER_UA = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36';
const AI_SEARCH_UA = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.3; +https://openai.com/searchbot';

/** Locale-independent paths of the redesigned public pages (fixture slugs for the detail pages). */
const STATIC_PAGES = ['/', '/services', '/about', '/portfolio', '/blog', '/contact', '/privacy'];
const DETAIL_PAGES = ['/portfolio/sample-project', '/blog/smoke-fixture-post-with-featured-image'];
const ALL_PAGES = [...STATIC_PAGES, ...DETAIL_PAGES];

/** next-intl "as-needed": en unprefixed, es and vi prefixed. */
function localizedPath(locale: Locale, path: string): string {
  if (locale === 'en') return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

/** Production URL, formatted the way vinext resolves canonicals (root without a trailing slash). */
function productionUrl(locale: Locale, path: string): string {
  const pathname = localizedPath(locale, path);
  return pathname === '/' ? SITE_ORIGIN : `${SITE_ORIGIN}${pathname}`;
}

async function fetchPage(path: string, userAgent = GOOGLEBOT_UA) {
  const response = await fetch(`${BASE_URL}${path}`, { headers: { 'user-agent': userAgent } });
  const html = await response.text();
  const endOfHead = html.indexOf('</head>');
  return { response, html, head: endOfHead === -1 ? '' : html.slice(0, endOfHead) };
}

const attribute = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))?.[1];

function canonicalLinks(head: string): string[] {
  return [...head.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => /\srel="canonical"/i.test(tag))
    .map((tag) => attribute(tag, 'href') ?? '');
}

function hreflangLinks(head: string): Record<string, string> {
  const cluster: Record<string, string> = {};
  for (const [tag] of head.matchAll(/<link\b[^>]*>/gi)) {
    if (!/\srel="alternate"/i.test(tag)) continue;
    const language = attribute(tag, 'hreflang');
    const href = attribute(tag, 'href');
    if (language && href) cluster[language] = href;
  }
  return cluster;
}

/** hreflang → pathname from next-intl's Link response header (its origin is the request's). */
function linkHeaderCluster(header: string | null): Record<string, string> {
  const cluster: Record<string, string> = {};
  for (const part of (header ?? '').split(/,\s*(?=<)/)) {
    const url = part.match(/<([^>]+)>/)?.[1];
    const language = part.match(/hreflang="([^"]+)"/)?.[1];
    if (url && language) cluster[language] = new URL(url).pathname;
  }
  return cluster;
}

function jsonLdBlocks(html: string): unknown[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
}

function jsonLdNodes(html: string): Array<Record<string, unknown>> {
  return jsonLdBlocks(html).flatMap((block: any) => (Array.isArray(block?.['@graph']) ? block['@graph'] : [block]));
}

function allKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach((item) => allKeys(item, keys));
  else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      keys.add(key);
      allKeys(child, keys);
    }
  }
  return keys;
}

/** Google's robots.txt rule: the longest matching path wins; on a tie, allow wins. */
function isAllowedByRobots(robotsTxt: string, path: string): boolean {
  let inWildcardGroup = false;
  let best: { length: number; allow: boolean } | null = null;
  for (const rawLine of robotsTxt.split('\n')) {
    const line = rawLine.replace(/#.*/, '').trim();
    const [field, ...rest] = line.split(':');
    const value = rest.join(':').trim();
    if (!field) continue;
    const name = field.trim().toLowerCase();
    if (name === 'user-agent') {
      inWildcardGroup = value === '*';
      continue;
    }
    if (!inWildcardGroup || (name !== 'allow' && name !== 'disallow') || !value) continue;
    const pattern = new RegExp(`^${value.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$')}`);
    if (!pattern.test(path)) continue;
    const allow = name === 'allow';
    if (!best || value.length > best.length || (value.length === best.length && allow)) best = { length: value.length, allow };
  }
  return best ? best.allow : true;
}

describe('SEO: headings', () => {
  it.each(LOCALES.flatMap((locale) => ALL_PAGES.map((path) => localizedPath(locale, path))))(
    '%s renders exactly one h1',
    async (path) => {
      const { response, html } = await fetchPage(path);
      expect(response.status).toBe(200);
      expect(html.match(/<h1[\s>]/gi) ?? []).toHaveLength(1);
      expectNoServerComponentsRenderError(html);
    },
  );
});

describe('SEO: metadata in <head>', () => {
  it.each(LOCALES.flatMap((locale) => ALL_PAGES.map((path) => [locale, path] as const)))(
    '%s %s has one self-referencing absolute canonical',
    async (locale, path) => {
      const { head } = await fetchPage(localizedPath(locale, path));
      expect(canonicalLinks(head)).toEqual([productionUrl(locale, path)]);
    },
  );

  it.each([GOOGLEBOT_UA, BROWSER_UA, AI_SEARCH_UA])(
    'serves title, description and canonical in the initial <head> to %s',
    async (userAgent) => {
      // htmlLimitedBots: /.*/ — metadata must not stream into <body> for any user agent.
      const { head } = await fetchPage('/services', userAgent);
      expect(head).toMatch(/<title>[^<]+\| Mobil Garage Door<\/title>/);
      expect(head).toMatch(/<meta name="description" content="[^"]+"/);
      expect(canonicalLinks(head)).toEqual([productionUrl('en', '/services')]);
    },
  );

  it('gives every static page a unique title and description in every locale', async () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    let count = 0;
    for (const locale of LOCALES) {
      for (const path of STATIC_PAGES) {
        const { head } = await fetchPage(localizedPath(locale, path));
        titles.add(head.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
        descriptions.add(head.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
        count += 1;
      }
    }
    expect(titles.size).toBe(count);
    expect(descriptions.size).toBe(count);
  });

  it.each(LOCALES)('declares %s as the document language', async (locale) => {
    const { html } = await fetchPage(localizedPath(locale, '/'));
    expect(html).toMatch(new RegExp(`<html[^>]*\\slang="${locale}"`));
  });
});

describe('SEO: hreflang', () => {
  it.each(ALL_PAGES)('%s lists every language version and x-default, reciprocally', async (path) => {
    const expected = {
      en: productionUrl('en', path),
      es: productionUrl('es', path),
      vi: productionUrl('vi', path),
      'x-default': productionUrl('en', path),
    };
    for (const locale of LOCALES) {
      const { response, head } = await fetchPage(localizedPath(locale, path));
      const cluster = hreflangLinks(head);
      // Each version lists itself and all the others (identical clusters)…
      expect(cluster).toEqual(expected);
      // …including its own canonical URL,
      expect(Object.values(cluster)).toContain(canonicalLinks(head)[0]);
      // …and agrees with the cluster next-intl sends in the Link header.
      const fromHeader = linkHeaderCluster(response.headers.get('link'));
      expect(fromHeader).toEqual(Object.fromEntries(Object.entries(expected).map(([language, url]) => [language, new URL(url).pathname])));
    }
  });
});

describe('SEO: structured data', () => {
  const FORBIDDEN = [
    'aggregateRating', 'review', 'priceRange', 'openingHoursSpecification', 'openingHours', 'address', 'geo',
    'hasCredential', 'hasCertification', 'memberOf', 'award',
  ];

  it.each(LOCALES.flatMap((locale) => ALL_PAGES.map((path) => localizedPath(locale, path))))(
    '%s has only parseable JSON-LD, with no invented ratings, prices, hours, address, credentials or awards',
    async (path) => {
      const { html } = await fetchPage(path);
      const blocks = jsonLdBlocks(html); // throws if any block doesn't parse
      const keys = allKeys(blocks);
      for (const key of FORBIDDEN) expect(keys.has(key), `${path} contains ${key}`).toBe(false);
    },
  );

  it('describes the business, the site and each listed service on the home page', async () => {
    const nodes = jsonLdNodes((await fetchPage('/')).html);
    const business = nodes.find((node) => node['@type'] === 'HomeAndConstructionBusiness');
    expect(business).toMatchObject({ name: 'Mobil Garage Door', url: SITE_ORIGIN, telephone: '+1-832-419-1293' });

    const website = nodes.find((node) => node['@type'] === 'WebSite');
    // Google's required site-name properties.
    expect(website).toMatchObject({ name: 'Mobil Garage Door', url: SITE_ORIGIN });

    const services = nodes.filter((node) => node['@type'] === 'Service');
    expect(services.map((service) => service.name)).toEqual([
      'Sample Repair Service',
      'Sample Contractor Service',
      'Sample Installation Service',
    ]);
    for (const service of services) expect(service.provider).toMatchObject({ '@type': 'HomeAndConstructionBusiness', name: 'Mobil Garage Door' });
  });

  it('marks up a blog post as a BlogPosting with its headline, date and image', async () => {
    const nodes = jsonLdNodes((await fetchPage('/blog/smoke-fixture-post-with-featured-image')).html);
    const posting = nodes.find((node) => node['@type'] === 'BlogPosting');
    expect(posting).toMatchObject({
      headline: 'Smoke Fixture Post With A Featured Image',
      datePublished: '2026-01-01T00:00:00.000Z',
      image: `${SITE_ORIGIN}/api/media/blog/smoke-fixture-cover.webp`,
    });
  });
});

/**
 * Trust claims Tobias confirmed are not real (2026-09-14; specs/002-design-refresh/copy.md §2):
 * the state licence number, the insurer and its $2M policy, BBB accreditation, IDA
 * membership and certified technicians, and the "#1" ranking. Also the generic
 * licensed/insured/accredited lines that rested on them, in all three languages.
 * The last pattern catches the sentinels public-content.sql stores in the dashboard's
 * licence, insurance and BBB settings.
 */
const FALSE_TRUST_CLAIMS: RegExp[] = [
  /9942/,
  /Liberty Mutual/i,
  /\$\s?2\s?M\b/,
  /\$\s?2 million/i,
  /2 triệu đô/i,
  /\bBBB\b/,
  /Better Business Bureau/i,
  /\bIDA\b/,
  /International Door Association/i,
  /\b(rated|ranked|como)\s+#\s?1\b/i,
  /xếp hạng\s+#\s?1\b/i,
  /#\s?1\s+(by|among|in|entre|por|bởi)\b/i,
  /\blicen[cs]ed\b/i,
  /\bstate licen[cs]e\b/i,
  /\blicen[cs]e\s*(&|and)\s*insurance\b/i,
  /\bbonded\b/i,
  /\binsured\b/i,
  /\bliability (coverage|insurance)\b/i,
  /\baccredit(ed|ation)\b/i,
  /\bcertified tech/i,
  /\bcon licencia\b/i,
  /\blicencia estatal\b/i,
  /\blicencia y seguro\b/i,
  /\basegurad[oa]s?\b/i,
  /\bacreditad[oa]s?\b/i,
  /\bacreditación\b/i,
  /\btécnicos certificados\b/i,
  /responsabilidad civil/i,
  /cấp phép/i,
  /có bảo hiểm/i,
  /bảo hiểm trách nhiệm/i,
  /giấy phép tiểu bang/i,
  /giấy phép(,| và) bảo hiểm/i,
  /được chứng nhận/i,
  /SMOKE-SENTINEL-/,
];

/**
 * All the text a page ships: the markup (JSON-LD included) plus the inline RSC
 * payload the browser hydrates from. The public layout hands the whole message
 * catalogue to the client, so a message no component renders still ships in the
 * payload. vinext pushes the payload from inline scripts as string chunks that
 * split mid-word, so the chunks are decoded and joined before matching. The
 * object they're pushed onto differs by build (the live site's HTML uses
 * `self.__VINEXT_RSC_CHUNKS__`, this branch's build a navigation-runtime
 * object), so any inline `.push("…")` counts.
 */
function shippedText(html: string): { text: string; payload: string } {
  const inlineScripts = [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
  const payload = inlineScripts
    .flatMap((script) => [...script.matchAll(/\.push\(("(?:[^"\\]|\\.)*")\)/g)])
    .map((match) => JSON.parse(match[1]) as string)
    .join('');
  const markup = html
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  return { text: `${markup}\n${payload}`.normalize('NFC'), payload };
}

describe('trust claims', () => {
  const PAGES = [...ALL_PAGES, '/login', '/signup'];

  it.each(LOCALES.flatMap((locale) => PAGES.map((path) => localizedPath(locale, path))))(
    '%s ships none of the licence, insurance, BBB, IDA or #1 claims',
    async (path) => {
      const { response, html } = await fetchPage(path, BROWSER_UA);
      expect(response.status).toBe(200);
      const { text, payload } = shippedText(html);
      // The scan must see the hydration payload, or a claim hiding there would pass unnoticed.
      expect(payload).toContain('Mobil Garage Door');
      for (const claim of FALSE_TRUST_CLAIMS) {
        expect(text.match(claim)?.[0], `${path} matches ${claim}`).toBeUndefined();
      }
    },
  );
});

describe('SEO: sitemap.xml', () => {
  it('is reachable and lists every public page in every locale, with alternates', async () => {
    const response = await fetch(`${BASE_URL}/sitemap.xml`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/xml/);
    const xml = await response.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

    for (const locale of LOCALES) {
      for (const path of ALL_PAGES) expect(locs).toContain(productionUrl(locale, path));
    }
    expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="x-default" href="${productionUrl('en', '/services')}" />`);
    expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="vi" href="${productionUrl('vi', '/blog/smoke-fixture-post-with-featured-image')}" />`);
    // Nothing private or API-shaped.
    expect(locs.some((loc) => /\/(dashboard|portal|admin|api|login|signup)(\/|$)/.test(new URL(loc).pathname))).toBe(false);
  });
});

describe('SEO: robots.txt', () => {
  it('allows public pages, blocks portal and dashboard, and points to the sitemap', async () => {
    const response = await fetch(`${BASE_URL}/robots.txt`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/text\/plain/);
    const robots = await response.text();

    for (const path of ['/', '/services', '/es/blog', '/vi/portfolio/sample-project', '/blog/smoke-fixture-post-with-featured-image', '/api/media/blog/smoke-fixture-cover.webp', '/login']) {
      expect(isAllowedByRobots(robots, path), `${path} should be allowed`).toBe(true);
    }
    for (const path of ['/dashboard', '/dashboard/dispatch', '/portal', '/portal/track/T-1', '/admin/mission-control', '/es/dashboard', '/vi/portal']) {
      expect(isAllowedByRobots(robots, path), `${path} should be disallowed`).toBe(false);
    }
    expect(robots).toMatch(new RegExp(`^Sitemap: ${SITE_ORIGIN}/sitemap\\.xml$`, 'm'));
  });
});

describe('API contracts for unauthenticated callers', () => {
  it('rejects the notifications feed with 401', async () => {
    const response = await fetch(`${BASE_URL}/api/notifications`);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('returns an empty prefill rather than an error', async () => {
    const response = await fetch(`${BASE_URL}/api/user/prefill`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ prefill: null });
  });

  it('rejects an unauthenticated tracking status update', async () => {
    const response = await fetch(`${BASE_URL}/api/tracking/status`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ serviceRequestId: 1, status: 'dispatched' }),
    });
    expect(response.status).toBe(401);
  });
});
