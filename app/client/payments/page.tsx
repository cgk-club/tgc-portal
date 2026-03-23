"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientNav from "@/components/client/ClientNav";
import type { PaymentItem, PaymentStatus, PaymentMethod } from "@/types";

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  deposit_paid: "bg-blue-100 text-blue-800",
  fully_paid: "bg-green-100 text-green-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-500 line-through",
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  deposit_paid: "Deposit Paid",
  fully_paid: "Fully Paid",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: "Bank Transfer",
  cc_link: "Card Payment",
  included: "Included",
  client_direct: "Direct Payment",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="ml-2 text-xs text-gold hover:text-green transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function PaymentCard({ item }: { item: PaymentItem }) {
  const [expanded, setExpanded] = useState(false);
  const bank = item.bank_details as PaymentItem["bank_details"];

  return (
    <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-green/[0.02] transition-colors"
      >
        <div className="flex-1 min-w-0 mr-4">
          <p className="font-body font-medium text-sm text-gray-900 truncate">{item.service_name}</p>
          <p className="font-body text-xs text-gray-500 mt-0.5">{item.supplier_name}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-body text-sm font-semibold text-green">
            {item.currency} {(Number(item.client_amount) || Number(item.amount)).toLocaleString("en", { minimumFractionDigits: 0 })}
          </span>
          <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[item.payment_status]}`}>
            {item.payment_status === "confirmed" && <span className="mr-1">&#10003;</span>}
            {STATUS_LABELS[item.payment_status]}
          </span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-4 border-t border-green/5 pt-3 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-body uppercase tracking-wider text-gray-400">Method</span>
            <span className="text-xs font-body text-gray-700">{METHOD_LABELS[item.payment_method]}</span>
          </div>

          {item.payment_method === "bank_transfer" && bank && (
            <div className="bg-gray-50 rounded-md p-3 space-y-1.5">
              <p className="text-[10px] font-body uppercase tracking-wider text-gray-400 mb-2">Bank Details</p>
              {bank.account_holder && <p className="text-xs font-body text-gray-700"><span className="text-gray-500">Account:</span> {bank.account_holder}</p>}
              {bank.bank_name && <p className="text-xs font-body text-gray-700"><span className="text-gray-500">Bank:</span> {bank.bank_name}</p>}
              <p className="text-xs font-body text-gray-700">
                <span className="text-gray-500">IBAN:</span> {bank.iban}<CopyButton text={bank.iban.replace(/\s/g, "")} />
              </p>
              <p className="text-xs font-body text-gray-700"><span className="text-gray-500">BIC:</span> {bank.bic}</p>
              {bank.reference && <p className="text-xs font-body text-gray-700"><span className="text-gray-500">Reference:</span> {bank.reference}</p>}
            </div>
          )}

          {item.payment_method === "cc_link" && item.cc_payment_url && (
            <a
              href={item.cc_payment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gold text-white text-xs font-body font-medium px-4 py-2 rounded hover:bg-gold/90 transition-colors"
            >
              Pay Now
            </a>
          )}

          {item.payment_method === "included" && (
            <p className="text-xs font-body text-gray-500 italic">Included in your package</p>
          )}

          {item.deposit_deadline && (
            <p className="text-xs font-body text-amber-700">
              Deposit due by: {new Date(item.deposit_deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}

          {item.client_notes && (
            <p className="text-xs font-body text-gray-600 mt-2">{item.client_notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [itinerary, setItinerary] = useState<{ id: string; title: string; client_name: string; currency: string } | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [itineraries, setItineraries] = useState<{ id: string; title: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/client/session");
      if (!sessionRes.ok) { router.push("/client/login"); return; }

      // Get client's itineraries
      const itinRes = await fetch("/api/client/itineraries");
      if (!itinRes.ok) { setLoading(false); return; }
      const itinData = await itinRes.json();
      const shared = (itinData || []).filter((i: { status: string }) => i.status === "shared");

      if (shared.length === 0) { setLoading(false); return; }
      setItineraries(shared.map((i: { id: string; title: string }) => ({ id: i.id, title: i.title })));

      // Auto-select first or the one from URL
      const targetId = shared[0].id;
      setSelectedId(targetId);
      await loadPayments(targetId);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadPayments(itineraryId: string) {
    setLoading(true);
    const res = await fetch(`/api/client/itineraries/${itineraryId}/payments`);
    if (res.ok) {
      const data = await res.json();
      setItinerary(data.itinerary);
      setPayments(data.payments);
    }
    setLoading(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-pearl"><p className="text-gray-400 font-body">Loading...</p></div>;

  const getClientAmount = (p: PaymentItem) => Number(p.client_amount) || Number(p.amount);
  const totalAmount = payments.reduce((sum, p) => p.payment_status !== "cancelled" ? sum + getClientAmount(p) : sum, 0);
  const paidAmount = payments.reduce((sum, p) => ["fully_paid", "confirmed"].includes(p.payment_status) ? sum + getClientAmount(p) : sum, 0);
  const depositAmount = payments.reduce((sum, p) => p.payment_status === "deposit_paid" ? sum + getClientAmount(p) : sum, 0);
  const remainingAmount = totalAmount - paidAmount;
  const progressPct = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="payments" />
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">

        {/* Itinerary selector if multiple */}
        {itineraries.length > 1 && (
          <div className="mb-6">
            <select
              value={selectedId || ""}
              onChange={(e) => { setSelectedId(e.target.value); loadPayments(e.target.value); }}
              className="text-sm font-body border border-green/20 rounded px-3 py-2 bg-white text-gray-700"
            >
              {itineraries.map((i) => (
                <option key={i.id} value={i.id}>{i.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[2px] text-gold uppercase mb-2 font-body">Payments</p>
          <h1 className="font-heading text-xl font-semibold text-green">
            {itinerary?.title || "Your Journey"}
          </h1>
        </div>

        {/* Budget overview */}
        {payments.length > 0 && (
          <div className="bg-white border border-green/10 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-baseline mb-3">
              <div>
                <p className="text-xs font-body text-gray-500">Total</p>
                <p className="font-heading text-lg font-semibold text-green">EUR {totalAmount.toLocaleString("en", { minimumFractionDigits: 0 })}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-body text-gray-500">Paid</p>
                <p className="font-heading text-lg font-semibold text-green">{paidAmount > 0 ? `EUR ${paidAmount.toLocaleString("en", { minimumFractionDigits: 0 })}` : "---"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-body text-gray-500">Remaining</p>
                <p className="font-heading text-lg font-semibold text-amber-700">EUR {remainingAmount.toLocaleString("en", { minimumFractionDigits: 0 })}</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-green h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            {depositAmount > 0 && (
              <p className="text-xs font-body text-blue-600 mt-2">EUR {depositAmount.toLocaleString()} in deposits paid (awaiting balance)</p>
            )}
          </div>
        )}

        {/* Lump sum wire option */}
        <div className="bg-green/[0.03] border border-green/10 rounded-lg p-5 mb-8">
          <p className="text-xs font-body font-medium text-green mb-2">Prefer to make a single payment?</p>
          <p className="text-xs font-body text-gray-600 mb-3">
            Wire the total to The Gatekeepers Club and we handle all supplier payments on your behalf.
          </p>
          <div className="bg-white rounded-md p-3 space-y-1.5">
            <p className="text-xs font-body text-gray-700"><span className="text-gray-500">Account:</span> The Gatekeepers Club</p>
            <p className="text-xs font-body text-gray-700">
              <span className="text-gray-500">IBAN:</span> FR76 1732 8844 0048 2021 3165 365<CopyButton text="FR7617328844004820213165365" />
            </p>
            <p className="text-xs font-body text-gray-700"><span className="text-gray-500">BIC:</span> SWNBFR22</p>
            <p className="text-xs font-body text-gray-700"><span className="text-gray-500">Reference:</span> {itinerary?.client_name || "Your name"}</p>
          </div>
          <p className="text-[10px] font-body text-gray-400 mt-2">Bank transfer fees are the responsibility of the client.</p>
        </div>

        {/* Payment items */}
        {payments.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 font-body">Services</h2>
            {payments.map((item) => (
              <PaymentCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm font-body text-gray-400">No payment items yet. Your concierge is preparing your itinerary.</p>
          </div>
        )}

        {/* Footer summary */}
        {payments.length > 0 && (
          <div className="mt-8 pt-6 border-t border-green/10 text-center">
            <p className="text-xs font-body text-gray-400">
              Questions about a payment?{" "}
              <a href="/client/conversation" className="text-gold hover:text-green transition-colors">Start a conversation</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
