"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import PartnerNav from "@/components/partner/PartnerNav";
import ImageUpload from "@/components/partner/ImageUpload";

interface EventStats {
  duration?: string;
  group_size?: string;
  distance?: string;
  countries?: string;
  start_point?: string;
  end_point?: string;
}

interface PricingTier {
  name: string;
  price: string;
  description: string;
}

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
  is_free: boolean;
  pricing_tiers: PricingTier[];
  brochure_url: string | null;
  gallery_images: string[] | null;
  stats: EventStats | null;
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
  const [editingWasActive, setEditingWasActive] = useState(false);
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
  const [isFree, setIsFree] = useState(false);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [brochureUrl, setBrochureUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [stats, setStats] = useState<EventStats>({});
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const brochureInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const uploadPartnerFile = useCallback(async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/partner/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { url } = await res.json();
      return url;
    }
    return null;
  }, []);

  async function handleBrochureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBrochure(true);
    const url = await uploadPartnerFile(file);
    if (url) setBrochureUrl(url);
    setUploadingBrochure(false);
    if (brochureInputRef.current) brochureInputRef.current.value = "";
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    const newUrls: string[] = [...galleryImages];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadPartnerFile(files[i]);
      if (url) newUrls.push(url);
    }
    setGalleryImages(newUrls);
    setUploadingGallery(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  function removeGalleryImage(index: number) {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  }

  function updateStat(key: keyof EventStats, value: string) {
    setStats((prev) => ({ ...prev, [key]: value || undefined }));
  }

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
    setIsFree(false);
    setPricingTiers([]);
    setBrochureUrl("");
    setGalleryImages([]);
    setStats({});
    setEditingId(null);
    setEditingWasActive(false);
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
    setIsFree(event.is_free || false);
    setPricingTiers(
      Array.isArray(event.pricing_tiers) && event.pricing_tiers.length > 0
        ? event.pricing_tiers
        : []
    );
    setBrochureUrl(event.brochure_url || "");
    setGalleryImages(event.gallery_images || []);
    setStats(event.stats || {});
    setEditingId(event.id);
    setEditingWasActive(event.status === "approved");
    setShowForm(true);
    setError("");
  }

  // Compute the display price from pricing tiers
  function computeDisplayPrice(tiers: PricingTier[]): string {
    const prices = tiers
      .map((t) => {
        const match = t.price.match(/[\d,.]+/);
        return match ? parseFloat(match[0].replace(",", "")) : null;
      })
      .filter((p): p is number => p !== null && !isNaN(p));

    if (prices.length === 0) return "";

    const cheapest = Math.min(...prices);
    // Try to extract the currency from the first tier
    const currencyMatch = tiers[0]?.price.match(/[A-Z]{3}|[\$\u00a3\u20ac]/);
    const currency = currencyMatch ? currencyMatch[0] : "EUR";

    return `From ${currency} ${cheapest.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
  }

  function addPricingTier() {
    setPricingTiers([...pricingTiers, { name: "", price: "", description: "" }]);
  }

  function removePricingTier(index: number) {
    setPricingTiers(pricingTiers.filter((_, i) => i !== index));
  }

  function updatePricingTier(
    index: number,
    field: keyof PricingTier,
    value: string
  ) {
    const updated = [...pricingTiers];
    updated[index] = { ...updated[index], [field]: value };
    setPricingTiers(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dateDisplay.trim()) {
      setError("Title and date display are required.");
      return;
    }

    setSaving(true);
    setError("");

    // Auto-compute display price from tiers if paid and tiers exist
    let displayPrice = price.trim() || null;
    if (!isFree && pricingTiers.length > 0) {
      const computed = computeDisplayPrice(pricingTiers);
      if (computed) displayPrice = computed;
    }
    if (isFree) {
      displayPrice = "Free";
    }

    const body: Record<string, unknown> = {
      title: title.trim(),
      category,
      date_display: dateDisplay.trim(),
      date_start: dateStart || null,
      date_end: dateEnd || null,
      location: location.trim() || null,
      capacity: capacity ? parseInt(capacity) : null,
      price: displayPrice,
      description: description.trim() || null,
      highlights: highlights.trim() || null,
      image_url: imageUrl.trim() || null,
      is_free: isFree,
      pricing_tiers: isFree ? [] : pricingTiers.filter((t) => t.name.trim()),
      brochure_url: brochureUrl.trim() || null,
      gallery_images: galleryImages.length > 0 ? galleryImages : null,
      stats: Object.values(stats).some(Boolean) ? Object.fromEntries(Object.entries(stats).filter(([, v]) => v)) : null,
    };

    const url = editingId
      ? `/api/partner/events/${editingId}`
      : "/api/partner/events";
    const method = editingId ? "PATCH" : "POST";

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

            {editingWasActive && (
              <div className="bg-gold/5 border border-gold/20 rounded-md p-3">
                <p className="text-xs text-green font-body">
                  This event is currently live. Saving changes will set it back
                  to pending for re-approval.
                </p>
              </div>
            )}

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

            {/* Free/Paid Toggle */}
            <div>
              <label className="block text-xs text-gray-500 font-body mb-2">
                Pricing
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFree(false)}
                  className={`px-4 py-2 text-xs font-body rounded-md border transition-colors ${
                    !isFree
                      ? "bg-green text-white border-green"
                      : "bg-white text-gray-500 border-green/20 hover:border-green/40"
                  }`}
                >
                  Paid
                </button>
                <button
                  type="button"
                  onClick={() => setIsFree(true)}
                  className={`px-4 py-2 text-xs font-body rounded-md border transition-colors ${
                    isFree
                      ? "bg-green text-white border-green"
                      : "bg-white text-gray-500 border-green/20 hover:border-green/40"
                  }`}
                >
                  Free
                </button>
              </div>
            </div>

            {/* Pricing Tiers (only when paid) */}
            {!isFree && (
              <div>
                <label className="block text-xs text-gray-500 font-body mb-2">
                  Pricing Tiers
                </label>
                <div className="space-y-3 mb-3">
                  {pricingTiers.map((tier, i) => (
                    <div
                      key={i}
                      className="bg-green/[0.02] border border-green/10 rounded-md p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-body uppercase tracking-wider">
                          Tier {i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePricingTier(i)}
                          className="text-xs text-red-400 hover:text-red-600 font-body"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) =>
                            updatePricingTier(i, "name", e.target.value)
                          }
                          placeholder="e.g. General Admission, VIP, Table of 10"
                          className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                        />
                        <input
                          type="text"
                          value={tier.price}
                          onChange={(e) =>
                            updatePricingTier(i, "price", e.target.value)
                          }
                          placeholder="e.g. EUR 450"
                          className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                        />
                      </div>
                      <input
                        type="text"
                        value={tier.description}
                        onChange={(e) =>
                          updatePricingTier(i, "description", e.target.value)
                        }
                        placeholder="Description (optional)"
                        className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addPricingTier}
                  className="text-xs text-green hover:text-green-light font-body flex items-center gap-1 transition-colors"
                >
                  <span className="text-sm">+</span> Add pricing tier
                </button>

                {pricingTiers.length === 0 && (
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 font-body mb-1">
                      Price (or add tiers above)
                    </label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. From EUR 450 per person"
                      className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                    />
                  </div>
                )}

                {pricingTiers.length > 0 && (
                  <p className="text-[10px] text-gray-400 font-body mt-2">
                    Display price will be auto-generated from the cheapest tier.
                  </p>
                )}
              </div>
            )}

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

            {/* Image Upload */}
            <ImageUpload
              value={imageUrl || null}
              onChange={(url) => setImageUrl(url || "")}
              label="Event Image"
            />

            {/* Enhanced Presentation */}
            <div className="border-t border-green/10 pt-4 mt-2">
              <h3 className="text-xs font-medium text-green uppercase tracking-wider font-body mb-3">
                Enhanced Presentation (optional)
              </h3>
            </div>

            {/* Brochure PDF */}
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Brochure / Itinerary PDF
              </label>
              {brochureUrl ? (
                <div className="flex items-center gap-3 bg-pearl border border-green/10 rounded-md p-3">
                  <svg className="w-5 h-5 text-green flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-600 font-body truncate flex-1">
                    {brochureUrl.split("/").pop()}
                  </span>
                  <button type="button" onClick={() => setBrochureUrl("")} className="text-xs text-red-400 hover:text-red-600 font-body">Remove</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => brochureInputRef.current?.click()}
                  disabled={uploadingBrochure}
                  className="w-full border-2 border-dashed border-green/20 rounded-md p-4 text-center hover:border-green/40 transition-colors"
                >
                  <p className="text-xs text-gray-500 font-body">
                    {uploadingBrochure ? "Uploading..." : "Upload brochure PDF"}
                  </p>
                </button>
              )}
              <input ref={brochureInputRef} type="file" accept=".pdf,application/pdf" onChange={handleBrochureUpload} className="hidden" />
            </div>

            {/* Gallery Images */}
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Gallery Images
              </label>
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {galleryImages.map((url, i) => (
                    <div key={i} className="relative rounded-md overflow-hidden aspect-square group">
                      <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        &#10005;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                className="text-xs text-green hover:text-green-light font-body flex items-center gap-1 transition-colors"
              >
                <span className="text-sm">+</span> {uploadingGallery ? "Uploading..." : "Add gallery images"}
              </button>
              <p className="text-[10px] text-gray-400 font-body mt-1">
                Images pair with your highlights in order.
              </p>
              <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
            </div>

            {/* Stats */}
            <div>
              <label className="block text-xs text-gray-500 font-body mb-2">
                Event Stats
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-body mb-0.5">Duration</label>
                  <input
                    type="text"
                    value={stats.duration || ""}
                    onChange={(e) => updateStat("duration", e.target.value)}
                    placeholder="e.g. 5 Days"
                    className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-body mb-0.5">Group Size</label>
                  <input
                    type="text"
                    value={stats.group_size || ""}
                    onChange={(e) => updateStat("group_size", e.target.value)}
                    placeholder="e.g. Max 20"
                    className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-body mb-0.5">Total Distance</label>
                  <input
                    type="text"
                    value={stats.distance || ""}
                    onChange={(e) => updateStat("distance", e.target.value)}
                    placeholder="e.g. 1,200 km"
                    className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-body mb-0.5">Countries</label>
                  <input
                    type="text"
                    value={stats.countries || ""}
                    onChange={(e) => updateStat("countries", e.target.value)}
                    placeholder="e.g. 3"
                    className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-body mb-0.5">Starting Point</label>
                  <input
                    type="text"
                    value={stats.start_point || ""}
                    onChange={(e) => updateStat("start_point", e.target.value)}
                    placeholder="e.g. Monaco"
                    className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-body mb-0.5">End Point</label>
                  <input
                    type="text"
                    value={stats.end_point || ""}
                    onChange={(e) => updateStat("end_point", e.target.value)}
                    placeholder="e.g. Milan"
                    className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                  />
                </div>
              </div>
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
                      {event.is_free && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-green/5 text-green font-body flex-none">
                          Free
                        </span>
                      )}
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
                      {event.status !== "rejected" && (
                        <button
                          onClick={() => startEdit(event)}
                          className="text-xs text-green hover:underline font-body"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-xs text-red-400 hover:text-red-600 font-body"
                      >
                        Delete
                      </button>
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
