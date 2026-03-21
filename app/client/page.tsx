'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Itinerary } from '@/types'
import ClientNav from '@/components/client/ClientNav'

interface ClientInfo {
  id: string
  name: string
  email: string
  points_balance: number
}

export default function ClientDashboardPage() {
  const router = useRouter()
  const [client, setClient] = useState<ClientInfo | null>(null)
  const [itineraries, setItineraries] = useState<(Itinerary & { days?: { id: string }[] })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch('/api/client/session')
      if (!sessionRes.ok) {
        router.push('/client/login')
        return
      }
      const { client: c } = await sessionRes.json()
      setClient(c)

      const itinRes = await fetch('/api/client/itineraries')
      if (itinRes.ok) {
        setItineraries(await itinRes.json())
      }
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <p className="text-gray-400 font-body">Loading...</p>
      </div>
    )
  }

  const journeys = itineraries.filter(it => it.share_token)
  const quotes = itineraries.filter(it => it.quote_token)
  const firstName = client?.name?.split(' ')[0] || client?.email || ''
  const points = client?.points_balance || 0

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="home" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Welcome + CTA */}
        <div className="text-center mb-12">
          <p className="text-sm text-gray-400 font-body mb-1">Welcome back,</p>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-green mb-4">
            {firstName}
          </h1>
          <p className="text-sm text-gray-500 font-body mb-6 max-w-md mx-auto">
            Your concierge is here whenever you need us.
          </p>
          <Link
            href="/client/conversation"
            className="inline-block px-6 py-3 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body"
          >
            Start a Conversation
          </Link>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <Link href="/client/collection" className="group bg-white border border-green/10 rounded-lg p-6 hover:border-green/30 transition-colors text-center">
            <div className="text-2xl mb-2">&#9830;</div>
            <h3 className="font-heading text-sm font-semibold text-green mb-1">Our Collection</h3>
            <p className="text-xs text-gray-400 font-body">Browse our curated partners</p>
          </Link>
          <Link href="/client/events" className="group bg-white border border-green/10 rounded-lg p-6 hover:border-green/30 transition-colors text-center">
            <div className="text-2xl mb-2">&#9733;</div>
            <h3 className="font-heading text-sm font-semibold text-green mb-1">Events</h3>
            <p className="text-xs text-gray-400 font-body">Upcoming events and bespoke planning</p>
          </Link>
          <Link href="/client/points" className="group bg-white border border-green/10 rounded-lg p-6 hover:border-green/30 transition-colors text-center">
            <div className="font-heading text-lg font-semibold text-gold mb-1">{points.toLocaleString()}</div>
            <h3 className="font-heading text-sm font-semibold text-green mb-1">Gatekeeper Points</h3>
            <p className="text-xs text-gray-400 font-body">EUR {(points / 100).toFixed(2)}</p>
          </Link>
        </div>

        {/* My Journeys */}
        <div className="mb-10">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">
            My Journeys
          </h2>

          {journeys.length > 0 ? (
            <div className="space-y-3">
              {journeys.map(it => (
                <a
                  key={it.id}
                  href={`/itinerary/${it.share_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-lg border border-green/10 p-5 hover:border-green/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-semibold text-green">{it.title}</h3>
                      <p className="text-sm text-gray-500 font-body mt-1">
                        {it.days?.length || 0} days
                        {it.start_date && ` · Starting ${new Date(it.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                      </p>
                    </div>
                    <span className="text-xs text-green/60 border border-green/15 px-2 py-0.5 rounded font-body">
                      View
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
              <p className="text-sm text-gray-400 font-body">
                Your first journey is just a conversation away.
              </p>
              <Link
                href="/client/conversation"
                className="inline-block mt-3 text-sm text-green hover:underline font-body"
              >
                Tell us what you are thinking about
              </Link>
            </div>
          )}
        </div>

        {/* Quotes */}
        {quotes.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">
              Quotes
            </h2>
            <div className="space-y-3">
              {quotes.map(it => (
                <a
                  key={`quote-${it.id}`}
                  href={`/quote/${it.quote_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-lg border border-green/10 p-5 hover:border-gold/30 transition-colors"
                >
                  <h3 className="font-heading font-semibold text-green">{it.title}</h3>
                  <p className="text-sm text-gray-500 font-body mt-1">{it.client_name}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-green/10 py-8 text-center">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          THE GATEKEEPERS CLUB
        </span>
        <p className="text-sm text-gray-400 font-body mt-2">hello@thegatekeepers.club</p>
        <p className="text-xs text-gray-300 font-body mt-1">thegatekeepers.club</p>
      </footer>
    </div>
  )
}
