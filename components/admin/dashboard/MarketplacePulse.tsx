'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PulseData {
  liveListings: number
  reviewListings: number
  enquiriesThisWeek: number
  ordersThisWeek: number
  totalRevenue: number
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function MarketplacePulse() {
  const [data, setData] = useState<PulseData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPulse() {
      try {
        const ts = Date.now()
        const [listingsRes, enquiriesRes, ordersRes] = await Promise.all([
          fetch(`/api/admin/marketplace/listings?_t=${ts}`, { cache: 'no-store' }),
          fetch(`/api/admin/marketplace/enquiries?_t=${ts}`, { cache: 'no-store' }),
          fetch(`/api/admin/marketplace/orders?_t=${ts}`, { cache: 'no-store' }),
        ])

        let liveListings = 0
        let reviewListings = 0
        if (listingsRes.ok) {
          const listings = await listingsRes.json()
          const listingsArray = Array.isArray(listings) ? listings : listings.listings || []
          liveListings = listingsArray.filter((l: Record<string, unknown>) => l.status === 'live').length
          reviewListings = listingsArray.filter((l: Record<string, unknown>) => l.status === 'review').length
        }

        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const weekAgoStr = weekAgo.toISOString()

        let enquiriesThisWeek = 0
        if (enquiriesRes.ok) {
          const enquiries = await enquiriesRes.json()
          const enquiriesArray = Array.isArray(enquiries) ? enquiries : []
          enquiriesThisWeek = enquiriesArray.filter(
            (e: Record<string, unknown>) => typeof e.created_at === 'string' && e.created_at >= weekAgoStr
          ).length
        }

        let ordersThisWeek = 0
        let totalRevenue = 0
        if (ordersRes.ok) {
          const orders = await ordersRes.json()
          const ordersArray = Array.isArray(orders) ? orders : []
          ordersThisWeek = ordersArray.filter(
            (o: Record<string, unknown>) => typeof o.created_at === 'string' && o.created_at >= weekAgoStr
          ).length
          totalRevenue = ordersArray.reduce(
            (sum: number, o: Record<string, unknown>) => sum + (typeof o.total_amount === 'number' ? o.total_amount : 0),
            0
          )
        }

        setData({ liveListings, reviewListings, enquiriesThisWeek, ordersThisWeek, totalRevenue })
      } catch {
        // Fail silently
      } finally {
        setLoading(false)
      }
    }

    fetchPulse()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider">
          Marketplace Pulse
        </h2>
        <Link
          href="/admin/marketplace"
          className="text-xs font-medium text-green hover:text-green-light transition-colors"
        >
          Manage
        </Link>
      </div>
      <div className="bg-white rounded-[8px] border border-gray-200 p-4">
        {loading ? (
          <p className="text-sm text-gray-400 text-center font-body">Loading...</p>
        ) : data ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-heading font-semibold text-green">{data.liveListings}</p>
              <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider">Live listings</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-gold">{data.reviewListings}</p>
              <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider">In review</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-gray-900">{data.enquiriesThisWeek}</p>
              <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider">Enquiries this week</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-gray-900">{data.ordersThisWeek}</p>
              <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider">Orders this week</p>
            </div>
            {data.totalRevenue > 0 && (
              <div className="col-span-2 pt-3 border-t border-gray-100">
                <p className="text-lg font-heading font-semibold text-green">{formatCurrency(data.totalRevenue)}</p>
                <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider">Total order revenue</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center font-body">No data available</p>
        )}
      </div>
    </div>
  )
}
