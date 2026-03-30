'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

// ── Types ──────────────────────────────────────────────────────

interface ClientAccount {
  id: string
  name: string
  email: string
}

interface Project {
  id: string
  client_id: string | null
  client: ClientAccount | null
  type: string
  title: string
  property_address: string | null
  property_city: string | null
  property_country: string | null
  status: string
  budget: number | null
  actual_spend: number | null
  currency: string
  monthly_retainer: number | null
  admin_fee: number | null
  start_date: string | null
  target_date: string | null
  completed_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ── Constants ──────────────────────────────────────────────────

const PROJECT_TYPES = [
  'renovation', 'rental_management', 'property_search', 'acquisition',
  'appraisal', 'tenant_management', 'upgrade', 'other',
]

const TYPE_LABELS: Record<string, string> = {
  renovation: 'Renovation',
  rental_management: 'Rental Management',
  property_search: 'Property Search',
  acquisition: 'Acquisition',
  appraisal: 'Appraisal',
  tenant_management: 'Tenant Management',
  upgrade: 'Upgrade',
  other: 'Other',
}

const TYPE_COLORS: Record<string, string> = {
  renovation: 'bg-amber-50 text-amber-700',
  rental_management: 'bg-blue-50 text-blue-700',
  property_search: 'bg-green-muted text-green',
  acquisition: 'bg-purple-50 text-purple-700',
  appraisal: 'bg-teal-50 text-teal-700',
  tenant_management: 'bg-indigo-50 text-indigo-700',
  upgrade: 'bg-rose-50 text-rose-700',
  other: 'bg-gray-100 text-gray-600',
}

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-gold/20 text-gold',
  active: 'bg-green-muted text-green',
  on_hold: 'bg-gray-100 text-gray-600',
  completed: 'bg-blue-50 text-blue-600',
  cancelled: 'bg-red-50 text-red-600',
}

const STATUSES = ['all', 'planning', 'active', 'on_hold', 'completed']

// ── Component ──────────────────────────────────────────────────

export default function AdminProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<ClientAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  // Create form state
  const [newProject, setNewProject] = useState({
    client_id: '',
    type: 'renovation',
    title: '',
    property_address: '',
    property_city: '',
    property_country: 'France',
    budget: '',
    currency: 'EUR',
    start_date: '',
    target_date: '',
    monthly_retainer: '',
    admin_fee: '',
    notes: '',
  })

  const fetchProjects = useCallback(async () => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (clientFilter) params.set('client_id', clientFilter)
    if (search) params.set('search', search)

    const res = await fetch(`/api/admin/projects?${params}`)
    if (res.ok) {
      const data = await res.json()
      setProjects(data)
    }
    setLoading(false)
  }, [statusFilter, typeFilter, clientFilter, search])

  const fetchClients = useCallback(async () => {
    const res = await fetch('/api/admin/clients')
    if (res.ok) {
      const data = await res.json()
      setClients(Array.isArray(data) ? data : data.clients || [])
    }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])
  useEffect(() => { fetchClients() }, [fetchClients])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newProject.title.trim() || !newProject.type) return
    setCreating(true)
    setError('')

    const payload = {
      client_id: newProject.client_id || null,
      type: newProject.type,
      title: newProject.title.trim(),
      property_address: newProject.property_address.trim() || null,
      property_city: newProject.property_city.trim() || null,
      property_country: newProject.property_country.trim() || null,
      budget: newProject.budget ? parseFloat(newProject.budget) : null,
      currency: newProject.currency,
      start_date: newProject.start_date || null,
      target_date: newProject.target_date || null,
      monthly_retainer: newProject.monthly_retainer ? parseFloat(newProject.monthly_retainer) : null,
      admin_fee: newProject.admin_fee ? parseFloat(newProject.admin_fee) : null,
      notes: newProject.notes.trim() || null,
    }

    const res = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const created = await res.json()
      setShowCreate(false)
      setNewProject({
        client_id: '', type: 'renovation', title: '', property_address: '',
        property_city: '', property_country: 'France', budget: '', currency: 'EUR',
        start_date: '', target_date: '', monthly_retainer: '', admin_fee: '', notes: '',
      })
      router.push(`/admin/projects/${created.id}`)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create project')
    }
    setCreating(false)
  }

  function formatCurrency(amount: number, currency: string = 'EUR') {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount)
  }

  const showRetainerFields = newProject.type === 'rental_management' || newProject.type === 'tenant_management'
  const showAdminFeeField = newProject.type === 'rental_management'

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-green">Projects</h1>
        <Button onClick={() => setShowCreate(true)}>Create Project</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status filter */}
        <div className="flex rounded-[4px] border border-green/20 overflow-hidden">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-body font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-green text-white'
                  : 'bg-white text-gray-500 hover:bg-green-muted hover:text-green'
              }`}
            >
              {s === 'all' ? 'All' : s === 'on_hold' ? 'On Hold' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 border border-green/20 rounded-[4px] text-xs font-body text-gray-700 focus:outline-none focus:ring-1 focus:ring-green"
        >
          <option value="all">All types</option>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>

        {/* Client filter */}
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="px-3 py-1.5 border border-green/20 rounded-[4px] text-xs font-body text-gray-700 focus:outline-none focus:ring-1 focus:ring-green"
        >
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name || c.email}</option>
          ))}
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search title or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 border border-green/20 rounded-[4px] text-xs font-body text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-green w-full sm:w-56"
        />
      </div>

      {/* Project list */}
      {loading ? (
        <p className="text-gray-500 font-body text-sm">Loading...</p>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg border border-green/10 p-12 text-center">
          <p className="text-gray-500 font-body text-sm">No projects found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-green/10 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-green/10 bg-pearl">
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-body font-medium">Client</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-body font-medium">Title</th>
                <th className="text-center px-4 py-3 text-xs text-gray-400 font-body font-medium">Type</th>
                <th className="text-center px-4 py-3 text-xs text-gray-400 font-body font-medium">Status</th>
                <th className="text-right px-4 py-3 text-xs text-gray-400 font-body font-medium">Budget</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-body font-medium">Location</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-body font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/admin/projects/${p.id}`)}
                  className="border-b border-green/5 last:border-0 hover:bg-pearl/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-body font-medium text-gray-800">
                    {p.client?.name || p.client?.email || '-'}
                  </td>
                  <td className="px-4 py-3 font-body text-gray-800">{p.title}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${TYPE_COLORS[p.type] || TYPE_COLORS.other}`}>
                      {TYPE_LABELS[p.type] || p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status === 'on_hold' ? 'On Hold' : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-body text-gray-600">
                    {p.budget ? formatCurrency(p.budget, p.currency) : '-'}
                  </td>
                  <td className="px-4 py-3 font-body text-gray-500 text-xs">
                    {[p.property_city, p.property_country].filter(Boolean).join(', ') || '-'}
                  </td>
                  <td className="px-4 py-3 font-body text-gray-400 text-xs">
                    {new Date(p.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold text-green">Create Project</h2>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Client */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Client</label>
                  <select
                    value={newProject.client_id}
                    onChange={(e) => setNewProject({ ...newProject, client_id: e.target.value })}
                    className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                  >
                    <option value="">No client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name || c.email}</option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Project Type</label>
                  <select
                    value={newProject.type}
                    onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                    className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Title</label>
                  <input
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="e.g. Villa Renovation, Rental Setup"
                    className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                  />
                </div>

                {/* Property address */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Property Address</label>
                  <input
                    value={newProject.property_address}
                    onChange={(e) => setNewProject({ ...newProject, property_address: e.target.value })}
                    placeholder="Street address"
                    className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-body">City</label>
                  <input
                    value={newProject.property_city}
                    onChange={(e) => setNewProject({ ...newProject, property_city: e.target.value })}
                    className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Country</label>
                  <input
                    value={newProject.property_country}
                    onChange={(e) => setNewProject({ ...newProject, property_country: e.target.value })}
                    className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Budget</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Currency</label>
                  <select
                    value={newProject.currency}
                    onChange={(e) => setNewProject({ ...newProject, currency: e.target.value })}
                    className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                  >
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="USD">USD</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>

                {/* Start date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Start Date</label>
                  <input
                    type="date"
                    value={newProject.start_date}
                    onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                    className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                  />
                </div>

                {/* Target date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Target Date</label>
                  <input
                    type="date"
                    value={newProject.target_date}
                    onChange={(e) => setNewProject({ ...newProject, target_date: e.target.value })}
                    className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                  />
                </div>

                {/* Monthly retainer */}
                {showRetainerFields && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Monthly Retainer</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProject.monthly_retainer}
                      onChange={(e) => setNewProject({ ...newProject, monthly_retainer: e.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    />
                  </div>
                )}

                {/* Admin fee */}
                {showAdminFeeField && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Admin Fee (1x monthly rent)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProject.admin_fee}
                      onChange={(e) => setNewProject({ ...newProject, admin_fee: e.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Notes</label>
                  <textarea
                    rows={3}
                    value={newProject.notes}
                    onChange={(e) => setNewProject({ ...newProject, notes: e.target.value })}
                    placeholder="Initial notes..."
                    className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600 font-body">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" disabled={creating || !newProject.title.trim()}>
                  {creating ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
