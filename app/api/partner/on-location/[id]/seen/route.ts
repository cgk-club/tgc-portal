import { NextRequest, NextResponse } from 'next/server'
import { assignedCaller } from '@/lib/partner-event-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Marks every change on this event as seen by the signed-in team member.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { caller, assignment } = await assignedCaller(request, id)
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sb = getSupabaseAdmin()
  const { data: unseen } = await sb
    .from('itinerary_changes')
    .select('id, seen_by')
    .eq('itinerary_id', id)
    .not('seen_by', 'cs', `{${caller.userId}}`)
    .limit(200)
  for (const c of unseen || []) {
    await sb.from('itinerary_changes').update({ seen_by: [...(c.seen_by || []), caller.userId] }).eq('id', c.id)
  }
  return NextResponse.json({ marked: (unseen || []).length })
}
