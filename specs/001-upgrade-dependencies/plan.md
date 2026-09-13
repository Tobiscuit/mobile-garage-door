# Plan 001 — Upgrade dependencies to current stable

Versions were read from `npm view <pkg> dist-tags` on **2026-09-11**, never from
memory. Migration details came from Context7 (`/cloudflare/vinext`,
`/better-auth/better-auth`, `/square/square-nodejs-sdk`, Tailwind upgrade guide),
from package metadata and shipped type definitions, and from
`/home/link/tntosion`, a sibling project already running vinext `1.0.0-beta.4`.

## Target versions

### Framework and build

| Package | From | To | Boundary |
|---|---|---|---|
| `vinext` | 0.0.30 | 1.0.0-beta.9 | pre-1.0 → 1.0 restructure |
| `@vinext/cloudflare` | — | 1.0.0-beta.7 | **new package** |
| `vite` | ^8.0.0-beta.16 | 8.3.0 | beta → stable |
| `@vitejs/plugin-react` | 5.1.4 | 6.1.1 | major |
| `@vitejs/plugin-rsc` | 0.5.21 | 0.5.34 | pre-1.0 minor |
| `@cloudflare/vite-plugin` | 1.5.0 | 1.54.8 | minor (fixes ERESOLVE) |
| `@cloudflare/workers-types` | 4.20260218.0 | 5.20260911.1 | major |
| `wrangler` | 4.75.0 | 4.131.1 | minor (peer of vite-plugin) |
| `typescript` | 5.7 | 7.0.2 | two majors, native compiler |
| `react`, `react-dom`, `react-server-dom-webpack` | 19.2.4 / 19.0.0 | 19.3.0 | minor |

### Auth, payments, data

| Package | From | To | Boundary |
|---|---|---|---|
| `better-auth`, `@better-auth/passkey` | 1.5.3 | 1.7.4 | two minors, **schema change** |
| `square` | 44.0.0 | 45.1.0 | major |
| `drizzle-orm` | 0.45.1 | 0.45.2 | patch |
| `drizzle-kit` | 0.31.9 | 0.31.10 | patch |

### Application libraries

| Package | From | To | Boundary |
|---|---|---|---|
| `lucide-react` | 0.577.0 | 1.45.0 | 0.x → 1.x |
| `motion` | 12.34.2 | 13.2.0 | major |
| `@google/genai` | 1.41.0 | 2.22.0 | major |
| `next-intl` | 4.8.3 | 4.14.4 | minor |
| `resend` | 6.9.3 | 6.28.0 | minor |
| `@tiptap/*` (4 packages) | 3.20.0 | 3.31.3 | minor |
| `tailwindcss`, `@tailwindcss/postcss` | 4.2.0 | 4.3.3 | minor |
| `@tailwindcss/typography` | 0.5.19 | 0.5.20 | patch |
| `tailwind-merge` | 3.4.1 | 3.6.0 | minor |
| `@pushforge/builder` | 2.0.1 | 2.0.5 | patch |
| `dotenv` | 17.2.4 | 17.4.2 | minor |
| `tsx` | 4.21.0 | 4.23.13 | minor |

### Tests, types, tooling

| Package | From | To | Boundary |
|---|---|---|---|
| `vitest` | 4.0.18 | 5.0.0 | major |
| `@testing-library/jest-dom` | 6.9.1 | 7.0.1 | major |
| `@testing-library/react` | 16.3.2 | 16.3.3 | patch |
| `jsdom` | 28.1.0 | 30.0.1 | two majors |
| `@playwright/test` | 1.58.2 | 1.63.0 | minor |
| `eslint` | 10.0.0 | 10.10.0 | minor |
| `postcss` | 8.5.6 | 8.5.28 | minor |
| `@types/node` | 25.0.10 | **26.5.1** | see note |
| `@types/react`, `@types/react-dom` | 19.2.14 / 19.2.3 | 19.3.0 | minor |
| `@types/google.maps` | 3.58.1 | 3.66.2 | minor |

> **`@types/node` does not follow `latest`.** Its `latest` tag is `22.20.2`,
> which tracks the LTS line, not the newest release. The rule is that
> `@types/node` matches the Node major actually in use, so the target is
> `^26.5.1` for Node 26. Taking `latest` blindly here would be a downgrade.

### Removed

| Package | Why |
|---|---|
| `@modelcontextprotocol/sdk` | zero references anywhere in the repo |
| `html-react-parser` | zero references |
| `date-fns` | zero references |
| `@unpic/react` | zero direct references; `vinext` depends on it internally |
| `@types/jsdom` | zero references; vitest supplies the jsdom environment |
| `autoprefixer` | Tailwind v4 applies vendor prefixes itself — its upgrade guide says to remove it |

`@types/google.maps` is **kept**: `google.maps.places.PlaceResult` is used as a
type in `src/app/(site)/(public)/(localized)/[locale]/contact/page.tsx`.

### Runtime pins

`.nvmrc` 25 → **26**, `engines.node` `>=25.0.0` → `>=26.0.0`.

Node 25 reached end of life, and the decisive constraint is `vitest@5.0.0`, whose
engines field is `^22.12.0 || ^24.0.0 || >=26.0.0` — Node 25 is **excluded by
name**. Every other upgraded tool is satisfied by 26: `vinext` `>=22`,
`wrangler` `>=22`, `eslint` `^20.19||^22.13||>=24`, the better-auth CLI `>=22.12`.
The build host runs Node v26.4.0, so CI and local verification agree.

## Breaking changes that actually hit this codebase

### 1. vinext 0.0.x → 1.0 — the Cloudflare split

`vinext@0.0.30` exports `./cloudflare`; **`1.0.0-beta.9` does not**. Cloudflare
support now lives in `@vinext/cloudflare` (`./cache/*`, `./images/*`), whose peer
is pinned to `vinext ^1.0.0-beta.9`. Cache handlers are no longer constructed by
hand — the shipped type definitions mark that path deprecated and direct
consumers to declare adapters in `vite.config.ts`.

| File | Change |
|---|---|
| `worker/index.ts` | **deleted** — replaced by `"main": "vinext/server/fetch-handler"`, which registers adapters and supplies the `ExecutionContext` |
| `wrangler.jsonc` | `main` → `vinext/server/fetch-handler` |
| `vite.config.ts` | adapter declared: `vinext({ cache: { data: kvDataAdapter({ binding: "VINEXT_CACHE", appPrefix: "mobile-garage-door" }) } })` |
| `src/lib/cloudflare.ts` | drop `export { KVCacheHandler } from "vinext/cloudflare"` (the module is gone; nothing imported it) |

`kvDataAdapter`'s binding defaults to `VINEXT_KV_CACHE`, but it is configurable,
so the existing `VINEXT_CACHE` binding and the `mobile-garage-door` key prefix
are both preserved — no KV namespace change, no cache-key churn.

**Behaviour change to note:** the deleted worker entry wrapped every request in a
`try/catch` returning `{"error": …}` with status 500. Unhandled errors now
produce vinext's own error response instead.

`cdnAdapter()` (edge ISR via Workers Cache) is deliberately **not** adopted — it
is new capability, needs `cache.enabled` plus a `CF_VERSION_METADATA` binding,
and belongs in its own change.

### 2. `next/*` resolution — one cause, three symptoms

`@vinext/types` (a dependency of vinext) ships `declare module "next/navigation"`,
`"next/cache"`, `"next/server"` and the rest, surfaced through the
`vinext/types` export. Referencing it fixes the `TS2307` errors without
installing the real `next` package. Workers globals come from the
`@cloudflare/workers-types` reference in the same place.

- `vinext-env.d.ts` (new): `/// <reference types="vinext/types" />`
- `tsconfig.json`: reference `@cloudflare/workers-types`; drop the stale
  `plugins: [{ name: "next" }]` entry (there is no `next` package here).
- `vitest.config.ts`: tests resolve `next/*` through the vinext plugin (fallback:
  explicit aliases), which is what unblocks `Header.test.tsx` and `Sidebar.test.tsx`.

### 3. better-auth 1.5 → 1.7 — no schema migration is required (verified)

**This section originally planned an `account.issuer` column plus a backfill.
That was wrong, and the evidence is below.** The 1.7 upgrade guide lists
"Account identity — an `issuer` column and a compound index … Yes, backfill"
among its schema changes, but that row belongs to the OIDC-provider feature set
(protected resources, DPoP, SCIM, device authorization, the provider client
store) that this application does not enable.

What 1.7.4 actually declares, read from the shipped
`@better-auth/core@1.7.4/dist/db/schema/account.d.mts`:

```
accountSchema: id, createdAt, updatedAt, providerId, accountId, userId,
               accessToken, refreshToken, idToken, accessTokenExpiresAt,
               refreshTokenExpiresAt, scope, password
AccountKey    = Pick<BaseAccount, "providerId" | "accountId">
```

No `issuer`, and the account key is still `(providerId, accountId)`. Every
`issuer` occurrence in that package is under `oauth2/*`. The `session`, `user`
and `verification` schemas likewise match the columns already in
`src/db/schema.ts`, and the passkey plugin's fields are **identical** between
1.5.3 and 1.7.4 (`credentialID, publicKey, counter, deviceType, backedUp,
transports, aaguid, userId, name`).

So: better-auth moves 1.5.3 → 1.7.4 with **no migration, no backfill, and no
change to `src/db/migrations/`**. The runtime behaviour is covered by the smoke
suite, which exercises the auth-gated API contracts.

Two notes for the reviewer:

- `npx auth generate` could not be used against this app's own config —
  `createAuth()` requires a Workers D1 binding a Node CLI cannot provide, and
  the CLI refuses `--adapter kysely` with "Only kysely adapter is supported for
  migrations". The schema above therefore comes from the published package.
- `rateLimit` is enabled in production but better-auth defaults to in-memory
  storage, so the `rateLimit` model it defines needs no table here.

### 3b. Superseded: the original account-identity plan

> **Superseded — do not act on this section.** It is kept only to record what
> was planned and why it was dropped. The authoritative finding is §3 above:
> better-auth 1.7.4 declares no `issuer` column, so **no migration is written
> and none should be applied**.

The original plan read the 1.7 upgrade guide's "Account identity — an `issuer`
column and a compound index … Yes, backfill" row as applying here, and scheduled
an additive migration plus a per-account-type backfill. Reading the shipped
`@better-auth/core@1.7.4` schema showed that row belongs to the OIDC-provider
feature set, which this app does not enable.

What remains true from the original analysis: this app uses better-auth's
**native D1 adapter** (`database: env.DB` in `src/lib/auth.ts`), not the Drizzle
adapter — the Drizzle tables in `src/db/schema.ts` are hand-maintained for
application queries. The guide's SCIM, OAuth-client-store and
Device-Authorization preparation steps do not apply either: the only plugins
configured are `passkey`, `magicLink` and the Google social provider.

`npx auth generate` cannot be used against the app's own config, because
`createAuth()` requires a Workers D1 binding that a Node CLI has no way to
provide. The schema is instead generated from an isolated scratch config
mirroring this app's plugins, then hand-authored into a migration.

Migrations here are applied by **`wrangler d1 migrations apply`**, not drizzle-kit:
`src/db/migrations/meta/_journal.json` stops at `0002` while the directory holds
files through `0016`, so everything since has been plain sequential SQL. That
convention is recorded here for whoever writes the next migration; this branch
adds none.

### 4. square 44 → 45 — webhook verification

The SDK still exports `SquareClient`, `SquareEnvironment` and `WebhooksHelper`,
and `payments.create()` / `customers.get()` are unchanged, so the payment path
migrates cleanly. The webhook helper does not:

```
- (WebhooksHelper as any).isValidWebhookEventSignature(body, sig, key, url)   // positional, not a real method
+ await WebhooksHelper.verifySignature({ requestBody, signatureHeader, signatureKey, notificationUrl })  // async, returns boolean
```

Migrating this necessarily fixes pre-existing defect #1 — the header name must
become `x-square-hmacsha256-signature` for the call to receive a signature at
all. A failed verification now rejects with 403 instead of silently proceeding.

### 5. Tailwind 4 — autoprefixer

Tailwind's upgrade guide states v4 handles vendor prefixing and imports itself
and that `autoprefixer` should be removed. `postcss.config.cjs` drops the plugin
entry; `postcss` itself stays as `@tailwindcss/postcss`'s peer.

### 6. Smaller majors

- **`lucide-react` 0.x → 1.x** — 8 import sites; icon renames/removals verified against the new package.
- **`motion` 12 → 13** — 5 import sites, all `motion/react` component usage.
- **`@google/genai` 1 → 2** — 4 call sites (`src/actions/ai.ts`, `src/lib/translate-utils.ts`, `src/app/api/blog/draft/route.ts`, `src/scripts/generate-vi-ui.ts`).
- **`vitest` 4 → 5 / `jsdom` 28 → 30 / `@testing-library/jest-dom` 6 → 7** — config and matcher surface.
- **`@cloudflare/workers-types` 4 → 5** — global type shapes.
- **`typescript` 5.7 → 7** — the native compiler; `tsconfig` options and any tooling reading the TS API are checked.

### 7. Rolldown chunk ordering broke every server-rendered route

Found by the smoke suite, which went from 10/10 to 2/10 the moment the framework
moved. Every dynamic route returned 500 with:

```
TypeError: Cannot read properties of undefined (reading 'Symbol')
  at dist/server/_next/static/schema-*.js
```

The throwing code is drizzle-orm's `PgTable` class body:

```js
class PgTable extends Table {
  static Symbol = Object.assign({}, Table.Symbol, { … });
  [Table.Symbol.ExtraConfigBuilder] = undefined;   // Table is undefined here
}
```

The chain is `drizzle-orm` (root barrel, imported in 47 files for `eq`, `and`,
`relations`) → `relations.js` → `pg-core/primary-keys.js`. Postgres dialect code
is therefore reachable in a D1/SQLite app, and Vite 8's Rolldown split `PgTable`
into a different chunk from the base `Table` it extends and evaluated it first.

Fixed in `vite.config.ts` with `build.rolldownOptions.output.codeSplitting.groups`
— the Vite 8 replacement for `manualChunks` — pinning `drizzle-orm` to a single
chunk so module evaluation order is restored.

Two things this was **not**, both ruled out by experiment: the
`reflectMetadataPlugin` workaround (disabling it changed nothing, so it stays),
and CJS interop (`legacy.inconsistentCjsInterop` would have been the wrong tool).

### 8. The upgrade could not be installed boundary by boundary

The plan below was written as separate installs per migration boundary. npm
refused, three times, because the peer ranges interlock:

| Attempt | Rejection |
|---|---|
| vinext 1.0 alone | beta.9 peers `@vitejs/plugin-rsc ^0.5.34`, still at 0.5.21 |
| better-auth + drizzle | `@unpic/react@0.1.15` peers `react ^17 \|\| ^18` vs React 19.3 |
| the rest | `next-intl@4.8.3` peers `typescript ^5` vs TypeScript 7 |

So the dependency changes were staged in `package.json` and resolved by a single
`npm install`. Verification stayed per-boundary: the gates ran after each code
migration, and the smoke suite is what caught §7. `next-intl@4.14.4` drops the
`typescript` peer entirely, and `@unpic/react` was removable because nothing
imports it — vinext depends on it internally.

## Order of work

Each step ends green before the next begins.

1. Spec (this document).
2. Test net, **green on the old dependencies**: fix the harness so `next/*`
   resolves, drop the dead `Logo` mock, add characterization tests (routes,
   locales, 404, API contracts, webhook signature).
3. Framework and build: vinext + `@vinext/cloudflare` + vite + plugins +
   wrangler + workers-types + TypeScript, including the worker entry rewrite.
4. Auth: better-auth 1.7 + the migration, verified against a local D1.
5. Payments: square 45 + the webhook fix.
6. Remaining libraries, removals, runtime pins.
7. CI.

## Risks

| Risk | Handling |
|---|---|
| Merging deploys to production (`deploy-worker.yml` on push to main) | Called out at the top of the PR, with the migration ordering spelled out |
| The account-identity backfill is wrong for existing rows | Migration is additive and reviewable; the PR gives the exact commands and the read-only duplicate-key check to run first |
| vinext betas move between releases | beta.4 → beta.9 release notes reviewed; tntosion cross-checked as a working reference |
| A test is weakened to make a gate pass | Gates are fixed at the cause; every skip or expected-failure is listed in the PR |

## Holds

**`drizzle-kit`'s esbuild chain — 4 moderate advisories, accepted.**
`npm audit` ends at 4 moderate findings, all one chain:
`drizzle-kit → @esbuild-kit/esm-loader → @esbuild-kit/core-utils → esbuild`.
The only remediation npm offers is `drizzle-kit@0.18.1`, thirteen majors
**backwards**, which would break the migration tooling — that is a downgrade,
not a fix. `drizzle-kit` is a build-time migration CLI and does not appear
anywhere in the built Worker (`grep` over `dist/server` finds no reference), so
none of it is reachable from deployed code.
**Revisit trigger:** when drizzle-kit drops `@esbuild-kit/*` (it is superseded
by `tsx` upstream) or publishes a release whose advisory chain is clear.

`npm audit fix` (non-breaking only, never `--force`) was applied and took the
tree from 18 findings — 1 critical, 7 high, 10 moderate — down to these 4.

No dependency is held back from its target version.
