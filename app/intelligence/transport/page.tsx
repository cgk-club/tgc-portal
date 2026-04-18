/* eslint-disable react/no-unescaped-entities, react/jsx-no-comment-textnodes */
'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useMemo } from 'react'
import { ChevronRight, ChevronLeft, RotateCcw, Check, Sparkles, TrendingUp, Clock, DollarSign, Briefcase, Heart, Zap, Shield, Save, X, MapPin, Search, Send, Plane, Car, Train, Anchor, Globe, AlertCircle, CheckCircle } from 'lucide-react'

const TGCTransportIntelligence = () => {
  const [screen, setScreen] = useState('welcome');
  const [plannerStep, setPlannerStep] = useState(0);
  const [calcMode, setCalcMode] = useState<string | null>(null);
  const [selectedCorridor, setSelectedCorridor] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string | null>>({
    purpose: null,
    travellers: null,
    frequency: null,
    priority: null,
    luggage: null,
    flexibility: null,
  });

  const [clientDetails, setClientDetails] = useState({
    name: '',
    email: '',
    phone: '',
    travelDate: '',
    returnDate: '',
    message: '',
  });

  const [calcInputs, setCalcInputs] = useState({
    mode: 'jet-mid',
    hoursPerYear: 50,
  });

  const [savedJourneys, setSavedJourneys] = useState<any[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');

  // ============ CORRIDOR DATA ============
  const corridorData = {
    regions: [
      { id: 'us-northeast-business', label: 'US Northeast — Business', continent: 'us' },
      { id: 'us-northeast-leisure', label: 'US Northeast — Leisure', continent: 'us' },
      { id: 'us-florida', label: 'US Florida', continent: 'us' },
      { id: 'us-ski-mountain', label: 'US Ski & Mountain', continent: 'us' },
      { id: 'us-west', label: 'US West', continent: 'us' },
      { id: 'uk-europe-hubs', label: 'UK / Europe — Hubs', continent: 'eu' },
      { id: 'europe-leisure-summer', label: 'Europe — Mediterranean', continent: 'eu' },
      { id: 'europe-alpine', label: 'Europe — Alpine', continent: 'eu' },
      { id: 'europe-other', label: 'Europe — Other', continent: 'eu' },
      { id: 'transatlantic', label: 'Transatlantic', continent: 'xa' },
    ],
    corridors: [
      // US Northeast Business
      { id: 'nyc-boston', name: 'New York — Boston', region: 'us-northeast-business', distanceKm: 306, defaultMode: 'Amtrak Acela First Class', defaultTag: 'city-centre to city-centre in 3h15', timeDefault: '3h15', reasons: ['Amtrak Acela First: Penn Station to Back Bay/South Station in 3h15 — the quiet winner on this corridor', 'Private jet to Hanscom or Boston Logan saves little end-to-end; wrap time erases the 45-minute flight advantage', 'Hanscom (BED) is the underused FBO pick for Cambridge, the 128 tech corridor, or Lexington/Concord'], alternative: 'Jet for groups of 4+ or non-standard schedules — Delta Shuttle Mint for 1-2 on a tight budget', price: '€240-400 per seat rail / €9-14k jet return', seasonality: 'Year-round' },
      { id: 'nyc-dc', name: 'New York — Washington DC', region: 'us-northeast-business', distanceKm: 360, defaultMode: 'Amtrak Acela First Class', defaultTag: 'the dominant business corridor answer', timeDefault: '2h55', reasons: ['Acela: Penn Station to Union Station in 2h55 — federal officials, DC lobbyists, and Wall Street default to it', 'Metropolitan Lounge both ends, proper meal, reliable wifi — works as a full workday', 'Private jet to DCA requires DASSP security clearance (7-10 days approval); IAD or Leesburg (JYO) are the practical alternatives'], alternative: 'Jet for groups of 4+ or security-sensitive travel', price: '€280-450 per seat rail / €11-16k jet return', seasonality: 'Year-round' },
      { id: 'nyc-philadelphia', name: 'New York — Philadelphia', region: 'us-northeast-business', distanceKm: 153, defaultMode: 'Acela or Chauffeur', defaultTag: 'do not fly this', timeDefault: '1h15 rail / 2h drive', reasons: ['Flight time is 20 minutes, but airport wrap at both ends makes it slower than the alternatives', 'Acela does the centre-to-centre run in 1h15 with no airport friction', 'A good chauffeur is often the sleeper pick for UHNW — door-to-door, accommodates 3-4 comfortably, allows phone calls'], alternative: 'Chauffeur wins if Manhattan origin is downtown and Philly destination is suburban (Main Line)', price: '€180-300 rail / €600-900 chauffeur', seasonality: 'Year-round' },
      { id: 'chicago-nyc', name: 'Chicago — New York', region: 'us-northeast-business', distanceKm: 1140, defaultMode: 'Commercial premium or Private jet', defaultTag: 'competitive either way', timeDefault: 'Jet 2h; Commercial 2h15', reasons: ['Commercial First (AA, United) is genuinely competitive on frequency and quality for 1-2 travellers', 'Private jet from Chicago Executive (PWK) makes sense for 3+ and for clients on the North Shore', 'Winter weather delays drive UHNW families to private for critical events — Chicago winters are unforgiving'], alternative: 'Jet for groups or schedule flexibility; commercial for solo/couple', price: '€500-1,300 commercial / €16-24k jet return', seasonality: 'Winter weather risk Dec-March' },

      // US Northeast Leisure
      { id: 'nyc-hamptons', name: 'New York — Hamptons', region: 'us-northeast-leisure', distanceKm: 180, defaultMode: 'Helicopter or seaplane', defaultTag: 'the summer Friday escape', timeDefault: '35-40 min vs 2-5h drive', reasons: ['Friday LIE traffic turns a 2-hour drive into 4-5+ hours; helicopter is a straight 35-minute shot', 'Blade Summer Pass at €2,900 locks in €730/seat all season; Blade 180 Pass (€23k) gives private Sikorsky access', 'Seaplane is the elegant answer for Sag Harbor / Shelter Island destinations — water landing, fewer road connections', 'Tote Taxi handles the oversized luggage separately — essential for golf clubs, boards, formal wardrobe'], alternative: 'Chauffeur off-peak (Sunday morning, Monday, mid-week) — helicopter makes no sense at 2-hour ground times', price: '€550-730 per seat / €4,400-7,400 private', seasonality: 'Memorial Day through Labor Day', tgcCoverage: 'active' },
      { id: 'nyc-nantucket', name: 'New York — Nantucket', region: 'us-northeast-leisure', distanceKm: 370, defaultMode: 'Private jet (light)', defaultTag: 'classic summer-house corridor', timeDefault: '70 min flight', reasons: ['Commercial alternative is thin and seasonal; private jet is the default for any family with summer-house volume', 'ACK slot restrictions in August weekends — book 10-14 days ahead', 'Light jet (Phenom 300, CJ3+) is the sweet spot; mid-size is overkill'], alternative: 'JetBlue Mint seasonal service is a real alternative for couples without volume luggage; Tradewind PC-12 shared at €400-600/seat', price: '€11-18k jet return / €500-900 Mint', seasonality: 'Peak Jun-Aug' },
      { id: 'nyc-marthas-vineyard', name: 'New York — Martha\'s Vineyard', region: 'us-northeast-leisure', distanceKm: 340, defaultMode: 'Private jet (light) or Tradewind', defaultTag: 'more alternatives than Nantucket', timeDefault: '60 min flight', reasons: ['MVY has more commercial options than ACK (JetBlue, Delta seasonal) — budget-conscious clients have alternatives', 'Tradewind PC-12 shared at €380-550/seat is the underappreciated middle option', 'Signature FBO at MVY handles most UHNW traffic with discretion'], alternative: 'Ferry from mainland if relocating a car', price: '€10.5-16.5k jet return / €380-550 Tradewind', seasonality: 'Peak Jun-Aug' },
      { id: 'boston-nantucket', name: 'Boston — Nantucket', region: 'us-northeast-leisure', distanceKm: 145, defaultMode: 'Cape Air or Tradewind', defaultTag: 'everyone takes Cape Air', timeDefault: '50 min', reasons: ['Cape Air scheduled Cessna 402 at €180-300 is the local default — the social context matters here', 'Tradewind PC-12 shared at €450-650 per seat for those wanting a slight step up', 'Private charter only for groups of 4+ or non-standard timing'], alternative: 'Private charter if group size or schedule demands it', price: '€180-300 Cape Air / €4.5-8k private', seasonality: 'Year-round, peak Jun-Aug' },

      // US Florida
      { id: 'nyc-miami', name: 'New York — Miami', region: 'us-florida', distanceKm: 1760, defaultMode: 'Private jet (mid-size)', defaultTag: 'the canonical snowbird corridor', timeDefault: '2h45', reasons: ['Winter migration (Oct-Apr) is the core UHNW pattern — every serious family does this route', 'OPF (Opa-Locka) for Miami Beach/Brickell; TMB for Key Biscayne/Coconut Grove; FXE for Boca', 'MIA commercial is one of the worst UHNW terminals in North America — tired, congested — which alone justifies private'], alternative: 'Commercial First (Delta One, JetBlue Mint) for couples on budget; empty-legs are one of the most active US corridors', price: '€22-32k jet return / €700-1,900 First', seasonality: 'Peak Nov-April' },
      { id: 'nyc-palm-beach', name: 'New York — Palm Beach', region: 'us-florida', distanceKm: 1680, defaultMode: 'Private jet (mid-size)', defaultTag: 'tight UHNW market, jet density extraordinary', timeDefault: '2h30', reasons: ['Palm Beach is a tighter UHNW market than Miami — jet density at PBI on a Thursday in January is staggering', 'PBI is the dominant FBO; Lantana (LNA) and Boca Executive (BCT) for specific home locations', 'The Breakers, Mar-a-Lago, Palm Beach Country Club generate most of the traffic'], alternative: 'JetBlue or Delta to PBI (€900-1,900 First) for couples', price: '€22-30k jet return', seasonality: 'Mid-Nov through Easter' },
      { id: 'miami-nantucket', name: 'Miami — Nantucket', region: 'us-florida', distanceKm: 2100, defaultMode: 'Private jet (super-mid)', defaultTag: 'the classic seasonal migration', timeDefault: '3h', reasons: ['No viable commercial direct — MIA-BOS-ACK adds 2+ hours with aircraft change', 'Super-mid is the right size; flies non-stop; handles family summer-house luggage', 'Memorial Day northbound / Labor Day southbound — the canonical dates'], alternative: 'None practical — this is a jet-only corridor for UHNW', price: '€32-48k return', seasonality: 'May-June (north), Sep-Oct (south)' },
      { id: 'miami-palm-beach', name: 'Miami — Palm Beach', region: 'us-florida', distanceKm: 110, defaultMode: 'Helicopter', defaultTag: 'I-95 in season makes this easy', timeDefault: '12 min helicopter / 1.5-3h drive', reasons: ['I-95 between Miami and Palm Beach in season (November-April) is consistently unreliable — 1.5-3h in traffic', 'Helicopter: OPF or TMB to PBI or LNA in 12 minutes — the easiest private aviation case in Florida', 'Blade and Helicopter Adventures operate this corridor with scheduled departures from Miami-Opa Locka'], alternative: 'Chauffeur in reverse-rush traffic (Sunday evening south, Thursday morning north) — occasionally competitive', price: '€650-900 per seat shared / €3,500-5,500 private helicopter', seasonality: 'Peak Nov-April', tgcCoverage: 'active' },

      // US Ski & Mountain
      { id: 'nyc-aspen', name: 'New York — Aspen', region: 'us-ski-mountain', distanceKm: 2720, defaultMode: 'Private jet (super-mid)', defaultTag: 'super-mid mandatory for the altitude', timeDefault: '4h', reasons: ['Aspen-Pitkin (ASE) at 7,820ft elevation restricts aircraft — not every light jet can operate under specific temperature/weight combinations', 'Super-mid (Challenger 350, G280, Citation Longitude) is the safe default; TEB-ASE non-stop', 'EGE (Eagle County/Vail) is the 90-min backup when ASE weather or slot restricts — build it into the client conversation'], alternative: 'Commercial via DEN is 6-8h total — a poor alternative unless budget-driven', price: '€32-50k super-mid return', seasonality: 'Peak Thanksgiving, Christmas-NYE, Presidents Day, March spring break' },
      { id: 'nyc-jackson-hole', name: 'New York — Jackson Hole', region: 'us-ski-mountain', distanceKm: 2880, defaultMode: 'Private jet (super-mid)', defaultTag: 'less press than Aspen, more relaxed', timeDefault: '4h15', reasons: ['Jackson is a quieter UHNW destination — no altitude restrictions anywhere near ASE\'s level', 'JAC has one FBO (Jackson Hole Aviation) — simple operations', 'Summer (Jul-Aug) for Yellowstone/Grand Teton is quietly busier than winter for private aviation'], alternative: 'Commercial via DEN/SLC/ORD — First €1,200-2,800, but 6-7h total with connection', price: '€35-50k return', seasonality: 'Peak Christmas-NYE, MLK, Presidents Day; summer Jul-Aug' },
      { id: 'la-aspen', name: 'Los Angeles — Aspen', region: 'us-ski-mountain', distanceKm: 1215, defaultMode: 'Private jet (light or mid)', defaultTag: 'ASE performance sign-off required', timeDefault: '2h15', reasons: ['Light jets sometimes cannot operate ASE under specific altitude/weight combinations — always check the operator\'s performance calc', 'VNY to ASE is straightforward for certified crews; EGE as the 90-min backup', 'Mid-size (Challenger 350, G280) for groups of 6+ with ski equipment'], alternative: 'Empty-legs Aspen-LA common early in season', price: '€17-25k light / €25-35k mid return', seasonality: 'Dec-March ski; Jul-Aug summer season' },

      // US West
      { id: 'la-sf', name: 'Los Angeles — San Francisco', region: 'us-west', distanceKm: 615, defaultMode: 'JSX semi-private or Private jet (light)', defaultTag: 'California has world\'s best commercial premium', timeDefault: '1h10', reasons: ['JSX semi-private (Embraer 135 from Burbank to San Carlos) is the underappreciated pick — 20-min check-in, private terminals, €300-600 per seat', 'Van Nuys (VNY) to San Carlos (SQL) is the dominant UHNW private corridor; SQL best for Atherton, Woodside, Palo Alto', 'Commercial First is short, frequent, often direct airport-to-airport — €250-550 one-way'], alternative: 'Private jet for 4+ or schedule flexibility', price: '€300-600 JSX / €8.5-14k jet return', seasonality: 'Year-round' },
      { id: 'la-vegas', name: 'Los Angeles — Las Vegas', region: 'us-west', distanceKm: 430, defaultMode: 'Private jet (light)', defaultTag: 'one of the best empty-leg corridors', timeDefault: '55 min', reasons: ['Empty-legs are consistently available — always check before quoting full charter', 'Henderson Executive (HND) preferred for Strip destinations; VGT for north Vegas/Summerlin', 'High-frequency UHNW movement: casino hosts, F1 weekend, major fights, CES'], alternative: 'Commercial at €200-500 is perfectly adequate for solo travellers not on a whale-level casino relationship', price: '€5-9.5k return (often cheaper via empty-leg)', seasonality: 'Year-round; peak F1 (Nov), CES (Jan)' },
      { id: 'nyc-la', name: 'New York — Los Angeles', region: 'us-west', distanceKm: 3940, defaultMode: 'Commercial First (1-2 pax) or Heavy jet', defaultTag: 'best US domestic premium cabins on this route', timeDefault: '5h30 westbound', reasons: ['JFK-LAX is where American and Delta invest their best hardware — real suites, real meals, real sleep', 'Below 4 travellers, Commercial First is genuinely excellent — AA Flagship First, Delta One Suites, JetBlue Mint Studio', 'Private jet answer kicks in at 4+ travellers, schedule non-standard, or security/privacy sensitivity'], alternative: 'Red-eye LAX-JFK is a genuine sleep — suited to UHNW with Monday morning meetings', price: '€2.5-6.5k First / €50-80k super-mid / €75-120k heavy', seasonality: 'Year-round' },
      { id: 'la-santa-barbara', name: 'Los Angeles — Santa Barbara', region: 'us-west', distanceKm: 155, defaultMode: 'Helicopter', defaultTag: 'PCH traffic makes air the obvious answer', timeDefault: '25 min helicopter / 1.5-3h drive', reasons: ['Pacific Coast Highway and US-101 in weekend traffic is genuinely slow — 2-3h door-to-door by road', 'Helicopter from VNY or SMO to Santa Barbara Municipal (SBA) in 25 min', 'Light jet is overkill for this distance — helicopter is the correct format'], alternative: 'Chauffeur mid-week when traffic is manageable', price: '€2,200-3,800 helicopter per leg', seasonality: 'Year-round; peak Jul-Sep' },

      // UK / Europe Hubs
      { id: 'london-paris', name: 'London — Paris', region: 'uk-europe-hubs', distanceKm: 344, defaultMode: 'Eurostar Premier', defaultTag: 'rail wins decisively', timeDefault: '2h16', reasons: ['Eurostar Premier: St Pancras to Gare du Nord in 2h16, city-centre to city-centre — the canonical European business day', 'Premier lounge both ends (excellent cocktail bar at St Pancras), 3-course meal with champagne, fast-track, fully flexible tickets', 'The jet alternative adds 2h of airport time, costs 10x, and arrives further from Paris than Gare du Nord'], alternative: 'Jet only for groups of 4+ on unusual schedules, or connecting transatlantic via LBG/CDG', price: '€280-650 Premier / €150-250 Plus / €9-14k jet return', seasonality: 'Year-round', tgcCoverage: 'active' },
      { id: 'london-amsterdam', name: 'London — Amsterdam', region: 'uk-europe-hubs', distanceKm: 480, defaultMode: 'Eurostar Direct', defaultTag: 'the marginal rail case', timeDefault: '3h55-4h', reasons: ['Eurostar Direct at 4h is the outer edge for rail dominance — many business travellers still prefer it for city-centre arrival', 'LCY to AMS commercial flight is 1h15 — edges the rail answer for same-day-return meetings', 'EES (Entry-Exit System) rollout in 2026 may add time to Eurostar border checks — monitor'], alternative: 'LCY-AMS commercial (BA CityFlyer, KLM) for time-critical trips', price: '€180-450 rail / €200-550 commercial', seasonality: 'Year-round' },
      { id: 'london-brussels', name: 'London — Brussels', region: 'uk-europe-hubs', distanceKm: 322, defaultMode: 'Eurostar Premier', defaultTag: 'classic rail corridor', timeDefault: '2h', reasons: ['St Pancras to Brussels Midi in 2h — no sensible debate', 'Rail wins on time, carbon, and comfort', 'Jet only surfaces for 4+ pax or if the actual destination is Antwerp rather than Brussels'], alternative: 'Commercial LCY-BRU for solo schedule flexibility', price: '€180-500 Premier', seasonality: 'Year-round' },
      { id: 'london-frankfurt', name: 'London — Frankfurt', region: 'uk-europe-hubs', distanceKm: 700, defaultMode: 'Commercial premium', defaultTag: 'a flying corridor', timeDefault: '1h40', reasons: ['Eurostar doesn\'t reach deep enough into Germany for rail to compete — 5h+ with connection', 'BA Club Europe or Lufthansa Business is the pragmatic answer for solo/couple', 'Egelsbach (QEF) is the preferred Frankfurt private field — closer to banking district than FRA by ground'], alternative: 'Private jet for 4+ or schedule sensitivity', price: '€400-800 commercial / €13-20k jet return', seasonality: 'Year-round; banking peaks Q1/Q4' },
      { id: 'london-geneva', name: 'London — Geneva', region: 'uk-europe-hubs', distanceKm: 745, defaultMode: 'Private jet (light) or Commercial premium', defaultTag: 'core UHNW corridor', timeDefault: '1h30 jet / 1h50 commercial', reasons: ['Geneva is a core UHNW destination — finance, family offices, Le Rosey school runs, Alpine second homes', 'Very high private jet traffic means empty-legs appear regularly', 'Geneva Business Aviation Centre is the address UHNW clients expect — not a generic FBO'], alternative: 'Swiss or BA Club Europe for solo business', price: '€14-22k jet return / €350-1,100 commercial', seasonality: 'Peak Dec-March (ski) and school term-breaks', tgcCoverage: 'active' },
      { id: 'london-zurich', name: 'London — Zurich', region: 'uk-europe-hubs', distanceKm: 780, defaultMode: 'Commercial premium or Private jet', defaultTag: 'Swiss Business is class-leading', timeDefault: '1h50', reasons: ['Swiss Business on LHR-ZRH is one of the best short-haul premium products in Europe — real seat, real meal, excellent service', 'Jet kicks in for 4+ travellers or onward connections to St Moritz/Davos', 'ZRH FBO: Jet Aviation HQ; Dübendorf (ex-military) closer to city than ZRH by some measures'], alternative: 'Jet for groups or ski-season onward', price: '€500-1,400 Swiss Business / €14.5-23k jet return', seasonality: 'Year-round; ski peak Dec-March' },
      { id: 'london-milan', name: 'London — Milan', region: 'uk-europe-hubs', distanceKm: 960, defaultMode: 'Private jet (light/mid)', defaultTag: 'Linate\'s city proximity tips this to private', timeDefault: '1h55', reasons: ['Milan Linate (LIN) is 10 minutes from Duomo — no other European jet destination has this centrality', 'For Fashion Week, Salone del Mobile, or any client whose day starts at a palazzo at 10am, LIN is the right answer', 'LIN slot-restricted in March (Salone) and September (Fashion Week) — book 2-4 weeks ahead'], alternative: 'BA or ITA Business for solo/couple off-peak', price: '€16-26k jet return / €400-1,300 commercial', seasonality: 'Peak Fashion Weeks, Salone del Mobile' },
      { id: 'london-nice-monaco', name: 'London — Nice / Monaco', region: 'uk-europe-hubs', distanceKm: 1008, defaultMode: 'Private jet (light)', defaultTag: 'the single most valuable European summer corridor', timeDefault: '2h jet / 7min helicopter onward', reasons: ['Summer (May-Sept) is pure private jet territory — Monaco GP (late May), Cannes (mid-May), August, Yacht Show (late Sept)', 'Biggin Hill most economical London option; Farnborough most luxurious; Cannes-Mandelieu (CEQ) best for Cannes or St Tropez onward', 'The onward Nice-Monaco helicopter via Monacair (7 min, €195-450/seat) is essential for any Monaco-bound client'], alternative: 'BA or easyJet to NCE off-season; La Compagnie seasonal direct if available', price: '€7-12k one-way jet / €13-25k return / €250-850 commercial', seasonality: 'Peak May-Sep; events-driven', tgcCoverage: 'active' },
      { id: 'paris-bordeaux', name: 'Paris — Bordeaux', region: 'uk-europe-hubs', distanceKm: 585, defaultMode: 'TGV (2h04)', defaultTag: 'the train wins decisively', timeDefault: '2h04 rail vs 5h+ door-to-door jet', reasons: ['TGV at 2h04 Montparnasse to Bordeaux Saint-Jean is city-centre to city-centre — the jet alternative adds 2h minimum', 'Business First (1ère Classe) with meal reservation is genuinely comfortable at €180-380', 'Private jet to Mérignac then transfer to city: 35 min flight + 30 min ground = 2h10 minimum from Paris door'], alternative: 'Jet for groups of 4+ with weekend châteaux plans and onward ground transport already in place', price: '€180-380 TGV First / €14-22k jet return', seasonality: 'Year-round; Bordeaux harvest Sep-Oct', tgcCoverage: 'active' },
      { id: 'london-edinburgh', name: 'London — Edinburgh', region: 'uk-europe-hubs', distanceKm: 660, defaultMode: 'LNER Azuma First Class', defaultTag: 'rail is the civilised answer', timeDefault: '4h20 rail / 1h20 flight + wrap', reasons: ['LNER Azuma First at 4h20 King\'s Cross to Edinburgh Waverley — city centres, no airport friction, proper east coast scenery', 'Caledonian Sleeper (overnight) for clients who want to arrive fresh in Edinburgh or avoid city-day travel', 'Jet to EDI: 1h20 flight + 1h London wrap + 40min Edinburgh ground = 3h10 minimum — the time saving is real but the premium is 10x'], alternative: 'Private jet for 4+ or for clients continuing to Highland estates (Inverness, Wick, private strips)', price: '€120-350 LNER First / €13-20k jet return', seasonality: 'Year-round; grouse season Aug-Sep' },

      // Europe Leisure Summer
      { id: 'nice-monaco', name: 'Nice — Monaco', region: 'europe-leisure-summer', distanceKm: 25, defaultMode: 'Helicopter (summer) or Chauffeur', defaultTag: 'the decision point: traffic on the Basse Corniche', timeDefault: '7 min helicopter / 25min-2h drive', reasons: ['Helicopter is right between late May and September or during Grand Prix/Cannes — 7 minutes vs 2 hours in traffic', 'Monacair\'s scheduled service (€160-195 off-peak, €450 GP weekend) includes driver from heliport to Monaco hotel', 'Off-season a chauffeur is cheaper, quieter, door-to-door — the decision is traffic, not luxury'], alternative: 'TER regional train (€5, 25 min) exists but is not for UHNW', price: '€160-450 scheduled helicopter / €120-200 chauffeur', seasonality: 'Helicopter peak May-Sep', tgcCoverage: 'active' },
      { id: 'nice-st-tropez', name: 'Nice — St Tropez', region: 'europe-leisure-summer', distanceKm: 95, defaultMode: 'Helicopter (summer)', defaultTag: 'no viable road answer in August', timeDefault: '25 min helicopter / 1.5-4h drive', reasons: ['August weekend Gulf traffic is impassable — 3-4+ hours for a 95km drive', 'Helicopter (A109 or H130) to La Môle airport or ST-T heliport at Ramatuelle', 'If yacht-based, tender from anchorage to Vieux Port is the elegant answer'], alternative: 'Chauffeur off-peak (shoulder season, weekdays) — €350-650', price: '€1,500-3,500 per leg helicopter', seasonality: 'Peak Jun-Sep', tgcCoverage: 'active' },
      { id: 'nice-portofino', name: 'Nice — Portofino', region: 'europe-leisure-summer', distanceKm: 175, defaultMode: 'Helicopter (summer)', defaultTag: 'a yacht-first destination', timeDefault: '45 min helicopter / 2.5-4h drive', reasons: ['Portofino is primarily a yacht destination — helicopter is for clients staying at Splendido Mare or waterfront villas', 'NCE to Rapallo or Santa Margherita Ligure helipad, 45 min, €3,500-6,500 per leg', 'The drive is scenic but long and slow in season'], alternative: 'Chauffeur off-season or for clients extending to Cinque Terre', price: '€3,500-6,500 helicopter / €550-900 chauffeur', seasonality: 'Peak Jun-Sep' },
      { id: 'milan-portofino', name: 'Milan — Portofino', region: 'europe-leisure-summer', distanceKm: 175, defaultMode: 'Chauffeur', defaultTag: 'the scenery is part of the weekend', timeDefault: '2h30', reasons: ['The scenery once you hit the Ligurian coast is part of the experience — the drive is civilized for 2-4 travellers', 'Rail via Frecciabianca to Santa Margherita Ligure is 2h30 for €60-180 first class — pleasant alternative', 'Helicopter only for time pressure'], alternative: 'Helicopter for same-day turnaround or severe time constraint', price: '€350-600 chauffeur / €60-180 rail / €3.2-5.5k helicopter', seasonality: 'Year-round, peak Jun-Sep' },
      { id: 'milan-sardinia', name: 'Milan — Sardinia (Olbia)', region: 'europe-leisure-summer', distanceKm: 600, defaultMode: 'Private jet (light)', defaultTag: 'OLB busiest private field in Europe first two weeks of August', timeDefault: '1h20', reasons: ['LIN to Olbia (OLB) non-stop on a light jet, 1h20', 'Porto Cervo helipad is 15 min by air from OLB vs 35-50 min by road for Costa Smeralda', 'Commercial (ITA, Volotea) for budget-conscious; empty-legs on return common'], alternative: 'Commercial at €200-800 if budget-driven', price: '€13-22k jet return', seasonality: 'Peak Aug 1-20' },
      { id: 'athens-mykonos', name: 'Athens — Mykonos', region: 'europe-leisure-summer', distanceKm: 160, defaultMode: 'Private jet (light) or Helicopter', defaultTag: 'almost always a private hop from ATH', timeDefault: '30 min jet / 45 min helicopter', reasons: ['For UHNW landing in Athens on a long-haul, the onward is almost always private — jet or helicopter', 'ATH-JMK light jet, 30 min, €5,500-10,000 return', 'Fast ferry (SeaJets) used by UHNW more than expected — 2h45 and pleasant in good weather'], alternative: 'Aegean or Sky Express commercial at €80-400 for budget', price: '€5.5-10k jet / €4.5-8k helicopter / €60-160 fast ferry', seasonality: 'Peak Jun-Sep' },
      { id: 'london-ibiza', name: 'London — Ibiza', region: 'europe-leisure-summer', distanceKm: 1445, defaultMode: 'Private jet (light/mid)', defaultTag: 'classic August UHNW destination', timeDefault: '2h30', reasons: ['IBZ slot restrictions in high summer — book 2-3 weeks ahead in August', 'For clients attending Pacha/Ushuaïa nights: jet in Friday, stay 3-4 days, jet out — no airport friction', 'Onward helicopter to Formentera (8 min, €300-500/seat) is the final flourish'], alternative: 'Commercial (BA, easyJet, Vueling) off-peak', price: '€18-30k jet return / €250-900 commercial', seasonality: 'Peak late Jul-late Aug' },
      { id: 'london-mykonos', name: 'London — Mykonos', region: 'europe-leisure-summer', distanceKm: 2525, defaultMode: 'Private jet (mid-size)', defaultTag: 'the connection ritual is the reason', timeDefault: '3h30', reasons: ['Direct private jet in 3h30 vs 6-7h via Athens connection — the latter kills the weekend start', 'JMK is a Cat B airport with some aircraft type restrictions — check at quote stage', 'Book ground (driver or helicopter) at same time as jet — Mykonos taxis chaotic in August'], alternative: 'BA + Aegean Business via ATH for budget, €800-2,500', price: '€32-48k jet return', seasonality: 'Peak Jun-Sep' },
      { id: 'monaco-sardinia', name: 'Monaco — Sardinia (Olbia)', region: 'europe-leisure-summer', distanceKm: 600, defaultMode: 'Helicopter or Private jet', defaultTag: 'summer marina-to-marina', timeDefault: '1h15 jet / 1h45 helicopter', reasons: ['For yacht-based clients moving between Monaco and Porto Cervo, helicopter or light jet is the natural answer', 'Olbia (OLB) to Porto Cervo is 40 min by road — Sardinia helicopter transfer available to Costa Smeralda direct', 'August: OLB is extremely slot-constrained — book 3-4 weeks minimum'], alternative: 'Fast ferry (Corsica Sardinia Ferries) for vehicle relocation — 8-12h', price: '€3,800-5,500 helicopter / €12-20k jet', seasonality: 'Peak Jun-Sep', tgcCoverage: 'active' },
      { id: 'barcelona-ibiza', name: 'Barcelona — Ibiza', region: 'europe-leisure-summer', distanceKm: 235, defaultMode: 'Private jet (light) or fast ferry', defaultTag: 'jet for speed, ferry for experience', timeDefault: '40 min jet / 5h30 fast ferry', reasons: ['Barcelona is Ibiza\'s natural hub — light jet from El Prat (BCN) or Sabadell (QSA) to IBZ in 40 min', 'Baleària fast ferry (8h) or Trasmediterranea jet ferry (5h30) — the overnight option is occasionally right for clients moving a vehicle or boat', 'IBZ in August: same slot restrictions as Balearics generally — book 2-3 weeks ahead for precise departure times'], alternative: 'Vueling or Iberia commercial at €100-400 for off-season travel', price: '€12-20k jet return / €80-280 commercial / €100-350 ferry', seasonality: 'Peak Jul-Aug' },
      { id: 'palma-ibiza', name: 'Palma — Ibiza', region: 'europe-leisure-summer', distanceKm: 160, defaultMode: 'Helicopter or fast ferry', defaultTag: 'the inter-island question', timeDefault: '40 min helicopter / 2h15 ferry', reasons: ['Helicopter is the right answer when time is the constraint — 40 min Palma to Ibiza helipad', 'Fast ferry (Baleàlia Lines) in 2h15 is genuinely pleasant in good weather and considerably cheaper', 'For clients doing the island circuit (Mallorca-Ibiza-Formentera), helicopter links make the most sense'], alternative: 'Commercial (Vueling, Air Europa) at €80-250 when schedule flexibility exists', price: '€2,800-4,500 helicopter / €50-160 commercial / €40-120 ferry', seasonality: 'Peak Jun-Sep' },
      { id: 'athens-santorini', name: 'Athens — Santorini', region: 'europe-leisure-summer', distanceKm: 230, defaultMode: 'Helicopter or Private jet (light)', defaultTag: 'helicopter for arrival experience', timeDefault: '35 min helicopter / 45 min jet / 8h ferry', reasons: ['Helicopter landing at Santorini helipad (Fira) — the drama of arrival from the air over the caldera is part of the experience', 'Light jet to JTR in 45 min from ATH — correct for groups or clients continuing to another island', 'SeaJets fast ferry: 5-8h depending on route, occasionally right for couples with no time constraint'], alternative: 'Aegean or Sky Express commercial (€80-350) for off-season', price: '€3,500-6,500 helicopter / €7-12k jet return / €60-200 fast ferry', seasonality: 'Peak May-Sep', tgcCoverage: 'active' },

      // Europe Alpine
      { id: 'geneva-courchevel', name: 'Geneva — Courchevel', region: 'europe-alpine', distanceKm: 150, defaultMode: 'Helicopter (weather permitting) + Chauffeur Plan B', defaultTag: 'always have ground backup', timeDefault: '30-35 min helicopter / 2.5-5h drive', reasons: ['Helicopter is the premier answer when weather cooperates — 30-35 min vs 2.5-5h Saturday drive', 'Courchevel Altiport (LFLJ) is 2,008m elevation with a 537m sloped runway — among Europe\'s most operationally restricted airports', 'For families with children, dogs, and three weeks of luggage, the drive is often the correct answer anyway'], alternative: 'TGC Route — branded drive with winemaker lunch and scenic stop, €1,400-2,200 fixed; or Eurostar ski train to Moûtiers', price: '€2,750 shared / €1,990-4,200 private helicopter / €600-1,100 chauffeur', seasonality: 'Peak Dec-March', tgcCoverage: 'active' },
      { id: 'geneva-verbier', name: 'Geneva — Verbier', region: 'europe-alpine', distanceKm: 130, defaultMode: 'Chauffeur or Helicopter', defaultTag: 'Swiss side is quieter than French Alps', timeDefault: '2h drive / 25 min helicopter', reasons: ['Swiss side means less chaotic traffic than Courchevel — 2h off-peak, 3-4h Saturday', 'Helicopter to Verbier heliport (Croix de Coeur) in 25 min', 'A good chauffeur beats the helicopter unless traffic is genuinely wild'], alternative: 'Rail to Le Châble with funicular up — authentic but slow', price: '€500-900 chauffeur / €3.5-5.5k helicopter', seasonality: 'Peak Dec-March' },
      { id: 'zurich-st-moritz', name: 'Zurich — St Moritz', region: 'europe-alpine', distanceKm: 200, defaultMode: 'Helicopter, Chauffeur, or Bernina Express', defaultTag: 'the train IS the experience for leisure', timeDefault: '40 min helicopter / 3h drive / 3h20 rail', reasons: ['Bernina Express on the Rhaetian Railway is one of the great train journeys in the world — seriously consider it for off-peak leisure', 'Helicopter to Samedan (SMV) or St Moritz helipad in 40 min for time-pressed arrivals', 'Private jet direct to SMV (1,707m runway, 5,600ft) on light jet/turboprop for ultra-time-critical days'], alternative: 'The Bernina Express genuinely is the experience for leisure — do not dismiss rail', price: '€3.8-6.5k helicopter / €650-1,200 chauffeur / €80-200 rail', seasonality: 'Peak Dec-March' },
      { id: 'monaco-courchevel', name: 'Monaco — Courchevel', region: 'europe-alpine', distanceKm: 330, defaultMode: 'Helicopter (winter)', defaultTag: 'the classic ski transfer', timeDefault: '50 min helicopter / 4-6h drive', reasons: ['Helicopter to Courchevel Altiport (LFLJ) in 50 min — the right answer for the ski season', 'Drive is long and can be severe in winter conditions; helicopter eliminates mountain road risk', 'Monacair and Héli Air Monaco both operate this corridor; book at least 2 weeks ahead in February'], alternative: 'Jet from Nice to Courchevel (LFLJ) if flying from further afield — 30 min from NCE to altiport', price: '€3,500-6,500 helicopter per leg', seasonality: 'Peak Dec-March', tgcCoverage: 'active' },

      // Europe Other
      { id: 'amsterdam-sylt', name: 'Amsterdam — Sylt', region: 'europe-other', distanceKm: 475, defaultMode: 'Private jet (light)', defaultTag: 'distinct German UHNW high-summer', timeDefault: '1h jet / 6-8h commercial+rail', reasons: ['AMS to Sylt (GWT) on a light jet, 1h — the right answer for Friday-Monday weekends', 'GWT has 2,120m runway, light-jet friendly', 'The rail route is charming but time-consuming — AMS to Hamburg, train to Niebüll, then Sylt Shuttle or regional over the Hindenburgdamm'], alternative: 'Commercial to Hamburg + rail for budget', price: '€8.5-14k jet return', seasonality: 'Peak Jul-Aug' },
      { id: 'london-scottish-highlands', name: 'London — Scottish Highlands', region: 'europe-other', distanceKm: 760, defaultMode: 'Private jet (light) or Caledonian Sleeper', defaultTag: 'the sleeper is charming for the right client', timeDefault: '1h30 jet / overnight rail', reasons: ['Private jet to Inverness, Wick, or private estate strips (Lossiemouth etc) — 1h30', 'Many Highland estates have private grass strips — check with estate manager, can save 1-2 hours ground time', 'The Caledonian Sleeper (London Euston to Inverness) is genuinely charming — cabin, breakfast in bed, wake up in Inverness'], alternative: 'BA or easyJet commercial LHR/LCY to INV (€300-900) for solo travel', price: '€11-18k jet return', seasonality: 'Grouse season Aug 12+, salmon spring-autumn' },

      // Transatlantic
      { id: 'nyc-london', name: 'New York — London', region: 'transatlantic', distanceKm: 5570, defaultMode: 'Commercial First (1-2 pax) or Heavy jet', defaultTag: 'BA First Wing is closest commercial gets to private', timeDefault: '6h30-7h30', reasons: ['For solo or couple travel, Commercial First is objectively excellent — BA First Wing lounge, Concorde Room, driver-to-door from T5', 'The jet case kicks in at 4+ travellers where per-seat economics narrow, or for schedule-unusual trips', 'LCY now permits certain ULR jets from NYC for specific aircraft types — closest central London arrival by any means'], alternative: 'Most active transatlantic empty-leg corridor — 50-80% discounts possible with flexibility', price: '€4.5-12k First / €95-180k heavy jet return', seasonality: 'Year-round', tgcCoverage: 'active' },
      { id: 'nyc-paris', name: 'New York — Paris', region: 'transatlantic', distanceKm: 5840, defaultMode: 'Air France La Première or Heavy jet', defaultTag: 'the best First product in the sky', timeDefault: '7h', reasons: ['For solo or couple, Air France La Première is the right answer, no contest — Rolls-Royce transfer at CDG, private suite, service that rivals any charter', 'The jet case is 4+ pax, schedule non-standard, or unique privacy needs', 'CDG has private arrivals ("Arrivée Privée") via La Première — avoids the terminal entirely'], alternative: 'Delta One / AA Flagship / Virgin Upper as excellent second options', price: '€7-15k La Première / €100-180k heavy jet', seasonality: 'Year-round', tgcCoverage: 'active' },
      { id: 'nyc-geneva-zurich', name: 'New York — Geneva / Zurich', region: 'transatlantic', distanceKm: 6300, defaultMode: 'Commercial Business or Heavy jet', defaultTag: 'families + ski = jet', timeDefault: '8h', reasons: ['Swiss First (where still flown) is one of the quietest, best-appointed First cabins', 'For 3-4+ travellers, private jet wins clearly — especially for families heading to Alpine residences with ski equipment', 'Onward helicopter/driver at Geneva Business Aviation Centre is seamless'], alternative: 'Commercial First for solo/couple', price: '€4.5-12k Business / €110-180k jet return', seasonality: 'Peak Dec-March (ski)' },
      { id: 'miami-london', name: 'Miami — London', region: 'transatlantic', distanceKm: 7125, defaultMode: 'Commercial First or Heavy jet', defaultTag: 'MIA experience drives jet use', timeDefault: '9-10h', reasons: ['BA operates MIA-LHR daily; schedule convenient for overnight east', 'MIA is one of the worst commercial airports for UHNW in North America — tired, congested', 'For PBI origin (Palm Beach), both BA and Virgin serve PBI-LHR seasonally'], alternative: 'Palm Beach-LHR direct seasonal if origin allows', price: '€5.5-14k First / €120-200k heavy jet', seasonality: 'Year-round; peak Nov-April' },
      { id: 'boston-london', name: 'Boston — London', region: 'transatlantic', distanceKm: 5250, defaultMode: 'Commercial First', defaultTag: 'shortest transatlantic, premium-heavy', timeDefault: '6-7h', reasons: ['45 min shorter than NYC-London — a meaningful difference on a weekday', 'BOS-LHR is a famously premium-heavy route — finance, biotech, academia', 'Commercial product excellent on BA, Virgin, Delta'], alternative: 'Private jet for 4+ or schedule-sensitive travel', price: '€4.5-11k First / €95-160k heavy jet', seasonality: 'Year-round' },
      { id: 'la-london', name: 'Los Angeles — London', region: 'transatlantic', distanceKm: 8770, defaultMode: 'Commercial First or ULR jet', defaultTag: 'ULR required for private', timeDefault: '10-11h', reasons: ['Range restricts private aircraft options — Global, Falcon 8X, G650 territory', 'BA\'s A380 First service is legendary; AA Flagship First excellent', 'Eastbound is overnight and sleeps beautifully'], alternative: 'For 4+ travellers, ULR jet is the answer', price: '€6.5-15k First / €180-300k ULR return', seasonality: 'Year-round' },
      { id: 'nyc-nice-summer', name: 'New York — Nice (Summer)', region: 'transatlantic', distanceKm: 6650, defaultMode: 'Heavy jet or La Compagnie', defaultTag: 'summer villa migration', timeDefault: '7h30', reasons: ['La Compagnie operates all-business direct JFK-NCE in summer — €2,500-3,500 one-way, a quiet gem for UHNW on budget', 'For families of 4+ moving to a summer villa, private jet is the natural answer', 'Onward helicopter to Monaco/Cap Ferrat/St Tropez at the same booking — essential'], alternative: 'Commercial via CDG/LHR/AMS for cost-conscious (10-11h total)', price: '€2.5-3.5k La Compagnie / €130-200k heavy jet', seasonality: 'Jun-Sep' },
      { id: 'miami-paris', name: 'Miami — Paris', region: 'transatlantic', distanceKm: 7400, defaultMode: 'Air France La Première or Heavy jet', defaultTag: 'La Première again the premium answer', timeDefault: '9-10h', reasons: ['For solo UHNW, La Première is the correct answer — €6.5-15k one-way', 'For 4+ travellers or families, private jet economics become competitive', 'Particularly for clients who genuinely dislike the MIA commercial experience'], alternative: 'AA Flagship First as backup', price: '€6.5-15k La Première / €130-210k ULR', seasonality: 'Year-round' },
    ],
  };

  // ============ MEMO ============
  const filteredCorridors = useMemo(() => {
    if (!searchQuery.trim()) return corridorData.corridors;
    const q = searchQuery.toLowerCase();
    return corridorData.corridors.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      (c.defaultMode && c.defaultMode.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const groupedCorridors = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    corridorData.regions.forEach(r => { grouped[r.id] = []; });
    filteredCorridors.forEach(c => {
      if (grouped[c.region]) grouped[c.region].push(c);
    });
    return grouped;
  }, [filteredCorridors]);

  // ============ EFFECTS ============
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('journey:'));
      if (keys.length) {
        const journeys: any[] = [];
        for (const key of keys) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) journeys.push({ key, ...JSON.parse(raw) });
          } catch (e) {}
        }
        setSavedJourneys(journeys);
      }
    } catch (e) {}
  }, []);

  const saveJourney = () => {
    if (!saveName.trim()) return;
    const key = `journey:${Date.now()}`;
    const data = {
      name: saveName,
      corridorId: selectedCorridor?.id,
      corridorName: selectedCorridor?.name,
      answers,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(key, JSON.stringify(data));
      setSavedJourneys([...savedJourneys, { key, ...data }]);
      setSaveName('');
      setShowSaveModal(false);
    } catch (e) { setShowSaveModal(false); }
  };

  const loadJourney = (journey: any) => {
    if (journey.corridorId) {
      const corridor = corridorData.corridors.find(c => c.id === journey.corridorId);
      if (corridor) setSelectedCorridor(corridor);
    }
    setAnswers(journey.answers || answers);
    setScreen('result');
  };

  const deleteJourney = (key: string) => {
    try {
      localStorage.removeItem(key);
      setSavedJourneys(savedJourneys.filter(j => j.key !== key));
    } catch (e) {}
  };

  const resetAll = () => {
    setAnswers({ purpose: null, travellers: null, frequency: null, priority: null, luggage: null, flexibility: null });
    setSelectedCorridor(null);
    setPlannerStep(0);
    setScreen('welcome');
    setSubmitted(false);
    setClientDetails({ name: '', email: '', phone: '', travelDate: '', returnDate: '', message: '' });
  };

  // ============ ASSET CALCULATOR LOGIC ============
  const getAssetVerdict = (mode: string, hours: number) => {
    const scenarios: Record<string, any> = {
      'chauffeur': {
        label: 'Chauffeured ground transport',
        unit: 'hours per year',
        thresholds: [
          { below: 200, verdict: 'On-demand', rationale: 'Ad-hoc booking through a trusted network is clearly correct. No standing costs, no utilisation risk.' },
          { below: 800, verdict: 'Retained network', rationale: 'You are past ad-hoc economics but not at full dedicated utilisation. A retainer with a handful of drivers on priority call is optimal.' },
          { below: 1600, verdict: 'Dedicated contracted', rationale: 'Enough volume to justify one or two drivers exclusive to you — but employing them directly adds HR complexity. Contracted-exclusive through us is the clean structure.' },
          { below: 9999, verdict: 'In-house', rationale: 'At this volume, dedicated household staff is financially cleanest. We help structure roles, write contracts, and source the right people.' },
        ],
        costs: (h: number) => ({ onDemand: h * 120, retained: 30000 + (h * 80), dedicated: 120000, inHouse: 95000 }),
      },
      'car': {
        label: 'Luxury car (personal use)',
        unit: 'years of ownership',
        thresholds: [
          { below: 1, verdict: 'On-demand chauffeur', rationale: 'Below 50 days of use, a €200k+ vehicle is wasted capital. On-demand is cleaner.' },
          { below: 3, verdict: 'Long-term lease', rationale: '1-3 year horizons favour leasing — residual risk sits with the lessor.' },
          { below: 5, verdict: 'Purchase (marques that hold value)', rationale: 'Over 3 years, Porsche 911, G-Class, certain Ferraris depreciate slowly enough for ownership to win. For volume luxury, leasing is still correct.' },
          { below: 9999, verdict: 'Purchase — appreciating assets', rationale: 'Horological classics (air-cooled 911s, F1, LaFerrari) become investment. A different conversation entirely.' },
        ],
        costs: (y: number) => ({ onDemand: 40000 * y, lease: 48000 * y, owned: 240000 + (8000 * y) - (30000 * y), inHouse: 240000 + (8000 * y) - (30000 * y) }),
      },
      'helicopter': {
        label: 'Helicopter',
        unit: 'flight hours per year',
        thresholds: [
          { below: 25, verdict: 'On-demand charter', rationale: 'Below 25 hours, charter is unambiguously correct. Ownership/fractional require utilisation that will not happen.' },
          { below: 80, verdict: 'Fractional share', rationale: '25-80 hours: fractional (typically 1/8 or 1/4) beats charter on per-hour cost and guarantees availability.' },
          { below: 200, verdict: 'Full ownership, managed', rationale: 'Above 80 hours, full ownership with professional management — configured to your preferences, chartered back when not in use.' },
          { below: 9999, verdict: 'In-house flight department', rationale: 'At 200+ hours, dedicated pilots, engineers, and hangarage becomes viable. Serious corporate structure.' },
        ],
        costs: (h: number) => ({ onDemand: h * 3500, fractional: (h * 2800) + 80000, owned: 900000 + (h * 1800), inHouse: 1400000 + (h * 1500) }),
      },
      'jet-light': {
        label: 'Private jet — light / mid-size',
        unit: 'flight hours per year',
        thresholds: [
          { below: 25, verdict: 'On-demand charter', rationale: 'Below 25 hours, charter directly with operators (TAG, VistaJet, LunaJets, GlobeAir) through us.' },
          { below: 50, verdict: 'Jet card', rationale: '25-50 hours: a jet card (NetJets, VistaJet, Flexjet) gives guaranteed availability at fixed hourly rates. The sweet spot for active travellers.' },
          { below: 150, verdict: 'Fractional share', rationale: '50-150 hours: fractional (1/16 to 1/4) is sharper economically. Longer commitment but better per-hour.' },
          { below: 400, verdict: 'Full ownership, managed', rationale: 'Above 150 hours, ownership with management company charter programme. Dedicated aircraft, configured to you.' },
          { below: 9999, verdict: 'In-house flight department', rationale: '400+ hours justifies a private flight department. Structure of a family office or holding company.' },
        ],
        costs: (h: number) => ({ onDemand: h * 5500, card: (h * 5000) + 50000, fractional: (h * 4200) + 200000, owned: 1800000 + (h * 3200), inHouse: 2800000 + (h * 2800) }),
      },
      'jet-heavy': {
        label: 'Private jet — heavy / long-range',
        unit: 'flight hours per year',
        thresholds: [
          { below: 25, verdict: 'On-demand charter', rationale: 'Heavy jet charter is expensive but correct below 25 hours.' },
          { below: 75, verdict: 'Jet card — heavy', rationale: 'Heavy-category cards (VistaJet Program, NetJets Marquis) give guaranteed long-range availability.' },
          { below: 250, verdict: 'Fractional — heavy', rationale: 'Regular transatlantic or Gulf-Europe: Global or Falcon 8X per-hour costs drop meaningfully.' },
          { below: 600, verdict: 'Full ownership, managed', rationale: '250+ hours: ownership pays, especially with active charter-back.' },
          { below: 9999, verdict: 'In-house', rationale: 'Long-range with dedicated crew, managed in-house. Top-tier family office structure.' },
        ],
        costs: (h: number) => ({ onDemand: h * 12000, card: (h * 11000) + 100000, fractional: (h * 9500) + 450000, owned: 4500000 + (h * 7200), inHouse: 6800000 + (h * 6500) }),
      },
      'yacht': {
        label: 'Yacht (30m+)',
        unit: 'weeks of use per year',
        thresholds: [
          { below: 2, verdict: 'Charter', rationale: '1-2 weeks a year — charter is the only sensible answer. Different yacht in a different sea every season.' },
          { below: 6, verdict: 'Regular charter with relationship', rationale: '3-6 weeks: charter with the same broker, often the same captain and vessel year after year.' },
          { below: 10, verdict: 'Fractional yacht ownership', rationale: 'Emerging category (SeaNet, YachtPlus). Serious use, serious cost reduction vs. full ownership.' },
          { below: 16, verdict: 'Full ownership, chartered back', rationale: '10+ weeks of genuine use, ownership with active charter offsetting. Charter market for owner-operated is thin.' },
          { below: 9999, verdict: 'Full ownership, private use', rationale: 'Above 16 weeks, private asset. Crew, berthing, refit cycles — worth it for continuity.' },
        ],
        costs: (w: number) => ({ onDemand: w * 400000, fractional: 3500000 + (w * 180000), owned: 6500000 + (w * 60000), inHouse: 6500000 + (w * 60000) }),
      },
    };
    const s = scenarios[mode];
    if (!s) return null;
    const verdict = s.thresholds.find((t: any) => hours < t.below);
    return { label: s.label, unit: s.unit, verdict: verdict.verdict, rationale: verdict.rationale, costs: s.costs(hours) };
  };

  // ============ PLANNER STEPS ============
  const plannerSteps = [
    {
      key: 'purpose',
      question: 'What kind of journey is this?',
      subtitle: 'The tone of the day tells us more than the distance.',
      options: [
        { value: 'business-urgent', label: 'Business, time-pressed', desc: 'A meeting must happen. The day cannot bend.', icon: Zap },
        { value: 'business-measured', label: 'Business, measured', desc: 'Work is the reason, but the day has room.', icon: Briefcase },
        { value: 'leisure-efficient', label: 'Leisure, efficient', desc: 'Getting there matters; being there is the point.', icon: Clock },
        { value: 'leisure-scenic', label: 'Leisure, experiential', desc: 'The journey is part of the pleasure.', icon: Heart },
      ],
    },
    {
      key: 'travellers',
      question: 'Who is travelling?',
      subtitle: 'Groups change the answer more than distance does.',
      options: [
        { value: 'solo', label: 'One', desc: 'Solo traveller' },
        { value: 'couple', label: 'Two', desc: 'Couple, or principal plus one' },
        { value: 'small-group', label: 'Three to five', desc: 'Small group, small family' },
        { value: 'family', label: 'Family with children or pets', desc: 'Volume, continuity, patience needed' },
        { value: 'large-group', label: 'Six or more', desc: 'Board, crew, extended family' },
      ],
    },
    {
      key: 'luggage',
      question: 'How much luggage?',
      subtitle: 'It changes the answer more than people expect.',
      options: [
        { value: 'light', label: 'Light', desc: 'Weekend bags, laptop cases' },
        { value: 'medium', label: 'Medium', desc: 'A week of travel, a few bags each' },
        { value: 'heavy', label: 'Heavy', desc: 'Relocation volume, ski equipment, formal wardrobe' },
      ],
    },
    {
      key: 'frequency',
      question: 'How often do you make this journey?',
      subtitle: 'This is the question that changes whether to book, lease, or own.',
      options: [
        { value: 'one-off', label: 'Once', desc: 'This journey, this time' },
        { value: 'occasional', label: 'A handful of times a year', desc: '2-10 per year' },
        { value: 'frequent', label: 'Regularly', desc: '10-50 per year' },
        { value: 'daily', label: 'Very regularly', desc: '50+ per year — it is part of your life' },
      ],
    },
    {
      key: 'priority',
      question: 'If you had to choose — what matters most?',
      subtitle: 'We will remember the others, but this wins ties.',
      options: [
        { value: 'time', label: 'Time', desc: 'Saving hours. The day is short.', icon: Clock },
        { value: 'cost', label: 'Value', desc: 'The right outcome for the right money.', icon: DollarSign },
        { value: 'experience', label: 'Experience', desc: 'The journey itself should be good.', icon: Sparkles },
        { value: 'privacy', label: 'Privacy', desc: 'Nobody notices, nobody asks.', icon: Shield },
      ],
    },
    {
      key: 'flexibility',
      question: 'How flexible is the timing?',
      subtitle: 'Flexibility unlocks empty-legs and the better options.',
      options: [
        { value: 'fixed', label: 'Fixed', desc: 'This date, this time, no movement' },
        { value: 'same-day', label: '±2 hours', desc: 'Same day, roughly this time' },
        { value: 'flexible', label: '±1 day', desc: 'Either side of the target date works' },
      ],
    },
  ];

  const currentStep = plannerSteps[plannerStep];

  const handleAnswer = (key: string, value: string) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (plannerStep < plannerSteps.length - 1) setPlannerStep(plannerStep + 1);
      else setScreen('result');
    }, 280);
  };

  // ============ SUBMISSION ============
  const submitJourney = async () => {
    setSubmitting(true)
    const payload = {
      type: 'transport',
      submittedAt: new Date().toISOString(),
      corridor: {
        id: selectedCorridor?.id,
        name: selectedCorridor?.name,
        defaultMode: selectedCorridor?.defaultMode,
      },
      brief: { ...answers },
      client: { ...clientDetails },
    }
    try {
      await fetch('/api/intelligence/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (e) {
      console.error('Submit error:', e)
    }
    setSubmitting(false)
    setSubmitted(true)
  }

  const formatCurrency = (n: number) => {
    if (n >= 1000000) return `€${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `€${Math.round(n / 1000)}k`;
    return `€${Math.round(n)}`;
  };

  const regionIcon = (r: string) => {
    if (r === 'us-northeast-business' || r === 'us-florida' || r === 'us-west' || r === 'us-ski-mountain' || r === 'us-northeast-leisure') return '🇺🇸';
    if (r === 'transatlantic') return '↔';
    return '🇪🇺';
  };

  const allPlannerAnswered = Object.values(answers).every(v => v !== null);

  // ============ RENDER ============
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F9F8F5',
      color: '#1a1815',
      fontFamily: "'Lato', sans-serif",
      padding: '2rem 1.5rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Lato:ital,wght@0,300;0,400;0,700;1,400&display=swap');
        .tgc-font-serif { font-family: 'Poppins', sans-serif; font-weight: 400; }
        .tgc-font-sans { font-family: 'Lato', sans-serif; font-weight: 300; }
        .tgc-font-mono { font-family: 'Lato', sans-serif; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }
        .tgc-fade-in { animation: tgcFade 0.6s ease forwards; }
        @keyframes tgcFade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .tgc-option:hover { background: rgba(14, 79, 81, 0.06) !important; border-color: #0e4f51 !important; }
        .tgc-btn { transition: all 0.2s ease; }
        .tgc-btn:hover:not(:disabled) { background: #0e4f51; color: #ffffff; }
        .tgc-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .tgc-progress-dot { width: 6px; height: 6px; border-radius: 50%; background: #e5e7eb; transition: all 0.3s ease; }
        .tgc-progress-dot.active { background: #0e4f51; width: 28px; border-radius: 3px; }
        .tgc-progress-dot.done { background: #c8aa4a; }
        input[type="range"] { width: 100%; height: 4px; background: #e5e7eb; outline: none; appearance: none; -webkit-appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #0e4f51; cursor: pointer; }
        input[type="range"]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #0e4f51; cursor: pointer; border: none; }
        .tgc-input { width: 100%; padding: 0.8rem 1rem; border: 1px solid #e5e7eb; background: #F9F8F5; font-size: 1rem; font-family: 'Lato', sans-serif; outline: none; transition: border-color 0.2s; }
        .tgc-input:focus { border-color: #0e4f51; }
      `}</style>

      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>

        {/* ============ SUITE NAV ============ */}
        <div style={{ marginBottom: '1.75rem' }}>
          <a href="/intelligence" style={{ display: 'inline-block', color: '#6b7280', fontSize: '0.75rem', textDecoration: 'none', fontFamily: "'Lato', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            ← Intelligence Suite
          </a>
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
            {[
              { num: '01', label: 'Transport', href: '/intelligence/transport', active: true },
              { num: '02', label: 'Real Estate', href: '/intelligence/realestate', active: false },
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

        {/* ============ HEADER ============ */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div
            className="tgc-font-serif"
            style={{ fontSize: '1.1rem', color: '#0e4f51', cursor: 'pointer' }}
            onClick={() => setScreen('welcome')}
          >
            The Gatekeepers Club
          </div>
          <div className="tgc-font-mono" style={{ color: '#c8aa4a' }}>
            Transport Intelligence · v.2
          </div>
        </div>

        {/* ============ WELCOME ============ */}
        {screen === 'welcome' && (
          <div className="tgc-fade-in">
            <h1 className="tgc-font-serif" style={{ fontWeight: 400, fontSize: 'clamp(2.8rem, 6vw, 4.8rem)', lineHeight: 1.03, letterSpacing: '-0.01em', marginBottom: '1.5rem' }}>
              Getting there,<br /><em style={{ color: '#0e4f51' }}>considered.</em>
            </h1>
            <p className="tgc-font-sans" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', color: '#6b7280', maxWidth: '640px', lineHeight: 1.6, marginBottom: '3rem' }}>
              Choose a route. Answer six questions. We will tell you the right way to travel, honestly, and quote it. Or model whether to book, lease, share, or own.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <button
                onClick={() => setScreen('corridor-select')}
                style={{ background: '#0e4f51', color: '#ffffff', padding: '2.5rem 2rem', border: 'none', textAlign: 'left', cursor: 'pointer', transition: 'all 0.25s ease', borderRadius: 8 }}
              >
                <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Tool 01 · The Journey</div>
                <div className="tgc-font-serif" style={{ fontSize: '1.8rem', marginBottom: '0.6rem', lineHeight: 1.15 }}>
                  Plan a <em>specific route</em>
                </div>
                <div style={{ fontSize: '0.92rem', opacity: 0.75, lineHeight: 1.5 }}>
                  Choose from 60 curated corridors across the US, UK/Europe, and transatlantic. We'll tell you the right way to travel it.
                </div>
                <div className="tgc-font-mono" style={{ marginTop: '1.5rem', color: '#c8aa4a' }}>Select corridor →</div>
              </button>

              <button
                onClick={() => setScreen('calculator')}
                style={{ background: 'transparent', color: '#1a1815', padding: '2.5rem 2rem', border: '1.5px solid #e5e7eb', textAlign: 'left', cursor: 'pointer', transition: 'all 0.25s ease', borderRadius: 8 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#0e4f51'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#0e4f51'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1a1815'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
              >
                <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Tool 02 · The Asset</div>
                <div className="tgc-font-serif" style={{ fontSize: '1.8rem', marginBottom: '0.6rem', lineHeight: 1.15 }}>
                  Book, share, or <em>own</em>?
                </div>
                <div style={{ fontSize: '0.92rem', lineHeight: 1.5 }}>
                  Model the real cost of chartering versus jet cards, fractional, or full ownership. Cars, helicopters, jets, and yachts.
                </div>
                <div className="tgc-font-mono" style={{ marginTop: '1.5rem' }}>Calculate →</div>
              </button>
            </div>

            {savedJourneys.length > 0 && (
              <div style={{ marginTop: '3rem', padding: '1.5rem', border: '1px solid #e5e7eb', background: '#F9F8F5' }}>
                <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Your saved journeys</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {savedJourneys.map(j => (
                    <div key={j.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #e5e7eb' }}>
                      <button onClick={() => loadJourney(j)} className="tgc-font-serif" style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1.05rem', color: '#1a1815', flex: 1 }}>
                        {j.name} <span style={{ color: '#c8aa4a', fontSize: '0.85rem', fontFamily: "'Lato', sans-serif", fontStyle: 'normal' }}>· {j.corridorName}</span>
                      </button>
                      <button onClick={() => deleteJourney(j.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a63a2a', padding: '0.3rem' }}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ CORRIDOR SELECT ============ */}
        {screen === 'corridor-select' && (
          <div className="tgc-fade-in">
            <div style={{ marginBottom: '2rem' }}>
              <button onClick={() => setScreen('welcome')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="tgc-font-mono">
                <ChevronLeft size={14} /> Home
              </button>
            </div>

            <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Step 1 of 3 · Choose your route</div>
            <h2 className="tgc-font-serif" style={{ fontWeight: 400, fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.05, marginBottom: '0.8rem', letterSpacing: '-0.01em' }}>
              Where are you <em style={{ color: '#0e4f51' }}>going</em>?
            </h2>
            <p className="tgc-font-serif" style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '2rem', maxWidth: '640px' }}>
              60 corridors, grouped by region. Or search by city — London, Monaco, Aspen, Hamptons.
            </p>

            <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#c8aa4a' }} />
              <input
                type="text"
                placeholder="Search corridors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tgc-input"
                style={{ paddingLeft: '2.8rem' }}
              />
            </div>

            {corridorData.regions.map(region => {
              const corridors = groupedCorridors[region.id] || [];
              if (corridors.length === 0) return null;
              return (
                <div key={region.id} style={{ marginBottom: '2.5rem' }}>
                  <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>{regionIcon(region.id)}</span>
                    <span>{region.label}</span>
                    <span style={{ color: '#6b7280' }}>· {corridors.length}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.8rem' }}>
                    {corridors.map((c: any) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCorridor(c); setScreen('planner'); setPlannerStep(0); }}
                        className="tgc-option"
                        style={{ background: 'transparent', border: '1px solid #e5e7eb', padding: '1rem 1.2rem', textAlign: 'left', cursor: 'pointer', color: '#1a1815', transition: 'all 0.2s ease', position: 'relative' }}
                      >
                        <div className="tgc-font-serif" style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.2rem' }}>{c.name}</div>
                        <div style={{ fontSize: '0.82rem', color: '#6b7280', fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
                          {c.distanceKm} km · <em style={{ color: '#c8aa4a' }}>{c.defaultMode}</em>
                        </div>
                        {c.tgcCoverage === 'active' && (
                          <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', background: '#0e4f51', color: '#ffffff', fontSize: '0.6rem', padding: '0.15rem 0.4rem', letterSpacing: '0.1em', fontFamily: "'Lato', sans-serif", fontWeight: 700, textTransform: 'uppercase' }}>
                            TGC
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============ PLANNER ============ */}
        {screen === 'planner' && selectedCorridor && (
          <div className="tgc-fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => { if (plannerStep === 0) setScreen('corridor-select'); else setPlannerStep(plannerStep - 1); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                className="tgc-font-mono"
              >
                <ChevronLeft size={14} /> Back
              </button>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {plannerSteps.map((_, i) => (
                  <div key={i} className={`tgc-progress-dot ${i === plannerStep ? 'active' : (i < plannerStep ? 'done' : '')}`} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1rem 1.2rem', background: '#F9F8F5', border: '1px solid #e5e7eb' }}>
              <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '0.3rem' }}>Your route</div>
              <div className="tgc-font-serif" style={{ fontSize: '1.4rem' }}>{selectedCorridor.name}</div>
            </div>

            <div key={plannerStep} className="tgc-fade-in">
              <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '0.8rem' }}>
                Step 2 of 3 · Question {String(plannerStep + 1).padStart(2, '0')} of {String(plannerSteps.length).padStart(2, '0')}
              </div>
              <h2 className="tgc-font-serif" style={{ fontWeight: 400, fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', lineHeight: 1.1, marginBottom: '0.8rem', letterSpacing: '-0.01em' }}>
                {currentStep.question}
              </h2>
              <p className="tgc-font-serif" style={{ fontSize: '1.15rem', color: '#6b7280', marginBottom: '2.5rem', maxWidth: '600px' }}>
                {currentStep.subtitle}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {currentStep.options.map((opt: any) => {
                  const selected = answers[currentStep.key] === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(currentStep.key, opt.value)}
                      className="tgc-option"
                      style={{ background: selected ? 'rgba(14, 79, 81, 0.08)' : 'transparent', border: `1px solid ${selected ? '#0e4f51' : '#e5e7eb'}`, padding: '1.3rem 1.5rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.2rem', transition: 'all 0.2s ease', color: '#1a1815', borderRadius: 8 }}
                    >
                      {Icon && (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: selected ? '#0e4f51' : '#e5e7eb', color: selected ? '#ffffff' : '#c8aa4a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={18} />
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div className="tgc-font-serif" style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '0.2rem' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280', fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>{opt.desc}</div>
                      </div>
                      {selected && <Check size={18} style={{ color: '#0e4f51' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============ RESULT ============ */}
        {screen === 'result' && selectedCorridor && allPlannerAnswered && (
          <div className="tgc-fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <button onClick={() => setScreen('welcome')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="tgc-font-mono">
                <ChevronLeft size={14} /> Home
              </button>
              <button onClick={resetAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="tgc-font-mono">
                <RotateCcw size={14} /> Start over
              </button>
            </div>

            <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Your route · answered</div>

            <h2 className="tgc-font-serif" style={{ fontWeight: 400, fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.05, marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>
              <em style={{ color: '#0e4f51' }}>{selectedCorridor.name}</em>
            </h2>
            <p className="tgc-font-serif" style={{ fontSize: '1.35rem', color: '#6b7280', marginBottom: '2rem' }}>
              {selectedCorridor.defaultTag}
            </p>

            <div style={{ background: '#0e4f51', color: '#ffffff', padding: '2.5rem 2rem', marginBottom: '2rem' }}>
              <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Our recommendation</div>
              <div className="tgc-font-serif" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: '0.4rem' }}>
                {selectedCorridor.defaultMode}
              </div>
              <div className="tgc-font-serif" style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                {selectedCorridor.timeDefault}
              </div>
              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <div className="tgc-font-mono" style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.4rem' }}>Indicative</div>
                  <div className="tgc-font-serif" style={{ fontSize: '1.05rem', color: '#c8aa4a' }}>{selectedCorridor.price}</div>
                </div>
                <div>
                  <div className="tgc-font-mono" style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.4rem' }}>Season</div>
                  <div className="tgc-font-serif" style={{ fontSize: '1.05rem', color: '#c8aa4a' }}>{selectedCorridor.seasonality}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Why this, specifically</div>
              {selectedCorridor.reasons.map((r: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '1.2rem', padding: '1.2rem 0', borderBottom: i < selectedCorridor.reasons.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                  <div className="tgc-font-mono" style={{ color: '#c8aa4a', paddingTop: '0.25rem' }}>{String(i + 1).padStart(2, '0')}</div>
                  <div className="tgc-font-serif" style={{ fontSize: '1.1rem', lineHeight: 1.55, color: '#0e4f51' }}>{r}</div>
                </div>
              ))}
            </div>

            {selectedCorridor.alternative && (
              <div style={{ background: '#F9F8F5', border: '1px solid #e5e7eb', padding: '1.5rem', marginBottom: '2rem' }}>
                <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '0.6rem' }}>If you want to trade something</div>
                <div className="tgc-font-serif" style={{ fontSize: '1.08rem', color: '#0e4f51', lineHeight: 1.55 }}>
                  {selectedCorridor.alternative}
                </div>
              </div>
            )}

            {(answers.frequency === 'frequent' || answers.frequency === 'daily') && (
              <div style={{ background: '#e5e7eb', border: '1px solid #c8aa4a', padding: '1.8rem', marginBottom: '2rem', display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                <TrendingUp size={22} style={{ color: '#0e4f51', flexShrink: 0, marginTop: '0.2rem' }} />
                <div style={{ flex: 1 }}>
                  <div className="tgc-font-mono" style={{ color: '#0e4f51', marginBottom: '0.5rem' }}>Asset question triggered</div>
                  <div className="tgc-font-serif" style={{ fontSize: '1.1rem', color: '#1a1815', lineHeight: 1.5, marginBottom: '1rem' }}>
                    At this frequency, a jet card, fractional share, or retained structure may cost less than on-demand charter. Worth modelling.
                  </div>
                  <button
                    onClick={() => { setCalcMode('jet-light'); setScreen('calculator'); }}
                    style={{ background: '#0e4f51', color: '#ffffff', padding: '0.6rem 1.2rem', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <span className="tgc-font-mono">Model the economics →</span>
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '3rem' }}>
              <button onClick={() => setShowSaveModal(true)} className="tgc-btn" style={{ background: 'transparent', border: '1px solid #1a1815', padding: '1.2rem', cursor: 'pointer', color: '#1a1815', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                <Save size={16} />
                <span className="tgc-font-mono">Save this journey</span>
              </button>
              <button
                onClick={() => setScreen('submit')}
                className="tgc-btn"
                style={{ background: '#0e4f51', color: '#ffffff', border: 'none', padding: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', borderRadius: 8 }}
              >
                <span className="tgc-font-mono">Have us quote this</span>
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ============ SUBMIT ============ */}
        {screen === 'submit' && selectedCorridor && !submitted && (
          <div className="tgc-fade-in">
            <div style={{ marginBottom: '2rem' }}>
              <button onClick={() => setScreen('result')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="tgc-font-mono">
                <ChevronLeft size={14} /> Back to recommendation
              </button>
            </div>

            <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Step 3 of 3 · Send the brief</div>
            <h2 className="tgc-font-serif" style={{ fontWeight: 400, fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.05, marginBottom: '0.8rem' }}>
              Let us <em style={{ color: '#0e4f51' }}>quote this</em>.
            </h2>
            <p className="tgc-font-serif" style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '2.5rem', maxWidth: '640px', lineHeight: 1.5 }}>
              A gatekeeper will come back to you within the hour with a firm quote. No templated responses.
            </p>

            <div style={{ padding: '1.5rem', background: '#F9F8F5', border: '1px solid #e5e7eb', marginBottom: '2rem' }}>
              <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '0.6rem' }}>Your brief</div>
              <div className="tgc-font-serif" style={{ fontSize: '1.15rem' }}>{selectedCorridor.name}</div>
              <div style={{ fontSize: '0.88rem', color: '#6b7280', marginTop: '0.5rem', fontFamily: "'Lato', sans-serif" }}>
                {answers.purpose} · {answers.travellers} · {answers.luggage} luggage · priority: {answers.priority}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="tgc-font-mono" style={{ display: 'block', marginBottom: '0.5rem', color: '#c8aa4a' }}>Name</label>
                <input type="text" className="tgc-input" value={clientDetails.name} onChange={(e) => setClientDetails({ ...clientDetails, name: e.target.value })} placeholder="Your name" />
              </div>
              <div>
                <label className="tgc-font-mono" style={{ display: 'block', marginBottom: '0.5rem', color: '#c8aa4a' }}>Email</label>
                <input type="email" className="tgc-input" value={clientDetails.email} onChange={(e) => setClientDetails({ ...clientDetails, email: e.target.value })} placeholder="email@example.com" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="tgc-font-mono" style={{ display: 'block', marginBottom: '0.5rem', color: '#c8aa4a' }}>Phone (optional)</label>
                <input type="tel" className="tgc-input" value={clientDetails.phone} onChange={(e) => setClientDetails({ ...clientDetails, phone: e.target.value })} placeholder="+33 ..." />
              </div>
              <div>
                <label className="tgc-font-mono" style={{ display: 'block', marginBottom: '0.5rem', color: '#c8aa4a' }}>Travel date</label>
                <input type="date" className="tgc-input" value={clientDetails.travelDate} onChange={(e) => setClientDetails({ ...clientDetails, travelDate: e.target.value })} />
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label className="tgc-font-mono" style={{ display: 'block', marginBottom: '0.5rem', color: '#c8aa4a' }}>Anything else we should know?</label>
              <textarea
                className="tgc-input"
                rows={4}
                value={clientDetails.message}
                onChange={(e) => setClientDetails({ ...clientDetails, message: e.target.value })}
                placeholder="Specific preferences, sensitivities, non-negotiables..."
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <button
              onClick={submitJourney}
              disabled={!clientDetails.name || !clientDetails.email || !clientDetails.travelDate || submitting}
              className="tgc-btn"
              style={{ width: '100%', background: '#0e4f51', color: '#ffffff', border: 'none', padding: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
            >
              {submitting ? <span className="tgc-font-mono">Sending...</span> : (
                <>
                  <Send size={16} />
                  <span className="tgc-font-mono">Send brief to The Gatekeepers Club</span>
                </>
              )}
            </button>

            <div className="tgc-font-serif" style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '1.5rem', textAlign: 'center' }}>
              Response inside the hour. No automated templates.
            </div>
          </div>
        )}

        {/* ============ SUBMITTED CONFIRMATION ============ */}
        {submitted && (
          <div className="tgc-fade-in" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e5e7eb', color: '#0e4f51', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
              <CheckCircle size={36} />
            </div>
            <h2 className="tgc-font-serif" style={{ fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem' }}>
              Received. In good <em style={{ color: '#0e4f51' }}>hands.</em>
            </h2>
            <p className="tgc-font-serif" style={{ fontSize: '1.2rem', color: '#6b7280', maxWidth: '520px', margin: '0 auto 2.5rem', lineHeight: 1.5 }}>
              A gatekeeper has your brief. You'll receive a first response from a named person within the hour, with a firm quote to follow.
            </p>
            <button onClick={resetAll} className="tgc-btn" style={{ background: '#0e4f51', color: '#ffffff', border: 'none', padding: '1rem 2rem', cursor: 'pointer' }}>
              <span className="tgc-font-mono">Plan another journey</span>
            </button>
          </div>
        )}

        {/* ============ CALCULATOR ============ */}
        {screen === 'calculator' && (
          <div className="tgc-fade-in">
            <div style={{ marginBottom: '2rem' }}>
              <button onClick={() => setScreen('welcome')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="tgc-font-mono">
                <ChevronLeft size={14} /> Home
              </button>
            </div>

            <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Asset Intelligence</div>
            <h2 className="tgc-font-serif" style={{ fontWeight: 400, fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.05, marginBottom: '0.8rem' }}>
              Book, share, <em style={{ color: '#0e4f51' }}>or own</em>?
            </h2>
            <p className="tgc-font-serif" style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '3rem', maxWidth: '640px', lineHeight: 1.5 }}>
              Every mode of transport has a break-even point where booking stops being cheapest and ownership stops being absurd.
            </p>

            <div style={{ marginBottom: '2.5rem' }}>
              <div className="tgc-font-mono" style={{ color: '#6b7280', marginBottom: '1rem' }}>What are you considering?</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
                {[
                  { v: 'chauffeur', l: 'Chauffeur service' },
                  { v: 'car', l: 'Luxury car' },
                  { v: 'helicopter', l: 'Helicopter' },
                  { v: 'jet-light', l: 'Light / mid-size jet' },
                  { v: 'jet-heavy', l: 'Heavy / long-range jet' },
                  { v: 'yacht', l: 'Yacht (30m+)' },
                ].map(opt => {
                  const selected = (calcMode || calcInputs.mode) === opt.v;
                  return (
                    <button
                      key={opt.v}
                      onClick={() => { setCalcMode(opt.v); setCalcInputs({ ...calcInputs, mode: opt.v }); }}
                      style={{ padding: '1rem', background: selected ? '#1a1815' : 'transparent', color: selected ? '#F9F8F5' : '#1a1815', border: `1px solid ${selected ? '#1a1815' : '#e5e7eb'}`, cursor: 'pointer', transition: 'all 0.2s ease' }}
                      className="tgc-font-serif"
                    >
                      <span style={{ fontSize: '1.05rem' }}>{opt.l}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {(calcMode || calcInputs.mode) && (() => {
              const mode = calcMode || calcInputs.mode;
              const isYacht = mode === 'yacht';
              const isCar = mode === 'car';
              const unit = isYacht ? 'weeks' : (isCar ? 'years' : 'hours');
              const label = isYacht ? 'weeks of use per year' : (isCar ? 'years of ownership' : 'flight hours per year');
              const max = isYacht ? 30 : (isCar ? 10 : 500);
              const step = isYacht ? 1 : (isCar ? 1 : 5);
              const result = getAssetVerdict(mode, calcInputs.hoursPerYear);

              return (
                <>
                  <div style={{ background: '#F9F8F5', border: '1px solid #e5e7eb', padding: '2rem', marginBottom: '2rem' }}>
                    <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Your {label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div className="tgc-font-serif" style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', fontWeight: 400, color: '#1a1815', lineHeight: 1 }}>
                        {calcInputs.hoursPerYear}
                      </div>
                      <div className="tgc-font-serif" style={{ fontSize: '1.3rem', color: '#6b7280' }}>{unit}</div>
                    </div>
                    <input
                      type="range"
                      min={isYacht ? 1 : (isCar ? 1 : 10)}
                      max={max}
                      step={step}
                      value={calcInputs.hoursPerYear}
                      onChange={(e) => setCalcInputs({ ...calcInputs, hoursPerYear: parseInt(e.target.value) })}
                    />
                  </div>

                  {result && (
                    <div style={{ background: '#0e4f51', color: '#ffffff', padding: '2.5rem 2rem', marginBottom: '2rem' }}>
                      <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>At {calcInputs.hoursPerYear} {unit}, the answer is</div>
                      <div className="tgc-font-serif" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 400, lineHeight: 1.1, marginBottom: '1.5rem' }}>
                        <em style={{ color: '#c8aa4a' }}>{result.verdict}</em>
                      </div>
                      <div className="tgc-font-serif" style={{ fontSize: '1.12rem', lineHeight: 1.55, color: 'rgba(255, 255, 255, 0.85)' }}>
                        {result.rationale}
                      </div>
                    </div>
                  )}

                  {result && result.costs && (
                    <div style={{ marginBottom: '2.5rem' }}>
                      <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>The annual cost picture</div>
                      <div style={{ background: '#F9F8F5', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
                        {Object.entries(result.costs).map(([key, value]) => {
                          const labels: Record<string, string> = { onDemand: 'On-demand / charter', retained: 'Retained network', dedicated: 'Dedicated contracted', inHouse: 'Fully in-house', card: 'Jet card', fractional: 'Fractional ownership', owned: 'Full ownership', lease: 'Long-term lease' };
                          const maxVal = Math.max(...Object.values(result.costs) as number[]);
                          const pct = Math.max(5, ((value as number) / maxVal) * 100);
                          return (
                            <div key={key} style={{ padding: '1rem 0', borderBottom: '1px solid #e5e7eb' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                                <div className="tgc-font-serif" style={{ fontSize: '1.02rem', color: '#1a1815' }}>{labels[key] || key}</div>
                                <div className="tgc-font-serif" style={{ fontSize: '1.02rem', fontWeight: 500, color: '#1a1815' }}>
                                  {formatCurrency(value as number)}<span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 300 }}> / yr</span>
                                </div>
                              </div>
                              <div style={{ height: '4px', background: '#e5e7eb', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: '#c8aa4a', transition: 'width 0.5s ease' }} />
                              </div>
                            </div>
                          );
                        })}
                        <div className="tgc-font-serif" style={{ fontSize: '0.88rem', color: '#6b7280', marginTop: '1rem', lineHeight: 1.5 }}>
                          Indicative annual costs. Real quotes account for aircraft type, routes, home base, crew, hangarage, insurance, and — for yachts and aircraft — chartering-back programmes that can offset ownership costs meaningfully.
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setScreen('submit')}
                    className="tgc-btn"
                    style={{ width: '100%', background: '#0e4f51', color: '#ffffff', border: 'none', padding: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
                  >
                    <Send size={16} />
                    <span className="tgc-font-mono">Have us structure this</span>
                  </button>
                </>
              );
            })()}
          </div>
        )}

        {/* ============ SAVE MODAL ============ */}
        {showSaveModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26, 24, 21, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', zIndex: 100 }} onClick={() => setShowSaveModal(false)}>
            <div style={{ background: '#F9F8F5', padding: '2.5rem', maxWidth: '480px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
              <div className="tgc-font-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Save this journey</div>
              <h3 className="tgc-font-serif" style={{ fontSize: '1.8rem', fontWeight: 400, marginBottom: '1.5rem', lineHeight: 1.15 }}>
                Give it a <em style={{ color: '#0e4f51' }}>name</em>
              </h3>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveJourney(); }}
                placeholder="e.g. The Monaco run"
                autoFocus
                className="tgc-input"
                style={{ marginBottom: '1.5rem' }}
              />
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button onClick={() => setShowSaveModal(false)} style={{ flex: 1, padding: '0.9rem', background: 'transparent', border: '1px solid #1a1815', cursor: 'pointer', color: '#1a1815' }} className="tgc-font-mono">Cancel</button>
                <button onClick={saveJourney} disabled={!saveName.trim()} className="tgc-btn" style={{ flex: 1, padding: '0.9rem', background: '#0e4f51', color: '#ffffff', border: 'none', cursor: saveName.trim() ? 'pointer' : 'not-allowed', opacity: saveName.trim() ? 1 : 0.4 }}>
                  <span className="tgc-font-mono">Save</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ FOOTER ============ */}
        <div style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div className="tgc-font-serif" style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            60 corridors. One thinking tool.
          </div>
          <div className="tgc-font-mono" style={{ color: '#6b7280' }}>
            The Gatekeepers Club · South of France · Global
          </div>
        </div>

      </div>
    </div>
  );
};

export default function TransportIntelligencePage() {
  return <TGCTransportIntelligence />
}
