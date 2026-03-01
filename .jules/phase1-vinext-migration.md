Phase 1: Migrate from Next.js 16 to Vinext (Cloudflare's Next.js replacement on Vite).

IMPORTANT: First install the Vinext Agent Skill: npx skills add cloudflare/vinext — then follow its migration instructions.

This is a garage door service company app (Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript). We want to migrate to Vinext and deploy to Cloudflare Workers.

Steps:
1. Run `npx vinext init` to automate initial migration (installs vinext, vite, @vitejs/plugin-rsc, generates vite.config.ts, adds type:module)
2. Run `npx vinext check` and fix any compatibility issues
3. Replace all `next` references in package.json scripts with `vinext` (dev, build, start)
4. Add a deploy script: `vinext deploy`
5. Remove the `next` and `eslint-config-next` dependencies
6. Keep ALL existing app/ routes, components, features, and styles as-is — Vinext supports App Router natively
7. Handle known issues:
   - `sharp` is used for images — Vinext auto-stubs this for Workers
   - `next-intl` may need replacement — check compatibility, if not working swap for react-i18next
   - Payload CMS packages will show errors — that is OK, they will be replaced in Phase 2 (do NOT remove them yet)
   - `postcss.config.js` may need renaming to `.cjs`
8. Create a basic `wrangler.jsonc` with:
   - name: mobile-garage-door
   - compatibility_date: 2025-12-01
   - Placeholder bindings for R2 (MEDIA_BUCKET), KV (CACHE), and D1 (DB)
9. Test that `vinext dev` starts without crashing
10. Do NOT touch any Payload CMS code, auth code, or database code — that is Phase 2

The migration should be non-destructive. The existing Next.js setup should continue to work alongside vinext until we fully cut over.
