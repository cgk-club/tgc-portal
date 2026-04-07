import { NextRequest, NextResponse } from 'next/server'
import { verifyClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface ClientVisibilitySettings {
  milestones: 'hidden' | 'view'
  documents: 'hidden' | 'shared_only' | 'all'
  activity: 'hidden' | 'filtered' | 'all'
  financials: 'hidden' | 'own_only'
  guests: 'hidden' | 'first_name_only' | 'view'
  schedule: 'hidden' | 'view'
  budget: 'hidden' | 'view'
  sponsors: 'hidden' | 'view'
  tasks: 'hidden' | 'view'
  partners: 'hidden' | 'view'
}

const DEFAULT_VISIBILITY: ClientVisibilitySettings = {
  milestones: 'view',
  documents: 'shared_only',
  activity: 'filtered',
  financials: 'own_only',
  guests: 'first_name_only',
  schedule: 'view',
  budget: 'hidden',
  sponsors: 'hidden',
  tasks: 'hidden',
  partners: 'hidden',
}

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

  const { data: client } = await sb
    .from('client_accounts')
    .select('id')
    .eq('id', session.clientId)
    .single()

  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if client owns the project
  const { data: ownedProject } = await sb
    .from('client_projects')
    .select('*')
    .eq('id', id)
    .eq('client_id', client.id)
    .single()

  // Check if client is linked to the project
  const { data: linkEntry } = await sb
    .from('project_clients')
    .select('id, role, status, visibility_settings')
    .eq('project_id', id)
    .eq('client_id', client.id)
    .eq('status', 'active')
    .single()

  if (!ownedProject && !linkEntry) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // For owned projects, full access (backward compatible)
  if (ownedProject && !linkEntry) {
    const [milestonesRes, documentsRes, updatesRes, financialsRes] = await Promise.all([
      sb.from('project_milestones').select('*').eq('project_id', id).order('sort_order', { ascending: true }),
      sb.from('project_documents').select('*').eq('project_id', id).order('created_at', { ascending: false }),
      sb.from('project_updates').select('*').eq('project_id', id).order('created_at', { ascending: false }),
      sb.from('project_financials').select('*').eq('project_id', id).order('date', { ascending: false }),
    ])

    const response = NextResponse.json({
      ...ownedProject,
      milestones: milestonesRes.data || [],
      documents: documentsRes.data || [],
      updates: updatesRes.data || [],
      financials: financialsRes.data || [],
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  }

  // For linked projects, apply visibility settings
  let project = ownedProject
  if (!project) {
    const { data } = await sb
      .from('client_projects')
      .select('id, type, title, property_address, property_city, property_country, property_images, property_details, status, start_date, target_date, updated_at')
      .eq('id', id)
      .single()
    project = data
  }

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const visibility: ClientVisibilitySettings = {
    ...DEFAULT_VISIBILITY,
    ...(linkEntry?.visibility_settings as Partial<ClientVisibilitySettings> || {}),
  }

  const responseBody: Record<string, unknown> = {
    id: project.id,
    type: project.type,
    title: project.title,
    property_address: project.property_address,
    property_city: project.property_city,
    property_country: project.property_country,
    property_images: project.property_images,
    status: project.status,
    start_date: project.start_date,
    target_date: project.target_date,
    updated_at: project.updated_at,
    client_role: linkEntry?.role || 'attendee',
    visibility_settings: visibility,
    is_linked: true,
  }

  // Milestones
  if (visibility.milestones === 'view') {
    const { data } = await sb.from('project_milestones')
      .select('id, title, description, status, due_date, completed_date, sort_order')
      .eq('project_id', id)
      .order('sort_order', { ascending: true })
    responseBody.milestones = data || []
  } else {
    responseBody.milestones = []
  }

  // Documents
  if (visibility.documents !== 'hidden') {
    const { data: allDocs } = await sb.from('project_documents')
      .select('id, title, file_url, file_type, uploaded_by_type, notes, created_at')
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    if (visibility.documents === 'shared_only') {
      responseBody.documents = (allDocs || []).filter(d => d.uploaded_by_type === 'admin')
    } else {
      responseBody.documents = allDocs || []
    }
  } else {
    responseBody.documents = []
  }

  // Activity
  if (visibility.activity !== 'hidden') {
    const { data: allUpdates } = await sb.from('project_updates')
      .select('id, author_type, author_name, message, created_at')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (visibility.activity === 'filtered') {
      responseBody.updates = (allUpdates || []).filter(u => u.author_type === 'admin')
    } else {
      responseBody.updates = allUpdates || []
    }
  } else {
    responseBody.updates = []
  }

  // Financials (own payments only)
  if (visibility.financials === 'own_only') {
    const { data } = await sb.from('project_financials')
      .select('id, type, description, amount, currency, date, status')
      .eq('project_id', id)
      .order('date', { ascending: false })
    // Filter to payments only (not internal expenses)
    responseBody.financials = (data || []).filter(f => ['payment', 'invoice'].includes(f.type))
  } else {
    responseBody.financials = []
  }

  // Guests
  if (visibility.guests !== 'hidden') {
    const { data: projectGuests } = await sb.from('event_guests')
      .select('id, name, guest_type, company, status, created_at')
      .eq('project_id', id)
      .order('name', { ascending: true })

    responseBody.guests = (projectGuests || []).map(g => ({
      id: g.id,
      name: visibility.guests === 'first_name_only'
        ? (g.name?.split(' ')[0] || 'Guest')
        : g.name,
      company: g.company,
      status: g.status,
    }))
  }

  // Budget
  if (visibility.budget === 'view') {
    responseBody.budget = (project as Record<string, unknown>).budget
    responseBody.currency = (project as Record<string, unknown>).currency
  }

  // Sponsors
  if (visibility.sponsors === 'view') {
    const pd = (project as Record<string, unknown>).property_details as Record<string, unknown> | null
    if (pd?.sponsors && Array.isArray(pd.sponsors)) {
      responseBody.sponsors = pd.sponsors
    }
  }

  const response = NextResponse.json(responseBody)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return response
}
