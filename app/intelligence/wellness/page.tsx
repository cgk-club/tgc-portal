'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { ChevronLeft, RotateCcw } from 'lucide-react'

// ── TGC WELLNESS INTELLIGENCE · v3 ───────────────────────────────────────────
// Six philosophies · eighteen clinics · Wellness Compass + Annual Architecture
// TGC Active: Lanserhof Sylt, Lanserhof Tegernsee, Clinique Nescens, Santé Wellness
// v3: Added Landscapist philosophy (environmental / architectural restoration)

// ── TYPES ─────────────────────────────────────────────────────────────────────

type Condition = 'performing' | 'functional' | 'depleted' | 'recovering' | 'curious'
type Priority  = 'medical' | 'longevity' | 'environment' | 'results' | 'rest'
type TravelCtx = 'solo' | 'partner' | 'embedded' | 'flexible'
type Duration  = 'weekend' | 'week' | 'extended' | 'flexible'
type Region    = 'alpine-swiss' | 'europe-north' | 'europe-med' | 'africa' | 'asia' | 'open'
type Philosophy = 'clinician' | 'scientist' | 'purifier' | 'immersionist' | 'restorer' | 'landscapist'
type Screen    = 'welcome' | 'compass' | 'philosophy' | 'clinics' | 'arch' | 'arch-result' | 'submitted'

interface CompassAnswers {
  condition: Condition | null
  priority:  Priority  | null
  context:   TravelCtx | null
  duration:  Duration  | null
  region:    Region    | null
}

interface ArchAnswers {
  stays:  '1' | '2' | '3plus' | null
  intent: 'reset' | 'optimise' | 'both' | null
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'flexible' | null
  budget: 'under-15k' | '15-40k' | '40-100k' | 'open' | null
}

interface ClientDetails {
  firstName: string; lastName: string; email: string; phone: string; targetMonth: string; message: string
}

// ── PHILOSOPHIES ──────────────────────────────────────────────────────────────

const PHILOSOPHIES: Record<Philosophy, {
  name: string; tagline: string; description: string; notThis: string; accent: string
}> = {
  clinician: {
    name: 'The Clinician',
    tagline: 'Medicine first, rest second.',
    description: 'You want a physician\'s opinion before a massage. The programme is diagnostics, protocols, and measurable outcomes. You leave with a report, a plan, and numbers that mean something. The setting is secondary to the science.',
    notThis: 'Not a spa that added a doctor. The agenda is medical — the rest is support.',
    accent: '#0e4f51',
  },
  scientist: {
    name: 'The Scientist',
    tagline: 'Longevity, not leisure.',
    description: 'You want to understand your biological age and do something about it. Biomarker mapping, cellular diagnostics, regenerative medicine. The science is the experience — and the results compound year on year.',
    notThis: 'Not a detox. Not a retreat. Intervention-grade cellular science involves procedures, not treatments. Some programmes require minor clinical procedures.',
    accent: '#1a3a5c',
  },
  purifier: {
    name: 'The Purifier',
    tagline: 'Elimination over addition.',
    description: 'You want to reset through discipline, not comfort. Fasting, elimination, structural dietary change. The protocol is the point. Three days in, the physiology shifts — and the clarity is real.',
    notThis: 'Not a juice cleanse. Medical fasting is supervised, restrictive, and physiologically serious. Expect hunger for the first three days.',
    accent: '#2a4a2a',
  },
  immersionist: {
    name: 'The Immersionist',
    tagline: 'The environment does the work.',
    description: 'You want landscape, stillness, and a pace you cannot manufacture at home. The setting is integral, not decorative. Cape Winelands, jungle, mountain. Nature-led programmes with genuine wellness depth.',
    notThis: 'Not clinical. There are no lab coats here. The healing comes from slowing down in an environment that demands it.',
    accent: '#3a2d1a',
  },
  restorer: {
    name: 'The Restorer',
    tagline: 'Wellness as part of a broader stay.',
    description: 'Not a dedicated retreat — a property that takes care of you properly. Outstanding spa, restorative food, considered pace. Wellness integrated into a hotel experience rather than isolated from it.',
    notThis: 'Not a medical programme. No protocols, no restrictions. This is restorative hospitality — a hotel that genuinely understands recovery.',
    accent: '#4a3a1a',
  },
  landscapist: {
    name: 'The Landscapist',
    tagline: 'The place does what no programme can.',
    description: 'You need to stop — but you do not need a protocol to do it. The right architecture, at the right altitude, with the right materials and the right pace, is the medicine. Eriro\'s hand-carved bathtubs from the founders\' own timber. Forestis at 1,800 metres in a converted 1912 sanatorium. Reschio\'s 1,500 acres of Umbrian estate. These places are designed — every stone, every window — to restore without instruction.',
    notThis: 'Not a hotel with a spa. Not wellness as an amenity. These are purpose-built environments where the architecture and landscape are the entire therapeutic proposition. There are no doctors here, and no need for any.',
    accent: '#1a3a2a',
  },
}

// ── CLINIC DATA ───────────────────────────────────────────────────────────────

interface Clinic {
  id: string; name: string; location: string; region: string
  philosophies: Philosophy[]; conditions: Condition[]
  minNights: number; priceFrom: string; tgcActive?: boolean
  summary: string; brochureRealities: string[]
  loudQuiet?: { loud: string; quiet: string }
  programmes?: { name: string; duration: string; price: string }[]
  seasons: string; bestFor: string
}

const CLINICS: Clinic[] = [
  // ── TGC ACTIVE ──────────────────────────────────────────────────────────────
  {
    id: 'lanserhof-sylt',
    name: 'Lanserhof Sylt',
    location: 'List, Sylt, Germany',
    region: 'europe-north',
    philosophies: ['clinician', 'purifier'],
    conditions: ['depleted', 'functional', 'performing'],
    minNights: 5,
    priceFrom: 'from €650/night',
    tgcActive: true,
    summary: 'The North Sea campus of Germany\'s leading medical wellness clinic. LANS Med Concept: full diagnostics, Mayr elimination medicine, and performance optimisation. The 5-night minimum and the island setting are features of the programme, not incidental.',
    brochureRealities: [
      'Minimum 5 nights — shorter stays cannot begin the programme properly',
      'No alcohol. The Mayr elimination diet is restrictive from day one.',
      'Sylt in summer is peak German UHNW — the island is social, busy, well-covered in media',
      'Island access by train across the causeway or small aircraft (GWT) adds a half-day each direction',
    ],
    loudQuiet: {
      loud: 'Sylt in summer is the Hamptons of Germany — social, visible, and expensive',
      quiet: 'Lanserhof Tegernsee (Bavaria) is quieter and more monastic — the right choice for clients who want no distraction',
    },
    programmes: [
      { name: 'LANS Med Cure', duration: '7 nights', price: '€6,500–9,800' },
      { name: 'Advanced Diagnostics', duration: '5 nights', price: '€5,000–8,500' },
      { name: 'Performance & Longevity', duration: '10–14 nights', price: '€10,000–18,000' },
    ],
    seasons: 'Spring · Summer · Autumn',
    bestFor: 'Burnout recovery, deep diagnostics, medical fasting',
  },
  {
    id: 'lanserhof-tegernsee',
    name: 'Lanserhof Tegernsee',
    location: 'Tegernsee, Bavaria, Germany',
    region: 'europe-north',
    philosophies: ['clinician', 'purifier'],
    conditions: ['depleted', 'functional', 'performing'],
    minNights: 5,
    priceFrom: 'from €600/night',
    tgcActive: true,
    summary: 'The founding Lanserhof site in Alpine Bavaria. Same LANS Med Concept as Sylt — quieter, more focused. An hour from Munich airport, the simplest of the Lanserhof properties to reach. The Alpine lake setting is more restorative in winter and spring.',
    brochureRealities: [
      'Same medical rigour as Sylt; fewer social distractions — the right choice for clients who mean business',
      'Book 6–8 weeks ahead for autumn and winter: the most popular period',
      'Snow in winter means the outdoor programme is weather-dependent',
    ],
    loudQuiet: {
      loud: 'Lanserhof Sylt is the more socially visible and media-covered property',
      quiet: 'Tegernsee is the monastery — same medicine, no noise',
    },
    programmes: [
      { name: 'LANS Med Cure', duration: '7 nights', price: '€5,500–9,000' },
      { name: 'MPURE Fasting', duration: '5–10 nights', price: '€4,200–7,500' },
    ],
    seasons: 'Winter · Spring · Autumn',
    bestFor: 'Winter or spring reset, alpine setting, medical fasting',
  },
  {
    id: 'nescens',
    name: 'Clinique Nescens — Genolier',
    location: 'Genolier, Switzerland · 30 min from Geneva',
    region: 'alpine-swiss',
    philosophies: ['scientist', 'clinician'],
    conditions: ['performing', 'functional', 'curious'],
    minNights: 0,
    priceFrom: 'from CHF 650',
    tgcActive: true,
    summary: 'Swiss anti-aging science on the Genolier campus (Swiss Medical Network). From a half-day Recovery protocol (CHF 650) to the 11-day Elixir Stem Cell Journey. Founded by Prof. Jacques Proust, pioneer in ageing biology. The ORIGIN programme cryopreserves your stem cells for up to 30 years.',
    brochureRealities: [
      'The Elixir programmes involve clinical procedures — adipose tissue harvesting under local anaesthetic. Not a spa treatment.',
      'ORIGIN cryopreservation is optimal before 50 — the earlier the harvest, the more potent the future reserve',
      'The ULTIMATE programme (11 days) includes accommodation at La Réserve Geneva — the most private 5-star hotel in the city',
      'The Excellence check-up (CHF 12,850) includes cerebral angio-MRI — rarely available at this access level',
    ],
    loudQuiet: {
      loud: 'Clinique La Prairie (Montreux) is the better-known Swiss longevity name — 85 years of heritage, highest prices',
      quiet: 'Nescens is scientifically ahead in cellular medicine and significantly less expensive than CLP for comparable diagnostic depth',
    },
    programmes: [
      { name: 'Recovery', duration: '½ day', price: 'CHF 650' },
      { name: 'Check-Up Essential', duration: '1 day', price: 'CHF 4,250' },
      { name: 'Check-Up Advanced', duration: '1 day', price: 'CHF 6,950' },
      { name: 'Check-Up Excellence', duration: '1 day', price: 'CHF 12,850' },
      { name: 'Longevity', duration: '3 nights', price: 'from CHF 3,000' },
      { name: 'Functional Medicine Cure', duration: '7 days', price: 'from CHF 5,300' },
      { name: 'Elixir ORIGIN', duration: '2 days / 1 night', price: 'on enquiry' },
      { name: 'Elixir ULTIMATE', duration: '11 days / 10 nights', price: 'on enquiry' },
    ],
    seasons: 'All year',
    bestFor: 'Longevity diagnostics, cellular science, Geneva stopover',
  },
  {
    id: 'sante-wellness',
    name: 'Santé Wellness Retreat & Spa',
    location: 'Franschhoek Valley, Western Cape, South Africa',
    region: 'africa',
    philosophies: ['immersionist'],
    conditions: ['depleted', 'functional', 'curious'],
    minNights: 3,
    priceFrom: 'on enquiry',
    tgcActive: true,
    summary: 'Boutique wellness retreat in the Cape Winelands. 17 rooms and a private villa, surrounded by vineyards and the Franschhoek mountains. High-technology wellness programmes built around a strictly gluten-free, dairy-free, sugar-free kitchen — the food protocol is the foundation, not an option.',
    brochureRealities: [
      'The food protocol is non-negotiable throughout the stay — no gluten, dairy, or sugar',
      'Franschhoek is 75 minutes from Cape Town International — plan transfers carefully',
      'South African winters (June–August) are dry and mild: the optimal season. Avoid December and January.',
      'Babylonstoren\'s farm spa is 15 minutes away — a natural pairing for a longer Cape Winelands stay',
    ],
    loudQuiet: {
      loud: 'Franschhoek is a known food-and-wine destination; the village can be busy in high season',
      quiet: 'The retreat is removed from the village — the Winelands setting works in every season',
    },
    programmes: [
      { name: 'Wellness Programme', duration: '3–7 days', price: 'on enquiry' },
    ],
    seasons: 'Winter · Spring · Autumn (Southern Hemisphere)',
    bestFor: 'Cape Winelands, nature immersion, food-forward wellness',
  },
  // ── NON-TGC-ACTIVE ──────────────────────────────────────────────────────────
  {
    id: 'buchinger-wilhelmi',
    name: 'Buchinger Wilhelmi',
    location: 'Lake Constance, Germany',
    region: 'europe-north',
    philosophies: ['purifier'],
    conditions: ['depleted', 'functional'],
    minNights: 7,
    priceFrom: 'from €320/night',
    summary: 'The world\'s most documented therapeutic fasting clinic, founded 1920. Medical fasting as a complete protocol. The Buchinger family still runs it — it has not been sold to a hotel group. Over 100 years of outcome data.',
    brochureRealities: [
      'No solid food for the programme duration. Clients who do not know this in advance leave early.',
      'Hunger is physiological for the first 3 days — normal and expected',
      'Contraindicated for several cardiac conditions and eating histories — medical pre-screening required',
      'Lake Constance (Überlingen) and Marbella: same protocol, two climates',
    ],
    loudQuiet: {
      loud: 'SHA is the social, well-known European detox clinic',
      quiet: 'Buchinger delivers comparable reset outcomes at 30–40% of SHA\'s price, with 100 years more outcome data',
    },
    seasons: 'Spring · Autumn',
    bestFor: 'Disciplined metabolic reset, maximum fasting rigour, results over comfort',
  },
  {
    id: 'sha-wellness',
    name: 'SHA Wellness Clinic',
    location: 'Alicante, Spain',
    region: 'europe-med',
    philosophies: ['clinician'],
    conditions: ['depleted', 'functional', 'performing'],
    minNights: 7,
    priceFrom: 'from €450/night',
    summary: 'Europe\'s most visible integrative wellness clinic. SHA Method: macrobiotic nutrition, naturopathy, TCM, advanced diagnostics. Mediterranean setting above Altea. The food programme is strict and the results are real — but SHA cannot fully replicate Lanserhof\'s diagnostic depth at similar pricing.',
    brochureRealities: [
      'The macrobiotic food programme is strict and unfamiliar for most European clients from day one',
      'The social atmosphere is high — you will encounter and hear about other guests\' programmes',
      'SHA cannot fully replicate Lanserhof\'s diagnostic depth despite similar positioning and pricing',
      'Book 6–12 months ahead for peak season',
    ],
    loudQuiet: {
      loud: 'SHA is the best-known European wellness clinic — heavily covered in lifestyle media',
      quiet: 'Buchinger delivers comparable reset outcomes at 30–40% of SHA\'s price',
    },
    programmes: [
      { name: 'SHA Optimal Health', duration: '7 nights', price: '€5,500–8,000' },
      { name: 'SHA Emotional Wellbeing', duration: '10 nights', price: '€8,000–12,000' },
      { name: 'SHA Healthy Ageing', duration: '14–28 nights', price: '€14,000–32,000' },
    ],
    seasons: 'All year',
    bestFor: 'Mediterranean clinical reset, macrobiotic nutrition, emotional wellbeing',
  },
  {
    id: 'clinique-la-prairie',
    name: 'Clinique La Prairie',
    location: 'Montreux, Switzerland',
    region: 'alpine-swiss',
    philosophies: ['scientist'],
    conditions: ['performing', 'functional'],
    minNights: 4,
    priceFrom: 'from CHF 1,500/night',
    summary: 'The original Swiss longevity clinic, founded 1931 on Lake Geneva. Cell therapy and longevity diagnostics refined over 85 years. The most recognised name in Swiss medical wellness — and priced accordingly.',
    brochureRealities: [
      'CLP prices reflect 85 years of brand heritage as much as the science — Nescens is scientifically ahead in cellular medicine at lower cost',
      'The atmosphere is genuinely clinical, not spa-like',
      'The Health Longevity programme requires minimum 4 days to deliver real value',
      'Spring and autumn are 15–20% cheaper and quieter than summer',
    ],
    loudQuiet: {
      loud: 'CLP is the most famous longevity clinic — highest prices, highest name recognition in Switzerland',
      quiet: 'Nescens (30 min from Geneva) is more cutting-edge in cellular medicine and significantly less expensive',
    },
    programmes: [
      { name: 'Health Longevity', duration: '7 nights', price: 'CHF 28,000–45,000' },
      { name: 'Prevention & Diagnostics', duration: '4 nights', price: 'CHF 12,000–20,000' },
    ],
    seasons: 'Spring · Summer · Autumn',
    bestFor: 'Legacy longevity prestige, Lake Geneva, established cellular medicine',
  },
  {
    id: 'viva-mayr',
    name: 'Viva Mayr',
    location: 'Maria Wörth, Austria',
    region: 'europe-north',
    philosophies: ['purifier', 'clinician'],
    conditions: ['depleted', 'functional'],
    minNights: 7,
    priceFrom: 'from €450/night',
    summary: 'The elegant answer for gut health and reset without Lanserhof\'s medical intensity or Buchinger\'s austerity. Lake Wörth in Carinthia. Less well-known than SHA, which is part of its value.',
    brochureRealities: [
      'The Mayr diet is strict — slow chewing, minimal food, digestive focus throughout',
      'Fly to Klagenfurt (KLU) or Ljubljana (LJU), 45–60 min by car',
      'Autumn is the best combination of weather and fewer guests',
    ],
    seasons: 'Spring · Summer · Autumn',
    bestFor: 'Gut health, Mayr medicine, accessible European detox',
  },
  {
    id: 'chiva-som',
    name: 'Chiva-Som',
    location: 'Hua Hin, Thailand',
    region: 'asia',
    philosophies: ['immersionist', 'clinician'],
    conditions: ['performing', 'functional', 'curious'],
    minNights: 3,
    priceFrom: 'from €600/night',
    summary: 'Asia\'s most complete wellness resort, 3 hours from Bangkok. Clinical assessments, longevity programming, and exceptional therapies in a coastal garden setting. Hua Hin is quieter than Phuket or Koh Samui.',
    brochureRealities: [
      'The longevity programming is the genuine strength — the beach setting is secondary',
      'High season December–March books months ahead',
      'Travel from Europe: 11h to Bangkok, then 2.5h by road or 50 min by helicopter',
    ],
    seasons: 'Winter · Spring · Autumn',
    bestFor: 'Asian longevity resort, multi-week commitment',
  },
  {
    id: 'kamalaya',
    name: 'Kamalaya',
    location: 'Koh Samui, Thailand',
    region: 'asia',
    philosophies: ['immersionist'],
    conditions: ['depleted', 'curious'],
    minNights: 5,
    priceFrom: 'from €350/night',
    summary: 'Built around a Buddhist monk\'s cave on Koh Samui. Eastern and Western healing with a genuine focus on burnout and emotional recovery. The hillside jungle setting is the most immersive on this list.',
    brochureRealities: [
      'Emotional wellbeing is the genuine strength — not the physical treatments',
      'Koh Samui requires a Bangkok connection — add a half-day each way',
      'Avoid monsoon season (October–December)',
    ],
    seasons: 'Winter · Spring',
    bestFor: 'Burnout, emotional reset, jungle immersion',
  },
  {
    id: 'babylonstoren',
    name: 'Babylonstoren',
    location: 'Franschhoek Valley, Western Cape, South Africa',
    region: 'africa',
    philosophies: ['restorer'],
    conditions: ['curious', 'functional'],
    minNights: 2,
    priceFrom: 'from €600/night',
    summary: 'A 200-hectare farm estate in the Cape Winelands. The spa uses ingredients harvested from the farm\'s medicinal garden each morning. Restorative hospitality at its best — not a medical programme.',
    brochureRealities: [
      'Restorative hospitality, not clinical wellness — manage expectations accordingly',
      'Pairs naturally with a Santé Wellness stay, 15 minutes away in Franschhoek',
      'The farm tours and cooking school are as restorative as the spa treatments',
    ],
    seasons: 'All year',
    bestFor: 'Cape Winelands restoration, farm-and-spa stay',
  },
  {
    id: 'six-senses-douro',
    name: 'Six Senses Douro Valley',
    location: 'Douro Valley, Portugal',
    region: 'europe-med',
    philosophies: ['restorer', 'immersionist'],
    conditions: ['functional', 'curious'],
    minNights: 3,
    priceFrom: 'from €450/night',
    summary: 'Converted quinta in UNESCO wine country, 1.5h from Porto. The Sleep programme is the strongest in the Six Senses European portfolio. The wine country context is the obvious irony for a wellness retreat.',
    brochureRealities: [
      'Request the Sleep programme by name — it is the genuine differentiator',
      'Summer is hot, expensive, and busy — spring and autumn are significantly better',
      'Less medically oriented than Lanserhof or SHA — restorative wellness, not clinical',
    ],
    seasons: 'Spring · Autumn',
    bestFor: 'Sleep programme, Douro Valley, accessible European restoration',
  },
  {
    id: 'como-shambhala',
    name: 'COMO Shambhala Estate',
    location: 'Ubud, Bali',
    region: 'asia',
    philosophies: ['immersionist'],
    conditions: ['functional', 'curious', 'recovering'],
    minNights: 5,
    priceFrom: 'from €700/night',
    summary: 'Jungle above the Ayung River in Ubud. Yoga, movement, and Ayurvedic-influenced wellness. The most private long-haul immersion on this list — genuinely separate from tourist Bali.',
    brochureRealities: [
      'Movement and yoga instruction is the differentiator — medical capability is supportive, not primary',
      'Bali from Europe: 14–16h with at least one connection',
      'Wet season November–March is intense — plan accordingly',
    ],
    seasons: 'Spring · Summer · Autumn',
    bestFor: 'Yoga and movement, Bali jungle immersion',
  },
  // ── LANDSCAPIST ─────────────────────────────────────────────────────────────
  {
    id: 'eriro',
    name: 'Eriro Alpine Hide',
    location: 'Ehrwalder Alm, Tyrol, Austria · 1,550m',
    region: 'europe-north',
    philosophies: ['landscapist'],
    conditions: ['depleted', 'functional', 'curious'],
    minNights: 3,
    priceFrom: 'all-inclusive',
    summary: 'The benchmark. Nine suites at 1,550 metres on the Ehrwalder Alm, accessible only by gondola. Opened 2025 by the Posch and Spielmann families. Every element is made, not assembled: 4,000 hand-cut cotter pins, bathtubs carved from the founders\' own timber, sheep\'s-wool carpets, locally-sourced stone. All-inclusive. Adults only (14+). No programme.',
    brochureRealities: [
      'Gondola access only — there are no cars at the property. Factor 1.5 hours from Innsbruck airport.',
      'Nine suites only — book months ahead for August and December',
      'Adults only (14+) — not suitable for families with young children',
      'No wellness programme or schedule. Clients who need structure may find this difficult.',
      'All-inclusive pricing is higher per night than most comparable properties — budget accordingly',
    ],
    loudQuiet: {
      loud: 'Forestis (1,800m, South Tyrol) is larger and equally serious — the right choice if altitude and architecture are priorities alongside more amenity range',
      quiet: 'Eriro is nine suites. The quietest property on this list by a significant margin.',
    },
    seasons: 'Winter · Spring · Summer · Autumn',
    bestFor: 'Complete disconnection, architectural immersion, depletion recovery',
  },
  {
    id: 'forestis',
    name: 'Forestis',
    location: 'Mount Plose, Brixen, South Tyrol, Italy · 1,800m',
    region: 'europe-north',
    philosophies: ['landscapist'],
    conditions: ['depleted', 'functional'],
    minNights: 3,
    priceFrom: 'from €600/night',
    summary: 'Sixty-two rooms at 1,800 metres, in three glass-and-steel towers built into the bones of a 1912 sanatorium above Brixen. Opened 2020 after an eight-year restoration by the Hinteregger family. The spa is 2,000m² with glacial plunge pools, a hay sound room, and four Finnish saunas. Roland Lamprecht\'s forest cuisine changes daily with altitude and season. 100% renewable energy. Adults only.',
    brochureRealities: [
      'Gondola access from Brixen — add 30 minutes each way, check the last departure time',
      'Adults only — not suitable for families',
      'Minimum 3 nights; 5+ recommended to properly decompress at altitude',
      'The cuisine is the strongest element — clients who do not appreciate food-forward design will undervalue the stay',
      'Altitude (1,800m) affects sleep quality in the first night for some guests',
    ],
    loudQuiet: {
      loud: 'Eriro is nine suites and fully all-inclusive — more contained, more intimate',
      quiet: 'Forestis is the right choice for clients who want more amenity range while keeping the same architectural seriousness',
    },
    seasons: 'All year',
    bestFor: 'Architecture-first restoration, altitude, family-of-two reset',
  },
  {
    id: 'reschio',
    name: 'Reschio',
    location: 'Lisciano Niccone, Umbria, Italy',
    region: 'europe-med',
    philosophies: ['landscapist', 'restorer'],
    conditions: ['depleted', 'curious', 'functional'],
    minNights: 3,
    priceFrom: 'from €700/night',
    summary: 'Count Benedikt Bolza\'s medieval estate in Umbria. Thirty-six rooms in a restored castle across 1,500 acres of Umbrian countryside. Bolza designed every element — the stonework, the furniture, the kitchen garden. No wellness programme. Horses, tennis, the estate pool, and the slow-food kitchen from the land. The therapeutic proposition is the place itself.',
    brochureRealities: [
      'Not a hotel in the conventional sense — do not expect standard hotel-level service infrastructure',
      'Rural Umbria: the pace is genuinely slow. Some clients who expect London-standard responsiveness will find it difficult.',
      'No programme, no schedule. The estate is the experience.',
      'Nearest airport: Perugia (40 min) or Florence (90 min)',
      'High season July–August is warm but peak Umbrian season — book early',
    ],
    loudQuiet: {
      loud: 'Borgo Pignano (Tuscany) is a smaller biodynamic estate with a similar philosophy — more intimate',
      quiet: 'Reschio is the more architecturally serious of the Italian estate properties',
    },
    seasons: 'Spring · Summer · Autumn',
    bestFor: 'Italian estate restoration, design-literate clients, couples',
  },
  {
    id: 'schloss-elmau',
    name: 'Schloss Elmau',
    location: 'Klais, Bavarian Alps, Germany',
    region: 'europe-north',
    philosophies: ['landscapist', 'restorer'],
    conditions: ['depleted', 'curious', 'functional'],
    minNights: 3,
    priceFrom: 'from €500/night',
    summary: 'Founded 1916 by Johannes Müller. Rebuilt after a 2005 fire; the modern Retreat building is the quieter option alongside the original Schloss. Six restaurants, six spas, three Alpine pools. Hosted G7 summits in 2015 and 2022. Family-run by the Müller-Elmau dynasty — the literary and music programming (Schloss Elmau Concerts) is genuine, not decorative.',
    brochureRealities: [
      'High season July–August is genuinely busy — not the choice for those seeking solitude',
      'The Retreat building is significantly quieter than the original Schloss — specify on booking',
      'G7 protocol means excellent UHNW logistics capability but can feel institutional during large events',
      'Munich airport is 90 minutes by car — manageable',
      'The cultural programming (concerts, literary events) is a serious reason to choose Elmau, not a bonus',
    ],
    loudQuiet: {
      loud: 'Elmau in July and August is the Alps\' most socially visible wellness property',
      quiet: 'Book the Retreat building, arrive in May or September, and it is an entirely different experience',
    },
    seasons: 'Spring · Autumn · Winter',
    bestFor: 'Cultural + landscape combination, couples with different wellness agendas, return guests to the Alps',
  },
  {
    id: 'ananda-himalayas',
    name: 'Ananda in the Himalayas',
    location: 'Rishikesh, India',
    region: 'asia',
    philosophies: ['immersionist', 'purifier'],
    conditions: ['depleted', 'functional', 'curious'],
    minNights: 7,
    priceFrom: 'from €450/night',
    summary: 'The most medically credentialed Ayurvedic retreat outside Kerala. Palace estate above Rishikesh with classical Panchakarma, Himalayan trekking, and yoga. No European equivalent.',
    brochureRealities: [
      'Panchakarma requires minimum 7 nights for meaningful effect',
      'Treatments include oil therapies, steam, and internal cleansing — prepare clients fully',
      'October–March is optimal; avoid monsoon (July–September)',
    ],
    seasons: 'Winter · Spring · Autumn',
    bestFor: 'Panchakarma Ayurveda, Himalayan experience',
  },
]

// ── SCORING ───────────────────────────────────────────────────────────────────

const COND_SCORES: Record<Condition, Record<Philosophy, number>> = {
  performing: { clinician: 3, scientist: 3, purifier: 1, immersionist: 1, restorer: 0, landscapist: 0 },
  functional: { clinician: 3, scientist: 2, purifier: 2, immersionist: 2, restorer: 1, landscapist: 1 },
  depleted:   { clinician: 2, scientist: 1, purifier: 3, immersionist: 3, restorer: 0, landscapist: 4 },
  recovering: { clinician: 4, scientist: 2, purifier: 1, immersionist: 2, restorer: 0, landscapist: 2 },
  curious:    { clinician: 1, scientist: 2, purifier: 1, immersionist: 2, restorer: 3, landscapist: 2 },
}

const PRIO_SCORES: Record<Priority, Record<Philosophy, number>> = {
  medical:     { clinician: 4, scientist: 2, purifier: 1, immersionist: 0, restorer: 0, landscapist: 0 },
  longevity:   { clinician: 1, scientist: 4, purifier: 1, immersionist: 1, restorer: 0, landscapist: 0 },
  environment: { clinician: 0, scientist: 0, purifier: 1, immersionist: 4, restorer: 2, landscapist: 4 },
  results:     { clinician: 3, scientist: 3, purifier: 2, immersionist: 0, restorer: 0, landscapist: 0 },
  rest:        { clinician: 0, scientist: 0, purifier: 1, immersionist: 2, restorer: 4, landscapist: 3 },
}

const ADJACENT: Record<Philosophy, Philosophy[]> = {
  clinician:    ['scientist', 'purifier'],
  scientist:    ['clinician'],
  purifier:     ['clinician', 'immersionist'],
  immersionist: ['restorer', 'purifier', 'landscapist'],
  restorer:     ['immersionist', 'landscapist'],
  landscapist:  ['immersionist', 'restorer'],
}

const REGION_GROUPS: Record<string, string[]> = {
  'alpine-swiss': ['alpine-swiss', 'europe-north'],
  'europe-north': ['europe-north', 'alpine-swiss'],
  'europe-med':   ['europe-med'],
  'africa':       ['africa'],
  'asia':         ['asia'],
  'open':         [],
}

function derivePhilosophy(condition: Condition, priority: Priority): Philosophy {
  const ps: Philosophy[] = ['clinician', 'scientist', 'purifier', 'immersionist', 'restorer', 'landscapist']
  return ps.reduce((best, p) => {
    const bScore = COND_SCORES[condition][best] + PRIO_SCORES[priority][best]
    const pScore = COND_SCORES[condition][p]   + PRIO_SCORES[priority][p]
    return pScore > bScore ? p : best
  })
}

function matchClinics(philosophy: Philosophy, region: Region, duration: Duration): Clinic[] {
  return CLINICS
    .map(c => {
      let s = 0
      if (c.philosophies.includes(philosophy)) s += 5
      else if (c.philosophies.some(p => ADJACENT[philosophy].includes(p))) s += 1
      const groups = REGION_GROUPS[region] ?? []
      if (region === 'open' || groups.includes(c.region)) s += 3
      if (duration === 'weekend' && c.minNights <= 3) s += 2
      else if (duration === 'weekend' && c.minNights <= 5) s += 1
      else s += 1
      if (c.tgcActive) s += 2
      return { c, s }
    })
    .filter(x => x.s >= 5)
    .sort((a, b) => {
      if (a.c.tgcActive && !b.c.tgcActive) return -1
      if (!a.c.tgcActive && b.c.tgcActive) return 1
      return b.s - a.s
    })
    .slice(0, 3)
    .map(x => x.c)
}

// ── ANNUAL ARCHITECTURE ───────────────────────────────────────────────────────

interface AnnualPlan {
  title: string
  description: string
  stays: { clinic: string; timing: string; duration: string; note: string }[]
  estimatedCost: string
  tgcNote: string
}

function buildAnnualPlan(a: ArchAnswers): AnnualPlan {
  const { stays, intent, season, budget } = a
  const springT = 'March–May'
  const autumnT = 'September–November'
  const primary = season === 'spring' ? springT : season === 'autumn' ? autumnT
    : season === 'winter' ? 'January–February' : season === 'summer' ? 'June–August' : springT

  if (stays === '1' && intent !== 'optimise') {
    return {
      title: 'One well-chosen reset',
      description: 'A single focused stay, chosen for the right reason. The first visit to a serious clinic tells you more about what you need than any amount of prior research.',
      stays: [
        { clinic: 'Lanserhof Tegernsee', timing: primary, duration: '7 nights', note: 'Core LANS Med Cure. Diagnostics, elimination, and a plan to take home.' },
      ],
      estimatedCost: 'est. €5,500–9,000',
      tgcNote: 'TGC has direct access to the Lanserhof medical team at both properties. We brief the clinic ahead of arrival.',
    }
  }

  if (stays === '1' && intent === 'optimise') {
    return {
      title: 'Know your numbers',
      description: 'A single diagnostic visit delivers a baseline that informs how you approach the next five years. The value compounds with each year\'s data.',
      stays: [
        { clinic: 'Clinique Nescens — Genolier', timing: primary, duration: '1–3 days', note: 'Check-Up Advanced or Excellence. Personalised preventive medicine action plan.' },
      ],
      estimatedCost: 'est. CHF 6,950–15,000',
      tgcNote: 'Nescens is 30 minutes from Geneva airport. Works as a dedicated visit or a stopover within any Switzerland trip.',
    }
  }

  if (stays === '2' && (budget === 'under-15k' || budget === '15-40k') && intent !== 'optimise') {
    return {
      title: 'Spring reset, autumn diagnostic',
      description: 'The maintenance cadence most medically serious wellness clients settle into after their first visit. One stay to reset — one to measure and prepare for the year ahead.',
      stays: [
        { clinic: 'Lanserhof Tegernsee', timing: springT, duration: '7 nights', note: 'Winter elimination, spring restart. The classic reset.' },
        { clinic: 'Clinique Nescens — Genolier', timing: autumnT, duration: '1–3 days', note: 'Year-end diagnostics. Longevity markers before the annual review.' },
      ],
      estimatedCost: 'est. €12,000–20,000',
      tgcNote: 'Both are TGC Active partners. We can coordinate both visits and share findings between clinics with your consent.',
    }
  }

  if (stays === '2' && intent === 'optimise') {
    return {
      title: 'Baseline in spring, longevity in autumn',
      description: 'Begin the year with a cellular health baseline. End it with a full longevity programme informed by what the first visit found.',
      stays: [
        { clinic: 'Clinique Nescens — Genolier', timing: springT, duration: '1 day', note: 'Check-Up Excellence. Full biomarker baseline including cerebral angio-MRI.' },
        { clinic: 'Clinique Nescens — Genolier', timing: autumnT, duration: '3 nights', note: 'Longevity programme, built on the spring diagnostic findings.' },
      ],
      estimatedCost: 'est. CHF 16,000–22,000',
      tgcNote: 'Julie Assante at Nescens holds your spring results. The autumn programme is built directly from your baseline.',
    }
  }

  if (stays === '2' && (budget === '40-100k' || budget === 'open')) {
    return {
      title: 'Swiss science, European reset',
      description: 'Cellular medicine in Switzerland sets the baseline. A full Lanserhof programme builds on it. Two visits that are designed to work together.',
      stays: [
        { clinic: 'Clinique Nescens — Genolier', timing: 'February–March', duration: '2–4 days', note: 'Check-Up Excellence or Elixir ORIGIN. Annual cellular baseline.' },
        { clinic: 'Lanserhof Sylt', timing: 'May–June', duration: '10–14 nights', note: 'Full Performance & Longevity programme. Extended stay.' },
      ],
      estimatedCost: 'est. €30,000–50,000',
      tgcNote: 'We share Nescens diagnostic context with the Lanserhof team so the programme builds from your baseline.',
    }
  }

  if (stays === '2' && intent === 'both') {
    return {
      title: 'Europe and Africa: two climates, two approaches',
      description: 'One European medical or reset programme. One Cape Winelands immersive stay. Different philosophies that work together across the year.',
      stays: [
        { clinic: 'Lanserhof Tegernsee or Nescens', timing: springT, duration: '5–7 nights', note: 'Medical or longevity focus, European spring.' },
        { clinic: 'Santé Wellness, Franschhoek', timing: 'June–August', duration: '5–7 nights', note: 'Cape Winelands winter (dry season). Nature immersion, strict nutrition protocol.' },
      ],
      estimatedCost: 'est. €12,000–22,000',
      tgcNote: 'Both TGC Active. The Santé stay combines naturally with a Cape Town visit — we can build the full trip.',
    }
  }

  if (stays === '3plus') {
    return {
      title: 'A structured wellness year',
      description: 'Three stays, each with a distinct purpose. Diagnose, reset, immerse. The body responds better with regularity — the third visit is where the cumulative benefit becomes apparent.',
      stays: [
        { clinic: 'Clinique Nescens — Genolier', timing: 'February', duration: '1–2 days', note: 'Annual baseline. Know your numbers before the year begins.' },
        { clinic: 'Lanserhof Tegernsee', timing: 'April–May', duration: '7 nights', note: 'Spring cure. Elimination, reset, Nescens diagnostic follow-through.' },
        { clinic: 'Santé Wellness or Chiva-Som', timing: 'October–November', duration: '5–7 nights', note: 'Autumn immersion. Nature-led restoration before year-end.' },
      ],
      estimatedCost: 'est. €20,000–40,000',
      tgcNote: 'We coordinate all three — timing, clinic briefs, and any travel logistics.',
    }
  }

  return {
    title: 'Your programme, designed together',
    description: 'Your brief calls for a direct conversation. The right combination depends on details we would like to discuss with you.',
    stays: [],
    estimatedCost: 'On discussion',
    tgcNote: 'Submit your brief below and your Gatekeeper will be in touch.',
  }
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function WellnessIntelligencePage() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [compassStep, setCompassStep] = useState(0)
  const [archStep, setArchStep] = useState(0)
  const [compass, setCompass] = useState<CompassAnswers>({
    condition: null, priority: null, context: null, duration: null, region: null,
  })
  const [arch, setArch] = useState<ArchAnswers>({
    stays: null, intent: null, season: null, budget: null,
  })
  const [philosophy, setPhilosophy] = useState<Philosophy | null>(null)
  const [matches, setMatches] = useState<Clinic[]>([])
  const [annualPlan, setAnnualPlan] = useState<AnnualPlan | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitMode, setSubmitMode] = useState<'compass' | 'arch'>('compass')
  const [client, setClient] = useState<ClientDetails>({
    firstName: '', lastName: '', email: '', phone: '', targetMonth: '', message: '',
  })

  // ── Compass questions ──────────────────────────────────────────────────────

  const compassQuestions = [
    {
      key: 'condition' as keyof CompassAnswers,
      question: 'Where are you right now?',
      subtitle: 'The starting point determines the destination.',
      options: [
        { value: 'performing', label: 'Performing well', desc: 'I want to maintain and extend what\'s working' },
        { value: 'functional', label: 'Managing well, feeling the pace', desc: 'Stress is manageable but I can sense the accumulation' },
        { value: 'depleted', label: 'Depleted', desc: 'Burnout, exhaustion, or a prolonged difficult period' },
        { value: 'recovering', label: 'Recovering from something specific', desc: 'Post-surgery, illness, injury, or a particular episode' },
        { value: 'curious', label: 'Curious — exploring what\'s possible', desc: 'No specific issue. I want to understand what wellness can offer.' },
      ],
    },
    {
      key: 'priority' as keyof CompassAnswers,
      question: 'What matters most in how you\'re cared for?',
      subtitle: 'The philosophy of care is as important as the clinic.',
      options: [
        { value: 'medical', label: 'Medical precision', desc: 'Doctor-led, diagnostic, protocols. Evidence before experience.' },
        { value: 'longevity', label: 'Science and longevity', desc: 'Biomarkers, cellular health, ageing science. Results that compound.' },
        { value: 'environment', label: 'Environment and nature', desc: 'Landscape, stillness, immersion. The setting is the medicine.' },
        { value: 'results', label: 'Measurable outcomes', desc: 'Before and after. Numbers I can track and act on.' },
        { value: 'rest', label: 'Rest with no agenda', desc: 'Minimum intervention, maximum quiet. I want to stop.' },
      ],
    },
    {
      key: 'context' as keyof CompassAnswers,
      question: 'How are you travelling?',
      subtitle: 'Some clinics suit couples; others are designed for solo programmes.',
      options: [
        { value: 'solo', label: 'Solo', desc: 'This is my programme, uninterrupted' },
        { value: 'partner', label: 'With a partner', desc: 'Separate or parallel programmes, same location' },
        { value: 'embedded', label: 'As part of a longer trip', desc: '3–5 days within a broader journey (Geneva stopover, Cape Town trip)' },
        { value: 'flexible', label: 'Flexible', desc: 'No fixed format' },
      ],
    },
    {
      key: 'duration' as keyof CompassAnswers,
      question: 'How long can you commit?',
      subtitle: 'Under 5 nights, most serious programmes cannot begin properly.',
      options: [
        { value: 'weekend', label: 'Long weekend (2–3 days)', desc: 'Diagnostics, initial reset, or a first visit' },
        { value: 'week', label: 'One week (5–7 days)', desc: 'The standard minimum for a meaningful programme' },
        { value: 'extended', label: 'Extended (10 days or more)', desc: 'Transformative — most protocols work best at this length' },
        { value: 'flexible', label: 'Open', desc: 'Whatever the right programme requires' },
      ],
    },
    {
      key: 'region' as keyof CompassAnswers,
      question: 'Any regional preference?',
      subtitle: 'Long-haul travel adds recovery time at each end.',
      options: [
        { value: 'alpine-swiss', label: 'Switzerland / Alpine', desc: 'Nescens (Geneva), Clinique La Prairie (Montreux)' },
        { value: 'europe-north', label: 'Germany / Austria / Central Europe', desc: 'Lanserhof (Sylt, Tegernsee), Buchinger, Viva Mayr' },
        { value: 'europe-med', label: 'Mediterranean — Spain / Portugal', desc: 'SHA (Alicante), Six Senses Douro (Portugal)' },
        { value: 'africa', label: 'Africa — Cape Winelands', desc: 'Santé Wellness (Franschhoek), Babylonstoren' },
        { value: 'asia', label: 'Asia — Thailand / Bali / India', desc: 'Chiva-Som, Kamalaya, COMO Shambhala, Ananda' },
        { value: 'open', label: 'No preference', desc: 'Show me the best match wherever it is' },
      ],
    },
  ]

  const archQuestions = [
    {
      key: 'stays' as keyof ArchAnswers,
      question: 'How many wellness stays are you considering this year?',
      subtitle: 'The cadence shapes the recommendation.',
      options: [
        { value: '1', label: 'One focused stay', desc: 'A single, well-chosen visit' },
        { value: '2', label: 'Two stays', desc: 'Typically one reset, one diagnostic or immersive' },
        { value: '3plus', label: 'Three or more', desc: 'Building a structured wellness practice' },
      ],
    },
    {
      key: 'intent' as keyof ArchAnswers,
      question: 'What\'s the primary intent?',
      subtitle: 'Honest — each has a different answer.',
      options: [
        { value: 'reset', label: 'Reset', desc: 'I need to stop and recover first' },
        { value: 'optimise', label: 'Optimise', desc: 'I\'m performing — I want to understand and sustain it' },
        { value: 'both', label: 'Both', desc: 'One of each, across the year' },
      ],
    },
    {
      key: 'season' as keyof ArchAnswers,
      question: 'When works best?',
      subtitle: 'Clinic availability and climate both matter.',
      options: [
        { value: 'spring', label: 'Spring (March–May)', desc: 'Post-winter restart, European clinics at their best' },
        { value: 'summer', label: 'Summer (June–August)', desc: 'Also South African winter — excellent for Franschhoek' },
        { value: 'autumn', label: 'Autumn (September–November)', desc: 'Year-end reset before the final quarter' },
        { value: 'winter', label: 'Winter (December–February)', desc: 'Alpine settings, or Asia in high season' },
        { value: 'flexible', label: 'Flexible', desc: 'I\'ll work around the right programme' },
      ],
    },
    {
      key: 'budget' as keyof ArchAnswers,
      question: 'Annual budget for wellness?',
      subtitle: 'This covers programme fees, accommodation, and treatments.',
      options: [
        { value: 'under-15k', label: 'Under €15,000', desc: 'One focused stay, or a short diagnostic visit' },
        { value: '15-40k', label: '€15,000–€40,000', desc: 'Two meaningful programmes, or one extended stay' },
        { value: '40-100k', label: '€40,000–€100,000', desc: 'Extended programmes or a combination of clinical and immersive' },
        { value: 'open', label: 'Open', desc: 'The right programme, whatever it costs' },
      ],
    },
  ]

  // ── Answer handlers ────────────────────────────────────────────────────────

  const handleCompassAnswer = (key: keyof CompassAnswers, value: string) => {
    const updated = { ...compass, [key]: value as never }
    setCompass(updated)
    setTimeout(() => {
      if (compassStep < compassQuestions.length - 1) {
        setCompassStep(compassStep + 1)
      } else {
        const p = derivePhilosophy(updated.condition!, updated.priority!)
        const m = matchClinics(p, updated.region!, updated.duration!)
        setPhilosophy(p)
        setMatches(m)
        setScreen('philosophy')
      }
    }, 280)
  }

  const handleArchAnswer = (key: keyof ArchAnswers, value: string) => {
    const updated = { ...arch, [key]: value as never }
    setArch(updated)
    setTimeout(() => {
      if (archStep < archQuestions.length - 1) {
        setArchStep(archStep + 1)
      } else {
        setAnnualPlan(buildAnnualPlan(updated))
        setScreen('arch-result')
      }
    }, 280)
  }

  const submitBrief = async () => {
    setSubmitting(true)
    try {
      await fetch('/api/intelligence/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'wellness',
          mode: submitMode,
          submittedAt: new Date().toISOString(),
          brief: submitMode === 'compass' ? { ...compass, philosophy } : { ...arch },
          client: { ...client },
          matches: submitMode === 'compass'
            ? matches.map(c => ({ id: c.id, name: c.name }))
            : annualPlan?.stays.map(s => s.clinic),
        }),
      })
    } catch (e) {
      console.error('Submit error:', e)
    }
    setSubmitting(false)
    setScreen('submitted')
  }

  const reset = () => {
    setScreen('welcome')
    setCompassStep(0)
    setArchStep(0)
    setCompass({ condition: null, priority: null, context: null, duration: null, region: null })
    setArch({ stays: null, intent: null, season: null, budget: null })
    setPhilosophy(null)
    setMatches([])
    setAnnualPlan(null)
    setClient({ firstName: '', lastName: '', email: '', phone: '', targetMonth: '', message: '' })
  }

  const phil = philosophy ? PHILOSOPHIES[philosophy] : null
  const currentCompassQ = compassQuestions[compassStep]
  const currentArchQ = archQuestions[archStep]

  // ── CSS ────────────────────────────────────────────────────────────────────

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Lato:ital,wght@0,300;0,400;0,700;1,400&display=swap');
    .tgc-serif { font-family: 'Poppins', sans-serif; }
    .tgc-sans  { font-family: 'Lato', sans-serif; }
    .tgc-mono  { font-family: 'Lato', sans-serif; font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }
    .tgc-fade  { animation: tgcFade 0.5s ease forwards; }
    @keyframes tgcFade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    .tgc-opt:hover { background: rgba(200,170,74,0.06) !important; border-color: #c8aa4a !important; }
    .tgc-inp { width:100%; padding:0.8rem 1rem; border:1px solid #e5e7eb; background:white; font-size:1rem; font-family:'Lato',sans-serif; outline:none; transition:border-color 0.2s; box-sizing:border-box; border-radius:4px; }
    .tgc-inp:focus { border-color:#0e4f51; }
    .tgc-dot { width:6px; height:6px; border-radius:50%; background:#e5e7eb; transition:all 0.3s ease; flex-shrink:0; }
    .tgc-dot.active { background:#0e4f51; width:24px; border-radius:3px; }
    .tgc-dot.done { background:#c8aa4a; }
    .phil-card { transition: all 0.2s; }
    .phil-card:hover { transform: translateY(-2px); }
  `

  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight:'100vh', background:'#F9F8F5', color:'#1a1815', fontFamily:"'Lato',sans-serif", padding:'2rem 1.5rem' }}>
      <style>{css}</style>
      <div style={{ maxWidth:'1040px', margin:'0 auto' }}>

        {/* Suite Nav */}
        <div style={{ marginBottom:'1.75rem' }}>
          <div style={{ display:'flex', gap:'1.5rem', alignItems:'center', marginBottom:'0.75rem' }}>
            <a href="/intelligence" style={{ color:'#6b7280', fontSize:'0.75rem', textDecoration:'none', fontFamily:"'Lato',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase' }}>
              ← Intelligence Suite
            </a>
            <a href="https://www.thegatekeepers.club" style={{ color:'#c8aa4a', fontSize:'0.75rem', textDecoration:'none', fontFamily:"'Lato',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase' }}>
              ↩ Website
            </a>
          </div>
          <div style={{ display:'flex', gap:'0.4rem', overflowX:'auto', scrollbarWidth:'none' } as React.CSSProperties}>
            {[
              { num:'01', label:'Transport',    href:'/intelligence/transport',        active:false },
              { num:'02', label:'Real Estate',  href:'/intelligence/realestate',       active:false },
              { num:'03', label:'Wellness',     href:'/intelligence/wellness',         active:true  },
              { num:'04', label:'Events',       href:'/intelligence/events-production',active:false },
              { num:'05', label:'VIP',          href:'/intelligence/vip-hospitality',  active:false },
              { num:'06', label:'Art',          href:'/intelligence/art-collectables', active:false },
            ].map(t => (
              <a key={t.num} href={t.href} style={{ padding:'0.3rem 0.75rem', border:t.active?'none':'1px solid #e5e7eb', background:t.active?'#0e4f51':'transparent', color:t.active?'#fff':'#6b7280', fontSize:'0.7rem', fontFamily:"'Lato',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap', borderRadius:'3px', textDecoration:'none' }}>
                {t.num} {t.label}
              </a>
            ))}
          </div>
        </div>

        {/* Header bar */}
        <div style={{ marginBottom:'2.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
          <a href="/intelligence" style={{ textDecoration:'none' }}>
            <span className="tgc-serif" style={{ fontSize:'1.1rem', color:'#0e4f51' }}>The Gatekeepers Club</span>
          </a>
          <span className="tgc-mono" style={{ color:'#6b7280' }}>Wellness Intelligence · v.3</span>
        </div>

        {/* ── WELCOME ──────────────────────────────────────────────────────── */}
        {screen === 'welcome' && (
          <div className="tgc-fade">
            <h1 className="tgc-serif" style={{ fontWeight:400, fontSize:'clamp(2.8rem,6vw,4.8rem)', lineHeight:1.03, letterSpacing:'-0.01em', marginBottom:'1.2rem' }}>
              The right clinic, for the right reason.
            </h1>
            <p className="tgc-sans" style={{ fontSize:'clamp(1.1rem,2vw,1.4rem)', color:'#6b7280', maxWidth:'600px', lineHeight:1.55, marginBottom:'3rem' }}>
              Most retreats are bought on reputation. The right one depends on where you are right now — and what you actually need from it.
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.5rem', marginBottom:'3rem' }}>
              <button
                onClick={() => { setScreen('compass'); setCompassStep(0); }}
                style={{ background:'#0e4f51', color:'#fff', padding:'2.5rem 2rem', border:'none', textAlign:'left', cursor:'pointer', borderRadius:'8px', transition:'opacity 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity='0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity='1')}
              >
                <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'1rem' }}>Tool 01 · Wellness Compass</div>
                <div className="tgc-serif" style={{ fontSize:'1.9rem', marginBottom:'0.6rem', lineHeight:1.1 }}>Find my approach</div>
                <div style={{ fontSize:'0.88rem', opacity:0.85, lineHeight:1.5, fontFamily:"'Lato',sans-serif", fontWeight:300 }}>
                  Five questions. A philosophy match. An honest recommendation from eighteen clinics — with what the brochure won&apos;t tell you.
                </div>
                <div className="tgc-mono" style={{ marginTop:'1.5rem', color:'#c8aa4a' }}>Begin →</div>
              </button>

              <button
                onClick={() => { setScreen('arch'); setArchStep(0); setSubmitMode('arch'); }}
                style={{ background:'transparent', color:'#1a1815', padding:'2.5rem 2rem', border:'1.5px solid #e5e7eb', textAlign:'left', cursor:'pointer', borderRadius:'8px', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#0e4f51'; e.currentTarget.style.color='#fff'; (e.currentTarget.style as unknown as { borderColor: string }).borderColor = '#0e4f51'; }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#1a1815'; (e.currentTarget.style as unknown as { borderColor: string }).borderColor = '#e5e7eb'; }}
              >
                <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'1rem' }}>Tool 02 · Annual Architecture</div>
                <div className="tgc-serif" style={{ fontSize:'1.9rem', marginBottom:'0.6rem', lineHeight:1.1 }}>Plan my wellness year</div>
                <div style={{ fontSize:'0.88rem', lineHeight:1.5, fontFamily:"'Lato',sans-serif", fontWeight:300 }}>
                  Four questions. A suggested annual structure with specific clinics, timing, and cost estimates.
                </div>
                <div className="tgc-mono" style={{ marginTop:'1.5rem' }}>Plan →</div>
              </button>
            </div>

            {/* Philosophy teasers */}
            <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:'2rem' }}>
              <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'1.2rem' }}>Six approaches</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem' }}>
                {(Object.entries(PHILOSOPHIES) as [Philosophy, typeof PHILOSOPHIES[Philosophy]][]).map(([id, p]) => (
                  <div key={id} className="phil-card" style={{ padding:'1.2rem', background:'white', border:'1px solid #f0ede8', borderRadius:'8px', cursor:'default' }}>
                    <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'0.5rem', fontSize:'0.6rem' }}>{id}</div>
                    <div className="tgc-serif" style={{ fontSize:'1rem', marginBottom:'0.3rem' }}>{p.name}</div>
                    <div style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.75rem', color:'#9a8c7e', lineHeight:1.4 }}>{p.tagline}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── WELLNESS COMPASS (questions) ─────────────────────────────────── */}
        {screen === 'compass' && currentCompassQ && (
          <div className="tgc-fade">
            <div style={{ display:'flex', gap:'6px', marginBottom:'2.5rem', alignItems:'center' }}>
              {compassQuestions.map((_, i) => (
                <div key={i} className={`tgc-dot ${i === compassStep ? 'active' : i < compassStep ? 'done' : ''}`} />
              ))}
              <span style={{ marginLeft:'1rem', fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.78rem', color:'#c8aa4a' }}>
                {compassStep + 1} of {compassQuestions.length}
              </span>
            </div>

            <h2 className="tgc-serif" style={{ fontWeight:400, fontSize:'clamp(2rem,4vw,3rem)', lineHeight:1.1, marginBottom:'0.6rem' }}>
              {currentCompassQ.question}
            </h2>
            <p className="tgc-sans" style={{ color:'#6b7280', fontSize:'1.05rem', marginBottom:'2rem' }}>
              {currentCompassQ.subtitle}
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'0.75rem', marginBottom:'2rem' }}>
              {currentCompassQ.options.map(opt => {
                const selected = compass[currentCompassQ.key] === opt.value
                return (
                  <button
                    key={opt.value}
                    className="tgc-opt"
                    onClick={() => handleCompassAnswer(currentCompassQ.key, opt.value)}
                    style={{ background:selected?'rgba(200,170,74,0.08)':'#F9F8F5', border:selected?'1.5px solid #c8aa4a':'1.5px solid #e5e7eb', padding:'1.2rem 1.4rem', textAlign:'left', cursor:'pointer', transition:'all 0.2s', borderRadius:'8px' }}
                  >
                    <div className="tgc-serif" style={{ fontSize:'1.1rem', marginBottom:'0.3rem', fontWeight:selected?500:400 }}>{opt.label}</div>
                    <div style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.82rem', color:'#6b7280', lineHeight:1.5 }}>{opt.desc}</div>
                  </button>
                )
              })}
            </div>

            {compassStep > 0 && (
              <button onClick={() => setCompassStep(compassStep - 1)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', color:'#c8aa4a', fontFamily:"'Lato',sans-serif", fontWeight:300 }}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
          </div>
        )}

        {/* ── PHILOSOPHY REVEAL ────────────────────────────────────────────── */}
        {screen === 'philosophy' && phil && philosophy && (
          <div className="tgc-fade">
            <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'1.2rem' }}>Your approach</div>
            <h2 className="tgc-serif" style={{ fontWeight:400, fontSize:'clamp(2.5rem,5vw,4rem)', lineHeight:1.05, marginBottom:'0.6rem' }}>
              {phil.name}
            </h2>
            <p className="tgc-sans" style={{ fontSize:'1.25rem', color:'#9a8c7e', marginBottom:'2rem', fontStyle:'italic' }}>
              {phil.tagline}
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'2.5rem', maxWidth:'760px' }}>
              <div style={{ background:'white', padding:'1.8rem', borderRadius:'8px', border:'1px solid #f0ede8' }}>
                <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'0.8rem', fontSize:'0.62rem' }}>The approach</div>
                <p style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.92rem', lineHeight:1.7, color:'#3a3530' }}>
                  {phil.description}
                </p>
              </div>
              <div style={{ background:'#f7f5f0', padding:'1.8rem', borderRadius:'8px', border:'1px solid #e8e4dc' }}>
                <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'0.8rem', fontSize:'0.62rem' }}>What this is not</div>
                <p style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.92rem', lineHeight:1.7, color:'#6b6358' }}>
                  {phil.notThis}
                </p>
              </div>
            </div>

            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              <button
                onClick={() => { setSubmitMode('compass'); setScreen('clinics'); }}
                style={{ background:'#0e4f51', color:'#fff', border:'none', padding:'1rem 2.5rem', cursor:'pointer', fontFamily:"'Lato',sans-serif", fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600, borderRadius:'8px' }}
              >
                See matched clinics →
              </button>
              <button onClick={reset} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', color:'#c8aa4a', fontFamily:"'Lato',sans-serif", fontWeight:300 }}>
                <RotateCcw size={14} /> Start again
              </button>
            </div>

            {/* Other philosophies */}
            <div style={{ marginTop:'3rem', paddingTop:'2rem', borderTop:'1px solid #e5e7eb' }}>
              <div className="tgc-mono" style={{ color:'#6b7280', marginBottom:'1rem', fontSize:'0.62rem' }}>Other approaches</div>
              <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
                {(Object.entries(PHILOSOPHIES) as [Philosophy, typeof PHILOSOPHIES[Philosophy]][])
                  .filter(([id]) => id !== philosophy)
                  .map(([id, p]) => (
                    <button
                      key={id}
                      onClick={() => { setPhilosophy(id); setMatches(matchClinics(id, compass.region!, compass.duration!)); }}
                      style={{ padding:'0.5rem 1rem', border:'1px solid #e5e7eb', background:'transparent', cursor:'pointer', fontFamily:"'Lato',sans-serif", fontSize:'0.78rem', color:'#6b7280', borderRadius:'4px', transition:'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='#c8aa4a'; e.currentTarget.style.color='#1a1815'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.color='#6b7280'; }}
                    >
                      {p.name}
                    </button>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* ── CLINICS ───────────────────────────────────────────────────────── */}
        {screen === 'clinics' && phil && (
          <div className="tgc-fade">
            <div style={{ display:'flex', gap:'1rem', alignItems:'center', marginBottom:'2rem', flexWrap:'wrap' }}>
              <button onClick={() => setScreen('philosophy')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', color:'#c8aa4a', fontFamily:"'Lato',sans-serif", fontWeight:300 }}>
                <ChevronLeft size={16} /> {phil.name}
              </button>
            </div>

            <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'0.8rem' }}>
              {matches.length > 0 ? `${matches.length} ${matches.length === 1 ? 'clinic matches' : 'clinics match'} your brief` : 'Matched for your approach'}
            </div>
            <h2 className="tgc-serif" style={{ fontWeight:400, fontSize:'clamp(2rem,4vw,3rem)', lineHeight:1.1, marginBottom:'0.5rem' }}>
              {matches.length > 0 ? 'Our honest assessment.' : 'A direct conversation will serve better.'}
            </h2>
            <p className="tgc-sans" style={{ color:'#6b7280', fontSize:'1rem', marginBottom:'2.5rem', lineHeight:1.5 }}>
              No brochure language. What to know before you book.
            </p>

            {matches.length === 0 && (
              <div style={{ padding:'1.5rem', background:'white', border:'1px solid #e5e7eb', marginBottom:'2rem', borderRadius:'8px' }}>
                <p className="tgc-sans" style={{ color:'#6b7280', lineHeight:1.6 }}>
                  Your brief is specific enough that a direct conversation will serve better than a filtered list. Submit below and your Gatekeeper will be in touch.
                </p>
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', marginBottom:'2.5rem' }}>
              {matches.map((clinic, index) => (
                <div key={clinic.id} style={{ background:index===0?'#0e4f51':'white', color:index===0?'#fff':'#1a1815', padding:'2rem', borderRadius:'8px', border:index===0?'none':'1px solid #e5e7eb' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap', marginBottom:'0.75rem' }}>
                    <div>
                      <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'0.4rem', fontSize:'0.62rem' }}>
                        {index === 0 ? 'Primary recommendation' : `Alternative ${index}`}
                        {clinic.tgcActive ? ' · TGC Active' : ''}
                      </div>
                      <h3 className="tgc-serif" style={{ fontWeight:400, fontSize:'1.9rem', lineHeight:1.1 }}>{clinic.name}</h3>
                      <p style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.82rem', opacity:0.65, marginTop:'0.2rem' }}>{clinic.location}</p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div className="tgc-mono" style={{ color:'#c8aa4a', fontSize:'0.6rem', marginBottom:'0.2rem' }}>from</div>
                      <div className="tgc-serif" style={{ fontSize:'1.1rem' }}>{clinic.priceFrom}</div>
                      <div style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.72rem', opacity:0.6, marginTop:'0.2rem' }}>{clinic.seasons}</div>
                    </div>
                  </div>

                  <p style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.9rem', lineHeight:1.65, opacity:index===0?0.88:0.75, marginBottom:'1.2rem' }}>
                    {clinic.summary}
                  </p>

                  {clinic.loudQuiet && (
                    <div style={{ background:index===0?'rgba(255,255,255,0.07)':'rgba(26,24,21,0.04)', padding:'1rem', marginBottom:'1.2rem', borderRadius:'4px' }}>
                      <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'0.5rem', fontSize:'0.6rem' }}>Loud vs quiet</div>
                      <p style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.82rem', lineHeight:1.6, opacity:0.82 }}>
                        <strong>Louder:</strong> {clinic.loudQuiet.loud}<br/>
                        <strong>Quieter:</strong> {clinic.loudQuiet.quiet}
                      </p>
                    </div>
                  )}

                  <div style={{ marginBottom: clinic.programmes && clinic.programmes.length > 0 ? '1.2rem' : '0' }}>
                    <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'0.6rem', fontSize:'0.6rem' }}>What the brochure won&apos;t tell you</div>
                    <ul style={{ margin:0, padding:'0 0 0 1.2rem', listStyle:'disc' }}>
                      {clinic.brochureRealities.slice(0, 4).map((r, i) => (
                        <li key={i} style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.82rem', lineHeight:1.65, opacity:0.82, marginBottom:'0.2rem' }}>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {clinic.programmes && clinic.programmes.length > 0 && (
                    <div>
                      <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'0.6rem', fontSize:'0.6rem' }}>Selected programmes</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                        {clinic.programmes.slice(0, 4).map((p, i) => (
                          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:'1rem', fontFamily:"'Lato',sans-serif", fontSize:'0.8rem', opacity:0.82, paddingBottom:'0.3rem', borderBottom:index===0?'1px solid rgba(255,255,255,0.1)':'1px solid #f0ede8' }}>
                            <span style={{ fontWeight:400 }}>{p.name}</span>
                            <span style={{ fontWeight:300, opacity:0.8, whiteSpace:'nowrap' }}>{p.duration} · {p.price}</span>
                          </div>
                        ))}
                        {clinic.programmes.length > 4 && (
                          <div style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.75rem', opacity:0.6 }}>+{clinic.programmes.length - 4} more programmes on enquiry</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Brief submission */}
            <BriefForm
              client={client}
              setClient={setClient}
              submitting={submitting}
              onSubmit={submitBrief}
              mode="compass"
            />

            <div style={{ display:'flex', gap:'1rem', marginTop:'1.5rem', flexWrap:'wrap' }}>
              <button onClick={reset} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', color:'#c8aa4a', fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.9rem' }}>
                <RotateCcw size={14} /> Start again
              </button>
              <button
                onClick={() => { setSubmitMode('arch'); setScreen('arch'); setArchStep(0); }}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#c8aa4a', fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.9rem' }}
              >
                Plan my wellness year →
              </button>
            </div>
          </div>
        )}

        {/* ── ANNUAL ARCHITECTURE (questions) ─────────────────────────────── */}
        {screen === 'arch' && currentArchQ && (
          <div className="tgc-fade">
            <div style={{ display:'flex', gap:'6px', marginBottom:'2.5rem', alignItems:'center' }}>
              {archQuestions.map((_, i) => (
                <div key={i} className={`tgc-dot ${i === archStep ? 'active' : i < archStep ? 'done' : ''}`} />
              ))}
              <span style={{ marginLeft:'1rem', fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.78rem', color:'#c8aa4a' }}>
                {archStep + 1} of {archQuestions.length}
              </span>
            </div>

            <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'0.8rem' }}>Annual Architecture</div>
            <h2 className="tgc-serif" style={{ fontWeight:400, fontSize:'clamp(2rem,4vw,3rem)', lineHeight:1.1, marginBottom:'0.6rem' }}>
              {currentArchQ.question}
            </h2>
            <p className="tgc-sans" style={{ color:'#6b7280', fontSize:'1.05rem', marginBottom:'2rem' }}>
              {currentArchQ.subtitle}
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'0.75rem', marginBottom:'2rem' }}>
              {currentArchQ.options.map(opt => {
                const selected = arch[currentArchQ.key] === opt.value
                return (
                  <button
                    key={opt.value}
                    className="tgc-opt"
                    onClick={() => handleArchAnswer(currentArchQ.key, opt.value)}
                    style={{ background:selected?'rgba(200,170,74,0.08)':'#F9F8F5', border:selected?'1.5px solid #c8aa4a':'1.5px solid #e5e7eb', padding:'1.2rem 1.4rem', textAlign:'left', cursor:'pointer', transition:'all 0.2s', borderRadius:'8px' }}
                  >
                    <div className="tgc-serif" style={{ fontSize:'1.1rem', marginBottom:'0.3rem', fontWeight:selected?500:400 }}>{opt.label}</div>
                    <div style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.82rem', color:'#6b7280', lineHeight:1.5 }}>{opt.desc}</div>
                  </button>
                )
              })}
            </div>

            {archStep > 0 && (
              <button onClick={() => setArchStep(archStep - 1)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', color:'#c8aa4a', fontFamily:"'Lato',sans-serif", fontWeight:300 }}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
          </div>
        )}

        {/* ── ANNUAL ARCHITECTURE RESULT ───────────────────────────────────── */}
        {screen === 'arch-result' && annualPlan && (
          <div className="tgc-fade">
            <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'1.2rem' }}>Annual Architecture</div>
            <h2 className="tgc-serif" style={{ fontWeight:400, fontSize:'clamp(2rem,4vw,3.2rem)', lineHeight:1.1, marginBottom:'0.6rem' }}>
              {annualPlan.title}
            </h2>
            <p className="tgc-sans" style={{ color:'#6b7280', fontSize:'1.05rem', marginBottom:'2.5rem', lineHeight:1.55, maxWidth:'620px' }}>
              {annualPlan.description}
            </p>

            {annualPlan.stays.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'1.5rem' }}>
                {annualPlan.stays.map((stay, i) => (
                  <div key={i} style={{ background:i===0?'#0e4f51':'white', color:i===0?'#fff':'#1a1815', padding:'1.8rem 2rem', borderRadius:'8px', border:i===0?'none':'1px solid #e5e7eb', display:'grid', gridTemplateColumns:'1fr auto', gap:'1rem', alignItems:'start' }}>
                    <div>
                      <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'0.4rem', fontSize:'0.6rem' }}>Visit {i + 1}</div>
                      <div className="tgc-serif" style={{ fontSize:'1.3rem', marginBottom:'0.4rem' }}>{stay.clinic}</div>
                      <div style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.85rem', lineHeight:1.6, opacity:i===0?0.85:0.7 }}>
                        {stay.note}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div className="tgc-mono" style={{ color:'#c8aa4a', fontSize:'0.58rem', marginBottom:'0.2rem' }}>timing</div>
                      <div style={{ fontFamily:"'Lato',sans-serif", fontWeight:400, fontSize:'0.82rem' }}>{stay.timing}</div>
                      <div style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.75rem', opacity:0.65, marginTop:'0.2rem' }}>{stay.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background:'#0e4f51', color:'#fff', padding:'1.8rem 2rem', borderRadius:'8px', marginBottom:'2rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem', marginBottom:'1rem' }}>
                <div>
                  <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'0.4rem', fontSize:'0.6rem' }}>Estimated annual investment</div>
                  <div className="tgc-serif" style={{ fontSize:'1.6rem' }}>{annualPlan.estimatedCost}</div>
                </div>
              </div>
              <p style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.88rem', lineHeight:1.6, opacity:0.85 }}>
                {annualPlan.tgcNote}
              </p>
            </div>

            <BriefForm
              client={client}
              setClient={setClient}
              submitting={submitting}
              onSubmit={submitBrief}
              mode="arch"
            />

            <div style={{ display:'flex', gap:'1rem', marginTop:'1.5rem', flexWrap:'wrap' }}>
              <button onClick={reset} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', color:'#c8aa4a', fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.9rem' }}>
                <RotateCcw size={14} /> Start again
              </button>
              <button
                onClick={() => { setScreen('compass'); setCompassStep(0); setSubmitMode('compass'); }}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#c8aa4a', fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.9rem' }}
              >
                Find my approach →
              </button>
            </div>
          </div>
        )}

        {/* ── SUBMITTED ────────────────────────────────────────────────────── */}
        {screen === 'submitted' && (
          <div className="tgc-fade" style={{ textAlign:'center', paddingTop:'4rem' }}>
            <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'1.2rem' }}>Brief received</div>
            <h2 className="tgc-serif" style={{ fontWeight:400, fontSize:'clamp(2.5rem,5vw,3.5rem)', marginBottom:'1rem' }}>
              Thank you, {client.firstName || 'for your brief'}.
            </h2>
            <p className="tgc-sans" style={{ color:'#6b7280', fontSize:'1.1rem', lineHeight:1.6, maxWidth:'500px', margin:'0 auto 2rem' }}>
              Your Gatekeeper will review your brief and be in touch to discuss timing, availability, and how to structure the visit.
            </p>
            <button onClick={reset} style={{ background:'#0e4f51', color:'#fff', border:'none', padding:'1rem 2.5rem', cursor:'pointer', fontFamily:"'Lato',sans-serif", fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600, borderRadius:'8px' }}>
              Start again →
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:'4rem', paddingTop:'2rem', borderTop:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
          <a href="/intelligence" className="tgc-mono" style={{ color:'#c8aa4a', textDecoration:'none' }}>← All tools</a>
          <span style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, fontSize:'0.75rem', color:'#6b7280' }}>
            The Gatekeepers Club · Wellness Intelligence v.3 · 18 clinics · 6 philosophies
          </span>
        </div>

      </div>
    </div>
  )
}

// ── BRIEF FORM (shared) ───────────────────────────────────────────────────────

function BriefForm({ client, setClient, submitting, onSubmit, mode }: {
  client: ClientDetails
  setClient: (c: ClientDetails) => void
  submitting: boolean
  onSubmit: () => void
  mode: 'compass' | 'arch'
}) {
  return (
    <div style={{ padding:'2rem', background:'white', border:'1px solid #e5e7eb', borderRadius:'8px' }}>
      <div className="tgc-mono" style={{ color:'#c8aa4a', marginBottom:'1.2rem', fontSize:'0.65rem' }}>Submit your brief</div>
      <p style={{ fontFamily:"'Lato',sans-serif", fontWeight:300, color:'#6b7280', marginBottom:'1.5rem', lineHeight:1.5, fontSize:'0.9rem' }}>
        {mode === 'compass'
          ? 'Your Gatekeeper will review the recommendation and be in touch to discuss timing, availability, and how to structure the visit.'
          : 'Your Gatekeeper will confirm the suggested structure, check availability, and be in touch to discuss logistics.'}
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'0.75rem', marginBottom:'1rem' }}>
        {(['firstName', 'lastName', 'email', 'phone', 'targetMonth'] as const).map(field => (
          <div key={field}>
            <label className="tgc-mono" style={{ display:'block', marginBottom:'0.4rem', fontSize:'0.6rem', color:'#c8aa4a' }}>
              {field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : field === 'targetMonth' ? 'Target month' : field}
            </label>
            <input
              type={field === 'email' ? 'email' : 'text'}
              className="tgc-inp"
              placeholder={field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : field === 'email' ? 'Email address' : field === 'phone' ? 'Phone number' : 'e.g. October 2026'}
              value={client[field]}
              onChange={e => setClient({ ...client, [field]: e.target.value })}
            />
          </div>
        ))}
      </div>
      <div style={{ marginBottom:'1rem' }}>
        <label className="tgc-mono" style={{ display:'block', marginBottom:'0.4rem', fontSize:'0.6rem', color:'#c8aa4a' }}>
          Any other context (optional)
        </label>
        <textarea
          className="tgc-inp"
          rows={3}
          placeholder="Health context, previous clinics, specific questions..."
          value={client.message}
          onChange={e => setClient({ ...client, message: e.target.value })}
          style={{ resize:'vertical', minHeight:'80px' }}
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={submitting || !client.firstName || !client.lastName || !client.email}
        style={{ background:'#0e4f51', color:'#fff', border:'none', padding:'1rem 2.5rem', cursor:'pointer', fontFamily:"'Lato',sans-serif", fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600, opacity:(submitting || !client.firstName || !client.lastName || !client.email) ? 0.4 : 1, transition:'opacity 0.2s', borderRadius:'8px' }}
      >
        {submitting ? 'Sending...' : 'Submit brief →'}
      </button>
    </div>
  )
}
