# Spec 001 — Upgrade dependencies to current stable

**Status:** in progress
**Branch:** `chore/upgrade-dependencies-2026-09`
**Date:** 2026-09-11

## What

Move every dependency in this repository to its current `latest` npm dist-tag,
rewrite application code to the APIs those versions actually ship, and leave
behind a verification net (characterization tests + CI) that can tell whether a
future upgrade broke something.

## Why

The manifest had drifted far enough that several entries were no longer merely
old, they were unusable together:

- `npm ci` **fails outright**. The committed lockfile pins
  `@cloudflare/vite-plugin@1.25.6`, whose peer range is `vite ^6.1.0 || ^7.0.0`,
  against a root `vite@^8.0.0-beta.16`. Installing requires `--legacy-peer-deps`,
  which means CI cannot install this project honestly.
- `vite` was pinned to a **beta** (`^8.0.0-beta.16`) months after 8.x went stable.
- `better-auth` and `square` carry authentication and payment code. Both ship
  security fixes inside ordinary releases, so holding them back freezes those
  fixes silently. This repo is two minors behind on auth and a major behind on
  payments.
- `vinext@0.0.30` predates the 1.0 restructure that moved Cloudflare support into
  a separate `@vinext/cloudflare` package, so the project is pinned to an API
  surface that no longer receives changes.

## Acceptance criteria

Each criterion is a command whose result is checked, not a judgement call.

| # | Criterion | Verified by |
|---|---|---|
| AC1 | Dependencies install with **strict** peer resolution — no `--legacy-peer-deps` | `npm ci` exits 0 |
| AC2 | Nothing is behind its `latest` dist-tag except documented holds | `npm outdated` empty or holds only |
| AC3 | Every type error *caused by* the upgrade is fixed, and no new class is introduced | `npm run type-check`, classified by error code — see plan.md |
| AC4 | Unit tests pass, and the suite is larger than the baseline's 71 | `npm test -- --run` exits 0 |
| AC5 | Translations stay in sync across all three locales | `npm run lint:i18n` exits 0 |
| AC6 | Production build succeeds | `npm run build` exits 0 |
| AC7 | The built Worker serves its key routes, verified against workerd with local-only bindings | smoke tests exit 0 |
| AC8 | Every gate above runs on pull requests | `.github/workflows/ci.yml` green |
| AC9 | The better-auth 1.7 schema change ships as a reviewable migration that applies cleanly to a **local** D1 | `wrangler d1 migrations apply … --local` |
| AC10 | No secret, token, or real customer datum is added to this public repository | secret scanner + review |

## Out of scope

- Feature work, redesigns, and refactors unrelated to an upgrade.
- Deploy automation. `deploy-worker.yml` is **not** modified; CD gating is a
  recommendation in the PR, not a change here.
- Applying anything to remote/production Cloudflare resources. Every command in
  this work runs against local miniflare state.
- `apps/web/.next/`, `playwright-report/`, `test-results/`, `Dockerfile`,
  `nixpacks.json`, `vercel.json`, `terraform/` — committed build output and
  legacy deploy targets, untouched.

## Baseline (measured on the old dependencies, before any change)

Three of five gates were already red on arrival. This is the "before" picture the
upgrade is measured against, not damage introduced by it.

| Gate | Baseline | Notes |
|---|---|---|
| `npm ci` (strict) | ❌ | ERESOLVE, see Why above |
| `npm ci --legacy-peer-deps` | ✅ | 501 packages |
| `npm run build` | ✅ | builds `dist/client` + `dist/server` |
| `npm run lint:i18n` | ✅ | 405 keys × 3 locales, 302 code references |
| `npm run type-check` | ❌ | fails. The total was not captured (the output was truncated when first measured); the classes present were `next/*` TS2307, Workers-global TS2304, nullable-`db` TS18047, and a duplicate-vite TS2769 in vitest.config.ts |
| `npm run lint` | ❌ | no `eslint.config.js` exists at all |
| `npm test` | ❌ | 4 of 8 files, 6 of 71 tests |
| `npm run test:e2e` | not run | Playwright browsers not installed; needs port 3000 + seeded auth DB |

### Pre-existing defects found while measuring

1. **Square webhook signatures are never verified.** `src/app/api/square/webhook/route.ts`
   reads header `x-square-hmac-sha256`; Square sends `x-square-hmacsha256-signature`.
   The header is therefore always `null`, the `if` guard never runs, and every
   webhook POST is processed unverified. The guarded call is also
   `(WebhooksHelper as any).isValidWebhookEventSignature(...)`, which is not a
   method of the installed SDK — so the code could not have verified anything
   even with the right header.
2. **`next/*` does not resolve outside the vinext build.** This single cause
   produces both the `TS2307` typecheck errors (`next/navigation`, `next/cache`)
   and 2 of the 4 failing test files, which die in Vite import-analysis before
   any `vi.mock` runs.
3. **Workers globals are untyped** — `D1Database`, `KVNamespace`, `R2Bucket`,
   `Fetcher` are `TS2304` because `@cloudflare/workers-types` is installed but
   never referenced from `tsconfig.json`.
4. **`src/features/admin/Sidebar.test.tsx` mocks `@/features/payload/Logo`**, a
   module that does not exist — a leftover from the Payload CMS era.
5. **`src/lib/auth/options.ts` is dead code** — no importer anywhere, still
   references `PAYLOAD_SECRET`, and would otherwise need migrating to 1.7.

6. **`0005_seed_settings.sql` cannot apply to an empty database.** It `INSERT`s
   into `setting_stats` / `setting_values` with `setting_id = 1` after an
   `UPDATE settings … WHERE id = 1` that matches no row, so a from-scratch
   `wrangler d1 migrations apply` stops there with
   `FOREIGN KEY constraint failed`. Enough tables exist by that point for the
   smoke suite, so CI applies migrations best-effort.
7. **`src/app/api/service-requests/route.ts` references an undefined
   `squareClient`** (line 55). The file is untouched by this branch —
   `git diff HEAD` on it is empty — and the identifier is never declared in it,
   so that payment path throws a `ReferenceError` at runtime today.
8. **`.dev.vars` was not git-ignored** in a public repository, while holding the
   same secrets as `wrangler secret put`.

Items 1–4, 6 (worked around) and 8 are addressed here because each blocks a gate
this upgrade depends on, or is a one-line safety fix in a public repo. Item 5 is
deleted rather than migrated. Item 7 is application logic unrelated to any
dependency and is reported, not fixed. All are called out in the PR.
