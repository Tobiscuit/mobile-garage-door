# Architecture Deep-Dive: Mobil Garage Door

> Use this to walk an interviewer through your system design decisions. Structure your answer as: **constraint → decision → tradeoff → validation.**

---

## 1. The Elevator Pitch

A full-stack PWA for a Houston garage door company — booking, payments (Square), real-time tech arrival tracking, and push notifications. Runs entirely on Cloudflare's free tier: Workers for compute, KV for hot data, D1 (SQLite) for persistence, R2 for media. Zero monthly hosting cost.

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                        │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Workers     │  │  KV         │  │  D1 (SQLite)    │  │
│  │  (Compute)   │  │  (Cache +   │  │  (Persistence)  │  │
│  │             │  │   Tracking)  │  │                 │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
│         │                │                   │           │
│         ▼                ▼                   ▼           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  App Router (Vinext / Next.js API surface)         │  │
│  │  • Server Components (RSC)                         │  │
│  │  • API Routes (/api/tracking/*, /api/push/*)       │  │
│  │  • Server Actions (booking, payments)              │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │  R2      │  │  VAPID   │  │  Better Auth         │   │
│  │  (Media) │  │  (Push)  │  │  (Sessions + OAuth)  │   │
│  └──────────┘  └──────────┘  └──────────────────────┘   │
└──────────────────────────────────────────────────────────┘
         ▲                    ▲                  ▲
         │                    │                  │
    ┌────┴────┐          ┌────┴────┐        ┌────┴────┐
    │ Customer │          │  Tech   │        │  Admin  │
    │ Portal   │          │ Dashboard│       │ CMS     │
    │ (PWA)    │          │ (PWA)   │        │         │
    └──────────┘          └─────────┘        └─────────┘
```

### Interview Q: "Walk me through a request."

**Customer books a service:**
1. Customer fills out the booking form (client component)
2. Server action validates input, creates a `serviceRequest` row in D1
3. Admin sees it in the CMS dashboard, assigns a tech
4. Tech taps "I'm heading out" → PATCH `/api/tracking/status` → status = `dispatched`
5. Tech's browser starts `watchPosition` → POST `/api/tracking/update` every 30s
6. Worker computes Haversine distance → fuzzy circle → writes KV (latest) + D1 (audit)
7. Customer polls GET `/api/tracking/latest/{id}` every 10s → renders SVG circle
8. At 2-mile threshold → milestone `eta_15` → deduplicated push notification via VAPID
9. At 0.5-mile threshold → milestone `eta_3` → second push
10. Tech taps "Job complete" → KV cleanup, status = `completed`

---

## 3. Data Architecture: KV + D1 Hybrid

### Interview Q: "Why not just use D1 for everything?"

**KV for hot path (reads):**
- Customer polls every 10s — that's potentially 360 reads/hour per active job
- KV is edge-cached, sub-millisecond reads, free tier = 100K reads/day
- Data shape: `tracking:{requestId}` → single JSON blob (center, radius, ETA, tech name)
- TTL: 2 hours auto-expire — self-cleaning, no garbage collection needed

**D1 for cold path (writes + audit):**
- Every GPS update writes an audit row (lat, lng, accuracy, fuzzy radius, milestone)
- Milestone deduplication: `SELECT id FROM tracking_events WHERE milestone = ? AND service_request_id = ?`
- Drizzle ORM for type-safe schema, migrations via numbered SQL files

**Why not Durable Objects?**
- Durable Objects are $0.15/million requests — not free tier
- KV + D1 = $0 within free tier limits (100K KV reads, 5M D1 reads/day)
- For a local service company, traffic will never approach these limits

---

## 4. Privacy-First Location Disclosure

### Interview Q: "How do you handle user privacy with GPS data?"

**Raw GPS never leaves the edge worker.** The `computeFuzzyLocation()` function:

1. Calculates Haversine distance between tech and customer
2. Maps distance to a **fuzzy radius** (5mi → 2mi → 0.5mi → 0.1mi)
3. **Snaps coordinates** to a grid (0.01° at distance, 0.001° when close)
4. Returns a `FuzzyLocation` object — center, radius, status, ETA

**Why this matters:**
- Customer sees "your tech is in a 2-mile circle" not "your tech is at 29.7604, -95.3698"
- Even if the API response is intercepted, the raw GPS is lost
- Audit trail in D1 stores raw GPS (for dispute resolution) but the API never exposes it

**Design inspiration:** Apple's Find My "nearby" screen — no map, just a shrinking circle.

---

## 5. Push Notification Strategy

### Interview Q: "How did you implement push notifications?"

**Web Push with VAPID:**
- VAPID key pair (public in env, private as Wrangler secret)
- `web-push` npm library with `nodejs_compat` flag on Workers
- Service worker handles `push` and `notificationclick` events
- Notifications deep-link to `/portal/track/{ticketId}`

**Milestone deduplication:**
- Before sending, query D1: "has this milestone already been sent for this request?"
- Prevents spam when tech hovers around the 2-mile threshold

**Post-payment prompt strategy (honest split):**
- Page land: PWA install prompt (value prop: faster, offline, app-like)
- Post-payment: Push notification prompt only (highest-intent moment)
- Platform-aware: iOS needs install-first, Android gets push directly
- 30-day dismiss cooldown

**i18n:** Notification content and prompt UI in en/es/vi (Houston demographics)

---

## 6. Authentication & Authorization

**Better Auth** with D1 adapter:
- Email/password + OAuth (Google)
- Role-based: customer, tech, admin, dispatcher
- Session cookies with CSRF protection

**API-level authorization (the security story):**
- Tracking update: verified tech is assigned to the service request
- Tracking latest: **ownership check** — only the customer, assigned tech, or staff can view
- Status changes: **state machine** — one-way transitions only (pending → dispatched → on_site → completed)
- Rate limiting: KV-based sliding window per user per endpoint

---

## 7. Key Libraries & Why

| Library | Why |
|---------|-----|
| **Drizzle ORM** | Type-safe SQL for D1/SQLite. Lightweight, no heavy ORM overhead |
| **Better Auth** | Auth library with native D1 support. Replaced NextAuth |
| **next-intl** | i18n with server-side translation loading. 3 locales (en/es/vi) |
| **web-push** | VAPID push notifications. Works on Workers with nodejs_compat |
| **Square SDK** | Payment processing. PCI-compliant, no card data on our servers |

---

## 8. Testing Strategy

**65 unit tests** across 4 test files (Vitest):

| File | Tests | What |
|------|-------|------|
| `geo.test.ts` | 13 | Haversine distance, fuzzy circles, grid snapping, ETA |
| `tracking-validation.test.ts` | 34 | GPS bounds, status transitions, safe KV parsing |
| `push.test.ts` | 10 | Milestone notifications, all locales, fallback |
| `rate-limit.test.ts` | 8 | Allow/block, window expiry, key isolation |

**Why framework-agnostic tests:**
- All tests run against pure TypeScript utilities (zero Next.js imports)
- Will survive any framework migration (Hono, Remix, raw Workers)
- 930ms total runtime — fast CI feedback loop
