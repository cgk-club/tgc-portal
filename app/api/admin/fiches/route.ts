import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { searchOrgs, getOrgById } from '@/lib/airtable'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const airtableSearch = searchParams.get('airtableSearch')
  const search = searchParams.get('search')
  const status = searchParams.get('status')

  // If airtableSearch is present, search Airtable directly
  if (airtableSearch) {
    const orgs = await searchOrgs(airtableSearch)
    return NextResponse.json(orgs)
  }

  // Otherwise, fetch fiches from Supabase
  let query = getSupabaseAdmin().from('fiches').select('*').order('updated_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: fiches, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Enrich with Airtable data
  const enriched = await Promise.all(
    (fiches || []).map(async (fiche) => {
      const org = await getOrgById(fiche.airtable_record_id)
      return { ...fiche, org }
    })
  )

  // Client-side name search filter
  const filtered = search
    ? enriched.filter((f) =>
        f.org?.name?.toLowerCase().includes(search.toLowerCase()) ||
        f.slug.toLowerCase().includes(search.toLowerCase())
      )
    : enriched

  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { airtable_record_id, name } = body

  if (!airtable_record_id || !name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check if fiche already exists for this Airtable record
  const { data: existing } = await getSupabaseAdmin()
    .from('fiches')
    .select('id')
    .eq('airtable_record_id', airtable_record_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Fiche already exists for this organization' }, { status: 409 })
  }

  let slug = slugify(name)

  // Ensure slug uniqueness
  const { data: slugCheck } = await getSupabaseAdmin()
    .from('fiches')
    .select('id')
    .eq('slug', slug)
    .single()

  if (slugCheck) {
    slug = `${slug}-${Date.now()}`
  }

  const { data: fiche, error } = await getSupabaseAdmin()
    .from('fiches')
    .insert({
      airtable_record_id,
      slug,
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(fiche, { status: 201 })
}
