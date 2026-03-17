import { NextRequest, NextResponse } from 'next/server'
import { verifySession, COOKIE_NAME } from '@/lib/auth'
import { verifyClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin auth
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (pathname === '/api/admin/auth') {
      return NextResponse.next()
    }

    const token = request.cookies.get(COOKIE_NAME)?.value

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const valid = await verifySession(token)
    if (!valid) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Client portal auth (protect /client but not /client/login or /client/auth)
  if (pathname === '/client') {
    const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.redirect(new URL('/client/login', request.url))
    }
    const session = await verifyClientSession(token)
    if (!session) {
      return NextResponse.redirect(new URL('/client/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/client'],
}
