import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Christian marks a change as handled (seen, and any WhatsApp messages sent).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; changeId: string }> }) {
  const denied = await requireAdminAuth(request)
  if (denied) return denied
  const { id, changeId } = await params
  const body = await request.json().catch(() => ({}))
  const { error } = await getSupabaseAdmin()
    .from('itinerary_changes')
    .update({ admin_seen: body.admin_seen !== false })
    .eq('id', changeId)
    .eq('itinerary_id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
