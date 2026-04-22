/* eslint-disable react/no-unescaped-entities */
'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, RotateCcw, Send, Check, Clock, DollarSign, Sparkles, Shield, Briefcase, Zap, Heart, Plane, Car, Train, Anchor, TrendingUp, CheckCircle, Save, X, Search } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface City { id:string; name:string; country:string; region:string; lat:number; lng:number; island?:boolean; heliOnly?:boolean; note?:string }
interface ModeResult { id:string; name:string; category:string; doorToDoorHours:number; doorToDoorLabel:string; costLabel:string; headline:string; reasons:string[]; timeScore:number; valueScore:number; experienceScore:number; privacyScore:number; compositeScore:number; recommended:boolean }

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
function haversineKm(lat1:number,lng1:number,lat2:number,lng2:number):number {
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
}
function parseRailTime(t:string):number { const m=t.match(/(\d+)h(\d+)?/); return m ? parseInt(m[1])+(m[2]?parseInt(m[2])/60:0) : 0 }
function formatCurrency(n:number):string { if(n>=1000000) return `€${(n/1000000).toFixed(1)}M`; if(n>=1000) return `€${Math.round(n/1000)}k`; return `€${Math.round(n)}` }
function regionLabel(a:City,b:City):string {
  const usA=a.region?.startsWith('us'),usB=b.region?.startsWith('us')
  if(usA&&usB) return 'US corridor'
  if(usA||usB) return 'Transatlantic'
  return 'European corridor'
}

// ─────────────────────────────────────────────────────────────────────────────
// CITY DATABASE
// ─────────────────────────────────────────────────────────────────────────────
const CITIES:City[] = [
  // US — Northeast
  {id:'new-york',name:'New York',country:'US',region:'us-ne',lat:40.71,lng:-74.01},
  {id:'boston',name:'Boston',country:'US',region:'us-ne',lat:42.36,lng:-71.06},
  {id:'washington-dc',name:'Washington DC',country:'US',region:'us-ne',lat:38.91,lng:-77.04,note:'DCA requires DASSP clearance for private'},
  {id:'philadelphia',name:'Philadelphia',country:'US',region:'us-ne',lat:39.95,lng:-75.16},
  {id:'nantucket',name:'Nantucket',country:'US',region:'us-ne',lat:41.28,lng:-70.10,island:true,note:'ACK slot restrictions August weekends'},
  {id:'marthas-vineyard',name:"Martha's Vineyard",country:'US',region:'us-ne',lat:41.39,lng:-70.64,island:true},
  {id:'hamptons',name:'The Hamptons',country:'US',region:'us-ne',lat:40.94,lng:-72.19},
  // US — Florida
  {id:'miami',name:'Miami',country:'US',region:'us-se',lat:25.77,lng:-80.19,note:'MIA terminal poor for UHNW; OPF/TMB for private'},
  {id:'palm-beach',name:'Palm Beach',country:'US',region:'us-se',lat:26.71,lng:-80.05,note:'Extraordinary jet density Jan-Apr'},
  {id:'naples-fl',name:'Naples (FL)',country:'US',region:'us-se',lat:26.14,lng:-81.79},
  {id:'charleston',name:'Charleston',country:'US',region:'us-se',lat:32.78,lng:-79.94},
  // US — Mountain / Ski
  {id:'aspen',name:'Aspen',country:'US',region:'us-mountain',lat:39.19,lng:-106.82,note:'7,820ft; super-mid minimum; ASE performance sign-off required'},
  {id:'vail',name:'Vail / Eagle',country:'US',region:'us-mountain',lat:39.64,lng:-106.52,note:'EGE backup when ASE closes'},
  {id:'jackson-hole',name:'Jackson Hole',country:'US',region:'us-mountain',lat:43.48,lng:-110.76},
  {id:'telluride',name:'Telluride',country:'US',region:'us-mountain',lat:37.94,lng:-107.81,note:'High-altitude; restricted aircraft types'},
  {id:'park-city',name:'Park City',country:'US',region:'us-mountain',lat:40.64,lng:-111.50},
  // US — West
  {id:'los-angeles',name:'Los Angeles',country:'US',region:'us-west',lat:34.05,lng:-118.24},
  {id:'san-francisco',name:'San Francisco',country:'US',region:'us-west',lat:37.77,lng:-122.42},
  {id:'las-vegas',name:'Las Vegas',country:'US',region:'us-west',lat:36.17,lng:-115.14,note:'Best empty-leg corridor in the US'},
  {id:'santa-barbara',name:'Santa Barbara',country:'US',region:'us-west',lat:34.42,lng:-119.70},
  {id:'scottsdale',name:'Scottsdale / Phoenix',country:'US',region:'us-west',lat:33.49,lng:-111.92},
  {id:'seattle',name:'Seattle',country:'US',region:'us-west',lat:47.61,lng:-122.33},
  // US — Midwest / South
  {id:'chicago',name:'Chicago',country:'US',region:'us-midwest',lat:41.88,lng:-87.63,note:'Winter weather risk Dec-Mar'},
  {id:'houston',name:'Houston',country:'US',region:'us-south',lat:29.76,lng:-95.37},
  {id:'dallas',name:'Dallas',country:'US',region:'us-south',lat:32.78,lng:-96.80},
  {id:'nashville',name:'Nashville',country:'US',region:'us-south',lat:36.16,lng:-86.78},
  // UK
  {id:'london',name:'London',country:'GB',region:'uk',lat:51.51,lng:-0.13,note:'Biggin Hill (budget), Farnborough (premium), Luton (east)'},
  {id:'edinburgh',name:'Edinburgh',country:'GB',region:'uk',lat:55.95,lng:-3.19},
  {id:'manchester',name:'Manchester',country:'GB',region:'uk',lat:53.48,lng:-2.24},
  {id:'jersey',name:'Jersey',country:'GB',region:'uk',lat:49.21,lng:-2.13,island:true},
  // France
  {id:'paris',name:'Paris',country:'FR',region:'eu-west',lat:48.86,lng:2.35,note:'Le Bourget (LBG) primary FBO'},
  {id:'nice',name:'Nice',country:'FR',region:'eu-med',lat:43.71,lng:7.26},
  {id:'monaco',name:'Monaco',country:'MC',region:'eu-med',lat:43.74,lng:7.43,heliOnly:true,note:'No airport; helicopter from NCE in 7 min'},
  {id:'cannes',name:'Cannes',country:'FR',region:'eu-med',lat:43.55,lng:7.02,note:'Cannes-Mandelieu (CEQ) for private'},
  {id:'bordeaux',name:'Bordeaux',country:'FR',region:'eu-west',lat:44.84,lng:-0.58,note:'TGV from Paris 2h04 — train wins decisively'},
  {id:'lyon',name:'Lyon',country:'FR',region:'eu-west',lat:45.75,lng:4.84},
  {id:'marseille',name:'Marseille',country:'FR',region:'eu-med',lat:43.30,lng:5.37},
  {id:'toulouse',name:'Toulouse',country:'FR',region:'eu-west',lat:43.60,lng:1.44},
  {id:'biarritz',name:'Biarritz',country:'FR',region:'eu-west',lat:43.48,lng:-1.56},
  {id:'courchevel',name:'Courchevel',country:'FR',region:'eu-alpine',lat:45.42,lng:6.63,note:'Altiport LFLJ; helicopter from Geneva 30-35 min'},
  {id:'val-disere',name:"Val d'Isère",country:'FR',region:'eu-alpine',lat:45.45,lng:6.98},
  {id:'megeve',name:'Megève',country:'FR',region:'eu-alpine',lat:45.85,lng:6.62},
  {id:'meribel',name:'Méribel',country:'FR',region:'eu-alpine',lat:45.40,lng:6.57},
  // Switzerland
  {id:'geneva',name:'Geneva',country:'CH',region:'eu-central',lat:46.20,lng:6.15,note:'Geneva Business Aviation Centre — primary UHNW FBO'},
  {id:'zurich',name:'Zurich',country:'CH',region:'eu-central',lat:47.38,lng:8.54,note:'Jet Aviation HQ at ZRH'},
  {id:'st-moritz',name:'St Moritz',country:'CH',region:'eu-alpine',lat:46.50,lng:9.84},
  {id:'verbier',name:'Verbier',country:'CH',region:'eu-alpine',lat:46.10,lng:7.23,note:'No airport; helicopter from Geneva'},
  // Benelux
  {id:'amsterdam',name:'Amsterdam',country:'NL',region:'eu-benelux',lat:52.37,lng:4.90},
  {id:'brussels',name:'Brussels',country:'BE',region:'eu-benelux',lat:50.85,lng:4.35},
  {id:'antwerp',name:'Antwerp',country:'BE',region:'eu-benelux',lat:51.22,lng:4.40},
  {id:'luxembourg',name:'Luxembourg',country:'LU',region:'eu-benelux',lat:49.61,lng:6.13},
  // Germany / Austria
  {id:'frankfurt',name:'Frankfurt',country:'DE',region:'eu-dach',lat:50.11,lng:8.68,note:'Egelsbach (QEF) closer to banking district'},
  {id:'munich',name:'Munich',country:'DE',region:'eu-dach',lat:48.14,lng:11.58},
  {id:'hamburg',name:'Hamburg',country:'DE',region:'eu-dach',lat:53.55,lng:10.00},
  {id:'berlin',name:'Berlin',country:'DE',region:'eu-dach',lat:52.52,lng:13.41},
  {id:'dusseldorf',name:'Düsseldorf',country:'DE',region:'eu-dach',lat:51.22,lng:6.78},
  {id:'sylt',name:'Sylt',country:'DE',region:'eu-dach',lat:54.91,lng:8.33,island:true,note:'GWT airfield; peak UHNW Jul-Aug'},
  {id:'vienna',name:'Vienna',country:'AT',region:'eu-dach',lat:48.21,lng:16.37},
  {id:'salzburg',name:'Salzburg',country:'AT',region:'eu-dach',lat:47.80,lng:13.04},
  {id:'innsbruck',name:'Innsbruck',country:'AT',region:'eu-alpine',lat:47.27,lng:11.40},
  // Scandinavia
  {id:'copenhagen',name:'Copenhagen',country:'DK',region:'eu-nordic',lat:55.68,lng:12.57},
  {id:'stockholm',name:'Stockholm',country:'SE',region:'eu-nordic',lat:59.33,lng:18.07},
  {id:'oslo',name:'Oslo',country:'NO',region:'eu-nordic',lat:59.91,lng:10.75},
  // Iberia
  {id:'madrid',name:'Madrid',country:'ES',region:'eu-south',lat:40.42,lng:-3.70},
  {id:'barcelona',name:'Barcelona',country:'ES',region:'eu-south',lat:41.39,lng:2.16,note:'Sabadell (QSA) for private'},
  {id:'seville',name:'Seville',country:'ES',region:'eu-south',lat:37.39,lng:-5.99},
  {id:'ibiza',name:'Ibiza',country:'ES',region:'eu-island',lat:38.91,lng:1.43,island:true,note:'Slot restrictions Aug; book 3 weeks ahead'},
  {id:'majorca',name:'Majorca (Palma)',country:'ES',region:'eu-island',lat:39.57,lng:2.65,island:true},
  {id:'minorca',name:'Minorca',country:'ES',region:'eu-island',lat:39.98,lng:3.83,island:true},
  {id:'marbella',name:'Marbella',country:'ES',region:'eu-south',lat:36.51,lng:-4.88,note:'Malaga (AGP) for private'},
  {id:'lisbon',name:'Lisbon',country:'PT',region:'eu-south',lat:38.72,lng:-9.14},
  {id:'porto',name:'Porto',country:'PT',region:'eu-south',lat:41.16,lng:-8.63},
  {id:'algarve',name:'Algarve (Faro)',country:'PT',region:'eu-south',lat:37.02,lng:-7.93},
  // Italy
  {id:'milan',name:'Milan',country:'IT',region:'eu-south',lat:45.46,lng:9.19,note:'Linate (LIN) 10 min from Duomo; slot-restricted Mar + Sep'},
  {id:'rome',name:'Rome',country:'IT',region:'eu-south',lat:41.90,lng:12.50,note:'Ciampino (CIA) for private'},
  {id:'florence',name:'Florence',country:'IT',region:'eu-south',lat:43.77,lng:11.26},
  {id:'venice',name:'Venice',country:'IT',region:'eu-south',lat:45.44,lng:12.32,note:'Treviso (TSF) preferred for private'},
  {id:'sardinia',name:'Sardinia (Olbia)',country:'IT',region:'eu-island',lat:40.92,lng:9.52,island:true,note:'Busiest private airfield in Europe Aug 1-20'},
  {id:'sicily',name:'Sicily (Palermo)',country:'IT',region:'eu-island',lat:38.12,lng:13.36,island:true},
  {id:'naples-it',name:'Naples',country:'IT',region:'eu-south',lat:40.84,lng:14.25},
  {id:'capri',name:'Capri',country:'IT',region:'eu-island',lat:40.55,lng:14.24,island:true,note:'Helicopter or boat from Naples'},
  {id:'portofino',name:'Portofino',country:'IT',region:'eu-south',lat:44.30,lng:9.21,note:'Helicopter from Genoa or Cannes'},
  {id:'puglia',name:'Puglia (Bari)',country:'IT',region:'eu-south',lat:41.12,lng:16.87},
  // Greece
  {id:'athens',name:'Athens',country:'GR',region:'eu-south',lat:37.98,lng:23.73},
  {id:'mykonos',name:'Mykonos',country:'GR',region:'eu-island',lat:37.45,lng:25.37,island:true,note:'Cat B airport; book ground simultaneously'},
  {id:'santorini',name:'Santorini',country:'GR',region:'eu-island',lat:36.39,lng:25.46,island:true,note:'Helicopter over the caldera is the arrival experience'},
  {id:'corfu',name:'Corfu',country:'GR',region:'eu-island',lat:39.62,lng:19.92,island:true},
  {id:'thessaloniki',name:'Thessaloniki',country:'GR',region:'eu-south',lat:40.64,lng:22.94},
  // Croatia
  {id:'dubrovnik',name:'Dubrovnik',country:'HR',region:'eu-south',lat:42.65,lng:18.09},
  {id:'split',name:'Split',country:'HR',region:'eu-south',lat:43.51,lng:16.44},
  {id:'hvar',name:'Hvar',country:'HR',region:'eu-island',lat:43.17,lng:16.44,island:true,note:'Helicopter or speedboat from Split'},
  // Middle East / Africa
  {id:'dubai',name:'Dubai',country:'AE',region:'me',lat:25.20,lng:55.27},
  {id:'abu-dhabi',name:'Abu Dhabi',country:'AE',region:'me',lat:24.47,lng:54.37},
  {id:'marrakech',name:'Marrakech',country:'MA',region:'africa',lat:31.63,lng:-8.01},
  {id:'cape-town',name:'Cape Town',country:'ZA',region:'africa',lat:-33.93,lng:18.42},
  // Asia
  {id:'singapore',name:'Singapore',country:'SG',region:'asia',lat:1.35,lng:103.82},
  {id:'tokyo',name:'Tokyo',country:'JP',region:'asia',lat:35.68,lng:139.69},
  {id:'hong-kong',name:'Hong Kong',country:'HK',region:'asia',lat:22.32,lng:114.17},
]

// ─────────────────────────────────────────────────────────────────────────────
// RAIL ROUTES (key high-speed pairs — both directions covered by lookup)
// ─────────────────────────────────────────────────────────────────────────────
const RAIL_ROUTES: Record<string,{time:string;service:string;headline:string}> = {
  'london|paris':       {time:'2h15',service:'Eurostar Premier',headline:'Rail wins decisively. City centre to city centre.'},
  'london|amsterdam':   {time:'3h55',service:'Eurostar Direct',headline:'Rail holds — though commercial from LCY is the time-critical alternative.'},
  'london|brussels':    {time:'2h00',service:'Eurostar',headline:'Train. No contest.'},
  'london|edinburgh':   {time:'4h20',service:'LNER Azuma First',headline:'Rail wins for 1-2. Jet for 4+ or Highland onward.'},
  'london|manchester':  {time:'2h10',service:'Avanti First',headline:'Train. No contest.'},
  'paris|bordeaux':     {time:'2h04',service:'TGV Business First',headline:'Train wins decisively — jet adds no door-to-door advantage.'},
  'paris|lyon':         {time:'1h55',service:'TGV Business First',headline:'One of the best rail corridors in Europe.'},
  'paris|marseille':    {time:'3h05',service:'TGV Business First',headline:'Rail is right for 1-2. Private competes for families with luggage.'},
  'paris|toulouse':     {time:'4h10',service:'TGV Business First',headline:'Competitive between rail and private at this duration.'},
  'paris|nice':         {time:'5h30',service:'TGV or overnight Intercités',headline:'Private becomes genuinely competitive here. Rail for overnight or scenic.'},
  'paris|amsterdam':    {time:'3h22',service:'Thalys / Eurostar',headline:'Rail works well for 1-2 on this corridor.'},
  'paris|brussels':     {time:'1h22',service:'Thalys',headline:'Train is the only sensible answer.'},
  'amsterdam|brussels': {time:'1h50',service:'Thalys',headline:'Train is clearly correct.'},
  'amsterdam|london':   {time:'3h55',service:'Eurostar Direct',headline:'Train for 1-2. Commercial from AMS close call for 3+.'},
  'brussels|london':    {time:'2h00',service:'Eurostar',headline:'Train is correct.'},
  'brussels|paris':     {time:'1h22',service:'Thalys',headline:'Train is the only sensible answer.'},
  'amsterdam|paris':    {time:'3h22',service:'Thalys',headline:'Rail works well for 1-2.'},
  'barcelona|madrid':   {time:'2h30',service:'AVE Preferente',headline:'High-speed rail wins. One of the best in Europe.'},
  'madrid|seville':     {time:'2h30',service:'AVE',headline:'AVE is correct.'},
  'barcelona|seville':  {time:'5h30',service:'AVE via Madrid',headline:'Long but viable for rail fans. Private more efficient.'},
  'milan|rome':         {time:'2h57',service:'Frecciarossa Business',headline:'Rail is correct for 1-2 travellers.'},
  'milan|florence':     {time:'1h45',service:'Frecciarossa',headline:'Train is unambiguous.'},
  'milan|venice':       {time:'2h18',service:'Frecciarossa',headline:'Train. Private adds no door-to-door benefit.'},
  'rome|florence':      {time:'1h30',service:'Frecciarossa',headline:'Train wins here.'},
  'frankfurt|munich':   {time:'3h00',service:'ICE First',headline:'ICE is competitive. Private for 4+ or schedule flexibility.'},
  'frankfurt|amsterdam':{time:'3h52',service:'ICE / Thalys',headline:'Rail holds for 1-2. Private for groups or time-critical.'},
  'frankfurt|brussels': {time:'2h00',service:'ICE / Thalys',headline:'Rail is a serious option here.'},
  'munich|vienna':      {time:'4h00',service:'ÖBB Railjet',headline:'Rail works — private competes for 4+ on schedule flexibility.'},
  'zurich|geneva':      {time:'2h45',service:'SBB First',headline:'Rail works. Private for Alpine onward connections.'},
  'zurich|munich':      {time:'3h30',service:'EC First',headline:'Competitive between rail and private.'},
  'geneva|paris':       {time:'3h20',service:'TGV via Lyon',headline:'Rail is a real option for 1-2 travellers.'},
  'new-york|boston':    {time:'3h15',service:'Amtrak Acela First',headline:'Rail wins decisively on this corridor.'},
  'new-york|washington-dc':{time:'2h55',service:'Amtrak Acela First',headline:'Acela is the dominant business corridor answer.'},
  'new-york|philadelphia':{time:'1h15',service:'Acela or Chauffeur',headline:'Do not fly this. Train or chauffeur.'},
  'washington-dc|philadelphia':{time:'1h45',service:'Amtrak',headline:'Train is correct.'},
}
function getRailRoute(a:string,b:string) { return RAIL_ROUTES[`${a}|${b}`]||RAIL_ROUTES[`${b}|${a}`]||null }

// ─────────────────────────────────────────────────────────────────────────────
// MODE ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function computeModes(origin:City,destination:City,distanceKm:number,priority:string,groupSize:string,luggage:string):ModeResult[] {
  const grp = groupSize==='solo'?1:groupSize==='couple'?2:groupSize==='small-group'?4:groupSize==='family'?5:8
  const isIsland = destination.island===true
  const isHeliOnly = destination.heliOnly===true
  const isAlpine = destination.region==='eu-alpine'
  const isUS = origin.region?.startsWith('us')&&destination.region?.startsWith('us')
  const isTransatlantic = (origin.region?.startsWith('us')&&!destination.region?.startsWith('us'))||(!origin.region?.startsWith('us')&&destination.region?.startsWith('us'))
  const railRoute = getRailRoute(origin.id,destination.id)
  const heavyLuggage = luggage==='heavy'

  const modes:Omit<ModeResult,'compositeScore'|'recommended'>[] = []

  // CHAUFFEUR
  if(distanceKm<650&&!isHeliOnly) {
    const h = distanceKm/95
    modes.push({
      id:'chauffeur',name:'Chauffeur',category:'ground',
      doorToDoorHours:h,
      doorToDoorLabel:`~${h<2?Math.round(h*60)+' min':Math.round(h*10)/10+'h'} door-to-door`,
      costLabel:distanceKm<150?'€200-600':distanceKm<350?'€500-1,300':'€900-2,200',
      headline:'No terminal, no schedule, no friction.',
      reasons:[
        'Complete flexibility — leave when ready, stop when needed, change the plan',
        grp>=4?`For ${grp} travellers the per-head cost is often better than commercial`:'Productive environment in transit: calls, documents, conversation',
        heavyLuggage?'No baggage restrictions — correct for ski equipment, wardrobes, or relocation volume':'Quiet, private, and unobserved throughout',
      ],
      timeScore:distanceKm<200?7:5, valueScore:grp>=4?7:5, experienceScore:8, privacyScore:9,
    })
  }

  // HIGH-SPEED RAIL
  if(railRoute) {
    const railH = parseRailTime(railRoute.time)
    modes.push({
      id:'rail',name:`Rail — ${railRoute.service}`,category:'rail',
      doorToDoorHours:railH,
      doorToDoorLabel:`${railRoute.time} city-centre to city-centre`,
      costLabel:distanceKm<500?'€150-600 per seat':'€250-900 per seat',
      headline:railRoute.headline,
      reasons:[
        'City-centre to city-centre — no airport wrap, no transfer, no terminal friction',
        'First class on this service: working table, proper meal, lounge access both ends',
        grp<=2?'For 1-2 travellers this often beats flying on total journey time':`At ${grp} people, divide the charter cost — rail value per seat is hard to beat`,
      ],
      timeScore:distanceKm<400?9:7, valueScore:9, experienceScore:7, privacyScore:4,
    })
  }

  // HELICOPTER
  if(isHeliOnly||isAlpine||isIsland||(distanceKm<380&&distanceKm>20)) {
    const heliMin = isHeliOnly?8:Math.round(distanceKm/3.3)
    const heliH = (heliMin+30)/60
    modes.push({
      id:'helicopter',name:'Helicopter',category:'air-private',
      doorToDoorHours:heliH,
      doorToDoorLabel:isHeliOnly?'8 min from Nice (NCE)':`~${heliMin} min flight`,
      costLabel:distanceKm<120?'€1,200-4,500':distanceKm<250?'€4,500-9,000':'€9,000-18,000',
      headline:isHeliOnly?'The only correct answer to Monaco.':isAlpine?'Solves the mountain access problem entirely.':'No runway required — land where you need to be.',
      reasons:[
        isHeliOnly?'Monaco has no airport. NCE to the helipad in 7-8 minutes is the standard.':isAlpine?`${destination.name} is helicopter-natural — eliminates road time through the mountains`:'Under 300km, door-to-door time often beats any fixed-wing option',
        'Direct pad arrival — no terminal, no road transfer, no scrutiny',
        'Weather-dependent — always arrange a chauffeur ground plan as backup',
      ],
      timeScore:9, valueScore:distanceKm<100?6:5, experienceScore:10, privacyScore:10,
    })
  }

  // FERRY / TENDER
  if(isIsland&&distanceKm<220) {
    const ferryH=(distanceKm/48)+0.5
    modes.push({
      id:'ferry',name:'Fast ferry / private tender',category:'water',
      doorToDoorHours:ferryH,
      doorToDoorLabel:`~${Math.round(ferryH)}h crossing`,
      costLabel:'€60-350 per seat ferry / €1,500-8,000 private tender',
      headline:'The scenic answer. Occasionally the right one.',
      reasons:[
        'Private tender eliminates the terminal entirely — a different kind of arrival',
        destination.id==='capri'?'For Capri, the boat arrival from Naples is part of the experience':'Correct when moving a vehicle or when helicopter weather closes down',
        'Fast ferry at €60-350 per seat when time is not the constraint',
      ],
      timeScore:3, valueScore:8, experienceScore:7, privacyScore:5,
    })
  }

  // SEMI-PRIVATE — US only (JSX)
  if(isUS&&distanceKm<1100&&(origin.id==='los-angeles'||destination.id==='los-angeles'||origin.id==='san-francisco'||destination.id==='san-francisco'||origin.id==='las-vegas'||destination.id==='las-vegas')) {
    modes.push({
      id:'semi-private',name:'Semi-private (JSX)',category:'air-semi',
      doorToDoorHours:(distanceKm/680)+1,
      doorToDoorLabel:`~${Math.round((distanceKm/680+1)*60)} min total`,
      costLabel:'€280-650 per seat',
      headline:'Between commercial and private — at a fraction of the charter cost.',
      reasons:[
        'Operates from FBO terminals: 20-minute check-in, no TSA, no main terminal',
        'Embraer ERJ-135, 30 seats with generous spacing — not the same crowd as commercial',
        'Right for solo travellers who want the premium experience without full charter economics',
      ],
      timeScore:7, valueScore:8, experienceScore:7, privacyScore:7,
    })
  }

  // COMMERCIAL BUSINESS / FIRST
  if(distanceKm>280||(distanceKm>150&&!railRoute&&!isHeliOnly)) {
    const flightH=distanceKm/820
    const wrapH=isTransatlantic?3:2
    const dtdH=flightH+wrapH
    modes.push({
      id:'commercial',name:distanceKm>5000?'Commercial — Business / First':'Commercial — Business class',category:'air-commercial',
      doorToDoorHours:dtdH,
      doorToDoorLabel:`${Math.round(flightH*10)/10}h flight + ${wrapH}h airport`,
      costLabel:distanceKm<1500?'€400-1,800 per seat':distanceKm<6000?'€2,500-8,000 per seat':'€6,500-18,000 per seat',
      headline:grp<=2?'Correct for 1-2 travellers on this distance.':`For ${grp} travellers, private jet economics start to compete.`,
      reasons:[
        grp<=2?'Business class product on this corridor is real — not a compromise':'Divide the charter cost across your group — the gap narrows quickly',
        'Frequency advantage: multiple daily departures, easy to rebook',
        distanceKm>5000?'La Première / Emirates Suites at ultra-long range is a genuine product':'Lounge access both ends partially offsets the airport friction',
      ],
      timeScore:dtdH<4?6:5, valueScore:grp<=2?7:5, experienceScore:distanceKm>5000?7:5, privacyScore:3,
    })
  }

  // PRIVATE JET — LIGHT
  if(distanceKm>120&&distanceKm<2800&&!isHeliOnly) {
    const flightH=distanceKm/700
    const dtdH=flightH+0.75
    const base=distanceKm<600?8:distanceKm<1300?15:23
    modes.push({
      id:'jet-light',name:'Private jet — light',category:'air-private',
      doorToDoorHours:dtdH,
      doorToDoorLabel:`${Math.round(flightH*60)} min flight, ~45 min wrap`,
      costLabel:`€${base}-${Math.round(base*1.55)}k return`,
      headline:grp<=4?'The precision instrument for this distance.':'Light jet is tight for your group — mid-size is the correct call.',
      reasons:[
        `4-6 seats; right for couples, small groups, or a principal with staff`,
        distanceKm<900?'Door-to-door often rivals commercial once airport friction is removed — sometimes beats it':'Empty-legs are active on popular corridors — always ask before quoting full charter',
        destination.note||`Private FBO arrival: no terminal, no queue, no scrutiny`,
      ],
      timeScore:8, valueScore:grp<=3?6:4, experienceScore:8, privacyScore:10,
    })
  }

  // PRIVATE JET — MID-SIZE
  if(distanceKm>450&&distanceKm<6200&&!isHeliOnly) {
    const flightH=distanceKm/780
    const dtdH=flightH+0.75
    const base=distanceKm<1500?24:distanceKm<3200?40:60
    modes.push({
      id:'jet-mid',name:'Private jet — mid-size',category:'air-private',
      doorToDoorHours:dtdH,
      doorToDoorLabel:`${Math.round(flightH*10)/10}h flight, ~45 min wrap`,
      costLabel:`€${base}-${Math.round(base*1.5)}k return`,
      headline:grp>=5?'Right aircraft for your group on this distance.':'More aircraft than needed unless group size or luggage demands it.',
      reasons:[
        `7-9 seats; correct for families, boards, or groups with volume`,
        'Challenger 350 / Falcon 2000 / Citation Longitude — cabin standing room, fully flat on longer sectors',
        distanceKm>3200?'Non-stop on this corridor — no tech stop required':'Multiple FBO options; ask about empty-legs on return sector',
      ],
      timeScore:9, valueScore:grp>=5?7:5, experienceScore:9, privacyScore:10,
    })
  }

  // PRIVATE JET — HEAVY / LONG-RANGE
  if(distanceKm>3800&&!isHeliOnly) {
    const flightH=distanceKm/850
    const base=distanceKm<7500?80:145
    const isULR=distanceKm>9000
    modes.push({
      id:'jet-heavy',name:isULR?'Private jet — ultra-long-range':'Private jet — long-range',category:'air-private',
      doorToDoorHours:flightH+0.75,
      doorToDoorLabel:`${Math.round(flightH*10)/10}h non-stop`,
      costLabel:`€${base}-${Math.round(base*1.5)}k return`,
      headline:isULR?'The only non-stop private option at this range.':'Heavy cabin. Full privacy across the distance.',
      reasons:[
        isULR?'G700 / G650ER range covers transatlantic and transpacific non-stop':'Global 6000 / Falcon 8X: non-stop on this corridor',
        'Full cabin: standing headroom, bedroom suite, meeting table — not the same product as mid-size',
        grp>=6?'At 6+ travellers, per-seat cost approaches commercial Suites — without a terminal':'Direct FBO arrival both ends: no immigration queues, no scrutiny',
      ],
      timeScore:10, valueScore:grp>=6?6:4, experienceScore:10, privacyScore:10,
    })
  }

  // SCORE & SORT
  const weights:Record<string,[number,number,number,number]> = {
    time:       [0.50,0.15,0.20,0.15],
    cost:       [0.15,0.55,0.20,0.10],
    experience: [0.15,0.15,0.55,0.15],
    privacy:    [0.20,0.15,0.25,0.40],
  }
  const [wT,wV,wE,wP] = weights[priority]||weights.time
  const scored:ModeResult[] = modes.map(m=>({
    ...m,
    compositeScore:m.timeScore*wT+m.valueScore*wV+m.experienceScore*wE+m.privacyScore*wP,
    recommended:false,
  })).sort((a,b)=>b.compositeScore-a.compositeScore)
  if(scored.length>0) scored[0].recommended=true
  return scored
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSET CALCULATOR LOGIC
// ─────────────────────────────────────────────────────────────────────────────
function getAssetVerdict(mode:string,hours:number) {
  const scenarios:Record<string,any> = {
    chauffeur:{label:'Chauffeured ground transport',unit:'hours per year',thresholds:[
      {below:200,verdict:'On-demand',rationale:'Ad-hoc through a trusted network. No standing costs, no utilisation risk.'},
      {below:800,verdict:'Retained network',rationale:'A retainer with priority drivers on call — past ad-hoc economics, not yet full dedicated volume.'},
      {below:1600,verdict:'Dedicated contracted',rationale:'One or two drivers contracted exclusively to you. We help structure this cleanly.'},
      {below:9999,verdict:'In-house',rationale:'Dedicated household staff. We source, contract, and manage.'},
    ],costs:(h:number)=>({onDemand:h*120,retained:30000+(h*80),dedicated:120000,inHouse:95000})},
    car:{label:'Luxury car (personal use)',unit:'years of ownership',thresholds:[
      {below:1,verdict:'On-demand chauffeur',rationale:'Below 50 days of use, a €200k+ vehicle is wasted capital.'},
      {below:3,verdict:'Long-term lease',rationale:'1-3 year horizons favour leasing — residual risk sits with the lessor.'},
      {below:5,verdict:'Purchase (value-holding marques)',rationale:'Porsche 911, G-Class, select Ferraris depreciate slowly enough for ownership to win.'},
      {below:9999,verdict:'Purchase — appreciating assets',rationale:'Air-cooled classics, LaFerrari, F1 — a different conversation entirely.'},
    ],costs:(y:number)=>({onDemand:40000*y,lease:48000*y,owned:240000+(8000*y)-(30000*y),inHouse:240000+(8000*y)-(30000*y)})},
    helicopter:{label:'Helicopter',unit:'flight hours per year',thresholds:[
      {below:25,verdict:'On-demand charter',rationale:'Below 25 hours, charter is unambiguously correct.'},
      {below:80,verdict:'Fractional share',rationale:'25-80 hours: fractional (1/8 or 1/4) beats charter on per-hour cost and guarantees availability.'},
      {below:200,verdict:'Full ownership, managed',rationale:'Above 80 hours, full ownership with professional management — chartered back when not in use.'},
      {below:9999,verdict:'In-house flight department',rationale:'200+ hours: dedicated pilots, engineers, hangarage. Serious corporate structure.'},
    ],costs:(h:number)=>({onDemand:h*3500,fractional:(h*2800)+80000,owned:900000+(h*1800),inHouse:1400000+(h*1500)})},
    'jet-light':{label:'Private jet — light / mid-size',unit:'flight hours per year',thresholds:[
      {below:25,verdict:'On-demand charter',rationale:'Below 25 hours, charter directly through us — TAG, VistaJet, LunaJets, GlobeAir.'},
      {below:50,verdict:'Jet card',rationale:'25-50 hours: a jet card (NetJets, VistaJet, Flexjet) gives guaranteed availability at fixed rates.'},
      {below:150,verdict:'Fractional share',rationale:'50-150 hours: fractional (1/16 to 1/4) is sharper economically. Longer commitment, better per-hour.'},
      {below:400,verdict:'Full ownership, managed',rationale:'Above 150 hours, ownership with a management company charter programme. Configured to you.'},
      {below:9999,verdict:'In-house flight department',rationale:'400+ hours justifies a private flight department. Family office or holding company structure.'},
    ],costs:(h:number)=>({onDemand:h*5500,card:(h*5000)+50000,fractional:(h*4200)+200000,owned:1800000+(h*3200),inHouse:2800000+(h*2800)})},
    'jet-heavy':{label:'Private jet — heavy / long-range',unit:'flight hours per year',thresholds:[
      {below:25,verdict:'On-demand charter',rationale:'Heavy jet charter is expensive but correct below 25 hours.'},
      {below:75,verdict:'Jet card — heavy category',rationale:'VistaJet Program, NetJets Marquis — guaranteed long-range availability.'},
      {below:250,verdict:'Fractional — heavy',rationale:'Regular transatlantic or Gulf-Europe: Global or Falcon 8X per-hour costs drop meaningfully.'},
      {below:600,verdict:'Full ownership, managed',rationale:'250+ hours: ownership pays, especially with active charter-back programme.'},
      {below:9999,verdict:'In-house',rationale:'Long-range with dedicated crew, managed in-house. Top-tier family office structure.'},
    ],costs:(h:number)=>({onDemand:h*12000,card:(h*11000)+100000,fractional:(h*9500)+450000,owned:4500000+(h*7200),inHouse:6800000+(h*6500)})},
    yacht:{label:'Yacht (30m+)',unit:'weeks of use per year',thresholds:[
      {below:2,verdict:'Charter',rationale:'1-2 weeks: charter is the only sensible answer. Different yacht, different sea, every season.'},
      {below:6,verdict:'Regular charter with relationship',rationale:'3-6 weeks: charter with the same broker, often the same captain and vessel year after year.'},
      {below:10,verdict:'Fractional yacht ownership',rationale:'SeaNet, YachtPlus — serious use, serious cost reduction versus full ownership.'},
      {below:16,verdict:'Full ownership, chartered back',rationale:'10+ weeks of genuine use: ownership with active charter offsetting.'},
      {below:9999,verdict:'Full ownership, private use',rationale:'Above 16 weeks: private asset. Crew, berthing, refit cycles — worth it for continuity.'},
    ],costs:(w:number)=>({onDemand:w*400000,fractional:3500000+(w*180000),owned:6500000+(w*60000),inHouse:6500000+(w*60000)})},
  }
  const s=scenarios[mode]; if(!s) return null
  const verdict=s.thresholds.find((t:any)=>hours<t.below)
  return {label:s.label,unit:s.unit,verdict:verdict.verdict,rationale:verdict.rationale,costs:s.costs(hours)}
}

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION STEPS
// ─────────────────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {key:'purpose',question:'What kind of journey is this?',subtitle:'The tone of the day tells us more than the distance.',
    options:[
      {value:'business-urgent',label:'Business, time-pressed',desc:'A meeting must happen. The day cannot bend.',icon:Zap},
      {value:'business-measured',label:'Business, measured',desc:'Work is the reason, but the day has room.',icon:Briefcase},
      {value:'leisure-efficient',label:'Leisure, efficient',desc:'Getting there matters. Being there is the point.',icon:Clock},
      {value:'leisure-scenic',label:'Leisure, experiential',desc:'The journey is part of the pleasure.',icon:Heart},
    ]},
  {key:'travellers',question:'Who is travelling?',subtitle:'Groups change the answer more than distance does.',
    options:[
      {value:'solo',label:'One',desc:'Solo traveller'},
      {value:'couple',label:'Two',desc:'Couple, or principal plus one'},
      {value:'small-group',label:'Three to five',desc:'Small group or small family'},
      {value:'family',label:'Family with children or pets',desc:'Volume, continuity, patience needed'},
      {value:'large-group',label:'Six or more',desc:'Board, crew, extended family'},
    ]},
  {key:'luggage',question:'How much luggage?',subtitle:'It changes the answer more than people expect.',
    options:[
      {value:'light',label:'Light',desc:'Weekend bags, laptop cases'},
      {value:'medium',label:'Medium',desc:'A week of travel, a few bags each'},
      {value:'heavy',label:'Heavy',desc:'Relocation volume, ski equipment, full wardrobe'},
    ]},
  {key:'priority',question:'If you had to choose — what matters most?',subtitle:'We will remember the others, but this wins the ties.',
    options:[
      {value:'time',label:'Time',desc:'Saving hours. The day is short.',icon:Clock},
      {value:'cost',label:'Value',desc:'The right outcome for the right money.',icon:DollarSign},
      {value:'experience',label:'Experience',desc:'The journey itself should be good.',icon:Sparkles},
      {value:'privacy',label:'Privacy',desc:'Nobody notices, nobody asks.',icon:Shield},
    ]},
  {key:'flexibility',question:'How flexible is the timing?',subtitle:'Flexibility unlocks empty-legs and the better options.',
    options:[
      {value:'fixed',label:'Fixed',desc:'This date, this time, no movement'},
      {value:'same-day',label:'±2 hours',desc:'Same day, roughly this time'},
      {value:'flexible',label:'±1 day',desc:'Either side of the target date works'},
    ]},
  {key:'frequency',question:'How often do you make this journey?',subtitle:'This is the question that changes whether to book, share, or own.',
    options:[
      {value:'one-off',label:'Once',desc:'This journey, this time'},
      {value:'occasional',label:'A handful of times a year',desc:'2-10 per year'},
      {value:'frequent',label:'Regularly',desc:'10-50 per year'},
      {value:'daily',label:'Very regularly',desc:'50+ per year — it is part of your life'},
    ]},
]

// ─────────────────────────────────────────────────────────────────────────────
// CITY SEARCH COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function CitySearch({label,value,onSelect,placeholder}:{label:string;value:City|null;onSelect:(c:City)=>void;placeholder:string}) {
  const [query,setQuery]=useState('')
  const [open,setOpen]=useState(false)
  const ref=useRef<HTMLDivElement>(null)

  const results = query.length>1
    ? CITIES.filter(c=>c.name.toLowerCase().includes(query.toLowerCase())||c.country.toLowerCase().includes(query.toLowerCase())).slice(0,8)
    : []

  useEffect(()=>{
    const handler=(e:MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown',handler)
    return ()=>document.removeEventListener('mousedown',handler)
  },[])

  const select=(c:City)=>{ onSelect(c); setQuery(''); setOpen(false) }

  return (
    <div ref={ref} style={{position:'relative'}}>
      <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'0.5rem',fontSize:'0.7rem'}}>{label}</div>
      {value ? (
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1.2rem',border:'1.5px solid #0e4f51',background:'rgba(14,79,81,0.04)'}}>
          <div>
            <div className="tgc-serif" style={{fontSize:'1.3rem',color:'#0e4f51'}}>{value.name}</div>
            <div style={{fontSize:'0.78rem',color:'#6b7280',fontFamily:'Lato',marginTop:'2px'}}>{value.country}{value.note?` · ${value.note}`:''}</div>
          </div>
          <button onClick={()=>{onSelect(null as any)}} style={{background:'none',border:'none',cursor:'pointer',color:'#6b7280',padding:'0.3rem'}}>
            <X size={16}/>
          </button>
        </div>
      ) : (
        <>
          <div style={{position:'relative'}}>
            <Search size={16} style={{position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',color:'#c8aa4a'}}/>
            <input
              className="tgc-input"
              style={{paddingLeft:'2.8rem'}}
              placeholder={placeholder}
              value={query}
              onChange={e=>{setQuery(e.target.value);setOpen(true)}}
              onFocus={()=>setOpen(true)}
            />
          </div>
          {open&&results.length>0&&(
            <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#ffffff',border:'1px solid #e5e7eb',zIndex:50,boxShadow:'0 8px 24px rgba(0,0,0,0.08)'}}>
              {results.map(c=>(
                <button key={c.id} onClick={()=>select(c)} style={{width:'100%',padding:'0.85rem 1.2rem',background:'none',border:'none',borderBottom:'1px solid #f3f4f6',textAlign:'left',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(14,79,81,0.04)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                  <span className="tgc-serif" style={{fontSize:'1.05rem',color:'#1a1815'}}>{c.name}</span>
                  <span style={{fontSize:'0.75rem',color:'#6b7280',fontFamily:'Lato'}}>{c.country}{c.island?' · island':''}{c.heliOnly?' · heli only':''}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORE BAR
// ─────────────────────────────────────────────────────────────────────────────
function ScoreBar({label,score,recommended}:{label:string;score:number;recommended:boolean}) {
  return (
    <div>
      <div style={{fontSize:'0.6rem',color:recommended?'rgba(255,255,255,0.6)':'#9ca3af',fontFamily:'Lato',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'4px'}}>{label}</div>
      <div style={{height:'3px',background:recommended?'rgba(255,255,255,0.2)':'#e5e7eb',borderRadius:'2px'}}>
        <div style={{height:'100%',width:`${score*10}%`,background:recommended?'#c8aa4a':'#0e4f51',borderRadius:'2px',transition:'width 0.8s ease'}}/>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const TGCTransportIntelligence = () => {
  const [screen,setScreen] = useState('welcome')
  const [origin,setOrigin] = useState<City|null>(null)
  const [destination,setDestination] = useState<City|null>(null)
  const [step,setStep] = useState(0)
  const [answers,setAnswers] = useState<Record<string,string|null>>({purpose:null,travellers:null,luggage:null,priority:null,flexibility:null,frequency:null})
  const [selectedMode,setSelectedMode] = useState<ModeResult|null>(null)
  const [clientDetails,setClientDetails] = useState({name:'',email:'',phone:'',travelDate:'',returnDate:'',message:''})
  const [submitting,setSubmitting] = useState(false)
  const [submitted,setSubmitted] = useState(false)
  const [calcMode,setCalcMode] = useState('jet-light')
  const [calcHours,setCalcHours] = useState(50)
  const [savedJourneys,setSavedJourneys] = useState<any[]>([])
  const [showSaveModal,setShowSaveModal] = useState(false)
  const [saveName,setSaveName] = useState('')
  const [analysing,setAnalysing] = useState(false)

  useEffect(()=>{
    try {
      const keys=Object.keys(localStorage).filter(k=>k.startsWith('tgc-journey-'))
      setSavedJourneys(keys.map(k=>{ try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return null} }).filter(Boolean))
    } catch{}
  },[])

  const distanceKm = origin&&destination ? Math.round(haversineKm(origin.lat,origin.lng,destination.lat,destination.lng)) : 0

  const modes = (origin&&destination&&answers.priority&&answers.travellers&&answers.luggage)
    ? computeModes(origin,destination,distanceKm,answers.priority,answers.travellers,answers.luggage)
    : []

  const resetAll = () => {
    setOrigin(null); setDestination(null); setStep(0)
    setAnswers({purpose:null,travellers:null,luggage:null,priority:null,flexibility:null,frequency:null})
    setSelectedMode(null); setSubmitted(false)
    setClientDetails({name:'',email:'',phone:'',travelDate:'',returnDate:'',message:''})
    setScreen('welcome')
  }

  const handleAnswer = (key:string,value:string) => {
    const newAnswers={...answers,[key]:value}
    setAnswers(newAnswers)
    setTimeout(()=>{
      if(step<QUESTIONS.length-1) setStep(step+1)
      else {
        setAnalysing(true)
        setTimeout(()=>{ setAnalysing(false); setScreen('matrix') }, 1200)
      }
    },260)
  }

  const submitBrief = async () => {
    setSubmitting(true)
    try {
      await fetch('/api/intelligence/submit',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          type:'transport',
          submittedAt:new Date().toISOString(),
          route:{origin:origin?.name,destination:destination?.name,distanceKm},
          recommendedMode:selectedMode?.name,
          brief:answers,client:clientDetails,
        }),
      })
    } catch{}
    setSubmitting(false); setSubmitted(true)
  }

  const saveJourney = () => {
    if(!saveName.trim()||!origin||!destination) return
    const key=`tgc-journey-${Date.now()}`
    const data={key,name:saveName.trim(),origin,destination,answers,modeName:selectedMode?.name,saved:new Date().toISOString()}
    try { localStorage.setItem(key,JSON.stringify(data)); setSavedJourneys([...savedJourneys,data]) } catch{}
    setShowSaveModal(false); setSaveName('')
  }

  const currentQ = QUESTIONS[step]
  const allAnswered = Object.values(answers).every(v=>v!==null)

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:'100vh',background:'#F9F8F5',color:'#1a1815',fontFamily:"'Lato', sans-serif",padding:'2rem 1.5rem'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Lato:ital,wght@0,300;0,400;0,700;1,300&display=swap');
        .tgc-serif { font-family: 'Poppins', sans-serif; font-weight: 400; }
        .tgc-mono { font-family: 'Lato', sans-serif; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }
        .tgc-fade { animation: tgcFade 0.55s ease forwards; }
        @keyframes tgcFade { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .tgc-option:hover { background: rgba(14,79,81,0.05) !important; border-color: #0e4f51 !important; }
        .tgc-input { width:100%; padding:0.85rem 1rem; border:1px solid #e5e7eb; background:#fff; font-size:1rem; font-family:'Lato',sans-serif; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
        .tgc-input:focus { border-color:#0e4f51; }
        .tgc-btn:hover:not(:disabled) { opacity:0.85; }
        .tgc-btn:disabled { opacity:0.35; cursor:not-allowed; }
        .tgc-dot { width:6px; height:6px; border-radius:50%; background:#e5e7eb; transition:all 0.3s; }
        .tgc-dot.active { background:#0e4f51; width:28px; border-radius:3px; }
        .tgc-dot.done { background:#c8aa4a; }
        .mode-card:hover { border-color:#0e4f51 !important; }
        .mode-card.selected { border-color:#0e4f51 !important; background:rgba(14,79,81,0.04) !important; }
        ::-webkit-scrollbar { display:none; }
      `}</style>

      <div style={{maxWidth:'1040px',margin:'0 auto'}}>

        {/* SUITE NAV */}
        <div style={{marginBottom:'1.75rem'}}>
          <div style={{display:'flex',gap:'1.5rem',alignItems:'center',marginBottom:'0.75rem'}}>
            <a href="/intelligence" style={{color:'#6b7280',fontSize:'0.75rem',textDecoration:'none',fontFamily:"'Lato',sans-serif",letterSpacing:'0.06em',textTransform:'uppercase'}}>
              ← Intelligence Suite
            </a>
            <a href="https://www.thegatekeepers.club" style={{color:'#c8aa4a',fontSize:'0.75rem',textDecoration:'none',fontFamily:"'Lato',sans-serif",letterSpacing:'0.06em',textTransform:'uppercase'}}>
              ↩ Website
            </a>
          </div>
          <div style={{display:'flex',gap:'0.4rem',overflowX:'auto',scrollbarWidth:'none'} as React.CSSProperties}>
            {[
              {num:'01',label:'Transport',href:'/intelligence/transport',active:true},
              {num:'02',label:'Real Estate',href:'/intelligence/realestate',active:false},
              {num:'03',label:'Wellness',href:'/intelligence/wellness',active:false},
              {num:'04',label:'Events',href:'/intelligence/events-production',active:false},
              {num:'05',label:'VIP',href:'/intelligence/vip-hospitality',active:false},
              {num:'06',label:'Art',href:'/intelligence/art-collectables',active:false},
            ].map(t=>(
              <a key={t.num} href={t.href} style={{padding:'0.3rem 0.75rem',border:t.active?'none':'1px solid #e5e7eb',background:t.active?'#0e4f51':'transparent',color:t.active?'#ffffff':'#6b7280',fontSize:'0.7rem',fontFamily:"'Lato',sans-serif",letterSpacing:'0.06em',textTransform:'uppercase',whiteSpace:'nowrap',borderRadius:'3px',textDecoration:'none'}}>
                {t.num} {t.label}
              </a>
            ))}
          </div>
        </div>

        {/* HEADER */}
        <div style={{marginBottom:'2.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
          <div className="tgc-serif" style={{fontSize:'1.1rem',color:'#0e4f51',cursor:'pointer'}} onClick={()=>setScreen('welcome')}>
            The Gatekeepers Club
          </div>
          <div className="tgc-mono" style={{color:'#c8aa4a'}}>Transport Intelligence · v.3</div>
        </div>

        {/* ── WELCOME ─────────────────────────────────────────────────────────── */}
        {screen==='welcome'&&(
          <div className="tgc-fade">
            <h1 className="tgc-serif" style={{fontWeight:400,fontSize:'clamp(2.8rem,6vw,4.8rem)',lineHeight:1.03,letterSpacing:'-0.01em',marginBottom:'1.2rem'}}>
              Getting there,<br/><em style={{color:'#0e4f51'}}>considered.</em>
            </h1>
            <p style={{fontSize:'clamp(1.05rem,2vw,1.3rem)',color:'#6b7280',maxWidth:'620px',lineHeight:1.6,marginBottom:'3rem',fontWeight:300}}>
              From chauffeur to private jet. We tell you the right mode for your specific journey — honestly — then arrange it. Or model when to book, share, or own.
            </p>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem',marginBottom:'3rem'}}>
              <button onClick={()=>setScreen('route')} style={{background:'#0e4f51',color:'#ffffff',padding:'2.5rem 2rem',border:'none',textAlign:'left',cursor:'pointer',transition:'all 0.25s',borderRadius:8}}
                onMouseEnter={e=>e.currentTarget.style.opacity='0.9'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'1rem'}}>Tool 01 · The Journey</div>
                <div className="tgc-serif" style={{fontSize:'1.8rem',marginBottom:'0.6rem',lineHeight:1.15}}>Plan a <em>specific route</em></div>
                <div style={{fontSize:'0.92rem',opacity:0.75,lineHeight:1.55}}>Any origin, any destination. All modes compared. The right answer for your group, timing, and priorities.</div>
                <div className="tgc-mono" style={{marginTop:'1.5rem',color:'#c8aa4a'}}>Choose your cities →</div>
              </button>

              <button onClick={()=>setScreen('calculator')} style={{background:'transparent',color:'#1a1815',padding:'2.5rem 2rem',border:'1.5px solid #e5e7eb',textAlign:'left',cursor:'pointer',transition:'all 0.25s',borderRadius:8}}
                onMouseEnter={e=>{e.currentTarget.style.background='#0e4f51';e.currentTarget.style.color='#ffffff';e.currentTarget.style.borderColor='#0e4f51'}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#1a1815';e.currentTarget.style.borderColor='#e5e7eb'}}>
                <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'1rem'}}>Tool 02 · The Asset</div>
                <div className="tgc-serif" style={{fontSize:'1.8rem',marginBottom:'0.6rem',lineHeight:1.15}}>Book, share, or <em>own</em>?</div>
                <div style={{fontSize:'0.92rem',lineHeight:1.55}}>Model when chartering stops making sense. Jets, helicopters, yachts, cars. The break-even, clearly.</div>
                <div className="tgc-mono" style={{marginTop:'1.5rem'}}>Calculate →</div>
              </button>
            </div>

            {savedJourneys.length>0&&(
              <div style={{padding:'1.5rem',border:'1px solid #e5e7eb'}}>
                <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'1rem'}}>Saved journeys</div>
                {savedJourneys.map(j=>(
                  <div key={j.key} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.7rem 0',borderBottom:'1px solid #f3f4f6'}}>
                    <button onClick={()=>{ setOrigin(j.origin);setDestination(j.destination);setAnswers(j.answers||answers);setScreen('matrix') }}
                      className="tgc-serif" style={{background:'none',border:'none',textAlign:'left',cursor:'pointer',fontSize:'1.05rem',color:'#0e4f51'}}>
                      {j.origin?.name} → {j.destination?.name}
                      <span style={{color:'#c8aa4a',fontSize:'0.82rem',fontFamily:'Lato',fontStyle:'normal'}}> · {j.name}</span>
                    </button>
                    <button onClick={()=>{ try{localStorage.removeItem(j.key)}catch{} setSavedJourneys(savedJourneys.filter(s=>s.key!==j.key)) }}
                      style={{background:'none',border:'none',cursor:'pointer',color:'#9ca3af',padding:'0.3rem'}}><X size={15}/></button>
                  </div>
                ))}
              </div>
            )}

            <div style={{marginTop:'5rem',paddingTop:'2rem',borderTop:'1px solid #e5e7eb',display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem',alignItems:'center'}}>
              <div style={{color:'#6b7280',fontSize:'0.9rem',fontWeight:300}}>Bicycle to ultra-long-range. Every mode, one decision.</div>
              <div className="tgc-mono" style={{color:'#6b7280'}}>The Gatekeepers Club · Europe · Global</div>
            </div>
          </div>
        )}

        {/* ── ROUTE ───────────────────────────────────────────────────────────── */}
        {screen==='route'&&(
          <div className="tgc-fade">
            <div style={{marginBottom:'2rem'}}>
              <button onClick={()=>setScreen('welcome')} style={{background:'none',border:'none',cursor:'pointer',color:'#6b7280',display:'flex',alignItems:'center',gap:'0.4rem'}} className="tgc-mono">
                <ChevronLeft size={14}/> Home
              </button>
            </div>

            <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'0.8rem'}}>Step 1 of 3 · Your route</div>
            <h2 className="tgc-serif" style={{fontWeight:400,fontSize:'clamp(2.2rem,5vw,3.5rem)',lineHeight:1.05,marginBottom:'0.6rem',letterSpacing:'-0.01em'}}>
              Where are you <em style={{color:'#0e4f51'}}>going</em>?
            </h2>
            <p style={{fontSize:'1.1rem',color:'#6b7280',marginBottom:'2.5rem',maxWidth:'580px',lineHeight:1.55,fontWeight:300}}>
              Any city. We cover US, UK, and Europe — Benelux, DACH, Nordics, Mediterranean, islands. Type to search.
            </p>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem',marginBottom:'2rem'}}>
              <CitySearch label="Departing from" value={origin} onSelect={setOrigin} placeholder="London, Paris, New York..."/>
              <CitySearch label="Arriving in" value={destination} onSelect={setDestination} placeholder="Monaco, Sylt, Aspen..."/>
            </div>

            {origin&&destination&&(
              <div className="tgc-fade" style={{padding:'1.2rem 1.5rem',border:'1px solid #e5e7eb',background:'rgba(14,79,81,0.03)',marginBottom:'2rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
                <div>
                  <div className="tgc-serif" style={{fontSize:'1.25rem',color:'#0e4f51'}}>{origin.name} → {destination.name}</div>
                  <div style={{fontSize:'0.85rem',color:'#6b7280',fontFamily:'Lato',marginTop:'3px'}}>
                    {distanceKm.toLocaleString()} km · {regionLabel(origin,destination)}
                    {destination.heliOnly?' · Helicopter access only':''}
                    {destination.island&&!destination.heliOnly?' · Island destination':''}
                  </div>
                </div>
                <div className="tgc-mono" style={{color:'#c8aa4a'}}>
                  {distanceKm<200?'Short hop':distanceKm<800?'Regional':distanceKm<3000?'Medium haul':distanceKm<7000?'Long haul':'Ultra-long range'}
                </div>
              </div>
            )}

            <button
              onClick={()=>{ setStep(0); setScreen('questions') }}
              disabled={!origin||!destination||origin.id===destination.id}
              className="tgc-btn"
              style={{background:'#0e4f51',color:'#ffffff',border:'none',padding:'1.1rem 2.5rem',cursor:'pointer',fontFamily:"'Lato',sans-serif",fontSize:'0.8rem',letterSpacing:'0.08em',textTransform:'uppercase'}}>
              Continue →
            </button>
          </div>
        )}

        {/* ── QUESTIONS ───────────────────────────────────────────────────────── */}
        {screen==='questions'&&(
          <div>
            {analysing ? (
              <div className="tgc-fade" style={{textAlign:'center',padding:'5rem 1rem'}}>
                <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'1.5rem',fontSize:'0.8rem',letterSpacing:'0.15em'}}>Analysing route</div>
                <div className="tgc-serif" style={{fontSize:'clamp(1.6rem,3vw,2.4rem)',color:'#0e4f51',marginBottom:'1rem'}}>
                  {origin?.name} → {destination?.name}
                </div>
                <div style={{color:'#6b7280',fontWeight:300,fontSize:'0.95rem'}}>Comparing all modes for your brief…</div>
              </div>
            ) : (
              <div>
                <div style={{marginBottom:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
                  <button onClick={()=>step>0?setStep(step-1):setScreen('route')} style={{background:'none',border:'none',cursor:'pointer',color:'#6b7280',display:'flex',alignItems:'center',gap:'0.4rem'}} className="tgc-mono">
                    <ChevronLeft size={14}/> {step>0?'Back':'Change route'}
                  </button>
                  <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>
                    {QUESTIONS.map((_,i)=>(
                      <div key={i} className={`tgc-dot${i===step?' active':i<step?' done':''}`}/>
                    ))}
                  </div>
                </div>

                <div style={{padding:'0.9rem 1.2rem',border:'1px solid #e5e7eb',background:'rgba(14,79,81,0.03)',marginBottom:'2rem',display:'inline-flex',alignItems:'center',gap:'0.75rem'}}>
                  <span className="tgc-mono" style={{color:'#c8aa4a'}}>Route</span>
                  <span className="tgc-serif" style={{fontSize:'1.1rem',color:'#0e4f51'}}>{origin?.name} → {destination?.name}</span>
                  <span style={{fontSize:'0.78rem',color:'#6b7280',fontFamily:'Lato'}}>{distanceKm.toLocaleString()} km</span>
                </div>

                <div key={step} className="tgc-fade">
                  <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'0.8rem'}}>
                    Step 2 of 3 · Question {String(step+1).padStart(2,'0')} of {String(QUESTIONS.length).padStart(2,'0')}
                  </div>
                  <h2 className="tgc-serif" style={{fontWeight:400,fontSize:'clamp(2rem,4.5vw,3.2rem)',lineHeight:1.1,marginBottom:'0.7rem',letterSpacing:'-0.01em'}}>
                    {currentQ.question}
                  </h2>
                  <p className="tgc-serif" style={{fontSize:'1.1rem',color:'#6b7280',marginBottom:'2.5rem',maxWidth:'580px',lineHeight:1.5}}>
                    {currentQ.subtitle}
                  </p>

                  <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                    {currentQ.options.map((opt:any)=>{
                      const selected=answers[currentQ.key]===opt.value
                      const Icon=opt.icon
                      return (
                        <button key={opt.value} onClick={()=>handleAnswer(currentQ.key,opt.value)}
                          className="tgc-option"
                          style={{background:selected?'rgba(14,79,81,0.07)':'transparent',border:`1px solid ${selected?'#0e4f51':'#e5e7eb'}`,padding:'1.2rem 1.4rem',textAlign:'left',cursor:'pointer',display:'flex',alignItems:'center',gap:'1.2rem',transition:'all 0.2s',color:'#1a1815',borderRadius:8}}>
                          {Icon&&(
                            <div style={{width:'34px',height:'34px',borderRadius:'50%',background:selected?'#0e4f51':'#f3f4f6',color:selected?'#ffffff':'#c8aa4a',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                              <Icon size={16}/>
                            </div>
                          )}
                          <div style={{flex:1}}>
                            <div className="tgc-serif" style={{fontSize:'1.15rem',fontWeight:400,marginBottom:'0.15rem'}}>{opt.label}</div>
                            <div style={{fontSize:'0.88rem',color:'#6b7280',fontWeight:300}}>{opt.desc}</div>
                          </div>
                          {selected&&<Check size={16} style={{color:'#0e4f51',flexShrink:0}}/>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MODE MATRIX ─────────────────────────────────────────────────────── */}
        {screen==='matrix'&&(
          <div className="tgc-fade">
            <div style={{marginBottom:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
              <button onClick={()=>{setStep(QUESTIONS.length-1);setScreen('questions')}} style={{background:'none',border:'none',cursor:'pointer',color:'#6b7280',display:'flex',alignItems:'center',gap:'0.4rem'}} className="tgc-mono">
                <ChevronLeft size={14}/> Adjust brief
              </button>
              <button onClick={resetAll} style={{background:'none',border:'none',cursor:'pointer',color:'#6b7280',display:'flex',alignItems:'center',gap:'0.4rem'}} className="tgc-mono">
                <RotateCcw size={13}/> Start over
              </button>
            </div>

            <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'0.8rem'}}>Step 3 of 3 · Mode comparison</div>
            <h2 className="tgc-serif" style={{fontWeight:400,fontSize:'clamp(2rem,4.5vw,3.2rem)',lineHeight:1.05,marginBottom:'0.4rem',letterSpacing:'-0.01em'}}>
              <em style={{color:'#0e4f51'}}>{origin?.name}</em> → <em style={{color:'#0e4f51'}}>{destination?.name}</em>
            </h2>
            <p style={{fontSize:'0.95rem',color:'#6b7280',marginBottom:'2.5rem',fontFamily:'Lato',fontWeight:300}}>
              {distanceKm.toLocaleString()} km · {regionLabel(origin!,destination!)} · sorted by your priority: {answers.priority}
            </p>

            <div style={{display:'flex',flexDirection:'column',gap:'0.8rem',marginBottom:'2.5rem'}}>
              {modes.map((mode,idx)=>{
                const sel=selectedMode?.id===mode.id
                const rec=mode.recommended&&!selectedMode
                const highlight=sel||rec
                return (
                  <button key={mode.id} onClick={()=>setSelectedMode(mode)}
                    className={`mode-card${sel?' selected':''}`}
                    style={{
                      background:highlight&&mode.recommended?'#0e4f51':sel?'rgba(14,79,81,0.05)':'#ffffff',
                      border:`1.5px solid ${highlight?'#0e4f51':'#e5e7eb'}`,
                      padding:'1.5rem',textAlign:'left',cursor:'pointer',
                      transition:'all 0.2s',borderRadius:8,
                      animation:`tgcFade 0.4s ease ${idx*0.08}s forwards`,opacity:0,
                    }}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem',flexWrap:'wrap',gap:'0.5rem'}}>
                      <div>
                        {mode.recommended&&(
                          <div className="tgc-mono" style={{color:highlight?'#c8aa4a':'#c8aa4a',marginBottom:'0.4rem',fontSize:'0.65rem'}}>
                            ★ TGC Recommendation
                          </div>
                        )}
                        <div className="tgc-serif" style={{fontSize:'1.2rem',color:highlight&&mode.recommended?'#ffffff':'#0e4f51',fontWeight:mode.recommended?500:400}}>
                          {mode.name}
                        </div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:'0.9rem',color:highlight&&mode.recommended?'rgba(255,255,255,0.8)':'#1a1815',fontFamily:'Lato',fontWeight:300}}>{mode.doorToDoorLabel}</div>
                        <div className="tgc-mono" style={{color:highlight&&mode.recommended?'#c8aa4a':'#c8aa4a',marginTop:'2px'}}>{mode.costLabel}</div>
                      </div>
                    </div>

                    <div style={{fontStyle:'italic',fontSize:'0.95rem',color:highlight&&mode.recommended?'rgba(255,255,255,0.75)':'#6b7280',marginBottom:'1rem',fontFamily:'Lato',fontWeight:300}}>
                      {mode.headline}
                    </div>

                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.75rem'}}>
                      <ScoreBar label="Time" score={mode.timeScore} recommended={highlight&&mode.recommended}/>
                      <ScoreBar label="Value" score={mode.valueScore} recommended={highlight&&mode.recommended}/>
                      <ScoreBar label="Experience" score={mode.experienceScore} recommended={highlight&&mode.recommended}/>
                      <ScoreBar label="Privacy" score={mode.privacyScore} recommended={highlight&&mode.recommended}/>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={()=>{ if(!selectedMode) setSelectedMode(modes[0]); setScreen('recommendation') }}
              style={{background:'#0e4f51',color:'#ffffff',border:'none',padding:'1.1rem 2.5rem',cursor:'pointer',fontFamily:"'Lato',sans-serif",fontSize:'0.8rem',letterSpacing:'0.08em',textTransform:'uppercase',borderRadius:4}}>
              {selectedMode?`See brief for ${selectedMode.name}`:'See the full recommendation →'}
            </button>
          </div>
        )}

        {/* ── RECOMMENDATION ──────────────────────────────────────────────────── */}
        {screen==='recommendation'&&(selectedMode||modes[0])&&(
          <div className="tgc-fade">
            {(() => {
              const mode = selectedMode||modes[0]
              return (
                <>
                  <div style={{marginBottom:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
                    <button onClick={()=>setScreen('matrix')} style={{background:'none',border:'none',cursor:'pointer',color:'#6b7280',display:'flex',alignItems:'center',gap:'0.4rem'}} className="tgc-mono">
                      <ChevronLeft size={14}/> All modes
                    </button>
                    <button onClick={resetAll} style={{background:'none',border:'none',cursor:'pointer',color:'#6b7280',display:'flex',alignItems:'center',gap:'0.4rem'}} className="tgc-mono">
                      <RotateCcw size={13}/> Start over
                    </button>
                  </div>

                  <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'0.8rem'}}>Your brief · answered</div>

                  <div style={{padding:'0.8rem 1.2rem',border:'1px solid #e5e7eb',background:'rgba(14,79,81,0.03)',marginBottom:'2rem',display:'inline-flex',alignItems:'center',gap:'0.75rem',flexWrap:'wrap'}}>
                    <span className="tgc-serif" style={{color:'#0e4f51',fontSize:'1.15rem'}}>{origin?.name} → {destination?.name}</span>
                    <span style={{color:'#9ca3af',fontSize:'0.75rem',fontFamily:'Lato'}}>{distanceKm.toLocaleString()} km</span>
                    <span style={{color:'#9ca3af',fontSize:'0.75rem',fontFamily:'Lato'}}>·</span>
                    <span style={{fontSize:'0.78rem',color:'#6b7280',fontFamily:'Lato',fontWeight:300}}>{answers.purpose} · {answers.travellers} · priority: {answers.priority}</span>
                  </div>

                  {/* VERDICT */}
                  <div style={{background:'#0e4f51',color:'#ffffff',padding:'2.5rem 2rem',marginBottom:'2rem',borderRadius:4}}>
                    <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'0.8rem'}}>The right answer for this journey</div>
                    <div className="tgc-serif" style={{fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:400,lineHeight:1.1,marginBottom:'0.4rem'}}>
                      <em style={{fontStyle:'italic'}}>{mode.name}</em>
                    </div>
                    <div style={{color:'rgba(255,255,255,0.7)',fontSize:'1rem',fontFamily:'Lato',fontWeight:300,marginBottom:'1.5rem'}}>{mode.doorToDoorLabel}</div>
                    <div style={{paddingTop:'1.5rem',borderTop:'1px solid rgba(255,255,255,0.12)',display:'flex',gap:'2.5rem',flexWrap:'wrap'}}>
                      <div>
                        <div className="tgc-mono" style={{color:'rgba(255,255,255,0.5)',marginBottom:'0.3rem'}}>Indicative</div>
                        <div className="tgc-serif" style={{color:'#c8aa4a',fontSize:'1rem'}}>{mode.costLabel}</div>
                      </div>
                      <div>
                        <div className="tgc-mono" style={{color:'rgba(255,255,255,0.5)',marginBottom:'0.3rem'}}>Priority matched</div>
                        <div className="tgc-serif" style={{color:'#c8aa4a',fontSize:'1rem',textTransform:'capitalize'}}>{answers.priority}</div>
                      </div>
                    </div>
                  </div>

                  {/* REASONS */}
                  <div style={{marginBottom:'2rem'}}>
                    <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'1rem'}}>Why this, specifically</div>
                    {mode.reasons.map((r,i)=>(
                      <div key={i} style={{display:'flex',gap:'1.2rem',padding:'1.2rem 0',borderBottom:i<mode.reasons.length-1?'1px solid #f3f4f6':'none'}}>
                        <div className="tgc-mono" style={{color:'#c8aa4a',paddingTop:'0.2rem'}}>{String(i+1).padStart(2,'0')}</div>
                        <div className="tgc-serif" style={{fontSize:'1.08rem',lineHeight:1.55,color:'#1a1815'}}>{r}</div>
                      </div>
                    ))}
                  </div>

                  {/* WHEN THIS CHANGES */}
                  {modes.length>1&&(
                    <div style={{border:'1px solid #e5e7eb',padding:'1.5rem',marginBottom:'2rem',background:'rgba(14,79,81,0.02)'}}>
                      <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'0.8rem'}}>When this changes</div>
                      {modes.slice(1,3).map((alt,i)=>(
                        <div key={alt.id} style={{paddingTop:i>0?'0.8rem':'0',marginTop:i>0?'0.8rem':'0',borderTop:i>0?'1px solid #f3f4f6':'none'}}>
                          <span className="tgc-serif" style={{color:'#0e4f51',fontSize:'1rem'}}>{alt.name}: </span>
                          <span style={{fontSize:'0.95rem',color:'#6b7280',fontFamily:'Lato',fontWeight:300}}>{alt.headline}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ASSET PROMPT */}
                  {(answers.frequency==='frequent'||answers.frequency==='daily')&&(
                    <div style={{border:'1px solid #c8aa4a',background:'rgba(200,170,74,0.05)',padding:'1.5rem',marginBottom:'2rem',display:'flex',gap:'1rem',alignItems:'flex-start'}}>
                      <TrendingUp size={20} style={{color:'#0e4f51',flexShrink:0,marginTop:'0.2rem'}}/>
                      <div>
                        <div className="tgc-mono" style={{color:'#0e4f51',marginBottom:'0.5rem'}}>Asset question triggered</div>
                        <div style={{fontSize:'0.95rem',color:'#1a1815',lineHeight:1.55,marginBottom:'1rem',fontWeight:300}}>
                          At this frequency, a jet card, fractional share, or retained structure may cost less than on-demand charter. Worth modelling before the next booking.
                        </div>
                        <button onClick={()=>setScreen('calculator')} style={{background:'#0e4f51',color:'#ffffff',border:'none',padding:'0.55rem 1.1rem',cursor:'pointer',fontSize:'0.7rem',fontFamily:'Lato',letterSpacing:'0.08em',textTransform:'uppercase'}}>
                          Model the economics →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* BOOKING FORM */}
                  {!submitted&&(
                    <div style={{borderTop:'2px solid #0e4f51',paddingTop:'2.5rem',marginTop:'3rem'}}>
                      <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'0.8rem'}}>Book this through TGC</div>
                      <h3 className="tgc-serif" style={{fontWeight:400,fontSize:'clamp(1.6rem,3vw,2.4rem)',marginBottom:'0.6rem',lineHeight:1.15}}>
                        Let us <em style={{color:'#0e4f51'}}>arrange it.</em>
                      </h3>
                      <p style={{fontSize:'1rem',color:'#6b7280',marginBottom:'2rem',fontWeight:300,maxWidth:'540px',lineHeight:1.55}}>
                        A gatekeeper will respond within the hour with a firm quote. No templates, no intermediaries.
                      </p>

                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'1rem',marginBottom:'1rem'}}>
                        {[
                          {label:'Name',key:'name',type:'text',placeholder:'Your name'},
                          {label:'Email',key:'email',type:'email',placeholder:'email@example.com'},
                          {label:'Phone (optional)',key:'phone',type:'tel',placeholder:'+33 or +1...'},
                          {label:'Travel date',key:'travelDate',type:'date',placeholder:''},
                        ].map(f=>(
                          <div key={f.key}>
                            <label className="tgc-mono" style={{display:'block',marginBottom:'0.5rem',color:'#6b7280'}}>{f.label}</label>
                            <input type={f.type} className="tgc-input" value={(clientDetails as any)[f.key]}
                              onChange={e=>setClientDetails({...clientDetails,[f.key]:e.target.value})}
                              placeholder={f.placeholder}/>
                          </div>
                        ))}
                      </div>

                      <div style={{marginBottom:'1.5rem'}}>
                        <label className="tgc-mono" style={{display:'block',marginBottom:'0.5rem',color:'#6b7280'}}>Anything else we should know?</label>
                        <textarea className="tgc-input" rows={3} value={clientDetails.message}
                          onChange={e=>setClientDetails({...clientDetails,message:e.target.value})}
                          placeholder="Specific preferences, timing constraints, who is travelling..."
                          style={{resize:'vertical',fontFamily:'inherit'}}/>
                      </div>

                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'1rem'}}>
                        <button onClick={()=>setShowSaveModal(true)} style={{background:'transparent',border:'1px solid #1a1815',padding:'1rem',cursor:'pointer',color:'#1a1815',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.6rem'}} className="tgc-btn">
                          <Save size={15}/><span className="tgc-mono">Save this journey</span>
                        </button>
                        <button onClick={submitBrief}
                          disabled={!clientDetails.name||!clientDetails.email||!clientDetails.travelDate||submitting}
                          className="tgc-btn"
                          style={{background:'#0e4f51',color:'#ffffff',border:'none',padding:'1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.6rem',borderRadius:4}}>
                          {submitting?<span className="tgc-mono">Sending…</span>:<><Send size={15}/><span className="tgc-mono">Send brief to TGC</span></>}
                        </button>
                      </div>
                      <div style={{fontSize:'0.82rem',color:'#9ca3af',marginTop:'1rem',fontFamily:'Lato',textAlign:'center',fontWeight:300}}>
                        Response within the hour. Named person. No automated templates.
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        )}

        {/* ── CONFIRMATION ────────────────────────────────────────────────────── */}
        {submitted&&(
          <div className="tgc-fade" style={{textAlign:'center',padding:'4rem 1rem'}}>
            <div style={{width:'72px',height:'72px',borderRadius:'50%',background:'rgba(14,79,81,0.08)',color:'#0e4f51',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 2rem'}}>
              <CheckCircle size={34}/>
            </div>
            <h2 className="tgc-serif" style={{fontWeight:400,fontSize:'clamp(2rem,4vw,3rem)',marginBottom:'1rem'}}>
              Received. In good <em style={{color:'#0e4f51'}}>hands.</em>
            </h2>
            <p style={{fontSize:'1.1rem',color:'#6b7280',maxWidth:'500px',margin:'0 auto 2.5rem',lineHeight:1.55,fontWeight:300}}>
              A gatekeeper has your brief. You will hear from a named person within the hour.
            </p>
            <button onClick={resetAll} className="tgc-btn" style={{background:'#0e4f51',color:'#ffffff',border:'none',padding:'0.9rem 2rem',cursor:'pointer'}}>
              <span className="tgc-mono">Plan another journey</span>
            </button>
          </div>
        )}

        {/* ── CALCULATOR ──────────────────────────────────────────────────────── */}
        {screen==='calculator'&&(
          <div className="tgc-fade">
            <div style={{marginBottom:'2rem'}}>
              <button onClick={()=>setScreen('welcome')} style={{background:'none',border:'none',cursor:'pointer',color:'#6b7280',display:'flex',alignItems:'center',gap:'0.4rem'}} className="tgc-mono">
                <ChevronLeft size={14}/> Home
              </button>
            </div>

            <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'0.8rem'}}>Asset Intelligence</div>
            <h2 className="tgc-serif" style={{fontWeight:400,fontSize:'clamp(2.2rem,5vw,3.5rem)',lineHeight:1.05,marginBottom:'0.8rem'}}>
              Book, share, <em style={{color:'#0e4f51'}}>or own</em>?
            </h2>
            <p style={{fontSize:'1.1rem',color:'#6b7280',marginBottom:'3rem',maxWidth:'620px',lineHeight:1.55,fontWeight:300}}>
              Every mode of transport has a break-even point where booking stops being cheapest and ownership stops being absurd.
            </p>

            <div style={{marginBottom:'2.5rem'}}>
              <div className="tgc-mono" style={{color:'#6b7280',marginBottom:'1rem'}}>What are you considering?</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'0.6rem'}}>
                {[
                  {v:'chauffeur',l:'Chauffeur service'},
                  {v:'car',l:'Luxury car'},
                  {v:'helicopter',l:'Helicopter'},
                  {v:'jet-light',l:'Light / mid-size jet'},
                  {v:'jet-heavy',l:'Heavy / long-range jet'},
                  {v:'yacht',l:'Yacht (30m+)'},
                ].map(opt=>(
                  <button key={opt.v} onClick={()=>setCalcMode(opt.v)}
                    style={{padding:'1rem',background:calcMode===opt.v?'#1a1815':'transparent',color:calcMode===opt.v?'#F9F8F5':'#1a1815',border:`1px solid ${calcMode===opt.v?'#1a1815':'#e5e7eb'}`,cursor:'pointer',transition:'all 0.2s',borderRadius:4}}
                    className="tgc-serif">
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {(()=>{
              const isYacht=calcMode==='yacht',isCar=calcMode==='car'
              const unit=isYacht?'weeks':isCar?'years':'hours'
              const label=isYacht?'weeks of use per year':isCar?'years of ownership':'flight hours per year'
              const max=isYacht?30:isCar?10:500
              const stepVal=isYacht?1:isCar?1:5
              const result=getAssetVerdict(calcMode,calcHours)
              return (
                <>
                  <div style={{background:'#F9F8F5',border:'1px solid #e5e7eb',padding:'2rem',marginBottom:'2rem'}}>
                    <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'1rem'}}>Your {label}</div>
                    <div style={{display:'flex',alignItems:'baseline',gap:'1rem',marginBottom:'1.5rem'}}>
                      <div className="tgc-serif" style={{fontSize:'clamp(3rem,7vw,5rem)',fontWeight:400,color:'#1a1815',lineHeight:1}}>{calcHours}</div>
                      <div className="tgc-serif" style={{fontSize:'1.3rem',color:'#6b7280'}}>{unit}</div>
                    </div>
                    <input type="range" min={isYacht?1:isCar?1:10} max={max} step={stepVal} value={calcHours}
                      onChange={e=>setCalcHours(parseInt(e.target.value))}
                      style={{width:'100%',height:'4px',background:'#e5e7eb',outline:'none',appearance:'none',WebkitAppearance:'none',accentColor:'#0e4f51'}}/>
                  </div>

                  {result&&(
                    <>
                      <div style={{background:'#0e4f51',color:'#ffffff',padding:'2.5rem 2rem',marginBottom:'2rem',borderRadius:4}}>
                        <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'0.8rem'}}>At {calcHours} {unit}, the answer is</div>
                        <div className="tgc-serif" style={{fontSize:'clamp(1.8rem,4vw,2.8rem)',fontWeight:400,lineHeight:1.1,marginBottom:'1.2rem'}}>
                          <em style={{color:'#c8aa4a'}}>{result.verdict}</em>
                        </div>
                        <div style={{fontSize:'1rem',lineHeight:1.55,color:'rgba(255,255,255,0.82)',fontWeight:300}}>{result.rationale}</div>
                      </div>

                      {result.costs&&(
                        <div style={{marginBottom:'2.5rem'}}>
                          <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'1rem'}}>The annual cost picture</div>
                          <div style={{background:'#F9F8F5',border:'1px solid #e5e7eb',padding:'1.5rem'}}>
                            {Object.entries(result.costs).map(([key,value])=>{
                              const labels:Record<string,string>={onDemand:'On-demand / charter',retained:'Retained network',dedicated:'Dedicated contracted',inHouse:'Fully in-house',card:'Jet card',fractional:'Fractional ownership',owned:'Full ownership',lease:'Long-term lease'}
                              const maxVal=Math.max(...Object.values(result.costs) as number[])
                              const pct=Math.max(5,((value as number)/maxVal)*100)
                              return (
                                <div key={key} style={{padding:'1rem 0',borderBottom:'1px solid #f3f4f6'}}>
                                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'0.5rem'}}>
                                    <div className="tgc-serif" style={{fontSize:'1rem',color:'#1a1815'}}>{labels[key]||key}</div>
                                    <div className="tgc-serif" style={{fontSize:'1rem',color:'#1a1815'}}>{formatCurrency(value as number)}<span style={{fontSize:'0.75rem',color:'#6b7280',fontWeight:300}}>/yr</span></div>
                                  </div>
                                  <div style={{height:'4px',background:'#e5e7eb',position:'relative',borderRadius:2}}>
                                    <div style={{position:'absolute',left:0,top:0,bottom:0,width:`${pct}%`,background:'#c8aa4a',transition:'width 0.5s ease',borderRadius:2}}/>
                                  </div>
                                </div>
                              )
                            })}
                            <div style={{fontSize:'0.82rem',color:'#9ca3af',marginTop:'1rem',lineHeight:1.5,fontFamily:'Lato',fontWeight:300}}>
                              Indicative. Real quotes account for aircraft type, home base, crew, hangarage, insurance, and charter-back programmes that can offset ownership costs meaningfully.
                            </div>
                          </div>
                        </div>
                      )}

                      <button onClick={()=>setScreen('route')} style={{width:'100%',background:'#0e4f51',color:'#ffffff',border:'none',padding:'1.2rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.6rem',borderRadius:4}} className="tgc-btn">
                        <Send size={15}/><span className="tgc-mono">Have us structure this</span>
                      </button>
                    </>
                  )}
                </>
              )
            })()}
          </div>
        )}

        {/* ── SAVE MODAL ─────────────────────────────────────────────────────── */}
        {showSaveModal&&(
          <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(26,24,21,0.55)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem',zIndex:100}}
            onClick={()=>setShowSaveModal(false)}>
            <div style={{background:'#F9F8F5',padding:'2.5rem',maxWidth:'440px',width:'100%',borderRadius:4}} onClick={e=>e.stopPropagation()}>
              <div className="tgc-mono" style={{color:'#c8aa4a',marginBottom:'1rem'}}>Save this journey</div>
              <h3 className="tgc-serif" style={{fontSize:'1.8rem',fontWeight:400,marginBottom:'1.5rem',lineHeight:1.15}}>
                Give it a <em style={{color:'#0e4f51'}}>name</em>
              </h3>
              <input type="text" value={saveName} onChange={e=>setSaveName(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter')saveJourney()}}
                placeholder="e.g. The Monaco run" autoFocus className="tgc-input" style={{marginBottom:'1.5rem'}}/>
              <div style={{display:'flex',gap:'0.8rem'}}>
                <button onClick={()=>setShowSaveModal(false)} style={{flex:1,padding:'0.9rem',background:'transparent',border:'1px solid #1a1815',cursor:'pointer',color:'#1a1815'}} className="tgc-mono">Cancel</button>
                <button onClick={saveJourney} disabled={!saveName.trim()} className="tgc-btn"
                  style={{flex:1,padding:'0.9rem',background:'#0e4f51',color:'#ffffff',border:'none',cursor:saveName.trim()?'pointer':'not-allowed'}}>
                  <span className="tgc-mono">Save</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default function TransportIntelligencePage() {
  return <TGCTransportIntelligence/>
}
