// Event itineraries on the server: the run of show, guests, the on-location team
// and the change log. Built for Paris Fashion Week SS27 (ruled 14/September/2026).
//
// WHERE THINGS LIVE, AND WHY. `itinerary_items` is readable with the public key
// for a shared itinerary, so it only ever holds what a client may see: title,
// times, location, status, visibility (and the public read policy drops "team"
// lines). Everything the team needs but a client or guest must not (driver,
// phone numbers, passengers, internal notes) lives in `itinerary_item_logistics`,
// and guests, the team and the change log have their own tables. None of those
// has a public policy or a public grant; only this service-role layer reads them.
import { randomBytes } from 'crypto'
import { unstable_noStore as noStore } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sanitizeText } from '@/lib/utils'
import {
  EVENT_ITEM_TYPES,
  ITEM_STATUSES,
  VISIBILITIES,
  audienceOf,
  buildCallSheet,
  guestMessage,
  readSettings,
  sortItems,
  summariseChange,
  type EventChange,
  type EventDay,
  type EventGuest,
  type EventItem,
  type FullEvent,
  type ItemLogistics,
  type ItemStatus,
  type ItineraryKind,
  type TeamMember,
  type TeamView,
  type Visibility,
} from '@/lib/event-vocab'

export * from '@/lib/event-vocab'

function sb() {
  return getSupabaseAdmin()
}

export const newToken = () => randomBytes(18).toString('base64url')

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------
const ITEM_COLUMNS =
  'id, day_id, fiche_id, item_type, custom_title, custom_note, exact_time, end_time, location, location_confirmed, status, visibility, sort_order, changed_at'

export async function loadEvent(id: string): Promise<FullEvent | null> {
  noStore()
  const { data: itin, error } = await sb()
    .from('itineraries')
    .select(
      `id, slug, title, client_name, status, kind, event_settings, start_date, share_token,
       days:itinerary_days(id, itinerary_id, day_number, date, title, notes, sort_order,
         items:itinerary_items(${ITEM_COLUMNS}))`
    )
    .eq('id', id)
    .order('sort_order', { referencedTable: 'itinerary_days', ascending: true })
    .single()
  if (error || !itin) return null

  const rawDays = (itin.days || []) as unknown as (Omit<EventDay, 'items'> & { items: Omit<EventItem, 'logistics'>[] })[]
  const itemIds = rawDays.flatMap((d) => (d.items || []).map((i) => i.id))

  const [logRes, guestRes, teamRes, changeRes] = await Promise.all([
    itemIds.length
      ? sb().from('itinerary_item_logistics').select('*').in('item_id', itemIds)
      : Promise.resolve({ data: [] as ItemLogistics[] }),
    sb().from('itinerary_guests').select('*').eq('itinerary_id', id).order('sort_order').order('created_at'),
    sb()
      .from('itinerary_team')
      .select('id, itinerary_id, partner_id, can_see_guest_contacts, status, created_at, partner:partner_accounts(id, org_name, email, account_type)')
      .eq('itinerary_id', id)
      .eq('status', 'active')
      .order('created_at'),
    sb().from('itinerary_changes').select('*').eq('itinerary_id', id).order('created_at', { ascending: false }).limit(200),
  ])

  const logistics = new Map<string, ItemLogistics>(((logRes.data || []) as ItemLogistics[]).map((l) => [l.item_id, l]))

  return {
    id: itin.id,
    slug: itin.slug,
    title: itin.title,
    client_name: itin.client_name,
    status: itin.status,
    kind: (itin.kind || 'trip') as ItineraryKind,
    event_settings: readSettings(itin.event_settings),
    start_date: itin.start_date,
    share_token: itin.share_token,
    days: rawDays.map((d) => ({
      ...d,
      items: sortItems((d.items || []).map((i) => ({ ...i, logistics: logistics.get(i.id) || null }))),
    })),
    guests: (guestRes.data || []) as EventGuest[],
    team: (teamRes.data || []) as unknown as TeamMember[],
    changes: (changeRes.data || []) as EventChange[],
  }
}

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------
export interface ItemInput {
  item_type?: string
  custom_title?: string | null
  custom_note?: string | null
  exact_time?: string | null
  end_time?: string | null
  location?: string | null
  location_confirmed?: boolean
  status?: ItemStatus
  visibility?: Visibility
  logistics?: Partial<Omit<ItemLogistics, 'item_id'>>
}

const TEXT_ITEM_FIELDS = ['custom_title', 'custom_note', 'location'] as const
const TEXT_LOG_FIELDS = ['pickup_place', 'dropoff_place', 'vehicle', 'driver_name', 'driver_phone', 'venue_contact', 'internal_note'] as const

const cleanTime = (v: unknown): string | null => (typeof v === 'string' && /^\d{2}:\d{2}/.test(v) ? v.slice(0, 5) : null)
const cleanText = (v: unknown): string | null => {
  const t = typeof v === 'string' ? v.trim() : ''
  return t ? sanitizeText(t) : null
}

function itemPatch(input: ItemInput): Record<string, unknown> {
  const patch: Record<string, unknown> = {}
  if (input.item_type && ([...EVENT_ITEM_TYPES, 'fiche'] as string[]).includes(input.item_type)) patch.item_type = input.item_type
  for (const f of TEXT_ITEM_FIELDS) if (f in input) patch[f] = cleanText(input[f])
  if ('exact_time' in input) patch.exact_time = cleanTime(input.exact_time)
  if ('end_time' in input) patch.end_time = cleanTime(input.end_time)
  if ('location_confirmed' in input) patch.location_confirmed = input.location_confirmed === true
  if (input.status && (ITEM_STATUSES as readonly string[]).includes(input.status)) patch.status = input.status
  if (input.visibility && (VISIBILITIES as readonly string[]).includes(input.visibility)) patch.visibility = input.visibility
  return patch
}

function logisticsPatch(input: ItemInput['logistics']): Record<string, unknown> | null {
  if (!input) return null
  const patch: Record<string, unknown> = {}
  for (const f of TEXT_LOG_FIELDS) if (f in input) patch[f] = cleanText(input[f])
  if ('covers' in input) {
    const n = Number(input.covers)
    patch.covers = input.covers === null || input.covers === undefined || !Number.isFinite(n) ? null : Math.max(0, Math.round(n))
  }
  if ('owner_partner_id' in input) patch.owner_partner_id = input.owner_partner_id || null
  if ('audience_mode' in input) patch.audience_mode = input.audience_mode === 'selected' ? 'selected' : 'all'
  if ('audience_groups' in input) patch.audience_groups = Array.isArray(input.audience_groups) ? input.audience_groups.map(String).filter(Boolean) : []
  if ('audience_guest_ids' in input) patch.audience_guest_ids = Array.isArray(input.audience_guest_ids) ? input.audience_guest_ids.map(String) : []
  if (Object.keys(patch).length) patch.updated_at = new Date().toISOString()
  return Object.keys(patch).length ? patch : null
}

export async function createEventItem(dayId: string, input: ItemInput): Promise<string> {
  const { data: last } = await sb().from('itinerary_items').select('sort_order').eq('day_id', dayId).order('sort_order', { ascending: false }).limit(1)
  const sort_order = last && last.length ? last[0].sort_order + 1 : 0
  const { data, error } = await sb()
    .from('itinerary_items')
    .insert({ day_id: dayId, item_type: 'experience', sort_order, is_included: true, ...itemPatch(input) })
    .select('id')
    .single()
  if (error || !data) throw error || new Error('The line was not created')
  const lp = logisticsPatch(input.logistics)
  if (lp) {
    const { error: lerr } = await sb().from('itinerary_item_logistics').upsert({ item_id: data.id, ...lp })
    if (lerr) throw lerr
  }
  return data.id
}

export async function getItemWithLogistics(itemId: string): Promise<EventItem | null> {
  const { data } = await sb().from('itinerary_items').select(ITEM_COLUMNS).eq('id', itemId).maybeSingle()
  if (!data) return null
  const { data: l } = await sb().from('itinerary_item_logistics').select('*').eq('item_id', itemId).maybeSingle()
  return { ...(data as unknown as Omit<EventItem, 'logistics'>), logistics: (l as ItemLogistics) || null }
}

export async function updateEventItem(itemId: string, input: ItemInput): Promise<{ before: EventItem; after: EventItem }> {
  const before = await getItemWithLogistics(itemId)
  if (!before) throw new Error('Line not found')
  const patch = itemPatch(input)
  if (Object.keys(patch).length) {
    patch.changed_at = new Date().toISOString()
    const { error } = await sb().from('itinerary_items').update(patch).eq('id', itemId)
    if (error) throw error
  }
  const lp = logisticsPatch(input.logistics)
  if (lp) {
    const { error } = await sb().from('itinerary_item_logistics').upsert({ item_id: itemId, ...lp })
    if (error) throw error
  }
  const after = await getItemWithLogistics(itemId)
  return { before, after: after as EventItem }
}

export async function deleteEventItem(itemId: string): Promise<void> {
  const { error } = await sb().from('itinerary_items').delete().eq('id', itemId)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Changes: what reaches every phone, and the WhatsApp messages Christian sends
// ---------------------------------------------------------------------------
export async function recordChange(opts: {
  itineraryId: string
  before: EventItem
  after: EventItem
  date: string | null
  actorType: 'admin' | 'partner'
  actorName: string | null
  actorUserId?: string | null
  guests: EventGuest[]
}): Promise<EventChange | null> {
  const summary = summariseChange(opts.before, opts.after, opts.date)
  if (!summary) return null
  const reachesGuests = opts.after.visibility === 'guests'
  const affected = reachesGuests ? audienceOf(opts.after, opts.guests).map((g) => g.id) : []
  // A moved line reads "Changed" everywhere until someone confirms or completes it.
  const timeOrPlaceMoved =
    opts.before.exact_time !== opts.after.exact_time ||
    opts.before.end_time !== opts.after.end_time ||
    (opts.before.location || '') !== (opts.after.location || '')
  if (timeOrPlaceMoved && !['changed', 'cancelled', 'done'].includes(opts.after.status)) {
    await sb().from('itinerary_items').update({ status: 'changed', changed_at: new Date().toISOString() }).eq('id', opts.after.id)
  }
  const { data, error } = await sb()
    .from('itinerary_changes')
    .insert({
      itinerary_id: opts.itineraryId,
      item_id: opts.after.id,
      actor_type: opts.actorType,
      actor_name: opts.actorName,
      summary,
      team_message: `TGC change. ${summary}.${opts.actorName ? ` (${opts.actorName})` : ''}`,
      guest_message: reachesGuests ? guestMessage(opts.after, opts.date) : null,
      affected_guest_ids: affected,
      seen_by: opts.actorUserId ? [opts.actorUserId] : [],
      admin_seen: opts.actorType === 'admin',
    })
    .select('*')
    .single()
  if (error) throw error
  return data as EventChange
}

// ---------------------------------------------------------------------------
// Guests
// ---------------------------------------------------------------------------
export const GUEST_TEXT_FIELDS = ['name', 'email', 'phone', 'group_label', 'dietary', 'arrival', 'departure', 'hotel', 'room', 'notes'] as const
export type GuestInput = Partial<Record<(typeof GUEST_TEXT_FIELDS)[number], string | null>>

function guestPatch(input: GuestInput): Record<string, unknown> {
  const patch: Record<string, unknown> = {}
  for (const f of GUEST_TEXT_FIELDS) if (f in input) patch[f] = cleanText(input[f])
  if (typeof patch.email === 'string') patch.email = (patch.email as string).toLowerCase()
  return patch
}

export const MAX_GUESTS = 50

export async function addGuests(itineraryId: string, rows: GuestInput[]): Promise<{ added: number; skipped: number }> {
  const { count } = await sb().from('itinerary_guests').select('id', { count: 'exact', head: true }).eq('itinerary_id', itineraryId)
  const existing = count || 0
  const room = Math.max(0, MAX_GUESTS - existing)
  const valid = rows.map(guestPatch).filter((r) => typeof r.name === 'string' && r.name)
  const toAdd = valid.slice(0, room).map((r, i) => ({ itinerary_id: itineraryId, sort_order: existing + i, ...r }))
  if (toAdd.length) {
    const { error } = await sb().from('itinerary_guests').insert(toAdd)
    if (error) throw error
  }
  return { added: toAdd.length, skipped: rows.length - toAdd.length }
}

export async function updateGuest(guestId: string, input: GuestInput): Promise<void> {
  const patch = guestPatch(input)
  if (!Object.keys(patch).length) return
  if ('name' in patch && !patch.name) throw new Error('A guest needs a name')
  const { error } = await sb().from('itinerary_guests').update(patch).eq('id', guestId)
  if (error) throw error
}

export async function deleteGuest(guestId: string): Promise<void> {
  const { error } = await sb().from('itinerary_guests').delete().eq('id', guestId)
  if (error) throw error
}

export async function ensureCallSheetToken(guestId: string): Promise<string> {
  const { data } = await sb().from('itinerary_guests').select('call_sheet_token').eq('id', guestId).single()
  if (data?.call_sheet_token) return data.call_sheet_token
  const token = newToken()
  const { error } = await sb().from('itinerary_guests').update({ call_sheet_token: token }).eq('id', guestId)
  if (error) throw error
  return token
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------
// NEVER CACHED. Next.js 14 caches fetch() inside GET route handlers, and every
// Supabase query is a fetch: a "not on the team" answer cached before someone was
// added kept their phone view at 404 afterwards (found in testing, 14/September/2026).
export async function getAssignment(itineraryId: string, partnerId: string) {
  noStore()
  const { data } = await sb()
    .from('itinerary_team')
    .select('id, can_see_guest_contacts, status')
    .eq('itinerary_id', itineraryId)
    .eq('partner_id', partnerId)
    .eq('status', 'active')
    .maybeSingle()
  return data as { id: string; can_see_guest_contacts: boolean; status: string } | null
}

export async function listPartnerEvents(partnerId: string) {
  noStore()
  const { data } = await sb()
    .from('itinerary_team')
    .select('itinerary:itineraries(id, title, client_name, status, kind, start_date, days:itinerary_days(date))')
    .eq('partner_id', partnerId)
    .eq('status', 'active')
  type Row = { itinerary: { id: string; title: string; client_name: string; status: string; kind: string; start_date: string | null; days: { date: string | null }[] } | null }
  return ((data || []) as unknown as Row[])
    .map((r) => r.itinerary)
    .filter((i): i is NonNullable<Row['itinerary']> => !!i && i.kind === 'event' && i.status !== 'archived')
    .map((i) => {
      const dates = i.days.map((d) => d.date).filter((d): d is string => !!d).sort()
      return { id: i.id, title: i.title, client_name: i.client_name, first_date: dates[0] || i.start_date, last_date: dates[dates.length - 1] || i.start_date }
    })
    .sort((a, b) => (a.first_date || '').localeCompare(b.first_date || ''))
}

// What a team member's phone receives. Guest contact details only when their
// switch allows it; the team sees every line, including team-only ones.
export function forTeam(event: FullEvent, canSeeGuestContacts: boolean, userId: string): Omit<TeamView, 'user'> {
  return {
    id: event.id,
    title: event.title,
    client_name: event.client_name,
    days: event.days,
    guests: event.guests.map((g) =>
      canSeeGuestContacts ? { ...g, call_sheet_token: null } : { ...g, email: null, phone: null, call_sheet_token: null }
    ),
    changes: event.changes.slice(0, 50).map((c) => ({
      id: c.id,
      item_id: c.item_id,
      created_at: c.created_at,
      actor_name: c.actor_name,
      summary: c.summary,
      seen: c.seen_by.includes(userId),
    })),
    can_see_guest_contacts: canSeeGuestContacts,
  }
}

// ---------------------------------------------------------------------------
// The guest call sheet, by private link. Only while the event's switch is on.
// ---------------------------------------------------------------------------
export async function getCallSheet(token: string) {
  noStore()
  if (!token || token.length < 20) return null
  const { data: guest } = await sb().from('itinerary_guests').select('*').eq('call_sheet_token', token).maybeSingle()
  if (!guest) return null
  const event = await loadEvent(guest.itinerary_id)
  if (!event || event.kind !== 'event' || event.status === 'archived' || !event.event_settings.guest_call_sheets) return null
  return buildCallSheet(event, guest as EventGuest)
}
