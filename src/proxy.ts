import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  if (process.env.AUTH_BYPASS === 'true') {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({
    headers: await headers()
  })

  const { pathname } = request.nextUrl

  if (session && (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/staff-login'))) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  if (!session && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/staff-login', '/signup'],
}
