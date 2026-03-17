import { NextRequest, NextResponse } from 'next/server'
import { verifyClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 })

  const session = await verifyClientSession(token)
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 })

  const { data: client } = await getSupabaseAdmin()
    .from('client_accounts')
    .select('id, name, email')
    .eq('id', session.clientId)
    .single()

  if (!client) return NextResponse.json({ authenticated: false }, { status: 401 })

  return NextResponse.json({ authenticated: true, client })
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(CLIENT_COOKIE_NAME)
  return response
}
