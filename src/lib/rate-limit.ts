/**
 * KV-based rate limiter — framework-agnostic, works on Cloudflare free tier.
 * Uses TRACKING_KV with TTL for sliding window rate limiting.
 *
 * Zero framework coupling — works identically on Vinext, Hono, or raw Workers.
 */

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

/**
 * Check if a request is within the rate limit.
 *
 * @param kv - Cloudflare KV namespace
 * @param key - Unique key for this rate limit (e.g. `ratelimit:update:{userId}`)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowSeconds - Time window in seconds
 */
export async function checkRateLimit(
  kv: any,
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const raw = await kv.get(key);

  let record: { count: number; windowStart: number } | null = null;

  if (raw) {
    try {
      record = JSON.parse(raw);
    } catch {
      record = null;
    }
  }

  // New window or expired window
  if (!record || (now - record.windowStart) >= windowSeconds) {
    await kv.put(key, JSON.stringify({ count: 1, windowStart: now }), {
      expirationTtl: windowSeconds,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  // Within window
  if (record.count >= maxRequests) {
    const retryAfter = windowSeconds - (now - record.windowStart);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, retryAfter),
    };
  }

  // Increment
  record.count += 1;
  const remainingTtl = windowSeconds - (now - record.windowStart);
  await kv.put(key, JSON.stringify(record), {
    expirationTtl: Math.max(1, remainingTtl),
  });

  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Pre-configured rate limit profiles for tracking endpoints.
 */
export const RATE_LIMITS = {
  /** Tech GPS updates: max 4 per minute (every 15s fastest) */
  trackingUpdate: { maxRequests: 4, windowSeconds: 60 },
  /** Customer polling: max 12 per minute (every 5s fastest) */
  trackingLatest: { maxRequests: 12, windowSeconds: 60 },
  /** Status changes: max 5 per minute */
  statusChange: { maxRequests: 5, windowSeconds: 60 },
  /** Push subscription: max 3 per minute */
  pushSubscribe: { maxRequests: 3, windowSeconds: 60 },
} as const;
