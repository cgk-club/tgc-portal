import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Put a partner or staff account on this event (or back on it).
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminAuth(request)
  if (denied) return denied
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  if (!body.partner_id) return NextResponse.json({ error: 'Choose who to add' }, { status: 400 })

  const sb = getSupabaseAdmin()
  const { data: partner } = await sb.from('partner_accounts').select('id, status').eq('id', body.partner_id).maybeSingle()
  if (!partner || partner.status !== 'active') return NextResponse.json({ error: 'That account is not active' }, { status: 400 })

  const { error } = await sb.from('itinerary_team').upsert(
    { itinerary_id: id, partner_id: body.partner_id, can_see_guest_contacts: body.can_see_guest_contacts === true, status: 'active' },
    { onConflict: 'itinerary_id,partner_id' }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 201 })
}
