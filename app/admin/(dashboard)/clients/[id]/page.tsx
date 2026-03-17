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
  itineraries: (Itinerary & { days?: { id: string }[] })[]
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [linkSent, setLinkSent] = useState(false)

  const fetchClient = useCallback(async () => {
    const res = await fetch(`/api/admin/clients/${id}`)
    if (res.ok) setClient(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { fetchClient() }, [fetchClient])

  async function sendPortalLink() {
    setSending(true)
    const res = await fetch(`/api/admin/clients/${id}/send-link`, { method: 'POST' })
    if (res.ok) {
      setLinkSent(true)
      setTimeout(() => setLinkSent(false), 5000)
    }
    setSending(false)
  }

  if (loading) return <div className="p-8"><p className="text-gray-500 font-body">Loading...</p></div>
  if (!client) return <div className="p-8"><p className="text-gray-500 font-body">Client not found.</p></div>

  return (
    <div className="p-8">
      <button
        onClick={() => router.push('/admin/clients')}
        className="text-sm text-gray-500 hover:text-green font-body mb-6 block"
      >
        {'\u2190'} Back to Clients
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-green">
            {client.name || client.email}
          </h1>
          <p className="text-sm text-gray-500 font-body mt-1">{client.email}</p>
          <p className="text-xs text-gray-400 font-body mt-1">
            Last login: {client.last_login
              ? new Date(client.last_login).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'Never'}
          </p>
        </div>
        <Button
          onClick={sendPortalLink}
          disabled={sending}
          variant={linkSent ? 'ghost' : 'primary'}
        >
          {sending ? 'Sending...' : linkSent ? 'Link sent' : 'Send portal link'}
        </Button>
      </div>

      {/* Client's Itineraries */}
      <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">
        Itineraries
      </h2>
      {client.itineraries.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-gray-200 p-8 text-center">
          <p className="text-gray-500 font-body text-sm">
            No itineraries linked to this client yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              </tr>
            </thead>
            <tbody>
              {client.itineraries.map(it => (
                <tr
                  key={it.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/admin/itineraries/${it.id}`)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{it.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                      it.status === 'shared' ? 'bg-green-muted text-green' :
                      it.status === 'archived' ? 'bg-red-50 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {it.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{it.days?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
