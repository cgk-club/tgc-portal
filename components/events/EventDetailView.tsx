"use client";

import { useRouter } from "next/navigation";

interface EventStats {
  duration?: string;
  group_size?: string;
  distance?: string;
  countries?: string;
  start_point?: string;
  end_point?: string;
  [key: string]: string | undefined;
}

interface TGCEventDetail {
  id: string;
  title: string;
  category: string;
  date_display: string;
  date_start: string | null;
  date_end: string | null;
  location: string | null;
  price: string;
  description: string | null;
  highlights: string | null;
  itinerary: string | null;
  includes: string | null;
  image_url: string | null;
  featured: boolean;
  members_only: boolean;
  ticket_url: string | null;
  ticket_provider: string | null;
  ticket_commission_rate: number | null;
  brochure_url: string | null;
  gallery_images: string[] | null;
  stats: EventStats | null;
}

const STAT_LABELS: Record<string, { label: string; icon: string }> = {
  duration: { label: "Duration", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  group_size: { label: "Group Size", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  distance: { label: "Total Distance", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
  countries: { label: "Countries", icon: "M3 21V3h18v18H3zm2-2h14V5H5v14z" },
  start_point: { label: "Starting Point", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
  end_point: { label: "End Point", icon: "M3 21l1.65-3.8a9 9 0 1112.7 0L19 21l-1.65-3.8a9 9 0 01-12.7 0L3 21z" },
};

const STAT_ORDER = ["duration", "group_size", "distance", "countries", "start_point", "end_point"];

export default function EventDetailView({ event }: { event: TGCEventDetail }) {
  const router = useRouter();
  const highlightLines = event.highlights
    ? event.highlights.split("\n").filter(Boolean).map((line) => line.replace(/^[-\u2022]\s*/, ""))
    : [];

  const galleryImages = event.gallery_images || [];
  const stats = event.stats || {};
  const activeStats = STAT_ORDER.filter((key) => stats[key]);

  const itineraryLines = event.itinerary
    ? event.itinerary.split("\n").filter(Boolean)
    : [];

  const includeLines = event.includes
    ? event.includes.split("\n").filter(Boolean).map((line) => line.replace(/^[-\u2022]\s*/, ""))
    : [];

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[480px] max-h-[720px] overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-green" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-1.5 text-sm font-body text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-sm rounded-full px-3 py-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-16">
          <div className="max-w-4xl">
            {/* Category badge */}
            <span className="inline-block text-[10px] tracking-[2px] uppercase font-body text-gold bg-black/30 backdrop-blur-sm px-3 py-1 rounded mb-4">
              {event.category}
            </span>

            {/* Title */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight mb-3">
              {event.title}
            </h1>

            {/* Location and date */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {event.location && (
                <p className="text-sm sm:text-base text-white/80 font-body flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.location}
                </p>
              )}
              <p className="text-sm sm:text-base text-white/80 font-body flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {event.date_display}
              </p>
            </div>

            {event.featured && (
              <span className="inline-block mt-3 text-[9px] tracking-[1.5px] uppercase font-body text-white bg-gold/80 px-2.5 py-1 rounded">
                Featured Event
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      {activeStats.length > 0 && (
        <section className="bg-[#c8aa4a] py-5 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {activeStats.map((key) => {
              const meta = STAT_LABELS[key];
              return (
                <div key={key} className="text-center">
                  <svg className="w-5 h-5 mx-auto mb-1 text-[#0e4f51]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
                  </svg>
                  <p className="text-[10px] tracking-[1px] uppercase font-body text-[#0e4f51]/70">{meta.label}</p>
                  <p className="text-sm font-medium font-body text-[#0e4f51]">{stats[key]}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Description */}
      {event.description && (
        <section className="py-10 sm:py-14 px-6 sm:px-10 md:px-16">
          <div className="max-w-3xl mx-auto">
            <p className="text-base sm:text-lg text-gray-700 font-body leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        </section>
      )}

      {/* Highlights Grid */}
      {highlightLines.length > 0 && (
        <section className="py-10 sm:py-14 px-6 sm:px-10 md:px-16 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-green mb-6 text-center">
              Highlights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlightLines.map((line, i) => {
                const hasImage = galleryImages[i];
                return (
                  <div
                    key={i}
                    className="relative rounded-lg overflow-hidden h-48 sm:h-56 group"
                  >
                    {hasImage ? (
                      <>
                        <img
                          src={galleryImages[i]}
                          alt={line}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex items-end p-5">
                          <p className="text-sm font-heading font-medium text-gold leading-snug">
                            {line}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="h-full bg-[#0e4f51] flex items-end p-5">
                        <p className="text-sm font-heading font-medium text-gold leading-snug">
                          {line}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Itinerary */}
      {itineraryLines.length > 0 && (
        <section className="py-10 sm:py-14 px-6 sm:px-10 md:px-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-green mb-6">
              Itinerary
            </h2>
            <div className="space-y-4">
              {itineraryLines.map((line, i) => {
                // Try to detect day headers (e.g. "Day 1:", "Day 1 -", "Day 1.")
                const dayMatch = line.match(/^(Day\s+\d+)\s*[:\-\u2013.]\s*(.*)/i);
                if (dayMatch) {
                  return (
                    <div key={i} className="border-l-2 border-gold pl-4 py-2">
                      <p className="text-[10px] tracking-[1.5px] uppercase font-body text-gold mb-1">
                        {dayMatch[1]}
                      </p>
                      <p className="text-sm text-gray-700 font-body leading-relaxed">
                        {dayMatch[2]}
                      </p>
                    </div>
                  );
                }
                return (
                  <p key={i} className="text-sm text-gray-700 font-body leading-relaxed pl-4">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* What is Included */}
      {includeLines.length > 0 && (
        <section className="py-10 sm:py-14 px-6 sm:px-10 md:px-16 bg-green-muted">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-green mb-6">
              What is Included
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {includeLines.map((line, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 font-body">
                  <svg className="w-4 h-4 text-green flex-none mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Price + Actions */}
      <section className="py-10 sm:py-14 px-6 sm:px-10 md:px-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-green/10 rounded-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-heading text-lg font-semibold text-green">
                  {event.title}
                </h2>
                <p className="text-sm text-gray-500 font-body mt-1">
                  {event.date_display}{event.location ? ` \u00B7 ${event.location}` : ""}
                </p>
              </div>
              {event.price && (
                <span className="text-lg font-heading font-semibold text-gold whitespace-nowrap">
                  {event.price}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {event.brochure_url && (
                <a
                  href={event.brochure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-5 py-3 border border-gold text-gold text-sm font-medium rounded-lg hover:bg-gold/5 transition-colors font-body inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Full Itinerary
                </a>
              )}

              {event.ticket_url && (
                <a
                  href={event.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-5 py-3 bg-gold text-white text-sm font-medium rounded-lg hover:bg-[#b89a3f] transition-colors font-body inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Book Tickets
                  {event.ticket_provider && (
                    <span className="text-white/70 text-xs">via {event.ticket_provider}</span>
                  )}
                </a>
              )}

              <a
                href={`/events/enquiry?event=${encodeURIComponent(event.title)}&type=enquiry`}
                className="flex-1 text-center px-5 py-3 bg-green text-white text-sm font-medium rounded-lg hover:bg-green-light transition-colors font-body"
              >
                Enquire
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery (remaining images not used in highlights) */}
      {galleryImages.length > highlightLines.length && (
        <section className="py-10 sm:py-14 px-6 sm:px-10 md:px-16 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-green mb-6 text-center">
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {galleryImages.slice(highlightLines.length).map((url, i) => (
                <div key={i} className="rounded-lg overflow-hidden aspect-[4/3]">
                  <img
                    src={url}
                    alt={`${event.title} gallery ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
