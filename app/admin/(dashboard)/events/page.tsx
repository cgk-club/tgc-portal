"use client";

import { useState, useEffect } from "react";

interface AffiliateLink {
  id: string;
  event_name: string;
  url: string;
  category: string;
  provider: string;
  affiliate_id: string;
  commission_rate: number;
  notes: string | null;
}

interface TGCEvent {
  id: string;
  title: string;
  category: string;
  date_display: string;
  date_start: string | null;
  date_end: string | null;
  location: string | null;
  price: string;
  description: string | null;
  highlights: string | null;
  itinerary: string | null;
  includes: string | null;
  image_url: string | null;
  featured: boolean;
  members_only: boolean;
  active: boolean;
  sort_order: number;
  ticket_url: string | null;
  ticket_provider: string | null;
  ticket_commission_rate: number | null;
}

const CATEGORIES = [
  "Art & Culture",
  "Motorsport",
  "Sport",
  "Hospitality",
  "Fashion",
  "Food & Wine",
  "Travel & Trade",
  "Yachting & Marine",
  "Music & Festivals",
  "TGC Private",
  "MICE & Corporate",
];

const EMPTY_EVENT: Omit<TGCEvent, "id"> = {
  title: "",
  category: "Art & Culture",
  date_display: "",
  date_start: null,
  date_end: null,
  location: "",
  price: "On application",
  description: "",
  highlights: "",
  itinerary: "",
  includes: "",
  image_url: "",
  featured: false,
  members_only: false,
  active: true,
  sort_order: 0,
  ticket_url: null,
  ticket_provider: null,
  ticket_commission_rate: null,
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<TGCEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TGCEvent | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<TGCEvent, "id">>(EMPTY_EVENT);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [showAffiliatePicker, setShowAffiliatePicker] = useState(false);

  async function loadEvents() {
    const res = await fetch("/api/admin/events");
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  }

  async function loadAffiliateLinks() {
    const res = await fetch("/api/admin/affiliate-links");
    if (res.ok) {
      const data = await res.json();
      setAffiliateLinks(data.links || []);
    }
  }

  function selectAffiliateLink(link: AffiliateLink) {
    setForm((prev) => ({
      ...prev,
      ticket_url: link.url,
      ticket_provider: link.provider || "GooTickets",
      ticket_commission_rate: link.commission_rate || 2.5,
    }));
    setShowAffiliatePicker(false);
  }

  useEffect(() => { loadEvents(); }, []);

  function startCreate() {
    setEditing(null);
    setForm({ ...EMPTY_EVENT, sort_order: events.length + 1 });
    setCreating(true);
  }

  function startEdit(ev: TGCEvent) {
    setCreating(false);
    setEditing(ev);
    setForm({
      title: ev.title,
      category: ev.category,
      date_display: ev.date_display,
      date_start: ev.date_start,
      date_end: ev.date_end,
      location: ev.location || "",
      price: ev.price,
      description: ev.description || "",
      highlights: ev.highlights || "",
      itinerary: ev.itinerary || "",
      includes: ev.includes || "",
      image_url: ev.image_url || "",
      featured: ev.featured,
      members_only: ev.members_only,
      active: ev.active,
      sort_order: ev.sort_order,
      ticket_url: ev.ticket_url || null,
      ticket_provider: ev.ticket_provider || null,
      ticket_commission_rate: ev.ticket_commission_rate || null,
    });
  }

  async function handleSave() {
    if (!form.title || !form.date_display) return;

    if (creating) {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setCreating(false);
        setForm(EMPTY_EVENT);
        loadEvents();
      }
    } else if (editing) {
      const res = await fetch(`/api/admin/events/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setEditing(null);
        setForm(EMPTY_EVENT);
        loadEvents();
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    if (res.ok) loadEvents();
  }

  async function toggleActive(ev: TGCEvent) {
    await fetch(`/api/admin/events/${ev.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !ev.active }),
    });
    loadEvents();
  }

  async function toggleFeatured(ev: TGCEvent) {
    await fetch(`/api/admin/events/${ev.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !ev.featured }),
    });
    loadEvents();
  }

  function cancelEdit() {
    setEditing(null);
    setCreating(false);
    setForm(EMPTY_EVENT);
  }

  if (loading) return <div className="p-4 sm:p-6 lg:p-8"><p className="text-gray-500 font-body">Loading events...</p></div>;

  const showForm = creating || editing;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-green">Events</h1>
        <button
          onClick={startCreate}
          className="px-4 py-2 bg-green text-white text-sm font-body rounded-md hover:bg-green-light transition-colors"
        >
          Add Event
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-green/10 rounded-lg p-6 mb-6">
          <h2 className="font-heading text-lg font-semibold text-green mb-4">
            {creating ? "New Event" : `Edit: ${editing?.title}`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 font-body mb-1">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">Date display *</label>
              <input value={form.date_display} onChange={(e) => setForm({ ...form, date_display: e.target.value })} placeholder="e.g. 5-7 June 2026" className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">Start date</label>
              <input type="date" value={form.date_start || ""} onChange={(e) => setForm({ ...form, date_start: e.target.value || null })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">End date</label>
              <input type="date" value={form.date_end || ""} onChange={(e) => setForm({ ...form, date_end: e.target.value || null })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">Location</label>
              <input value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">Price</label>
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 font-body mb-1">Description</label>
              <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 font-body mb-1">Highlights (one per line)</label>
              <textarea value={form.highlights || ""} onChange={(e) => setForm({ ...form, highlights: e.target.value })} rows={3} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 font-body mb-1">Itinerary</label>
              <textarea value={form.itinerary || ""} onChange={(e) => setForm({ ...form, itinerary: e.target.value })} rows={2} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 font-body mb-1">What is Included</label>
              <textarea value={form.includes || ""} onChange={(e) => setForm({ ...form, includes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">Image URL</label>
              <input value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">Sort order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>

            {/* Ticket Booking Fields */}
            <div className="sm:col-span-2 border-t border-green/10 pt-4 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-medium text-gold uppercase tracking-wider font-body">Ticket Booking</h3>
                <button
                  type="button"
                  onClick={() => { if (affiliateLinks.length === 0) loadAffiliateLinks(); setShowAffiliatePicker(!showAffiliatePicker); }}
                  className="text-[10px] px-2 py-0.5 bg-gold/10 text-gold rounded hover:bg-gold/20 transition-colors font-body"
                >
                  Browse Affiliate Links
                </button>
              </div>

              {/* Affiliate Link Picker */}
              {showAffiliatePicker && (
                <div className="mb-4 bg-pearl border border-green/10 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {affiliateLinks.length === 0 ? (
                    <p className="text-xs text-gray-400 font-body">No affiliate links found. Add them via the API or database.</p>
                  ) : (
                    <div className="space-y-1">
                      {affiliateLinks.map((link) => (
                        <button
                          key={link.id}
                          type="button"
                          onClick={() => selectAffiliateLink(link)}
                          className="w-full text-left px-3 py-2 rounded hover:bg-gold/10 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-medium text-gray-700 font-body">{link.event_name}</p>
                            <p className="text-[10px] text-gray-400 font-body">{link.provider} &middot; {link.commission_rate}% commission</p>
                          </div>
                          <span className="text-[9px] text-green/60 bg-green-muted px-1.5 py-0.5 rounded font-body">{link.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 font-body mb-1">Ticket Booking URL</label>
              <input value={form.ticket_url || ""} onChange={(e) => setForm({ ...form, ticket_url: e.target.value || null })} placeholder="https://www.gootickets.com/en/..." className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">Ticket Provider</label>
              <input value={form.ticket_provider || ""} onChange={(e) => setForm({ ...form, ticket_provider: e.target.value || null })} placeholder="e.g. GooTickets" className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">Commission Rate (%)</label>
              <input type="number" step="0.1" value={form.ticket_commission_rate || ""} onChange={(e) => setForm({ ...form, ticket_commission_rate: e.target.value ? parseFloat(e.target.value) : null })} placeholder="e.g. 2.5" className="w-full px-3 py-2 border border-green/20 rounded text-sm font-body" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm font-body">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm font-body">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm font-body">
                <input type="checkbox" checked={form.members_only} onChange={(e) => setForm({ ...form, members_only: e.target.checked })} />
                Members only
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} className="px-4 py-2 bg-green text-white text-sm font-body rounded-md hover:bg-green-light">
              {creating ? "Create" : "Save"}
            </button>
            <button onClick={cancelEdit} className="px-4 py-2 text-gray-500 text-sm font-body hover:text-gray-700">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="border-b border-green/10 bg-pearl">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Event</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Date</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-body font-medium">Category</th>
              <th className="text-center px-4 py-3 text-xs text-gray-500 font-body font-medium">Status</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-body font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id} className={`border-b border-green/5 last:border-0 ${!ev.active ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 font-body">
                  <div className="font-medium text-gray-800">{ev.title}</div>
                  <div className="text-xs text-gray-400">{ev.location}</div>
                </td>
                <td className="px-4 py-3 text-gray-500 font-body text-xs">{ev.date_display}</td>
                <td className="px-4 py-3 font-body">
                  <span className="text-xs text-green/70 bg-green-muted px-2 py-0.5 rounded">{ev.category}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button onClick={() => toggleActive(ev)} className={`text-[10px] px-2 py-0.5 rounded font-body ${ev.active ? "bg-green/10 text-green" : "bg-gray-100 text-gray-400"}`}>
                      {ev.active ? "Active" : "Inactive"}
                    </button>
                    <button onClick={() => toggleFeatured(ev)} className={`text-[10px] px-2 py-0.5 rounded font-body ${ev.featured ? "bg-gold/20 text-gold" : "bg-gray-50 text-gray-300"}`}>
                      {ev.featured ? "Featured" : "Standard"}
                    </button>
                    {ev.ticket_url && (
                      <span className="text-[9px] px-2 py-0.5 rounded font-body bg-gold/10 text-gold">
                        Tickets
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => startEdit(ev)} className="text-xs text-green hover:underline font-body mr-3">Edit</button>
                  <button onClick={() => handleDelete(ev.id)} className="text-xs text-red-400 hover:text-red-600 font-body">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
