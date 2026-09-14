'use client'

// The team's phone on the day. Paris time, the next thing first, one tap to call,
// and changes from anyone on the team arriving within half a minute.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ITEM_TYPE_LABELS,
  audienceLabel,
  audienceOf,
  dayLabel,
  hasPhone,
  parisNow,
  telLink,
  timeRange,
  whatsappLink,
  type EventItem,
  type ItemStatus,
  type TeamView,
} from '@/lib/event-vocab'
import { StatusChip, VisibilityTag } from '@/components/event/EventBits'

type Tab = 'today' | 'guests' | 'movements'

function minutesUntil(time: string, now: string): number {
  const [h, m] = time.slice(0, 5).split(':').map(Number)
  const [nh, nm] = now.split(':').map(Number)
  return h * 60 + m - (nh * 60 + nm)
}

export default function OnLocationEventPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [view, setView] = useState<TeamView | null>(null)
  const [missing, setMissing] = useState(false)
  const [tab, setTab] = useState<Tab>('today')
  const [dayId, setDayId] = useState<string>('')
  const [now, setNow] = useState(parisNow())
  const [open, setOpen] = useState<EventItem | null>(null)
  const [query, setQuery] = useState('')

  const load = useCallback(async () => {
    const res = await fetch(`/api/partner/on-location/${id}`, { cache: 'no-store' })
    if (res.status === 401) { router.push('/partner/login'); return }
    if (!res.ok) { setMissing(true); return }
    const data = (await res.json()) as TeamView
    setView(data)
    setDayId((current) => current || (data.days.find((d) => d.date === parisNow().date) || data.days[0])?.id || '')
  }, [id, router])

  useEffect(() => {
    load()
    const poll = setInterval(() => { if (document.visibilityState === 'visible') load() }, 30000)
    const clock = setInterval(() => setNow(parisNow()), 20000)
    const onVisible = () => { if (document.visibilityState === 'visible') { load(); setNow(parisNow()) } }
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(poll); clearInterval(clock); document.removeEventListener('visibilitychange', onVisible) }
  }, [load])

  const day = view?.days.find((d) => d.id === dayId) || view?.days[0]
  const isToday = day?.date === now.date
  const unseen = view?.changes.filter((c) => !c.seen) || []

  const next = useMemo(() => {
    if (!day || !isToday) return null
    return day.items.find((i) => i.exact_time && !['done', 'cancelled'].includes(i.status) && minutesUntil(i.exact_time, now.time) >= -10) || null
  }, [day, isToday, now.time])

  async function markSeen() {
    await fetch(`/api/partner/on-location/${id}/seen`, { method: 'POST' })
    load()
  }

  if (missing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pearl p-6 text-center font-body">
        <div>
          <p className="text-sm text-gray-600">This event is not available to your account.</p>
          <Link href="/partner/on-location" className="mt-3 inline-block text-sm text-green">Your events</Link>
        </div>
      </div>
    )
  }
  if (!view || !day) return <div className="flex min-h-screen items-center justify-center bg-pearl font-body text-sm text-gray-400">Loading...</div>

  const transfers = day.items.filter((i) => i.item_type === 'transport' && i.status !== 'cancelled')
  const guests = view.guests.filter((g) => !query || `${g.name} ${g.group_label || ''} ${g.hotel || ''}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="min-h-screen bg-pearl pb-24 font-body">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-pearl/95 px-4 pt-3 pb-2 backdrop-blur">
        <div className="flex items-baseline justify-between gap-2">
          <Link href="/partner/on-location" className="text-xs text-gray-500">{'←'} Events</Link>
          <span className="font-mono text-xs text-gray-500">Paris {now.time}</span>
        </div>
        <h1 className="mt-1 truncate font-heading text-base font-semibold text-green">{view.title}</h1>
        <div className="-mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 pb-1">
          {view.days.map((d) => (
            <button
              key={d.id}
              onClick={() => setDayId(d.id)}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${d.id === day.id ? 'border-green bg-green text-white' : 'border-gray-300 bg-white text-gray-600'}`}
            >
              {d.date === now.date ? 'Today' : d.date ? dayLabel(d.date, { weekday: 'short', month: 'short' }) : `Day ${d.day_number}`}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-3 px-3 pt-3">
        {unseen.length > 0 && (
          <div className="rounded-[10px] bg-orange-50 p-3 text-sm" role="status">
            <p className="font-medium text-orange-800">{unseen.length === 1 ? '1 change' : `${unseen.length} changes`} since you last looked</p>
            <ul className="mt-1 space-y-1 text-ink">
              {unseen.slice(0, 3).map((c) => <li key={c.id}>{c.summary}{c.actor_name ? <span className="text-gray-500"> · {c.actor_name}</span> : null}</li>)}
            </ul>
            <button onClick={markSeen} className="mt-2 text-xs font-semibold text-orange-800 underline">Got it</button>
          </div>
        )}

        {tab === 'today' && (
          <>
            {next && (
              <button onClick={() => setOpen(next)} className="block w-full rounded-[14px] bg-green p-4 text-left text-white">
                <p className="font-mono text-xs opacity-80">
                  NEXT · {timeRange(next)}
                  {(() => { const m = minutesUntil(next.exact_time!, now.time); return m > 0 ? ` · in ${m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`}` : ' · now' })()}
                </p>
                <p className="mt-1 font-heading text-lg">{next.custom_title || ITEM_TYPE_LABELS[next.item_type]}</p>
                <p className="mt-0.5 text-sm opacity-90">{[next.logistics?.pickup_place || next.location, audienceLabel(next, view.guests)].filter(Boolean).join(' · ')}</p>
                {next.logistics?.driver_phone && <span className="mt-3 inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-green">Call driver</span>}
              </button>
            )}

            <ol className="overflow-hidden rounded-[12px] border border-gray-200 bg-white">
              {day.items.map((item) => (
                <li key={item.id} className="border-b border-gray-100 last:border-0">
                  <button onClick={() => setOpen(item)} className={`grid w-full grid-cols-[56px_1fr] gap-3 px-3 py-3 text-left ${item.status === 'done' || item.status === 'cancelled' ? 'opacity-50' : ''}`}>
                    <span className="font-mono text-sm tabular-nums text-gray-500">{item.exact_time?.slice(0, 5) || '·'}</span>
                    <span className="min-w-0">
                      <span className="block text-[15px] leading-snug text-ink">{item.custom_title || ITEM_TYPE_LABELS[item.item_type]}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                        <span>{ITEM_TYPE_LABELS[item.item_type]}</span>
                        {item.location && <span>· {item.location}{!item.location_confirmed ? ' (unconfirmed)' : ''}</span>}
                        <StatusChip status={item.status} />
                        {item.visibility === 'team' && <VisibilityTag visibility="team" />}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {!day.items.length && <li className="px-4 py-8 text-center text-sm text-gray-400">Nothing planned for this day.</li>}
            </ol>
          </>
        )}

        {tab === 'guests' && (
          <>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search guests, groups, hotels" aria-label="Search guests" className="w-full rounded-[10px] border border-gray-300 bg-white px-3 py-2.5 text-sm" />
            <ul className="overflow-hidden rounded-[12px] border border-gray-200 bg-white">
              {guests.map((g) => (
                <li key={g.id} className="border-b border-gray-100 px-3 py-3 last:border-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[15px] text-ink">{g.name}</p>
                    {g.group_label && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Group {g.group_label}</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{[g.hotel, g.room ? `room ${g.room}` : null].filter(Boolean).join(', ')}</p>
                  {g.dietary && <p className="text-xs text-gray-500">Dietary: {g.dietary}</p>}
                  {(g.arrival || g.departure) && <p className="text-xs text-gray-500">{[g.arrival && `In ${g.arrival}`, g.departure && `Out ${g.departure}`].filter(Boolean).join(' · ')}</p>}
                  {view.can_see_guest_contacts && hasPhone(g.phone) && (
                    <div className="mt-2 flex gap-2">
                      <a href={telLink(g.phone)} className="rounded-full border border-green px-3 py-1 text-xs text-green">Call</a>
                      <a href={whatsappLink(g.phone, `Hello ${g.name.split(' ')[0]}, `)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-green px-3 py-1 text-xs text-green">WhatsApp</a>
                    </div>
                  )}
                </li>
              ))}
              {!guests.length && <li className="px-4 py-8 text-center text-sm text-gray-400">No guests found.</li>}
            </ul>
            {!view.can_see_guest_contacts && <p className="px-1 text-xs text-gray-400">Guest phone numbers and emails are not shared with your account for this event.</p>}
          </>
        )}

        {tab === 'movements' && (
          <ol className="space-y-3">
            {transfers.map((t) => {
              const passengers = audienceOf(t, view.guests)
              return (
                <li key={t.id} className="rounded-[12px] border border-gray-200 bg-white p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-mono text-sm tabular-nums text-ink">{timeRange(t) || '·'}</p>
                    <StatusChip status={t.status} />
                  </div>
                  <p className="mt-1 text-[15px] text-ink">{t.custom_title || 'Transfer'}</p>
                  <p className="text-sm text-gray-600">{[t.logistics?.pickup_place, t.logistics?.dropoff_place].filter(Boolean).join(' to ') || t.location}</p>
                  <p className="mt-1 text-xs text-gray-500">{[t.logistics?.vehicle, t.logistics?.driver_name].filter(Boolean).join(' · ')}</p>
                  <p className="mt-1 text-xs text-gray-500">{passengers.length} {passengers.length === 1 ? 'passenger' : 'passengers'}: {passengers.map((p) => p.name).join(', ') || 'none'}</p>
                  {t.logistics?.driver_phone && <a href={telLink(t.logistics.driver_phone)} className="mt-2 inline-block rounded-full bg-green px-3 py-1 text-xs text-white">Call driver</a>}
                </li>
              )
            })}
            {!transfers.length && <li className="rounded-[12px] border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400">No transfers on this day.</li>}
          </ol>
        )}
      </main>

      {/* Tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]" aria-label="Views">
        {([['today', isToday ? 'Today' : 'Day'], ['guests', 'Guests'], ['movements', 'Movements']] as [Tab, string][]).map(([key, text]) => (
          <button key={key} onClick={() => setTab(key)} className={`py-3.5 text-sm ${tab === key ? 'font-semibold text-green' : 'text-gray-500'}`}>{text}</button>
        ))}
      </nav>

      {open && <LineSheet item={open} eventId={id} guestsLabel={audienceLabel(open, view.guests)} onClose={() => setOpen(null)} onSaved={() => { setOpen(null); load() }} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
function LineSheet({ item, eventId, guestsLabel, onClose, onSaved }: {
  item: EventItem
  eventId: string
  guestsLabel: string
  onClose: () => void
  onSaved: () => void
}) {
  const [start, setStart] = useState(item.exact_time?.slice(0, 5) || '')
  const [end, setEnd] = useState(item.end_time?.slice(0, 5) || '')
  const [place, setPlace] = useState(item.location || '')
  const [confirmed, setConfirmed] = useState(item.location_confirmed)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const l = item.logistics

  async function send(body: Record<string, unknown>) {
    setBusy(true)
    setError('')
    const res = await fetch(`/api/partner/on-location/${eventId}/items/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setBusy(false)
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error || 'Could not save'); return }
    onSaved()
  }

  const setStatus = (status: ItemStatus) => send({ status })
  const moved = start !== (item.exact_time?.slice(0, 5) || '') || end !== (item.end_time?.slice(0, 5) || '') || place !== (item.location || '') || confirmed !== item.location_confirmed

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/40" onClick={onClose} role="dialog" aria-modal="true" aria-label="Line details">
      <div className="max-h-[88vh] w-full overflow-y-auto rounded-t-[18px] bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300" />
        <p className="font-mono text-xs text-gray-500">{timeRange(item) || 'No time'} · {ITEM_TYPE_LABELS[item.item_type]}</p>
        <h2 className="mt-1 font-heading text-lg text-ink">{item.custom_title || ITEM_TYPE_LABELS[item.item_type]}</h2>
        <p className="text-sm text-gray-600">{guestsLabel}</p>
        {item.custom_note && <p className="mt-2 text-sm text-gray-600">{item.custom_note}</p>}

        {(l?.pickup_place || l?.vehicle || l?.driver_name || l?.venue_contact || l?.internal_note || l?.covers) && (
          <div className="mt-3 space-y-1 rounded-[10px] bg-green-muted/60 p-3 text-sm text-ink">
            {l?.pickup_place && <p>From {l.pickup_place}{l.dropoff_place ? ` to ${l.dropoff_place}` : ''}</p>}
            {(l?.vehicle || l?.driver_name) && <p>{[l?.vehicle, l?.driver_name].filter(Boolean).join(', ')}</p>}
            {l?.covers ? <p>{l.covers} covers</p> : null}
            {l?.venue_contact && <p>Contact: {l.venue_contact}</p>}
            {l?.internal_note && <p className="italic">{l.internal_note}</p>}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {l?.driver_phone && <a href={telLink(l.driver_phone)} className="rounded-full bg-green px-4 py-2 text-sm text-white">Call driver</a>}
          {l?.venue_contact && hasPhone(l.venue_contact) && <a href={telLink(l.venue_contact)} className="rounded-full border border-green px-4 py-2 text-sm text-green">Call contact</a>}
        </div>

        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-gray-500">Status now <StatusChip status={item.status} className="ml-1 align-middle" /></p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button disabled={busy} onClick={() => setStatus('done')} className="rounded-[10px] bg-green py-3 text-sm text-white disabled:opacity-60">Done</button>
          <button disabled={busy} onClick={() => setStatus('confirmed')} className="rounded-[10px] border border-emerald-500 py-3 text-sm text-emerald-700 disabled:opacity-60">Confirmed</button>
          <button disabled={busy} onClick={() => setStatus('changed')} className="rounded-[10px] border border-orange-400 py-3 text-sm text-orange-700 disabled:opacity-60">Changed</button>
          <button disabled={busy} onClick={() => { if (confirm('Mark this line cancelled? Everyone on the team sees it.')) setStatus('cancelled') }} className="rounded-[10px] border border-gray-300 py-3 text-sm text-gray-600 disabled:opacity-60">Cancelled</button>
        </div>

        <details className="mt-4 rounded-[10px] border border-gray-200 p-3">
          <summary className="cursor-pointer text-sm text-ink">Move the time or place</summary>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="text-xs text-gray-600">Start<input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded-[8px] border border-gray-300 px-2 py-2 text-base" /></label>
            <label className="text-xs text-gray-600">End<input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded-[8px] border border-gray-300 px-2 py-2 text-base" /></label>
            <label className="col-span-2 text-xs text-gray-600">Place<input value={place} onChange={(e) => setPlace(e.target.value)} className="mt-1 w-full rounded-[8px] border border-gray-300 px-2 py-2 text-base" /></label>
            <label className="col-span-2 flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /> Address confirmed</label>
          </div>
          <button disabled={busy || !moved} onClick={() => send({ exact_time: start || null, end_time: end || null, location: place || null, location_confirmed: confirmed })} className="mt-3 w-full rounded-[10px] bg-ink py-3 text-sm text-white disabled:opacity-40">Save and tell the team</button>
        </details>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button onClick={onClose} className="mt-4 w-full py-2 text-sm text-gray-500">Close</button>
      </div>
    </div>
  )
}
