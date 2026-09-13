import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * `next/*` specifiers are resolved by the vinext Vite plugin during dev and
 * build. Vitest does not run that plugin, so without these aliases Vite's
 * import analysis fails on `import { usePathname } from "next/navigation"`
 * before any `vi.mock()` can intercept it — which is why the Header and
 * Sidebar suites failed to collect at all.
 *
 * vinext exports `./shims/*` on both the 0.0.x and 1.0 lines, so this mapping
 * survives the upgrade.
 */
const nextShims = ['navigation', 'headers', 'server', 'cache', 'image', 'script', 'link'];

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      // import.meta.dirname, not __dirname: Vite's native config loader (the
      // planned default) does not provide CommonJS globals, and vitest 5 warns
      // about them.
      '@': path.resolve(import.meta.dirname, './src'),
      ...Object.fromEntries(
        nextShims.map((shim) => [`next/${shim}`, `vinext/shims/${shim}`]),
      ),
    },
  },
});
