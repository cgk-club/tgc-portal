"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
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

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  tier: string;
  website_url?: string;
}

type Lang = "en" | "fr";

const T = {
  en: {
    presents: "The Gatekeepers Club presents",
    subtitle: "Monaco Grand Prix 2026",
    dateLine: "5 - 7 June 2026 . Monaco",
    days: "Days",
    guests: "Guests",
    location: "Location",
    venues: "Venues",
    venuesValue: "Yacht + VIP Terraces",
    experience: "The Experience",
    programme: "Programme",
    threeDays: "Three Days in Monaco",
    packages: "Packages",
    chooseExperience: "Choose Your Experience",
    chooseSubtitle: "From a single evening to a full residency aboard the yacht.",
    residences: "Residences",
    alaCarte: "A la carte",
    tailored: "Tailored pricing",
    from: "from",
    perEvening: "per evening",
    perDay: "per day",
    onApplication: "On application",
    enquire: "Enquire",
    more: "more",
    downloads: "Downloads",
    brochures: "Brochures",
    jointVenture: "A joint venture",
    sponsors: "Our Partners",
    thankYou: "Thank you",
    thankYouMsg: "We have received your interest and will be in touch shortly with full details and next steps.",
    download: "Download",
    close: "Close",
    switchLang: "FR",
  },
  fr: {
    presents: "The Gatekeepers Club presente",
    subtitle: "Grand Prix de Monaco 2026",
    dateLine: "5 - 7 juin 2026 . Monaco",
    days: "Jours",
    guests: "Invites",
    location: "Lieu",
    venues: "Espaces",
    venuesValue: "Yacht + Terrasses VIP",
    experience: "L'Experience",
    programme: "Programme",
    threeDays: "Trois jours a Monaco",
    packages: "Formules",
    chooseExperience: "Choisissez votre experience",
    chooseSubtitle: "D'une soiree a une residence complete a bord du yacht.",
    residences: "Residences",
    alaCarte: "A la carte",
    tailored: "Tarif sur mesure",
    from: "a partir de",
    perEvening: "par soiree",
    perDay: "par jour",
    onApplication: "Sur demande",
    enquire: "Nous contacter",
    more: "de plus",
    downloads: "Telechargements",
    brochures: "Brochures",
    jointVenture: "Une co-production",
    sponsors: "Nos Partenaires",
    thankYou: "Merci",
    thankYouMsg: "Nous avons bien recu votre demande et reviendrons vers vous dans les plus brefs delais.",
    download: "Telecharger",
    close: "Fermer",
    switchLang: "EN",
  },
};

const PROGRAMME_EN = [
  {
    day: "Friday 5 June",
    title: "Practice Day",
    items: [
      "Board M/Y ARADOS in Monaco",
      "13:30 Free Practice 1",
      "17:00 Free Practice 2",
      "Daytime on the yacht and VIP Terraces",
      "Cocktail dinatoire on deck: fine drinks, canapes, only stirred cocktails",
    ],
  },
  {
    day: "Saturday 6 June",
    title: "Qualifying",
    items: [
      "12:30 Free Practice 3",
      "16:00 Qualifying",
      "The biggest social night of the GP weekend",
      "Cocktail dinatoire with international athletes and media booth",
    ],
  },
  {
    day: "Sunday 7 June",
    title: "Race Day",
    items: [
      "15:00 Lights out, 78 laps of the Monaco street circuit",
      "Race viewing from yacht and terraces",
      "Charity cocktail dinatoire with A-list athletes",
      "The closing celebration of The Pavilion",
    ],
  },
];

const PROGRAMME_FR = [
  {
    day: "Vendredi 5 juin",
    title: "Essais libres",
    items: [
      "Embarquement sur le M/Y ARADOS a Monaco",
      "13h30 Essais libres 1",
      "17h00 Essais libres 2",
      "Journee sur le yacht et les Terrasses VIP",
      "Cocktail dinatoire sur le pont : boissons raffinées, canapes, cocktails remues uniquement",
    ],
  },
  {
    day: "Samedi 6 juin",
    title: "Qualifications",
    items: [
      "12h30 Essais libres 3",
      "16h00 Qualifications",
      "La plus grande soiree du week-end du GP",
      "Cocktail dinatoire avec athletes internationaux et espace media",
    ],
  },
  {
    day: "Dimanche 7 juin",
    title: "Jour de course",
    items: [
      "15h00 Depart, 78 tours du circuit de Monaco",
      "Course vue du yacht et des terrasses",
      "Cocktail dinatoire caritatif avec des athletes de renom",
      "La celebration de cloture de The Pavilion",
    ],
  },
];

const DESCRIPTION_FR =
  "Trois jours a bord du M/Y ARADOS a Monaco. La journee sur le yacht et les Terrasses VIP surplombant le circuit. Les soirees : cocktail dinatoire, canapes et boissons raffinées, echanges avec des legendes du sport et des entrepreneurs internationaux. Espace media pour podcasts et interviews. The Pavilion est une experience privee, sur invitation uniquement, concue pour reunir des personnalites du sport, des affaires et de la culture dans un cadre decontracte et privilegie.";

const HIGHLIGHTS_FR = [
  "M/Y ARADOS, superyacht de 47m a Monaco",
  "Terrasses VIP sur le circuit du Grand Prix de Monaco",
  "Cocktail dinatoire sur le pont chaque soir",
  "Athletes et personnalites sportives de premier plan",
  "80 invites sur le yacht, 20 sur les terrasses VIP",
  "Soiree caritative le dimanche soir",
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
  const router = useRouter();
  const slug = params.slug as string;
  const refCode = searchParams.get("ref");
  const lang: Lang = searchParams.get("lang") === "fr" ? "fr" : "en";
  const t = T[lang];
  const PROGRAMME = lang === "fr" ? PROGRAMME_FR : PROGRAMME_EN;

  const [event, setEvent] = useState<EventData | null>(null);
  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
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
        setSponsors(data.sponsors || []);
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

  function switchLang() {
    const newLang = lang === "en" ? "fr" : "en";
    const params = new URLSearchParams(searchParams.toString());
    if (newLang === "en") {
      params.delete("lang");
    } else {
      params.set("lang", newLang);
    }
    const qs = params.toString();
    router.push(`/event/${slug}${qs ? `?${qs}` : ""}`);
  }

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

  const description = lang === "fr" ? DESCRIPTION_FR : event.description;
  const highlightsList =
    lang === "fr"
      ? HIGHLIGHTS_FR
      : event.highlights
        ? event.highlights.split("\n").filter(Boolean)
        : [];

  return (
    <div className="min-h-screen bg-pearl">
      {/* Language Switcher */}
      <button
        onClick={switchLang}
        className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm border border-green/20 rounded-full px-3 py-1.5 text-xs font-body font-medium text-green hover:bg-white transition-colors shadow-sm"
      >
        {t.switchLang}
      </button>

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
            {t.presents}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-semibold text-white mb-3">
            The Pavilion
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 font-body">
            {t.subtitle}
          </p>
          <p className="text-sm text-white/60 font-body mt-2">
            {t.dateLine}
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-green">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap justify-center gap-6 sm:gap-12">
          {[
            { label: t.days, value: "3" },
            { label: t.guests, value: "100" },
            { label: t.location, value: "Monaco" },
            { label: t.venues, value: t.venuesValue },
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
          {t.experience}
        </p>
        <div className="text-base text-gray-700 font-body leading-relaxed space-y-4">
          {description?.split(". ").reduce((acc: string[], sentence, i, arr) => {
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
            {t.programme}
          </p>
          <h2 className="text-2xl font-heading font-semibold text-green mb-8">
            {t.threeDays}
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
          {t.packages}
        </p>
        <h2 className="text-2xl font-heading font-semibold text-green mb-2">
          {t.chooseExperience}
        </h2>
        <p className="text-sm text-gray-500 font-body mb-8">
          {t.chooseSubtitle}
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
                    {t.residences}
                  </p>
                )}
                {isPass && (
                  <p className="text-[9px] tracking-[2px] text-green/40 uppercase font-body mb-2">
                    {t.alaCarte}
                  </p>
                )}
                <h3 className="text-sm font-heading font-semibold text-green mb-1">
                  {pkg.name}
                </h3>
                <p className="text-lg font-heading font-semibold text-green mb-1">
                  {isCombination
                    ? t.tailored
                    : pkg.price > 0
                      ? `${t.from} ${formatPrice(pkg.price, pkg.currency)}${isPass ? (pkg.name.includes("Evening") ? ` ${t.perEvening}` : ` ${t.perDay}`) : ""}`
                      : t.onApplication}
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
                        +{services.length - 6} {t.more}
                      </li>
                    )}
                  </ul>
                )}

                <button
                  onClick={() => setSelectedPackage(pkg.name)}
                  className="mt-auto w-full bg-green text-white py-2.5 rounded-md text-xs font-body tracking-wide hover:bg-green-light transition-colors"
                >
                  {t.enquire}
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
              {t.downloads}
            </p>
            <h2 className="text-xl font-heading font-semibold text-green mb-6">
              {t.brochures}
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

      {/* Sponsors */}
      {sponsors.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-6 text-center">
            {t.sponsors}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
            {sponsors.map((s) => (
              <div key={s.id} className="text-center">
                {s.website_url ? (
                  <a href={s.website_url} target="_blank" rel="noopener noreferrer">
                    {s.logo_url ? (
                      <img src={s.logo_url} alt={s.name} className="h-10 sm:h-12 object-contain grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100" />
                    ) : (
                      <span className="text-sm font-heading font-semibold text-green/50 hover:text-green transition-colors">{s.name}</span>
                    )}
                  </a>
                ) : s.logo_url ? (
                  <img src={s.logo_url} alt={s.name} className="h-10 sm:h-12 object-contain grayscale opacity-60" />
                ) : (
                  <span className="text-sm font-heading font-semibold text-green/50">{s.name}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-5">
          {t.jointVenture}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-16">
          <div>
            <p className="text-xs tracking-[2px] text-green/60 uppercase font-body mb-1">
              The Gatekeepers Club
            </p>
            <p className="text-sm text-gray-500 font-body">
              christian@thegatekeepers.club
            </p>
          </div>
          <div>
            <p className="text-xs tracking-[2px] text-green/60 uppercase font-body mb-1">
              Game ON Media
            </p>
            <p className="text-sm text-gray-500 font-body">
              hamish@hamemedia.com
            </p>
          </div>
        </div>
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
              {t.thankYou}
            </h3>
            <p className="text-sm text-gray-600 font-body mb-6">
              {t.thankYouMsg}
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
                    {t.download} {b.title} (PDF)
                  </a>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowSuccess(false)}
              className="text-xs text-gray-400 font-body hover:text-gray-600"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
