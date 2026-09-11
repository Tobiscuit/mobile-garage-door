import vinext from "vinext";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";

/**
 * Vite 8 (Rolldown) wraps `reflect-metadata` as a __commonJSMin pure factory
 * that never executes. tsyringe (via @better-auth/passkey) does a top-level
 * `typeof Reflect === "undefined" || !Reflect.getMetadata` check and throws.
 *
 * This plugin finds the wrapped-but-never-called polyfill factory in the built
 * chunk and inserts a call to it before the tsyringe check.
 */
function reflectMetadataPlugin() {
  return {
    name: "reflect-metadata-fix",
    renderChunk(code: string) {
      if (!code.includes('tsyringe requires a reflect polyfill')) {
        return null; // Not the affected chunk
      }
      // Find the lazy CJS wrapper variable: `var require_Reflect = __commonJSMin(...)`
      // and insert a call to it right after its declaration
      const match = code.match(/var (require_Reflect\w*)\s*=\s*\/\*\s*@__PURE__\s*\*\/\s*__commonJSMin/);
      if (match) {
        const varName = match[0].split("=")[0].trim().replace("var ", "");
        // Insert call right before the tsyringe check
        const fixed = code.replace(
          'if (typeof Reflect === "undefined" || !Reflect.getMetadata) throw new Error("tsyringe requires',
          `${varName}();\nif (typeof Reflect === "undefined" || !Reflect.getMetadata) throw new Error("tsyringe requires`
        );
        return { code: fixed, map: null };
      }
      // Fallback: just stub Reflect.getMetadata before the check
      const fallback = code.replace(
        'if (typeof Reflect === "undefined" || !Reflect.getMetadata) throw new Error("tsyringe requires',
        `if (typeof Reflect !== "undefined" && !Reflect.getMetadata) { try { var _rm = require_Reflect(); } catch(e) {} }\nif (typeof Reflect === "undefined" || !Reflect.getMetadata) throw new Error("tsyringe requires`
      );
      if (fallback !== code) {
        return { code: fallback, map: null };
      }
      return null;
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      "blake3-wasm": "blake3-wasm/esm/browser/index.js",
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            /**
             * Keep all of drizzle-orm in one chunk.
             *
             * The root `drizzle-orm` barrel (imported across this codebase for
             * `eq`, `and`, `relations`, ...) pulls in `relations.js`, which
             * imports `pg-core/primary-keys.js` — so Postgres dialect code is
             * reachable even though this app only uses D1/SQLite. Rolldown was
             * splitting `PgTable` into a different chunk from the base `Table`
             * it extends, and evaluating it first, so the class body's
             * computed keys read `Table.Symbol` off an uninitialised import:
             *
             *   TypeError: Cannot read properties of undefined (reading 'Symbol')
             *
             * which made every server-rendered route return 500. Grouping the
             * package into a single chunk restores module evaluation order.
             */
            {
              name: "drizzle-orm",
              test: /node_modules[\\/]drizzle-orm[\\/]/,
            },
          ],
        },
      },
    },
  },
  plugins: [
    reflectMetadataPlugin(),
    // vinext 1.0 declares cache backends here instead of constructing a handler
    // by hand in a worker entry — the builder returns a serializable descriptor
    // and the adapter is instantiated lazily on the first request. The binding
    // and key prefix are carried over verbatim from the deleted worker/index.ts,
    // so existing cache entries keep their keys (the adapter would otherwise
    // default to a VINEXT_KV_CACHE binding).
    vinext({
      cache: {
        data: kvDataAdapter({
          binding: "VINEXT_CACHE",
          appPrefix: "mobile-garage-door",
        }),
      },
    }),
    tsconfigPaths(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
  ],
  environments: {
    rsc: {
      build: {
        rollupOptions: {
          external: [
            // Prevent Cloudflare plugin dev tooling from being bundled
            "@cloudflare/vite-plugin",
            "wrangler",
            "miniflare",
          ],
        },
      },
    },
  },
});
