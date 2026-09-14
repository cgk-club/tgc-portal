'use client'

import { useState } from 'react'
import {
  EVENT_ITEM_TYPES,
  ITEM_STATUSES,
  ITEM_TYPE_LABELS,
  STATUS_LABELS,
  VISIBILITIES,
  VISIBILITY_LABELS,
  audienceLabel,
  audienceOf,
  dayLabel,
  groupLabels,
  parisNow,
  timeRange,
  type EventItem,
  type FullEvent,
  type ItemStatus,
  type Visibility,
} from '@/lib/event-vocab'
import { StatusChip, TypeLabel, VisibilityTag } from './EventBits'

interface Props {
  event: FullEvent
  reload: () => Promise<void>
}

const input = 'w-full rounded-[4px] border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green'
const label = 'block text-xs font-medium text-gray-600 mb-1'

export default function RunOfShow({ event, reload }: Props) {
  const days = event.days
  const [dayId, setDayId] = useState<string>(() => (days.find((d) => d.date === parisNow().date) || days[0])?.id || '')
  const day = days.find((d) => d.id === dayId) || days[0]
  const [group, setGroup] = useState('')
  const [showTeamRows, setShowTeamRows] = useState(true)
  const [editing, setEditing] = useState<EventItem | 'new' | null>(null)
  const [dayForm, setDayForm] = useState<{ title: string; date: string } | null>(null)
  const [notice, setNotice] = useState('')
  const groups = groupLabels(event.guests)

  const ownerName = (partnerId: string | null | undefined) => {
    if (!partnerId) return ''
    const m = event.team.find((t) => t.partner_id === partnerId)
    return m?.partner?.org_name || m?.partner?.email || ''
  }

  function flash(text: string) {
    setNotice(text)
    setTimeout(() => setNotice(''), 6000)
  }

  async function setStatus(item: EventItem, status: ItemStatus) {
    const res = await fetch(`/api/admin/itineraries/${event.id}/event/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) flash(data.error || 'Could not change the status')
    else if (data.change) flash(`Change logged: ${data.change.summary}`)
    await reload()
  }

  async function addDay() {
    const last = [...days].reverse().find((d) => d.date)?.date
    const res = await fetch(`/api/admin/itineraries/${event.id}/days`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    if (res.ok && last) {
      const created = await res.json()
      const next = new Date(last + 'T00:00:00Z')
      next.setUTCDate(next.getUTCDate() + 1)
      await fetch(`/api/admin/itineraries/${event.id}/days/${created.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: next.toISOString().slice(0, 10) }),
      })
      setDayId(created.id)
    }
    await reload()
  }

  async function saveDay() {
    if (!day || !dayForm) return
    await fetch(`/api/admin/itineraries/${event.id}/days/${day.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: dayForm.title || null, date: dayForm.date || null }),
    })
    setDayForm(null)
    await reload()
  }

  if (!day) {
    return (
      <div className="bg-white border border-gray-200 rounded-[8px] p-6">
        <p className="text-sm text-gray-500 font-body mb-3">This event has no days yet.</p>
        <button onClick={addDay} className="text-sm text-green font-medium">+ Add a day</button>
      </div>
    )
  }

  const rows = day.items
    .filter((i) => showTeamRows || i.visibility !== 'team')
    .filter((i) => !group || audienceOf(i, event.guests).some((g) => g.group_label === group))

  return (
    <div className="space-y-4">
      {/* Day picker */}
      <div className="flex flex-wrap items-center gap-2">
        {days.map((d) => (
          <button
            key={d.id}
            onClick={() => setDayId(d.id)}
            className={`rounded-full border px-3 py-1 text-xs font-body ${d.id === day.id ? 'border-green bg-green text-white' : 'border-gray-300 text-gray-600 hover:border-green'}`}
          >
            {d.date ? dayLabel(d.date, { weekday: 'short', month: 'short' }) : `Day ${d.day_number}`}
          </button>
        ))}
        <button onClick={addDay} className="text-xs text-green hover:text-green-light font-medium px-2">+ Day</button>
      </div>

      {/* Day header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        {dayForm ? (
          <div className="flex flex-wrap items-end gap-2">
            <div><label className={label}>Date</label><input type="date" className={input} value={dayForm.date} onChange={(e) => setDayForm({ ...dayForm, date: e.target.value })} /></div>
            <div><label className={label}>Title</label><input className={input} value={dayForm.title} placeholder="e.g. Fittings and the evening show" onChange={(e) => setDayForm({ ...dayForm, title: e.target.value })} /></div>
            <button onClick={saveDay} className="rounded-[4px] bg-green px-3 py-1.5 text-sm text-white">Save</button>
            <button onClick={() => setDayForm(null)} className="text-sm text-gray-500 px-2">Cancel</button>
          </div>
        ) : (
          <div>
            <h3 className="font-heading text-lg font-semibold text-green">
              {day.date ? dayLabel(day.date) : `Day ${day.day_number}`}
              {day.title && <span className="font-body font-normal text-gray-500">, {day.title}</span>}
            </h3>
            <button onClick={() => setDayForm({ title: day.title || '', date: day.date || '' })} className="text-xs text-gray-500 hover:text-green">Edit day</button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm font-body">
          {groups.length > 0 && (
            <select value={group} onChange={(e) => setGroup(e.target.value)} className="rounded-[4px] border border-gray-300 px-2 py-1 text-sm">
              <option value="">Everyone</option>
              {groups.map((g) => <option key={g} value={g}>Group {g}</option>)}
            </select>
          )}
          <label className="flex items-center gap-1.5 text-gray-600">
            <input type="checkbox" checked={showTeamRows} onChange={(e) => setShowTeamRows(e.target.checked)} /> Team-only lines
          </label>
          <a href={`/admin/print/run-of-show/${event.id}?day=${day.id}`} target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-light">Print day</a>
          <button onClick={() => setEditing('new')} className="rounded-[4px] bg-green px-3 py-1.5 text-white hover:bg-green-light">+ Add line</button>
        </div>
      </div>

      {notice && <p className="rounded-[4px] bg-gold-light px-3 py-2 text-sm text-ink font-body">{notice}</p>}

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-[8px]">
        <table className="w-full min-w-[900px] text-sm font-body">
          <thead className="bg-pearl-dark text-left text-[11px] uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-3 py-2 w-24">Time</th>
              <th className="px-3 py-2">What</th>
              <th className="px-3 py-2">Who</th>
              <th className="px-3 py-2">Where</th>
              <th className="px-3 py-2">Logistics</th>
              <th className="px-3 py-2 w-36">Status</th>
              <th className="px-3 py-2 w-20">Seen by</th>
              <th className="px-3 py-2 w-12" />
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const l = item.logistics
              return (
                <tr key={item.id} className={`border-t border-gray-100 align-top ${item.visibility === 'team' ? 'bg-green-muted/60' : ''} ${item.status === 'cancelled' ? 'opacity-60' : ''}`}>
                  <td className="px-3 py-2.5 font-mono tabular-nums whitespace-nowrap">{timeRange(item) || '·'}</td>
                  <td className="px-3 py-2.5">
                    <TypeLabel type={item.item_type} />
                    <p className="text-gray-900">{item.custom_title || ITEM_TYPE_LABELS[item.item_type]}</p>
                    {item.custom_note && <p className="text-xs text-gray-500 mt-0.5">{item.custom_note}</p>}
                  </td>
                  <td className="px-3 py-2.5 text-gray-700">{audienceLabel(item, event.guests)}</td>
                  <td className="px-3 py-2.5 text-gray-700">
                    {item.location || <span className="text-gray-400">Not set</span>}
                    {item.location && !item.location_confirmed && <p className="text-[11px] text-amber-700">Not confirmed, hidden from guests</p>}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600 space-y-0.5">
                    {l?.pickup_place && <p>From {l.pickup_place}{l.dropoff_place ? ` to ${l.dropoff_place}` : ''}</p>}
                    {(l?.vehicle || l?.driver_name) && <p>{[l?.vehicle, l?.driver_name].filter(Boolean).join(', ')}{l?.driver_phone ? ` · ${l.driver_phone}` : ''}</p>}
                    {l?.covers ? <p>{l.covers} covers</p> : null}
                    {l?.venue_contact && <p>Venue: {l.venue_contact}</p>}
                    {l?.owner_partner_id && <p>Owner: {ownerName(l.owner_partner_id)}</p>}
                    {l?.internal_note && <p className="italic">{l.internal_note}</p>}
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      aria-label="Status"
                      value={item.status}
                      onChange={(e) => setStatus(item, e.target.value as ItemStatus)}
                      className="mb-1 w-full rounded-[4px] border border-gray-200 px-1.5 py-1 text-xs"
                    >
                      {ITEM_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                    <StatusChip status={item.status} />
                  </td>
                  <td className="px-3 py-2.5"><VisibilityTag visibility={item.visibility} /></td>
                  <td className="px-3 py-2.5 text-right">
                    <button onClick={() => setEditing(item)} className="text-xs text-green hover:text-green-light">Edit</button>
                  </td>
                </tr>
              )
            })}
            {!rows.length && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-400">No lines for this day yet. Add the first one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {event.status !== 'shared' && (
        <p className="text-xs text-gray-400 font-body">This itinerary is a draft, so edits are not logged as changes. Once it is shared, moved times and places reach every phone and the Changes tab.</p>
      )}

      {editing && (
        <ItemEditor
          event={event}
          dayId={day.id}
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async (msg) => { setEditing(null); if (msg) flash(msg); await reload() }}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
function ItemEditor({ event, dayId, item, onClose, onSaved }: {
  event: FullEvent
  dayId: string
  item: EventItem | null
  onClose: () => void
  onSaved: (message?: string) => Promise<void>
}) {
  const l = item?.logistics
  const [f, setF] = useState({
    item_type: item?.item_type && item.item_type !== 'fiche' ? item.item_type : 'experience',
    custom_title: item?.custom_title || '',
    custom_note: item?.custom_note || '',
    exact_time: item?.exact_time?.slice(0, 5) || '',
    end_time: item?.end_time?.slice(0, 5) || '',
    location: item?.location || '',
    location_confirmed: item?.location_confirmed || false,
    status: (item?.status || 'planned') as ItemStatus,
    visibility: (item?.visibility || 'client') as Visibility,
  })
  const [lg, setLg] = useState({
    pickup_place: l?.pickup_place || '',
    dropoff_place: l?.dropoff_place || '',
    vehicle: l?.vehicle || '',
    driver_name: l?.driver_name || '',
    driver_phone: l?.driver_phone || '',
    venue_contact: l?.venue_contact || '',
    covers: l?.covers != null ? String(l.covers) : '',
    internal_note: l?.internal_note || '',
    owner_partner_id: l?.owner_partner_id || '',
    audience_mode: (l?.audience_mode || 'all') as 'all' | 'selected',
    audience_groups: l?.audience_groups || [],
    audience_guest_ids: l?.audience_guest_ids || [],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const groups = groupLabels(event.guests)

  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  async function save() {
    setSaving(true)
    setError('')
    const body = {
      ...f,
      day_id: dayId,
      logistics: { ...lg, covers: lg.covers === '' ? null : Number(lg.covers), owner_partner_id: lg.owner_partner_id || null },
    }
    const res = await fetch(item ? `/api/admin/itineraries/${event.id}/event/items/${item.id}` : `/api/admin/itineraries/${event.id}/event/items`, {
      method: item ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Could not save the line'); return }
    await onSaved(data.change ? `Change logged: ${data.change.summary}` : item ? 'Line saved' : 'Line added')
  }

  async function remove() {
    if (!item || !confirm('Delete this line from the run of show?')) return
    const res = await fetch(`/api/admin/itineraries/${event.id}/event/items/${item.id}`, { method: 'DELETE' })
    if (res.ok) await onSaved('Line deleted')
    else setError('Could not delete the line')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={item ? 'Edit line' : 'Add line'}>
      <div className="my-8 w-full max-w-2xl rounded-[8px] bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="font-heading text-lg font-semibold text-green">{item ? 'Edit line' : 'Add line'}</h2>
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-gray-600" aria-label="Close">&times;</button>
        </div>

        <div className="space-y-5 px-5 py-4 font-body">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="sm:col-span-1">
              <label className={label} htmlFor="ie-type">Type</label>
              <select id="ie-type" className={input} value={f.item_type} onChange={(e) => setF({ ...f, item_type: e.target.value })}>
                {EVENT_ITEM_TYPES.map((t) => <option key={t} value={t}>{ITEM_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className={label} htmlFor="ie-title">Title</label>
              <input id="ie-title" className={input} value={f.custom_title} placeholder="e.g. Car to the fitting" onChange={(e) => setF({ ...f, custom_title: e.target.value })} />
            </div>
            <div><label className={label} htmlFor="ie-start">Start</label><input id="ie-start" type="time" className={input} value={f.exact_time} onChange={(e) => setF({ ...f, exact_time: e.target.value })} /></div>
            <div><label className={label} htmlFor="ie-end">End</label><input id="ie-end" type="time" className={input} value={f.end_time} onChange={(e) => setF({ ...f, end_time: e.target.value })} /></div>
            <div>
              <label className={label} htmlFor="ie-status">Status</label>
              <select id="ie-status" className={input} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as ItemStatus })}>
                {ITEM_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="ie-vis">Seen by</label>
              <select id="ie-vis" className={input} value={f.visibility} onChange={(e) => setF({ ...f, visibility: e.target.value as Visibility })}>
                {VISIBILITIES.map((v) => <option key={v} value={v}>{VISIBILITY_LABELS[v]}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="ie-loc">Place</label>
              <input id="ie-loc" className={input} value={f.location} placeholder="e.g. Hôtel lobby, 8e" onChange={(e) => setF({ ...f, location: e.target.value })} />
              <label className="mt-1.5 flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={f.location_confirmed} onChange={(e) => setF({ ...f, location_confirmed: e.target.checked })} />
                Address confirmed (only then does it print on a guest&apos;s call sheet)
              </label>
            </div>
            <div>
              <label className={label} htmlFor="ie-note">Note</label>
              <textarea id="ie-note" rows={2} className={input} value={f.custom_note} onChange={(e) => setF({ ...f, custom_note: e.target.value })} />
            </div>
          </div>

          {/* Who */}
          <fieldset className="rounded-[4px] border border-gray-200 p-3">
            <legend className="px-1 text-xs font-medium text-gray-600">Who this line is for</legend>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1.5"><input type="radio" name="aud" checked={lg.audience_mode === 'all'} onChange={() => setLg({ ...lg, audience_mode: 'all' })} /> All guests</label>
              <label className="flex items-center gap-1.5"><input type="radio" name="aud" checked={lg.audience_mode === 'selected'} onChange={() => setLg({ ...lg, audience_mode: 'selected' })} /> Selected groups or guests</label>
            </div>
            {lg.audience_mode === 'selected' && (
              <div className="mt-3 space-y-3">
                {groups.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {groups.map((g) => (
                      <label key={g} className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs ${lg.audience_groups.includes(g) ? 'border-green bg-green text-white' : 'border-gray-300'}`}>
                        <input type="checkbox" className="sr-only" checked={lg.audience_groups.includes(g)} onChange={() => setLg({ ...lg, audience_groups: toggle(lg.audience_groups, g) })} />
                        Group {g}
                      </label>
                    ))}
                  </div>
                )}
                <div className="grid max-h-40 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
                  {event.guests.map((g) => (
                    <label key={g.id} className="flex items-center gap-2 text-xs text-gray-700">
                      <input type="checkbox" checked={lg.audience_guest_ids.includes(g.id)} onChange={() => setLg({ ...lg, audience_guest_ids: toggle(lg.audience_guest_ids, g.id) })} />
                      {g.name}{g.group_label ? <span className="text-gray-400"> · {g.group_label}</span> : null}
                    </label>
                  ))}
                  {!event.guests.length && <p className="text-xs text-gray-400">Add guests first, in the Guests tab.</p>}
                </div>
              </div>
            )}
          </fieldset>

          {/* Team-only logistics */}
          <fieldset className="rounded-[4px] border border-green/20 bg-green-muted/40 p-3">
            <legend className="px-1 text-xs font-medium text-green">Team only: never shown to a client or guest</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {f.item_type === 'transport' && (
                <>
                  <div><label className={label} htmlFor="ie-pick">Pickup</label><input id="ie-pick" className={input} value={lg.pickup_place} onChange={(e) => setLg({ ...lg, pickup_place: e.target.value })} /></div>
                  <div><label className={label} htmlFor="ie-drop">Drop-off</label><input id="ie-drop" className={input} value={lg.dropoff_place} onChange={(e) => setLg({ ...lg, dropoff_place: e.target.value })} /></div>
                  <div><label className={label} htmlFor="ie-veh">Vehicle</label><input id="ie-veh" className={input} value={lg.vehicle} placeholder="e.g. Mercedes V-Class" onChange={(e) => setLg({ ...lg, vehicle: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={label} htmlFor="ie-dn">Driver</label><input id="ie-dn" className={input} value={lg.driver_name} onChange={(e) => setLg({ ...lg, driver_name: e.target.value })} /></div>
                    <div><label className={label} htmlFor="ie-dp">Driver phone</label><input id="ie-dp" className={input} value={lg.driver_phone} placeholder="+33..." onChange={(e) => setLg({ ...lg, driver_phone: e.target.value })} /></div>
                  </div>
                </>
              )}
              {f.item_type === 'dining' && (
                <div><label className={label} htmlFor="ie-cov">Covers</label><input id="ie-cov" type="number" min={0} className={input} value={lg.covers} onChange={(e) => setLg({ ...lg, covers: e.target.value })} /></div>
              )}
              <div><label className={label} htmlFor="ie-vc">Venue or supplier contact</label><input id="ie-vc" className={input} value={lg.venue_contact} placeholder="Name and phone" onChange={(e) => setLg({ ...lg, venue_contact: e.target.value })} /></div>
              <div>
                <label className={label} htmlFor="ie-owner">Owner on the day</label>
                <select id="ie-owner" className={input} value={lg.owner_partner_id} onChange={(e) => setLg({ ...lg, owner_partner_id: e.target.value })}>
                  <option value="">Christian</option>
                  {event.team.map((t) => <option key={t.partner_id} value={t.partner_id}>{t.partner?.org_name || t.partner?.email}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2"><label className={label} htmlFor="ie-int">Internal note</label><input id="ie-int" className={input} value={lg.internal_note} onChange={(e) => setLg({ ...lg, internal_note: e.target.value })} /></div>
            </div>
          </fieldset>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
          {item ? <button onClick={remove} className="text-sm text-red-500 hover:text-red-700">Delete line</button> : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600">Cancel</button>
            <button onClick={save} disabled={saving} className="rounded-[4px] bg-green px-4 py-1.5 text-sm text-white hover:bg-green-light disabled:opacity-60">{saving ? 'Saving...' : 'Save line'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
