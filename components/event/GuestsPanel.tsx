'use client'

import { useState } from 'react'
import { hasPhone, whatsappLink, type EventGuest, type FullEvent } from '@/lib/event-vocab'

const MAX = 50
const input = 'w-full rounded-[4px] border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green'

type GuestForm = { name: string; group_label: string; phone: string; email: string; dietary: string; hotel: string; room: string; arrival: string; departure: string; notes: string }
const EMPTY: GuestForm = { name: '', group_label: '', phone: '', email: '', dietary: '', hotel: '', room: '', arrival: '', departure: '', notes: '' }
const FIELDS: { key: keyof GuestForm; label: string; placeholder?: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'group_label', label: 'Group', placeholder: 'e.g. A' },
  { key: 'phone', label: 'Phone (WhatsApp)', placeholder: '+33...' },
  { key: 'email', label: 'Email' },
  { key: 'dietary', label: 'Dietary' },
  { key: 'hotel', label: 'Hotel' },
  { key: 'room', label: 'Room' },
  { key: 'arrival', label: 'Arrival', placeholder: 'e.g. 27 Sep, AF1231 CDG 14:05' },
  { key: 'departure', label: 'Departure' },
  { key: 'notes', label: 'Notes' },
]

export default function GuestsPanel({ event, reload }: { event: FullEvent; reload: () => Promise<void> }) {
  const [form, setForm] = useState<GuestForm | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [csv, setCsv] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [links, setLinks] = useState<Record<string, string>>({})
  const guests = event.guests
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://portal.thegatekeepers.club'

  function say(text: string) { setMessage(text); setTimeout(() => setMessage(''), 6000) }

  async function saveGuest() {
    if (!form?.name.trim()) { setError('A guest needs a name'); return }
    setError('')
    const res = await fetch(
      editingId ? `/api/admin/itineraries/${event.id}/event/guests/${editingId}` : `/api/admin/itineraries/${event.id}/event/guests`,
      { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingId ? form : { guest: form }) }
    )
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setError(data.error || 'Could not save the guest'); return }
    if (!editingId && data.added === 0) { setError(`The list is full: ${MAX} guests per event.`); return }
    setForm(null); setEditingId(null)
    say(editingId ? 'Guest saved' : 'Guest added')
    await reload()
  }

  async function importCsv() {
    setError('')
    const res = await fetch(`/api/admin/itineraries/${event.id}/event/guests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ csv }) })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setError(data.error || 'Could not read that list'); return }
    const parts = [`${data.added} added`]
    if (data.skipped) parts.push(`${data.skipped} not added (the limit is ${MAX})`)
    if (data.unknownColumns?.length) parts.push(`columns ignored: ${data.unknownColumns.join(', ')}`)
    say(parts.join('. '))
    setCsv(''); setShowPaste(false)
    await reload()
  }

  async function remove(g: EventGuest) {
    if (!confirm(`Remove ${g.name} from this event?`)) return
    await fetch(`/api/admin/itineraries/${event.id}/event/guests/${g.id}`, { method: 'DELETE' })
    await reload()
  }

  async function link(g: EventGuest) {
    const res = await fetch(`/api/admin/itineraries/${event.id}/event/guests/${g.id}`, { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setError(data.error || 'Could not create the link'); return }
    const url = `${origin}/call-sheet/${data.token}`
    setLinks((l) => ({ ...l, [g.id]: url }))
    try { await navigator.clipboard.writeText(url); say(`Link for ${g.name} copied`) } catch { say(`Link for ${g.name} ready`) }
  }

  return (
    <div className="space-y-4 font-body">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-ink">{guests.length}</span> of {MAX} guests
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <a href={`/admin/print/call-sheets/${event.id}`} target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-light">Print call sheets</a>
          <button onClick={() => setShowPaste((s) => !s)} className="text-green hover:text-green-light">Paste a list</button>
          <button onClick={() => { setForm({ ...EMPTY }); setEditingId(null) }} disabled={guests.length >= MAX} className="rounded-[4px] bg-green px-3 py-1.5 text-white hover:bg-green-light disabled:opacity-50">+ Add guest</button>
        </div>
      </div>

      {message && <p className="rounded-[4px] bg-gold-light px-3 py-2 text-sm text-ink">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {showPaste && (
        <div className="rounded-[8px] border border-gray-200 bg-white p-4">
          <label htmlFor="guest-csv" className="block text-sm font-medium text-gray-700">Paste from a spreadsheet</label>
          <p className="mb-2 text-xs text-gray-500">Copy the rows, header included. Recognised columns: name, group, phone or WhatsApp, email, dietary, hotel, room, arrival, departure, notes.</p>
          <textarea id="guest-csv" rows={6} className={`${input} font-mono text-xs`} value={csv} onChange={(e) => setCsv(e.target.value)} placeholder={'name,group,phone,dietary\nExample Guest,A,+33 6 00 00 00 00,vegetarian'} />
          <div className="mt-2 flex gap-2">
            <button onClick={importCsv} disabled={!csv.trim()} className="rounded-[4px] bg-green px-3 py-1.5 text-sm text-white disabled:opacity-50">Add these guests</button>
            <button onClick={() => setShowPaste(false)} className="px-3 py-1.5 text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {form && (
        <div className="rounded-[8px] border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {FIELDS.map((fd) => (
              <div key={fd.key} className={fd.key === 'notes' || fd.key === 'arrival' || fd.key === 'departure' ? 'lg:col-span-2' : ''}>
                <label htmlFor={`g-${fd.key}`} className="mb-1 block text-xs font-medium text-gray-600">{fd.label}</label>
                <input id={`g-${fd.key}`} className={input} value={form[fd.key]} placeholder={fd.placeholder} onChange={(e) => setForm({ ...form, [fd.key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={saveGuest} className="rounded-[4px] bg-green px-3 py-1.5 text-sm text-white">{editingId ? 'Save guest' : 'Add guest'}</button>
            <button onClick={() => { setForm(null); setEditingId(null) }} className="px-3 py-1.5 text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-[8px] border border-gray-200 bg-white">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-pearl-dark text-left text-[11px] uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-3 py-2">Guest</th><th className="px-3 py-2">Group</th><th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Stay</th><th className="px-3 py-2">Travel</th><th className="px-3 py-2">Dietary</th>
              <th className="px-3 py-2">Call sheet</th><th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr key={g.id} className="border-t border-gray-100 align-top">
                <td className="px-3 py-2.5 text-ink">{g.name}{g.notes && <p className="text-xs text-gray-500">{g.notes}</p>}</td>
                <td className="px-3 py-2.5">{g.group_label || <span className="text-gray-300">·</span>}</td>
                <td className="px-3 py-2.5 text-xs text-gray-600">{g.phone}<br />{g.email}</td>
                <td className="px-3 py-2.5 text-xs text-gray-600">{[g.hotel, g.room ? `room ${g.room}` : null].filter(Boolean).join(', ')}</td>
                <td className="px-3 py-2.5 text-xs text-gray-600">{g.arrival && <p>In: {g.arrival}</p>}{g.departure && <p>Out: {g.departure}</p>}</td>
                <td className="px-3 py-2.5 text-xs text-gray-600">{g.dietary}</td>
                <td className="px-3 py-2.5 text-xs">
                  {event.event_settings.guest_call_sheets ? (
                    <div className="space-y-1">
                      <button onClick={() => link(g)} className="text-green hover:text-green-light">{g.call_sheet_token || links[g.id] ? 'Copy link' : 'Create link'}</button>
                      {hasPhone(g.phone) && (links[g.id] || g.call_sheet_token) && (
                        <a
                          className="block text-green hover:text-green-light"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={whatsappLink(g.phone, `Hello ${g.name.split(' ')[0]}, your plans for ${event.title} are here and stay up to date: ${links[g.id] || `${origin}/call-sheet/${g.call_sheet_token}`} The TGC team`)}
                        >
                          WhatsApp it
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">Switched off</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs">
                  <button
                    onClick={() => {
                      setEditingId(g.id)
                      setForm({ name: g.name, group_label: g.group_label || '', phone: g.phone || '', email: g.email || '', dietary: g.dietary || '', hotel: g.hotel || '', room: g.room || '', arrival: g.arrival || '', departure: g.departure || '', notes: g.notes || '' })
                    }}
                    className="mr-3 text-green hover:text-green-light"
                  >
                    Edit
                  </button>
                  <button onClick={() => remove(g)} className="text-red-400 hover:text-red-600">Remove</button>
                </td>
              </tr>
            ))}
            {!guests.length && <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-400">No guests yet. Add them one by one or paste the list.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
