"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PartnerNav from "@/components/partner/PartnerNav";

interface PartnerEvent {
  id: string;
  title: string;
  category: string;
  date_display: string;
  date_start: string | null;
  date_end: string | null;
  location: string | null;
  capacity: number | null;
  price: string | null;
  description: string | null;
  highlights: string | null;
  image_url: string | null;
  status: string;
  enquiry_count: number;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-200 text-gray-600",
  pending: "bg-gold/15 text-gold",
  approved: "bg-green/10 text-green",
  rejected: "bg-red-100 text-red-600",
};

const CATEGORIES = [
  "Polo",
  "Wine",
  "Art",
  "Music",
  "Motorsport",
  "Golf",
  "Sailing",
  "Gastronomy",
  "Fashion",
  "Culture",
  "Wellness",
  "Social",
  "Other",
];

export default function PartnerEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<PartnerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Other");
  const [dateDisplay, setDateDisplay] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/partner/session");
      if (!sessionRes.ok) {
        router.push("/partner/login");
        return;
      }
      await fetchEvents();
      setLoading(false);
    }
    load();
  }, [router]);

  async function fetchEvents() {
    const res = await fetch("/api/partner/events");
    if (res.ok) {
      setEvents(await res.json());
    }
  }

  function resetForm() {
    setTitle("");
    setCategory("Other");
    setDateDisplay("");
    setDateStart("");
    setDateEnd("");
    setLocation("");
    setCapacity("");
    setPrice("");
    setDescription("");
    setHighlights("");
    setImageUrl("");
    setEditingId(null);
    setError("");
  }

  function startEdit(event: PartnerEvent) {
    setTitle(event.title);
    setCategory(event.category);
    setDateDisplay(event.date_display);
    setDateStart(event.date_start || "");
    setDateEnd(event.date_end || "");
    setLocation(event.location || "");
    setCapacity(event.capacity ? String(event.capacity) : "");
    setPrice(event.price || "");
    setDescription(event.description || "");
    setHighlights(event.highlights || "");
    setImageUrl(event.image_url || "");
    setEditingId(event.id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dateDisplay.trim()) {
      setError("Title and date display are required.");
      return;
    }

    setSaving(true);
    setError("");

    const body = {
      title: title.trim(),
      category,
      date_display: dateDisplay.trim(),
      date_start: dateStart || null,
      date_end: dateEnd || null,
      location: location.trim() || null,
      capacity: capacity ? parseInt(capacity) : null,
      price: price.trim() || null,
      description: description.trim() || null,
      highlights: highlights.trim() || null,
      image_url: imageUrl.trim() || null,
    };

    const url = editingId
      ? `/api/partner/events/${editingId}`
      : "/api/partner/events";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      await fetchEvents();
      resetForm();
      setShowForm(false);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save event.");
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/api/partner/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchEvents();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <p className="text-gray-400 font-body">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl">
      <PartnerNav active="events" />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-xl font-semibold text-green">
            Events
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="text-xs px-4 py-2 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body"
          >
            {showForm ? "Cancel" : "Add Event"}
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-green/10 rounded-lg p-5 mb-8 space-y-4"
          >
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
              {editingId ? "Edit Event" : "New Event"}
            </h2>

            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Date Display
                </label>
                <input
                  type="text"
                  value={dateDisplay}
                  onChange={(e) => setDateDisplay(e.target.value)}
                  placeholder="e.g. 15-18 June 2026"
                  required
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Price
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. From EUR 450 per person"
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Highlights (one per line)
              </label>
              <textarea
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                rows={3}
                placeholder="Private tasting with the winemaker&#10;Sunset dinner on the terrace&#10;Guided vineyard tour"
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>

            {error && <p className="text-sm text-red-500 font-body">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Event"
                  : "Create Event"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-5 py-2 border border-green/20 text-green text-sm font-medium rounded-md hover:bg-green/5 transition-colors font-body"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
            <p className="text-sm text-gray-400 font-body mb-2">
              No events yet.
            </p>
            <p className="text-xs text-gray-400 font-body">
              List your upcoming events for TGC clients to discover.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-green/10 rounded-lg overflow-hidden"
              >
                <div className="flex gap-4 p-5">
                  {event.image_url && (
                    <div className="hidden sm:block w-24 h-24 rounded-md overflow-hidden flex-none">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-sm font-semibold text-gray-800 truncate">
                        {event.title}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-body flex-none ${
                          STATUS_STYLES[event.status] || STATUS_STYLES.draft
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-green/50 uppercase tracking-wide font-body mb-1">
                      {event.category}
                    </p>
                    <p className="text-xs text-gray-500 font-body">
                      {event.date_display}
                    </p>
                    {event.location && (
                      <p className="text-xs text-gray-400 font-body">
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-xs text-gray-400 font-body mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] text-gray-400 font-body">
                        {event.enquiry_count}{" "}
                        {event.enquiry_count === 1 ? "enquiry" : "enquiries"}
                      </span>
                      {(event.status === "draft" ||
                        event.status === "pending") && (
                        <>
                          <button
                            onClick={() => startEdit(event)}
                            className="text-xs text-green hover:underline font-body"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="text-xs text-red-400 hover:text-red-600 font-body"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
