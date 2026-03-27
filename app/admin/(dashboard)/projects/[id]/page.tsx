'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

// ── Types ──────────────────────────────────────────────────────

interface ClientAccount {
  id: string
  name: string
  email: string
}

interface Milestone {
  id: string
  project_id: string
  title: string
  description: string | null
  status: string
  due_date: string | null
  completed_date: string | null
  sort_order: number
  created_at: string
}

interface Document {
  id: string
  project_id: string
  title: string
  file_url: string
  file_type: string | null
  uploaded_by: string | null
  uploaded_by_type: string | null
  version: number
  notes: string | null
  created_at: string
}

interface Financial {
  id: string
  project_id: string
  type: string
  description: string
  amount: number
  currency: string
  date: string | null
  document_url: string | null
  status: string | null
  notes: string | null
  created_at: string
}

interface PartnerLink {
  id: string
  project_id: string
  partner_id: string
  partner: { id: string; org_name: string | null; email: string } | null
  role: string
  status: string | null
  notes: string | null
  created_at: string
}

interface Update {
  id: string
  project_id: string
  author_type: string
  author_name: string | null
  message: string
  attachments: unknown[]
  created_at: string
}

interface ProjectDetail {
  id: string
  client_id: string | null
  client: ClientAccount | null
  type: string
  title: string
  property_address: string | null
  property_city: string | null
  property_country: string | null
  property_details: Record<string, unknown>
  property_images: string[]
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
  milestones: Milestone[]
  documents: Document[]
  financials: Financial[]
  partners: PartnerLink[]
  updates: Update[]
  progress: number
}

// ── Constants ──────────────────────────────────────────────────

type TabKey = 'overview' | 'milestones' | 'documents' | 'financials' | 'partners' | 'activity'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'documents', label: 'Documents' },
  { key: 'financials', label: 'Financials' },
  { key: 'partners', label: 'Partners' },
  { key: 'activity', label: 'Activity' },
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

const MILESTONE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-gold/20 text-gold',
  completed: 'bg-green-muted text-green',
  skipped: 'bg-gray-100 text-gray-400',
}

const FINANCIAL_TYPES = [
  'invoice', 'quote', 'payment', 'income', 'retainer', 'admin_fee', 'expense',
]

const FINANCIAL_TYPE_LABELS: Record<string, string> = {
  invoice: 'Invoice',
  quote: 'Quote',
  payment: 'Payment',
  income: 'Income',
  retainer: 'Retainer',
  admin_fee: 'Admin Fee',
  expense: 'Expense',
}

const MILESTONE_TEMPLATES: Record<string, string[]> = {
  renovation: ['Survey', 'Design', 'Quotes', 'Permits', 'Works', 'Inspection', 'Handover'],
  rental_management: ['Listing', 'Viewings', 'Application Review', 'Contract', 'Move-in'],
  property_search: ['Brief', 'Shortlist', 'Viewings', 'Offer', 'Due Diligence', 'Completion'],
  acquisition: ['Sourcing', 'Due Diligence', 'Negotiation', 'Heads of Terms', 'Legal', 'Completion'],
}

const PROJECT_TYPES = [
  'renovation', 'rental_management', 'property_search', 'acquisition',
  'appraisal', 'tenant_management', 'upgrade', 'other',
]

// ── Helpers ────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string = 'EUR') {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount)
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function relativeTime(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return formatDateShort(d)
}

// ── Component ──────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Overview edit state
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, string>>({})

  // Milestone state
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('')
  const [newMilestoneDue, setNewMilestoneDue] = useState('')
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('')

  // Document state
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [newDocTitle, setNewDocTitle] = useState('')
  const [newDocUrl, setNewDocUrl] = useState('')
  const [newDocNotes, setNewDocNotes] = useState('')

  // Financial state
  const [showAddFinancial, setShowAddFinancial] = useState(false)
  const [newFinancial, setNewFinancial] = useState({
    type: 'expense', description: '', amount: '', currency: 'EUR',
    date: new Date().toISOString().split('T')[0], notes: '',
  })

  // Partner state
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [partnerSearch, setPartnerSearch] = useState('')
  const [partnerResults, setPartnerResults] = useState<Array<{ id: string; org_name: string | null; email: string }>>([])
  const [selectedPartnerId, setSelectedPartnerId] = useState('')
  const [partnerRole, setPartnerRole] = useState('')

  // Activity state
  const [newMessage, setNewMessage] = useState('')
  const [activityFilter, setActivityFilter] = useState('')

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/admin/projects/${id}`)
    if (res.ok) {
      const data = await res.json()
      setProject(data)
    }
    setLoading(false)
  }, [id])

  useEffect(() => { fetchProject() }, [fetchProject])

  // ── Overview actions ─────────────────────────────────────────

  function startEditing() {
    if (!project) return
    setEditForm({
      title: project.title,
      type: project.type,
      status: project.status,
      property_address: project.property_address || '',
      property_city: project.property_city || '',
      property_country: project.property_country || '',
      budget: project.budget?.toString() || '',
      currency: project.currency || 'EUR',
      monthly_retainer: project.monthly_retainer?.toString() || '',
      admin_fee: project.admin_fee?.toString() || '',
      start_date: project.start_date || '',
      target_date: project.target_date || '',
      notes: project.notes || '',
    })
    setEditing(true)
  }

  async function saveOverview() {
    setSaving(true)
    setError('')

    const payload: Record<string, unknown> = {
      title: editForm.title,
      type: editForm.type,
      status: editForm.status,
      property_address: editForm.property_address || null,
      property_city: editForm.property_city || null,
      property_country: editForm.property_country || null,
      budget: editForm.budget ? parseFloat(editForm.budget) : null,
      currency: editForm.currency,
      monthly_retainer: editForm.monthly_retainer ? parseFloat(editForm.monthly_retainer) : null,
      admin_fee: editForm.admin_fee ? parseFloat(editForm.admin_fee) : null,
      start_date: editForm.start_date || null,
      target_date: editForm.target_date || null,
      notes: editForm.notes || null,
    }

    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setEditing(false)
      fetchProject()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save')
    }
    setSaving(false)
  }

  async function changeStatus(newStatus: string) {
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) fetchProject()
  }

  async function deleteProject() {
    if (!confirm('Delete this project? This cannot be undone.')) return
    const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/admin/projects')
  }

  // ── Milestone actions ────────────────────────────────────────

  async function addMilestone(e: React.FormEvent) {
    e.preventDefault()
    if (!newMilestoneTitle.trim()) return
    setSaving(true)

    const maxOrder = project?.milestones.reduce((max, m) => Math.max(max, m.sort_order), -1) ?? -1

    const res = await fetch(`/api/admin/projects/${id}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newMilestoneTitle.trim(),
        description: newMilestoneDesc.trim() || null,
        due_date: newMilestoneDue || null,
        sort_order: maxOrder + 1,
      }),
    })

    if (res.ok) {
      setShowAddMilestone(false)
      setNewMilestoneTitle('')
      setNewMilestoneDue('')
      setNewMilestoneDesc('')
      fetchProject()
    }
    setSaving(false)
  }

  async function updateMilestoneStatus(mid: string, status: string) {
    await fetch(`/api/admin/projects/${id}/milestones/${mid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchProject()
  }

  async function deleteMilestone(mid: string) {
    if (!confirm('Delete this milestone?')) return
    await fetch(`/api/admin/projects/${id}/milestones/${mid}`, { method: 'DELETE' })
    fetchProject()
  }

  async function applyTemplate() {
    if (!project) return
    const template = MILESTONE_TEMPLATES[project.type]
    if (!template) return
    if (!confirm(`Add ${template.length} milestones from the ${TYPE_LABELS[project.type]} template?`)) return

    const milestones = template.map((title, i) => ({
      title,
      sort_order: (project.milestones.length) + i,
    }))

    await fetch(`/api/admin/projects/${id}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(milestones),
    })
    fetchProject()
  }

  async function moveMilestone(mid: string, direction: 'up' | 'down') {
    if (!project) return
    const ms = [...project.milestones]
    const idx = ms.findIndex(m => m.id === mid)
    if (idx < 0) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= ms.length) return

    // Swap sort orders
    await Promise.all([
      fetch(`/api/admin/projects/${id}/milestones/${ms[idx].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: ms[swapIdx].sort_order }),
      }),
      fetch(`/api/admin/projects/${id}/milestones/${ms[swapIdx].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: ms[idx].sort_order }),
      }),
    ])
    fetchProject()
  }

  // ── Document actions ─────────────────────────────────────────

  async function addDocument(e: React.FormEvent) {
    e.preventDefault()
    if (!newDocTitle.trim() || !newDocUrl.trim()) return
    setSaving(true)

    const res = await fetch(`/api/admin/projects/${id}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newDocTitle.trim(),
        file_url: newDocUrl.trim(),
        notes: newDocNotes.trim() || null,
      }),
    })

    if (res.ok) {
      setShowAddDoc(false)
      setNewDocTitle('')
      setNewDocUrl('')
      setNewDocNotes('')
      fetchProject()
    }
    setSaving(false)
  }

  // ── Financial actions ────────────────────────────────────────

  async function addFinancial(e: React.FormEvent) {
    e.preventDefault()
    if (!newFinancial.description.trim() || !newFinancial.amount) return
    setSaving(true)

    const res = await fetch(`/api/admin/projects/${id}/financials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: newFinancial.type,
        description: newFinancial.description.trim(),
        amount: parseFloat(newFinancial.amount),
        currency: newFinancial.currency,
        date: newFinancial.date || null,
        notes: newFinancial.notes.trim() || null,
      }),
    })

    if (res.ok) {
      setShowAddFinancial(false)
      setNewFinancial({
        type: 'expense', description: '', amount: '', currency: 'EUR',
        date: new Date().toISOString().split('T')[0], notes: '',
      })
      fetchProject()
    }
    setSaving(false)
  }

  async function deleteFinancial(fid: string) {
    if (!confirm('Delete this financial entry?')) return
    await fetch(`/api/admin/projects/${id}/financials/${fid}`, { method: 'DELETE' })
    fetchProject()
  }

  // ── Partner actions ──────────────────────────────────────────

  async function searchPartners() {
    if (!partnerSearch.trim()) return
    const res = await fetch(`/api/admin/partners?search=${encodeURIComponent(partnerSearch)}`)
    if (res.ok) {
      const data = await res.json()
      const list = Array.isArray(data) ? data : data.partners || []
      setPartnerResults(list.map((p: Record<string, unknown>) => ({
        id: p.id as string,
        org_name: p.org_name as string | null,
        email: p.email as string,
      })))
    }
  }

  async function addPartner(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPartnerId || !partnerRole.trim()) return
    setSaving(true)

    const res = await fetch(`/api/admin/projects/${id}/partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partner_id: selectedPartnerId,
        role: partnerRole.trim(),
      }),
    })

    if (res.ok) {
      setShowAddPartner(false)
      setPartnerSearch('')
      setPartnerResults([])
      setSelectedPartnerId('')
      setPartnerRole('')
      fetchProject()
    }
    setSaving(false)
  }

  async function removePartner(pid: string) {
    if (!confirm('Remove this partner from the project?')) return
    await fetch(`/api/admin/projects/${id}/partners/${pid}`, { method: 'DELETE' })
    fetchProject()
  }

  async function completePartner(pid: string) {
    await fetch(`/api/admin/projects/${id}/partners/${pid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    fetchProject()
  }

  // ── Activity actions ─────────────────────────────────────────

  async function postUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim()) return
    setSaving(true)

    const res = await fetch(`/api/admin/projects/${id}/updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newMessage.trim() }),
    })

    if (res.ok) {
      setNewMessage('')
      fetchProject()
    }
    setSaving(false)
  }

  // ── Render ───────────────────────────────────────────────────

  if (loading) return <div className="p-8"><p className="text-gray-500 font-body">Loading...</p></div>
  if (!project) return <div className="p-8"><p className="text-gray-500 font-body">Project not found.</p></div>

  const filteredUpdates = activityFilter
    ? project.updates.filter(u => u.author_type === activityFilter)
    : project.updates

  // Financial summaries
  const expenses = project.financials.filter(f => ['expense', 'invoice', 'payment', 'retainer', 'admin_fee'].includes(f.type))
  const income = project.financials.filter(f => f.type === 'income')
  const totalSpent = expenses.reduce((s, f) => s + Number(f.amount), 0)
  const totalIncome = income.reduce((s, f) => s + Number(f.amount), 0)
  const netPosition = totalIncome - totalSpent

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back link */}
      <button
        onClick={() => router.push('/admin/projects')}
        className="text-sm text-gray-500 hover:text-green font-body mb-6 block"
      >
        &larr; Back to Projects
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-green">{project.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${TYPE_COLORS[project.type] || TYPE_COLORS.other}`}>
              {TYPE_LABELS[project.type] || project.type}
            </span>
            <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-600'}`}>
              {project.status === 'on_hold' ? 'On Hold' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
            {project.client && (
              <span className="text-sm text-gray-500 font-body">
                {project.client.name || project.client.email}
              </span>
            )}
          </div>
          {project.property_address && (
            <p className="text-sm text-gray-400 font-body mt-1">{project.property_address}</p>
          )}
          {(project.property_city || project.property_country) && (
            <p className="text-xs text-gray-400 font-body">
              {[project.property_city, project.property_country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Progress indicator */}
          <div className="text-right mr-4">
            <p className="text-xs text-gray-400 font-body">Progress</p>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-sm font-heading font-semibold text-green">{project.progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-4 font-body">{error}</p>}

      {/* Tabs */}
      <div className="flex border-b border-green/10 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-body font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-green text-green'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
            {tab.key === 'milestones' && project.milestones.length > 0 && (
              <span className="ml-1.5 text-xs text-gray-400">({project.milestones.length})</span>
            )}
            {tab.key === 'documents' && project.documents.length > 0 && (
              <span className="ml-1.5 text-xs text-gray-400">({project.documents.length})</span>
            )}
            {tab.key === 'financials' && project.financials.length > 0 && (
              <span className="ml-1.5 text-xs text-gray-400">({project.financials.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════════ OVERVIEW TAB ═══════════════════ */}
      {activeTab === 'overview' && (
        <div>
          {!editing ? (
            <div>
              <div className="flex justify-end mb-4 gap-2">
                <Button variant="ghost" onClick={startEditing}>Edit</Button>
                {project.status === 'planning' && (
                  <Button onClick={() => changeStatus('active')}>Start Project</Button>
                )}
                {project.status === 'active' && (
                  <>
                    <Button variant="ghost" onClick={() => changeStatus('on_hold')}>Put on Hold</Button>
                    <Button onClick={() => changeStatus('completed')}>Complete</Button>
                  </>
                )}
                {project.status === 'on_hold' && (
                  <Button onClick={() => changeStatus('active')}>Resume</Button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project details */}
                <div className="bg-white rounded-lg border border-green/10 p-5">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">Project Details</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 font-body">Type</dt>
                      <dd className="text-sm text-gray-800 font-body font-medium">{TYPE_LABELS[project.type] || project.type}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 font-body">Status</dt>
                      <dd className="text-sm text-gray-800 font-body font-medium">
                        {project.status === 'on_hold' ? 'On Hold' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </dd>
                    </div>
                    {project.client && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 font-body">Client</dt>
                        <dd className="text-sm text-gray-800 font-body font-medium">{project.client.name || project.client.email}</dd>
                      </div>
                    )}
                    {project.budget && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 font-body">Budget</dt>
                        <dd className="text-sm text-gray-800 font-body font-medium">{formatCurrency(project.budget, project.currency)}</dd>
                      </div>
                    )}
                    {project.monthly_retainer && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 font-body">Monthly Retainer</dt>
                        <dd className="text-sm text-gray-800 font-body font-medium">{formatCurrency(project.monthly_retainer, project.currency)}/mo</dd>
                      </div>
                    )}
                    {project.admin_fee && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 font-body">Admin Fee</dt>
                        <dd className="text-sm text-gray-800 font-body font-medium">{formatCurrency(project.admin_fee, project.currency)}</dd>
                      </div>
                    )}
                    {project.start_date && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 font-body">Start Date</dt>
                        <dd className="text-sm text-gray-800 font-body">{formatDateShort(project.start_date)}</dd>
                      </div>
                    )}
                    {project.target_date && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 font-body">Target Date</dt>
                        <dd className="text-sm text-gray-800 font-body">{formatDateShort(project.target_date)}</dd>
                      </div>
                    )}
                    {project.completed_date && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 font-body">Completed</dt>
                        <dd className="text-sm text-gray-800 font-body">{formatDateShort(project.completed_date)}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Property details */}
                <div className="bg-white rounded-lg border border-green/10 p-5">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">Property</h3>
                  <dl className="space-y-3">
                    {project.property_address && (
                      <div>
                        <dt className="text-xs text-gray-400 font-body mb-0.5">Address</dt>
                        <dd className="text-sm text-gray-800 font-body">{project.property_address}</dd>
                      </div>
                    )}
                    {project.property_city && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 font-body">City</dt>
                        <dd className="text-sm text-gray-800 font-body">{project.property_city}</dd>
                      </div>
                    )}
                    {project.property_country && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 font-body">Country</dt>
                        <dd className="text-sm text-gray-800 font-body">{project.property_country}</dd>
                      </div>
                    )}
                    {(!project.property_address && !project.property_city && !project.property_country) && (
                      <p className="text-sm text-gray-400 font-body">No property details set.</p>
                    )}
                  </dl>
                </div>

                {/* Notes */}
                {project.notes && (
                  <div className="bg-white rounded-lg border border-green/10 p-5 lg:col-span-2">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">Notes</h3>
                    <p className="text-sm text-gray-700 font-body whitespace-pre-wrap">{project.notes}</p>
                  </div>
                )}
              </div>

              {/* Danger zone */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={deleteProject}
                  className="text-xs text-red-500 hover:text-red-700 font-body"
                >
                  Delete project
                </button>
              </div>
            </div>
          ) : (
            /* Edit form */
            <div className="bg-white border border-green/10 rounded-lg p-6">
              <h2 className="font-heading text-lg font-semibold text-green mb-4">Edit Project</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 font-body mb-1">Title</label>
                  <input
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Type</label>
                  <select
                    value={editForm.type || ''}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Status</label>
                  <select
                    value={editForm.status || ''}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 font-body mb-1">Property Address</label>
                  <input
                    value={editForm.property_address || ''}
                    onChange={(e) => setEditForm({ ...editForm, property_address: e.target.value })}
                    className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">City</label>
                  <input
                    value={editForm.property_city || ''}
                    onChange={(e) => setEditForm({ ...editForm, property_city: e.target.value })}
                    className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Country</label>
                  <input
                    value={editForm.property_country || ''}
                    onChange={(e) => setEditForm({ ...editForm, property_country: e.target.value })}
                    className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Budget</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.budget || ''}
                    onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                    className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Currency</label>
                  <select
                    value={editForm.currency || 'EUR'}
                    onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                  >
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="USD">USD</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Monthly Retainer</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.monthly_retainer || ''}
                    onChange={(e) => setEditForm({ ...editForm, monthly_retainer: e.target.value })}
                    className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Admin Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.admin_fee || ''}
                    onChange={(e) => setEditForm({ ...editForm, admin_fee: e.target.value })}
                    className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editForm.start_date || ''}
                    onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Target Date</label>
                  <input
                    type="date"
                    value={editForm.target_date || ''}
                    onChange={(e) => setEditForm({ ...editForm, target_date: e.target.value })}
                    className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 font-body mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={saveOverview} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════ MILESTONES TAB ═══════════════════ */}
      {activeTab === 'milestones' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
              Milestones ({project.milestones.filter(m => m.status === 'completed').length}/{project.milestones.length} completed)
            </h2>
            <div className="flex gap-2">
              {MILESTONE_TEMPLATES[project.type] && (
                <Button variant="ghost" size="sm" onClick={applyTemplate}>
                  Apply Template
                </Button>
              )}
              <Button size="sm" onClick={() => setShowAddMilestone(true)}>
                Add Milestone
              </Button>
            </div>
          </div>

          {project.milestones.length === 0 ? (
            <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
              <p className="text-gray-500 font-body text-sm mb-3">No milestones yet.</p>
              {MILESTONE_TEMPLATES[project.type] && (
                <Button variant="ghost" size="sm" onClick={applyTemplate}>
                  Load {TYPE_LABELS[project.type]} Template
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {project.milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className={`bg-white rounded-lg border border-green/10 p-4 flex items-start gap-4 ${m.status === 'completed' ? 'opacity-60' : ''}`}
                >
                  {/* Status indicator */}
                  <button
                    onClick={() => updateMilestoneStatus(
                      m.id,
                      m.status === 'completed' ? 'pending' : m.status === 'pending' ? 'in_progress' : 'completed'
                    )}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      m.status === 'completed'
                        ? 'border-green bg-green text-white'
                        : m.status === 'in_progress'
                        ? 'border-gold bg-gold/20'
                        : 'border-gray-300 hover:border-green'
                    }`}
                  >
                    {m.status === 'completed' && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-body font-medium ${m.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {m.title}
                      </p>
                      <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${MILESTONE_STATUS_COLORS[m.status] || 'bg-gray-100 text-gray-600'}`}>
                        {m.status === 'in_progress' ? 'In Progress' : m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                      </span>
                    </div>
                    {m.description && (
                      <p className="text-xs text-gray-500 font-body mt-0.5">{m.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {m.due_date && (
                        <span className="text-xs text-gray-400 font-body">Due: {formatDateShort(m.due_date)}</span>
                      )}
                      {m.completed_date && (
                        <span className="text-xs text-green font-body">Completed: {formatDateShort(m.completed_date)}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {idx > 0 && (
                      <button onClick={() => moveMilestone(m.id, 'up')} className="p-1 text-gray-400 hover:text-green text-xs" title="Move up">
                        &#9650;
                      </button>
                    )}
                    {idx < project.milestones.length - 1 && (
                      <button onClick={() => moveMilestone(m.id, 'down')} className="p-1 text-gray-400 hover:text-green text-xs" title="Move down">
                        &#9660;
                      </button>
                    )}
                    <button onClick={() => deleteMilestone(m.id)} className="p-1 text-gray-400 hover:text-red-500 text-xs ml-1" title="Delete">
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Milestone Modal */}
          {showAddMilestone && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[8px] w-full max-w-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold text-green">Add Milestone</h2>
                    <button onClick={() => setShowAddMilestone(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                  </div>
                </div>
                <form onSubmit={addMilestone} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Title</label>
                    <input
                      required
                      value={newMilestoneTitle}
                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                      placeholder="e.g. Survey Complete"
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Description</label>
                    <textarea
                      rows={2}
                      value={newMilestoneDesc}
                      onChange={(e) => setNewMilestoneDesc(e.target.value)}
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Due Date</label>
                    <input
                      type="date"
                      value={newMilestoneDue}
                      onChange={(e) => setNewMilestoneDue(e.target.value)}
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" type="button" onClick={() => setShowAddMilestone(false)}>Cancel</Button>
                    <Button type="submit" disabled={saving || !newMilestoneTitle.trim()}>
                      {saving ? 'Adding...' : 'Add Milestone'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════ DOCUMENTS TAB ═══════════════════ */}
      {activeTab === 'documents' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Documents</h2>
            <Button size="sm" onClick={() => setShowAddDoc(true)}>Add Document</Button>
          </div>

          {project.documents.length === 0 ? (
            <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
              <p className="text-gray-500 font-body text-sm">No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-green/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green/10">
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Title</th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Type</th>
                    <th className="text-center px-4 py-2 text-xs text-gray-400 font-body">Version</th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Uploaded</th>
                    <th className="text-right px-4 py-2 text-xs text-gray-400 font-body"></th>
                  </tr>
                </thead>
                <tbody>
                  {project.documents.map((d) => (
                    <tr key={d.id} className="border-b border-green/5 last:border-0">
                      <td className="px-4 py-2 text-gray-800 font-body font-medium">{d.title}</td>
                      <td className="px-4 py-2 text-gray-500 font-body text-xs">{d.file_type || '-'}</td>
                      <td className="px-4 py-2 text-center text-gray-500 font-body text-xs">v{d.version}</td>
                      <td className="px-4 py-2 text-gray-400 font-body text-xs">
                        {formatDateShort(d.created_at)}
                        {d.uploaded_by && <span className="ml-1 text-gray-300">by {d.uploaded_by}</span>}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <a
                          href={d.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green hover:text-green-light font-medium"
                        >
                          Open
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Document Modal */}
          {showAddDoc && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[8px] w-full max-w-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold text-green">Add Document</h2>
                    <button onClick={() => setShowAddDoc(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                  </div>
                </div>
                <form onSubmit={addDocument} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Title</label>
                    <input
                      required
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      placeholder="e.g. Renovation Quote"
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">File URL</label>
                    <input
                      required
                      type="url"
                      value={newDocUrl}
                      onChange={(e) => setNewDocUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Notes</label>
                    <textarea
                      rows={2}
                      value={newDocNotes}
                      onChange={(e) => setNewDocNotes(e.target.value)}
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" type="button" onClick={() => setShowAddDoc(false)}>Cancel</Button>
                    <Button type="submit" disabled={saving || !newDocTitle.trim() || !newDocUrl.trim()}>
                      {saving ? 'Adding...' : 'Add Document'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════ FINANCIALS TAB ═══════════════════ */}
      {activeTab === 'financials' && (
        <div>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-green/10 p-4">
              <p className="text-xs text-gray-400 font-body">Budget</p>
              <p className="font-heading text-xl font-semibold text-green">
                {project.budget ? formatCurrency(project.budget, project.currency) : '-'}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-green/10 p-4">
              <p className="text-xs text-gray-400 font-body">Total Spent</p>
              <p className="font-heading text-xl font-semibold text-red-600">
                {totalSpent > 0 ? formatCurrency(totalSpent, project.currency) : '-'}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-green/10 p-4">
              <p className="text-xs text-gray-400 font-body">Total Income</p>
              <p className="font-heading text-xl font-semibold text-green">
                {totalIncome > 0 ? formatCurrency(totalIncome, project.currency) : '-'}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-green/10 p-4">
              <p className="text-xs text-gray-400 font-body">Net Position</p>
              <p className={`font-heading text-xl font-semibold ${netPosition >= 0 ? 'text-green' : 'text-red-600'}`}>
                {project.financials.length > 0 ? formatCurrency(netPosition, project.currency) : '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Entries</h2>
            <Button size="sm" onClick={() => setShowAddFinancial(true)}>Add Entry</Button>
          </div>

          {project.financials.length === 0 ? (
            <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
              <p className="text-gray-500 font-body text-sm">No financial entries yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-green/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green/10">
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Date</th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Type</th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Description</th>
                    <th className="text-right px-4 py-2 text-xs text-gray-400 font-body">Amount</th>
                    <th className="text-center px-4 py-2 text-xs text-gray-400 font-body">Status</th>
                    <th className="text-right px-4 py-2 text-xs text-gray-400 font-body"></th>
                  </tr>
                </thead>
                <tbody>
                  {project.financials.map((f) => (
                    <tr key={f.id} className="border-b border-green/5 last:border-0">
                      <td className="px-4 py-2 text-gray-500 font-body text-xs">
                        {f.date ? formatDateShort(f.date) : '-'}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                          f.type === 'income' ? 'bg-green-muted text-green'
                            : f.type === 'expense' || f.type === 'invoice' ? 'bg-red-50 text-red-600'
                            : f.type === 'retainer' ? 'bg-blue-50 text-blue-600'
                            : f.type === 'admin_fee' ? 'bg-purple-50 text-purple-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {FINANCIAL_TYPE_LABELS[f.type] || f.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-800 font-body">{f.description}</td>
                      <td className={`px-4 py-2 text-right font-body font-medium ${f.type === 'income' ? 'text-green' : 'text-gray-800'}`}>
                        {f.type === 'income' ? '+' : '-'}{formatCurrency(Number(f.amount), f.currency)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                          f.status === 'paid' || f.status === 'received' ? 'bg-green-muted text-green'
                            : f.status === 'pending' ? 'bg-gold/20 text-gold'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {f.status || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => deleteFinancial(f.id)}
                          className="text-xs text-gray-400 hover:text-red-500"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Financial Modal */}
          {showAddFinancial && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[8px] w-full max-w-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold text-green">Add Financial Entry</h2>
                    <button onClick={() => setShowAddFinancial(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                  </div>
                </div>
                <form onSubmit={addFinancial} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Type</label>
                    <select
                      value={newFinancial.type}
                      onChange={(e) => setNewFinancial({ ...newFinancial, type: e.target.value })}
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    >
                      {FINANCIAL_TYPES.map((t) => (
                        <option key={t} value={t}>{FINANCIAL_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Description</label>
                    <input
                      required
                      value={newFinancial.description}
                      onChange={(e) => setNewFinancial({ ...newFinancial, description: e.target.value })}
                      placeholder="e.g. Plumber invoice"
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Amount</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={newFinancial.amount}
                        onChange={(e) => setNewFinancial({ ...newFinancial, amount: e.target.value })}
                        placeholder="0.00"
                        className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Currency</label>
                      <select
                        value={newFinancial.currency}
                        onChange={(e) => setNewFinancial({ ...newFinancial, currency: e.target.value })}
                        className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                      >
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Date</label>
                    <input
                      type="date"
                      value={newFinancial.date}
                      onChange={(e) => setNewFinancial({ ...newFinancial, date: e.target.value })}
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Notes</label>
                    <textarea
                      rows={2}
                      value={newFinancial.notes}
                      onChange={(e) => setNewFinancial({ ...newFinancial, notes: e.target.value })}
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" type="button" onClick={() => setShowAddFinancial(false)}>Cancel</Button>
                    <Button type="submit" disabled={saving || !newFinancial.description.trim() || !newFinancial.amount}>
                      {saving ? 'Adding...' : 'Add Entry'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════ PARTNERS TAB ═══════════════════ */}
      {activeTab === 'partners' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Linked Partners</h2>
            <Button size="sm" onClick={() => setShowAddPartner(true)}>Link Partner</Button>
          </div>

          {project.partners.length === 0 ? (
            <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
              <p className="text-gray-500 font-body text-sm">No partners linked to this project.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-green/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green/10">
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Partner</th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-body">Role</th>
                    <th className="text-center px-4 py-2 text-xs text-gray-400 font-body">Status</th>
                    <th className="text-right px-4 py-2 text-xs text-gray-400 font-body"></th>
                  </tr>
                </thead>
                <tbody>
                  {project.partners.map((pp) => (
                    <tr key={pp.id} className="border-b border-green/5 last:border-0">
                      <td className="px-4 py-2 text-gray-800 font-body font-medium">
                        {pp.partner?.org_name || pp.partner?.email || '-'}
                      </td>
                      <td className="px-4 py-2 text-gray-600 font-body">{pp.role}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                          pp.status === 'completed' ? 'bg-green-muted text-green'
                            : pp.status === 'active' ? 'bg-blue-50 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {pp.status || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {pp.status === 'active' && (
                            <button
                              onClick={() => completePartner(pp.id)}
                              className="text-xs text-green hover:text-green-light font-medium"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => removePartner(pp.id)}
                            className="text-xs text-gray-400 hover:text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Partner Modal */}
          {showAddPartner && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[8px] w-full max-w-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold text-green">Link Partner</h2>
                    <button onClick={() => setShowAddPartner(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                  </div>
                </div>
                <form onSubmit={addPartner} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Search Partner</label>
                    <div className="flex gap-2">
                      <input
                        value={partnerSearch}
                        onChange={(e) => setPartnerSearch(e.target.value)}
                        placeholder="Organisation name..."
                        className="flex-1 rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                      />
                      <Button type="button" size="sm" onClick={searchPartners}>Search</Button>
                    </div>
                    {partnerResults.length > 0 && (
                      <div className="mt-2 border border-gray-200 rounded-[4px] max-h-40 overflow-y-auto">
                        {partnerResults.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedPartnerId(p.id)
                              setPartnerSearch(p.org_name || p.email)
                              setPartnerResults([])
                            }}
                            className={`w-full text-left px-3 py-2 text-sm font-body hover:bg-pearl transition-colors ${
                              selectedPartnerId === p.id ? 'bg-green-muted text-green' : 'text-gray-700'
                            }`}
                          >
                            {p.org_name || p.email}
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedPartnerId && (
                      <p className="text-xs text-green font-body mt-1">Partner selected</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Role</label>
                    <input
                      required
                      value={partnerRole}
                      onChange={(e) => setPartnerRole(e.target.value)}
                      placeholder="e.g. Plumber, Notaire, Estate Agent"
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" type="button" onClick={() => setShowAddPartner(false)}>Cancel</Button>
                    <Button type="submit" disabled={saving || !selectedPartnerId || !partnerRole.trim()}>
                      {saving ? 'Linking...' : 'Link Partner'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════ ACTIVITY TAB ═══════════════════ */}
      {activeTab === 'activity' && (
        <div>
          {/* Post update */}
          <form onSubmit={postUpdate} className="mb-6">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-2">Post Update</label>
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Add a note or update..."
                className="flex-1 rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
              />
              <Button type="submit" disabled={saving || !newMessage.trim()} className="self-end">
                {saving ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </form>

          {/* Filter */}
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Activity Feed</h2>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="px-2 py-1 border border-green/20 rounded-[4px] text-xs font-body text-gray-700 focus:outline-none focus:ring-1 focus:ring-green"
            >
              <option value="">All</option>
              <option value="admin">Admin</option>
              <option value="system">System</option>
              <option value="client">Client</option>
            </select>
          </div>

          {filteredUpdates.length === 0 ? (
            <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
              <p className="text-gray-500 font-body text-sm">No activity yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUpdates.map((u) => (
                <div key={u.id} className="bg-white rounded-lg border border-green/10 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                        u.author_type === 'admin' ? 'bg-green-muted text-green'
                          : u.author_type === 'system' ? 'bg-gray-100 text-gray-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {u.author_type}
                      </span>
                      {u.author_name && (
                        <span className="text-xs text-gray-500 font-body font-medium">{u.author_name}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-body">{relativeTime(u.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 font-body mt-2 whitespace-pre-wrap">{u.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
