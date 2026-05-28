"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const LeadCaptureModal = dynamic(
  () => import("@/components/event-booking/LeadCaptureModal"),
  { ssr: false }
);

const IMGS = "https://vxmrvnmtauqqqjikhjbh.supabase.co/storage/v1/object/public/project-documents/pavilion-terrace";

const GALLERY = [
  { src: `${IMGS}/guests.jpg`,        alt: "Guests on the terrace overlooking Monaco harbour" },
  { src: `${IMGS}/champagne.jpg`,     alt: "Champagne table set on the terrace" },
  { src: `${IMGS}/cocktails.jpg`,     alt: "Cocktails served on the terrace" },
  { src: `${IMGS}/race-view.jpg`,     alt: "Race viewed from the terrace" },
  { src: `${IMGS}/monaco-gp.jpg`,     alt: "Ferrari at Monaco Grand Prix" },
  { src: `${IMGS}/panorama.jpg`,      alt: "Circuit panorama from terrace level" },
];

interface PriceOption { label: string; eur: number; stripe_link: string | null }
interface EventPackage {
  id: string; name: string; description: string; price: number; currency: string;
  included_services: string; sort_order: number; price_options: PriceOption[] | null;
}
interface Brochure { title: string; url: string }
type Lang = "en" | "fr";

const T = {
  en: {
    presents: "The Gatekeepers Club presents",
    subtitle: "Monaco Grand Prix 2026",
    dateLine: "5 – 7 June 2026 · Monaco",
    days: "Days", location: "Monaco", venue: "Silver VIP Terraces",
    venueLabel: "Venue",
    experience: "The Experience",
    experienceTitle: "On the circuit",
    desc: "The Pavilion Terraces sit directly on the Monaco Grand Prix circuit. Three days of race access from a position very few people in the world occupy. Breakfast and lunch served at your table. An open champagne bar throughout each day. The crowd is drawn from international sport, business and media. The terrace is where the conversations happen between laps.",
    highlights: [
      "Silver VIP Terraces on the Monaco GP circuit",
      "Breakfast, lunch and open champagne bar included",
      "Race viewing: Practice, Qualifying and Race Day",
      "Curated crowd: athletes, entrepreneurs, media",
      "F&B service throughout the day",
      "Helicopter transfers available",
    ],
    programme: "Programme",
    threedays: "Three Days in Monaco",
    packages: "Packages",
    chooseTitle: "Choose your package",
    chooseSub: "Saturday & Sunday, or the full three-day weekend. Single days on request.",
    gallery: "In the Terraces",
    galleryTitle: "What to expect",
    alaCarte: "A la carte",
    tailored: "Tailored pricing",
    from: "from",
    perDay: "per day",
    onApplication: "On application",
    enquire: "Enquire",
    more: "more",
    downloads: "Downloads",
    brochures: "Brochures",
    jointVenture: "A joint venture",
    download: "Download",
    close: "Close",
    switchLang: "FR",
    thankYou: "Thank you",
    thankYouMsg: "We have received your interest and will be in touch shortly.",
    alsoOnYacht: "Also on the yacht",
    yachtLink: "View yacht packages",
  },
  fr: {
    presents: "The Gatekeepers Club presente",
    subtitle: "Grand Prix de Monaco 2026",
    dateLine: "5 – 7 juin 2026 · Monaco",
    days: "Jours", location: "Monaco", venue: "Terrasses VIP Silver",
    venueLabel: "Espace",
    experience: "L'Experience",
    experienceTitle: "Sur le circuit",
    desc: "Les Terrasses du Pavilion sont situées directement sur le circuit du Grand Prix de Monaco. Trois jours d'accès au circuit depuis l'une des positions les plus privilegiees du monde. Petit-dejeuner et dejeuner servis a table. Bar a champagne ouvert toute la journee. Un public issu du sport international, du monde des affaires et des medias. La terrasse, c'est la ou les conversations ont lieu entre les tours de piste.",
    highlights: [
      "Terrasses VIP Silver sur le circuit du GP de Monaco",
      "Petit-dejeuner, dejeuner et bar a champagne inclus",
      "Vue sur la course : Essais, Qualifications et Jour de course",
      "Invites tries sur le volet : athletes, entrepreneurs, medias",
      "Service F&B tout au long de la journee",
      "Transferts helicoptere disponibles",
    ],
    programme: "Programme",
    threedays: "Trois jours a Monaco",
    packages: "Formules",
    chooseTitle: "Choisissez votre formule",
    chooseSub: "Samedi et dimanche, ou le week-end complet. Journees a la carte sur demande.",
    gallery: "Sur les Terrasses",
    galleryTitle: "A quoi s'attendre",
    alaCarte: "A la carte",
    tailored: "Tarif sur mesure",
    from: "a partir de",
    perDay: "par jour",
    onApplication: "Sur demande",
    enquire: "Nous contacter",
    more: "de plus",
    downloads: "Telechargements",
    brochures: "Brochures",
    jointVenture: "Une co-production",
    download: "Telecharger",
    close: "Fermer",
    switchLang: "EN",
    thankYou: "Merci",
    thankYouMsg: "Nous avons bien recu votre demande et reviendrons vers vous dans les plus brefs delais.",
    alsoOnYacht: "Egalement sur le yacht",
    yachtLink: "Voir les formules yacht",
  },
};

const PROG_EN = [
  { day: "Friday 5 June", title: "Practice Day", items: ["Terrace access from 10:00", "13:30 Free Practice 1", "17:00 Free Practice 2", "Open champagne bar all day", "Lunch served at table"] },
  { day: "Saturday 6 June", title: "Qualifying", items: ["Terrace access from 10:00", "12:30 Free Practice 3", "16:00 Qualifying session", "The biggest social session of the weekend", "Lunch and open bar"] },
  { day: "Sunday 7 June", title: "Race Day", items: ["Terrace access from 10:00", "15:00 Race start — 78 laps", "Race viewing from circuit-side position", "Champagne bar open through the race", "Terrace closes after the podium"] },
];
const PROG_FR = [
  { day: "Vendredi 5 juin", title: "Essais libres", items: ["Acces terrasse a partir de 10h00", "13h30 Essais libres 1", "17h00 Essais libres 2", "Bar a champagne ouvert toute la journee", "Dejeuner servi a table"] },
  { day: "Samedi 6 juin", title: "Qualifications", items: ["Acces terrasse a partir de 10h00", "12h30 Essais libres 3", "16h00 Qualifications", "La plus grande session sociale du week-end", "Dejeuner et bar ouvert"] },
  { day: "Dimanche 7 juin", title: "Jour de course", items: ["Acces terrasse a partir de 10h00", "15h00 Depart — 78 tours", "Vue sur la course depuis le bord du circuit", "Bar a champagne ouvert pendant la course", "Fermeture apres le podium"] },
];

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
}

export default function PavilionTerracePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-pearl flex items-center justify-center"><p className="text-gray-400 font-body text-sm">Loading...</p></div>}>
      <PavilionTerraceContent />
    </Suspense>
  );
}

function PavilionTerraceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lang: Lang = searchParams.get("lang") === "fr" ? "fr" : "en";
  const t = T[lang];
  const PROG = lang === "fr" ? PROG_FR : PROG_EN;

  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/event/pavilion-terrace")
      .then((r) => r.json())
      .then((d) => { setPackages(d.packages || []); setBrochures(d.brochures || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function switchLang() {
    const p = new URLSearchParams(searchParams.toString());
    if (lang === "en") p.set("lang", "fr"); else p.delete("lang");
    router.push(`/event/pavilion-terrace?${p.toString()}`);
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
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${IMGS}/hero.jpg)` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-12 w-full">
          <p className="text-[11px] tracking-[4px] text-gold uppercase font-body mb-3">{t.presents}</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-semibold text-white mb-2">
            The Pavilion
          </h1>
          <p className="text-lg sm:text-xl text-white/70 font-body">VIP Terraces &nbsp;·&nbsp; {t.subtitle}</p>
          <p className="text-sm text-white/50 font-body mt-1">{t.dateLine}</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-green">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap justify-center gap-8 sm:gap-16">
          {[
            { label: t.days, value: "3" },
            { label: t.location, value: "Monaco" },
            { label: t.venueLabel, value: t.venue },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-white font-heading font-semibold text-lg">{s.value}</p>
              <p className="text-white/60 font-body text-[10px] tracking-[2px] uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">{t.experience}</p>
        <h2 className="text-2xl font-heading font-semibold text-green mb-6">{t.experienceTitle}</h2>
        <p className="text-base text-gray-700 font-body leading-relaxed">{t.desc}</p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {t.highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600 font-body">
              <span className="text-gold mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              {h}
            </div>
          ))}
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="bg-white border-y border-green/10">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">{t.gallery}</p>
          <h2 className="text-2xl font-heading font-semibold text-green mb-8">{t.galleryTitle}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GALLERY.map((img, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-lg ${i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}
                style={{ aspectRatio: i === 0 ? "16/9" : "4/3" }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programme */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">{t.programme}</p>
        <h2 className="text-2xl font-heading font-semibold text-green mb-8">{t.threedays}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PROG.map((day) => (
            <div key={day.day} className="bg-white border border-green/10 rounded-lg p-5">
              <p className="text-[10px] tracking-[2px] text-gold uppercase font-body mb-1">{day.day}</p>
              <h3 className="text-sm font-heading font-semibold text-green mb-3">{day.title}</h3>
              <ul className="space-y-2">
                {day.items.map((item, i) => (
                  <li key={i} className="text-xs text-gray-600 font-body flex items-start gap-2">
                    <span className="text-gold/60 mt-0.5">&#8226;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="bg-white border-y border-green/10">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">{t.packages}</p>
          <h2 className="text-2xl font-heading font-semibold text-green mb-2">{t.chooseTitle}</h2>
          <p className="text-sm text-gray-500 font-body mb-8">{t.chooseSub}</p>

          {loading ? (
            <p className="text-gray-400 text-sm font-body">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {packages.map((pkg) => {
                const services: string[] = (() => { try { return JSON.parse(pkg.included_services); } catch { return []; } })();
                const isCombination = pkg.name.includes("Combination") || pkg.name.includes("Combinaison");

                return (
                  <div key={pkg.id} className="border border-green/10 bg-pearl rounded-lg p-6 flex flex-col">
                    <p className="text-[9px] tracking-[2px] text-green/40 uppercase font-body mb-2">
                      {isCombination ? t.tailored : t.alaCarte}
                    </p>
                    <h3 className="text-sm font-heading font-semibold text-green mb-1">{pkg.name}</h3>
                    <p className="text-lg font-heading font-semibold text-green mb-1">
                      {isCombination
                        ? t.tailored
                        : pkg.price > 0
                          ? `${t.from} ${formatPrice(pkg.price, pkg.currency)} ${t.perDay}`
                          : t.onApplication}
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
                              <button onClick={() => setSelectedPackage(`${pkg.name} — ${opt.label}`)}
                                className="px-3 py-1.5 bg-green text-white text-[10px] font-body rounded-md hover:bg-green-light transition-colors whitespace-nowrap">
                                {t.enquire}
                              </button>
                            )}
                          </div>
                        ))}
                        <button onClick={() => setSelectedPackage(pkg.name)}
                          className="w-full border border-green/20 text-green py-2 rounded-md text-[10px] font-body tracking-wide hover:bg-green/5 transition-colors mt-1">
                          {t.enquire} / Bank Transfer
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setSelectedPackage(pkg.name)}
                        className="mt-auto w-full bg-green text-white py-2.5 rounded-md text-xs font-body tracking-wide hover:bg-green-light transition-colors">
                        {t.enquire}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Single day note */}
          <p className="mt-8 text-center text-xs text-gray-400 font-body">
            Single day passes available on request — contact us to discuss.
          </p>
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
          eventSlug="pavilion-terrace"
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
