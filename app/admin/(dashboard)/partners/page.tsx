'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

interface PartnerAccount {
  id: string
  org_name: string | null
  email: string
  org_ids: string[]
  org_count: number
  user_count: number
  status: string
  created_at: string
}

export default function PartnersPage() {
  const router = useRouter()
  const [partners, setPartners] = useState<PartnerAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newOrgIds, setNewOrgIds] = useState('')
  const [newPrimaryOrgId, setNewPrimaryOrgId] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchPartners = useCallback(async () => {
    const res = await fetch('/api/admin/partners')
    if (res.ok) setPartners(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchPartners() }, [fetchPartners])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail.trim()) return
    setCreating(true)
    setError('')

    const orgIds = newOrgIds.trim()
      ? newOrgIds.split(',').map((id) => id.trim()).filter(Boolean)
      : []

    const res = await fetch('/api/admin/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_name: newOrgName.trim() || null,
        name: newName.trim() || null,
        email: newEmail.trim(),
        org_ids: orgIds,
        primary_org_id: newPrimaryOrgId.trim() || null,
      }),
    })

    if (res.ok) {
      setShowNew(false)
      setNewOrgName('')
      setNewName('')
      setNewEmail('')
      setNewOrgIds('')
      setNewPrimaryOrgId('')
      fetchPartners()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create partner')
    }
    setCreating(false)
  }

  const filtered = partners.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (p.org_name || '').toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-green">Partners</h1>
        <Button onClick={() => setShowNew(true)}>+ New Partner</Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search partners..."
          className="w-full max-w-sm rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
        />
      </div>

      {loading ? (
        <p className="text-gray-500 font-body">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-body">{search ? 'No partners match your search.' : 'No partner accounts yet.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Organisation</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Orgs</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/admin/partners/${p.id}`)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.org_name || p.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.email}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-green">{p.user_count}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gold">{p.org_count}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                      p.status === 'active'
                        ? 'bg-green-muted text-green'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-green hover:text-green-light font-medium">View</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Partner Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold text-green">New Partner</h2>
                <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Name</label>
                <input
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Domaine & Demeure"
                  className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Darren Kennedy"
                  className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="owner@partner.com"
                  required
                  className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Org ID (Airtable record ID)</label>
                <input
                  value={newPrimaryOrgId}
                  onChange={(e) => setNewPrimaryOrgId(e.target.value)}
                  placeholder="e.g. recABC123"
                  className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">All Org IDs (comma-separated)</label>
                <input
                  value={newOrgIds}
                  onChange={(e) => setNewOrgIds(e.target.value)}
                  placeholder="e.g. recABC123, recDEF456"
                  className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                />
                <p className="text-xs text-gray-400 mt-1">Parent + child org records for the group.</p>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => setShowNew(false)}>Cancel</Button>
                <Button type="submit" disabled={creating || !newEmail.trim()}>
                  {creating ? 'Creating...' : 'Create Partner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
