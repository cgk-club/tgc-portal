"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import type { PaymentItem, PaymentMethod, PaymentStatus, PaymentDocument, BankDetails } from "@/types";

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

const DOC_CATEGORIES = [
  { value: "contract", label: "Contract" },
  { value: "invoice", label: "Invoice" },
  { value: "cc_auth_form", label: "CC Auth Form" },
  { value: "receipt", label: "Receipt" },
  { value: "other", label: "Other" },
];

const DOC_CATEGORY_COLORS: Record<string, string> = {
  contract: "bg-purple-100 text-purple-700",
  invoice: "bg-blue-100 text-blue-700",
  cc_auth_form: "bg-amber-100 text-amber-700",
  receipt: "bg-green-100 text-green-700",
  other: "bg-gray-100 text-gray-600",
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

function formatDate(d: string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminPaymentsPage() {
  const params = useParams();
  const itineraryId = params.id as string;

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Default bank details
  const [defaultBank, setDefaultBank] = useState<BankDetails | null>(null);
  const [showBankConfig, setShowBankConfig] = useState(false);
  const [bankForm, setBankForm] = useState({ iban: "", bic: "", account_holder: "", bank_name: "", reference: "" });

  // Documents per payment
  const [docs, setDocs] = useState<Record<string, PaymentDocument[]>>({});
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/itineraries/${itineraryId}/payments`);
    if (res.ok) setPayments(await res.json());
    // Load itinerary for default bank details
    const itinRes = await fetch(`/api/admin/itineraries/${itineraryId}`);
    if (itinRes.ok) {
      const itin = await itinRes.json();
      if (itin.default_bank_details) {
        setDefaultBank(itin.default_bank_details);
        setBankForm(itin.default_bank_details);
      }
    }
    setLoading(false);
  }, [itineraryId]);

  useEffect(() => { load(); }, [load]);

  // Auto-load documents for all payments so signature status is visible at a glance
  useEffect(() => {
    if (payments.length > 0) {
      payments.forEach(p => {
        if (!docs[p.id]) loadDocs(p.id);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments]);

  async function loadDocs(paymentId: string) {
    const res = await fetch(`/api/admin/itineraries/${itineraryId}/payments/${paymentId}/documents`);
    if (res.ok) {
      const data = await res.json();
      setDocs(prev => ({ ...prev, [paymentId]: data }));
    }
  }

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

  async function saveDefaultBank() {
    const bankData = bankForm.iban ? bankForm : null;
    await fetch(`/api/admin/itineraries/${itineraryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ default_bank_details: bankData }),
    });
    setDefaultBank(bankData);
    setShowBankConfig(false);
  }

  async function handleDocUpload(paymentId: string) {
    const input = fileInputRefs.current[paymentId];
    if (!input?.files?.[0]) return;

    const file = input.files[0];
    const title = file.name.replace(/\.[^.]+$/, "");
    const category = (document.getElementById(`doc-cat-${paymentId}`) as HTMLSelectElement)?.value || "other";
    const reqSig = (document.getElementById(`doc-sig-${paymentId}`) as HTMLInputElement)?.checked || false;

    setUploadingDoc(paymentId);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("document_category", category);
    formData.append("requires_signature", String(reqSig));

    await fetch(`/api/admin/itineraries/${itineraryId}/payments/${paymentId}/documents`, {
      method: "POST",
      body: formData,
    });
    input.value = "";
    setUploadingDoc(null);
    loadDocs(paymentId);
  }

  async function handleDocDelete(paymentId: string, docId: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/admin/itineraries/${itineraryId}/payments/${paymentId}/documents/${docId}`, { method: "DELETE" });
    loadDocs(paymentId);
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
          <button onClick={() => setShowBankConfig(!showBankConfig)} className="text-xs font-body border border-green/20 text-green px-3 py-1.5 rounded hover:bg-green/5 transition-colors">
            {defaultBank ? "Edit Bank" : "Set Bank"}
          </button>
          <button onClick={importFromItinerary} className="text-xs font-body border border-green/20 text-green px-3 py-1.5 rounded hover:bg-green/5 transition-colors">
            Import from Itinerary
          </button>
          <button onClick={() => setShowForm(!showForm)} className="text-xs font-body bg-green text-white px-3 py-1.5 rounded hover:bg-green/90 transition-colors">
            Add Payment
          </button>
        </div>
      </div>

      {/* Default bank account config */}
      {showBankConfig && (
        <div className="bg-gray-50 border rounded-lg p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-body font-medium text-gray-700 uppercase tracking-wider">Default Bank Account for Client</h3>
            {defaultBank && (
              <span className="text-[10px] font-body text-green bg-green/10 px-2 py-0.5 rounded-full">Active</span>
            )}
          </div>
          <p className="text-[11px] font-body text-gray-400">Leave blank to use TGC default (FR76 1732 8844 0048 2021 3165 365). Set supplier bank details here for items like yacht charters where the client wires directly to the supplier.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input placeholder="IBAN" value={bankForm.iban} onChange={e => setBankForm({ ...bankForm, iban: e.target.value })} className="text-sm border rounded px-3 py-2" />
            <input placeholder="BIC" value={bankForm.bic} onChange={e => setBankForm({ ...bankForm, bic: e.target.value })} className="text-sm border rounded px-3 py-2" />
            <input placeholder="Account holder" value={bankForm.account_holder} onChange={e => setBankForm({ ...bankForm, account_holder: e.target.value })} className="text-sm border rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Bank name" value={bankForm.bank_name} onChange={e => setBankForm({ ...bankForm, bank_name: e.target.value })} className="text-sm border rounded px-3 py-2" />
            <input placeholder="Reference" value={bankForm.reference} onChange={e => setBankForm({ ...bankForm, reference: e.target.value })} className="text-sm border rounded px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button onClick={saveDefaultBank} className="text-xs bg-green text-white px-4 py-2 rounded hover:bg-green/90">Save</button>
            <button onClick={() => { setBankForm({ iban: "", bic: "", account_holder: "", bank_name: "", reference: "" }); saveDefaultBank(); }} className="text-xs text-red-500 px-4 py-2">Clear</button>
            <button onClick={() => setShowBankConfig(false)} className="text-xs text-gray-500 px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

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
            <input placeholder="Internal notes (commission, contacts — never shown to client)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="text-sm border rounded px-3 py-2" />
            <div>
              <input placeholder="Client-visible notes (NO commission info)" value={form.client_notes} onChange={e => setForm({ ...form, client_notes: e.target.value })} className={`text-sm border rounded px-3 py-2 w-full ${/\b(commission|margin|markup|net rate|our fee|tgc fee)\b/i.test(form.client_notes) ? 'border-red-500 bg-red-50' : ''}`} />
              {/\b(commission|margin|markup|net rate|our fee|tgc fee)\b/i.test(form.client_notes) && (
                <p className="text-[11px] text-red-600 mt-1">Commission/margin info must go in Internal notes, not here. Clients can see this field.</p>
              )}
            </div>
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
                  {/* Signature status badges (at a glance) */}
                  {docs[p.id]?.some(d => d.requires_signature && d.signature_status === 'signed') && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-green-100 text-green-700">Signed</span>
                  )}
                  {docs[p.id]?.some(d => d.requires_signature && d.signature_status !== 'signed') && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-amber-100 text-amber-700">Awaiting sig.</span>
                  )}
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

              {/* Row 3: Payment dates + Click tracking + Bank badge */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-gray-400">
                {p.deposit_paid_at && <span>Deposit: {formatDate(p.deposit_paid_at)}</span>}
                {p.paid_at && <span>Paid: {formatDate(p.paid_at)}</span>}
                {p.payment_method === "cc_link" && (
                  <span>Clicks: {p.link_click_count || 0}{p.last_clicked_at ? ` (last: ${formatDate(p.last_clicked_at)})` : ""}</span>
                )}
                {p.payment_method === "cc_link" && p.cc_payment_url && (
                  <a href={p.cc_payment_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-[200px]">{p.cc_payment_url}</a>
                )}
                {p.bank_details ? (
                  <span className="text-purple-500">Custom bank: {p.bank_details.account_holder || p.bank_details.iban?.slice(-8)}</span>
                ) : p.payment_method === "bank_transfer" && (
                  <span className="text-gray-300">Using default bank</span>
                )}
              </div>

              {/* Row 4: Documents section */}
              <div className="mt-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    const isOpen = expandedDocs[p.id];
                    if (!isOpen && !docs[p.id]) loadDocs(p.id);
                    setExpandedDocs(prev => ({ ...prev, [p.id]: !isOpen }));
                  }}
                  className="text-[11px] font-body text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <span>{expandedDocs[p.id] ? "▼" : "▶"}</span>
                  Documents {docs[p.id]?.length ? `(${docs[p.id].length})` : ""}
                </button>

                {expandedDocs[p.id] && (
                  <div className="mt-2 space-y-2">
                    {/* Document list */}
                    {(docs[p.id] || []).map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 text-xs bg-gray-50 rounded px-2 py-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${DOC_CATEGORY_COLORS[doc.document_category] || DOC_CATEGORY_COLORS.other}`}>
                          {DOC_CATEGORIES.find(c => c.value === doc.document_category)?.label || doc.document_category}
                        </span>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate flex-1">
                          {doc.title}
                        </a>
                        {doc.requires_signature && (
                          <>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${doc.signature_status === "signed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                              {doc.signature_status === "signed" ? "Signed" : "Awaiting signature"}
                              {doc.signatures?.[0]?.signed_at && ` ${formatDate(doc.signatures[0].signed_at)}`}
                            </span>
                            {doc.signature_status === "signed" && (
                              <a
                                href={`/api/admin/documents/${doc.id}/signature-page`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-green-600 hover:text-green-800 font-medium"
                              >
                                Download Signature
                              </a>
                            )}
                          </>
                        )}
                        <span className="text-gray-300 text-[10px]">{formatDate(doc.created_at)}</span>
                        <button onClick={() => handleDocDelete(p.id, doc.id)} className="text-red-400 hover:text-red-600 text-[10px]">Delete</button>
                      </div>
                    ))}

                    {/* Upload form */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <select id={`doc-cat-${p.id}`} className="text-[11px] border rounded px-2 py-1 text-gray-600">
                        {DOC_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      <label className="flex items-center gap-1 text-[11px] text-gray-500">
                        <input type="checkbox" id={`doc-sig-${p.id}`} className="w-3 h-3" />
                        Requires signature
                      </label>
                      <input
                        type="file"
                        ref={(el) => { fileInputRefs.current[p.id] = el; }}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={() => handleDocUpload(p.id)}
                        className="text-[11px] text-gray-500 file:mr-2 file:text-[10px] file:border file:border-green/20 file:rounded file:px-2 file:py-0.5 file:text-green file:bg-white hover:file:bg-green/5"
                      />
                      {uploadingDoc === p.id && <span className="text-[10px] text-gray-400">Uploading...</span>}
                    </div>
                  </div>
                )}
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
