import { NextRequest, NextResponse } from 'next/server'
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from '@/lib/partner-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Partners can update revenue items they added
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: projectId, itemId } = await params

  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await verifyPartnerSession(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getSupabaseAdmin()

  // Verify partner on project
  const { data: assignment } = await sb
    .from('project_partners')
    .select('id')
    .eq('project_id', projectId)
    .eq('partner_id', session.partnerId)
    .eq('status', 'active')
    .single()

  if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Verify item belongs to this project and was added by this partner (or allow all if co-producer)
  const { data: item } = await sb
    .from('event_revenue_items')
    .select('id, added_by_partner_id')
    .eq('id', itemId)
    .eq('project_id', projectId)
    .single()

  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  const body = await request.json()
  const allowed = ['label', 'description', 'sponsor_name', 'sponsor_tier', 'included_pax', 'projected', 'confirmed', 'invoiced', 'received', 'status', 'notes']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const { data, error } = await sb
    .from('event_revenue_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
