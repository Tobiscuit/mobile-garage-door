# ADR 001: Vinext and next-intl Middleware Integration

## Context
During the migration to Vinext (Next.js reimplemented on Vite for Cloudflare Workers), we encountered a 500 Internal Server Error when running the development server. The error occurred within `next-intl`'s middleware:

```
TypeError: Cannot set property port of [object Object] which has only a getter
    at getAlternateLinksHeaderValue (next-intl/middleware/getAlternateLinksHeaderValue.js)
```

**Root Cause:**
`next-intl` attempts to generate `Link: <url>; rel="alternate"` HTTP response headers for SEO, indicating the availability of other locales. To do this, it clones the request URL and attempts to mutate its properties (e.g., `url.port = "3000"`). 
However, Vinext's request shim provides an immutable WHATWG `URL` object (where properties like `port` have only getters), whereas standard Next.js provides a mutable `NextURL` wrapper. This immutability clash causes the middleware to crash completely.

## Decision
We decided to **disable** `next-intl`'s HTTP `alternateLinks` generation in the routing configuration (`src/i18n/routing.ts`).

Instead, we rely entirely on the HTML `<link rel="alternate">` tags injected via Next.js metadata API in the root layout (`src/app/(site)/layout.tsx`). Search engines like Google respect both HTML tags and HTTP headers equally for `hreflang` discovery, so there is no SEO penalty.

## Status
**Temporary / Technical Debt**

## Consequences
- The 500 Internal Server error is resolved.
- HTTP response headers will not contain `Link` rel="alternate" headers.
- HTML `<head>` will contain the alternate links (managed via standard Next.js `metadata`).
- **Required Action:** When Vinext resolves issue #177 or makes their `URL` shim fully compatible with Next.js's mutable `NextURL` API, this workaround can be reverted.

## Revert Instructions
When Vinext fixes this upstream:
1. Open `src/i18n/routing.ts`
2. Remove `alternateLinks: false`
3. Test that the middleware generates localized headers successfully without crashing.
