"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ClientNav from "@/components/client/ClientNav";

interface JourneyItem {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  cover_image_url: string | null;
  status: "draft" | "shared" | "archived";
  start_date: string | null;
  share_token: string | null;
  updated_at: string;
  days?: { id: string }[];
}

const STATUS_STYLES: Record<string, { label: string; style: string }> = {
  draft: { label: "Planning", style: "bg-amber-100 text-amber-800" },
  shared: { label: "Active", style: "bg-green-100 text-green-800" },
  archived: { label: "Past", style: "bg-gray-100 text-gray-500" },
};

export default function JourneysPage() {
  const router = useRouter();
  const [journeys, setJourneys] = useState<JourneyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/client/session");
      if (!sessionRes.ok) { router.push("/client/login"); return; }

      const res = await fetch("/api/client/itineraries");
      if (res.ok) {
        setJourneys(await res.json());
      }
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-pearl"><p className="text-gray-400 font-body">Loading...</p></div>;

  const active = journeys.filter(j => j.status === "shared");
  const planning = journeys.filter(j => j.status === "draft");
  const past = journeys.filter(j => j.status === "archived");

  function JourneyCard({ journey }: { journey: JourneyItem }) {
    const status = STATUS_STYLES[journey.status] || STATUS_STYLES.draft;
    const dayCount = journey.days?.length || 0;
    const href = journey.share_token ? `/itinerary/${journey.share_token}` : "#";

    return (
      <Link href={href} className="block group">
        <div className="bg-white border border-green/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
          {/* Cover image */}
          <div className="h-40 bg-green/5 overflow-hidden">
            {journey.cover_image_url ? (
              <img
                src={journey.cover_image_url}
                alt={journey.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-heading text-2xl text-green/20">{journey.title.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading text-sm font-semibold text-green truncate">{journey.title}</h3>
              <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${status.style}`}>
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-body text-gray-500">
              {journey.start_date && (
                <span>{new Date(journey.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              )}
              {dayCount > 0 && <span>{dayCount} days</span>}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="journeys" />
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">

        <div className="mb-8">
          <p className="text-[10px] tracking-[2px] text-gold uppercase mb-2 font-body">My Journeys</p>
          <h1 className="font-heading text-xl font-semibold text-green">Your Curated Itineraries</h1>
        </div>

        {journeys.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body text-gray-400">No journeys yet. Your concierge is preparing something for you.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active journeys */}
            {active.length > 0 && (
              <div>
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">Active</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {active.map(j => <JourneyCard key={j.id} journey={j} />)}
                </div>
              </div>
            )}

            {/* Planning */}
            {planning.length > 0 && (
              <div>
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">In Planning</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {planning.map(j => <JourneyCard key={j.id} journey={j} />)}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">Past Journeys</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {past.map(j => <JourneyCard key={j.id} journey={j} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
