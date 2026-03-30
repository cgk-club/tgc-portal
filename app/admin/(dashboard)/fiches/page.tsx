'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FicheStatusBadge from '@/components/admin/FicheStatusBadge'
import { Fiche, AirtableOrg } from '@/types'

interface FicheWithOrg extends Fiche {
  org?: AirtableOrg
}

function getEnrichmentScore(f: Fiche): number {
  let score = 0
  if (f.hero_image_url) score += 30
  if (f.description) score += 25
  if (f.headline) score += 15
  if (f.highlights && f.highlights.length >= 3) score += 15
  if (f.gallery_urls && f.gallery_urls.length >= 3) score += 10
  if (f.tags && f.tags.length >= 3) score += 5
  return score
}

export default function FicheListPage() {
  const [fiches, setFiches] = useState<FicheWithOrg[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'enrichment'>('recent')
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [airtableResults, setAirtableResults] = useState<AirtableOrg[]>([])
  const [airtableSearch, setAirtableSearch] = useState('')
  const [searchingAirtable, setSearchingAirtable] = useState(false)

  const fetchFiches = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)

    const res = await fetch(`/api/admin/fiches?${params}`)
    if (res.ok) {
      const data = await res.json()
      setFiches(data)
    }
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => {
    fetchFiches()
  }, [fetchFiches])

  const sortedFiches = useMemo(() => {
    if (sortBy === 'enrichment') {
      return [...fiches].sort((a, b) => getEnrichmentScore(a) - getEnrichmentScore(b))
    }
    return fiches
  }, [fiches, sortBy])

  async function searchAirtable() {
    if (!airtableSearch.trim()) return
    setSearchingAirtable(true)
    const res = await fetch(`/api/admin/fiches?airtableSearch=${encodeURIComponent(airtableSearch)}`)
    if (res.ok) {
      const data = await res.json()
      setAirtableResults(data)
    }
    setSearchingAirtable(false)
  }

  async function createFiche(org: AirtableOrg) {
    const res = await fetch('/api/admin/fiches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ airtable_record_id: org.id, name: org.name }),
    })

    if (res.ok) {
      const fiche = await res.json()
      setShowNewModal(false)
      setAirtableSearch('')
      setAirtableResults([])
      window.location.href = `/admin/fiches/${fiche.id}`
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-green">Fiches</h1>
        <Button onClick={() => setShowNewModal(true)}>New Fiche</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="live">Live</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'enrichment')}
            className="flex-1 sm:flex-none rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          >
            <option value="recent">Most recent</option>
            <option value="enrichment">Needs attention</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 font-body">Loading...</p>
      ) : fiches.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-body">No fiches found. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Enrichment</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {sortedFiches.map((fiche) => {
                const score = getEnrichmentScore(fiche)
                return (
                  <tr key={fiche.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {fiche.org?.name || fiche.slug}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {fiche.org?.categorySub || fiche.org?.category || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {[fiche.org?.city, fiche.org?.country].filter(Boolean).join(', ') || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <FicheStatusBadge status={fiche.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${score === 100 ? 'bg-green' : score >= 50 ? 'bg-gold' : 'bg-gray-300'}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8">{score}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/fiches/${fiche.id}`}
                        className="text-sm text-green hover:text-green-light font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* New Fiche Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold text-green">New Fiche</h2>
                <button
                  onClick={() => { setShowNewModal(false); setAirtableSearch(''); setAirtableResults([]) }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  &times;
                </button>
              </div>
              <p className="text-sm text-gray-500 font-body mt-1">
                Search for an organization in Airtable to create a fiche.
              </p>
            </div>

            <div className="p-6">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search Airtable organizations..."
                    value={airtableSearch}
                    onChange={(e) => setAirtableSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchAirtable()}
                  />
                </div>
                <Button onClick={searchAirtable} disabled={searchingAirtable}>
                  {searchingAirtable ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {airtableResults.length > 0 ? (
                <div className="space-y-2">
                  {airtableResults.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => createFiche(org)}
                      className="w-full text-left p-3 rounded-[4px] border border-gray-200 hover:border-green hover:bg-green-muted transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">{org.name}</p>
                      <p className="text-xs text-gray-500">
                        {org.categorySub || org.category} {org.city && `/ ${org.city}`} {org.country && `/ ${org.country}`}
                      </p>
                    </button>
                  ))}
                </div>
              ) : airtableSearch && !searchingAirtable ? (
                <p className="text-sm text-gray-500 text-center py-4">No results found.</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
