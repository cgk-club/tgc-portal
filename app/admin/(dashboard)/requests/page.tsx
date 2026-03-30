"use client";

import { useState, useEffect } from "react";

interface ClientRequest {
  id: string;
  request_type: string;
  summary: string | null;
  name: string;
  email: string;
  phone: string | null;
  communication_pref: string;
  status: string;
  created_at: string;
  raw_chat_json: Record<string, unknown> | null;
}

interface EventEnquiry {
  id: string;
  event_name: string;
  access_type: string | null;
  group_size: string | null;
  budget_range: string | null;
  name: string;
  email: string;
  phone: string | null;
  is_bespoke: boolean;
  status: string;
  created_at: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [eventEnquiries, setEventEnquiries] = useState<EventEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"requests" | "events">("requests");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
        setEventEnquiries(data.eventEnquiries);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-4 sm:p-6 lg:p-8"><p className="text-gray-500 font-body">Loading...</p></div>;

  const statusColor = (s: string) => {
    if (s === "new") return "bg-gold/15 text-gold";
    if (s === "contacted") return "bg-blue-50 text-blue-600";
    if (s === "quoted") return "bg-green/10 text-green";
    if (s === "confirmed") return "bg-green/20 text-green";
    return "bg-gray-100 text-gray-500";
  };

  return (
    <div className="p-6 sm:p-8">
      <h1 className="font-heading text-2xl font-semibold text-green mb-6">Requests & Enquiries</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        <button
          onClick={() => setTab("requests")}
          className={`px-4 py-2 text-sm font-body rounded-sm ${tab === "requests" ? "bg-green text-white" : "text-gray-500 hover:bg-green/5"}`}
        >
          Client Requests ({requests.length})
        </button>
        <button
          onClick={() => setTab("events")}
          className={`px-4 py-2 text-sm font-body rounded-sm ${tab === "events" ? "bg-green text-white" : "text-gray-500 hover:bg-green/5"}`}
        >
          Event Enquiries ({eventEnquiries.length})
        </button>
      </div>

      {/* Client Requests */}
      {tab === "requests" && (
        requests.length === 0 ? (
          <div className="bg-white rounded-lg border border-green/10 p-12 text-center">
            <p className="text-gray-400 font-body">No client requests yet. When clients use the conversation chat, their requests will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="bg-white rounded-lg border border-green/10 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs text-green/60 uppercase tracking-wide font-body">{req.request_type}</span>
                    <h3 className="font-heading text-sm font-semibold text-gray-800">{req.name}</h3>
                    <p className="text-xs text-gray-500 font-body">{req.email}{req.phone ? ` / ${req.phone}` : ''} (prefers {req.communication_pref})</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-body ${statusColor(req.status)}`}>{req.status}</span>
                    <span className="text-[10px] text-gray-400 font-body">{new Date(req.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                {req.summary && <p className="text-sm text-gray-600 font-body mt-2">{req.summary}</p>}
                {req.raw_chat_json && (
                  <details className="mt-3">
                    <summary className="text-xs text-green/60 cursor-pointer font-body">Full details</summary>
                    <pre className="mt-2 text-xs text-gray-500 bg-pearl p-3 rounded overflow-x-auto">{JSON.stringify(req.raw_chat_json, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Event Enquiries */}
      {tab === "events" && (
        eventEnquiries.length === 0 ? (
          <div className="bg-white rounded-lg border border-green/10 p-12 text-center">
            <p className="text-gray-400 font-body">No event enquiries yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eventEnquiries.map(eq => (
              <div key={eq.id} className="bg-white rounded-lg border border-green/10 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green/60 uppercase tracking-wide font-body">{eq.is_bespoke ? 'Bespoke Event' : 'Event Enquiry'}</span>
                    </div>
                    <h3 className="font-heading text-sm font-semibold text-gray-800">{eq.event_name}</h3>
                    <p className="text-xs text-gray-500 font-body">{eq.name} / {eq.email}{eq.phone ? ` / ${eq.phone}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-body ${statusColor(eq.status)}`}>{eq.status}</span>
                    <span className="text-[10px] text-gray-400 font-body">{new Date(eq.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                  {eq.access_type && <div className="text-xs font-body"><span className="text-gray-400">Access:</span> <span className="text-gray-700">{eq.access_type}</span></div>}
                  {eq.group_size && <div className="text-xs font-body"><span className="text-gray-400">Group:</span> <span className="text-gray-700">{eq.group_size}</span></div>}
                  {eq.budget_range && <div className="text-xs font-body"><span className="text-gray-400">Budget:</span> <span className="text-gray-700">{eq.budget_range}</span></div>}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
