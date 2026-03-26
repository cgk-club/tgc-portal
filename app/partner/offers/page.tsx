"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PartnerNav from "@/components/partner/PartnerNav";

interface Offer {
  id: string;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number;
  valid_from: string | null;
  valid_to: string | null;
  terms: string | null;
  tier: string;
  status: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-200 text-gray-600",
  pending: "bg-gold/15 text-gold",
  active: "bg-green/10 text-green",
  rejected: "bg-red-100 text-red-600",
  expired: "bg-gray-200 text-gray-400",
};

export default function PartnerOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [terms, setTerms] = useState("");
  const [tier, setTier] = useState("all");

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/partner/session");
      if (!sessionRes.ok) {
        router.push("/partner/login");
        return;
      }

      await fetchOffers();
      setLoading(false);
    }
    load();
  }, [router]);

  async function fetchOffers() {
    const res = await fetch("/api/partner/offers");
    if (res.ok) {
      setOffers(await res.json());
    }
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue("");
    setValidFrom("");
    setValidTo("");
    setTerms("");
    setTier("all");
    setEditingId(null);
    setError("");
  }

  function startEdit(offer: Offer) {
    setTitle(offer.title);
    setDescription(offer.description);
    setDiscountType(offer.discount_type);
    setDiscountValue(String(offer.discount_value));
    setValidFrom(offer.valid_from || "");
    setValidTo(offer.valid_to || "");
    setTerms(offer.terms || "");
    setTier(offer.tier);
    setEditingId(offer.id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setError("");

    const body = {
      title: title.trim(),
      description: description.trim(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue) || 0,
      valid_from: validFrom || null,
      valid_to: validTo || null,
      terms: terms.trim() || null,
      tier,
    };

    const url = editingId
      ? `/api/partner/offers/${editingId}`
      : "/api/partner/offers";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      await fetchOffers();
      resetForm();
      setShowForm(false);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save offer.");
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this draft offer?")) return;
    const res = await fetch(`/api/partner/offers/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchOffers();
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
      <PartnerNav active="offers" />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-xl font-semibold text-green">
            Offers
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="text-xs px-4 py-2 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body"
          >
            {showForm ? "Cancel" : "Create Offer"}
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-green/10 rounded-lg p-5 mb-8 space-y-4"
          >
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
              {editingId ? "Edit Offer" : "New Offer"}
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

            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body bg-white"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="complimentary">Complimentary</option>
                  <option value="upgrade">Upgrade</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Discount Value
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percentage" ? "e.g. 15" : "e.g. 100"}
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Valid From
                </label>
                <input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Valid To
                </label>
                <input
                  type="date"
                  value={validTo}
                  onChange={(e) => setValidTo(e.target.value)}
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Terms and Conditions
              </label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={2}
                placeholder="Minimum stay, blackout dates, conditions..."
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Available To
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body bg-white"
              >
                <option value="all">All clients</option>
                <option value="members">Members only</option>
              </select>
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
                  ? "Update Offer"
                  : "Create Offer"}
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

        {/* Offers List */}
        {offers.length === 0 ? (
          <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
            <p className="text-sm text-gray-400 font-body mb-2">
              No offers yet.
            </p>
            <p className="text-xs text-gray-400 font-body">
              Create your first offer to share with TGC clients.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white border border-green/10 rounded-lg p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-sm font-semibold text-gray-800">
                        {offer.title}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-body ${
                          STATUS_STYLES[offer.status] || STATUS_STYLES.draft
                        }`}
                      >
                        {offer.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-body mb-2">
                      {offer.description}
                    </p>
                    <div className="flex flex-wrap gap-3 text-[11px] text-gray-400 font-body">
                      <span>
                        {offer.discount_type === "percentage"
                          ? `${offer.discount_value}% off`
                          : offer.discount_type === "fixed"
                          ? `EUR ${offer.discount_value} off`
                          : offer.discount_type === "complimentary"
                          ? "Complimentary"
                          : "Upgrade"}
                      </span>
                      {offer.valid_from && (
                        <span>
                          From{" "}
                          {new Date(offer.valid_from).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </span>
                      )}
                      {offer.valid_to && (
                        <span>
                          Until{" "}
                          {new Date(offer.valid_to).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </span>
                      )}
                      <span>
                        {offer.tier === "members"
                          ? "Members only"
                          : "All clients"}
                      </span>
                    </div>
                    {offer.terms && (
                      <p className="text-[11px] text-gray-400 font-body mt-2 italic">
                        {offer.terms}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-none">
                    {(offer.status === "draft" ||
                      offer.status === "pending") && (
                      <button
                        onClick={() => startEdit(offer)}
                        className="text-xs text-green hover:underline font-body"
                      >
                        Edit
                      </button>
                    )}
                    {offer.status === "draft" && (
                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="text-xs text-red-400 hover:text-red-600 font-body"
                      >
                        Delete
                      </button>
                    )}
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
