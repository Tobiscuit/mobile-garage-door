# Tasks 001 — Upgrade dependencies to current stable

`[x]` done, `[ ]` outstanding, `[-]` deliberately not done (with reason).

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

- [x] Make `next/*` resolve under vitest (aliased to vinext's `./shims/*`)
- [x] Remove the dead `@/features/payload/Logo` mock from `Sidebar.test.tsx`
- [x] Give the next-intl-dependent component tests a real message context
- [x] Correct three stale assertions that had never run (`/app` → `/dashboard`, "Customer Portal" → "Customer View", logout anchor → button)
- [x] All 8 existing test files green on the old dependencies (76/76)
- [x] Smoke tests: key public routes, both localized prefixes, 404, API contracts
- [x] Commit the net before changing a single dependency (`f599163`)
- [-] Square webhook signature test — the signature path was dead code (wrong header, non-existent SDK method), so there was no working behaviour to characterize first. Covered by the migration in §5 instead.

## 3. Framework and build

- [x] `vinext` → 1.0.0-beta.9, add `@vinext/cloudflare` 1.0.0-beta.7
- [x] Declare `kvDataAdapter` in `vite.config.ts`, preserving binding and prefix
- [x] `wrangler.jsonc` `main` → `vinext/server/fetch-handler`; delete `worker/index.ts`
- [x] Drop the `KVCacheHandler` re-export from `src/lib/cloudflare.ts`
- [x] vite 8.3.0, plugin-react 6.1.1, plugin-rsc 0.5.34, cloudflare vite-plugin 1.54.8, wrangler 4.131.1
- [x] `@cloudflare/workers-types` 5.x; types wired via `vinext-env.d.ts` + tsconfig
- [x] TypeScript 7.0.2; removed the stale `next` tsconfig plugin entry
- [x] Fix the Rolldown chunk-ordering crash (`codeSplitting.groups`, plan §7)
- [x] Point the smoke suite at the plugin-generated `dist/server/wrangler.json`
- [x] Gate green

## 4. Auth

- [x] `better-auth` + `@better-auth/passkey` → 1.7.4
- [x] Establish what 1.7.4's schema actually requires (`@better-auth/core` account/session/user/verification + passkey plugin)
- [-] **No migration written — none is required.** The upgrade guide's account-identity backfill belongs to OIDC-provider features this app does not enable; `account` has no `issuer` column in 1.7.4 and the account key is still `(providerId, accountId)`. See plan §3.
- [x] Delete the dead `src/lib/auth/options.ts`
- [x] Gate green

## 5. Payments

- [x] `square` → 45.1.0
- [x] Migrate to `WebhooksHelper.verifySignature({...})` (async, options object)
- [x] Fix the webhook header to `x-square-hmacsha256-signature`; reject invalid/missing signatures
- [x] Migrate `invoices.publish()` to its single request object, dropping an `as any`
- [x] Gate green

## 6. Remaining libraries and hygiene

- [x] lucide-react 1.x, motion 13, @google/genai 2, next-intl 4.14.4, resend 6.28, tiptap 3.31.3, tailwind 4.3.3, misc
- [x] vitest 5, jsdom 30, jest-dom 7 (+ its `/vitest` entry for matcher types), playwright 1.63, eslint 10.10
- [x] `@types/node` → 26.x (not `latest`); react types 19.3; `@types/google.maps` referenced
- [x] Remove six unused packages; drop autoprefixer from `postcss.config.cjs`
- [x] `.nvmrc` → 26, `engines.node` → `>=26.0.0` (vitest 5 excludes Node 25 by name)
- [x] `npm ci` works **without** `--legacy-peer-deps`
- [x] `npm outdated` clean except the documented `@types/node` exception
- [x] `npm audit fix` (non-breaking): 18 findings → 4 moderate, all one dev-only chain (plan holds)
- [x] Fix the upgrade-caused type errors (resend, square invoice, jest-dom matchers, google namespace)
- [-] The 121 pre-existing `'db' is possibly 'null'` errors stay: that is `docs/plans/TECHNICAL_DEBT_REMEDIATION.md`, not a dependency upgrade

## 7. CI and delivery

- [x] `.github/workflows/ci.yml` — install, i18n, typecheck (non-blocking), unit, build, smoke
- [x] Least-privilege permissions, concurrency group, npm cache, current action majors
- [x] Did **not** touch `deploy-worker.yml`
- [ ] Push the branch, open the PR, watch CI to completion
- [ ] PR documents: from→to, breaking changes, holds, test evidence, the pre-existing defects, manual checklist
