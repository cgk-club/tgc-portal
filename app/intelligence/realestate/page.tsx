/* eslint-disable react/no-unescaped-entities, react/jsx-no-comment-textnodes */
'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useMemo } from 'react'

// ──────────────────────────────────────────────────────────────────────────────
// TGC REAL ESTATE INTELLIGENCE · v1
// Thirty-one micro-markets · three flow families · honest editorial
// Paper #f5f1ea · Ink #1a1815 · Gold #8b6f3e → #5a4a2a
// Cormorant Garamond (display) · Inter (body) · JetBrains Mono (data)
// ──────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'tgc-realestate-mandate-draft'
const CALENDLY_URL = 'https://calendar.app.google/aAsppu4Tju2my9ST7'

// ──────────────────────────────────────────────────────────────────────────────
// MARKET DATA — 31 micro-markets across 4 tiers
// ──────────────────────────────────────────────────────────────────────────────

type PriceBandEntry = { entry?: [number, number]; realistic?: [number, number]; trophy?: [number, number] }

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

type Screen = 'welcome' | 'flow-direction' | 'market' | 'brief' | 'structuring' | 'verdict' | 'commercial' | 'client' | 'confirmation'
type FlowFamily = 'acquisition' | 'disposal' | 'retained' | null
type Direction = 'buy' | 'invest' | 'develop' | 'let' | 'sell' | 'retained' | null

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
    const payload = {
      mandateId: id, flowFamily, direction,
      client, brief, structuring, market: marketId, commercial,
    }
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
    root: { minHeight: '100vh', background: '#f5f1ea', color: '#1a1815', fontFamily: "'Inter', system-ui, sans-serif", padding: '40px 20px', lineHeight: 1.6 },
    container: { maxWidth: 920, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 48, paddingBottom: 16, borderBottom: '1px solid rgba(26, 24, 21, 0.1)' },
    brand: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 400, letterSpacing: '0.02em', color: '#1a1815' },
    brandSub: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#8b6f3e', marginTop: 4 },
    internalToggle: { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', background: 'transparent', border: '1px solid rgba(26, 24, 21, 0.2)', color: '#5a4a2a', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit' },
    h1: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 48, fontWeight: 400, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.01em' },
    h2: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 400, lineHeight: 1.2, marginBottom: 12 },
    h3: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 400, lineHeight: 1.3, marginTop: 28, marginBottom: 10 },
    eyebrow: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#8b6f3e', marginBottom: 12 },
    bodyP: { fontSize: 16, marginBottom: 16, color: '#2a2720' },
    lead: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, lineHeight: 1.5, color: '#2a2720', marginBottom: 28, fontWeight: 400, fontStyle: 'italic' },
    card: { background: '#fdfbf6', border: '1px solid rgba(139, 111, 62, 0.2)', padding: 24, marginBottom: 16, cursor: 'pointer', transition: 'all 0.2s' },
    cardSelected: { borderColor: '#5a4a2a', background: '#f7efdf', boxShadow: '0 2px 8px rgba(90, 74, 42, 0.08)' },
    cardTitle: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 400, marginBottom: 4, color: '#1a1815' },
    cardDesc: { fontSize: 13, color: '#5a4a2a', lineHeight: 1.5 },
    button: { background: '#1a1815', color: '#f5f1ea', border: 'none', padding: '14px 28px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' },
    buttonSecondary: { background: 'transparent', color: '#1a1815', border: '1px solid rgba(26, 24, 21, 0.3)', padding: '14px 28px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer', fontFamily: 'inherit' },
    buttonGold: { background: '#5a4a2a', color: '#f5f1ea', border: 'none', padding: '16px 32px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer', fontFamily: 'inherit' },
    input: { width: '100%', padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', background: '#fdfbf6', border: '1px solid rgba(26, 24, 21, 0.2)', color: '#1a1815', boxSizing: 'border-box' },
    label: { display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#5a4a2a', marginBottom: 6, marginTop: 16 },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 },
    tierBadge: { display: 'inline-block', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', padding: '3px 8px', marginLeft: 10, background: '#1a1815', color: '#f5f1ea' },
    tierBadgeOut: { display: 'inline-block', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', padding: '3px 8px', marginLeft: 10, background: 'transparent', color: '#8b6f3e', border: '1px solid #8b6f3e' },
    priceBand: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, padding: '12px 0', borderBottom: '1px dashed rgba(139, 111, 62, 0.2)', fontSize: 14 },
    bandLabel: { color: '#5a4a2a', fontWeight: 500 },
    bandValue: { fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#1a1815' },
    list: { paddingLeft: 0, listStyle: 'none' },
    listItem: { padding: '6px 0 6px 20px', position: 'relative', fontSize: 14, color: '#2a2720', lineHeight: 1.55 },
    dash: { color: '#8b6f3e', position: 'absolute', left: 0 },
    progress: { display: 'flex', gap: 4, marginBottom: 36 },
    progressDot: { height: 2, flex: 1, background: 'rgba(26, 24, 21, 0.15)' },
    progressDotActive: { height: 2, flex: 1, background: '#5a4a2a' },
    draftNotice: { position: 'fixed', bottom: 20, right: 20, background: '#1a1815', color: '#f5f1ea', padding: '12px 20px', fontSize: 12, letterSpacing: '0.1em', zIndex: 100 },
    internalPanel: { background: '#1a1815', color: '#f5f1ea', padding: 20, margin: '24px 0', borderLeft: '3px solid #8b6f3e', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.7 },
  }

  // Progress indicator
  const screens = (['welcome', 'flow-direction', 'market', 'brief', showStructuringScreen ? 'structuring' : null, 'verdict', 'commercial', 'client', 'confirmation'] as (Screen | null)[]).filter(Boolean) as Screen[]
  const currentIdx = screens.indexOf(screen)
  const progressWidth = screens.length

  // ──────────────────────── SCREENS ────────────────────────

  const renderWelcome = () => (
    <div>
      <div style={styles.eyebrow}>Real Estate Intelligence</div>
      <h1 style={styles.h1}>Thirty-one markets. Honestly mapped.</h1>
      <p style={styles.lead}>
        Tell us what you want to do. We will translate it into a formal mandate, open the right structuring conversation, and put one of our gatekeepers on it within four hours.
      </p>
      <p style={styles.bodyP}>
        TGC operates primarily off-market. The right property rarely appears in an agent window.
      </p>
      <p style={styles.bodyP}>
        We run three flow families. Choose the one that matches your situation.
      </p>
      <div style={{ marginTop: 28 }}>
        <div
          style={{ ...styles.card, ...(flowFamily === 'acquisition' ? styles.cardSelected : {}) }}
          onClick={() => { setFlowFamily('acquisition'); setScreen('flow-direction'); }}>
          <div style={styles.cardTitle}>Acquisition</div>
          <div style={styles.cardDesc}>Buying. Primary residence, second home, pied-à-terre, investment, development land, or a long-let rental.</div>
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
      { id: 'buy-let', label: 'Long-let rental', desc: 'Not buying. Leasing for 6+ months, typically for relocation.', dir: 'let' as Direction },
    ] : flowFamily === 'disposal' ? [
      { id: 'sell-open', label: 'Sell · Open market', desc: 'Full professional marketing across the right channels.', dir: 'sell' as Direction },
      { id: 'sell-discreet', label: 'Sell · Discreet register', desc: 'Private buyer list, no public marketing. Most common for TGC mandates.', dir: 'sell' as Direction },
      { id: 'sell-ultra', label: 'Sell · Ultra-private', desc: 'Specific buyer identified or pursued. Zero market footprint.', dir: 'sell' as Direction },
      { id: 'sell-reinvest', label: 'Exit and re-allocate', desc: 'Selling here, buying somewhere else. One coordinated TGC mandate across both.', dir: 'sell' as Direction },
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
            <div key={o.id} style={{ ...styles.card, ...(direction === o.dir && marketId === null ? styles.cardSelected : {}) }}
                 onClick={() => { setDirection(o.dir); setScreen('market'); }}>
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
      2: { title: 'Active Mediterranean', subtitle: 'Strong editorial, working partnerships' },
      3: { title: 'Emerging & Authentic', subtitle: 'Curated editorial, trusted partner delivery' },
      4: { title: 'Global Partner Markets', subtitle: 'Mandate-taking via established international partners' },
    }
    return (
      <div>
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('flow-direction')}>Back</button>
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
              <p style={{ fontSize: 13, color: '#5a4a2a', marginBottom: 16, fontStyle: 'italic' }}>{tierLabels[tier].subtitle}</p>
              <div style={styles.grid2}>
                {tierGroups[tier].map(m => (
                  <div key={m.id} style={{ ...styles.card, ...(marketId === m.id ? styles.cardSelected : {}), marginBottom: 0 }}
                       onClick={() => { setMarketId(m.id); setScreen('brief'); }}>
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
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('market')}>Back</button>
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
            onClick={() => setScreen(showStructuringScreen ? 'structuring' : 'verdict')}
            disabled={!brief.propertyType || !brief.budgetMax || !brief.timeline}>
            Continue
          </button>
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

      <div style={{ ...styles.card, background: '#f7efdf', cursor: 'default', marginBottom: 24 }}>
        <div style={styles.eyebrow}>{jurisdiction?.label} · Jurisdiction headline</div>
        <p style={{ fontSize: 15, color: '#2a2720', margin: '4px 0 12px', lineHeight: 1.55 }}>{jurisdiction?.headline}</p>
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
        <p style={{ fontSize: 14, color: '#5a4a2a', marginTop: 16, fontStyle: 'italic', lineHeight: 1.55 }}>{jurisdiction?.honestAdvice}</p>
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
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen(showStructuringScreen ? 'structuring' : 'brief')}>Back</button>
        <div style={styles.eyebrow}>Our honest view · {market.name}</div>
        <h2 style={styles.h2}>{market.name}</h2>
        <p style={{ fontSize: 14, color: '#5a4a2a', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {market.subLabel}
          {market.tier === 1 && <span style={styles.tierBadge}>Tier 1, Heartland</span>}
          {market.tier === 2 && <span style={styles.tierBadge}>Tier 2, Active</span>}
          {market.tier === 3 && <span style={styles.tierBadgeOut}>Tier 3, Emerging</span>}
          {market.tier === 4 && <span style={styles.tierBadgeOut}>Tier 4, Partner</span>}
        </p>

        <p style={styles.lead}>{market.editorial}</p>

        {market.criticalContext && (
          <div style={{ background: '#fdf6e9', borderLeft: '3px solid #8b6f3e', padding: 20, marginBottom: 24 }}>
            <div style={styles.eyebrow}>Critical context</div>
            <p style={{ fontSize: 15, color: '#2a2720', margin: 0, lineHeight: 1.6 }}>{market.criticalContext}</p>
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
            <div key={label} style={{ padding: '14px 0', borderBottom: '1px dashed rgba(139, 111, 62, 0.2)' }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1815', marginBottom: 8 }}>{label}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 13 }}>
                {bands.entry && <div><div style={{ color: '#8b6f3e', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Entry</div><div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1a1815' }}>{fmtBand(bands.entry)}</div></div>}
                {bands.realistic && <div><div style={{ color: '#8b6f3e', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Realistic</div><div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1a1815' }}>{fmtBand(bands.realistic)}</div></div>}
                {bands.trophy && <div><div style={{ color: '#8b6f3e', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Trophy</div><div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1a1815' }}>{fmtBand(bands.trophy)}</div></div>}
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
            <div style={{ color: '#8b6f3e', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.15em' }}>// INTERNAL VIEW, TGC GATEKEEPER ONLY</div>
            <div>TGC coverage: {market.coverage}</div>
            <div>ICP relevance: {market.icpRelevance}</div>
            <div>Structuring jurisdiction: {market.structuringJurisdiction} / {jurisdiction?.label}</div>
            <div>Market ID: {marketId}</div>
            <div>Tier: {market.tier}</div>
            <div>Budget vs tier-appropriate: EUR {brief.budgetMin} to {brief.budgetMax}M</div>
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <button style={styles.button} onClick={() => setScreen('commercial')}>See commercial opening</button>
        </div>
      </div>
    )
  }

  const renderCommercial = () => {
    if (!market || !commercial) return null
    return (
      <div>
        <button style={{ ...styles.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('verdict')}>Back</button>
        <div style={styles.eyebrow}>The commercial arrangement</div>
        <h2 style={styles.h2}>How we work together.</h2>
        <p style={styles.bodyP}>
          For a {direction === 'sell' ? 'disposal' : direction === 'let' ? 'rental search' : 'buy-side'} mandate on {market.name} ({market.tier === 1 ? 'Tier 1' : market.tier === 2 ? 'Tier 2' : market.tier === 3 ? 'Tier 3' : 'Tier 4'} coverage), our standard opening looks like this.
        </p>

        <div style={{ ...styles.card, background: '#f7efdf', cursor: 'default', marginTop: 20 }}>
          {direction !== 'sell' && direction !== 'let' && (
            <>
              <div style={styles.priceBand}>
                <div style={styles.bandLabel}>Retainer</div>
                <div style={styles.bandValue}>EUR {commercial?.retainer?.toLocaleString()}</div>
              </div>
              <p style={{ fontSize: 13, color: '#5a4a2a', marginTop: 8, fontStyle: 'italic' }}>Covers active search: off-market sourcing, shortlist, viewings coordination, legal introductions. 6-12 month active period.</p>
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

      <label style={styles.label}>Current tax residence</label>
      <input type="text" style={styles.input} value={client.taxResidence} placeholder="e.g., UK / France / Monaco" onChange={e => setClient({ ...client, taxResidence: e.target.value })} />

      <p style={{ fontSize: 12, color: '#5a4a2a', marginTop: 24, fontStyle: 'italic', lineHeight: 1.6 }}>
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
      <div style={styles.eyebrow}>Mandate received</div>
      <h2 style={styles.h2}>Thank you, {client.name?.split(' ')[0]}.</h2>
      <p style={styles.lead}>
        Your brief is with us. A Gatekeeper has it in hand now.
      </p>

      <div style={{ ...styles.card, background: '#f7efdf', cursor: 'default' }}>
        <div style={styles.eyebrow}>Mandate reference</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: '#1a1815', margin: '4px 0 16px' }}>{mandateId}</div>
        <div style={styles.priceBand}>
          <div style={styles.bandLabel}>Direction</div>
          <div style={styles.bandValue}>{direction?.toUpperCase()}</div>
        </div>
        <div style={styles.priceBand}>
          <div style={styles.bandLabel}>Market</div>
          <div style={styles.bandValue}>{market?.name}</div>
        </div>
        <div style={styles.priceBand}>
          <div style={styles.bandLabel}>Property type</div>
          <div style={styles.bandValue}>{brief.propertyType}</div>
        </div>
        <div style={styles.priceBand}>
          <div style={styles.bandLabel}>Budget</div>
          <div style={styles.bandValue}>EUR {brief.budgetMin}M to EUR {brief.budgetMax}M</div>
        </div>
        <div style={styles.priceBand}>
          <div style={styles.bandLabel}>Timeline</div>
          <div style={styles.bandValue}>{brief.timeline}</div>
        </div>
        <div style={styles.priceBand}>
          <div style={styles.bandLabel}>Confidentiality</div>
          <div style={styles.bandValue}>{brief.confidentiality}</div>
        </div>
      </div>

      <h3 style={styles.h3}>What happens next</h3>
      <ul style={styles.list}>
        <li style={styles.listItem}><span style={styles.dash}>*</span><strong>Within 4 hours:</strong> your assigned Gatekeeper will acknowledge receipt personally</li>
        <li style={styles.listItem}><span style={styles.dash}>*</span><strong>Within 24 hours:</strong> a full considered response to your brief, including our first honest view</li>
        <li style={styles.listItem}><span style={styles.dash}>*</span><strong>Within 72 hours:</strong> a discovery call to refine the mandate and walk through the draft letter</li>
        <li style={styles.listItem}><span style={styles.dash}>*</span><strong>Within 14 days:</strong> signed mandate letter and active search begins</li>
      </ul>

      <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button style={styles.button} onClick={downloadMandateLetter}>Download draft mandate letter</button>
        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" style={{ ...styles.buttonGold, textDecoration: 'none', display: 'inline-block' }}>Book discovery call</a>
        <button style={styles.buttonSecondary} onClick={resetAll}>Start another mandate</button>
      </div>

      <div style={{ marginTop: 48, padding: 20, background: '#fdf6e9', borderLeft: '3px solid #8b6f3e' }}>
        <div style={styles.eyebrow}>While you wait, illustrative of your brief</div>
        <p style={{ fontSize: 14, color: '#2a2720', marginTop: 8, lineHeight: 1.6 }}>
          Based on your brief, the kind of property we would shortlist for you in {market?.name} typically sits in the <strong>{
            budget < (market?.priceBands[Object.keys(market?.priceBands || {})[0]]?.realistic?.[0] || 5)
              ? 'entry'
              : budget < (market?.priceBands[Object.keys(market?.priceBands || {})[0]]?.realistic?.[1] || 15)
              ? 'realistic'
              : 'trophy'
          }</strong> band. Your Gatekeeper will send 3-5 specific properties, including off-market ones, within 24 hours of our discovery call.
        </p>
      </div>
    </div>
  )

  const renderScreen = () => {
    switch (screen) {
      case 'welcome': return renderWelcome()
      case 'flow-direction': return renderFlowDirection()
      case 'market': return renderMarketSelector()
      case 'brief': return renderBrief()
      case 'structuring': return renderStructuring()
      case 'verdict': return renderVerdict()
      case 'commercial': return renderCommercial()
      case 'client': return renderClient()
      case 'confirmation': return renderConfirmation()
      default: return renderWelcome()
    }
  }

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        input:focus, select:focus, textarea:focus { outline: none; border-color: #5a4a2a; }
        button:hover:not(:disabled) { opacity: 0.85; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%235a4a2a' fill='none' stroke-width='1.5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
      `}</style>

      <div style={styles.container}>
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
