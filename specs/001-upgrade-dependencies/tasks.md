# Tasks 001 — Upgrade dependencies to current stable

Kept current as the work proceeds. `[x]` done, `[ ]` outstanding, `[~]` in progress.

## 1. Baseline and spec

- [x] Reproduce the install; discover `npm ci` fails ERESOLVE, record the cause
- [x] Measure every gate on the old dependencies (build ✅ / typecheck ❌ / lint ❌ / tests ❌ / i18n ✅)
- [x] Classify each pre-existing failure to a root cause
- [x] Read the house conventions (`docs/adr/`, `docs/plans/`, `.cursorrules`, the repo's `migrate-to-vinext` skill)
- [x] Verify every target version with `npm view`
- [x] Pull migration guidance: vinext, better-auth 1.7, Square, Tailwind v4
- [x] Confirm the vinext 1.0 API surface from shipped package metadata and types
- [x] Write `spec.md`, `plan.md`, `tasks.md`

## 2. Test net, green on the OLD dependencies

- [ ] Make `next/*` resolve under vitest
- [ ] Remove the dead `@/features/payload/Logo` mock from `Sidebar.test.tsx`
- [ ] Give the next-intl-dependent component tests a real message context
- [ ] All 8 existing test files green on the old dependencies
- [ ] Smoke tests: key public routes, both localized prefixes, 404, redirects
- [ ] API contract tests: unauthenticated calls return their current status and shape
- [ ] Square webhook signature test against a locally signed fixture
- [ ] Commit the net before changing a single dependency

## 3. Framework and build

- [ ] `vinext` → 1.0.0-beta.9, add `@vinext/cloudflare` 1.0.0-beta.7
- [ ] Declare `kvDataAdapter` in `vite.config.ts`, preserving binding and prefix
- [ ] `wrangler.jsonc` `main` → `vinext/server/fetch-handler`; delete `worker/index.ts`
- [ ] Drop the `KVCacheHandler` re-export from `src/lib/cloudflare.ts`
- [ ] vite 8.3.0, plugin-react 6.1.1, plugin-rsc 0.5.34, cloudflare vite-plugin 1.54.8, wrangler 4.131.1
- [ ] `@cloudflare/workers-types` 5.x; wire types via `vinext-env.d.ts` + tsconfig
- [ ] TypeScript 7.0.2; remove the stale `next` tsconfig plugin entry
- [ ] Gate green

## 4. Auth

- [ ] `better-auth` + `@better-auth/passkey` → 1.7.4
- [ ] Generate the 1.7 schema from an isolated scratch config
- [ ] Author `0017_*.sql` (account `issuer` + unique compound index) in the wrangler convention
- [ ] Mirror the column into `src/db/schema.ts`
- [ ] Apply to a **local** D1 that already has 0000–0016 — never `--remote`
- [ ] Delete the dead `src/lib/auth/options.ts`
- [ ] Gate green

## 5. Payments

- [ ] `square` → 45.1.0
- [ ] Migrate to `WebhooksHelper.verifySignature({...})`
- [ ] Fix the webhook header to `x-square-hmacsha256-signature`; reject invalid signatures
- [ ] Signature test passes for valid, invalid, and missing signatures
- [ ] Gate green

## 6. Remaining libraries and hygiene

- [ ] lucide-react 1.x (check icon renames across 8 sites)
- [ ] motion 13, @google/genai 2, next-intl, resend, tiptap, tailwind, misc
- [ ] vitest 5, jsdom 30, jest-dom 7, playwright 1.63, eslint 10.10
- [ ] `@types/node` → 26.x (not `latest`); react types 19.3
- [ ] Remove the six unused packages; drop autoprefixer from `postcss.config.cjs`
- [ ] `.nvmrc` → 26, `engines.node` → `>=26.0.0`
- [ ] `npm ci` works **without** `--legacy-peer-deps`
- [ ] `npm outdated` clean except documented holds; record `npm audit`

## 7. CI and delivery

- [ ] `.github/workflows/ci.yml` — install, typecheck, lint:i18n, tests, build, smoke
- [ ] Least-privilege permissions, concurrency group, npm cache, current action majors
- [ ] Do **not** touch `deploy-worker.yml`
- [ ] Push the branch, open the PR, watch CI to completion
- [ ] PR documents: from→to, breaking changes, the DB migration and its ordering, holds, test evidence, manual checklist
