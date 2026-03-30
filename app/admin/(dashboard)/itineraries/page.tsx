'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import NewItineraryModal from '@/components/itinerary/NewItineraryModal'
import { Itinerary } from '@/types'

export default function ItinerariesListPage() {
  const router = useRouter()
  const [itineraries, setItineraries] = useState<(Itinerary & { days?: { id: string }[] })[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)

  const fetchItineraries = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)

    const res = await fetch(`/api/admin/itineraries?${params}`)
    if (res.ok) {
      setItineraries(await res.json())
    }
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => {
    fetchItineraries()
  }, [fetchItineraries])

  function statusBadge(status: string) {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-600',
      shared: 'bg-green-muted text-green',
      archived: 'bg-red-50 text-red-600',
    }
    return (
      <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${colors[status] || colors.draft}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-green">Itineraries</h1>
        <Button onClick={() => setShowNewModal(true)}>+ New Itinerary</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by client or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="shared">Shared</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500 font-body">Loading...</p>
      ) : itineraries.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-body">No itineraries yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {itineraries.map((it) => (
                <tr
                  key={it.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/admin/itineraries/${it.id}`)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{it.client_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{it.title}</td>
                  <td className="px-4 py-3">{statusBadge(it.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{it.days?.length || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-green hover:text-green-light font-medium">Edit</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {showNewModal && (
        <NewItineraryModal
          onClose={() => setShowNewModal(false)}
          onCreated={(id) => router.push(`/admin/itineraries/${id}`)}
        />
      )}
    </div>
  )
}
