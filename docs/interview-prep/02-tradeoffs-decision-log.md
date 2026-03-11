# Tradeoffs & Decision Log

> Every technical decision is a tradeoff. Use this to articulate your reasoning in interviews — interviewers care more about *why* than *what*.

---

## Decision 1: Vinext over Next.js (Vercel)

| | Vinext | Next.js on Vercel |
|---|---|---|
| **Cost** | $0/mo (Cloudflare free tier) | ~$20/mo (Pro plan) |
| **Edge** | Native Workers, D1, KV, R2 | Edge functions (limited) |
| **Maturity** | Experimental (Feb 2026) | 8+ years, battle-tested |
| **Risk** | Security vulns found post-launch | Stable, but vendor lock-in |

**Why I chose it:**
> "The client needed $0 hosting to offset admin costs. Cloudflare's free tier (Workers + KV + D1 + R2) was the only option that covered compute, storage, and CDN at zero cost. Vinext was the only Next.js-compatible framework that ran natively on Workers at the time."

**What I'd say differently:**
> "I structured all business logic as framework-agnostic utilities — the geo calculations, validation, rate limiting, and push notifications have zero framework coupling. When the security vulns were disclosed, our application-level code was unaffected because the vulns were in request handling and middleware, not business logic."

**Lesson learned:**
> "I now evaluate experimental frameworks on a 2x2 matrix: (1) How decoupled can I make my business logic? (2) What's my escape hatch? For this project, both answers were strong, which made the risk acceptable."

---

## Decision 2: KV + D1 Hybrid over Durable Objects

**Constraint:** Cloudflare free tier only.

**Why not Durable Objects?**
- $0.15/million requests — breaks the $0 constraint
- Overkill for our concurrency model (1 tech, 1 customer per job)

**Why KV for hot reads?**
- Customer polls every 10s. At 10 concurrent jobs, that's 3,600 KV reads/hour — well within 100K/day free tier
- KV is edge-cached, sub-ms reads. D1 would add latency for every poll

**Why D1 for audit?**
- Compliance — we need an audit trail of tech locations for dispute resolution
- Milestone deduplication — structured query is cleaner than KV scanning
- Drizzle ORM gives us type safety and migration tooling

---

## Decision 3: Privacy-First Location Disclosure

**Constraint:** Customer doesn't need raw GPS. Legal liability if we expose it.

**Alternative considered:** Google Maps with live marker.
- Requires Maps SDK ($$$), exposes exact tech position, bloats bundle

**What we built:** Haversine distance → fuzzy circle → SVG visualization.
- Zero external dependencies
- Raw GPS processed and discarded at the edge
- Customer sees "2 miles away" not "29.7604, -95.3698"

**Interview angle:**
> "I chose progressive disclosure over precision. The customer's question isn't 'Which street is my tech on?' — it's 'How far away are they?' An SVG circle with a pulsing animation answers that question better than a map, at zero cost, with better privacy."

---

## Decision 4: Post-Payment Push Prompt (Honest Split)

**Temptation:** Tie push permissions to PWA install ("Install to get notifications").

**Why we didn't:**
- iOS actually requires install for push → so it's honest there
- Android doesn't need install → tying them is deceptive
- Research shows customers who install for the value prop retain 4x vs. those tricked into it

**What we built:**
- **Page land:** PWA install prompt — "Faster loading, offline access, app-like experience"
- **Post-payment:** Push permission only — "Know when your tech arrives"
- Platform-aware: iOS gets install instructions, Android gets push directly

**Interview angle:**
> "We practiced staged permissions — custom UI first, native prompt second. This has 3x higher opt-in rates than a cold native prompt. And by being honest about what each prompt does, we build trust."

---

## Decision 5: Framework-Agnostic Business Logic

**The pattern:** All validation, geo, push, and rate-limiting code lives in pure `src/lib/*.ts` files with zero framework imports.

**Why this matters:**
- 65 unit tests run in 930ms — no framework startup overhead
- When migrating from Vinext → Hono, only the route handlers change
- Business logic is the most valuable code — it should outlive any framework

**Files that survive any migration:**
| File | Purpose | Framework coupling |
|------|---------|-------------------|
| `geo.ts` | Haversine, fuzzy circles | None |
| `tracking-validation.ts` | GPS bounds, status machine | None |
| `rate-limit.ts` | KV sliding window | KV interface only |
| `push.ts` | VAPID push, milestone templates | None |
| `db/schema.ts` | Drizzle ORM schema | Drizzle (stays with D1) |

---

## Decision 6: Supabase → D1 Migration

**Why we migrated:**
- Supabase free tier: 500MB, limited connections, cold starts
- D1 free tier: 5GB, unlimited reads (5M/day), no cold starts (edge)
- Better Auth has a native D1 adapter — no Postgres bridge needed

**What went wrong (briefly):**
- D1's SQLite dialect doesn't support Postgres-specific types (JSONB, UUID, ENUM)
- Had to flatten locale columns (no JSONB → separate `name_en`, `name_es`, `name_vi`)
- Date serialization quirks (D1 stores as text, not Date objects)

**Interview angle:**
> "I scripted the migration by parsing the Supabase SQL dump, mapping Postgres types to SQLite equivalents, and validating against the Drizzle schema. The biggest lesson was that 'just SQLite' doesn't mean 'just swap the driver' — the type system differences are subtle."
