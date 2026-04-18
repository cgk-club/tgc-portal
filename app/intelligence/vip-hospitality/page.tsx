/* eslint-disable react/no-unescaped-entities, react/jsx-no-comment-textnodes */
'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'tgc-vip-hospitality-brief'
const CALENDAR_URL = 'https://calendar.app.google/aAsppu4Tju2my9ST7'

// ──────────────────────────────────────────────────────────────────────────────
// EVENTS DATA — 20 curated events across 9 categories
// ──────────────────────────────────────────────────────────────────────────────

type EventCategory = 'motorsport' | 'polo' | 'racing' | 'tennis' | 'sailing' | 'art' | 'performance' | 'golf' | 'film'

type VIPEvent = {
  id: string
  name: string
  dates: string
  location: string
  category: EventCategory
  tgcActive: boolean
  tgcOffer?: string
  accessStatement: string
  loud: string
  quiet: string
  keyFacts: string[]
  budgetFrom: string
  bookBy: string
  scale: string
}

const CATEGORIES: { id: EventCategory; label: string }[] = [
  { id: 'motorsport', label: 'Motorsport' },
  { id: 'polo', label: 'Polo' },
  { id: 'racing', label: 'Horse Racing' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'sailing', label: 'Sailing' },
  { id: 'art', label: 'Art Fairs' },
  { id: 'performance', label: 'Performance' },
  { id: 'golf', label: 'Golf' },
  { id: 'film', label: 'Film' },
]

const EVENTS: VIPEvent[] = [
  // MOTORSPORT
  {
    id: 'monaco-gp',
    name: 'Monaco Grand Prix',
    dates: 'May — annually',
    location: 'Monaco',
    category: 'motorsport',
    tgcActive: true,
    tgcOffer: 'The Pavilion — TGC\'s named hospitality venue at Monaco GP, produced with Game ON Media. Racing views, curated guest list of 80. M/Y ARADOS at anchor in the harbour for private after-race. À la carte food and wine programme. Access managed by TGC directly; no third-party packages.',
    accessStatement: 'Everyone is in Monaco that weekend. Very few are inside it. The difference is a view of the track versus a screen inside a marquee, a curated 80-person room versus a 300-person corporate tent.',
    loud: 'Branded corporate marquee. 200 people, 10 sponsor logos, buffet lunch, pre-recorded driver message on a screen, a lanyarded representative to ask if you need anything.',
    quiet: 'The Pavilion. 80 guests. Track views. Wine chosen by TGC. À la carte. M/Y ARADOS at anchor after the race for those who want it. A guest list worth being on.',
    keyFacts: [
      'Race weekend hospitality sells out before December for the following May — brief us in autumn',
      'Thursday Historique and Saturday qualifying often offer better access quality than race day itself',
      'The harbour berths (not anchor) sell out in September; yacht access requires separate planning',
      'The Pavilion has a cap of 80 — once full, we cannot take further bookings',
      'TGC manages the guest list directly; we don\'t add names we don\'t know',
    ],
    budgetFrom: '€3,500 per person',
    bookBy: 'October–November for May race weekend',
    scale: 'Per-person pricing from €3,500. Corporate tables and group bookings available. M/Y ARADOS by private arrangement.',
  },
  {
    id: 'le-mans',
    name: 'Le Mans 24 Heures',
    dates: 'June — annually',
    location: 'Le Mans, France',
    category: 'motorsport',
    tgcActive: false,
    accessStatement: 'Le Mans is one of the few events where the most interesting access is not the most expensive. The paddock, the night, the pits walk — these matter more than a hospitality suite.',
    loud: 'Manufacturer hospitality village, lanyards, branded kit, coach transfers, hosted lunch with a retired driver, grandstand seats facing the start/finish line',
    quiet: 'Pit lane access for practice and qualifying. A position on the Ford Chicane at 2am. A trusted local network for camping and village logistics. The race is 24 hours — most corporate packages cover eight of them.',
    keyFacts: [
      'The most valuable access (pit lane walks, paddock) requires manufacturer or team relationships — not a ticket upgrade',
      'Night-time Le Mans (midnight to 4am) is the event. Most hospitality guests miss it entirely.',
      'Accommodation within 30km is completely sold out by February — plan September',
      'The Dunlop Bridge at night: the one place on the circuit where access and atmosphere align',
    ],
    budgetFrom: '€2,000 per person (facilitated access)',
    bookBy: 'September for June',
    scale: 'Five-figure for 2-4 people with genuine access. Higher for manufacturer-level arrangements.',
  },
  {
    id: 'goodwood-fos',
    name: 'Goodwood Festival of Speed',
    dates: 'July — annually',
    location: 'Goodwood, West Sussex',
    category: 'motorsport',
    tgcActive: false,
    accessStatement: 'Festival of Speed is genuinely democratic — the access tiers are well-structured and the event itself is one of the best-run in the world. The question is not how to get in but where to be.',
    loud: 'Hospitality chalet at the Supercar Paddock. Watching celebrity arrivals, standing near a Pagani. Brunch from a catering unit.',
    quiet: 'Ticketed access to the First Shoot area with a guided morning. The Cartier lawn in the afternoon. The private garden party hosted by a Goodwood estate owner on Sunday evening.',
    keyFacts: [
      'The Hillclimb start is the best single position — book the timed access slot',
      'Estate owners in the surrounding miles often host private weekend parties that are better than the event itself',
      'Parking and road access are the genuine operational challenge — arrive Thursday evening or stay on-estate',
      'The Revival in September is smaller, more focused, and in most respects more interesting',
    ],
    budgetFrom: '£800 per person (facilitated)',
    bookBy: 'March for July',
    scale: 'Low five-figure for a properly facilitated two-day visit with accommodation. Hospitality suites are available commercially from the organiser.',
  },
  {
    id: 'goodwood-revival',
    name: 'Goodwood Revival',
    dates: 'September — annually',
    location: 'Goodwood, West Sussex',
    category: 'motorsport',
    tgcActive: false,
    accessStatement: 'The Revival is the motorsport event most serious enthusiasts prefer to the Festival of Speed. Period dress is worn by virtually all attendees — and taken seriously. Smaller, quieter, more focused.',
    loud: 'A hired costume from a party supplier. The main grandstand hospitality package. Not reading the programme.',
    quiet: 'A properly researched period outfit. The Members\' Meeting access tier. Sunday morning paddock walk with a guide who can name every car. Lunch at the Vintage Aero Club.',
    keyFacts: [
      'Period dress is compulsory and observed — arrive without it and you will feel the gap',
      'The Members\' Meeting (separate, March) is even more exclusive and almost entirely enthusiast-attended',
      'The Saturday evening gathering in the paddock is where the real conversations happen',
      'Many of the cars entered are privately owned and available — introductions require contacts',
    ],
    budgetFrom: '£1,200 per person (facilitated)',
    bookBy: 'April for September',
    scale: 'Low five-figure for a properly facilitated weekend. Accommodation on-estate is limited and goes early.',
  },

  // POLO
  {
    id: 'guards-polo-queens-cup',
    name: 'Cartier Queen\'s Cup — Guards Polo Club',
    dates: 'June — annually',
    location: 'Windsor Great Park',
    category: 'polo',
    tgcActive: true,
    tgcOffer: 'TGC has a direct relationship with Guards Polo Club. The Queen\'s Cup Final in June is the calendar centrepiece — we facilitate access to the pavilion enclosure, private picnic positions, and post-match introductions to players and owners that hospitality tickets alone do not provide.',
    accessStatement: 'The polo hospitality market is over-catered and under-interesting. The difference is whether you are in the enclosure as a guest or as a ticket-holder. These are not the same experience.',
    loud: 'Sponsored hospitality tent on the perimeter. Pimm\'s and a picnic hamper, a brand ambassador in the corner, nobody who actually knows the horses.',
    quiet: 'Pavilion enclosure access. A position from which divot-treading has meaning. An introduction to one of the playing families. Lunch that is genuinely good rather than corporate-catered.',
    keyFacts: [
      'The Queen\'s Cup Final (June) and the Gold Cup Final at Cowdray (July) are the two fixed landmarks of the British polo season',
      'Guards is in Windsor Great Park — access and parking require forward planning; helicopters are standard among serious guests',
      'The best polo conversations happen at the stables, not the enclosure — access here requires introductions',
      'Player and owner introductions change the event from a spectacle to a relationship',
    ],
    budgetFrom: '£1,500 per person',
    bookBy: 'March for June',
    scale: 'Low five-figure for two to four people properly facilitated. Groups require advance arrangement.',
  },
  {
    id: 'cowdray-gold-cup',
    name: 'British Open Polo Championship — Cowdray',
    dates: 'July — annually',
    location: 'Cowdray Park, West Sussex',
    category: 'polo',
    tgcActive: false,
    accessStatement: 'Cowdray is less formal than Guards and in many ways better for a first polo experience. The setting is exceptional — the ruins of Cowdray Castle serve as a backdrop. The Gold Cup Final is one of the most scenic sporting occasions in England.',
    loud: 'A Pimm\'s stand, a corporate picnic, branded polo shirts from a sponsor, watching the match from the general enclosure',
    quiet: 'Pavilion access with a host who knows the teams. A position near the halfway line. The evening dinner at Cowdray with players and owners — considerably better than the day hospitality.',
    keyFacts: [
      'The Cowdray estate is privately owned — house access and estate introductions require a relationship, not a ticket',
      'Helicopter landings on-field are standard and recommended from London',
      'Evening events at Cowdray Park house are occasionally hosted during Gold Cup week — these are where the relationships are formed',
    ],
    budgetFrom: '£1,200 per person',
    bookBy: 'April for July',
    scale: 'Mid five-figure for a properly facilitated day with accommodation nearby.',
  },
  {
    id: 'deauville-polo',
    name: 'Deauville Polo — Barrière Polo Cup',
    dates: 'August — annually',
    location: 'Deauville, Normandy',
    category: 'polo',
    tgcActive: false,
    accessStatement: 'Deauville in August is a specific aesthetic — French coastal summer, the racetrack, the casino, polo on the beach. The access question is different here: it\'s not about the polo per se, but about the social ecosystem around it.',
    loud: 'A day trip from Paris with a hotel booking made in June. Watching from the beach. Moving on by 5pm.',
    quiet: 'A villa in Deauville for the week. The polo as one element of a structured programme. The private parties at the Barrière hotels where the players and owners gather. An introduction to the beach polo circuit if that\'s the direction.',
    keyFacts: [
      'The Barrière group runs almost all significant hospitality in Deauville — a relationship helps',
      'August in Deauville requires accommodation booked in October at the latest',
      'The Deauville racetrack (parallel to the polo season) is worth building into the programme',
    ],
    budgetFrom: '€1,800 per person per day (for a facilitated programme)',
    bookBy: 'October for August',
    scale: 'A week in Deauville with proper access is a six-figure week all-in.',
  },

  // HORSE RACING
  {
    id: 'royal-ascot',
    name: 'Royal Ascot',
    dates: 'June — annually (5 days)',
    location: 'Ascot Racecourse, Berkshire',
    category: 'racing',
    tgcActive: false,
    accessStatement: 'Royal Ascot has a clear enclosure hierarchy — Royal, Queen Anne, Village, Windsor. The question is not which enclosure but who you are in it with and whether you have a box or are in a box.',
    loud: 'A badge for the Royal Enclosure (easier to obtain than people think), a hired morning suit, the champagne lawn at 11am, the parade ring for the Gold Cup. Technically correct, experientially generic.',
    quiet: 'A private box with a host who knows racing. The same badge, but watching with someone who can read a race. The connections at the trainer and owner level that turn Ascot from a fashion show into an event.',
    keyFacts: [
      'Royal Enclosure badges require a nomination from an existing badge holder — TGC can facilitate',
      'Private boxes are entirely controlled by the racecourse and sell on multi-year leases; access requires a relationship or sub-let',
      'Ladies\' Day (Thursday) is the social peak; most serious racing people prefer Tuesday or Wednesday',
      'The best races are the St James\'s Palace (Tuesday), the Gold Cup (Thursday), and the Queen Elizabeth II (Saturday of Qipco)',
    ],
    budgetFrom: '£1,500 per person (Royal Enclosure + facilitation)',
    bookBy: 'January for June',
    scale: 'Low five-figure for two in the Royal Enclosure with proper facilitation. Box access is significantly more.',
  },
  {
    id: 'cheltenham',
    name: 'Cheltenham Festival',
    dates: 'March — annually (4 days)',
    location: 'Cheltenham Racecourse, Gloucestershire',
    category: 'racing',
    tgcActive: false,
    accessStatement: 'Cheltenham is the best-attended racecourse event in Britain and the most Irish-inflected. The Gold Cup day (Friday) is the peak of British jump racing. Access is simple — the complexity is who you are with and where you eat.',
    loud: 'A Guinness Village stand, four races watched from the rails, lunch in a shared marquee, the Gold Cup from whatever position is available',
    quiet: 'A box or a named private dining facility. The race card read in advance. An owner or trainer in your group who can take you to the pre-parade ring and the weighing room. Possibly a box in which you watch the Gold Cup without the crowd noise obscuring the commentary.',
    keyFacts: [
      'Champion Hurdle day (Tuesday) is technically the best value access day — Gold Cup Friday is the prestige one',
      'The Cheltenham roar at the start of the first race on Tuesday is one of the iconic sporting sounds — arrive early',
      'Owner and trainer passes change the experience entirely — brief TGC if this is what you want',
      'Traffic from Cheltenham town is a genuine problem — helicopter or private car with experienced driver',
    ],
    budgetFrom: '£1,200 per person (facilitated)',
    bookBy: 'October for March',
    scale: 'Low five-figure for two properly facilitated across 2-3 days.',
  },
  {
    id: 'prix-arc',
    name: 'Qatar Prix de l\'Arc de Triomphe',
    dates: 'First Sunday of October — annually',
    location: 'Longchamp, Paris',
    category: 'racing',
    tgcActive: false,
    accessStatement: 'The Arc is the most international flat-racing event in the world and the most overlooked from a hospitality perspective. British and Irish racegoers dominate the conversation; the French experience is different and better.',
    loud: 'A Qatar-sponsored enclosure badge, a catered lunch in the corporate zone, watching from the general enclosure, a programme from the official stand',
    quiet: 'A private box or trainer\'s invitation. Lunch in a private dining room inside the track. A guide who can explain the French racing system, which is not the British one. The Pesage paddock before the Arc.',
    keyFacts: [
      'Longchamp is a 25-minute Uber from central Paris — not a destination event in the way Ascot is',
      'The race runs in early October, post-Paris Fashion Week — combination programmes work well',
      'French flat racing has a different owner and trainer culture to British; TGC\'s network here is specific',
      'The tribunes privées (private stands) are worth the significant upgrade from general enclosure',
    ],
    budgetFrom: '€1,500 per person',
    bookBy: 'July for October',
    scale: 'Five-figure for two with private dining and proper position. Works well as a Paris weekend extension.',
  },

  // TENNIS
  {
    id: 'wimbledon',
    name: 'Wimbledon',
    dates: 'Late June to early July — annually (2 weeks)',
    location: 'All England Club, London',
    category: 'tennis',
    tgcActive: false,
    accessStatement: 'Wimbledon has the most rigid hospitality structure of any major sporting event. Centre Court debentures are the only honest access — everything else is a premium queue.',
    loud: 'A Cliff Richard lawn, a Pimm\'s, queuing for No. 1 Court hospitality, watching Federer (retired) on a screen in the village',
    quiet: 'A Centre Court or No. 1 Court debenture held by someone who understands the schedule. Which day you attend matters enormously — the second Thursday is structurally the best day for access and quality of tennis. Strawberries and cream as a gesture, not an experience.',
    keyFacts: [
      'Debentures are five-year licences sold directly by the All England Club in tranches — the next tranche covers 2026-2030',
      'Day tickets via the public queue (for courts other than Centre and No. 1) are a genuine and interesting access method — arrive before 7am',
      'The second Tuesday to Friday of the fortnight has the best tennis; the first week has the scale',
      'No. 2 Court is consistently undervalued — schedule and positioning are often better than Centre Court',
      'The hospitality packages sold commercially (outside debentures) are good — Aorangi Terrace is the benchmark',
    ],
    budgetFrom: '£2,000 per person per day (debenture level)',
    bookBy: 'Applications open January; debenture availability varies',
    scale: 'Single-day debenture access is five-figure for two. Commercial packages from the All England Club are priced per person per day.',
  },
  {
    id: 'roland-garros',
    name: 'Roland Garros',
    dates: 'Late May to early June — annually (2 weeks)',
    location: 'Stade Roland Garros, Paris',
    category: 'tennis',
    tgcActive: false,
    accessStatement: 'Roland Garros is the most underrated Grand Slam for hospitality. Less obsessively structured than Wimbledon, more interesting food and wine, a more varied atmosphere.',
    loud: 'A corporate package with catered lunch overlooking Philippe Chatrier from a sponsor box, a player autograph session, branded gift bag',
    quiet: 'Philippe Chatrier or Suzanne Lenglen on the second week days (Tuesday to Thursday). A guide who knows the atmosphere of Court Simonne Mathieu. Lunch at one of the pavilions, not a corporate tent. The public area around Court 18 in the late afternoon.',
    keyFacts: [
      'The public grounds at Roland Garros are genuinely accessible and the atmosphere is excellent — this is not a closed-circuit event',
      'Second-week access (after the first Monday) has the best tennis and the least crowded atmosphere',
      'Combines excellently with a Paris stay — the event runs into early June when Paris is at its best',
      'A Philippe Chatrier seat in the second week: book through official channels in March',
    ],
    budgetFrom: '€1,200 per person per day',
    bookBy: 'February for May/June',
    scale: 'Low five-figure for a two-day properly facilitated Paris + Roland Garros programme.',
  },

  // SAILING
  {
    id: 'voiles-st-tropez',
    name: 'Les Voiles de Saint-Tropez',
    dates: 'Late September to early October — annually',
    location: 'Saint-Tropez, France',
    category: 'sailing',
    tgcActive: false,
    accessStatement: 'The Voiles is the event that closes the Côte d\'Azur season. The question is whether you\'re watching from the quay, watching from a chartered boat, or racing. These are fundamentally different experiences.',
    loud: 'A hotel overlooking the quay, watching the fleet return in the evening, a restaurant table booked through the concierge, the usual Saint-Tropez scene',
    quiet: 'A berth on a participating classic yacht, or a chase boat following specific vessels. The evening gathering at the port is one of the best social events on the Riviera calendar. Access here is about who you know on the water.',
    keyFacts: [
      'The fleet includes classic yachts, one-designs, and modern racing yachts — the classic divisions are the most interesting to follow',
      'TGC\'s Riviera network includes yacht owners who race and can extend invitations to follow aboard',
      'Accommodation in Saint-Tropez in late September requires booking in June',
      'The prize-giving ceremony and dinner at the end of the week is the social centrepiece — access is by invitation',
    ],
    budgetFrom: '€2,000 per person per day (chase boat access)',
    bookBy: 'July for October',
    scale: 'A week properly facilitated is six-figure all-in for a couple.',
  },
  {
    id: 'cowes-week',
    name: 'Cowes Week',
    dates: 'First week of August — annually',
    location: 'Cowes, Isle of Wight',
    category: 'sailing',
    tgcActive: false,
    accessStatement: 'Cowes Week is one of the oldest and least glamorised sailing regattas in the world. Access is primarily social — the yacht clubs, the committee boats, the evening gatherings — not a spectator experience in the conventional sense.',
    loud: 'The spectator ferry, the main quay, a branded hospitality tent erected by a marine sponsor, branded kit',
    quiet: 'A berth on a racing yacht. Or failing that, an invitation to the Royal Yacht Squadron. The evening parties at the various club houses. A proper understanding of the racing before watching it.',
    keyFacts: [
      'The Royal Yacht Squadron is the world\'s most exclusive sailing club — the Castle is the event\'s social centre',
      'Racing yacht berths are arranged months in advance — TGC can facilitate introductions to skippers',
      'The Isle of Wight requires planning: hovercraft or Red Funnel ferry from Southampton, or a private tender',
      'Evening events on the water are the best part of Cowes Week — an invitation to a yacht for sundowners beats any land-based hospitality',
    ],
    budgetFrom: '£1,500 per person per day',
    bookBy: 'April for August',
    scale: 'Five-figure for two for a properly facilitated three-day Cowes programme.',
  },

  // ART FAIRS
  {
    id: 'art-basel',
    name: 'Art Basel',
    dates: 'June (Basel) / December (Miami) / March (Hong Kong)',
    location: 'Basel / Miami / Hong Kong',
    category: 'art',
    tgcActive: false,
    accessStatement: 'Art Basel is three separate markets in three separate moods. Basel is the primary market — serious collectors, serious galleries, serious money. Miami is the scene-and-see. Hong Kong is the access point to Asian collecting. Knowing which you\'re attending and why changes everything.',
    loud: 'Vernissage passes obtained via a gallery, an afternoon walk through the halls, a group dinner at Bâle\'s best restaurant booked through the hotel, a selfie with a Basquiat',
    quiet: 'A gallery introduction at the vernissage before public access. A curator or specialist accompanying for a focused half-day. One or two private studio visits or collector apartment viewings arranged around the fair. Basel itself — the city, not the hall — in the evenings.',
    keyFacts: [
      'The Vernissage (Tuesday) requires gallery invitation or Art Basel Patron membership — the gap between that and public opening days is significant',
      'Miami Basel is very different from Basel — social, noisy, less serious as a primary market',
      'The satellite fairs (Liste, Volta, Scope in Basel; Context, NADA in Miami) often have better value and more interesting work',
      'A specialist guide is the single highest-leverage investment at Art Basel — an untutored walk through the halls produces fatigue, not insight',
    ],
    budgetFrom: '€2,500 per person (facilitated)',
    bookBy: 'March for June (Basel); August for December (Miami)',
    scale: 'Five-figure for two for Basel week with hotel, facilitated access, and accompanying specialist.',
  },
  {
    id: 'frieze-london',
    name: 'Frieze London',
    dates: 'October — annually',
    location: 'Regent\'s Park, London',
    category: 'art',
    tgcActive: false,
    accessStatement: 'Frieze London is the fair with the best setting and the best-structured contemporary market outside of Art Basel. The question is not getting in — it\'s whether you\'re there to see or to buy, and shaping the visit accordingly.',
    loud: 'The general opening weekend, a one-day pass, the restaurant tent, a walk through the entire fair without a plan',
    quiet: 'VIP preview (Wednesday). A curated shortlist prepared in advance with a specialist. Frieze Masters (adjacent, often overlooked) on the same day. Lunch at a gallery dinner — there are several good ones on the Wednesday evening that TGC can facilitate introductions to.',
    keyFacts: [
      'VIP preview access requires a gallery invitation or a Frieze Arts Foundation membership',
      'Frieze Masters (Old Master, Modern, and post-war work) in the adjacent tent is frequently better value than Frieze London itself',
      'The Wednesday evening gallery dinners in Mayfair are the social centrepiece of the London art calendar',
      'October in London means Frieze, The Armory (not London), and the autumn auction season overlap — programme accordingly',
    ],
    budgetFrom: '£1,500 per person (VIP facilitated)',
    bookBy: 'July for October',
    scale: 'Low five-figure for two for a properly facilitated Frieze week programme.',
  },

  // PERFORMANCE
  {
    id: 'glyndebourne',
    name: 'Glyndebourne Festival Opera',
    dates: 'May to August — annually',
    location: 'Glyndebourne, East Sussex',
    category: 'performance',
    tgcActive: false,
    accessStatement: 'Glyndebourne is one of the very few cultural events in Britain where the form (the picnic, the dress code, the setting) is inseparable from the content. It is not a concert with dinner; it is a complete evening that requires a specific kind of preparation.',
    loud: 'Tickets bought on the open market, a picnic assembled at Waitrose that morning, morning suits because the website says so, confusion about when the interval is and how long it runs',
    quiet: 'A private box (available through the Glyndebourne development office) or a member\'s allocation. A picnic that is genuinely good — prepared three days before, brought in a proper hamper. An understanding of the production in advance. The long interval on the lawn as the intended second half of the evening.',
    keyFacts: [
      'The long interval (approximately 85 minutes) is the social centrepiece — the picnic should be designed for it, not rushed',
      'Box tickets are the most reliably good position; stalls are closer but often less comfortable for an opera of 3+ hours',
      'The Glyndebourne Touring Opera (autumn, smaller venues) is a fraction of the cost and frequently excellent',
      'The programme of operas rotates each season — the choice of production matters enormously',
      'Dress code: formal evening wear (not black tie) is standard; the rare exceptions are noted in the programme',
    ],
    budgetFrom: '£400 per person per performance',
    bookBy: 'February (member allocations open) or March (public)',
    scale: 'Low five-figure for two for a properly facilitated evening with private picnic and transport from London.',
  },
  {
    id: 'salzburg',
    name: 'Salzburg Festival',
    dates: 'Late July to end of August — annually',
    location: 'Salzburg, Austria',
    category: 'performance',
    tgcActive: false,
    accessStatement: 'Salzburg is the most serious opera and classical music festival in the world. The audience is different from any other festival — more informed, more international, more patient with difficult repertoire. Access is about which productions, which conductors, which seats.',
    loud: 'The most expensive ticket available to the Don Giovanni production that sold out in March. An evening in the Felsenreitschule without knowing the libretto. A hotel in the old town with a Mozart breakfast.',
    quiet: 'The right production in the right hall — the Kleines Festspielhaus for chamber opera, the Felsenreitschule for large-scale work that benefits from the rock face. A programme selected around a specific conductor or ensemble, not around availability. Dinner at a Gasthof on the Austrian side of the river rather than a tourist restaurant.',
    keyFacts: [
      'Festival tickets go on sale in late November/early December — the best productions sell out within days',
      'The Jedermann (Everyman) performance in the Domplatz is the most iconic event but not the finest music',
      'The Mozarteum concerts (separate from the Festival) are often excellent and far easier to obtain',
      'Salzburg itself requires only a short stay — two to three nights is ideal; longer requires building a full programme',
    ],
    budgetFrom: '€2,000 per person (facilitated, 3 performances)',
    bookBy: 'December for August',
    scale: 'Five-figure for two for a properly facilitated 3-night Salzburg programme.',
  },

  // GOLF
  {
    id: 'the-open',
    name: 'The Open Championship',
    dates: 'July — annually (rotates courses)',
    location: 'Rotating — St Andrews, Royal Liverpool, Royal Troon, etc.',
    category: 'golf',
    tgcActive: false,
    accessStatement: 'The Open is the most atmospheric major because it is played on links courses with genuine galleries and no rope management for most of the field. The access question is about following versus watching from a designated point.',
    loud: 'The hospitality village, a sponsored badge, watching from the 18th grandstand, a signed glove from the pro-am',
    quiet: 'Walking the course following a specific pairing. The right starting position on the first tee for the morning wave on the final day. Lunch at the club hosting the Open, not the hospitality village. A caddiemaster introduction if you want to understand the course.',
    keyFacts: [
      'Following a pairing for 18 holes requires a full course-wide badge — the general admission is not sufficient',
      'St Andrews years (2027 is the next) are the most significant — plan 18 months out',
      'The R&A issues hospitality packages through the club directly — these are different from commercial packages and more limited',
      'Course access on practice days (Monday/Tuesday) is far better than during the tournament for proximity and access',
    ],
    budgetFrom: '£2,000 per person (full event access facilitated)',
    bookBy: 'Previous October for July',
    scale: 'Low five-figure for two properly facilitated over three to four days.',
  },

  // FILM
  {
    id: 'cannes',
    name: 'Cannes Film Festival',
    dates: 'May — annually (11 days)',
    location: 'Cannes, France',
    category: 'film',
    tgcActive: false,
    accessStatement: 'Cannes is simultaneously one of the world\'s most important cultural events and one of the most over-catered for by the hospitality industry. The access tiers are very clearly defined and very clearly different in what they provide.',
    loud: 'A pass from a PR company. An invitation to a yacht party from a streaming platform. The Croisette. A dinner in a restaurant that has marked up 600% for the fortnight.',
    quiet: 'An accreditation that allows Palais access to screenings. The beach during the afternoon. The private dinner hosted by a distributor or producer for 20 people, not 200. The invitation to a villa screening rather than a yacht. An understanding of the programme before arriving.',
    keyFacts: [
      'Festival accreditation is tiered: Industry, Press, and various invitation levels — each tier sees different films',
      'The official selection screenings in the Lumière are the events that matter; the yacht parties are separate from this entirely',
      'The Cannes market (Marché du Film) runs parallel to the festival — this is where the serious industry business happens',
      'Accommodation: the Carlton, the Majestic, and the JW Marriott are the event hotels. All require booking 8-10 months in advance at significantly elevated rates.',
      'A villa in the hills above Cannes (20 minutes from the Palais) is often preferable to a hotel on the Croisette',
    ],
    budgetFrom: '€2,500 per person per day (facilitated)',
    bookBy: 'August for May',
    scale: 'A properly facilitated five-day Cannes programme for two is a high five-figure week.',
  },
]

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

function TGCVIPHospitality() {
  const [screen, setScreen] = useState('welcome')
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'all'>('all')
  const [selectedEvent, setSelectedEvent] = useState<VIPEvent | null>(null)
  const [brief, setBrief] = useState({
    party: '',
    occasion: '',
    priorities: [] as string[],
    datesConfirmed: '',
    budget: '',
    notes: '',
  })
  const [client, setClient] = useState({ name: '', email: '', phone: '' })
  const [loadedDraft, setLoadedDraft] = useState(false)
  const [refId, setRefId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.brief) setBrief(data.brief)
        if (data.client) setClient(data.client)
        if (data.eventId) {
          const ev = EVENTS.find(e => e.id === data.eventId)
          if (ev) setSelectedEvent(ev)
        }
        setLoadedDraft(true)
        setTimeout(() => setLoadedDraft(false), 4000)
      }
    } catch { /* first run */ }
  }, [])

  useEffect(() => {
    if (selectedEvent || brief.party) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          eventId: selectedEvent?.id,
          brief,
          client,
        }))
      } catch { /* storage unavailable */ }
    }
  }, [selectedEvent, brief, client])

  const resetAll = () => {
    setScreen('welcome')
    setCategoryFilter('all')
    setSelectedEvent(null)
    setBrief({ party: '', occasion: '', priorities: [], datesConfirmed: '', budget: '', notes: '' })
    setClient({ name: '', email: '', phone: '' })
    setRefId(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  const togglePriority = (p: string) => {
    setBrief(b => ({
      ...b,
      priorities: b.priorities.includes(p)
        ? b.priorities.filter(x => x !== p)
        : [...b.priorities, p],
    }))
  }

  const submitBrief = async () => {
    const id = `TGC-VIP-${Date.now().toString(36).toUpperCase()}`
    setRefId(id)
    const payload = {
      type: 'vip-hospitality',
      refId: id,
      submittedAt: new Date().toISOString(),
      event: { id: selectedEvent?.id, name: selectedEvent?.name, location: selectedEvent?.location, dates: selectedEvent?.dates },
      brief,
      client,
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

  const filteredEvents = categoryFilter === 'all'
    ? EVENTS
    : EVENTS.filter(e => e.category === categoryFilter)

  const s = {
    root: { minHeight: '100vh', background: '#F9F8F5', color: '#1a1815', fontFamily: "'Lato', sans-serif", padding: '40px 20px', lineHeight: 1.6 } as React.CSSProperties,
    container: { maxWidth: 960, margin: '0 auto' } as React.CSSProperties,
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 48, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' } as React.CSSProperties,
    brand: { fontFamily: "'Poppins', sans-serif", fontSize: 26, fontWeight: 400, letterSpacing: '0.02em', color: '#1a1815' } as React.CSSProperties,
    brandSub: { fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#c8aa4a', marginTop: 4 },
    h1: { fontFamily: "'Poppins', sans-serif", fontSize: 48, fontWeight: 400, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.01em' } as React.CSSProperties,
    h2: { fontFamily: "'Poppins', sans-serif", fontSize: 32, fontWeight: 400, lineHeight: 1.2, marginBottom: 12 } as React.CSSProperties,
    h3: { fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 400, lineHeight: 1.3, marginTop: 28, marginBottom: 10 } as React.CSSProperties,
    eyebrow: { fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#c8aa4a', marginBottom: 12 },
    bodyP: { fontSize: 16, marginBottom: 16, color: '#1a1815' } as React.CSSProperties,
    lead: { fontFamily: "'Poppins', sans-serif", fontSize: 22, lineHeight: 1.5, color: '#1a1815', marginBottom: 28, fontWeight: 400 } as React.CSSProperties,
    card: { background: '#F9F8F5', border: '1px solid #e5e7eb', padding: 24, marginBottom: 12, cursor: 'pointer', transition: 'all 0.2s', borderRadius: 8 } as React.CSSProperties,
    cardSelected: { borderColor: '#0e4f51', background: '#F9F8F5', boxShadow: '0 2px 8px rgba(14,79,81,0.08)' } as React.CSSProperties,
    cardTitle: { fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 400, marginBottom: 2, color: '#1a1815' } as React.CSSProperties,
    cardDesc: { fontSize: 13, color: '#0e4f51', lineHeight: 1.5 } as React.CSSProperties,
    button: { background: '#0e4f51', color: '#ffffff', border: 'none', padding: '14px 28px', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', borderRadius: 8 } as React.CSSProperties,
    buttonSecondary: { background: 'transparent', color: '#1a1815', border: '1px solid #e5e7eb', padding: '14px 28px', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 8 } as React.CSSProperties,
    buttonGold: { background: '#c8aa4a', color: '#ffffff', border: 'none', padding: '16px 32px', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 8 } as React.CSSProperties,
    buttonSmall: { background: 'transparent', color: '#0e4f51', border: '1px solid #e5e7eb', padding: '6px 14px', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4 } as React.CSSProperties,
    buttonSmallActive: { background: '#0e4f51', color: '#ffffff', border: '1px solid #0e4f51', padding: '6px 14px', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4 } as React.CSSProperties,
    input: { width: '100%', padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', background: '#F9F8F5', border: '1px solid #e5e7eb', color: '#1a1815', boxSizing: 'border-box' as const } as React.CSSProperties,
    textarea: { width: '100%', padding: '14px', fontSize: 15, fontFamily: 'inherit', background: '#F9F8F5', border: '1px solid #e5e7eb', color: '#1a1815', boxSizing: 'border-box' as const, resize: 'vertical' as const, minHeight: 80, lineHeight: 1.55 } as React.CSSProperties,
    label: { display: 'block', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: '#0e4f51', marginBottom: 6, marginTop: 16 } as React.CSSProperties,
    select: { width: '100%', padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', background: '#F9F8F5', border: '1px solid #e5e7eb', color: '#1a1815', boxSizing: 'border-box' as const } as React.CSSProperties,
    list: { paddingLeft: 0, listStyle: 'none' } as React.CSSProperties,
    listItem: { padding: '6px 0 6px 20px', position: 'relative' as const, fontSize: 14, color: '#1a1815', lineHeight: 1.55 } as React.CSSProperties,
    dash: { color: '#c8aa4a', position: 'absolute' as const, left: 0 },
    progress: { display: 'flex', gap: 4, marginBottom: 36 } as React.CSSProperties,
    progressDot: { height: 2, flex: 1, background: 'rgba(26, 24, 21, 0.15)' } as React.CSSProperties,
    progressDotActive: { height: 2, flex: 1, background: '#0e4f51' } as React.CSSProperties,
    draftNotice: { position: 'fixed' as const, bottom: 20, right: 20, background: '#0e4f51', color: '#ffffff', padding: '12px 20px', fontSize: 12, letterSpacing: '0.1em', zIndex: 100 } as React.CSSProperties,
    activeBadge: { display: 'inline-block', fontSize: 9, textTransform: 'uppercase' as const, letterSpacing: '0.2em', padding: '3px 8px', background: '#0e4f51', color: '#ffffff', marginLeft: 8 } as React.CSSProperties,
    primaryQuote: { fontFamily: "'Poppins', sans-serif", fontSize: 26, lineHeight: 1.35, color: '#1a1815', padding: '28px 36px', background: '#F9F8F5', borderLeft: '3px solid #c8aa4a', marginBottom: 32 } as React.CSSProperties,
    statRow: { display: 'flex', gap: 32, marginBottom: 28, flexWrap: 'wrap' as const },
    statBlock: { display: 'flex', flexDirection: 'column' as const, gap: 4 },
    statLabel: { fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#c8aa4a' },
    statValue: { fontFamily: "'Poppins', sans-serif", fontSize: 18, color: '#1a1815' } as React.CSSProperties,
    tgcOfferBox: { background: '#0e4f51', color: '#ffffff', padding: '24px 28px', marginBottom: 24, borderRadius: 8 } as React.CSSProperties,
    priorityChip: { display: 'inline-block', padding: '8px 16px', fontSize: 12, border: '1px solid #e5e7eb', cursor: 'pointer', margin: '4px', fontFamily: 'inherit', background: 'transparent', color: '#1a1815', borderRadius: 4 } as React.CSSProperties,
    priorityChipActive: { display: 'inline-block', padding: '8px 16px', fontSize: 12, border: '1px solid #0e4f51', cursor: 'pointer', margin: '4px', fontFamily: 'inherit', background: '#0e4f51', color: '#ffffff', borderRadius: 4 } as React.CSSProperties,
  }

  const screens = ['welcome', 'browse', 'event-detail', 'brief', 'client', 'confirmation']
  const currentIdx = screens.indexOf(screen)

  const renderWelcome = () => (
    <div>
      <div style={s.eyebrow}>VIP Hospitality Intelligence</div>
      <h1 style={s.h1}>Access is the question.<br />Attendance is easy.</h1>
      <div style={s.primaryQuote}>
        "Anyone can attend Monaco, Wimbledon, or Art Basel. A ticket, a hotel, and an itinerary will get you there. The question is whether you are inside the event or observing it. These are not the same experience."
      </div>
      <p style={s.bodyP}>
        Twenty curated events across motorsport, polo, horse racing, tennis, sailing, art, performance, golf, and film. For each, TGC maps the difference between attending and accessing. Where we have a specific offer, we'll tell you exactly what it is.
      </p>

      {/* TGC Active events */}
      <div style={{ marginTop: 36, marginBottom: 36 }}>
        <div style={s.eyebrow}>TGC Active: events where we have a direct offer</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginTop: 16 }}>
          {EVENTS.filter(e => e.tgcActive).map(ev => (
            <div key={ev.id} style={{ ...s.card, borderColor: '#0e4f51', background: '#F9F8F5', cursor: 'pointer' }}
              onClick={() => { setSelectedEvent(ev); setScreen('event-detail') }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 400, color: '#0e4f51' }}>{ev.name}</div>
                <span style={s.activeBadge}>TGC Active</span>
              </div>
              <div style={{ fontSize: 12, color: '#c8aa4a', marginTop: 6 }}>{ev.location} · {ev.dates}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8, lineHeight: 1.5 }}>{ev.tgcOffer?.slice(0, 120)}…</div>
            </div>
          ))}
        </div>
      </div>

      <button style={s.button} onClick={() => setScreen('browse')}>Browse all events →</button>
    </div>
  )

  const renderBrowse = () => (
    <div>
      <button style={{ ...s.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('welcome')}>← Back</button>
      <div style={s.eyebrow}>Browse events</div>
      <h2 style={s.h2}>Twenty events. Nine categories.</h2>
      <p style={s.bodyP}>Select an event to see TGC's access analysis and specific offer.</p>

      {/* Category filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28, marginTop: 8 }}>
        <button style={categoryFilter === 'all' ? s.buttonSmallActive : s.buttonSmall}
          onClick={() => setCategoryFilter('all')}>All</button>
        {CATEGORIES.map(c => (
          <button key={c.id}
            style={categoryFilter === c.id ? s.buttonSmallActive : s.buttonSmall}
            onClick={() => setCategoryFilter(c.id)}>{c.label}</button>
        ))}
      </div>

      <div>
        {filteredEvents.map(ev => (
          <div key={ev.id} style={{ ...s.card, ...(selectedEvent?.id === ev.id ? s.cardSelected : {}) }}
            onClick={() => { setSelectedEvent(ev); setScreen('event-detail') }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={s.cardTitle}>{ev.name}</span>
                {ev.tgcActive && <span style={s.activeBadge}>TGC Active</span>}
              </div>
              <div style={{ fontSize: 11, color: '#c8aa4a', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                {CATEGORIES.find(c => c.id === ev.category)?.label}
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#c8aa4a', marginTop: 4 }}>{ev.location} · {ev.dates}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8, lineHeight: 1.5 }}>{ev.accessStatement.slice(0, 100)}…</div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderEventDetail = () => {
    if (!selectedEvent) return null
    return (
      <div>
        <button style={{ ...s.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('browse')}>← Back to events</button>

        <div style={s.eyebrow}>
          {CATEGORIES.find(c => c.id === selectedEvent.category)?.label}
          {selectedEvent.tgcActive && <span style={{ ...s.activeBadge, marginLeft: 12 }}>TGC Active</span>}
        </div>
        <h2 style={s.h2}>{selectedEvent.name}</h2>

        <div style={s.statRow}>
          <div style={s.statBlock}>
            <span style={s.statLabel}>Location</span>
            <span style={s.statValue as React.CSSProperties}>{selectedEvent.location}</span>
          </div>
          <div style={s.statBlock}>
            <span style={s.statLabel}>Dates</span>
            <span style={s.statValue as React.CSSProperties}>{selectedEvent.dates}</span>
          </div>
          <div style={s.statBlock}>
            <span style={s.statLabel}>From</span>
            <span style={s.statValue as React.CSSProperties}>{selectedEvent.budgetFrom}</span>
          </div>
          <div style={s.statBlock}>
            <span style={s.statLabel}>Brief us by</span>
            <span style={s.statValue as React.CSSProperties}>{selectedEvent.bookBy}</span>
          </div>
        </div>

        <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 17, lineHeight: 1.7, color: '#6b7280', marginBottom: 28 }}>
          {selectedEvent.accessStatement}
        </p>

        {selectedEvent.tgcActive && selectedEvent.tgcOffer && (
          <div style={s.tgcOfferBox}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c8aa4a', marginBottom: 10 }}>TGC Active. Our specific offer.</div>
            <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 15, lineHeight: 1.65, margin: 0 }}>{selectedEvent.tgcOffer}</p>
          </div>
        )}

        <h3 style={s.h3}>Loud vs quiet</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          <div>
            <div style={s.eyebrow}>The loud version (to avoid)</div>
            <p style={{ fontSize: 14, color: '#1a1815', lineHeight: 1.6 }}>{selectedEvent.loud}</p>
          </div>
          <div>
            <div style={s.eyebrow}>The quiet version (what we'll build)</div>
            <p style={{ fontSize: 14, color: '#1a1815', lineHeight: 1.6 }}>{selectedEvent.quiet}</p>
          </div>
        </div>

        <h3 style={s.h3}>What you need to know</h3>
        <ul style={s.list}>
          {selectedEvent.keyFacts.map((f, i) => (
            <li key={i} style={s.listItem}><span style={s.dash}>—</span>{f}</li>
          ))}
        </ul>

        <h3 style={s.h3}>Commercial framing</h3>
        <div style={{ ...s.card, cursor: 'default', background: '#F9F8F5' }}>
          <p style={{ fontSize: 15, color: '#1a1815', margin: 0, lineHeight: 1.6 }}>{selectedEvent.scale}</p>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 12, marginBottom: 0, lineHeight: 1.55 }}>
            TGC's fee covers facilitation, introductions, and access management. Tickets and hospitality costs are passed through at cost.
          </p>
        </div>

        <div style={{ marginTop: 32 }}>
          <button style={s.button} onClick={() => setScreen('brief')}>Build my brief →</button>
        </div>
      </div>
    )
  }

  const renderBrief = () => {
    const partyOptions = [
      { value: 'solo', label: 'Solo' },
      { value: 'couple', label: 'Couple' },
      { value: 'group-small', label: 'Small group (3–8)' },
      { value: 'group-corporate', label: 'Corporate group (9–20)' },
    ]
    const occasionOptions = [
      { value: 'personal', label: 'Personal enjoyment' },
      { value: 'client-entertainment', label: 'Client entertainment' },
      { value: 'celebration', label: 'Personal celebration' },
      { value: 'partnership', label: 'Partner / sponsor activation' },
      { value: 'discovery', label: 'First time at this event' },
    ]
    const priorityOptions = [
      'Event access (best position, best view)',
      'Privacy and intimacy',
      'Networking and introductions',
      'Accommodation nearby or on-site',
      'Pre / post event programme',
      'A specific insider experience',
      'Child-friendly elements',
    ]
    const datesOptions = [
      { value: 'confirmed', label: 'Fully confirmed' },
      { value: 'flexible', label: 'Flexible within the event window' },
      { value: 'undecided', label: 'Not yet decided which day(s)' },
    ]
    const budgetOptions = [
      { value: 'under-5k', label: 'Under €5,000 total' },
      { value: '5-15k', label: '€5,000–15,000' },
      { value: '15-50k', label: '€15,000–50,000' },
      { value: '50k-plus', label: '€50,000+' },
      { value: 'open', label: 'Open — quality is the priority' },
    ]

    return (
      <div>
        <button style={{ ...s.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('event-detail')}>← Back</button>
        <div style={s.eyebrow}>Your brief — {selectedEvent?.name}</div>
        <h2 style={s.h2}>Four questions.</h2>
        <p style={s.bodyP}>We save as you go. The brief is reviewed by the Gatekeeper assigned to your event.</p>

        <label style={s.label}>Your party</label>
        <select style={s.select} value={brief.party} onChange={e => setBrief({ ...brief, party: e.target.value })}>
          <option value="">Select…</option>
          {partyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label style={s.label}>The occasion</label>
        <select style={s.select} value={brief.occasion} onChange={e => setBrief({ ...brief, occasion: e.target.value })}>
          <option value="">Select…</option>
          {occasionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label style={{ ...s.label, marginBottom: 12 }}>What matters most (select all that apply)</label>
        <div style={{ marginBottom: 8 }}>
          {priorityOptions.map(p => (
            <button key={p}
              style={brief.priorities.includes(p) ? s.priorityChipActive : s.priorityChip}
              onClick={() => togglePriority(p)}>{p}</button>
          ))}
        </div>

        <label style={s.label}>Dates</label>
        <select style={s.select} value={brief.datesConfirmed} onChange={e => setBrief({ ...brief, datesConfirmed: e.target.value })}>
          <option value="">Select…</option>
          {datesOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label style={s.label}>Budget framing</label>
        <select style={s.select} value={brief.budget} onChange={e => setBrief({ ...brief, budget: e.target.value })}>
          <option value="">Select…</option>
          {budgetOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
          Budget is a starting point for the conversation, not a commitment. Ticket and hospitality costs are passed through at cost.
        </p>

        <label style={s.label}>Anything else we should know (optional)</label>
        <textarea style={s.textarea} value={brief.notes}
          placeholder="e.g., we have two existing Wimbledon debentures and need help building the day around them; or: first-time at Cannes, want to understand the film side not the yacht side"
          onChange={e => setBrief({ ...brief, notes: e.target.value })} />

        <div style={{ marginTop: 32 }}>
          <button style={s.button} onClick={() => setScreen('client')}
            disabled={!brief.party || !brief.occasion || !brief.budget}>
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
      <p style={s.bodyP}>So the Gatekeeper for {selectedEvent?.name} can be in touch within 24 hours.</p>

      <label style={s.label}>Name</label>
      <input type="text" style={s.input} value={client.name} onChange={e => setClient({ ...client, name: e.target.value })} />

      <label style={s.label}>Email</label>
      <input type="email" style={s.input} value={client.email} onChange={e => setClient({ ...client, email: e.target.value })} />

      <label style={s.label}>Phone (with country code)</label>
      <input type="tel" style={s.input} value={client.phone} placeholder="+33 6 XX XX XX XX" onChange={e => setClient({ ...client, phone: e.target.value })} />

      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 24, lineHeight: 1.6 }}>
        Your brief is seen only by the Gatekeeper assigned to your event. We don't share details with hospitality providers before a mandate is agreed.
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
      <p style={s.lead}>Your brief for {selectedEvent?.name} is with us.</p>

      <div style={{ ...s.card, background: '#F9F8F5', cursor: 'default' }}>
        <div style={s.eyebrow}>Reference</div>
        <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 15, color: '#0e4f51', letterSpacing: '0.05em', margin: '4px 0 16px' }}>{refId}</div>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          <strong style={{ color: '#1a1815' }}>{selectedEvent?.name}</strong> · {selectedEvent?.location} · {brief.party} · {brief.occasion}
        </div>
      </div>

      <h3 style={s.h3}>What happens next</h3>
      <ul style={s.list}>
        <li style={s.listItem}><span style={s.dash}>—</span><strong>Within 24 hours:</strong> the Gatekeeper assigned to {selectedEvent?.name} will respond with a specific access proposal</li>
        <li style={s.listItem}><span style={s.dash}>—</span><strong>Within 72 hours:</strong> a discovery call to confirm the approach and any timing constraints</li>
        <li style={s.listItem}><span style={s.dash}>—</span><strong>Once agreed:</strong> TGC manages the access, logistics, and any programme around the event</li>
        {selectedEvent?.tgcActive && (
          <li style={s.listItem}><span style={s.dash}>—</span><strong>TGC Active event:</strong> your Gatekeeper has direct relationships here. Expect a faster and more specific response.</li>
        )}
      </ul>

      <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a href={CALENDAR_URL} target="_blank" rel="noopener noreferrer"
          style={{ ...s.buttonGold, textDecoration: 'none', display: 'inline-block' }}>
          Book discovery call
        </a>
        <button style={s.buttonSecondary} onClick={resetAll}>Brief another event</button>
      </div>
    </div>
  )

  const renderScreen = () => {
    switch (screen) {
      case 'welcome': return renderWelcome()
      case 'browse': return renderBrowse()
      case 'event-detail': return renderEventDetail()
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
        <div style={s.header}>
          <div>
            <div style={s.brand}>The Gatekeepers Club</div>
            <div style={s.brandSub}>VIP Hospitality Intelligence · v1</div>
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

export default function VIPHospitalityPage() {
  return <TGCVIPHospitality />
}
