"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const LeadCaptureModal = dynamic(
  () => import("@/components/event-booking/LeadCaptureModal"),
  { ssr: false }
);

const IMGS = "https://vxmrvnmtauqqqjikhjbh.supabase.co/storage/v1/object/public/project-documents/pavilion-terrace";

interface PriceOption { label: string; eur: number; stripe_link: string | null }
interface EventPackage {
  id: string; name: string; description: string; price: number; currency: string;
  included_services: string; sort_order: number; price_options: PriceOption[] | null;
}
interface Brochure { title: string; url: string }
type Lang = "en" | "fr";

// Package IDs for section assignment
const ACCOMMODATION_IDS = [
  "3532839c-fefd-445c-8d14-cc5a5277a586",
  "f2d42f8a-0bcc-4599-a119-926bf425bae6",
  "8d7221c9-1d37-4ebf-bd52-cce032be914e",
];
const DAYTIME_ID = "3832d96b-4750-44de-8e17-46e6559869d9";
const EVENING_ID = "ac13ca25-a729-4eb7-94a5-19e77fb2e058";

const T = {
  en: {
    presents: "The Gatekeepers Club presents",
    subtitle: "Monaco Grand Prix 2026",
    dateLine: "5 – 7 June 2026 · Monaco",
    nights: "Nights", location: "Monaco Harbour", vessel: "M/Y ARADOS",
    nightsLabel: "Nights", locationLabel: "Location", vesselLabel: "Vessel",
    intro: "Three nights aboard M/Y ARADOS, berthed in Monaco harbour. Race access from the water. Evenings of cocktails, conversation and sport on deck. Three ways to be on the yacht.",
    accommodation: "Accommodation",
    accommodationTitle: "Sleep aboard",
    accommodationDesc: "Private cabins on M/Y ARADOS for the full GP weekend. Includes all daytime hospitality, VIP Terrace access and evening cocktail events. Fri–Mon.",
    daytime: "Daytime",
    daytimeTitle: "On the water",
    daytimeDesc: "Full day access on the yacht during race hours. Private chef, hospitality, drinks, networking with athletes and guests on board.",
    evening: "Evening Cocktail",
    eveningTitle: "On deck",
    eveningDesc: "Three evenings of cocktail dinatoire on deck. Fine drinks, canapes, curated premium brands, international athletes. Each evening has its own character.",
    eveningNights: ["Friday — Welcome Cocktail", "Saturday — Gala Night", "Sunday — Charity Evening"],
    programme: "Programme",
    threeEvenings: "Three Evenings",
    downloads: "Downloads",
    brochures: "Brochures",
    jointVenture: "A joint venture",
    from: "from",
    onApplication: "On application",
    enquire: "Enquire",
    more: "more",
    download: "Download",
    close: "Close",
    switchLang: "FR",
    thankYou: "Thank you",
    thankYouMsg: "We have received your interest and will be in touch shortly.",
    alsoTerrace: "Also on the terraces",
    terraceLink: "View terrace packages",
    residences: "Residences",
    alaCarte: "A la carte",
    tailored: "Tailored pricing",
    perDay: "per day",
    perEvening: "per evening",
  },
  fr: {
    presents: "The Gatekeepers Club presente",
    subtitle: "Grand Prix de Monaco 2026",
    dateLine: "5 – 7 juin 2026 · Monaco",
    nights: "Nuits", location: "Port de Monaco", vessel: "M/Y ARADOS",
    nightsLabel: "Nuits", locationLabel: "Lieu", vesselLabel: "Yacht",
    intro: "Trois nuits a bord du M/Y ARADOS, amarre dans le port de Monaco. Acces a la course depuis l'eau. Soirees de cocktails, de conversations et de sport sur le pont. Trois facons d'etre a bord.",
    accommodation: "Hebergement",
    accommodationTitle: "Dormir a bord",
    accommodationDesc: "Cabines privees sur le M/Y ARADOS pour tout le week-end du GP. Inclut toute l'hospitalite en journee, l'acces aux Terrasses VIP et les soirees cocktail. Ven–Lun.",
    daytime: "Journee",
    daytimeTitle: "Sur l'eau",
    daytimeDesc: "Acces complet en journee sur le yacht pendant les heures de course. Chef prive, hospitalite, boissons, networking avec athletes et invites a bord.",
    evening: "Cocktail Dinatoire",
    eveningTitle: "Sur le pont",
    eveningDesc: "Trois soirees de cocktail dinatoire sur le pont. Boissons raffinées, canapes, marques premium selectionnees, athletes internationaux. Chaque soiree a son propre caractere.",
    eveningNights: ["Vendredi — Cocktail de bienvenue", "Samedi — Soiree de gala", "Dimanche — Soiree caritative"],
    programme: "Programme",
    threeEvenings: "Trois Soirees",
    downloads: "Telechargements",
    brochures: "Brochures",
    jointVenture: "Une co-production",
    from: "a partir de",
    onApplication: "Sur demande",
    enquire: "Nous contacter",
    more: "de plus",
    download: "Telecharger",
    close: "Fermer",
    switchLang: "EN",
    thankYou: "Merci",
    thankYouMsg: "Nous avons bien recu votre demande et reviendrons vers vous dans les plus brefs delais.",
    alsoTerrace: "Egalement sur les terrasses",
    terraceLink: "Voir les formules terrasse",
    residences: "Residences",
    alaCarte: "A la carte",
    tailored: "Tarif sur mesure",
    perDay: "par jour",
    perEvening: "par soiree",
  },
};

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
}

function PackageCard({
  pkg, t, onSelect,
}: {
  pkg: EventPackage;
  t: typeof T["en"];
  onSelect: (name: string) => void;
}) {
  const services: string[] = (() => { try { return JSON.parse(pkg.included_services); } catch { return []; } })();
  const isResidence = pkg.name.startsWith("Pavilion ");

  return (
    <div className={`border rounded-lg p-5 flex flex-col bg-white ${isResidence ? "border-gold/40 shadow-sm" : "border-green/10"}`}>
      {isResidence && (
        <p className="text-[9px] tracking-[2px] text-gold uppercase font-body mb-2">{t.residences}</p>
      )}
      <h3 className="text-sm font-heading font-semibold text-green mb-1">{pkg.name}</h3>
      <p className="text-lg font-heading font-semibold text-green mb-1">
        {pkg.price > 0 ? `${t.from} ${formatPrice(pkg.price, pkg.currency)}` : t.onApplication}
      </p>
      <p className="text-xs text-gray-500 font-body mb-4">{pkg.description}</p>

      {services.length > 0 && (
        <ul className="space-y-1.5 mb-4 flex-1">
          {services.slice(0, 6).map((s, i) => (
            <li key={i} className="text-[11px] text-gray-600 font-body flex items-start gap-2">
              <span className="text-gold mt-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              {s}
            </li>
          ))}
          {services.length > 6 && (
            <li className="text-[11px] text-gray-400 font-body pl-5">+{services.length - 6} {t.more}</li>
          )}
        </ul>
      )}

      {pkg.price_options && pkg.price_options.length > 0 ? (
        <div className="mt-auto space-y-2">
          {pkg.price_options.map((opt) => (
            <div key={opt.label} className="flex items-center justify-between gap-2 py-2 border-t border-green/5 first:border-0 first:pt-0">
              <div>
                <p className="text-[10px] text-gray-400 font-body">{opt.label}</p>
                <p className="text-sm font-heading font-semibold text-gold">€{opt.eur.toLocaleString("fr-FR")}</p>
              </div>
              {opt.stripe_link ? (
                <a href={opt.stripe_link} target="_blank" rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gold text-white text-[10px] font-body rounded-md hover:bg-[#b89a3f] transition-colors whitespace-nowrap">
                  Book by Card
                </a>
              ) : (
                <button onClick={() => onSelect(`${pkg.name} — ${opt.label}`)}
                  className="px-3 py-1.5 bg-green text-white text-[10px] font-body rounded-md hover:bg-green-light transition-colors whitespace-nowrap">
                  {t.enquire}
                </button>
              )}
            </div>
          ))}
          <button onClick={() => onSelect(pkg.name)}
            className="w-full border border-green/20 text-green py-2 rounded-md text-[10px] font-body tracking-wide hover:bg-green/5 transition-colors mt-1">
            {t.enquire} / Bank Transfer
          </button>
        </div>
      ) : (
        <button onClick={() => onSelect(pkg.name)}
          className="mt-auto w-full bg-green text-white py-2.5 rounded-md text-xs font-body tracking-wide hover:bg-green-light transition-colors">
          {t.enquire}
        </button>
      )}
    </div>
  );
}

export default function PavilionYachtPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-pearl flex items-center justify-center"><p className="text-gray-400 font-body text-sm">Loading...</p></div>}>
      <PavilionYachtContent />
    </Suspense>
  );
}

function PavilionYachtContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lang: Lang = searchParams.get("lang") === "fr" ? "fr" : "en";
  const t = T[lang];

  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/event/pavilion-yacht")
      .then((r) => r.json())
      .then((d) => { setPackages(d.packages || []); setBrochures(d.brochures || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const accommodationPkgs = packages.filter((p) => ACCOMMODATION_IDS.includes(p.id));
  const daytimePkg = packages.find((p) => p.id === DAYTIME_ID);
  const eveningPkg = packages.find((p) => p.id === EVENING_ID);

  function switchLang() {
    const p = new URLSearchParams(searchParams.toString());
    if (lang === "en") p.set("lang", "fr"); else p.delete("lang");
    router.push(`/event/pavilion-yacht?${p.toString()}`);
  }

  return (
    <div className="min-h-screen bg-pearl">
      {/* Lang switcher */}
      <button
        onClick={switchLang}
        className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm border border-green/20 rounded-full px-3 py-1.5 text-xs font-body font-medium text-green hover:bg-white transition-colors shadow-sm"
      >
        {t.switchLang}
      </button>

      {/* Hero */}
      <section className="relative h-[75vh] min-h-[520px] flex items-end">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${IMGS}/yachts-circuit.jpg)` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-12 w-full">
          <p className="text-[11px] tracking-[4px] text-gold uppercase font-body mb-3">{t.presents}</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-semibold text-white mb-2">
            The Pavilion
          </h1>
          <p className="text-lg sm:text-xl text-white/70 font-body">Yacht &nbsp;·&nbsp; {t.subtitle}</p>
          <p className="text-sm text-white/50 font-body mt-1">{t.dateLine}</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-green">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap justify-center gap-8 sm:gap-16">
          {[
            { label: t.nightsLabel, value: "3" },
            { label: t.locationLabel, value: t.location },
            { label: t.vesselLabel, value: t.vessel },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-white font-heading font-semibold text-lg">{s.value}</p>
              <p className="text-white/60 font-body text-[10px] tracking-[2px] uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-2xl mx-auto px-6 py-14 text-center">
        <p className="text-base text-gray-700 font-body leading-relaxed">{t.intro}</p>
      </section>

      {/* SECTION 1: ACCOMMODATION */}
      <section className="bg-white border-y border-green/10">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-8 h-px bg-gold" />
            <p className="text-[10px] tracking-[3px] text-gold uppercase font-body">01</p>
          </div>
          <h2 className="text-2xl font-heading font-semibold text-green mb-2">{t.accommodationTitle}</h2>
          <p className="text-sm text-gray-500 font-body mb-8 max-w-xl">{t.accommodationDesc}</p>

          {loading ? (
            <p className="text-gray-400 text-sm font-body">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {accommodationPkgs.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} t={t} onSelect={setSelectedPackage} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: DAYTIME */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-8 h-px bg-gold" />
          <p className="text-[10px] tracking-[3px] text-gold uppercase font-body">02</p>
        </div>
        <h2 className="text-2xl font-heading font-semibold text-green mb-2">{t.daytimeTitle}</h2>
        <p className="text-sm text-gray-500 font-body mb-8 max-w-xl">{t.daytimeDesc}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          {daytimePkg && (
            <PackageCard pkg={daytimePkg} t={t} onSelect={setSelectedPackage} />
          )}
          <div className="rounded-lg overflow-hidden aspect-video">
            <img src={`${IMGS}/harbour.jpg`} alt="Monaco harbour from above" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* SECTION 3: EVENING */}
      <section className="bg-white border-y border-green/10">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-8 h-px bg-gold" />
            <p className="text-[10px] tracking-[3px] text-gold uppercase font-body">03</p>
          </div>
          <h2 className="text-2xl font-heading font-semibold text-green mb-2">{t.eveningTitle}</h2>
          <p className="text-sm text-gray-500 font-body mb-8 max-w-xl">{t.eveningDesc}</p>

          {/* Evening character pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {t.eveningNights.map((n) => (
              <span key={n} className="px-3 py-1 bg-green/5 border border-green/10 rounded-full text-xs font-body text-green">
                {n}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="rounded-lg overflow-hidden aspect-video">
              <img src={`${IMGS}/cocktails.jpg`} alt="Evening cocktails served on deck" className="w-full h-full object-cover" />
            </div>
            {eveningPkg && (
              <PackageCard pkg={eveningPkg} t={t} onSelect={setSelectedPackage} />
            )}
          </div>
        </div>
      </section>

      {/* Brochures */}
      {brochures.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-12 text-center">
          <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">{t.downloads}</p>
          <h2 className="text-xl font-heading font-semibold text-green mb-6">{t.brochures}</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {brochures.map((b) => (
              <a key={b.title} href={b.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-green/20 rounded-md text-sm font-body text-green hover:bg-green/5 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {b.title} (PDF)
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Cross-sell to terrace */}
      <section className="max-w-5xl mx-auto px-6 pb-10">
        <div className="border border-green/10 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div>
            <p className="text-[10px] tracking-[2px] text-gold uppercase font-body mb-1">{t.alsoTerrace}</p>
            <p className="text-sm text-gray-600 font-body">VIP Terraces · Daytime race access · Open champagne bar · From €700/day</p>
          </div>
          <a href="/event/pavilion-terrace"
            className="shrink-0 px-5 py-2.5 border border-green/20 rounded-md text-xs font-body text-green hover:bg-green/5 transition-colors whitespace-nowrap">
            {t.terraceLink} →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green/10 max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-5">{t.jointVenture}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-16">
          <div>
            <p className="text-xs tracking-[2px] text-green/60 uppercase font-body mb-1">The Gatekeepers Club</p>
            <p className="text-sm text-gray-500 font-body">christian@thegatekeepers.club</p>
          </div>
          <div>
            <p className="text-xs tracking-[2px] text-green/60 uppercase font-body mb-1">Game ON Media</p>
            <p className="text-sm text-gray-500 font-body">hamish@hamemedia.com</p>
          </div>
        </div>
      </footer>

      {selectedPackage && !showSuccess && (
        <LeadCaptureModal
          packageName={selectedPackage}
          eventSlug="pavilion-yacht"
          refCode={null}
          onClose={() => setSelectedPackage(null)}
          onSuccess={() => { setSelectedPackage(null); setShowSuccess(true); }}
        />
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSuccess(false)} />
          <div className="relative bg-white rounded-2xl max-w-sm mx-4 p-8 shadow-xl text-center">
            <div className="w-12 h-12 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-semibold text-green mb-2">{t.thankYou}</h3>
            <p className="text-sm text-gray-600 font-body mb-6">{t.thankYouMsg}</p>
            {brochures.map((b) => (
              <a key={b.title} href={b.url} target="_blank" rel="noopener noreferrer"
                className="block text-sm text-green font-body hover:underline mb-2">
                {t.download} {b.title} (PDF)
              </a>
            ))}
            <button onClick={() => setShowSuccess(false)} className="text-xs text-gray-400 font-body hover:text-gray-600 mt-2">{t.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}
