import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('payload-token')?.value
  const { pathname } = request.nextUrl

  // Protect /dashboard routes (Admin Dispatch)
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Protect /technician routes (Technician Dashboard)
  if (pathname.startsWith('/technician')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/technician/:path*',
  ],
}
