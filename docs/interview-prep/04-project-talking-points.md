# Project Talking Points — Resume & LinkedIn

---

## Resume Bullet Points

Pick 3-4 depending on the job you're applying for.

### Full-Stack / Edge Computing Focus
- Architected a full-stack PWA on Cloudflare's free tier (Workers, KV, D1, R2), achieving $0/month hosting for a service company with booking, payments, and real-time tracking
- Designed a KV + D1 hybrid data layer for real-time tech arrival tracking — KV for sub-millisecond location reads, D1 for audit trail and milestone deduplication
- Implemented privacy-first GPS location disclosure using Haversine distance calculation and progressive coordinate snapping — raw GPS processed and discarded at the edge

### Security / Backend Focus
- Identified and fixed 5 security vulnerabilities (IDOR, missing rate limiting, input validation bypass, state machine violation) in a self-directed SSDLC audit, with 65 unit tests preventing regression
- Built a KV-based sliding window rate limiter for API endpoints on Cloudflare Workers' free tier, replacing the need for a paid rate limiting service
- Implemented Web Push notifications with VAPID authentication, milestone deduplication, and localized content (en/es/vi) for a trilingual customer base

### Frontend / PWA Focus
- Built a PWA with platform-aware push notification prompting — staged permission pattern (custom UI → native prompt) achieving higher opt-in rates through honest, non-deceptive UX
- Created an SVG circle visualization for real-time tech arrival tracking, replacing a heavy map SDK with a lightweight, privacy-preserving animation
- Implemented i18n across 3 locales (English, Spanish, Vietnamese) using next-intl with server-side translation loading

### DevOps / Infrastructure Focus
- Migrated from Supabase (Postgres) to Cloudflare D1 (SQLite) with scripted schema translation, reducing hosting costs to $0 while maintaining Drizzle ORM type safety
- Managed DNS, deployment, and infrastructure-as-code via Terraform for Cloudflare zones and wrangler for Worker deployments
- Configured CI with translation lint checks (cross-locale key sync + code→JSON sync) running on every commit

---

## LinkedIn Project Description

**Mobil Garage Door — Full-Stack Service Platform**

Built a complete service management platform for a Houston garage door company, running entirely on Cloudflare's free tier:

🔧 **What it does:** Customer booking, Square payment processing, real-time technician arrival tracking with push notifications, admin CMS, and tech dispatch dashboard.

⚡ **Technical highlights:**
- Zero monthly hosting cost using Cloudflare Workers + KV + D1 + R2
- Privacy-first GPS tracking — raw coordinates processed at the edge, customers see fuzzy proximity circles
- 65 unit tests across validation, geo, push, and rate-limiting — all framework-agnostic
- Trilingual PWA (EN/ES/VI) with platform-aware push notification prompting

🔒 **Security:** Self-directed SSDLC audit identified and fixed IDOR vulnerabilities, missing rate limiting, input validation gaps, and state machine bypasses.

**Stack:** TypeScript, React, Cloudflare Workers/KV/D1/R2, Drizzle ORM, Web Push (VAPID), Square SDK, Better Auth, Vitest

---

## Common Interview Questions & Answers

### "What's the most technically challenging thing you've built?"

> "The real-time tech tracking system. The challenge wasn't any single piece — Haversine math is straightforward, push notifications are well-documented. The challenge was designing it to work within Cloudflare's free tier constraints while maintaining privacy. I had to figure out: How do you give customers a sense of proximity without exposing raw GPS? How do you deduplicate notifications at the edge? How do you rate-limit without a paid service? Each constraint forced a creative solution."

### "Tell me about a time you made a mistake."

> "I chose an experimental framework (Vinext) for this project. It was the only Next.js-compatible option that ran natively on Cloudflare Workers, and the business constraint was $0 hosting. Shortly after launch, security researchers found vulnerabilities in the framework itself. But here's what saved us: I had structured all business logic as framework-agnostic utilities with comprehensive tests. The framework-level vulns didn't affect our application code, and we have a documented migration path to Hono when the time comes. The lesson: always design for your framework to be replaceable."

### "How do you handle technical debt?"

> "I categorize it: will this debt compound, or is it isolated? Choosing Vinext was isolated debt — the business logic doesn't know what framework it runs on. That's manageable. But if I had coupled my validation logic to Next.js middleware, that would be compounding debt — every new endpoint would inherit the coupling. I track decisions in a tradeoff log and set checkpoints: if Vinext doesn't have a stable release by mid-2026, we migrate."

### "Walk me through how you'd design a real-time tracking system."

> *Use the architecture deep-dive doc, section 2.*

### "How do you approach testing?"

> "I test the business logic, not the framework. Pure functions are easy to test, fast to run, and survive any migration. I prioritize tests that correspond to real attack vectors — invalid GPS coordinates, backward status transitions, corrupt cached data. My 65 tests run in under a second because they have zero framework overhead."

### "Why Cloudflare over AWS/Vercel?"

> "Cost. The client needed $0 hosting. Cloudflare's free tier gives you: Workers (100K requests/day), KV (100K reads/day), D1 (5M rows reads/day), R2 (10GB storage). For a local service company, that's more than enough. The tradeoff is you're limited to edge-compatible code — no long-running processes, 10ms CPU time limit — but for a request/response web app, that's fine."
