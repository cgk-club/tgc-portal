"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

type Lang = "en" | "fr";

const T = {
  en: {
    presents: "The Gatekeepers Club presents",
    subtitle: "Monaco Grand Prix 2026",
    dateLine: "5 - 7 June 2026 . Monaco",
    sponsorship: "Sponsorship",
    headline: "Partner with The Pavilion",
    intro:
      "The Pavilion brings together entrepreneurs, athletes and cultural figures for three days aboard a superyacht and VIP terraces overlooking the Monaco Grand Prix. A sponsorship places your brand at the centre of this experience.",
    whyTitle: "Why The Pavilion",
    why: [
      "100 guests maximum: 80 on the yacht, 20 on VIP terraces",
      "Three days of live Grand Prix action from yacht and terraces",
      "Evening programme with A-list athletes and entrepreneurs",
      "Cocktail dinatoire each evening: fine drinks, canapes, only stirred cocktails",
      "Media booth for podcasts and interviews throughout the weekend",
      "Professional content creation across all three days",
      "International audience from the US, Commonwealth and Europe",
      "Inaugural edition with first-refusal on future events",
    ],
    tiersTitle: "Sponsorship Tiers",
    exclusive: "Exclusive",
    exclusiveTag: "1 available",
    exclusivePrice: "400,000",
    exclusiveItems: [
      "Full brand ownership of The Pavilion Monaco 2026",
      "Naming rights: \"The Pavilion by [Brand]\"",
      "Total branding across yacht, terraces, tenders, all materials",
      "Host all three cocktail dinatoire evenings",
      "15-20 guest passes (full access)",
      "Full brand activation on yacht deck",
      "Content ownership: all event photography and video",
      "Private meeting room aboard the yacht",
      "First refusal on all future Pavilion editions",
    ],
    exclusiveNote:
      "If the Exclusive tier is signed, all other tiers are void.",
    platinum: "Platinum",
    platinumTag: "1 available",
    platinumPrice: "175,000",
    platinumItems: [
      "Primary branding across all materials, signage and digital",
      "Logo on yacht exterior banner (Monaco harbour visibility)",
      "Branded welcome area on yacht deck",
      "10 guest passes (full access: terrace + yacht + hospitality)",
      "First choice of cocktail dinatoire to host (recommended: Saturday gala)",
      "Welcome speech or hosted moment at chosen evening",
      "Primary logo on The Pavilion brochure",
      "Full social media coverage and tagged content",
      "Priority introductions to all attendees",
    ],
    gold: "Gold",
    goldTag: "1 available",
    goldPrice: "125,000",
    goldItems: [
      "Secondary branding: yacht deck signage + Silver Terrace area",
      "Logo on brochure (second placement)",
      "Social media mentions and tagged content",
      "5 guest passes (full access)",
      "Second choice of evening to host",
      "Branded element at one daytime session",
    ],
    bronze: "Bronze",
    bronzeTag: "2 available",
    bronzePrice: "50,000",
    bronzeItems: [
      "Exclusive tender branding (one tender per Bronze sponsor)",
      "Continuous on-water visibility all weekend",
      "Logo on brochure and digital communications",
      "3 guest passes each (full access)",
      "Co-hosted evening event (shared between Bronze sponsors)",
    ],
    eveningTitle: "Evening Programme",
    eveningIntro:
      "Each sponsor selects an evening to host, in order of tier priority. The Saturday gala is the centrepiece of the weekend.",
    eveningFri: "Friday 5 June",
    eveningSat: "Saturday 6 June",
    eveningSun: "Sunday 7 June",
    eveningTime: "18:00 - 23:30",
    eveningVenue: "M/Y ARADOS",
    eveningFriDesc: "Welcome cocktail dinatoire on deck",
    eveningSatDesc: "Gala cocktail dinatoire (centrepiece)",
    eveningSunDesc: "Charity cocktail dinatoire with athletes",
    mediaTitle: "Media & Content",
    mediaIntro:
      "Every sponsorship includes an editorial content programme across our channels. Pre-event, during the Grand Prix, and post-event. All content is editorial in tone, not advertorial.",
    mediaPreEvent: "Pre-Event (8 weeks)",
    mediaDuring: "During the Event",
    mediaPostEvent: "Post-Event (4 weeks)",
    mediaPlatLabel: "Platinum",
    mediaGoldLabel: "Gold",
    mediaBronzeLabel: "Bronze",
    mediaPlatPre: "5 social posts + 3 newsletter mentions including a dedicated editorial spotlight on your brand",
    mediaGoldPre: "3 social posts + 2 newsletter mentions woven into Pavilion editorial",
    mediaBronzePre: "2 social posts + 1 newsletter mention",
    mediaPlatDuring: "Daily Instagram Stories and feed posts with your branding, dedicated media booth interview, comprehensive professional photo library",
    mediaGoldDuring: "Stories and feed coverage across the weekend, media booth interview clip, curated photo selection",
    mediaBronzeDuring: "Story coverage featuring branded tenders, event atmosphere content, curated photo selection",
    mediaPlatPost: "3 recap posts, dedicated newsletter feature, full-edit media booth interview, complete content package, ROI report with candid assessment",
    mediaGoldPost: "2 recap posts, newsletter mention, interview clip published, curated content selection delivered",
    mediaBronzePost: "Included in recap content, newsletter mention, curated content selection delivered",
    mediaNote: "All content is approved by your team before publication. One approval round, 48-hour window.",
    ctaTitle: "Interested?",
    ctaText:
      "For the full sponsorship deck or to discuss how your brand fits within The Pavilion, get in touch directly.",
    ctaButton: "Contact Us",
    ctaEmail: "christian@thegatekeepers.club",
    ctaPhone: "+33 7 73 77 90 71",
    perSponsor: "per sponsor",
    eur: "EUR",
    switchLang: "FR",
    backToEvent: "Back to event",
    jointVenture: "A joint venture",
  },
  fr: {
    presents: "The Gatekeepers Club presente",
    subtitle: "Grand Prix de Monaco 2026",
    dateLine: "5 - 7 juin 2026 . Monaco",
    sponsorship: "Sponsoring",
    headline: "Devenez partenaire de The Pavilion",
    intro:
      "The Pavilion reunit entrepreneurs, athletes et personnalites culturelles pendant trois jours a bord d'un superyacht et sur des terrasses VIP surplombant le Grand Prix de Monaco. Un sponsoring place votre marque au coeur de cette experience.",
    whyTitle: "Pourquoi The Pavilion",
    why: [
      "100 invites maximum : 80 sur le yacht, 20 sur les terrasses VIP",
      "Trois jours de Grand Prix en direct depuis le yacht et les terrasses",
      "Cocktail dinatoire chaque soir : boissons raffinées, canapes, cocktails remues uniquement",
      "Espace media pour podcasts et interviews tout au long du week-end",
      "Creation de contenu professionnel sur les trois jours",
      "Audience internationale des Etats-Unis, du Commonwealth et d'Europe",
      "Edition inaugurale avec priorite sur les futures editions",
    ],
    tiersTitle: "Formules de Sponsoring",
    exclusive: "Exclusif",
    exclusiveTag: "1 disponible",
    exclusivePrice: "400 000",
    exclusiveItems: [
      "Propriete totale de la marque The Pavilion Monaco 2026",
      "Droits de denomination : \"The Pavilion by [Marque]\"",
      "Branding integral sur yacht, terrasses, tenders, tous supports",
      "Animation des trois cocktails dinatoires",
      "15-20 pass invites (acces complet)",
      "Activation de marque sur le pont du yacht",
      "Propriete du contenu : photos et videos de l'evenement",
      "Salle de reunion privee a bord du yacht",
      "Priorite sur toutes les futures editions de The Pavilion",
    ],
    exclusiveNote:
      "Si le niveau Exclusif est signe, tous les autres niveaux sont annules.",
    platinum: "Platine",
    platinumTag: "1 disponible",
    platinumPrice: "175 000",
    platinumItems: [
      "Branding principal sur tous les supports, signaletique et digital",
      "Logo sur banniere exterieure du yacht (visibilite port de Monaco)",
      "Espace d'accueil de marque sur le pont du yacht",
      "10 pass invites (acces complet : terrasse + yacht + hospitalite)",
      "Premier choix de cocktail dinatoire a animer (recommande : gala du samedi)",
      "Discours de bienvenue ou moment anime lors de la soiree choisie",
      "Logo principal sur la brochure The Pavilion",
      "Couverture complete sur les reseaux sociaux",
      "Introductions prioritaires aupres de tous les invites",
    ],
    gold: "Or",
    goldTag: "1 disponible",
    goldPrice: "125 000",
    goldItems: [
      "Branding secondaire : pont du yacht + zone Terrasse Silver",
      "Logo sur brochure (deuxieme placement)",
      "Mentions et contenu tagge sur les reseaux sociaux",
      "5 pass invites (acces complet)",
      "Deuxieme choix de soiree a animer",
      "Element de marque lors d'une session de journee",
    ],
    bronze: "Bronze",
    bronzeTag: "2 disponibles",
    bronzePrice: "50 000",
    bronzeItems: [
      "Branding exclusif sur tender (un tender par sponsor Bronze)",
      "Visibilite continue sur l'eau tout le week-end",
      "Logo sur brochure et communications digitales",
      "3 pass invites chacun (acces complet)",
      "Soiree co-animee (partagee entre les sponsors Bronze)",
    ],
    eveningTitle: "Programme de soirees",
    eveningIntro:
      "Chaque sponsor choisit une soiree a animer, par ordre de priorite. Le gala du samedi est le moment fort du week-end.",
    eveningFri: "Vendredi 5 juin",
    eveningSat: "Samedi 6 juin",
    eveningSun: "Dimanche 7 juin",
    eveningTime: "18h00 - 23h30",
    eveningVenue: "M/Y ARADOS",
    eveningFriDesc: "Cocktail dinatoire de bienvenue sur le pont",
    eveningSatDesc: "Cocktail dinatoire de gala (evenement phare)",
    eveningSunDesc: "Cocktail dinatoire caritatif avec athletes",
    mediaTitle: "Media & Contenu",
    mediaIntro:
      "Chaque sponsoring inclut un programme de contenu editorial sur nos canaux. Avant, pendant et apres le Grand Prix. Le ton est editorial, jamais publicitaire.",
    mediaPreEvent: "Avant l'evenement (8 semaines)",
    mediaDuring: "Pendant l'evenement",
    mediaPostEvent: "Apres l'evenement (4 semaines)",
    mediaPlatLabel: "Platine",
    mediaGoldLabel: "Or",
    mediaBronzeLabel: "Bronze",
    mediaPlatPre: "5 publications sociales + 3 mentions newsletter dont un portrait editorial dedie a votre marque",
    mediaGoldPre: "3 publications sociales + 2 mentions newsletter integrees au contenu editorial Pavilion",
    mediaBronzePre: "2 publications sociales + 1 mention newsletter",
    mediaPlatDuring: "Stories et posts Instagram quotidiens avec votre branding, interview dediee au media booth, bibliotheque photo professionnelle complete",
    mediaGoldDuring: "Stories et couverture sur le week-end, clip d'interview au media booth, selection photo curee",
    mediaBronzeDuring: "Stories mettant en avant les tenders brandes, contenu ambiance, selection photo curee",
    mediaPlatPost: "3 posts recap, feature newsletter dediee, interview media booth montee, package contenu complet, rapport ROI avec bilan candide",
    mediaGoldPost: "2 posts recap, mention newsletter, clip interview publie, selection contenu curee livree",
    mediaBronzePost: "Inclus dans le contenu recap, mention newsletter, selection contenu curee livree",
    mediaNote: "Tout le contenu est approuve par votre equipe avant publication. Un tour d'approbation, delai de 48 heures.",
    ctaTitle: "Interesse ?",
    ctaText:
      "Pour recevoir le dossier de sponsoring complet ou discuter de la place de votre marque au sein de The Pavilion, contactez-nous directement.",
    ctaButton: "Nous contacter",
    ctaEmail: "christian@thegatekeepers.club",
    ctaPhone: "+33 7 73 77 90 71",
    perSponsor: "par sponsor",
    eur: "EUR",
    switchLang: "EN",
    backToEvent: "Retour a l'evenement",
    jointVenture: "Une co-production",
  },
};

const TIERS = ["exclusive", "platinum", "gold", "bronze"] as const;

const TIER_COLORS: Record<string, { border: string; badge: string; bg: string }> = {
  exclusive: { border: "border-gold", badge: "bg-gold text-white", bg: "bg-gradient-to-b from-gold/5 to-transparent" },
  platinum: { border: "border-gray-300", badge: "bg-gray-700 text-white", bg: "bg-gradient-to-b from-gray-50 to-transparent" },
  gold: { border: "border-yellow-400", badge: "bg-yellow-500 text-white", bg: "bg-gradient-to-b from-yellow-50/50 to-transparent" },
  bronze: { border: "border-amber-600", badge: "bg-amber-700 text-white", bg: "bg-gradient-to-b from-amber-50/50 to-transparent" },
};

export default function SponsorshipPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const lang: Lang = searchParams.get("lang") === "fr" ? "fr" : "en";
  const t = T[lang];

  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/event/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setHeroImage(data.event?.image_url || null);
        }
      } catch {}
    }
    load();

    // Track page view
    const p = new URLSearchParams(window.location.search);
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: "sponsorship",
        slug,
        referrer: document.referrer || null,
        utm_source: p.get("utm_source"),
        utm_medium: p.get("utm_medium"),
        utm_campaign: p.get("utm_campaign"),
        lang,
      }),
    }).catch(() => {});
  }, [slug, lang]);

  function switchLang() {
    const newLang = lang === "en" ? "fr" : "en";
    const p = new URLSearchParams(searchParams.toString());
    if (newLang === "en") p.delete("lang");
    else p.set("lang", newLang);
    const qs = p.toString();
    router.push(`/event/${slug}/sponsorship${qs ? `?${qs}` : ""}`);
  }

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
      <section className="relative h-[50vh] min-h-[380px] flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: heroImage
              ? `url(${heroImage})`
              : "linear-gradient(135deg, #0e4f51 0%, #1a6b6e 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-10 w-full">
          <a
            href={`/event/${slug}${lang === "fr" ? "?lang=fr" : ""}`}
            className="inline-block text-white/60 hover:text-white text-xs font-body mb-4 transition-colors"
          >
            &larr; {t.backToEvent}
          </a>
          <p className="text-[11px] tracking-[4px] text-gold uppercase font-body mb-3">
            {t.sponsorship}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-semibold text-white mb-2">
            {t.headline}
          </h1>
          <p className="text-sm text-white/60 font-body">{t.dateLine}</p>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <p className="text-base text-gray-700 font-body leading-relaxed">
          {t.intro}
        </p>
      </section>

      {/* Why The Pavilion */}
      <section className="bg-white border-y border-green/10">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">
            {t.whyTitle}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {t.why.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-gray-600 font-body"
              >
                <span className="text-gold mt-0.5">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">
          {t.tiersTitle}
        </p>

        {/* Exclusive - Full Width */}
        <div
          className={`border-2 ${TIER_COLORS.exclusive.border} rounded-lg p-6 sm:p-8 mb-6 ${TIER_COLORS.exclusive.bg}`}
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h3 className="text-xl font-heading font-semibold text-green">
              {t.exclusive}
            </h3>
            <span
              className={`text-[10px] tracking-[1px] uppercase font-body px-2 py-0.5 rounded-full ${TIER_COLORS.exclusive.badge}`}
            >
              {t.exclusiveTag}
            </span>
          </div>
          <p className="text-2xl font-heading font-semibold text-green mb-1">
            {t.eur} {t.exclusivePrice}
          </p>
          <ul className="mt-4 space-y-2">
            {t.exclusiveItems.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-600 font-body"
              >
                <span className="text-gold mt-0.5">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-gray-500 font-body italic">
            {t.exclusiveNote}
          </p>
        </div>

        {/* Platinum / Gold / Bronze - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["platinum", "gold", "bronze"] as const).map((tier) => {
            const tierT = t as Record<string, unknown>;
            const colors = TIER_COLORS[tier];
            const items = tierT[`${tier}Items`] as string[];
            return (
              <div
                key={tier}
                className={`border ${colors.border} rounded-lg p-5 ${colors.bg}`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <h3 className="text-lg font-heading font-semibold text-green">
                    {tierT[tier] as string}
                  </h3>
                  <span
                    className={`text-[9px] tracking-[1px] uppercase font-body px-2 py-0.5 rounded-full ${colors.badge}`}
                  >
                    {tierT[`${tier}Tag`] as string}
                  </span>
                </div>
                <p className="text-xl font-heading font-semibold text-green mb-1">
                  {t.eur} {tierT[`${tier}Price`] as string}
                </p>
                {tier === "bronze" && (
                  <p className="text-xs text-gray-500 font-body mb-2">
                    {t.perSponsor}
                  </p>
                )}
                <ul className="mt-3 space-y-2">
                  {items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-gray-600 font-body"
                    >
                      <span className="text-gold mt-0.5 shrink-0">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Evening Programme */}
      <section className="bg-green">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">
            {t.eveningTitle}
          </p>
          <p className="text-sm text-white/70 font-body mb-8 max-w-2xl">
            {t.eveningIntro}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { day: t.eveningFri, desc: t.eveningFriDesc },
              { day: t.eveningSat, desc: t.eveningSatDesc },
              { day: t.eveningSun, desc: t.eveningSunDesc },
            ].map((ev) => (
              <div
                key={ev.day}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/10"
              >
                <p className="text-[10px] tracking-[2px] text-gold uppercase font-body mb-1">
                  {ev.day}
                </p>
                <p className="text-sm font-heading font-medium text-white mb-2">
                  {ev.desc}
                </p>
                <p className="text-xs text-white/50 font-body">
                  {t.eveningTime} &middot; {t.eveningVenue}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media & Content */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">
          {t.mediaTitle}
        </p>
        <p className="text-sm text-gray-600 font-body mb-10 max-w-2xl">
          {t.mediaIntro}
        </p>

        {/* Media table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-body">
            <thead>
              <tr className="border-b border-green/10">
                <th className="py-3 pr-4 text-[10px] tracking-[2px] text-gold uppercase font-body font-normal w-1/4"></th>
                <th className="py-3 px-4 text-[10px] tracking-[2px] text-gold uppercase font-body font-normal">{t.mediaPlatLabel}</th>
                <th className="py-3 px-4 text-[10px] tracking-[2px] text-gold uppercase font-body font-normal">{t.mediaGoldLabel}</th>
                <th className="py-3 px-4 text-[10px] tracking-[2px] text-gold uppercase font-body font-normal">{t.mediaBronzeLabel}</th>
              </tr>
            </thead>
            <tbody className="text-xs text-gray-600">
              <tr className="border-b border-green/5">
                <td className="py-4 pr-4 font-medium text-green">{t.mediaPreEvent}</td>
                <td className="py-4 px-4">{t.mediaPlatPre}</td>
                <td className="py-4 px-4">{t.mediaGoldPre}</td>
                <td className="py-4 px-4">{t.mediaBronzePre}</td>
              </tr>
              <tr className="border-b border-green/5">
                <td className="py-4 pr-4 font-medium text-green">{t.mediaDuring}</td>
                <td className="py-4 px-4">{t.mediaPlatDuring}</td>
                <td className="py-4 px-4">{t.mediaGoldDuring}</td>
                <td className="py-4 px-4">{t.mediaBronzeDuring}</td>
              </tr>
              <tr className="border-b border-green/5">
                <td className="py-4 pr-4 font-medium text-green">{t.mediaPostEvent}</td>
                <td className="py-4 px-4">{t.mediaPlatPost}</td>
                <td className="py-4 px-4">{t.mediaGoldPost}</td>
                <td className="py-4 px-4">{t.mediaBronzePost}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-gray-400 font-body italic">
          {t.mediaNote}
        </p>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">
          {t.ctaTitle}
        </p>
        <p className="text-base text-gray-700 font-body leading-relaxed mb-8 max-w-xl mx-auto">
          {t.ctaText}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`mailto:${t.ctaEmail}?subject=The Pavilion Monaco 2026 — Sponsorship`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green text-white rounded font-body text-sm hover:bg-green/90 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {t.ctaButton}
          </a>
          <a
            href={`tel:${t.ctaPhone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 px-6 py-3 border border-green/20 text-green rounded font-body text-sm hover:bg-green/5 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {t.ctaPhone}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green/10 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs text-gray-400 font-body">
            {t.jointVenture}
          </p>
          <div className="flex items-center justify-center gap-6 mt-2">
            <span className="text-xs text-gray-500 font-body font-medium">
              The Gatekeepers Club
            </span>
            <span className="text-gray-300">&times;</span>
            <span className="text-xs text-gray-500 font-body font-medium">
              Game ON Media
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
