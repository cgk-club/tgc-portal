/* eslint-disable react/no-unescaped-entities, react/jsx-no-comment-textnodes */
'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useMemo } from 'react'

// ──────────────────────────────────────────────────────────────────────────────
// TGC REAL ESTATE INTELLIGENCE · v1
// Thirty-one micro-markets · three flow families · honest editorial
// Paper #F9F8F5 · Ink #1a1815 · Gold #c8aa4a → #0e4f51
// Cormorant Garamond (display) · Inter (body) · JetBrains Mono (data)
// ──────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'tgc-realestate-mandate-draft'
const CALENDLY_URL = 'https://calendar.app.google/aAsppu4Tju2my9ST7'

// ──────────────────────────────────────────────────────────────────────────────
// MARKET DATA — 31 micro-markets across 4 tiers
// ──────────────────────────────────────────────────────────────────────────────

type PriceBandEntry = { entry?: [number, number]; realistic?: [number, number]; trophy?: [number, number] }

interface RentalRates {
  shortTermWeekPeak?: [number, number]
  shortTermWeekShoulder?: [number, number]
  midTermMonth?: [number, number]
  longTermMonth?: [number, number]
  notes?: string
}

interface Market {
  name: string
  tier: 1 | 2 | 3 | 4
  country: string
  subLabel: string
  region: string
  loudQuiet: { loud: string[]; quiet: string[] }
  editorial: string
  criticalContext?: string
  priceBands: Record<string, PriceBandEntry>
  brochureRealities: string[]
  structuringJurisdiction: string
  coverage: string
  icpRelevance: string
  rentalRates?: RentalRates
  rentalEditorial?: string
  disposalEditorial?: string   // 2026 selling conditions
  typicalBuyer?: string        // who buys here
  saleTimeline?: string        // realistic time to complete
}

const MARKETS: Record<string, Market> = {
  'french-riviera': {
    name: 'French Riviera', tier: 1, country: 'FR',
    subLabel: 'Monaco · Cap Ferrat · Cap d\'Antibes · Mougins · St Tropez',
    region: 'Mediterranean',
    loudQuiet: {
      loud: ['Cap Ferrat peninsula trophy', 'Mougins proper', 'Cap d\'Antibes', 'St Tropez town'],
      quiet: ['Cap d\'Ail', 'Roquebrune', 'Beaulieu-sur-Mer', 'Villefranche-sur-Mer', 'Saint-Paul-de-Vence', 'Valbonne', 'Opio', 'Ramatuelle', 'Gassin'],
    },
    editorial: 'The canonical loud/quiet test. Every trophy postcode has a quiet neighbour at 40-60% of the price. Cap Ferrat itself is a heritage market, thin transactions, mostly off-market, 12-24 month patient hunt the correct framing.',
    priceBands: {
      'Cap Ferrat villa': { entry: [5, 12], realistic: [12, 30], trophy: [30, 100] },
      'Cap d\'Ail / Roquebrune': { entry: [2.5, 5], realistic: [5, 12], trophy: [15, 40] },
      'Mougins / Grasse hills': { entry: [1.5, 3], realistic: [3, 8], trophy: [10, 30] },
      'St Tropez peninsula': { entry: [3, 6], realistic: [6, 18], trophy: [20, 100] },
    },
    brochureRealities: [
      'Cap Ferrat transaction volume: under 50 villas per year',
      'Summer cicadas at 3am in August are genuinely loud',
      'A8 autoroute noise carries further than disclosed',
      'August traffic: 25-minute drives become 2 hours',
      'Winter is quiet and damp, many services close',
    ],
    structuringJurisdiction: 'FR',
    coverage: 'TGC direct network, notaires, architects, property managers. Your TGC contact for high-end mandates: Jez Moore',
    icpRelevance: 'CORE',
    rentalRates: { shortTermWeekPeak: [8000, 50000], shortTermWeekShoulder: [3000, 15000], midTermMonth: [5000, 22000], longTermMonth: [3500, 15000], notes: 'July-August is exceptionally competitive; book 6-12 months ahead for quality villas. Winter availability good but many services close.' },
    rentalEditorial: 'The most active luxury short-term rental market in Europe. Summer peak weeks at €8-50k/week for quality villas. Mid-term (furnished): strong expat and relocation demand year-round, particularly for Cap d\'Ail, Roquebrune, Villefranche. TGC sources off-market through owner networks, not agency portals.',
    disposalEditorial: '2026: Soft above €20M, with trophy assets taking 18-24 months. The €3-12M bracket is more liquid — genuine buyers exist but expectations have reset from the 2021-22 peak. Serious buyers prefer off-market; anything reaching the public portals is regarded with suspicion. Discreet buyer register is TGC\'s default approach for quality mandates. CGT for non-resident sellers: 36.2% headline; structuring at point of sale is critical.',
    typicalBuyer: 'European UHNW (French, Italian, Belgian, Swiss) and Middle East family offices. Monaco-residency-seekers remain active below €10M in adjacent communes (Cap d\'Ail, Roquebrune, Beaulieu). Occasional US family office buyer, typically price-insensitive but patient.',
    saleTimeline: '6-12 months at honest pricing in the €3-12M range. 12-24 months for trophy assets above €15M. Overpriced mandates sit indefinitely.',
  },

  'occitanie': {
    name: 'Occitanie', tier: 1, country: 'FR',
    subLabel: 'Montpellier · Occitanie interior · Minervois · Pic Saint-Loup · Pézenas',
    region: 'Mediterranean Inland',
    loudQuiet: {
      loud: ['Montpellier centre'],
      quiet: ['historic town centre', 'Pézenas', 'Minervois AOC villages', 'Corbières', 'Olargues', 'Minerve'],
    },
    editorial: 'TGC home ground. The quietest serious UHNW market in Western Europe: 30-50% of equivalent Provence pricing, comparable climate, better cultural authenticity. The Occitanie interior is a 7-10 year window of exceptional value. TGC holds exclusive mandates in this region, off-market access available on enquiry.',
    priceBands: {
      'Occitanie interior apartments': { entry: [0.3, 0.5], realistic: [0.5, 0.9], trophy: [0.9, 1.5] },
      'Pézenas / Lodève maisons de maître': { entry: [0.4, 0.8], realistic: [0.8, 1.8], trophy: [2, 5] },
      'Wine domains (Minervois, Corbières)': { entry: [0.8, 2], realistic: [2, 6], trophy: [8, 20] },
    },
    brochureRealities: [
      'Summer heat in inland Languedoc exceeds Provence (38-42°C in August)',
      'Cers and Marin are real regional winds',
      'Thin year-round rental market, lifestyle asset not yielder',
      'SAFER pre-emption rights on rural domains require navigation',
    ],
    structuringJurisdiction: 'FR',
    coverage: 'TGC home market, densest notaire network, direct architect relationships. Exclusive mandates held: contact for off-market access.',
    icpRelevance: 'CORE',
    rentalRates: { shortTermWeekPeak: [800, 5000], shortTermWeekShoulder: [500, 2500], midTermMonth: [1000, 4000], longTermMonth: [700, 2500], notes: 'Growing mid-term market driven by relocation and remote workers. Good value versus Provence and the Riviera. TGC holds direct landlord relationships in Occitanie interior.' },
    rentalEditorial: 'Best-value rental market in southern France with comparable climate to Provence at 40-60% of the rental cost. Mid-term demand is accelerating — remote workers and families settling before purchase. TGC holds exclusive rental relationships in the Occitanie interior, many not publicly listed.',
    disposalEditorial: '2026: Thin transaction volume but patient, motivated buyers exist. Open-market disposal is rarely the right approach here — TGC\'s direct buyer network through notaires and lifestyle contacts consistently outperforms public listing. Wine domains and estates require specialist positioning; buyer pools are narrow but genuinely motivated. Pricing must reflect the scarcity of comparable transactions, not extrapolation from Provence or Languedoc averages.',
    typicalBuyer: 'French UHNW seeking authenticity over address. British and German lifestyle relocators on a longer research horizon. Wine domain buyers (specialist category — producers, enthusiasts, investors). Remote-work transition families who have found the region and want roots. Each requires different marketing language and different channels.',
    saleTimeline: '12-24 months is the realistic range. Patience is rewarded — the right buyer at the right price is better than a discounted sale to the wrong one. TGC\'s Occitanie network often produces off-market matches within 6 months for well-positioned properties.',
  },

  'provence-paca': {
    name: 'Provence (beyond Riviera)', tier: 1, country: 'FR',
    subLabel: 'Luberon · Alpilles · Vaucluse plateau · Haute Provence',
    region: 'Mediterranean Inland',
    loudQuiet: {
      loud: ['Gordes', 'Ménerbes', 'Bonnieux', 'Saint-Rémy-de-Provence', 'Les Baux'],
      quiet: ['Viens', 'Saignon', 'Saint-Martin-de-Castillon', 'Mouriès', 'Sault', 'Banon', 'Forcalquier country'],
    },
    editorial: 'Luberon is now priced against the Cotswolds, no longer a value market. The quiet-Provence thesis (Vaucluse plateau, Haute Provence) is where the next decade of compounding lives.',
    priceBands: {
      'Luberon villages (trophy)': { entry: [1.5, 3], realistic: [3, 8], trophy: [10, 50] },
      'Alpilles (Saint-Rémy axis)': { entry: [1.2, 2.5], realistic: [2.5, 6], trophy: [8, 25] },
      'Quiet Provence (Vaucluse plateau)': { entry: [0.5, 1], realistic: [1, 2.5], trophy: [3, 5] },
    },
    brochureRealities: [
      'Mistral wind: 50-70 km/h for 3-5 days, several times a year',
      'Weekend village traffic in summer can double drive times',
      'Realistic renovation: €4-8k/m² (not €2-3k)',
      'Water rights on rural properties, borehole verification matters',
      'Nearest private aviation: MRS or AVN, neither as convenient as NCE',
    ],
    structuringJurisdiction: 'FR',
    coverage: 'Strong notaire/architect network Luberon and Alpilles; lighter Haute Provence. Your TGC contact for high-end mandates: Jez Moore',
    icpRelevance: 'CORE',
    rentalRates: { shortTermWeekPeak: [2500, 14000], shortTermWeekShoulder: [1200, 6000], midTermMonth: [2000, 8000], longTermMonth: [1400, 5000], notes: 'Luberon peak weeks very competitive July-August. Quiet Provence (Vaucluse plateau) offers significantly better rental value with similar character.' },
    rentalEditorial: 'Luberon short-term is among the most competitive markets in France; good properties are reserved 12 months ahead in peak season. Mid-term and long-term supply is thin but growing. TGC sources direct from owners, not from the oversaturated holiday-villa agency pool.',
    disposalEditorial: '2026: Luberon trophy is softening — the decade-long premium has compressed. Properly presented properties at honest current-market pricing are moving in 8-14 months. Overpriced stock sits. Quiet Provence (Vaucluse plateau, Haute Provence) has a smaller buyer pool but motivated specialist demand. The Alpilles (Saint-Rémy axis) remains the most liquid sub-market in the region.',
    typicalBuyer: 'French UHNW and upper-professional, British second-home buyer (a diminishing but still active segment post-Brexit), Belgian and Swiss lifestyle buyer, fashion and media executives. Haute Provence attracts a quieter, more intellectual buyer profile than trophy Luberon.',
    saleTimeline: '8-14 months at realistic pricing in Luberon and Alpilles. 14-24 months for larger estates and Haute Provence. Renovation projects require specialist buyers and longer search cycles.',
  },

  'paris': {
    name: 'Paris', tier: 1, country: 'FR',
    subLabel: 'Prime 6e · 7e · 8e · 16e · 1er · 4e · 17e',
    region: 'Capital',
    loudQuiet: {
      loud: ['Avenue Montaigne', 'Faubourg Saint-Honoré', 'Place des Vosges', 'Avenue Foch', 'Île Saint-Louis'],
      quiet: ['7e Gros Caillou interior', '16e Muette-Passy back-streets', 'Southern 6e below Saint-Sulpice', 'Eastern 4e Marais'],
    },
    editorial: 'Flat-to-soft since 2022. Post-Brexit Paris has not captured the London outflow that Italy, Monaco and Switzerland have. That makes 2026 a decent entry window for patient capital.',
    priceBands: {
      '6e Saint-Germain (per m²)': { entry: [0.02, 0.035], realistic: [0.035, 0.05], trophy: [0.05, 0.07] },
      '7e Gros Caillou (per m²)': { entry: [0.018, 0.03], realistic: [0.03, 0.04], trophy: [0.04, 0.055] },
      '8e Triangle d\'Or (per m²)': { entry: [0.02, 0.04], realistic: [0.04, 0.055], trophy: [0.055, 0.08] },
      'Hôtel particulier': { entry: [15, 30], realistic: [30, 60], trophy: [60, 100] },
    },
    brochureRealities: [
      'Prime Paris is genuinely noisy, traffic, café terraces, construction',
      'Many Haussmann buildings have thin interior walls',
      'August in Paris is dead, many services close',
      'Bâtiments de France heritage approval required for most prime renovations',
    ],
    structuringJurisdiction: 'FR',
    coverage: 'Dense notaire network 6e/7e/8e/16e; architects experienced with Bâtiments de France. Your TGC contact for high-end mandates: Jez Moore',
    icpRelevance: 'CORE',
    rentalRates: { shortTermWeekPeak: [3500, 16000], shortTermWeekShoulder: [2200, 9000], midTermMonth: [3500, 14000], longTermMonth: [3000, 9000], notes: 'Meublé de tourisme rules restrict short-term letting in Paris proper (90-day max for primary, permit required). Mid-term furnished (bail mobilité, 1-10 months) is the cleanest vehicle and in strong demand. Prime unfurnished long-let: very active 6e/7e/8e/16e.' },
    rentalEditorial: 'One of the world\'s deepest furnished rental markets. Mid-term bail mobilité is the right vehicle for 1-10 months — legally clean, strong supply, no tenancy-rights complications. Prime areas: 6e Saint-Germain, 7e Gros Caillou, 8e Triangle d\'Or. August is quiet, September-June is the active season.',
    disposalEditorial: '2026: Flat-to-soft since 2022 but stabilising. Volume returning to prime arrondissements as the post-inflation plateau settles. Hôtel particulier market remains thin but genuinely active for the right product. Per-m² prices in 6e/7e are holding; 8e is softening at the top. The SCI unwinding question must be resolved before marketing — rushed disposal from poorly structured vehicles erodes net proceeds significantly.',
    typicalBuyer: 'French UHNW and corporate executive (the deepest domestic buyer pool in any European capital). European diplomatic and multinational executive. Occasional Gulf buyer for prestigious Haussmann. The international buyer pool for Paris has narrowed post-2022; domestic French remains the engine.',
    saleTimeline: '6-12 months at honest per-m² pricing in the prime arrondissements. Hôtel particulier: 12-18 months for the right buyer. SCI restructuring or dissolution should be initiated 6-9 months before planned sale.',
  },

  'london-prime': {
    name: 'London Prime', tier: 1, country: 'UK',
    subLabel: 'Mayfair · Belgravia · Knightsbridge · Chelsea · Kensington · Notting Hill',
    region: 'Capital',
    loudQuiet: {
      loud: ['Eaton Square', 'Belgrave Square', 'Cadogan Square', 'Notting Hill proper'],
      quiet: ['Chelsea Old Town conservation area', 'Mayfair mews (Adam\'s Row, Reeves Mews)', 'St John\'s Wood back-roads', 'Holland Park garden-square flats'],
    },
    editorial: 'Our contrarian call: 2026-2027 is a genuine PCL buying window. The post-April-2025 non-dom abolition has depressed prices 5-15% from 2022 peak; structural demand (English law, cultural density) does not disappear because a tax regime shifted. Best value currently: Notting Hill and Chelsea.',
    criticalContext: 'April 2025: non-dom regime abolished. New 4-year FIG regime for qualifying arrivals. Worldwide IHT after 10 years residence. Heavy outflow to Italy/Monaco/Switzerland is the main sell-side driver.',
    priceBands: {
      'Apartments (PCL)': { entry: [2, 5], realistic: [5, 15], trophy: [15, 50] },
      'Mayfair (per m², GBP)': { entry: [0.03, 0.05], realistic: [0.05, 0.06], trophy: [0.06, 0.08] },
      'Chelsea/Kensington townhouse': { entry: [10, 20], realistic: [20, 30], trophy: [30, 50] },
      'Mayfair townhouse': { entry: [15, 25], realistic: [25, 40], trophy: [40, 80] },
    },
    brochureRealities: [
      'SDLT on non-resident £10M second home exceeds 18% on top slab (£1.5M+ in stamp alone)',
      'Service charges on prime buildings run £20-80k/year',
      'Leasehold law: verify lease length (80+ years comfortable, under 60 problematic)',
      'EWS1 cladding form required for many post-2000 buildings',
    ],
    structuringJurisdiction: 'UK',
    coverage: 'Strong PCL agency partnerships both buy and sell; tax barrister relationships for FIG structuring. Jez Moore, senior contact for mandates above £5M.',
    icpRelevance: 'CORE',
    rentalRates: { shortTermWeekPeak: [5000, 28000], shortTermWeekShoulder: [3500, 16000], midTermMonth: [5500, 22000], longTermMonth: [4500, 16000], notes: 'Non-dom outflow has created the best PCL rental supply in five years. Chelsea, Kensington and Notting Hill particularly active. Corporate relocation demand steady from US and Middle East.' },
    rentalEditorial: 'Non-dom abolition has pushed quality PCL supply to a five-year high. Landlords who were sellers are now lettors. Mid-term (3-12 months, furnished) is the most active segment; international families relocating for schools or corporate postings. Best selection September-November and January-March.',
    disposalEditorial: '2026 is the best PCL selling window since 2015. Non-dom abolition has driven meaningful inbound demand from US and Gulf buyers who see post-correction PCL as genuine value against global equivalents. Act while this window is open — the combination of available supply and motivated foreign demand is unusual. NRCGT and SDLT exposure must be modelled before completion. Offshore company structures are almost universally the wrong vehicle now; personal name disposals are cleaner.',
    typicalBuyer: 'US and Gulf UHNW (the primary inbound buyers of 2025-26, on a value play against New York and Dubai). UK domestic upgraders. Corporate purchasers for senior executive accommodation. Chelsea, Kensington, and Notting Hill are the most active sub-markets for volume.',
    saleTimeline: '3-9 months at correctly benchmarked pricing. PCL is currently one of the most liquid UHNW property markets globally. Properties that have been re-priced to 2026 reality — not 2022 expectation — are selling within weeks of discreet launch.',
  },

  'tuscany-umbria': {
    name: 'Tuscany / Umbria / Le Marche', tier: 2, country: 'IT',
    subLabel: 'Chianti · Val d\'Orcia · Maremma · Umbria · Le Marche',
    region: 'Mediterranean Inland',
    loudQuiet: {
      loud: ['Chianti Classico (Radda, Gaiole, Castellina)', 'Val d\'Orcia', 'Cortona', 'Montalcino'],
      quiet: ['Maremma (Scansano, Magliano)', 'Lunigiana', 'Lucca hills', 'Umbria (Perugia/Terni provinces)', 'Le Marche (Urbino, Fermo)'],
    },
    editorial: 'Tuscany trophy is now at London-equivalent pricing. Umbria at 50-60% of Tuscany is the current honest value call. Le Marche is next-wave. The Italian €200k flat tax regime is the biggest single driver of 2025-2026 transaction volume, UK non-dom outflow concentrates here.',
    criticalContext: 'Italian flat tax (€200k annual on foreign income) confirmed through 2026. Up to 15 years. Transformative for UHNW with over €3M foreign income.',
    priceBands: {
      'Tuscan farmhouse': { entry: [0.6, 1.2], realistic: [1.2, 3.5], trophy: [5, 15] },
      'Umbria': { entry: [0.4, 0.85], realistic: [0.85, 2.5], trophy: [3, 8] },
      'Le Marche': { entry: [0.25, 0.5], realistic: [0.5, 1.2], trophy: [2, 4] },
    },
    brochureRealities: [
      'Summer increasingly 38-42°C, AC no longer optional',
      'Winter damp in unheated stone farmhouses, heating refurb €100-200k',
      'Chiantishire is real: some villages 60% expat summer, 20% winter',
      'Italian renovation bureaucracy: 18-36 months common',
      'Cadastral categorisation (agricultural vs residential) critical, verify before offer',
    ],
    structuringJurisdiction: 'IT',
    coverage: 'Partnerships in Chianti/Val d\'Orcia and Umbria; architect network for heritage restoration',
    icpRelevance: 'CORE, UK non-dom exodus',
    rentalRates: { shortTermWeekPeak: [3000, 16000], shortTermWeekShoulder: [1500, 7000], midTermMonth: [2500, 9000], longTermMonth: [1800, 6000], notes: 'Italian flat-tax attracting long-term relocators from UK and US. Supply of quality long-term rental properties in Tuscany improving as flat-tax arrivals buy and then rent their previous properties. Umbria notably underpriced for rentals versus Tuscany.' },
    rentalEditorial: 'Italian flat-tax arrivals are reshaping the mid-term and long-term rental market. Incoming buyers often rent first (6-18 months) to verify the market before committing. Umbria rental supply is genuinely underpriced versus Tuscany. TGC coordinates trial residency periods that often convert to acquisition mandates.',
    disposalEditorial: '2026: Flat-tax demand is driving genuine buyer interest — UK non-doms and US buyers specifically. Tuscany trophy is well-bid at realistic prices; Umbria less liquid but motivated specialist buyers exist and are underserved by the public market. Cadastral categorisation must be verified and resolved before marketing — an agricultural-classified property cannot be positioned as a residential villa. Heritage restoration properties require specialist buyer positioning.',
    typicalBuyer: 'UK non-dom relocator (flat-tax is the primary driver). American lifestyle buyer with Italian cultural affinity. Northern European UHNW (German, Scandinavian, Benelux) seeking Mediterranean base. Italian wealthy domestic buyer for the best Chianti Classico addresses.',
    saleTimeline: '9-18 months in Tuscany for well-positioned properties. 12-24 months in Umbria and Le Marche. Heritage restoration projects attract a narrower but genuine buyer pool; timeline unpredictable.',
  },

  'balearics': {
    name: 'Balearics', tier: 2, country: 'ES',
    subLabel: 'Ibiza · Mallorca · Menorca',
    region: 'Mediterranean Islands',
    loudQuiet: {
      loud: ['Ibiza south/southwest coast', 'Ibiza Town', 'Mallorca Deià-Valldemossa', 'Palma'],
      quiet: ['Ibiza north (San Juan, San Carlos)', 'Mallorca Tramuntana (Sóller, Fornalutx)', 'Mallorca eastern agricultural', 'Menorca entirely'],
    },
    editorial: 'Menorca is the quiet answer to both Ibiza and Mallorca. UNESCO biosphere protection, no club-scene equivalent, yacht-based discretion. 40-50% of comparable Mallorca pricing. If the priority is a Mediterranean island with authenticity, Menorca is the current correct answer.',
    priceBands: {
      'Ibiza finca/villa': { entry: [1.5, 3], realistic: [3, 10], trophy: [15, 40] },
      'Mallorca Deià-Valldemossa': { entry: [2, 4], realistic: [4, 12], trophy: [15, 60] },
      'Mallorca Tramuntana quiet': { entry: [1, 2.5], realistic: [2.5, 6], trophy: [8, 15] },
      'Menorca': { entry: [0.8, 2], realistic: [2, 6], trophy: [8, 15] },
    },
    brochureRealities: [
      'Ibiza summer traffic can double or triple drive times',
      'Balearic Wealth Tax is real, plan for it above €1M net',
      'Ibiza water supply constrained in peak summer',
      'Menorca rental yields are modest, this is lifestyle, not income',
      'Menorca planning permits: 18-30 months typical',
    ],
    structuringJurisdiction: 'ES',
    coverage: 'Specialist partnerships each of the three islands',
    icpRelevance: 'HIGH',
    rentalRates: { shortTermWeekPeak: [4500, 32000], shortTermWeekShoulder: [2000, 12000], midTermMonth: [3000, 12000], longTermMonth: [2200, 8000], notes: 'Tourist rental licence required and increasingly enforced. Book Ibiza peak (July-Aug) 6-12 months ahead. Menorca long-term supply very limited — genuine scarcity. Mallorca off-season mid-term is excellent value.' },
    rentalEditorial: 'Balearics short-term is the most competitive Mediterranean island market. Ibiza peak weeks at €5-30k/week are routinely reserved a year ahead. Menorca is the quiet alternative — longer stays, genuine privacy, far fewer tourist licences competing for good properties. Long-term Menorca is a small but genuine market.',
    disposalEditorial: '2026: Ibiza and Mallorca have softened from the 2022 peak but genuine buyers remain for well-positioned properties. Balearic Wealth Tax creates urgency for some non-Spanish sellers. Tourist rental licence status is now a material factor in valuation — licensed properties command a premium over unlicensed. Menorca is a thin market; specialist buyers exist but timelines are longer.',
    typicalBuyer: 'Northern European UHNW — German, Scandinavian, and British are the three dominant nationalities across all islands. Spanish domestic UHNW for Mallorca Deià-Valldemossa and Palma prime. Ibiza south coast attracts an international entertainment and tech buyer profile.',
    saleTimeline: '6-12 months Ibiza and Mallorca at realistic pricing. 12-18 months Menorca and specialist/unlicensed properties. July-August is a poor time to launch; September-November and February-April are the active buyer seasons.',
  },

  'andalusia': {
    name: 'Andalusia', tier: 2, country: 'ES',
    subLabel: 'Marbella · Sotogrande · Seville · Jerez · Ronda',
    region: 'Mediterranean South',
    loudQuiet: {
      loud: ['Marbella Golden Mile', 'Puerto Banús', 'Nueva Andalucía'],
      quiet: ['Sotogrande', 'La Zagaleta', 'Estepona old town', 'Seville historic (Alfalfa, Santa Cruz)', 'Jerez', 'Ronda pueblos blancos'],
    },
    editorial: 'Inland Andalusia is Spain\'s outstanding value play: a restored 400m² cortijo near Ronda at €2-3M is the Umbrian equivalent at half the price. La Zagaleta is the Costa del Sol\'s genuine UHNW answer at 30-50% below Golden Mile pricing. And Andalusia eliminated regional wealth tax, a material UHNW planning factor.',
    priceBands: {
      'Marbella Golden Mile': { entry: [2, 4], realistic: [4, 12], trophy: [15, 40] },
      'La Zagaleta / Sotogrande': { entry: [3, 6], realistic: [6, 18], trophy: [25, 50] },
      'Inland Andalusia': { entry: [0.5, 1.5], realistic: [1.5, 4], trophy: [5, 12] },
    },
    brochureRealities: [
      'Marbella summer tourist-overrun: 80% drive-time inflation July-August',
      'Costa del Sol construction quality varies wildly by development',
      'Gibraltar proximity: tax/travel implications both sides of border',
      'Inland Andalusia: English-speaking professional services thinner',
      'Pueblos blancos (Ronda area): cold and wet in winter',
    ],
    structuringJurisdiction: 'ES',
    coverage: 'Keith Kirwen, Marbella/Sotogrande specialist; Seville/Jerez network',
    icpRelevance: 'HIGH',
    rentalRates: { shortTermWeekPeak: [2500, 14000], shortTermWeekShoulder: [1200, 6000], midTermMonth: [2000, 8000], longTermMonth: [1500, 5500], notes: 'Marbella mid-term (3-6 months, winter season) is very active. La Zagaleta and Sotogrande long-term supply thin but growing. Inland Andalusia rentals extremely affordable and largely untapped.' },
    rentalEditorial: 'Andalusia mid-term is the winter season — October through April. International families and executives who base from Marbella or Sotogrande during the European cold months. Inland Andalusia (Ronda area) has almost no rental infrastructure, making it TGC-sourced or nothing.',
    disposalEditorial: '2026: One of the strongest selling markets in Europe. Zero-wealth-tax is drawing significant Gulf and American inbound demand, particularly in Marbella, La Zagaleta, and Sotogrande. The Golden Triangle (Marbella-Benahavís-Estepona) is seeing competitive buyer interest. Inland Andalusia (Ronda area) requires specialist positioning — the buyer pool is narrow but motivated and typically un-serviced by the main agencies.',
    typicalBuyer: 'Gulf UHNW (the dominant inbound buyer group since 2023, particularly for La Zagaleta and Golden Mile). British (declining but still active). Scandinavian and Northern European lifestyle buyer for Estepona and inland. American buyer for Sotogrande (polo community). Spanish domestic UHNW for the best Marbella addresses.',
    saleTimeline: '4-10 months in Marbella Golden Mile and La Zagaleta at market pricing. 8-14 months Sotogrande. 12-24 months inland Andalusia — the buyer pool is genuine but narrow.',
  },

  'cote-basque-aquitaine': {
    name: 'Côte Basque / Nouvelle-Aquitaine', tier: 2, country: 'FR',
    subLabel: 'Biarritz · Cap Ferret · Bordeaux · Dordogne',
    region: 'Atlantic',
    loudQuiet: {
      loud: ['Biarritz', 'Cap Ferret (Arcachon)', 'Saint-Émilion named châteaux'],
      quiet: ['French Basque interior (Espelette, Sare, Ainhoa)', 'Bordeaux Chartrons', 'Dordogne bastides'],
    },
    editorial: 'Bordeaux city prime is genuinely undervalued: a 250m² Chartrons hôtel at €1.8M is what a 120m² Saint-Germain apartment costs in Paris. Dordogne is a mature, fairly priced British-UHNW rural market. Biarritz has tightened, French UHNW\'s favourite second city after Paris.',
    priceBands: {
      'Biarritz': { entry: [0.8, 1.8], realistic: [1.8, 6], trophy: [8, 20] },
      'Cap Ferret (Arcachon)': { entry: [1.5, 3.5], realistic: [3.5, 10], trophy: [12, 30] },
      'Bordeaux city prime': { entry: [0.6, 1.2], realistic: [1.2, 3.5], trophy: [4, 12] },
      'Bordeaux wine châteaux': { entry: [3, 8], realistic: [8, 25], trophy: [50, 500] },
      'Dordogne / Périgord': { entry: [0.3, 0.7], realistic: [0.7, 2], trophy: [3, 8] },
    },
    brochureRealities: [
      'Biarritz Atlantic weather is not Mediterranean',
      'Basque culture is distinct (language, regionalist identity)',
      'Wine-château ownership is operationally demanding, single frost year destroys vintage income',
      'Dordogne wet-year flooding can be genuinely disruptive',
      'Bordeaux city traffic has worsened materially since 2020',
    ],
    structuringJurisdiction: 'FR',
    coverage: 'Biarritz specialist; direct Bordeaux notaire relationships; wine-industry advisors for châteaux. Your TGC contact for high-end mandates: Jez Moore',
    icpRelevance: 'MEDIUM-HIGH',
    rentalRates: { shortTermWeekPeak: [2000, 12000], shortTermWeekShoulder: [900, 4500], midTermMonth: [1600, 6000], longTermMonth: [1200, 4000], notes: 'Biarritz peak (July-Aug) highly competitive. Cap Ferret increasingly popular, limited supply. Bordeaux city furnished monthly supply growing. Dordogne mainly British-network owner rentals.' },
    rentalEditorial: 'Biarritz short-term is very active; good properties in July-August need 9-12 months lead time. Bordeaux city furnished rental is an underexploited mid-term market — excellent quality of life and TGV connection to Paris (2h04) makes it attractive for Paris-escaping families.',
    disposalEditorial: '2026: Biarritz is well-bid for sea-facing properties. Cap Ferret/Arcachon is tightly held — sellers rarely appear voluntarily, and buyers queue. Bordeaux city prime has softened from its 2021 peak as remote-work demand normalised. Wine châteaux require specialist preparation — valuation is complex and buyers are sophisticated; mispriced mandates damage the asset.',
    typicalBuyer: 'French UHNW (Biarritz has a deep domestic French buyer base unlike most coastal markets). Belgian and Swiss lifestyle buyer. Bordeaux wine investors and producers. British second-home buyer for Dordogne (legacy segment, still active). Cap Ferret is almost exclusively French — one of the most intensely domestic UHNW markets in France.',
    saleTimeline: '6-12 months Biarritz sea-facing. Cap Ferret: rare mandates find buyers quickly through the right network. Bordeaux city: 8-14 months. Wine châteaux: 12-30 months depending on appellations and vineyard economics.',
  },

  'auvergne-rhone-alpes': {
    name: 'Auvergne-Rhône-Alpes', tier: 2, country: 'FR',
    subLabel: 'Lyon · Annecy · Lake Bourget · inland Savoie',
    region: 'Alpine Foothills',
    loudQuiet: {
      loud: ['Annecy lake-shore (Talloires, Menthon, Veyrier-du-Lac)'],
      quiet: ['Lyon 6e, 2e', 'Annecy back villages', 'Lake Bourget (Aix-les-Bains)'],
    },
    editorial: 'Lyon is the best-value large-city UHNW real estate in France: 25-40% of Paris pricing for comparable quality of life, 2h to Paris or Geneva by rail. Lake Bourget offers 70% of Lake Annecy\'s aesthetic at 40% of the price.',
    priceBands: {
      'Lyon 6e apartments': { entry: [0.5, 1], realistic: [1, 2.5], trophy: [3, 8] },
      'Annecy lake-shore': { entry: [1, 2], realistic: [2, 6], trophy: [8, 25] },
      'Inland Savoie / Lake Bourget': { entry: [0.4, 0.8], realistic: [0.8, 2], trophy: [3, 6] },
    },
    brochureRealities: [
      'Lake Annecy overpriced for its size',
      'Lyon under-marketed internationally but has deep French UHNW base',
    ],
    structuringJurisdiction: 'FR',
    coverage: 'Lyon direct notaire; Annecy local advisor; inland Savoie via partner',
    icpRelevance: 'MEDIUM',
  },

  'alpine-ski': {
    name: 'Alpine Ski', tier: 2, country: 'FR/CH',
    subLabel: 'Courchevel · Verbier · St Moritz · Gstaad · Megève · Chamonix · Zermatt',
    region: 'Alps',
    loudQuiet: {
      loud: ['Courchevel 1850', 'Saint Moritz core', 'Gstaad Obere Gstaad', 'Verbier Savoleyres'],
      quiet: ['Méribel-Village', 'Courchevel La Tania', 'Les Allues', 'Saint Moritz Surlej', 'Gstaad Saanenmöser', 'Verbier back-slopes'],
    },
    editorial: 'Trophy chalets have compounded 6-10% annually for the last decade, past peak. The next cycle of demand is UK non-dom outflow (Saint Moritz particularly, via Swiss lump-sum taxation) and Middle East family offices.',
    priceBands: {
      'Courchevel 1850': { entry: [5, 10], realistic: [10, 30], trophy: [40, 100] },
      'Verbier': { entry: [3, 7], realistic: [7, 20], trophy: [25, 60] },
      'Saint Moritz': { entry: [4, 10], realistic: [10, 30], trophy: [40, 120] },
      'Gstaad': { entry: [4, 9], realistic: [10, 30], trophy: [50, 200] },
      'Megève': { entry: [2, 5], realistic: [5, 15], trophy: [20, 50] },
      'Chamonix': { entry: [1, 2.5], realistic: [2.5, 8], trophy: [10, 25] },
      'Quiet alternatives (Méribel-Village, La Tania)': { entry: [1.5, 3], realistic: [3, 8], trophy: [10, 20] },
    },
    brochureRealities: [
      'Snow reliability at lower altitudes genuinely weakening',
      'Summer is increasingly the second season, plan for year-round',
      'Ski-in/ski-out premium: 30-60% over ski-bus positions',
      'Chalet running costs: €150-300k/year on a €10M asset',
      'Renovation: €3-5k/m²',
      'Lex Koller constrains non-EU/EFTA purchase of Swiss chalets',
    ],
    structuringJurisdiction: 'FR or CH',
    coverage: 'Courchevel/Méribel specialist; St Moritz Swiss partner; Gstaad separate partner',
    icpRelevance: 'HIGH',
    rentalRates: { shortTermWeekPeak: [15000, 80000], shortTermWeekShoulder: [5000, 20000], midTermMonth: [8000, 35000], longTermMonth: [6000, 25000], notes: 'Winter peak (Christmas-NY, Feb half-term) at premium. Summer season increasingly active year-round. Ski-in/ski-out adds 30-40% premium. Many chalets owner-occupied, TGC-sourced off-market is the only way to access quality.' },
    rentalEditorial: 'Alpine chalet rental is among the highest-value short-term markets in Europe. Christmas-NY and February half-term weeks for trophy chalets reach €30-80k/week. TGC sources from the owner-managed network rather than the public agency pool — the quality difference is significant.',
    disposalEditorial: '2026: Trophy chalet market has softened after a decade of compounding — peak-2022 pricing is not achievable and attempts to hold it extend timelines significantly. UK non-dom exit is driving some St Moritz mandates. Verbier and Courchevel remain more liquid than Gstaad at comparable price points. Chalet running costs (€150-300k/year on a €10M asset) create seller motivation that buyers understand and factor into negotiation. Lex Koller resale restrictions for Swiss properties must be navigated carefully for non-EU/EFTA sellers.',
    typicalBuyer: 'Gulf and Asian UHNW (increasingly dominant, particularly Gstaad and St Moritz). European private equity families. UK non-dom entering Swiss lump-sum structuring. French UHNW for Courchevel and Megève. The pool of credible buyers for €20M+ chalets is genuinely small — 100-200 globally. TGC reaches this pool through discreet register, not public marketing.',
    saleTimeline: '12-24 months for trophy. 8-14 months for well-priced Megève and Chamonix. Launching outside the ski season (May-September) is productive — buyers plan purchases in summer for winter use.',
  },

  'geneva-lake': {
    name: 'Geneva / Lake Geneva', tier: 2, country: 'CH/FR',
    subLabel: 'Cologny · Lavaux · Vaud lake · French-side (Thonon, Évian)',
    region: 'Alpine Lakes',
    loudQuiet: {
      loud: ['Cologny', 'Vandœuvres', 'Montreux trophy lakefront'],
      quiet: ['Corsier', 'Anières', 'Lavaux UNESCO wine villages (Cully, Epesses, Saint-Saphorin)', 'Thonon-les-Bains', 'Évian', 'Yvoire'],
    },
    editorial: 'Lex Koller constrains Swiss purchase heavily for non-EU/EFTA. Lavaux terrace villages are the quiet-value answer, restored vigneron houses at CHF 4-8M vs CHF 15-25M for equivalent Cologny views. The French side (outside Lex Koller) is 30-50% of Swiss-side pricing for the same lake.',
    priceBands: {
      'Cologny / Vandœuvres (CHF)': { entry: [5, 10], realistic: [10, 30], trophy: [40, 150] },
      'Lavaux terraces (CHF)': { entry: [2, 5], realistic: [5, 12], trophy: [15, 40] },
      'Montreux / Vevey (CHF)': { entry: [2, 5], realistic: [5, 15], trophy: [20, 80] },
    },
    brochureRealities: [
      'Geneva winter grey/overcast for extended periods (the "bise noire" fog)',
      'Lex Koller commune-level approvals can be unpredictable',
      'Swiss private banking opening: demanding process for non-EU UHNW',
    ],
    structuringJurisdiction: 'CH',
    coverage: 'Swiss private-client-advisor partnership; Lavaux specialist; direct French-side notaire',
    icpRelevance: 'HIGH, UK non-dom anchor via lump-sum taxation',
    rentalRates: { shortTermWeekPeak: [4000, 18000], shortTermWeekShoulder: [2500, 9000], midTermMonth: [4500, 14000], longTermMonth: [3800, 11000], notes: 'Swiss rental market highly regulated; furnished residential permits required for stays over 90 days. Very active international corporate and diplomatic rental community. French side (Thonon, Évian) 40-50% cheaper than Swiss side with same lake quality.' },
    rentalEditorial: 'Geneva is one of Europe\'s most active mid-to-long-term corporate relocation markets — international organisations, private banks, family offices. Demand persistently exceeds supply at the quality end. French side of the lake offers exceptional value for families who can absorb a 20-minute commute.',
    disposalEditorial: '2026: International demand steady, particularly from corporate and financial sector buyers. Cologny and Vandœuvres lakefront are robust — scarcity keeps values firm. Lavaux terrace villages are niche but motivated specialist buyers exist. The French side (Thonon, Évian) is more liquid but at lower absolute values. Lex Koller resale restrictions require careful navigation for any property purchased under cantonal approval.',
    typicalBuyer: 'International corporate executive and family office (Geneva\'s permanent resident base). Gulf and Asian UHNW seeking Swiss structuring. French UHNW for the French side. Private banking professionals — Cologny has one of the deepest domestic high-net-worth buyer pools in Switzerland.',
    saleTimeline: '9-18 months for prime Cologny/lakefront. 12-18 months for Lavaux specialty. French side: 8-14 months. Lex Koller properties require 3-4 months additional administrative timeline.',
  },

  'croatia': {
    name: 'Croatia', tier: 2, country: 'HR',
    subLabel: 'Dubrovnik · Hvar · Brač · Korčula · Istria',
    region: 'Adriatic',
    loudQuiet: {
      loud: ['Dubrovnik Old Town', 'Hvar Town', 'Split Varoš', 'Rovinj', 'Poreč'],
      quiet: ['Pelješac peninsula', 'Lastovo', 'Vis', 'Inland Hvar (Stari Grad, Jelsa)', 'Istria interior (Motovun, Grožnjan, Buzet)'],
    },
    editorial: 'Our contrarian call: Istria in 2026-2028 is what Umbria was in 2015-2020. Medieval Italian-influenced hill-towns at 30-40% of Tuscany/Umbria pricing, with Venice three hours away. The Dalmatian islands are mid-cycle, Dubrovnik overrun in summer.',
    priceBands: {
      'Dubrovnik Old Town apartments': { entry: [0.5, 1], realistic: [1, 3], trophy: [4, 12] },
      'Hvar / Korčula / Brač villas': { entry: [0.5, 1.2], realistic: [1.2, 4], trophy: [5, 12] },
      'Istria hill-towns': { entry: [0.3, 0.7], realistic: [0.7, 1.8], trophy: [3, 6] },
      'Pelješac peninsula': { entry: [0.4, 0.9], realistic: [1, 2.5], trophy: [4, 7] },
    },
    brochureRealities: [
      'Cadastral and land-registry legacy issues from Yugoslav era',
      'Some properties have unresolved 1990s restitution claims',
      'Island infrastructure: ferries, electricity, water vary',
      'Dubrovnik May-October is tourist-saturated',
    ],
    structuringJurisdiction: 'HR',
    coverage: 'Dubrovnik firm; emerging Hvar and Istria direct coverage',
    icpRelevance: 'MEDIUM-HIGH, Istria particularly',
    rentalRates: { shortTermWeekPeak: [2500, 14000], shortTermWeekShoulder: [1200, 6000], midTermMonth: [1800, 6000], longTermMonth: [1400, 4500], notes: 'Hvar and Dalmatian island short-term very active Jun-Sep. Istria short-term growing. Mid-term limited, mostly digital-nomad and remote-worker demand. Dubrovnik mid-term constrained by tourism overcrowding regulations.' },
    rentalEditorial: 'Croatian short-term is a strong summer season market. Istria, our contrarian mid-term call, is building a quiet rental base for the coming years — good-value farmhouse and hilltop village rentals for clients exploring the market before committing to purchase.',
    disposalEditorial: '2026: Dubrovnik overvalued relative to comparable EU island markets — realistic repricing required. Hvar and the Dalmatian islands are mid-cycle with genuine Northern European buyer demand. Istria is TGC\'s contrarian call — a growing pool of lifestyle buyers discovering the region positions it well for sellers. Cadastral and land-registry verification is non-negotiable before marketing; unresolved Yugoslav-era issues will derail any sale.',
    typicalBuyer: 'Northern and Western European lifestyle buyer (German, Austrian, Scandinavian, Dutch). Emerging tech and media executive class. Croatian diaspora returning. British buyer for Dalmatian islands (residual segment).',
    saleTimeline: '6-12 months Istria and well-positioned Dalmatian properties. Dubrovnik Old Town apartments: 12-18 months at honest pricing. Hvar: seasonal — spring launches for summer buyer activity.',
  },

  'montenegro': {
    name: 'Montenegro', tier: 3, country: 'ME',
    subLabel: 'Bay of Kotor · Luštica Bay · Porto Montenegro · Porto Novi',
    region: 'Adriatic',
    loudQuiet: {
      loud: ['Budva coast', 'Porto Montenegro Tivat'],
      quiet: ['Luštica Bay', 'Perast', 'Dobrota', 'Prčanj', 'Herceg Novi'],
    },
    editorial: 'Highest-conviction capital-appreciation play on the Mediterranean coast for 2026-2030, conditional on 2028 EU accession. Downside scenario: prices plateau. Kotor Bay heritage villages (Perast, Dobrota, Prčanj) are our strongest single recommendation, UNESCO-protected, scarcity premium new development cannot erode.',
    criticalContext: 'EU accession expected 2028. Residency by investment from €150k. Historic precedent: Croatia pre-2013 saw 30-50% appreciation into accession. Critical due diligence: "List Nepokretnosti" Teret check for legalisation status, pre-2010 properties often built without full permits.',
    priceBands: {
      'Porto Montenegro (per m²)': { entry: [0.008, 0.01], realistic: [0.01, 0.012], trophy: [0.012, 0.018] },
      'Luštica Bay (per m²)': { entry: [0.006, 0.008], realistic: [0.008, 0.012], trophy: [0.012, 0.018] },
      'Kotor Bay heritage villages': { entry: [0.4, 0.8], realistic: [1, 3], trophy: [4, 10] },
    },
    brochureRealities: [
      'Tivat airport is small; international connections via Dubrovnik or Podgorica',
      'Winter is quiet Oct-April; many services close',
      'Infrastructure behind Croatia',
      'Property management services developing',
      'The "List Nepokretnosti" Teret check: NOT optional',
    ],
    structuringJurisdiction: 'ME',
    coverage: 'Porto Montenegro/Kotor specialist firm; Montenegrin legal partner',
    icpRelevance: 'HIGH, investment/capital-appreciation clients',
  },

  'greece': {
    name: 'Greece', tier: 3, country: 'GR',
    subLabel: 'Athens Riviera · quiet Cyclades · Peloponnese · Corfu',
    region: 'Mediterranean',
    loudQuiet: {
      loud: ['Mykonos town', 'Santorini Oia / Imerovigli', 'Athens Kolonaki'],
      quiet: ['Tinos', 'Folegandros', 'Sifnos', 'Antiparos', 'Amorgos', 'Athens Kifisia', 'Peloponnese Mani', 'Kardamyli', 'Patmos', 'Ithaca', 'Paxos'],
    },
    editorial: 'Athens has undergone a genuine renaissance since 2020. The Athens Riviera (Glyfada-Vouliagmeni-Lagonissi axis) is our best mid-term Greek call. The quiet Cyclades, Tinos, Folegandros, Sifnos, Antiparos, are our strong recommendation over Mykonos/Santorini. The Peloponnese (Mani, Kardamyli) is the serious underdog.',
    priceBands: {
      'Athens Riviera': { entry: [0.7, 1.5], realistic: [1.5, 5], trophy: [8, 25] },
      'Mykonos trophy villas': { entry: [2, 4], realistic: [4, 15], trophy: [18, 50] },
      'Quiet Cyclades': { entry: [0.5, 1.2], realistic: [1.2, 4], trophy: [5, 12] },
      'Peloponnese (Mani)': { entry: [0.4, 0.9], realistic: [0.9, 3], trophy: [4, 10] },
      'Corfu / Paxos': { entry: [0.6, 1.5], realistic: [1.5, 4], trophy: [5, 15] },
    },
    brochureRealities: [
      'Greek bureaucracy: transactions typically 4-6 months',
      'Island properties often have complex family-ownership histories',
      'Meltemi (July-August) restricts boat access on some days',
      'Off-season island services vary wildly, some close entirely',
    ],
    structuringJurisdiction: 'GR',
    coverage: 'Athens-based firm covering Riviera and Cyclades; Peloponnese specialist; emerging Corfu relationship',
    icpRelevance: 'MEDIUM-HIGH',
    rentalRates: { shortTermWeekPeak: [3500, 28000], shortTermWeekShoulder: [1500, 8000], midTermMonth: [2000, 8000], longTermMonth: [1500, 5500], notes: 'Mykonos and Santorini peak weeks among Europe\'s most expensive per-m². Quiet Cyclades (Tinos, Sifnos) at 30-40% of the price. Athens Riviera mid-term is a growing market for family relocation. Golden Visa holders increasingly renting Athens apartments while seeking acquisition.' },
    rentalEditorial: 'Greek island short-term at the top end rivals the Riviera for weekly rates while offering significantly more space and privacy. Athens Riviera is a growing mid-term relocation market with a genuine international community and improving infrastructure. TGC sources the quiet islands — Tinos, Sifnos, Paxos — which the public market barely covers.',
    disposalEditorial: '2026: Athens Riviera is the strongest disposal market in Greece — genuine buyers and improving liquidity. Island villas have softened from 2022 peaks; realistic sellers are finding buyers, optimistic ones are not. Golden Visa threshold increases have shifted buyer composition. Complex island property titles (family-ownership histories, boundary disputes) must be resolved before marketing — a title issue discovered mid-sale kills transactions.',
    typicalBuyer: 'Golden Visa investors (Gulf, Chinese, and Israeli profiles dominant post-2024 threshold increase). Northern European lifestyle buyer for Cyclades and Corfu. Athens Riviera attracts Greek diaspora returnees and European corporate buyers. Quiet Cyclades (Sifnos, Paxos) are specialist — buyers are informed, patient, and price-aware.',
    saleTimeline: '8-16 months Athens Riviera and main islands. Quiet Cyclades and Peloponnese: 12-24 months — the buyer pool is smaller but genuine. Island properties with title complexity: add 6-12 months for resolution before marketing.',
  },

  'western-cape': {
    name: 'Western Cape (South Africa)', tier: 3, country: 'ZA',
    subLabel: 'Cape Town · Franschhoek · Stellenbosch · Hermanus · Constantia',
    region: 'Southern Africa',
    loudQuiet: {
      loud: ['Cape Town Atlantic Seaboard (Clifton, Camps Bay, Bantry Bay, Fresnaye)', 'Franschhoek centre', 'Stellenbosch main estates'],
      quiet: ['Constantia', 'Bishopscourt', 'Hermanus residential', 'Paarl wine estates', 'Riebeek Valley', 'Greyton'],
    },
    editorial: 'The most ZAR/EUR currency-arbitraged UHNW market in the world. A €2M budget buys a genuine Franschhoek wine estate that would require €8-15M in Tuscany or Provence. But this is a lifestyle-first asset with currency-arbitrage bonus, not a pure capital-appreciation play. ZAR volatility is both the opportunity and the risk.',
    criticalContext: 'Franschhoek: average price tripled R2.5M to R7.5M 2020-2025. Western Cape residential inflation 8.7% Jan 2025 (national 5.2%). Franschhoek Winelands Airport opens 2026. Foreign buyers now 32% of Franschhoek luxury transactions.',
    priceBands: {
      'Atlantic Seaboard (Clifton, Camps Bay)': { entry: [0.75, 1.25], realistic: [1.5, 3], trophy: [4, 10] },
      'Constantia / Bishopscourt': { entry: [0.6, 1], realistic: [1.25, 3], trophy: [4, 7.5] },
      'Franschhoek': { entry: [0.3, 0.6], realistic: [0.75, 2], trophy: [2.5, 7.5] },
      'Stellenbosch': { entry: [0.25, 0.5], realistic: [0.6, 1.5], trophy: [2, 5] },
      'Hermanus': { entry: [0.25, 0.6], realistic: [0.75, 2], trophy: [2.5, 5] },
    },
    brochureRealities: [
      'Load-shedding improved since 2023, off-grid capability (solar, borehole) now standard on UHNW properties',
      'Security: gated estates and electric fences are lifestyle normalcy, not red flag',
      'Medical: world-class private system in Cape Town, thinner in Winelands',
      'Wildfire risk in Cape Winelands is real',
      'Drought risk (Day Zero 2018), water security matters',
    ],
    structuringJurisdiction: 'ZA',
    coverage: 'Cape Town/Winelands partner firm; SA law firms for non-resident structuring; SARB clearance specialists',
    icpRelevance: 'HIGH, winter-lifestyle clients',
  },

  'namibia': {
    name: 'Namibia', tier: 3, country: 'NA',
    subLabel: 'Windhoek · Swakopmund · private reserves',
    region: 'Southern Africa',
    loudQuiet: {
      loud: ['Windhoek Klein Windhoek', 'Swakopmund beachfront'],
      quiet: ['Private reserves (Damaraland, Kalahari, Etosha-adjacent)'],
    },
    editorial: 'Not an investment market in the conventional sense, a lifestyle-and-conservation purchase. Our view is that Namibia mandates should be rare and highly specific. For most UHNW wanting an Africa base, Cape Town Constantia or Hermanus is the better answer. Namibia is right when conservation is the driving motivation.',
    priceBands: {
      'Windhoek residential': { entry: [0.15, 0.3], realistic: [0.3, 0.75], trophy: [0.75, 1.5] },
      'Swakopmund coastal': { entry: [0.15, 0.4], realistic: [0.4, 1] },
      'Private reserves': { entry: [1, 3], realistic: [4, 10], trophy: [15, 50] },
    },
    brochureRealities: [
      'Infrastructure thin outside Windhoek and Swakopmund',
      'Medical evacuation insurance: essential for reserve ownership',
      'Reserve operations are genuinely labor-intensive',
      'Bank of Namibia clearance for capital repatriation',
    ],
    structuringJurisdiction: 'NA',
    coverage: 'Namibian legal partner; conservation-advisory for reserve M&A',
    icpRelevance: 'LOW, niche but specific',
  },

  'pyrenees': {
    name: 'Pyrenees', tier: 3, country: 'FR/ES/AD',
    subLabel: 'Cerdanya · Val d\'Aran · Pau · Jaca · Andorra',
    region: 'Mountains',
    loudQuiet: {
      loud: ['Baqueira-Beret', 'Andorra la Vella'],
      quiet: ['Cerdanya villages', 'Pau historic', 'Jaca', 'Basque-Pyrenees interior'],
    },
    editorial: 'The quiet alternative to both the Alps (for winter sports) and rural France/Spain (for authenticity). Pricing materially below Alpine equivalents. Andorra has attractive tax but thinner European integration than Monaco or Switzerland.',
    priceBands: {
      'Cerdanya': { entry: [0.4, 0.8], realistic: [0.8, 2.5], trophy: [3, 7] },
      'Val d\'Aran': { entry: [0.5, 1.2], realistic: [1.2, 3], trophy: [4, 8] },
      'Pau prime': { entry: [0.3, 0.6], realistic: [0.6, 1.5], trophy: [2, 5] },
      'Andorra': { entry: [0.3, 0.6], realistic: [0.6, 1.5], trophy: [2, 5] },
    },
    brochureRealities: [
      'Celebrity density is low, which is the point',
      'Andorra banking integration less seamless than Monaco/CH',
    ],
    structuringJurisdiction: 'FR/ES/AD',
    coverage: 'Pau-based French lawyer; Val d\'Aran Catalan specialist; coverage lighter than Tier 1-2',
    icpRelevance: 'LOW-MEDIUM',
  },

  'miami-palm-beach': {
    name: 'Miami / Palm Beach', tier: 4, country: 'US',
    subLabel: 'Miami Beach · Coral Gables · Key Biscayne · Palm Beach',
    region: 'United States',
    loudQuiet: {
      loud: ['Miami Beach', 'Palm Beach island S Ocean Blvd'],
      quiet: ['Coral Gables', 'Key Biscayne', 'Palm Beach North End'],
    },
    editorial: 'US UHNW second-home concentration. Palm Beach "season" (mid-November through Easter) drives the calendar. TGC adds editorial layer and cross-border tax coordination; ground execution through Knight Frank and Sotheby\'s partners.',
    priceBands: {
      'Miami Beach apartments (USD)': { entry: [2, 5], realistic: [5, 12], trophy: [12, 20] },
      'Coral Gables / Coconut Grove (USD)': { entry: [3, 6], realistic: [6, 10], trophy: [10, 15] },
      'Palm Beach oceanfront (USD)': { entry: [8, 20], realistic: [20, 50], trophy: [50, 100] },
    },
    brochureRealities: [
      'Hurricane insurance is real, confirm property-specific exposures',
      'FIRPTA compliance required for non-US-resident sellers',
    ],
    structuringJurisdiction: 'US',
    coverage: 'Palm Beach Sotheby\'s and Miami Knight Frank partnerships; US tax advisor for cross-border',
    icpRelevance: 'MEDIUM',
  },

  'amsterdam': {
    name: 'Amsterdam', tier: 2, country: 'NL',
    subLabel: 'Jordaan · Oud-Zuid · De Pijp · Amstelveen · Watergraafsmeer',
    region: 'Benelux',
    loudQuiet: {
      loud: ['Jordaan tourist core', 'Leidseplein / Rembrandtplein', 'Vondelpark north side'],
      quiet: ['Jordaan south (quieter streets)', 'Oud-Zuid residential', 'Amstelveen (family, greenery)', 'Amsterdam-West (Baarsjes, Bos en Lommer)'],
    },
    editorial: 'Amsterdam is one of Europe\'s primary corporate relocation cities — international organisations, tech companies, finance. The rental market is structurally undersupplied at the quality end. Buying is constrained (foreigner purchase possible but market tight); renting first while evaluating is the correct approach for most arrivals.',
    priceBands: {
      'Oud-Zuid apartments (per m²)': { entry: [0.006, 0.009], realistic: [0.009, 0.013], trophy: [0.013, 0.018] },
      'Jordaan / Canal belt': { entry: [0.007, 0.011], realistic: [0.011, 0.016], trophy: [0.016, 0.022] },
      'Amstelveen family houses': { entry: [0.8, 1.5], realistic: [1.5, 2.8], trophy: [3, 5] },
    },
    brochureRealities: [
      'Expat rental market is highly competitive — quality 4-bed family homes are genuinely scarce',
      'Cycling is not optional: school runs, grocery, social life all use bikes',
      'Amsterdam winter (Nov-Feb) is grey and wet, with short days',
      'Ground-floor apartments: flooding risk, check historical data',
      'Service charges on canal-house buildings can be substantial',
    ],
    structuringJurisdiction: 'NL',
    coverage: 'Benelux network via TGC European expansion; local relocation-specialist partner',
    icpRelevance: 'HIGH, relocation and mid-term',
    rentalRates: { shortTermWeekPeak: [2500, 10000], shortTermWeekShoulder: [1800, 6000], midTermMonth: [3500, 10000], longTermMonth: [3000, 8000], notes: 'Market structurally undersupplied at quality end. Mid-term corporate lets very competitive. Family homes (4+ bedrooms) in Oud-Zuid and Amstelveen are particularly scarce. Rental prices have risen 20%+ since 2022 despite government caps on social sector.' },
    rentalEditorial: 'Amsterdam\'s quality family rental market is one of the tightest in Europe. Corporate families relocating for international organisations (UN, EU agencies) or tech companies often wait months for the right property. TGC engages the off-market landlord network directly — the difference between finding something in 4 weeks versus 4 months.',
  },

  'lisbon-porto': {
    name: 'Lisbon / Porto', tier: 2, country: 'PT',
    subLabel: 'Lisbon Príncipe Real · Lapa · Chiado · Porto Foz · Bonfim',
    region: 'Iberia Atlantic',
    loudQuiet: {
      loud: ['Lisbon Alfama tourist core', 'Porto Ribeira', 'Cascais beachfront'],
      quiet: ['Lisbon Príncipe Real', 'Lapa', 'Estrela', 'Porto Foz / Nevogilde', 'Bonfim', 'Estoril corridor'],
    },
    editorial: 'Portugal\'s Non-Habitual Resident (NHR) regime was revised in 2024 (replaced by IFICI), closing some advantages. The country remains competitive: no inheritance tax between direct family, mild wealth tax exposure, and a quality of life proposition that remains underpriced versus comparable Western European cities. Porto is our current stronger call — less tourist pressure, better value, growing international community.',
    criticalContext: 'NHR regime replaced January 2024 by IFICI (Incentivo Fiscal à Investigação Científica e Inovação). Qualifying professions include tech, research, culture, arts. Original NHR beneficiaries retain their status. Foreign pension income no longer fully exempt. Golden Visa routes now exclude Lisbon, Porto and coastal areas (interior only).',
    priceBands: {
      'Lisbon prime apartments (per m²)': { entry: [0.005, 0.008], realistic: [0.008, 0.012], trophy: [0.012, 0.018] },
      'Lisbon Príncipe Real / Lapa': { entry: [0.6, 1.2], realistic: [1.2, 3], trophy: [3.5, 7] },
      'Porto Foz / Nevogilde': { entry: [0.5, 1], realistic: [1, 2.5], trophy: [3, 6] },
      'Estoril / Cascais corridor': { entry: [0.7, 1.5], realistic: [1.5, 4], trophy: [5, 12] },
    },
    brochureRealities: [
      'Lisbon summer (July-Aug) is hot (38-42°C) and tourist-saturated — most residents leave',
      'Landlord-tenant law reform 2023-2024: longer notice periods, rent caps in some areas',
      'Lisbon centre: chronic parking shortage, hills make walking tiring',
      'Porto: Atlantic weather, grey and wet October-March',
      'Building quality varies: some renovated buildings have poor insulation',
    ],
    structuringJurisdiction: 'PT',
    coverage: 'Lisbon and Porto relocation partners; Estoril corridor specialist',
    icpRelevance: 'HIGH, relocation, tax-motivated',
    rentalRates: { shortTermWeekPeak: [2000, 10000], shortTermWeekShoulder: [1200, 5000], midTermMonth: [2500, 7000], longTermMonth: [2000, 5500], notes: 'Market heated significantly 2020-2024. Lisbon prime mid-term supply improved as investor-buyers now let. Porto remains better value at 30-40% below Lisbon. Estoril corridor (Cascais, Estoril, Sintra approach) good family mid/long-term with sea proximity.' },
    rentalEditorial: 'Portugal is a primary relocation destination for IFICI-qualifying arrivals and lifestyle relocators. Mid-term (3-12 months furnished) is the most active segment — arrivals testing the market before buying. Porto is TGC\'s current recommendation: lower prices, less tourist pressure, and a rapidly maturing international community.',
  },

  'barcelona-city': {
    name: 'Barcelona', tier: 2, country: 'ES',
    subLabel: 'Eixample · Sarrià-Sant Gervasi · Pedralbes · Zona Alta',
    region: 'Mediterranean Iberia',
    loudQuiet: {
      loud: ['Barceloneta', 'Gothic Quarter tourist core', 'Passeig de Gràcia hotels-and-shops strip'],
      quiet: ['Eixample Esquerra interior', 'Sarrià village', 'Sant Gervasi residential', 'Pedralbes', 'Bonanova'],
    },
    editorial: 'Barcelona\'s rental market is among the most regulated in Europe — the city has introduced rental caps, restricted short-term licences, and imposed moratoria on new tourist flats. For long-term renters, this is actually advantageous: supply is improving, caps protect against price spikes. Short-term through legitimate licensed operators only. The family rental market in Sarrià, Pedralbes and Zona Alta is the intelligent play.',
    criticalContext: 'Barcelona city: strict rental caps in designated "stressed area." New short-term tourist licence moratorium 2024 (no new licences until 2030). International schools heavily oversubscribed, enrollment lists needed 2-3 years ahead. Catalonia wealth tax applies, unlike Madrid or Andalusia.',
    priceBands: {
      'Eixample dreta apartments (per m²)': { entry: [0.005, 0.008], realistic: [0.008, 0.013], trophy: [0.013, 0.02] },
      'Sarrià / Pedralbes townhouses': { entry: [1.5, 3], realistic: [3, 7], trophy: [8, 18] },
      'Zona Alta luxury apartments': { entry: [0.8, 1.5], realistic: [1.5, 4], trophy: [4.5, 10] },
    },
    brochureRealities: [
      'Tourist licence moratorium: no new short-term lets until 2030 minimum',
      'Catalonia wealth tax: 0.21-2.75% above €500k, unlike Madrid / Andalusia',
      'International school waitlists: start 2-3 years before move',
      'Summer (July-Aug) tourist overcrowding in tourist zones, residents leave',
      'Political uncertainty (Catalan independence) is background noise but persistent',
    ],
    structuringJurisdiction: 'ES',
    coverage: 'Barcelona relocation specialist; Sarrià/Pedralbes family-property network',
    icpRelevance: 'HIGH, family relocation, European HQ',
    rentalRates: { shortTermWeekPeak: [2500, 12000], shortTermWeekShoulder: [1500, 6000], midTermMonth: [3000, 9000], longTermMonth: [2500, 7000], notes: 'Short-term through licensed operators only — no new licences until 2030. Mid-term (months d\'habitació, 3-11 months) is the correct vehicle for international arrivals. Long-term family homes in Sarrià/Pedralbes are in strong demand and short supply. Rental cap regulations apply in most areas.' },
    rentalEditorial: 'Barcelona mid-term is the intelligent play for international families arriving via corporate posting or lifestyle relocation. The regulatory environment that frustrates short-term operators actually protects long-term tenants from price volatility. Sarrià, Sant Gervasi and Pedralbes are the family rental markets — quieter, greener, close to international schools. TGC sources direct from owner-managed properties within the regulatory framework.',
  },

  'new-york-hamptons': {
    name: 'New York / Hamptons', tier: 4, country: 'US',
    subLabel: 'Manhattan prime · Tribeca · East Hampton · Southampton · Bridgehampton',
    region: 'United States',
    loudQuiet: {
      loud: ['Fifth Avenue', 'Park Avenue', 'East Hampton village'],
      quiet: ['West Village', 'Cobble Hill', 'Amagansett', 'Sagaponack'],
    },
    editorial: 'Manhattan prime and the Hamptons summer season, the US-East-Coast parallel to Palm Beach winter. TGC gates the relationship, coordinates through established NY partners for ground execution.',
    priceBands: {
      'Manhattan prime apartments (USD)': { entry: [3, 8], realistic: [8, 20], trophy: [20, 40] },
      'Tribeca lofts (USD)': { entry: [4, 10], realistic: [10, 18], trophy: [18, 30] },
      'Hamptons oceanfront (USD)': { entry: [10, 25], realistic: [25, 50], trophy: [50, 100] },
      'Hamptons village (USD)': { entry: [5, 12], realistic: [12, 18], trophy: [18, 25] },
    },
    brochureRealities: [
      'NY co-op boards can take 60-90 days and reject for opaque reasons',
      'Hamptons summer traffic: Memorial Day through Labor Day brutal',
    ],
    structuringJurisdiction: 'US',
    coverage: 'Partner firms in NY; US tax advisor for FIRPTA and cross-border',
    icpRelevance: 'MEDIUM',
  },
}

// ──────────────────────────────────────────────────────────────────────────────
// STRUCTURING BRIEFINGS
// ──────────────────────────────────────────────────────────────────────────────

interface JurisdictionData {
  label: string
  headline: string
  defaultVehicle: string
  wealthTax: string
  acquisitionCosts: string
  capitalGains: string
  honestAdvice: string
}

const STRUCTURING: Record<string, JurisdictionData> = {
  'FR': {
    label: 'France',
    headline: 'SCI is the default UHNW vehicle. IFI applies at €1.3M. 2026 reform ("IFI-i") would flatten to 1% and expand base.',
    defaultVehicle: 'SCI (Société Civile Immobilière)',
    wealthTax: 'IFI: €1.3M threshold, 0.5-1.5% progressive (pending flat 1% IFI-i reform). 30% primary-residence discount.',
    acquisitionCosts: 'Notary + registration: 7-8% on resale, 2-3% new-build',
    capitalGains: 'Non-resident: 36.2% headline (19% CGT + 17.2% social). Taper begins year 5; full exemption year 22 (CGT) / year 30 (social).',
    honestAdvice: 'For single property under €5M personal use: SCI is correct. Multiple properties or wealth structuring: SCI + substance + long-dated mortgage debt. Avoid offshore companies unless pre-existing commercial reason.',
  },
  'UK': {
    label: 'United Kingdom',
    headline: 'Non-dom regime abolished 6 April 2025. 4-year FIG relief for new arrivals (10-year non-resident prior). Worldwide IHT after 10 years residence.',
    defaultVehicle: 'Personal name (offshore company structures largely collapsed)',
    wealthTax: 'No UK wealth tax. SDLT on £10M non-resident second home above 18% on top slab.',
    acquisitionCosts: 'SDLT top rate 12% + 5% additional dwelling + 2% non-resident surcharge',
    capitalGains: 'On disposal at worldwide rates post-FIG-period; NRCGT applies during.',
    honestAdvice: 'Personal name is now almost universally correct. For 4 years or fewer residence: personal + FIG claim + exit before year 10. Long-term: engage tax barrister at offer stage, not after completion.',
  },
  'IT': {
    label: 'Italy',
    headline: 'Flat tax regime: €200k annual on all foreign income for qualifying new residents, up to 15 years. Biggest driver of UK non-dom exodus.',
    defaultVehicle: 'Personal name',
    wealthTax: 'None on worldwide. IMU (property tax) annual 0.4-1.06% cadastral value.',
    acquisitionCosts: 'Resident first home: 2% + notary. Non-resident: 9% + notary. Basis: cadastral value, not market.',
    capitalGains: '26% on capital gains (with 5-year exemption for primary residence).',
    honestAdvice: 'For UHNW relocating: personal name + Italian tax residency (183+ day test) + flat-tax election. For vacation home without relocation: personal, accept 9% registration. Verify cadastral categorisation before offer, agricultural-classified "villas" cannot be primary residence.',
  },
  'MC': {
    label: 'Monaco',
    headline: 'No income tax for non-French, no CGT, no wealth tax, no inheritance tax direct line. Becoming Monaco-resident is the gate, not the property.',
    defaultVehicle: 'Personal or Monégasque SCP',
    wealthTax: 'None.',
    acquisitionCosts: '4.5-7%',
    capitalGains: 'None on property.',
    honestAdvice: 'The €500k bank deposit + accommodation + Sûreté approval is a 2-4 month process, must be initiated in parallel with property search. Monégasque SCP often used even by French citizens for Monaco property to sidestep French inheritance rules.',
  },
  'CH': {
    label: 'Switzerland',
    headline: 'Lex Koller restricts non-EU/EFTA purchase to tourist zones, 200m² max. Lump-sum taxation available to non-Swiss non-workers.',
    defaultVehicle: 'Personal; Swiss structuring requires cantonal coordination',
    wealthTax: 'Cantonal, modest.',
    acquisitionCosts: '3-5% depending on canton',
    capitalGains: 'Cantonal rates; significant holding-period reductions',
    honestAdvice: 'For non-EU/EFTA: (a) lump-sum taxation arrangement with specific Vaud/Valais canton first, (b) establish residence, (c) then operate within Lex Koller. This is a 6-18 month structuring exercise, not a purchase decision. Permissive cantons: Vaud, Valais, Graubünden, Ticino.',
  },
  'ES': {
    label: 'Spain',
    headline: 'Beckham Law for relocating workers. Property Golden Visa abolished April 2025. Wealth tax varies sharply by region.',
    defaultVehicle: 'Personal name',
    wealthTax: 'Regional: Madrid approximately zero, Andalusia eliminated, Balearics and Catalonia up to 3.5%',
    acquisitionCosts: '6-10% all-in',
    capitalGains: '19-26% depending on gain',
    honestAdvice: 'Region selection is a structural tax decision. Andalusia is uniquely attractive post-wealth-tax-elimination. For Balearics or Catalonia purchases, model wealth tax seriously before committing.',
  },
  'ME': {
    label: 'Montenegro',
    headline: 'No wealth tax, no inheritance direct line. Residency by investment from €150k. EU accession 2028 expected.',
    defaultVehicle: 'Personal or Montenegrin DOO',
    wealthTax: 'None',
    acquisitionCosts: '3-5% all-in',
    capitalGains: '9-15%',
    honestAdvice: 'Critical: "List Nepokretnosti" Teret check for legalisation status, pre-2010 properties often built without full permits. A non-legalised property cannot be normally sold. This is not a structuring issue; it is a due-diligence issue, and it is real.',
  },
  'HR': { label: 'Croatia', headline: 'EU member, euro. No wealth tax. Flat 12% rental income tax.', defaultVehicle: 'Personal', acquisitionCosts: '5-6%', wealthTax: 'None', capitalGains: 'Flat rate', honestAdvice: 'Always audit cadastral records, Yugoslav-era legacy issues; verify any 1990s restitution claims.' },
  'GR': { label: 'Greece', headline: 'Golden Visa €250-800k (tiered 2024). ENFIA annual property tax.', defaultVehicle: 'Personal', acquisitionCosts: '6-10%', wealthTax: 'None', capitalGains: '15%', honestAdvice: 'Transactions typically 4-6 months. Islands often have complex family-ownership histories.' },
  'ZA': { label: 'South Africa', headline: 'Foreign ownership unrestricted. SARB clearance for currency remittance.', defaultVehicle: 'Personal or SA property company', acquisitionCosts: '8-12% (transfer duty progressive)', wealthTax: 'None', capitalGains: 'Effective ~18% for foreigners on property', honestAdvice: 'Currency repatriation via SARB is navigable but slow. Estate duty 20-25% applies to SA residents worldwide.' },
  'NA': { label: 'Namibia', headline: 'Foreign ownership unrestricted. BoN clearance for capital repatriation.', defaultVehicle: 'Personal', acquisitionCosts: '8-12%', wealthTax: 'None', capitalGains: '10%', honestAdvice: 'Lower volumes mean fewer predatory structures, the transaction is usually straightforward via Windhoek attorney.' },
  'US': { label: 'United States', headline: 'FIRPTA applies to non-US sellers. State-level estate tax varies.', defaultVehicle: 'Personal or US LLC', acquisitionCosts: '2-5%', wealthTax: 'None federal', capitalGains: 'Federal up to 20% + state', honestAdvice: 'Cross-border tax is the core complexity, engage US tax advisor alongside international counsel.' },
  'FR/CH': { label: 'France / Switzerland', headline: 'French side: standard SCI structuring. Swiss side: Lex Koller + lump-sum taxation where applicable.', defaultVehicle: 'Jurisdiction-specific', acquisitionCosts: '3-8%', wealthTax: 'Cantonal CH / IFI French', capitalGains: 'Jurisdiction-specific', honestAdvice: 'Decision on French vs Swiss side is a major structural choice, worth 6-12 months of pre-purchase coordination.' },
  'CH/FR': { label: 'Switzerland / France', headline: 'Same as FR/CH, coordinate counsel both sides before offer.', defaultVehicle: 'Jurisdiction-specific', acquisitionCosts: '3-8%', wealthTax: 'Jurisdiction-specific', capitalGains: 'Jurisdiction-specific', honestAdvice: 'Make jurisdiction decision first; then property search within that jurisdiction.' },
  'FR/ES/AD': { label: 'France / Spain / Andorra', headline: 'Three jurisdictions; Andorra has unique tax regime but thinner European integration.', defaultVehicle: 'Jurisdiction-specific', acquisitionCosts: '3-10%', wealthTax: 'Jurisdiction-specific', capitalGains: 'Jurisdiction-specific', honestAdvice: 'If tax is the driver: Andorra. If lifestyle and European integration: French or Spanish Pyrenees.' },
  'FR or CH': { label: 'France / Switzerland (Alpine)', headline: 'French side: SCI. Swiss side: Lex Koller + lump-sum taxation.', defaultVehicle: 'Jurisdiction-specific', acquisitionCosts: '3-8%', wealthTax: 'Cantonal CH / IFI French', capitalGains: 'Jurisdiction-specific', honestAdvice: 'Jurisdiction decision is the first step, not the property.' },
}

// ──────────────────────────────────────────────────────────────────────────────
// RETAINER & SUCCESS FEE DEFAULTS (by tier)
// ──────────────────────────────────────────────────────────────────────────────

const COMMERCIAL_DEFAULTS: Record<string, Record<number, { retainer: number; successFee: number }>> = {
  buy: {
    1: { retainer: 25000, successFee: 1.5 },
    2: { retainer: 35000, successFee: 1.5 },
    3: { retainer: 40000, successFee: 2.0 },
    4: { retainer: 50000, successFee: 2.0 },
  },
  sell: {
    1: { retainer: 0, successFee: 2.0 },
    2: { retainer: 0, successFee: 2.5 },
    3: { retainer: 10000, successFee: 2.5 },
    4: { retainer: 0, successFee: 2.5 },
  },
  let: {
    1: { retainer: 0, successFee: 0 },
    2: { retainer: 0, successFee: 0 },
    3: { retainer: 0, successFee: 0 },
    4: { retainer: 0, successFee: 0 },
  },
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────────
// MARKET MATCH PROFILES — scoring dimensions per market
// ──────────────────────────────────────────────────────────────────────────────

type MClimate = 'med' | 'atlantic' | 'alpine' | 'capital' | 'africa' | 'island'
type MPropType = 'villa' | 'apartment' | 'estate' | 'chalet' | 'invest' | 'land'
type MTaxDriver = 'uk-nondom' | 'italy-flat' | 'golden-visa' | 'monaco' | 'swiss-lump' | 'spain-zero-wealth' | 'portugal-ifici' | 'andorra'
type MAppreciation = 'strong' | 'moderate' | 'flat' | 'speculative'
interface MProfile { climates:MClimate[]; props:MPropType[]; bMin:number; bMax:number; privacy:number; tax:MTaxDriver[]; investScore:number; yield:string; appreciation:MAppreciation; liquidity:number; timelines:string[]; whyTGC:string }

const MATCH_PROFILES: Record<string, MProfile> = {
  'french-riviera':     { climates:['med','island'],   props:['villa','apartment','estate'],  bMin:3,   bMax:100, privacy:8,  tax:['monaco'],               investScore:5, yield:'2-3%',  appreciation:'flat',        liquidity:6, timelines:['12-24','patient'],          whyTGC:'Off-market owner network; notaires in Cap Ferrat, Mougins, Ramatuelle' },
  'occitanie':          { climates:['med'],             props:['villa','estate','land'],        bMin:0.3, bMax:8,   privacy:9,  tax:[],                        investScore:7, yield:'3-5%',  appreciation:'moderate',    liquidity:4, timelines:['12-24','patient'],          whyTGC:'TGC home market; exclusive mandates; off-market access unavailable elsewhere' },
  'provence-paca':      { climates:['med'],             props:['villa','estate'],               bMin:1,   bMax:20,  privacy:8,  tax:[],                        investScore:4, yield:'2-3%',  appreciation:'flat',        liquidity:5, timelines:['12-24','patient'],          whyTGC:'Luberon and Alpilles notaire network; architect relationships for heritage renovation' },
  'paris':              { climates:['capital'],         props:['apartment','invest'],           bMin:0.5, bMax:100, privacy:5,  tax:[],                        investScore:8, yield:'3-4%',  appreciation:'flat',        liquidity:9, timelines:['immediate','6-12'],         whyTGC:'6e/7e/8e/16e notaire network; Bâtiments de France architect access' },
  'london-prime':       { climates:['capital','atlantic'],props:['apartment','invest'],         bMin:2,   bMax:80,  privacy:5,  tax:['uk-nondom'],             investScore:8, yield:'3-4%',  appreciation:'moderate',    liquidity:9, timelines:['immediate','6-12'],         whyTGC:'PCL agency partnerships; FIG tax barrister relationships; genuine 2026 buyer window' },
  'tuscany-umbria':     { climates:['med'],             props:['villa','estate'],               bMin:0.6, bMax:15,  privacy:9,  tax:['italy-flat'],            investScore:4, yield:'2-3%',  appreciation:'moderate',    liquidity:4, timelines:['12-24','patient'],          whyTGC:'Chianti/Val d\'Orcia partnerships; Umbria specialist; Italian flat-tax coordination' },
  'balearics':          { climates:['island','med'],    props:['villa'],                        bMin:0.8, bMax:60,  privacy:7,  tax:[],                        investScore:5, yield:'3-4%',  appreciation:'flat',        liquidity:6, timelines:['6-12','12-24'],            whyTGC:'Island specialist each of Ibiza, Mallorca, Menorca' },
  'andalusia':          { climates:['med'],             props:['villa','estate'],               bMin:0.5, bMax:50,  privacy:8,  tax:['spain-zero-wealth'],     investScore:7, yield:'3-5%',  appreciation:'moderate',    liquidity:6, timelines:['6-12','12-24'],            whyTGC:'Keith Kirwen Marbella/Sotogrande; Seville network; La Zagaleta direct access' },
  'cote-basque-aquitaine':{ climates:['atlantic'],      props:['villa','apartment','estate'],  bMin:0.6, bMax:30,  privacy:6,  tax:[],                        investScore:5, yield:'3%',    appreciation:'moderate',    liquidity:5, timelines:['6-12','12-24'],            whyTGC:'Biarritz specialist; Bordeaux notaire direct; wine-industry advisors for châteaux' },
  'auvergne-rhone-alpes':{ climates:['alpine','capital'],props:['apartment','villa'],          bMin:0.5, bMax:10,  privacy:6,  tax:[],                        investScore:5, yield:'3-4%',  appreciation:'moderate',    liquidity:6, timelines:['6-12','12-24'],            whyTGC:'Lyon direct notaire; Annecy local advisor; Lake Bourget' },
  'alpine-ski':         { climates:['alpine'],          props:['chalet'],                      bMin:1.5, bMax:200, privacy:7,  tax:['swiss-lump'],            investScore:4, yield:'2%',    appreciation:'flat',        liquidity:5, timelines:['12-24','patient'],          whyTGC:'Courchevel/Méribel specialist; St Moritz and Gstaad Swiss partners' },
  'geneva-lake':        { climates:['alpine','capital'],props:['villa','apartment'],           bMin:2,   bMax:150, privacy:7,  tax:['swiss-lump'],            investScore:6, yield:'2.5%',  appreciation:'moderate',    liquidity:6, timelines:['12-24','patient'],          whyTGC:'Swiss private-client advisor; Lavaux vigneron-house network; French-side notaire' },
  'croatia':            { climates:['med','island'],    props:['villa','estate','land'],        bMin:0.3, bMax:12,  privacy:7,  tax:[],                        investScore:6, yield:'3-4%',  appreciation:'moderate',    liquidity:4, timelines:['12-24','patient'],          whyTGC:'Dubrovnik firm; Istria contrarian coverage; Dalmatian island network' },
  'montenegro':         { climates:['med','island'],    props:['villa','apartment','land'],     bMin:0.4, bMax:10,  privacy:7,  tax:['golden-visa'],           investScore:9, yield:'3-4%',  appreciation:'speculative',  liquidity:3, timelines:['patient'],                  whyTGC:'Porto Montenegro/Kotor specialist; highest-conviction EU-accession play 2028' },
  'greece':             { climates:['med','island'],    props:['villa','apartment','estate'],   bMin:0.5, bMax:50,  privacy:7,  tax:['golden-visa'],           investScore:7, yield:'3-5%',  appreciation:'moderate',    liquidity:4, timelines:['12-24','patient'],          whyTGC:'Athens Riviera firm; quiet Cyclades network; Peloponnese specialist' },
  'western-cape':       { climates:['africa'],          props:['estate','villa'],               bMin:0.3, bMax:8,   privacy:8,  tax:[],                        investScore:6, yield:'4-5%',  appreciation:'moderate',    liquidity:4, timelines:['12-24','patient'],          whyTGC:'Winelands partner firm; SARB clearance specialists; Constantia and Franschhoek direct' },
  'namibia':            { climates:['africa'],          props:['land','estate'],                bMin:0.15,bMax:50,  privacy:10, tax:[],                        investScore:3, yield:'2%',    appreciation:'flat',        liquidity:2, timelines:['patient'],                  whyTGC:'Windhoek attorney; conservation-advisory for private reserve M&A' },
  'pyrenees':           { climates:['alpine','atlantic'],props:['villa','chalet','land'],       bMin:0.3, bMax:8,   privacy:8,  tax:['andorra'],               investScore:3, yield:'2%',    appreciation:'flat',        liquidity:3, timelines:['12-24','patient'],          whyTGC:'Pau-based French lawyer; Val d\'Aran Catalan specialist; Andorra tax advisory' },
  'miami-palm-beach':   { climates:['atlantic','island'],props:['apartment','villa','invest'],  bMin:2,   bMax:100, privacy:6,  tax:[],                        investScore:7, yield:'3-4%',  appreciation:'flat',        liquidity:8, timelines:['6-12','12-24'],            whyTGC:'Knight Frank Miami; Palm Beach Sotheby\'s partnerships; US tax advisor' },
  'new-york-hamptons':  { climates:['capital','island'],props:['apartment','villa','invest'],   bMin:3,   bMax:100, privacy:5,  tax:[],                        investScore:7, yield:'3-4%',  appreciation:'flat',        liquidity:9, timelines:['6-12','12-24'],            whyTGC:'New York partner firms; US tax advisor for cross-border FIRPTA' },
  'amsterdam':          { climates:['capital'],         props:['apartment','invest'],           bMin:0.5, bMax:5,   privacy:4,  tax:[],                        investScore:8, yield:'3-4%',  appreciation:'flat',        liquidity:8, timelines:['immediate','6-12'],         whyTGC:'Benelux relocation-specialist partner; tight rental market intelligence' },
  'lisbon-porto':       { climates:['atlantic'],        props:['apartment','villa','invest'],   bMin:0.5, bMax:12,  privacy:5,  tax:['portugal-ifici'],        investScore:7, yield:'3-5%',  appreciation:'moderate',    liquidity:6, timelines:['6-12','12-24'],            whyTGC:'Lisbon and Porto relocation partners; IFICI coordination; Estoril corridor' },
  'barcelona-city':     { climates:['med','capital'],   props:['apartment','villa','invest'],   bMin:0.8, bMax:20,  privacy:5,  tax:[],                        investScore:6, yield:'3-4%',  appreciation:'flat',        liquidity:7, timelines:['6-12','12-24'],            whyTGC:'Sarrià/Pedralbes family network; regulated rental market navigation' },
}

// ──────────────────────────────────────────────────────────────────────────────
// ACQUISITION PROFILE — collected from guided questions
// ──────────────────────────────────────────────────────────────────────────────

interface AcqProfile {
  driver: string       // 'lifestyle'|'relocation'|'investment'|'tax'|'development'
  climate: string      // 'med'|'atlantic'|'alpine'|'capital'|'africa'|'island'|'any'
  propType: string     // 'villa'|'apartment'|'estate'|'chalet'|'invest'|'land'
  budget: string       // 'under-1'|'1-3'|'3-8'|'8-20'|'over-20'
  privacy: string      // 'essential'|'high'|'moderate'|'any'
  taxSituation: string // 'uk-nondom'|'us-citizen'|'planning-relocation'|'invest-focus'|'none'
  timeline: string     // 'immediate'|'6-12'|'12-24'|'patient'
  investObj: string    // 'yield'|'capital'|'both'|'trophy'|'commercial'|'dev' (investment track only)
}

const ACQ_QUESTIONS = [
  { key:'driver', question:"What's driving this?", subtitle:'The motivation shapes everything — the markets, the questions, and the honest advice.',
    options:[
      { value:'lifestyle', label:'Lifestyle · second home', desc:'A base in another climate. Summer, winter, or year-round rotation.' },
      { value:'relocation', label:'Primary relocation', desc:'Moving somewhere properly. Residency, schools, full life infrastructure.' },
      { value:'tax', label:'Tax-motivated relocation', desc:'A tax regime change is the primary reason. Destination is partly driven by the structure.' },
      { value:'investment', label:'Investment', desc:'Yield, capital appreciation, development, or tax-efficient vehicle. Not primarily a lifestyle decision.' },
      { value:'development', label:'Development · land', desc:'A plot, a ruin, or an opportunity. Value-add, planning gain, or conservation.' },
    ]},
  { key:'climate', question:'Which world are you drawn to?', subtitle:'Climate and geography are honest filters. Preference rarely changes.',
    options:[
      { value:'med', label:'Mediterranean', desc:'Sun, heat, sea. France, Italy, Spain, Greece, Croatia.' },
      { value:'atlantic', label:'Atlantic · Northern Europe', desc:'Mild, green, connected. Portugal, Basque, London, Amsterdam.' },
      { value:'alpine', label:'Alpine · Mountain', desc:'Altitude, snow, clear air. French Alps, Switzerland, Pyrenees.' },
      { value:'capital', label:'Capital city', desc:'Urban, cultural density, infrastructure. Paris, London, Amsterdam, New York.' },
      { value:'island', label:'Island', desc:'Genuine separation. Balearics, Greek islands, Sicily, Sardinia.' },
      { value:'africa', label:'African lifestyle', desc:'Space, light, wine, wildlife. Western Cape and beyond.' },
      { value:'any', label:'Open to guidance', desc:"No strong preference. We'll tell you where fits best." },
    ]},
  { key:'propType', question:'What type of property?', subtitle:'The asset class narrows the market list significantly.',
    options:[
      { value:'villa', label:'Villa · standalone house', desc:'Stand-alone, outdoor space, a property with a life of its own.' },
      { value:'apartment', label:'Apartment · pied-à-terre', desc:'Urban base. Lock-and-leave. Possibly leasehold.' },
      { value:'estate', label:'Estate · domain · farmhouse', desc:'Land, outbuildings, probably a project. Scale matters.' },
      { value:'chalet', label:'Chalet', desc:'Alpine, seasonal or year-round. The mountain-specific product.' },
      { value:'invest', label:'Investment asset', desc:'Revenue-producing from day one, or structured for capital return. Tenant, not owner, occupies.' },
      { value:'land', label:'Land · development plot', desc:'Raw land, planning opportunity, or ruin with possibility.' },
    ]},
  { key:'budget', question:'Budget range (purchase price, all-in)?', subtitle:'Including acquisition costs and any immediate works. Honest figures narrow the shortlist.',
    options:[
      { value:'under-1', label:'Under €1M', desc:'Entry and emerging markets, quieter zones in core markets.' },
      { value:'1-3', label:'€1M – €3M', desc:'The realistic middle band across most of our markets.' },
      { value:'3-8', label:'€3M – €8M', desc:'Trophy product in tier-2 markets; entry in tier-1.' },
      { value:'8-20', label:'€8M – €20M', desc:'Realistic in prime French Riviera, London PCL, Alpine trophy.' },
      { value:'over-20', label:'Over €20M', desc:'Trophy-only. Cap Ferrat, Monaco, Gstaad, Mayfair.' },
    ]},
  { key:'privacy', question:'How important is privacy?', subtitle:'This is a genuine filter, not a formality. It changes the location and property type significantly.',
    options:[
      { value:'essential', label:'Essential', desc:'Completely out of sight. No passers-by, no shared approaches, no adjacent development.' },
      { value:'high', label:'High', desc:'Not a development. Private grounds. Neighbours exist but are discreet.' },
      { value:'moderate', label:'Moderate', desc:'Normal discretion. Village house, town apartment, gated estate.' },
      { value:'any', label:'Not a priority', desc:'Proximity and convenience matter more.' },
    ]},
  { key:'taxSituation', question:'Is tax situation shaping this decision?', subtitle:'One honest question here changes the entire structuring conversation — and sometimes the market.',
    options:[
      { value:'uk-nondom', label:'UK non-dom leaving or recently left', desc:'Post-April 2025 abolition. Planning or already in the process of relocating.' },
      { value:'us-citizen', label:'US citizen anywhere', desc:'FATCA, worldwide reporting, cross-border complexity — it is always relevant.' },
      { value:'planning-relocation', label:'Planning a tax residence change', desc:'Actively considering which regime to move to. Italy flat-tax, Andalusia, Monaco, Switzerland on the table.' },
      { value:'invest-focus', label:'Investment-focused, no relocation', desc:'Buying as a non-resident. Structuring matters, but not residency.' },
      { value:'none', label:'No specific tax driver', desc:'Lifestyle or investment purchase without a regime-change motivation.' },
    ]},
  { key:'timeline', question:'What is the realistic timeline?', subtitle:'Patience unlocks better opportunities. Urgency narrows the field.',
    options:[
      { value:'immediate', label:'Immediate (0-3 months)', desc:'Something specific is in view, or a deadline is real.' },
      { value:'6-12', label:'6-12 months', desc:'Active search, prepared to move on the right thing.' },
      { value:'12-24', label:'12-24 months', desc:'Considered. The brief needs to be right before the search begins.' },
      { value:'patient', label:'Patient capital (3+ years)', desc:'Only if the right thing appears. Capital is patient.' },
    ]},
  { key:'investObj', question:'What is the investment objective?', subtitle:'Only relevant when capital return is the primary driver.',
    options:[
      { value:'yield', label:'Rental yield', desc:'Income from day one. Tenant in place or ready-to-let.' },
      { value:'capital', label:'Capital appreciation', desc:'Patient. Long-term compounding. Exit at the right cycle.' },
      { value:'both', label:'Both — balanced return', desc:'Yield covers running costs; appreciation is the exit.' },
      { value:'trophy', label:'Trophy asset', desc:'Lifestyle value plus long-term store of wealth. Not primarily a yield play.' },
      { value:'commercial', label:'Commercial or mixed-use', desc:'Offices, retail, mixed-use income streams. TGC coordinates via commercial advisory network.' },
      { value:'dev', label:'Development gain', desc:'Buy below, add value, exit. Planning gain, conversion, or ground-up.' },
    ]},
]

// ──────────────────────────────────────────────────────────────────────────────
// MARKET MATCHING ENGINE
// ──────────────────────────────────────────────────────────────────────────────

function budgetOverlaps(band: string, bMin: number, bMax: number): boolean {
  const r: Record<string,[number,number]> = { 'under-1':[0,1], '1-3':[0.5,3.5], '3-8':[2,9], '8-20':[6,22], 'over-20':[15,9999] }
  const [lo,hi] = r[band] || [0,9999]
  return bMin <= hi && bMax >= lo
}

function computeMarketMatch(profile: AcqProfile): { marketId:string; score:number; reasons:string[]; tradeoff:string }[] {
  const results = Object.entries(MATCH_PROFILES).map(([id, mp]) => {
    let score = 0

    // Climate (weight 25)
    if (!profile.climate || profile.climate === 'any') score += 15
    else if (mp.climates.includes(profile.climate as MClimate)) score += 25
    else score += 0

    // Property type (weight 20)
    if (!profile.propType || mp.props.includes(profile.propType as MPropType)) score += 20

    // Budget (weight 25)
    if (!profile.budget || budgetOverlaps(profile.budget, mp.bMin, mp.bMax)) score += 25

    // Privacy (weight 15)
    const privRequired: Record<string,number> = { essential:8, high:6, moderate:3, any:0 }
    const minPriv = privRequired[profile.privacy] || 0
    if (mp.privacy >= minPriv) score += 15

    // Tax alignment (weight 10)
    const taxMap: Record<string,MTaxDriver[]> = {
      'uk-nondom': ['uk-nondom','italy-flat','monaco','spain-zero-wealth','swiss-lump'],
      'planning-relocation': ['italy-flat','monaco','swiss-lump','spain-zero-wealth','portugal-ifici','andorra'],
      'invest-focus': ['golden-visa','portugal-ifici'],
      'us-citizen': [],
      'none': [],
    }
    const relevantTax = taxMap[profile.taxSituation] || []
    if (relevantTax.length === 0 || mp.tax.some(t => relevantTax.includes(t))) score += 10

    // Investment score for investment driver (weight up to 15)
    if (profile.driver === 'investment') {
      score += mp.investScore * 1.5
      if (profile.investObj === 'yield' && ['strong','moderate'].includes(mp.appreciation)) score += 5
      if (profile.investObj === 'capital' && ['speculative','moderate','strong'].includes(mp.appreciation)) score += 5
      if (profile.investObj === 'commercial') score -= 10 // penalise non-commercial markets slightly
    }

    // Timeline (weight 5)
    if (!profile.timeline || mp.timelines.includes(profile.timeline)) score += 5

    return { marketId: id, score, reasons: [], tradeoff: '' }
  })

  const sorted = results.sort((a,b) => b.score - a.score).slice(0,3)

  // Generate reasons per match
  return sorted.map((r, idx) => {
    const mp = MATCH_PROFILES[r.marketId]
    const market = MARKETS[r.marketId]
    const reasons: string[] = []

    if (profile.climate !== 'any' && mp.climates.includes(profile.climate as MClimate)) {
      const ct: Record<string,string> = { med:'Mediterranean climate, close match', atlantic:'Atlantic setting matches your brief', alpine:'Alpine environment — the right world', capital:'Capital city density and infrastructure', island:'Island setting with genuine separation', africa:'African lifestyle at meaningful scale' }
      reasons.push(ct[profile.climate] || 'Climate match')
    }
    if (profile.privacy === 'essential' && mp.privacy >= 8) reasons.push(`Privacy score ${mp.privacy}/10 — among the highest in our network`)
    else if (profile.privacy === 'high' && mp.privacy >= 7) reasons.push(`Strong privacy position (${mp.privacy}/10) without isolation`)
    if (profile.taxSituation === 'uk-nondom' && mp.tax.includes('uk-nondom')) reasons.push('London PCL: 2026 buyer window post-non-dom; best selection in five years')
    if (profile.taxSituation === 'uk-nondom' && mp.tax.includes('italy-flat')) reasons.push('Italian flat-tax (€200k cap on foreign income) is the dominant driver of UK non-dom movement right now')
    if (profile.taxSituation === 'uk-nondom' && mp.tax.includes('spain-zero-wealth')) reasons.push('Andalusia eliminated wealth tax — structurally competitive with Monaco for the right profile')
    if (profile.taxSituation === 'planning-relocation' && mp.tax.includes('monaco')) reasons.push('Monaco: no income tax, no CGT, no wealth tax for non-French. Residency is the gate, not the property.')
    if (profile.taxSituation === 'planning-relocation' && mp.tax.includes('swiss-lump')) reasons.push('Swiss lump-sum taxation: available to non-working non-Swiss in key cantons. 6-18 month structuring exercise.')
    if (profile.taxSituation === 'planning-relocation' && mp.tax.includes('portugal-ifici')) reasons.push('IFICI regime (replaces NHR 2024): qualifying professions receive significant foreign-income relief for 10 years')
    if (profile.driver === 'investment') {
      if (mp.appreciation === 'speculative') reasons.push(`Capital appreciation play: EU accession catalyst expected 2028 — highest upside in our network`)
      else if (mp.investScore >= 8) reasons.push(`Investment score ${mp.investScore}/10 — strong fundamentals for yield and appreciation balanced`)
      else if (mp.investScore >= 6) reasons.push(`Investment score ${mp.investScore}/10 — solid fundamentals for your stated objective (${mp.yield} yield)`)
    }
    if (profile.budget === 'under-1' && mp.bMin <= 0.5) reasons.push(`Entry point from €${mp.bMin}M — one of the few markets where your budget opens real options`)
    if (reasons.length < 2 && market) reasons.push(market.editorial.split('.')[0] + '.')
    if (reasons.length < 2) reasons.push(mp.whyTGC)

    const tradeoff = idx === 0 ? '' :
      `vs. top match: ${sorted[0] && MARKETS[sorted[0].marketId] ? MARKETS[sorted[0].marketId].name : 'first market'} scores higher on ${profile.privacy !== 'any' && MATCH_PROFILES[sorted[0].marketId]?.privacy > mp.privacy ? 'privacy' : profile.driver === 'investment' ? 'investment fundamentals' : 'overall brief fit'}`

    return { ...r, reasons: reasons.slice(0,3), tradeoff }
  })
}

type Screen = 'welcome' | 'flow-direction' | 'market' | 'brief' | 'structuring' | 'verdict' | 'commercial' | 'client' | 'confirmation' | 'rental-type' | 'rental-brief' | 'rental-verdict' | 'rental-commercial' | 'acq-questions' | 'acq-match' | 'disposal-brief' | 'disposal-verdict' | 'retained-brief' | 'retained-overview' | 'retained-commercial'
type FlowFamily = 'acquisition' | 'disposal' | 'retained' | 'rental' | null
type Direction = 'buy' | 'invest' | 'develop' | 'let' | 'sell' | 'retained' | 'rent-short' | 'rent-mid' | 'rent-long' | null

interface Brief {
  propertyType: string
  budgetMin: string
  budgetMax: string
  sizeMin: string
  sizeMax: string
  nonNegotiables: string
  timeline: string
  confidentiality: string
  secondaryMarkets: string[]
}

interface RetainedBrief {
  portfolioSize: string    // number of properties currently held
  jurisdictions: string    // countries / regions involved
  primaryFocus: string     // next acquisition / disposal / portfolio review / estate planning / all
  promptedBy: string       // what triggered this conversation now
  additionalContext: string
}

interface SellerBrief {
  propertyType: string
  sizeM2: string
  askingPrice: string      // EUR millions
  reasonForSale: string
  timeline: string
  confidentiality: string
  keyFeatures: string      // what makes this property distinctive
  currentStatus: string    // owner-occupied / vacant / tenanted
}

interface RentalBrief {
  propertyType: string
  groupAdults: string
  groupChildren: string
  pets: string
  budgetWeek: string
  budgetMonth: string
  durationMonths: string
  moveInDate: string
  flexibility: string
  priorities: string[]
  nonNegotiables: string
  arrivalDate: string
  departureDate: string
}

interface StructuringState {
  vehicle: string
  taxResidence: string
  considerations: string
}

interface ClientState {
  name: string
  email: string
  phone: string
  taxResidence: string
}

function TGCRealEstateIntelligence() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [flowFamily, setFlowFamily] = useState<FlowFamily>(null)
  const [direction, setDirection] = useState<Direction>(null)
  const [marketId, setMarketId] = useState<string | null>(null)
  const [marketSearch, setMarketSearch] = useState('')
  const [brief, setBrief] = useState<Brief>({
    propertyType: '',
    budgetMin: '',
    budgetMax: '',
    sizeMin: '',
    sizeMax: '',
    nonNegotiables: '',
    timeline: '',
    confidentiality: '',
    secondaryMarkets: [],
  })
  const [structuring, setStructuring] = useState<StructuringState>({ vehicle: '', taxResidence: '', considerations: '' })
  const [client, setClient] = useState<ClientState>({ name: '', email: '', phone: '', taxResidence: '' })
  const [retainedBriefState, setRetainedBriefState] = useState<RetainedBrief>({ portfolioSize:'', jurisdictions:'', primaryFocus:'', promptedBy:'', additionalContext:'' })
  const [retainedSubType, setRetainedSubType] = useState<string>('')
  const [sellerBrief, setSellerBrief] = useState<SellerBrief>({ propertyType:'', sizeM2:'', askingPrice:'', reasonForSale:'', timeline:'', confidentiality:'', keyFeatures:'', currentStatus:'' })
  const [disposalSubType, setDisposalSubType] = useState<string>('')
  const [acqProfile, setAcqProfile] = useState<AcqProfile>({ driver:'', climate:'', propType:'', budget:'', privacy:'', taxSituation:'', timeline:'', investObj:'' })
  const [acqStep, setAcqStep] = useState(0)
  const [acqMatches, setAcqMatches] = useState<ReturnType<typeof computeMarketMatch>>([])
  const [rentalBrief, setRentalBrief] = useState<RentalBrief>({
    propertyType: '', groupAdults: '', groupChildren: '', pets: '', budgetWeek: '', budgetMonth: '',
    durationMonths: '', moveInDate: '', flexibility: '', priorities: [], nonNegotiables: '', arrivalDate: '', departureDate: '',
  })
  const [internalView, setInternalView] = useState(false)
  const [mandateId, setMandateId] = useState<string | null>(null)
  const [loadedDraft, setLoadedDraft] = useState(false)

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.flowFamily) setFlowFamily(data.flowFamily)
        if (data.direction) setDirection(data.direction)
        if (data.marketId) setMarketId(data.marketId)
        if (data.brief) setBrief(data.brief)
        if (data.structuring) setStructuring(data.structuring)
        if (data.client) setClient(data.client)
        setLoadedDraft(true)
        setTimeout(() => setLoadedDraft(false), 4000)
      }
    } catch { /* first run or unavailable */ }
  }, [])

  // Save draft
  useEffect(() => {
    if (flowFamily || direction || marketId) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          flowFamily, direction, marketId, brief, structuring, client,
        }))
      } catch { /* storage unavailable */ }
    }
  }, [flowFamily, direction, marketId, brief, structuring, client])

  const market = marketId ? MARKETS[marketId] : null
  const jurisdiction = market ? STRUCTURING[market.structuringJurisdiction] : null
  const commercial = useMemo(() => {
    if (!market || !direction) return null
    const dirKey = direction === 'sell' ? 'sell' : direction === 'let' ? 'let' : 'buy'
    return COMMERCIAL_DEFAULTS[dirKey]?.[market.tier] || null
  }, [market, direction])

  const budgetMin = parseFloat(brief.budgetMin) || 0
  const budget = parseFloat(brief.budgetMax) || 0
  const showStructuringScreen = useMemo(() => {
    if (!market) return false
    if (market.country === 'FR' && budgetMin >= 1.3) return true
    if (market.country === 'UK' && budgetMin >= 2) return true
    if (budgetMin >= 5) return true
    return false
  }, [market, budgetMin])

  const resetAll = () => {
    setScreen('welcome')
    setFlowFamily(null)
    setDirection(null)
    setMarketId(null)
    setBrief({ propertyType: '', budgetMin: '', budgetMax: '', sizeMin: '', sizeMax: '', nonNegotiables: '', timeline: '', confidentiality: '', secondaryMarkets: [] })
    setRetainedBriefState({ portfolioSize:'', jurisdictions:'', primaryFocus:'', promptedBy:'', additionalContext:'' })
    setRetainedSubType('')
    setSellerBrief({ propertyType:'', sizeM2:'', askingPrice:'', reasonForSale:'', timeline:'', confidentiality:'', keyFeatures:'', currentStatus:'' })
    setDisposalSubType('')
    setAcqProfile({ driver:'', climate:'', propType:'', budget:'', privacy:'', taxSituation:'', timeline:'', investObj:'' })
    setAcqStep(0); setAcqMatches([])
    setRentalBrief({ propertyType: '', groupAdults: '', groupChildren: '', pets: '', budgetWeek: '', budgetMonth: '', durationMonths: '', moveInDate: '', flexibility: '', priorities: [], nonNegotiables: '', arrivalDate: '', departureDate: '' })
    setStructuring({ vehicle: '', taxResidence: '', considerations: '' })
    setClient({ name: '', email: '', phone: '', taxResidence: '' })
    setMandateId(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ok */ }
  }

  const submitMandate = async (mandateData: Record<string, unknown>) => {
    try {
      await fetch('/api/intelligence/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'realestate',
          submittedAt: new Date().toISOString(),
          ...mandateData,
        }),
      })
    } catch (e) {
      console.error('Submit error:', e)
    }
  }

  const handleSubmitMandate = async () => {
    const id = `TGC-RE-${Date.now().toString(36).toUpperCase()}`
    setMandateId(id)
    const payload = isRentalFlow
      ? { mandateId: id, flowFamily, direction, client, rentalBrief, market: marketId }
      : isDisposalFlow
      ? { mandateId: id, flowFamily, direction: disposalSubType, client, sellerBrief, market: marketId, commercial }
      : isRetainedFlow
      ? { mandateId: id, flowFamily, direction: retainedSubType, client, retainedBrief: retainedBriefState }
      : { mandateId: id, flowFamily, direction, client, brief, structuring, market: marketId, commercial }
    await submitMandate(payload)
    setScreen('confirmation')
  }

  const generateMandateLetterText = () => {
    const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    return `THE GATEKEEPERS CLUB, SEARCH MANDATE

Reference: ${mandateId || '[pending]'}
Date: ${today}
Client: ${client.name || '[client name]'}

The Gatekeepers Club is instructed to identify and secure the following property on behalf of the client, acting as ${direction === 'sell' ? 'exclusive disposal agent' : direction === 'let' ? 'rental search agent' : 'exclusive buying agent'} in the territory defined.

1. THE BRIEF

Mandate type: ${direction?.toUpperCase()}
Property type: ${brief.propertyType || 'TBC'}
Primary territory: ${market?.name || 'TBC'}
Sub-location detail: ${market?.subLabel || ''}
Indicative budget: EUR ${brief.budgetMin || '[min]'}M to EUR ${brief.budgetMax || '[max]'}M (all-in including transaction costs and structuring)
Size range: ${brief.sizeMin || '[min]'} to ${brief.sizeMax || '[max]'} m2
Timeline: ${brief.timeline || 'TBC'}
Confidentiality: ${brief.confidentiality || 'Discreet (default)'}
Non-negotiables:
${brief.nonNegotiables || '[to be captured in discovery call]'}

2. THE STRUCTURING

Ownership vehicle: ${structuring.vehicle || jurisdiction?.defaultVehicle || 'TBC'}
Client tax residence: ${client.taxResidence || structuring.taxResidence || 'TBC'}
Jurisdiction framework: ${jurisdiction?.label || ''}
Wealth tax: ${jurisdiction?.wealthTax || ''}
Acquisition cost estimate: ${jurisdiction?.acquisitionCosts || ''}
Specific considerations:
${structuring.considerations || 'To be expanded in structuring brief'}

3. THE COMMERCIAL ARRANGEMENT

Retainer: EUR ${(commercial?.retainer || 0).toLocaleString()} covering active search period of 6-12 months, off-market sourcing, shortlist preparation, viewing coordination, notaire/legal introduction
Success fee: ${commercial?.successFee || 0}% of final ${direction === 'sell' ? 'sale' : 'acquisition'} price, payable on completion
Gatekeeper Points: accrued at standard TGC rate against both retainer and success fee

4. THE GATEKEEPER

Assigned lead: [to be confirmed on discovery call]
Direct contact details: [to follow by separate email]

5. CONFIDENTIALITY

Level: ${brief.confidentiality || 'Discreet'}
Disclosure policy: this mandate exists only between TGC, the named client, and specifically nominated legal counsel

6. SIGNATURES

For the client: ____________________  Date: __________

For The Gatekeepers Club: ____________________  Date: __________

Prepared for review; no signature required ahead of discovery call.
The Gatekeepers Club - thegatekeepersclub.com
`
  }

  const downloadMandateLetter = () => {
    const text = generateMandateLetterText()
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TGC-Mandate-${mandateId || 'draft'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ──────────────────────── STYLES ────────────────────────

  const styles: Record<string, React.CSSProperties> = {
    root: { minHeight: '100vh', background: '#F9F8F5', color: '#1a1815', fontFamily: "'Lato', sans-serif", padding: '40px 20px', lineHeight: 1.6 },
    container: { maxWidth: 920, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 48, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' },
    brand: { fontFamily: "'Poppins', sans-serif", fontSize: 26, fontWeight: 400, letterSpacing: '0.02em', color: '#0e4f51' },
    brandSub: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c8aa4a', marginTop: 4 },
    internalToggle: { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', background: 'transparent', border: '1px solid #e5e7eb', color: '#0e4f51', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit' },
    h1: { fontFamily: "'Poppins', sans-serif", fontSize: 48, fontWeight: 400, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.01em' },
    h2: { fontFamily: "'Poppins', sans-serif", fontSize: 32, fontWeight: 400, lineHeight: 1.2, marginBottom: 12 },
    h3: { fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 400, lineHeight: 1.3, marginTop: 28, marginBottom: 10 },
    eyebrow: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c8aa4a', marginBottom: 12 },
    bodyP: { fontSize: 16, marginBottom: 16, color: '#1a1815' },
    lead: { fontFamily: "'Poppins', sans-serif", fontWeight: 300, fontSize: 20, lineHeight: 1.55, color: '#6b7280', marginBottom: 28 },
    card: { background: '#F9F8F5', border: '1px solid #e5e7eb', padding: 24, marginBottom: 16, cursor: 'pointer', transition: 'all 0.2s', borderRadius: 8 },
    cardSelected: { borderColor: '#0e4f51', background: '#F9F8F5', boxShadow: '0 2px 8px rgba(14, 79, 81, 0.08)' },
    cardTitle: { fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 400, marginBottom: 4, color: '#1a1815' },
    cardDesc: { fontSize: 13, color: '#6b7280', lineHeight: 1.5 },
    button: { background: '#0e4f51', color: '#ffffff', border: 'none', padding: '14px 28px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', borderRadius: 8 },
    buttonSecondary: { background: 'transparent', color: '#1a1815', border: '1px solid #e5e7eb', padding: '14px 28px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 8 },
    buttonGold: { background: '#c8aa4a', color: '#ffffff', border: 'none', padding: '16px 32px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 8 },
    input: { width: '100%', padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', background: '#F9F8F5', border: '1px solid #e5e7eb', color: '#1a1815', boxSizing: 'border-box' },
    label: { display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#0e4f51', marginBottom: 6, marginTop: 16 },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 },
    tierBadge: { display: 'inline-block', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', padding: '3px 8px', marginLeft: 10, background: '#0e4f51', color: '#ffffff' },
    tierBadgeOut: { display: 'inline-block', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', padding: '3px 8px', marginLeft: 10, background: 'transparent', color: '#c8aa4a', border: '1px solid #c8aa4a' },
    priceBand: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, padding: '12px 0', borderBottom: '1px dashed #e5e7eb', fontSize: 14 },
    bandLabel: { color: '#0e4f51', fontWeight: 500 },
    bandValue: { fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13, color: '#1a1815' },
    list: { paddingLeft: 0, listStyle: 'none' },
    listItem: { padding: '6px 0 6px 20px', position: 'relative', fontSize: 14, color: '#1a1815', lineHeight: 1.55 },
    dash: { color: '#c8aa4a', position: 'absolute', left: 0 },
    progress: { display: 'flex', gap: 4, marginBottom: 36 },
    progressDot: { height: 2, flex: 1, background: '#e5e7eb' },
    progressDotActive: { height: 2, flex: 1, background: '#0e4f51' },
    draftNotice: { position: 'fixed', bottom: 20, right: 20, background: '#0e4f51', color: '#ffffff', padding: '12px 20px', fontSize: 12, letterSpacing: '0.1em', zIndex: 100 },
    internalPanel: { background: '#0e4f51', color: '#ffffff', padding: 20, margin: '24px 0', borderLeft: '3px solid #c8aa4a', fontFamily: "'Lato', sans-serif", fontSize: 12, lineHeight: 1.7 },
  }

  // Progress indicator
  const isRentalFlow = flowFamily === 'rental'
  const isAcqFlow = flowFamily === 'acquisition'
  const isDisposalFlow = flowFamily === 'disposal'
  const isRetainedFlow = flowFamily === 'retained'
  const screens = (isRentalFlow
    ? ['welcome', 'rental-type', 'market', 'rental-brief', 'rental-verdict', 'rental-commercial', 'client', 'confirmation']
    : isAcqFlow
    ? ['welcome', 'acq-questions', 'acq-match', 'verdict', showStructuringScreen ? 'structuring' : null, 'brief', 'commercial', 'client', 'confirmation']
    : isDisposalFlow
    ? ['welcome', 'flow-direction', 'market', 'disposal-brief', 'disposal-verdict', 'commercial', 'client', 'confirmation']
    : isRetainedFlow
    ? ['welcome', 'flow-direction', 'retained-brief', 'retained-overview', 'retained-commercial', 'client', 'confirmation']
    : ['welcome', 'flow-direction', 'market', 'brief', showStructuringScreen ? 'structuring' : null, 'verdict', 'commercial', 'client', 'confirmation']
  ).filter(Boolean) as Screen[]
  const currentIdx = screens.indexOf(screen)
  const progressWidth = screens.length

  // ──────────────────────── SCREENS ────────────────────────

  const renderWelcome = () => (
    <div>
      <div style={styles.eyebrow}>Real Estate Intelligence</div>
      <h1 style={styles.h1}>Thirty-four markets. Honestly mapped.</h1>
      <p style={styles.lead}>
        Buying, renting, or selling. We will translate your situation into a formal mandate, open the right conversation, and put one of our gatekeepers on it within four hours.
      </p>
      <p style={styles.bodyP}>
        TGC acts as your representative — buyer, tenant, or vendor. The right property rarely appears in an agent window.
      </p>
      <div style={{ marginTop: 28 }}>
        <div
          style={{ ...styles.card, ...(flowFamily === 'rental' ? styles.cardSelected : {}), borderLeft: '3px solid #c8aa4a' }}
          onClick={() => { setFlowFamily('rental'); setScreen('rental-type'); }}>
          <div style={{ ...styles.eyebrow, marginBottom: 8 }}>Tenant representation</div>
          <div style={styles.cardTitle}>Find a property to rent</div>
          <div style={styles.cardDesc}>Short-term holiday. Mid-term relocation (1-12 months). Long-term residential (12+ months). TGC acts as your tenant representative — sourcing, negotiating, and securing on your behalf.</div>
        </div>
        <div
          style={{ ...styles.card, ...(flowFamily === 'acquisition' ? styles.cardSelected : {}) }}
          onClick={() => { setFlowFamily('acquisition'); setAcqStep(0); setScreen('acq-questions'); }}>
          <div style={styles.cardTitle}>Acquisition</div>
          <div style={styles.cardDesc}>Buying. Primary residence, second home, pied-à-terre, investment — residential or commercial. Seven questions, then we tell you which 2-3 markets fit your brief and why.</div>
        </div>
        <div
          style={{ ...styles.card, ...(flowFamily === 'disposal' ? styles.cardSelected : {}) }}
          onClick={() => { setFlowFamily('disposal'); setScreen('flow-direction'); }}>
          <div style={styles.cardTitle}>Disposal</div>
          <div style={styles.cardDesc}>Selling. Open market, discreet register, or ultra-private buyer-matched sale. Often combined with re-allocation elsewhere.</div>
        </div>
        <div
          style={{ ...styles.card, ...(flowFamily === 'retained' ? styles.cardSelected : {}) }}
          onClick={() => { setFlowFamily('retained'); setScreen('flow-direction'); }}>
          <div style={styles.cardTitle}>Retained Strategy</div>
          <div style={styles.cardDesc}>An ongoing family-office relationship, multiple mandates over time, one point of coordination, one honest view of the portfolio.</div>
        </div>
      </div>
    </div>
  )

  const renderFlowDirection = () => {
    const options = flowFamily === 'acquisition' ? [
      { id: 'buy-primary', label: 'Buy · Primary residence', desc: 'Where you will actually live.', dir: 'buy' as Direction },
      { id: 'buy-second', label: 'Buy · Second home', desc: 'The other place. Summer, winter, or year-round rotation.', dir: 'buy' as Direction },
      { id: 'buy-piedaterre', label: 'Buy · Pied-à-terre', desc: 'Smaller urban base, typically Paris, London, New York, or Monaco.', dir: 'buy' as Direction },
      { id: 'buy-invest', label: 'Buy · Investment', desc: 'Capital appreciation or yield play. Different structuring conversation.', dir: 'invest' as Direction },
      { id: 'buy-develop', label: 'Buy · Land / development', desc: 'Raw land or redevelopment opportunity. Longer horizon, different risk profile.', dir: 'develop' as Direction },
    ] : flowFamily === 'disposal' ? [
      { id: 'sell-open',     label: 'Sell · Open market',       desc: 'Full professional marketing across the right channels. Maximum exposure to the qualified buyer pool.', dir: 'sell' as Direction },
      { id: 'sell-discreet', label: 'Sell · Discreet register',  desc: 'Private buyer list, no public marketing. The most common approach for TGC mandates — serious buyers prefer it.', dir: 'sell' as Direction },
      { id: 'sell-ultra',    label: 'Sell · Ultra-private',      desc: 'Specific buyer identified or approached. Zero market footprint, no list, no disclosure.', dir: 'sell' as Direction },
      { id: 'sell-reinvest', label: 'Exit and re-allocate',      desc: 'Selling here, acquiring elsewhere. One coordinated TGC mandate — disposal and acquisition run in parallel.', dir: 'sell' as Direction },
    ] : [
      { id: 'retained-family-office', label: 'Family office · multi-mandate', desc: 'Ongoing relationship. Multiple properties, multiple jurisdictions, single point of coordination.', dir: 'retained' as Direction },
      { id: 'retained-discovery', label: 'Opening conversation', desc: 'Not a specific mandate yet, you want to start the dialogue.', dir: 'retained' as Direction },
    ]
    return (
      <div>
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('welcome')}>Back</button>
        <div style={styles.eyebrow}>{flowFamily === 'acquisition' ? 'Acquisition' : flowFamily === 'disposal' ? 'Disposal' : 'Retained Strategy'}</div>
        <h2 style={styles.h2}>Which direction?</h2>
        <p style={styles.bodyP}>The sub-type shapes what we ask next.</p>
        <div style={{ marginTop: 24 }}>
          {options.map(o => (
            <div key={o.id} style={{ ...styles.card, ...(disposalSubType === o.id || (direction === o.dir && marketId === null && flowFamily !== 'disposal') ? styles.cardSelected : {}) }}
                 onClick={() => { setDirection(o.dir); if (flowFamily === 'disposal') setDisposalSubType(o.id); if (flowFamily === 'retained') setRetainedSubType(o.id); setScreen(flowFamily === 'retained' ? 'retained-brief' : 'market'); }}>
              <div style={styles.cardTitle}>{o.label}</div>
              <div style={styles.cardDesc}>{o.desc}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderMarketSelector = () => {
    const tierGroups: Record<number, (Market & { id: string })[]> = { 1: [], 2: [], 3: [], 4: [] }
    Object.entries(MARKETS).forEach(([id, m]) => {
      const matches = !marketSearch || m.name.toLowerCase().includes(marketSearch.toLowerCase()) || m.subLabel.toLowerCase().includes(marketSearch.toLowerCase()) || m.region.toLowerCase().includes(marketSearch.toLowerCase())
      if (matches) tierGroups[m.tier].push({ id, ...m })
    })
    const tierLabels: Record<number, { title: string; subtitle: string }> = {
      1: { title: 'Heartland', subtitle: 'Direct TGC network, end-to-end mandate execution' },
      2: { title: 'Active & European', subtitle: 'Strong editorial, working partnerships' },
      3: { title: 'Emerging & Authentic', subtitle: 'Curated editorial, trusted partner delivery' },
      4: { title: 'Global Partner Markets', subtitle: 'Mandate-taking via established international partners' },
    }
    return (
      <div>
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen(isRentalFlow ? 'rental-type' : 'flow-direction')}>Back</button>
        <div style={styles.eyebrow}>Market</div>
        <h2 style={styles.h2}>Where?</h2>
        <p style={styles.bodyP}>Thirty-one markets, grouped by how deep our direct network runs.</p>
        <input
          type="text" placeholder="Search markets (e.g., Provence, Cape Town, Ibiza)"
          value={marketSearch} onChange={e => setMarketSearch(e.target.value)}
          style={{ ...styles.input, marginTop: 20, marginBottom: 28 }}
        />
        {[1, 2, 3, 4].map(tier => {
          if (tierGroups[tier].length === 0) return null
          return (
            <div key={tier} style={{ marginBottom: 36 }}>
              <div style={styles.eyebrow}>Tier {tier} — {tierLabels[tier].title}</div>
              <p style={{ fontSize: 13, color: '#0e4f51', marginBottom: 16 }}>{tierLabels[tier].subtitle}</p>
              <div style={styles.grid2}>
                {tierGroups[tier].map(m => (
                  <div key={m.id} style={{ ...styles.card, ...(marketId === m.id ? styles.cardSelected : {}), marginBottom: 0 }}
                       onClick={() => { setMarketId(m.id); setScreen(isRentalFlow ? 'rental-brief' : isDisposalFlow ? 'disposal-brief' : 'brief'); }}>
                    <div style={styles.cardTitle}>{m.name}</div>
                    <div style={styles.cardDesc}>{m.subLabel}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderBrief = () => {
    const propertyTypes = ['Villa / standalone house', 'Apartment / pied-à-terre', 'Estate / finca / domain', 'Townhouse / hôtel particulier', 'Chalet', 'Château / castle', 'Land / development plot']
    const timelines = ['Immediate (3 months)', 'Within 6 months', 'Within 12 months', 'Browsing (24+ months)', 'Only if the right thing appears']
    const confidentialities = ['Open, standard marketing is fine', 'Discreet, no public marketing, private register', 'Ultra-private, specific buyer pursuit only']
    return (
      <div>
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen(isAcqFlow ? 'verdict' : 'market')}>Back</button>
        <div style={styles.eyebrow}>The Brief</div>
        <h2 style={styles.h2}>Tell us about the property.</h2>
        <p style={styles.bodyP}>Six questions. You can come back and refine; we will save as you go.</p>

        <label style={styles.label}>Property type</label>
        <select style={styles.input} value={brief.propertyType} onChange={e => setBrief({ ...brief, propertyType: e.target.value })}>
          <option value="">Select...</option>
          {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={styles.label}>Budget minimum (EUR M)</label>
            <input type="number" style={styles.input} value={brief.budgetMin} placeholder="e.g., 3" onChange={e => setBrief({ ...brief, budgetMin: e.target.value })} />
          </div>
          <div>
            <label style={styles.label}>Budget maximum (EUR M)</label>
            <input type="number" style={styles.input} value={brief.budgetMax} placeholder="e.g., 8" onChange={e => setBrief({ ...brief, budgetMax: e.target.value })} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={styles.label}>Size minimum (m2)</label>
            <input type="number" style={styles.input} value={brief.sizeMin} placeholder="e.g., 300" onChange={e => setBrief({ ...brief, sizeMin: e.target.value })} />
          </div>
          <div>
            <label style={styles.label}>Size maximum (m2)</label>
            <input type="number" style={styles.input} value={brief.sizeMax} placeholder="e.g., 600" onChange={e => setBrief({ ...brief, sizeMax: e.target.value })} />
          </div>
        </div>

        <label style={styles.label}>Non-negotiables, the three or four things that matter most</label>
        <textarea rows={4} style={{ ...styles.input, resize: 'vertical' }} value={brief.nonNegotiables} placeholder="e.g., Sea view, 4+ bedrooms, pool, discreet (no gated-community development), within 30 min of airport" onChange={e => setBrief({ ...brief, nonNegotiables: e.target.value })} />

        <label style={styles.label}>Timeline</label>
        <select style={styles.input} value={brief.timeline} onChange={e => setBrief({ ...brief, timeline: e.target.value })}>
          <option value="">Select...</option>
          {timelines.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label style={styles.label}>Confidentiality</label>
        <select style={styles.input} value={brief.confidentiality} onChange={e => setBrief({ ...brief, confidentiality: e.target.value })}>
          <option value="">Select...</option>
          {confidentialities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
          <button style={styles.button}
            onClick={() => setScreen(isAcqFlow ? 'commercial' : showStructuringScreen ? 'structuring' : 'verdict')}
            disabled={!brief.propertyType && !acqProfile.propType}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ──────────────────────── ACQUISITION GUIDED QUESTIONS ────────────────────────

  const renderAcqQuestions = () => {
    const isInvestmentTrack = acqProfile.driver === 'investment'
    const visibleQuestions = ACQ_QUESTIONS.filter(q => {
      if (q.key === 'investObj') return isInvestmentTrack
      return true
    })
    const currentQ = visibleQuestions[acqStep]
    if (!currentQ) return null
    const totalSteps = visibleQuestions.length

    const handleAcqAnswer = (key: string, value: string) => {
      const newProfile = { ...acqProfile, [key]: value }
      if (key === 'driver') {
        const driverDirectionMap: Record<string,Direction> = { lifestyle:'buy', relocation:'buy', tax:'buy', investment:'invest', development:'develop' }
        setDirection(driverDirectionMap[value] || 'buy')
      }
      setAcqProfile(newProfile)
      setTimeout(() => {
        const nextStep = acqStep + 1
        const newVisible = ACQ_QUESTIONS.filter(q => q.key !== 'investObj' || newProfile.driver === 'investment')
        if (nextStep < newVisible.length) {
          setAcqStep(nextStep)
        } else {
          const matches = computeMarketMatch(newProfile)
          setAcqMatches(matches)
          setScreen('acq-match')
        }
      }, 250)
    }

    return (
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:8 }}>
          <button style={styles.buttonSecondary} onClick={() => { if(acqStep > 0) setAcqStep(acqStep-1); else setScreen('welcome') }}>Back</button>
          <div style={styles.progress}>
            {Array.from({ length: totalSteps }).map((_,i) => (
              <div key={i} style={i < acqStep ? styles.progressDotActive : i === acqStep ? { ...styles.progressDotActive, background:'#c8aa4a' } : styles.progressDot}/>
            ))}
          </div>
        </div>

        <div key={acqStep}>
          <div style={styles.eyebrow}>Acquisition · Question {acqStep+1} of {totalSteps}</div>
          <h2 style={styles.h2}>{currentQ.question}</h2>
          <p style={styles.bodyP}>{currentQ.subtitle}</p>

          <div style={{ marginTop:24 }}>
            {currentQ.options.map(opt => {
              const selected = (acqProfile as any)[currentQ.key] === opt.value
              return (
                <div key={opt.value}
                  style={{ ...styles.card, ...(selected ? styles.cardSelected : {}), display:'flex', alignItems:'flex-start', gap:16 }}
                  onClick={() => handleAcqAnswer(currentQ.key, opt.value)}>
                  <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${selected ? '#0e4f51' : '#e5e7eb'}`, background: selected ? '#0e4f51' : 'transparent', flexShrink:0, marginTop:2, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {selected && <div style={{ width:8, height:8, borderRadius:'50%', background:'#ffffff' }}/>}
                  </div>
                  <div>
                    <div style={styles.cardTitle}>{opt.label}</div>
                    <div style={styles.cardDesc}>{opt.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderAcqMatch = () => {
    if (acqMatches.length === 0) return null
    const appreciationLabel: Record<string,string> = { strong:'Strong', moderate:'Moderate', flat:'Flat', speculative:'Speculative upside' }
    const appreciationColor: Record<string,string> = { strong:'#0e4f51', moderate:'#0e4f51', flat:'#6b7280', speculative:'#c8aa4a' }
    const budgetLabel: Record<string,string> = { 'under-1':'Under €1M', '1-3':'€1-3M', '3-8':'€3-8M', '8-20':'€8-20M', 'over-20':'Over €20M' }
    const budgetPos = (mid: string, bMin: number, bMax: number): string => {
      const lo = {'under-1':0,'1-3':1,'3-8':3,'8-20':8,'over-20':20}[mid] || 0
      if (lo <= bMin * 1.2) return 'entry band'
      if (lo >= bMax * 0.7) return 'trophy band'
      return 'realistic band'
    }

    return (
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:8 }}>
          <button style={styles.buttonSecondary} onClick={() => { setAcqStep(ACQ_QUESTIONS.filter(q => q.key !== 'investObj' || acqProfile.driver === 'investment').length - 1); setScreen('acq-questions') }}>Adjust brief</button>
          <button style={{ ...styles.buttonSecondary, fontSize:10 }} onClick={resetAll}>Start over</button>
        </div>

        <div style={styles.eyebrow}>Market match · Your brief answered</div>
        <h2 style={styles.h2}>Three markets worth considering.</h2>
        <p style={styles.bodyP}>
          Based on your brief — {[acqProfile.driver, acqProfile.climate !== 'any' ? acqProfile.climate : null, budgetLabel[acqProfile.budget], acqProfile.privacy !== 'any' ? acqProfile.privacy + ' privacy' : null].filter(Boolean).join(', ')} — here is where we would look.
        </p>

        <div style={{ marginTop:28 }}>
          {acqMatches.map((match, idx) => {
            const market = MARKETS[match.marketId]
            const mp = MATCH_PROFILES[match.marketId]
            if (!market || !mp) return null
            const isTop = idx === 0
            return (
              <div key={match.marketId} style={{ ...styles.card, ...(isTop ? { borderColor:'#0e4f51', borderWidth:2, background:'rgba(14,79,81,0.03)' } : {}), marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8, marginBottom:12 }}>
                  <div>
                    {isTop && <div style={{ ...styles.eyebrow, color:'#c8aa4a', marginBottom:6 }}>★ Top match</div>}
                    <div style={styles.cardTitle}>{market.name}</div>
                    <div style={styles.cardDesc}>{market.subLabel}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:11, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Budget position</div>
                    <div style={{ fontFamily:"'Lato',sans-serif", fontWeight:700, fontSize:13, color:'#1a1815' }}>{budgetPos(acqProfile.budget, mp.bMin, mp.bMax)}</div>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:12, padding:'12px 0', borderTop:'1px dashed #e5e7eb', borderBottom:'1px dashed #e5e7eb', marginBottom:16 }}>
                  <div><div style={{ fontSize:10, color:'#c8aa4a', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:3 }}>Yield</div><div style={{ fontWeight:700, fontSize:13 }}>{mp.yield}</div></div>
                  <div><div style={{ fontSize:10, color:'#c8aa4a', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:3 }}>Appreciation</div><div style={{ fontWeight:700, fontSize:13, color:appreciationColor[mp.appreciation] }}>{appreciationLabel[mp.appreciation]}</div></div>
                  <div><div style={{ fontSize:10, color:'#c8aa4a', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:3 }}>Privacy</div><div style={{ fontWeight:700, fontSize:13 }}>{mp.privacy}/10</div></div>
                  <div><div style={{ fontSize:10, color:'#c8aa4a', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:3 }}>Liquidity</div><div style={{ fontWeight:700, fontSize:13 }}>{mp.liquidity}/10</div></div>
                </div>

                {match.reasons.length > 0 && (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:11, color:'#0e4f51', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>Why this fits your brief</div>
                    <ul style={styles.list}>
                      {match.reasons.map((r,i) => <li key={i} style={{ ...styles.listItem, fontSize:13 }}><span style={styles.dash}>*</span>{r}</li>)}
                    </ul>
                  </div>
                )}

                {match.tradeoff && (
                  <div style={{ fontSize:12, color:'#6b7280', fontStyle:'italic', marginBottom:16, borderLeft:'2px solid #e5e7eb', paddingLeft:10 }}>
                    {match.tradeoff}
                  </div>
                )}

                <div style={{ fontSize:11, color:'#0e4f51', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>TGC advantage in this market</div>
                <div style={{ fontSize:13, color:'#1a1815', marginBottom:16 }}>{mp.whyTGC}</div>

                <button style={isTop ? styles.button : styles.buttonSecondary}
                  onClick={() => { setMarketId(match.marketId); setDirection(acqProfile.driver === 'investment' ? 'invest' : acqProfile.driver === 'development' ? 'develop' : 'buy'); setScreen('verdict') }}>
                  {isTop ? `Open the ${market.name} brief →` : `Explore ${market.name} instead →`}
                </button>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop:12, padding:'16px 20px', background:'#F9F8F5', border:'1px solid #e5e7eb' }}>
          <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.6 }}>
            Not seeing the right market? <button style={{ background:'none', border:'none', color:'#0e4f51', cursor:'pointer', fontSize:12, padding:0, textDecoration:'underline' }} onClick={() => { setAcqStep(0); setScreen('acq-questions') }}>Adjust your brief</button> — one changed answer can shift the shortlist significantly.
          </div>
        </div>
      </div>
    )
  }

  // ──────────────────────── RETAINED SCREENS ────────────────────────

  const renderRetainedBrief = () => {
    const isFamily = retainedSubType === 'retained-family-office'
    const portfolioOptions = ['1 property', '2-3 properties', '4-6 properties', '7-10 properties', '10+ properties']
    const focusOptions = ['Next acquisition', 'Disposal of an existing property', 'Rental management or tenant search', 'Portfolio review and market positioning', 'Estate and structuring planning', 'All of the above — full coordination']
    const promptedOptions = ['Major life event (relocation, retirement, inheritance)', 'Tax regime change or planning trigger', 'Existing advisor not providing the coordination we need', 'Building the portfolio systematically', 'Introduced by a trusted contact', 'Prefer not to say']
    return (
      <div>
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('flow-direction')}>Back</button>
        <div style={styles.eyebrow}>Retained Strategy · {isFamily ? 'Family office' : 'Opening conversation'}</div>
        <h2 style={styles.h2}>{isFamily ? 'Tell us about the portfolio.' : 'Tell us what prompted this.'}</h2>
        <p style={styles.bodyP}>
          {isFamily
            ? 'A retained relationship starts with understanding what already exists and what you are trying to build or resolve. No commitment is required before the first conversation.'
            : 'An opening conversation is exactly that — no brief, no commitment, no pressure. We just want to understand your situation and whether TGC is the right fit.'}
        </p>

        {isFamily && (
          <>
            <label style={styles.label}>Current portfolio size</label>
            <select style={styles.input} value={retainedBriefState.portfolioSize} onChange={e => setRetainedBriefState({ ...retainedBriefState, portfolioSize: e.target.value })}>
              <option value="">Select...</option>
              {portfolioOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>

            <label style={styles.label}>Jurisdictions involved (countries or regions)</label>
            <input type="text" style={styles.input} value={retainedBriefState.jurisdictions}
              placeholder="e.g., France, UK, Monaco, Spain — or just getting started in one"
              onChange={e => setRetainedBriefState({ ...retainedBriefState, jurisdictions: e.target.value })} />

            <label style={styles.label}>Primary focus right now</label>
            <select style={styles.input} value={retainedBriefState.primaryFocus} onChange={e => setRetainedBriefState({ ...retainedBriefState, primaryFocus: e.target.value })}>
              <option value="">Select...</option>
              {focusOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </>
        )}

        <label style={styles.label}>What prompted this conversation?</label>
        <select style={styles.input} value={retainedBriefState.promptedBy} onChange={e => setRetainedBriefState({ ...retainedBriefState, promptedBy: e.target.value })}>
          <option value="">Select...</option>
          {promptedOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        <label style={styles.label}>Anything else that would help us prepare for the first conversation</label>
        <textarea rows={4} style={{ ...styles.input, resize: 'vertical' }} value={retainedBriefState.additionalContext}
          placeholder={isFamily
            ? "e.g., Existing SCI structures in France, planning a move from UK to Monaco, children need to be factored into estate planning..."
            : "e.g., We have been looking at the south of France for two years and want a considered view before committing to anything..."}
          onChange={e => setRetainedBriefState({ ...retainedBriefState, additionalContext: e.target.value })} />

        <div style={{ marginTop: 32 }}>
          <button style={styles.button}
            onClick={() => setScreen('retained-overview')}
            disabled={!retainedBriefState.promptedBy}>
            See how it works →
          </button>
        </div>
      </div>
    )
  }

  const renderRetainedOverview = () => {
    const isFamily = retainedSubType === 'retained-family-office'
    return (
      <div>
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('retained-brief')}>Back</button>
        <div style={styles.eyebrow}>Retained Strategy · How it works</div>
        <h2 style={styles.h2}>One relationship. Every property.</h2>
        <p style={styles.lead}>
          {isFamily
            ? 'A retained mandate with TGC means one named Gatekeeper coordinates every property decision across every jurisdiction. Acquisitions, disposals, rentals, tenants, structuring — one coherent view, one point of contact.'
            : 'An opening conversation is forty-five minutes. No slides, no pitch. We listen, we ask honest questions, and we tell you whether and how TGC can add value to your situation. If it is not the right fit, we say so.'}
        </p>

        {isFamily && (
          <>
            <h3 style={styles.h3}>What a retained relationship includes</h3>
            <ul style={styles.list}>
              {[
                'Single named Gatekeeper — not a team, not a rotation, the same person who knows the portfolio',
                'Acquisition mandates across any of our 34 markets, from identification to completion',
                'Disposal mandates — discreet or open market, coordinated with the acquisition side when re-allocating',
                'Rental and tenant search in any market, short or long-term, managed as a single portfolio function',
                'Annual portfolio review — market conditions, asset positioning, what to hold, what to consider selling',
                'Structuring context provided; formal tax advice coordinated through your existing counsel or introduced specialists',
                'Opportunity identification — off-market properties, pre-market opportunities, emerging market calls',
              ].map((item, i) => <li key={i} style={styles.listItem}><span style={styles.dash}>*</span>{item}</li>)}
            </ul>

            <h3 style={styles.h3}>What TGC is not</h3>
            <ul style={styles.list}>
              {[
                'A family office — we do not replace your existing legal, tax, or financial advisors',
                'A property management company — day-to-day property maintenance is coordinated through specialist managers we introduce',
                'An agent with a listings inventory — we work off-market and through our network, not from a portal',
              ].map((item, i) => <li key={i} style={styles.listItem}><span style={styles.dash}>*</span>{item}</li>)}
            </ul>
          </>
        )}

        <div style={{ background: '#0e4f51', color: '#fff', padding: 24, margin: '28px 0', borderLeft: '3px solid #c8aa4a' }}>
          <div style={{ ...styles.eyebrow, color: '#c8aa4a', marginBottom: 8 }}>The discovery call</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.88)', margin: '0 0 12px', lineHeight: 1.6 }}>
            Everything starts with a conversation. {isFamily
              ? 'Your Gatekeeper will come prepared with a reading of your portfolio context and a set of honest questions. The call is typically 45-60 minutes. No commitment on either side.'
              : 'We will listen more than we speak. If the fit is right, we will propose a retained structure. If it is not, we will say so and point you somewhere that is.'}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.55 }}>
            Response within four hours of your brief being received.
          </p>
        </div>

        <div style={{ marginTop: 8 }}>
          <button style={styles.button} onClick={() => setScreen('retained-commercial')}>The commercial structure →</button>
        </div>
      </div>
    )
  }

  const renderRetainedCommercial = () => {
    const isFamily = retainedSubType === 'retained-family-office'
    return (
      <div>
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('retained-overview')}>Back</button>
        <div style={styles.eyebrow}>The commercial structure</div>
        <h2 style={styles.h2}>How we work together.</h2>
        <p style={styles.bodyP}>
          {isFamily
            ? 'A retained relationship is structured around the volume and complexity of the portfolio. We discuss the specific arrangement on the discovery call — no commitment is required before then.'
            : 'An opening conversation has no commercial structure. It is simply a conversation.'}
        </p>

        {isFamily ? (
          <>
            <div style={{ ...styles.card, background: '#F9F8F5', cursor: 'default', marginTop: 20 }}>
              <div style={styles.priceBand}>
                <div style={styles.bandLabel}>Annual advisory retainer</div>
                <div style={styles.bandValue}>Agreed at first meeting — portfolio-dependent</div>
              </div>
              <div style={styles.priceBand}>
                <div style={styles.bandLabel}>Transaction success fees</div>
                <div style={styles.bandValue}>Standard TGC rates on each completed mandate</div>
              </div>
              <div style={styles.priceBand}>
                <div style={styles.bandLabel}>Rental placement</div>
                <div style={styles.bandValue}>One month's rent per placement (success-only)</div>
              </div>
              <div style={styles.priceBand}>
                <div style={styles.bandLabel}>Gatekeeper Points</div>
                <div style={styles.bandValue}>Accrued across all activity at standard TGC rate</div>
              </div>
              <p style={{ fontSize: 13, color: '#0e4f51', marginTop: 12, lineHeight: 1.6 }}>
                The retainer covers advisory, coordination, and portfolio oversight. Transaction success fees are charged separately on each completed mandate. The retainer is credited against success fees in the first year.
              </p>
            </div>

            <h3 style={styles.h3}>What the retainer covers</h3>
            <ul style={styles.list}>
              {[
                'Unlimited access to your named Gatekeeper — calls, messages, site visits',
                'Annual portfolio review with written market positioning summary',
                'Proactive opportunity identification — off-market and pre-market',
                'Coordination of legal, notaire, and specialist advisors across all markets',
                'Quarterly market intelligence briefings on your relevant jurisdictions',
              ].map((item, i) => <li key={i} style={styles.listItem}><span style={styles.dash}>*</span>{item}</li>)}
            </ul>
          </>
        ) : (
          <div style={{ ...styles.card, background: '#F9F8F5', cursor: 'default', marginTop: 20 }}>
            <div style={styles.priceBand}>
              <div style={styles.bandLabel}>Discovery call</div>
              <div style={styles.bandValue}>No charge, no commitment</div>
            </div>
            <p style={{ fontSize: 13, color: '#0e4f51', marginTop: 12, lineHeight: 1.6 }}>
              If after the call we agree to work together, we will propose a structure suited to your situation. Nothing is committed before that conversation.
            </p>
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <button style={styles.button} onClick={() => setScreen('client')}>Continue, your details</button>
        </div>
      </div>
    )
  }

  // ──────────────────────── DISPOSAL SCREENS ────────────────────────

  const renderDisposalBrief = () => {
    const propertyTypes = ['Villa / standalone house', 'Apartment / pied-à-terre', 'Estate / domain / farmhouse', 'Townhouse / hôtel particulier', 'Chalet', 'Château / manor house', 'Commercial property', 'Land / development plot']
    const timelines = ['Urgent — within 3 months', 'Motivated — 6-12 months', 'Measured — 12-24 months', 'Patient — when the right buyer appears']
    const reasons = ['Lifestyle change or relocation', 'Portfolio rebalancing', 'Upgrading or downsizing', 'Estate planning', 'Tax restructuring', 'Capital release', 'Prefer not to say']
    const statuses = ['Owner-occupied', 'Vacant', 'Tenanted — long-term', 'Tenanted — short-term seasonal', 'Part-occupied / part-let']
    const subLabel: Record<string,string> = { 'sell-open':'Open market', 'sell-discreet':'Discreet register', 'sell-ultra':'Ultra-private', 'sell-reinvest':'Exit & re-allocate' }
    return (
      <div>
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('market')}>Back</button>
        <div style={styles.eyebrow}>Disposal · {subLabel[disposalSubType] || 'Sale'} · {market?.name}</div>
        <h2 style={styles.h2}>Tell us about the property.</h2>
        <p style={styles.bodyP}>The brief shapes how we position the mandate and who we approach. Everything here stays between us.</p>

        <label style={styles.label}>Property type</label>
        <select style={styles.input} value={sellerBrief.propertyType} onChange={e => setSellerBrief({ ...sellerBrief, propertyType: e.target.value })}>
          <option value="">Select...</option>
          {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={styles.label}>Size (m²)</label>
            <input type="number" style={styles.input} value={sellerBrief.sizeM2} placeholder="e.g., 450" onChange={e => setSellerBrief({ ...sellerBrief, sizeM2: e.target.value })} />
          </div>
          <div>
            <label style={styles.label}>Guide price (EUR M)</label>
            <input type="number" style={styles.input} value={sellerBrief.askingPrice} placeholder="e.g., 6.5" onChange={e => setSellerBrief({ ...sellerBrief, askingPrice: e.target.value })} />
          </div>
        </div>

        <label style={styles.label}>Current status</label>
        <select style={styles.input} value={sellerBrief.currentStatus} onChange={e => setSellerBrief({ ...sellerBrief, currentStatus: e.target.value })}>
          <option value="">Select...</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <label style={styles.label}>Reason for sale (internal use — shapes our strategy)</label>
        <select style={styles.input} value={sellerBrief.reasonForSale} onChange={e => setSellerBrief({ ...sellerBrief, reasonForSale: e.target.value })}>
          <option value="">Select...</option>
          {reasons.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <label style={styles.label}>Timeline</label>
        <select style={styles.input} value={sellerBrief.timeline} onChange={e => setSellerBrief({ ...sellerBrief, timeline: e.target.value })}>
          <option value="">Select...</option>
          {timelines.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label style={styles.label}>Confidentiality</label>
        <select style={styles.input} value={sellerBrief.confidentiality} onChange={e => setSellerBrief({ ...sellerBrief, confidentiality: e.target.value })}>
          <option value="">Select...</option>
          <option value="Open">Open — standard marketing is fine</option>
          <option value="Discreet">Discreet — no public listing, private buyer register only</option>
          <option value="Ultra-private">Ultra-private — specific buyer approached, zero public footprint</option>
        </select>

        <label style={styles.label}>What makes this property distinctive (2-4 things that will define our positioning)</label>
        <textarea rows={4} style={{ ...styles.input, resize: 'vertical' }} value={sellerBrief.keyFeatures}
          placeholder="e.g., Sea view from every room, 8 hectares of pinède, recently renovated to high specification, private access road, helicopter pad"
          onChange={e => setSellerBrief({ ...sellerBrief, keyFeatures: e.target.value })} />

        <div style={{ marginTop: 32 }}>
          <button style={styles.button}
            onClick={() => setScreen('disposal-verdict')}
            disabled={!sellerBrief.propertyType || !sellerBrief.askingPrice || !sellerBrief.timeline}>
            See market view →
          </button>
        </div>
      </div>
    )
  }

  const renderDisposalVerdict = () => {
    if (!market) return null
    const subLabel: Record<string,{label:string;approach:string}> = {
      'sell-open':     { label:'Open market', approach:'Full professional marketing across qualified buyer channels — agent partnerships, TGC buyer register, curated private outreach.' },
      'sell-discreet': { label:'Discreet register', approach:'Private buyer register only. No public listing, no photography circulated without NDA. Our preferred approach for significant mandates.' },
      'sell-ultra':    { label:'Ultra-private', approach:'Specific buyer identification and approach. Zero public footprint. Typically used when a specific buyer profile or person has been identified.' },
      'sell-reinvest': { label:'Exit and re-allocate', approach:'Disposal and acquisition coordinated as one mandate. Your Gatekeeper manages both sides in parallel to avoid a capital gap.' },
    }
    const sub = subLabel[disposalSubType] || subLabel['sell-discreet']
    const askingPriceNum = parseFloat(sellerBrief.askingPrice) || 0
    const allPriceBands = Object.entries(market.priceBands)
    const firstBand = allPriceBands[0]?.[1]
    const pricePosition = firstBand
      ? askingPriceNum < (firstBand.entry?.[1] || 0) ? 'entry'
        : askingPriceNum < (firstBand.realistic?.[1] || 0) ? 'realistic'
        : 'trophy'
      : 'realistic'

    return (
      <div>
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('disposal-brief')}>Back</button>
        <div style={styles.eyebrow}>Disposal view · {market.name}</div>
        <h2 style={styles.h2}>{market.name}</h2>
        <p style={{ fontSize: 14, color: '#0e4f51', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{market.subLabel}</p>

        {market.disposalEditorial ? (
          <p style={styles.lead}>{market.disposalEditorial}</p>
        ) : (
          <p style={styles.lead}>{market.editorial}</p>
        )}

        {market.criticalContext && (
          <div style={{ background: '#F9F8F5', borderLeft: '3px solid #c8aa4a', padding: 20, marginBottom: 24 }}>
            <div style={styles.eyebrow}>Critical context for sellers</div>
            <p style={{ fontSize: 15, color: '#1a1815', margin: 0, lineHeight: 1.6 }}>{market.criticalContext}</p>
          </div>
        )}

        {market.typicalBuyer && (
          <div style={{ marginBottom: 28 }}>
            <h3 style={styles.h3}>Likely buyer profile</h3>
            <p style={{ fontSize: 15, color: '#1a1815', lineHeight: 1.6 }}>{market.typicalBuyer}</p>
          </div>
        )}

        <h3 style={styles.h3}>Pricing reality check</h3>
        <div style={{ background: '#F9F8F5', border: '1px solid #e5e7eb', padding: 20, marginBottom: 28 }}>
          {sellerBrief.askingPrice && (
            <div style={styles.priceBand}>
              <div style={styles.bandLabel}>Your guide price</div>
              <div style={styles.bandValue}>EUR {sellerBrief.askingPrice}M — {pricePosition} band for this market</div>
            </div>
          )}
          {allPriceBands.slice(0,2).map(([label, bands]) => (
            <div key={label} style={{ padding: '10px 0', borderBottom: '1px dashed #e5e7eb' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1815', marginBottom: 6 }}>{label}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: 12 }}>
                {bands.entry && <div><div style={{ color: '#c8aa4a', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>Entry</div><div style={{ fontWeight: 700 }}>EUR {bands.entry[0]}-{bands.entry[1]}M</div></div>}
                {bands.realistic && <div><div style={{ color: '#c8aa4a', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>Realistic</div><div style={{ fontWeight: 700 }}>EUR {bands.realistic[0]}-{bands.realistic[1]}M</div></div>}
                {bands.trophy && <div><div style={{ color: '#c8aa4a', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>Trophy</div><div style={{ fontWeight: 700 }}>EUR {bands.trophy[0]}-{bands.trophy[1]}M</div></div>}
              </div>
            </div>
          ))}
        </div>

        {market.saleTimeline && (
          <div style={{ marginBottom: 28 }}>
            <h3 style={styles.h3}>Realistic timeline</h3>
            <p style={{ fontSize: 15, color: '#1a1815', lineHeight: 1.6 }}>{market.saleTimeline}</p>
          </div>
        )}

        <div style={{ background: '#0e4f51', color: '#fff', padding: 24, marginBottom: 28, borderLeft: '3px solid #c8aa4a' }}>
          <div style={{ ...styles.eyebrow, color: '#c8aa4a', marginBottom: 8 }}>TGC's approach — {sub.label}</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.88)', margin: 0, lineHeight: 1.6 }}>{sub.approach}</p>
          {disposalSubType === 'sell-reinvest' && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 12, marginBottom: 0, lineHeight: 1.55 }}>
              Your Gatekeeper will open both sides simultaneously. The acquisition brief is captured separately after the disposal mandate is confirmed — or we can begin both now.
            </p>
          )}
        </div>

        {internalView && (
          <div style={styles.internalPanel}>
            <div style={{ color: '#c8aa4a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.15em' }}>// INTERNAL VIEW</div>
            <div>TGC coverage: {market.coverage}</div>
            <div>Market ID: {marketId} · Tier {market.tier}</div>
            <div>Asking price: EUR {sellerBrief.askingPrice}M · Size: {sellerBrief.sizeM2}m² · Reason: {sellerBrief.reasonForSale}</div>
            <div>Disposal sub-type: {disposalSubType}</div>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <button style={styles.button} onClick={() => setScreen('commercial')}>The commercial arrangement →</button>
        </div>
      </div>
    )
  }

  // ──────────────────────── RENTAL SCREENS ────────────────────────

  const renderRentalType = () => (
    <div>
      <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('welcome')}>Back</button>
      <div style={styles.eyebrow}>Rental Search · Tenant Representation</div>
      <h2 style={styles.h2}>What kind of rental?</h2>
      <p style={styles.bodyP}>Three distinct briefs. The duration shapes everything — the questions, the market, and how we source.</p>
      <div style={{ marginTop: 24 }}>
        <div style={{ ...styles.card, ...(direction === 'rent-short' ? styles.cardSelected : {}) }}
          onClick={() => { setDirection('rent-short'); setScreen('market'); }}>
          <div style={{ ...styles.eyebrow, marginBottom: 6 }}>Days to 4 weeks</div>
          <div style={styles.cardTitle}>Short-term · Holiday</div>
          <div style={styles.cardDesc}>A villa, apartment, or estate for a specific stay. Summer, ski season, or an extended break. TGC sources from the owner network, not public portals. Quality that does not appear on the usual sites.</div>
        </div>
        <div style={{ ...styles.card, ...(direction === 'rent-mid' ? styles.cardSelected : {}) }}
          onClick={() => { setDirection('rent-mid'); setScreen('market'); }}>
          <div style={{ ...styles.eyebrow, marginBottom: 6 }}>1 to 12 months</div>
          <div style={styles.cardTitle}>Mid-term · Relocation</div>
          <div style={styles.cardDesc}>Settling into a region, covering a corporate posting, or taking a year to explore before deciding where to plant roots permanently. The most strategic rental type: unhurried, considered, right.</div>
        </div>
        <div style={{ ...styles.card, ...(direction === 'rent-long' ? styles.cardSelected : {}) }}
          onClick={() => { setDirection('rent-long'); setScreen('market'); }}>
          <div style={{ ...styles.eyebrow, marginBottom: 6 }}>12 months or more</div>
          <div style={styles.cardTitle}>Long-term · Residential</div>
          <div style={styles.cardDesc}>A genuine home for the foreseeable future. Schools, community, routine. TGC operates as your tenant representative end-to-end: brief, sourcing, negotiation, lease review, and handover.</div>
        </div>
      </div>
    </div>
  )

  const renderRentalBrief = () => {
    const isShort = direction === 'rent-short'
    const propertyTypes = ['Villa / standalone house', 'Apartment', 'Estate / domain', 'Townhouse / maison de maître', 'Chalet', 'Château / manor house']
    const priorityOptions = ['Quiet and private', 'Proximity to international school', 'Home-office setup', 'Sea / lake view', 'Walking distance to town', 'Pet-friendly outdoor space', 'Chef or catering access', 'Pool essential', 'Garage / secure parking', 'Staff accommodation']
    const flexibilityOptions = ['Fixed — these exact dates', 'Flexible within 2 weeks', 'Flexible within a month', 'Open — when the right property is available']
    const durationOptions = ['1 month', '2-3 months', '3-6 months', '6-12 months']

    const togglePriority = (p: string) => {
      const current = rentalBrief.priorities
      setRentalBrief({ ...rentalBrief, priorities: current.includes(p) ? current.filter(x => x !== p) : [...current, p] })
    }

    return (
      <div>
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('market')}>Back</button>
        <div style={styles.eyebrow}>{isShort ? 'Short-term · Holiday' : direction === 'rent-mid' ? 'Mid-term · Relocation' : 'Long-term · Residential'} · {market?.name}</div>
        <h2 style={styles.h2}>Tell us about the rental.</h2>
        <p style={styles.bodyP}>The more honest the brief, the better the shortlist.</p>

        <label style={styles.label}>Property type</label>
        <select style={styles.input} value={rentalBrief.propertyType} onChange={e => setRentalBrief({ ...rentalBrief, propertyType: e.target.value })}>
          <option value="">Select...</option>
          {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {isShort ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={styles.label}>Arrival date</label>
                <input type="date" style={styles.input} value={rentalBrief.arrivalDate} onChange={e => setRentalBrief({ ...rentalBrief, arrivalDate: e.target.value })} />
              </div>
              <div>
                <label style={styles.label}>Departure date</label>
                <input type="date" style={styles.input} value={rentalBrief.departureDate} onChange={e => setRentalBrief({ ...rentalBrief, departureDate: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label style={styles.label}>Adults</label>
                <input type="number" style={styles.input} value={rentalBrief.groupAdults} placeholder="e.g., 4" onChange={e => setRentalBrief({ ...rentalBrief, groupAdults: e.target.value })} />
              </div>
              <div>
                <label style={styles.label}>Children</label>
                <input type="number" style={styles.input} value={rentalBrief.groupChildren} placeholder="0" onChange={e => setRentalBrief({ ...rentalBrief, groupChildren: e.target.value })} />
              </div>
              <div>
                <label style={styles.label}>Pets?</label>
                <select style={styles.input} value={rentalBrief.pets} onChange={e => setRentalBrief({ ...rentalBrief, pets: e.target.value })}>
                  <option value="">Select...</option>
                  <option value="No pets">No pets</option>
                  <option value="1 dog">1 dog</option>
                  <option value="2+ dogs">2+ dogs</option>
                  <option value="Cat(s)">Cat(s)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <label style={styles.label}>Budget per week (EUR)</label>
            <input type="number" style={styles.input} value={rentalBrief.budgetWeek} placeholder="e.g., 8000" onChange={e => setRentalBrief({ ...rentalBrief, budgetWeek: e.target.value })} />
          </>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={styles.label}>Duration</label>
                <select style={styles.input} value={rentalBrief.durationMonths} onChange={e => setRentalBrief({ ...rentalBrief, durationMonths: e.target.value })}>
                  <option value="">Select...</option>
                  {(direction === 'rent-long' ? ['12 months', '18 months', '24+ months', 'Open-ended'] : durationOptions).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Earliest move-in</label>
                <input type="date" style={styles.input} value={rentalBrief.moveInDate} onChange={e => setRentalBrief({ ...rentalBrief, moveInDate: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label style={styles.label}>Adults</label>
                <input type="number" style={styles.input} value={rentalBrief.groupAdults} placeholder="e.g., 2" onChange={e => setRentalBrief({ ...rentalBrief, groupAdults: e.target.value })} />
              </div>
              <div>
                <label style={styles.label}>Children</label>
                <input type="number" style={styles.input} value={rentalBrief.groupChildren} placeholder="0" onChange={e => setRentalBrief({ ...rentalBrief, groupChildren: e.target.value })} />
              </div>
              <div>
                <label style={styles.label}>Pets?</label>
                <select style={styles.input} value={rentalBrief.pets} onChange={e => setRentalBrief({ ...rentalBrief, pets: e.target.value })}>
                  <option value="">Select...</option>
                  <option value="No pets">No pets</option>
                  <option value="1 dog">1 dog</option>
                  <option value="2+ dogs">2+ dogs</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <label style={styles.label}>Budget per month (EUR, all-in furnished)</label>
            <input type="number" style={styles.input} value={rentalBrief.budgetMonth} placeholder="e.g., 5000" onChange={e => setRentalBrief({ ...rentalBrief, budgetMonth: e.target.value })} />
            <label style={styles.label}>Timing flexibility</label>
            <select style={styles.input} value={rentalBrief.flexibility} onChange={e => setRentalBrief({ ...rentalBrief, flexibility: e.target.value })}>
              <option value="">Select...</option>
              {flexibilityOptions.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </>
        )}

        <label style={styles.label}>Priorities — select all that apply</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, marginTop: 8 }}>
          {priorityOptions.map(p => (
            <div key={p}
              style={{ ...styles.card, marginBottom: 0, padding: '10px 14px', background: rentalBrief.priorities.includes(p) ? 'rgba(14,79,81,0.07)' : '#F9F8F5', borderColor: rentalBrief.priorities.includes(p) ? '#0e4f51' : '#e5e7eb', cursor: 'pointer' }}
              onClick={() => togglePriority(p)}>
              <div style={{ fontSize: 13, color: '#1a1815' }}>{p}</div>
            </div>
          ))}
        </div>

        <label style={styles.label}>Non-negotiables (the things we cannot compromise on)</label>
        <textarea rows={3} style={{ ...styles.input, resize: 'vertical' }} value={rentalBrief.nonNegotiables}
          placeholder={isShort ? "e.g., Pool, 5+ bedrooms, sea view, within 20 min of Nice airport, no hill-climb from road" : "e.g., Must be close to international school, home office separate room, ground-floor or lift access for elderly parent"}
          onChange={e => setRentalBrief({ ...rentalBrief, nonNegotiables: e.target.value })} />

        <div style={{ marginTop: 32 }}>
          <button style={styles.button}
            onClick={() => setScreen('rental-verdict')}
            disabled={!rentalBrief.propertyType || (!isShort && !rentalBrief.budgetMonth && !rentalBrief.durationMonths) || (isShort && !rentalBrief.budgetWeek)}>
            See the market view →
          </button>
        </div>
      </div>
    )
  }

  const renderRentalVerdict = () => {
    if (!market) return null
    const isShort = direction === 'rent-short'
    const rates = market.rentalRates
    const fmtK = (n: number) => n >= 1000 ? `€${Math.round(n/1000)}k` : `€${n}`
    const fmtRange = (a: number, b: number) => `${fmtK(a)} – ${fmtK(b)}`

    return (
      <div>
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('rental-brief')}>Back</button>
        <div style={styles.eyebrow}>Rental market view · {market.name}</div>
        <h2 style={styles.h2}>{market.name}</h2>
        <p style={{ fontSize: 14, color: '#0e4f51', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{market.subLabel}</p>

        {market.rentalEditorial && (
          <p style={styles.lead}>{market.rentalEditorial}</p>
        )}

        {rates && (
          <div style={{ marginBottom: 32 }}>
            <h3 style={styles.h3}>Realistic rental rates (2026)</h3>
            <div style={{ background: '#F9F8F5', border: '1px solid #e5e7eb', padding: 20 }}>
              {rates.shortTermWeekPeak && (
                <div style={styles.priceBand}>
                  <div style={styles.bandLabel}>Short-term · Peak season / week</div>
                  <div style={styles.bandValue}>{fmtRange(...rates.shortTermWeekPeak)}</div>
                </div>
              )}
              {rates.shortTermWeekShoulder && (
                <div style={styles.priceBand}>
                  <div style={styles.bandLabel}>Short-term · Shoulder season / week</div>
                  <div style={styles.bandValue}>{fmtRange(...rates.shortTermWeekShoulder)}</div>
                </div>
              )}
              {rates.midTermMonth && (
                <div style={styles.priceBand}>
                  <div style={styles.bandLabel}>Mid-term · Monthly furnished</div>
                  <div style={styles.bandValue}>{fmtRange(...rates.midTermMonth)}</div>
                </div>
              )}
              {rates.longTermMonth && (
                <div style={styles.priceBand}>
                  <div style={styles.bandLabel}>Long-term · Monthly</div>
                  <div style={styles.bandValue}>{fmtRange(...rates.longTermMonth)}</div>
                </div>
              )}
              {rates.notes && (
                <p style={{ fontSize: 13, color: '#0e4f51', marginTop: 16, lineHeight: 1.6 }}>{rates.notes}</p>
              )}
            </div>
          </div>
        )}

        {!isShort && (
          <>
            <h3 style={styles.h3}>The loud / quiet framework</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
              <div>
                <div style={styles.eyebrow}>The trophy locations</div>
                <ul style={styles.list}>
                  {market.loudQuiet.loud.map((l, i) => <li key={i} style={styles.listItem}><span style={styles.dash}>*</span>{l}</li>)}
                </ul>
              </div>
              <div>
                <div style={styles.eyebrow}>The quieter alternatives</div>
                <ul style={styles.list}>
                  {market.loudQuiet.quiet.map((q, i) => <li key={i} style={styles.listItem}><span style={styles.dash}>*</span>{q}</li>)}
                </ul>
              </div>
            </div>
          </>
        )}

        <h3 style={styles.h3}>What the brochure will not tell you</h3>
        <ul style={styles.list}>
          {market.brochureRealities.map((r, i) => <li key={i} style={styles.listItem}><span style={styles.dash}>*</span>{r}</li>)}
        </ul>

        <div style={{ background: '#0e4f51', color: '#fff', padding: 24, margin: '32px 0', borderLeft: '3px solid #c8aa4a' }}>
          <div style={{ ...styles.eyebrow, color: '#c8aa4a', marginBottom: 8 }}>TGC as your tenant representative</div>
          <ul style={{ ...styles.list, marginBottom: 0 }}>
            {[
              'We source from the owner-managed network, not public portals — most quality properties do not appear online',
              'We conduct viewings, verify lease terms, and negotiate the terms on your behalf',
              'We review the lease before you sign — clause by clause, in your language',
              isShort ? 'We coordinate access, caretaker handover, and any special arrangements before arrival' : 'We manage the handover, inventory, and any required local registrations',
            ].map((item, i) => (
              <li key={i} style={{ ...styles.listItem, color: 'rgba(255,255,255,0.88)', paddingLeft: 20 }}><span style={{ ...styles.dash, color: '#c8aa4a' }}>*</span>{item}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: 16 }}>
          <button style={styles.button} onClick={() => setScreen('rental-commercial')}>How we work together →</button>
        </div>
      </div>
    )
  }

  const renderRentalCommercial = () => {
    const isShort = direction === 'rent-short'
    return (
      <div>
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('rental-verdict')}>Back</button>
        <div style={styles.eyebrow}>The commercial arrangement</div>
        <h2 style={styles.h2}>How we work together.</h2>
        <p style={styles.bodyP}>Straightforward and success-based. You do not pay until we place you.</p>

        <div style={{ ...styles.card, background: '#F9F8F5', cursor: 'default', marginTop: 20 }}>
          {isShort ? (
            <>
              <div style={styles.priceBand}>
                <div style={styles.bandLabel}>Sourcing fee</div>
                <div style={styles.bandValue}>Included in the rental arrangement</div>
              </div>
              <div style={styles.priceBand}>
                <div style={styles.bandLabel}>Client cost</div>
                <div style={styles.bandValue}>The rental price as quoted, nothing added</div>
              </div>
              <p style={{ fontSize: 13, color: '#0e4f51', marginTop: 12 }}>For short-term holiday rentals, our fee is covered by the landlord arrangement. You pay only the rental price — no agency top-up.</p>
            </>
          ) : (
            <>
              <div style={styles.priceBand}>
                <div style={styles.bandLabel}>Retainer</div>
                <div style={styles.bandValue}>None</div>
              </div>
              <div style={styles.priceBand}>
                <div style={styles.bandLabel}>Placement fee</div>
                <div style={styles.bandValue}>One month's rent, on successful securing</div>
              </div>
              <div style={styles.priceBand}>
                <div style={styles.bandLabel}>Gatekeeper Points</div>
                <div style={styles.bandValue}>Accrued at standard TGC rate</div>
              </div>
              <p style={{ fontSize: 13, color: '#0e4f51', marginTop: 12 }}>Success-based only. No upfront retainer. We earn when you are placed.</p>
            </>
          )}
        </div>

        <h3 style={styles.h3}>What you get</h3>
        <ul style={styles.list}>
          <li style={styles.listItem}><span style={styles.dash}>*</span>A single named Gatekeeper who manages the search end-to-end</li>
          <li style={styles.listItem}><span style={styles.dash}>*</span>Off-market sourcing from the owner and landlord network — not portals</li>
          <li style={styles.listItem}><span style={styles.dash}>*</span>Shortlist of 3-5 properties, verified and visited before presentation</li>
          <li style={styles.listItem}><span style={styles.dash}>*</span>Lease negotiation on your behalf</li>
          <li style={styles.listItem}><span style={styles.dash}>*</span>Lease review in plain English, clause by clause</li>
          {!isShort && <li style={styles.listItem}><span style={styles.dash}>*</span>Local registration support (bail mobilité, tenancy agreement, utility connections)</li>}
        </ul>

        <div style={{ marginTop: 32 }}>
          <button style={styles.button} onClick={() => setScreen('client')}>Continue, your details</button>
        </div>
      </div>
    )
  }

  const renderStructuring = () => (
    <div>
      <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('brief')}>Back</button>
      <div style={styles.eyebrow}>Structuring</div>
      <h2 style={styles.h2}>How will you hold it?</h2>
      <p style={styles.bodyP}>
        At your budget and in {jurisdiction?.label}, structuring is half the cost of ownership. We want a short honest conversation before the property search, not a remedial one after completion.
      </p>

      <div style={{ ...styles.card, background: '#F9F8F5', cursor: 'default', marginBottom: 24 }}>
        <div style={styles.eyebrow}>{jurisdiction?.label} · Jurisdiction headline</div>
        <p style={{ fontSize: 15, color: '#1a1815', margin: '4px 0 12px', lineHeight: 1.55 }}>{jurisdiction?.headline}</p>
        <div style={styles.priceBand}>
          <div style={styles.bandLabel}>Default vehicle</div>
          <div style={styles.bandValue}>{jurisdiction?.defaultVehicle}</div>
        </div>
        <div style={styles.priceBand}>
          <div style={styles.bandLabel}>Wealth tax</div>
          <div style={styles.bandValue}>{jurisdiction?.wealthTax}</div>
        </div>
        <div style={styles.priceBand}>
          <div style={styles.bandLabel}>Acquisition costs</div>
          <div style={styles.bandValue}>{jurisdiction?.acquisitionCosts}</div>
        </div>
        <div style={styles.priceBand}>
          <div style={styles.bandLabel}>Capital gains</div>
          <div style={styles.bandValue}>{jurisdiction?.capitalGains}</div>
        </div>
        <p style={{ fontSize: 14, color: '#0e4f51', marginTop: 16, lineHeight: 1.55 }}>{jurisdiction?.honestAdvice}</p>
      </div>

      <label style={styles.label}>Proposed ownership vehicle</label>
      <input type="text" style={styles.input} value={structuring.vehicle} placeholder={jurisdiction?.defaultVehicle} onChange={e => setStructuring({ ...structuring, vehicle: e.target.value })} />

      <label style={styles.label}>Your current tax residence</label>
      <input type="text" style={styles.input} value={structuring.taxResidence} placeholder="e.g., UK (FIG year 2 of 4) / France / Monaco" onChange={e => setStructuring({ ...structuring, taxResidence: e.target.value })} />

      <label style={styles.label}>Specific structuring notes (optional)</label>
      <textarea rows={3} style={{ ...styles.input, resize: 'vertical' }} value={structuring.considerations} placeholder="e.g., Planning Italian flat-tax regime entry Q3 2026; existing SCI holds other French property" onChange={e => setStructuring({ ...structuring, considerations: e.target.value })} />

      <div style={{ marginTop: 24 }}>
        <button style={styles.button} onClick={() => setScreen('verdict')}>Continue</button>
      </div>
    </div>
  )

  const renderVerdict = () => {
    if (!market) return null
    const fmtBand = (band: [number, number] | undefined) => {
      if (!band) return ''
      const format = (v: number) => v < 1 ? `EUR ${(v * 1000).toFixed(0)}k` : `EUR ${v}M`
      return `${format(band[0])} to ${format(band[1])}`
    }
    return (
      <div>
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen(isAcqFlow ? 'acq-match' : showStructuringScreen ? 'structuring' : 'brief')}>Back</button>
        <div style={styles.eyebrow}>Our honest view · {market.name}</div>
        <h2 style={styles.h2}>{market.name}</h2>
        <p style={{ fontSize: 14, color: '#0e4f51', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {market.subLabel}
          {market.tier === 1 && <span style={styles.tierBadge}>Tier 1, Heartland</span>}
          {market.tier === 2 && <span style={styles.tierBadge}>Tier 2, Active</span>}
          {market.tier === 3 && <span style={styles.tierBadgeOut}>Tier 3, Emerging</span>}
          {market.tier === 4 && <span style={styles.tierBadgeOut}>Tier 4, Partner</span>}
        </p>

        <p style={styles.lead}>{market.editorial}</p>

        {market.criticalContext && (
          <div style={{ background: '#F9F8F5', borderLeft: '3px solid #c8aa4a', padding: 20, marginBottom: 24 }}>
            <div style={styles.eyebrow}>Critical context</div>
            <p style={{ fontSize: 15, color: '#1a1815', margin: 0, lineHeight: 1.6 }}>{market.criticalContext}</p>
          </div>
        )}

        <h3 style={styles.h3}>The loud / quiet framework</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          <div>
            <div style={styles.eyebrow}>Loud, the trophy names</div>
            <ul style={styles.list}>
              {market.loudQuiet.loud.map((l, i) => <li key={i} style={styles.listItem}><span style={styles.dash}>*</span>{l}</li>)}
            </ul>
          </div>
          <div>
            <div style={styles.eyebrow}>Quiet, the thoughtful alternatives</div>
            <ul style={styles.list}>
              {market.loudQuiet.quiet.map((q, i) => <li key={i} style={styles.listItem}><span style={styles.dash}>*</span>{q}</li>)}
            </ul>
          </div>
        </div>

        <h3 style={styles.h3}>Realistic price bands (2026)</h3>
        <div style={{ marginBottom: 28 }}>
          {Object.entries(market.priceBands).map(([label, bands]) => (
            <div key={label} style={{ padding: '14px 0', borderBottom: '1px dashed #e5e7eb' }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1815', marginBottom: 8 }}>{label}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 13 }}>
                {bands.entry && <div><div style={{ color: '#c8aa4a', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Entry</div><div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, color: '#1a1815' }}>{fmtBand(bands.entry)}</div></div>}
                {bands.realistic && <div><div style={{ color: '#c8aa4a', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Realistic</div><div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, color: '#1a1815' }}>{fmtBand(bands.realistic)}</div></div>}
                {bands.trophy && <div><div style={{ color: '#c8aa4a', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Trophy</div><div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, color: '#1a1815' }}>{fmtBand(bands.trophy)}</div></div>}
              </div>
            </div>
          ))}
        </div>

        <h3 style={styles.h3}>What the brochure will not tell you</h3>
        <ul style={styles.list}>
          {market.brochureRealities.map((r, i) => <li key={i} style={styles.listItem}><span style={styles.dash}>*</span>{r}</li>)}
        </ul>

        {internalView && (
          <div style={styles.internalPanel}>
            <div style={{ color: '#c8aa4a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.15em' }}>// INTERNAL VIEW, TGC GATEKEEPER ONLY</div>
            <div>TGC coverage: {market.coverage}</div>
            <div>ICP relevance: {market.icpRelevance}</div>
            <div>Structuring jurisdiction: {market.structuringJurisdiction} / {jurisdiction?.label}</div>
            <div>Market ID: {marketId}</div>
            <div>Tier: {market.tier}</div>
            <div>Budget vs tier-appropriate: EUR {brief.budgetMin} to {brief.budgetMax}M</div>
          </div>
        )}

        <div style={{ marginTop: 32, display:'flex', gap:12, flexWrap:'wrap' }}>
          <button style={styles.button} onClick={() => setScreen(isAcqFlow && !brief.nonNegotiables ? 'brief' : 'commercial')}>
            {isAcqFlow && !brief.nonNegotiables ? 'Refine the brief →' : 'See commercial opening'}
          </button>
          {isAcqFlow && brief.nonNegotiables && <button style={styles.buttonSecondary} onClick={() => setScreen('brief')}>Adjust brief</button>}
        </div>
      </div>
    )
  }

  const renderCommercial = () => {
    if (!market || !commercial) return null
    return (
      <div>
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen(isDisposalFlow ? 'disposal-verdict' : isAcqFlow ? 'brief' : 'verdict')}>Back</button>
        <div style={styles.eyebrow}>The commercial arrangement</div>
        <h2 style={styles.h2}>How we work together.</h2>
        <p style={styles.bodyP}>
          For a {isDisposalFlow ? 'disposal' : direction === 'let' ? 'rental search' : 'buy-side'} mandate on {market.name} ({market.tier === 1 ? 'Tier 1' : market.tier === 2 ? 'Tier 2' : market.tier === 3 ? 'Tier 3' : 'Tier 4'} coverage), our standard opening looks like this.
        </p>

        <div style={{ ...styles.card, background: '#F9F8F5', cursor: 'default', marginTop: 20 }}>
          {direction !== 'sell' && direction !== 'let' && (
            <>
              <div style={styles.priceBand}>
                <div style={styles.bandLabel}>Retainer</div>
                <div style={styles.bandValue}>EUR {commercial?.retainer?.toLocaleString()}</div>
              </div>
              <p style={{ fontSize: 13, color: '#0e4f51', marginTop: 8 }}>Covers active search: off-market sourcing, shortlist, viewings coordination, legal introductions. 6-12 month active period.</p>
            </>
          )}
          {direction === 'sell' && commercial?.retainer > 0 && (
            <div style={styles.priceBand}>
              <div style={styles.bandLabel}>Marketing retainer</div>
              <div style={styles.bandValue}>EUR {commercial?.retainer?.toLocaleString()}</div>
            </div>
          )}
          {direction === 'sell' && commercial?.retainer === 0 && (
            <div style={styles.priceBand}>
              <div style={styles.bandLabel}>Retainer</div>
              <div style={styles.bandValue}>No retainer, success-fee only</div>
            </div>
          )}
          <div style={styles.priceBand}>
            <div style={styles.bandLabel}>Success fee</div>
            <div style={styles.bandValue}>{commercial?.successFee}% of final {direction === 'sell' ? 'sale' : 'acquisition'} price</div>
          </div>
          <div style={styles.priceBand}>
            <div style={styles.bandLabel}>Gatekeeper Points</div>
            <div style={styles.bandValue}>Accrued against retainer + success fee at standard TGC rate</div>
          </div>
        </div>

        <h3 style={styles.h3}>What you actually get for the retainer</h3>
        <ul style={styles.list}>
          <li style={styles.listItem}><span style={styles.dash}>*</span>A single Gatekeeper as your direct point of contact, no agency chain, no call centre</li>
          <li style={styles.listItem}><span style={styles.dash}>*</span>Direct access to our notaire, architect, and property-manager relationships in {market.name}</li>
          <li style={styles.listItem}><span style={styles.dash}>*</span>Off-market sourcing through our private network, most of what we show you will not be publicly listed</li>
          <li style={styles.listItem}><span style={styles.dash}>*</span>Structuring coordination between you, your tax counsel, and local notaires</li>
          <li style={styles.listItem}><span style={styles.dash}>*</span>Full discretion, your name and mandate details are shared only with parties you specifically nominate</li>
        </ul>

        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
          <button style={styles.button} onClick={() => setScreen('client')}>Continue, your details</button>
        </div>
      </div>
    )
  }

  const renderClient = () => (
    <div>
      <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('commercial')}>Back</button>
      <div style={styles.eyebrow}>Your details</div>
      <h2 style={styles.h2}>One last thing.</h2>
      <p style={styles.bodyP}>
        So we can get a Gatekeeper on this within four hours and send you the draft mandate letter.
      </p>

      <label style={styles.label}>Name</label>
      <input type="text" style={styles.input} value={client.name} onChange={e => setClient({ ...client, name: e.target.value })} />

      <label style={styles.label}>Email</label>
      <input type="email" style={styles.input} value={client.email} onChange={e => setClient({ ...client, email: e.target.value })} />

      <label style={styles.label}>Phone (with country code)</label>
      <input type="tel" style={styles.input} value={client.phone} placeholder="+33 6 XX XX XX XX" onChange={e => setClient({ ...client, phone: e.target.value })} />

      <label style={styles.label}>{isRetainedFlow ? 'Current country of residence' : 'Current tax residence'}</label>
      <input type="text" style={styles.input} value={client.taxResidence} placeholder="e.g., UK / France / Monaco" onChange={e => setClient({ ...client, taxResidence: e.target.value })} />

      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 24, lineHeight: 1.6 }}>
        We will contact you within four hours to acknowledge receipt, within twenty-four hours with a full considered response, and arrange a discovery call within seventy-two hours. Your mandate details are visible only to the specific Gatekeeper assigned to you.
      </p>

      <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
        <button style={styles.buttonGold} onClick={handleSubmitMandate} disabled={!client.name || !client.email}>
          Submit mandate brief
        </button>
      </div>
    </div>
  )

  const renderConfirmation = () => (
    <div>
      <div style={styles.eyebrow}>{isRentalFlow ? 'Rental brief received' : isDisposalFlow ? 'Disposal mandate received' : isRetainedFlow ? 'Brief received' : 'Mandate received'}</div>
      <h2 style={styles.h2}>Thank you, {client.name?.split(' ')[0]}.</h2>
      <p style={styles.lead}>
        Your brief is with us. A Gatekeeper has it in hand now.
      </p>

      <div style={{ ...styles.card, background: '#F9F8F5', cursor: 'default' }}>
        <div style={styles.eyebrow}>Reference</div>
        <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 16, color: '#1a1815', margin: '4px 0 16px' }}>{mandateId}</div>
        <div style={styles.priceBand}>
          <div style={styles.bandLabel}>Type</div>
          <div style={styles.bandValue}>{
            isRentalFlow ? (direction === 'rent-short' ? 'Short-term rental' : direction === 'rent-mid' ? 'Mid-term rental' : 'Long-term rental')
            : isDisposalFlow ? ({ 'sell-open':'Open market sale', 'sell-discreet':'Discreet disposal', 'sell-ultra':'Ultra-private disposal', 'sell-reinvest':'Exit & re-allocate' }[disposalSubType] || 'Disposal')
            : isRetainedFlow ? (retainedSubType === 'retained-family-office' ? 'Retained · Family office' : 'Opening conversation')
            : direction?.toUpperCase()
          }</div>
        </div>
        <div style={styles.priceBand}>
          <div style={styles.bandLabel}>Market</div>
          <div style={styles.bandValue}>{market?.name}</div>
        </div>
        <div style={styles.priceBand}>
          <div style={styles.bandLabel}>Property type</div>
          <div style={styles.bandValue}>{isRentalFlow ? rentalBrief.propertyType : isDisposalFlow ? sellerBrief.propertyType : brief.propertyType}</div>
        </div>
        {isRetainedFlow && retainedBriefState.promptedBy && (
          <div style={styles.priceBand}>
            <div style={styles.bandLabel}>What prompted this</div>
            <div style={styles.bandValue}>{retainedBriefState.promptedBy}</div>
          </div>
        )}
        {isRetainedFlow && retainedBriefState.portfolioSize && (
          <div style={styles.priceBand}>
            <div style={styles.bandLabel}>Portfolio size</div>
            <div style={styles.bandValue}>{retainedBriefState.portfolioSize}</div>
          </div>
        )}
        {isDisposalFlow && (
          <>
            <div style={styles.priceBand}>
              <div style={styles.bandLabel}>Guide price</div>
              <div style={styles.bandValue}>EUR {sellerBrief.askingPrice}M</div>
            </div>
            <div style={styles.priceBand}>
              <div style={styles.bandLabel}>Timeline</div>
              <div style={styles.bandValue}>{sellerBrief.timeline}</div>
            </div>
          </>
        )}
        {isRentalFlow ? (
          <>
            {direction === 'rent-short' ? (
              <div style={styles.priceBand}>
                <div style={styles.bandLabel}>Budget</div>
                <div style={styles.bandValue}>EUR {rentalBrief.budgetWeek}/week</div>
              </div>
            ) : (
              <>
                <div style={styles.priceBand}>
                  <div style={styles.bandLabel}>Duration</div>
                  <div style={styles.bandValue}>{rentalBrief.durationMonths}</div>
                </div>
                <div style={styles.priceBand}>
                  <div style={styles.bandLabel}>Budget</div>
                  <div style={styles.bandValue}>EUR {rentalBrief.budgetMonth}/month</div>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={styles.priceBand}>
              <div style={styles.bandLabel}>Budget</div>
              <div style={styles.bandValue}>EUR {brief.budgetMin}M to EUR {brief.budgetMax}M</div>
            </div>
            <div style={styles.priceBand}>
              <div style={styles.bandLabel}>Timeline</div>
              <div style={styles.bandValue}>{brief.timeline}</div>
            </div>
          </>
        )}
      </div>

      <h3 style={styles.h3}>What happens next</h3>
      <ul style={styles.list}>
        <li style={styles.listItem}><span style={styles.dash}>*</span><strong>Within 4 hours:</strong> your Gatekeeper will acknowledge receipt personally</li>
        {isRetainedFlow ? (
          <>
            <li style={styles.listItem}><span style={styles.dash}>*</span><strong>Within 24 hours:</strong> a short note confirming we have read your context and are prepared for the call</li>
            <li style={styles.listItem}><span style={styles.dash}>*</span><strong>Discovery call:</strong> 45-60 minutes, no slides, no commitment — we listen and ask honest questions</li>
            <li style={styles.listItem}><span style={styles.dash}>*</span><strong>After the call:</strong> if the fit is right, we propose a retained structure. If not, we say so.</li>
          </>
        ) : isRentalFlow ? (
          <>
            <li style={styles.listItem}><span style={styles.dash}>*</span><strong>Within 24 hours:</strong> first shortlist questions and any clarifications needed to begin the search</li>
            <li style={styles.listItem}><span style={styles.dash}>*</span><strong>Within 72 hours:</strong> first property suggestions from the network, including off-market ones</li>
          </>
        ) : (
          <>
            <li style={styles.listItem}><span style={styles.dash}>*</span><strong>Within 24 hours:</strong> {isDisposalFlow ? 'an honest first view on positioning and realistic pricing for your property' : 'a full considered response including our first honest view'}</li>
            <li style={styles.listItem}><span style={styles.dash}>*</span><strong>Within 72 hours:</strong> a discovery call to refine the mandate and walk through next steps</li>
            {!isDisposalFlow && <li style={styles.listItem}><span style={styles.dash}>*</span><strong>Within 14 days:</strong> signed mandate letter and active search begins</li>}
          </>
        )}
      </ul>

      <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {!isRentalFlow && !isDisposalFlow && <button style={styles.button} onClick={downloadMandateLetter}>Download draft mandate letter</button>}
        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{ ...styles.buttonGold, textDecoration: 'none', display: 'inline-block' }}>Book discovery call</a>
        <button style={styles.buttonSecondary} onClick={resetAll}>Start another brief</button>
      </div>

      {isDisposalFlow && disposalSubType === 'sell-reinvest' && (
        <div style={{ marginTop: 40, padding: 24, background: '#F9F8F5', borderLeft: '3px solid #0e4f51' }}>
          <div style={styles.eyebrow}>Exit & Re-allocate — acquisition side</div>
          <p style={{ fontSize: 15, color: '#1a1815', marginTop: 8, marginBottom: 20, lineHeight: 1.6 }}>
            Your disposal mandate is open. When you're ready, brief us on where you want to re-allocate. We'll run both sides in parallel.
          </p>
          <button style={styles.button} onClick={() => { setFlowFamily('acquisition'); setAcqStep(0); setScreen('acq-questions') }}>
            Open the acquisition brief →
          </button>
        </div>
      )}
    </div>
  )

  const renderScreen = () => {
    switch (screen) {
      case 'welcome': return renderWelcome()
      case 'acq-questions': return renderAcqQuestions()
      case 'acq-match': return renderAcqMatch()
      case 'retained-brief': return renderRetainedBrief()
      case 'retained-overview': return renderRetainedOverview()
      case 'retained-commercial': return renderRetainedCommercial()
      case 'disposal-brief': return renderDisposalBrief()
      case 'disposal-verdict': return renderDisposalVerdict()
      case 'flow-direction': return renderFlowDirection()
      case 'rental-type': return renderRentalType()
      case 'market': return renderMarketSelector()
      case 'brief': return renderBrief()
      case 'rental-brief': return renderRentalBrief()
      case 'structuring': return renderStructuring()
      case 'verdict': return renderVerdict()
      case 'rental-verdict': return renderRentalVerdict()
      case 'commercial': return renderCommercial()
      case 'rental-commercial': return renderRentalCommercial()
      case 'client': return renderClient()
      case 'confirmation': return renderConfirmation()
      default: return renderWelcome()
    }
  }

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Lato:ital,wght@0,300;0,400;0,700;1,400&display=swap');
        input:focus, select:focus, textarea:focus { outline: none; border-color: #0e4f51; }
        button:hover:not(:disabled) { opacity: 0.85; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%230e4f51' fill='none' stroke-width='1.5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
      `}</style>

      <div style={styles.container}>
        {/* Suite Nav */}
        <div style={{ marginBottom: '1.75rem' }}>
          <a href="/intelligence" style={{ display: 'inline-block', color: '#6b7280', fontSize: '0.75rem', textDecoration: 'none', fontFamily: "'Lato', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            ← Intelligence Suite
          </a>
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
            {[
              { num: '01', label: 'Transport', href: '/intelligence/transport', active: false },
              { num: '02', label: 'Real Estate', href: '/intelligence/realestate', active: true },
              { num: '03', label: 'Wellness', href: '/intelligence/wellness', active: false },
              { num: '04', label: 'Events', href: '/intelligence/events-production', active: false },
              { num: '05', label: 'VIP', href: '/intelligence/vip-hospitality', active: false },
              { num: '06', label: 'Art', href: '/intelligence/art-collectables', active: false },
            ].map(t => (
              <a key={t.num} href={t.href} style={{ padding: '0.3rem 0.75rem', border: t.active ? 'none' : '1px solid #e5e7eb', background: t.active ? '#0e4f51' : 'transparent', color: t.active ? '#ffffff' : '#6b7280', fontSize: '0.7rem', fontFamily: "'Lato', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', borderRadius: '3px', textDecoration: 'none' }}>
                {t.num} {t.label}
              </a>
            ))}
          </div>
        </div>
        <div style={styles.header}>
          <div>
            <div style={styles.brand}>The Gatekeepers Club</div>
            <div style={styles.brandSub}>Real Estate Intelligence · v1</div>
          </div>
          <button style={styles.internalToggle} onClick={() => setInternalView(!internalView)}>
            {internalView ? 'client view' : 'internal view'}
          </button>
        </div>

        {screen !== 'welcome' && screen !== 'confirmation' && (
          <div style={styles.progress}>
            {Array.from({ length: progressWidth }).map((_, i) => (
              <div key={i} style={i <= currentIdx ? styles.progressDotActive : styles.progressDot} />
            ))}
          </div>
        )}

        {renderScreen()}

        {loadedDraft && (
          <div style={styles.draftNotice}>
            Draft restored from previous session
          </div>
        )}
      </div>
    </div>
  )
}

export default function RealEstateIntelligencePage() {
  return <TGCRealEstateIntelligence />
}
