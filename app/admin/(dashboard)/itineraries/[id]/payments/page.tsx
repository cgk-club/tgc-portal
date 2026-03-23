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

  async function handleStatusChange(paymentId: string, newStatus: PaymentStatus) {
    await fetch(`/api/admin/itineraries/${itineraryId}/payments/${paymentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_status: newStatus }),
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
        service_name: form.service_name,
        supplier_name: form.supplier_name,
        amount: parseFloat(form.amount) || 0,
        currency: form.currency,
        payment_method: form.payment_method,
        payment_status: form.payment_status,
        cc_payment_url: form.cc_payment_url || null,
        bank_details: bankDetails,
        deposit_deadline: form.deposit_deadline || null,
        notes: form.notes || null,
        client_notes: form.client_notes || null,
        sort_order: payments.length,
      }),
    });

    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
    load();
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
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              service_name: item.custom_title || item.fiche?.headline || "Service",
              supplier_name: item.fiche?.tags?.[0] || "Supplier",
              amount: item.unit_price * (item.quantity || 1),
              currency: "EUR",
              payment_method: "bank_transfer",
              payment_status: "pending",
              sort_order: sortOrder++,
            }),
          });
        }
      }
    }
    load();
  }

  const total = payments.reduce((s, p) => p.payment_status !== "cancelled" ? s + Number(p.amount) : s, 0);
  const paid = payments.reduce((s, p) => ["fully_paid", "confirmed"].includes(p.payment_status) ? s + Number(p.amount) : s, 0);

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading payments...</div>;

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-lg font-semibold text-green">Payment Tracker</h1>
          <p className="text-xs font-body text-gray-500 mt-1">
            Total: EUR {total.toLocaleString()} | Paid: EUR {paid.toLocaleString()} | Remaining: EUR {(total - paid).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
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
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Service name" value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })} required className="text-sm border rounded px-3 py-2" />
            <input placeholder="Supplier name" value={form.supplier_name} onChange={e => setForm({ ...form, supplier_name: e.target.value })} required className="text-sm border rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <input placeholder="Amount" type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required className="text-sm border rounded px-3 py-2" />
            <input placeholder="Currency" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="text-sm border rounded px-3 py-2" />
            <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value as PaymentMethod })} className="text-sm border rounded px-3 py-2">
              {METHOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input placeholder="Deposit deadline" type="date" value={form.deposit_deadline} onChange={e => setForm({ ...form, deposit_deadline: e.target.value })} className="text-sm border rounded px-3 py-2" />
          </div>

          {form.payment_method === "bank_transfer" && (
            <div className="grid grid-cols-3 gap-3">
              <input placeholder="IBAN" value={form.bank_iban} onChange={e => setForm({ ...form, bank_iban: e.target.value })} className="text-sm border rounded px-3 py-2" />
              <input placeholder="BIC" value={form.bank_bic} onChange={e => setForm({ ...form, bank_bic: e.target.value })} className="text-sm border rounded px-3 py-2" />
              <input placeholder="Account holder" value={form.bank_account_holder} onChange={e => setForm({ ...form, bank_account_holder: e.target.value })} className="text-sm border rounded px-3 py-2" />
            </div>
          )}

          {form.payment_method === "cc_link" && (
            <input placeholder="Payment URL" value={form.cc_payment_url} onChange={e => setForm({ ...form, cc_payment_url: e.target.value })} className="text-sm border rounded px-3 py-2 w-full" />
          )}

          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Internal notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="text-sm border rounded px-3 py-2" />
            <input placeholder="Client-visible notes" value={form.client_notes} onChange={e => setForm({ ...form, client_notes: e.target.value })} className="text-sm border rounded px-3 py-2" />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="text-xs bg-green text-white px-4 py-2 rounded hover:bg-green/90">{saving ? "Saving..." : "Save"}</button>
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="text-xs text-gray-500 px-4 py-2">Cancel</button>
          </div>
        </form>
      )}

      {/* Payment items table */}
      {payments.length > 0 ? (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium font-body">Service</th>
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium font-body">Supplier</th>
                <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-medium font-body">Amount</th>
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium font-body">Method</th>
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium font-body">Status</th>
                <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium font-body">Deadline</th>
                <th className="text-right px-4 py-2.5 text-xs text-gray-500 font-medium font-body"></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-body text-gray-900">{p.service_name}</td>
                  <td className="px-4 py-3 font-body text-gray-500">{p.supplier_name}</td>
                  <td className="px-4 py-3 font-body text-right font-medium">{p.currency} {Number(p.amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-body text-gray-600">{METHOD_OPTIONS.find(m => m.value === p.payment_method)?.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={p.payment_status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value as PaymentStatus)}
                      className={`text-[11px] font-body font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer ${STATUS_COLORS[p.payment_status]}`}
                    >
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs font-body text-gray-500">
                    {p.deposit_deadline ? new Date(p.deposit_deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "---"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">No payment items yet. Add one or import from the itinerary.</p>
      )}
    </div>
  );
}
