"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientChatModule from "@/components/client/ClientChatModule";
import ClientNav from "@/components/client/ClientNav";

export default function ClientEventsPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showBespokeChat, setShowBespokeChat] = useState(false);

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

  const upcomingEvents = [
    { name: "F1 Monaco Grand Prix 2026", date: "5-7 June 2026", location: "Monte Carlo, Monaco", image: null },
    { name: "Guards Polo Club Gold Cup", date: "July 2026", location: "Windsor, England", image: null },
    { name: "Goodwood Festival of Speed", date: "25-28 June 2026", location: "Chichester, England", image: null },
  ];

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="events" />
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">

        {/* Upcoming Events */}
        <div className="mb-14">
          <h2 className="font-heading text-xl font-semibold text-green mb-2">Upcoming Events</h2>
          <p className="text-sm text-gray-500 font-body mb-6">Events we can arrange access and hospitality for.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingEvents.map((ev) => (
              <div key={ev.name} className="bg-white border border-green/10 rounded-lg overflow-hidden">
                <div className="h-36 bg-green-muted flex items-center justify-center">
                  <span className="text-green/30 text-xs font-body">Event image</span>
                </div>
                <div className="p-4">
                  <h3 className="font-heading text-sm font-semibold text-gray-800 mb-1">{ev.name}</h3>
                  <p className="text-xs text-gray-500 font-body">{ev.date}</p>
                  <p className="text-xs text-gray-400 font-body mb-3">{ev.location}</p>
                  <a
                    href={`/events/enquiry?event=${encodeURIComponent(ev.name)}&type=enquiry`}
                    className="inline-block text-xs text-green border border-green/20 px-3 py-1.5 rounded hover:bg-green/5 transition-colors font-body"
                  >
                    I am interested
                  </a>
                </div>
              </div>
            ))}
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
