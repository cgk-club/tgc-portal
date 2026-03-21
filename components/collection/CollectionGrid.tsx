"use client";

import { useState, useMemo } from "react";
import FicheCard from "./FicheCard";

interface Fiche {
  slug: string;
  headline: string;
  hero_image_url: string | null;
  tags: string[];
  template_type: string;
}

interface CollectionGridProps {
  fiches: Fiche[];
}

const CATEGORY_FILTERS = [
  { label: "All", value: "all" },
  { label: "Hotels", value: "hospitality" },
  { label: "Dining", value: "dining" },
  { label: "Artisans", value: "maker" },
  { label: "Wine", value: "wine_estate" },
  { label: "Transport", value: "transport" },
  { label: "Events & Sport", value: "events_sport" },
  { label: "Wellness", value: "wellness" },
  { label: "Experiences", value: "experience" },
];

export default function CollectionGrid({ fiches }: CollectionGridProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const regions = useMemo(() => {
    const regionTags = new Set<string>();
    fiches.forEach((f) => {
      f.tags.forEach((tag) => {
        if (
          [
            "Italy",
            "France",
            "Spain",
            "Netherlands",
            "UK",
            "Global",
            "Europe",
          ].includes(tag)
        ) {
          regionTags.add(tag);
        }
      });
    });
    return Array.from(regionTags).sort();
  }, [fiches]);

  const [activeRegion, setActiveRegion] = useState("all");

  const filtered = useMemo(() => {
    return fiches.filter((fiche) => {
      if (activeCategory !== "all" && fiche.template_type !== activeCategory) {
        // Also match "default" template fiches by their tags
        if (fiche.template_type === "default") {
          const tagMap: Record<string, string[]> = {
            hospitality: ["Hotel"],
            dining: ["Restaurant", "Fine Dining"],
            maker: ["Artisan"],
            events_sport: ["Sport", "Events", "Polo"],
          };
          const matchTags = tagMap[activeCategory];
          if (
            !matchTags ||
            !matchTags.some((t) => fiche.tags.includes(t))
          ) {
            return false;
          }
        } else {
          return false;
        }
      }

      if (
        activeRegion !== "all" &&
        !fiche.tags.includes(activeRegion)
      ) {
        return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          fiche.slug.replace(/-/g, " "),
          fiche.headline,
          ...fiche.tags,
        ]
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [fiches, activeCategory, activeRegion, searchQuery]);

  // Available categories based on actual data
  const availableCategories = useMemo(() => {
    return CATEGORY_FILTERS.filter((cat) => {
      if (cat.value === "all") return true;
      return fiches.some((f) => {
        if (f.template_type === cat.value) return true;
        if (f.template_type === "default") {
          const tagMap: Record<string, string[]> = {
            hospitality: ["Hotel"],
            dining: ["Restaurant", "Fine Dining"],
            maker: ["Artisan"],
            events_sport: ["Sport", "Events", "Polo"],
          };
          const matchTags = tagMap[cat.value];
          return matchTags?.some((t) => f.tags.includes(t));
        }
        return false;
      });
    });
  }, [fiches]);

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, location, or keyword..."
          className="w-full px-4 py-2.5 rounded-md border border-green/15 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green font-body"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {availableCategories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-1.5 text-xs tracking-wide uppercase rounded-sm font-body transition-colors ${
              activeCategory === cat.value
                ? "bg-green text-white"
                : "border border-green/20 text-green/70 hover:bg-green/5"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Region filters */}
      {regions.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveRegion("all")}
            className={`px-3 py-1 text-[11px] tracking-wide uppercase rounded-sm font-body transition-colors ${
              activeRegion === "all"
                ? "bg-gold/20 text-gold border border-gold/30"
                : "border border-gold/15 text-gold/60 hover:bg-gold/5"
            }`}
          >
            All Regions
          </button>
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={`px-3 py-1 text-[11px] tracking-wide uppercase rounded-sm font-body transition-colors ${
                activeRegion === region
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "border border-gold/15 text-gold/60 hover:bg-gold/5"
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-gray-400 font-body mb-6">
        {filtered.length} {filtered.length === 1 ? "partner" : "partners"}
        {activeCategory !== "all" || activeRegion !== "all" || searchQuery
          ? " matching your filters"
          : " in our collection"}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((fiche) => (
            <FicheCard
              key={fiche.slug}
              slug={fiche.slug}
              headline={fiche.headline}
              heroImageUrl={fiche.hero_image_url}
              tags={fiche.tags || []}
              templateType={fiche.template_type}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400 font-body text-sm">
            No partners match your current filters.
          </p>
          <button
            onClick={() => {
              setActiveCategory("all");
              setActiveRegion("all");
              setSearchQuery("");
            }}
            className="mt-3 text-green text-sm font-body hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
