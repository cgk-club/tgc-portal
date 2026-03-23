"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import type { PaymentItem, PaymentMethod, PaymentStatus } from "@/types";

const STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "deposit_paid", label: "Deposit Paid" },
  { value: "fully_paid", label: "Fully Paid" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cc_link", label: "CC Payment Link" },
  { value: "included", label: "Included" },
  { value: "client_direct", label: "Client Direct" },
];

const STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  deposit_paid: "bg-blue-100 text-blue-800",
  fully_paid: "bg-green-100 text-green-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-500",
};

const EMPTY_FORM = {
  service_name: "",
  supplier_name: "",
  amount: "",
  currency: "EUR",
  payment_method: "bank_transfer" as PaymentMethod,
  payment_status: "pending" as PaymentStatus,
  cc_payment_url: "",
  bank_iban: "",
  bank_bic: "",
  bank_account_holder: "",
  bank_name: "",
  bank_reference: "",
  deposit_deadline: "",
  notes: "",
  client_notes: "",
};

function InlineInput({ value, onChange, className = "", type = "text", step, placeholder }: {
  value: string | number; onChange: (val: string) => void; className?: string; type?: string; step?: string; placeholder?: string;
}) {
  return (
    <input
      type={type}
      step={step}
      placeholder={placeholder}
      defaultValue={value}
      onBlur={(e) => { if (e.target.value !== String(value)) onChange(e.target.value); }}
      className={`bg-transparent border-0 p-0 text-sm font-body focus:outline-none focus:ring-0 hover:bg-gray-50 focus:bg-gray-50 rounded px-1 -mx-1 w-full ${className}`}
    />
  );
}

export default function AdminPaymentsPage() {
  const params = useParams();
  const itineraryId = params.id as string;

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/itineraries/${itineraryId}/payments`);
    if (res.ok) setPayments(await res.json());
    setLoading(false);
  }, [itineraryId]);

  useEffect(() => { load(); }, [load]);

  function calcClientAmount(amount: number, commType?: string, commValue?: number): number | null {
    if (!commType || !commValue) return null;
    if (commType === "percentage") return Math.round((amount / (1 - commValue / 100)) * 100) / 100;
    if (commType === "fixed") return amount + commValue;
    return null;
  }

  async function handleFieldUpdate(paymentId: string, fields: Record<string, unknown>) {
    await fetch(`/api/admin/itineraries/${itineraryId}/payments/${paymentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    load();
  }

  async function handleDelete(paymentId: string) {
    if (!confirm("Delete this payment item?")) return;
    await fetch(`/api/admin/itineraries/${itineraryId}/payments/${paymentId}`, { method: "DELETE" });
    load();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const bankDetails = form.payment_method === "bank_transfer" && form.bank_iban
      ? { iban: form.bank_iban, bic: form.bank_bic, account_holder: form.bank_account_holder, bank_name: form.bank_name, reference: form.bank_reference }
      : null;

    await fetch(`/api/admin/itineraries/${itineraryId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_name: form.service_name, supplier_name: form.supplier_name,
        amount: parseFloat(form.amount) || 0, currency: form.currency,
        payment_method: form.payment_method, payment_status: form.payment_status,
        cc_payment_url: form.cc_payment_url || null, bank_details: bankDetails,
        deposit_deadline: form.deposit_deadline || null, notes: form.notes || null,
        client_notes: form.client_notes || null, sort_order: payments.length,
      }),
    });
    setForm(EMPTY_FORM); setShowForm(false); setSaving(false); load();
  }

  async function importFromItinerary() {
    const res = await fetch(`/api/admin/itineraries/${itineraryId}`);
    if (!res.ok) return;
    const itin = await res.json();
    const days = itin.days || [];
    let sortOrder = payments.length;
    for (const day of days) {
      for (const item of day.items || []) {
        if (item.unit_price && item.unit_price > 0) {
          await fetch(`/api/admin/itineraries/${itineraryId}/payments`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              service_name: item.custom_title || item.fiche?.headline || "Service",
              supplier_name: item.fiche?.tags?.[0] || "Supplier",
              amount: item.unit_price * (item.quantity || 1), currency: "EUR",
              payment_method: "bank_transfer", payment_status: "pending", sort_order: sortOrder++,
            }),
          });
        }
      }
    }
    load();
  }

  const total = payments.reduce((s, p) => p.payment_status !== "cancelled" ? s + Number(p.amount) : s, 0);
  const clientTotal = payments.reduce((s, p) => p.payment_status !== "cancelled" ? s + (Number(p.client_amount) || Number(p.amount)) : s, 0);
  const paid = payments.reduce((s, p) => ["fully_paid", "confirmed"].includes(p.payment_status) ? s + (Number(p.client_amount) || Number(p.amount)) : s, 0);

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading payments...</div>;

  return (
    <div className="p-4 sm:p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-heading text-lg font-semibold text-green">Payment Tracker</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            <span className="text-xs font-body text-gray-500">Net: <strong className="text-gray-700">EUR {total.toLocaleString()}</strong></span>
            <span className="text-xs font-body text-gray-500">Client: <strong className="text-green">EUR {clientTotal.toLocaleString()}</strong></span>
            <span className="text-xs font-body text-gray-500">Paid: <strong className="text-green">EUR {paid.toLocaleString()}</strong></span>
            <span className="text-xs font-body text-gray-500">Remaining: <strong className="text-amber-700">EUR {(clientTotal - paid).toLocaleString()}</strong></span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={importFromItinerary} className="text-xs font-body border border-green/20 text-green px-3 py-1.5 rounded hover:bg-green/5 transition-colors">
            Import from Itinerary
          </button>
          <button onClick={() => setShowForm(!showForm)} className="text-xs font-body bg-green text-white px-3 py-1.5 rounded hover:bg-green/90 transition-colors">
            Add Payment
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 border rounded-lg p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Service name" value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })} required className="text-sm border rounded px-3 py-2" />
            <input placeholder="Supplier name" value={form.supplier_name} onChange={e => setForm({ ...form, supplier_name: e.target.value })} required className="text-sm border rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input placeholder="Amount" type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required className="text-sm border rounded px-3 py-2" />
            <input placeholder="Currency" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="text-sm border rounded px-3 py-2" />
            <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value as PaymentMethod })} className="text-sm border rounded px-3 py-2">
              {METHOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input placeholder="Deposit deadline" type="date" value={form.deposit_deadline} onChange={e => setForm({ ...form, deposit_deadline: e.target.value })} className="text-sm border rounded px-3 py-2" />
          </div>
          {form.payment_method === "bank_transfer" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input placeholder="IBAN" value={form.bank_iban} onChange={e => setForm({ ...form, bank_iban: e.target.value })} className="text-sm border rounded px-3 py-2" />
              <input placeholder="BIC" value={form.bank_bic} onChange={e => setForm({ ...form, bank_bic: e.target.value })} className="text-sm border rounded px-3 py-2" />
              <input placeholder="Account holder" value={form.bank_account_holder} onChange={e => setForm({ ...form, bank_account_holder: e.target.value })} className="text-sm border rounded px-3 py-2" />
            </div>
          )}
          {form.payment_method === "cc_link" && (
            <input placeholder="Payment URL" value={form.cc_payment_url} onChange={e => setForm({ ...form, cc_payment_url: e.target.value })} className="text-sm border rounded px-3 py-2 w-full" />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Internal notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="text-sm border rounded px-3 py-2" />
            <input placeholder="Client-visible notes" value={form.client_notes} onChange={e => setForm({ ...form, client_notes: e.target.value })} className="text-sm border rounded px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="text-xs bg-green text-white px-4 py-2 rounded hover:bg-green/90">{saving ? "Saving..." : "Save"}</button>
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="text-xs text-gray-500 px-4 py-2">Cancel</button>
          </div>
        </form>
      )}

      {/* Payment cards */}
      {payments.length > 0 ? (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="bg-white border rounded-lg p-4">
              {/* Row 1: Service + Status + Delete */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <InlineInput
                    value={p.service_name}
                    onChange={(val) => handleFieldUpdate(p.id, { service_name: val })}
                    className="text-gray-900 font-medium text-sm"
                  />
                  <InlineInput
                    value={p.supplier_name}
                    onChange={(val) => handleFieldUpdate(p.id, { supplier_name: val })}
                    className="text-gray-500 text-xs mt-0.5"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={p.payment_status}
                    onChange={(e) => handleFieldUpdate(p.id, { payment_status: e.target.value })}
                    className={`text-[11px] font-body font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer ${STATUS_COLORS[p.payment_status as PaymentStatus]}`}
                  >
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                </div>
              </div>

              {/* Row 2: Financials grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                {/* Net amount */}
                <div>
                  <span className="text-gray-400 block mb-0.5">Net Amount</span>
                  <div className="flex items-center gap-1">
                    <input
                      defaultValue={p.currency}
                      onBlur={(e) => { if (e.target.value !== p.currency) handleFieldUpdate(p.id, { currency: e.target.value }); }}
                      className="w-10 bg-transparent border-0 p-0 text-xs font-body text-gray-500 focus:outline-none focus:ring-0 hover:bg-gray-50 focus:bg-gray-50 rounded"
                    />
                    <input
                      type="number" step="0.01"
                      defaultValue={Number(p.amount)}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val !== Number(p.amount)) {
                          const ca = calcClientAmount(val, p.commission_type || undefined, Number(p.commission_value) || undefined);
                          handleFieldUpdate(p.id, { amount: val, ...(ca !== null ? { client_amount: ca } : {}) });
                        }
                      }}
                      className="w-20 bg-transparent border-0 p-0 text-xs font-body font-semibold focus:outline-none focus:ring-0 hover:bg-gray-50 focus:bg-gray-50 rounded"
                    />
                  </div>
                </div>

                {/* Commission */}
                <div>
                  <span className="text-gray-400 block mb-0.5">Commission</span>
                  <div className="flex items-center gap-1">
                    <select
                      value={p.commission_type || ""}
                      onChange={(e) => {
                        const ct = e.target.value || null;
                        const cv = p.commission_value ? Number(p.commission_value) : null;
                        const ca = ct && cv ? calcClientAmount(Number(p.amount), ct, cv) : null;
                        handleFieldUpdate(p.id, { commission_type: ct, client_amount: ca });
                      }}
                      className="bg-transparent border-0 p-0 text-xs font-body text-gray-500 cursor-pointer focus:outline-none focus:ring-0"
                    >
                      <option value="">None</option>
                      <option value="percentage">%</option>
                      <option value="fixed">+ Fixed</option>
                    </select>
                    {p.commission_type && (
                      <input
                        type="number" step="0.01"
                        defaultValue={p.commission_value || ""}
                        placeholder={p.commission_type === "percentage" ? "10" : "500"}
                        onBlur={(e) => {
                          const cv = parseFloat(e.target.value) || 0;
                          const ca = calcClientAmount(Number(p.amount), p.commission_type!, cv);
                          handleFieldUpdate(p.id, { commission_value: cv, client_amount: ca });
                        }}
                        className="w-14 bg-transparent border-0 p-0 text-xs font-body text-gray-700 focus:outline-none focus:ring-0 hover:bg-gray-50 focus:bg-gray-50 rounded"
                      />
                    )}
                  </div>
                </div>

                {/* Client pays */}
                <div>
                  <span className="text-gray-400 block mb-0.5">Client Pays</span>
                  <span className="font-semibold text-green">
                    {p.currency} {(Number(p.client_amount) || Number(p.amount)).toLocaleString()}
                  </span>
                </div>

                {/* Method */}
                <div>
                  <span className="text-gray-400 block mb-0.5">Method</span>
                  <select
                    value={p.payment_method}
                    onChange={(e) => handleFieldUpdate(p.id, { payment_method: e.target.value })}
                    className="bg-transparent border-0 p-0 text-xs font-body text-gray-700 cursor-pointer focus:outline-none focus:ring-0"
                  >
                    {METHOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Deadline */}
                <div>
                  <span className="text-gray-400 block mb-0.5">Deadline</span>
                  <input
                    type="date"
                    defaultValue={p.deposit_deadline || ""}
                    onBlur={(e) => handleFieldUpdate(p.id, { deposit_deadline: e.target.value || null })}
                    className="bg-transparent border-0 p-0 text-xs font-body text-gray-700 focus:outline-none focus:ring-0 hover:bg-gray-50 focus:bg-gray-50 rounded"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">No payment items yet. Add one or import from the itinerary.</p>
      )}

      {/* Method definitions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-xs font-body font-medium text-gray-500 uppercase tracking-wider mb-3">Payment Method Definitions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-body text-gray-600">
          <div className="flex gap-2">
            <span className="font-medium text-gray-800 shrink-0">Bank Transfer:</span>
            <span>Client or TGC wires funds directly to the supplier. Bank details shown to client in the portal. No CC fees.</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium text-gray-800 shrink-0">CC Payment Link:</span>
            <span>Supplier provides a payment URL. Client clicks &quot;Pay Now&quot; in the portal and pays the supplier directly by card.</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium text-gray-800 shrink-0">Client Direct:</span>
            <span>Client pays at the point of service (e.g. restaurant bills, on-site charges). No advance payment needed.</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium text-gray-800 shrink-0">Included:</span>
            <span>Covered by another line item (e.g. yacht chef included in charter, breakfast included in hotel rate). No separate payment.</span>
          </div>
        </div>
      </div>

      {/* Status definitions */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-body font-medium text-gray-500 uppercase tracking-wider mb-3">Status Definitions</h3>
        <div className="flex flex-wrap gap-4 text-xs font-body text-gray-600">
          <div><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mr-1 ${STATUS_COLORS.pending}`}>Pending</span> Awaiting payment</div>
          <div><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mr-1 ${STATUS_COLORS.deposit_paid}`}>Deposit Paid</span> Deposit received, balance due</div>
          <div><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mr-1 ${STATUS_COLORS.fully_paid}`}>Fully Paid</span> Full amount received</div>
          <div><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mr-1 ${STATUS_COLORS.confirmed}`}>Confirmed</span> Paid and confirmed by supplier</div>
          <div><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mr-1 ${STATUS_COLORS.cancelled}`}>Cancelled</span> Service cancelled</div>
        </div>
      </div>
    </div>
  );
}
