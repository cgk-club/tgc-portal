/* eslint-disable react/no-unescaped-entities */
'use client'
export const dynamic = 'force-dynamic'
import React, { useState, useEffect, useMemo } from 'react'

const STORAGE_KEY = 'tgc-events-v2'

interface EventType {
  name: string; cluster: 'intimate' | 'corporate' | 'occasion'; sub: string
  guestRange: { min: number; max: number; sweet: number }
  moments: { label: string; intent: string }[]
  spendOn: string[]; saveOn: string[]; failurePoints: string[]; tgcAngle: string
  budgetTiers: { label: string; guestNote: string; floor: number; ceil: number }[]
  timeline: { comfortable: number; tight: number; rush: number; minimum: number }
  suppliersNote: string; marginNote: string
}

const EVENT_TYPES: Record<string, EventType> = {
  'seated-dinner': {
    name: 'Seated dinner', cluster: 'intimate', sub: 'The art of the table. Six to twenty guests.',
    guestRange: { min: 6, max: 20, sweet: 12 },
    moments: [
      { label: 'The arrival', intent: 'The first 90 seconds. Warmth, smell, light — and a drink that isn\'t the default champagne.' },
      { label: 'The opening of the room', intent: 'When everyone is seated and the first course arrives. The moment the evening declares its ambition.' },
      { label: 'The music moment', intent: 'A single musician between courses — three minutes. Guests stop, listen, return transformed.' },
      { label: 'The toast', intent: 'Short. Personal. Specific. Never read from a note. The moment the evening crystallises into a story guests will tell.' },
      { label: 'The send-off', intent: 'A small gift, a handwritten note, or a playlist sent the next morning. The evening continues after guests have left.' },
    ],
    spendOn: ['The chef and the produce — where the evening is made or lost', 'The venue\'s own character (light, smell, texture)', 'The arrival drink — it sets the entire register'],
    saveOn: ['Printed menus (handwritten is warmer)', 'Elaborate centrepieces that block sightlines', 'AV and sound systems — silence is a feature at a dinner for twelve'],
    failurePoints: ['Over-programming — too many speeches or entertainment breaks', 'Tables wider than 90cm (natural conversation becomes impossible)', 'Wine service that outpaces conversation and tips guests too early'],
    tgcAngle: 'A seated dinner is the most intimate thing you can produce. Every detail is visible at close range. We start with the room and the chef, and build everything else around them.',
    budgetTiers: [
      { label: 'Intimate', guestNote: '6–10 guests', floor: 2500, ceil: 7000 },
      { label: 'Full table', guestNote: '10–16 guests', floor: 5000, ceil: 14000 },
      { label: 'Extended', guestNote: '16–20 guests', floor: 9000, ceil: 22000 },
    ],
    timeline: { comfortable: 4, tight: 2, rush: 1, minimum: 1 },
    suppliersNote: 'Chef margin 15–20%. Venue margin 10–12%. Florals 20–25%. Wine at cost + 10%.',
    marginNote: 'TGC fee 10–15% of supplier value. Minimum retainer €1,500.',
  },
  'standing-cocktail': {
    name: 'Standing cocktail / reception', cluster: 'intimate', sub: 'Fluid. Social. The event where conversations make themselves.',
    guestRange: { min: 20, max: 150, sweet: 60 },
    moments: [
      { label: 'The arrival drink', intent: 'The single non-negotiable. It signals the tone of the entire evening in one sip.' },
      { label: 'The room at capacity', intent: 'The moment the room tips from sparse to alive — usually 35 minutes in.' },
      { label: 'The food pass', intent: 'A considered sequence of small things that give guests a reason to move and talk.' },
      { label: 'The quiet corner', intent: 'Somewhere for the real conversations. The people who matter find the corner.' },
    ],
    spendOn: ['The arrival drink and first food pass', 'Lighting and sound balance (too loud kills conversation)', 'A surprise element at 90 minutes'],
    saveOn: ['Elaborate grazing tables (guests graze once, then ignore)', 'Printed collateral', 'A DJ when a playlist is more appropriate'],
    failurePoints: ['Rooms too large for the guest count — energy drains into empty space', 'Catering that runs out in the first hour', 'No natural end point — guests don\'t know when to leave'],
    tgcAngle: 'Standing events look simple and are anything but. We focus on three things: the arrival drink, the lighting, and the exit. Get those right and everything else takes care of itself.',
    budgetTiers: [
      { label: 'Small', guestNote: '20–50 guests', floor: 4000, ceil: 14000 },
      { label: 'Medium', guestNote: '50–100 guests', floor: 12000, ceil: 30000 },
      { label: 'Larger', guestNote: '100–150 guests', floor: 25000, ceil: 55000 },
    ],
    timeline: { comfortable: 4, tight: 2, rush: 1, minimum: 1 },
    suppliersNote: 'Bar/beverage margin 20–25%. Catering 15%. Venue 10–15%. Florals 20%.',
    marginNote: 'TGC fee 10–15%.',
  },
  'artist-dinner': {
    name: 'Artist dinner', cluster: 'intimate', sub: 'Culture, conversation, and a table worth gathering around.',
    guestRange: { min: 6, max: 16, sweet: 10 },
    moments: [
      { label: 'The introduction', intent: 'A sentence that tells every guest why they specifically are in this room tonight.' },
      { label: 'The artist\'s story', intent: 'Told by the artist, not a moderator. Personal, specific, unpolished.' },
      { label: 'The private object', intent: 'A work shown only in this room on this evening. Exclusivity as a gift.' },
      { label: 'The question nobody expected', intent: 'The moment the dinner earns its place in memory.' },
    ],
    spendOn: ['The guest mix — every person should earn their seat', 'The artist\'s time (compensated as an experience)', 'The one wine or spirit nobody expected'],
    saveOn: ['Production — the art is the production', 'Branded anything', 'Photography that interrupts'],
    failurePoints: ['A guest list that doesn\'t spark', 'A moderator who talks more than the artist', 'Treating the maker as a performer rather than a guest'],
    tgcAngle: 'The rarest luxury is genuine conversation. We build these evenings around a maker or cultural figure and curate the table so that everyone present earns their seat.',
    budgetTiers: [
      { label: 'Intimate', guestNote: '6–10 guests', floor: 6000, ceil: 18000 },
      { label: 'Full table', guestNote: '10–16 guests', floor: 14000, ceil: 32000 },
    ],
    timeline: { comfortable: 8, tight: 4, rush: 2, minimum: 2 },
    suppliersNote: 'Artist fee €2,000–25,000 depending on profile. Chef margin 15–20%. Venue 10%.',
    marginNote: 'TGC fee 10–15%. Artist curation is the primary value-add.',
  },
  'private-celebration': {
    name: 'Private celebration', cluster: 'intimate', sub: 'A milestone that deserves more than a restaurant booking.',
    guestRange: { min: 10, max: 80, sweet: 30 },
    moments: [
      { label: 'The reveal', intent: 'The moment the guest of honour sees the full picture. Everything else is built around this.' },
      { label: 'The story told in the room', intent: 'Someone speaks to this specific person, with specific memories. What separates a party from a celebration.' },
      { label: 'The unexpected element', intent: 'The one thing only the host could have arranged. Specific, unreplicable, unforgettable.' },
      { label: 'The send-off', intent: 'What guests take with them. The ending that extends the evening into the next morning.' },
    ],
    spendOn: ['The location\'s own character — chosen, not generic', 'The one element only this person would love', 'The food — guests notice bad food at personal events more than anywhere else'],
    saveOn: ['Themed decorations', 'Professional photography (a trusted friend with a good eye is better)', 'Elaborate printed programmes'],
    failurePoints: ['Trying to please everyone instead of the guest of honour', 'Overbuilding so the person feels overwhelmed not celebrated', 'Forgetting that private parties run on emotion, not logistics'],
    tgcAngle: 'The best private events feel inevitable — as if someone finally had the confidence to do what should have been done all along. We help you find that note, then build everything around it.',
    budgetTiers: [
      { label: 'Intimate', guestNote: '10–25 guests', floor: 5000, ceil: 20000 },
      { label: 'Mid-scale', guestNote: '25–50 guests', floor: 15000, ceil: 45000 },
      { label: 'Larger', guestNote: '50–80 guests', floor: 35000, ceil: 90000 },
    ],
    timeline: { comfortable: 6, tight: 3, rush: 2, minimum: 1 },
    suppliersNote: 'Venue 35%, catering 30%, entertainment/experience 20%, décor 15%.',
    marginNote: 'TGC fee 10–15%. Minimum retainer €2,000.',
  },
  'corporate-retreat': {
    name: 'Corporate retreat', cluster: 'corporate', sub: 'The gathering that changes how a team thinks.',
    guestRange: { min: 8, max: 50, sweet: 20 },
    moments: [
      { label: 'The opening session', intent: 'Sets the register for everything. Tone, ambition, permission for a different kind of conversation — established in the first 30 minutes.' },
      { label: 'The meal where the hierarchy disappears', intent: 'Usually dinner on the first night. When people become people rather than titles.' },
      { label: 'The experience nobody does at home', intent: 'One activity specific to the location that could not happen in a meeting room.' },
      { label: 'The closing commitment', intent: 'Not an action list. A sentence from each person about what changes on Monday.' },
    ],
    spendOn: ['The opening session quality', 'Accommodation (people who sleep well think well)', 'Genuine leisure time — space, not structured activities'],
    saveOn: ['Branded merchandise', 'Elaborate staging for working sessions', 'External facilitators who haven\'t been properly briefed'],
    failurePoints: ['Agenda too packed — retreats need white space', 'Location chosen for cost rather than character', 'Evenings that feel like extensions of the working day'],
    tgcAngle: 'A retreat has one job: create conditions for a different kind of conversation. We choose the place, shape the programme with minimum viable structure, then get out of the way.',
    budgetTiers: [
      { label: 'Small team', guestNote: '8–15 people, 2 days', floor: 12000, ceil: 40000 },
      { label: 'Mid-scale', guestNote: '15–30 people, 2–3 days', floor: 32000, ceil: 90000 },
      { label: 'Larger', guestNote: '30–50 people, 3 days', floor: 70000, ceil: 160000 },
    ],
    timeline: { comfortable: 12, tight: 6, rush: 4, minimum: 3 },
    suppliersNote: 'Accommodation 40–50%. F&B 25%. Facilitation 15%. Activities 10–15%.',
    marginNote: 'TGC fee 10–15%. Facilitation often a separate cost line.',
  },
  'incentive-trip': {
    name: 'Incentive trip', cluster: 'corporate', sub: 'The reward that becomes the story they tell at every dinner party for three years.',
    guestRange: { min: 15, max: 80, sweet: 30 },
    moments: [
      { label: 'The arrival moment', intent: 'The second they understand what they\'ve earned. The hotel room, the view, the welcome — this is when the trip justifies itself.' },
      { label: 'The access moment', intent: 'Something that money cannot usually buy. Private access, a person they\'d never meet, a place normally closed.' },
      { label: 'The group memory', intent: 'One shared experience that defines the trip — the story retold at the next sales conference.' },
      { label: 'The send-off gift', intent: 'Not branded merchandise. Something from the destination, specific and impossible to buy at the airport.' },
    ],
    spendOn: ['Genuine access and exclusivity', 'Accommodation quality — earners benchmark against their own standards', 'The one experience they will genuinely never forget'],
    saveOn: ['Swag and branded merchandise', 'Overly complex itineraries', 'Group dinners every evening — some nights should be free'],
    failurePoints: ['Underestimating logistics complexity at scale', 'Misreading what this specific group finds luxurious', 'Activities that don\'t translate across ages, fitness levels, or cultures'],
    tgcAngle: 'Incentive travel has one job: make the earners feel the reward was worth the earning. That requires specificity, not just luxury.',
    budgetTiers: [
      { label: 'Standard', guestNote: '15–25 people, 3–4 days', floor: 35000, ceil: 100000 },
      { label: 'Premium', guestNote: '25–45 people, 4–5 days', floor: 90000, ceil: 220000 },
      { label: 'Exceptional', guestNote: '45–80 people, 5+ days', floor: 180000, ceil: 450000 },
    ],
    timeline: { comfortable: 24, tight: 12, rush: 8, minimum: 6 },
    suppliersNote: 'Flights/transfers 30–35%. Accommodation 35–40%. Experiences 15–20%. F&B 10–15%.',
    marginNote: 'TGC fee 10–15%. Multi-destination itineraries justify the higher end.',
  },
  'conference-summit': {
    name: 'Conference / summit', cluster: 'corporate', sub: 'A room where ideas move between people.',
    guestRange: { min: 30, max: 400, sweet: 80 },
    moments: [
      { label: 'The room before it fills', intent: 'What delegates see on arrival. The first impression of production values and intention.' },
      { label: 'The opening that earns attention', intent: 'Not a welcome from the CEO. The opening that makes the room sit forward.' },
      { label: 'The hallway conversation', intent: 'The conversation that wouldn\'t have happened without this event. The real return on investment.' },
      { label: 'The close that sends people away with something', intent: 'Not exhaustion. Specific, actionable, personally relevant.' },
    ],
    spendOn: ['Speaker quality over quantity', 'Venue acoustics and sight lines', 'The social programme — where relationships form'],
    saveOn: ['Printed programmes', 'Excessive stage production that dwarfs the speakers', 'Gimmick technology requiring a briefing to use'],
    failurePoints: ['Too many sessions — fatigue kills the afternoon', 'Registration and wayfinding as an afterthought', 'Evenings that feel like compulsory extensions of the working day'],
    tgcAngle: 'The best conferences have half as many sessions as the organiser wanted. We\'ll argue for white space, shorter talks, and better hallways. Usually the client thanks us afterward.',
    budgetTiers: [
      { label: 'Small', guestNote: '30–80 delegates, 1 day', floor: 18000, ceil: 65000 },
      { label: 'Mid-scale', guestNote: '80–150 delegates, 1–2 days', floor: 55000, ceil: 160000 },
      { label: 'Large', guestNote: '150–400 delegates, 2 days', floor: 130000, ceil: 350000 },
    ],
    timeline: { comfortable: 24, tight: 12, rush: 8, minimum: 6 },
    suppliersNote: 'Venue 35–45%. F&B 20–25%. AV/production 15–20%. Speakers 10–15%.',
    marginNote: 'TGC fee 10–15%. Speaker procurement is a separate retainer at cost.',
  },
  'product-launch': {
    name: 'Product launch', cluster: 'corporate', sub: 'Three minutes that do the work of a year of marketing.',
    guestRange: { min: 20, max: 300, sweet: 80 },
    moments: [
      { label: 'The arrival', intent: 'The first impression of the brand world. Before anyone sees the product, they\'ve formed a view of the brand.' },
      { label: 'The reveal', intent: 'Three minutes maximum. If it needs explanation, the staging has failed.' },
      { label: 'The content capture moment', intent: 'Designed for what travels: the shot, the clip, the quote.' },
      { label: 'The social moment', intent: 'When the room moves from audience to advocate — usually 20 minutes after the reveal.' },
    ],
    spendOn: ['The arrival experience', 'The reveal — lighting, timing, physical staging', 'Content production (the event\'s afterlife is longer than the event)'],
    saveOn: ['Elaborate gift bags', 'Lengthy formal presentations after the reveal', 'Ornate settings at a standing event'],
    failurePoints: ['The product story lost inside the production', 'Wrong guests — people there for the catering not the brand', 'An event designed for daylight that runs until 10pm'],
    tgcAngle: 'Product launches are among the hardest events to produce because the product must be the hero and production values must be invisible. The discipline is knowing when to stop adding.',
    budgetTiers: [
      { label: 'Press / intimate', guestNote: '20–50 guests', floor: 15000, ceil: 50000 },
      { label: 'Mid-scale', guestNote: '60–120 guests', floor: 40000, ceil: 130000 },
      { label: 'Large-scale', guestNote: '150–300 guests', floor: 100000, ceil: 280000 },
    ],
    timeline: { comfortable: 16, tight: 8, rush: 4, minimum: 3 },
    suppliersNote: 'Venue 25–30%. AV/production 25–30%. Catering 20%. Décor/set 15%. Content 10%.',
    marginNote: 'TGC fee 10–15%. AV and production are high-margin lines.',
  },
  'brand-activation': {
    name: 'Brand activation', cluster: 'corporate', sub: 'A brand made physical. An audience turned participant.',
    guestRange: { min: 20, max: 1000, sweet: 120 },
    moments: [
      { label: 'The hook', intent: 'The first thing that makes someone stop. Without this, everything else is invisible.' },
      { label: 'The participation moment', intent: 'Where the audience becomes part of the brand story.' },
      { label: 'The shareable moment', intent: 'Designed for what travels on social. Engineered, not organic.' },
      { label: 'The expert encounter', intent: 'Where the brand earns credibility through a person, not a product.' },
    ],
    spendOn: ['The hook and the shareable moment', 'Genuine content production on-site', 'Staff who know the brand deeply'],
    saveOn: ['Space larger than the audience can fill', 'Complex logistics for a standing audience', 'Elements that don\'t photograph'],
    failurePoints: ['Confusing "lots of people" with "the right people"', 'Activations that only work once', 'Staff there to manage, not to engage'],
    tgcAngle: 'Brand activations succeed when the brand recedes. We build experiences where the brand is felt, not explained.',
    budgetTiers: [
      { label: 'Focused', guestNote: 'Pop-up or single-day', floor: 18000, ceil: 65000 },
      { label: 'Campaign', guestNote: 'Multi-day or touring', floor: 55000, ceil: 180000 },
      { label: 'Full campaign', guestNote: 'Extended / multi-market', floor: 140000, ceil: 500000 },
    ],
    timeline: { comfortable: 12, tight: 6, rush: 4, minimum: 3 },
    suppliersNote: 'Build/fabrication 35–45%. Content/social 20%. Staffing 15%. Logistics 20%.',
    marginNote: 'TGC fee 10–15%. Multi-market work justifies retainer structure.',
  },
  'award-gala': {
    name: 'Award ceremony / gala dinner', cluster: 'occasion', sub: 'The ceremony that earns the room\'s attention.',
    guestRange: { min: 60, max: 600, sweet: 200 },
    moments: [
      { label: 'The arrival', intent: 'The moment guests understand the scale of the evening. Production values register before a word is spoken.' },
      { label: 'The first award', intent: 'Warms the room. The ceremony earns its trust here.' },
      { label: 'The moment of genuine surprise', intent: 'One real emotional moment anchors the whole evening.' },
      { label: 'The after-party transition', intent: 'When the ceremony becomes the celebration. The room transforms.' },
    ],
    spendOn: ['The welcome reception — sets the entire register', 'Sound and sight lines in the ceremony space', 'The dinner — a long ceremony requires food good enough to compensate'],
    saveOn: ['Centrepieces that block sightlines', 'Celebrity hosts who don\'t know the room', 'Entertainment that competes with conversation at dinner'],
    failurePoints: ['Ceremony beyond 90 minutes — the room has mentally left', 'Awards that feel political rather than earned', 'A table plan that separates people who should be talking'],
    tgcAngle: 'Award ceremonies are about recognition, not production. We design backward from the moment each winner walks back to their table.',
    budgetTiers: [
      { label: 'Intimate', guestNote: '60–120 guests', floor: 45000, ceil: 130000 },
      { label: 'Mid-scale', guestNote: '120–250 guests', floor: 100000, ceil: 260000 },
      { label: 'Large', guestNote: '250–600 guests', floor: 200000, ceil: 550000 },
    ],
    timeline: { comfortable: 32, tight: 16, rush: 10, minimum: 8 },
    suppliersNote: 'Venue 35–40%. F&B 25%. AV/production 20%. Entertainment 10%. Décor 5–10%.',
    marginNote: 'TGC fee 10–15%. Venue negotiations and AV are significant margin lines.',
  },
  'charity-gala': {
    name: 'Charity gala', cluster: 'occasion', sub: 'Generosity made contagious.',
    guestRange: { min: 50, max: 500, sweet: 150 },
    moments: [
      { label: 'The cause made personal', intent: 'The moment the room stops thinking about the ticket price. A person speaking honestly, not a video.' },
      { label: 'The auction or giving moment', intent: 'Engineered, not spontaneous. The room\'s generosity is a function of preparation.' },
      { label: 'The specific thank-you', intent: 'Not generic acknowledgment — a specific thank-you that makes donors feel seen.' },
      { label: 'The momentum close', intent: 'The end that sends people away with the cause still in mind.' },
    ],
    spendOn: ['The cause story — a live moment that makes it real', 'Auction packaging — presentation determines what lots raise', 'The table experience — guests who\'ve had a wonderful evening give more'],
    saveOn: ['Entertainment that competes with the cause', 'Overproduced staging implying spend rather than fundraising', 'Marketing materials at the event (guests are already there)'],
    failurePoints: ['The cause feeling secondary to the party', 'An auction that runs too long and loses the room', 'Guests with no personal connection to the cause'],
    tgcAngle: 'A charity gala succeeds when guests leave having given more than they planned. That requires careful room-reading and a programme that builds deliberately to the ask.',
    budgetTiers: [
      { label: 'Smaller', guestNote: '50–120 guests', floor: 35000, ceil: 100000 },
      { label: 'Mid-scale', guestNote: '120–250 guests', floor: 85000, ceil: 210000 },
      { label: 'Larger', guestNote: '250–500 guests', floor: 180000, ceil: 420000 },
    ],
    timeline: { comfortable: 32, tight: 16, rush: 10, minimum: 8 },
    suppliersNote: 'Venue 30–35%. F&B 25–30%. Entertainment/programme 15%. AV 15%. Auction 5–10%.',
    marginNote: 'TGC fee 10–15%. Be transparent about fee structure early with charity clients.',
  },
}

const CLUSTERS = [
  { id: 'intimate', label: 'Intimate', desc: 'Personal, close-range — every detail visible' },
  { id: 'corporate', label: 'Corporate', desc: 'Teams, brands, and businesses' },
  { id: 'occasion', label: 'Occasion', desc: 'Large-scale, ceremonial, high-visibility' },
]

const CATCHMENTS: Record<string, { name: string; sub: string; coverage: string; season: string; note?: string }> = {
  'french-riviera-monaco': { name: 'French Riviera + Monaco', sub: 'Menton to Saint-Tropez, including Monaco', coverage: 'Deep — direct supplier relationships across venues, chefs, florists, musicians, and logistics.', season: 'Year-round. Peak May–Sep.', note: 'TGC home ground' },
  'provence-occitanie': { name: 'Provence + Occitanie', sub: 'Aix, Avignon, Montpellier, Béziers, inland Languedoc', coverage: 'Very strong — TGC home ground with direct artisan, chef, and estate relationships.', season: 'Peak May–Oct. Mistral and heat are operational factors.', note: 'TGC home ground' },
  'paris-ile-de-france': { name: 'Paris + Île-de-France', sub: 'Paris extending to Versailles, Chantilly, Fontainebleau', coverage: 'Very strong — members\' clubs, cultural institutions, named venues, Michelin-level chefs.', season: 'Year-round. Sep–Oct and Apr–Jun peak. August quiet.' },
  'london-home-counties': { name: 'London + Home Counties', sub: 'London + Oxford, Cotswolds, Sussex, Surrey', coverage: 'Strong — especially for corporate, MICE, and intimate private events.', season: 'Year-round. Country houses peak May–Sep.' },
  'italian-lakes-milan': { name: 'Italian Lakes + Milan', sub: 'Lago di Como, Garda, and the Milanese supplier base', coverage: 'Partnership through trusted Italian specialists across each lake district and Milan.', season: 'Lakes peak May–Sep. Milan year-round, peak Sep–Nov and Apr–Jun.' },
  'tuscany-umbria': { name: 'Tuscany + Umbria', sub: 'Inland Italian villa and estate circuit', coverage: 'Partnership through Chianti/Val d\'Orcia and Umbria-based specialists.', season: 'Peak May–Oct. Harvest (Sep–Oct) adds gastronomy and atmosphere.' },
  'swiss-alps-lake-geneva': { name: 'Switzerland', sub: 'Alps (St Moritz, Gstaad, Verbier) + Lake Geneva shore', coverage: 'Partnership through Swiss specialist networks. Strong for retreats and incentive travel.', season: 'Winter peak Dec–Mar. Summer peak Jun–Sep.' },
  'french-alps': { name: 'French Alps', sub: 'Courchevel, Megève, Chamonix, Val d\'Isère', coverage: 'Partnership through Courchevel/Méribel and broader Savoie specialist.', season: 'Winter peak late Dec–Mar. Summer Jul–Aug.' },
  'amalfi-capri': { name: 'Amalfi Coast + Capri', sub: 'Positano, Ravello, Amalfi, Capri', coverage: 'Partnership through an Amalfi-based specialist.', season: 'May–early October only. Operationally closed outside this window.' },
  'balearics': { name: 'Balearics', sub: 'Ibiza, Mallorca, Menorca', coverage: 'Partnership through island-specific specialists.', season: 'May–October. Shoulder months offer better value.' },
}

const BUDGET_OPTIONS = [
  { label: 'Under €10,000', value: 7500 },
  { label: '€10,000 – €25,000', value: 17000 },
  { label: '€25,000 – €50,000', value: 37000 },
  { label: '€50,000 – €100,000', value: 72000 },
  { label: '€100,000 – €250,000', value: 170000 },
  { label: '€250,000 – €500,000', value: 370000 },
  { label: 'Over €500,000', value: 600000 },
]

function getTimelineStatus(eventTypeId: string | null, dateStr: string) {
  if (!eventTypeId || !dateStr) return null
  const et = EVENT_TYPES[eventTypeId]; if (!et) return null
  const weeks = Math.floor((new Date(dateStr).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))
  if (weeks < 0) return null
  const t = et.timeline
  if (weeks >= t.comfortable) return { weeks, status: 'comfortable' as const, color: '#22c55e', label: 'Comfortable', message: `${weeks} weeks out. Full creative latitude — first-choice suppliers, full venue selection, unhurried planning.` }
  if (weeks >= t.tight) return { weeks, status: 'tight' as const, color: '#f59e0b', label: 'Tight but manageable', message: `${weeks} weeks out. Achievable — some first-choice venues may not be available, but the core can be excellent.` }
  if (weeks >= t.rush) return { weeks, status: 'rush' as const, color: '#ef4444', label: 'Rush territory', message: `${weeks} weeks out. We can do this, but a premium applies and decisions need to move faster than is comfortable.` }
  return { weeks, status: 'below-minimum' as const, color: '#7f1d1d', label: 'Needs a conversation first', message: `${weeks} weeks out. Below the normal threshold for this event type. Please call us before completing this brief.` }
}

function getBudgetReality(eventTypeId: string | null, budgetValue: number, guestCount: string) {
  if (!eventTypeId || !budgetValue) return null
  const et = EVENT_TYPES[eventTypeId]; if (!et) return null
  const guests = parseInt(guestCount) || et.guestRange.sweet
  const tier = [...et.budgetTiers].reverse().find(t => {
    const min = parseInt(t.guestNote.split('–')[0].replace(/\D/g, '')) || 0
    return guests >= min
  }) || et.budgetTiers[0]
  const note = `TGC's fee of 10–15% is separate from and additional to supplier costs.`
  if (budgetValue >= tier.ceil * 0.75) return { status: 'well-positioned' as const, color: '#22c55e', message: `Well positioned for this type and scale. ${note}` }
  if (budgetValue >= tier.floor * 0.8) return { status: 'achievable' as const, color: '#f59e0b', message: `Achievable with focused priorities. ${note}` }
  return { status: 'tight' as const, color: '#ef4444', message: `Below the typical floor for this event type and scale. We'd want to discuss scope before committing. ${note}` }
}

function generateSketch(p: { eventTypeId: string | null; catchmentId: string | null; guestCount: string; date: string; love: string; hate: string; worry: string; budgetLabel: string; tl: ReturnType<typeof getTimelineStatus>; confidentiality: string; firstName: string; lastName: string; organisation: string; priorityMoments: string[] }) {
  if (!p.eventTypeId || !p.catchmentId) return ''
  const et = EVENT_TYPES[p.eventTypeId], ct = CATCHMENTS[p.catchmentId]
  if (!et || !ct) return ''
  let out = `${et.name} · ${ct.name}`
  if (p.date) out += ` · ${p.date}`
  if (p.guestCount) out += ` · ${p.guestCount} guests`
  if (p.budgetLabel) out += ` · ${p.budgetLabel}`
  out += `\n\n`
  const moments = p.priorityMoments.length > 0 ? et.moments.filter(m => p.priorityMoments.includes(m.label)) : et.moments.slice(0, 4)
  out += `The moments we'll design around\n\n`
  moments.forEach(m => { out += `${m.label}. ${m.intent}\n\n` })
  if (p.love.trim()) out += `What you'd love\n\n${p.love.trim()}\n\n`
  if (p.hate.trim()) out += `What to avoid\n\n${p.hate.trim()}\n\n`
  if (p.worry.trim()) out += `What you're most worried about\n\n${p.worry.trim()}\n\nThis tells us where to concentrate. We'll address this on the discovery call.\n\n`
  out += `Our honest view\n\n${ct.coverage} ${et.tgcAngle}\n\n`
  if (p.tl) out += `Timeline\n\n${p.tl.label}. ${p.tl.message}\n\n`
  if (p.confidentiality) out += `Confidentiality\n\n${p.confidentiality}\n\n`
  out += `Next steps\n\nWithin 4 hours: your Gatekeeper acknowledges receipt.\nWithin 24 hours: first response with a refined Moment Sketch.\nWithin 72 hours: discovery call.\nWithin two weeks: mandate signed.\n`
  return out
}

export default function EventsProductionPage() {
  const [screen, setScreen] = useState('welcome')
  const [eventTypeId, setEventTypeId] = useState<string | null>(null)
  const [catchmentId, setCatchmentId] = useState<string | null>(null)
  const [guestCount, setGuestCount] = useState('')
  const [date, setDate] = useState('')
  const [budgetValue, setBudgetValue] = useState<number | null>(null)
  const [budgetLabel, setBudgetLabel] = useState('')
  const [love, setLove] = useState('')
  const [hate, setHate] = useState('')
  const [worry, setWorry] = useState('')
  const [confidentiality, setConfidentiality] = useState('')
  const [priorityMoments, setPriorityMoments] = useState<string[]>([])
  const [client, setClient] = useState({ firstName: '', lastName: '', email: '', phone: '', organisation: '', role: '' })
  const [internalView, setInternalView] = useState(false)
  const [mandateId, setMandateId] = useState<string | null>(null)
  const [loadedDraft, setLoadedDraft] = useState(false)

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      if (!d.eventTypeId) return
      setEventTypeId(d.eventTypeId)
      if (d.catchmentId) setCatchmentId(d.catchmentId)
      if (d.guestCount) setGuestCount(d.guestCount)
      if (d.date) setDate(d.date)
      if (d.budgetValue) { setBudgetValue(d.budgetValue); setBudgetLabel(d.budgetLabel || '') }
      if (d.love) setLove(d.love)
      if (d.hate) setHate(d.hate)
      if (d.worry) setWorry(d.worry)
      if (d.confidentiality) setConfidentiality(d.confidentiality)
      if (d.client) setClient(d.client)
      setLoadedDraft(true); setTimeout(() => setLoadedDraft(false), 4000)
    } catch {}
  }, [])

  useEffect(() => {
    if (!eventTypeId) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ eventTypeId, catchmentId, guestCount, date, budgetValue, budgetLabel, love, hate, worry, confidentiality, client })) } catch {}
  }, [eventTypeId, catchmentId, guestCount, date, budgetValue, budgetLabel, love, hate, worry, confidentiality, client])

  const et = eventTypeId ? EVENT_TYPES[eventTypeId] : null
  const ct = catchmentId ? CATCHMENTS[catchmentId] : null
  const tl = useMemo(() => getTimelineStatus(eventTypeId, date), [eventTypeId, date])
  const br = useMemo(() => getBudgetReality(eventTypeId, budgetValue || 0, guestCount), [eventTypeId, budgetValue, guestCount])
  const sketch = useMemo(() => generateSketch({ eventTypeId, catchmentId, guestCount, date, love, hate, worry, budgetLabel, tl, confidentiality, firstName: client.firstName, lastName: client.lastName, organisation: client.organisation, priorityMoments }), [eventTypeId, catchmentId, guestCount, date, love, hate, worry, budgetLabel, tl, confidentiality, client, priorityMoments])

  const reset = () => { setScreen('welcome'); setEventTypeId(null); setCatchmentId(null); setGuestCount(''); setDate(''); setBudgetValue(null); setBudgetLabel(''); setLove(''); setHate(''); setWorry(''); setConfidentiality(''); setPriorityMoments([]); setClient({ firstName: '', lastName: '', email: '', phone: '', organisation: '', role: '' }); setMandateId(null); try { localStorage.removeItem(STORAGE_KEY) } catch {} }

  const submit = async () => {
    const id = `TGC-EV-${Date.now().toString(36).toUpperCase()}`; setMandateId(id)
    try { await fetch('/api/intelligence/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'events-production', mandateId: id, submittedAt: new Date().toISOString(), eventType: eventTypeId, catchment: catchmentId, guestCount, date, budget: budgetLabel, budgetValue, love, hate, worry, confidentiality, priorityMoments, client, timelineStatus: tl?.status, sketch }) }) } catch {}
    setScreen('confirmation')
  }

  const download = () => {
    const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    const txt = `THE GATEKEEPERS CLUB — MOMENT SKETCH\n\nReference: ${mandateId || '[draft]'}\nPrepared: ${today}\nClient: ${client.firstName} ${client.lastName}${client.organisation ? '\nOrganisation: ' + client.organisation : ''}\n\n${'━'.repeat(60)}\n\n${sketch}\n${'━'.repeat(60)}\n\nThis is a working Moment Sketch — a starting view, not a final commitment.\n\nThe Gatekeepers Club · thegatekeepers.club\n`
    const url = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = `TGC-Moment-Sketch-${mandateId || 'draft'}.txt`
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  // ── styles ──────────────────────────────────────────────────────────────────
  const R: React.CSSProperties = { minHeight: '100vh', background: '#F9F8F5', color: '#1a1815', fontFamily: "'Lato',sans-serif", padding: '40px 20px', lineHeight: 1.6 }
  const W: React.CSSProperties = { maxWidth: 940, margin: '0 auto' }
  const HDR: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 48, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' }
  const BRAND: React.CSSProperties = { fontFamily: "'Poppins',sans-serif", fontSize: 24, fontWeight: 400, letterSpacing: '0.02em' }
  const SUB: React.CSSProperties = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c8aa4a', marginTop: 4 }
  const EYE: React.CSSProperties = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c8aa4a', marginBottom: 10 }
  const H1: React.CSSProperties = { fontFamily: "'Poppins',sans-serif", fontSize: 44, fontWeight: 400, lineHeight: 1.15, marginBottom: 16 }
  const H2: React.CSSProperties = { fontFamily: "'Poppins',sans-serif", fontSize: 28, fontWeight: 400, lineHeight: 1.2, marginBottom: 12 }
  const LEAD: React.CSSProperties = { fontFamily: "'Poppins',sans-serif", fontSize: 19, lineHeight: 1.55, color: '#2a2720', marginBottom: 22, fontWeight: 400 }
  const P: React.CSSProperties = { fontSize: 15, marginBottom: 13, color: '#2a2720', lineHeight: 1.6 }
  const CARD: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: 9, cursor: 'pointer', transition: 'all 0.18s', borderRadius: 8 }
  const CARDON: React.CSSProperties = { ...CARD, borderColor: '#0e4f51', boxShadow: '0 2px 12px rgba(14,79,81,0.10)' }
  const CT: React.CSSProperties = { fontFamily: "'Poppins',sans-serif", fontSize: 18, fontWeight: 400, marginBottom: 2, color: '#1a1815' }
  const CS: React.CSSProperties = { fontSize: 13, color: '#6b7280', lineHeight: 1.4 }
  const CL: React.CSSProperties = { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#c8aa4a', marginTop: 22, marginBottom: 5, fontFamily: "'Poppins',sans-serif" }
  const BTN: React.CSSProperties = { background: '#0e4f51', color: '#fff', border: 'none', padding: '13px 26px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 8 }
  const BTN2: React.CSSProperties = { background: 'transparent', color: '#1a1815', border: '1px solid #d1d5db', padding: '13px 26px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 8 }
  const BTNG: React.CSSProperties = { background: '#c8aa4a', color: '#fff', border: 'none', padding: '14px 30px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 8 }
  const INP: React.CSSProperties = { width: '100%', padding: '11px 13px', fontSize: 15, fontFamily: 'inherit', background: '#F9F8F5', border: '1px solid #e5e7eb', color: '#1a1815', boxSizing: 'border-box', borderRadius: 4 }
  const TA: React.CSSProperties = { width: '100%', padding: '13px', fontSize: 15, fontFamily: 'inherit', background: '#F9F8F5', border: '1px solid #e5e7eb', color: '#1a1815', boxSizing: 'border-box', resize: 'vertical', minHeight: 90, lineHeight: 1.55, borderRadius: 4 }
  const LBL: React.CSSProperties = { display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#0e4f51', marginBottom: 5, marginTop: 16 }
  const INTPANEL: React.CSSProperties = { background: '#0e4f51', color: '#fff', padding: '18px 22px', margin: '18px 0', borderLeft: '3px solid #c8aa4a', fontSize: 13, lineHeight: 1.65 }
  const INTTOG: React.CSSProperties = { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', background: 'transparent', border: '1px solid rgba(26,24,21,0.18)', color: '#0e4f51', padding: '5px 11px', cursor: 'pointer', fontFamily: 'inherit' }
  const PROG: React.CSSProperties = { display: 'flex', gap: 4, marginBottom: 32 }
  const IC: React.CSSProperties = { flex: 1, minWidth: 185, padding: '13px 15px', background: '#F9F8F5', border: '1px solid #e5e7eb', borderRadius: 8 }
  const badge = (c: string): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px', background: c + '18', border: `1px solid ${c}38`, borderRadius: 6, marginRight: 8, marginTop: 8 })

  const screens = ['event-type', 'location', 'shape', 'budget', 'brief', 'verdict', 'client-details']
  const idx = screens.indexOf(screen)
  const back = (to: string) => <button style={{ ...BTN2, marginBottom: 20, padding: '7px 13px', fontSize: 11 }} onClick={() => setScreen(to)}>← Back</button>

  if (screen === 'welcome') return (
    <div style={R}><div style={W}>
      <div style={HDR}>
        <div><div style={BRAND}>The Gatekeepers Club</div><div style={SUB}>Events Production Intelligence · V.2</div></div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#6b7280', fontFamily: 'inherit' }} onClick={() => window.location.href = '/intelligence'}>← Intelligence</button>
      </div>
      <div style={EYE}>Events Production Intelligence · V.2</div>
      <h1 style={H1}>Most events fail quietly.<br />Not on the night.</h1>
      <p style={LEAD}>In the months before. When nobody asked the right questions, chose the right venue, or thought hard enough about the three minutes that would make or break the evening.</p>
      <p style={P}>This tool is the conversation we'd have at the start of every mandate. Work through it honestly and we'll come back to you with a Moment Sketch — a considered starting point for the discovery call.</p>
      <p style={P}>We produce events across 10 territories in Europe. Intimate dinners for eight. Conferences for four hundred. Retreats, product launches, incentive trips, charity galas, award ceremonies. The brief is always different. The discipline is always the same.</p>
      <div style={{ marginTop: 26, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button style={BTN} onClick={() => setScreen('event-type')}>Start your brief →</button>
      </div>
      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 18 }}>Weddings — we work closely with specialist wedding planners and are happy to refer you.</p>
    </div></div>
  )

  if (screen === 'confirmation') return (
    <div style={R}><div style={W}>
      <div style={{ textAlign: 'center', maxWidth: 560, margin: '60px auto 0' }}>
        <div style={EYE}>Brief received</div>
        <h2 style={H2}>Thank you, {client.firstName}.</h2>
        <p style={P}>Your reference is <strong>{mandateId}</strong>. A Gatekeeper will respond to <strong>{client.email}</strong> within four hours.</p>
        <p style={P}>Download your Moment Sketch — the starting point we'll refine together on the discovery call.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 26 }}>
          <button style={BTNG} onClick={download}>Download Moment Sketch</button>
          <button style={BTN2} onClick={reset}>Start a new brief</button>
        </div>
      </div>
    </div></div>
  )

  return (
    <div style={R}><div style={W}>
      <div style={HDR}>
        <div><div style={BRAND}>The Gatekeepers Club</div><div style={SUB}>Events Production Intelligence · V.2</div></div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#6b7280', fontFamily: 'inherit' }} onClick={() => window.location.href = '/intelligence'}>← Intelligence</button>
      </div>
      <div style={PROG}>{screens.map((_, i) => <div key={i} style={{ height: 2, flex: 1, background: i <= idx ? '#0e4f51' : 'rgba(26,24,21,0.12)' }} />)}</div>

      {/* STEP 1 */}
      {screen === 'event-type' && <div>
        <div style={EYE}>Step 1 of 7 · Event type</div>
        <h2 style={H2}>What kind of event is this?</h2>
        <p style={P}>Select the type that best describes what you're producing.</p>
        {CLUSTERS.map(cl => (
          <div key={cl.id}>
            <div style={CL}>{cl.label} — {cl.desc}</div>
            {Object.entries(EVENT_TYPES).filter(([, e]) => e.cluster === cl.id).map(([id, e]) => (
              <div key={id} style={eventTypeId === id ? CARDON : CARD} onClick={() => { setEventTypeId(id); setScreen('location') }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={CT}>{e.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{e.guestRange.min}–{e.guestRange.max} guests</div>
                </div>
                <div style={CS}>{e.sub}</div>
              </div>
            ))}
          </div>
        ))}
      </div>}

      {/* STEP 2 */}
      {screen === 'location' && <div>
        {back('event-type')}
        <div style={EYE}>Step 2 of 7 · Location</div>
        <h2 style={H2}>Where are you thinking?</h2>
        <p style={P}>Most clients come with a territory already in mind. Select the catchment — we'll find the right venue within it.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))', gap: 10, marginTop: 12 }}>
          {Object.entries(CATCHMENTS).map(([id, c]) => (
            <div key={id} style={catchmentId === id ? CARDON : CARD} onClick={() => { setCatchmentId(id); setScreen('shape') }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                <div style={CT}>{c.name}</div>
                {c.note && <span style={{ fontSize: 9, background: '#c8aa4a18', color: '#c8aa4a', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{c.note}</span>}
              </div>
              <div style={CS}>{c.sub}</div>
              <div style={{ fontSize: 11, color: '#0e4f51', marginTop: 4 }}>{c.coverage.split('.')[0]}.</div>
            </div>
          ))}
        </div>
      </div>}

      {/* STEP 3 */}
      {screen === 'shape' && <div>
        {back('location')}
        <div style={EYE}>Step 3 of 7 · The shape</div>
        <h2 style={H2}>Tell us the basics.</h2>
        {et && <p style={P}>Ideal size for a <strong>{et.name}</strong>: {et.guestRange.sweet} guests. Range: {et.guestRange.min}–{et.guestRange.max}.</p>}
        <label style={LBL}>Approximate guest count</label>
        <input style={{ ...INP, maxWidth: 200 }} type="number" placeholder={et?.guestRange.sweet.toString()} value={guestCount} onChange={e => setGuestCount(e.target.value)} />
        <label style={LBL}>Event date</label>
        <input style={{ ...INP, maxWidth: 250 }} type="date" value={date} onChange={e => setDate(e.target.value)} />
        {tl && <div style={{ ...badge(tl.color), display: 'flex', marginTop: 12 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: tl.color, flexShrink: 0, marginTop: 4 }} />
          <div><div style={{ fontSize: 12, fontWeight: 600, color: tl.color }}>{tl.label}</div><div style={{ fontSize: 12, color: '#4b5563', marginTop: 2 }}>{tl.message}</div></div>
        </div>}
        {tl?.status === 'below-minimum' && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '13px 17px', marginTop: 13 }}>
          <p style={{ fontSize: 14, color: '#991b1b', margin: 0 }}>Please contact us directly before completing this brief — we need to understand scope before committing. <strong>Call us first.</strong></p>
        </div>}
        <div style={{ marginTop: 24 }}><button style={{ ...BTN, opacity: !guestCount ? 0.5 : 1 }} disabled={!guestCount} onClick={() => setScreen('budget')}>Continue →</button></div>
      </div>}

      {/* STEP 4 */}
      {screen === 'budget' && <div>
        {back('shape')}
        <div style={EYE}>Step 4 of 7 · Budget</div>
        <h2 style={H2}>What are you working with?</h2>
        <p style={P}>Supplier costs — TGC's production fee of 10–15% sits on top of this.</p>
        {et && <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '13px 17px', marginBottom: 20 }}>
          <div style={{ ...EYE, marginBottom: 9 }}>Typical ranges · {et.name}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 8 }}>
            {et.budgetTiers.map(t => (
              <div key={t.label} style={{ padding: '9px 12px', background: '#F9F8F5', borderRadius: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{t.guestNote}</div>
                <div style={{ fontSize: 14, color: '#0e4f51', fontFamily: "'Poppins',sans-serif" }}>€{t.floor.toLocaleString()} – €{t.ceil.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 8 }}>
          {BUDGET_OPTIONS.map(opt => (
            <div key={opt.label} style={{ ...(budgetValue === opt.value ? CARDON : CARD), padding: '11px 13px' }} onClick={() => { setBudgetValue(opt.value); setBudgetLabel(opt.label) }}>
              <div style={{ fontSize: 14, fontFamily: "'Poppins',sans-serif" }}>{opt.label}</div>
            </div>
          ))}
        </div>
        {br && budgetValue != null && <div style={{ background: br.color + '12', border: `1px solid ${br.color}30`, borderRadius: 8, padding: '11px 15px', marginTop: 13 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: br.color, marginBottom: 4 }}>{br.status === 'well-positioned' ? '✓ Well positioned' : br.status === 'achievable' ? '⚡ Achievable with focus' : '⚠ Below typical floor'}</div>
          <div style={{ fontSize: 13, color: '#4b5563' }}>{br.message}</div>
        </div>}
        <div style={{ marginTop: 24 }}><button style={{ ...BTN, opacity: !budgetValue ? 0.5 : 1 }} disabled={!budgetValue} onClick={() => setScreen('brief')}>Continue →</button></div>
      </div>}

      {/* STEP 5 */}
      {screen === 'brief' && <div>
        {back('budget')}
        <div style={EYE}>Step 5 of 7 · The brief</div>
        <h2 style={H2}>Three questions that tell us everything.</h2>
        <p style={P}>Be as specific as you can — the more you give us here, the better the Moment Sketch we'll return with.</p>
        <label style={LBL}>What would make this perfect?</label>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 5 }}>The feeling, the moment, the one thing you'd point to and say "that's why it worked."</p>
        <textarea style={TA} value={love} onChange={e => setLove(e.target.value)} placeholder="e.g. Guests still talking about it six months later. A chef who did something nobody expected. A venue that felt chosen specifically for this group." />
        <label style={LBL}>What has ruined events for you before?</label>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 5 }}>The things you've sat through and sworn you'd never repeat.</p>
        <textarea style={TA} value={hate} onChange={e => setHate(e.target.value)} placeholder="e.g. Speeches that go on too long. Cold food. Rooms too loud for conversation. Generic hotel ballrooms." />
        <label style={LBL}>What are you most worried about getting wrong?</label>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 5 }}>The most useful thing you can tell us. It tells us exactly where to focus.</p>
        <textarea style={TA} value={worry} onChange={e => setWorry(e.target.value)} placeholder="e.g. The guest of honour not enjoying it. The product reveal not landing. The budget not stretching. A venue that looks better in photos than in reality." />
        <label style={LBL}>Confidentiality (optional)</label>
        <input style={INP} value={confidentiality} onChange={e => setConfidentiality(e.target.value)} placeholder="e.g. Client identity confidential. Brief not to be shared beyond TGC production team." />
        <div style={{ marginTop: 24 }}><button style={{ ...BTN, opacity: !love.trim() ? 0.5 : 1 }} disabled={!love.trim()} onClick={() => setScreen('verdict')}>See your Moment Sketch →</button></div>
      </div>}

      {/* STEP 6 */}
      {screen === 'verdict' && et && ct && <div>
        {back('brief')}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={EYE}>Step 6 of 7 · Production intelligence</div>
          <button style={INTTOG} onClick={() => setInternalView(v => !v)}>{internalView ? 'Public view' : 'Internal view'}</button>
        </div>
        <h2 style={H2}>{et.name} · {ct.name}</h2>
        <div style={{ marginBottom: 20 }}>
          {tl && <span style={badge(tl.color)}><div style={{ width: 7, height: 7, borderRadius: '50%', background: tl.color }} /><span style={{ fontSize: 11, color: tl.color, fontWeight: 600 }}>{tl.label}</span></span>}
          {br && <span style={badge(br.color)}><div style={{ width: 7, height: 7, borderRadius: '50%', background: br.color }} /><span style={{ fontSize: 11, color: br.color, fontWeight: 600 }}>{budgetLabel} · {br.status === 'well-positioned' ? 'Well positioned' : br.status === 'achievable' ? 'Achievable' : 'Tight'}</span></span>}
        </div>

        <div style={{ ...EYE, marginBottom: 9 }}>Production intelligence</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={IC}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0e4f51', marginBottom: 8 }}>Where budget pays</div>
            {et.spendOn.map((x, i) => <div key={i} style={{ fontSize: 13, color: '#2a2720', paddingLeft: 13, position: 'relative', marginBottom: 5, lineHeight: 1.45 }}><span style={{ position: 'absolute', left: 0, color: '#c8aa4a' }}>→</span>{x}</div>)}
          </div>
          <div style={IC}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0e4f51', marginBottom: 8 }}>Where guests don't notice</div>
            {et.saveOn.map((x, i) => <div key={i} style={{ fontSize: 13, color: '#2a2720', paddingLeft: 13, position: 'relative', marginBottom: 5, lineHeight: 1.45 }}><span style={{ position: 'absolute', left: 0, color: '#9ca3af' }}>—</span>{x}</div>)}
          </div>
          <div style={IC}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ef4444', marginBottom: 8 }}>Common failure points</div>
            {et.failurePoints.map((x, i) => <div key={i} style={{ fontSize: 13, color: '#2a2720', paddingLeft: 13, position: 'relative', marginBottom: 5, lineHeight: 1.45 }}><span style={{ position: 'absolute', left: 0, color: '#ef4444' }}>✕</span>{x}</div>)}
          </div>
        </div>

        <div style={{ borderLeft: '3px solid #c8aa4a', paddingLeft: 17, marginBottom: 24 }}>
          <div style={{ ...EYE, marginBottom: 6 }}>TGC's approach</div>
          <p style={{ fontSize: 15, color: '#2a2720', lineHeight: 1.65, margin: 0 }}>{et.tgcAngle}</p>
        </div>

        <div style={{ ...EYE, marginBottom: 8 }}>The moments we design around</div>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Mark the ones that matter most — this tells us where to concentrate.</p>
        {et.moments.map((m, i) => {
          const on = priorityMoments.includes(m.label)
          return <div key={i} style={{ padding: '11px 15px', border: `1px solid ${on ? '#0e4f51' : '#e5e7eb'}`, borderRadius: 8, marginBottom: 7, cursor: 'pointer', background: on ? 'rgba(14,79,81,0.04)' : '#fff', transition: 'all 0.15s' }} onClick={() => setPriorityMoments(p => p.includes(m.label) ? p.filter(x => x !== m.label) : [...p, m.label])}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${on ? '#0e4f51' : '#d1d5db'}`, background: on ? '#0e4f51' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 3 }}>{on && <span style={{ color: '#fff', fontSize: 9 }}>✓</span>}</div>
              <div><div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 15, fontWeight: 400, color: '#1a1815', marginBottom: 2 }}>{m.label}</div><div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>{m.intent}</div></div>
            </div>
          </div>
        })}

        {internalView && <div style={INTPANEL}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#c8aa4a', marginBottom: 11 }}>Internal brief — not for client</div>
          <p style={{ margin: '0 0 9px' }}><strong>Suppliers:</strong> {et.suppliersNote}</p>
          <p style={{ margin: '0 0 9px' }}><strong>Fee:</strong> {et.marginNote}</p>
          <p style={{ margin: '0 0 9px' }}><strong>Territory:</strong> {ct.coverage} {ct.season}</p>
          {tl?.status === 'rush' && <div style={{ marginTop: 11, background: 'rgba(239,68,68,0.18)', padding: '9px 13px', borderLeft: '3px solid #ef4444' }}><strong>Timeline flag:</strong> Rush territory. Premium fee applies. Confirm client understands before committing.</div>}
          {br?.status === 'tight' && <div style={{ marginTop: 9, background: 'rgba(239,68,68,0.18)', padding: '9px 13px', borderLeft: '3px solid #ef4444' }}><strong>Budget flag:</strong> Below typical floor. Scope conversation required before mandate sign-off.</div>}
        </div>}

        <div style={{ marginTop: 26 }}><button style={BTN} onClick={() => setScreen('client-details')}>Submit brief →</button></div>
      </div>}

      {/* STEP 7 */}
      {screen === 'client-details' && <div>
        {back('verdict')}
        <div style={EYE}>Step 7 of 7 · Your details</div>
        <h2 style={H2}>Who are we talking to?</h2>
        <p style={P}>A Gatekeeper will respond personally within four hours.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={LBL}>First name</label><input style={INP} value={client.firstName} onChange={e => setClient({ ...client, firstName: e.target.value })} placeholder="First name" /></div>
          <div><label style={LBL}>Last name</label><input style={INP} value={client.lastName} onChange={e => setClient({ ...client, lastName: e.target.value })} placeholder="Last name" /></div>
        </div>
        <label style={LBL}>Email</label>
        <input style={INP} type="email" value={client.email} onChange={e => setClient({ ...client, email: e.target.value })} placeholder="your@email.com" />
        <label style={LBL}>Phone (optional)</label>
        <input style={INP} type="tel" value={client.phone} onChange={e => setClient({ ...client, phone: e.target.value })} placeholder="+33 or +44..." />
        <label style={LBL}>Organisation (optional)</label>
        <input style={INP} value={client.organisation} onChange={e => setClient({ ...client, organisation: e.target.value })} placeholder="Company or organisation name" />
        <label style={LBL}>Your role (optional)</label>
        <input style={INP} value={client.role} onChange={e => setClient({ ...client, role: e.target.value })} placeholder="e.g. Head of Events, CEO, EA to..." />
        <div style={{ marginTop: 24 }}>
          <button style={{ ...BTNG, opacity: (!client.firstName || !client.lastName || !client.email) ? 0.5 : 1 }} disabled={!client.firstName || !client.lastName || !client.email} onClick={submit}>Submit brief →</button>
        </div>
      </div>}

      {loadedDraft && <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#0e4f51', color: '#fff', padding: '9px 16px', fontSize: 11, letterSpacing: '0.08em', zIndex: 100, borderRadius: 4 }}>Draft restored</div>}
    </div></div>
  )
}
