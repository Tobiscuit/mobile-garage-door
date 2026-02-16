import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getSessionSafe } from '@/lib/get-session-safe'

export async function proxy(request: NextRequest) {
  if (process.env.AUTH_BYPASS === 'true') {
    return NextResponse.next()
  }

  const session = await getSessionSafe(await headers())

  const { pathname } = request.nextUrl

  if (session && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  if (!session && (pathname.startsWith('/dashboard') || pathname.startsWith('/portal') || pathname.startsWith('/app') || pathname.startsWith('/profile'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/portal/:path*', '/app/:path*', '/profile/:path*', '/login', '/signup'],
}
