"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ClientChatModule from "@/components/client/ClientChatModule";
import ClientNav from "@/components/client/ClientNav";
import { getUpcomingEvents, type TGCEvent } from "@/lib/events-data";

export default function ClientEventsPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showBespokeChat, setShowBespokeChat] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/client/session");
      if (!res.ok) { router.push("/client/login"); return; }
      const { client } = await res.json();
      setClientName(client.name || "");
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
  const allEvents: TGCEvent[] = getUpcomingEvents();
  const displayedEvents = showAll ? allEvents : allEvents.slice(0, 3);

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
              <div key={ev.id} className="bg-white border border-green/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-36 bg-green-muted flex items-center justify-center relative">
                  <span className="text-green/20 text-xs font-body">{ev.category}</span>
                  {ev.featured && (
                    <span className="absolute top-2 right-2 bg-gold/90 text-white text-[9px] tracking-[1px] uppercase px-2 py-0.5 rounded-sm font-body">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-heading text-sm font-semibold text-gray-800 mb-1">{ev.title}</h3>
                  <p className="text-xs text-gray-500 font-body">{ev.date}</p>
                  <p className="text-xs text-gray-400 font-body mb-2">{ev.location}</p>
                  <p className="text-xs text-gray-400 font-body mb-3 line-clamp-2">{ev.description}</p>
                  <div className="flex gap-2">
                    <a
                      href={`/events/enquiry?event=${encodeURIComponent(ev.title)}&type=enquiry`}
                      className="inline-block text-xs text-green border border-green/20 px-3 py-1.5 rounded hover:bg-green/5 transition-colors font-body"
                    >
                      I am interested
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!showAll && allEvents.length > 3 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAll(true)}
                className="text-sm text-green border border-green/20 px-5 py-2 rounded hover:bg-green/5 transition-colors font-body"
              >
                See all {allEvents.length} events
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
