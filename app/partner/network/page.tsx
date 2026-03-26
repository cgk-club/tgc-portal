"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PartnerNav from "@/components/partner/PartnerNav";

interface NetworkPartner {
  slug: string;
  name: string;
  headline: string | null;
  hero_image_url: string | null;
  template_type: string;
  city: string | null;
  country: string | null;
}

const templateLabels: Record<string, string> = {
  hospitality: "Hotel",
  dining: "Dining",
  maker: "Artisan",
  transport: "Transport",
  wine_estate: "Wine",
  wellness: "Wellness",
  experience: "Experience",
  events_sport: "Events & Sport",
  arts_culture: "Arts & Culture",
  real_estate: "Real Estate",
  default: "Partner",
};

export default function PartnerNetworkPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<NetworkPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/partner/session");
      if (!sessionRes.ok) {
        router.push("/partner/login");
        return;
      }

      const res = await fetch("/api/partner/network");
      if (res.ok) {
        setPartners(await res.json());
      }

      setLoading(false);
    }
    load();
  }, [router]);

  const filteredPartners = filter
    ? partners.filter(
        (p) =>
          p.name.toLowerCase().includes(filter.toLowerCase()) ||
          (p.city && p.city.toLowerCase().includes(filter.toLowerCase())) ||
          (p.country &&
            p.country.toLowerCase().includes(filter.toLowerCase())) ||
          templateLabels[p.template_type]
            ?.toLowerCase()
            .includes(filter.toLowerCase())
      )
    : partners;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <p className="text-gray-400 font-body">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl">
      <PartnerNav active="network" />

      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-semibold text-green mb-2">
            The TGC Network
          </h1>
          <p className="text-sm text-gray-500 font-body max-w-lg mx-auto">
            A curated community of partners across hospitality, dining, arts,
            and craft.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by name, location, or category..."
            className="w-full rounded-md border border-green/20 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
          />
        </div>

        {/* Partner Grid */}
        {filteredPartners.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400 font-body">
              {filter
                ? "No partners match your search."
                : "No partners in the network yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPartners.map((partner) => (
              <a
                key={partner.slug}
                href={`/fiche/${partner.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-green/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="h-36 bg-green-muted overflow-hidden">
                  {partner.hero_image_url ? (
                    <img
                      src={partner.hero_image_url}
                      alt={partner.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-green/15 text-xs font-body">
                        {templateLabels[partner.template_type] || "Partner"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-green/50 uppercase tracking-wide font-body mb-0.5">
                    {templateLabels[partner.template_type] || "Partner"}
                  </p>
                  <h3 className="font-heading text-sm font-semibold text-gray-800 leading-snug line-clamp-1">
                    {partner.name}
                  </h3>
                  {(partner.city || partner.country) && (
                    <p className="text-xs text-gray-400 font-body mt-0.5">
                      {[partner.city, partner.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {partner.headline && (
                    <p className="text-[11px] text-gray-400 font-body mt-1 line-clamp-2">
                      {partner.headline}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-xs text-gray-400 font-body">
            {filteredPartners.length}{" "}
            {filteredPartners.length === 1 ? "partner" : "partners"} in the
            network
          </p>
        </div>
      </div>
    </div>
  );
}
