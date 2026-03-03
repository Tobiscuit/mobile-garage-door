import vinext from "vinext";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  resolve: {
    alias: {
      "blake3-wasm": "blake3-wasm/esm/browser/index.js",
    },
  },
  plugins: [
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
