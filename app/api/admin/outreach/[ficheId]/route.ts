import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ficheId: string }> }
) {
  const { ficheId } = await params

  const { data } = await getSupabaseAdmin()
    .from('outreach_log')
    .select('*')
    .eq('fiche_id', ficheId)
    .order('sent_at', { ascending: false })

  return NextResponse.json(data || [])
}
