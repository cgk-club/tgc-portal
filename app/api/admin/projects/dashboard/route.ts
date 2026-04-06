import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sb = getSupabaseAdmin()

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  // End of this week (Sunday)
  const dayOfWeek = now.getDay()
  const endOfWeek = new Date(now)
  endOfWeek.setDate(now.getDate() + (7 - dayOfWeek))
  const endOfWeekStr = endOfWeek.toISOString().split('T')[0]

  const [
    activeRes,
    budgetRes,
    milestoneWeekRes,
    overdueTaskRes,
    upcomingMilestonesRes,
    recentUpdatesRes,
  ] = await Promise.all([
    // Count of active projects
    sb.from('client_projects')
      .select('id')
      .eq('status', 'active'),

    // All active projects for budget sum
    sb.from('client_projects')
      .select('budget')
      .eq('status', 'active'),

    // Milestones due this week across all projects
    sb.from('project_milestones')
      .select('id')
      .neq('status', 'completed')
      .neq('status', 'skipped')
      .gte('due_date', todayStr)
      .lte('due_date', endOfWeekStr),

    // Overdue tasks across all projects
    sb.from('project_tasks')
      .select('id')
      .neq('status', 'completed')
      .lt('due_date', todayStr)
      .not('due_date', 'is', null),

    // Next 7 upcoming milestones (not completed, with due_date, sorted)
    sb.from('project_milestones')
      .select('id, title, status, due_date, project_id')
      .neq('status', 'completed')
      .neq('status', 'skipped')
      .gte('due_date', todayStr)
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })
      .limit(7),

    // Last 5 updates across all projects
    sb.from('project_updates')
      .select('id, project_id, author_type, author_name, message, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Resolve project titles for milestones and updates
  const projectIds = new Set<string>()
  for (const m of upcomingMilestonesRes.data || []) projectIds.add(m.project_id)
  for (const u of recentUpdatesRes.data || []) projectIds.add(u.project_id)

  let projectMap: Record<string, string> = {}
  if (projectIds.size > 0) {
    const { data: projects } = await sb
      .from('client_projects')
      .select('id, title')
      .in('id', Array.from(projectIds))

    if (projects) {
      for (const p of projects) {
        projectMap[p.id] = p.title
      }
    }
  }

  // Calculate total budget
  const totalBudget = (budgetRes.data || []).reduce(
    (sum: number, p: { budget: number | null }) => sum + (Number(p.budget) || 0), 0
  )

  const response = NextResponse.json({
    active_count: (activeRes.data || []).length,
    total_budget: totalBudget,
    milestones_due_this_week: (milestoneWeekRes.data || []).length,
    overdue_tasks: (overdueTaskRes.data || []).length,
    upcoming_milestones: (upcomingMilestonesRes.data || []).map(m => ({
      ...m,
      project_title: projectMap[m.project_id] || 'Unknown',
    })),
    recent_updates: (recentUpdatesRes.data || []).map(u => ({
      ...u,
      project_title: projectMap[u.project_id] || 'Unknown',
    })),
  })

  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return response
}
