import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const sb = getSupabaseAdmin()

  // Get the edit request
  const { data: editReq, error: fetchError } = await sb
    .from('fiche_edit_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !editReq) {
    return NextResponse.json({ error: 'Edit request not found' }, { status: 404 })
  }

  if (body.action === 'approve') {
    // Apply the JSONB changes to the fiche
    if (editReq.fiche_id && editReq.changes) {
      const changes = typeof editReq.changes === 'string'
        ? JSON.parse(editReq.changes)
        : editReq.changes

      const { error: updateError } = await sb
        .from('fiches')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', editReq.fiche_id)

      if (updateError) {
        return NextResponse.json({ error: `Failed to apply changes: ${updateError.message}` }, { status: 500 })
      }
    }

    // Mark the edit request as approved
    const { data, error } = await sb
      .from('fiche_edit_requests')
      .update({
        status: 'approved',
        admin_note: body.admin_note || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)

  } else if (body.action === 'reject') {
    const { data, error } = await sb
      .from('fiche_edit_requests')
      .update({
        status: 'rejected',
        admin_note: body.admin_note || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)

  } else {
    return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject".' }, { status: 400 })
  }
}
