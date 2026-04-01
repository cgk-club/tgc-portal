"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ClientChatModule from "@/components/client/ClientChatModule";
import ClientNav from "@/components/client/ClientNav";

interface TGCEvent {
  id: string;
  title: string;
  category: string;
  date_display: string;
  location: string | null;
  price: string;
  description: string | null;
  highlights: string | null;
  itinerary: string | null;
  includes: string | null;
  image_url: string | null;
  featured: boolean;
  ticket_url: string | null;
  ticket_provider: string | null;
  ticket_commission_rate: number | null;
  brochure_url: string | null;
  gallery_images: string[] | null;
  stats: Record<string, string> | null;
}

export default function ClientEventsPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState<string>("");
  const [events, setEvents] = useState<TGCEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBespokeChat, setShowBespokeChat] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/client/session");
      if (!sessionRes.ok) { router.push("/client/login"); return; }
      const { client } = await sessionRes.json();
      setClientName(client.name || "");

      const eventsRes = await fetch("/api/events/list");
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        // Filter to upcoming events (date_start in the future or no date_start)
        const now = new Date().toISOString().split("T")[0];
        const upcoming = data.filter((ev: { date_end?: string | null }) => !ev.date_end || ev.date_end >= now);
        setEvents(upcoming);
      }

      setLoading(false);
    }
    load();
  }, [router]);

  async function handleBespokeComplete(data: Record<string, unknown>) {
    await fetch("/api/events/enquiry-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, is_bespoke: true }),
    });
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-pearl"><p className="text-gray-400 font-body">Loading...</p></div>;

  const firstName = clientName.split(" ")[0];
  const displayedEvents = showAll ? events : events.slice(0, 3);

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="events" />
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">

        {/* Upcoming Events */}
        <div className="mb-14">
          <h2 className="font-heading text-xl font-semibold text-green mb-2">Upcoming Events</h2>
          <p className="text-sm text-gray-500 font-body mb-6">Events we can arrange access and hospitality for.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedEvents.map((ev) => (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="group relative rounded-lg overflow-hidden h-64 sm:h-72 block"
              >
                {/* Image background */}
                {ev.image_url ? (
                  <img
                    src={ev.image_url}
                    alt={ev.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-green" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {ev.featured && (
                    <span className="bg-gold/90 text-white text-[9px] tracking-[1px] uppercase px-2 py-0.5 rounded-sm font-body">
                      Featured
                    </span>
                  )}
                  {ev.ticket_url && (
                    <span className="bg-white/20 backdrop-blur-sm text-white text-[9px] tracking-[1px] uppercase px-2 py-0.5 rounded-sm font-body">
                      Tickets
                    </span>
                  )}
                </div>

                {/* Price badge */}
                {ev.price && ev.price !== "On application" && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-gold text-white text-xs font-body font-medium px-2.5 py-1 rounded">
                      {ev.price}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <p className="text-[10px] tracking-[1.5px] text-gold uppercase font-body mb-1">
                    {ev.category}
                  </p>
                  <h3 className="font-heading text-base font-semibold text-white leading-snug mb-1.5">
                    {ev.title}
                  </h3>
                  <div className="flex items-center gap-3 text-white/70">
                    <p className="text-xs font-body">{ev.date_display}</p>
                    {ev.location && (
                      <p className="text-xs font-body flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {ev.location}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!showAll && events.length > 3 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAll(true)}
                className="text-sm text-green border border-green/20 px-5 py-2 rounded hover:bg-green/5 transition-colors font-body"
              >
                See all {events.length} events
              </button>
            </div>
          )}

          {showAll && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAll(false)}
                className="text-sm text-gray-400 hover:text-green font-body"
              >
                Show fewer
              </button>
            </div>
          )}

          <div className="mt-6">
            <Link
              href="https://thegatekeepers.club/events-news"
              target="_blank"
              className="text-xs text-green/60 hover:text-green font-body"
            >
              View full events calendar on our website
            </Link>
          </div>
        </div>

        {/* Plan My Event */}
        <div>
          <h2 className="font-heading text-xl font-semibold text-green mb-2">Plan My Event</h2>
          <p className="text-sm text-gray-500 font-body mb-6">
            Birthday, anniversary, corporate retreat, private dinner, or something else entirely. Tell us about it and we will make it happen.
          </p>

          {!showBespokeChat ? (
            <button
              onClick={() => setShowBespokeChat(true)}
              className="px-6 py-3 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body"
            >
              Start planning
            </button>
          ) : (
            <ClientChatModule
              endpoint="/api/chat/bespoke-event"
              clientName={firstName}
              initialMessage={`Hi${firstName ? ` ${firstName}` : ""}. I would love to help you plan something. What is the occasion?`}
              completionLabel="Event Brief Received"
              completionMessage="We will review your event brief and come back with a proposal. This is going to be good."
              onComplete={handleBespokeComplete}
            />
          )}
        </div>
      </div>

    </div>
  );
}
