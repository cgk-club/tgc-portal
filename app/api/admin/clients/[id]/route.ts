import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sb = getSupabaseAdmin()

  const { data: client, error } = await sb
    .from('client_accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Get their itineraries
  const { data: itineraries } = await sb
    .from('itineraries')
    .select('*, days:itinerary_days(id)')
    .or(`client_account_id.eq.${id},client_email.eq.${client.email}`)
    .order('updated_at', { ascending: false })

  return NextResponse.json({ ...client, itineraries: itineraries || [] })
}
