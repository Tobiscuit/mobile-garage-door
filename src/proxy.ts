import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: any) {
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

export const config = {
    // Match all pathnames except static files and API routes
    matcher: ['/', '/(en|es|vi)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
