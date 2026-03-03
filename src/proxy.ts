import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: any) {
    if (request.nextUrl && typeof request.nextUrl.clone === 'function') {
        const originalClone = request.nextUrl.clone.bind(request.nextUrl);
        request.nextUrl.clone = () => {
            const cloned = originalClone();

            // Override properties that next-intl mutate, avoiding getter-only crashes
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
    // Match only locale-prefixed routes and the root.
    // Exclude non-localized static routes so they bypass i18n middleware
    // and hit Vinext's router directly (where they match their static patterns).
    matcher: [
        '/',
        '/(en|es|vi)/:path*',
        '/((?!api|_next|_vercel|login|portal|signup|diagnose|app|auth|dashboard|profile|admin|.*\\..*).*)'
    ]
};
