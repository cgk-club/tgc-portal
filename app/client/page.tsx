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
  password_hash: string | null
}

interface Fiche {
  slug: string
  headline: string
  hero_image_url: string | null
  template_type: string
}

interface TGCEvent {
  id: string
  title: string
  category: string
  date_display: string
  location: string | null
  image_url: string | null
  featured: boolean
}

interface MarketplacePreview {
  id: string
  title: string
  slug: string
  category: string
  price: number | null
  price_display: string
  hero_image_url: string | null
  maker_brand: string | null
  featured: boolean
}

const MARKETPLACE_CATEGORY_LABELS: Record<string, string> = {
  horology: 'Horology',
  art: 'Art & Objects',
  automobiles: 'Automobiles',
  real_estate: 'Real Estate',
  artisan_products: 'Artisan Products',
  the_marina: 'The Marina',
  the_hangar: 'The Hangar',
}

function formatMarketplacePrice(price: number | null, display: string): string {
  if (display === 'price_on_request') return 'Price on request'
  if (display === 'offers_invited') return 'Offers invited'
  if (price === null || price === undefined) return 'Price on request'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export default function ClientDashboardPage() {
  const router = useRouter()
  const [client, setClient] = useState<ClientInfo | null>(null)
  const [itineraries, setItineraries] = useState<(Itinerary & { days?: { id: string }[], cover_image_url?: string, status?: string })[]>([])
  const [fiches, setFiches] = useState<Fiche[]>([])
  const [events, setEvents] = useState<TGCEvent[]>([])
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplacePreview[]>([])
  const [loading, setLoading] = useState(true)
  const [showPasswordBanner, setShowPasswordBanner] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [settingPassword, setSettingPassword] = useState(false)
  const [passwordSet, setPasswordSet] = useState(false)

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch('/api/client/session')
      if (!sessionRes.ok) {
        router.push('/client/login')
        return
      }
      const { client: c } = await sessionRes.json()
      setClient(c)
      if (!c.password_hash) setShowPasswordBanner(true)

      // Load all data in parallel
      const [itinRes, fichesRes, eventsRes, marketplaceRes] = await Promise.all([
        fetch('/api/client/itineraries'),
        fetch('/api/client/collection-preview'),
        fetch('/api/events/list'),
        fetch('/api/client/marketplace?sort=newest'),
      ])

      if (itinRes.ok) setItineraries(await itinRes.json())
      if (fichesRes.ok) setFiches(await fichesRes.json())
      if (eventsRes.ok) {
        const allEvents = await eventsRes.json()
        const now = new Date().toISOString().split('T')[0]
        setEvents(allEvents.filter((ev: { date_end?: string | null }) => !ev.date_end || ev.date_end >= now).slice(0, 4))
      }
      if (marketplaceRes.ok) {
        const allListings = await marketplaceRes.json()
        // Show featured first, then newest, max 4
        const sorted = allListings.sort((a: MarketplacePreview, b: MarketplacePreview) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return 0
        })
        setMarketplaceListings(sorted.slice(0, 4))
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

  const templateLabels: Record<string, string> = {
    hospitality: 'Hotel', dining: 'Dining', maker: 'Artisan', transport: 'Transport',
    wine_estate: 'Wine', wellness: 'Wellness', experience: 'Experience', default: '',
  }

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="home" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Welcome + CTA */}
        <div className="text-center mb-10">
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

        {/* Set Password Banner */}
        {showPasswordBanner && !passwordSet && (
          <div className="bg-gold/5 border border-gold/20 rounded-lg p-5 mb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-green font-heading mb-1">Set a password for easy access</p>
                <p className="text-xs text-gray-500 font-body mb-3">So you can log in anytime without needing a magic link.</p>
                {!settingPassword ? (
                  <button onClick={() => setSettingPassword(true)} className="text-xs text-green border border-green/20 px-3 py-1.5 rounded hover:bg-green/5 transition-colors font-body">
                    Set password
                  </button>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    if (newPassword.length < 8) return
                    const res = await fetch('/api/client/set-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: newPassword }) })
                    if (res.ok) { setPasswordSet(true); setShowPasswordBanner(false) }
                  }} className="flex gap-2 items-end">
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" minLength={8} className="px-3 py-1.5 border border-green/20 rounded text-sm font-body w-48 focus:outline-none focus:ring-1 focus:ring-green/30" />
                    <button type="submit" disabled={newPassword.length < 8} className="px-3 py-1.5 bg-green text-white text-xs rounded font-body hover:bg-green-light disabled:opacity-50">Save</button>
                  </form>
                )}
              </div>
              <button onClick={() => setShowPasswordBanner(false)} className="text-gray-400 hover:text-gray-600 text-sm">&#10005;</button>
            </div>
          </div>
        )}
        {passwordSet && (
          <div className="bg-green/5 border border-green/20 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm text-green font-body">Password set. You can now log in with your email and password anytime.</p>
          </div>
        )}

        {/* Collection Preview */}
        {fiches.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">From Our Collection</h2>
              <Link href="/client/collection" className="text-xs text-green hover:underline font-body">Browse all</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {fiches.map(fiche => (
                <Link key={fiche.slug} href={`/fiche/${fiche.slug}`} className="flex-none w-56 bg-white border border-green/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-32 bg-green-muted overflow-hidden">
                    {fiche.hero_image_url ? (
                      <img src={fiche.hero_image_url} alt={fiche.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex items-center justify-center h-full"><span className="text-green/20 text-xs font-body">Image</span></div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-green/50 uppercase tracking-wide font-body mb-0.5">{templateLabels[fiche.template_type] || ''}</p>
                    <h3 className="font-heading text-xs font-semibold text-gray-800 leading-snug line-clamp-1">
                      {fiche.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-body mt-0.5 line-clamp-1">{fiche.headline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events Preview */}
        {events.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Upcoming Events</h2>
              <Link href="/client/events" className="text-xs text-green hover:underline font-body">View all</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {events.map(ev => (
                <Link key={ev.id} href="/client/events" className="bg-white border border-green/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-24 bg-green-muted overflow-hidden relative">
                    {ev.image_url ? (
                      <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full"><span className="text-green/15 text-[10px] font-body">{ev.category}</span></div>
                    )}
                    {ev.featured && (
                      <span className="absolute top-1.5 right-1.5 bg-gold/90 text-white text-[8px] tracking-[0.5px] uppercase px-1.5 py-0.5 rounded-sm font-body">Featured</span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-heading text-[11px] font-semibold text-gray-800 leading-snug line-clamp-1">{ev.title}</h3>
                    <p className="text-[10px] text-gray-400 font-body">{ev.date_display}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Marketplace Preview */}
        {marketplaceListings.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">From the Marketplace</h2>
              <Link href="/client/marketplace" className="text-xs text-green hover:underline font-body">Browse all</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {marketplaceListings.map(listing => (
                <Link key={listing.id} href={`/client/marketplace/${listing.slug}`} className="bg-white border border-green/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-28 bg-green-muted overflow-hidden relative">
                    {listing.hero_image_url ? (
                      <img src={listing.hero_image_url} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex items-center justify-center h-full"><span className="text-green/15 text-[10px] font-body">{MARKETPLACE_CATEGORY_LABELS[listing.category] || listing.category}</span></div>
                    )}
                    {listing.featured && (
                      <span className="absolute top-1.5 right-1.5 bg-gold/90 text-white text-[8px] tracking-[0.5px] uppercase px-1.5 py-0.5 rounded-sm font-body">Featured</span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-[10px] text-green/50 font-body uppercase tracking-wide mb-0.5">{MARKETPLACE_CATEGORY_LABELS[listing.category] || listing.category}</p>
                    <h3 className="font-heading text-[11px] font-semibold text-gray-800 leading-snug line-clamp-1">{listing.title}</h3>
                    {listing.maker_brand && <p className="text-[10px] text-gray-400 font-body line-clamp-1">{listing.maker_brand}</p>}
                    <p className="text-[11px] font-body font-medium text-green mt-0.5">{formatMarketplacePrice(listing.price, listing.price_display)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <Link href="/client/conversation" className="bg-white border border-green/10 rounded-lg p-5 hover:border-green/30 transition-colors text-center">
            <h3 className="font-heading text-sm font-semibold text-green mb-1">New Request</h3>
            <p className="text-xs text-gray-400 font-body">Travel, dining, sourcing, lifestyle</p>
          </Link>
          <Link href="/client/events" className="bg-white border border-green/10 rounded-lg p-5 hover:border-green/30 transition-colors text-center">
            <h3 className="font-heading text-sm font-semibold text-green mb-1">Plan an Event</h3>
            <p className="text-xs text-gray-400 font-body">Bespoke event planning</p>
          </Link>
          <Link href="/client/points" className="bg-white border border-green/10 rounded-lg p-5 hover:border-green/30 transition-colors text-center">
            <div className="font-heading text-lg font-semibold text-gold mb-0.5">{points.toLocaleString()}</div>
            <h3 className="font-heading text-sm font-semibold text-green mb-0.5">Gatekeeper Points</h3>
            <p className="text-xs text-gray-400 font-body">EUR {(points / 100).toFixed(2)}</p>
          </Link>
        </div>

        {/* My Journeys */}
        <div className="mb-10" id="journeys">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">My Journeys</h2>
          {journeys.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {journeys.map(it => (
                <a key={it.id} href={`/itinerary/${it.share_token}`} target="_blank" rel="noopener noreferrer"
                  className="bg-white rounded-lg border border-green/10 overflow-hidden hover:shadow-md transition-shadow group">
                  {it.cover_image_url && (
                    <div className="h-32 overflow-hidden">
                      <img src={it.cover_image_url} alt={it.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-heading font-semibold text-green">{it.title}</h3>
                        <p className="text-sm text-gray-500 font-body mt-1">
                          {it.days?.length || 0} days
                          {it.start_date && ` · ${new Date(it.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-body ${
                        it.status === 'shared' ? 'bg-green/10 text-green' :
                        it.status === 'archived' ? 'bg-gray-200 text-gray-500' :
                        'bg-gold/15 text-gold'
                      }`}>
                        {it.status === 'shared' ? 'Active' : it.status === 'archived' ? 'Past' : 'Planning'}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
              <p className="text-sm text-gray-400 font-body">Your first journey is just a conversation away.</p>
              <Link href="/client/conversation" className="inline-block mt-3 text-sm text-green hover:underline font-body">Tell us what you are thinking about</Link>
            </div>
          )}
        </div>

        {/* Quotes */}
        {quotes.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">Quotes</h2>
            <div className="space-y-3">
              {quotes.map(it => (
                <a key={`quote-${it.id}`} href={`/quote/${it.quote_token}`} target="_blank" rel="noopener noreferrer"
                  className="block bg-white rounded-lg border border-green/10 p-5 hover:border-gold/30 transition-colors">
                  <h3 className="font-heading font-semibold text-green">{it.title}</h3>
                  <p className="text-sm text-gray-500 font-body mt-1">{it.client_name}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-green/10 py-8 text-center">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">THE GATEKEEPERS CLUB</span>
        <p className="text-sm text-gray-400 font-body mt-2">christian@thegatekeepers.club</p>
        <p className="text-xs text-gray-300 font-body mt-1">thegatekeepers.club</p>
      </footer>
    </div>
  )
}
