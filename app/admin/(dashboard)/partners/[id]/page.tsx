'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

interface PartnerFiche {
  id: string
  slug: string
  name: string
  status: string
}

interface PartnerOffer {
  id: string
  title: string
  discount_type: string
  discount_value: string | null
  valid_from: string | null
  valid_to: string | null
  status: string
  created_at: string
}

interface PartnerEvent {
  id: string
  title: string
  category: string
  date_display: string
  status: string
  created_at: string
}

interface PartnerContentItem {
  id: string
  type: string
  title: string
  status: string
  created_at: string
}

interface FicheEdit {
  id: string
  changes: Record<string, unknown>
  status: string
  submitted_at: string
  fiches?: { slug: string; name: string }
}

interface ReferralStats {
  total_visits: number
  total_enquiries: number
  total_conversions: number
  total_revenue: number
}

interface PartnerDetail {
  id: string
  name: string | null
  email: string
  org_ids: string[]
  status: string
  last_login: string | null
  created_at: string
  fiches: PartnerFiche[]
  offers: PartnerOffer[]
  events: PartnerEvent[]
  referral_stats: ReferralStats
  content: PartnerContentItem[]
  fiche_edits: FicheEdit[]
}

export default function PartnerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [partner, setPartner] = useState<PartnerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editOrgIds, setEditOrgIds] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchPartner = useCallback(async () => {
    const res = await fetch(`/api/admin/partners/${id}`)
    if (res.ok) {
      const data = await res.json()
      setPartner(data)
      setEditName(data.name || '')
      setEditEmail(data.email)
      setEditOrgIds((data.org_ids || []).join(', '))
    }
    setLoading(false)
  }, [id])

  useEffect(() => { fetchPartner() }, [fetchPartner])

  async function sendPortalLink() {
    setSending(true)
    const res = await fetch(`/api/admin/partners/${id}/send-link`, { method: 'POST' })
    if (res.ok) {
      setLinkSent(true)
      setTimeout(() => setLinkSent(false), 5000)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to send link')
      setTimeout(() => setError(''), 5000)
    }
    setSending(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')

    const orgIds = editOrgIds.trim()
      ? editOrgIds.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    const res = await fetch(`/api/admin/partners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim(), email: editEmail.trim(), org_ids: orgIds }),
    })

    if (res.ok) {
      setEditing(false)
      fetchPartner()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to update partner')
    }
    setSaving(false)
  }

  async function toggleStatus() {
    if (!partner) return
    const newStatus = partner.status === 'active' ? 'suspended' : 'active'
    if (newStatus === 'suspended' && !confirm('Suspend this partner? They will lose portal access.')) return

    const res = await fetch(`/api/admin/partners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    if (res.ok) fetchPartner()
  }

  if (loading) return <div className="p-8"><p className="text-gray-500 font-body">Loading...</p></div>
  if (!partner) return <div className="p-8"><p className="text-gray-500 font-body">Partner not found.</p></div>

  return (
    <div className="p-8">
      <button onClick={() => router.push('/admin/partners')} className="text-sm text-gray-500 hover:text-green font-body mb-6 block">
        {'\u2190'} Back to Partners
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-green">{partner.name || partner.email}</h1>
          <p className="text-sm text-gray-500 font-body mt-1">{partner.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
              partner.status === 'active' ? 'bg-green-muted text-green' : 'bg-red-50 text-red-600'
            }`}>
              {partner.status}
            </span>
            <span className="text-xs text-gray-400 font-body">
              Created {new Date(partner.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="text-xs text-gray-400 font-body">
              Last login: {partner.last_login ? new Date(partner.last_login).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Never'}
            </span>
          </div>
          {partner.org_ids.length > 0 && (
            <p className="text-xs text-gray-400 font-body mt-1">
              Org IDs: {partner.org_ids.join(', ')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={sendPortalLink} disabled={sending || partner.status === 'suspended'} variant={linkSent ? 'ghost' : 'primary'}>
            {sending ? 'Sending...' : linkSent ? 'Link sent' : 'Send portal link'}
          </Button>
          <Button variant="ghost" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-4 font-body">{error}</p>}

      {/* Edit Form */}
      {editing && (
        <div className="bg-white border border-green/10 rounded-lg p-6 mb-6">
          <h2 className="font-heading text-lg font-semibold text-green mb-4">Edit Partner</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 font-body mb-1">Org IDs (comma-separated)</label>
              <input
                value={editOrgIds}
                onChange={(e) => setEditOrgIds(e.target.value)}
                className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <button
              onClick={toggleStatus}
              className={`px-4 py-2 text-sm font-body rounded-[4px] ${
                partner.status === 'active'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-green hover:bg-green-muted'
              }`}
            >
              {partner.status === 'active' ? 'Suspend Partner' : 'Activate Partner'}
            </button>
          </div>
        </div>
      )}

      {/* Linked Fiches */}
      <div className="mb-8">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">Linked Fiches</h2>
        {partner.fiches.length === 0 ? (
          <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
            <p className="text-gray-500 font-body text-sm">No fiches linked to this partner yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-green/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green/10">
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Name</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Slug</th>
                  <th className="text-center px-4 py-2 text-xs text-gray-400 font-body">Status</th>
                </tr>
              </thead>
              <tbody>
                {partner.fiches.map((f) => (
                  <tr key={f.id} className="border-b border-green/5 last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/fiches?edit=${f.id}`)}>
                    <td className="px-4 py-2 text-gray-800 font-body font-medium">{f.name}</td>
                    <td className="px-4 py-2 text-gray-500 font-body">{f.slug}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                        f.status === 'live' ? 'bg-green-muted text-green' : 'bg-gray-100 text-gray-600'
                      }`}>{f.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Offers */}
      <div className="mb-8">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">Offers</h2>
        {partner.offers.length === 0 ? (
          <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
            <p className="text-gray-500 font-body text-sm">No offers submitted.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-green/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green/10">
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Title</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Type</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Valid</th>
                  <th className="text-center px-4 py-2 text-xs text-gray-400 font-body">Status</th>
                </tr>
              </thead>
              <tbody>
                {partner.offers.map((o) => (
                  <tr key={o.id} className="border-b border-green/5 last:border-0">
                    <td className="px-4 py-2 text-gray-800 font-body font-medium">{o.title}</td>
                    <td className="px-4 py-2 text-gray-500 font-body">{o.discount_type}{o.discount_value ? ` (${o.discount_value})` : ''}</td>
                    <td className="px-4 py-2 text-gray-500 font-body text-xs">
                      {o.valid_from && o.valid_to ? `${o.valid_from} to ${o.valid_to}` : o.valid_from || o.valid_to || 'Open'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                        o.status === 'active' ? 'bg-green-muted text-green'
                          : o.status === 'pending' ? 'bg-gold/20 text-gold'
                          : o.status === 'rejected' ? 'bg-red-50 text-red-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Events */}
      <div className="mb-8">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">Events</h2>
        {partner.events.length === 0 ? (
          <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
            <p className="text-gray-500 font-body text-sm">No events submitted.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-green/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green/10">
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Title</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Category</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Date</th>
                  <th className="text-center px-4 py-2 text-xs text-gray-400 font-body">Status</th>
                </tr>
              </thead>
              <tbody>
                {partner.events.map((ev) => (
                  <tr key={ev.id} className="border-b border-green/5 last:border-0">
                    <td className="px-4 py-2 text-gray-800 font-body font-medium">{ev.title}</td>
                    <td className="px-4 py-2 text-gray-500 font-body">{ev.category}</td>
                    <td className="px-4 py-2 text-gray-500 font-body text-xs">{ev.date_display}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                        ev.status === 'active' ? 'bg-green-muted text-green'
                          : ev.status === 'pending' ? 'bg-gold/20 text-gold'
                          : ev.status === 'rejected' ? 'bg-red-50 text-red-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>{ev.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Referral Summary */}
      <div className="mb-8">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">Referral Summary</h2>
        <div className="bg-white rounded-lg border border-green/10 p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 font-body">Visits</p>
              <p className="font-heading text-xl font-semibold text-green">{partner.referral_stats.total_visits}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-body">Enquiries</p>
              <p className="font-heading text-xl font-semibold text-green">{partner.referral_stats.total_enquiries}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-body">Conversions</p>
              <p className="font-heading text-xl font-semibold text-green">{partner.referral_stats.total_conversions}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-body">Revenue attributed</p>
              <p className="font-heading text-xl font-semibold text-gold">
                {partner.referral_stats.total_revenue > 0 ? `EUR ${partner.referral_stats.total_revenue.toLocaleString()}` : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Submissions */}
      <div className="mb-8">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">Content Submissions</h2>
        {partner.content.length === 0 ? (
          <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
            <p className="text-gray-500 font-body text-sm">No content submitted.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-green/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green/10">
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Title</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Type</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Date</th>
                  <th className="text-center px-4 py-2 text-xs text-gray-400 font-body">Status</th>
                </tr>
              </thead>
              <tbody>
                {partner.content.map((c) => (
                  <tr key={c.id} className="border-b border-green/5 last:border-0">
                    <td className="px-4 py-2 text-gray-800 font-body font-medium">{c.title}</td>
                    <td className="px-4 py-2 text-gray-500 font-body">{c.type}</td>
                    <td className="px-4 py-2 text-gray-500 font-body text-xs">
                      {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                        c.status === 'published' ? 'bg-green-muted text-green'
                          : c.status === 'approved' ? 'bg-blue-50 text-blue-600'
                          : c.status === 'submitted' ? 'bg-gold/20 text-gold'
                          : c.status === 'rejected' ? 'bg-red-50 text-red-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fiche Edit Requests */}
      {partner.fiche_edits.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">Fiche Edit Requests</h2>
          <div className="bg-white rounded-lg border border-green/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green/10">
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Fiche</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Fields changed</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Submitted</th>
                  <th className="text-center px-4 py-2 text-xs text-gray-400 font-body">Status</th>
                </tr>
              </thead>
              <tbody>
                {partner.fiche_edits.map((fe) => (
                  <tr key={fe.id} className="border-b border-green/5 last:border-0">
                    <td className="px-4 py-2 text-gray-800 font-body font-medium">{fe.fiches?.name || fe.fiches?.slug || '-'}</td>
                    <td className="px-4 py-2 text-gray-500 font-body text-xs">{Object.keys(fe.changes || {}).join(', ')}</td>
                    <td className="px-4 py-2 text-gray-500 font-body text-xs">
                      {new Date(fe.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                        fe.status === 'approved' ? 'bg-green-muted text-green'
                          : fe.status === 'pending' ? 'bg-gold/20 text-gold'
                          : 'bg-red-50 text-red-600'
                      }`}>{fe.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
