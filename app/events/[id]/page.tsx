export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import EventDetailView from "@/components/events/EventDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data: event } = await getSupabase()
    .from("events")
    .select(
      "id, title, category, date_display, date_start, date_end, location, price, description, highlights, itinerary, includes, image_url, featured, members_only, ticket_url, ticket_provider, ticket_commission_rate, brochure_url, gallery_images, stats"
    )
    .eq("id", id)
    .eq("active", true)
    .single();

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-pearl">
      {/* Header */}
      <header className="absolute top-0 left-0 z-20 p-6">
        <a href="/client/events" className="font-heading text-sm font-semibold tracking-wider text-white/90 hover:text-white transition-colors">
          THE GATEKEEPERS CLUB
        </a>
      </header>

      <EventDetailView event={event} />

      {/* Footer */}
      <footer className="py-8 px-8 text-center border-t border-gray-200">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          THE GATEKEEPERS CLUB
        </span>
        <p className="text-xs text-gray-400 mt-2 font-body">
          Curated travel, crafted personally
        </p>
        <p className="text-xs text-gray-400 mt-1 font-body">
          &copy; {new Date().getFullYear()} The Gatekeepers Club
        </p>
      </footer>
    </div>
  );
}
