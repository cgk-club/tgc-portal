"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ClientNav from "@/components/client/ClientNav";

interface MarketplaceListing {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number | null;
  price_display: string;
  status: string;
  featured: boolean;
  editorial_hook: string | null;
  hero_image_url: string | null;
  maker_brand: string | null;
  year: string | null;
  condition: string | null;
  location: string | null;
  created_at: string;
}

const CATEGORIES = [
  { slug: "all", label: "All" },
  { slug: "horology", label: "Horology" },
  { slug: "art", label: "Art & Objects" },
  { slug: "automobiles", label: "Automobiles" },
  { slug: "real_estate", label: "Real Estate" },
  { slug: "artisan_products", label: "Artisan Products" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

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

export default function ClientMarketplacePage() {
  const router = useRouter();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("newest");
  const [togglingWishlist, setTogglingWishlist] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (search) params.set("search", search);
    params.set("sort", sort);

    const res = await fetch(`/api/client/marketplace?${params}`);
    if (res.ok) {
      const data = await res.json();
      setListings(data);
    }
    setLoading(false);
  }, [category, search, sort]);

  useEffect(() => {
    async function init() {
      const sessionRes = await fetch("/api/client/session");
      if (!sessionRes.ok) {
        router.push("/client/login");
        return;
      }
      const { client } = await sessionRes.json();
      setPoints(client.points_balance || 0);

      // Load wishlist IDs
      const wishRes = await fetch("/api/client/marketplace/wishlist");
      if (wishRes.ok) {
        const { listing_ids } = await wishRes.json();
        setWishlistedIds(new Set(listing_ids || []));
      }

      fetchListings();
    }
    init();
  }, [router, fetchListings]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  async function toggleWishlist(e: React.MouseEvent, listingId: string) {
    e.preventDefault();
    e.stopPropagation();
    setTogglingWishlist(listingId);

    const isWishlisted = wishlistedIds.has(listingId);
    const method = isWishlisted ? "DELETE" : "POST";

    const res = await fetch("/api/client/marketplace/wishlist", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing_id: listingId }),
    });

    if (res.ok) {
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        if (isWishlisted) {
          next.delete(listingId);
        } else {
          next.add(listingId);
        }
        return next;
      });
    }
    setTogglingWishlist(null);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="marketplace" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-xl sm:text-2xl font-semibold text-green mb-2">
            Marketplace
          </h1>
          <p className="text-sm text-gray-500 font-body">
            Curated pieces from our network of trusted sellers and makers.
          </p>
        </div>

        {/* Points bar */}
        {points > 0 && (
          <div className="bg-gold/5 border border-gold/15 rounded-lg px-4 py-2.5 mb-6 flex items-center justify-between">
            <span className="text-xs text-gray-600 font-body">
              You have <span className="font-semibold text-gold">{points.toLocaleString()} points</span> (EUR {(points / 100).toFixed(2)} available)
            </span>
            <Link href="/client/points" className="text-xs text-green hover:underline font-body">
              View points
            </Link>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Category tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setCategory(cat.slug)}
                className={`text-xs font-body whitespace-nowrap px-3 py-2 rounded-sm transition-colors ${
                  category === cat.slug
                    ? "bg-green/10 text-green font-medium"
                    : "text-gray-500 hover:text-green hover:bg-green/5"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search and sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title or brand..."
                className="flex-1 px-3 py-2 border border-green/15 rounded text-sm font-body focus:outline-none focus:ring-1 focus:ring-green/30 bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green text-white text-xs font-body rounded hover:bg-green-light transition-colors"
              >
                Search
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSearchInput("");
                  }}
                  className="px-3 py-2 text-xs text-gray-400 hover:text-gray-600 font-body"
                >
                  Clear
                </button>
              )}
            </form>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 border border-green/15 rounded text-sm font-body focus:outline-none focus:ring-1 focus:ring-green/30 bg-white"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Listings grid */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-400 font-body text-sm">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400 font-body mb-2">
              No listings found{search ? ` for "${search}"` : ""}.
            </p>
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                }}
                className="text-xs text-green hover:underline font-body"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/client/marketplace/${listing.slug}`}
                className="bg-white border border-green/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow group relative"
              >
                {/* Hero image */}
                <div className="h-48 bg-green-muted overflow-hidden relative">
                  {listing.hero_image_url ? (
                    <img
                      src={listing.hero_image_url}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-green/15 text-xs font-body">
                        {CATEGORY_LABELS[listing.category] || listing.category}
                      </span>
                    </div>
                  )}

                  {/* Featured badge */}
                  {listing.featured && (
                    <span className="absolute top-2 left-2 bg-gold/90 text-white text-[9px] tracking-[1px] uppercase px-2 py-0.5 rounded-sm font-body">
                      Featured
                    </span>
                  )}

                  {/* Wishlist heart */}
                  <button
                    onClick={(e) => toggleWishlist(e, listing.id)}
                    disabled={togglingWishlist === listing.id}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                    aria-label={wishlistedIds.has(listing.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {wishlistedIds.has(listing.id) ? (
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Card content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
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

                  <h3 className="font-heading text-sm font-semibold text-gray-800 leading-snug line-clamp-1 mb-0.5">
                    {listing.title}
                  </h3>

                  {listing.maker_brand && (
                    <p className="text-xs text-gray-400 font-body mb-2">{listing.maker_brand}</p>
                  )}

                  <p className="text-sm font-body font-medium text-green">
                    {formatPrice(listing.price, listing.price_display)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Orders link */}
        <div className="mt-10 text-center">
          <Link
            href="/client/marketplace/orders"
            className="text-xs text-green/60 hover:text-green font-body"
          >
            View your marketplace orders
          </Link>
        </div>
      </div>
    </div>
  );
}
