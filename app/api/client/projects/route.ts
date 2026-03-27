import { NextRequest, NextResponse } from 'next/server'
import { verifyClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
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

  // Get projects with milestone counts
  const { data: projects, error } = await sb
    .from('client_projects')
    .select('*')
    .eq('client_id', client.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // For each project, get milestone counts
  const projectIds = (projects || []).map(p => p.id)

  let milestoneCounts: Record<string, { total: number; completed: number }> = {}
  let lastUpdates: Record<string, string | null> = {}

  if (projectIds.length > 0) {
    const { data: milestones } = await sb
      .from('project_milestones')
      .select('project_id, status')
      .in('project_id', projectIds)

    if (milestones) {
      for (const m of milestones) {
        if (!milestoneCounts[m.project_id]) {
          milestoneCounts[m.project_id] = { total: 0, completed: 0 }
        }
        milestoneCounts[m.project_id].total++
        if (m.status === 'completed') {
          milestoneCounts[m.project_id].completed++
        }
      }
    }

    // Get last update for each project
    const { data: updates } = await sb
      .from('project_updates')
      .select('project_id, created_at')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })

    if (updates) {
      for (const u of updates) {
        if (!lastUpdates[u.project_id]) {
          lastUpdates[u.project_id] = u.created_at
        }
      }
    }
  }

  const enriched = (projects || []).map(p => ({
    ...p,
    milestones_total: milestoneCounts[p.id]?.total || 0,
    milestones_completed: milestoneCounts[p.id]?.completed || 0,
    last_update_at: lastUpdates[p.id] || null,
  }))

  return NextResponse.json(enriched)
}
