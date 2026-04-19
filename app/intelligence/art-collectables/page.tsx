/* eslint-disable react/no-unescaped-entities, react/jsx-no-comment-textnodes */
'use client'
export const dynamic = 'force-dynamic'
import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'tgc-art-v2-draft'
const CALENDAR_URL = 'https://calendar.app.google/aAsppu4Tju2my9ST7'

// ─── TYPES ───────────────────────────────────────────────────────────────────

type CollectorSituation = 'starting' | 'active' | 'structuring' | 'selling'
type CollectorDriver    = 'pleasure' | 'investment' | 'legacy' | 'maker' | 'open'
type GeographyFocus    = 'europe' | 'global' | 'open'
type VisionLiving      = 'living' | 'stored' | 'mixed' | 'institutional'
type VisionRisk        = 'established' | 'emerging' | 'mixed'
type VisionApproach    = 'depth' | 'breadth' | 'vision' | 'instinct'
type CategoryId        = 'contemporary' | 'masters-modern' | 'design-decorative' | 'horology' | 'jewellery-gemstones' | 'wine-spirits'
type StructuringFlagId = 'droit-de-suite' | 'import-vat' | 'freeport' | 'estate-planning' | 'provenance' | 'authentication' | 'storage' | 'insurance'
type CommissionDiscipline = 'art' | 'horology' | 'jewellery' | 'furniture-design' | 'ceramic-craft'
type PhilosophyId = 'patron-curator' | 'specialist-pioneer' | 'independent' | 'specialist-steward' | 'considered-curator' | 'structured-collector' | 'living-collector' | 'evolving-collector'

interface Category {
  id: CategoryId; number: string; name: string; tagline: string; editorial: string
  loud: string; quiet: string; marketDynamics: string[]; structuringFlags: StructuringFlagId[]
  tgcAngle: string; chroniclesNote?: string; situationWeight: Record<CollectorSituation, number>
}
interface StructuringFlag { id: StructuringFlagId; title: string; explanation: string; tgcNote: string; material: boolean }
interface Philosophy { id: PhilosophyId; name: string; headline: string; description: string; bullets: string[]; tgcAngle: string }
interface CommissionDisciplineData { id: CommissionDiscipline; name: string; description: string; examples: string[]; makers: string; timeline: string }

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: 'contemporary', number: '01', name: 'Contemporary Art',
    tagline: 'The primary market and the secondary market are different products.',
    editorial: 'Most buyers enter through galleries. Galleries represent artists, not collectors. The secondary market — auctions and private sales — is where real price discovery happens, and where structuring before acquisition is worth far more than structuring after. The ultra-contemporary market (born post-1980) is speculative; the ten-year resale data is thin. Institutional collecting is the one reliable long-term price signal. The collectors who have consistently made interesting acquisitions did so through direct studio relationships, not through the gallery system.',
    loud: "Art fair booth, gallery opening, Christie's evening sale, paddle number, buyer's premium of 26%, photograph with the work on Instagram.",
    quiet: "A direct approach to a studio or estate before the market arrives. Private treaty sale bypassing auction commission entirely. A relationship with the artist built over years, not a purchase made in an afternoon. A conversation started through the Concierge Chronicles before the work entered a gallery.",
    marketDynamics: [
      "Christie's and Sotheby's buyer's premium is now 26% on the first £700k — private treaty saves this entirely",
      "Gallery primary prices are set, not discovered — the waiting list exists because scarcity is managed, not because demand is unmet",
      "Ultra-contemporary work (born post-1980) lacks resale data beyond a single market cycle — treat as speculative, not investment grade",
      "Major institutional acquisition is the single best long-term price signal available publicly — it matters more than auction estimates",
      "The art fund model has broadly failed — art does not function reliably as a financial product",
      "Private treaty between collector and studio saves 26-35% of the transaction cost versus public auction",
    ],
    structuringFlags: ['droit-de-suite', 'import-vat', 'freeport', 'estate-planning', 'authentication'],
    tgcAngle: "TGC approaches contemporary collecting through makers and artists we know personally or through close introduction. The Concierge Chronicles has covered studios across France, Italy, and the UK — several before significant market recognition. Our European advisory network, built across Benelux, DACH, and France with collectors and curators who operate privately, gives access to private collections and private treaty opportunities that do not reach the public market.",
    chroniclesNote: "The Concierge Chronicles covers independent artists and makers as part of its core editorial. Past issues have profiled ceramicists, painters, and textile artists whose work now sells through major galleries. Collector introductions through the Chronicles are part of TGC's active offer.",
    situationWeight: { starting: 5, active: 4, structuring: 3, selling: 5 },
  },
  {
    id: 'masters-modern', number: '02', name: 'Modern & Old Masters',
    tagline: 'Provenance is the work. Attribution is the question.',
    editorial: "Old Masters is a market defined by scholarship and provenance gaps. The 1933-1945 period is not optional research — it is essential due diligence for any work with European provenance. Modern works (Impressionist to 1970) have a more established market, but attribution remains the central risk: \"workshop of,\" \"follower of,\" and \"attributed to\" can halve a value overnight. Works that have passed through museum loans carry both a premium and a more transparent provenance trail. Private European collections — particularly those in Benelux, Germany, and France — hold significant works that have not appeared on the public market for decades.",
    loud: "Christie's or Sotheby's evening sale, estimate in the catalogue, Art Loss Register certificate provided by the auction house, buyer's premium.",
    quiet: "A work from a private European collection, with an unbroken ownership chain and a catalogue raisonné reference. Independent scholar opinion rather than dealer certificate. Freeport delivery if the acquisition value supports it.",
    marketDynamics: [
      "The Art Loss Register holds over 500,000 entries — verification is non-negotiable before any Old Masters acquisition",
      "Restitution claims can emerge decades after acquisition — clean provenance from 1933 onward protects against this entirely",
      "Attribution disputes (\"workshop of,\" \"follower of\") can halve a hammer estimate — independent technical analysis before bidding is standard professional practice, rarely done by private buyers",
      "Works with documented exhibition history (catalogues, loans, museum records) command a 15-25% premium and are easier to resell",
      "The Impressionist and Modern market peaked in the mid-2000s; values are stable but the growth decade has passed for many names",
      "The most interesting private treaty opportunities in Old Masters sit in private European collections, not in the auction circuit",
    ],
    structuringFlags: ['provenance', 'import-vat', 'freeport', 'estate-planning', 'authentication'],
    tgcAngle: "TGC works with a small number of Old Masters specialists in France and London — dealers with access to private European collections that do not reach the auction market. Our European advisory network in Benelux and DACH includes collectors with significant holdings acquired privately over decades. For serious acquisitions, we commission independent provenance research and technical analysis before any approach to a seller.",
    situationWeight: { starting: 2, active: 4, structuring: 5, selling: 5 },
  },
  {
    id: 'design-decorative', number: '03', name: 'Design & Decorative Arts',
    tagline: 'The design object is not furniture. It is a proposition about how things should be made.',
    editorial: "20th century design has become one of the more serious collecting categories precisely because the market is still maturing. Prouvé, Perriand, and Paulin are now in major museum collections, but the wider design canon is still being written. Studio design — unique or limited-edition objects made by individual makers — occupies the territory between art and craft, and tends to be acquired by collectors who understand both markets. The critical distinction is between production pieces (valuable, often beautiful, but not unique) and unique or prototype works. The latter is where the most serious collecting happens and where long-term appreciation has been most consistent.",
    loud: "Buying at Phillips or Wright auction, tracking Prouvé prices as a market signal, following major Milanese galleries for limited-edition design, treating any known-edition design piece as a portfolio asset.",
    quiet: "A direct relationship with a contemporary studio — ceramicists, glass artists, furniture makers — before the gallery system arrives. Understanding which 20th century pieces are genuinely rare versus commonly assumed to be. A prototype or unique work rather than a named production piece.",
    marketDynamics: [
      "Jean Prouvé prototype and unique works have outperformed his production pieces by 4-6x — the unique matters more than the famous name",
      "Murano studio glass (Carlo Scarpa, Fulvio Bianconi, Barovier & Toso) is the most undervalued segment of 20th century Italian design at auction",
      "Charlotte Perriand is significantly underresearched relative to her importance — the market has not yet caught up with her place in the design canon",
      "Pierre Paulin's original coloured foam pieces in good condition are rarer than assumed — most surviving examples have been reupholstered, losing significant value",
      "Contemporary studio design (limited editions and unique pieces by living makers) operates closer to the art market than the furniture market — think studio, not showroom",
      "Galerie kreo's commissioning model for living designers has created secondary auction markets where none existed — early edition acquisition is worth modelling",
    ],
    structuringFlags: ['import-vat', 'authentication', 'estate-planning', 'insurance'],
    tgcAngle: "TGC's maker network overlaps significantly with the design world. Verrerie de Biot — our Alpes-Maritimes partner — represents the kind of independent studio practice that produces work with genuine collector interest before market recognition. The Concierge Chronicles has covered studio designers, ceramicists, and object-makers across France, Italy, and the UK. We facilitate direct studio introductions that do not require gallery intermediation.",
    chroniclesNote: "The Concierge Chronicles covers makers and studios as a core editorial thread — independent practitioners producing work of lasting quality before wider recognition. Design objects, ceramics, glass, and studio furniture have featured alongside art and horology.",
    situationWeight: { starting: 5, active: 4, structuring: 3, selling: 3 },
  },
  {
    id: 'horology', number: '04', name: 'Horology',
    tagline: 'The independent houses are building the watches the institutions will collect in thirty years.',
    editorial: "The watch market has bifurcated sharply. Grey market speculation in mainstream references — Rolex Daytona, Patek Nautilus, AP Royal Oak — peaked in 2022 and has corrected 30-40% from peak. The independent watchmakers — F.P. Journe, Philippe Dufour, De Bethune, Grönefeld, MB&F, Laurent Ferrier — have seen values increase through the same correction, because their buyers were never primarily speculators. Horology extends beyond the wristwatch: antique pocket watches, longcase clocks, marine chronometers, and early scientific instruments represent a largely separate collecting territory with different buyers, different auction channels, and different conservation requirements. The question is not which references are appreciating. It is which makers are doing the most interesting work, and whether you can access them before the broader market does.",
    loud: "Grey market premium tracking on Chrono24, Rolex AD waitlist, flipping references, watching auction results as a purchase guide, buying what the market is already discussing.",
    quiet: "A direct relationship with an independent atelier. A watch bought for what it represents technically and aesthetically, not for what it might be worth in two years. A commission from a manufacture that does not market heavily. An antique pocket watch from a private estate with every document intact.",
    marketDynamics: [
      "Grey market premiums on Daytona, Nautilus, and Royal Oak have compressed 30-40% from 2022 peak — the speculative cycle has turned",
      "F.P. Journe, Philippe Dufour, and De Bethune secondary values have increased through the same period — a meaningful divergence from the mainstream",
      "Full, documented service history roughly doubles the resale value of a complicated watch at auction",
      "Vintage Patek, Rolex, and AP with original dials, unpolished cases, and all original parts command 40-60% premium over restored equivalents",
      "The 'Manufacture' designation is a marketing claim that says nothing about finishing quality — several independent ateliers producing superior work have no manufacture claim",
      "Antique pocket watches and marine chronometers remain undervalued relative to their technical complexity and rarity — a largely separate market from modern wristwatches",
    ],
    structuringFlags: ['authentication', 'import-vat', 'estate-planning', 'insurance'],
    tgcAngle: "TGC's Concierge Chronicles has covered independent horology as a recurring editorial thread — not as a financial asset class but as one of the few remaining craft disciplines where a single person's hands produce a mechanical object of lasting significance. We have direct relationships with several independent ateliers and can facilitate introductions and commissions outside standard retail channels.",
    chroniclesNote: "Horology is a recurring thread in the Concierge Chronicles — the independent makers who produce at a rate of dozens of pieces per year rather than thousands. The atelier visit, the technical choices, the collector perspective. This is editorial territory, not advertising.",
    situationWeight: { starting: 5, active: 4, structuring: 3, selling: 4 },
  },
  {
    id: 'jewellery-gemstones', number: '05', name: 'Jewellery & Gemstones',
    tagline: 'Signed is a different market to unsigned. Both can be excellent. They are not the same acquisition.',
    editorial: "Signed jewellery — Cartier, Van Cleef & Arpels, JAR, Suzanne Belperron — trades on the house's reputation as much as the object's quality. Unsigned jewellery of equivalent or superior quality frequently trades at a fraction of the signed equivalent, making it the better acquisition if personal enjoyment rather than resale is the primary goal. Coloured stones with origin certificates from major gemological laboratories (Gübelin, SSEF, GIA) are a categorically different market from uncertified stones: the certificate is not optional for significant acquisitions. Kashmir sapphires, Burmese rubies, and Colombian emeralds with major laboratory origin documentation have consistently outperformed the broader gem market.",
    loud: "Christie's or Sotheby's Magnificent Jewels evening sale, signed Cartier for the name, buyer's premium, insured at replacement value rather than agreed value, a stone purchased without laboratory certification.",
    quiet: "A coloured stone of exceptional quality with a Gübelin or SSEF origin certificate, from a private estate, with complete documentation. Or a signed piece bought from the original owner's family, below auction estimate, because the provenance is quiet rather than marketed.",
    marketDynamics: [
      "JAR (Joel Arthur Rosenthal) is the most institutionally respected contemporary jeweller — a secondary market has formed and values have increased consistently",
      "Certified Kashmir sapphires trade at 3-5x equivalent stones without origin documentation — the Gübelin or SSEF certificate is not optional for serious acquisitions",
      "The signed versus unsigned premium at auction for equivalent quality work can be 3-5x — unsigned is not inferior, it is a different market with a different buyer",
      "Art Deco signed pieces (Cartier, Boucheron, Van Cleef with original box and papers) are the most liquid segment of historic signed jewellery",
      "Gem investment as a concept is speculative — the margin between wholesale and retail is wide and liquidity outside auction is limited",
      "Fabergé and Russian Imperial objects have specific provenance considerations (post-1917 export documentation) that affect major auction house eligibility",
    ],
    structuringFlags: ['import-vat', 'estate-planning', 'insurance', 'authentication', 'provenance'],
    tgcAngle: "TGC's maker network includes several contemporary jewellers producing signed work of significant quality before broader market recognition. For significant gemstone acquisitions, we commission independent assessment from Gübelin or SSEF rather than relying on dealer-provided certificates. We can facilitate private introductions to specialist dealers in France and London who operate outside the public auction circuit.",
    chroniclesNote: "The Concierge Chronicles covers jewellers and object-makers as part of its maker editorial. Several past subjects have had no commercial profile at the time of coverage — the access comes from direct relationship, not marketing.",
    situationWeight: { starting: 3, active: 4, structuring: 5, selling: 5 },
  },
  {
    id: 'wine-spirits', number: '06', name: 'Wine & Fine Spirits',
    tagline: 'En primeur is a financial product. Physical is a pleasure product. Know which you are buying.',
    editorial: "The fine wine market has polarised. Bordeaux en primeur benefits négociants and châteaux — the secondary market return for collectors outside the First Growths is inconsistent, and the capital is tied up for 2-3 years at release prices that are not always discounted from eventual physical value. Burgundy — Romanée-Conti, Rousseau, Leroy, Mugnier — has outperformed Bordeaux consistently since 2015. Japanese whisky, vintage Armagnac, and aged Cognac have outperformed both wine categories on the collectables market in the past decade. Physical wine with full provenance documentation is both a pleasure asset and a collectable. Know which you are buying.",
    loud: "Bordeaux futures at primeur release, a wine investment fund, UK bonded warehouse with no documentation, selling through auction house at buyer's premium.",
    quiet: "Physical cases purchased ex-château or from a private estate with a complete provenance chain. A bonded warehouse with proper ownership documentation. A direct network to serious buyers — restaurants, private collectors, specialist merchants — as an exit rather than auction house commission.",
    marketDynamics: [
      "Burgundy has outperformed Bordeaux consistently since 2015 — the Côte de Nuits allocation system is the real access question",
      "Provenance chain is everything for resale: every transfer must be documented; a gap significantly reduces the hammer price",
      "UK bonded warehouse and French entrepôt douanier both defer VAT — understanding which structure you are using matters at extraction",
      "Japanese whisky (Karuizawa, Yamazaki limited releases) has been the strongest performing spirits category — largely sold out at primary market",
      "Vintage Armagnac and aged Cognac represent undervalued long-aged spirits with strong private collector demand",
      "The WineBid / Acker / Zachys auction market charges meaningful buyer's premiums — a private buyer network consistently outperforms on net proceeds",
    ],
    structuringFlags: ['storage', 'import-vat', 'estate-planning', 'provenance'],
    tgcAngle: "TGC has direct relationships with several Burgundy domaines and can facilitate allocations that do not reach the open market. Our Occitanie network includes natural wine producers of collector interest — small-production, no-compromise domaines that are not yet at auction prices. Amélie Rigo's connections across the south of France give access to private cellars and estate sales not visible through conventional channels.",
    situationWeight: { starting: 4, active: 4, structuring: 4, selling: 4 },
  },
]

// ─── STRUCTURING FLAGS ───────────────────────────────────────────────────────

const STRUCTURING_FLAGS: Record<StructuringFlagId, StructuringFlag> = {
  'droit-de-suite': {
    id: 'droit-de-suite', material: true,
    title: "Artist's Resale Right (Droit de suite)",
    explanation: "EU law requires a royalty of approximately 3% (on a sliding scale) paid to the artist or their estate on any resale of original art above €750 through a gallery or auction house in the EU. Applies for 70 years after the artist's death. This is charged to the seller, not the buyer — but it affects your eventual net proceeds when you sell.",
    tgcNote: "On private sales arranged by TGC where we act as an art market professional, droit de suite still applies. We factor this into the seller's net proceeds calculation from the outset. For acquisitions, it does not affect your purchase price — but it reduces your exit proceeds by 3-4% and should be modelled in.",
  },
  'import-vat': {
    id: 'import-vat', material: true,
    title: 'Import VAT and reduced rates',
    explanation: "Original works of art qualify for reduced VAT rates: France 5.5%, UK 5%. Antiques over 100 years old also qualify at reduced rates. Decorative arts, design objects, and most furniture do not — they are taxed at the standard rate (France 20%, UK 20%). The classification at import determines this, and it is frequently applied incorrectly when buyers import privately.",
    tgcNote: "Most buyers importing through dealers or auction houses never see this as a separate line item — it is built into the price. But importing privately (from a private seller, from a freeport, or from outside the EU) requires correct classification. Freeport storage defers the VAT trigger entirely for as long as the work remains in freeport.",
  },
  'freeport': {
    id: 'freeport', material: true,
    title: 'Freeport storage and deferred VAT',
    explanation: "Geneva, Luxembourg, Singapore, and Delaware operate bonded freeport warehouses where works can be stored, bought, and sold without triggering import VAT. A work can be lent to exhibitions from freeport without formal import. VAT is only triggered when the work finally enters a taxable territory for use. The Geneva Freeport holds more art than most major public museums.",
    tgcNote: "Freeport makes economic sense above roughly €200k in value where the VAT saving (5.5-20% depending on jurisdiction and category) materially exceeds storage costs (typically 0.15-0.25% per annum). A work held in freeport indefinitely never triggers VAT. Buyers acquiring in Switzerland or selling internationally should model this before deciding on delivery terms.",
  },
  'estate-planning': {
    id: 'estate-planning', material: true,
    title: 'Estate planning and succession',
    explanation: "Art and collectables are included in taxable estates in most jurisdictions. In France, droits de succession reach 45% for non-direct heirs. UK IHT is 40% above the nil-rate band. Gifts inter vivos with applicable abatements, donation to approved foundations, or the dation en paiement mechanism in France (paying a tax debt with a work of cultural significance) can reduce this materially — but only if planned proactively.",
    tgcNote: "The dation en paiement is one of the most underused mechanisms in French estate planning: the state accepts works of significant cultural value in lieu of inheritance tax at an agreed valuation. This requires advance negotiation with the Ministry of Culture and cannot be arranged retrospectively. TGC can introduce specialist advisers in France and the UK. This is a conversation to have now, not in a will.",
  },
  'provenance': {
    id: 'provenance', material: true,
    title: 'Provenance research',
    explanation: "Provenance documents the full ownership history of a work. For Old Masters, the critical gap is 1933-1945: any European work with a gap in this period requires research through the Art Loss Register, German Lostart database, and French Commission for Indemnification of Victims of Spoliation. For wine, every ownership transfer must be documented.",
    tgcNote: "A clean, documented provenance chain adds 20-30% to auction estimates and is the difference between a work you can sell and one you cannot. A gap — even one explained by a private collection — creates uncertainty that depresses value and may prevent major auction house consignment. TGC requires provenance research as standard on any acquisition above €50k.",
  },
  'authentication': {
    id: 'authentication', material: true,
    title: 'Authentication and attribution risk',
    explanation: "For contemporary art, authentication typically requires foundation or catalogue raisonné committee confirmation. For watches, it means original parts, unpolished case, and dial authenticity. For design objects, it means distinguishing originals from later editions and copies. For jewellery, independent gemological laboratory certification. A rejected authentication or a corrected attribution destroys value — not depresses it. Destroys it.",
    tgcNote: "Technical analysis costs less than 1% of acquisition value and protects against catastrophic loss. TGC commissions independent authentication as standard on acquisitions above €25k. We will not proceed without it.",
  },
  'storage': {
    id: 'storage', material: false,
    title: 'Storage, conservation, and running costs',
    explanation: "Storage costs are material for wine (bonded warehouse: approximately £15-25 per case per year) and significant art (climate-controlled commercial storage: 0.15-0.25% of value per year). Conservation for works on paper, textiles, and ceramic is ongoing, not a one-time cost. Design objects and studio pieces may require specific environmental conditions.",
    tgcNote: "Most buyers underestimate total cost of ownership. Model the carrying cost — storage, conservation, insurance — before any acquisition above €100k. A collection that does not move still costs 1-3% of value per year to hold correctly.",
  },
  'insurance': {
    id: 'insurance', material: false,
    title: 'Specialist insurance and agreed value',
    explanation: "Standard home contents insurance is typically insufficient for collectables above £50k. Specialist art and collectables insurance (Hiscox, Chubb, Axa Art) provides agreed value coverage — meaning a specific insured value rather than a disputed market assessment — with worldwide transit, exhibition loan, and restoration cover.",
    tgcNote: "Agreed value insurance is the critical point: in the event of a claim, you receive the insured value, not what the insurer's assessor thinks the market would pay. Revaluation should happen every 3-5 years for significant pieces as market values move. TGC can introduce specialist brokers in France and the UK who understand the collecting categories.",
  },
}

// ─── VISION PHILOSOPHIES ─────────────────────────────────────────────────────

const PHILOSOPHIES: Record<PhilosophyId, Philosophy> = {
  'patron-curator': {
    id: 'patron-curator', name: 'The Patron',
    headline: 'You collect in order to support something, not just to acquire it.',
    description: "The most interesting collecting of the last thirty years happened before the market arrived — in studios, at small exhibitions, through personal introductions. The Patron is a participant in what is being made, not just a buyer of what has already been recognised.",
    bullets: [
      "Studio relationships before gallery representation — the point is to be there early, not first",
      "Direct commissions from makers whose work you believe in, on their terms and your timeline",
      "The Concierge Chronicles as a discovery engine — editorial coverage of makers before market recognition",
      "Private treaty and direct acquisition preferred; auction rooms are a last resort, not an aspiration",
    ],
    tgcAngle: "This is where TGC's network is most active. The Concierge Chronicles has covered studios across France, Italy, the UK, and Japan — several before significant gallery representation. Our European advisory network, built across Benelux, DACH, and France with collectors and curators who operate privately, gives access to studio introductions, private treaty opportunities, and commission facilitation that do not reach the public market.",
  },
  'specialist-pioneer': {
    id: 'specialist-pioneer', name: 'The Pioneer',
    headline: 'Deep expertise in one category, moving before the broader market.',
    description: "In horology, in contemporary ceramics, in 20th century design — the collectors who knew the material before the market caught up have historically made the best acquisitions. Pioneer collecting requires real knowledge, not just access.",
    bullets: [
      "Category expertise that outpaces the dealer network — knowing what is rare before it is valued",
      "Direct relationships with specialists who operate outside the primary auction circuit",
      "A focus on provenance, condition, and authenticity that protects value even when the market corrects",
      "Early is not the same as speculative — conviction, not trend-following",
    ],
    tgcAngle: "TGC's category depth in horology and contemporary design gives us a specific advantage for pioneer collectors. Several makers covered in the Concierge Chronicles are now represented by galleries with waiting lists; the collector introductions happened before that. Our independent specialists in France and London are outside the primary auction houses, which is where the most interesting work tends to sit.",
  },
  'independent': {
    id: 'independent', name: 'The Independent',
    headline: 'You follow conviction, not consensus.',
    description: "The most interesting private collections have rarely been built to a strategy. They follow a sustained personal response to objects — a point of view that develops over time into something coherent, even when it was never planned that way.",
    bullets: [
      "Acquisition driven by sustained personal response, not market brief",
      "A willingness to depart from category — the interesting collection is rarely confined to a single field",
      "Private treaty and direct estate acquisition: no public bidding, no audience",
      "The long view: hold until it is clearly right to sell, not on a market cycle",
    ],
    tgcAngle: "The best briefs we receive are the most open. TGC's network — across contemporary art, design, horology, and the maker world — gives us the range to follow a collector whose interest does not conform to categories. We can introduce across disciplines, which is where the most interesting work tends to happen.",
  },
  'specialist-steward': {
    id: 'specialist-steward', name: 'The Steward',
    headline: 'Collecting at the highest level in one category is a discipline, not a pastime.',
    description: "The Steward collects with depth of scholarship and seriousness of stewardship. The acquisition is the beginning, not the end: provenance, authentication, conservation, structuring, and eventual estate planning are the real substance of high-level category collecting.",
    bullets: [
      "Authentication and independent technical analysis before any significant acquisition",
      "Provenance documentation as non-negotiable — a clean chain from acquisition to estate",
      "Freeport and structuring decisions made before the acquisition, not after the wire",
      "A long relationship with one or two specialist advisers who know the collection and its history",
    ],
    tgcAngle: "TGC commissions independent authentication and provenance research as standard on acquisitions above €25k. Our structuring introductions in France and the UK — lawyers, notaires, and specialist advisers — work with collectors who treat their collections with the same rigour as any other significant asset. The dation en paiement in France, and specialist IHT structuring in the UK, are conversations TGC facilitates before they are needed.",
  },
  'considered-curator': {
    id: 'considered-curator', name: 'The Curator',
    headline: 'A collection with a coherent point of view is a different thing from an assemblage of acquisitions.',
    description: "The Curator tests every acquisition against the whole. The collection has an internal logic — a period, a medium, a geography, an aesthetic argument — and each new piece must earn its place. This kind of discipline produces the collections that eventually matter.",
    bullets: [
      "Every acquisition tested against the existing collection before the approach",
      "A preference for established and institutionally-recognised work where the scholarship is settled",
      "A willingness to wait for the right piece, which may take years",
      "Active engagement with the institutions that contextualise and validate the collecting territory",
    ],
    tgcAngle: "TGC's European advisory network — collectors and curators across Benelux, DACH, and France who operate quietly within the private treaty market — is particularly relevant for Curators seeking works from private European collections. We have access to works that have not been on the public market for decades and are unlikely to reach auction.",
  },
  'structured-collector': {
    id: 'structured-collector', name: 'The Portfolio Collector',
    headline: 'A collection is also a set of assets. It deserves the same rigour.',
    description: "The Portfolio Collector approaches collecting with the discipline of asset management: diversified across categories, properly structured, estate-planned, and stored with the economics modelled. The aesthetic experience is real, but so is the carrying cost.",
    bullets: [
      "Diversification across categories to reduce single-market risk",
      "Freeport and deferred VAT structures for held assets above €200k",
      "Estate planning and dation en paiement (France) or specialist IHT structuring (UK) established proactively",
      "Agreed-value specialist insurance reviewed every 3-5 years as markets move",
    ],
    tgcAngle: "The Portfolio Collector needs the full stack: TGC introduces specialist tax lawyers in France and the UK, independent authentication for significant acquisitions, freeport operators in Geneva and Luxembourg, and specialist insurance brokers who understand the collecting categories. We also model the carrying cost before any acquisition above €100k.",
  },
  'living-collector': {
    id: 'living-collector', name: 'The Living Collection',
    headline: 'A collection that earns its place by being present.',
    description: "The Living Collector builds a working collection — pieces that are displayed, lived with, and regularly encountered. The acquisition is tested against the daily experience of living with it, not against an abstract market brief.",
    bullets: [
      "Acquisitions tested against the spaces they will inhabit before they are made",
      "A mix of categories that produces an environment, not just a collection",
      "Conservation and condition prioritised — the piece must hold up to daily life",
      "Direct studio relationships for contemporary and design acquisitions",
    ],
    tgcAngle: "TGC's maker network — contemporary artists, studio designers, independent horologists — is particularly relevant for the Living Collector. These are acquisitions made in direct relationship with the people producing them, in studios and ateliers rather than galleries and auction rooms. Several subjects of the Concierge Chronicles have become long-term collaborators with collectors who found them through the editorial.",
  },
  'evolving-collector': {
    id: 'evolving-collector', name: 'The Evolving Collection',
    headline: 'No fixed strategy yet — which is its own starting point.',
    description: "The most interesting collections rarely started with a plan. The category emerges from sustained attention, the approach develops from accumulated experience. The first good acquisition teaches you more about collecting than any market briefing.",
    bullets: [
      "Begin with a category where you have genuine existing knowledge or sustained curiosity",
      "The first acquisition should be something you would keep for twenty years regardless of market value",
      "Resist the investment frame early — it narrows the field and often produces the wrong acquisitions",
      "A Gatekeeper introduction can help clarify which category is most naturally yours before committing capital",
    ],
    tgcAngle: "TGC works well with collectors at an early or evolving stage precisely because we are not category-committed. Our range — across contemporary art, design, horology, wine, and the maker world — allows us to follow a collector's interest wherever it leads, rather than channelling it into a managed product.",
  },
}

// ─── COMMISSION DISCIPLINES ──────────────────────────────────────────────────

const COMMISSION_DISCIPLINES: CommissionDisciplineData[] = [
  {
    id: 'art', name: 'Art — Painting, Drawing or Sculpture',
    description: "A direct commission from a living artist. A specific work — scale, medium, subject — or an open brief where the artist works within broad parameters you set together.",
    examples: ["A large-format painting for a specific architectural space", "A series of drawings related to a personal subject", "A sculpture for an outdoor or interior setting"],
    makers: "TGC works with painters, draughtsmen, ceramic sculptors, and mixed-media artists across France, Italy, and the UK — several introduced through the Concierge Chronicles before wider gallery representation.",
    timeline: "3 to 18 months depending on the maker's schedule and the work's complexity.",
  },
  {
    id: 'horology', name: 'Horology — Watch or Clock',
    description: "A commission from an independent watchmaker or atelier. A specific movement specification, a personal dial design, a bespoke case — or a completely open brief.",
    examples: ["A bespoke dial on an existing movement from an independent atelier", "A unique wristwatch from a maker with a commission slot", "A specific clock or mantel piece from a horological workshop"],
    makers: "TGC has relationships with several independent ateliers — some with commissions available, some by introduction only. Not all advertise commission availability publicly.",
    timeline: "12 to 36 months. Independent watchmakers work to their own timelines.",
  },
  {
    id: 'jewellery', name: 'Jewellery — Bespoke Design',
    description: "A direct commission from a jeweller. A specific stone sourced and set, a design developed from an existing piece, or a completely new brief from sketch.",
    examples: ["A coloured stone sourced with laboratory certificate, then set", "A wearable piece developed from a sketch or reference", "A piece that bridges jewellery and object — brooch, clasp, or sculptural ring"],
    makers: "TGC works with contemporary jewellers whose practice sits between commercial and fine art jewellery — several featured in or introduced through the Concierge Chronicles.",
    timeline: "2 to 12 months depending on stone sourcing and design complexity.",
  },
  {
    id: 'furniture-design', name: 'Furniture & Studio Design',
    description: "A unique or limited piece from a studio designer. Furniture, lighting, or a distinct object — produced in direct relationship with the maker.",
    examples: ["A dining table in a specific material and dimension from a studio designer", "A lighting piece designed for a specific architectural condition", "A Murano glass object commissioned directly from a glassmaker"],
    makers: "TGC's maker network includes studio designers and craftspeople across France (including Verrerie de Biot in the Alpes-Maritimes), Italy, and the UK. Some commissions are available without gallery intermediation.",
    timeline: "2 to 9 months depending on material and workshop schedule.",
  },
  {
    id: 'ceramic-craft', name: 'Ceramic, Glass & Craft',
    description: "A commission from a ceramicist, glassmaker, weaver, or craftsperson. A specific piece or a small series, made by hand.",
    examples: ["A set of pieces from a ceramicist working in a specific tradition", "A woven piece from a textile studio with particular materials or colours", "A studio glass piece, blown or cast, in direct relationship with the maker"],
    makers: "The Concierge Chronicles has covered ceramicists, weavers, and studio craftspeople across France, Italy, Japan, and the UK. Several introductions have led to commissions and ongoing collector relationships.",
    timeline: "1 to 6 months. Most craft commissions move faster than fine art or horology.",
  },
]

// ─── LOGIC ───────────────────────────────────────────────────────────────────

function rankCategories(situation: CollectorSituation, driver: CollectorDriver): Category[] {
  const scored = CATEGORIES.map(cat => {
    let score = cat.situationWeight[situation]
    if (driver === 'investment' && (cat.id === 'wine-spirits' || cat.id === 'horology')) score += 1
    if (driver === 'maker' && (cat.id === 'contemporary' || cat.id === 'design-decorative')) score += 2
    if (driver === 'legacy' && (cat.id === 'masters-modern' || cat.id === 'jewellery-gemstones')) score += 2
    if (driver === 'pleasure' && cat.id === 'design-decorative') score += 1
    return { cat, score }
  })
  return scored.sort((a, b) => b.score - a.score).map(x => x.cat)
}

function getPhilosophyId(living: VisionLiving, risk: VisionRisk, approach: VisionApproach): PhilosophyId {
  if (risk === 'emerging') {
    if (approach === 'vision' || approach === 'breadth') return 'patron-curator'
    if (approach === 'depth') return 'specialist-pioneer'
    return 'independent'
  }
  if (risk === 'established') {
    if (approach === 'depth') return 'specialist-steward'
    if (approach === 'vision') return 'considered-curator'
    if (approach === 'breadth') return 'structured-collector'
    return 'considered-curator'
  }
  // mixed
  if (living === 'living' || living === 'mixed') return 'living-collector'
  if (living === 'institutional') return 'considered-curator'
  return 'evolving-collector'
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const S = {
  root: { minHeight: '100vh', background: '#F9F8F5', color: '#1a1815', fontFamily: "'Lato', sans-serif", padding: '40px 20px', lineHeight: 1.6 } as React.CSSProperties,
  container: { maxWidth: 920, margin: '0 auto' } as React.CSSProperties,
  brand: { fontFamily: "'Poppins', sans-serif", fontSize: 26, fontWeight: 400, letterSpacing: '0.02em', color: '#0e4f51' } as React.CSSProperties,
  brandSub: { fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#c8aa4a', marginTop: 4 },
  eyebrow: { fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#c8aa4a', marginBottom: 12 },
  h1: { fontFamily: "'Poppins', sans-serif", fontSize: 46, fontWeight: 400, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.01em' } as React.CSSProperties,
  h2: { fontFamily: "'Poppins', sans-serif", fontSize: 32, fontWeight: 400, lineHeight: 1.2, marginBottom: 12 } as React.CSSProperties,
  h3: { fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 400, lineHeight: 1.3, marginTop: 28, marginBottom: 10 } as React.CSSProperties,
  lead: { fontFamily: "'Poppins', sans-serif", fontSize: 20, lineHeight: 1.55, color: '#6b7280', marginBottom: 28, fontWeight: 300 } as React.CSSProperties,
  body: { fontSize: 16, marginBottom: 16, color: '#1a1815', lineHeight: 1.65 } as React.CSSProperties,
  card: { background: '#F9F8F5', border: '1px solid #e5e7eb', padding: 24, marginBottom: 12, cursor: 'pointer', transition: 'all 0.2s', borderRadius: 8 } as React.CSSProperties,
  cardSelected: { borderColor: '#0e4f51', boxShadow: '0 2px 8px rgba(14,79,81,0.08)' } as React.CSSProperties,
  cardTitle: { fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 400, marginBottom: 4, color: '#1a1815' } as React.CSSProperties,
  cardDesc: { fontSize: 13, color: '#6b7280', lineHeight: 1.55 } as React.CSSProperties,
  btn: { background: '#0e4f51', color: '#fff', border: 'none', padding: '14px 28px', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', borderRadius: 8 } as React.CSSProperties,
  btnSecondary: { background: 'transparent', color: '#1a1815', border: '1px solid #e5e7eb', padding: '14px 28px', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 8 } as React.CSSProperties,
  btnGold: { background: '#c8aa4a', color: '#fff', border: 'none', padding: '16px 32px', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 8 } as React.CSSProperties,
  input: { width: '100%', padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', background: '#F9F8F5', border: '1px solid #e5e7eb', color: '#1a1815', boxSizing: 'border-box' as const } as React.CSSProperties,
  textarea: { width: '100%', padding: '14px', fontSize: 15, fontFamily: 'inherit', background: '#F9F8F5', border: '1px solid #e5e7eb', color: '#1a1815', boxSizing: 'border-box' as const, resize: 'vertical' as const, minHeight: 80, lineHeight: 1.55 } as React.CSSProperties,
  select: { width: '100%', padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', background: '#F9F8F5', border: '1px solid #e5e7eb', color: '#1a1815', boxSizing: 'border-box' as const } as React.CSSProperties,
  label: { display: 'block', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: '#0e4f51', marginBottom: 6, marginTop: 16 } as React.CSSProperties,
  list: { paddingLeft: 0, listStyle: 'none' } as React.CSSProperties,
  listItem: { padding: '6px 0 6px 20px', position: 'relative' as const, fontSize: 14, color: '#1a1815', lineHeight: 1.6 } as React.CSSProperties,
  dash: { color: '#c8aa4a', position: 'absolute' as const, left: 0 },
  tgcBox: { background: '#0e4f51', color: '#fff', padding: '24px 28px', marginTop: 24, marginBottom: 8, borderRadius: 8 } as React.CSSProperties,
  tgcNote: { background: '#0e4f51', color: '#fff', padding: '16px 20px', marginTop: 10, fontSize: 13, lineHeight: 1.65, borderRadius: 4 } as React.CSSProperties,
  structCard: { padding: '20px 24px', marginBottom: 12, borderLeft: '3px solid #0e4f51', background: '#F9F8F5', borderRadius: 8 } as React.CSSProperties,
  structCardMinor: { padding: '20px 24px', marginBottom: 12, borderLeft: '3px solid #e5e7eb', background: '#F9F8F5', borderRadius: 8 } as React.CSSProperties,
  chroniclesBox: { background: 'transparent', border: '1px solid #e5e7eb', padding: '16px 20px', marginTop: 24, marginBottom: 8, borderRadius: 8 } as React.CSSProperties,
  primaryQuote: { fontFamily: "'Poppins', sans-serif", fontWeight: 300, fontSize: 22, lineHeight: 1.45, color: '#1a1815', padding: '28px 36px', background: '#F9F8F5', borderLeft: '3px solid #c8aa4a', marginBottom: 32 } as React.CSSProperties,
  philosophyCard: { background: '#F9F8F5', border: '2px solid #0e4f51', padding: '32px', borderRadius: 8, marginBottom: 24 } as React.CSSProperties,
  progress: { display: 'flex', gap: 4, marginBottom: 36 } as React.CSSProperties,
  progressDot: { height: 2, flex: 1, background: '#e5e7eb' } as React.CSSProperties,
  progressDotActive: { height: 2, flex: 1, background: '#0e4f51' } as React.CSSProperties,
  draftNotice: { position: 'fixed' as const, bottom: 20, right: 20, background: '#0e4f51', color: '#fff', padding: '12px 20px', fontSize: 12, letterSpacing: '0.1em', zIndex: 100 } as React.CSSProperties,
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 } as React.CSSProperties,
  radioCard: { border: '1px solid #e5e7eb', padding: '16px 20px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' } as React.CSSProperties,
  radioCardSelected: { borderColor: '#0e4f51', background: 'rgba(14,79,81,0.04)' } as React.CSSProperties,
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

function TGCArtCollectables() {
  const [screen, setScreen] = useState('welcome')

  // Profile
  const [situation, setSituation] = useState<CollectorSituation | ''>('')
  const [driver, setDriver]       = useState<CollectorDriver | ''>('')
  const [geography, setGeography] = useState<GeographyFocus | ''>('')

  // Category
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  // Vision
  const [visionLiving,   setVisionLiving]   = useState<VisionLiving | ''>('')
  const [visionRisk,     setVisionRisk]     = useState<VisionRisk | ''>('')
  const [visionApproach, setVisionApproach] = useState<VisionApproach | ''>('')

  // Brief
  const [direction, setDirection] = useState('')
  const [budget, setBudget]       = useState('')
  const [brief, setBrief]         = useState({ specific: '', timeline: '', existingCollection: '', confidentiality: '', notes: '' })

  // Commission flow
  const [commissionDiscipline, setCommissionDiscipline] = useState<CommissionDiscipline | ''>('')
  const [commissionBrief, setCommissionBrief] = useState({ concept: '', budget: '', purpose: '', timeline: '', existingMaker: '', notes: '' })

  // Client
  const [client, setClient]       = useState({ name: '', email: '', phone: '' })
  const [refId, setRefId]         = useState<string | null>(null)
  const [loadedDraft, setLoadedDraft] = useState(false)

  // Derived
  const rankedCategories = situation && driver ? rankCategories(situation as CollectorSituation, driver as CollectorDriver) : CATEGORIES
  const philosophy = visionLiving && visionRisk && visionApproach
    ? PHILOSOPHIES[getPhilosophyId(visionLiving as VisionLiving, visionRisk as VisionRisk, visionApproach as VisionApproach)]
    : null
  const activeFlags = selectedCategory
    ? selectedCategory.structuringFlags.map(id => STRUCTURING_FLAGS[id])
    : []

  const MAIN_SCREENS = ['profile', 'category', 'market', 'vision', 'vision-result', 'structuring', 'brief', 'client']
  const COMMISSION_SCREENS = ['commission-type', 'commission-brief', 'commission-overview', 'commission-client']
  const isCommissionFlow = COMMISSION_SCREENS.includes(screen)
  const progressScreens = isCommissionFlow ? COMMISSION_SCREENS : MAIN_SCREENS
  const progressIdx = progressScreens.indexOf(screen)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const d = JSON.parse(saved)
        if (d.situation) setSituation(d.situation)
        if (d.driver) setDriver(d.driver)
        if (d.geography) setGeography(d.geography)
        if (d.categoryId) { const c = CATEGORIES.find(x => x.id === d.categoryId); if (c) setSelectedCategory(c) }
        if (d.visionLiving) setVisionLiving(d.visionLiving)
        if (d.visionRisk) setVisionRisk(d.visionRisk)
        if (d.visionApproach) setVisionApproach(d.visionApproach)
        if (d.direction) setDirection(d.direction)
        if (d.budget) setBudget(d.budget)
        if (d.brief) setBrief(d.brief)
        if (d.client) setClient(d.client)
        setLoadedDraft(true)
        setTimeout(() => setLoadedDraft(false), 4000)
      }
    } catch { /* first run */ }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        situation, driver, geography, categoryId: selectedCategory?.id,
        visionLiving, visionRisk, visionApproach, direction, budget, brief, client,
      }))
    } catch { /* unavailable */ }
  }, [situation, driver, geography, selectedCategory, visionLiving, visionRisk, visionApproach, direction, budget, brief, client])

  const resetAll = () => {
    setScreen('welcome'); setSituation(''); setDriver(''); setGeography(''); setSelectedCategory(null)
    setVisionLiving(''); setVisionRisk(''); setVisionApproach(''); setDirection(''); setBudget('')
    setBrief({ specific: '', timeline: '', existingCollection: '', confidentiality: '', notes: '' })
    setCommissionDiscipline(''); setCommissionBrief({ concept: '', budget: '', purpose: '', timeline: '', existingMaker: '', notes: '' })
    setClient({ name: '', email: '', phone: '' }); setRefId(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  const submitBrief = async (type: string, payload: object) => {
    const id = `TGC-AC-${Date.now().toString(36).toUpperCase()}`
    setRefId(id)
    try {
      await fetch('/api/intelligence/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, refId: id, submittedAt: new Date().toISOString(), ...payload }),
      })
    } catch { /* offline */ }
  }

  // ── SUITE NAV ─────────────────────────────────────────────────────────────
  const suiteNav = (
    <div style={{ marginBottom: '1.75rem' }}>
      <a href="/intelligence" style={{ display: 'inline-block', color: '#6b7280', fontSize: '0.75rem', textDecoration: 'none', fontFamily: "'Lato', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
        ← Intelligence Suite
      </a>
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
        {[
          { num: '01', label: 'Transport',   href: '/intelligence/transport',        active: false },
          { num: '02', label: 'Real Estate', href: '/intelligence/realestate',       active: false },
          { num: '03', label: 'Wellness',    href: '/intelligence/wellness',         active: false },
          { num: '04', label: 'Events',      href: '/intelligence/events-production',active: false },
          { num: '05', label: 'VIP',         href: '/intelligence/vip-hospitality',  active: false },
          { num: '06', label: 'Art',         href: '/intelligence/art-collectables', active: true  },
        ].map(t => (
          <a key={t.num} href={t.href} style={{ padding: '0.3rem 0.75rem', border: t.active ? 'none' : '1px solid #e5e7eb', background: t.active ? '#0e4f51' : 'transparent', color: t.active ? '#fff' : '#6b7280', fontSize: '0.7rem', fontFamily: "'Lato', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', borderRadius: '3px', textDecoration: 'none' }}>
            {t.num} {t.label}
          </a>
        ))}
      </div>
    </div>
  )

  // ── WELCOME ───────────────────────────────────────────────────────────────
  const renderWelcome = () => (
    <div>
      <div style={S.eyebrow}>Art & Collectables Intelligence · v2</div>
      <h1 style={S.h1}>The acquisition question<br />is the wrong question.</h1>
      <div style={S.primaryQuote}>
        "Most collectors decide what to acquire and then ask how to hold it. The structuring question — how to hold it, where, what happens when you sell, what happens when you die — should come before the first conversation with a dealer, not after the wire transfer."
      </div>
      <p style={S.body}>
        Six collecting categories. For each: an honest read of the market, a collection strategy matched to how you actually collect, the structuring questions most buyers never ask, and TGC's specific access — through the Concierge Chronicles editorial network, our European advisory relationships across Benelux, DACH, and France, and direct studio introductions.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32 }}>
        <button style={S.btn} onClick={() => setScreen('profile')}>Build a brief →</button>
        <button style={{ ...S.btnSecondary }} onClick={() => setScreen('commission-type')}>Commission a specific piece</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginTop: 40 }}>
        {CATEGORIES.map(cat => (
          <div key={cat.id}
            style={{ ...S.card, ...(selectedCategory?.id === cat.id ? S.cardSelected : {}) }}
            onClick={() => { setSelectedCategory(cat); setSituation('active'); setDriver('open'); setGeography('open'); setScreen('category') }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c8aa4a', marginBottom: 8 }}>{cat.number}</div>
            <div style={S.cardTitle}>{cat.name}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6, lineHeight: 1.5 }}>{cat.tagline}</div>
          </div>
        ))}
      </div>
    </div>
  )

  // ── PROFILE ───────────────────────────────────────────────────────────────
  const renderProfile = () => {
    const situationOpts: { value: CollectorSituation; label: string; sub: string }[] = [
      { value: 'starting',    label: 'Building from scratch',           sub: "First collection — exploring categories and understanding the market" },
      { value: 'active',      label: 'Adding to an existing collection', sub: "Established collector looking for a specific piece or direction" },
      { value: 'structuring', label: 'Structuring what I have',          sub: "Existing collection — estate planning, valuation, or storage decisions" },
      { value: 'selling',     label: 'Looking to sell',                  sub: "Private sale, auction, or estate disposal" },
    ]
    const driverOpts: { value: CollectorDriver; label: string; sub: string }[] = [
      { value: 'pleasure',    label: 'Primarily aesthetic',  sub: "Acquired to be lived with, enjoyed, and displayed" },
      { value: 'investment',  label: 'Investment alongside pleasure', sub: "A note of caution: art is not reliably a financial product. We'll be honest about where this holds and where it doesn't." },
      { value: 'legacy',      label: 'Legacy and estate',    sub: "Building something to pass on — family, institution, or foundation" },
      { value: 'maker',       label: 'Maker relationships',  sub: "Collecting through direct contact with artists, studios, and ateliers" },
      { value: 'open',        label: 'Still evolving',        sub: "No fixed position yet" },
    ]
    const geoOpts: { value: GeographyFocus; label: string }[] = [
      { value: 'europe', label: 'Primarily European' },
      { value: 'global',  label: 'Global' },
      { value: 'open',    label: 'No strong preference' },
    ]
    return (
      <div>
        <button style={{ ...S.btnSecondary, marginBottom: 20 }} onClick={() => setScreen('welcome')}>← Back</button>
        <div style={S.eyebrow}>Collector Profile</div>
        <h2 style={S.h2}>A few questions before we dive in.</h2>
        <p style={S.body}>Your answers shape which categories we surface first and which structuring considerations apply.</p>

        <h3 style={{ ...S.h3, marginTop: 24 }}>What brings you here?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, marginBottom: 28 }}>
          {situationOpts.map(o => (
            <div key={o.value}
              style={{ ...S.radioCard, ...(situation === o.value ? S.radioCardSelected : {}) }}
              onClick={() => setSituation(o.value)}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 400, color: '#1a1815', marginBottom: 4 }}>{o.label}</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{o.sub}</div>
            </div>
          ))}
        </div>

        <h3 style={S.h3}>What drives the collection?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, marginBottom: 28 }}>
          {driverOpts.map(o => (
            <div key={o.value}
              style={{ ...S.radioCard, ...(driver === o.value ? S.radioCardSelected : {}) }}
              onClick={() => setDriver(o.value)}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 400, color: '#1a1815', marginBottom: 4 }}>{o.label}</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{o.sub}</div>
            </div>
          ))}
        </div>

        <h3 style={S.h3}>Geographic focus?</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
          {geoOpts.map(o => (
            <div key={o.value}
              style={{ ...S.radioCard, padding: '12px 20px', ...(geography === o.value ? S.radioCardSelected : {}) }}
              onClick={() => setGeography(o.value)}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, color: '#1a1815' }}>{o.label}</div>
            </div>
          ))}
        </div>

        <button style={S.btn} onClick={() => setScreen('category')} disabled={!situation || !driver || !geography}>
          See the categories →
        </button>
      </div>
    )
  }

  // ── CATEGORY ──────────────────────────────────────────────────────────────
  const renderCategory = () => {
    const ordered = rankedCategories
    const topTwo = new Set([ordered[0]?.id, ordered[1]?.id])
    return (
      <div>
        <button style={{ ...S.btnSecondary, marginBottom: 20 }} onClick={() => setScreen('profile')}>← Back</button>
        <div style={S.eyebrow}>Collecting Categories</div>
        <h2 style={S.h2}>Six categories. Select the one that fits your mandate.</h2>
        {situation === 'starting' && (
          <p style={{ ...S.body, color: '#6b7280' }}>Based on your profile, we've ordered these by how natural an entry point each tends to be.</p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginTop: 24 }}>
          {ordered.map(cat => (
            <div key={cat.id}
              style={{ ...S.card, ...(selectedCategory?.id === cat.id ? S.cardSelected : {}), position: 'relative' }}
              onClick={() => setSelectedCategory(cat)}>
              {topTwo.has(cat.id) && situation === 'starting' && (
                <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c8aa4a', background: 'rgba(200,170,74,0.1)', padding: '3px 8px', borderRadius: 3 }}>Suggested</div>
              )}
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c8aa4a', marginBottom: 8 }}>{cat.number}</div>
              <div style={S.cardTitle}>{cat.name}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6, lineHeight: 1.5 }}>{cat.tagline}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32 }}>
          <button style={S.btn} onClick={() => setScreen('market')} disabled={!selectedCategory}>
            Read the market analysis →
          </button>
        </div>
      </div>
    )
  }

  // ── MARKET ────────────────────────────────────────────────────────────────
  const renderMarket = () => {
    if (!selectedCategory) return null
    const cat = selectedCategory
    return (
      <div>
        <button style={{ ...S.btnSecondary, marginBottom: 20 }} onClick={() => setScreen('category')}>← Back</button>
        <div style={S.eyebrow}>{cat.number} · {cat.name}</div>
        <h2 style={S.h2}>{cat.tagline}</h2>
        <p style={S.body}>{cat.editorial}</p>

        <h3 style={S.h3}>Loud vs quiet</h3>
        <div style={S.grid2}>
          <div>
            <div style={S.eyebrow}>The loud version (to avoid)</div>
            <p style={{ fontSize: 14, color: '#1a1815', lineHeight: 1.65 }}>{cat.loud}</p>
          </div>
          <div>
            <div style={S.eyebrow}>The quiet version (what TGC builds toward)</div>
            <p style={{ fontSize: 14, color: '#1a1815', lineHeight: 1.65 }}>{cat.quiet}</p>
          </div>
        </div>

        <h3 style={S.h3}>What you need to know about this market</h3>
        <ul style={S.list}>
          {cat.marketDynamics.map((d, i) => (
            <li key={i} style={S.listItem}><span style={S.dash}>—</span>{d}</li>
          ))}
        </ul>

        <div style={S.tgcBox}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c8aa4a', marginBottom: 10 }}>TGC's positioning</div>
          <p style={{ fontWeight: 300, fontSize: 15, lineHeight: 1.65, margin: 0 }}>{cat.tgcAngle}</p>
        </div>

        {cat.chroniclesNote && (
          <div style={S.chroniclesBox}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c8aa4a', marginBottom: 8 }}>Concierge Chronicles</div>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65, margin: 0 }}>{cat.chroniclesNote}</p>
          </div>
        )}

        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
          <button style={S.btn} onClick={() => setScreen('vision')}>Define your collecting vision →</button>
        </div>
      </div>
    )
  }

  // ── VISION ────────────────────────────────────────────────────────────────
  const renderVision = () => {
    const livingOpts = [
      { value: 'living' as VisionLiving,       label: 'Displayed and lived with',       sub: "Pieces are part of the space — walls, surfaces, worn or used daily" },
      { value: 'stored' as VisionLiving,        label: 'Primarily in storage',           sub: "Held in controlled conditions — freeport, climate-controlled storage, or a vault" },
      { value: 'mixed' as VisionLiving,         label: 'A mix of both',                  sub: "Some on display, significant pieces in proper storage" },
      { value: 'institutional' as VisionLiving, label: 'On loan to institutions',        sub: "Works are placed with museums or foundations, on extended loan" },
    ]
    const riskOpts = [
      { value: 'established' as VisionRisk, label: 'Established recognition',     sub: "Institutional acquisition, settled scholarship, auction track record" },
      { value: 'emerging' as VisionRisk,    label: 'Emerging before recognition', sub: "Studio relationships, early-stage makers, pre-gallery introduction" },
      { value: 'mixed' as VisionRisk,       label: 'A mix of both',               sub: "Foundation of established work with emerging additions" },
    ]
    const approachOpts = [
      { value: 'depth' as VisionApproach,   label: 'Single-category depth',    sub: "Going deep in one territory — expertise over breadth" },
      { value: 'breadth' as VisionApproach, label: 'Cross-category breadth',   sub: "A collection that spans disciplines with a coherent point of view" },
      { value: 'vision' as VisionApproach,  label: 'A curatorial vision',       sub: "The collection follows a thematic or aesthetic argument across time" },
      { value: 'instinct' as VisionApproach,'label': 'Instinct and conviction', sub: "No fixed strategy — each acquisition follows a sustained personal response" },
    ]
    return (
      <div>
        <button style={{ ...S.btnSecondary, marginBottom: 20 }} onClick={() => setScreen('market')}>← Back</button>
        <div style={S.eyebrow}>Collection Vision</div>
        <h2 style={S.h2}>Three questions that define how you collect.</h2>
        <p style={S.body}>Your answers shape the collection strategy recommendation — and help TGC understand what kind of access and introductions will be most useful.</p>

        <h3 style={{ ...S.h3, marginTop: 24 }}>How does the collection live?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, marginBottom: 28 }}>
          {livingOpts.map(o => (
            <div key={o.value}
              style={{ ...S.radioCard, ...(visionLiving === o.value ? S.radioCardSelected : {}) }}
              onClick={() => setVisionLiving(o.value)}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 400, color: '#1a1815', marginBottom: 4 }}>{o.label}</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{o.sub}</div>
            </div>
          ))}
        </div>

        <h3 style={S.h3}>Where on the recognition spectrum?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, marginBottom: 28 }}>
          {riskOpts.map(o => (
            <div key={o.value}
              style={{ ...S.radioCard, ...(visionRisk === o.value ? S.radioCardSelected : {}) }}
              onClick={() => setVisionRisk(o.value)}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 400, color: '#1a1815', marginBottom: 4 }}>{o.label}</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{o.sub}</div>
            </div>
          ))}
        </div>

        <h3 style={S.h3}>How do you approach the collection?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, marginBottom: 32 }}>
          {approachOpts.map(o => (
            <div key={o.value}
              style={{ ...S.radioCard, ...(visionApproach === o.value ? S.radioCardSelected : {}) }}
              onClick={() => setVisionApproach(o.value)}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 400, color: '#1a1815', marginBottom: 4 }}>{o.label}</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{o.sub}</div>
            </div>
          ))}
        </div>

        <button style={S.btn} onClick={() => setScreen('vision-result')} disabled={!visionLiving || !visionRisk || !visionApproach}>
          See your collecting profile →
        </button>
      </div>
    )
  }

  // ── VISION RESULT ─────────────────────────────────────────────────────────
  const renderVisionResult = () => {
    if (!philosophy) return null
    return (
      <div>
        <button style={{ ...S.btnSecondary, marginBottom: 20 }} onClick={() => setScreen('vision')}>← Back</button>
        <div style={S.eyebrow}>Collecting Profile</div>
        <h2 style={S.h2}>Your collection strategy.</h2>

        <div style={S.philosophyCard}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c8aa4a', marginBottom: 12 }}>{philosophy.name}</div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 24, fontWeight: 400, lineHeight: 1.3, color: '#1a1815', marginBottom: 16 }}>{philosophy.headline}</div>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, marginBottom: 20 }}>{philosophy.description}</p>
          <ul style={S.list}>
            {philosophy.bullets.map((b, i) => (
              <li key={i} style={S.listItem}><span style={S.dash}>—</span>{b}</li>
            ))}
          </ul>
        </div>

        <div style={S.tgcBox}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c8aa4a', marginBottom: 10 }}>What this means for TGC's approach</div>
          <p style={{ fontWeight: 300, fontSize: 15, lineHeight: 1.65, margin: 0 }}>{philosophy.tgcAngle}</p>
        </div>

        <div style={{ marginTop: 32 }}>
          <button style={S.btn} onClick={() => setScreen('structuring')}>Review the structuring considerations →</button>
        </div>
      </div>
    )
  }

  // ── STRUCTURING ───────────────────────────────────────────────────────────
  const renderStructuring = () => {
    const material = activeFlags.filter(f => f.material)
    const practical = activeFlags.filter(f => !f.material)
    return (
      <div>
        <button style={{ ...S.btnSecondary, marginBottom: 20 }} onClick={() => setScreen('vision-result')}>← Back</button>
        <div style={S.eyebrow}>Structuring — {selectedCategory?.name}</div>
        <h2 style={S.h2}>The questions most buyers never ask.</h2>
        <p style={S.body}>These apply to your specific category. The ones marked material change the economics of the acquisition or sale in a way that is worth modelling before you proceed.</p>

        {material.length > 0 && (
          <>
            <div style={{ ...S.eyebrow, marginTop: 8, marginBottom: 16 }}>Material considerations</div>
            {material.map(flag => (
              <div key={flag.id} style={S.structCard}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: 17, color: '#1a1815', marginBottom: 8 }}>{flag.title}</div>
                <p style={{ fontSize: 14, color: '#1a1815', lineHeight: 1.65, margin: 0 }}>{flag.explanation}</p>
                <div style={S.tgcNote}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c8aa4a', marginBottom: 6 }}>TGC note</div>
                  <p style={{ fontSize: 13, margin: 0, lineHeight: 1.65 }}>{flag.tgcNote}</p>
                </div>
              </div>
            ))}
          </>
        )}

        {practical.length > 0 && (
          <>
            <div style={{ ...S.eyebrow, marginTop: 28, marginBottom: 16 }}>Practical considerations</div>
            {practical.map(flag => (
              <div key={flag.id} style={S.structCardMinor}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: 17, color: '#1a1815', marginBottom: 8 }}>{flag.title}</div>
                <p style={{ fontSize: 14, color: '#1a1815', lineHeight: 1.65, margin: 0 }}>{flag.explanation}</p>
                <div style={{ ...S.tgcNote, background: '#F9F8F5', color: '#1a1815' }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c8aa4a', marginBottom: 6 }}>TGC note</div>
                  <p style={{ fontSize: 13, margin: 0, lineHeight: 1.65 }}>{flag.tgcNote}</p>
                </div>
              </div>
            ))}
          </>
        )}

        <div style={{ background: '#F9F8F5', borderLeft: '3px solid #e5e7eb', padding: '16px 20px', marginTop: 24, borderRadius: 4 }}>
          <p style={{ fontSize: 14, color: '#1a1815', margin: 0, lineHeight: 1.65 }}>
            None of the above replaces specialist legal, tax, or financial advice — which TGC can introduce in France, the UK, or Switzerland. The purpose of this analysis is to ensure you ask the right questions before any transaction, not to answer them definitively.
          </p>
        </div>
        <div style={{ marginTop: 32 }}>
          <button style={S.btn} onClick={() => setScreen('brief')}>Continue to your brief →</button>
        </div>
      </div>
    )
  }

  // ── BRIEF ─────────────────────────────────────────────────────────────────
  const renderBrief = () => {
    const directionOpts = [
      { value: 'acquiring',    label: 'Acquiring — looking for a specific piece or building a collection' },
      { value: 'selling',      label: 'Selling — private sale, auction, or estate' },
      { value: 'appraising',   label: 'Appraising — existing collection, insurance, or estate valuation' },
    ]
    const budgetOpts = [
      { value: 'under-25k',  label: 'Under €25,000' },
      { value: '25-100k',    label: '€25,000 – 100,000' },
      { value: '100-500k',   label: '€100,000 – 500,000' },
      { value: '500k-2m',    label: '€500,000 – 2,000,000' },
      { value: '2m-plus',    label: '€2,000,000+' },
      { value: 'open',       label: 'Open — quality is the constraint' },
    ]
    const timelineOpts = [
      { value: 'urgent', label: 'Within 4 weeks' },
      { value: 'near',   label: '1–3 months' },
      { value: 'medium', label: '3–12 months' },
      { value: 'long',   label: 'No fixed timeline — the right piece' },
    ]
    const confidentialityOpts = [
      { value: 'standard',      label: 'Standard' },
      { value: 'discreet',      label: 'Discreet — no public record of interest' },
      { value: 'ultra-private', label: 'Ultra-private — NDA before any approach' },
    ]
    return (
      <div>
        <button style={{ ...S.btnSecondary, marginBottom: 20 }} onClick={() => setScreen('structuring')}>← Back</button>
        <div style={S.eyebrow}>Your brief — {selectedCategory?.name}</div>
        <h2 style={S.h2}>The specifics.</h2>
        <p style={S.body}>The more we know, the more specific the Gatekeeper's response can be.</p>

        <label style={S.label}>Direction</label>
        <select style={S.select} value={direction} onChange={e => setDirection(e.target.value)}>
          <option value="">Select…</option>
          {directionOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label style={S.label}>Budget or valuation framing</label>
        <select style={S.select} value={budget} onChange={e => setBudget(e.target.value)}>
          <option value="">Select…</option>
          {budgetOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label style={S.label}>Specific piece or general collecting interest</label>
        <textarea style={S.textarea} value={brief.specific}
          placeholder="e.g., a specific contemporary painter whose work I've been following; or: looking for a F.P. Journe Chronomètre Bleu; or: building a collection of post-war French abstraction"
          onChange={e => setBrief({ ...brief, specific: e.target.value })} />

        <label style={S.label}>Timeline</label>
        <select style={S.select} value={brief.timeline} onChange={e => setBrief({ ...brief, timeline: e.target.value })}>
          <option value="">Select…</option>
          {timelineOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label style={S.label}>Existing collection context (optional)</label>
        <textarea style={{ ...S.textarea, minHeight: 60 }} value={brief.existingCollection}
          placeholder="e.g., primarily contemporary — this would be a first design piece; or: a working collection — pieces live with us, not in storage"
          onChange={e => setBrief({ ...brief, existingCollection: e.target.value })} />

        <label style={S.label}>Confidentiality</label>
        <select style={S.select} value={brief.confidentiality} onChange={e => setBrief({ ...brief, confidentiality: e.target.value })}>
          <option value="">Select…</option>
          {confidentialityOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label style={S.label}>Anything else</label>
        <textarea style={{ ...S.textarea, minHeight: 60 }} value={brief.notes}
          placeholder="e.g., the acquisition would be held in a company structure; or: I have an existing adviser I'd like TGC to work alongside"
          onChange={e => setBrief({ ...brief, notes: e.target.value })} />

        <div style={{ marginTop: 32 }}>
          <button style={S.btn} onClick={() => setScreen('client')} disabled={!direction || !budget || !brief.timeline || !brief.confidentiality}>Continue →</button>
        </div>
      </div>
    )
  }

  // ── CLIENT ────────────────────────────────────────────────────────────────
  const renderClient = (onSubmit: () => void, backScreen: string) => (
    <div>
      <button style={{ ...S.btnSecondary, marginBottom: 20 }} onClick={() => setScreen(backScreen)}>← Back</button>
      <div style={S.eyebrow}>Your details</div>
      <h2 style={S.h2}>One last thing.</h2>
      <p style={S.body}>Your brief will be reviewed by a Gatekeeper within 24 hours. For categories where TGC has a direct network — contemporary art, horology, Occitanie wine, Burgundy, studio design — expect a more specific response with names and introductions.</p>

      <label style={S.label}>Name</label>
      <input type="text" style={S.input} value={client.name} onChange={e => setClient({ ...client, name: e.target.value })} />

      <label style={S.label}>Email</label>
      <input type="email" style={S.input} value={client.email} onChange={e => setClient({ ...client, email: e.target.value })} />

      <label style={S.label}>Phone (with country code)</label>
      <input type="tel" style={S.input} value={client.phone} placeholder="+33 6 XX XX XX XX" onChange={e => setClient({ ...client, phone: e.target.value })} />

      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 24, lineHeight: 1.6 }}>
        Your brief is seen only by the Gatekeeper handling your category. TGC does not share interest with any seller, gallery, or auction house before a mandate is agreed and confidentiality terms are in place.
      </p>

      <div style={{ marginTop: 32 }}>
        <button style={S.btnGold} onClick={onSubmit} disabled={!client.name || !client.email}>Submit brief</button>
      </div>
    </div>
  )

  // ── CONFIRMATION ──────────────────────────────────────────────────────────
  const renderConfirmation = (type: 'brief' | 'commission') => (
    <div>
      <div style={S.eyebrow}>Brief received</div>
      <h2 style={S.h2}>Thank you, {client.name?.split(' ')[0]}.</h2>
      <p style={S.lead}>Your brief is with us.</p>

      <div style={{ ...S.card, cursor: 'default', marginBottom: 24 }}>
        <div style={S.eyebrow}>Reference</div>
        <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 15, color: '#0e4f51', letterSpacing: '0.05em', margin: '4px 0 16px' }}>{refId}</div>
        {type === 'brief' && (
          <div style={{ fontSize: 14, color: '#6b7280' }}>
            <strong style={{ color: '#1a1815' }}>{selectedCategory?.name}</strong>
            {direction && <> · {direction}</>}
            {budget && <> · {budget}</>}
            {philosophy && <> · {philosophy.name}</>}
          </div>
        )}
        {type === 'commission' && (
          <div style={{ fontSize: 14, color: '#6b7280' }}>
            <strong style={{ color: '#1a1815' }}>Commission brief</strong>
            {commissionDiscipline && <> · {COMMISSION_DISCIPLINES.find(d => d.id === commissionDiscipline)?.name}</>}
          </div>
        )}
      </div>

      <h3 style={S.h3}>What happens next</h3>
      <ul style={S.list}>
        {type === 'brief' ? <>
          <li style={S.listItem}><span style={S.dash}>—</span><strong>Within 24 hours:</strong> the Gatekeeper for your category will respond with a specific view and next steps</li>
          <li style={S.listItem}><span style={S.dash}>—</span><strong>Where TGC has a direct network</strong> (contemporary art, horology, Burgundy and Occitanie wine, studio design): expect a more specific response with names and introductions</li>
          <li style={S.listItem}><span style={S.dash}>—</span><strong>Structuring:</strong> if any of the considerations we reviewed apply to your mandate, we will introduce the appropriate specialist before any transaction proceeds</li>
          <li style={S.listItem}><span style={S.dash}>—</span><strong>Confidentiality:</strong> your interest is not shared with any counterparty before you agree to proceed</li>
        </> : <>
          <li style={S.listItem}><span style={S.dash}>—</span><strong>Within 48 hours:</strong> a Gatekeeper will respond with 2-3 makers whose practice fits the brief</li>
          <li style={S.listItem}><span style={S.dash}>—</span><strong>Introduction:</strong> once you confirm interest, TGC makes the introduction — under NDA if required</li>
          <li style={S.listItem}><span style={S.dash}>—</span><strong>From there:</strong> the commission relationship is between you and the maker. TGC facilitates but does not intermediate the creative process</li>
        </>}
      </ul>

      <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a href={CALENDAR_URL} target="_blank" rel="noopener noreferrer"
          style={{ ...S.btnGold, textDecoration: 'none', display: 'inline-block' }}>
          Book a call
        </a>
        <button style={S.btnSecondary} onClick={resetAll}>Start another brief</button>
      </div>
    </div>
  )

  // ── COMMISSION: TYPE ──────────────────────────────────────────────────────
  const renderCommissionType = () => (
    <div>
      <button style={{ ...S.btnSecondary, marginBottom: 20 }} onClick={() => setScreen('welcome')}>← Back</button>
      <div style={S.eyebrow}>Commission a Piece</div>
      <h2 style={S.h2}>What do you want to commission?</h2>
      <p style={S.body}>A direct commission from a maker — no gallery, no auction. TGC identifies 2-3 makers whose practice fits your brief and makes the introduction.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginTop: 24 }}>
        {COMMISSION_DISCIPLINES.map(d => (
          <div key={d.id}
            style={{ ...S.card, ...(commissionDiscipline === d.id ? S.cardSelected : {}) }}
            onClick={() => setCommissionDiscipline(d.id)}>
            <div style={S.cardTitle}>{d.name}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6, lineHeight: 1.5 }}>{d.description}</div>
            <div style={{ fontSize: 11, color: '#c8aa4a', marginTop: 10, fontStyle: 'italic' }}>{d.timeline}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32 }}>
        <button style={S.btn} onClick={() => setScreen('commission-brief')} disabled={!commissionDiscipline}>Continue →</button>
      </div>
    </div>
  )

  // ── COMMISSION: BRIEF ─────────────────────────────────────────────────────
  const renderCommissionBrief = () => {
    const disc = COMMISSION_DISCIPLINES.find(d => d.id === commissionDiscipline)
    const budgetOpts = [
      { value: 'under-5k', label: 'Under €5,000' },
      { value: '5-25k',    label: '€5,000 – 25,000' },
      { value: '25-100k',  label: '€25,000 – 100,000' },
      { value: '100k-plus',label: '€100,000+' },
      { value: 'open',     label: 'Open — quality is the constraint' },
    ]
    const purposeOpts = [
      { value: 'personal', label: 'For myself' },
      { value: 'gift',     label: 'As a gift' },
      { value: 'both',     label: 'Both' },
    ]
    const timelineOpts = [
      { value: 'flexible',  label: 'Flexible — no deadline' },
      { value: 'under-6m',  label: 'Within 6 months' },
      { value: 'under-12m', label: 'Within 12 months' },
      { value: 'specific',  label: 'Specific date — note in brief' },
    ]
    return (
      <div>
        <button style={{ ...S.btnSecondary, marginBottom: 20 }} onClick={() => setScreen('commission-type')}>← Back</button>
        <div style={S.eyebrow}>Commission Brief — {disc?.name}</div>
        <h2 style={S.h2}>Tell us about the commission.</h2>

        {disc && (
          <div style={{ ...S.chroniclesBox, marginBottom: 24 }}>
            <div style={S.eyebrow}>Examples in this category</div>
            <ul style={S.list}>
              {disc.examples.map((ex, i) => <li key={i} style={{ ...S.listItem, fontSize: 13 }}><span style={S.dash}>—</span>{ex}</li>)}
            </ul>
            <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}><strong style={{ color: '#1a1815' }}>TGC's network:</strong> {disc.makers}</div>
          </div>
        )}

        <label style={S.label}>Concept or intention</label>
        <textarea style={S.textarea} value={commissionBrief.concept}
          placeholder="Describe the idea — as precisely or as openly as you like. The brief can be a specific description or a general direction the maker works within."
          onChange={e => setCommissionBrief({ ...commissionBrief, concept: e.target.value })} />

        <label style={S.label}>Budget</label>
        <select style={S.select} value={commissionBrief.budget} onChange={e => setCommissionBrief({ ...commissionBrief, budget: e.target.value })}>
          <option value="">Select…</option>
          {budgetOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label style={S.label}>For yourself or a gift?</label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
          {purposeOpts.map(o => (
            <div key={o.value}
              style={{ ...S.radioCard, padding: '10px 18px', ...(commissionBrief.purpose === o.value ? S.radioCardSelected : {}) }}
              onClick={() => setCommissionBrief({ ...commissionBrief, purpose: o.value })}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: '#1a1815' }}>{o.label}</div>
            </div>
          ))}
        </div>

        <label style={S.label}>Timeline</label>
        <select style={S.select} value={commissionBrief.timeline} onChange={e => setCommissionBrief({ ...commissionBrief, timeline: e.target.value })}>
          <option value="">Select…</option>
          {timelineOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label style={S.label}>Maker in mind? (optional)</label>
        <textarea style={{ ...S.textarea, minHeight: 60 }} value={commissionBrief.existingMaker}
          placeholder="e.g., a specific maker whose work you've seen and want; or: open to TGC's recommendation"
          onChange={e => setCommissionBrief({ ...commissionBrief, existingMaker: e.target.value })} />

        <label style={S.label}>Anything else</label>
        <textarea style={{ ...S.textarea, minHeight: 60 }} value={commissionBrief.notes}
          placeholder="e.g., the piece needs to ship to a specific country; or: it's for a specific architectural space"
          onChange={e => setCommissionBrief({ ...commissionBrief, notes: e.target.value })} />

        <div style={{ marginTop: 32 }}>
          <button style={S.btn} onClick={() => setScreen('commission-overview')} disabled={!commissionBrief.concept || !commissionBrief.budget || !commissionBrief.timeline}>
            How a TGC commission works →
          </button>
        </div>
      </div>
    )
  }

  // ── COMMISSION: OVERVIEW ──────────────────────────────────────────────────
  const renderCommissionOverview = () => (
    <div>
      <button style={{ ...S.btnSecondary, marginBottom: 20 }} onClick={() => setScreen('commission-brief')}>← Back</button>
      <div style={S.eyebrow}>How a TGC commission works</div>
      <h2 style={S.h2}>The process, clearly.</h2>
      <p style={S.body}>A commission is a relationship between you and a maker. TGC's role is to identify the right maker, make the introduction, and step back. We do not intermediate the creative process.</p>

      {[
        { num: '01', title: 'Brief review', body: "We review your brief and identify 2-3 makers whose practice, scale, and availability fit. We do not introduce everyone — only those where the fit is genuine." },
        { num: '02', title: 'Response', body: "Within 48 hours, we respond with a short overview of each maker: their work, their commission process, and why we think the fit works. No hard sell." },
        { num: '03', title: 'Introduction', body: "You indicate interest. We make the introduction — in writing, under NDA if you require it. The maker receives your brief and responds directly." },
        { num: '04', title: 'From there, it is yours', body: "The commission terms, timeline, and creative relationship are between you and the maker. TGC is available as a resource but does not sit in the middle." },
        { num: '05', title: 'No fee until the introduction is made', body: "TGC does not charge for the brief review or the match. Our arrangement with makers varies — some pay an introduction fee, some do not. This does not affect the brief or the response." },
      ].map(step => (
        <div key={step.num} style={{ display: 'flex', gap: 20, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 28, fontWeight: 300, color: '#c8aa4a', minWidth: 48, lineHeight: 1 }}>{step.num}</div>
          <div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 17, fontWeight: 400, color: '#1a1815', marginBottom: 6 }}>{step.title}</div>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65, margin: 0 }}>{step.body}</p>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 32 }}>
        <button style={S.btn} onClick={() => setScreen('commission-client')}>Continue →</button>
      </div>
    </div>
  )

  // ── RENDER ────────────────────────────────────────────────────────────────
  const isMainFlow = MAIN_SCREENS.includes(screen)
  const showProgress = progressIdx >= 0

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Lato:ital,wght@0,300;0,400;0,700;1,400&display=swap');
        input:focus, select:focus, textarea:focus { outline: none; border-color: #0e4f51; }
        button:hover:not(:disabled) { opacity: 0.85; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%230e4f51' fill='none' stroke-width='1.5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
      `}</style>
      <div style={S.container}>
        {suiteNav}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 48, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <div style={S.brand}>The Gatekeepers Club</div>
            <div style={S.brandSub}>Art & Collectables Intelligence · v2</div>
          </div>
          {screen !== 'welcome' && (
            <button style={{ ...S.btnSecondary, padding: '8px 16px', fontSize: 11 }} onClick={resetAll}>Start over</button>
          )}
        </div>

        {showProgress && (
          <div style={S.progress}>
            {progressScreens.map((_, i) => (
              <div key={i} style={i <= progressIdx ? S.progressDotActive : S.progressDot} />
            ))}
          </div>
        )}

        {screen === 'welcome'              && renderWelcome()}
        {screen === 'profile'              && renderProfile()}
        {screen === 'category'             && renderCategory()}
        {screen === 'market'               && renderMarket()}
        {screen === 'vision'               && renderVision()}
        {screen === 'vision-result'        && renderVisionResult()}
        {screen === 'structuring'          && renderStructuring()}
        {screen === 'brief'                && renderBrief()}
        {screen === 'client'               && renderClient(async () => {
          await submitBrief('art-collectables', { category: { id: selectedCategory?.id, name: selectedCategory?.name }, philosophy: philosophy?.id, situation, driver, geography, visionLiving, visionRisk, visionApproach, direction, budget, brief, client })
          setScreen('confirmation')
        }, 'brief')}
        {screen === 'confirmation'         && renderConfirmation('brief')}
        {screen === 'commission-type'      && renderCommissionType()}
        {screen === 'commission-brief'     && renderCommissionBrief()}
        {screen === 'commission-overview'  && renderCommissionOverview()}
        {screen === 'commission-client'    && renderClient(async () => {
          await submitBrief('art-commission', { discipline: commissionDiscipline, commissionBrief, client })
          setScreen('commission-confirmation')
        }, 'commission-overview')}
        {screen === 'commission-confirmation' && renderConfirmation('commission')}

        {loadedDraft && (
          <div style={S.draftNotice}>Draft restored from previous session</div>
        )}
      </div>
    </div>
  )
}

export default function ArtCollectablesPage() {
  return <TGCArtCollectables />
}
