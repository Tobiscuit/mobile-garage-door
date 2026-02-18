# Email Architecture Strategy

## Purpose
Implement production-grade email for:
- Passwordless authentication (magic links)
- Operational notifications (dispatch, receipts, status updates)
- Marketing/newsletter communications

This plan prioritizes deliverability, security, and low-friction UX.

## Goals
1. Reliable inbox delivery for auth and transactional email.
2. Strong anti-abuse controls (enumeration resistance, rate limits, suppression).
3. Clear domain separation so marketing reputation does not degrade auth email delivery.
4. Operational visibility for bounces, complaints, and delivery health.

## Non-Goals
1. Building a custom SMTP server.
2. Mixing auth and marketing into the same sender identity.
3. Introducing password-based login.

## Reference Architecture

### Email Streams
1. Transactional/Auth stream:
- Magic links
- Security notices
- Receipts
- Dispatch updates

2. Marketing stream:
- Biweekly newsletter
- Blog announcements

### Sender Strategy
Use separate subdomains and identities:
- `no-reply@auth.mobilegaragedoor.com` (auth links only)
- `dispatch@notify.mobilegaragedoor.com` (ops notifications)
- `newsletter@news.mobilegaragedoor.com` (marketing)

### Why separation matters
Complaint/bounce reputation from newsletters can harm auth email inboxing if shared. Separate streams reduce blast radius.

## Provider and Cloud Notes

### AWS SES
Primary provider for this plan. SES is first-party transactional email on AWS.

### GCP equivalent question
GCP does not provide a direct first-party SES-equivalent transactional email product. Typical pattern on GCP is hosting app workloads on GCP and using a third-party mail provider (SES, SendGrid, Postmark, Resend, etc.).

## Phase Plan

## Phase 0: Prerequisites and Decisions
1. Choose SES region (default: `us-east-1` unless compliance requires another).
2. Confirm DNS provider control for domain and subdomains.
3. Confirm sender identities and branding.
4. Define internal owner for deliverability monitoring.

## Phase 1: SES Domain Setup
1. Create SES identities for:
- `mobilegaragedoor.com`
- `auth.mobilegaragedoor.com`
- `notify.mobilegaragedoor.com`
- `news.mobilegaragedoor.com`
2. Enable Easy DKIM on each identity.
3. Configure custom MAIL FROM domains (recommended) for alignment.
4. Submit SES production access request (sandbox exit).

## Phase 2: DNS Authentication
1. SPF:
- Maintain one SPF TXT per domain.
- Include SES sender sources without duplicate SPF records.
2. DKIM:
- Add SES-generated DKIM CNAMEs.
3. DMARC:
- Start with monitor-only policy:
  - `v=DMARC1; p=none; rua=mailto:dmarc@mobilegaragedoor.com; adkim=s; aspf=s; pct=100`
4. After stable passing alignment:
- Move to `p=quarantine`, then `p=reject`.

## Phase 3: Security and IAM
1. Create least-privilege IAM role/user for sending.
2. Limit send permissions to approved SES identities.
3. Store secrets in secret manager (not repo `.env`).
4. Enable credential rotation policy.

## Phase 4: Application Integration

### 4.1 BetterAuth Magic Links
1. Replace console logging sender in `src/lib/auth.ts` with SES send API call.
2. Keep generic UI response:
- "If your email is eligible, we sent a sign-in link."
3. Preserve invite-only staff role grant and customer auto-provisioning.

### 4.2 Payload Email Integration
1. Configure Payload email transport in `src/payload.config.ts` for system mail use cases.
2. Route auth emails through auth stream identity; operational mail through notify identity.

### 4.3 Environment Variables
Add:
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `SES_FROM_AUTH`
- `SES_FROM_NOTIFY`
- `SES_FROM_MARKETING`
- `BETTER_AUTH_BASE_URL`

## Phase 5: Abuse Protection and Reliability
1. Rate-limit `/api/auth/sign-in/magic-link` by IP and email.
2. Add cooldown and burst limits.
3. Optional bot challenge after threshold violations.
4. Implement retry/backoff only for transient send failures.

## Phase 6: Eventing and Suppression
1. Create SES Configuration Sets:
- `auth-tx`
- `ops-tx`
- `marketing`
2. Publish events (delivery, bounce, complaint, reject) to SNS or EventBridge.
3. Build webhook/consumer to update suppression list:
- Hard bounce => suppress
- Complaint => suppress permanently
- Soft bounce => controlled retry policy
4. Prevent all future sends to suppressed addresses unless manually released.

## Phase 7: Content and Template Strategy
1. Auth emails:
- Minimal content, single CTA, no promotional copy.
2. Operational emails:
- Clear job context, no sensitive overexposure.
3. Marketing emails:
- Separate template system, legal footer, unsubscribe, preference center.
4. Always include plaintext part.

## Phase 8: Warm-Up and Launch
1. Internal preflight tests:
- Gmail, Outlook, Yahoo, iCloud.
2. Ramp volume gradually (especially marketing).
3. Monitor daily:
- Bounce rate
- Complaint rate
- Delivery latency
4. Advance DMARC enforcement only after sustained healthy metrics.

## Phase 9: Monitoring and Operations
1. Dashboard KPIs:
- Delivered, bounced, complained, deferred by stream.
2. Alerts:
- Complaint spikes
- Bounce spikes
- SES account-level reputation warnings
3. Weekly review:
- DMARC aggregate reports
- Suppression growth trends
- Top failing domains/ISPs

## Acceptance Criteria
1. Auth magic links deliver reliably to major mailbox providers.
2. Bounce/complaint processing updates suppression state automatically.
3. Staff/customer auth flow remains passwordless and role-safe.
4. Marketing sends do not affect auth stream deliverability metrics.
5. DMARC moved from `none` toward enforcement with stable pass rates.

## Implementation Backlog (Repo-Specific)
1. Wire SES `sendMagicLink` in `src/lib/auth.ts`.
2. Add Payload email transport in `src/payload.config.ts`.
3. Add auth rate limiting middleware for magic-link endpoint.
4. Create suppression storage (table/collection) and event processor.
5. Add operational runbook doc for bounce/complaint remediation.

## Risks and Mitigations
1. Risk: Poor initial reputation on new domain/subdomain.
- Mitigation: warm-up + clean lists + low-volume ramp.
2. Risk: Newsletter complaints impact auth delivery.
- Mitigation: strict stream/domain separation.
3. Risk: Misconfigured SPF/DKIM/DMARC.
- Mitigation: staged rollout with monitoring before enforcement.
4. Risk: Enumeration and abuse via login endpoint.
- Mitigation: generic responses + rate limits + invite-gated staff roles.

## Rollout Sequence (Recommended)
1. DNS + SES identity setup.
2. SES production access approval.
3. App integration for magic-link sends.
4. Eventing + suppression.
5. Controlled production rollout.
6. Marketing stream activation after transactional stability.

