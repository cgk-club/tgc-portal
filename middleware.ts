import { NextRequest, NextResponse } from 'next/server'
import { verifySession, COOKIE_NAME } from '@/lib/auth'
import { verifyClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from '@/lib/partner-auth'

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

  // Client portal auth (protect /client and subpaths, but not /client/login or /client/auth)
  if (pathname === '/client' || pathname.startsWith('/client/collection') || pathname.startsWith('/client/conversation') || pathname.startsWith('/client/events') || pathname.startsWith('/client/points')) {
    const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.redirect(new URL('/client/login', request.url))
    }
    const session = await verifyClientSession(token)
    if (!session) {
      return NextResponse.redirect(new URL('/client/login', request.url))
    }
  }

  // Partner portal auth
  if (pathname === '/partner/login' || pathname.startsWith('/partner/auth')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/partner') || pathname.startsWith('/api/partner')) {
    if (pathname === '/api/partner/login' || pathname.startsWith('/api/partner/verify')) {
      return NextResponse.next()
    }

    const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/partner/login', request.url))
    }

    const session = await verifyPartnerSession(token)
    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/partner/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/client',
    '/client/collection/:path*',
    '/client/conversation/:path*',
    '/client/events/:path*',
    '/client/points/:path*',
    '/partner/:path*',
    '/api/partner/:path*',
  ],
}
