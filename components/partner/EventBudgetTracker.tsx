"use client";

import { useState, useEffect, useCallback } from "react";

interface BudgetItem {
  id: string;
  category: string;
  label: string;
  description: string | null;
  budgeted: number;
  committed: number;
  paid: number;
  currency: string;
  status: string;
  owner: string | null;
  reimbursable: boolean;
  notes: string | null;
}

interface RevenueItem {
  id: string;
  type: string;
  label: string;
  description: string | null;
  package_type: string | null;
  booking_type: string | null;
  unit_price: number;
  quantity: number;
  sponsor_name: string | null;
  sponsor_tier: string | null;
  included_pax: number;
  projected: number;
  confirmed: number;
  invoiced: number;
  received: number;
  currency: string;
  status: string;
  added_by: string | null;
  added_by_partner_id: string | null;
  notes: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  yacht: "Yacht Charter",
  terraces: "Silver VIP Terraces",
  accommodation: "Accommodation",
  transport: "Transport & Logistics",
  production: "Production & Branding",
  talent: "Talent",
  beverage: "Beverage Programme",
  permits: "Permits & Licensing",
  contingency: "Contingency",
  partner_expense: "Partner Expenses",
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  planned: { bg: "bg-gray-100", text: "text-gray-600" },
  committed: { bg: "bg-blue-50", text: "text-blue-600" },
  partial_paid: { bg: "bg-amber-50", text: "text-amber-600" },
  paid: { bg: "bg-green/10", text: "text-green" },
  projected: { bg: "bg-gray-100", text: "text-gray-600" },
  confirmed: { bg: "bg-blue-50", text: "text-blue-600" },
  invoiced: { bg: "bg-amber-50", text: "text-amber-600" },
  partially_paid: { bg: "bg-amber-50", text: "text-amber-600" },
  received: { bg: "bg-green/10", text: "text-green" },
};

const SPONSOR_TIER_LABELS: Record<string, string> = {
  exclusive: "Exclusive Solo (EUR 400K)",
  platinum: "Platinum (EUR 175K)",
  gold: "Gold (EUR 125K)",
  bronze: "Bronze (EUR 50K)",
  title: "Title (EUR 100K)",
  premium: "Premium (EUR 75K)",
  event: "Event (EUR 50K)",
  associate: "Associate (EUR 25K)",
};

function fmt(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function pct(part: number, whole: number): string {
  if (whole === 0) return "0%";
  return Math.round((part / whole) * 100) + "%";
}

interface Props {
  projectId: string;
  isActive: boolean;
  role?: "admin" | "partner";
}

export default function EventBudgetTracker({ projectId, isActive, role = "partner" }: Props) {
  const isAdmin = role === "admin";
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [revenue, setRevenue] = useState<RevenueItem[]>([]);
  const [canSee, setCanSee] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"overview" | "costs" | "revenue">("overview");

  // Revenue form
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [revForm, setRevForm] = useState({
    type: "sponsorship",
    label: "",
    sponsor_name: "",
    sponsor_tier: "",
    included_pax: "",
    projected: "",
    confirmed: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  // Expense form
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expForm, setExpForm] = useState({
    label: "",
    category: "partner_expense",
    budgeted: "",
    description: "",
  });

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    if (isAdmin) {
      const [budgetRes, revenueRes] = await Promise.all([
        fetch(`/api/admin/projects/${projectId}/budget`),
        fetch(`/api/admin/projects/${projectId}/revenue`),
      ]);
      if (budgetRes.ok) setBudget(await budgetRes.json());
      if (revenueRes.ok) setRevenue(await revenueRes.json());
      setCanSee(true);
    } else {
      const res = await fetch(`/api/partner/projects/${projectId}/budget`);
      if (res.ok) {
        const data = await res.json();
        setBudget(data.budget || []);
        setRevenue(data.revenue || []);
        setCanSee(data.can_see_budget);
      }
    }
    setLoading(false);
  }, [projectId, isAdmin]);

  useEffect(() => {
    if (isActive) fetchData();
  }, [isActive, fetchData]);

  if (loading) return <p className="text-gray-400 font-body text-sm py-8 text-center">Loading budget...</p>;
  if (!canSee) return <p className="text-gray-400 font-body text-sm py-8 text-center">Budget visibility is restricted for your role.</p>;

  // ── Calculations ──────────────────────────────────────

  const categories = Array.from(new Set(budget.map((b) => b.category)));
  const grouped = categories.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat] || cat,
    items: budget.filter((b) => b.category === cat),
  }));

  const totalBudgeted = budget.reduce((s, b) => s + Number(b.budgeted), 0);
  const totalCommitted = budget.reduce((s, b) => s + Number(b.committed), 0);
  const totalPaid = budget.reduce((s, b) => s + Number(b.paid), 0);

  const clientRevenue = revenue.filter((r) => r.type === "client_package");
  const sponsorRevenue = revenue.filter((r) => r.type === "sponsorship");
  const otherRevenue = revenue.filter((r) => !["client_package", "sponsorship"].includes(r.type));

  const totalProjected = revenue.reduce((s, r) => s + Number(r.projected), 0);
  const totalConfirmed = revenue.reduce((s, r) => s + Number(r.confirmed), 0);
  const totalReceived = revenue.reduce((s, r) => s + Number(r.received), 0);

  const projectedPL = totalProjected - totalBudgeted;
  const confirmedPL = totalConfirmed - totalCommitted;
  const perPartner = projectedPL / 2;

  const totalPax = clientRevenue.reduce((s, r) => s + (r.quantity || 0) * (r.booking_type === "couple" ? 2 : 1), 0)
    + sponsorRevenue.reduce((s, r) => s + (r.included_pax || 0), 0);

  const breakeven = totalBudgeted - totalConfirmed;

  // ── Handlers ──────────────────────────────────────────

  async function handleAddRevenue(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const revenueEndpoint = isAdmin ? `/api/admin/projects/${projectId}/revenue` : `/api/partner/projects/${projectId}/revenue`;
    await fetch(revenueEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: revForm.type,
        label: revForm.label,
        sponsor_name: revForm.sponsor_name || null,
        sponsor_tier: revForm.sponsor_tier || null,
        included_pax: parseInt(revForm.included_pax) || 0,
        projected: parseFloat(revForm.projected) || 0,
        confirmed: parseFloat(revForm.confirmed) || 0,
        description: revForm.description || null,
        status: parseFloat(revForm.confirmed) > 0 ? "confirmed" : "projected",
      }),
    });
    setRevForm({ type: "sponsorship", label: "", sponsor_name: "", sponsor_tier: "", included_pax: "", projected: "", confirmed: "", description: "" });
    setShowAddRevenue(false);
    setSaving(false);
    fetchData();
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const budgetEndpoint = isAdmin ? `/api/admin/projects/${projectId}/budget` : `/api/partner/projects/${projectId}/budget`;
    await fetch(budgetEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: expForm.label,
        category: expForm.category,
        budgeted: parseFloat(expForm.budgeted) || 0,
        description: expForm.description || null,
      }),
    });
    setExpForm({ label: "", category: "partner_expense", budgeted: "", description: "" });
    setShowAddExpense(false);
    setSaving(false);
    fetchData();
  }

  async function handleInlineUpdate(itemId: string, table: "revenue" | "budget") {
    const base = isAdmin ? `/api/admin/projects/${projectId}` : `/api/partner/projects/${projectId}`;
    const endpoint = table === "revenue"
      ? `${base}/revenue/${itemId}`
      : `${base}/budget/${itemId}`;

    const updates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(editValues)) {
      if (["budgeted", "committed", "paid", "projected", "confirmed", "invoiced", "received", "unit_price", "included_pax", "quantity"].includes(k)) {
        updates[k] = parseFloat(v) || 0;
      } else {
        updates[k] = v || null;
      }
    }

    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    setEditingId(null);
    setEditValues({});
    fetchData();
  }

  // ── Render ────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex gap-1 bg-white border border-green/10 rounded-lg p-1">
        {(["overview", "costs", "revenue"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 text-xs font-body py-2 rounded transition-colors capitalize ${
              view === v ? "bg-green/5 text-green font-medium" : "text-gray-400 hover:text-green"
            }`}
          >
            {v === "overview" ? "P&L Overview" : v === "costs" ? "Cost Breakdown" : "Revenue Pipeline"}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {view === "overview" && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-green/10 rounded-lg p-4">
              <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">Total Costs</p>
              <p className="text-lg font-heading font-semibold text-gray-800">{fmt(totalBudgeted)}</p>
              <p className="text-[10px] text-gray-400 font-body">{fmt(totalCommitted)} committed</p>
            </div>
            <div className="bg-white border border-green/10 rounded-lg p-4">
              <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">Projected Revenue</p>
              <p className="text-lg font-heading font-semibold text-gray-800">{fmt(totalProjected)}</p>
              <p className="text-[10px] text-gray-400 font-body">{fmt(totalConfirmed)} confirmed</p>
            </div>
            <div className="bg-white border border-green/10 rounded-lg p-4">
              <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">Projected P&L</p>
              <p className={`text-lg font-heading font-semibold ${projectedPL >= 0 ? "text-green" : "text-red-600"}`}>
                {projectedPL >= 0 ? "+" : ""}{fmt(projectedPL)}
              </p>
              <p className="text-[10px] text-gray-400 font-body">{fmt(perPartner)}/partner</p>
            </div>
            <div className="bg-white border border-green/10 rounded-lg p-4">
              <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">Total Pax</p>
              <p className="text-lg font-heading font-semibold text-gray-800">{totalPax}</p>
              <p className="text-[10px] text-gray-400 font-body">clients + sponsor guests</p>
            </div>
          </div>

          {/* Breakeven tracker */}
          <div className="bg-white border border-green/10 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">Breakeven Tracker</h3>
              <span className="text-xs text-gray-400 font-body">
                {breakeven > 0 ? `${fmt(breakeven)} to breakeven` : "Breakeven reached"}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalConfirmed >= totalBudgeted ? "bg-green" : totalConfirmed > 0 ? "bg-gold" : "bg-gray-300"
                }`}
                style={{ width: `${Math.min(100, totalBudgeted > 0 ? (totalConfirmed / totalBudgeted) * 100 : 0)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-body">
              <span>Confirmed: {fmt(totalConfirmed)}</span>
              <span>Target: {fmt(totalBudgeted)}</span>
            </div>
          </div>

          {/* Cost vs Revenue bars */}
          <div className="bg-white border border-green/10 rounded-lg p-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">Cost vs Revenue Breakdown</h3>
            <div className="space-y-3">
              {/* Costs bar */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600 font-body">Costs</span>
                  <span className="text-xs text-gray-600 font-body font-medium">{fmt(totalBudgeted)}</span>
                </div>
                <div className="h-6 bg-gray-100 rounded flex overflow-hidden">
                  {grouped.map((g) => {
                    const catTotal = g.items.reduce((s, b) => s + Number(b.budgeted), 0);
                    const w = totalBudgeted > 0 ? (catTotal / totalBudgeted) * 100 : 0;
                    if (w < 1) return null;
                    return (
                      <div
                        key={g.category}
                        className="h-full bg-red-300/60 border-r border-white/50 flex items-center justify-center"
                        style={{ width: `${w}%` }}
                        title={`${g.label}: ${fmt(catTotal)}`}
                      >
                        {w > 8 && <span className="text-[8px] text-red-800 font-body truncate px-1">{g.label.split(" ")[0]}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Revenue bar */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600 font-body">Revenue (projected)</span>
                  <span className="text-xs text-gray-600 font-body font-medium">{fmt(totalProjected)}</span>
                </div>
                <div className="h-6 bg-gray-100 rounded flex overflow-hidden">
                  {clientRevenue.length > 0 && (() => {
                    const clientTotal = clientRevenue.reduce((s, r) => s + Number(r.projected), 0);
                    const w = totalProjected > 0 ? (clientTotal / totalProjected) * 100 : 0;
                    return (
                      <div className="h-full bg-green/40 border-r border-white/50 flex items-center justify-center" style={{ width: `${w}%` }}
                        title={`Client packages: ${fmt(clientTotal)}`}
                      >
                        {w > 10 && <span className="text-[8px] text-green font-body">Clients</span>}
                      </div>
                    );
                  })()}
                  {sponsorRevenue.length > 0 && (() => {
                    const sponsorTotal = sponsorRevenue.reduce((s, r) => s + Number(r.projected), 0);
                    const w = totalProjected > 0 ? (sponsorTotal / totalProjected) * 100 : 0;
                    return (
                      <div className="h-full bg-gold/40 flex items-center justify-center" style={{ width: `${w}%` }}
                        title={`Sponsorship: ${fmt(sponsorTotal)}`}
                      >
                        {w > 10 && <span className="text-[8px] text-gold font-body">Sponsors</span>}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white border border-green/10 rounded-lg p-4">
              <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-2">Client Packages</p>
              {clientRevenue.map((r) => (
                <div key={r.id} className="flex justify-between py-1 border-b border-green/5 last:border-0">
                  <span className="text-xs text-gray-600 font-body">{r.label}</span>
                  <div className="text-right">
                    <span className="text-xs font-body font-medium text-gray-800">{fmt(r.projected)}</span>
                    {Number(r.confirmed) > 0 && (
                      <span className="text-[10px] text-green font-body ml-2">{fmt(r.confirmed)} confirmed</span>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 mt-1 border-t border-green/10">
                <span className="text-xs text-gray-600 font-body font-medium">Total</span>
                <span className="text-xs text-gray-800 font-body font-semibold">
                  {fmt(clientRevenue.reduce((s, r) => s + Number(r.projected), 0))}
                </span>
              </div>
            </div>
            <div className="bg-white border border-green/10 rounded-lg p-4">
              <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-2">Sponsorship</p>
              {sponsorRevenue.length === 0 ? (
                <p className="text-xs text-gray-400 font-body py-2">No sponsors yet.</p>
              ) : (
                sponsorRevenue.map((r) => (
                  <div key={r.id} className="flex justify-between py-1 border-b border-green/5 last:border-0">
                    <div>
                      <span className="text-xs text-gray-600 font-body">{r.sponsor_name || r.label}</span>
                      {r.sponsor_tier && (
                        <span className="text-[10px] text-gray-400 font-body ml-1">
                          ({SPONSOR_TIER_LABELS[r.sponsor_tier] || r.sponsor_tier})
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-body font-medium text-gray-800">{fmt(r.projected)}</span>
                      <span className={`text-[10px] ml-1 px-1 py-0.5 rounded font-body ${
                        (STATUS_STYLES[r.status] || STATUS_STYLES.projected).bg
                      } ${(STATUS_STYLES[r.status] || STATUS_STYLES.projected).text}`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div className="flex justify-between pt-2 mt-1 border-t border-green/10">
                <span className="text-xs text-gray-600 font-body font-medium">Total</span>
                <span className="text-xs text-gray-800 font-body font-semibold">
                  {fmt(sponsorRevenue.reduce((s, r) => s + Number(r.projected), 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ COST BREAKDOWN ═══ */}
      {view === "costs" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddExpense(!showAddExpense)}
              className="text-xs px-4 py-2 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body"
            >
              {showAddExpense ? "Cancel" : "Add Expense"}
            </button>
          </div>

          {showAddExpense && (
            <form onSubmit={handleAddExpense} className="bg-white border border-green/10 rounded-lg p-5 space-y-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">New Expense (Partner)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input value={expForm.label} onChange={(e) => setExpForm({ ...expForm, label: e.target.value })} placeholder="Expense label" required
                  className="rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none font-body" />
                <select value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                  className="rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none font-body bg-white">
                  <option value="partner_expense">Partner Expense</option>
                  <option value="production">Production</option>
                  <option value="talent">Talent</option>
                  <option value="transport">Transport</option>
                  <option value="permits">Permits</option>
                </select>
                <input type="number" value={expForm.budgeted} onChange={(e) => setExpForm({ ...expForm, budgeted: e.target.value })} placeholder="Amount (EUR)" step="0.01"
                  className="rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none font-body" />
              </div>
              <input value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} placeholder="Description (optional)"
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none font-body" />
              <p className="text-[10px] text-gray-400 font-body">Partner expenses are reimbursable if the event is profitable.</p>
              <button type="submit" disabled={saving || !expForm.label.trim()} className="px-5 py-2 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50">
                {saving ? "Adding..." : "Add Expense"}
              </button>
            </form>
          )}

          {grouped.map((g) => {
            const catBudgeted = g.items.reduce((s, b) => s + Number(b.budgeted), 0);
            const catCommitted = g.items.reduce((s, b) => s + Number(b.committed), 0);
            const catPaid = g.items.reduce((s, b) => s + Number(b.paid), 0);
            if (g.items.length === 0) return null;
            return (
              <div key={g.category} className="bg-white border border-green/10 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-pearl/50 border-b border-green/5 flex items-center justify-between">
                  <h3 className="text-xs font-medium text-gray-600 font-body uppercase tracking-wider">{g.label}</h3>
                  <span className="text-xs text-gray-500 font-body font-medium">{fmt(catBudgeted)}</span>
                </div>
                <div className="divide-y divide-green/5">
                  {g.items.map((item) => (
                    <div key={item.id} className="px-4 py-3">
                      {editingId === item.id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] text-gray-400 font-body mb-0.5">Budgeted</label>
                              <input type="number" value={editValues.budgeted ?? item.budgeted} onChange={(e) => setEditValues({ ...editValues, budgeted: e.target.value })}
                                className="w-full rounded border border-green/20 px-2 py-1 text-sm font-body focus:border-green focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-400 font-body mb-0.5">Committed</label>
                              <input type="number" value={editValues.committed ?? item.committed} onChange={(e) => setEditValues({ ...editValues, committed: e.target.value })}
                                className="w-full rounded border border-green/20 px-2 py-1 text-sm font-body focus:border-green focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-400 font-body mb-0.5">Paid</label>
                              <input type="number" value={editValues.paid ?? item.paid} onChange={(e) => setEditValues({ ...editValues, paid: e.target.value })}
                                className="w-full rounded border border-green/20 px-2 py-1 text-sm font-body focus:border-green focus:outline-none" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select value={editValues.status ?? item.status} onChange={(e) => setEditValues({ ...editValues, status: e.target.value })}
                              className="rounded border border-green/20 px-2 py-1 text-xs font-body bg-white focus:border-green focus:outline-none">
                              <option value="planned">Planned</option>
                              <option value="committed">Committed</option>
                              <option value="partial_paid">Partially Paid</option>
                              <option value="paid">Paid</option>
                            </select>
                            <button onClick={() => handleInlineUpdate(item.id, "budget")}
                              className="text-xs px-3 py-1 bg-green text-white rounded font-body hover:bg-green-light">Save</button>
                            <button onClick={() => { setEditingId(null); setEditValues({}); }}
                              className="text-xs px-3 py-1 border border-green/20 text-green rounded font-body">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm text-gray-800 font-body">{item.label}</p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-body ${(STATUS_STYLES[item.status] || STATUS_STYLES.planned).bg} ${(STATUS_STYLES[item.status] || STATUS_STYLES.planned).text}`}>
                                {item.status.replace(/_/g, " ")}
                              </span>
                              {item.reimbursable && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 font-body">reimbursable</span>
                              )}
                            </div>
                            {item.description && <p className="text-[10px] text-gray-400 font-body mt-0.5">{item.description}</p>}
                            {item.owner && <p className="text-[10px] text-gray-400 font-body">Owner: {item.owner}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-none">
                            <div className="text-right">
                              <p className="text-sm font-body font-medium text-gray-800">{fmt(item.budgeted)}</p>
                              {Number(item.committed) > 0 && (
                                <p className="text-[10px] text-blue-600 font-body">{fmt(item.committed)} committed</p>
                              )}
                              {Number(item.paid) > 0 && (
                                <p className="text-[10px] text-green font-body">{fmt(item.paid)} paid</p>
                              )}
                            </div>
                            {isAdmin && (
                              <button onClick={() => { setEditingId(item.id); setEditValues({}); }}
                                className="text-[10px] text-gray-400 hover:text-green font-body" title="Edit">&#9998;</button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {g.items.length > 1 && (
                  <div className="px-4 py-2 bg-pearl/30 border-t border-green/5 flex justify-between">
                    <span className="text-[10px] text-gray-400 font-body uppercase">Subtotal</span>
                    <div className="text-right">
                      <span className="text-xs text-gray-700 font-body font-medium">{fmt(catBudgeted)}</span>
                      {catCommitted > 0 && <span className="text-[10px] text-blue-600 font-body ml-2">{fmt(catCommitted)} committed</span>}
                      {catPaid > 0 && <span className="text-[10px] text-green font-body ml-2">{fmt(catPaid)} paid</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Total */}
          <div className="bg-green/5 border border-green/10 rounded-lg p-4 flex justify-between items-center">
            <span className="text-xs text-green font-body font-medium uppercase tracking-wider">Total Costs</span>
            <div className="text-right">
              <span className="text-lg font-heading font-semibold text-green">{fmt(totalBudgeted)}</span>
              <div className="text-[10px] text-gray-500 font-body">
                {fmt(totalCommitted)} committed &middot; {fmt(totalPaid)} paid
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ REVENUE PIPELINE ═══ */}
      {view === "revenue" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddRevenue(!showAddRevenue)}
              className="text-xs px-4 py-2 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body"
            >
              {showAddRevenue ? "Cancel" : "Add Revenue"}
            </button>
          </div>

          {showAddRevenue && (
            <form onSubmit={handleAddRevenue} className="bg-white border border-green/10 rounded-lg p-5 space-y-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">New Revenue Item</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select value={revForm.type} onChange={(e) => setRevForm({ ...revForm, type: e.target.value })}
                  className="rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none font-body bg-white">
                  <option value="sponsorship">Sponsorship</option>
                  <option value="client_package">Client Package</option>
                  <option value="a_la_carte">A La Carte</option>
                  <option value="in_kind">In-Kind (Cost Offset)</option>
                </select>
                <input value={revForm.label} onChange={(e) => setRevForm({ ...revForm, label: e.target.value })} placeholder="Label" required
                  className="rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none font-body" />
              </div>
              {revForm.type === "sponsorship" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input value={revForm.sponsor_name} onChange={(e) => setRevForm({ ...revForm, sponsor_name: e.target.value })} placeholder="Sponsor name"
                    className="rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none font-body" />
                  <select value={revForm.sponsor_tier} onChange={(e) => setRevForm({ ...revForm, sponsor_tier: e.target.value })}
                    className="rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none font-body bg-white">
                    <option value="">Select tier</option>
                    <option value="exclusive">Exclusive Solo (EUR 400K)</option>
                    <option value="platinum">Platinum (EUR 175K)</option>
                    <option value="gold">Gold (EUR 125K)</option>
                    <option value="bronze">Bronze (EUR 50K)</option>
                  </select>
                  <input type="number" value={revForm.included_pax} onChange={(e) => setRevForm({ ...revForm, included_pax: e.target.value })} placeholder="Included pax"
                    className="rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none font-body" />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="number" value={revForm.projected} onChange={(e) => setRevForm({ ...revForm, projected: e.target.value })} placeholder="Projected amount (EUR)" step="0.01"
                  className="rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none font-body" />
                <input type="number" value={revForm.confirmed} onChange={(e) => setRevForm({ ...revForm, confirmed: e.target.value })} placeholder="Confirmed amount (EUR, if any)" step="0.01"
                  className="rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none font-body" />
              </div>
              <input value={revForm.description} onChange={(e) => setRevForm({ ...revForm, description: e.target.value })} placeholder="Notes (optional)"
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none font-body" />
              <button type="submit" disabled={saving || !revForm.label.trim()} className="px-5 py-2 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50">
                {saving ? "Adding..." : "Add Revenue"}
              </button>
            </form>
          )}

          {/* Client packages */}
          {clientRevenue.length > 0 && (
            <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-pearl/50 border-b border-green/5">
                <h3 className="text-xs font-medium text-gray-600 font-body uppercase tracking-wider">Client Packages</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-green/10">
                      <th className="text-left px-4 py-2 text-[10px] text-gray-400 font-body uppercase">Package</th>
                      <th className="text-center px-3 py-2 text-[10px] text-gray-400 font-body uppercase">Qty</th>
                      <th className="text-right px-3 py-2 text-[10px] text-gray-400 font-body uppercase">Unit Price</th>
                      <th className="text-right px-3 py-2 text-[10px] text-gray-400 font-body uppercase">Projected</th>
                      <th className="text-right px-3 py-2 text-[10px] text-gray-400 font-body uppercase">Confirmed</th>
                      <th className="text-center px-3 py-2 text-[10px] text-gray-400 font-body uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientRevenue.map((r) => (
                      <tr key={r.id} className="border-b border-green/5 last:border-0">
                        <td className="px-4 py-2.5 text-gray-800 font-body">{r.label}</td>
                        <td className="px-3 py-2.5 text-center text-gray-600 font-body">{r.quantity}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600 font-body">{fmt(r.unit_price)}</td>
                        <td className="px-3 py-2.5 text-right font-body font-medium text-gray-800">{fmt(r.projected)}</td>
                        <td className="px-3 py-2.5 text-right font-body font-medium text-green">{Number(r.confirmed) > 0 ? fmt(r.confirmed) : "-"}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-body ${(STATUS_STYLES[r.status] || STATUS_STYLES.projected).bg} ${(STATUS_STYLES[r.status] || STATUS_STYLES.projected).text}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-green/10 bg-pearl/30">
                      <td colSpan={3} className="px-4 py-2 text-xs text-gray-500 font-body font-medium">Total</td>
                      <td className="px-3 py-2 text-right text-xs font-body font-semibold text-gray-800">{fmt(clientRevenue.reduce((s, r) => s + Number(r.projected), 0))}</td>
                      <td className="px-3 py-2 text-right text-xs font-body font-semibold text-green">{fmt(clientRevenue.reduce((s, r) => s + Number(r.confirmed), 0))}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Sponsorship */}
          <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-pearl/50 border-b border-green/5">
              <h3 className="text-xs font-medium text-gray-600 font-body uppercase tracking-wider">Sponsorship Pipeline</h3>
            </div>
            {sponsorRevenue.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-gray-400 font-body">No sponsors yet. Add one above.</p>
              </div>
            ) : (
              <div className="divide-y divide-green/5">
                {sponsorRevenue.map((r) => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm text-gray-800 font-body font-medium">
                            {r.sponsor_name || r.label}
                          </p>
                          {r.sponsor_tier && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-gold/10 text-gold rounded font-body">
                              {SPONSOR_TIER_LABELS[r.sponsor_tier] || r.sponsor_tier}
                            </span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-body ${(STATUS_STYLES[r.status] || STATUS_STYLES.projected).bg} ${(STATUS_STYLES[r.status] || STATUS_STYLES.projected).text}`}>
                            {r.status}
                          </span>
                        </div>
                        {r.description && <p className="text-[10px] text-gray-400 font-body mt-0.5">{r.description}</p>}
                        {r.included_pax > 0 && <p className="text-[10px] text-gray-400 font-body">{r.included_pax} guest passes included</p>}
                        {r.added_by && <p className="text-[10px] text-gray-400 font-body">Added by: {r.added_by}</p>}
                      </div>
                      <div className="text-right flex-none">
                        <p className="text-sm font-body font-medium text-gray-800">{fmt(r.projected)}</p>
                        {Number(r.confirmed) > 0 && (
                          <p className="text-[10px] text-green font-body">{fmt(r.confirmed)} confirmed</p>
                        )}
                        {Number(r.received) > 0 && (
                          <p className="text-[10px] text-green font-body font-medium">{fmt(r.received)} received</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="px-4 py-2 bg-pearl/30 border-t border-green/5 flex justify-between">
              <span className="text-[10px] text-gray-400 font-body uppercase">Total Sponsorship</span>
              <span className="text-xs text-gray-700 font-body font-medium">{fmt(sponsorRevenue.reduce((s, r) => s + Number(r.projected), 0))}</span>
            </div>
          </div>

          {/* Revenue total */}
          <div className="bg-green/5 border border-green/10 rounded-lg p-4 flex justify-between items-center">
            <span className="text-xs text-green font-body font-medium uppercase tracking-wider">Total Revenue</span>
            <div className="text-right">
              <span className="text-lg font-heading font-semibold text-green">{fmt(totalProjected)}</span>
              <div className="text-[10px] text-gray-500 font-body">
                {fmt(totalConfirmed)} confirmed &middot; {fmt(totalReceived)} received
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
