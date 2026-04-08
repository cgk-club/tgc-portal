'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ClientNav from '@/components/client/ClientNav'
import ListingChat from '@/components/partner/ListingChat'
import ListingPhotoUpload from '@/components/marketplace/ListingPhotoUpload'

const CATEGORIES = [
  { slug: 'horology', label: 'Horology', desc: 'Watches and timepieces' },
  { slug: 'art', label: 'Art & Objects', desc: 'Fine art, decorative art, collectibles' },
  { slug: 'automobiles', label: 'Automobiles', desc: 'Classic and collectible vehicles' },
  { slug: 'real_estate', label: 'Real Estate', desc: 'Properties and estates' },
  { slug: 'artisan_products', label: 'Artisan Products', desc: 'Handmade and crafted pieces' },
  { slug: 'the_marina', label: 'The Marina', desc: 'Boats, yachts, and sailing vessels' },
  { slug: 'the_hangar', label: 'The Hangar', desc: 'Planes, helicopters, and private aviation' },
  { slug: 'wines_spirits', label: 'Wines & Spirits', desc: 'Fine wines, whisky, and rare bottles' },
]

type Step = 'categories' | 'chat' | 'submitting' | 'photos' | 'done'

export default function ClientSellPage() {
  const router = useRouter()
  const [clientName, setClientName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('categories')
  const [listingId, setListingId] = useState('')
  const [listingTitle, setListingTitle] = useState('')
  const [submitError, setSubmitError] = useState('')
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

  async function handleChatComplete(data: Record<string, unknown>, rawInput: string) {
    setStep('submitting')
    setSubmitError('')

    try {
      const res = await fetch('/api/client/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          category: selectedCategory,
          seller_raw_input: rawInput,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to submit listing')
      }

      const listing = await res.json()
      setListingId(listing.id)
      setListingTitle(listing.title || 'Your listing')
      setStep('photos')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit listing. Please try again.')
      setStep('chat')
    }
  }

  function handleReset() {
    setSelectedCategory(null)
    setStep('categories')
    setListingId('')
    setListingTitle('')
    setSubmitError('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <p className="text-gray-400 font-body">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="marketplace" />
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        {step !== 'done' && (
          <button
            onClick={() => {
              if (step === 'photos') { setStep('done'); return }
              if (step === 'chat' && selectedCategory) { setSelectedCategory(null); setStep('categories'); return }
              router.push('/client/marketplace')
            }}
            className="text-sm text-gray-500 hover:text-green font-body mb-6 block"
          >
            {'\u2190'} {step === 'chat' ? 'Back to categories' : step === 'photos' ? 'Skip photos' : 'Back to Marketplace'}
          </button>
        )}

        {step !== 'done' && step !== 'photos' && (
          <>
            <h1 className="font-heading text-xl font-semibold text-green mb-2">List with us</h1>
            <p className="text-sm text-gray-500 font-body mb-8">
              Our guided process ensures your listing has everything a discerning buyer needs.
            </p>
          </>
        )}

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-body">{submitError}</p>
          </div>
        )}

        {step === 'categories' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.slug}
                onClick={() => { setSelectedCategory(cat.slug); setStep('chat') }}
                className="bg-white border border-green/10 rounded-lg p-5 text-left hover:border-green/30 hover:shadow-sm transition-all"
              >
                <h3 className="font-heading text-sm font-semibold text-green mb-1">{cat.label}</h3>
                <p className="text-xs text-gray-400 font-body">{cat.desc}</p>
              </button>
            ))}
          </div>
        )}

        {step === 'chat' && selectedCategory && (
          <ListingChat
            category={selectedCategory}
            categoryLabel={CATEGORIES.find(c => c.slug === selectedCategory)?.label || selectedCategory}
            partnerName={clientName}
            onComplete={handleChatComplete}
            onCancel={handleReset}
            chatEndpoint="/api/client/chat/seller"
          />
        )}

        {step === 'submitting' && (
          <div className="bg-white border border-green/10 rounded-lg p-8 text-center">
            <div className="w-6 h-6 border-2 border-green/30 border-t-green rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-body">Creating your listing...</p>
          </div>
        )}

        {step === 'photos' && (
          <ListingPhotoUpload
            listingId={listingId}
            listingTitle={listingTitle}
            onComplete={() => setStep('done')}
            onSkip={() => setStep('done')}
          />
        )}

        {step === 'done' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white border border-green/10 rounded-lg p-10">
              <h2 className="font-heading text-xl font-semibold text-green mb-3">Listing submitted</h2>
              <p className="text-sm text-gray-500 font-body mb-6">
                Your listing has been submitted for review. We will be in touch once it is live.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={handleReset} className="px-5 py-2 text-sm text-green border border-green/20 rounded-md hover:bg-green/5 font-body">
                  List another
                </button>
                <button onClick={() => router.push('/client/marketplace')} className="px-5 py-2 text-sm text-white bg-green rounded-md hover:bg-green-light font-body">
                  Back to Marketplace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
