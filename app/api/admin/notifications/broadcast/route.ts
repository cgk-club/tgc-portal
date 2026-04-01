import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const sb = getSupabaseAdmin()
  const body = await request.json()
  const { user_type, title, body: notifBody, type, link } = body

  if (!user_type || !title || !type) {
    return NextResponse.json(
      { error: 'user_type, title, and type are required' },
      { status: 400 }
    )
  }

  if (!['client', 'partner'].includes(user_type)) {
    return NextResponse.json(
      { error: 'user_type must be client or partner' },
      { status: 400 }
    )
  }

  const validTypes = ['update', 'approval', 'itinerary', 'new_partner', 'general']
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: `type must be one of: ${validTypes.join(', ')}` },
      { status: 400 }
    )
  }

  let userIds: string[] = []

  if (user_type === 'client') {
    const { data } = await sb.from('client_accounts').select('id')
    userIds = (data || []).map((c) => c.id)
  } else if (user_type === 'partner') {
    const { data } = await sb.from('partner_users').select('id')
    userIds = (data || []).map((p) => p.id)
  }

  if (userIds.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const rows = userIds.map((uid) => ({
    user_type,
    user_id: uid,
    title,
    body: notifBody || null,
    type,
    link: link || null,
  }))

  const { error } = await sb.from('notifications').insert(rows)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sent: userIds.length })
}
