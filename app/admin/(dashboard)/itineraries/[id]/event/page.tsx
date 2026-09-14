'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { FullEvent } from '@/lib/event-vocab'
import RunOfShow from '@/components/event/RunOfShow'
import GuestsPanel from '@/components/event/GuestsPanel'
import TeamPanel from '@/components/event/TeamPanel'
import ChangesPanel from '@/components/event/ChangesPanel'

type Tab = 'show' | 'guests' | 'team' | 'changes'

export default function EventWorkspacePage() {
  const { id } = useParams() as { id: string }
  const [event, setEvent] = useState<FullEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('show')
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    const res = await fetch(`/api/admin/itineraries/${id}/event`, { cache: 'no-store' })
    if (res.ok) setEvent(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { reload() }, [reload])

  async function patch(body: Record<string, unknown>) {
    setSaving(true)
    const res = await fetch(`/api/admin/itineraries/${id}/event`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) setEvent(await res.json())
    setSaving(false)
  }

  if (loading) return <div className="p-4 sm:p-6 lg:p-8"><p className="text-gray-500 font-body">Loading...</p></div>
  if (!event) return <div className="p-4 sm:p-6 lg:p-8"><p className="text-gray-500 font-body">Itinerary not found.</p></div>

  const unhandled = event.changes.filter((c) => !c.admin_seen).length
  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'show', label: 'Run of show' },
    { key: 'guests', label: `Guests (${event.guests.length})` },
    { key: 'team', label: `Team (${event.team.length})` },
    { key: 'changes', label: 'Changes', badge: unhandled },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-body">
      <Link href={`/admin/itineraries/${id}`} className="text-sm text-gray-500 hover:text-green">{'←'} Itinerary editor</Link>

      <div className="mt-3 mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-gold-muted">Event · {event.client_name}</p>
          <h1 className="font-heading text-2xl font-semibold text-green">{event.title}</h1>
          <p className="mt-1 text-xs text-gray-500">
            {event.status === 'shared' ? 'Shared: changes are logged and reach every team phone.' : event.status === 'draft' ? 'Draft: being built, changes are not logged yet.' : 'Archived.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {event.share_token && (
            <a href={`/itinerary/${event.share_token}?preview=true`} target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-light">Client view</a>
          )}
          <a href={`/partner/on-location/${event.id}`} target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-light">Team phone view</a>
        </div>
      </div>

      {event.kind !== 'event' ? (
        <div className="max-w-xl rounded-[8px] border border-gray-200 bg-white p-6">
          <p className="text-sm text-ink">This itinerary is set up as a {event.kind}.</p>
          <p className="mt-1 text-sm text-gray-500">The run of show, guest list, team phone view and call sheets are for events. Existing days and lines are kept.</p>
          <button onClick={() => patch({ kind: 'event' })} disabled={saving} className="mt-4 rounded-[4px] bg-green px-4 py-2 text-sm text-white disabled:opacity-60">Make it an event</button>
        </div>
      ) : (
        <>
          {/* Switches */}
          <div className="mb-5 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-[8px] border border-gray-200 bg-white px-4 py-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={event.event_settings.guest_call_sheets} disabled={saving} onChange={(e) => patch({ event_settings: { guest_call_sheets: e.target.checked } })} />
              <span>Guest call sheets <span className="text-gray-400">(private link per guest)</span></span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Client sees</span>
              {(['summary', 'full'] as const).map((v) => (
                <button
                  key={v}
                  disabled={saving}
                  onClick={() => patch({ event_settings: { client_view: v } })}
                  className={`rounded-full border px-3 py-1 text-xs ${event.event_settings.client_view === v ? 'border-green bg-green text-white' : 'border-gray-300 text-gray-600'}`}
                >
                  {v === 'summary' ? 'Summary of the day' : 'Full run of show'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">Team-only lines never reach the client or guests.</p>
          </div>

          <div className="mb-5 flex gap-1 overflow-x-auto border-b border-gray-200">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wider ${tab === t.key ? 'border-b-2 border-green text-green' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {t.label}
                {!!t.badge && <span className="ml-1.5 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] text-white">{t.badge}</span>}
              </button>
            ))}
          </div>

          {tab === 'show' && <RunOfShow event={event} reload={reload} />}
          {tab === 'guests' && <GuestsPanel event={event} reload={reload} />}
          {tab === 'team' && <TeamPanel event={event} reload={reload} />}
          {tab === 'changes' && <ChangesPanel event={event} reload={reload} />}
        </>
      )}
    </div>
  )
}
