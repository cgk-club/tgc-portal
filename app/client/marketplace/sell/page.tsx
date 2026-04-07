'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ClientNav from '@/components/client/ClientNav'
import ListingChat from '@/components/partner/ListingChat'

const CATEGORIES = [
  { slug: 'horology', label: 'Horology', desc: 'Watches and timepieces' },
  { slug: 'art', label: 'Art & Objects', desc: 'Fine art, decorative art, collectibles' },
  { slug: 'automobiles', label: 'Automobiles', desc: 'Classic and collectible vehicles' },
  { slug: 'real_estate', label: 'Real Estate', desc: 'Properties and estates' },
  { slug: 'artisan_products', label: 'Artisan Products', desc: 'Handmade and crafted pieces' },
  { slug: 'the_marina', label: 'The Marina', desc: 'Boats, yachts, and sailing vessels' },
  { slug: 'the_hangar', label: 'The Hangar', desc: 'Planes, helicopters, and private aviation' },
]

export default function ClientSellPage() {
  const router = useRouter()
  const [clientName, setClientName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/client/session')
      if (!res.ok) { router.push('/client/login'); return }
      const { client } = await res.json()
      setClientName(client.name || client.email || '')
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-pearl">
        <ClientNav active="marketplace" />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white border border-green/10 rounded-lg p-10">
            <h2 className="font-heading text-xl font-semibold text-green mb-3">Listing submitted</h2>
            <p className="text-sm text-gray-500 font-body mb-6">
              Your listing has been submitted for review. We will be in touch once it is live.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => { setSelectedCategory(null); setSubmitted(false) }} className="px-5 py-2 text-sm text-green border border-green/20 rounded-md hover:bg-green/5 font-body">
                List another
              </button>
              <button onClick={() => router.push('/client/marketplace')} className="px-5 py-2 text-sm text-white bg-green rounded-md hover:bg-green-light font-body">
                Back to Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="marketplace" />
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <button onClick={() => selectedCategory ? setSelectedCategory(null) : router.push('/client/marketplace')} className="text-sm text-gray-500 hover:text-green font-body mb-6 block">
          {'\u2190'} {selectedCategory ? 'Back to categories' : 'Back to Marketplace'}
        </button>

        <h1 className="font-heading text-xl font-semibold text-green mb-2">List with us</h1>
        <p className="text-sm text-gray-500 font-body mb-8">
          Our guided process ensures your listing has everything a discerning buyer needs.
        </p>

        {!selectedCategory ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className="bg-white border border-green/10 rounded-lg p-5 text-left hover:border-green/30 hover:shadow-sm transition-all"
              >
                <h3 className="font-heading text-sm font-semibold text-green mb-1">{cat.label}</h3>
                <p className="text-xs text-gray-400 font-body">{cat.desc}</p>
              </button>
            ))}
          </div>
        ) : (
          <ListingChat
            category={selectedCategory}
            categoryLabel={CATEGORIES.find(c => c.slug === selectedCategory)?.label || selectedCategory}
            partnerName={clientName}
            onComplete={() => setSubmitted(true)}
            onCancel={() => setSelectedCategory(null)}
            chatEndpoint="/api/client/chat/seller"
          />
        )}
      </div>
    </div>
  )
}
