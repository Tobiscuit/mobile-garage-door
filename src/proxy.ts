import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Non-localized routes that should bypass i18n middleware entirely.
// These routes exist outside the [locale] segment and don't need
// locale detection, prefix management, or i18n rewrites.
const NON_LOCALIZED_PREFIXES = [
    '/login',
    '/portal',
    '/signup',
    '/diagnose',
    '/app',
    '/auth',
    '/dashboard',
    '/profile',
    '/admin',
];

export function middleware(request: any) {
    const pathname: string = request.nextUrl?.pathname || '';

    // Skip i18n middleware for non-localized routes — let Vinext's router
    // handle them directly via their static route patterns.
    const isNonLocalized = NON_LOCALIZED_PREFIXES.some(
        prefix => pathname === prefix || pathname.startsWith(prefix + '/')
    );

    if (isNonLocalized) {
        return NextResponse.next();
    }

    // All other routes go through next-intl middleware for locale detection,
    // prefix management, and i18n rewrites (/, /es, /vi, /es/about, etc.)
    if (request.nextUrl && typeof request.nextUrl.clone === 'function') {
        const originalClone = request.nextUrl.clone.bind(request.nextUrl);
        request.nextUrl.clone = () => {
            const cloned = originalClone();

            // Override properties that next-intl mutates, avoiding getter-only crashes
            const propsToMock = ['port', 'host', 'protocol', 'pathname'];
            propsToMock.forEach(prop => {
                let val = cloned[prop];
                Object.defineProperty(cloned, prop, {
                    get: () => val,
                    set: (v) => { val = v; },
                    configurable: true,
                    enumerable: true
                });
            });

            return cloned;
        };
    }
    return intlMiddleware(request);
}

// Vinext expects named export 'proxy' and default export for middleware
export { middleware as proxy };
export default middleware;

export const config = {
    // Canonical next-intl matcher — catches all routes except API/static files.
    // Non-localized routes are handled inside the middleware function above.
    matcher: [
        '/',
        '/(en|es|vi)/:path*',
        '/((?!api|_next|_vercel|.*\\..*).*)'
    ]
};
