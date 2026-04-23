"use client";

import { useState, useEffect } from "react";

interface Referral {
  id: string;
  prospect_name: string;
  prospect_email: string;
  prospect_phone: string | null;
  prospect_company: string | null;
  package_interest: string | null;
  attending_as: string | null;
  stage: string;
  referrer_name: string | null;
  referrer_code: string | null;
  source: string;
  admin_notes: string | null;
  payment_status: string;
  created_at: string;
  enquired_at: string | null;
  converted_at: string | null;
}

interface Stats {
  sent: number;
  prospect: number;
  lead: number;
  client: number;
  total: number;
}

const STAGE_COLORS: Record<string, string> = {
  sent: "bg-gray-100 text-gray-600",
  prospect: "bg-blue-50 text-blue-600",
  lead: "bg-amber-50 text-amber-700",
  client: "bg-emerald-50 text-emerald-700",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default function PipelineTab({ projectId }: { projectId: string }) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<Stats>({
    sent: 0,
    prospect: 0,
    lead: 0,
    client: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    prospect_first_name: "",
    prospect_last_name: "",
    prospect_email: "",
    prospect_phone: "",
    package_interest: "",
    admin_notes: "",
  });
  const [adding, setAdding] = useState(false);

  async function fetchPipeline() {
    const res = await fetch(
      `/api/admin/event-referrals?project_id=${projectId}`
    );
    if (res.ok) {
      const data = await res.json();
      setReferrals(data.referrals || []);
      setStats(data.stats || { sent: 0, prospect: 0, lead: 0, client: 0, total: 0 });
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPipeline();
  }, [projectId]);

  async function handleStageChange(id: string, stage: string) {
    await fetch(`/api/admin/event-referrals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    fetchPipeline();
  }

  async function handleAddProspect(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.prospect_first_name.trim() || !addForm.prospect_last_name.trim() || !addForm.prospect_email.trim()) return;
    setAdding(true);

    await fetch("/api/admin/event-referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        prospect_name: `${addForm.prospect_first_name.trim()} ${addForm.prospect_last_name.trim()}`,
        prospect_email: addForm.prospect_email,
        prospect_phone: addForm.prospect_phone,
        package_interest: addForm.package_interest,
        admin_notes: addForm.admin_notes,
      }),
    });

    setAddForm({
      prospect_first_name: "",
      prospect_last_name: "",
      prospect_email: "",
      prospect_phone: "",
      package_interest: "",
      admin_notes: "",
    });
    setShowAddForm(false);
    setAdding(false);
    fetchPipeline();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this referral?")) return;
    await fetch(`/api/admin/event-referrals/${id}`, { method: "DELETE" });
    fetchPipeline();
  }

  if (loading) {
    return (
      <p className="text-sm text-gray-400 font-body py-8 text-center">
        Loading pipeline...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Funnel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Views", count: stats.sent, color: "text-gray-600" },
          { label: "Prospects", count: stats.prospect, color: "text-blue-600" },
          { label: "Leads", count: stats.lead, color: "text-amber-700" },
          { label: "Clients", count: stats.client, color: "text-emerald-700" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-green/10 rounded-lg p-4 text-center"
          >
            <p className={`text-2xl font-heading font-semibold ${s.color}`}>
              {s.count}
            </p>
            <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
          All Referrals ({stats.total})
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs px-4 py-2 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body"
        >
          {showAddForm ? "Cancel" : "Add Prospect"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddProspect}
          className="bg-white border border-green/10 rounded-lg p-5 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First name *"
              value={addForm.prospect_first_name}
              onChange={(e) =>
                setAddForm({ ...addForm, prospect_first_name: e.target.value })
              }
              className="border border-gray-200 rounded-md px-3 py-2 text-sm font-body focus:outline-none focus:border-green"
              required
            />
            <input
              type="text"
              placeholder="Last name *"
              value={addForm.prospect_last_name}
              onChange={(e) =>
                setAddForm({ ...addForm, prospect_last_name: e.target.value })
              }
              className="border border-gray-200 rounded-md px-3 py-2 text-sm font-body focus:outline-none focus:border-green"
              required
            />
            <input
              type="email"
              placeholder="Email *"
              value={addForm.prospect_email}
              onChange={(e) =>
                setAddForm({ ...addForm, prospect_email: e.target.value })
              }
              className="border border-gray-200 rounded-md px-3 py-2 text-sm font-body focus:outline-none focus:border-green"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={addForm.prospect_phone}
              onChange={(e) =>
                setAddForm({ ...addForm, prospect_phone: e.target.value })
              }
              className="border border-gray-200 rounded-md px-3 py-2 text-sm font-body focus:outline-none focus:border-green"
            />
            <input
              type="text"
              placeholder="Package interest"
              value={addForm.package_interest}
              onChange={(e) =>
                setAddForm({ ...addForm, package_interest: e.target.value })
              }
              className="border border-gray-200 rounded-md px-3 py-2 text-sm font-body focus:outline-none focus:border-green"
            />
          </div>
          <input
            type="text"
            placeholder="Admin notes"
            value={addForm.admin_notes}
            onChange={(e) =>
              setAddForm({ ...addForm, admin_notes: e.target.value })
            }
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-body focus:outline-none focus:border-green"
          />
          <button
            type="submit"
            disabled={adding}
            className="text-xs px-4 py-2 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50"
          >
            {adding ? "Adding..." : "Add Prospect"}
          </button>
        </form>
      )}

      {/* Referrals Table */}
      <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
        {referrals.length === 0 ? (
          <p className="text-sm text-gray-400 font-body text-center py-8">
            No referrals yet. Share the event link to start tracking.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green/[0.03] border-b border-green/10">
                  <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-body uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-body uppercase tracking-wider">
                    Package
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-body uppercase tracking-wider">
                    Referrer
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-body uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-body uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-green/5 hover:bg-green/[0.01]"
                  >
                    <td className="px-4 py-3">
                      <p className="font-body text-sm text-gray-800">
                        {r.prospect_name || "Anonymous"}
                      </p>
                      <p className="font-body text-[11px] text-gray-400">
                        {r.prospect_email}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-gray-600">
                      {r.package_interest || "-"}
                      {r.attending_as === "couple" && (
                        <span className="text-gray-400 ml-1">(couple)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-gray-600">
                      {r.referrer_name || (
                        <span className="text-gray-300">Direct</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={r.stage}
                        onChange={(e) =>
                          handleStageChange(r.id, e.target.value)
                        }
                        className={`text-[11px] font-body px-2 py-1 rounded-full border-0 ${
                          STAGE_COLORS[r.stage] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <option value="sent">Sent</option>
                        <option value="prospect">Prospect</option>
                        <option value="lead">Lead</option>
                        <option value="client">Client</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-gray-400">
                      {formatDate(r.enquired_at || r.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
