'use client'

import { useState, useEffect, useCallback } from 'react'
import ListingPhotoUpload from '@/components/marketplace/ListingPhotoUpload'

// ── Types ──────────────────────────────────────────────────────

type TabKey = 'listings' | 'enquiries' | 'requests' | 'collections' | 'orders'

interface Listing {
  id: string
  title: string
  slug: string | null
  category: string | null
  price: number | null
  price_display: string | null
  status: string
  featured: boolean
  editorial_hook: string | null
  editorial_description: string | null
  seller_raw_input: string | null
  hero_image_url: string | null
  gallery_image_urls: unknown[] | null
  maker_brand: string | null
  year: string | null
  condition: string | null
  location: string | null
  commission_rate: number | null
  category_fields: Record<string, unknown> | null
  seller_id: string | null
  seller_type: string | null
  seller_display_name: string | null
  partner_account_id: string | null
  created_at: string
  updated_at: string | null
}

interface Enquiry {
  id: string
  listing_id: string
  listing_title: string | null
  user_id: string | null
  name: string
  email: string
  phone: string | null
  message: string
  status: string
  created_at: string
}

interface MktRequest {
  id: string
  user_id: string | null
  category: string | null
  description: string | null
  raw_chat_input: string | null
  budget_min: number | null
  budget_max: number | null
  timeline: string | null
  flexibility: string | null
  name: string | null
  email: string | null
  phone: string | null
  communication_pref: string | null
  status: string
  is_public: boolean
  matched_listing_id: string | null
  created_at: string
}

interface Collection {
  id: string
  name: string
  slug: string | null
  editorial_intro: string | null
  hero_image_url: string | null
  published: boolean
  season: string | null
  newsletter_link: string | null
  listing_count: number
  created_at: string
}

interface CollectionListing {
  id: string
  title: string
  category: string | null
  price_display: string | null
  status: string
  hero_image_url: string | null
  sort_order: number
}

interface Order {
  id: string
  listing_id: string
  listing_title: string | null
  client_id: string | null
  client_name: string | null
  partner_id: string | null
  quantity: number | null
  total_amount: number | null
  currency: string | null
  payment_status: string | null
  fulfilment_status: string | null
  tracking_number: string | null
  points_redeemed: number | null
  points_earned: number | null
  commission_amount: number | null
  gift_to: string | null
  gift_message: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
}

// ── Constants ──────────────────────────────────────────────────

const CATEGORIES = [
  'horology', 'art', 'automobiles', 'real_estate',
  'artisan_products', 'the_marina', 'the_hangar', 'wines_spirits',
]

const CATEGORY_LABELS: Record<string, string> = {
  horology: 'Horology',
  art: 'Art',
  automobiles: 'Automobiles',
  real_estate: 'Real Estate',
  artisan_products: 'Artisan Products',
  the_marina: 'The Marina',
  the_hangar: 'The Hangar',
  wines_spirits: 'Wines & Spirits',
}

const LISTING_STATUSES = ['draft', 'review', 'live', 'sold', 'reserved', 'withdrawn', 'archived', 'rejected']

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  review: 'bg-gold/20 text-gold',
  live: 'bg-green-muted text-green',
  sold: 'bg-blue-50 text-blue-600',
  reserved: 'bg-purple-50 text-purple-600',
  withdrawn: 'bg-gray-100 text-gray-400',
  archived: 'bg-gray-100 text-gray-400',
  rejected: 'bg-red-50 text-red-600',
  new: 'bg-gold/20 text-gold',
  responded: 'bg-blue-50 text-blue-600',
  negotiating: 'bg-purple-50 text-purple-600',
  declined: 'bg-red-50 text-red-600',
  converted: 'bg-green-muted text-green',
  active: 'bg-green-muted text-green',
  matched: 'bg-blue-50 text-blue-600',
  fulfilled: 'bg-green-muted text-green',
  expired: 'bg-gray-100 text-gray-400',
  pending: 'bg-gold/20 text-gold',
  paid: 'bg-green-muted text-green',
  partial: 'bg-gold/20 text-gold',
  refunded: 'bg-red-50 text-red-600',
  processing: 'bg-blue-50 text-blue-600',
  shipped: 'bg-purple-50 text-purple-600',
  delivered: 'bg-green-muted text-green',
  cancelled: 'bg-red-50 text-red-600',
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'listings', label: 'Listings' },
  { key: 'enquiries', label: 'Enquiries' },
  { key: 'requests', label: 'Requests' },
  { key: 'collections', label: 'Collections' },
  { key: 'orders', label: 'Orders' },
]

const EMPTY_LISTING: Omit<Listing, 'id' | 'created_at' | 'updated_at'> = {
  title: '',
  slug: null,
  category: null,
  price: null,
  price_display: null,
  status: 'draft',
  featured: false,
  editorial_hook: null,
  editorial_description: null,
  seller_raw_input: null,
  hero_image_url: null,
  gallery_image_urls: null,
  maker_brand: null,
  year: null,
  condition: null,
  location: null,
  commission_rate: null,
  category_fields: null,
  seller_id: null,
  seller_type: null,
  seller_display_name: null,
  partner_account_id: null,
}

const EMPTY_COLLECTION = {
  name: '',
  slug: '',
  editorial_intro: '',
  hero_image_url: '',
  season: '',
  published: false,
  newsletter_link: '',
}

// ── Helpers ────────────────────────────────────────────────────

function statusBadge(status: string) {
  const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${color}`}>
      {status}
    </span>
  )
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtCurrency(amount: number | null, currency?: string | null) {
  if (amount == null) return '-'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'EUR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// ── Component ──────────────────────────────────────────────────

export default function AdminMarketplacePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('listings')

  // Listings state
  const [listings, setListings] = useState<Listing[]>([])
  const [listingFilter, setListingFilter] = useState({ status: 'all', category: 'all', search: '' })
  const [editingListing, setEditingListing] = useState<Listing | null>(null)
  const [creatingListing, setCreatingListing] = useState(false)
  const [listingForm, setListingForm] = useState(EMPTY_LISTING)

  // Enquiries state
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [enquiryFilter, setEnquiryFilter] = useState('all')
  const [expandedEnquiry, setExpandedEnquiry] = useState<string | null>(null)

  // Requests state
  const [requests, setRequests] = useState<MktRequest[]>([])
  const [requestFilterStatus, setRequestFilterStatus] = useState('all')
  const [requestFilterCategory, setRequestFilterCategory] = useState('all')

  // Collections state
  const [collections, setCollections] = useState<Collection[]>([])
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [creatingCollection, setCreatingCollection] = useState(false)
  const [collectionForm, setCollectionForm] = useState(EMPTY_COLLECTION)
  const [managingCollectionId, setManagingCollectionId] = useState<string | null>(null)
  const [collectionListings, setCollectionListings] = useState<CollectionListing[]>([])
  const [addListingId, setAddListingId] = useState('')

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [orderFilterPayment, setOrderFilterPayment] = useState('all')
  const [orderFilterFulfilment, setOrderFilterFulfilment] = useState('all')
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [orderForm, setOrderForm] = useState({ payment_status: '', fulfilment_status: '', tracking_number: '', notes: '' })

  const [loading, setLoading] = useState(true)

  // ── Data Fetching ──────────────────────────────────────────

  const fetchListings = useCallback(async () => {
    const params = new URLSearchParams()
    if (listingFilter.status !== 'all') params.set('status', listingFilter.status)
    if (listingFilter.category !== 'all') params.set('category', listingFilter.category)
    if (listingFilter.search) params.set('search', listingFilter.search)
    const res = await fetch(`/api/admin/marketplace/listings?${params}`, { cache: 'no-store' })
    if (res.ok) setListings(await res.json())
  }, [listingFilter])

  const fetchEnquiries = useCallback(async () => {
    const res = await fetch('/api/admin/marketplace/enquiries', { cache: 'no-store' })
    if (res.ok) setEnquiries(await res.json())
  }, [])

  const fetchRequests = useCallback(async () => {
    const res = await fetch('/api/admin/marketplace/requests', { cache: 'no-store' })
    if (res.ok) setRequests(await res.json())
  }, [])

  const fetchCollections = useCallback(async () => {
    const res = await fetch('/api/admin/marketplace/collections', { cache: 'no-store' })
    if (res.ok) setCollections(await res.json())
  }, [])

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/admin/marketplace/orders', { cache: 'no-store' })
    if (res.ok) setOrders(await res.json())
  }, [])

  useEffect(() => {
    Promise.all([fetchListings(), fetchEnquiries(), fetchRequests(), fetchCollections(), fetchOrders()])
      .finally(() => setLoading(false))
  }, [fetchListings, fetchEnquiries, fetchRequests, fetchCollections, fetchOrders])

  // Refetch listings when filters change
  useEffect(() => {
    if (!loading) fetchListings()
  }, [listingFilter, fetchListings, loading])

  // ── Listing Actions ────────────────────────────────────────

  function startCreateListing() {
    setEditingListing(null)
    setListingForm({ ...EMPTY_LISTING })
    setCreatingListing(true)
  }

  function startEditListing(l: Listing) {
    setCreatingListing(false)
    setEditingListing(l)
    setListingForm({
      title: l.title,
      slug: l.slug,
      category: l.category,
      price: l.price,
      price_display: l.price_display,
      status: l.status,
      featured: l.featured,
      editorial_hook: l.editorial_hook,
      editorial_description: l.editorial_description,
      seller_raw_input: l.seller_raw_input,
      hero_image_url: l.hero_image_url,
      gallery_image_urls: l.gallery_image_urls,
      maker_brand: l.maker_brand,
      year: l.year,
      condition: l.condition,
      location: l.location,
      commission_rate: l.commission_rate,
      category_fields: l.category_fields,
      seller_id: l.seller_id,
      seller_type: l.seller_type,
      seller_display_name: l.seller_display_name,
      partner_account_id: l.partner_account_id,
    })
  }

  async function saveListing() {
    if (!listingForm.title) return
    if (creatingListing) {
      const res = await fetch('/api/admin/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingForm),
      })
      if (res.ok) {
        setCreatingListing(false)
        setListingForm(EMPTY_LISTING)
        fetchListings()
      }
    } else if (editingListing) {
      const res = await fetch(`/api/admin/marketplace/listings/${editingListing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingForm),
      })
      if (res.ok) {
        setEditingListing(null)
        setListingForm(EMPTY_LISTING)
        fetchListings()
      }
    }
  }

  async function quickAction(id: string, updates: Record<string, unknown>) {
    await fetch(`/api/admin/marketplace/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    fetchListings()
  }

  async function deleteListing(id: string) {
    if (!confirm('Delete this listing?')) return
    await fetch(`/api/admin/marketplace/listings/${id}`, { method: 'DELETE' })
    fetchListings()
  }

  function cancelListingEdit() {
    setEditingListing(null)
    setCreatingListing(false)
    setListingForm(EMPTY_LISTING)
  }

  // ── Enquiry Actions ────────────────────────────────────────

  async function updateEnquiryStatus(id: string, status: string) {
    await fetch(`/api/admin/marketplace/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchEnquiries()
  }

  // ── Request Actions ────────────────────────────────────────

  async function updateRequest(id: string, updates: Record<string, unknown>) {
    await fetch(`/api/admin/marketplace/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    fetchRequests()
  }

  // ── Collection Actions ─────────────────────────────────────

  function startCreateCollection() {
    setEditingCollection(null)
    setCollectionForm({ ...EMPTY_COLLECTION })
    setCreatingCollection(true)
  }

  function startEditCollection(c: Collection) {
    setCreatingCollection(false)
    setEditingCollection(c)
    setCollectionForm({
      name: c.name,
      slug: c.slug || '',
      editorial_intro: c.editorial_intro || '',
      hero_image_url: c.hero_image_url || '',
      season: c.season || '',
      published: c.published,
      newsletter_link: c.newsletter_link || '',
    })
  }

  async function saveCollection() {
    if (!collectionForm.name) return
    if (creatingCollection) {
      const res = await fetch('/api/admin/marketplace/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectionForm),
      })
      if (res.ok) {
        setCreatingCollection(false)
        setCollectionForm(EMPTY_COLLECTION)
        fetchCollections()
      }
    } else if (editingCollection) {
      const res = await fetch(`/api/admin/marketplace/collections/${editingCollection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectionForm),
      })
      if (res.ok) {
        setEditingCollection(null)
        setCollectionForm(EMPTY_COLLECTION)
        fetchCollections()
      }
    }
  }

  async function deleteCollection(id: string) {
    if (!confirm('Delete this collection and all its listing associations?')) return
    await fetch(`/api/admin/marketplace/collections/${id}`, { method: 'DELETE' })
    fetchCollections()
  }

  async function toggleCollectionPublished(c: Collection) {
    await fetch(`/api/admin/marketplace/collections/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !c.published }),
    })
    fetchCollections()
  }

  function cancelCollectionEdit() {
    setEditingCollection(null)
    setCreatingCollection(false)
    setCollectionForm(EMPTY_COLLECTION)
  }

  async function manageCollectionListings(collectionId: string) {
    setManagingCollectionId(collectionId)
    const res = await fetch(`/api/admin/marketplace/collections/${collectionId}`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      setCollectionListings(data.listings || [])
    }
  }

  async function addListingToCollection() {
    if (!managingCollectionId || !addListingId) return
    const res = await fetch(`/api/admin/marketplace/collections/${managingCollectionId}/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: addListingId, sort_order: collectionListings.length }),
    })
    if (res.ok) {
      setAddListingId('')
      manageCollectionListings(managingCollectionId)
      fetchCollections()
    }
  }

  async function removeListingFromCollection(listingId: string) {
    if (!managingCollectionId) return
    await fetch(`/api/admin/marketplace/collections/${managingCollectionId}/listings?listing_id=${listingId}`, {
      method: 'DELETE',
    })
    manageCollectionListings(managingCollectionId)
    fetchCollections()
  }

  // ── Order Actions ──────────────────────────────────────────

  function startEditOrder(o: Order) {
    setEditingOrder(o)
    setOrderForm({
      payment_status: o.payment_status || '',
      fulfilment_status: o.fulfilment_status || '',
      tracking_number: o.tracking_number || '',
      notes: o.notes || '',
    })
  }

  async function saveOrder() {
    if (!editingOrder) return
    const res = await fetch(`/api/admin/marketplace/orders/${editingOrder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderForm),
    })
    if (res.ok) {
      setEditingOrder(null)
      fetchOrders()
    }
  }

  // ── Tab Badge Counts ───────────────────────────────────────

  function tabBadge(tab: TabKey): number {
    switch (tab) {
      case 'listings': return listings.filter((l) => l.status === 'review').length
      case 'enquiries': return enquiries.filter((e) => e.status === 'new').length
      case 'requests': return requests.filter((r) => r.status === 'new').length
      case 'collections': return 0
      case 'orders': return orders.filter((o) => o.payment_status === 'pending').length
    }
  }

  // ── Filtered Data ──────────────────────────────────────────

  const filteredEnquiries = enquiryFilter === 'all'
    ? enquiries
    : enquiries.filter((e) => e.status === enquiryFilter)

  const filteredRequests = requests.filter((r) => {
    if (requestFilterStatus !== 'all' && r.status !== requestFilterStatus) return false
    if (requestFilterCategory !== 'all' && r.category !== requestFilterCategory) return false
    return true
  })

  const filteredOrders = orders.filter((o) => {
    if (orderFilterPayment !== 'all' && o.payment_status !== orderFilterPayment) return false
    if (orderFilterFulfilment !== 'all' && o.fulfilment_status !== orderFilterFulfilment) return false
    return true
  })

  const commissionTotal = orders.reduce((sum, o) => sum + (o.commission_amount || 0), 0)
  const commissionableTotal = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)

  // Sort listings: review items first
  const sortedListings = [...listings].sort((a, b) => {
    if (a.status === 'review' && b.status !== 'review') return -1
    if (a.status !== 'review' && b.status === 'review') return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const showListingForm = creatingListing || editingListing

  // ── Render ─────────────────────────────────────────────────

  if (loading) return <div className="p-4 sm:p-6 lg:p-8"><p className="text-gray-500 font-body">Loading marketplace...</p></div>

  return (
    <div className="p-6 sm:p-8">
      <h1 className="font-heading text-2xl font-semibold text-green mb-6">Marketplace</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((tab) => {
          const count = tabBadge(tab.key)
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-body font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.key
                  ? 'border-green text-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-gold rounded-full">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ══════════════════════════ LISTINGS TAB ══════════════════════════ */}
      {activeTab === 'listings' && (
        <div>
          {/* Filters + Add button */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <select
              value={listingFilter.status}
              onChange={(e) => setListingFilter({ ...listingFilter, status: e.target.value })}
              className="px-3 py-2 border border-green/20 rounded text-sm font-body"
            >
              <option value="all">All statuses</option>
              {LISTING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={listingFilter.category}
              onChange={(e) => setListingFilter({ ...listingFilter, category: e.target.value })}
              className="px-3 py-2 border border-green/20 rounded text-sm font-body"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
            </select>
            <input
              type="text"
              placeholder="Search by title..."
              value={listingFilter.search}
              onChange={(e) => setListingFilter({ ...listingFilter, search: e.target.value })}
              className="px-3 py-2 border border-green/20 rounded text-sm font-body w-48"
            />
            <button
              onClick={startCreateListing}
              className="ml-auto px-4 py-2 bg-green text-white text-sm font-body rounded-md hover:bg-green-light transition-colors"
            >
              Add Listing
            </button>
          </div>

          {/* Listing Form */}
          {showListingForm && (
            <div className="bg-white border border-green/10 rounded-lg p-6 mb-6">
              <h2 className="font-heading text-lg font-semibold text-green mb-4">
                {creatingListing ? 'New Listing' : `Edit: ${editingListing?.title}`}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 font-body mb-1">Title *</label>
                  <input value={listingForm.title} onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Category</label>
                  <select value={listingForm.category || ''} onChange={(e) => setListingForm({ ...listingForm, category: e.target.value || null })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body">
                    <option value="">Select...</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Status</label>
                  <select value={listingForm.status} onChange={(e) => setListingForm({ ...listingForm, status: e.target.value })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body">
                    {LISTING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Price</label>
                  <input type="number" value={listingForm.price ?? ''} onChange={(e) => setListingForm({ ...listingForm, price: e.target.value ? parseFloat(e.target.value) : null })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Price display</label>
                  <input value={listingForm.price_display || ''} onChange={(e) => setListingForm({ ...listingForm, price_display: e.target.value || null })} placeholder="e.g. EUR 12,500" className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Maker / Brand</label>
                  <input value={listingForm.maker_brand || ''} onChange={(e) => setListingForm({ ...listingForm, maker_brand: e.target.value || null })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Year</label>
                  <input value={listingForm.year || ''} onChange={(e) => setListingForm({ ...listingForm, year: e.target.value || null })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Condition</label>
                  <input value={listingForm.condition || ''} onChange={(e) => setListingForm({ ...listingForm, condition: e.target.value || null })} placeholder="e.g. Mint, Excellent, Good" className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Location</label>
                  <input value={listingForm.location || ''} onChange={(e) => setListingForm({ ...listingForm, location: e.target.value || null })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Commission rate (%)</label>
                  <input type="number" step="0.5" value={listingForm.commission_rate ?? ''} onChange={(e) => setListingForm({ ...listingForm, commission_rate: e.target.value ? parseFloat(e.target.value) : null })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Seller display name</label>
                  <input value={listingForm.seller_display_name || ''} onChange={(e) => setListingForm({ ...listingForm, seller_display_name: e.target.value || null })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 font-body mb-1">Editorial hook</label>
                  <input value={listingForm.editorial_hook || ''} onChange={(e) => setListingForm({ ...listingForm, editorial_hook: e.target.value || null })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 font-body mb-1">Editorial description</label>
                  <textarea value={listingForm.editorial_description || ''} onChange={(e) => setListingForm({ ...listingForm, editorial_description: e.target.value || null })} rows={3} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 font-body mb-1">Hero image URL</label>
                  <input value={listingForm.hero_image_url || ''} onChange={(e) => setListingForm({ ...listingForm, hero_image_url: e.target.value || null })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                  {editingListing?.hero_image_url && (
                    <img src={editingListing.hero_image_url} alt="Current hero" className="mt-2 w-32 h-32 object-cover rounded border border-green/10" />
                  )}
                </div>
                {!creatingListing && editingListing && (
                  <div className="sm:col-span-2">
                    <ListingPhotoUpload
                      listingId={editingListing.id}
                      listingTitle={editingListing.title}
                      onComplete={fetchListings}
                      onSkip={() => {}}
                    />
                  </div>
                )}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm font-body">
                    <input type="checkbox" checked={listingForm.featured} onChange={(e) => setListingForm({ ...listingForm, featured: e.target.checked })} />
                    Featured
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={saveListing} className="px-4 py-2 bg-green text-white text-sm font-body rounded-md hover:bg-green-light">
                  {creatingListing ? 'Create' : 'Save'}
                </button>
                <button onClick={cancelListingEdit} className="px-4 py-2 text-gray-500 text-sm font-body hover:text-gray-700">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Listings Table */}
          <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green/10 bg-pearl">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Listing</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Seller</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-body font-medium">Price</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-body font-medium">Status</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-body font-medium">Featured</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Created</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-body font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedListings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500 font-body">No listings found.</td>
                  </tr>
                ) : (
                  sortedListings.map((l) => (
                    <tr key={l.id} className={`border-b border-green/5 last:border-0 ${l.status === 'review' ? 'bg-gold/5' : ''}`}>
                      <td className="px-4 py-3 font-body">
                        <div className="font-medium text-gray-800">{l.title}</div>
                        {l.maker_brand && <div className="text-xs text-gray-400">{l.maker_brand}</div>}
                      </td>
                      <td className="px-4 py-3 font-body">
                        {l.category && <span className="text-xs text-green/70 bg-green-muted px-2 py-0.5 rounded">{CATEGORY_LABELS[l.category] || l.category}</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-body text-xs">{l.seller_display_name || '-'}</td>
                      <td className="px-4 py-3 text-right text-gray-700 font-body text-xs">{l.price_display || (l.price != null ? fmtCurrency(l.price) : '-')}</td>
                      <td className="px-4 py-3 text-center">{statusBadge(l.status)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => quickAction(l.id, { featured: !l.featured })}
                          className={`text-[10px] px-2 py-0.5 rounded font-body ${l.featured ? 'bg-gold/20 text-gold' : 'bg-gray-50 text-gray-300'}`}
                        >
                          {l.featured ? 'Featured' : 'Standard'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-body text-xs">{fmtDate(l.created_at)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {l.status === 'review' && (
                          <>
                            <button onClick={() => quickAction(l.id, { status: 'live' })} className="text-xs text-green hover:underline font-body mr-2">Approve</button>
                            <button onClick={() => quickAction(l.id, { status: 'rejected' })} className="text-xs text-red-400 hover:text-red-600 font-body mr-2">Reject</button>
                          </>
                        )}
                        <button onClick={() => startEditListing(l)} className="text-xs text-green hover:underline font-body mr-2">Edit</button>
                        <button onClick={() => deleteListing(l.id)} className="text-xs text-red-400 hover:text-red-600 font-body">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════ ENQUIRIES TAB ══════════════════════════ */}
      {activeTab === 'enquiries' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <select
              value={enquiryFilter}
              onChange={(e) => setEnquiryFilter(e.target.value)}
              className="px-3 py-2 border border-green/20 rounded text-sm font-body"
            >
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="responded">Responded</option>
              <option value="negotiating">Negotiating</option>
              <option value="converted">Converted</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green/10 bg-pearl">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Listing</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Message</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-body font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Date</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-body font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500 font-body">No enquiries found.</td>
                  </tr>
                ) : (
                  filteredEnquiries.map((e) => (
                    <tr key={e.id} className="border-b border-green/5 last:border-0">
                      <td className="px-4 py-3 font-body text-gray-800 text-xs">{e.listing_title || '-'}</td>
                      <td className="px-4 py-3 font-body font-medium text-gray-800">{e.name}</td>
                      <td className="px-4 py-3 font-body text-gray-500 text-xs">{e.email}</td>
                      <td className="px-4 py-3 font-body text-gray-500 text-xs max-w-xs">
                        <button
                          onClick={() => setExpandedEnquiry(expandedEnquiry === e.id ? null : e.id)}
                          className="text-left hover:text-gray-700"
                        >
                          {expandedEnquiry === e.id ? e.message : (e.message?.length > 80 ? e.message.slice(0, 80) + '...' : e.message)}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">{statusBadge(e.status)}</td>
                      <td className="px-4 py-3 text-gray-500 font-body text-xs">{fmtDate(e.created_at)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {e.status === 'new' && (
                          <button onClick={() => updateEnquiryStatus(e.id, 'responded')} className="text-xs text-green hover:underline font-body mr-2">Responded</button>
                        )}
                        {(e.status === 'new' || e.status === 'responded' || e.status === 'negotiating') && (
                          <>
                            <button onClick={() => updateEnquiryStatus(e.id, 'converted')} className="text-xs text-blue-600 hover:underline font-body mr-2">Converted</button>
                            <button onClick={() => updateEnquiryStatus(e.id, 'declined')} className="text-xs text-red-400 hover:text-red-600 font-body">Declined</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════ REQUESTS TAB ══════════════════════════ */}
      {activeTab === 'requests' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <select
              value={requestFilterStatus}
              onChange={(e) => setRequestFilterStatus(e.target.value)}
              className="px-3 py-2 border border-green/20 rounded text-sm font-body"
            >
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="active">Active</option>
              <option value="matched">Matched</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={requestFilterCategory}
              onChange={(e) => setRequestFilterCategory(e.target.value)}
              className="px-3 py-2 border border-green/20 rounded text-sm font-body"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
            </select>
          </div>

          <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green/10 bg-pearl">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Description</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Budget</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Timeline</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Requester</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-body font-medium">Status</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-body font-medium">Public</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-body font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500 font-body">No requests found.</td>
                  </tr>
                ) : (
                  filteredRequests.map((r) => (
                    <tr key={r.id} className="border-b border-green/5 last:border-0">
                      <td className="px-4 py-3 font-body">
                        {r.category && <span className="text-xs text-green/70 bg-green-muted px-2 py-0.5 rounded">{CATEGORY_LABELS[r.category] || r.category}</span>}
                      </td>
                      <td className="px-4 py-3 font-body text-gray-700 text-xs max-w-xs truncate">{r.description || r.raw_chat_input || '-'}</td>
                      <td className="px-4 py-3 font-body text-gray-500 text-xs">
                        {r.budget_min != null || r.budget_max != null
                          ? `${fmtCurrency(r.budget_min)} - ${fmtCurrency(r.budget_max)}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 font-body text-gray-500 text-xs">{r.timeline || '-'}</td>
                      <td className="px-4 py-3 font-body text-xs">
                        <div className="font-medium text-gray-800">{r.name || '-'}</div>
                        <div className="text-gray-400">{r.email || ''}</div>
                      </td>
                      <td className="px-4 py-3 text-center">{statusBadge(r.status)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => updateRequest(r.id, { is_public: !r.is_public })}
                          className={`text-[10px] px-2 py-0.5 rounded font-body ${r.is_public ? 'bg-green/10 text-green' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {r.is_public ? 'Public' : 'Private'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {r.status === 'new' && (
                          <button onClick={() => updateRequest(r.id, { status: 'active' })} className="text-xs text-green hover:underline font-body mr-2">Activate</button>
                        )}
                        {(r.status === 'new' || r.status === 'active') && (
                          <button onClick={() => updateRequest(r.id, { status: 'withdrawn' })} className="text-xs text-red-400 hover:text-red-600 font-body">Withdraw</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════ COLLECTIONS TAB ══════════════════════════ */}
      {activeTab === 'collections' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">{collections.length} collection(s)</h3>
            <button
              onClick={startCreateCollection}
              className="px-4 py-2 bg-green text-white text-sm font-body rounded-md hover:bg-green-light transition-colors"
            >
              New Collection
            </button>
          </div>

          {/* Collection Form */}
          {(creatingCollection || editingCollection) && (
            <div className="bg-white border border-green/10 rounded-lg p-6 mb-6">
              <h2 className="font-heading text-lg font-semibold text-green mb-4">
                {creatingCollection ? 'New Collection' : `Edit: ${editingCollection?.name}`}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Name *</label>
                  <input value={collectionForm.name} onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Slug</label>
                  <input value={collectionForm.slug} onChange={(e) => setCollectionForm({ ...collectionForm, slug: e.target.value })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Season</label>
                  <input value={collectionForm.season} onChange={(e) => setCollectionForm({ ...collectionForm, season: e.target.value })} placeholder="e.g. Summer 2026" className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Hero image URL</label>
                  <input value={collectionForm.hero_image_url} onChange={(e) => setCollectionForm({ ...collectionForm, hero_image_url: e.target.value })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 font-body mb-1">Editorial intro</label>
                  <textarea value={collectionForm.editorial_intro} onChange={(e) => setCollectionForm({ ...collectionForm, editorial_intro: e.target.value })} rows={3} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Newsletter link</label>
                  <input value={collectionForm.newsletter_link} onChange={(e) => setCollectionForm({ ...collectionForm, newsletter_link: e.target.value })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 text-sm font-body">
                    <input type="checkbox" checked={collectionForm.published} onChange={(e) => setCollectionForm({ ...collectionForm, published: e.target.checked })} />
                    Published
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={saveCollection} className="px-4 py-2 bg-green text-white text-sm font-body rounded-md hover:bg-green-light">
                  {creatingCollection ? 'Create' : 'Save'}
                </button>
                <button onClick={cancelCollectionEdit} className="px-4 py-2 text-gray-500 text-sm font-body hover:text-gray-700">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Manage Collection Listings */}
          {managingCollectionId && (
            <div className="bg-white border border-green/10 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-lg font-semibold text-green">
                  Manage Listings: {collections.find((c) => c.id === managingCollectionId)?.name}
                </h2>
                <button onClick={() => setManagingCollectionId(null)} className="text-xs text-gray-400 hover:text-gray-600 font-body">Close</button>
              </div>

              {/* Add listing */}
              <div className="flex gap-2 mb-4">
                <select
                  value={addListingId}
                  onChange={(e) => setAddListingId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-green/20 rounded text-sm font-body"
                >
                  <option value="">Select a listing to add...</option>
                  {listings
                    .filter((l) => l.status === 'live' && !collectionListings.some((cl) => cl.id === l.id))
                    .map((l) => <option key={l.id} value={l.id}>{l.title} ({CATEGORY_LABELS[l.category || ''] || l.category})</option>)}
                </select>
                <button onClick={addListingToCollection} className="px-4 py-2 bg-green text-white text-sm font-body rounded-md hover:bg-green-light">
                  Add
                </button>
              </div>

              {/* Current listings */}
              {collectionListings.length === 0 ? (
                <p className="text-gray-500 font-body text-sm">No listings in this collection yet.</p>
              ) : (
                <div className="space-y-2">
                  {collectionListings.map((cl, idx) => (
                    <div key={cl.id} className="flex items-center justify-between bg-pearl rounded p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-body w-6">{idx + 1}.</span>
                        <div>
                          <p className="text-sm font-body font-medium text-gray-800">{cl.title}</p>
                          <p className="text-xs text-gray-400 font-body">{cl.category && (CATEGORY_LABELS[cl.category] || cl.category)} {cl.price_display ? ` - ${cl.price_display}` : ''}</p>
                        </div>
                      </div>
                      <button onClick={() => removeListingFromCollection(cl.id)} className="text-xs text-red-400 hover:text-red-600 font-body">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Collections Table */}
          <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green/10 bg-pearl">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Collection</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-body font-medium">Listings</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Season</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-body font-medium">Published</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Created</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-body font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500 font-body">No collections yet.</td>
                  </tr>
                ) : (
                  collections.map((c) => (
                    <tr key={c.id} className="border-b border-green/5 last:border-0">
                      <td className="px-4 py-3 font-body font-medium text-gray-800">{c.name}</td>
                      <td className="px-4 py-3 text-center font-body text-gray-500">{c.listing_count}</td>
                      <td className="px-4 py-3 font-body text-gray-500 text-xs">{c.season || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleCollectionPublished(c)}
                          className={`text-[10px] px-2 py-0.5 rounded font-body ${c.published ? 'bg-green/10 text-green' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {c.published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-body text-xs">{fmtDate(c.created_at)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => manageCollectionListings(c.id)} className="text-xs text-green hover:underline font-body mr-2">Listings</button>
                        <button onClick={() => startEditCollection(c)} className="text-xs text-green hover:underline font-body mr-2">Edit</button>
                        <button onClick={() => deleteCollection(c.id)} className="text-xs text-red-400 hover:text-red-600 font-body">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════ ORDERS TAB ══════════════════════════ */}
      {activeTab === 'orders' && (
        <div>
          {/* Commission Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-green/10 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-body mb-1">Total commissionable</p>
              <p className="font-heading text-xl font-semibold text-green">{fmtCurrency(commissionableTotal)}</p>
            </div>
            <div className="bg-white border border-green/10 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-body mb-1">Total commission earned</p>
              <p className="font-heading text-xl font-semibold text-gold">{fmtCurrency(commissionTotal)}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <select
              value={orderFilterPayment}
              onChange={(e) => setOrderFilterPayment(e.target.value)}
              className="px-3 py-2 border border-green/20 rounded text-sm font-body"
            >
              <option value="all">All payment statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={orderFilterFulfilment}
              onChange={(e) => setOrderFilterFulfilment(e.target.value)}
              className="px-3 py-2 border border-green/20 rounded text-sm font-body"
            >
              <option value="all">All fulfilment statuses</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Order Edit Modal */}
          {editingOrder && (
            <div className="bg-white border border-green/10 rounded-lg p-6 mb-6">
              <h2 className="font-heading text-lg font-semibold text-green mb-4">
                Edit Order: {editingOrder.listing_title || editingOrder.listing_id}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Payment status</label>
                  <select value={orderForm.payment_status} onChange={(e) => setOrderForm({ ...orderForm, payment_status: e.target.value })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body">
                    <option value="">Select...</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Fulfilment status</label>
                  <select value={orderForm.fulfilment_status} onChange={(e) => setOrderForm({ ...orderForm, fulfilment_status: e.target.value })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body">
                    <option value="">Select...</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Tracking number</label>
                  <input value={orderForm.tracking_number} onChange={(e) => setOrderForm({ ...orderForm, tracking_number: e.target.value })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Notes</label>
                  <input value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={saveOrder} className="px-4 py-2 bg-green text-white text-sm font-body rounded-md hover:bg-green-light">Save</button>
                <button onClick={() => setEditingOrder(null)} className="px-4 py-2 text-gray-500 text-sm font-body hover:text-gray-700">Cancel</button>
              </div>
            </div>
          )}

          {/* Orders Table */}
          <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green/10 bg-pearl">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Listing</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Client</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-body font-medium">Amount</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-body font-medium">Commission</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-body font-medium">Payment</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-body font-medium">Fulfilment</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Date</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-body font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500 font-body">No orders found.</td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="border-b border-green/5 last:border-0">
                      <td className="px-4 py-3 font-body font-medium text-gray-800 text-xs">{o.listing_title || '-'}</td>
                      <td className="px-4 py-3 font-body text-gray-500 text-xs">{o.client_name || '-'}</td>
                      <td className="px-4 py-3 text-right font-body text-gray-700 text-xs">{fmtCurrency(o.total_amount, o.currency)}</td>
                      <td className="px-4 py-3 text-right font-body text-gold text-xs">{fmtCurrency(o.commission_amount, o.currency)}</td>
                      <td className="px-4 py-3 text-center">{o.payment_status ? statusBadge(o.payment_status) : '-'}</td>
                      <td className="px-4 py-3 text-center">{o.fulfilment_status ? statusBadge(o.fulfilment_status) : '-'}</td>
                      <td className="px-4 py-3 text-gray-500 font-body text-xs">{fmtDate(o.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => startEditOrder(o)} className="text-xs text-green hover:underline font-body">Edit</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
