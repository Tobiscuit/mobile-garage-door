import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getSession } from 'next-auth/react'

export async function proxy(req: NextRequest) {
  const token = await getToken({ req })
  const isAuthenticated = !!token

  if (req.nextUrl.pathname.startsWith('/auth') && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (req.nextUrl.pathname.startsWith('/dashboard') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
