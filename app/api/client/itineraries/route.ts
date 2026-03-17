import { NextRequest, NextResponse } from 'next/server'
import { verifyClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await verifyClientSession(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getSupabaseAdmin()

  // Get client account
  const { data: client } = await sb
    .from('client_accounts')
    .select('id, email')
    .eq('id', session.clientId)
    .single()

  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get itineraries linked to this client (by client_account_id or client_email)
  const { data: itineraries } = await sb
    .from('itineraries')
    .select(`
      *,
      days:itinerary_days(id)
    `)
    .or(`client_account_id.eq.${client.id},client_email.eq.${client.email}`)
    .order('updated_at', { ascending: false })

  return NextResponse.json(itineraries || [])
}
