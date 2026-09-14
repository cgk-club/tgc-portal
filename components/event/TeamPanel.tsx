'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FullEvent } from '@/lib/event-vocab'

interface PartnerOption { id: string; org_name: string | null; email: string; status: string; account_type?: string }

export default function TeamPanel({ event, reload }: { event: FullEvent; reload: () => Promise<void> }) {
  const [partners, setPartners] = useState<PartnerOption[]>([])
  const [search, setSearch] = useState('')
  const [chosen, setChosen] = useState('')
  const [contacts, setContacts] = useState(false)
  const [error, setError] = useState('')
  const phoneUrl = typeof window !== 'undefined' ? `${window.location.origin}/partner/on-location/${event.id}` : ''

  useEffect(() => {
    fetch('/api/admin/partners')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setPartners((Array.isArray(data) ? data : data.partners || []) as PartnerOption[]))
      .catch(() => setPartners([]))
  }, [])

  const onTeam = new Set(event.team.map((t) => t.partner_id))
  const options = useMemo(() => {
    const q = search.trim().toLowerCase()
    return partners
      .filter((p) => p.status === 'active' && !onTeam.has(p.id))
      .filter((p) => !q || `${p.org_name || ''} ${p.email}`.toLowerCase().includes(q))
      .sort((a, b) => (b.account_type === 'staff' ? 1 : 0) - (a.account_type === 'staff' ? 1 : 0) || (a.org_name || a.email).localeCompare(b.org_name || b.email))
  }, [partners, search, event.team]) // eslint-disable-line react-hooks/exhaustive-deps

  async function add() {
    if (!chosen) return
    setError('')
    const res = await fetch(`/api/admin/itineraries/${event.id}/event/team`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partner_id: chosen, can_see_guest_contacts: contacts }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setError(data.error || 'Could not add them'); return }
    setChosen(''); setContacts(false); setSearch('')
    await reload()
  }

  async function setContactAccess(teamId: string, value: boolean) {
    await fetch(`/api/admin/itineraries/${event.id}/event/team/${teamId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ can_see_guest_contacts: value }) })
    await reload()
  }

  async function remove(teamId: string, name: string) {
    if (!confirm(`Take ${name} off this event? Their phone view closes at once.`)) return
    await fetch(`/api/admin/itineraries/${event.id}/event/team/${teamId}`, { method: 'DELETE' })
    await reload()
  }

  return (
    <div className="space-y-5 font-body">
      <div className="rounded-[8px] border border-gray-200 bg-white p-4 text-sm text-gray-600">
        <p className="text-ink">The team&apos;s phone view for this event:</p>
        <p className="mt-1 break-all font-mono text-xs text-green">{phoneUrl}</p>
        <p className="mt-2 text-xs text-gray-500">Each person signs in with their partner account. Staff are partner accounts marked Staff on their partner page. Send a sign-in link from that page if they have never signed in.</p>
      </div>

      <div className="overflow-x-auto rounded-[8px] border border-gray-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-pearl-dark text-left text-[11px] uppercase tracking-wider text-gray-500">
            <tr><th className="px-3 py-2">Who</th><th className="px-3 py-2">Role</th><th className="px-3 py-2">Guest phones and emails</th><th className="px-3 py-2" /></tr>
          </thead>
          <tbody>
            {event.team.map((t) => {
              const name = t.partner?.org_name || t.partner?.email || 'Unknown account'
              return (
                <tr key={t.id} className="border-t border-gray-100">
                  <td className="px-3 py-2.5"><a href={`/admin/partners/${t.partner_id}`} className="text-ink hover:text-green">{name}</a><p className="text-xs text-gray-500">{t.partner?.email}</p></td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${t.partner?.account_type === 'staff' ? 'bg-green-muted text-green' : 'bg-gray-100 text-gray-600'}`}>
                      {t.partner?.account_type === 'staff' ? 'Staff' : 'Local partner'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input type="checkbox" checked={t.can_see_guest_contacts} onChange={(e) => setContactAccess(t.id, e.target.checked)} />
                      {t.can_see_guest_contacts ? 'Can see' : 'Hidden'}
                    </label>
                  </td>
                  <td className="px-3 py-2.5 text-right"><button onClick={() => remove(t.id, name)} className="text-xs text-red-400 hover:text-red-600">Take off event</button></td>
                </tr>
              )
            })}
            {!event.team.length && <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-400">Nobody is on this event yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="rounded-[8px] border border-gray-200 bg-white p-4">
        <p className="mb-2 text-sm font-medium text-ink">Add someone</p>
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="team-search" className="mb-1 block text-xs text-gray-600">Search partner and staff accounts</label>
            <input id="team-search" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-[4px] border border-gray-300 px-2.5 py-1.5 text-sm" placeholder="Name or email" />
          </div>
          <div className="min-w-[220px] flex-1">
            <label htmlFor="team-pick" className="mb-1 block text-xs text-gray-600">Account</label>
            <select id="team-pick" value={chosen} onChange={(e) => setChosen(e.target.value)} className="w-full rounded-[4px] border border-gray-300 px-2.5 py-1.5 text-sm">
              <option value="">Choose...</option>
              {options.map((p) => <option key={p.id} value={p.id}>{p.account_type === 'staff' ? 'Staff: ' : ''}{p.org_name || p.email}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 pb-2 text-xs text-gray-600"><input type="checkbox" checked={contacts} onChange={(e) => setContacts(e.target.checked)} /> Can see guest phones and emails</label>
          <button onClick={add} disabled={!chosen} className="rounded-[4px] bg-green px-3 py-1.5 text-sm text-white disabled:opacity-50">Add to event</button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
