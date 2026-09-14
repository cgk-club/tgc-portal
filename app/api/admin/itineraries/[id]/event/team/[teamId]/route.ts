import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; teamId: string }> }) {
  const denied = await requireAdminAuth(request)
  if (denied) return denied
  const { id, teamId } = await params
  const body = await request.json().catch(() => ({}))
  const patch: Record<string, unknown> = {}
  if (typeof body.can_see_guest_contacts === 'boolean') patch.can_see_guest_contacts = body.can_see_guest_contacts
  if (!Object.keys(patch).length) return NextResponse.json({ error: 'Nothing to change' }, { status: 400 })
  const { error } = await getSupabaseAdmin().from('itinerary_team').update(patch).eq('id', teamId).eq('itinerary_id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// Taking someone off the event closes their phone view at once.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; teamId: string }> }) {
  const denied = await requireAdminAuth(request)
  if (denied) return denied
  const { id, teamId } = await params
  const { error } = await getSupabaseAdmin().from('itinerary_team').update({ status: 'removed' }).eq('id', teamId).eq('itinerary_id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
