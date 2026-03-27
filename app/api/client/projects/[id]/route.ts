import { NextRequest, NextResponse } from 'next/server'
import { verifyClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await verifyClientSession(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getSupabaseAdmin()

  // Get client
  const { data: client } = await sb
    .from('client_accounts')
    .select('id')
    .eq('id', session.clientId)
    .single()

  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get project — must belong to this client
  const { data: project, error } = await sb
    .from('client_projects')
    .select('*')
    .eq('id', id)
    .eq('client_id', client.id)
    .single()

  if (error || !project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Load related data in parallel
  const [milestonesRes, documentsRes, updatesRes, financialsRes] = await Promise.all([
    sb.from('project_milestones')
      .select('*')
      .eq('project_id', id)
      .order('sort_order', { ascending: true }),
    sb.from('project_documents')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false }),
    sb.from('project_updates')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false }),
    sb.from('project_financials')
      .select('*')
      .eq('project_id', id)
      .order('date', { ascending: false }),
  ])

  return NextResponse.json({
    ...project,
    milestones: milestonesRes.data || [],
    documents: documentsRes.data || [],
    updates: updatesRes.data || [],
    financials: financialsRes.data || [],
  })
}
