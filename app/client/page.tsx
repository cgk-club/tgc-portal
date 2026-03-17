'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Itinerary } from '@/types'

interface ClientInfo {
  id: string
  name: string
  email: string
}

export default function ClientDashboardPage() {
  const router = useRouter()
  const [client, setClient] = useState<ClientInfo | null>(null)
  const [itineraries, setItineraries] = useState<(Itinerary & { days?: { id: string }[] })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Check session
      const sessionRes = await fetch('/api/client/session')
      if (!sessionRes.ok) {
        router.push('/client/login')
        return
      }
      const { client: c } = await sessionRes.json()
      setClient(c)

      // Load itineraries
      const itinRes = await fetch('/api/client/itineraries')
      if (itinRes.ok) {
        setItineraries(await itinRes.json())
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handleLogout() {
    await fetch('/api/client/session', { method: 'DELETE' })
    router.push('/client/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 font-body">Loading...</p>
      </div>
    )
  }

  const journeys = itineraries.filter(it => it.share_token)
  const quotes = itineraries.filter(it => it.quote_token)

  return (
    <div className="min-h-screen bg-pearl">
      <header className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 border-b border-gray-100 bg-white">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          THE GATEKEEPERS CLUB
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-gray-600 font-body"
        >
          Sign out
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <p className="text-sm text-gray-400 font-body mb-1">Welcome back,</p>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-green mb-10">
          {client?.name || client?.email}
        </h1>

        {/* Journeys */}
        {journeys.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">
              Your Journeys
            </h2>
            <div className="space-y-3">
              {journeys.map(it => (
                <a
                  key={it.id}
                  href={`/itinerary/${it.share_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-[8px] border border-gray-200 p-4 hover:border-green/30 transition-colors"
                >
                  <h3 className="font-heading font-semibold text-green">{it.title}</h3>
                  <p className="text-sm text-gray-500 font-body mt-1">
                    {it.days?.length || 0} days
                    {it.start_date && ` · Starting ${new Date(it.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Quotes */}
        {quotes.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">
              Your Quotes
            </h2>
            <div className="space-y-3">
              {quotes.map(it => (
                <a
                  key={`quote-${it.id}`}
                  href={`/quote/${it.quote_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-[8px] border border-gray-200 p-4 hover:border-gold/30 transition-colors"
                >
                  <h3 className="font-heading font-semibold text-green">{it.title}</h3>
                  <p className="text-sm text-gray-500 font-body mt-1">
                    {it.client_name}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {journeys.length === 0 && quotes.length === 0 && (
          <div className="bg-white rounded-[8px] border border-gray-200 p-12 text-center">
            <p className="text-gray-500 font-body">
              No itineraries or quotes yet. When your journey is ready, it will appear here.
            </p>
          </div>
        )}
      </div>

      <footer className="border-t border-gray-100 py-8 text-center">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          THE GATEKEEPERS CLUB
        </span>
        <p className="text-sm text-gray-400 font-body mt-2">hello@thegatekeepers.club</p>
        <p className="text-xs text-gray-300 font-body mt-1">thegatekeepers.club</p>
      </footer>
    </div>
  )
}
