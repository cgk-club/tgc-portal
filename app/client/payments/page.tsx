"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ClientNav from "@/components/client/ClientNav";
import type { PaymentItem, PaymentStatus, PaymentMethod, PaymentDocument, BankDetails } from "@/types";

const SignatureModal = dynamic(() => import("@/components/client/SignatureModal"), { ssr: false });

const TGC_DEFAULT_BANK: BankDetails = {
  account_holder: "The Gatekeepers Club",
  iban: "FR76 1732 8844 0048 2021 3165 365",
  bic: "SWNBFR22",
};

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

const DOC_CATEGORY_LABELS: Record<string, string> = {
  contract: "Contract",
  invoice: "Invoice",
  cc_auth_form: "CC Auth Form",
  receipt: "Receipt",
  other: "Document",
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

interface ItineraryData {
  id: string;
  title: string;
  client_name: string;
  currency: string;
  share_token?: string;
  default_bank_details?: BankDetails;
}

function PaymentCard({ item, itinerary, onSignComplete }: { item: PaymentItem & { documents?: PaymentDocument[] }; itinerary: ItineraryData; onSignComplete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [signingDoc, setSigningDoc] = useState<PaymentDocument | null>(null);

  const isPaid = ["fully_paid", "confirmed"].includes(item.payment_status);

  // Bank details fallback chain: item > itinerary default > TGC default
  const bank = item.bank_details || itinerary.default_bank_details || TGC_DEFAULT_BANK;

  const handlePayClick = useCallback(async () => {
    if (itinerary.share_token) {
      fetch(`/api/itinerary/${itinerary.share_token}/payments/${item.id}/click`, { method: "POST" }).catch(() => {});
    }
    if (item.cc_payment_url) {
      window.open(item.cc_payment_url, "_blank", "noopener,noreferrer");
    }
  }, [itinerary.share_token, item.id, item.cc_payment_url]);

  const handleSign = useCallback(async (data: { signed_by_name: string; signed_by_email: string; signature_data: string }) => {
    if (!signingDoc) return;
    const res = await fetch(`/api/client/itineraries/${item.itinerary_id}/payments/${item.id}/documents/${signingDoc.id}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSigningDoc(null);
      onSignComplete();
    }
  }, [signingDoc, item.itinerary_id, item.id, onSignComplete]);

  const documents = (item.documents || []) as PaymentDocument[];
  const unsignedDocs = documents.filter(d => d.requires_signature && d.signature_status === "unsigned");

  return (
    <>
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
              {isPaid && <span className="mr-1">&#10003;</span>}
              {STATUS_LABELS[item.payment_status]}
            </span>
            {unsignedDocs.length > 0 && (
              <span className="text-[10px] font-body font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                Sign
              </span>
            )}
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </button>

        {expanded && (
          <div className="px-5 pb-4 border-t border-green/5 pt-3 space-y-3">
            {/* Receipt confirmation for paid items */}
            {isPaid ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-body font-medium text-green">Payment Received</p>
                    {item.paid_at && (
                      <p className="text-xs font-body text-gray-500">
                        Confirmed {new Date(item.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="bg-green/[0.03] rounded-md p-3">
                  <p className="text-xs font-body text-gray-700">
                    <span className="text-gray-500">Service:</span> {item.service_name}
                  </p>
                  <p className="text-xs font-body text-gray-700">
                    <span className="text-gray-500">Amount:</span> {item.currency} {(Number(item.client_amount) || Number(item.amount)).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <>
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
                  <button
                    onClick={handlePayClick}
                    className="inline-block bg-gold text-white text-xs font-body font-medium px-4 py-2 rounded hover:bg-gold/90 transition-colors"
                  >
                    Pay Now
                  </button>
                )}

                {item.payment_method === "included" && (
                  <p className="text-xs font-body text-gray-500 italic">Included in your package</p>
                )}

                {item.deposit_deadline && (
                  <p className="text-xs font-body text-amber-700">
                    Deposit due by: {new Date(item.deposit_deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </>
            )}

            {item.client_notes && (
              <p className="text-xs font-body text-gray-600">{item.client_notes}</p>
            )}

            {/* Documents */}
            {documents.length > 0 && (
              <div className="pt-2 border-t border-green/5">
                <p className="text-[10px] font-body uppercase tracking-wider text-gray-400 mb-2">Documents</p>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 text-xs bg-gray-50 rounded-md px-3 py-2">
                      <span className="text-[10px] font-body font-medium text-gray-500">
                        {DOC_CATEGORY_LABELS[doc.document_category] || "Document"}
                      </span>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-green hover:underline truncate flex-1 font-body">
                        {doc.title}
                      </a>
                      {doc.requires_signature && doc.signature_status === "unsigned" && (
                        <button
                          onClick={() => setSigningDoc(doc)}
                          className="text-[11px] font-body font-medium bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600 transition-colors shrink-0"
                        >
                          Review & Sign
                        </button>
                      )}
                      {doc.requires_signature && doc.signature_status === "signed" && (
                        <span className="text-[10px] font-body font-medium text-green bg-green/10 px-2 py-0.5 rounded-full shrink-0">Signed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Signature modal */}
      {signingDoc && (
        <SignatureModal
          documentTitle={signingDoc.title}
          documentUrl={signingDoc.file_url}
          clientName={itinerary.client_name || ""}
          clientEmail=""
          onSign={handleSign}
          onClose={() => setSigningDoc(null)}
        />
      )}
    </>
  );
}

export default function PaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [payments, setPayments] = useState<(PaymentItem & { documents?: PaymentDocument[] })[]>([]);
  const [itineraries, setItineraries] = useState<{ id: string; title: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadPayments = useCallback(async (itineraryId: string) => {
    setLoading(true);
    const res = await fetch(`/api/client/itineraries/${itineraryId}/payments`);
    if (res.ok) {
      const data = await res.json();
      setItinerary(data.itinerary);
      setPayments(data.payments);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/client/session");
      if (!sessionRes.ok) { router.push("/client/login"); return; }

      const itinRes = await fetch("/api/client/itineraries");
      if (!itinRes.ok) { setLoading(false); return; }
      const itinData = await itinRes.json();
      const shared = (itinData || []).filter((i: { status: string }) => i.status === "shared");

      if (shared.length === 0) { setLoading(false); return; }
      setItineraries(shared.map((i: { id: string; title: string }) => ({ id: i.id, title: i.title })));

      const targetId = shared[0].id;
      setSelectedId(targetId);
      await loadPayments(targetId);
    }
    load();
  }, [router, loadPayments]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-pearl"><p className="text-gray-400 font-body">Loading...</p></div>;

  const getClientAmount = (p: PaymentItem) => Number(p.client_amount) || Number(p.amount);
  const totalAmount = payments.reduce((sum, p) => p.payment_status !== "cancelled" ? sum + getClientAmount(p) : sum, 0);
  const paidAmount = payments.reduce((sum, p) => ["fully_paid", "confirmed"].includes(p.payment_status) ? sum + getClientAmount(p) : sum, 0);
  const depositAmount = payments.reduce((sum, p) => p.payment_status === "deposit_paid" ? sum + getClientAmount(p) : sum, 0);
  const remainingAmount = totalAmount - paidAmount;
  const progressPct = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  // Bank details for lump sum section
  const lumpBank = itinerary?.default_bank_details || TGC_DEFAULT_BANK;

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
            Wire the total to {lumpBank.account_holder || "The Gatekeepers Club"} and we handle all supplier payments on your behalf.
          </p>
          <div className="bg-white rounded-md p-3 space-y-1.5">
            {lumpBank.account_holder && <p className="text-xs font-body text-gray-700"><span className="text-gray-500">Account:</span> {lumpBank.account_holder}</p>}
            {lumpBank.bank_name && <p className="text-xs font-body text-gray-700"><span className="text-gray-500">Bank:</span> {lumpBank.bank_name}</p>}
            <p className="text-xs font-body text-gray-700">
              <span className="text-gray-500">IBAN:</span> {lumpBank.iban}<CopyButton text={lumpBank.iban.replace(/\s/g, "")} />
            </p>
            <p className="text-xs font-body text-gray-700"><span className="text-gray-500">BIC:</span> {lumpBank.bic}</p>
            <p className="text-xs font-body text-gray-700"><span className="text-gray-500">Reference:</span> {lumpBank.reference || itinerary?.client_name || "Your name"}</p>
          </div>
          <p className="text-[10px] font-body text-gray-400 mt-2">Bank transfer fees are the responsibility of the client.</p>
        </div>

        {/* Payment items */}
        {payments.length > 0 && itinerary ? (
          <div className="space-y-3">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 font-body">Services</h2>
            {payments.map((item) => (
              <PaymentCard
                key={item.id}
                item={item}
                itinerary={itinerary}
                onSignComplete={() => loadPayments(itinerary.id)}
              />
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
