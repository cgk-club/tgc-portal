'use client'

import { useState, useEffect, useCallback } from 'react'
import Button from '@/components/ui/Button'

type TabKey = 'fiche-edits' | 'offers' | 'events' | 'content'

interface FicheEdit {
  id: string
  fiche_id: string
  changes: Record<string, unknown>
  status: string
  submitted_at: string
  admin_note: string | null
  partner: { org_name: string | null; email: string } | null
  fiche: { slug: string; headline: string } | null
}

interface PartnerOffer {
  id: string
  title: string
  description: string | null
  discount_type: string
  discount_value: string | null
  valid_from: string | null
  valid_to: string | null
  terms: string | null
  tier: string
  status: string
  created_at: string
  admin_note: string | null
  partner: { org_name: string | null; email: string } | null
  fiche: { slug: string; headline: string } | null
}

interface PartnerEvent {
  id: string
  title: string
  category: string
  date_display: string
  date_start: string | null
  date_end: string | null
  location: string | null
  capacity: number | null
  price: string
  description: string | null
  highlights: string | null
  status: string
  created_at: string
  admin_note: string | null
  partner: { org_name: string | null; email: string } | null
}

interface PartnerContentItem {
  id: string
  type: string
  title: string
  body: string | null
  images: unknown[]
  status: string
  created_at: string
  admin_note: string | null
  partner: { org_name: string | null; email: string } | null
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'fiche-edits', label: 'Fiche Edits' },
  { key: 'offers', label: 'Offers' },
  { key: 'events', label: 'Events' },
  { key: 'content', label: 'Content' },
]

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('fiche-edits')
  const [ficheEdits, setFicheEdits] = useState<FicheEdit[]>([])
  const [offers, setOffers] = useState<PartnerOffer[]>([])
  const [events, setEvents] = useState<PartnerEvent[]>([])
  const [content, setContent] = useState<PartnerContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionNote, setActionNote] = useState('')
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [feRes, ofRes, evRes, coRes] = await Promise.all([
      fetch('/api/admin/fiche-edits'),
      fetch('/api/admin/partner-offers'),
      fetch('/api/admin/partner-events'),
      fetch('/api/admin/partner-content'),
    ])

    if (feRes.ok) setFicheEdits(await feRes.json())
    if (ofRes.ok) setOffers(await ofRes.json())
    if (evRes.ok) setEvents(await evRes.json())
    if (coRes.ok) setContent(await coRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  function pendingCount(tab: TabKey): number {
    switch (tab) {
      case 'fiche-edits': return ficheEdits.filter((e) => e.status === 'pending').length
      case 'offers': return offers.filter((o) => o.status === 'pending').length
      case 'events': return events.filter((e) => e.status === 'pending').length
      case 'content': return content.filter((c) => c.status === 'submitted').length
    }
  }

  async function handleAction(endpoint: string, id: string, action: string, extra?: Record<string, unknown>) {
    setProcessing(id)
    const res = await fetch(`/api/admin/${endpoint}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, admin_note: actionNote || undefined, ...extra }),
    })

    if (res.ok) {
      setActionNote('')
      setShowNoteFor(null)
      fetchAll()
    }
    setProcessing(null)
  }

  function toggleNote(id: string) {
    if (showNoteFor === id) {
      setShowNoteFor(null)
      setActionNote('')
    } else {
      setShowNoteFor(id)
      setActionNote('')
    }
  }

  const pendingFicheEdits = ficheEdits.filter((e) => e.status === 'pending')
  const reviewedFicheEdits = ficheEdits.filter((e) => e.status !== 'pending')
  const pendingOffers = offers.filter((o) => o.status === 'pending')
  const reviewedOffers = offers.filter((o) => o.status !== 'pending' && o.status !== 'draft')
  const pendingEvents = events.filter((e) => e.status === 'pending')
  const reviewedEvents = events.filter((e) => e.status !== 'pending' && e.status !== 'draft')
  const pendingContent = content.filter((c) => c.status === 'submitted')
  const reviewedContent = content.filter((c) => c.status !== 'submitted' && c.status !== 'draft')

  return (
    <div className="p-8">
      <h1 className="font-heading text-2xl font-semibold text-green mb-6">Approvals</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((tab) => {
          const count = pendingCount(tab.key)
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

      {loading ? (
        <p className="text-gray-500 font-body">Loading...</p>
      ) : (
        <>
          {/* Fiche Edits Tab */}
          {activeTab === 'fiche-edits' && (
            <div>
              {pendingFicheEdits.length === 0 && reviewedFicheEdits.length === 0 ? (
                <div className="bg-white rounded-[8px] border border-gray-200 p-12 text-center">
                  <p className="text-gray-500 font-body">No fiche edit requests.</p>
                </div>
              ) : (
                <>
                  {pendingFicheEdits.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 font-body">Pending</h3>
                      <div className="space-y-3">
                        {pendingFicheEdits.map((fe) => (
                          <div key={fe.id} className="bg-white rounded-lg border border-green/10 p-5">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-body font-medium text-gray-900">{fe.fiche?.headline || fe.fiche?.slug || 'Unknown fiche'}</p>
                                <p className="text-xs text-gray-500 font-body mt-1">
                                  By {fe.partner?.org_name || fe.partner?.email || 'Unknown'} on {new Date(fe.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <span className="inline-block px-2 py-0.5 text-xs rounded-full font-medium bg-gold/20 text-gold">pending</span>
                            </div>
                            {/* Diff view */}
                            <div className="mt-3 bg-pearl rounded p-3">
                              <p className="text-xs text-gray-500 font-body mb-2">Changed fields:</p>
                              {Object.entries(fe.changes || {}).map(([key, value]) => (
                                <div key={key} className="flex gap-2 mb-1">
                                  <span className="text-xs font-medium text-green font-body">{key}:</span>
                                  <span className="text-xs text-gray-700 font-body">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                                </div>
                              ))}
                            </div>
                            {/* Note input */}
                            {showNoteFor === fe.id && (
                              <div className="mt-3">
                                <input
                                  value={actionNote}
                                  onChange={(e) => setActionNote(e.target.value)}
                                  placeholder="Admin note (optional)"
                                  className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                                />
                              </div>
                            )}
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                disabled={processing === fe.id}
                                onClick={() => handleAction('fiche-edits', fe.id, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={processing === fe.id}
                                onClick={() => {
                                  if (showNoteFor === fe.id) {
                                    handleAction('fiche-edits', fe.id, 'reject')
                                  } else {
                                    toggleNote(fe.id)
                                  }
                                }}
                              >
                                Reject
                              </Button>
                              <button
                                onClick={() => toggleNote(fe.id)}
                                className="text-xs text-gray-400 hover:text-gray-600 font-body ml-auto"
                              >
                                {showNoteFor === fe.id ? 'Hide note' : 'Add note'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {reviewedFicheEdits.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 font-body">Reviewed</h3>
                      <div className="bg-white rounded-lg border border-green/10 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-green/10">
                              <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Fiche</th>
                              <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Partner</th>
                              <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Date</th>
                              <th className="text-center px-4 py-2 text-xs text-gray-400 font-body">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reviewedFicheEdits.map((fe) => (
                              <tr key={fe.id} className="border-b border-green/5 last:border-0">
                                <td className="px-4 py-2 text-gray-800 font-body">{fe.fiche?.headline || fe.fiche?.slug || '-'}</td>
                                <td className="px-4 py-2 text-gray-500 font-body">{fe.partner?.org_name || fe.partner?.email || '-'}</td>
                                <td className="px-4 py-2 text-gray-500 font-body text-xs">{new Date(fe.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                                <td className="px-4 py-2 text-center">
                                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                                    fe.status === 'approved' ? 'bg-green-muted text-green' : 'bg-red-50 text-red-600'
                                  }`}>{fe.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Offers Tab */}
          {activeTab === 'offers' && (
            <div>
              {pendingOffers.length === 0 && reviewedOffers.length === 0 ? (
                <div className="bg-white rounded-[8px] border border-gray-200 p-12 text-center">
                  <p className="text-gray-500 font-body">No partner offers to review.</p>
                </div>
              ) : (
                <>
                  {pendingOffers.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 font-body">Pending</h3>
                      <div className="space-y-3">
                        {pendingOffers.map((o) => (
                          <div key={o.id} className="bg-white rounded-lg border border-green/10 p-5">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-body font-medium text-gray-900">{o.title}</p>
                                <p className="text-xs text-gray-500 font-body mt-1">
                                  By {o.partner?.org_name || o.partner?.email || 'Unknown'}
                                  {o.fiche ? ` for ${o.fiche.headline}` : ''}
                                </p>
                              </div>
                              <span className="inline-block px-2 py-0.5 text-xs rounded-full font-medium bg-gold/20 text-gold">pending</span>
                            </div>
                            <div className="mt-3 bg-pearl rounded p-3">
                              {o.description && <p className="text-sm text-gray-700 font-body mb-2">{o.description}</p>}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-body">
                                <div><span className="text-gray-400">Type:</span> <span className="text-gray-700">{o.discount_type}</span></div>
                                {o.discount_value && <div><span className="text-gray-400">Value:</span> <span className="text-gray-700">{o.discount_value}</span></div>}
                                <div><span className="text-gray-400">Tier:</span> <span className="text-gray-700">{o.tier}</span></div>
                                <div><span className="text-gray-400">Valid:</span> <span className="text-gray-700">{o.valid_from && o.valid_to ? `${o.valid_from} to ${o.valid_to}` : 'Open'}</span></div>
                              </div>
                              {o.terms && <p className="text-xs text-gray-500 font-body mt-2">Terms: {o.terms}</p>}
                            </div>
                            {showNoteFor === o.id && (
                              <div className="mt-3">
                                <input
                                  value={actionNote}
                                  onChange={(e) => setActionNote(e.target.value)}
                                  placeholder="Admin note (optional)"
                                  className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                                />
                              </div>
                            )}
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" disabled={processing === o.id} onClick={() => handleAction('partner-offers', o.id, 'approve')}>Approve</Button>
                              <Button size="sm" variant="ghost" disabled={processing === o.id} onClick={() => {
                                if (showNoteFor === o.id) { handleAction('partner-offers', o.id, 'reject') } else { toggleNote(o.id) }
                              }}>Reject</Button>
                              <button onClick={() => toggleNote(o.id)} className="text-xs text-gray-400 hover:text-gray-600 font-body ml-auto">
                                {showNoteFor === o.id ? 'Hide note' : 'Add note'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {reviewedOffers.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 font-body">Reviewed</h3>
                      <div className="bg-white rounded-lg border border-green/10 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-green/10">
                              <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Offer</th>
                              <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Partner</th>
                              <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Type</th>
                              <th className="text-center px-4 py-2 text-xs text-gray-400 font-body">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reviewedOffers.map((o) => (
                              <tr key={o.id} className="border-b border-green/5 last:border-0">
                                <td className="px-4 py-2 text-gray-800 font-body">{o.title}</td>
                                <td className="px-4 py-2 text-gray-500 font-body">{o.partner?.org_name || o.partner?.email || '-'}</td>
                                <td className="px-4 py-2 text-gray-500 font-body">{o.discount_type}</td>
                                <td className="px-4 py-2 text-center">
                                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                                    o.status === 'active' ? 'bg-green-muted text-green' : o.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                                  }`}>{o.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div>
              {pendingEvents.length === 0 && reviewedEvents.length === 0 ? (
                <div className="bg-white rounded-[8px] border border-gray-200 p-12 text-center">
                  <p className="text-gray-500 font-body">No partner events to review.</p>
                </div>
              ) : (
                <>
                  {pendingEvents.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 font-body">Pending</h3>
                      <div className="space-y-3">
                        {pendingEvents.map((ev) => (
                          <div key={ev.id} className="bg-white rounded-lg border border-green/10 p-5">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-body font-medium text-gray-900">{ev.title}</p>
                                <p className="text-xs text-gray-500 font-body mt-1">
                                  By {ev.partner?.org_name || ev.partner?.email || 'Unknown'}
                                </p>
                              </div>
                              <span className="inline-block px-2 py-0.5 text-xs rounded-full font-medium bg-gold/20 text-gold">pending</span>
                            </div>
                            <div className="mt-3 bg-pearl rounded p-3">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-body">
                                <div><span className="text-gray-400">Category:</span> <span className="text-gray-700">{ev.category}</span></div>
                                <div><span className="text-gray-400">Date:</span> <span className="text-gray-700">{ev.date_display}</span></div>
                                {ev.location && <div><span className="text-gray-400">Location:</span> <span className="text-gray-700">{ev.location}</span></div>}
                                {ev.capacity && <div><span className="text-gray-400">Capacity:</span> <span className="text-gray-700">{ev.capacity}</span></div>}
                                <div><span className="text-gray-400">Price:</span> <span className="text-gray-700">{ev.price}</span></div>
                              </div>
                              {ev.description && <p className="text-sm text-gray-700 font-body mt-2">{ev.description}</p>}
                              {ev.highlights && <p className="text-xs text-gray-500 font-body mt-1">Highlights: {ev.highlights}</p>}
                            </div>
                            {showNoteFor === ev.id && (
                              <div className="mt-3">
                                <input
                                  value={actionNote}
                                  onChange={(e) => setActionNote(e.target.value)}
                                  placeholder="Admin note (optional)"
                                  className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                                />
                              </div>
                            )}
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" disabled={processing === ev.id} onClick={() => handleAction('partner-events', ev.id, 'approve', { copy_to_events: true })}>
                                Approve & Add to Events
                              </Button>
                              <Button size="sm" variant="ghost" disabled={processing === ev.id} onClick={() => handleAction('partner-events', ev.id, 'approve')}>
                                Approve Only
                              </Button>
                              <Button size="sm" variant="ghost" disabled={processing === ev.id} onClick={() => {
                                if (showNoteFor === ev.id) { handleAction('partner-events', ev.id, 'reject') } else { toggleNote(ev.id) }
                              }}>Reject</Button>
                              <button onClick={() => toggleNote(ev.id)} className="text-xs text-gray-400 hover:text-gray-600 font-body ml-auto">
                                {showNoteFor === ev.id ? 'Hide note' : 'Add note'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {reviewedEvents.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 font-body">Reviewed</h3>
                      <div className="bg-white rounded-lg border border-green/10 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-green/10">
                              <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Event</th>
                              <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Partner</th>
                              <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Date</th>
                              <th className="text-center px-4 py-2 text-xs text-gray-400 font-body">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reviewedEvents.map((ev) => (
                              <tr key={ev.id} className="border-b border-green/5 last:border-0">
                                <td className="px-4 py-2 text-gray-800 font-body">{ev.title}</td>
                                <td className="px-4 py-2 text-gray-500 font-body">{ev.partner?.org_name || ev.partner?.email || '-'}</td>
                                <td className="px-4 py-2 text-gray-500 font-body text-xs">{ev.date_display}</td>
                                <td className="px-4 py-2 text-center">
                                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                                    ev.status === 'active' ? 'bg-green-muted text-green' : ev.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                                  }`}>{ev.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div>
              {pendingContent.length === 0 && reviewedContent.length === 0 ? (
                <div className="bg-white rounded-[8px] border border-gray-200 p-12 text-center">
                  <p className="text-gray-500 font-body">No partner content to review.</p>
                </div>
              ) : (
                <>
                  {pendingContent.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 font-body">Submitted</h3>
                      <div className="space-y-3">
                        {pendingContent.map((c) => (
                          <div key={c.id} className="bg-white rounded-lg border border-green/10 p-5">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-body font-medium text-gray-900">{c.title}</p>
                                <p className="text-xs text-gray-500 font-body mt-1">
                                  {c.type} by {c.partner?.org_name || c.partner?.email || 'Unknown'} on {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <span className="inline-block px-2 py-0.5 text-xs rounded-full font-medium bg-gold/20 text-gold">submitted</span>
                            </div>
                            {c.body && (
                              <div className="mt-3 bg-pearl rounded p-3">
                                <p className="text-sm text-gray-700 font-body whitespace-pre-wrap">{c.body.length > 500 ? `${c.body.slice(0, 500)}...` : c.body}</p>
                              </div>
                            )}
                            {Array.isArray(c.images) && c.images.length > 0 && (
                              <p className="text-xs text-gray-400 font-body mt-2">{c.images.length} image(s) attached</p>
                            )}
                            {showNoteFor === c.id && (
                              <div className="mt-3">
                                <input
                                  value={actionNote}
                                  onChange={(e) => setActionNote(e.target.value)}
                                  placeholder="Admin note (optional)"
                                  className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                                />
                              </div>
                            )}
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" disabled={processing === c.id} onClick={() => handleAction('partner-content', c.id, 'approve')}>Approve</Button>
                              <Button size="sm" variant="secondary" disabled={processing === c.id} onClick={() => handleAction('partner-content', c.id, 'publish')}>Publish</Button>
                              <Button size="sm" variant="ghost" disabled={processing === c.id} onClick={() => {
                                if (showNoteFor === c.id) { handleAction('partner-content', c.id, 'reject') } else { toggleNote(c.id) }
                              }}>Reject</Button>
                              <button onClick={() => toggleNote(c.id)} className="text-xs text-gray-400 hover:text-gray-600 font-body ml-auto">
                                {showNoteFor === c.id ? 'Hide note' : 'Add note'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {reviewedContent.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 font-body">Reviewed</h3>
                      <div className="bg-white rounded-lg border border-green/10 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-green/10">
                              <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Title</th>
                              <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Partner</th>
                              <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Type</th>
                              <th className="text-center px-4 py-2 text-xs text-gray-400 font-body">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reviewedContent.map((c) => (
                              <tr key={c.id} className="border-b border-green/5 last:border-0">
                                <td className="px-4 py-2 text-gray-800 font-body">{c.title}</td>
                                <td className="px-4 py-2 text-gray-500 font-body">{c.partner?.org_name || c.partner?.email || '-'}</td>
                                <td className="px-4 py-2 text-gray-500 font-body">{c.type}</td>
                                <td className="px-4 py-2 text-center">
                                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                                    c.status === 'published' ? 'bg-green-muted text-green'
                                      : c.status === 'approved' ? 'bg-blue-50 text-blue-600'
                                      : c.status === 'rejected' ? 'bg-red-50 text-red-600'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>{c.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
