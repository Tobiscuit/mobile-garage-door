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
  });

  it.each(['/services', '/portfolio', '/contact'])(
    'serves %s',
    async (path) => {
      const response = await fetch(`${BASE_URL}${path}`);
      expect(response.status).toBe(200);
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
    expect(await response.text()).toContain('<title>');
  });
});

describe('unknown routes', () => {
  it('returns 404 rather than an error page', async () => {
    const response = await fetch(`${BASE_URL}/this-route-does-not-exist`);
    expect(response.status).toBe(404);
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
