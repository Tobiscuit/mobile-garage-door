// Cloudflare context helpers
// Re-export KVCacheHandler from vinext/cloudflare
export { KVCacheHandler } from 'vinext/cloudflare';

// Canonical Cloudflare Workers env access (March 2025+)
// Uses the built-in cloudflare:workers module — no globals, no ALS, no proxy.
// Available in Workers runtime when compatibility_date >= 2024-09-23.
// See: https://developers.cloudflare.com/workers/runtime-apis/bindings/
//
// Note: Direct I/O (D1 queries, KV reads, etc.) must still happen inside
// a request context (fetch handler or downstream), not at module top-level.

let _env: any = null;

export async function getCloudflareContext(): Promise<{ env: any; ctx: any }> {
    // Production: use the cloudflare:workers runtime module
    if (_env) {
        return { env: _env, ctx: { waitUntil: () => { } } };
    }

    try {
        // Dynamic import so Vite doesn't try to resolve this at build time
        const cfWorkers = await import('cloudflare:workers');
        _env = cfWorkers.env;
        return {
            env: _env,
            ctx: { waitUntil: (promise: Promise<any>) => { promise.catch(console.error); } },
        };
    } catch {
        // Local dev fallback — dynamically load Wrangler Platform Proxy
        console.warn('[getCloudflareContext] cloudflare:workers not available. Trying Wrangler proxy for local dev.');
        try {
            const { getPlatformProxy } = await import('wrangler');
            const proxy = await getPlatformProxy();
            _env = proxy.env;
            return {
                env: proxy.env,
                ctx: {
                    ...(proxy.ctx || {}),
                    waitUntil: proxy.ctx?.waitUntil || ((promise: Promise<any>) => { promise.catch(console.error); }),
                },
            };
        } catch {
            console.warn('Failed to load Wrangler proxy. Data fetching will return empty results.');
            return {
                env: {
                    DB: null,
                    MEDIA_BUCKET: null,
                    VINEXT_CACHE: null,
                },
                ctx: {
                    waitUntil: (promise: Promise<any>) => { promise.catch(() => { }); },
                },
            };
        }
    }
}
