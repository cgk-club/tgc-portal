'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import EventBudgetTracker from '@/components/partner/EventBudgetTracker'
import PipelineTab from '@/components/admin/PipelineTab'

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

interface VisibilitySettings {
  financials: 'hidden' | 'read_only' | 'full_access'
  tasks: 'own_only' | 'all'
  documents: 'own_only' | 'all'
  activity: 'filtered' | 'all'
  guests: 'hidden' | 'view'
  sponsors: 'hidden' | 'view'
  budget: 'hidden' | 'view'
}

const DEFAULT_VISIBILITY: VisibilitySettings = {
  financials: 'hidden',
  tasks: 'own_only',
  documents: 'own_only',
  activity: 'filtered',
  guests: 'hidden',
  sponsors: 'hidden',
  budget: 'hidden',
}

interface PartnerLink {
  id: string
  project_id: string
  partner_id: string
  partner: { id: string; org_name: string | null; email: string } | null
  role: string
  status: string | null
  notes: string | null
  visibility_settings: VisibilitySettings | null
  created_at: string
}

interface ClientVisibilitySettings {
  milestones: 'hidden' | 'view'
  documents: 'hidden' | 'shared_only' | 'all'
  activity: 'hidden' | 'filtered' | 'all'
  financials: 'hidden' | 'own_only'
  guests: 'hidden' | 'first_name_only' | 'view'
  schedule: 'hidden' | 'view'
  budget: 'hidden' | 'view'
  sponsors: 'hidden' | 'view'
  tasks: 'hidden' | 'view'
  partners: 'hidden' | 'view'
}

const DEFAULT_CLIENT_VISIBILITY: ClientVisibilitySettings = {
  milestones: 'view',
  documents: 'shared_only',
  activity: 'filtered',
  financials: 'own_only',
  guests: 'first_name_only',
  schedule: 'view',
  budget: 'hidden',
  sponsors: 'hidden',
  tasks: 'hidden',
  partners: 'hidden',
}

interface ClientLink {
  id: string
  project_id: string
  client_id: string
  client: { id: string; name: string | null; email: string } | null
  role: string
  status: string | null
  notes: string | null
  visibility_settings: ClientVisibilitySettings | null
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

interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  assigned_to: string[]
  assigned_partner_names: string[]
  priority: string
  status: string
  due_date: string | null
  completed_date: string | null
  created_by: string
  created_by_type: string
  notes: string | null
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
  linked_clients: ClientLink[]
  updates: Update[]
  tasks: Task[]
  progress: number
}

// ── Constants ──────────────────────────────────────────────────

type TabKey = 'overview' | 'milestones' | 'documents' | 'financials' | 'budget' | 'pipeline' | 'partners' | 'clients' | 'tasks' | 'activity'

interface Referral {
  id: string
  prospect_name: string
  prospect_email: string
  prospect_phone: string | null
  package_interest: string | null
  attending_as: string | null
  stage: string
  referrer_name: string | null
  referrer_code: string | null
  source: string
  admin_notes: string | null
  created_at: string
  enquired_at: string | null
  converted_at: string | null
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'documents', label: 'Documents' },
  { key: 'financials', label: 'Financials' },
  { key: 'budget', label: 'Budget' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'partners', label: 'Partners' },
  { key: 'clients', label: 'Clients' },
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

// ── Overview Dashboard Component ──────────────────────────────

function OverviewDashboard({
  project,
  onSetTab,
  onCompleteMilestone,
  onCompleteTask,
  editingNotes,
  notesValue,
  savingNotes,
  onStartEditNotes,
  onCancelEditNotes,
  onChangeNotes,
  onSaveNotes,
}: {
  project: ProjectDetail
  onSetTab: (tab: TabKey) => void
  onCompleteMilestone: (mid: string) => void
  onCompleteTask: (taskId: string, status: string) => void
  editingNotes: boolean
  notesValue: string
  savingNotes: boolean
  onStartEditNotes: () => void
  onCancelEditNotes: () => void
  onChangeNotes: (val: string) => void
  onSaveNotes: () => void
}) {
  const pd = project.property_details as Record<string, unknown>
  const isEvent = !!pd?.event_type
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // ── Event-specific calculations ──
  const eventDate = project.target_date || (pd?.dates as string)?.split(' - ')?.[0] || null
  let daysToGo: number | null = null
  let eventDateFormatted = ''
  if (eventDate) {
    const d = new Date(eventDate)
    if (!isNaN(d.getTime())) {
      daysToGo = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      eventDateFormatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }
  }

  const capacity = pd?.capacity ? String(pd.capacity) : ''
  const capacityNum = parseInt(capacity) || 0

  // ── Task calculations ──
  const allTasks = project.tasks || []
  const pendingTasks = allTasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
  const overdueTasks = allTasks.filter(t =>
    t.status !== 'completed' && t.due_date && t.due_date < todayStr
  )

  // ── Milestone calculations ──
  const completedMs = project.milestones.filter(m => m.status === 'completed').length
  const totalMs = project.milestones.length
  const msPercent = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0

  // Overdue or upcoming milestones (next 14 days)
  const fourteenDaysOut = new Date(today)
  fourteenDaysOut.setDate(today.getDate() + 14)
  const fourteenDaysStr = fourteenDaysOut.toISOString().split('T')[0]

  const urgentMilestones = project.milestones
    .filter(m => m.status !== 'completed' && m.status !== 'skipped' && m.due_date)
    .filter(m => m.due_date! <= fourteenDaysStr)
    .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''))
    .slice(0, 5)

  // Task summary by assignee
  const tasksByPartner: Record<string, { name: string; total: number; overdue: number }> = {}
  for (const task of allTasks.filter(t => t.status !== 'completed')) {
    const partnerNames = task.assigned_partner_names || []
    const partnerIds = task.assigned_to || []
    const isOverdue = task.due_date && task.due_date < todayStr
    for (let i = 0; i < partnerIds.length; i++) {
      const pid = partnerIds[i]
      const pname = partnerNames[i] || 'Unassigned'
      if (!tasksByPartner[pid]) tasksByPartner[pid] = { name: pname, total: 0, overdue: 0 }
      tasksByPartner[pid].total++
      if (isOverdue) tasksByPartner[pid].overdue++
    }
    if (partnerIds.length === 0) {
      if (!tasksByPartner['_unassigned']) tasksByPartner['_unassigned'] = { name: 'Unassigned', total: 0, overdue: 0 }
      tasksByPartner['_unassigned'].total++
      if (isOverdue) tasksByPartner['_unassigned'].overdue++
    }
  }

  // Financial summary
  const expenses = project.financials.filter(f => ['expense', 'invoice', 'payment', 'retainer', 'admin_fee'].includes(f.type))
  const income = project.financials.filter(f => f.type === 'income')
  const totalSpent = expenses.reduce((s, f) => s + Number(f.amount), 0)
  const totalIncome = income.reduce((s, f) => s + Number(f.amount), 0)

  // Recent activity
  const recentActivityLimit = isEvent ? 8 : 5
  const recentUpdates = [...project.updates].reverse().slice(0, recentActivityLimit)

  if (isEvent) {
    // ═══════ EVENT PROJECT DASHBOARD ═══════
    return (
      <div className="space-y-6">
        {/* Row 2: Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Countdown */}
          <div className="bg-white rounded-lg border border-green/10 p-4">
            <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">Countdown</p>
            {daysToGo !== null ? (
              <>
                <p className="text-2xl font-heading font-semibold text-green">
                  {daysToGo > 0 ? daysToGo : daysToGo === 0 ? 'Today' : Math.abs(daysToGo)}
                  {daysToGo > 0 && <span className="text-sm text-gray-400 font-body ml-1">days to go</span>}
                  {daysToGo < 0 && <span className="text-sm text-red-400 font-body ml-1">days ago</span>}
                </p>
                <p className="text-xs text-gray-400 font-body mt-0.5">{eventDateFormatted}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400 font-body">No date set</p>
            )}
          </div>

          {/* Guests */}
          <div className="bg-white rounded-lg border border-green/10 p-4">
            <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">Guests</p>
            <p className="text-2xl font-heading font-semibold text-green">
              0<span className="text-sm text-gray-400 font-body"> / {capacityNum || '?'}</span>
            </p>
            {capacityNum > 0 ? (
              <div className="mt-1.5">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 font-body mt-0.5">Set up guest list</p>
            )}
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg border border-green/10 p-4">
            <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">Revenue</p>
            <p className="text-2xl font-heading font-semibold text-green">
              {totalIncome > 0 ? formatCurrency(totalIncome, project.currency) : formatCurrency(0, project.currency)}
            </p>
            {project.budget ? (
              <>
                <p className="text-xs text-gray-400 font-body mt-0.5">of {formatCurrency(project.budget, project.currency)} target</p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-green rounded-full transition-all"
                    style={{ width: `${Math.min(100, project.budget > 0 ? (totalIncome / project.budget) * 100 : 0)}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 font-body mt-0.5">No target set</p>
            )}
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-lg border border-green/10 p-4">
            <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">Tasks</p>
            <p className="text-2xl font-heading font-semibold text-green">
              {pendingTasks.length}
              <span className="text-sm text-gray-400 font-body ml-1">pending</span>
            </p>
            {overdueTasks.length > 0 && (
              <p className="text-xs text-red-500 font-body font-medium mt-0.5">{overdueTasks.length} overdue</p>
            )}
          </div>
        </div>

        {/* Row 3: Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Overdue & Upcoming Milestones */}
            <div className="bg-white rounded-lg border border-green/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Overdue &amp; Upcoming Milestones</h3>
                <button onClick={() => onSetTab('milestones')} className="text-[11px] text-green hover:underline font-body">View all</button>
              </div>
              {urgentMilestones.length === 0 ? (
                <p className="text-sm text-gray-400 font-body text-center py-3">No milestones due soon.</p>
              ) : (
                <div className="space-y-2">
                  {urgentMilestones.map(m => {
                    const isOverdue = m.due_date! < todayStr
                    return (
                      <div key={m.id} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-pearl/50">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                            isOverdue ? 'bg-red-50 text-red-600' : MILESTONE_STATUS_COLORS[m.status] || 'bg-gray-100 text-gray-600'
                          }`}>
                            {isOverdue ? 'Overdue' : m.status === 'in_progress' ? 'In Progress' : 'Pending'}
                          </span>
                          <span className="text-sm text-gray-800 font-body truncate">{m.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-body ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                            {m.due_date ? formatDateShort(m.due_date) : ''}
                          </span>
                          <button
                            onClick={() => onCompleteMilestone(m.id)}
                            className="text-[10px] px-2 py-0.5 bg-green/5 text-green rounded hover:bg-green/10 font-body"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Task Summary by Assignee */}
            <div className="bg-white rounded-lg border border-green/10 p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">Tasks by Assignee</h3>
              {Object.keys(tasksByPartner).length === 0 ? (
                <p className="text-sm text-gray-400 font-body text-center py-3">No active tasks.</p>
              ) : (
                <div className="space-y-2">
                  {Object.values(tasksByPartner).map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-pearl/50">
                      <span className="text-sm text-gray-800 font-body font-medium">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-body">{p.total} task{p.total !== 1 ? 's' : ''}</span>
                        {p.overdue > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">{p.overdue} overdue</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-green/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Recent Activity</h3>
                <button onClick={() => onSetTab('activity')} className="text-[11px] text-green hover:underline font-body">View all</button>
              </div>
              {recentUpdates.length === 0 ? (
                <p className="text-sm text-gray-400 font-body text-center py-3">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentUpdates.map(u => (
                    <div key={u.id} className="flex gap-2">
                      <span className={`inline-block w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5 ${
                        u.author_type === 'admin' ? 'bg-green-muted text-green'
                          : u.author_type === 'partner' ? 'bg-blue-50 text-blue-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.author_type === 'admin' ? 'A' : u.author_type === 'partner' ? 'P' : 'S'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-700 font-body line-clamp-2">{u.message}</p>
                        <p className="text-[10px] text-gray-400 font-body mt-0.5">
                          {u.author_name || u.author_type} &middot; {relativeTime(u.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-green/10 p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onSetTab('tasks')}
                  className="text-xs px-3 py-1.5 bg-green/5 text-green rounded hover:bg-green/10 font-body transition-colors"
                >
                  Add Task
                </button>
                <button
                  onClick={() => onSetTab('documents')}
                  className="text-xs px-3 py-1.5 bg-green/5 text-green rounded hover:bg-green/10 font-body transition-colors"
                >
                  Upload Document
                </button>
                <button
                  onClick={() => onSetTab('activity')}
                  className="text-xs px-3 py-1.5 bg-green/5 text-green rounded hover:bg-green/10 font-body transition-colors"
                >
                  Post Update
                </button>
                <button
                  onClick={() => onSetTab('milestones')}
                  className="text-xs px-3 py-1.5 bg-green/5 text-green rounded hover:bg-green/10 font-body transition-colors"
                >
                  View Milestones
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Notes */}
        <div className="bg-white rounded-lg border border-green/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Notes</h3>
            {!editingNotes && (
              <button onClick={onStartEditNotes} className="text-[11px] text-green hover:underline font-body">Edit</button>
            )}
          </div>
          {editingNotes ? (
            <div>
              <textarea
                rows={4}
                value={notesValue}
                onChange={(e) => onChangeNotes(e.target.value)}
                className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={onSaveNotes}
                  disabled={savingNotes}
                  className="text-xs px-3 py-1.5 bg-green text-white rounded hover:bg-green-light font-body disabled:opacity-50 transition-colors"
                >
                  {savingNotes ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={onCancelEditNotes}
                  className="text-xs px-3 py-1.5 border border-green/20 text-gray-500 rounded hover:bg-gray-50 font-body transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            project.notes
              ? <p className="text-sm text-gray-700 font-body whitespace-pre-wrap">{project.notes}</p>
              : <p className="text-sm text-gray-400 font-body">No notes yet. Click Edit to add notes.</p>
          )}
        </div>
      </div>
    )
  }

  // ═══════ REGULAR PROJECT DASHBOARD ═══════
  return (
    <div className="space-y-6">
      {/* Milestone progress bar */}
      {totalMs > 0 && (
        <div className="bg-white rounded-lg border border-green/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Milestone Progress</h3>
            <span className="text-sm font-heading font-semibold text-green">{msPercent}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green rounded-full transition-all duration-500"
              style={{ width: `${msPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 font-body mt-1.5">{completedMs} of {totalMs} milestones completed</p>
        </div>
      )}

      {/* Key metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-green/10 p-4">
          <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">Budget</p>
          <p className="text-xl font-heading font-semibold text-green">
            {project.budget ? formatCurrency(project.budget, project.currency) : '-'}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-green/10 p-4">
          <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">Spent</p>
          <p className="text-xl font-heading font-semibold text-red-600">
            {totalSpent > 0 ? formatCurrency(totalSpent, project.currency) : '-'}
          </p>
          {project.budget && totalSpent > 0 && (
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full rounded-full transition-all ${totalSpent > project.budget ? 'bg-red-500' : 'bg-gold'}`}
                style={{ width: `${Math.min(100, project.budget > 0 ? (totalSpent / project.budget) * 100 : 0)}%` }}
              />
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg border border-green/10 p-4">
          <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">Tasks</p>
          <p className="text-xl font-heading font-semibold text-green">{pendingTasks.length}</p>
          {overdueTasks.length > 0 && (
            <p className="text-[10px] text-red-500 font-body font-medium mt-0.5">{overdueTasks.length} overdue</p>
          )}
        </div>
        <div className="bg-white rounded-lg border border-green/10 p-4">
          <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">Documents</p>
          <p className="text-xl font-heading font-semibold text-green">{project.documents.length}</p>
        </div>
      </div>

      {/* Overdue milestones */}
      {urgentMilestones.length > 0 && (
        <div className="bg-white rounded-lg border border-green/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Overdue &amp; Upcoming Milestones</h3>
            <button onClick={() => onSetTab('milestones')} className="text-[11px] text-green hover:underline font-body">View all</button>
          </div>
          <div className="space-y-2">
            {urgentMilestones.map(m => {
              const isOverdue = m.due_date! < todayStr
              return (
                <div key={m.id} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-pearl/50">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                      isOverdue ? 'bg-red-50 text-red-600' : MILESTONE_STATUS_COLORS[m.status] || 'bg-gray-100 text-gray-600'
                    }`}>
                      {isOverdue ? 'Overdue' : m.status === 'in_progress' ? 'In Progress' : 'Pending'}
                    </span>
                    <span className="text-sm text-gray-800 font-body truncate">{m.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-body ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                      {m.due_date ? formatDateShort(m.due_date) : ''}
                    </span>
                    <button
                      onClick={() => onCompleteMilestone(m.id)}
                      className="text-[10px] px-2 py-0.5 bg-green/5 text-green rounded hover:bg-green/10 font-body"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Two columns: Recent Activity + Task Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-green/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Recent Activity</h3>
            <button onClick={() => onSetTab('activity')} className="text-[11px] text-green hover:underline font-body">View all</button>
          </div>
          {recentUpdates.length === 0 ? (
            <p className="text-sm text-gray-400 font-body text-center py-3">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {recentUpdates.map(u => (
                <div key={u.id} className="flex gap-2">
                  <span className={`inline-block w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5 ${
                    u.author_type === 'admin' ? 'bg-green-muted text-green'
                      : u.author_type === 'partner' ? 'bg-blue-50 text-blue-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {u.author_type === 'admin' ? 'A' : u.author_type === 'partner' ? 'P' : 'S'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-700 font-body line-clamp-2">{u.message}</p>
                    <p className="text-[10px] text-gray-400 font-body mt-0.5">
                      {u.author_name || u.author_type} &middot; {relativeTime(u.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Summary */}
        <div className="bg-white rounded-lg border border-green/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Tasks by Assignee</h3>
            <button onClick={() => onSetTab('tasks')} className="text-[11px] text-green hover:underline font-body">View all</button>
          </div>
          {Object.keys(tasksByPartner).length === 0 ? (
            <p className="text-sm text-gray-400 font-body text-center py-3">No active tasks.</p>
          ) : (
            <div className="space-y-2">
              {Object.values(tasksByPartner).map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-pearl/50">
                  <span className="text-sm text-gray-800 font-body font-medium">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-body">{p.total} task{p.total !== 1 ? 's' : ''}</span>
                    {p.overdue > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">{p.overdue} overdue</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Details + Property + Notes (collapsed) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-green/10 p-5">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">Project Details</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500 font-body">Type</dt>
              <dd className="text-sm text-gray-800 font-body font-medium">{TYPE_LABELS[project.type] || project.type}</dd>
            </div>
            {project.client && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 font-body">Client</dt>
                <dd className="text-sm text-gray-800 font-body font-medium">{project.client.name || project.client.email}</dd>
              </div>
            )}
            {project.monthly_retainer && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 font-body">Retainer</dt>
                <dd className="text-sm text-gray-800 font-body font-medium">{formatCurrency(project.monthly_retainer, project.currency)}/mo</dd>
              </div>
            )}
            {project.start_date && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 font-body">Start</dt>
                <dd className="text-sm text-gray-800 font-body">{formatDateShort(project.start_date)}</dd>
              </div>
            )}
            {project.target_date && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 font-body">Target</dt>
                <dd className="text-sm text-gray-800 font-body">{formatDateShort(project.target_date)}</dd>
              </div>
            )}
          </dl>
        </div>

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
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg border border-green/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Notes</h3>
          {!editingNotes && (
            <button onClick={onStartEditNotes} className="text-[11px] text-green hover:underline font-body">Edit</button>
          )}
        </div>
        {editingNotes ? (
          <div>
            <textarea
              rows={4}
              value={notesValue}
              onChange={(e) => onChangeNotes(e.target.value)}
              className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={onSaveNotes}
                disabled={savingNotes}
                className="text-xs px-3 py-1.5 bg-green text-white rounded hover:bg-green-light font-body disabled:opacity-50 transition-colors"
              >
                {savingNotes ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={onCancelEditNotes}
                className="text-xs px-3 py-1.5 border border-green/20 text-gray-500 rounded hover:bg-gray-50 font-body transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          project.notes
            ? <p className="text-sm text-gray-700 font-body whitespace-pre-wrap">{project.notes}</p>
            : <p className="text-sm text-gray-400 font-body">No notes yet. Click Edit to add notes.</p>
        )}
      </div>
    </div>
  )
}

// ── Event Hero Component ──────────────────────────────────────

function EventProjectHero({ project }: { project: ProjectDetail }) {
  const pd = project.property_details as Record<string, unknown>
  const completedMs = project.milestones.filter(m => m.status === 'completed').length
  const totalMs = project.milestones.length
  const msPercent = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0
  const location = [project.property_city, project.property_country].filter(Boolean).join(', ')
  const dates = (pd.dates as string) || (project.start_date && project.target_date
    ? `${formatDateShort(project.start_date)} - ${formatDateShort(project.target_date)}`
    : project.start_date ? `From ${formatDateShort(project.start_date)}` : '')
  const capacity = (pd.capacity as string) || ''
  const revenueSplit = (pd.revenue_split as string) || ''
  const packages = pd.packages as Record<string, { individual?: string | number; couple?: string | number }> | undefined
  const partnerNames = project.partners
    .map(p => p.partner?.org_name || p.partner?.email || p.role)
    .filter(Boolean)

  return (
    <div className="mb-6">
      {/* Hero banner */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #0e4f51 0%, #0a3a3c 60%, #0e4f51 100%)' }}>
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          {/* Subtle gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #c8aa4a, transparent)' }} />

          <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-white mb-2">{project.title}</h2>
          <div className="w-16 h-[2px] bg-gold mb-6" />

          {/* Key stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {location && (
              <div>
                <p className="text-[10px] text-white/50 font-body uppercase tracking-wider mb-0.5">Location</p>
                <p className="text-sm text-white font-body font-medium">{location}</p>
              </div>
            )}
            {dates && (
              <div>
                <p className="text-[10px] text-white/50 font-body uppercase tracking-wider mb-0.5">Dates</p>
                <p className="text-sm text-white font-body font-medium">{dates}</p>
              </div>
            )}
            {capacity && (
              <div>
                <p className="text-[10px] text-white/50 font-body uppercase tracking-wider mb-0.5">Capacity</p>
                <p className="text-sm text-white font-body font-medium">{capacity}</p>
              </div>
            )}
            {project.budget && (
              <div>
                <p className="text-[10px] text-white/50 font-body uppercase tracking-wider mb-0.5">Budget</p>
                <p className="text-sm text-white font-body font-medium">{formatCurrency(project.budget, project.currency)}</p>
              </div>
            )}
            {revenueSplit && (
              <div>
                <p className="text-[10px] text-white/50 font-body uppercase tracking-wider mb-0.5">Revenue Split</p>
                <p className="text-sm text-white font-body font-medium">{revenueSplit}</p>
              </div>
            )}
          </div>

          {/* Milestone progress bar */}
          {totalMs > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-white/50 font-body uppercase tracking-wider">Milestones</p>
                <span className="text-xs text-white/70 font-body">{completedMs} of {totalMs} complete</span>
              </div>
              <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${msPercent}%`, backgroundColor: '#c8aa4a' }}
                />
              </div>
            </div>
          )}

          {/* Partner names */}
          {partnerNames.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span className="text-[10px] text-white/40 font-body uppercase tracking-wider">Partners:</span>
              {partnerNames.map((name, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-white/80 font-body">{name}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Package cards */}
      {packages && Object.keys(packages).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {Object.entries(packages).slice(0, 3).map(([name, pkg]) => (
            <div key={name} className="bg-white rounded-lg border border-green/10 p-5 text-center">
              <h4 className="font-heading text-sm font-semibold text-green mb-3">{name}</h4>
              <div className="w-8 h-[1px] bg-gold mx-auto mb-3" />
              {pkg.individual && (
                <div className="mb-1">
                  <span className="text-xs text-gray-400 font-body">Individual: </span>
                  <span className="text-sm font-heading font-semibold text-green">
                    {typeof pkg.individual === 'number' ? formatCurrency(pkg.individual, project.currency) : pkg.individual}
                  </span>
                </div>
              )}
              {pkg.couple && (
                <div>
                  <span className="text-xs text-gray-400 font-body">Couple: </span>
                  <span className="text-sm font-heading font-semibold text-green">
                    {typeof pkg.couple === 'number' ? formatCurrency(pkg.couple, project.currency) : pkg.couple}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
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
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null)
  const [milestoneEditForm, setMilestoneEditForm] = useState({ title: '', description: '', due_date: '' })

  // Document state
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [newDocTitle, setNewDocTitle] = useState('')
  const [newDocFile, setNewDocFile] = useState<File | null>(null)
  const [newDocNotes, setNewDocNotes] = useState('')
  const [uploadProgress, setUploadProgress] = useState(false)

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
  const [expandedPartnerId, setExpandedPartnerId] = useState<string | null>(null)

  // Client state
  const [showAddClient, setShowAddClient] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [clientResults, setClientResults] = useState<Array<{ id: string; name: string | null; email: string }>>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [clientRole, setClientRole] = useState('attendee')
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null)

  // Inline notes editing state
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Task state
  const [showAddTask, setShowAddTask] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: [] as string[] })

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
    const pd = project.property_details as Record<string, unknown> || {}
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
      show_sponsors_to_clients: pd.show_sponsors_to_clients ? 'true' : 'false',
    })
    setEditing(true)
  }

  async function saveOverview() {
    setSaving(true)
    setError('')

    // Merge show_sponsors_to_clients into property_details
    const existingPd = (project?.property_details as Record<string, unknown>) || {}
    const updatedPd = {
      ...existingPd,
      show_sponsors_to_clients: editForm.show_sponsors_to_clients === 'true',
    }

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
      property_details: updatedPd,
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

  function startEditMilestone(m: Milestone) {
    setEditingMilestoneId(m.id)
    setMilestoneEditForm({
      title: m.title,
      description: m.description || '',
      due_date: m.due_date || '',
    })
  }

  async function saveEditMilestone() {
    if (!editingMilestoneId || !milestoneEditForm.title.trim()) return
    setSaving(true)
    await fetch(`/api/admin/projects/${id}/milestones/${editingMilestoneId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: milestoneEditForm.title.trim(),
        description: milestoneEditForm.description.trim() || null,
        due_date: milestoneEditForm.due_date || null,
      }),
    })
    setEditingMilestoneId(null)
    setSaving(false)
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
    if (!newDocTitle.trim() || !newDocFile) return
    setSaving(true)
    setUploadProgress(true)

    try {
      // Step 1: Upload file to Supabase storage
      const formData = new FormData()
      formData.append('file', newDocFile)

      const uploadRes = await fetch(`/api/admin/projects/${id}/documents/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        alert(`Upload failed: ${err.error || 'Unknown error'}`)
        setSaving(false)
        setUploadProgress(false)
        return
      }

      const { url } = await uploadRes.json()

      // Step 2: Detect file type from extension
      const ext = newDocFile.name.split('.').pop()?.toLowerCase() || ''
      const fileTypeMap: Record<string, string> = {
        pdf: 'PDF', doc: 'Word', docx: 'Word',
        jpg: 'Image', jpeg: 'Image', png: 'Image', webp: 'Image',
      }
      const fileType = fileTypeMap[ext] || ext.toUpperCase()

      // Step 3: Save document record
      const res = await fetch(`/api/admin/projects/${id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDocTitle.trim(),
          file_url: url,
          file_type: fileType,
          notes: newDocNotes.trim() || null,
        }),
      })

      if (res.ok) {
        setShowAddDoc(false)
        setNewDocTitle('')
        setNewDocFile(null)
        setNewDocNotes('')
        fetchProject()
      }
    } catch (err) {
      alert('Upload failed. Please try again.')
    }
    setSaving(false)
    setUploadProgress(false)
  }

  async function deleteDocument(docId: string) {
    if (!confirm('Delete this document?')) return
    const res = await fetch(`/api/admin/projects/${id}/documents/${docId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      fetchProject()
    } else {
      const err = await res.json().catch(() => ({}))
      alert(`Delete failed: ${err.error || 'Unknown error'}`)
    }
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

  async function updatePartnerVisibility(pid: string, key: keyof VisibilitySettings, value: string) {
    const partner = project?.partners.find(p => p.id === pid)
    if (!partner) return
    const current: VisibilitySettings = { ...DEFAULT_VISIBILITY, ...(partner.visibility_settings || {}) }
    const updated = { ...current, [key]: value }
    await fetch(`/api/admin/projects/${id}/partners/${pid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility_settings: updated }),
    })
    fetchProject()
  }

  // ── Client actions ──────────────────────────────────────────

  async function searchClients() {
    if (!clientSearch.trim()) return
    const res = await fetch(`/api/admin/clients?search=${encodeURIComponent(clientSearch)}`)
    if (res.ok) {
      const data = await res.json()
      const list = Array.isArray(data) ? data : data.clients || []
      setClientResults(list.map((c: Record<string, unknown>) => ({
        id: c.id as string,
        name: c.name as string | null,
        email: c.email as string,
      })))
    }
  }

  async function addClient(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClientId) return
    setSaving(true)

    const res = await fetch(`/api/admin/projects/${id}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: selectedClientId,
        role: clientRole.trim() || 'attendee',
      }),
    })

    if (res.ok) {
      setShowAddClient(false)
      setClientSearch('')
      setClientResults([])
      setSelectedClientId('')
      setClientRole('attendee')
      fetchProject()
    }
    setSaving(false)
  }

  async function removeClient(cid: string) {
    if (!confirm('Remove this client from the project?')) return
    await fetch(`/api/admin/projects/${id}/clients/${cid}`, { method: 'DELETE' })
    fetchProject()
  }

  async function updateClientVisibility(cid: string, key: keyof ClientVisibilitySettings, value: string) {
    const cl = project?.linked_clients.find(c => c.id === cid)
    if (!cl) return
    const current: ClientVisibilitySettings = { ...DEFAULT_CLIENT_VISIBILITY, ...(cl.visibility_settings || {}) }
    const updated = { ...current, [key]: value }
    await fetch(`/api/admin/projects/${id}/clients/${cid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility_settings: updated }),
    })
    fetchProject()
  }

  async function saveInlineNotes() {
    setSavingNotes(true)
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: notesValue || null }),
    })
    if (res.ok) {
      setEditingNotes(false)
      fetchProject()
    }
    setSavingNotes(false)
  }

  // ── Task actions ────────────────────────────────���────────────

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!taskForm.title.trim()) return
    setSaving(true)

    const res = await fetch(`/api/admin/projects/${id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || null,
        priority: taskForm.priority,
        due_date: taskForm.due_date || null,
        assigned_to: taskForm.assigned_to,
      }),
    })

    if (res.ok) {
      setShowAddTask(false)
      setTaskForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: [] })
      fetchProject()
    }
    setSaving(false)
  }

  async function updateTaskStatus(taskId: string, status: string) {
    await fetch(`/api/admin/projects/${id}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchProject()
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Delete this task?')) return
    await fetch(`/api/admin/projects/${id}/tasks/${taskId}`, { method: 'DELETE' })
    fetchProject()
  }

  // ── Activity actions ─────────���───────────────────────────────

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

  if (loading) return <div className="p-4 sm:p-6 lg:p-8"><p className="text-gray-500 font-body">Loading...</p></div>
  if (!project) return <div className="p-4 sm:p-6 lg:p-8"><p className="text-gray-500 font-body">Project not found.</p></div>

  const filteredUpdates = activityFilter
    ? project.updates.filter(u => u.author_type === activityFilter)
    : project.updates

  // Financial summaries
  const expenses = project.financials.filter(f => ['expense', 'invoice', 'payment', 'retainer', 'admin_fee'].includes(f.type))
  const paidExpenses = expenses.filter(f => f.status === 'paid')
  const pendingExpenses = expenses.filter(f => f.status === 'pending')
  const income = project.financials.filter(f => f.type === 'income')
  const totalSpent = paidExpenses.reduce((s, f) => s + Number(f.amount), 0)
  const totalPending = pendingExpenses.reduce((s, f) => s + Number(f.amount), 0)
  const totalIncome = income.reduce((s, f) => s + Number(f.amount), 0)
  const netPosition = totalIncome - totalSpent
  const isRevenueProject = ['rental_management', 'other'].includes(project.type)
  const remaining = (project.budget || 0) - totalSpent

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
            {tab.key === 'tasks' && project.tasks && project.tasks.length > 0 && (
              <span className="ml-1.5 text-xs text-gray-400">({project.tasks.length})</span>
            )}
            {tab.key === 'clients' && project.linked_clients && project.linked_clients.length > 0 && (
              <span className="ml-1.5 text-xs text-gray-400">({project.linked_clients.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════════ OVERVIEW TAB ═══════════════════ */}
      {activeTab === 'overview' && (
        <div>
          {/* Event Project Hero */}
          {project.property_details && !!(project.property_details as Record<string, unknown>).event_type && (
            <EventProjectHero project={project} />
          )}

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

              <OverviewDashboard
                project={project}
                onSetTab={setActiveTab}
                onCompleteMilestone={(mid) => updateMilestoneStatus(mid, 'completed')}
                onCompleteTask={updateTaskStatus}
                editingNotes={editingNotes}
                notesValue={notesValue}
                savingNotes={savingNotes}
                onStartEditNotes={() => { setNotesValue(project.notes || ''); setEditingNotes(true) }}
                onCancelEditNotes={() => setEditingNotes(false)}
                onChangeNotes={setNotesValue}
                onSaveNotes={saveInlineNotes}
              />

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
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.show_sponsors_to_clients === 'true'}
                      onChange={(e) => setEditForm({ ...editForm, show_sponsors_to_clients: e.target.checked ? 'true' : 'false' })}
                      className="w-4 h-4 rounded border-gray-300 text-green focus:ring-green"
                    />
                    <span className="text-sm text-gray-700 font-body">Show sponsors to clients</span>
                  </label>
                  <p className="text-[11px] text-gray-400 font-body mt-1 ml-6">
                    When enabled, clients will be able to see sponsor logos and names on their project view.
                  </p>
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
                    <button onClick={() => startEditMilestone(m)} className="p-1 text-gray-400 hover:text-green text-xs" title="Edit">
                      &#9998;
                    </button>
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

                  {/* Inline edit form */}
                  {editingMilestoneId === m.id && (
                    <div className="w-full mt-3 pt-3 border-t border-green/10">
                      <div className="space-y-2">
                        <input
                          value={milestoneEditForm.title}
                          onChange={(e) => setMilestoneEditForm({ ...milestoneEditForm, title: e.target.value })}
                          className="w-full rounded-[4px] border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                        />
                        <textarea
                          rows={2}
                          value={milestoneEditForm.description}
                          onChange={(e) => setMilestoneEditForm({ ...milestoneEditForm, description: e.target.value })}
                          placeholder="Description (optional)"
                          className="w-full rounded-[4px] border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                        />
                        <div className="flex items-center gap-3">
                          <input
                            type="date"
                            value={milestoneEditForm.due_date}
                            onChange={(e) => setMilestoneEditForm({ ...milestoneEditForm, due_date: e.target.value })}
                            className="rounded-[4px] border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                          />
                          <Button size="sm" onClick={saveEditMilestone} disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingMilestoneId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
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
                        <div className="flex items-center justify-end gap-2">
                          {d.file_url?.startsWith('local://') ? (
                            <span
                              className="text-xs text-gray-400 font-medium cursor-not-allowed"
                              title="Local file path. Re-upload this document to make it accessible."
                            >
                              Local file
                            </span>
                          ) : (
                            <a
                              href={d.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green hover:text-green-light font-medium"
                            >
                              Open
                            </a>
                          )}
                          <button
                            onClick={() => deleteDocument(d.id)}
                            className="text-xs text-gray-300 hover:text-red-500 transition-colors"
                            title="Delete document"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">File</label>
                    <div className="relative">
                      <input
                        required
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setNewDocFile(file)
                          // Auto-fill title from filename if title is empty
                          if (file && !newDocTitle.trim()) {
                            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
                            setNewDocTitle(nameWithoutExt)
                          }
                        }}
                        className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 font-body file:mr-3 file:rounded-[4px] file:border-0 file:bg-green/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-green hover:file:bg-green/20 file:cursor-pointer"
                      />
                    </div>
                    {newDocFile && (
                      <p className="mt-1 text-xs text-gray-500 font-body">
                        {newDocFile.name} ({(newDocFile.size / 1024 / 1024).toFixed(1)} MB)
                      </p>
                    )}
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
                    <Button type="submit" disabled={saving || !newDocTitle.trim() || !newDocFile}>
                      {uploadProgress ? 'Uploading...' : saving ? 'Saving...' : 'Upload Document'}
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
          <div className={`grid grid-cols-2 ${isRevenueProject ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4 mb-6`}>
            <div className="bg-white rounded-lg border border-green/10 p-4">
              <p className="text-xs text-gray-400 font-body">Budget</p>
              <p className="font-heading text-xl font-semibold text-green">
                {project.budget ? formatCurrency(project.budget, project.currency) : '-'}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-green/10 p-4">
              <p className="text-xs text-gray-400 font-body">Paid</p>
              <p className="font-heading text-xl font-semibold text-red-600">
                {totalSpent > 0 ? formatCurrency(totalSpent, project.currency) : '-'}
              </p>
              {project.budget && totalSpent > 0 && (
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full transition-all ${totalSpent > project.budget ? 'bg-red-500' : 'bg-gold'}`}
                    style={{ width: `${Math.min(100, project.budget > 0 ? (totalSpent / project.budget) * 100 : 0)}%` }}
                  />
                </div>
              )}
            </div>
            {isRevenueProject ? (
              <>
                <div className="bg-white rounded-lg border border-green/10 p-4">
                  <p className="text-xs text-gray-400 font-body">Income</p>
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
              </>
            ) : (
              <div className="bg-white rounded-lg border border-green/10 p-4">
                <p className="text-xs text-gray-400 font-body">Remaining</p>
                <p className={`font-heading text-xl font-semibold ${remaining >= 0 ? 'text-green' : 'text-red-600'}`}>
                  {project.budget ? formatCurrency(remaining, project.currency) : '-'}
                </p>
                {totalPending > 0 && (
                  <p className="text-[10px] text-gray-400 font-body mt-0.5">{formatCurrency(totalPending, project.currency)} pending</p>
                )}
              </div>
            )}
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

      {/* ═══════════════════ BUDGET TAB ═══════════════════ */}
      {activeTab === 'budget' && (
        <EventBudgetTracker projectId={id as string} isActive={activeTab === 'budget'} role="admin" />
      )}

      {/* ═══════════════════ PIPELINE TAB ═══════════════════ */}
      {activeTab === 'pipeline' && (
        <PipelineTab projectId={id as string} />
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
            <div className="space-y-2">
              {project.partners.map((pp) => {
                const vis: VisibilitySettings = { ...DEFAULT_VISIBILITY, ...(pp.visibility_settings || {}) }
                const isExpanded = expandedPartnerId === pp.id
                return (
                  <div key={pp.id} className="bg-white rounded-lg border border-green/10 overflow-hidden">
                    <div className="flex items-center gap-4 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-body font-medium">
                          {pp.partner?.org_name || pp.partner?.email || '-'}
                        </p>
                        <p className="text-xs text-gray-500 font-body">{pp.role}</p>
                      </div>
                      <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                        pp.status === 'completed' ? 'bg-green-muted text-green'
                          : pp.status === 'active' ? 'bg-blue-50 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {pp.status || '-'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedPartnerId(isExpanded ? null : pp.id)}
                          className={`text-[11px] px-2.5 py-1 rounded font-body transition-colors ${
                            isExpanded ? 'bg-green/10 text-green' : 'bg-gray-50 text-gray-500 hover:bg-green/5 hover:text-green'
                          }`}
                        >
                          Permissions
                        </button>
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
                    </div>

                    {isExpanded && (
                      <div className="border-t border-green/10 px-4 py-4 bg-pearl/30">
                        <h4 className="text-[10px] font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
                          Visibility Controls
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Financials</label>
                            <select
                              value={vis.financials}
                              onChange={(e) => updatePartnerVisibility(pp.id, 'financials', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="hidden">Hidden</option>
                              <option value="read_only">Read Only</option>
                              <option value="full_access">Full Access</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Tasks</label>
                            <select
                              value={vis.tasks}
                              onChange={(e) => updatePartnerVisibility(pp.id, 'tasks', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="own_only">Own Only</option>
                              <option value="all">All Tasks</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Documents</label>
                            <select
                              value={vis.documents}
                              onChange={(e) => updatePartnerVisibility(pp.id, 'documents', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="own_only">Own Only</option>
                              <option value="all">All Documents</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Activity</label>
                            <select
                              value={vis.activity}
                              onChange={(e) => updatePartnerVisibility(pp.id, 'activity', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="filtered">Filtered (Admin + Own)</option>
                              <option value="all">All Activity</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Guests</label>
                            <select
                              value={vis.guests}
                              onChange={(e) => updatePartnerVisibility(pp.id, 'guests', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="hidden">Hidden</option>
                              <option value="view">View</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Sponsors</label>
                            <select
                              value={vis.sponsors}
                              onChange={(e) => updatePartnerVisibility(pp.id, 'sponsors', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="hidden">Hidden</option>
                              <option value="view">View</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Budget</label>
                            <select
                              value={vis.budget}
                              onChange={(e) => updatePartnerVisibility(pp.id, 'budget', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="hidden">Hidden</option>
                              <option value="view">View</option>
                            </select>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-body mt-3">
                          Changes save automatically. Default: all restricted.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
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

      {/* ═══════════════════ CLIENTS TAB ═══════════════════ */}
      {activeTab === 'clients' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Linked Clients</h2>
            <Button size="sm" onClick={() => setShowAddClient(true)}>Add Client</Button>
          </div>

          {project.linked_clients.length === 0 ? (
            <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
              <p className="text-gray-500 font-body text-sm">No clients linked to this project.</p>
              <p className="text-gray-400 font-body text-xs mt-1">Add clients as they express interest in this event or project.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {project.linked_clients.map((cl) => {
                const cvis: ClientVisibilitySettings = { ...DEFAULT_CLIENT_VISIBILITY, ...(cl.visibility_settings || {}) }
                const isExpanded = expandedClientId === cl.id
                return (
                  <div key={cl.id} className="bg-white rounded-lg border border-green/10 overflow-hidden">
                    <div className="flex items-center gap-4 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-body font-medium">
                          {cl.client?.name || cl.client?.email || '-'}
                        </p>
                        <p className="text-xs text-gray-500 font-body">{cl.role} &middot; {cl.client?.email}</p>
                      </div>
                      <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                        cl.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {cl.status || '-'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedClientId(isExpanded ? null : cl.id)}
                          className={`text-[11px] px-2.5 py-1 rounded font-body transition-colors ${
                            isExpanded ? 'bg-green/10 text-green' : 'bg-gray-50 text-gray-500 hover:bg-green/5 hover:text-green'
                          }`}
                        >
                          Permissions
                        </button>
                        <button
                          onClick={() => removeClient(cl.id)}
                          className="text-xs text-gray-400 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-green/10 px-4 py-4 bg-pearl/30">
                        <h4 className="text-[10px] font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
                          Client Visibility Controls
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Milestones</label>
                            <select
                              value={cvis.milestones}
                              onChange={(e) => updateClientVisibility(cl.id, 'milestones', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="hidden">Hidden</option>
                              <option value="view">View</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Documents</label>
                            <select
                              value={cvis.documents}
                              onChange={(e) => updateClientVisibility(cl.id, 'documents', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="hidden">Hidden</option>
                              <option value="shared_only">Shared Only</option>
                              <option value="all">All Documents</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Activity</label>
                            <select
                              value={cvis.activity}
                              onChange={(e) => updateClientVisibility(cl.id, 'activity', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="hidden">Hidden</option>
                              <option value="filtered">Admin Only</option>
                              <option value="all">All Activity</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Financials</label>
                            <select
                              value={cvis.financials}
                              onChange={(e) => updateClientVisibility(cl.id, 'financials', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="hidden">Hidden</option>
                              <option value="own_only">Own Payments Only</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Guest List</label>
                            <select
                              value={cvis.guests}
                              onChange={(e) => updateClientVisibility(cl.id, 'guests', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="hidden">Hidden</option>
                              <option value="first_name_only">First Names Only</option>
                              <option value="view">Full Names</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Schedule</label>
                            <select
                              value={cvis.schedule}
                              onChange={(e) => updateClientVisibility(cl.id, 'schedule', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="hidden">Hidden</option>
                              <option value="view">View</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Budget</label>
                            <select
                              value={cvis.budget}
                              onChange={(e) => updateClientVisibility(cl.id, 'budget', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="hidden">Hidden</option>
                              <option value="view">View</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Sponsors</label>
                            <select
                              value={cvis.sponsors}
                              onChange={(e) => updateClientVisibility(cl.id, 'sponsors', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="hidden">Hidden</option>
                              <option value="view">View</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Tasks</label>
                            <select
                              value={cvis.tasks}
                              onChange={(e) => updateClientVisibility(cl.id, 'tasks', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="hidden">Hidden</option>
                              <option value="view">View</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 font-body mb-1">Partners</label>
                            <select
                              value={cvis.partners}
                              onChange={(e) => updateClientVisibility(cl.id, 'partners', e.target.value)}
                              className="w-full text-xs px-2 py-1.5 border border-green/20 rounded bg-white text-gray-700 font-body focus:border-green focus:outline-none"
                            >
                              <option value="hidden">Hidden</option>
                              <option value="view">View</option>
                            </select>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-body mt-3">
                          Changes save automatically. Default: milestones, schedule, docs (shared) visible. Financials own-only. Guests first-name only.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Add Client Modal */}
          {showAddClient && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[8px] w-full max-w-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold text-green">Add Client to Project</h2>
                    <button onClick={() => setShowAddClient(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                  </div>
                </div>
                <form onSubmit={addClient} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Search Client</label>
                    <div className="flex gap-2">
                      <input
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        placeholder="Name or email..."
                        className="flex-1 rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                      />
                      <Button type="button" size="sm" onClick={searchClients}>Search</Button>
                    </div>
                    {clientResults.length > 0 && (
                      <div className="mt-2 border border-gray-200 rounded-[4px] max-h-40 overflow-y-auto">
                        {clientResults.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedClientId(c.id)
                              setClientSearch(c.name || c.email)
                              setClientResults([])
                            }}
                            className={`w-full text-left px-3 py-2 text-sm font-body hover:bg-pearl transition-colors ${
                              selectedClientId === c.id ? 'bg-green-muted text-green' : 'text-gray-700'
                            }`}
                          >
                            {c.name || c.email}
                            {c.name && <span className="text-gray-400 ml-2 text-xs">{c.email}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedClientId && (
                      <p className="text-xs text-green font-body mt-1">Client selected</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Role</label>
                    <select
                      value={clientRole}
                      onChange={(e) => setClientRole(e.target.value)}
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    >
                      <option value="attendee">Attendee</option>
                      <option value="vip">VIP Guest</option>
                      <option value="sponsor">Sponsor</option>
                      <option value="observer">Observer</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" type="button" onClick={() => setShowAddClient(false)}>Cancel</Button>
                    <Button type="submit" disabled={saving || !selectedClientId}>
                      {saving ? 'Adding...' : 'Add Client'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════ TASKS TAB ═══════════════════ */}
      {activeTab === 'tasks' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
              Tasks ({(project.tasks || []).filter(t => t.status !== 'completed').length} active)
            </h2>
            <Button size="sm" onClick={() => setShowAddTask(true)}>Add Task</Button>
          </div>

          {(!project.tasks || project.tasks.length === 0) ? (
            <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
              <p className="text-gray-500 font-body text-sm">No tasks yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* In Progress */}
              {project.tasks.filter(t => t.status === 'in_progress').length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-gold uppercase tracking-wider font-body mb-3">In Progress</h3>
                  <div className="space-y-2">
                    {project.tasks.filter(t => t.status === 'in_progress').map(task => (
                      <div key={task.id} className="bg-white rounded-lg border border-green/10 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="text-sm font-body font-medium text-gray-800">{task.title}</p>
                              <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                                task.priority === 'urgent' ? 'bg-red-50 text-red-600'
                                  : task.priority === 'high' ? 'bg-amber-50 text-amber-600'
                                  : task.priority === 'medium' ? 'bg-blue-50 text-blue-600'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            {task.description && <p className="text-xs text-gray-500 font-body mb-1">{task.description}</p>}
                            <div className="flex items-center gap-3 flex-wrap">
                              {task.due_date && (
                                <span className="text-xs text-gray-400 font-body">Due: {formatDateShort(task.due_date)}</span>
                              )}
                              {task.assigned_partner_names && task.assigned_partner_names.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {task.assigned_partner_names.map((name, i) => (
                                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-green/5 text-green/70 rounded font-body">{name}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => updateTaskStatus(task.id, 'completed')}
                              className="text-xs text-green hover:text-green-light font-medium font-body"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => updateTaskStatus(task.id, 'pending')}
                              className="text-xs text-gray-400 hover:text-gray-600 font-body ml-2"
                            >
                              Pause
                            </button>
                            <button onClick={() => deleteTask(task.id)} className="text-xs text-gray-300 hover:text-red-500 ml-2">&times;</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending */}
              {project.tasks.filter(t => t.status === 'pending').length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">Pending</h3>
                  <div className="space-y-2">
                    {project.tasks.filter(t => t.status === 'pending').map(task => (
                      <div key={task.id} className="bg-white rounded-lg border border-green/10 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="text-sm font-body font-medium text-gray-800">{task.title}</p>
                              <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                                task.priority === 'urgent' ? 'bg-red-50 text-red-600'
                                  : task.priority === 'high' ? 'bg-amber-50 text-amber-600'
                                  : task.priority === 'medium' ? 'bg-blue-50 text-blue-600'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            {task.description && <p className="text-xs text-gray-500 font-body mb-1">{task.description}</p>}
                            <div className="flex items-center gap-3 flex-wrap">
                              {task.due_date && (
                                <span className="text-xs text-gray-400 font-body">Due: {formatDateShort(task.due_date)}</span>
                              )}
                              {task.assigned_partner_names && task.assigned_partner_names.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {task.assigned_partner_names.map((name, i) => (
                                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-green/5 text-green/70 rounded font-body">{name}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => updateTaskStatus(task.id, 'in_progress')}
                              className="text-xs text-gold hover:text-gold/80 font-medium font-body"
                            >
                              Start
                            </button>
                            <button
                              onClick={() => updateTaskStatus(task.id, 'completed')}
                              className="text-xs text-green hover:text-green-light font-medium font-body ml-2"
                            >
                              Complete
                            </button>
                            <button onClick={() => deleteTask(task.id)} className="text-xs text-gray-300 hover:text-red-500 ml-2">&times;</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed */}
              {project.tasks.filter(t => t.status === 'completed').length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider font-body mb-3">Completed</h3>
                  <div className="space-y-2">
                    {project.tasks.filter(t => t.status === 'completed').map(task => (
                      <div key={task.id} className="bg-white rounded-lg border border-green/10 p-4 opacity-60">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="text-sm font-body font-medium text-gray-400 line-through">{task.title}</p>
                              <span className="inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium bg-green-muted text-green">done</span>
                            </div>
                            {task.completed_date && (
                              <span className="text-xs text-gray-400 font-body">Completed: {formatDateShort(task.completed_date)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => updateTaskStatus(task.id, 'pending')}
                              className="text-xs text-gray-400 hover:text-gray-600 font-body"
                            >
                              Reopen
                            </button>
                            <button onClick={() => deleteTask(task.id)} className="text-xs text-gray-300 hover:text-red-500 ml-2">&times;</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add Task Modal */}
          {showAddTask && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[8px] w-full max-w-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold text-green">Add Task</h2>
                    <button onClick={() => setShowAddTask(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                  </div>
                </div>
                <form onSubmit={addTask} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Title</label>
                    <input
                      required
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      placeholder="e.g. Send deposit invoice"
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Description</label>
                    <textarea
                      rows={2}
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Priority</label>
                      <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                        className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Due Date</label>
                      <input
                        type="date"
                        value={taskForm.due_date}
                        onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                        className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body"
                      />
                    </div>
                  </div>
                  {project.partners.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Assign to Partners</label>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto border border-gray-200 rounded-[4px] p-2">
                        {project.partners.map((pp) => (
                          <label key={pp.partner_id} className="flex items-center gap-2 text-sm font-body text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={taskForm.assigned_to.includes(pp.partner_id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTaskForm({ ...taskForm, assigned_to: [...taskForm.assigned_to, pp.partner_id] })
                                } else {
                                  setTaskForm({ ...taskForm, assigned_to: taskForm.assigned_to.filter(id => id !== pp.partner_id) })
                                }
                              }}
                              className="rounded border-gray-300 text-green focus:ring-green"
                            />
                            {pp.partner?.org_name || pp.partner?.email || pp.role}
                            <span className="text-[10px] text-gray-400">({pp.role})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" type="button" onClick={() => setShowAddTask(false)}>Cancel</Button>
                    <Button type="submit" disabled={saving || !taskForm.title.trim()}>
                      {saving ? 'Adding...' : 'Add Task'}
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
