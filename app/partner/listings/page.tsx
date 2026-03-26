"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PartnerNav from "@/components/partner/PartnerNav";
import ListingChat from "@/components/partner/ListingChat";

interface Listing {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number | null;
  price_display: string;
  status: string;
  hero_image_url: string | null;
  maker_brand: string | null;
  condition: string | null;
  location: string | null;
  enquiry_count?: number;
  created_at: string;
  updated_at: string;
}

interface Enquiry {
  id: string;
  listing_id: string;
  listing_title: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

interface Order {
  id: string;
  listing_id: string;
  listing_title: string;
  client_name: string;
  quantity: number;
  total_amount: number;
  payment_status: string;
  fulfilment_status: string;
  tracking_number: string | null;
  created_at: string;
}

const LISTING_STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-200 text-gray-600",
  review: "bg-gold/15 text-gold",
  live: "bg-green/10 text-green",
  sold: "bg-blue-100 text-blue-600",
  reserved: "bg-purple-100 text-purple-600",
  withdrawn: "bg-gray-200 text-gray-400",
  archived: "bg-gray-200 text-gray-400",
  rejected: "bg-red-100 text-red-600",
};

const ENQUIRY_STATUS_STYLES: Record<string, string> = {
  new: "bg-gold/15 text-gold",
  responded: "bg-green/10 text-green",
  negotiating: "bg-blue-100 text-blue-600",
  sold: "bg-green/10 text-green",
  declined: "bg-gray-200 text-gray-400",
  cold: "bg-gray-200 text-gray-400",
};

const FULFILMENT_STATUS_STYLES: Record<string, string> = {
  pending: "bg-gold/15 text-gold",
  processing: "bg-blue-100 text-blue-600",
  shipped: "bg-purple-100 text-purple-600",
  delivered: "bg-green/10 text-green",
  cancelled: "bg-red-100 text-red-600",
};

const CATEGORIES = [
  { slug: "horology", label: "Horology", dbValue: "horology" },
  { slug: "art", label: "Art & Objects", dbValue: "art" },
  { slug: "automobiles", label: "Automobiles", dbValue: "automobiles" },
  { slug: "real_estate", label: "Real Estate", dbValue: "real_estate" },
  { slug: "artisan_products", label: "Artisan Products", dbValue: "artisan_products" },
];

type Tab = "listings" | "enquiries" | "orders";

export default function PartnerListingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("listings");
  const [listings, setListings] = useState<Listing[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerName, setPartnerName] = useState("");
  const [error, setError] = useState("");

  // New listing state
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editPriceDisplay, setEditPriceDisplay] = useState("show_price");
  const [editLocation, setEditLocation] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Fulfilment
  const [trackingInput, setTrackingInput] = useState("");

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/partner/session");
      if (!sessionRes.ok) {
        router.push("/partner/login");
        return;
      }
      const sessionData = await sessionRes.json();
      setPartnerName(sessionData.partner?.org_name || "Partner");

      await Promise.all([fetchListings(), fetchEnquiries(), fetchOrders()]);
      setLoading(false);
    }
    load();
  }, [router]);

  async function fetchListings() {
    const res = await fetch("/api/partner/listings");
    if (res.ok) {
      setListings(await res.json());
    }
  }

  async function fetchEnquiries() {
    // Fetch enquiries across all partner listings
    const res = await fetch("/api/partner/listings?include=enquiries");
    if (res.ok) {
      const data = await res.json();
      if (data.enquiries) {
        setEnquiries(data.enquiries);
      }
    }
  }

  async function fetchOrders() {
    const res = await fetch("/api/partner/listings/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  }

  function startEdit(listing: Listing) {
    setEditingListing(listing);
    setEditTitle(listing.title);
    setEditPrice(listing.price ? String(listing.price) : "");
    setEditPriceDisplay(listing.price_display || "show_price");
    setEditLocation(listing.location || "");
    setError("");
  }

  async function handleEditSave() {
    if (!editingListing) return;
    setEditSaving(true);
    setError("");

    const res = await fetch(`/api/partner/listings/${editingListing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle.trim(),
        price: editPrice ? parseFloat(editPrice) : null,
        price_display: editPriceDisplay,
        location: editLocation.trim() || null,
      }),
    });

    if (res.ok) {
      await fetchListings();
      setEditingListing(null);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save.");
    }
    setEditSaving(false);
  }

  async function handleWithdraw(id: string) {
    if (!confirm("Withdraw this listing?")) return;
    const res = await fetch(`/api/partner/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "withdrawn" }),
    });
    if (res.ok) await fetchListings();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    const res = await fetch(`/api/partner/listings/${id}`, { method: "DELETE" });
    if (res.ok) await fetchListings();
  }

  async function handleEnquiryReply(enquiryId: string, listingId: string) {
    const res = await fetch(`/api/partner/listings/${listingId}/enquiries`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enquiry_id: enquiryId, status: "responded" }),
    });
    if (res.ok) await fetchEnquiries();
  }

  async function handleFulfilmentUpdate(
    orderId: string,
    listingId: string,
    newStatus: string,
    tracking?: string
  ) {
    const res = await fetch(`/api/partner/listings/${listingId}/fulfilment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: orderId,
        fulfilment_status: newStatus,
        tracking_number: tracking || null,
      }),
    });
    if (res.ok) {
      await fetchOrders();
      setTrackingInput("");
    }
  }

  async function handleChatComplete(data: Record<string, unknown>, rawInput: string) {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/partner/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          category: selectedCategory,
          seller_raw_input: rawInput,
        }),
      });

      if (res.ok) {
        await fetchListings();
        setSelectedCategory(null);
        setShowCategoryPicker(false);
        setActiveTab("listings");
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Failed to create listing.");
      }
    } catch {
      setError("Failed to create listing.");
    }

    setSubmitting(false);
  }

  function formatPrice(price: number | null, priceDisplay: string): string {
    if (priceDisplay === "price_on_request") return "Price on request";
    if (priceDisplay === "offers_invited") return "Offers invited";
    if (!price) return "Price on request";
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  function formatCategoryLabel(cat: string): string {
    const found = CATEGORIES.find((c) => c.dbValue === cat || c.slug === cat);
    return found?.label || cat;
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
      <PartnerNav active="listings" />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-xl font-semibold text-green">
            Marketplace Listings
          </h1>
          {!showCategoryPicker && !selectedCategory && (
            <button
              onClick={() => {
                setShowCategoryPicker(true);
                setSelectedCategory(null);
              }}
              className="text-xs px-4 py-2 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body"
            >
              New Listing
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-green/10">
          {(
            [
              { key: "listings", label: "My Listings", count: listings.length },
              { key: "enquiries", label: "Enquiries", count: enquiries.length },
              { key: "orders", label: "Orders", count: orders.length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-xs font-body px-4 py-2.5 transition-colors relative ${
                activeTab === tab.key
                  ? "text-green font-medium"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-[10px] bg-green/10 text-green px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green" />
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-600 font-body">{error}</p>
          </div>
        )}

        {/* Category Picker */}
        {showCategoryPicker && !selectedCategory && (
          <div className="bg-white border border-green/10 rounded-lg p-5 mb-8">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">
              Select a category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => {
                    setSelectedCategory(cat.dbValue);
                    setSelectedCategoryLabel(cat.label);
                  }}
                  className="text-left p-4 rounded-lg border border-green/10 hover:border-green/30 hover:bg-green/[0.02] transition-colors group"
                >
                  <span className="font-heading text-sm font-semibold text-gray-800 group-hover:text-green transition-colors">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCategoryPicker(false)}
              className="mt-4 text-xs text-gray-400 hover:text-gray-600 font-body"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Chat Intake */}
        {selectedCategory && (
          <div className="mb-8">
            {submitting ? (
              <div className="bg-white border border-green/10 rounded-lg p-8 text-center">
                <div className="w-6 h-6 border-2 border-green/30 border-t-green rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-body">Creating your listing...</p>
              </div>
            ) : (
              <ListingChat
                category={selectedCategory}
                categoryLabel={selectedCategoryLabel}
                partnerName={partnerName}
                onComplete={handleChatComplete}
                onCancel={() => {
                  setSelectedCategory(null);
                  setShowCategoryPicker(false);
                }}
              />
            )}
          </div>
        )}

        {/* Edit Modal */}
        {editingListing && (
          <div className="bg-white border border-green/10 rounded-lg p-5 mb-8 space-y-4">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
              Edit Listing
            </h2>
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">Price (EUR)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="Leave empty for POA"
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">Price Display</label>
                <select
                  value={editPriceDisplay}
                  onChange={(e) => setEditPriceDisplay(e.target.value)}
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body bg-white"
                >
                  <option value="show_price">Show Price</option>
                  <option value="price_on_request">Price on Request</option>
                  <option value="offers_invited">Offers Invited</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">Location</label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="px-5 py-2 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50"
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setEditingListing(null)}
                className="px-5 py-2 border border-green/20 text-green text-sm font-medium rounded-md hover:bg-green/5 transition-colors font-body"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* MY LISTINGS TAB */}
        {activeTab === "listings" && !showCategoryPicker && !selectedCategory && (
          <>
            {listings.length === 0 ? (
              <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
                <p className="text-sm text-gray-400 font-body mb-2">
                  No listings yet.
                </p>
                <p className="text-xs text-gray-400 font-body">
                  List your products on the TGC Marketplace through our guided intake.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white border border-green/10 rounded-lg overflow-hidden"
                  >
                    <div className="flex gap-4 p-5">
                      {listing.hero_image_url && (
                        <div className="hidden sm:block w-24 h-24 rounded-md overflow-hidden flex-none">
                          <img
                            src={listing.hero_image_url}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading text-sm font-semibold text-gray-800 truncate">
                            {listing.title}
                          </h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-body flex-none ${
                              LISTING_STATUS_STYLES[listing.status] || LISTING_STATUS_STYLES.draft
                            }`}
                          >
                            {listing.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-green/50 uppercase tracking-wide font-body mb-1">
                          {formatCategoryLabel(listing.category)}
                          {listing.maker_brand && ` / ${listing.maker_brand}`}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 font-body">
                          <span>{formatPrice(listing.price, listing.price_display)}</span>
                          {listing.condition && <span>{listing.condition}</span>}
                          {listing.location && <span>{listing.location}</span>}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          {listing.enquiry_count !== undefined && (
                            <span className="text-[11px] text-gray-400 font-body">
                              {listing.enquiry_count}{" "}
                              {listing.enquiry_count === 1 ? "enquiry" : "enquiries"}
                            </span>
                          )}
                          {listing.status !== "rejected" &&
                            listing.status !== "sold" &&
                            listing.status !== "withdrawn" && (
                              <button
                                onClick={() => startEdit(listing)}
                                className="text-xs text-green hover:underline font-body"
                              >
                                Edit
                              </button>
                            )}
                          {(listing.status === "live" || listing.status === "review") && (
                            <button
                              onClick={() => handleWithdraw(listing.id)}
                              className="text-xs text-gray-400 hover:text-gray-600 font-body"
                            >
                              Withdraw
                            </button>
                          )}
                          {(listing.status === "draft" || listing.status === "withdrawn") && (
                            <button
                              onClick={() => handleDelete(listing.id)}
                              className="text-xs text-red-400 hover:text-red-600 font-body"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ENQUIRIES TAB */}
        {activeTab === "enquiries" && (
          <>
            {enquiries.length === 0 ? (
              <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
                <p className="text-sm text-gray-400 font-body mb-2">
                  No enquiries yet.
                </p>
                <p className="text-xs text-gray-400 font-body">
                  Enquiries from interested buyers will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {enquiries.map((enquiry) => (
                  <div
                    key={enquiry.id}
                    className="bg-white border border-green/10 rounded-lg p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading text-sm font-semibold text-gray-800">
                            {enquiry.listing_title}
                          </h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-body ${
                              ENQUIRY_STATUS_STYLES[enquiry.status] || ENQUIRY_STATUS_STYLES.new
                            }`}
                          >
                            {enquiry.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-body mb-1">
                          From: {enquiry.name} ({enquiry.email})
                          {enquiry.phone && ` / ${enquiry.phone}`}
                        </p>
                        {enquiry.message && (
                          <p className="text-xs text-gray-500 font-body bg-pearl rounded-md p-3 mt-2">
                            {enquiry.message}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 font-body mt-2">
                          {new Date(enquiry.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      {enquiry.status === "new" && (
                        <button
                          onClick={() => handleEnquiryReply(enquiry.id, enquiry.listing_id)}
                          className="text-xs px-3 py-1.5 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body flex-none"
                        >
                          Mark Replied
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <>
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
                <p className="text-sm text-gray-400 font-body mb-2">
                  No orders yet.
                </p>
                <p className="text-xs text-gray-400 font-body">
                  Orders placed against your listings will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-green/10 rounded-lg p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading text-sm font-semibold text-gray-800">
                            {order.listing_title}
                          </h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-body ${
                              FULFILMENT_STATUS_STYLES[order.fulfilment_status] ||
                              FULFILMENT_STATUS_STYLES.pending
                            }`}
                          >
                            {order.fulfilment_status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 font-body">
                          <span>Client: {order.client_name}</span>
                          <span>Qty: {order.quantity}</span>
                          <span>
                            {new Intl.NumberFormat("en-GB", {
                              style: "currency",
                              currency: "EUR",
                              minimumFractionDigits: 0,
                            }).format(order.total_amount)}
                          </span>
                        </div>
                        {order.tracking_number && (
                          <p className="text-[10px] text-gray-400 font-body mt-1">
                            Tracking: {order.tracking_number}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 font-body mt-1">
                          {new Date(order.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 flex-none">
                        {order.fulfilment_status === "pending" && (
                          <button
                            onClick={() =>
                              handleFulfilmentUpdate(order.id, order.listing_id, "processing")
                            }
                            className="text-xs px-3 py-1.5 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body"
                          >
                            Processing
                          </button>
                        )}
                        {order.fulfilment_status === "processing" && (
                          <div className="flex flex-col gap-1.5">
                            <input
                              type="text"
                              value={trackingInput}
                              onChange={(e) => setTrackingInput(e.target.value)}
                              placeholder="Tracking number"
                              className="rounded-md border border-green/20 px-2 py-1 text-xs text-gray-800 focus:border-green focus:outline-none font-body w-36"
                            />
                            <button
                              onClick={() =>
                                handleFulfilmentUpdate(
                                  order.id,
                                  order.listing_id,
                                  "shipped",
                                  trackingInput
                                )
                              }
                              className="text-xs px-3 py-1.5 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body"
                            >
                              Mark Shipped
                            </button>
                          </div>
                        )}
                        {order.fulfilment_status === "shipped" && (
                          <button
                            onClick={() =>
                              handleFulfilmentUpdate(order.id, order.listing_id, "delivered")
                            }
                            className="text-xs px-3 py-1.5 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body"
                          >
                            Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
