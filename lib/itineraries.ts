import { unstable_noStore as noStore } from 'next/cache'
import { randomBytes } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Itinerary, ItineraryDay, ItineraryItem } from '@/types'

function sb() {
  return getSupabaseAdmin()
}

// --- Create ---

export async function createItinerary(data: {
  client_name: string
  client_email?: string
  client_account_id?: string
  title: string
  slug: string
  start_date?: string
}): Promise<Itinerary> {
  // Auto-link: if email provided but no account ID, look up client account
  let accountId = data.client_account_id || null
  if (!accountId && data.client_email) {
    const { data: account } = await sb()
      .from('client_accounts')
      .select('id')
      .eq('email', data.client_email)
      .single()
    if (account) accountId = account.id
  }

  const { data: itinerary, error } = await sb()
    .from('itineraries')
    .insert({
      client_name: data.client_name,
      client_email: data.client_email || null,
      client_account_id: accountId,
      title: data.title,
      slug: data.slug,
      start_date: data.start_date || null,
      status: 'draft',
    })
    .select()
    .single()

  if (error) throw error
  return itinerary
}

export async function createDay(
  itineraryId: string,
  dayNumber: number,
  date?: string,
  title?: string
): Promise<ItineraryDay> {
  const { data: day, error } = await sb()
    .from('itinerary_days')
    .insert({
      itinerary_id: itineraryId,
      day_number: dayNumber,
      date: date || null,
      title: title || null,
      sort_order: dayNumber,
    })
    .select()
    .single()

  if (error) throw error
  return day
}

export async function createItem(
  dayId: string,
  data: {
    fiche_id?: string
    custom_title?: string
    custom_note?: string
    time_of_day?: string
    exact_time?: string
    item_type: 'fiche' | 'note'
    sort_order: number
  }
): Promise<ItineraryItem> {
  const { data: item, error } = await sb()
    .from('itinerary_items')
    .insert({
      day_id: dayId,
      fiche_id: data.fiche_id || null,
      custom_title: data.custom_title || null,
      custom_note: data.custom_note || null,
      time_of_day: data.time_of_day || null,
      exact_time: data.exact_time || null,
      item_type: data.item_type,
      sort_order: data.sort_order,
    })
    .select()
    .single()

  if (error) throw error
  return item
}

// --- Read ---

export async function getItinerary(id: string): Promise<Itinerary | null> {
  noStore()
  const { data, error } = await sb()
    .from('itineraries')
    .select(`
      *,
      days:itinerary_days(
        *,
        items:itinerary_items(
          *,
          fiche:fiches(*)
        )
      )
    `)
    .eq('id', id)
    .order('sort_order', { referencedTable: 'itinerary_days', ascending: true })
    .order('sort_order', { referencedTable: 'itinerary_days.itinerary_items', ascending: true })
    .single()

  if (error) return null
  return data
}

export async function getItineraryByToken(shareToken: string): Promise<Itinerary | null> {
  noStore()
  const { data, error } = await sb()
    .from('itineraries')
    .select(`
      id, slug, client_name, title, cover_image_url, summary,
      status, share_token, start_date, is_member, currency,
      quote_status, created_at, updated_at,
      days:itinerary_days(
        id, itinerary_id, day_number, date, title, notes, sort_order,
        items:itinerary_items(
          id, day_id, fiche_id, custom_title, custom_note,
          time_of_day, exact_time, sort_order, item_type,
          fiche:fiches(
            id, airtable_record_id, slug, hero_image_url, headline,
            description, highlights, gallery_urls, tags,
            latitude, longitude, geocoded_at,
            template_type, template_fields,
            show_price, price_display, status, featured,
            created_at, updated_at
          )
        )
      )
    `)
    .eq('share_token', shareToken)
    .order('sort_order', { referencedTable: 'itinerary_days', ascending: true })
    .order('sort_order', { referencedTable: 'itinerary_days.itinerary_items', ascending: true })
    .single()

  if (error) return null
  // Cast: query intentionally excludes sensitive fields (client_email, client_account_id,
  // quote_notes, quote_token, default_bank_details, unit_price, quantity, is_zero_margin,
  // is_included, price_note, tgc_note) for public safety
  return data as unknown as Itinerary
}

export async function listItineraries(filters?: {
  status?: string
  search?: string
}): Promise<Itinerary[]> {
  let query = sb()
    .from('itineraries')
    .select('*, days:itinerary_days(id)')
    .order('updated_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    query = query.or(
      `client_name.ilike.%${filters.search}%,title.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// --- Update ---

export async function updateItinerary(
  id: string,
  data: Partial<Itinerary>
): Promise<Itinerary> {
  const allowedFields = [
    'client_name', 'client_email', 'client_account_id',
    'title', 'slug', 'cover_image_url', 'summary',
    'status', 'share_token', 'start_date',
    'is_member', 'currency', 'quote_status', 'quote_notes', 'quote_token',
  ]
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const field of allowedFields) {
    if (field in data) {
      updates[field] = (data as Record<string, unknown>)[field]
    }
  }

  // Auto-link: if client_email is being set/changed and no client_account_id provided, look up
  if (updates.client_email && !updates.client_account_id) {
    const { data: account } = await sb()
      .from('client_accounts')
      .select('id')
      .eq('email', updates.client_email as string)
      .single()
    if (account) updates.client_account_id = account.id
  }

  const { data: itinerary, error } = await sb()
    .from('itineraries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return itinerary
}

export async function updateDay(
  id: string,
  data: Partial<ItineraryDay>
): Promise<ItineraryDay> {
  const allowedFields = ['day_number', 'date', 'title', 'notes', 'sort_order']
  const updates: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in data) {
      updates[field] = (data as Record<string, unknown>)[field]
    }
  }

  const { data: day, error } = await sb()
    .from('itinerary_days')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return day
}

export async function updateItem(
  id: string,
  data: Partial<ItineraryItem>
): Promise<ItineraryItem> {
  const allowedFields = [
    'fiche_id', 'custom_title', 'custom_note',
    'time_of_day', 'exact_time', 'sort_order', 'item_type',
    'unit_price', 'quantity', 'price_note', 'is_zero_margin', 'is_included',
  ]
  const updates: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in data) {
      updates[field] = (data as Record<string, unknown>)[field]
    }
  }

  const { data: item, error } = await sb()
    .from('itinerary_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return item
}

export async function reorderItems(dayId: string, orderedIds: string[]): Promise<void> {
  const updates = orderedIds.map((id, index) =>
    sb()
      .from('itinerary_items')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('day_id', dayId)
  )
  await Promise.all(updates)
}

export async function generateShareToken(id: string): Promise<string> {
  const token = randomBytes(18).toString('base64url')

  await sb()
    .from('itineraries')
    .update({
      share_token: token,
      status: 'shared',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  return token
}

export async function getItineraryByQuoteToken(quoteToken: string): Promise<Itinerary | null> {
  const { data, error } = await sb()
    .from('itineraries')
    .select(`
      *,
      days:itinerary_days(
        *,
        items:itinerary_items(
          *,
          fiche:fiches(*)
        )
      )
    `)
    .eq('quote_token', quoteToken)
    .order('sort_order', { referencedTable: 'itinerary_days', ascending: true })
    .order('sort_order', { referencedTable: 'itinerary_days.itinerary_items', ascending: true })
    .single()

  if (error) return null
  return data
}

export async function generateQuoteToken(id: string): Promise<string> {
  const token = randomBytes(18).toString('base64url')

  await sb()
    .from('itineraries')
    .update({
      quote_token: token,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  return token
}

// --- Delete ---

export async function deleteDay(id: string): Promise<void> {
  const { error } = await sb().from('itinerary_days').delete().eq('id', id)
  if (error) throw error
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await sb().from('itinerary_items').delete().eq('id', id)
  if (error) throw error
}
