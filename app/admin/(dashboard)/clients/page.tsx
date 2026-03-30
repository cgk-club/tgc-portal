'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

interface ClientAccount {
  id: string
  name: string | null
  email: string
  created_at: string
  last_login: string | null
  points_balance: number
  last_magic_link_sent: string | null
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const fetchClients = useCallback(async () => {
    const res = await fetch('/api/admin/clients')
    if (res.ok) setClients(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail.trim()) return
    setCreating(true)
    setError('')

    const res = await fetch('/api/admin/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), email: newEmail.trim() }),
    })

    if (res.ok) {
      setShowNew(false)
      setNewName('')
      setNewEmail('')
      fetchClients()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create client')
    }
    setCreating(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-green">Clients</h1>
        <Button onClick={() => setShowNew(true)}>+ New Client</Button>
      </div>

      {loading ? (
        <p className="text-gray-500 font-body">Loading...</p>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-body">No client accounts yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last login</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Magic link sent</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr
                  key={c.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/admin/clients/${c.id}`)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.email}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gold">{(c.points_balance || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {c.last_login
                      ? new Date(c.last_login).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {c.last_magic_link_sent
                      ? new Date(c.last_magic_link_sent).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : <span className="text-gray-300">&mdash;</span>}
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

      {/* New Client Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold text-green">New Client</h2>
                <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. James Thompson"
                  className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="james@example.com"
                  required
                  className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => setShowNew(false)}>Cancel</Button>
                <Button type="submit" disabled={creating || !newEmail.trim()}>
                  {creating ? 'Creating...' : 'Create Client'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
