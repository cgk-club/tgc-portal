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
}

export default function ClientEventsPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState<string>("");
  const [events, setEvents] = useState<TGCEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBespokeChat, setShowBespokeChat] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TGCEvent | null>(null);

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
              <button
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className="bg-white border border-green/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left"
              >
                <div className="h-36 bg-green-muted flex items-center justify-center relative overflow-hidden">
                  {ev.image_url ? (
                    <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-green/20 text-xs font-body">{ev.category}</span>
                  )}
                  {ev.featured && (
                    <span className="absolute top-2 right-2 bg-gold/90 text-white text-[9px] tracking-[1px] uppercase px-2 py-0.5 rounded-sm font-body">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-green/50 font-body uppercase tracking-wide mb-1">{ev.category}</p>
                  <h3 className="font-heading text-sm font-semibold text-gray-800 mb-1">{ev.title}</h3>
                  <p className="text-xs text-gray-500 font-body">{ev.date_display}</p>
                  <p className="text-xs text-gray-400 font-body mb-2">{ev.location}</p>
                  <p className="text-xs text-gray-400 font-body line-clamp-2">{ev.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-green font-body">View details &#8594;</span>
                    {ev.ticket_url && (
                      <span className="text-[9px] text-gold bg-gold/10 px-1.5 py-0.5 rounded font-body">
                        Tickets available
                      </span>
                    )}
                  </div>
                </div>
              </button>
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

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-pearl rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hero */}
            {selectedEvent.image_url && (
              <div className="h-56 sm:h-64 overflow-hidden rounded-t-lg">
                <img src={selectedEvent.image_url} alt={selectedEvent.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Close button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors shadow"
            >
              &#10005;
            </button>

            <div className="p-6 sm:p-8">
              {/* Category + Date */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] tracking-[1.5px] text-green/60 uppercase font-body">{selectedEvent.category}</span>
                {selectedEvent.featured && (
                  <span className="text-[9px] tracking-[1px] text-gold bg-gold/10 px-2 py-0.5 rounded uppercase font-body">Featured</span>
                )}
              </div>

              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-green mb-1">{selectedEvent.title}</h2>
              <p className="text-sm text-gray-500 font-body mb-1">{selectedEvent.date_display}</p>
              <p className="text-sm text-gray-400 font-body mb-4">{selectedEvent.location}</p>

              {selectedEvent.price && (
                <p className="text-sm text-gold font-body font-medium mb-4">{selectedEvent.price}</p>
              )}

              {/* Description */}
              <p className="text-sm text-gray-600 font-body leading-relaxed mb-6">{selectedEvent.description}</p>

              {/* Highlights */}
              {selectedEvent.highlights && selectedEvent.highlights.trim() && (
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-green uppercase tracking-wider mb-3 font-body">Highlights</h3>
                  <ul className="space-y-1.5">
                    {selectedEvent.highlights.split("\n").filter(Boolean).map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 font-body">
                        <span className="text-gold mt-0.5">&#8226;</span>
                        {line.replace(/^[-•]\s*/, "")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Itinerary */}
              {selectedEvent.itinerary && selectedEvent.itinerary.trim() && (
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-green uppercase tracking-wider mb-3 font-body">Itinerary</h3>
                  <p className="text-sm text-gray-600 font-body leading-relaxed whitespace-pre-line">{selectedEvent.itinerary}</p>
                </div>
              )}

              {/* What is Included */}
              {selectedEvent.includes && selectedEvent.includes.trim() && (
                <div className="mb-6">
                  <h3 className="text-xs font-medium text-green uppercase tracking-wider mb-3 font-body">What is Included</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {selectedEvent.includes.split("\n").filter(Boolean).map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 font-body">
                        <span className="text-green mt-0.5">&#10003;</span>
                        {line.replace(/^[-•]\s*/, "")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ticket Booking */}
              {selectedEvent.ticket_url && (
                <div className="mt-8 pt-6 border-t border-green/10">
                  <div className="flex flex-col items-center gap-1.5">
                    <a
                      href={selectedEvent.ticket_url}
                      target="_blank"
                      rel="noopener"
                      onClick={() => console.log(`[TGC] Ticket click: ${selectedEvent.title}`, { provider: selectedEvent.ticket_provider, url: selectedEvent.ticket_url })}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-white text-sm font-medium rounded-md hover:bg-[#b89a3f] transition-colors font-body shadow-sm"
                    >
                      Book Tickets
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    {selectedEvent.ticket_provider && (
                      <span className="text-[10px] text-gray-400 font-body">
                        via {selectedEvent.ticket_provider}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-green/10">
                <a
                  href={`/events/enquiry?event=${encodeURIComponent(selectedEvent.title)}&type=enquiry`}
                  className="flex-1 text-center px-5 py-3 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body"
                >
                  Enquire About This Event
                </a>
                <a
                  href={`/events/enquiry?event=${encodeURIComponent(selectedEvent.title)}&type=logistics`}
                  className="flex-1 text-center px-5 py-3 border border-green/20 text-green text-sm font-medium rounded-md hover:bg-green/5 transition-colors font-body"
                >
                  Get Event Logistics Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
