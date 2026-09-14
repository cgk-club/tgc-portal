'use client'

import { useState } from 'react'
import { hasPhone, whatsappLink, type FullEvent } from '@/lib/event-vocab'

// Every change that moved the day, newest first. The team already sees it in the
// app; the WhatsApp messages here are prepared, and Christian sends them himself.
export default function ChangesPanel({ event, reload }: { event: FullEvent; reload: () => Promise<void> }) {
  const [copied, setCopied] = useState('')
  const guestsById = new Map(event.guests.map((g) => [g.id, g]))

  async function copy(key: string, text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 3000) } catch { /* ignore */ }
  }

  async function handled(id: string, value: boolean) {
    await fetch(`/api/admin/itineraries/${event.id}/event/changes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ admin_seen: value }) })
    await reload()
  }

  const paris = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  if (!event.changes.length) {
    return <p className="rounded-[8px] border border-gray-200 bg-white p-6 text-sm text-gray-500 font-body">No changes yet. Once the itinerary is shared, a moved time or place, a cancellation or a confirmation appears here, on every team phone, with a WhatsApp message ready for you to send.</p>
  }

  return (
    <ol className="space-y-3 font-body">
      {event.changes.map((c) => {
        const affected = c.affected_guest_ids.map((id) => guestsById.get(id)).filter((g): g is NonNullable<typeof g> => !!g)
        return (
          <li key={c.id} className={`rounded-[8px] border bg-white p-4 ${c.admin_seen ? 'border-gray-200' : 'border-orange-300'}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-ink">{c.summary}</p>
              <p className="text-xs text-gray-400">{paris(c.created_at)} · {c.actor_type === 'admin' ? 'Christian' : c.actor_name || 'Team'}</p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              {c.team_message && (
                <>
                  <a href={whatsappLink(null, c.team_message)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-green px-2.5 py-1 text-green hover:bg-green hover:text-white">WhatsApp the team</a>
                  <button onClick={() => copy(`${c.id}-team`, c.team_message!)} className="text-gray-500 hover:text-green">{copied === `${c.id}-team` ? 'Copied' : 'Copy team message'}</button>
                </>
              )}
            </div>

            {c.guest_message && (
              <div className="mt-3 rounded-[4px] bg-pearl p-3">
                <p className="text-xs text-gray-500">Message for {affected.length === 1 ? 'the guest' : `${affected.length} guests`}:</p>
                <p className="mt-1 text-sm text-ink">{c.guest_message}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {affected.map((g) =>
                    hasPhone(g.phone) ? (
                      <a key={g.id} href={whatsappLink(g.phone, c.guest_message!)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-gray-300 px-2.5 py-1 text-xs text-ink hover:border-green hover:text-green">
                        WhatsApp {g.name}
                      </a>
                    ) : (
                      <span key={g.id} className="rounded-full border border-dashed border-gray-300 px-2.5 py-1 text-xs text-gray-400">{g.name}: no phone</span>
                    )
                  )}
                  <button onClick={() => copy(`${c.id}-guest`, c.guest_message!)} className="text-xs text-gray-500 hover:text-green">{copied === `${c.id}-guest` ? 'Copied' : 'Copy'}</button>
                </div>
              </div>
            )}

            <label className="mt-3 flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" checked={c.admin_seen} onChange={(e) => handled(c.id, e.target.checked)} /> Handled
            </label>
          </li>
        )
      })}
    </ol>
  )
}
