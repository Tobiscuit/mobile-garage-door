# Security & SSDLC Narrative

> This is the story of how you identified, prioritized, and fixed security issues in production code. Interviewers love hearing about real security work — not textbook answers.

---

## The Setup

We built a real-time tech tracking system with 4 API endpoints:
- `POST /api/tracking/update` — tech sends GPS every 30s
- `GET /api/tracking/latest/{id}` — customer polls for fuzzy location
- `PATCH /api/tracking/status` — tech updates job status
- `POST /api/push/subscribe` — customer registers for push notifications

After shipping the feature, I ran a self-audit against SSDLC principles and found **5 security gaps** ranging from critical to medium. All were fixed before production traffic.

---

## What I Found & Fixed

### 🔴 Critical: Authorization Bypass on Tracking Data

**The bug:** Any authenticated user could poll `/api/tracking/latest/{requestId}` for *any* service request by guessing the ID. A logged-in customer could see another customer's tech location.

**The fix:** Added an ownership check — the endpoint now queries D1 to verify the requesting user is either:
- The customer who owns the service request
- The technician assigned to it
- An admin or dispatcher

**The code:**
```typescript
const isCustomer = sr.customerId === userId;
const isTech = sr.assignedTechId === userId;
const isStaff = ['admin', 'dispatcher'].includes(userRole || '');

if (!isCustomer && !isTech && !isStaff) {
  return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
}
```

**Interview angle:**
> "The classic IDOR vulnerability. I caught it in self-review because the original implementation only checked 'is the user logged in?' not 'does this user have access to *this specific resource*?' The fix was a single D1 query + three boolean checks."

---

### 🔴 Critical: No Rate Limiting

**The bug:** All endpoints accepted unlimited requests. A malicious actor could:
- Spam GPS updates (filling D1 audit table)
- Hammer the polling endpoint (exhausting KV free tier reads)
- Brute-force status changes

**The fix:** KV-based sliding window rate limiter:
```typescript
// rate-limit.ts — 30 lines, zero framework coupling
const RATE_LIMITS = {
  trackingUpdate: { maxRequests: 4, windowSeconds: 60 },
  trackingLatest: { maxRequests: 12, windowSeconds: 60 },
  statusChange:   { maxRequests: 5, windowSeconds: 60 },
};
```

Uses `TRACKING_KV` with TTL-based expiration — key format: `ratelimit:{route}:{userId}`.

**Why KV, not a dedicated rate limiter?**
> "Cloudflare has a paid Rate Limiting product, but we're on free tier. KV's TTL handles window expiration automatically — `expirationTtl` means I don't need a cleanup job. The tradeoff is it's not as precise as a token bucket, but for our traffic (< 100 concurrent users), a simple counter-per-window is sufficient."

---

### 🟡 Medium: GPS Input Validation

**The bug:** Accepted any numbers for lat/lng. A malicious client could send `lat: 9999` or `lat: NaN`.

**The fix:** Pure validation function with bounds checking:
```typescript
if (lat < -90 || lat > 90) return { valid: false, error: '...' };
if (lng < -180 || lng > 180) return { valid: false, error: '...' };
if (isNaN(lat) || isNaN(lng)) return { valid: false, error: '...' };
```

Also sanitizes:
- Coordinates truncated to 6 decimal places (~11cm precision — more than GPS gives)
- Accuracy values capped at 100km (rejects insane values)
- serviceRequestId parsed and validated as positive integer

**34 unit tests** cover all edge cases including NaN, strings, negative IDs, edge coordinates (poles, dateline).

---

### 🟡 Medium: Status Transition Bypass

**The bug:** A tech could PATCH status to any value — including going backwards (`completed` → `dispatched`). No state machine enforcement.

**The fix:** One-way finite state machine:
```
pending → confirmed → dispatched → on_site → completed
                 ↘ dispatched (skip confirmed)
```

```typescript
const VALID_TRANSITIONS = {
  pending: ['confirmed', 'dispatched'],
  confirmed: ['dispatched'],
  dispatched: ['on_site'],
  on_site: ['completed'],
  completed: [],
  cancelled: [],
};
```

**Interview angle:**
> "Status fields are one of the most common sources of state bugs. Without transition guards, you get phantom states — a job that's simultaneously 'completed' and has active GPS tracking. The state machine makes invalid states unrepresentable."

---

### 🟡 Medium: Unsafe JSON Parsing

**The bug:** `JSON.parse(raw)` on KV data would throw on corrupt data, crashing the entire request handler.

**The fix:** `safeParseKvData()` — returns null on any parse error instead of throwing.

---

## The SSDLC Story (For Behavioral Questions)

### "Tell me about a time you found a security issue."

> "After shipping the tracking feature, I self-audited against OWASP principles and found an IDOR vulnerability — any authenticated user could view any service request's tracking data. I classified it as critical, wrote a fix with an ownership check, added 34 unit tests for the validation layer, and deployed the same day. I also documented the finding in an internal decision log so the team knows the pattern to avoid."

### "How do you approach security in your development process?"

> "I practice 'security as a layer' — validation utilities are pure functions with exhaustive tests, authorization checks are explicit per-endpoint (not middleware-only), and rate limiting is defense-in-depth. I also separate the audit from the fix: first document all issues, classify severity, then fix in priority order. For this project, I found 5 issues, fixed all 5, and wrote 65 tests to prevent regression."

### "What's your testing strategy?"

> "I test the business logic, not the framework. All 65 tests run against pure TypeScript utilities with zero framework imports, so they survive any migration. The test suite runs in 930ms — fast enough to run on every commit. I prioritize edge cases that represent real attack vectors: NaN coordinates, negative IDs, backward status transitions, corrupt cache data."
