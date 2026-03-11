import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit, RATE_LIMITS } from './rate-limit';

// Mock KV store
function createMockKV() {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) => store.get(key) || null),
    put: vi.fn(async (key: string, value: string) => { store.set(key, value); }),
    _store: store,
  };
}

describe('checkRateLimit', () => {
  let kv: ReturnType<typeof createMockKV>;

  beforeEach(() => {
    kv = createMockKV();
  });

  it('allows the first request', async () => {
    const result = await checkRateLimit(kv, 'test:key', 5, 60);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(kv.put).toHaveBeenCalledOnce();
  });

  it('allows requests up to the limit', async () => {
    for (let i = 0; i < 5; i++) {
      const result = await checkRateLimit(kv, 'test:key', 5, 60);
      expect(result.allowed).toBe(true);
    }
  });

  it('blocks requests over the limit', async () => {
    // Fill up the limit
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(kv, 'test:key', 5, 60);
    }
    // This one should be blocked
    const result = await checkRateLimit(kv, 'test:key', 5, 60);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('resets after window expires', async () => {
    // Simulate an expired window
    const expiredRecord = JSON.stringify({
      count: 999,
      windowStart: Math.floor(Date.now() / 1000) - 120, // 2 minutes ago
    });
    kv._store.set('test:key', expiredRecord);

    const result = await checkRateLimit(kv, 'test:key', 5, 60);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('handles corrupt KV data gracefully', async () => {
    kv._store.set('test:key', 'not-json');
    const result = await checkRateLimit(kv, 'test:key', 5, 60);
    expect(result.allowed).toBe(true); // Treats as new window
  });

  it('isolates different keys', async () => {
    // Fill user A's limit
    for (let i = 0; i < 3; i++) {
      await checkRateLimit(kv, 'user:A', 3, 60);
    }
    const blockedA = await checkRateLimit(kv, 'user:A', 3, 60);
    expect(blockedA.allowed).toBe(false);

    // User B should still be allowed
    const allowedB = await checkRateLimit(kv, 'user:B', 3, 60);
    expect(allowedB.allowed).toBe(true);
  });
});

describe('RATE_LIMITS config', () => {
  it('has sensible defaults for tracking update', () => {
    expect(RATE_LIMITS.trackingUpdate.maxRequests).toBeGreaterThan(0);
    expect(RATE_LIMITS.trackingUpdate.windowSeconds).toBe(60);
  });

  it('allows more polling than updates', () => {
    expect(RATE_LIMITS.trackingLatest.maxRequests).toBeGreaterThan(
      RATE_LIMITS.trackingUpdate.maxRequests
    );
  });
});
