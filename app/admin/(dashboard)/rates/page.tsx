'use client'

import { useState, useEffect, useCallback } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { SupplierRate, RateStatus } from '@/types'

const STATUS_COLORS: Record<RateStatus, string> = {
  quoted: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  expired: 'bg-gray-100 text-gray-500',
  booked: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
}

const EMPTY_FORM = {
  supplier_name: '',
  service: '',
  rate: '',
  currency: 'EUR',
  unit: 'per night',
  rate_type: 'net',
  vat_rate: '',
  commission_pct: '',
  valid_from: '',
  valid_to: '',
  variant: '',
  client_project: '',
  source_contact: '',
  source_date: '',
  source_note: '',
  cancellation_terms: '',
  status: 'quoted',
  notes: '',
}

export default function RatesPage() {
  const [rates, setRates] = useState<SupplierRate[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const fetchRates = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/admin/rates?${params}`)
    if (res.ok) setRates(await res.json())
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => { fetchRates() }, [fetchRates])

  function openNew() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(rate: SupplierRate) {
    setForm({
      supplier_name: rate.supplier_name,
      service: rate.service,
      rate: String(rate.rate),
      currency: rate.currency,
      unit: rate.unit,
      rate_type: rate.rate_type,
      vat_rate: rate.vat_rate != null ? String(rate.vat_rate) : '',
      commission_pct: rate.commission_pct != null ? String(rate.commission_pct) : '',
      valid_from: rate.valid_from || '',
      valid_to: rate.valid_to || '',
      variant: rate.variant || '',
      client_project: rate.client_project || '',
      source_contact: rate.source_contact || '',
      source_date: rate.source_date || '',
      source_note: rate.source_note || '',
      cancellation_terms: rate.cancellation_terms || '',
      status: rate.status,
      notes: rate.notes || '',
    })
    setEditingId(rate.id)
    setShowForm(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      ...form,
      rate: parseFloat(form.rate) || 0,
      vat_rate: form.vat_rate ? parseFloat(form.vat_rate) : null,
      commission_pct: form.commission_pct ? parseFloat(form.commission_pct) : null,
      valid_from: form.valid_from || null,
      valid_to: form.valid_to || null,
      source_date: form.source_date || null,
    }

    const url = editingId ? `/api/admin/rates/${editingId}` : '/api/admin/rates'
    const method = editingId ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setShowForm(false)
      fetchRates()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this rate?')) return
    await fetch(`/api/admin/rates/${id}`, { method: 'DELETE' })
    fetchRates()
  }

  function updateField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-green">Supplier Rates</h1>
        <Button onClick={openNew}>Add Rate</Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search supplier, service, project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        >
          <option value="">All statuses</option>
          <option value="quoted">Quoted</option>
          <option value="confirmed">Confirmed</option>
          <option value="booked">Booked</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500 font-body">Loading...</p>
      ) : rates.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-body">No rates found. Add one to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service / Variant</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Comm.</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => {
                  const isExpired = rate.valid_to && rate.valid_to < today && rate.status !== 'expired'
                  return (
                    <tr key={rate.id} className={`border-b border-gray-100 hover:bg-gray-50 ${isExpired ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {rate.supplier_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {rate.service}
                        {rate.variant && (
                          <span className="ml-1 text-xs text-gray-400">({rate.variant})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-mono">
                        {rate.currency} {Number(rate.rate).toLocaleString('en', { minimumFractionDigits: 2 })}
                        {rate.rate_type !== 'gross' && (
                          <span className="text-xs text-gray-400 ml-1">{rate.rate_type}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{rate.unit}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {rate.commission_pct != null ? `${rate.commission_pct}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{rate.client_project || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[rate.status as RateStatus] || 'bg-gray-100 text-gray-600'}`}>
                          {rate.status}
                          {isExpired && ' (!)'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => openEdit(rate)}
                          className="text-sm text-green hover:text-green-light font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(rate.id)}
                          className="text-sm text-red-400 hover:text-red-600 font-medium"
                        >
                          Del
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-green">
                {editingId ? 'Edit Rate' : 'Add Rate'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Supplier name" value={form.supplier_name} onChange={(e) => updateField('supplier_name', e.target.value)} />
                <Input label="Service" placeholder="e.g. Sea View Deluxe Room" value={form.service} onChange={(e) => updateField('service', e.target.value)} />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Input label="Rate" type="number" value={form.rate} onChange={(e) => updateField('rate', e.target.value)} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select value={form.currency} onChange={(e) => updateField('currency', e.target.value)} className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green">
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select value={form.unit} onChange={(e) => updateField('unit', e.target.value)} className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green">
                    <option value="per night">Per night</option>
                    <option value="per trip">Per trip</option>
                    <option value="per person">Per person</option>
                    <option value="per day">Per day</option>
                    <option value="per hour">Per hour</option>
                    <option value="flat">Flat fee</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate type</label>
                  <select value={form.rate_type} onChange={(e) => updateField('rate_type', e.target.value)} className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green">
                    <option value="net">Net (excl. VAT)</option>
                    <option value="gross">Gross</option>
                    <option value="inc_vat">Inc. VAT</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input label="VAT %" type="number" placeholder="e.g. 10" value={form.vat_rate} onChange={(e) => updateField('vat_rate', e.target.value)} />
                <Input label="Commission %" type="number" placeholder="e.g. 10" value={form.commission_pct} onChange={(e) => updateField('commission_pct', e.target.value)} />
                <Input label="Variant" placeholder="e.g. Deluxe Sea View" value={form.variant} onChange={(e) => updateField('variant', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Valid from" type="date" value={form.valid_from} onChange={(e) => updateField('valid_from', e.target.value)} />
                <Input label="Valid to" type="date" value={form.valid_to} onChange={(e) => updateField('valid_to', e.target.value)} />
              </div>
              <Input label="Client project" placeholder="e.g. Vitor Lima Babymoon" value={form.client_project} onChange={(e) => updateField('client_project', e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Source contact" placeholder="e.g. Melania Laccioli" value={form.source_contact} onChange={(e) => updateField('source_contact', e.target.value)} />
                <Input label="Source date" type="date" value={form.source_date} onChange={(e) => updateField('source_date', e.target.value)} />
              </div>
              <Input label="Source note" placeholder="e.g. Email 19 Mar, 24hr validity" value={form.source_note} onChange={(e) => updateField('source_note', e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation terms</label>
                <textarea
                  value={form.cancellation_terms}
                  onChange={(e) => updateField('cancellation_terms', e.target.value)}
                  rows={2}
                  className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                  placeholder="e.g. 30 days prior, full stay penalty"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => updateField('status', e.target.value)} className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green">
                    <option value="quoted">Quoted</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="booked">Booked</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={2}
                    className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.supplier_name || !form.service || !form.rate}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add Rate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
