"use client";

import { useState, useEffect } from "react";

interface EventBooking {
  id: string;
  event_id: string;
  event_title: string;
  tier_name: string | null;
  tier_option: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  payment_method: string;
  base_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  reference: string;
  notes: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  confirmed: "bg-green-50 text-green-700 border border-green-200",
  cancelled: "bg-red-50 text-red-500 border border-red-200",
};

function fmt(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEvent, setFilterEvent] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/events/bookings");
    if (res.ok) setBookings(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    setSaving(true);
    await fetch("/api/admin/events/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await load();
    setSaving(false);
  }

  async function saveNotes(id: string) {
    setSaving(true);
    await fetch("/api/admin/events/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, notes: notesDraft }),
    });
    setEditingNotes(null);
    await load();
    setSaving(false);
  }

  const eventTitles = Array.from(new Set(bookings.map((b) => b.event_title))).sort();

  const filtered = bookings.filter((b) => {
    if (filterEvent && b.event_title !== filterEvent) return false;
    if (filterStatus && b.status !== filterStatus) return false;
    return true;
  });

  const totalConfirmed = filtered
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.total_amount, 0);

  const totalPending = filtered
    .filter((b) => b.status === "pending")
    .reduce((sum, b) => sum + b.total_amount, 0);

  if (loading) return <div className="p-6"><p className="text-gray-500 font-body">Loading bookings...</p></div>;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-green">Event Bookings</h1>
        <button
          onClick={load}
          className="text-xs text-green/70 hover:text-green font-body transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-green/10 rounded-lg p-4">
          <p className="text-xs text-gray-400 font-body mb-1">Total bookings</p>
          <p className="font-heading text-2xl text-green">{filtered.length}</p>
        </div>
        <div className="bg-white border border-green/10 rounded-lg p-4">
          <p className="text-xs text-gray-400 font-body mb-1">Pending</p>
          <p className="font-heading text-2xl text-amber-600">{filtered.filter((b) => b.status === "pending").length}</p>
          <p className="text-[10px] text-gray-400 font-body mt-0.5">{fmt(totalPending)}</p>
        </div>
        <div className="bg-white border border-green/10 rounded-lg p-4">
          <p className="text-xs text-gray-400 font-body mb-1">Confirmed</p>
          <p className="font-heading text-2xl text-green">{filtered.filter((b) => b.status === "confirmed").length}</p>
          <p className="text-[10px] text-gray-400 font-body mt-0.5">{fmt(totalConfirmed)}</p>
        </div>
        <div className="bg-white border border-green/10 rounded-lg p-4">
          <p className="text-xs text-gray-400 font-body mb-1">Revenue confirmed</p>
          <p className="font-heading text-xl text-green">{fmt(totalConfirmed)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filterEvent}
          onChange={(e) => setFilterEvent(e.target.value)}
          className="px-3 py-1.5 border border-green/20 rounded text-sm font-body bg-white text-gray-700"
        >
          <option value="">All events</option>
          {eventTitles.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 border border-green/20 rounded text-sm font-body bg-white text-gray-700"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-green/10 rounded-lg p-12 text-center">
          <p className="text-gray-400 font-body text-sm">No bookings yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-green/10 bg-pearl">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Reference</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Event / Tier</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Guest</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Payment</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-body font-medium">Amount</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-body font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Date</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-body font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-green/5 last:border-0 hover:bg-pearl/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-green/70">{b.reference}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 text-xs">{b.event_title}</div>
                      {b.tier_name && (
                        <div className="text-[10px] text-gray-400 font-body mt-0.5">
                          {b.tier_name}{b.tier_option ? ` · ${b.tier_option}` : ""}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-800 font-body">{b.guest_name}</div>
                      <div className="text-[10px] text-gray-400 font-body">{b.guest_email}</div>
                      {b.guest_phone && <div className="text-[10px] text-gray-400 font-body">{b.guest_phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-body ${
                        b.payment_method === "bank_transfer"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-purple-50 text-purple-600"
                      }`}>
                        {b.payment_method === "bank_transfer" ? "Bank transfer" : "Credit card"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-xs font-medium text-gray-800">{fmt(b.total_amount, b.currency)}</div>
                      {b.total_amount !== b.base_amount && (
                        <div className="text-[10px] text-gray-400 font-body">base {fmt(b.base_amount, b.currency)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-body ${STATUS_STYLES[b.status] || "bg-gray-50 text-gray-500"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[10px] text-gray-400 font-body whitespace-nowrap">{fmtDate(b.created_at)}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.status === "pending" && (
                          <button
                            onClick={() => updateStatus(b.id, "confirmed")}
                            disabled={saving}
                            className="text-[10px] px-2 py-0.5 bg-green/10 text-green rounded hover:bg-green/20 font-body transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                        {b.status !== "cancelled" && (
                          <button
                            onClick={() => updateStatus(b.id, "cancelled")}
                            disabled={saving}
                            className="text-[10px] px-2 py-0.5 bg-red-50 text-red-400 rounded hover:bg-red-100 font-body transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => { setEditingNotes(b.id); setNotesDraft(b.notes || ""); }}
                          className="text-[10px] text-gray-400 hover:text-green font-body transition-colors"
                        >
                          {b.notes ? "Note ✎" : "+ Note"}
                        </button>
                      </div>
                      {/* Inline notes editor */}
                      {editingNotes === b.id && (
                        <div className="mt-2 text-left">
                          <textarea
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1 border border-green/20 rounded text-xs font-body resize-none"
                            placeholder="Internal note..."
                          />
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() => saveNotes(b.id)}
                              disabled={saving}
                              className="text-[10px] px-2 py-0.5 bg-green text-white rounded font-body"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNotes(null)}
                              className="text-[10px] text-gray-400 font-body"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
