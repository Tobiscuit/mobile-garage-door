import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';

/**
 * Smoke tests for the built Worker, served by the real Workers runtime
 * (workerd, via `wrangler dev`) rather than a Node shim.
 *
 * Prerequisites, both of which CI performs before this suite:
 *   1. `npm run build` — `wrangler dev` serves the build output.
 *   2. `wrangler d1 migrations apply DB --local` — pages query D1, and an
 *      empty database makes the server render fail.
 *
 * Bindings are local-only miniflare state. The three vars below are dummy
 * values injected on the command line: nothing is read from `.dev.vars`, and
 * no real credential is required to run this suite. `BETTER_AUTH_SECRET` in
 * particular must be set to *something*, or better-auth refuses to start and
 * every server-rendered page returns 500.
 */

const PORT = 4401;
const INSPECTOR_PORT = 9234;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const READY_TIMEOUT_MS = 180_000;

let server: ChildProcess | undefined;

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

beforeAll(async () => {
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
}, READY_TIMEOUT_MS + 10_000);

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
