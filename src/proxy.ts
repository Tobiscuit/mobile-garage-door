import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: any) {
    // Workaround: next-intl mutates nextUrl.clone() properties that are
    // getter-only in Vinext's URL implementation. Wrap clone() to make
    // those properties writable.
    if (request.nextUrl && typeof request.nextUrl.clone === 'function') {
        const originalClone = request.nextUrl.clone.bind(request.nextUrl);
        request.nextUrl.clone = () => {
            const cloned = originalClone();

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
    // Canonical next-intl matcher — all routes go through i18n middleware.
    // With localePrefix: 'as-needed', default locale (en) has no prefix,
    // other locales get prefixed (/es/login, /vi/about, etc.)
    matcher: [
        '/',
        '/(en|es|vi)/:path*',
        '/((?!api|_next|_vercel|.*\\..*).*)'
    ]
};
