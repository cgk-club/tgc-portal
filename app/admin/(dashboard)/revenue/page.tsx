'use client'

import { useState, useEffect, useCallback, Fragment, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/quote'

type FilterType = 'all' | 'pipeline' | 'fees' | 'collected' | 'outstanding'

interface PaymentItem {
  id: string
  itinerary_id: string
  service_name: string
  supplier_name: string
  amount: number
  currency: string
  payment_method: string
  payment_status: string
  cc_payment_url: string | null
  bank_details: Record<string, unknown> | null
  deposit_deadline: string | null
  notes: string | null
  client_notes: string | null
  client_amount: number | null
  commission_type: string | null
  commission_value: number | null
  sort_order: number
  created_at: string
  updated_at: string
  // Enriched fields
  client_name: string
  itinerary_title: string
  itinerary_currency: string
  client_account_id: string | null
  itinerary_start_date: string | null
}

interface Summary {
  pipelineTotal: number
  feesPending: number
  collected: number
  outstanding: number
  currency: string
}

interface Breakdowns {
  byClient: Record<string, { pipeline: number; collected: number }>
  byStatus: Record<string, { count: number; total: number }>
  byMonth: Record<string, number>
  commission: { totalCommissionable: number; estimatedCommission: number }
}

interface ProjectSummary {
  totalIncome: number
  totalExpenses: number
  retainers: number
  adminFees: number
  items: Array<Record<string, unknown>>
}

interface MarketplaceSummary {
  totalOrders: number
  totalRevenue: number
  totalCommission: number
  items: Array<Record<string, unknown>>
}

interface RevenueResponse {
  payments: PaymentItem[]
  summary: Summary
  breakdowns: Breakdowns
  projectFinancials: ProjectSummary
  marketplaceSummary: MarketplaceSummary
  clientNames: string[]
}

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  deposit_paid: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Deposit Paid' },
  fully_paid: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Fully Paid' },
  confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Confirmed' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Cancelled' },
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'Bank Transfer',
  cc_link: 'CC Link',
  included: 'Included',
  client_direct: 'Client Direct',
}

function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGES[status] || STATUS_BADGES.pending
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', badge.bg, badge.text)}>
      {badge.label}
    </span>
  )
}

function formatDateShort(date: string | null): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date))
}

function getAmount(p: PaymentItem): number {
  return p.client_amount || p.amount || 0
}

export default function RevenuePage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-[8px]" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-[8px]" />
        </div>
      </div>
    }>
      <RevenuePageContent />
    </Suspense>
  )
}

function RevenuePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialFilter = (searchParams.get('filter') as FilterType) || 'all'

  const [data, setData] = useState<RevenueResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter)
  const [clientFilter, setClientFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const [showBreakdowns, setShowBreakdowns] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (activeFilter !== 'all') params.set('filter', activeFilter)
    if (clientFilter) params.set('client_id', clientFilter)
    if (dateFrom) params.set('date_from', dateFrom)
    if (dateTo) params.set('date_to', dateTo)

    try {
      const res = await fetch(`/api/admin/revenue?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      setData(json)
    } catch {
      console.error('Failed to fetch revenue data')
    } finally {
      setLoading(false)
    }
  }, [activeFilter, clientFilter, dateFrom, dateTo])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleFilterChange(filter: FilterType) {
    setActiveFilter(filter)
    const params = new URLSearchParams(window.location.search)
    if (filter === 'all') {
      params.delete('filter')
    } else {
      params.set('filter', filter)
    }
    router.replace(`/admin/revenue?${params.toString()}`, { scroll: false })
  }

  function startEdit(paymentId: string, field: string, currentValue: string | number) {
    setEditingCell({ id: paymentId, field })
    setEditValue(String(currentValue))
  }

  async function saveEdit(payment: PaymentItem) {
    if (!editingCell) return
    const { field } = editingCell
    const previousValue = field === 'amount'
      ? getAmount(payment)
      : field === 'payment_status'
        ? payment.payment_status
        : field === 'deposit_deadline'
          ? payment.deposit_deadline
          : ''

    let newValue: string | number = editValue
    if (field === 'amount' || field === 'client_amount') {
      newValue = parseFloat(editValue) || 0
    }

    if (String(previousValue) === String(newValue)) {
      setEditingCell(null)
      return
    }

    setSaving(payment.id)
    try {
      const changes: Record<string, unknown> = {}
      // For amount editing, update client_amount if it exists, else amount
      if (field === 'amount') {
        if (payment.client_amount) {
          changes.client_amount = newValue
        } else {
          changes.amount = newValue
        }
      } else {
        changes[field] = newValue
      }

      const res = await fetch('/api/admin/revenue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.id,
          itineraryId: payment.itinerary_id,
          changes,
          previousValues: { [field]: previousValue },
        }),
      })
      if (!res.ok) throw new Error('Failed')
      await fetchData()
    } catch {
      console.error('Failed to save')
    } finally {
      setSaving(null)
      setEditingCell(null)
    }
  }

  if (loading && !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-[8px]" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-[8px]" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const { summary, payments, breakdowns, projectFinancials, marketplaceSummary, clientNames } = data

  const summaryCards: Array<{ key: FilterType; label: string; value: number; color: string }> = [
    { key: 'pipeline', label: 'Pipeline Value', value: summary.pipelineTotal, color: 'text-green' },
    { key: 'fees', label: 'Fees Pending', value: summary.feesPending, color: 'text-gold' },
    { key: 'collected', label: 'Collected', value: summary.collected, color: 'text-green' },
    { key: 'outstanding', label: 'Outstanding', value: summary.outstanding, color: 'text-red-600' },
  ]

  // Sort byMonth for chart
  const sortedMonths = Object.entries(breakdowns.byMonth).sort(([a], [b]) => a.localeCompare(b))

  // Max for bar scaling
  const maxMonthValue = sortedMonths.length > 0
    ? Math.max(...sortedMonths.map(([, v]) => v))
    : 1

  const maxClientValue = Object.values(breakdowns.byClient).length > 0
    ? Math.max(...Object.values(breakdowns.byClient).map((c) => c.pipeline))
    : 1

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="text-xs text-gray-500 font-body hover:text-green transition-colors"
          >
            Dashboard
          </Link>
          <h1 className="text-2xl font-heading font-semibold text-green mt-1">Revenue</h1>
        </div>
        {loading && (
          <span className="text-xs text-gray-400 font-body animate-pulse">Refreshing...</span>
        )}
      </div>

      {/* Summary cards (larger) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const isActive = activeFilter === card.key
          return (
            <button
              key={card.key}
              onClick={() => handleFilterChange(isActive ? 'all' : card.key)}
              className={cn(
                'bg-white rounded-[8px] border-2 p-5 text-left transition-all hover:shadow-md',
                isActive ? 'border-green shadow-md' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <p className="text-xs text-gray-500 font-body uppercase tracking-wide">{card.label}</p>
              <p className={cn('text-2xl font-heading font-semibold mt-2', card.color)}>
                {formatCurrency(card.value, summary.currency)}
              </p>
              <p className="text-[10px] text-gray-400 font-body mt-1">
                {isActive ? 'Showing filtered results' : 'Click to filter'}
              </p>
            </button>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-[8px] border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Tab buttons */}
          <div className="flex bg-gray-100 rounded-[4px] p-0.5">
            {(['all', 'pipeline', 'fees', 'collected', 'outstanding'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={cn(
                  'px-3 py-1.5 text-xs font-body rounded-[4px] transition-colors capitalize',
                  activeFilter === f
                    ? 'bg-green text-white'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {f === 'all' ? 'All' : f === 'fees' ? 'Fees' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-gray-200" />

          {/* Client filter */}
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="text-xs font-body border border-gray-200 rounded-[4px] px-2 py-1.5 bg-white"
          >
            <option value="">All clients</option>
            {clientNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-xs font-body border border-gray-200 rounded-[4px] px-2 py-1.5"
            placeholder="From"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-xs font-body border border-gray-200 rounded-[4px] px-2 py-1.5"
            placeholder="To"
          />

          {(clientFilter || dateFrom || dateTo) && (
            <button
              onClick={() => { setClientFilter(''); setDateFrom(''); setDateTo('') }}
              className="text-xs text-gray-500 hover:text-gray-700 font-body underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main table */}
      <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Service / Supplier</th>
                <th className="text-right px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-center px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Currency</th>
                <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                <th className="text-center px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Deadline</th>
                <th className="text-left px-4 py-3 text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400 font-body">
                    No payment records found for this filter.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isExpanded = expandedRow === p.id
                  const isEditing = editingCell?.id === p.id
                  const isSaving = saving === p.id
                  const amount = getAmount(p)
                  const hasAdjustmentLog = p.notes?.includes('--- Adjustment ---')

                  return (
                    <Fragment key={p.id}>
                      <tr
                        className={cn(
                          'hover:bg-gray-50 cursor-pointer transition-colors',
                          isExpanded && 'bg-gray-50',
                          isSaving && 'opacity-60'
                        )}
                        onClick={() => setExpandedRow(isExpanded ? null : p.id)}
                      >
                        {/* Client */}
                        <td className="px-4 py-3">
                          <div className="font-body text-sm font-medium text-gray-900">{p.client_name}</div>
                          <div className="text-xs text-gray-400 font-body truncate max-w-[160px]">{p.itinerary_title}</div>
                        </td>

                        {/* Service / Supplier */}
                        <td className="px-4 py-3">
                          <div className="font-body text-sm text-gray-900">{p.service_name}</div>
                          <div className="text-xs text-gray-400 font-body">{p.supplier_name}</div>
                        </td>

                        {/* Amount (editable) */}
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          {editingCell?.id === p.id && editingCell?.field === 'amount' ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit(p)
                                  if (e.key === 'Escape') setEditingCell(null)
                                }}
                                className="w-24 text-right text-sm font-body border border-green rounded-[4px] px-2 py-1"
                                autoFocus
                              />
                              <button
                                onClick={() => saveEdit(p)}
                                className="text-green hover:text-green-light text-xs font-body"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(p.id, 'amount', amount)}
                              className="font-body text-sm font-semibold text-gray-900 hover:text-green transition-colors"
                              title="Click to edit"
                            >
                              {formatCurrency(amount, p.currency || summary.currency)}
                            </button>
                          )}
                        </td>

                        {/* Currency */}
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-body text-gray-500">{p.currency || summary.currency}</span>
                        </td>

                        {/* Method */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-body text-gray-600">
                            {PAYMENT_METHOD_LABELS[p.payment_method] || p.payment_method}
                          </span>
                        </td>

                        {/* Status (editable) */}
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          {editingCell?.id === p.id && editingCell?.field === 'payment_status' ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit(p)}
                              className="text-xs font-body border border-green rounded-[4px] px-1 py-1"
                              autoFocus
                            >
                              {Object.entries(STATUS_BADGES).map(([val, { label }]) => (
                                <option key={val} value={val}>{label}</option>
                              ))}
                            </select>
                          ) : (
                            <button
                              onClick={() => startEdit(p.id, 'payment_status', p.payment_status)}
                              title="Click to change status"
                            >
                              <StatusBadge status={p.payment_status} />
                            </button>
                          )}
                        </td>

                        {/* Deadline (editable) */}
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {editingCell?.id === p.id && editingCell?.field === 'deposit_deadline' ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="date"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => saveEdit(p)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit(p)
                                  if (e.key === 'Escape') setEditingCell(null)
                                }}
                                className="text-xs font-body border border-green rounded-[4px] px-1 py-1"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(p.id, 'deposit_deadline', p.deposit_deadline || '')}
                              className="text-xs font-body text-gray-600 hover:text-green transition-colors"
                              title="Click to edit deadline"
                            >
                              {formatDateShort(p.deposit_deadline)}
                            </button>
                          )}
                        </td>

                        {/* Updated */}
                        <td className="px-4 py-3">
                          <div className="text-xs font-body text-gray-400">
                            {formatDateShort(p.updated_at)}
                          </div>
                          {hasAdjustmentLog && (
                            <div className="text-[10px] text-gold font-body">Adjusted</div>
                          )}
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-body">
                              {/* Notes */}
                              <div>
                                <p className="font-semibold text-gray-700 mb-1">Notes</p>
                                <p className="text-gray-500 whitespace-pre-wrap">
                                  {p.notes || 'No notes'}
                                </p>
                              </div>

                              {/* Client notes */}
                              <div>
                                <p className="font-semibold text-gray-700 mb-1">Client Notes</p>
                                <p className="text-gray-500 whitespace-pre-wrap">
                                  {p.client_notes || 'None'}
                                </p>
                              </div>

                              {/* Payment details */}
                              <div>
                                <p className="font-semibold text-gray-700 mb-1">Payment Details</p>
                                {p.cc_payment_url && (
                                  <p className="text-gray-500">
                                    CC Link:{' '}
                                    <a
                                      href={p.cc_payment_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-green hover:underline"
                                    >
                                      Open
                                    </a>
                                  </p>
                                )}
                                {p.bank_details && (
                                  <pre className="text-gray-500 bg-gray-100 rounded p-2 mt-1 overflow-x-auto">
                                    {JSON.stringify(p.bank_details, null, 2)}
                                  </pre>
                                )}
                                {!p.cc_payment_url && !p.bank_details && (
                                  <p className="text-gray-400">No payment details recorded</p>
                                )}

                                {/* Commission info */}
                                {p.commission_type && (
                                  <div className="mt-2">
                                    <p className="text-gray-500">
                                      Commission: {p.commission_value}
                                      {p.commission_type === 'percentage' ? '%' : ` ${p.currency || 'EUR'}`}
                                    </p>
                                  </div>
                                )}

                                {/* Quick link to itinerary */}
                                <div className="mt-3">
                                  <Link
                                    href={`/admin/itineraries/${p.itinerary_id}`}
                                    className="text-green hover:underline font-medium"
                                  >
                                    Open itinerary
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-body">
            {payments.length} record{payments.length !== 1 ? 's' : ''}
          </p>
          <p className="text-sm font-heading font-semibold text-green">
            Total: {formatCurrency(
              payments.reduce((s, p) => s + getAmount(p), 0),
              summary.currency
            )}
          </p>
        </div>
      </div>

      {/* Breakdowns section */}
      <div>
        <button
          onClick={() => setShowBreakdowns(!showBreakdowns)}
          className="flex items-center gap-2 text-sm font-heading font-semibold text-gray-700 mb-4"
        >
          <svg
            className={cn('w-4 h-4 transition-transform', showBreakdowns && 'rotate-90')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Revenue Breakdowns
        </button>

        {showBreakdowns && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* By Client */}
            <div className="bg-white rounded-[8px] border border-gray-200 p-5">
              <h3 className="text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Revenue by Client
              </h3>
              <div className="space-y-3">
                {Object.entries(breakdowns.byClient)
                  .sort(([, a], [, b]) => b.pipeline - a.pipeline)
                  .map(([name, data]) => (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-body text-gray-900">{name}</span>
                        <span className="text-sm font-body font-semibold text-gray-700">
                          {formatCurrency(data.pipeline, summary.currency)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full flex">
                          <div
                            className="bg-green h-full rounded-full"
                            style={{ width: `${(data.collected / maxClientValue) * 100}%` }}
                          />
                          <div
                            className="bg-gold/40 h-full"
                            style={{ width: `${((data.pipeline - data.collected) / maxClientValue) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-body text-gray-400">
                          Collected: {formatCurrency(data.collected, summary.currency)}
                        </span>
                        <span className="text-[10px] font-body text-gray-400">
                          Outstanding: {formatCurrency(data.pipeline - data.collected, summary.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                {Object.keys(breakdowns.byClient).length === 0 && (
                  <p className="text-xs text-gray-400 font-body">No client data</p>
                )}
              </div>
            </div>

            {/* By Status */}
            <div className="bg-white rounded-[8px] border border-gray-200 p-5">
              <h3 className="text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Revenue by Status
              </h3>
              <div className="space-y-3">
                {Object.entries(breakdowns.byStatus)
                  .sort(([, a], [, b]) => b.total - a.total)
                  .map(([status, data]) => {
                    const badge = STATUS_BADGES[status] || STATUS_BADGES.pending
                    const pct = summary.pipelineTotal > 0
                      ? ((data.total / summary.pipelineTotal) * 100).toFixed(1)
                      : '0'
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={status} />
                          <span className="text-xs font-body text-gray-400">
                            {data.count} item{data.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-body font-semibold text-gray-700">
                            {formatCurrency(data.total, summary.currency)}
                          </span>
                          <span className="text-xs font-body text-gray-400 ml-2">{pct}%</span>
                        </div>
                      </div>
                    )
                  })}
                {Object.keys(breakdowns.byStatus).length === 0 && (
                  <p className="text-xs text-gray-400 font-body">No status data</p>
                )}
              </div>
            </div>

            {/* By Month */}
            <div className="bg-white rounded-[8px] border border-gray-200 p-5">
              <h3 className="text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Revenue by Month
              </h3>
              {sortedMonths.length > 0 ? (
                <div className="space-y-2">
                  {sortedMonths.map(([month, total]) => {
                    const pct = maxMonthValue > 0 ? (total / maxMonthValue) * 100 : 0
                    const [year, m] = month.split('-')
                    const label = new Date(parseInt(year), parseInt(m) - 1).toLocaleString('en-GB', {
                      month: 'short',
                      year: 'numeric',
                    })
                    return (
                      <div key={month}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-body text-gray-600">{label}</span>
                          <span className="text-xs font-body font-semibold text-gray-700">
                            {formatCurrency(total, summary.currency)}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 font-body">No monthly data available</p>
              )}
            </div>

            {/* Commission summary */}
            <div className="bg-white rounded-[8px] border border-gray-200 p-5">
              <h3 className="text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Commission Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body text-gray-600">Total Commissionable</span>
                  <span className="text-sm font-body font-semibold text-gray-900">
                    {formatCurrency(breakdowns.commission.totalCommissionable, summary.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body text-gray-600">Estimated Commission</span>
                  <span className="text-sm font-body font-semibold text-gold">
                    {formatCurrency(breakdowns.commission.estimatedCommission, summary.currency)}
                  </span>
                </div>
                {breakdowns.commission.totalCommissionable > 0 && (
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                    <span className="text-xs font-body text-gray-400">Effective Rate</span>
                    <span className="text-xs font-body text-gray-500">
                      {breakdowns.commission.estimatedCommission > 0
                        ? ((breakdowns.commission.estimatedCommission / breakdowns.commission.totalCommissionable) * 100).toFixed(1) + '%'
                        : 'N/A (set commission on items)'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional revenue sources */}
      {(projectFinancials.totalIncome > 0 || projectFinancials.retainers > 0 || projectFinancials.adminFees > 0 || marketplaceSummary.totalOrders > 0) && (
        <div className="bg-white rounded-[8px] border border-gray-200 p-5">
          <h3 className="text-xs font-heading font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Additional Revenue Sources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Project financials */}
            {(projectFinancials.totalIncome > 0 || projectFinancials.retainers > 0 || projectFinancials.adminFees > 0) && (
              <div>
                <h4 className="text-sm font-heading font-semibold text-gray-700 mb-2">Project Financials</h4>
                <div className="space-y-1.5">
                  {projectFinancials.retainers > 0 && (
                    <div className="flex justify-between text-xs font-body">
                      <span className="text-gray-500">Retainers</span>
                      <span className="text-gray-900 font-semibold">
                        {formatCurrency(projectFinancials.retainers, summary.currency)}
                      </span>
                    </div>
                  )}
                  {projectFinancials.adminFees > 0 && (
                    <div className="flex justify-between text-xs font-body">
                      <span className="text-gray-500">Admin Fees</span>
                      <span className="text-gray-900 font-semibold">
                        {formatCurrency(projectFinancials.adminFees, summary.currency)}
                      </span>
                    </div>
                  )}
                  {projectFinancials.totalIncome > 0 && (
                    <div className="flex justify-between text-xs font-body">
                      <span className="text-gray-500">Other Income</span>
                      <span className="text-gray-900 font-semibold">
                        {formatCurrency(projectFinancials.totalIncome, summary.currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Marketplace */}
            {marketplaceSummary.totalOrders > 0 && (
              <div>
                <h4 className="text-sm font-heading font-semibold text-gray-700 mb-2">Marketplace</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-body">
                    <span className="text-gray-500">Orders</span>
                    <span className="text-gray-900 font-semibold">{marketplaceSummary.totalOrders}</span>
                  </div>
                  <div className="flex justify-between text-xs font-body">
                    <span className="text-gray-500">Revenue</span>
                    <span className="text-gray-900 font-semibold">
                      {formatCurrency(marketplaceSummary.totalRevenue, summary.currency)}
                    </span>
                  </div>
                  {marketplaceSummary.totalCommission > 0 && (
                    <div className="flex justify-between text-xs font-body">
                      <span className="text-gray-500">Commission</span>
                      <span className="text-gold font-semibold">
                        {formatCurrency(marketplaceSummary.totalCommission, summary.currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Aggregate totals */}
            <div>
              <h4 className="text-sm font-heading font-semibold text-gray-700 mb-2">All Sources Total</h4>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-body">
                  <span className="text-gray-500">Itinerary Pipeline</span>
                  <span className="text-gray-900 font-semibold">
                    {formatCurrency(summary.pipelineTotal, summary.currency)}
                  </span>
                </div>
                {projectFinancials.totalIncome + projectFinancials.retainers + projectFinancials.adminFees > 0 && (
                  <div className="flex justify-between text-xs font-body">
                    <span className="text-gray-500">Project Income</span>
                    <span className="text-gray-900 font-semibold">
                      {formatCurrency(
                        projectFinancials.totalIncome + projectFinancials.retainers + projectFinancials.adminFees,
                        summary.currency
                      )}
                    </span>
                  </div>
                )}
                {marketplaceSummary.totalRevenue > 0 && (
                  <div className="flex justify-between text-xs font-body">
                    <span className="text-gray-500">Marketplace</span>
                    <span className="text-gray-900 font-semibold">
                      {formatCurrency(marketplaceSummary.totalRevenue, summary.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-body border-t border-gray-100 pt-2 mt-2">
                  <span className="font-semibold text-gray-700">Grand Total</span>
                  <span className="font-heading font-semibold text-green">
                    {formatCurrency(
                      summary.pipelineTotal +
                      projectFinancials.totalIncome +
                      projectFinancials.retainers +
                      projectFinancials.adminFees +
                      marketplaceSummary.totalRevenue,
                      summary.currency
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
