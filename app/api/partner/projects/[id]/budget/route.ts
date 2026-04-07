import { NextRequest, NextResponse } from 'next/server'
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from '@/lib/partner-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params

  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await verifyPartnerSession(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getSupabaseAdmin()

  // Verify partner access + get visibility
  const { data: assignment } = await sb
    .from('project_partners')
    .select('id, visibility_settings')
    .eq('project_id', projectId)
    .eq('partner_id', session.partnerId)
    .in('status', ['active', 'completed'])
    .single()

  if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const vis = assignment.visibility_settings as Record<string, string> || {}

  // Fetch budget + revenue
  const [{ data: budget }, { data: revenue }] = await Promise.all([
    sb.from('event_budget_items').select('*').eq('project_id', projectId).order('sort_order', { ascending: true }),
    sb.from('event_revenue_items').select('*').eq('project_id', projectId).order('sort_order', { ascending: true }),
  ])

  // Filter based on visibility
  const budgetVisible = vis.budget === 'view' || vis.financials === 'read_only' || vis.financials === 'full_access'

  const response = NextResponse.json({
    budget: budgetVisible ? (budget || []) : [],
    revenue: budgetVisible ? (revenue || []) : [],
    can_see_budget: budgetVisible,
  })
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return response
}

// Partners can add their own expense items
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
    .from('event_budget_items')
    .insert({
      project_id: projectId,
      category: body.category || 'partner_expense',
      label: body.label,
      description: body.description || null,
      budgeted: body.budgeted || 0,
      committed: body.committed || 0,
      paid: body.paid || 0,
      status: body.status || 'planned',
      owner: partner?.org_name || 'Partner',
      owner_partner_id: session.partnerId,
      reimbursable: true,
      sort_order: body.sort_order || 100,
      notes: body.notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
