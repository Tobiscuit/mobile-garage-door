import vinext from "vinext";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

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
  plugins: [
    reflectMetadataPlugin(),
    vinext(),
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
