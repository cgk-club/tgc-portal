/* eslint-disable react/no-unescaped-entities, react/jsx-no-comment-textnodes */
'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'tgc-art-collectables-brief'
const CALENDAR_URL = 'https://calendar.app.google/aAsppu4Tju2my9ST7'

// ──────────────────────────────────────────────────────────────────────────────
// CATEGORIES — 6 collecting categories
// ──────────────────────────────────────────────────────────────────────────────

type CategoryId = 'contemporary' | 'masters-modern' | 'horology' | 'wine-spirits' | 'classic-cars' | 'jewellery-objects'

type Category = {
  id: CategoryId
  number: string
  name: string
  tagline: string
  editorial: string
  loud: string
  quiet: string
  marketDynamics: string[]
  structuringFlags: StructuringFlagId[]
  tgcAngle: string
  chroniclesNote?: string
}

type StructuringFlagId = 'droit-de-suite' | 'import-vat' | 'freeport' | 'estate-planning' | 'provenance' | 'authentication' | 'storage' | 'insurance'

type StructuringFlag = {
  id: StructuringFlagId
  title: string
  explanation: string
  tgcNote: string
  material: boolean
}

const CATEGORIES: Category[] = [
  {
    id: 'contemporary',
    number: '01',
    name: 'Contemporary Art',
    tagline: 'The primary market and the secondary market are different products.',
    editorial: 'Most buyers enter through galleries. Galleries represent artists, not collectors. The secondary market — auctions and private sales — is where real price discovery happens, and where structuring before acquisition is worth far more than structuring after. The ultra-contemporary market (born post-1980) is speculative; the ten-year resale data is thin. Institutional collecting is the one reliable long-term price signal.',
    loud: 'Art fair booth, gallery opening, Christie\'s evening sale, paddle number, buyer\'s premium of 26%, photograph with the work on Instagram.',
    quiet: 'A direct approach to a studio or estate before the market arrives. Private treaty sale bypassing auction commission entirely. A relationship with the artist built over years, not a purchase made in an afternoon.',
    marketDynamics: [
      'Christie\'s and Sotheby\'s buyer\'s premium is now 26% on the first £700k — private treaty saves this entirely',
      'Gallery primary prices are set, not discovered — the waiting list exists because scarcity is managed, not because demand is unmet',
      'Ultra-contemporary work (born post-1980) lacks resale data beyond a single market cycle — treat as speculative',
      'Major institutional acquisition of an artist is the single best long-term price signal available publicly',
      'The art fund model has broadly failed — art does not function reliably as a financial product and should not be bought primarily as one',
      'TGC\'s Concierge Chronicles has introduced collectors to independent artists before market recognition — early studio relationships matter more than auction access',
    ],
    structuringFlags: ['droit-de-suite', 'import-vat', 'freeport', 'estate-planning', 'authentication'],
    tgcAngle: 'TGC approaches contemporary collecting through makers and artists we know personally or through close introduction. The Concierge Chronicles has covered studios across France, Italy, and the UK — several before significant market recognition. We can facilitate studio visits, direct commissions, and private treaty sales that do not reach public channels.',
    chroniclesNote: 'The Concierge Chronicles covers independent artists and makers as part of its core editorial. Past issues have profiled ceramicists, painters, and textile artists whose work now sells through major galleries. Collector introductions through the Chronicles are part of TGC\'s active offer.',
  },
  {
    id: 'masters-modern',
    number: '02',
    name: 'Old Masters & Modern',
    tagline: 'Provenance is the work. Attribution is the question.',
    editorial: 'Old Masters is a market defined by scholarship and provenance gaps. The 1933–1945 period is not optional research — it is essential due diligence for any work with European provenance during that period. Modern works (Impressionist to 1970) have a more established market, but attribution remains the central risk: "workshop of," "follower of," and "attributed to" can halve a value overnight. Works that have passed through museum loans carry both a premium and a more transparent provenance trail.',
    loud: 'Christie\'s or Sotheby\'s evening sale, estimate in the catalogue, Art Loss Register certificate, provenance research done by the auction house, buyer\'s premium.',
    quiet: 'A work from a private European collection, with an unbroken ownership chain and a catalogue raisonné reference. Independent scholar opinion rather than dealer certificate. Freeport delivery if the acquisition value supports it.',
    marketDynamics: [
      'The Art Loss Register holds over 500,000 entries — verification is essential before any Old Masters acquisition',
      'Restitution claims can emerge decades after acquisition — clean provenance from 1933 onward protects against this entirely',
      'Attribution disputes ("workshop of," "follower of") can halve a hammer estimate — technical analysis before bidding is standard professional practice, rarely done by private buyers',
      'The Impressionist and Modern market peaked in the mid-2000s; values are stable but the growth decade has passed',
      'Works with documented exhibition history (catalogues, loans, museum records) carry a premium of 15–25% and are significantly easier to resell',
    ],
    structuringFlags: ['provenance', 'import-vat', 'freeport', 'estate-planning', 'authentication'],
    tgcAngle: 'TGC works with a small number of Old Masters specialists in France and London — dealers who have access to private European collections that do not reach the auction market. For significant acquisitions, we commission independent provenance research and technical analysis before any approach to a seller.',
  },
  {
    id: 'horology',
    number: '03',
    name: 'Watches & Horology',
    tagline: 'The independent houses are building the watches the institutions will collect in thirty years.',
    editorial: 'The watch market has bifurcated sharply. The grey market speculation in mainstream references — Rolex Daytona, Patek Nautilus, AP Royal Oak — peaked in 2022 and has corrected 30–40% from peak. The independent watchmakers — F.P. Journe, Philippe Dufour, De Bethune, Grönefeld, MB&F, Laurent Ferrier — have seen values increase through the same period, because their buyers were never primarily speculators. The question is not which references are appreciating. It is which makers are doing the most interesting work at the highest technical level, and whether you can access them before the broader market does.',
    loud: 'Grey market premium tracking on Chrono24, Rolex AD waitlist, flipping References, watching auction results as a price guide for purchase.',
    quiet: 'A direct relationship with an independent atelier. A watch bought for what it represents technically and aesthetically, not for what it might be worth in two years. A commission from a manufacture that does not market heavily and does not have a waitlist managed by retail partners.',
    marketDynamics: [
      'Grey market premiums on Daytona, Nautilus, and Royal Oak have compressed 30–40% from 2022 peak — the speculative cycle has turned',
      'F.P. Journe, Philippe Dufour, and De Bethune secondary market values have increased through the same period — a meaningful divergence',
      'Full, documented service history roughly doubles the resale value of a complicated watch at auction',
      'Vintage Patek, Rolex, and AP with original dials, unpolished cases, and all original parts command 40–60% premium over restored equivalents',
      'The "Manufacture" designation — producing movements in-house — is a marketing claim that says nothing about finishing quality; several independent ateliers producing superior work have no manufacture claim',
      'The most interesting independent commissions (Dufour Simplicity, Journe Vagabondage) are not available through conventional retail channels',
    ],
    structuringFlags: ['authentication', 'import-vat', 'estate-planning', 'insurance'],
    tgcAngle: 'TGC\'s Concierge Chronicles has covered independent horology as part of its makers editorial — not as a financial asset class but as one of the few remaining craft disciplines where a single person\'s hands produce a mechanical object of lasting significance. We have direct relationships with several independent ateliers and can facilitate introductions and commissions outside standard retail channels.',
    chroniclesNote: 'Horology is a recurring thread in the Concierge Chronicles — the independent makers who produce at a rate of dozens of pieces per year rather than thousands. Issues have covered the atelier visit, the technical choices, and the collector perspective. This is editorial territory, not advertising.',
  },
  {
    id: 'wine-spirits',
    number: '04',
    name: 'Wine & Fine Spirits',
    tagline: 'En primeur is a financial product. Physical is a pleasure product. Know which you are buying.',
    editorial: 'The fine wine market has polarised. Bordeaux en primeur (futures at release) benefits négociants and châteaux — the secondary market return for collectors outside the First Growths is inconsistent and the capital is tied up for 2–3 years at release prices that are not always discounted from eventual physical value. Burgundy — Romanée-Conti, Rousseau, Leroy, Mugnier — has outperformed Bordeaux consistently since 2015. Japanese whisky, vintage Armagnac, and aged Cognac have outperformed both wine categories on the collectables market in the past decade.',
    loud: 'Bordeaux futures at primeur release, a wine investment fund, UK bonded warehouse with no documentation, selling through auction house at buyer\'s premium.',
    quiet: 'Physical cases purchased ex-château or from a private estate with a complete provenance chain. A bonded warehouse with proper ownership documentation. A direct network to serious buyers — restaurants, private collectors, specialist merchants — rather than auction house as exit.',
    marketDynamics: [
      'Burgundy has outperformed Bordeaux consistently since 2015 — the Côte de Nuits allocation system is the real access question',
      'Provenance chain is everything for resale: every transfer must be documented; a gap, even an explicable one, halves the hammer price',
      'UK bonded warehouse and French entrepôt douanier both defer VAT — understanding which structure you are using matters at the point of extraction',
      'Japanese whisky (Karuizawa, Yamazaki limited releases) has been the strongest performing spirits category — largely sold out at primary market',
      'Armagnac and vintage Cognac represent undervalued long-aged spirits with strong private collector demand and limited auction liquidity',
      'The WineBid / Acker / Zachys auction market charges meaningful buyer\'s premiums — a private buyer network consistently outperforms on net proceeds',
    ],
    structuringFlags: ['storage', 'import-vat', 'estate-planning', 'provenance'],
    tgcAngle: 'TGC has direct relationships with several Burgundy domaines and can facilitate allocations that do not reach the open market. Amélie Rigo\'s Occitanie network includes natural wine producers of collector interest — small-production, no-compromise domaines that are not yet at auction prices.',
  },
  {
    id: 'classic-cars',
    number: '05',
    name: 'Classic Cars',
    tagline: 'Homologation documents are the title deeds. Racing history is the narrative.',
    editorial: 'Classic cars are the most physically demanding of the collecting categories — storage, maintenance, insurance, and running costs are material numbers, not incidental. The market has stratified clearly: concours-correct, unrestored original-condition cars with matching numbers outperform fully restored show cars, which have reached a plateau. The right acquisition is a car with verifiable chassis history, original drivetrain, documented provenance, and an honest relationship with its patina — not a car rebuilt to a level it never achieved from the factory.',
    loud: 'A fully restored concours car at Pebble Beach estimate, RM Sotheby\'s Monterey, trailer queen, 1,000-point condition, chrome-buffed, chrome-buffed again, trailer to the show.',
    quiet: 'An original-condition car with matching numbers, every service stamp, the name of every previous owner, and 40,000 miles on the odometer rather than 400 since restoration. Driven carefully. Stored properly. Insured at agreed value.',
    marketDynamics: [
      'Matching numbers (original engine, gearbox, body) command a 30–50% premium at auction over non-matching equivalents in the same outward condition',
      'Full professional restoration costs routinely exceed the resulting market value for most cars below €500k — model the economics before commissioning',
      'FIA Historic Technical Passports add significant value to competition-eligible cars; the racing history documentation is as important as the car itself',
      'The top 1% of the market (Ferrari 250 GTO, McLaren F1, pre-war Bugatti) remains stable and illiquid — fewer than a dozen trade publicly per year',
      'Import duties vary significantly: EU 6.5%, UK 6.5%, Switzerland 0% with specific caveats — get advice before importing across borders',
      'The Monaco and Côte d\'Azur collector network holds several significant private collections — access without public auction requires introductions',
    ],
    structuringFlags: ['import-vat', 'insurance', 'authentication', 'estate-planning'],
    tgcAngle: 'TGC\'s Monaco and Riviera network includes several significant private collectors and a small number of specialist dealers who do not regularly consign to public auction. We can source without public bidding and facilitate private treaty introductions for buyers who know what they want.',
  },
  {
    id: 'jewellery-objects',
    number: '06',
    name: 'Jewellery & Objects',
    tagline: 'Signed is a different market to unsigned. Both can be excellent. They are not the same acquisition.',
    editorial: 'Signed jewellery — Cartier, Van Cleef & Arpels, JAR, Suzanne Belperron — trades on the house\'s reputation as much as the object\'s quality. Unsigned jewellery of equivalent or superior quality frequently trades at a fraction of the signed equivalent, making it the better acquisition if personal enjoyment rather than resale is the primary goal. Coloured stones with origin certificates from major gemological laboratories (Gübelin, SSEF, GIA) are a different market to uncertified stones: the certificate is not optional for significant acquisitions. Objects de vertu — Fabergé, Meissen, historic silver — are specialist markets with limited liquidity.',
    loud: 'Christie\'s or Sotheby\'s Magnificent Jewels evening sale, paddle number, signed Cartier for the name rather than the quality, buyer\'s premium, insured at replacement value rather than agreed value.',
    quiet: 'A coloured stone of exceptional quality — Colombian emerald, Burmese ruby, Kashmir sapphire — with a major laboratory origin certificate, from a private estate, with full documentation. Or a signed piece bought from the original owner\'s family, below auction estimate, because the provenance is quiet rather than marketed.',
    marketDynamics: [
      'JAR (Joel Arthur Rosenthal) is the most institutionally respected contemporary jeweller — a secondary auction market has formed and values have increased consistently',
      'Coloured stone premiums for origin certificates: certified Kashmir sapphires trade at 3–5x equivalent stones without origin certification',
      'The signed versus unsigned premium at auction for equivalent quality work can be 3–5x — unsigned is not inferior, it is a different market',
      'Art Deco signed pieces (Cartier, Boucheron, Van Cleef with original box and papers) are the most liquid segment of the historic signed jewellery market',
      'Gem investment as a concept is speculative — the margin between wholesale and retail is very wide and liquidity is limited outside auction',
      'Fabergé and Russian Imperial objects have specific provenance considerations (post-1917 export documentation) that affect auction eligibility at major houses',
    ],
    structuringFlags: ['import-vat', 'estate-planning', 'insurance', 'authentication', 'provenance'],
    tgcAngle: 'TGC\'s makers network includes several contemporary jewellers producing signed work of significant quality before broader market recognition — a direct parallel to the contemporary art and horology approach. For significant acquisitions, we commission independent gemological assessment from Gübelin or SSEF rather than relying on house-provided certificates.',
    chroniclesNote: 'The Concierge Chronicles covers jewellers and object-makers as part of its maker editorial. Several past subjects have had no commercial profile at the time of coverage — the access comes from direct relationship, not marketing.',
  },
]

const STRUCTURING_FLAGS: Record<StructuringFlagId, StructuringFlag> = {
  'droit-de-suite': {
    id: 'droit-de-suite',
    title: 'Artist\'s Resale Right (Droit de suite)',
    explanation: 'EU law requires a royalty of approximately 3% (on a sliding scale) paid to the artist or their estate on any resale of original art above €750 through a gallery or auction house in the EU. Applies for 70 years after the artist\'s death. This is charged to the seller, not the buyer — but it affects your eventual net proceeds when you sell.',
    tgcNote: 'On private sales arranged by TGC where we act as an art market professional, droit de suite still applies. We factor this into the seller\'s net proceeds calculation from the outset. For acquisitions, it does not affect your purchase price — but it reduces your exit proceeds by 3–4% and should be modelled in.',
    material: true,
  },
  'import-vat': {
    id: 'import-vat',
    title: 'Import VAT and reduced rates',
    explanation: 'Original works of art qualify for reduced VAT rates: France 5.5%, UK 5%. Antiques over 100 years old also qualify at reduced rates. Decorative arts, furniture, and most objects do not — they are taxed at the standard rate (France 20%, UK 20%). The classification at import determines this, and it is frequently applied incorrectly when buyers import privately.',
    tgcNote: 'Most buyers importing through dealers or auction houses never see this as a separate line item — it is built into the price. But importing privately (from a private seller, from a freeport, or from outside the EU) requires correct classification. Freeport storage defers the VAT trigger entirely for as long as the work remains in freeport.',
    material: true,
  },
  'freeport': {
    id: 'freeport',
    title: 'Freeport storage and deferred VAT',
    explanation: 'Geneva, Luxembourg, Singapore, and Delaware operate bonded freeport warehouses where works can be stored, bought, and sold without triggering import VAT. A work can be lent to exhibitions from freeport without formal import. VAT is only triggered when the work finally enters a taxable territory for use. The Geneva Freeport holds more art than most major public museums.',
    tgcNote: 'Freeport makes economic sense above roughly €200k in value where the VAT saving (5.5–20% depending on jurisdiction and category) materially exceeds storage costs (typically 0.15–0.25% per annum). A work held in freeport indefinitely never triggers VAT. Buyers acquiring in Switzerland or selling internationally should model this before deciding on delivery terms.',
    material: true,
  },
  'estate-planning': {
    id: 'estate-planning',
    title: 'Estate planning and succession',
    explanation: 'Art and collectables are included in taxable estates in most jurisdictions. In France, droits de succession reach 45% for non-direct heirs. UK IHT is 40% above the nil-rate band. Gifts inter vivos with applicable abatements, donation to approved foundations, or the dation en paiement mechanism in France (paying a tax debt with a work of cultural significance) can reduce this materially — but only if planned proactively.',
    tgcNote: 'The dation en paiement is one of the most underused mechanisms in French estate planning: the state accepts works of significant cultural value in lieu of inheritance tax at an agreed valuation. This requires advance negotiation with the Ministry of Culture and cannot be arranged retrospectively. TGC can introduce specialist advisers in France and the UK. This is a conversation to have now, not in a will.',
    material: true,
  },
  'provenance': {
    id: 'provenance',
    title: 'Provenance research',
    explanation: 'Provenance documents the full ownership history of a work. For Old Masters, the critical gap is 1933–1945: any European work with a gap in this period requires research through the Art Loss Register, German Lostart database, and French Commission for Indemnification of Victims of Spoliation. For African and Asian antiquities, the UNESCO 1970 Convention date is the relevant benchmark. For wine, every ownership transfer must be documented.',
    tgcNote: 'A clean, documented provenance chain adds 20–30% to auction estimates and is the difference between a work you can sell and one you cannot. A gap — even one explained by a private collection — creates uncertainty that depresses value and may prevent major auction house consignment. TGC requires provenance research as standard on any acquisition above €50k.',
    material: true,
  },
  'authentication': {
    id: 'authentication',
    title: 'Authentication and attribution risk',
    explanation: 'For contemporary art, authentication typically requires foundation or catalogue raisonné committee confirmation. For watches, it means original parts, unpolished case, and dial authenticity. For classic cars, matching numbers and factory build records. For jewellery, independent gemological laboratory certification. A rejected authentication or a corrected attribution destroys value — not depresses it. Destroys it.',
    tgcNote: 'Technical analysis (X-ray and infrared for paintings; movement inspection for watches; chassis number verification and factory records for cars; laboratory certification for gemstones) costs less than 1% of acquisition value and protects against catastrophic loss. TGC commissions independent authentication as standard on acquisitions above €25k. We will not proceed without it.',
    material: true,
  },
  'storage': {
    id: 'storage',
    title: 'Storage, conservation, and running costs',
    explanation: 'Storage costs are material for wine (bonded warehouse: approximately £15–25 per case per year), classic cars (professional storage: £3,000–8,000 per year per car, plus servicing and insurance), and significant art (climate-controlled commercial storage: 0.15–0.25% of value per year). Conservation for works on paper, textiles, and unstretched canvases is ongoing, not a one-time cost.',
    tgcNote: 'Most buyers underestimate total cost of ownership. A classic car collection at professional storage, properly serviced, maintained, and insured, costs 3–5% of collection value per year before considering appreciation. Model this before acquiring. The carrying cost of a collection that does not move is a decision, not an oversight.',
    material: false,
  },
  'insurance': {
    id: 'insurance',
    title: 'Specialist insurance and agreed value',
    explanation: 'Standard home contents insurance is typically insufficient for collectables above £50k. Specialist art and collectables insurance (Hiscox, Chubb, Axa Art) provides agreed value coverage — meaning a specific insured value rather than a disputed market assessment — with worldwide transit, exhibition loan, and restoration cover. Classic cars require agreed value specialist policies.',
    tgcNote: 'Agreed value insurance is the critical point: in the event of a claim, you receive the insured value, not what the insurer\'s assessor thinks the market would pay. Revaluation should happen every 3–5 years for significant pieces as market values move. TGC can introduce specialist brokers in France and the UK who understand the collecting categories rather than the general luxury market.',
    material: false,
  },
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

function TGCArtCollectables() {
  const [screen, setScreen] = useState('welcome')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [direction, setDirection] = useState('')
  const [channel, setChannel] = useState('')
  const [budget, setBudget] = useState('')
  const [brief, setBrief] = useState({ specific: '', timeline: '', existingCollection: '', confidentiality: '', notes: '' })
  const [client, setClient] = useState({ name: '', email: '', phone: '' })
  const [loadedDraft, setLoadedDraft] = useState(false)
  const [refId, setRefId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.categoryId) {
          const cat = CATEGORIES.find(c => c.id === data.categoryId)
          if (cat) setSelectedCategory(cat)
        }
        if (data.direction) setDirection(data.direction)
        if (data.channel) setChannel(data.channel)
        if (data.budget) setBudget(data.budget)
        if (data.brief) setBrief(data.brief)
        if (data.client) setClient(data.client)
        setLoadedDraft(true)
        setTimeout(() => setLoadedDraft(false), 4000)
      }
    } catch { /* first run */ }
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          categoryId: selectedCategory.id,
          direction, channel, budget, brief, client,
        }))
      } catch { /* storage unavailable */ }
    }
  }, [selectedCategory, direction, channel, budget, brief, client])

  const resetAll = () => {
    setScreen('welcome')
    setSelectedCategory(null)
    setDirection('')
    setChannel('')
    setBudget('')
    setBrief({ specific: '', timeline: '', existingCollection: '', confidentiality: '', notes: '' })
    setClient({ name: '', email: '', phone: '' })
    setRefId(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  const submitBrief = async () => {
    const id = `TGC-AC-${Date.now().toString(36).toUpperCase()}`
    setRefId(id)
    const payload = {
      type: 'art-collectables',
      refId: id,
      submittedAt: new Date().toISOString(),
      category: { id: selectedCategory?.id, name: selectedCategory?.name },
      direction, channel, budget, brief, client,
    }
    try {
      await fetch('/api/intelligence/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch { /* offline */ }
    setScreen('confirmation')
  }

  const activeFlags = selectedCategory
    ? selectedCategory.structuringFlags.map(id => STRUCTURING_FLAGS[id])
    : []

  const s = {
    root: { minHeight: '100vh', background: '#F9F8F5', color: '#1a1815', fontFamily: "'Lato', sans-serif", padding: '40px 20px', lineHeight: 1.6 } as React.CSSProperties,
    container: { maxWidth: 920, margin: '0 auto' } as React.CSSProperties,
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 48, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' } as React.CSSProperties,
    brand: { fontFamily: "'Poppins', sans-serif", fontSize: 26, fontWeight: 400, letterSpacing: '0.02em', color: '#0e4f51' } as React.CSSProperties,
    brandSub: { fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#c8aa4a', marginTop: 4 },
    h1: { fontFamily: "'Poppins', sans-serif", fontSize: 48, fontWeight: 400, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.01em' } as React.CSSProperties,
    h2: { fontFamily: "'Poppins', sans-serif", fontSize: 32, fontWeight: 400, lineHeight: 1.2, marginBottom: 12 } as React.CSSProperties,
    h3: { fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 400, lineHeight: 1.3, marginTop: 28, marginBottom: 10 } as React.CSSProperties,
    eyebrow: { fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#c8aa4a', marginBottom: 12 },
    bodyP: { fontSize: 16, marginBottom: 16, color: '#1a1815', lineHeight: 1.65 } as React.CSSProperties,
    lead: { fontFamily: "'Poppins', sans-serif", fontSize: 20, lineHeight: 1.55, color: '#6b7280', marginBottom: 28, fontWeight: 300 } as React.CSSProperties,
    card: { background: '#F9F8F5', border: '1px solid #e5e7eb', padding: 24, marginBottom: 12, cursor: 'pointer', transition: 'all 0.2s', borderRadius: 8 } as React.CSSProperties,
    cardSelected: { borderColor: '#0e4f51', background: '#F9F8F5', boxShadow: '0 2px 8px rgba(14,79,81,0.08)' } as React.CSSProperties,
    cardTitle: { fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 400, marginBottom: 4, color: '#1a1815' } as React.CSSProperties,
    cardDesc: { fontSize: 13, color: '#6b7280', lineHeight: 1.55 } as React.CSSProperties,
    button: { background: '#0e4f51', color: '#ffffff', border: 'none', padding: '14px 28px', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', borderRadius: 8 } as React.CSSProperties,
    buttonSecondary: { background: 'transparent', color: '#1a1815', border: '1px solid #e5e7eb', padding: '14px 28px', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 8 } as React.CSSProperties,
    buttonGold: { background: '#c8aa4a', color: '#ffffff', border: 'none', padding: '16px 32px', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 8 } as React.CSSProperties,
    input: { width: '100%', padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', background: '#F9F8F5', border: '1px solid #e5e7eb', color: '#1a1815', boxSizing: 'border-box' as const } as React.CSSProperties,
    textarea: { width: '100%', padding: '14px', fontSize: 15, fontFamily: 'inherit', background: '#F9F8F5', border: '1px solid #e5e7eb', color: '#1a1815', boxSizing: 'border-box' as const, resize: 'vertical' as const, minHeight: 80, lineHeight: 1.55 } as React.CSSProperties,
    select: { width: '100%', padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', background: '#F9F8F5', border: '1px solid #e5e7eb', color: '#1a1815', boxSizing: 'border-box' as const } as React.CSSProperties,
    label: { display: 'block', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: '#0e4f51', marginBottom: 6, marginTop: 16 } as React.CSSProperties,
    list: { paddingLeft: 0, listStyle: 'none' } as React.CSSProperties,
    listItem: { padding: '6px 0 6px 20px', position: 'relative' as const, fontSize: 14, color: '#1a1815', lineHeight: 1.6 } as React.CSSProperties,
    dash: { color: '#c8aa4a', position: 'absolute' as const, left: 0 },
    progress: { display: 'flex', gap: 4, marginBottom: 36 } as React.CSSProperties,
    progressDot: { height: 2, flex: 1, background: '#e5e7eb' } as React.CSSProperties,
    progressDotActive: { height: 2, flex: 1, background: '#0e4f51' } as React.CSSProperties,
    draftNotice: { position: 'fixed' as const, bottom: 20, right: 20, background: '#0e4f51', color: '#ffffff', padding: '12px 20px', fontSize: 12, letterSpacing: '0.1em', zIndex: 100 } as React.CSSProperties,
    primaryQuote: { fontFamily: "'Poppins', sans-serif", fontWeight: 300, fontSize: 22, lineHeight: 1.45, color: '#1a1815', padding: '28px 36px', background: '#F9F8F5', borderLeft: '3px solid #c8aa4a', marginBottom: 32 } as React.CSSProperties,
    structuringCard: { padding: '20px 24px', marginBottom: 12, borderLeft: '3px solid #e5e7eb', background: '#F9F8F5', borderRadius: 8 } as React.CSSProperties,
    structuringCardMaterial: { padding: '20px 24px', marginBottom: 12, borderLeft: '3px solid #0e4f51', background: '#F9F8F5', borderRadius: 8 } as React.CSSProperties,
    tgcNoteBox: { background: '#0e4f51', color: '#ffffff', padding: '16px 20px', marginTop: 10, fontSize: 13, lineHeight: 1.65, borderRadius: 4 } as React.CSSProperties,
    chroniclesBox: { background: 'transparent', border: '1px solid #e5e7eb', padding: '16px 20px', marginTop: 24, marginBottom: 8, borderRadius: 8 } as React.CSSProperties,
  }

  const screens = ['welcome', 'category', 'market', 'direction', 'structuring', 'brief', 'client', 'confirmation']
  const currentIdx = screens.indexOf(screen)

  const renderWelcome = () => (
    <div>
      <div style={s.eyebrow}>Art & Collectables Intelligence</div>
      <h1 style={s.h1}>The acquisition question<br />is the wrong question.</h1>
      <div style={s.primaryQuote}>
        "Most collectors decide what to acquire and then ask how to hold it. The structuring question — how to hold it, where, what happens when you sell, what happens when you die — should come before the first conversation with a dealer, not after the wire transfer."
      </div>
      <p style={s.bodyP}>
        Six collecting categories. For each: an honest read of the market, the structuring questions most buyers never ask, and TGC's specific positioning — including our makers and horology network through the Concierge Chronicles.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginTop: 32 }}>
        {CATEGORIES.map(cat => (
          <div key={cat.id} style={{ ...s.card, ...(selectedCategory?.id === cat.id ? s.cardSelected : {}) }}
            onClick={() => { setSelectedCategory(cat); setScreen('category') }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c8aa4a', marginBottom: 8 }}>
              {cat.number}
            </div>
            <div style={s.cardTitle}>{cat.name}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6, lineHeight: 1.5 }}>{cat.tagline}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderCategory = () => {
    if (!selectedCategory) return null
    return (
      <div>
        <button style={{ ...s.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('welcome')}>← Back</button>
        <div style={s.eyebrow}>{selectedCategory.number} · Art & Collectables</div>
        <h2 style={s.h2}>{selectedCategory.name}</h2>
        <p style={{ ...s.lead }}>{selectedCategory.tagline}</p>
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {CATEGORIES.map(cat => (
            <div key={cat.id}
              style={{ ...s.card, ...(selectedCategory.id === cat.id ? s.cardSelected : {}), padding: 16 }}
              onClick={() => setSelectedCategory(cat)}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c8aa4a', marginBottom: 4 }}>{cat.number}</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 17, fontWeight: 400, color: '#1a1815' }}>{cat.name}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32 }}>
          <button style={s.button} onClick={() => setScreen('market')}>Read the market analysis →</button>
        </div>
      </div>
    )
  }

  const renderMarket = () => {
    if (!selectedCategory) return null
    return (
      <div>
        <button style={{ ...s.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('category')}>← Back</button>
        <div style={s.eyebrow}>{selectedCategory.name} · Market</div>
        <h2 style={s.h2}>{selectedCategory.tagline}</h2>

        <p style={s.bodyP}>{selectedCategory.editorial}</p>

        <h3 style={s.h3}>Loud vs quiet</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          <div>
            <div style={s.eyebrow}>The loud version (to avoid)</div>
            <p style={{ fontSize: 14, color: '#1a1815', lineHeight: 1.65 }}>{selectedCategory.loud}</p>
          </div>
          <div>
            <div style={s.eyebrow}>The quiet version (what TGC builds toward)</div>
            <p style={{ fontSize: 14, color: '#1a1815', lineHeight: 1.65 }}>{selectedCategory.quiet}</p>
          </div>
        </div>

        <h3 style={s.h3}>What you need to know about this market</h3>
        <ul style={s.list}>
          {selectedCategory.marketDynamics.map((d, i) => (
            <li key={i} style={s.listItem}><span style={s.dash}>—</span>{d}</li>
          ))}
        </ul>

        <div style={{ background: '#0e4f51', color: '#ffffff', padding: '24px 28px', marginTop: 32, marginBottom: 8, borderRadius: 8 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c8aa4a', marginBottom: 10 }}>TGC's positioning</div>
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 15, lineHeight: 1.65, margin: 0 }}>
            {selectedCategory.tgcAngle}
          </p>
        </div>

        {selectedCategory.chroniclesNote && (
          <div style={s.chroniclesBox}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c8aa4a', marginBottom: 8 }}>Concierge Chronicles</div>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65, margin: 0 }}>
              {selectedCategory.chroniclesNote}
            </p>
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <button style={s.button} onClick={() => setScreen('direction')}>Continue: your mandate →</button>
        </div>
      </div>
    )
  }

  const renderDirection = () => {
    const directionOptions = [
      { value: 'acquiring', label: 'Acquiring — looking for a specific piece or building a collection' },
      { value: 'selling', label: 'Selling — private sale, auction, or estate' },
      { value: 'appraising', label: 'Appraising — existing collection, insurance, or estate valuation' },
      { value: 'commissioning', label: 'Commissioning — direct from a maker or artist' },
    ]
    const channelOptions = [
      { value: 'private-treaty', label: 'Private treaty — no public auction' },
      { value: 'auction', label: 'Auction — public sale' },
      { value: 'gallery-primary', label: 'Gallery primary market' },
      { value: 'direct-estate', label: 'Direct from estate or family' },
      { value: 'open', label: 'Open — let TGC recommend' },
    ]
    const budgetOptions = [
      { value: 'under-25k', label: 'Under €25,000' },
      { value: '25-100k', label: '€25,000 – 100,000' },
      { value: '100-500k', label: '€100,000 – 500,000' },
      { value: '500k-2m', label: '€500,000 – 2,000,000' },
      { value: '2m-plus', label: '€2,000,000+' },
      { value: 'open', label: 'Open — quality is the constraint' },
    ]
    return (
      <div>
        <button style={{ ...s.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('market')}>← Back</button>
        <div style={s.eyebrow}>Your mandate — {selectedCategory?.name}</div>
        <h2 style={s.h2}>Three questions.</h2>
        <p style={s.bodyP}>These determine which structuring considerations apply and how TGC approaches your brief.</p>

        <label style={s.label}>Direction</label>
        <select style={s.select} value={direction} onChange={e => setDirection(e.target.value)}>
          <option value="">Select…</option>
          {directionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label style={s.label}>Preferred channel</label>
        <select style={s.select} value={channel} onChange={e => setChannel(e.target.value)}>
          <option value="">Select…</option>
          {channelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label style={s.label}>Budget framing</label>
        <select style={s.select} value={budget} onChange={e => setBudget(e.target.value)}>
          <option value="">Select…</option>
          {budgetOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div style={{ marginTop: 32 }}>
          <button style={s.button} onClick={() => setScreen('structuring')} disabled={!direction || !budget}>
            See the structuring considerations →
          </button>
        </div>
      </div>
    )
  }

  const renderStructuring = () => {
    const materialFlags = activeFlags.filter(f => f.material)
    const practicalFlags = activeFlags.filter(f => !f.material)
    return (
      <div>
        <button style={{ ...s.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('direction')}>← Back</button>
        <div style={s.eyebrow}>Structuring — {selectedCategory?.name}</div>
        <h2 style={s.h2}>The questions most buyers never ask.</h2>
        <p style={s.bodyP}>
          These apply to your specific category and mandate direction. The ones marked material change the economics of the acquisition or sale in a way that is worth modelling before you proceed.
        </p>

        {materialFlags.length > 0 && (
          <>
            <div style={{ ...s.eyebrow, marginTop: 8, marginBottom: 16 }}>Material considerations</div>
            {materialFlags.map(flag => (
              <div key={flag.id} style={s.structuringCardMaterial}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: 17, color: '#1a1815', marginBottom: 8 }}>
                  {flag.title}
                </div>
                <p style={{ fontSize: 14, color: '#1a1815', lineHeight: 1.65, margin: 0 }}>{flag.explanation}</p>
                <div style={s.tgcNoteBox}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c8aa4a', marginBottom: 6 }}>TGC note</div>
                  <p style={{ fontSize: 13, margin: 0, lineHeight: 1.65 }}>{flag.tgcNote}</p>
                </div>
              </div>
            ))}
          </>
        )}

        {practicalFlags.length > 0 && (
          <>
            <div style={{ ...s.eyebrow, marginTop: 28, marginBottom: 16 }}>Practical considerations</div>
            {practicalFlags.map(flag => (
              <div key={flag.id} style={s.structuringCard}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: 17, color: '#1a1815', marginBottom: 8 }}>
                  {flag.title}
                </div>
                <p style={{ fontSize: 14, color: '#1a1815', lineHeight: 1.65, margin: 0 }}>{flag.explanation}</p>
                <div style={{ ...s.tgcNoteBox, background: '#F9F8F5', color: '#1a1815', marginTop: 10 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c8aa4a', marginBottom: 6 }}>TGC note</div>
                  <p style={{ fontSize: 13, margin: 0, lineHeight: 1.65 }}>{flag.tgcNote}</p>
                </div>
              </div>
            ))}
          </>
        )}

        <div style={{ background: '#F9F8F5', borderLeft: '3px solid #e5e7eb', padding: '16px 20px', marginTop: 24, borderRadius: 4 }}>
          <p style={{ fontSize: 14, color: '#1a1815', margin: 0, lineHeight: 1.65 }}>
            None of the above replaces specialist legal, tax, or financial advice — which TGC can introduce you to in France, the UK, or Switzerland. The purpose of this analysis is to ensure you ask the right questions before any transaction, not to answer them definitively.
          </p>
        </div>

        <div style={{ marginTop: 32 }}>
          <button style={s.button} onClick={() => setScreen('brief')}>Continue — your brief →</button>
        </div>
      </div>
    )
  }

  const renderBrief = () => {
    const timelineOptions = [
      { value: 'urgent', label: 'Within 4 weeks' },
      { value: 'near', label: '1–3 months' },
      { value: 'medium', label: '3–12 months' },
      { value: 'long', label: 'No fixed timeline — the right piece' },
    ]
    const confidentialityOptions = [
      { value: 'standard', label: 'Standard' },
      { value: 'discreet', label: 'Discreet — no public record of interest' },
      { value: 'ultra-private', label: 'Ultra-private — NDA before any approach' },
    ]
    return (
      <div>
        <button style={{ ...s.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('structuring')}>← Back</button>
        <div style={s.eyebrow}>Your brief — {selectedCategory?.name}</div>
        <h2 style={s.h2}>The specifics.</h2>
        <p style={s.bodyP}>The more we know, the more specific the Gatekeeper's response can be.</p>

        <label style={s.label}>Specific piece or general collecting interest</label>
        <textarea style={s.textarea} value={brief.specific}
          placeholder="e.g., a specific contemporary painter whose work I've been following; or: I'm building a collection of post-war French abstraction; or: looking for a F.P. Journe Chronomètre Bleu in under-18mm case"
          onChange={e => setBrief({ ...brief, specific: e.target.value })} />

        <label style={s.label}>Timeline</label>
        <select style={s.select} value={brief.timeline} onChange={e => setBrief({ ...brief, timeline: e.target.value })}>
          <option value="">Select…</option>
          {timelineOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label style={s.label}>Existing collection context (optional)</label>
        <textarea style={{ ...s.textarea, minHeight: 60 }} value={brief.existingCollection}
          placeholder="e.g., primarily contemporary, this would be a first Old Master; or: a working collection — pieces live with us, not in storage"
          onChange={e => setBrief({ ...brief, existingCollection: e.target.value })} />

        <label style={s.label}>Confidentiality</label>
        <select style={s.select} value={brief.confidentiality} onChange={e => setBrief({ ...brief, confidentiality: e.target.value })}>
          <option value="">Select…</option>
          {confidentialityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label style={s.label}>Anything else</label>
        <textarea style={{ ...s.textarea, minHeight: 60 }} value={brief.notes}
          placeholder="e.g., the acquisition would be in my holding company; or: I have an existing relationship with a dealer I'd like TGC to work alongside; or: this is a gift"
          onChange={e => setBrief({ ...brief, notes: e.target.value })} />

        <div style={{ marginTop: 32 }}>
          <button style={s.button} onClick={() => setScreen('client')} disabled={!brief.timeline || !brief.confidentiality}>
            Continue →
          </button>
        </div>
      </div>
    )
  }

  const renderClient = () => (
    <div>
      <button style={{ ...s.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('brief')}>← Back</button>
      <div style={s.eyebrow}>Your details</div>
      <h2 style={s.h2}>One last thing.</h2>
      <p style={s.bodyP}>
        Your brief will be reviewed by a Gatekeeper within 24 hours. For collecting categories where TGC has a direct network — contemporary art, horology, Occitanie wine, Monaco private collections — expect a more specific response.
      </p>

      <label style={s.label}>Name</label>
      <input type="text" style={s.input} value={client.name} onChange={e => setClient({ ...client, name: e.target.value })} />

      <label style={s.label}>Email</label>
      <input type="email" style={s.input} value={client.email} onChange={e => setClient({ ...client, email: e.target.value })} />

      <label style={s.label}>Phone (with country code)</label>
      <input type="tel" style={s.input} value={client.phone} placeholder="+33 6 XX XX XX XX" onChange={e => setClient({ ...client, phone: e.target.value })} />

      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 24, lineHeight: 1.6 }}>
        Your brief is seen only by the Gatekeeper handling your category. TGC does not share interest with any seller, gallery, or auction house before a mandate is agreed and confidentiality terms are in place.
      </p>

      <div style={{ marginTop: 32 }}>
        <button style={s.buttonGold} onClick={submitBrief} disabled={!client.name || !client.email}>
          Submit brief
        </button>
      </div>
    </div>
  )

  const renderConfirmation = () => (
    <div>
      <div style={s.eyebrow}>Brief received</div>
      <h2 style={s.h2}>Thank you, {client.name?.split(' ')[0]}.</h2>
      <p style={s.lead}>Your brief is with us.</p>

      <div style={{ ...s.card, background: '#F9F8F5', cursor: 'default' }}>
        <div style={s.eyebrow}>Reference</div>
        <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 15, color: '#0e4f51', letterSpacing: '0.05em', margin: '4px 0 16px' }}>{refId}</div>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          <strong style={{ color: '#1a1815' }}>{selectedCategory?.name}</strong>
          {direction && <> · {direction}</>}
          {budget && <> · {budget}</>}
        </div>
      </div>

      <h3 style={s.h3}>What happens next</h3>
      <ul style={s.list}>
        <li style={s.listItem}><span style={s.dash}>—</span><strong>Within 24 hours:</strong> the Gatekeeper for your category will respond with a specific view and next steps</li>
        <li style={s.listItem}><span style={s.dash}>—</span><strong>Where TGC has a direct network</strong> (contemporary art, horology, Burgundy and Occitanie wine, Monaco private collections): expect a more specific response with names and introductions</li>
        <li style={s.listItem}><span style={s.dash}>—</span><strong>Structuring:</strong> if any of the considerations we reviewed apply materially to your mandate, we will introduce the appropriate specialist before any transaction proceeds</li>
        <li style={s.listItem}><span style={s.dash}>—</span><strong>Confidentiality:</strong> your interest is not shared with any counterparty before you agree to proceed</li>
      </ul>

      <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a href={CALENDAR_URL} target="_blank" rel="noopener noreferrer"
          style={{ ...s.buttonGold, textDecoration: 'none', display: 'inline-block' }}>
          Book a call
        </a>
        <button style={s.buttonSecondary} onClick={resetAll}>Start another brief</button>
      </div>
    </div>
  )

  const renderScreen = () => {
    switch (screen) {
      case 'welcome': return renderWelcome()
      case 'category': return renderCategory()
      case 'market': return renderMarket()
      case 'direction': return renderDirection()
      case 'structuring': return renderStructuring()
      case 'brief': return renderBrief()
      case 'client': return renderClient()
      case 'confirmation': return renderConfirmation()
      default: return renderWelcome()
    }
  }

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Lato:ital,wght@0,300;0,400;0,700;1,400&display=swap');
        input:focus, select:focus, textarea:focus { outline: none; border-color: #0e4f51; }
        button:hover:not(:disabled) { opacity: 0.85; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%230e4f51' fill='none' stroke-width='1.5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
      `}</style>
      <div style={s.container}>
        {/* Suite Nav */}
        <div style={{ marginBottom: '1.75rem' }}>
          <a href="/intelligence" style={{ display: 'inline-block', color: '#6b7280', fontSize: '0.75rem', textDecoration: 'none', fontFamily: "'Lato', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            ← Intelligence Suite
          </a>
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
            {[
              { num: '01', label: 'Transport', href: '/intelligence/transport', active: false },
              { num: '02', label: 'Real Estate', href: '/intelligence/realestate', active: false },
              { num: '03', label: 'Wellness', href: '/intelligence/wellness', active: false },
              { num: '04', label: 'Events', href: '/intelligence/events-production', active: false },
              { num: '05', label: 'VIP', href: '/intelligence/vip-hospitality', active: false },
              { num: '06', label: 'Art', href: '/intelligence/art-collectables', active: true },
            ].map(t => (
              <a key={t.num} href={t.href} style={{ padding: '0.3rem 0.75rem', border: t.active ? 'none' : '1px solid #e5e7eb', background: t.active ? '#0e4f51' : 'transparent', color: t.active ? '#ffffff' : '#6b7280', fontSize: '0.7rem', fontFamily: "'Lato', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', borderRadius: '3px', textDecoration: 'none' }}>
                {t.num} {t.label}
              </a>
            ))}
          </div>
        </div>
        <div style={s.header}>
          <div>
            <div style={s.brand}>The Gatekeepers Club</div>
            <div style={s.brandSub}>Art & Collectables Intelligence · v1</div>
          </div>
        </div>
        {screen !== 'welcome' && screen !== 'confirmation' && (
          <div style={s.progress}>
            {Array.from({ length: screens.length }).map((_, i) => (
              <div key={i} style={i <= currentIdx ? s.progressDotActive : s.progressDot} />
            ))}
          </div>
        )}
        {renderScreen()}
        {loadedDraft && (
          <div style={s.draftNotice}>↻ Draft restored from previous session</div>
        )}
      </div>
    </div>
  )
}

export default function ArtCollectablesPage() {
  return <TGCArtCollectables />
}
