import { defineConfig } from 'vitest/config';

/**
 * Smoke suite: drives the built Worker through the real Workers runtime.
 *
 * Kept separate from `npm test` (which runs the fast `src/` unit suite in
 * jsdom) because this one needs a production build, a local D1, and a spawned
 * `wrangler dev`. Single-threaded and serial — every test shares one server on
 * one fixed port.
 */
export default defineConfig({
  test: {
    include: ['tests/smoke/**/*.test.ts'],
    environment: 'node',
    globals: true,
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 200_000,
  },
});
