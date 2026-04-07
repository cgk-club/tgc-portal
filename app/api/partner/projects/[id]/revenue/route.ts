import { NextRequest, NextResponse } from 'next/server'
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from '@/lib/partner-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Partners can add revenue items (sponsor confirmations, etc.)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params

  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await verifyPartnerSession(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getSupabaseAdmin()

  const { data: assignment } = await sb
    .from('project_partners')
    .select('id, role')
    .eq('project_id', projectId)
    .eq('partner_id', session.partnerId)
    .eq('status', 'active')
    .single()

  if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: partner } = await sb
    .from('partner_accounts')
    .select('org_name')
    .eq('id', session.partnerId)
    .single()

  const body = await request.json()

  const { data, error } = await sb
    .from('event_revenue_items')
    .insert({
      project_id: projectId,
      type: body.type || 'sponsorship',
      label: body.label,
      description: body.description || null,
      sponsor_name: body.sponsor_name || null,
      sponsor_tier: body.sponsor_tier || null,
      included_pax: body.included_pax || 0,
      projected: body.projected || 0,
      confirmed: body.confirmed || 0,
      status: body.status || 'projected',
      added_by: partner?.org_name || 'Partner',
      added_by_partner_id: session.partnerId,
      sort_order: body.sort_order || 100,
      notes: body.notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
