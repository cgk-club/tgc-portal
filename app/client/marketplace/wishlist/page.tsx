'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ClientNav from '@/components/client/ClientNav'

interface WishlistItem {
  id: string
  title: string
  slug: string
  category: string
  price: number | null
  price_display: string
  hero_image_url: string | null
  maker_brand: string | null
  condition: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  horology: 'Horology',
  art: 'Art & Objects',
  automobiles: 'Automobiles',
  real_estate: 'Real Estate',
  artisan_products: 'Artisan Products',
}

function formatPrice(price: number | null, display: string): string {
  if (display === 'price_on_request') return 'Price on request'
  if (display === 'offers_invited') return 'Offers invited'
  if (price === null) return 'Price on request'
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price)
}

export default function ClientWishlistPage() {
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch('/api/client/session')
      if (!sessionRes.ok) { router.push('/client/login'); return }
      const res = await fetch('/api/client/marketplace/wishlist')
      if (res.ok) {
        const data = await res.json()
        setItems(data.listings || [])
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function removeFromWishlist(listingId: string) {
    await fetch('/api/client/marketplace/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId }),
    })
    setItems(prev => prev.filter(i => i.id !== listingId))
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
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
        <button onClick={() => router.push('/client/marketplace')} className="text-sm text-gray-500 hover:text-green font-body mb-6 block">
          {'\u2190'} Back to Marketplace
        </button>

        <h1 className="font-heading text-xl font-semibold text-green mb-6">My Wishlist</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg border border-green/10 p-12 text-center">
            <p className="text-sm text-gray-400 font-body mb-2">Your wishlist is empty.</p>
            <Link href="/client/marketplace" className="text-xs text-green hover:underline font-body">Browse the marketplace</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => (
              <div key={item.id} className="bg-white border border-green/10 rounded-lg overflow-hidden group relative">
                <Link href={`/client/marketplace/${item.slug}`}>
                  <div className="h-48 bg-green-muted overflow-hidden">
                    {item.hero_image_url ? (
                      <img src={item.hero_image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-green/15 text-xs font-body">{CATEGORY_LABELS[item.category] || item.category}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] text-green/50 font-body uppercase tracking-wide mb-0.5">{CATEGORY_LABELS[item.category] || item.category}</p>
                    <h3 className="font-heading text-sm font-semibold text-gray-800 line-clamp-1">{item.title}</h3>
                    {item.maker_brand && <p className="text-xs text-gray-400 font-body">{item.maker_brand}</p>}
                    <p className="text-sm font-body font-medium text-green mt-1">{formatPrice(item.price, item.price_display)}</p>
                  </div>
                </Link>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-white transition-colors shadow-sm"
                  title="Remove from wishlist"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
