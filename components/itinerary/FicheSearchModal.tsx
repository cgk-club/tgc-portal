'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { AirtableOrg, Fiche } from '@/types'

interface SearchResult {
  org: AirtableOrg
  fiche?: Fiche
}

interface FicheSearchModalProps {
  onClose: () => void
  onSelect: (result: { fiche_id?: string; custom_title: string; org?: AirtableOrg }) => void
}

export default function FicheSearchModal({ onClose, onSelect }: FicheSearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true)

    // Search Airtable orgs
    const atRes = await fetch(`/api/admin/fiches?airtableSearch=${encodeURIComponent(query)}`)
    const orgs: AirtableOrg[] = atRes.ok ? await atRes.json() : []

    // Also search existing fiches
    const fichesRes = await fetch(`/api/admin/fiches?search=${encodeURIComponent(query)}`)
    const fiches: (Fiche & { org?: AirtableOrg })[] = fichesRes.ok ? await fichesRes.json() : []

    // Merge: for each org, check if there's a matching fiche
    const ficheByAirtableId = new Map<string, Fiche>()
    for (const f of fiches) {
      ficheByAirtableId.set(f.airtable_record_id, f)
    }

    const merged: SearchResult[] = orgs.map(org => ({
      org,
      fiche: ficheByAirtableId.get(org.id),
    }))

    // Also include fiches not in org results
    for (const f of fiches) {
      if (!orgs.find(o => o.id === f.airtable_record_id)) {
        merged.push({
          org: f.org || { id: f.airtable_record_id, name: f.slug, category: '', country: '', region: '', city: '' },
          fiche: f,
        })
      }
    }

    setResults(merged)
    setSearching(false)
  }

  function handleSelect(result: SearchResult) {
    onSelect({
      fiche_id: result.fiche?.id,
      custom_title: result.org.name,
      org: result.org,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[8px] w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-green">Add a Fiche</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
              &times;
            </button>
          </div>
          <p className="text-sm text-gray-500 font-body mt-1">
            Search for a supplier to add to this day.
          </p>
        </div>

        <div className="p-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search suppliers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result) => (
                <button
                  key={result.org.id}
                  onClick={() => handleSelect(result)}
                  className="w-full text-left p-3 rounded-[4px] border border-gray-200 hover:border-green hover:bg-green-muted transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{result.org.name}</p>
                      <p className="text-xs text-gray-500">
                        {result.org.category}
                        {result.org.city && ` / ${result.org.city}`}
                        {result.org.country && ` / ${result.org.country}`}
                      </p>
                    </div>
                    {result.fiche && result.fiche.status === 'live' && (
                      <span className="text-xs bg-green-muted text-green px-2 py-0.5 rounded-full">
                        Live fiche
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query && !searching ? (
            <p className="text-sm text-gray-500 text-center py-4">No results found.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
