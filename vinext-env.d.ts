/// <reference types="vinext/types" />
/// <reference types="@cloudflare/workers-types" />
/// <reference types="google.maps" />

// `vinext/types` re-exports @vinext/types, which declares the `next/*` modules
// (next/navigation, next/cache, next/server, next/headers, next/image, ...)
// that vinext shims at runtime. Without this reference TypeScript cannot see
// them, because there is no `next` package installed — that was the cause of
// the TS2307 errors on next/navigation and next/cache.
//
// @cloudflare/workers-types supplies the Workers globals (D1Database,
// KVNamespace, R2Bucket, Fetcher), which were TS2304 for the same reason:
// the package was installed but never referenced.
