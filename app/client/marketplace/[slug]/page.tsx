"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ClientNav from "@/components/client/ClientNav";

interface ListingDetail {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory: string | null;
  editorial_hook: string | null;
  editorial_description: string | null;
  maker_brand: string | null;
  year: string | null;
  condition: string | null;
  price: number | null;
  price_display: string;
  seller_display_name: string | null;
  location: string | null;
  hero_image_url: string | null;
  gallery_image_urls: string[];
  featured: boolean;
  category_fields: Record<string, unknown>;
  created_at: string;
}

interface RelatedListing {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number | null;
  price_display: string;
  hero_image_url: string | null;
  maker_brand: string | null;
  condition: string | null;
}

interface ClientInfo {
  name: string;
  email: string;
  points_balance: number;
}

const CONDITION_STYLES: Record<string, string> = {
  mint: "bg-emerald-50 text-emerald-700",
  "New": "bg-emerald-50 text-emerald-700",
  excellent: "bg-blue-50 text-blue-700",
  "Excellent": "bg-blue-50 text-blue-700",
  very_good: "bg-teal-50 text-teal-700",
  "Like New": "bg-teal-50 text-teal-700",
  good: "bg-yellow-50 text-yellow-700",
  "Good": "bg-yellow-50 text-yellow-700",
  fair: "bg-orange-50 text-orange-700",
  "Fair": "bg-orange-50 text-orange-700",
  as_described: "bg-gray-50 text-gray-600",
  "Restoration Project": "bg-gray-50 text-gray-600",
};

const CATEGORY_LABELS: Record<string, string> = {
  horology: "Horology",
  art: "Art & Objects",
  automobiles: "Automobiles",
  real_estate: "Real Estate",
  artisan_products: "Artisan Products",
};

// Category-specific field labels
const HOROLOGY_FIELDS: Record<string, string> = {
  watch_reference: "Reference",
  movement_type: "Movement",
  case_material: "Case Material",
  case_size: "Case Size",
  dial_colour: "Dial Colour",
  has_box: "Box",
  has_papers: "Papers",
  service_history: "Service History",
};

const ART_FIELDS: Record<string, string> = {
  artist: "Artist",
  medium: "Medium",
  dimensions: "Dimensions",
  signed: "Signed",
  edition: "Edition",
  certificate: "Certificate",
  provenance: "Provenance",
};

const AUTOMOBILE_FIELDS: Record<string, string> = {
  make: "Make",
  model: "Model",
  mileage: "Mileage",
  mileage_unit: "Mileage Unit",
  exterior_colour: "Exterior Colour",
  interior_colour: "Interior Colour",
  engine: "Engine",
  transmission: "Transmission",
  owners: "Previous Owners",
};

const REAL_ESTATE_FIELDS: Record<string, string> = {
  property_type: "Property Type",
  property_style: "Style",
  living_area_sqm: "Living Area (sqm)",
  land_area: "Land Area",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  period: "Period",
  property_condition: "Condition",
  notable_features: "Notable Features",
  dpe_rating: "DPE Rating",
};

const ARTISAN_FIELDS: Record<string, string> = {
  materials: "Materials",
  customisable: "Customisable",
  lead_time: "Lead Time",
  available_quantity: "Available Quantity",
};

function getFieldLabels(category: string): Record<string, string> {
  switch (category) {
    case "horology":
      return HOROLOGY_FIELDS;
    case "art":
      return ART_FIELDS;
    case "automobiles":
      return AUTOMOBILE_FIELDS;
    case "real_estate":
      return REAL_ESTATE_FIELDS;
    case "artisan_products":
      return ARTISAN_FIELDS;
    default:
      return {};
  }
}

function formatFieldValue(key: string, value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString();
  if (value === null || value === undefined) return "";
  return String(value);
}

function formatPrice(price: number | null, display: string): string {
  if (display === "price_on_request") return "Price on request";
  if (display === "offers_invited") return "Offers invited";
  if (price === null || price === undefined) return "Price on request";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function estimatePoints(price: number | null): number {
  if (!price) return 0;
  // 0.5 points per EUR for non-members (conservative display)
  return Math.floor(price * 0.5);
}

export default function MarketplaceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [related, setRelated] = useState<RelatedListing[]>([]);
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Enquiry form state
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/client/session");
      if (!sessionRes.ok) {
        router.push("/client/login");
        return;
      }
      const { client: c } = await sessionRes.json();
      setClient(c);

      const res = await fetch(`/api/client/marketplace/${slug}`);
      if (!res.ok) {
        router.push("/client/marketplace");
        return;
      }
      const data = await res.json();
      setListing(data.listing);
      setRelated(data.related || []);
      setWishlisted(data.wishlisted || false);
      setLoading(false);
    }
    load();
  }, [router, slug]);

  async function toggleWishlist() {
    if (!listing) return;
    setTogglingWishlist(true);
    const method = wishlisted ? "DELETE" : "POST";

    const res = await fetch("/api/client/marketplace/wishlist", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing_id: listing.id }),
    });

    if (res.ok) {
      setWishlisted(!wishlisted);
    }
    setTogglingWishlist(false);
  }

  async function handleEnquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!listing || !enquiryMessage.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/client/marketplace/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listing_id: listing.id,
        message: enquiryMessage,
      }),
    });

    if (res.ok) {
      setSubmitted(true);
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pearl">
        <ClientNav active="marketplace" />
        <div className="flex items-center justify-center py-32">
          <p className="text-gray-400 font-body text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const allImages = [
    listing.hero_image_url,
    ...(listing.gallery_image_urls || []),
  ].filter(Boolean) as string[];

  const fieldLabels = getFieldLabels(listing.category);
  const categoryFields = listing.category_fields || {};
  const displayFields = Object.entries(categoryFields).filter(
    ([key, value]) =>
      value !== null && value !== undefined && value !== "" && fieldLabels[key]
  );

  const pointsEstimate = estimatePoints(listing.price);

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="marketplace" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/client/marketplace"
            className="text-xs text-green/60 hover:text-green font-body"
          >
            &#8592; Back to Marketplace
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Images */}
          <div className="lg:col-span-3">
            {/* Main image */}
            <div className="rounded-lg overflow-hidden bg-green-muted mb-3 aspect-[4/3]">
              {allImages.length > 0 ? (
                <img
                  src={allImages[galleryIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedImage(allImages[galleryIndex])}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-green/15 text-sm font-body">No image</span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setGalleryIndex(idx)}
                    className={`flex-none w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                      idx === galleryIndex
                        ? "border-green"
                        : "border-transparent hover:border-green/30"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${listing.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2">
            {/* Category + condition */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-green/50 font-body uppercase tracking-wide">
                {CATEGORY_LABELS[listing.category] || listing.category}
              </span>
              {listing.condition && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-body ${
                    CONDITION_STYLES[listing.condition] || "bg-gray-50 text-gray-600"
                  }`}
                >
                  {listing.condition}
                </span>
              )}
            </div>

            <h1 className="font-heading text-xl sm:text-2xl font-semibold text-green mb-1">
              {listing.title}
            </h1>

            {listing.maker_brand && (
              <p className="text-sm text-gray-500 font-body mb-1">{listing.maker_brand}</p>
            )}
            {listing.year && (
              <p className="text-xs text-gray-400 font-body mb-1">{listing.year}</p>
            )}
            {listing.location && (
              <p className="text-xs text-gray-400 font-body mb-3">{listing.location}</p>
            )}

            {/* Price */}
            <div className="mb-4">
              <p className="text-lg font-heading font-semibold text-green">
                {formatPrice(listing.price, listing.price_display)}
              </p>
              {pointsEstimate > 0 && listing.price_display === "show_price" && (
                <p className="text-[11px] text-gold font-body mt-0.5">
                  Earn up to {pointsEstimate.toLocaleString()} points with this purchase
                </p>
              )}
            </div>

            {/* Wishlist button */}
            <button
              onClick={toggleWishlist}
              disabled={togglingWishlist}
              className={`w-full py-2.5 rounded text-sm font-body font-medium transition-colors mb-4 flex items-center justify-center gap-2 ${
                wishlisted
                  ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                  : "bg-white text-gray-600 border border-green/15 hover:border-green/30"
              }`}
            >
              {wishlisted ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                  In your wishlist
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                  Add to wishlist
                </>
              )}
            </button>

            {/* Editorial description */}
            {listing.editorial_description && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 font-body leading-relaxed whitespace-pre-line">
                  {listing.editorial_description}
                </p>
              </div>
            )}

            {/* Category-specific fields */}
            {displayFields.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-medium text-green uppercase tracking-wider mb-3 font-body">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {displayFields.map(([key, value]) => (
                    <div key={key}>
                      <p className="text-[10px] text-gray-400 font-body uppercase tracking-wide">
                        {fieldLabels[key]}
                      </p>
                      <p className="text-sm text-gray-700 font-body">
                        {formatFieldValue(key, value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enquiry form */}
            <div className="border-t border-green/10 pt-5 mt-6">
              <h3 className="text-xs font-medium text-green uppercase tracking-wider mb-3 font-body">
                Enquire About This Piece
              </h3>

              {submitted ? (
                <div className="bg-green/5 border border-green/15 rounded-lg p-4 text-center">
                  <p className="text-sm text-green font-body font-medium mb-1">
                    Enquiry sent
                  </p>
                  <p className="text-xs text-gray-500 font-body">
                    We will be in touch shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnquiry} className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 font-body mb-1">
                      From: {client?.name || client?.email}
                    </p>
                  </div>
                  <textarea
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    placeholder="I am interested in this piece..."
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-green/15 rounded text-sm font-body focus:outline-none focus:ring-1 focus:ring-green/30 bg-white resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !enquiryMessage.trim()}
                    className="w-full py-2.5 bg-green text-white text-sm font-body font-medium rounded hover:bg-green-light transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : "Send Enquiry"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Related listings */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/client/marketplace/${item.slug}`}
                  className="bg-white border border-green/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="h-32 bg-green-muted overflow-hidden">
                    {item.hero_image_url ? (
                      <img
                        src={item.hero_image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-green/15 text-[10px] font-body">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-heading text-xs font-semibold text-gray-800 leading-snug line-clamp-1">
                      {item.title}
                    </h3>
                    {item.maker_brand && (
                      <p className="text-[10px] text-gray-400 font-body mt-0.5 line-clamp-1">
                        {item.maker_brand}
                      </p>
                    )}
                    <p className="text-xs font-body font-medium text-green mt-1">
                      {formatPrice(item.price, item.price_display)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 shadow"
          >
            &#10005;
          </button>
          <img
            src={selectedImage}
            alt={listing.title}
            className="max-w-full max-h-[90vh] object-contain rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
