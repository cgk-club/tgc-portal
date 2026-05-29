"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import SponsorshipLeadModal from "@/components/event-booking/SponsorshipLeadModal";

type Lang = "en" | "fr" | "sv" | "nl";

const T = {
  en: {
    presents: "The Gatekeepers Club presents",
    subtitle: "Monaco Grand Prix 2026",
    dateLine: "5 - 7 June 2026 . Monaco",
    sponsorship: "Sponsorship",
    headline: "Partner with The Pavilion",
    intro:
      "The Pavilion brings together entrepreneurs, athletes and cultural figures for three days on the Silver VIP Terraces overlooking the Monaco Grand Prix circuit. A sponsorship places your brand at the centre of this experience.",
    whyTitle: "Why The Pavilion",
    why: [
      "VIP Terraces directly on the Monaco GP circuit",
      "Three days of live Grand Prix action: Practice, Qualifying and Race Day",
      "Curated audience: athletes, entrepreneurs, media and cultural figures",
      "Gourmet canape buffet and open champagne bar throughout each day",
      "Media booth: podcasts, live sessions and interviews all weekend",
      "Professional content creation across all three days",
      "International audience from the US, Commonwealth and Europe",
    ],
    terraceTitle: "Terrace Packages",
    terraceSub: "Brand-led activations and product placements on the VIP Terraces. Three days on the Monaco Grand Prix circuit, in front of a curated audience.",
    terracePlacement: "Bronze",
    terraceActivation: "Silver",
    terracePresentation: "Gold",
    terraceTag1: "Available",
    terraceTag2: "Available",
    terraceTag3: "Available",
    terracePlacementItems: [
      "Brand logo on terrace signage throughout the weekend",
      "Product or literature display at the terrace welcome area",
      "Brand mention in pre-event and event-day communications",
      "1 guest pass (Saturday and Sunday)",
    ],
    terraceActivationItems: [
      "Dedicated brand activation table or display zone on the terrace",
      "Product showcase or sampling for all terrace guests",
      "Branded element included in photography and video coverage",
      "Social media feature across TGC and Pavilion channels",
      "3 guest passes (full weekend)",
    ],
    terracePresentationItems: [
      "Dedicated 15-minute product presentation slot to all terrace guests",
      "Full terrace branded for your session with signage and materials",
      "Professionally filmed and edited presentation",
      "4 guest passes (full weekend)",
      "Post-event editorial feature in The Concierge Chronicles",
      "Full media package delivered within 10 days of the event",
    ],
    tiersTitle: "Sponsorship Tiers",
    exclusive: "Exclusive",
    exclusiveTag: "1 available",
    exclusivePrice: "",
    exclusiveItems: [
      "Full brand ownership of The Pavilion Monaco 2026",
      "Naming rights: \"The Pavilion by [Brand]\"",
      "Total branding across terraces and all event materials",
      "Dedicated brand activation zone on the terraces",
      "15-20 guest passes (full weekend)",
      "Content ownership: all event photography and video",
      "First refusal on all future Pavilion editions",
    ],
    exclusiveNote:
      "If the Exclusive tier is signed, all other tiers are void.",
    platinum: "Platinum",
    platinumTag: "1 available",
    platinumPrice: "175,000",
    platinumItems: [
      "Primary branding across all terrace materials, signage and digital",
      "Branded welcome area at terrace entrance",
      "10 guest passes (full weekend)",
      "Dedicated product presentation or activation slot (Saturday)",
      "Welcome speech or hosted moment at chosen session",
      "Primary logo on The Pavilion brochure",
      "Full social media coverage and tagged content",
      "Priority introductions to all attendees",
    ],
    gold: "Gold",
    goldTag: "1 available",
    goldPrice: "125,000",
    goldItems: [
      "Secondary branding across terrace signage and digital",
      "Logo on brochure (second placement)",
      "Social media mentions and tagged content",
      "5 guest passes (full weekend)",
      "Branded element at one daytime session",
    ],
    bronze: "Terrace Partner",
    bronzeTag: "2 available",
    bronzePrice: "50,000",
    bronzeItems: [
      "Branded activation zone on the terrace for the full weekend",
      "Product display or sampling throughout all three days",
      "Logo on brochure and digital communications",
      "3 guest passes (full weekend)",
      "Social media coverage and tagged content",
    ],
    eveningTitle: "Private Dinner",
    eveningIntro:
      "Higher-tier sponsors have the option of a private dinner on the Friday or Saturday evening, hosted at a curated restaurant near the circuit. Table for 12 maximum. Relaxed, no speeches, no formality.",
    eveningFri: "Friday 5 June",
    eveningSat: "Saturday 6 June",
    eveningFriDesc: "Post-practice dinner. A quieter, more intimate evening — ideal for first conversations.",
    eveningSatDesc: "Post-qualifying dinner. The most sought-after evening of the weekend.",
    mediaTitle: "Media & Content",
    mediaIntro:
      "The primary media value is post-event. We capture content professionally across the weekend and deliver an editorial package your team can use. All content is editorial in tone, not advertorial.",
    mediaPreEvent: "Pre-Event",
    mediaDuring: "During the Event",
    mediaPostEvent: "Post-Event (main deliverable)",
    mediaPlatLabel: "Platinum",
    mediaGoldLabel: "Gold",
    mediaBronzeLabel: "Bronze / Terrace",
    mediaPlatPre: "Sponsor announcement post + 2 newsletter mentions woven into Pavilion editorial",
    mediaGoldPre: "1 newsletter mention at announcement",
    mediaBronzePre: "Newsletter mention at announcement",
    mediaPlatDuring: "Professional photography and video throughout all three days. Media booth available for podcasts, live sessions and interviews (formal and informal). Selective live coverage at team discretion.",
    mediaGoldDuring: "Professional photography across the weekend. Media booth available for informal interviews and live moments. Curated selection shared where appropriate.",
    mediaBronzeDuring: "Included in the event photography coverage. Media booth access for one session. Curated selection provided post-event.",
    mediaPlatPost: "3 editorial recap posts across TGC channels, dedicated feature in The Concierge Chronicles, full content package (50+ photos, edited video), media booth session published within 10 days, honest ROI summary.",
    mediaGoldPost: "2 editorial recap posts, Chronicles mention, curated photo selection (25+ images) delivered within 10 days.",
    mediaBronzePost: "Included in recap content, Chronicles mention, curated photo selection delivered within 14 days.",
    mediaNote: "All content is approved by your team before publication. One approval round, 48-hour turnaround.",
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
    enquire: "Enquire",
    tableNote: "Table for 12 max · Restaurant near the circuit",
    downloadPDF: "Download Sponsorship Pack (PDF)",
    thankYou: "Thank you",
    thankYouMsg: "We have received your enquiry and will be in touch shortly with full details.",
    close: "Close",
    sponsorTitle: "Sponsorship — The Pavilion",
  },
  fr: {
    presents: "The Gatekeepers Club presente",
    subtitle: "Grand Prix de Monaco 2026",
    dateLine: "5 - 7 juin 2026 . Monaco",
    sponsorship: "Sponsoring",
    headline: "Devenez partenaire de The Pavilion",
    intro:
      "The Pavilion reunit entrepreneurs, athletes et personnalites culturelles pendant trois jours sur les Terrasses VIP surplombant le circuit du Grand Prix de Monaco. Un sponsoring place votre marque au coeur de cette experience.",
    whyTitle: "Pourquoi The Pavilion",
    why: [
      "Terrasses VIP directement sur le circuit du GP de Monaco",
      "Trois jours en direct : Essais, Qualifications et Dimanche de course",
      "Invites tries sur le volet : athletes, entrepreneurs, medias et figures culturelles",
      "Buffet gastronomique de canapes et bar a champagne inclus chaque jour",
      "Creation de contenu professionnel sur les trois jours",
      "Audience internationale des Etats-Unis, du Commonwealth et d'Europe",
      "Edition inaugurale avec priorite sur les futures editions",
    ],
    terraceTitle: "Formules Terrasse",
    terraceSub: "Activations de marque et placements produit sur les Terrasses VIP. Trois jours sur le circuit du Grand Prix de Monaco, face a un public selectionne.",
    terracePlacement: "Bronze",
    terraceActivation: "Silver",
    terracePresentation: "Gold",
    terraceTag1: "Disponible",
    terraceTag2: "Disponible",
    terraceTag3: "Disponible",
    terracePlacementItems: [
      "Logo de marque sur la signaletique des terrasses tout le week-end",
      "Presentoir produit ou supports a l'espace d'accueil",
      "Mention de la marque dans les communications pre-evenement et jour J",
      "1 pass invite (samedi et dimanche)",
    ],
    terraceActivationItems: [
      "Table ou zone d'activation dediee sur les terrasses",
      "Showcase ou echantillonnage produit pour tous les invites",
      "Element de marque inclus dans la photo et video",
      "Feature reseaux sociaux sur les canaux TGC et Pavilion",
      "3 pass invites (week-end complet)",
    ],
    terracePresentationItems: [
      "Creneau de presentation produit de 15 minutes devant tous les invites",
      "Terrasses entierement brandees pour votre session",
      "Presentation filmee et montee professionnellement",
      "4 pass invites (week-end complet)",
      "Feature editorial post-evenement dans The Concierge Chronicles",
      "Package media complet livre sous 10 jours",
    ],
    tiersTitle: "Formules de Sponsoring",
    exclusive: "Exclusif",
    exclusiveTag: "1 disponible",
    exclusivePrice: "",
    exclusiveItems: [
      "Propriete totale de la marque The Pavilion Monaco 2026",
      "Droits de denomination : \"The Pavilion by [Marque]\"",
      "Branding integral sur terrasses et tous supports evenementiels",
      "Zone d'activation de marque dediee sur les terrasses",
      "15-20 pass invites (week-end complet)",
      "Propriete du contenu : photos et videos de l'evenement",
      "Priorite sur toutes les futures editions de The Pavilion",
    ],
    exclusiveNote:
      "Si le niveau Exclusif est signe, tous les autres niveaux sont annules.",
    platinum: "Platine",
    platinumTag: "1 disponible",
    platinumPrice: "175 000",
    platinumItems: [
      "Branding principal sur la signaletique des terrasses et digital",
      "Espace d'accueil de marque a l'entree des terrasses",
      "10 pass invites (week-end complet)",
      "Creneau de presentation produit ou activation (samedi)",
      "Prise de parole ou moment anime lors d'une session",
      "Logo principal sur la brochure The Pavilion",
      "Couverture complete sur les reseaux sociaux",
      "Introductions prioritaires aupres de tous les invites",
    ],
    gold: "Or",
    goldTag: "1 disponible",
    goldPrice: "125 000",
    goldItems: [
      "Branding secondaire sur la signaletique des terrasses et digital",
      "Logo sur brochure (deuxieme placement)",
      "Mentions et contenu tagge sur les reseaux sociaux",
      "5 pass invites (week-end complet)",
      "Element de marque lors d'une session de journee",
    ],
    bronze: "Partenaire Terrasse",
    bronzeTag: "2 disponibles",
    bronzePrice: "50 000",
    bronzeItems: [
      "Zone d'activation brandee sur les terrasses tout le week-end",
      "Exposition produit ou echantillonnage sur les trois jours",
      "Logo sur brochure et communications digitales",
      "3 pass invites (week-end complet)",
      "Couverture reseaux sociaux et contenu tagge",
    ],
    eveningTitle: "Diner Prive",
    eveningIntro:
      "Les sponsors de niveau superieur ont la possibilite d'organiser un diner prive le vendredi ou le samedi soir, dans un restaurant selectionne pres du circuit. Table de 12 personnes maximum. Decontracte, sans discours, sans formalite.",
    eveningFri: "Vendredi 5 juin",
    eveningSat: "Samedi 6 juin",
    eveningFriDesc: "Diner post-essais. Une soiree plus intime et tranquille, ideale pour les premieres conversations.",
    eveningSatDesc: "Diner post-qualifications. La soiree la plus recherchee du week-end.",
    mediaTitle: "Media & Contenu",
    mediaIntro:
      "La valeur media principale est post-evenement. Nous capturons le contenu professionnellement tout au long du week-end et livrons un package editorial que votre equipe peut utiliser. Le ton est editorial, jamais publicitaire.",
    mediaPreEvent: "Avant l'evenement",
    mediaDuring: "Pendant l'evenement",
    mediaPostEvent: "Apres l'evenement (livrable principal)",
    mediaPlatLabel: "Platine",
    mediaGoldLabel: "Or",
    mediaBronzeLabel: "Bronze / Terrasse",
    mediaPlatPre: "Post d'annonce sponsor + 2 mentions newsletter integrees au contenu editorial Pavilion",
    mediaGoldPre: "1 mention newsletter a l'annonce",
    mediaBronzePre: "Mention newsletter a l'annonce",
    mediaPlatDuring: "Photo et video professionnelles sur les trois jours. Media booth disponible pour podcasts, sessions live et interviews (formelles et informelles). Couverture live selective selon discretion de l'equipe.",
    mediaGoldDuring: "Photo professionnelle tout le week-end. Media booth disponible pour interviews informelles et moments live. Selection curee partagee selon pertinence.",
    mediaBronzeDuring: "Inclus dans la couverture photo de l'evenement. Acces media booth pour une session. Selection curee livree post-evenement.",
    mediaPlatPost: "3 posts recap editoriaux sur les canaux TGC, feature dediee dans The Concierge Chronicles, package contenu complet (50+ photos, video montee), moment de marque filme et livre sous 10 jours, bilan ROI candide.",
    mediaGoldPost: "2 posts recap editoriaux, mention Chronicles, selection photo (25+ images) livree sous 10 jours.",
    mediaBronzePost: "Inclus dans le contenu recap, mention Chronicles, selection photo curee livree sous 14 jours.",
    mediaNote: "Tout le contenu est approuve par votre equipe avant publication. Un tour d'approbation, delai de 48 heures.",
    ctaTitle: "Interesse ?",
    ctaText:
      "Pour recevoir le dossier de sponsoring complet ou discuter de la place de votre marque au sein de The Pavilion, contactez-nous directement.",
    ctaButton: "Nous contacter",
    ctaEmail: "christian@thegatekeepers.club",
    ctaPhone: "+33 7 73 77 90 71",
    perSponsor: "par sponsor",
    eur: "EUR",
    switchLang: "SV",
    backToEvent: "Retour a l'evenement",
    jointVenture: "Une co-production",
    enquire: "Nous contacter",
    tableNote: "Table de 12 personnes max · Restaurant pres du circuit",
    downloadPDF: "Telecharger le dossier de sponsoring (PDF)",
    thankYou: "Merci",
    thankYouMsg: "Nous avons bien recu votre demande et reviendrons vers vous dans les plus brefs delais.",
    close: "Fermer",
    sponsorTitle: "Sponsoring — The Pavilion",
  },
  sv: {
    presents: "The Gatekeepers Club presenterar",
    subtitle: "Monaco Grand Prix 2026",
    dateLine: "5 - 7 juni 2026 . Monaco",
    sponsorship: "Sponsring",
    headline: "Bli partner med The Pavilion",
    intro: "The Pavilion samlar entreprenaorer, atleter och kulturpersonligheter under tre dagar pa VIP-terrasser med utsikt over Monaco Grand Prix-banan. En sponsring placerar ditt varumarke i centrum av upplevelsen.",
    whyTitle: "Varfor The Pavilion",
    why: [
      "VIP-terrasser direkt pa Monaco GP-banan",
      "Tre dagar: ovning, kval och tavlingsdag",
      "Kuraterat sallskap: atleter, entreprenaorer, media och kulturprofiler",
      "Gourmet-canapebuffe och champagnebar hela dagen",
      "Professionell innehallsproduktion under tre dagar",
      "Internationell publik fran USA, Commonwealth och Europa",
      "Inledande upplaga med forsta alternativ pa framtida evenemang",
    ],
    terraceTitle: "Terrass-paket",
    terraceSub: "Varumarkesaktivering och produktplacering pa VIP-terrassen. Tre dagar pa Monaco Grand Prix-banan, infor en kuraterad publik.",
    terracePlacement: "Brons",
    terraceActivation: "Silver",
    terracePresentation: "Guld",
    terraceTag1: "Tillganglig",
    terraceTag2: "Tillganglig",
    terraceTag3: "Tillganglig",
    terracePlacementItems: [
      "Varumarkeslogga pa terrass-skyltning under hela helgen",
      "Produktexponering vid valkoms-omradet",
      "Varumarkesnamnande i kommunikation fore och under eventet",
      "1 gastpass (lordag och sondag)",
    ],
    terraceActivationItems: [
      "Dedikerat aktiverings-bord eller visningszon pa terrassen",
      "Produktvisning eller provning for alla gaster",
      "Varumarkesinnehall i foto- och videomaterial",
      "Sociala medie-exponering pa TGC- och Pavilion-kanaler",
      "3 gastpass (hela helgen)",
    ],
    terracePresentationItems: [
      "Dedikerat 15-minuters produktpresentationsslot for alla terrass-gaster",
      "Hela terrassen brandad for din session",
      "Professionellt filmad och redigerad presentation",
      "4 gastpass (hela helgen)",
      "Redaktionell feature post-event i The Concierge Chronicles",
      "Fullt mediapaket levererat inom 10 dagar",
    ],
    tiersTitle: "Sponsringsnivaar",
    exclusive: "Exklusiv",
    exclusiveTag: "1 tillganglig",
    exclusivePrice: "",
    exclusiveItems: [
      "Fullt varumarkesagande av The Pavilion Monaco 2026",
      "Namngivningsratt: \"The Pavilion by [Varumarke]\"",
      "Total branding pa terrasser och alla evenemangsmaterial",
      "Dedikerad varumarkesaktiverings-zon pa terrassen",
      "15-20 gastpass (hela helgen)",
      "Innehallsagande: all eventfoto och video",
      "Forsta alternativ pa alla framtida Pavilion-upplagor",
    ],
    exclusiveNote: "Om Exklusiv-nivan tecknas, annulleras alla andra navaer.",
    platinum: "Platina",
    platinumTag: "1 tillganglig",
    platinumPrice: "175,000",
    platinumItems: [
      "Primaar varumarkesbranding pa all terrass-skyltning och digitalt",
      "Brandad valkoms-yta vid terrass-entren",
      "10 gastpass (hela helgen)",
      "Dedikerat produktpresentationsslot eller aktivering (lordag)",
      "Valkoms-tal eller animerat ogonblick vid vald session",
      "Primaarlogga pa The Pavilion-broschyren",
      "Full sociala medie-bevakning och taggat innehall",
      "Prioriterade introduktioner till alla deltagare",
    ],
    gold: "Guld",
    goldTag: "1 tillganglig",
    goldPrice: "125,000",
    goldItems: [
      "Sekundar varumarkesbranding pa terrass-skyltning och digitalt",
      "Logga pa broschyr (andra placering)",
      "Sociala medie-namnanden och taggat innehall",
      "5 gastpass (hela helgen)",
      "Varumarkesinnehall vid en dagsession",
    ],
    bronze: "Terrass Partner",
    bronzeTag: "2 tillgangliga",
    bronzePrice: "50,000",
    bronzeItems: [
      "Brandad aktiverings-zon pa terrassen under hela helgen",
      "Produktvisning eller provning under alla tre dagar",
      "Logga pa broschyr och digital kommunikation",
      "3 gastpass (hela helgen)",
      "Sociala medie-bevakning och taggat innehall",
    ],
    eveningTitle: "Privat middag",
    eveningIntro: "Silver- och Guld-sponsorer har mojlighet till en privat middag pa fredags- eller lordagskvallen, pa en kuraterad restaurang nara banan. Max 12 personer. Avslappnat, inga tal, ingen formalia.",
    eveningFri: "Fredag 5 juni",
    eveningSat: "Lordag 6 juni",
    eveningFriDesc: "Middag efter ovningen. En lugnare, mer intim kvaell for forsta samtal.",
    eveningSatDesc: "Middag efter kvalet. Helgens mest eftertraktade kvaell.",
    mediaTitle: "Media & Innehall",
    mediaIntro: "Det primara mediavaardet ar post-event. Vi producerar innehall professionellt under helgen och levererar ett redaktionellt paket som ditt team kan anvanda.",
    mediaPreEvent: "Fore eventet",
    mediaDuring: "Under eventet",
    mediaPostEvent: "Post-event (huvudleverans)",
    mediaPlatLabel: "Platina",
    mediaGoldLabel: "Guld",
    mediaBronzeLabel: "Brons / Terrass",
    mediaPlatPre: "Sponsringsmeddelande + 2 nyhetsbrevsnamnanden",
    mediaGoldPre: "1 nyhetsbrevsnamnande",
    mediaBronzePre: "Nyhetsbrevsnamnande",
    mediaPlatDuring: "Professionell foto och video. Mediabas for poddar, live-sessioner och intervjuer.",
    mediaGoldDuring: "Professionell foto. Mediabas for intervjuer och live-stunder.",
    mediaBronzeDuring: "Inkluderad i eventfoto. Mediabas-access for en session.",
    mediaPlatPost: "3 redaktionella recap-inlagg, Chronicles-feature, 50+ foton + redigerad video, mediabas-session publicerad inom 10 dagar, ROI-sammanfattning.",
    mediaGoldPost: "2 recap-inlagg, Chronicles-namnande, 25+ foton inom 10 dagar.",
    mediaBronzePost: "Inkluderad i recap-innehall, Chronicles-namnande, kurerat fotourval inom 14 dagar.",
    mediaNote: "Allt innehall godkands av ditt team fore publicering. En godkannanderunda, 48-timmars svarstid.",
    ctaTitle: "Intresserad?",
    ctaText: "For hela sponsringsdossien eller for att diskutera hur ditt varumarke passar inom The Pavilion, kontakta oss direkt.",
    ctaButton: "Kontakta oss",
    ctaEmail: "christian@thegatekeepers.club",
    ctaPhone: "+33 7 73 77 90 71",
    perSponsor: "per sponsor",
    eur: "EUR",
    switchLang: "NL",
    backToEvent: "Tillbaka till eventet",
    jointVenture: "Ett samarbete",
    enquire: "Forfragan",
    tableNote: "Max 12 personer · Restaurang nara banan",
    downloadPDF: "Ladda ned sponsringspaket (PDF)",
    thankYou: "Tack",
    thankYouMsg: "Vi har mottagit din forfragan och aterkomme snart med fullstandig information.",
    close: "Stang",
    sponsorTitle: "Sponsring — The Pavilion",
  },
  nl: {
    presents: "The Gatekeepers Club presenteert",
    subtitle: "Monaco Grand Prix 2026",
    dateLine: "5 - 7 juni 2026 . Monaco",
    sponsorship: "Sponsoring",
    headline: "Word partner van The Pavilion",
    intro: "The Pavilion brengt ondernemers, atleten en culturele figuren samen voor drie dagen op de VIP-terrassen uitkijkend over het Monaco Grand Prix circuit. Een sponsoring plaatst uw merk in het middelpunt van deze ervaring.",
    whyTitle: "Waarom The Pavilion",
    why: [
      "VIP-terrassen direct op het Monaco GP circuit",
      "Drie dagen: training, kwalificatie en racedag",
      "Geselecteerd gezelschap: atleten, ondernemers, media en culturele figuren",
      "Gourmet canapebuffet en champagnebar de hele dag",
      "Professionele contentcreatie gedurende drie dagen",
      "Internationaal publiek uit de VS, Commonwealth en Europa",
      "Eerste editie met voorrangsrecht op toekomstige evenementen",
    ],
    terraceTitle: "Terraspakketten",
    terraceSub: "Merkactivaties en productplaatsingen op de VIP-terrassen. Drie dagen op het Monaco Grand Prix circuit, voor een geselecteerd publiek.",
    terracePlacement: "Brons",
    terraceActivation: "Zilver",
    terracePresentation: "Goud",
    terraceTag1: "Beschikbaar",
    terraceTag2: "Beschikbaar",
    terraceTag3: "Beschikbaar",
    terracePlacementItems: [
      "Merklogo op terrasnaambordjes tijdens het volledige weekend",
      "Product- of literatuurvertoon bij het welkomstgebied",
      "Merkvermeldingen in communicatie voor en tijdens het evenement",
      "1 gastenpass (zaterdag en zondag)",
    ],
    terraceActivationItems: [
      "Dedicated activatietafel of displayzone op het terras",
      "Productpresentatie of proeverij voor alle gasten",
      "Merkelement in foto- en videocoverage",
      "Social media feature op TGC- en Pavilion-kanalen",
      "3 gastenpassen (volledig weekend)",
    ],
    terracePresentationItems: [
      "Dedicated 15-minuten productpresentatieslot voor alle terrasgangers",
      "Volledig gemerkt terras voor uw sessie",
      "Professioneel gefilmde en gemonteerde presentatie",
      "4 gastenpassen (volledig weekend)",
      "Redactionele feature na het evenement in The Concierge Chronicles",
      "Volledig mediapakket geleverd binnen 10 dagen",
    ],
    tiersTitle: "Sponsorpakketten",
    exclusive: "Exclusief",
    exclusiveTag: "1 beschikbaar",
    exclusivePrice: "",
    exclusiveItems: [
      "Volledig merkeigendom van The Pavilion Monaco 2026",
      "Naamgevingsrechten: \"The Pavilion by [Merk]\"",
      "Totale branding op terrassen en alle evenementmaterialen",
      "Dedicated merkactivatiezone op de terrassen",
      "15-20 gastenpassen (volledig weekend)",
      "Contenteigendom: alle eventfotografie en video",
      "Voorrangsrecht op alle toekomstige Pavilion-edities",
    ],
    exclusiveNote: "Als het Exclusieve niveau wordt getekend, vervallen alle andere niveaus.",
    platinum: "Platina",
    platinumTag: "1 beschikbaar",
    platinumPrice: "175,000",
    platinumItems: [
      "Primaire merkbranding op alle terrasnaambordjes en digitaal",
      "Gemerkt welkomstgebied bij terrasingang",
      "10 gastenpassen (volledig weekend)",
      "Dedicated productpresentatieslot of activatie (zaterdag)",
      "Welkomsttoespraak of geanimeerd moment bij gekozen sessie",
      "Primair logo op The Pavilion brochure",
      "Volledige social media coverage en getagde content",
      "Prioriteitsintroducties aan alle aanwezigen",
    ],
    gold: "Goud",
    goldTag: "1 beschikbaar",
    goldPrice: "125,000",
    goldItems: [
      "Secundaire merkbranding op terrasnaambordjes en digitaal",
      "Logo op brochure (tweede plaatsing)",
      "Social media vermeldingen en getagde content",
      "5 gastenpassen (volledig weekend)",
      "Merkelement bij een dagsessie",
    ],
    bronze: "Terraspartner",
    bronzeTag: "2 beschikbaar",
    bronzePrice: "50,000",
    bronzeItems: [
      "Gemerkte activatiezone op het terras voor het volledige weekend",
      "Productdisplay of proeverij gedurende alle drie dagen",
      "Logo op brochure en digitale communicaties",
      "3 gastenpassen (volledig weekend)",
      "Social media coverage en getagde content",
    ],
    eveningTitle: "Privatediner",
    eveningIntro: "Zilver- en Goud-sponsors hebben de optie van een privatediner op de vrijdag- of zaterdagavond, georganiseerd in een geselecteerd restaurant nabij het circuit. Tafel voor maximaal 12 personen. Ontspannen, geen speeches, geen formaliteit.",
    eveningFri: "Vrijdag 5 juni",
    eveningSat: "Zaterdag 6 juni",
    eveningFriDesc: "Diner na de training. Een rustigere, intiemere avond voor eerste gesprekken.",
    eveningSatDesc: "Diner na de kwalificatie. De meest gevraagde avond van het weekend.",
    mediaTitle: "Media & Content",
    mediaIntro: "De primaire mediawaarde is post-evenement. Wij leggen content professioneel vast tijdens het weekend en leveren een redactioneel pakket dat uw team kan gebruiken.",
    mediaPreEvent: "Voor het evenement",
    mediaDuring: "Tijdens het evenement",
    mediaPostEvent: "Na het evenement (hoofdlevering)",
    mediaPlatLabel: "Platina",
    mediaGoldLabel: "Goud",
    mediaBronzeLabel: "Brons / Terras",
    mediaPlatPre: "Sponsoraankondiging + 2 nieuwsbriefvermeldingen",
    mediaGoldPre: "1 nieuwsbriefvermelding bij aankondiging",
    mediaBronzePre: "Nieuwsbriefvermelding bij aankondiging",
    mediaPlatDuring: "Professionele foto en video gedurende drie dagen. Mediabooth voor podcasts, live-sessies en interviews.",
    mediaGoldDuring: "Professionele foto het hele weekend. Mediabooth voor interviews en live-momenten.",
    mediaBronzeDuring: "Opgenomen in eventfotografie. Mediabooth-toegang voor een sessie.",
    mediaPlatPost: "3 redactionele recap-posts, Chronicles-feature, 50+ fotos + gemonteerde video, mediabooth-sessie gepubliceerd binnen 10 dagen, ROI-samenvatting.",
    mediaGoldPost: "2 recap-posts, Chronicles-vermelding, 25+ fotos binnen 10 dagen.",
    mediaBronzePost: "Opgenomen in recap-content, Chronicles-vermelding, gecureerde fotoselectie binnen 14 dagen.",
    mediaNote: "Alle content wordt goedgekeurd door uw team voor publicatie. Een goedkeuringsronde, 48-uur responstijd.",
    ctaTitle: "Geinteresseerd?",
    ctaText: "Voor het volledige sponsordossier of om te bespreken hoe uw merk past binnen The Pavilion, neem direct contact met ons op.",
    ctaButton: "Neem contact op",
    ctaEmail: "christian@thegatekeepers.club",
    ctaPhone: "+33 7 73 77 90 71",
    perSponsor: "per sponsor",
    eur: "EUR",
    switchLang: "EN",
    backToEvent: "Terug naar het evenement",
    jointVenture: "Een samenwerking",
    enquire: "Informeren",
    tableNote: "Tafel voor 12 max · Restaurant nabij het circuit",
    downloadPDF: "Download sponsorpakket (PDF)",
    thankYou: "Dank u",
    thankYouMsg: "Wij hebben uw aanvraag ontvangen en nemen spoedig contact op met volledige informatie.",
    close: "Sluiten",
    sponsorTitle: "Sponsoring — The Pavilion",
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
  const langParam = searchParams.get("lang") as Lang | null;
  const lang: Lang = (["en", "fr", "sv", "nl"] as const).includes(langParam as Lang) ? langParam as Lang : "en";
  const t = T[lang];

  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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

  function setLang(l: Lang) {
    const p = new URLSearchParams(searchParams.toString());
    if (l === "en") p.delete("lang"); else p.set("lang", l);
    const qs = p.toString();
    router.push(`/event/${slug}/sponsorship${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="min-h-screen bg-pearl">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50 flex bg-white/90 backdrop-blur-sm border border-green/20 rounded-full shadow-sm overflow-hidden">
        {(["en", "fr", "sv", "nl"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1.5 text-xs font-body font-medium transition-colors ${lang === l ? "bg-green text-white" : "text-green hover:bg-green/5"}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

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
            href={`/event/${slug}${lang !== "en" ? `?lang=${lang}` : ""}`}
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

      {/* Terrace Packages — €10k–€50k */}
      <section className="bg-white border-y border-green/10">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-3">
            {t.terraceTitle}
          </p>
          <p className="text-sm text-gray-600 font-body mb-10 max-w-2xl">
            {t.terraceSub}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Placement — €10k */}
            <div className="border border-green/15 rounded-lg p-6 flex flex-col bg-pearl">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <h3 className="text-base font-heading font-semibold text-green">{t.terracePlacement}</h3>
                <span className="text-[9px] tracking-[1px] uppercase font-body px-2 py-0.5 rounded-full bg-green/10 text-green">{t.terraceTag1}</span>
              </div>
              <p className="text-2xl font-heading font-semibold text-green mb-1">EUR 10,000</p>
              <p className="text-xs text-gray-400 font-body mb-4">{t.perSponsor}</p>
              <ul className="space-y-2 flex-1">
                {t.terracePlacementItems.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 font-body">
                    <span className="text-gold mt-0.5 shrink-0">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => setSelectedTier(t.terracePlacement)} className="mt-5 w-full bg-green text-white py-2.5 rounded-md text-xs font-body tracking-wide hover:bg-green-light transition-colors">
                {t.enquire}
              </button>
            </div>

            {/* Activation — €25k */}
            <div className="border-2 border-gold/60 rounded-lg p-6 flex flex-col bg-gradient-to-b from-gold/5 to-transparent">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <h3 className="text-base font-heading font-semibold text-green">{t.terraceActivation}</h3>
                <span className="text-[9px] tracking-[1px] uppercase font-body px-2 py-0.5 rounded-full bg-gold text-white">{t.terraceTag2}</span>
              </div>
              <p className="text-2xl font-heading font-semibold text-green mb-1">EUR 25,000</p>
              <p className="text-xs text-gray-400 font-body mb-4">{t.perSponsor}</p>
              <ul className="space-y-2 flex-1">
                {t.terraceActivationItems.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 font-body">
                    <span className="text-gold mt-0.5 shrink-0">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => setSelectedTier(t.terraceActivation)} className="mt-5 w-full bg-gold text-white py-2.5 rounded-md text-xs font-body tracking-wide hover:bg-gold/90 transition-colors">
                {t.enquire}
              </button>
            </div>

            {/* Presentation — €50k */}
            <div className="border border-green/15 rounded-lg p-6 flex flex-col bg-pearl">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <h3 className="text-base font-heading font-semibold text-green">{t.terracePresentation}</h3>
                <span className="text-[9px] tracking-[1px] uppercase font-body px-2 py-0.5 rounded-full bg-green/10 text-green">{t.terraceTag3}</span>
              </div>
              <p className="text-2xl font-heading font-semibold text-green mb-1">EUR 50,000</p>
              <p className="text-xs text-gray-400 font-body mb-4">{t.perSponsor}</p>
              <ul className="space-y-2 flex-1">
                {t.terracePresentationItems.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 font-body">
                    <span className="text-gold mt-0.5 shrink-0">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => setSelectedTier(t.terracePresentation)} className="mt-5 w-full bg-green text-white py-2.5 rounded-md text-xs font-body tracking-wide hover:bg-green-light transition-colors">
                {t.enquire}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Private Dinner */}
      <section className="bg-green">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">
            {t.eveningTitle}
          </p>
          <p className="text-sm text-white/70 font-body mb-8 max-w-2xl">
            {t.eveningIntro}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {[
              { day: t.eveningFri, desc: t.eveningFriDesc },
              { day: t.eveningSat, desc: t.eveningSatDesc },
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
                  {t.tableNote}
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

      {/* Download */}
      <section className="max-w-3xl mx-auto px-6 pt-12 pb-4 text-center">
        <a
          href="https://vxmrvnmtauqqqjikhjbh.supabase.co/storage/v1/object/public/project-documents/7593a2ec-c2c2-4813-ba12-9f0372d37780/The_Pavilion_Sponsorship_2026.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 border border-green/20 rounded-md text-sm font-body text-green hover:bg-green/5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {t.downloadPDF}
        </a>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-4">
          {t.ctaTitle}
        </p>
        <p className="text-base text-gray-700 font-body leading-relaxed mb-8 max-w-xl mx-auto">
          {t.ctaText}
        </p>
        <button
          onClick={() => setSelectedTier(t.sponsorTitle)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green text-white rounded font-body text-sm hover:bg-green/90 transition-colors"
        >
          {t.ctaButton}
        </button>
      </section>

      {/* Sponsorship Lead Capture Modal */}
      {selectedTier && !showSuccess && (
        <SponsorshipLeadModal
          tierName={selectedTier}
          eventSlug={slug}
          lang={lang}
          onClose={() => setSelectedTier(null)}
          onSuccess={() => {
            setSelectedTier(null);
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
            <button
              onClick={() => setShowSuccess(false)}
              className="text-xs text-gray-400 font-body hover:text-gray-600"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

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
