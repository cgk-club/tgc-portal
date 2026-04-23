"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EventStats {
  duration?: string;
  group_size?: string;
  distance?: string;
  countries?: string;
  start_point?: string;
  end_point?: string;
  yacht?: string;
  [key: string]: string | undefined;
}

interface PricingTierPrice {
  label: string;
  eur: number;
  stripe_link: string | null;
}

interface PricingTier {
  id: string;
  name: string;
  description: string;
  prices: PricingTierPrice[];
  available: boolean;
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
  ticket_url: string | null;
  ticket_provider: string | null;
  ticket_commission_rate: number | null;
  brochure_url: string | null;
  gallery_images: string[] | null;
  stats: EventStats | null;
  pricing_tiers: PricingTier[] | null;
}

const STAT_LABELS: Record<string, { label: string; icon: string }> = {
  duration:    { label: "Duration",       icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  group_size:  { label: "Group Size",     icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  distance:    { label: "Total Distance", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
  countries:   { label: "Countries",      icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" },
  start_point: { label: "Starting Point", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
  end_point:   { label: "End Point",      icon: "M3 21l1.65-3.8a9 9 0 1112.7 0L19 21l-1.65-3.8a9 9 0 01-12.7 0L3 21z" },
  yacht:       { label: "Superyacht",     icon: "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" },
};

const STAT_ORDER = ["duration", "group_size", "distance", "countries", "start_point", "end_point", "yacht"];

function parseList(raw: string | null): string[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr)) return arr.map(String).filter(Boolean);
    } catch {}
  }
  return trimmed.split("\n").filter(Boolean).map((l) => l.replace(/^[-•]\s*/, ""));
}

function formatEur(amount: number): string {
  return "€" + amount.toLocaleString("fr-FR");
}

interface BookingState {
  tier: PricingTier | null;
  price: PricingTierPrice | null;
  paymentMethod: "bank_transfer" | "credit_card" | null;
  name: string;
  email: string;
  phone: string;
  notes: string;
  submitting: boolean;
  result: {
    reference: string;
    payment_method: string;
    total_amount: number | null;
    bank_details?: {
      account_name: string;
      bank_name: string;
      iban: string;
      bic: string;
      amount: number | null;
      reference: string;
    };
    stripe_link?: string | null;
  } | null;
  error: string | null;
}

const EMPTY_BOOKING: BookingState = {
  tier: null, price: null, paymentMethod: null,
  name: "", email: "", phone: "", notes: "",
  submitting: false, result: null, error: null,
};

export default function EventDetailView({ event }: { event: TGCEventDetail }) {
  const router = useRouter();
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState<BookingState>(EMPTY_BOOKING);

  const highlightLines = parseList(event.highlights);
  const galleryImages = event.gallery_images || [];
  const stats = event.stats || {};
  const activeStats = STAT_ORDER.filter((key) => stats[key]);
  const itineraryLines = event.itinerary ? event.itinerary.split("\n").filter(Boolean) : [];
  const includeLines = parseList(event.includes);
  const tiers = event.pricing_tiers?.filter((t) => t.available !== false) || [];

  const ccPrice = booking.price ? Math.round(booking.price.eur * 1.035 * 100) / 100 : null;
  const displayAmount = booking.paymentMethod === "credit_card" && ccPrice ? ccPrice : booking.price?.eur ?? null;

  async function submitBooking() {
    if (!booking.tier || !booking.price || !booking.paymentMethod || !booking.name || !booking.email) return;
    setBooking((b) => ({ ...b, submitting: true, error: null }));

    const res = await fetch("/api/events/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: event.id,
        event_title: event.title,
        tier_id: booking.tier.id,
        tier_name: booking.tier.name,
        tier_option: booking.price.label,
        guest_name: booking.name,
        guest_email: booking.email,
        guest_phone: booking.phone || null,
        payment_method: booking.paymentMethod,
        base_amount: booking.price.eur,
        notes: booking.notes || null,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setBooking((b) => ({ ...b, submitting: false, error: data.error || "Something went wrong." }));
      return;
    }
    setBooking((b) => ({ ...b, submitting: false, result: data }));
  }

  function openBookingWith(tier: PricingTier, price: PricingTierPrice) {
    setBooking({ ...EMPTY_BOOKING, tier, price });
    setShowBooking(true);
  }

  function closeBooking() {
    setShowBooking(false);
    setBooking(EMPTY_BOOKING);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative w-full h-[70vh] min-h-[480px] max-h-[720px] overflow-hidden">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-green" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-1.5 text-sm font-body text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-sm rounded-full px-3 py-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-16">
          <div className="max-w-4xl">
            <span className="inline-block text-[10px] tracking-[2px] uppercase font-body text-gold bg-black/30 backdrop-blur-sm px-3 py-1 rounded mb-4">
              {event.category}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight mb-3">
              {event.title}
            </h1>
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
              if (!meta) return null;
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
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-green mb-6 text-center">Highlights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlightLines.map((line, i) => {
                const img = galleryImages[i];
                return (
                  <div key={i} className="relative rounded-lg overflow-hidden h-48 sm:h-56 group">
                    {img ? (
                      <>
                        <img src={img} alt={line} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex items-end p-5">
                          <p className="text-sm font-heading font-medium text-gold leading-snug">{line}</p>
                        </div>
                      </>
                    ) : (
                      <div className="h-full bg-[#0e4f51] flex items-end p-5">
                        <p className="text-sm font-heading font-medium text-gold leading-snug">{line}</p>
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
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-green mb-6">Itinerary</h2>
            <div className="space-y-4">
              {itineraryLines.map((line, i) => {
                const dayMatch = line.match(/^(Day\s+\d+)\s*[:\-–.]\s*(.*)/i);
                if (dayMatch) {
                  return (
                    <div key={i} className="border-l-2 border-gold pl-4 py-2">
                      <p className="text-[10px] tracking-[1.5px] uppercase font-body text-gold mb-1">{dayMatch[1]}</p>
                      <p className="text-sm text-gray-700 font-body leading-relaxed">{dayMatch[2]}</p>
                    </div>
                  );
                }
                return <p key={i} className="text-sm text-gray-700 font-body leading-relaxed pl-4">{line}</p>;
              })}
            </div>
          </div>
        </section>
      )}

      {/* What is Included */}
      {includeLines.length > 0 && (
        <section className="py-10 sm:py-14 px-6 sm:px-10 md:px-16 bg-green-muted">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-green mb-6">What is Included</h2>
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

      {/* Pricing Tiers */}
      {tiers.length > 0 && (
        <section className="py-10 sm:py-14 px-6 sm:px-10 md:px-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-green mb-2 text-center">Book Your Place</h2>
            <p className="text-sm text-gray-500 font-body text-center mb-8">Select a package to reserve your place. Bank transfer and credit card accepted.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {tiers.map((tier) => (
                <div key={tier.id} className="bg-white border border-green/10 rounded-xl p-6 flex flex-col">
                  <h3 className="font-heading text-base font-semibold text-green mb-2">{tier.name}</h3>
                  {tier.description && (
                    <p className="text-xs text-gray-500 font-body leading-relaxed mb-4 flex-1">{tier.description}</p>
                  )}
                  <div className="space-y-2 mt-auto">
                    {tier.prices.map((price) => (
                      <div key={price.label} className="flex items-center justify-between gap-3 py-2 border-t border-green/5 first:border-0 first:pt-0">
                        <div>
                          <span className="text-xs text-gray-500 font-body">{price.label}</span>
                          <p className="text-base font-heading font-semibold text-gold">{formatEur(price.eur)}</p>
                        </div>
                        <button
                          onClick={() => openBookingWith(tier, price)}
                          className="px-4 py-2 bg-green text-white text-xs font-body font-medium rounded-lg hover:bg-green-light transition-colors whitespace-nowrap"
                        >
                          Reserve
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 font-body text-center mt-4">A 3.5% processing fee applies to credit card payments.</p>
          </div>
        </section>
      )}

      {/* Price + Actions (fallback / third-party tickets) */}
      <section className="py-10 sm:py-14 px-6 sm:px-10 md:px-16 bg-pearl">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-green/10 rounded-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-heading text-lg font-semibold text-green">{event.title}</h2>
                <p className="text-sm text-gray-500 font-body mt-1">
                  {event.date_display}{event.location ? ` · ${event.location}` : ""}
                </p>
              </div>
              {event.price && tiers.length === 0 && (
                <span className="text-lg font-heading font-semibold text-gold whitespace-nowrap">{event.price}</span>
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
                  Download Brochure
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
                  {event.ticket_provider && <span className="text-white/70 text-xs">via {event.ticket_provider}</span>}
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

      {/* Gallery (overflow) */}
      {galleryImages.length > highlightLines.length && (
        <section className="py-10 sm:py-14 px-6 sm:px-10 md:px-16 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-green mb-6 text-center">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {galleryImages.slice(highlightLines.length).map((url, i) => (
                <div key={i} className="rounded-lg overflow-hidden aspect-[4/3]">
                  <img src={url} alt={`${event.title} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-green/10">
              <div>
                <h3 className="font-heading text-base font-semibold text-green">{booking.tier?.name}</h3>
                <p className="text-xs text-gray-500 font-body mt-0.5">{booking.price?.label}</p>
              </div>
              <button onClick={closeBooking} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {booking.result ? (
              /* Confirmation */
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-heading text-base font-semibold text-green">Booking received</h4>
                  <p className="text-xs text-gray-500 font-body mt-1">Reference: <strong>{booking.result.reference}</strong></p>
                </div>

                {booking.result.payment_method === "bank_transfer" && booking.result.bank_details && (
                  <div className="bg-pearl rounded-xl p-4 space-y-2 text-sm font-body">
                    <p className="text-xs font-medium text-green uppercase tracking-wider mb-3">Bank Transfer Details</p>
                    {booking.result.bank_details.account_name && (
                      <div className="flex justify-between"><span className="text-gray-500">Account</span><span className="font-medium">{booking.result.bank_details.account_name}</span></div>
                    )}
                    {booking.result.bank_details.bank_name && (
                      <div className="flex justify-between"><span className="text-gray-500">Bank</span><span className="font-medium">{booking.result.bank_details.bank_name}</span></div>
                    )}
                    {booking.result.bank_details.iban && (
                      <div className="flex justify-between"><span className="text-gray-500">IBAN</span><span className="font-medium font-mono text-xs">{booking.result.bank_details.iban}</span></div>
                    )}
                    {booking.result.bank_details.bic && (
                      <div className="flex justify-between"><span className="text-gray-500">BIC</span><span className="font-medium font-mono text-xs">{booking.result.bank_details.bic}</span></div>
                    )}
                    {booking.result.bank_details.amount && (
                      <div className="flex justify-between border-t border-green/10 pt-2 mt-2">
                        <span className="text-gray-500">Amount</span>
                        <span className="font-semibold text-green">{formatEur(booking.result.bank_details.amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reference</span>
                      <span className="font-semibold text-gold">{booking.result.reference}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 pt-2">Please use your reference as the payment description. We will confirm receipt within 24 hours.</p>
                  </div>
                )}

                {booking.result.payment_method === "credit_card" && (
                  <div className="space-y-4">
                    {booking.result.stripe_link ? (
                      <a
                        href={booking.result.stripe_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center px-5 py-3 bg-gold text-white text-sm font-medium rounded-xl hover:bg-[#b89a3f] transition-colors font-body"
                      >
                        Pay {booking.result.total_amount ? formatEur(booking.result.total_amount) : ""} by Card
                      </a>
                    ) : (
                      <div className="bg-pearl rounded-xl p-4 text-center">
                        <p className="text-sm text-gray-600 font-body">We will send your payment link to <strong>{booking.email}</strong> within a few hours.</p>
                        {booking.result.total_amount && (
                          <p className="text-xs text-gray-400 font-body mt-1">Amount: {formatEur(booking.result.total_amount)} (incl. 3.5% processing fee)</p>
                        )}
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 text-center font-body">Reference: {booking.result.reference}</p>
                  </div>
                )}

                <button onClick={closeBooking} className="w-full mt-4 px-4 py-2.5 border border-green/20 text-green text-sm font-body rounded-xl hover:bg-green/5 transition-colors">
                  Close
                </button>
              </div>
            ) : (
              /* Booking Form */
              <div className="p-6 space-y-5">
                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 font-body mb-2">Payment method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["bank_transfer", "credit_card"] as const).map((method) => {
                      const isCC = method === "credit_card";
                      const label = isCC ? "Credit Card" : "Bank Transfer";
                      const sub = isCC
                        ? (booking.price ? `${formatEur(Math.round(booking.price.eur * 1.035 * 100) / 100)} (+3.5%)` : "+3.5% fee")
                        : (booking.price ? formatEur(booking.price.eur) : "No fee");
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setBooking((b) => ({ ...b, paymentMethod: method }))}
                          className={`p-3 rounded-xl border-2 text-left transition-colors ${booking.paymentMethod === method ? "border-green bg-green/5" : "border-green/15 hover:border-green/30"}`}
                        >
                          <p className="text-xs font-medium text-gray-700 font-body">{label}</p>
                          <p className="text-[10px] text-gray-400 font-body mt-0.5">{sub}</p>
                        </button>
                      );
                    })}
                  </div>
                  {booking.paymentMethod === "credit_card" && (
                    <p className="text-[10px] text-gray-400 font-body mt-1.5">A 3.5% card processing fee is applied to credit card payments.</p>
                  )}
                </div>

                {/* Amount Summary */}
                {booking.paymentMethod && booking.price && (
                  <div className="bg-pearl rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-body">{booking.tier?.name} — {booking.price.label}</span>
                    <span className="font-heading font-semibold text-gold text-base">{formatEur(displayAmount!)}</span>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 font-body mb-1">Full name *</label>
                    <input
                      value={booking.name}
                      onChange={(e) => setBooking((b) => ({ ...b, name: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-green/20 rounded-xl text-sm font-body focus:outline-none focus:border-green/50"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-body mb-1">Email *</label>
                    <input
                      type="email"
                      value={booking.email}
                      onChange={(e) => setBooking((b) => ({ ...b, email: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-green/20 rounded-xl text-sm font-body focus:outline-none focus:border-green/50"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-body mb-1">Phone</label>
                    <input
                      type="tel"
                      value={booking.phone}
                      onChange={(e) => setBooking((b) => ({ ...b, phone: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-green/20 rounded-xl text-sm font-body focus:outline-none focus:border-green/50"
                      placeholder="+44 or +33..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-body mb-1">Notes</label>
                    <textarea
                      value={booking.notes}
                      onChange={(e) => setBooking((b) => ({ ...b, notes: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2.5 border border-green/20 rounded-xl text-sm font-body focus:outline-none focus:border-green/50 resize-none"
                      placeholder="Dietary requirements, special requests..."
                    />
                  </div>
                </div>

                {booking.error && (
                  <p className="text-xs text-red-500 font-body">{booking.error}</p>
                )}

                <button
                  onClick={submitBooking}
                  disabled={booking.submitting || !booking.paymentMethod || !booking.name || !booking.email}
                  className="w-full px-5 py-3 bg-green text-white text-sm font-medium rounded-xl hover:bg-green-light transition-colors font-body disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {booking.submitting ? "Submitting..." : "Confirm Reservation"}
                </button>
                <p className="text-[10px] text-gray-400 text-center font-body">Your place is reserved on submission. Payment follows.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
