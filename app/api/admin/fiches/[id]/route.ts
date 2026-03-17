import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getOrgById } from '@/lib/airtable'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: fiche, error } = await getSupabaseAdmin()
    .from('fiches')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !fiche) {
    return NextResponse.json({ error: 'Fiche not found' }, { status: 404 })
  }

  const org = await getOrgById(fiche.airtable_record_id)
  return NextResponse.json({ ...fiche, org })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const allowedFields = [
    'slug',
    'hero_image_url',
    'headline',
    'description',
    'highlights',
    'gallery_urls',
    'tags',
    'tgc_note',
    'template_type',
    'template_fields',
    'show_price',
    'price_display',
    'status',
    'featured',
  ]

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field]
    }
  }

  const { data: fiche, error } = await getSupabaseAdmin()
    .from('fiches')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(fiche)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error } = await getSupabaseAdmin()
    .from('fiches')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
