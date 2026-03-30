'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { Itinerary } from '@/types'

interface ClientDetail {
  id: string
  name: string | null
  email: string
  created_at: string
  last_login: string | null
  points_balance: number
  itineraries: (Itinerary & { days?: { id: string }[] })[]
}

interface PointsEntry {
  id: string
  description: string
  points: number
  balance_after: number
  created_at: string
}

interface UnlinkedItinerary {
  id: string
  title: string
  client_name: string
  client_account_id: string | null
  status: string
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const [pointsHistory, setPointsHistory] = useState<PointsEntry[]>([])
  const [showAddPoints, setShowAddPoints] = useState(false)
  const [pointsAmount, setPointsAmount] = useState('')
  const [pointsDesc, setPointsDesc] = useState('')
  const [addingPoints, setAddingPoints] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [unlinkedItineraries, setUnlinkedItineraries] = useState<UnlinkedItinerary[]>([])
  const [assignSearch, setAssignSearch] = useState('')
  const [assigning, setAssigning] = useState(false)

  const fetchClient = useCallback(async () => {
    const res = await fetch(`/api/admin/clients/${id}`)
    if (res.ok) setClient(await res.json())
    setLoading(false)
  }, [id])

  const fetchPoints = useCallback(async () => {
    const res = await fetch(`/api/admin/clients/${id}/points`)
    if (res.ok) {
      const data = await res.json()
      setPointsHistory(data.history || [])
    }
  }, [id])

  useEffect(() => { fetchClient(); fetchPoints() }, [fetchClient, fetchPoints])

  async function sendPortalLink() {
    setSending(true)
    const res = await fetch(`/api/admin/clients/${id}/send-link`, { method: 'POST' })
    if (res.ok) { setLinkSent(true); setTimeout(() => setLinkSent(false), 5000) }
    setSending(false)
  }

  async function handleAddPoints(e: React.FormEvent) {
    e.preventDefault()
    const pts = parseInt(pointsAmount)
    if (!pts || !pointsDesc.trim()) return
    setAddingPoints(true)

    const res = await fetch(`/api/admin/clients/${id}/points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: pts, description: pointsDesc.trim() }),
    })

    if (res.ok) {
      setPointsAmount('')
      setPointsDesc('')
      setShowAddPoints(false)
      fetchClient()
      fetchPoints()
    }
    setAddingPoints(false)
  }

  async function fetchUnlinkedItineraries() {
    const res = await fetch('/api/admin/itineraries')
    if (res.ok) {
      const all: UnlinkedItinerary[] = await res.json()
      setUnlinkedItineraries(all.filter(it => !it.client_account_id))
    }
  }

  async function assignItinerary(itineraryId: string) {
    if (!client) return
    setAssigning(true)
    const res = await fetch(`/api/admin/itineraries/${itineraryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_account_id: client.id,
        client_name: client.name || client.email,
        client_email: client.email,
      }),
    })
    if (res.ok) {
      setShowAssign(false)
      setAssignSearch('')
      fetchClient()
    }
    setAssigning(false)
  }

  if (loading) return <div className="p-8"><p className="text-gray-500 font-body">Loading...</p></div>
  if (!client) return <div className="p-8"><p className="text-gray-500 font-body">Client not found.</p></div>

  return (
    <div className="p-8">
      <button onClick={() => router.push('/admin/clients')} className="text-sm text-gray-500 hover:text-green font-body mb-6 block">
        {'\u2190'} Back to Clients
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-green">{client.name || client.email}</h1>
          <p className="text-sm text-gray-500 font-body mt-1">{client.email}</p>
          <p className="text-xs text-gray-400 font-body mt-1">
            Last login: {client.last_login ? new Date(client.last_login).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Never'}
          </p>
        </div>
        <Button onClick={sendPortalLink} disabled={sending} variant={linkSent ? 'ghost' : 'primary'}>
          {sending ? 'Sending...' : linkSent ? 'Link sent' : 'Send portal link'}
        </Button>
      </div>

      {/* Points Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Gatekeeper Points</h2>
          <button onClick={() => setShowAddPoints(!showAddPoints)} className="text-xs text-green hover:underline font-body">
            {showAddPoints ? 'Cancel' : '+ Add / Deduct'}
          </button>
        </div>

        <div className="bg-white rounded-lg border border-green/10 p-5 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-heading text-2xl font-semibold text-gold">{(client.points_balance || 0).toLocaleString()}</span>
              <span className="text-sm text-gray-400 font-body ml-2">points</span>
            </div>
            <span className="text-sm text-gray-500 font-body">EUR {((client.points_balance || 0) / 100).toFixed(2)}</span>
          </div>
        </div>

        {showAddPoints && (
          <form onSubmit={handleAddPoints} className="bg-pearl border border-green/10 rounded-lg p-4 mb-4 flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 font-body mb-1">Points (negative to deduct)</label>
              <input type="number" value={pointsAmount} onChange={(e) => setPointsAmount(e.target.value)} placeholder="e.g. 5000 or -1000" className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 font-body mb-1">Description</label>
              <input value={pointsDesc} onChange={(e) => setPointsDesc(e.target.value)} placeholder="e.g. Italian Babymoon deposit" className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <button type="submit" disabled={addingPoints || !pointsAmount || !pointsDesc.trim()} className="px-4 py-2 bg-green text-white text-sm rounded font-body hover:bg-green-light disabled:opacity-50">
              {addingPoints ? '...' : 'Add'}
            </button>
          </form>
        )}

        {pointsHistory.length > 0 && (
          <div className="bg-white rounded-lg border border-green/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green/10">
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Date</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Description</th>
                  <th className="text-right px-4 py-2 text-xs text-gray-400 font-body">Points</th>
                  <th className="text-right px-4 py-2 text-xs text-gray-400 font-body">Balance</th>
                </tr>
              </thead>
              <tbody>
                {pointsHistory.map(entry => (
                  <tr key={entry.id} className="border-b border-green/5 last:border-0">
                    <td className="px-4 py-2 text-gray-500 font-body">{new Date(entry.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                    <td className="px-4 py-2 text-gray-800 font-body">{entry.description}</td>
                    <td className={`px-4 py-2 text-right font-body font-medium ${entry.points > 0 ? 'text-green' : 'text-red-500'}`}>{entry.points > 0 ? '+' : ''}{entry.points.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-gray-500 font-body">{entry.balance_after.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Itineraries */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Itineraries</h2>
        <button
          onClick={() => {
            if (!showAssign) fetchUnlinkedItineraries()
            setShowAssign(!showAssign)
            setAssignSearch('')
          }}
          className="text-xs text-green hover:underline font-body"
        >
          {showAssign ? 'Cancel' : '+ Assign Itinerary'}
        </button>
      </div>

      {showAssign && (
        <div className="bg-pearl border border-green/10 rounded-lg p-4 mb-4">
          <input
            type="text"
            placeholder="Search itineraries..."
            value={assignSearch}
            onChange={(e) => setAssignSearch(e.target.value)}
            className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body mb-2 focus:border-green focus:outline-none"
          />
          <div className="max-h-48 overflow-y-auto">
            {unlinkedItineraries
              .filter(it => {
                if (!assignSearch) return true
                const q = assignSearch.toLowerCase()
                return it.title.toLowerCase().includes(q) || it.client_name.toLowerCase().includes(q)
              })
              .map(it => (
                <button
                  key={it.id}
                  onClick={() => assignItinerary(it.id)}
                  disabled={assigning}
                  className="w-full text-left px-3 py-2 text-sm font-body hover:bg-green-muted rounded transition-colors flex items-center justify-between disabled:opacity-50"
                >
                  <span>
                    <span className="text-gray-900 font-medium">{it.title}</span>
                    <span className="text-gray-400 ml-2">({it.client_name})</span>
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${it.status === 'shared' ? 'bg-green-muted text-green' : it.status === 'archived' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {it.status}
                  </span>
                </button>
              ))
            }
            {unlinkedItineraries.length === 0 && (
              <p className="text-sm text-gray-400 font-body px-3 py-2">No unlinked itineraries found</p>
            )}
          </div>
        </div>
      )}

      {client.itineraries.length === 0 && !showAssign ? (
        <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
          <p className="text-gray-500 font-body text-sm">No itineraries linked to this client yet.</p>
        </div>
      ) : client.itineraries.length > 0 ? (
        <div className="bg-white rounded-lg border border-green/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-green/10">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              </tr>
            </thead>
            <tbody>
              {client.itineraries.map(it => (
                <tr key={it.id} className="border-b border-green/5 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/itineraries/${it.id}`)}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{it.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${it.status === 'shared' ? 'bg-green-muted text-green' : it.status === 'archived' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{it.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{it.days?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
