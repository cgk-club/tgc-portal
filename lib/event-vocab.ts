// Event vocabulary, types and pure helpers. Safe to import from client
// components: nothing here touches the database or Node-only modules.
// The server data layer is lib/events.ts, which re-exports all of this.

export type ItineraryKind = 'trip' | 'event' | 'programme'

export const ITEM_STATUSES = ['planned', 'requested', 'confirmed', 'paid', 'changed', 'done', 'cancelled'] as const
export type ItemStatus = (typeof ITEM_STATUSES)[number]

export const STATUS_LABELS: Record<ItemStatus, string> = {
  planned: 'Planned',
  requested: 'Requested',
  confirmed: 'Confirmed',
  paid: 'Paid',
  changed: 'Changed',
  done: 'Done',
  cancelled: 'Cancelled',
}

// team: Christian and the assigned team only. client: the team and the client.
// guests: everyone, including the guests the line is for.
export const VISIBILITIES = ['team', 'client', 'guests'] as const
export type Visibility = (typeof VISIBILITIES)[number]

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  team: 'Team only',
  client: 'Team and client',
  guests: 'Everyone, guests included',
}

// The existing item_type values keep their names in the database, so every trip
// already built stays valid; events show them under the words people use.
export const EVENT_ITEM_TYPES = ['transport', 'experience', 'dining', 'accommodation', 'note'] as const
export type EventItemType = (typeof EVENT_ITEM_TYPES)[number]

export const ITEM_TYPE_LABELS: Record<string, string> = {
  transport: 'Transfer',
  experience: 'Appointment',
  dining: 'Meal',
  accommodation: 'Stay',
  note: 'Note',
  fiche: 'Fiche',
}

export interface EventSettings {
  guest_call_sheets: boolean
  client_view: 'summary' | 'full'
}

export const DEFAULT_EVENT_SETTINGS: EventSettings = { guest_call_sheets: false, client_view: 'summary' }

export function readSettings(raw: unknown): EventSettings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<EventSettings>
  return {
    guest_call_sheets: r.guest_call_sheets === true,
    client_view: r.client_view === 'full' ? 'full' : 'summary',
  }
}

export interface EventGuest {
  id: string
  itinerary_id: string
  name: string
  email: string | null
  phone: string | null
  group_label: string | null
  dietary: string | null
  arrival: string | null
  departure: string | null
  hotel: string | null
  room: string | null
  notes: string | null
  call_sheet_token: string | null
  sort_order: number
  created_at: string
}

export interface ItemLogistics {
  item_id: string
  pickup_place: string | null
  dropoff_place: string | null
  vehicle: string | null
  driver_name: string | null
  driver_phone: string | null
  venue_contact: string | null
  covers: number | null
  internal_note: string | null
  owner_partner_id: string | null
  audience_mode: 'all' | 'selected'
  audience_groups: string[]
  audience_guest_ids: string[]
}

export interface EventItem {
  id: string
  day_id: string
  fiche_id: string | null
  item_type: string
  custom_title: string | null
  custom_note: string | null
  exact_time: string | null
  end_time: string | null
  location: string | null
  location_confirmed: boolean
  status: ItemStatus
  visibility: Visibility
  sort_order: number
  changed_at: string | null
  logistics: ItemLogistics | null
}

export interface EventDay {
  id: string
  itinerary_id: string
  day_number: number
  date: string | null
  title: string | null
  notes: string | null
  sort_order: number
  items: EventItem[]
}

export interface TeamMember {
  id: string
  itinerary_id: string
  partner_id: string
  can_see_guest_contacts: boolean
  status: 'active' | 'removed'
  created_at: string
  partner: { id: string; org_name: string | null; email: string; account_type: 'partner' | 'staff' } | null
}

export interface EventChange {
  id: string
  itinerary_id: string
  item_id: string | null
  created_at: string
  actor_type: 'admin' | 'partner'
  actor_name: string | null
  summary: string
  guest_message: string | null
  team_message: string | null
  affected_guest_ids: string[]
  seen_by: string[]
  admin_seen: boolean
}

export interface EventItinerary {
  id: string
  slug: string
  title: string
  client_name: string
  status: 'draft' | 'shared' | 'archived'
  kind: ItineraryKind
  event_settings: EventSettings
  start_date: string | null
  share_token: string | null
  days: EventDay[]
}

export interface FullEvent extends EventItinerary {
  guests: EventGuest[]
  team: TeamMember[]
  changes: EventChange[]
}

// What a team member's phone receives from /api/partner/on-location/[id].
export interface TeamView {
  id: string
  title: string
  client_name: string
  days: EventDay[]
  guests: EventGuest[]
  changes: { id: string; item_id: string | null; created_at: string; actor_name: string | null; summary: string; seen: boolean }[]
  can_see_guest_contacts: boolean
  user: { name: string; account_type: 'partner' | 'staff' }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export const hhmm = (t: string | null | undefined): string => (t ? t.slice(0, 5) : '')

export function timeRange(item: { exact_time: string | null; end_time: string | null }): string {
  return [hhmm(item.exact_time), hhmm(item.end_time)].filter(Boolean).join(' to ')
}

export function dayLabel(date: string | null, opts: { weekday?: 'long' | 'short'; month?: 'long' | 'short' } = {}): string {
  if (!date) return ''
  return new Date(date + 'T00:00:00Z').toLocaleDateString('en-GB', {
    timeZone: 'UTC',
    weekday: opts.weekday ?? 'long',
    day: 'numeric',
    month: opts.month ?? 'long',
  })
}

// Paris is where these events happen, so "now" is Paris time wherever the phone is.
export function parisNow(): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date())
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '00'
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour') === '24' ? '00' : get('hour')}:${get('minute')}` }
}

export function sortItems<T extends { exact_time: string | null; sort_order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.exact_time && b.exact_time && a.exact_time !== b.exact_time) return a.exact_time < b.exact_time ? -1 : 1
    if (a.exact_time && !b.exact_time) return -1
    if (!a.exact_time && b.exact_time) return 1
    return a.sort_order - b.sort_order
  })
}

// Who a line is for. No logistics row, or mode "all", means every guest.
export function audienceOf(item: EventItem, guests: EventGuest[]): EventGuest[] {
  const l = item.logistics
  if (!l || l.audience_mode !== 'selected') return guests
  const groups = new Set(l.audience_groups)
  const ids = new Set(l.audience_guest_ids)
  return guests.filter((g) => ids.has(g.id) || (!!g.group_label && groups.has(g.group_label)))
}

export function audienceLabel(item: EventItem, guests: EventGuest[]): string {
  const l = item.logistics
  if (!l || l.audience_mode !== 'selected') return guests.length ? `All guests (${guests.length})` : 'All guests'
  const parts = l.audience_groups.map((g) => `Group ${g}`)
  const loose = guests.filter((g) => l.audience_guest_ids.includes(g.id) && !(g.group_label && l.audience_groups.includes(g.group_label)))
  if (loose.length === 1) parts.push(loose[0].name)
  else if (loose.length > 1) parts.push(`${loose.length} guests`)
  const count = audienceOf(item, guests).length
  return parts.length ? `${parts.join(', ')} (${count})` : 'Nobody selected'
}

export function groupLabels(guests: EventGuest[]): string[] {
  return Array.from(new Set(guests.map((g) => g.group_label).filter((g): g is string => !!g))).sort()
}

function describe(item: EventItem): string {
  return item.custom_title || ITEM_TYPE_LABELS[item.item_type] || 'A line'
}

// A change worth telling people about: time, place or a status that moves the day.
// Edits to notes, drivers or internal fields are not broadcast.
export function summariseChange(before: EventItem, after: EventItem, date: string | null): string | null {
  const parts: string[] = []
  if (before.exact_time !== after.exact_time || before.end_time !== after.end_time) {
    parts.push(`time ${timeRange(before) || 'not set'} now ${timeRange(after) || 'not set'}`)
  }
  if ((before.location || '') !== (after.location || '')) parts.push(after.location ? `place now ${after.location}` : 'place removed')
  if (before.status !== after.status && ['changed', 'cancelled', 'confirmed'].includes(after.status)) {
    parts.push(`now ${STATUS_LABELS[after.status].toLowerCase()}`)
  }
  if ((before.custom_title || '') !== (after.custom_title || '') && before.custom_title) parts.push(`renamed from ${before.custom_title}`)
  if (!parts.length) return null
  const when = date ? `${dayLabel(date, { weekday: 'short', month: 'short' })}: ` : ''
  return `${when}${describe(after)}, ${parts.join('; ')}`
}

// The guest message never names a supplier or a driver, and never prints a venue
// that is not confirmed. Christian sends it himself.
export function guestMessage(item: EventItem, date: string | null): string {
  const time = timeRange(item)
  const where = item.location && item.location_confirmed ? `, ${item.location}` : ''
  const day = date ? dayLabel(date) : 'today'
  if (item.status === 'cancelled') {
    return `Hello, a change to your plans for ${day}: ${describe(item)} is cancelled. We will be in touch with what replaces it. The TGC team`
  }
  return `Hello, a change to your plans for ${day}: ${describe(item)}${time ? ` is now at ${time}` : ' has changed'}${where}. The TGC team`
}

// wa.me needs digits only, with the country code. No number: the share sheet.
export function whatsappLink(phone: string | null, text: string): string {
  const digits = (phone || '').replace(/[^\d]/g, '').replace(/^00/, '')
  return digits.length >= 8 ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function hasPhone(phone: string | null): boolean {
  return (phone || '').replace(/[^\d]/g, '').length >= 8
}

export const telLink = (phone: string | null) => `tel:${(phone || '').replace(/[^\d+]/g, '')}`

// ---------------------------------------------------------------------------
// The call sheet: one guest, the lines meant for them, venues only once confirmed
// ---------------------------------------------------------------------------
export interface CallSheetLine {
  id: string
  item_type: string
  title: string | null
  note: string | null
  exact_time: string | null
  end_time: string | null
  location: string | null
  location_pending: boolean
  pickup: string | null
}

export interface CallSheetData {
  event: { title: string; client_name: string }
  guest: { name: string; hotel: string | null; room: string | null; dietary: string | null }
  days: { id: string; date: string | null; title: string | null; lines: CallSheetLine[] }[]
}

export function buildCallSheet(event: FullEvent, guest: EventGuest, onlyDayId?: string): CallSheetData {
  const days = event.days
    .filter((d) => !onlyDayId || d.id === onlyDayId)
    .map((d) => ({
      id: d.id,
      date: d.date,
      title: d.title,
      lines: sortItems(d.items)
        .filter((i) => i.visibility === 'guests' && i.status !== 'cancelled' && audienceOf(i, event.guests).some((g) => g.id === guest.id))
        .map((i) => ({
          id: i.id,
          item_type: i.item_type,
          title: i.custom_title,
          note: i.custom_note,
          exact_time: i.exact_time,
          end_time: i.end_time,
          location: i.location_confirmed ? i.location : null,
          location_pending: !!i.location && !i.location_confirmed,
          pickup: i.item_type === 'transport' ? i.logistics?.pickup_place || null : null,
        })),
    }))
    .filter((d) => d.lines.length)
  return {
    event: { title: event.title, client_name: event.client_name },
    guest: { name: guest.name, hotel: guest.hotel, room: guest.room, dietary: guest.dietary },
    days,
  }
}
