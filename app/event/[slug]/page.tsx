"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const LeadCaptureModal = dynamic(
  () => import("@/components/event-booking/LeadCaptureModal"),
  { ssr: false }
);

interface EventPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  capacity: number;
  sold_count: number;
  included_services: string;
  sort_order: number;
}

interface EventData {
  id: string;
  title: string;
  date_display: string;
  location: string;
  description: string;
  highlights: string;
  image_url: string;
  brochure_url: string;
  gallery_images: string[];
  stats: Record<string, string>;
  lead_capture_enabled: boolean;
}

interface Brochure {
  title: string;
  url: string;
}

const PROGRAMME = [
  {
    day: "Friday 5 June",
    title: "Practice Day",
    items: [
      "Board M/Y ARADOS in Monaco",
      "13:30 Free Practice 1",
      "17:00 Free Practice 2",
      "Daytime on the yacht and VIP Terraces",
      "Evening cocktails and dinner on deck",
    ],
  },
  {
    day: "Saturday 6 June",
    title: "Qualifying",
    items: [
      "12:30 Free Practice 3",
      "16:00 Qualifying",
      "The biggest social night of the GP weekend",
      "Evening entertainment with international athletes",
    ],
  },
  {
    day: "Sunday 7 June",
    title: "Race Day",
    items: [
      "15:00 Lights out, 78 laps of the Monaco street circuit",
      "Race viewing from yacht and terraces",
      "Charity cocktail evening with A-list athletes",
      "The closing celebration of The Pavilion",
    ],
  },
];

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function EventPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const refCode = searchParams.get("ref");

  const [event, setEvent] = useState<EventData | null>(null);
  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/event/${slug}`);
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setEvent(data.event);
        setPackages(data.packages);
        setBrochures(data.brochures || []);
      } catch {
        setError(true);
      }
      setLoading(false);
    }
    load();

    // Track ref code view
    if (refCode) {
      document.cookie = `tgc_event_ref=${refCode};path=/;max-age=${30 * 24 * 60 * 60}`;
      fetch(`/api/event/${slug}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "view", ref_code: refCode }),
      }).catch(() => {});
    }
  }, [slug, refCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center">
        <p className="text-gray-400 font-body text-sm">Loading...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center">
        <p className="text-gray-400 font-body text-sm">Event not found.</p>
      </div>
    );
  }

  // Get ref code from cookie if not in URL
  const effectiveRef =
    refCode ||
    (typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((c) => c.startsWith("tgc_event_ref="))
          ?.split("=")[1] || null
      : null);

  const highlightsList = event.highlights
    ? event.highlights.split("\n").filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-pearl">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: event.image_url
              ? `url(${event.image_url})`
              : "linear-gradient(135deg, #0e4f51 0%, #1a6b6e 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-12 w-full">
          <p className="text-[11px] tracking-[4px] text-gold uppercase font-body mb-3">
            The Gatekeepers Club presents
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-semibold text-white mb-3">
            The Pavilion
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 font-body">
            Monaco Grand Prix 2026
          </p>
          <p className="text-sm text-white/60 font-body mt-2">
            5 - 7 June 2026 . Monaco
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-green">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap justify-center gap-6 sm:gap-12">
          {[
            { label: "Days", value: "3" },
            { label: "Guests", value: "80" },
            { label: "Location", value: "Monaco" },
            { label: "Venues", value: "Yacht + VIP Terraces" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-white font-heading font-semibold text-lg">
                {stat.value}
              </p>
              <p className="text-white/60 font-body text-[10px] tracking-[2px] uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* The Experience */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">
          The Experience
        </p>
        <div className="text-base text-gray-700 font-body leading-relaxed space-y-4">
          {event.description?.split(". ").reduce((acc: string[], sentence, i, arr) => {
            // Group sentences into paragraphs of 2-3
            const groupIndex = Math.floor(i / 3);
            if (!acc[groupIndex]) acc[groupIndex] = "";
            acc[groupIndex] += sentence + (i < arr.length - 1 ? ". " : "");
            return acc;
          }, []).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {highlightsList.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {highlightsList.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-gray-600 font-body"
              >
                <span className="text-gold mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                {h}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Programme */}
      <section className="bg-white border-y border-green/10">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">
            Programme
          </p>
          <h2 className="text-2xl font-heading font-semibold text-green mb-8">
            Three Days in Monaco
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROGRAMME.map((day) => (
              <div
                key={day.day}
                className="bg-pearl border border-green/10 rounded-lg p-5"
              >
                <p className="text-[10px] tracking-[2px] text-gold uppercase font-body mb-1">
                  {day.day}
                </p>
                <h3 className="text-sm font-heading font-semibold text-green mb-3">
                  {day.title}
                </h3>
                <ul className="space-y-2">
                  {day.items.map((item, i) => (
                    <li
                      key={i}
                      className="text-xs text-gray-600 font-body flex items-start gap-2"
                    >
                      <span className="text-gold/60 mt-0.5">&#8226;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">
          Packages
        </p>
        <h2 className="text-2xl font-heading font-semibold text-green mb-2">
          Choose Your Experience
        </h2>
        <p className="text-sm text-gray-500 font-body mb-8">
          From a single evening to a full residency aboard the yacht.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => {
            const services: string[] = (() => {
              try {
                return JSON.parse(pkg.included_services);
              } catch {
                return [];
              }
            })();

            const isResidence = pkg.name.includes("Suite") || pkg.name.includes("Master");
            const isCombination = pkg.name.includes("Combination");
            const isPass = !isResidence && !isCombination;

            return (
              <div
                key={pkg.id}
                className={`border rounded-lg p-5 flex flex-col ${
                  isResidence
                    ? "border-gold/40 bg-white shadow-sm"
                    : "border-green/10 bg-white"
                }`}
              >
                {isResidence && (
                  <p className="text-[9px] tracking-[2px] text-gold uppercase font-body mb-2">
                    Residences
                  </p>
                )}
                {isPass && (
                  <p className="text-[9px] tracking-[2px] text-green/40 uppercase font-body mb-2">
                    A la carte
                  </p>
                )}
                <h3 className="text-sm font-heading font-semibold text-green mb-1">
                  {pkg.name}
                </h3>
                <p className="text-lg font-heading font-semibold text-green mb-1">
                  {isCombination
                    ? "Tailored pricing"
                    : pkg.price > 0
                      ? `from ${formatPrice(pkg.price, pkg.currency)}${isPass ? " per day" : ""}`
                      : "On application"}
                </p>
                <p className="text-xs text-gray-500 font-body mb-4">
                  {pkg.description}
                </p>

                {services.length > 0 && (
                  <ul className="space-y-1.5 mb-4 flex-1">
                    {services.slice(0, 6).map((s, i) => (
                      <li
                        key={i}
                        className="text-[11px] text-gray-600 font-body flex items-start gap-2"
                      >
                        <span className="text-gold mt-0.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        {s}
                      </li>
                    ))}
                    {services.length > 6 && (
                      <li className="text-[11px] text-gray-400 font-body pl-5">
                        +{services.length - 6} more
                      </li>
                    )}
                  </ul>
                )}

                <button
                  onClick={() => setSelectedPackage(pkg.name)}
                  className="mt-auto w-full bg-green text-white py-2.5 rounded-md text-xs font-body tracking-wide hover:bg-green-light transition-colors"
                >
                  Enquire
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Brochures */}
      {brochures.length > 0 && (
        <section className="bg-white border-y border-green/10">
          <div className="max-w-3xl mx-auto px-6 py-12 text-center">
            <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">
              Downloads
            </p>
            <h2 className="text-xl font-heading font-semibold text-green mb-6">
              Brochures
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {brochures.map((b) => (
                <a
                  key={b.title}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-green/20 rounded-md text-sm font-body text-green hover:bg-green/5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  {b.title} (PDF)
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-3">
          The Gatekeepers Club
        </p>
        <p className="text-sm text-gray-500 font-body">
          christian@thegatekeepers.club
        </p>
        <p className="text-xs text-gray-400 font-body mt-1">
          thegatekeepers.club
        </p>
      </footer>

      {/* Lead Capture Modal */}
      {selectedPackage && !showSuccess && (
        <LeadCaptureModal
          packageName={selectedPackage}
          eventSlug={slug}
          refCode={effectiveRef}
          onClose={() => setSelectedPackage(null)}
          onSuccess={() => {
            setSelectedPackage(null);
            setShowSuccess(true);
          }}
        />
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSuccess(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-sm mx-4 p-8 shadow-xl text-center">
            <div className="w-12 h-12 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-semibold text-green mb-2">
              Thank you
            </h3>
            <p className="text-sm text-gray-600 font-body mb-6">
              We have received your interest and will be in touch shortly with
              full details and next steps.
            </p>
            {brochures.length > 0 && (
              <div className="space-y-2 mb-4">
                {brochures.map((b) => (
                  <a
                    key={b.title}
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-green font-body hover:underline"
                  >
                    Download {b.title} (PDF)
                  </a>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowSuccess(false)}
              className="text-xs text-gray-400 font-body hover:text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
