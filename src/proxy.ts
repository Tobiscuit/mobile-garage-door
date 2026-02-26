import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getSessionSafe } from '@/lib/get-session-safe'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth-protected routes: apply auth redirects (no locale)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/portal') || 
      pathname.startsWith('/app') || pathname.startsWith('/profile') ||
      pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    
    if (process.env.AUTH_BYPASS === 'true') {
      return NextResponse.next()
    }

    const session = await getSessionSafe(await headers())

    if (session && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
      return NextResponse.redirect(new URL('/app', request.url))
    }

    if (!session && (pathname.startsWith('/dashboard') || pathname.startsWith('/portal') || pathname.startsWith('/app') || pathname.startsWith('/profile'))) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  }

  // All other routes: apply locale detection and routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Locale routes
    '/',
    '/(en|es|vi)/:path*',
    // Public pages (will get locale prefix)
    '/about',
    '/blog/:path*',
    '/book-service',
    '/contact',
    '/portfolio/:path*',
    '/privacy',
    '/services',
    // Auth-protected routes
    '/dashboard/:path*',
    '/portal/:path*',
    '/app/:path*',
    '/profile/:path*',
    '/login',
    '/signup',
  ],
}


