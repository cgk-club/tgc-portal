/* eslint-disable react/no-unescaped-entities, react/jsx-no-comment-textnodes */
'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useMemo } from 'react'

const STORAGE_KEY = 'tgc-events-mandate-draft'
const CALENDAR_URL = 'https://calendar.app.google/aAsppu4Tju2my9ST7'

// ──────────────────────────────────────────────────────────────────────────────
// EVENT TYPES — 14 canonical types with full Moment Framework
// ──────────────────────────────────────────────────────────────────────────────

const EVENT_TYPES: Record<string, {
  name: string; sub: string; flowFamily: string;
  guestCount: { min: number; max: number; sweet: number };
  moments: { label: string; intent: string }[];
  industryMistakes: string[];
  loud: string; quiet: string;
  suppliers: Record<string, string>;
  realities: string[];
  scale: string;
}> = {
  'seated-dinner': {
    name: 'Seated dinner', sub: 'Up to 20 guests', flowFamily: 'private',
    guestCount: { min: 6, max: 20, sweet: 14 },
    moments: [
      { label: 'The arrival', intent: 'The first 90 seconds after a guest steps through the door. Warmth, smell, light — and a drink that isn\'t the default champagne.' },
      { label: 'The second course', intent: 'When the room has warmed and the wine has opened. This is where the chef earns her fee.' },
      { label: 'The music moment', intent: 'A single musician, three to five minutes between courses. Guests stop, listen, return transformed.' },
      { label: 'The toast', intent: 'Short. Personal. Specific. Never read from a note. The moment the evening crystallises into a story guests will tell.' },
      { label: 'The send-off', intent: 'A small gift, a handwritten note, or a playlist sent next morning. The evening continues after guests have left.' },
    ],
    industryMistakes: [
      'Seven courses with amuse-bouches — by course five guests have stopped tasting',
      'Tall floral arrangements that block sightlines at a 14-person table',
      'Printed menus at each setting — pretentious and dated',
      'Event captains with earpieces at an intimate dinner',
    ],
    loud: 'Villa d\'Este terrace, 14-course tasting, named chef and full brigade, professional photographer, string quartet, orchid wall',
    quiet: 'Private home, vigneron\'s cellar, or private library. Single chef. Three courses. Candles. Local wine. One musician, if any. No photographer.',
    suppliers: {
      chef: 'Michelin-backgrounded, no longer restaurant-tied, cooks for small numbers, sources at dawn markets',
      floral: 'Two buckets and a pair of secateurs. Seasonal. No imported roses.',
      music: 'Single cellist, lutenist, jazz pianist. One set of 15-20 minutes.',
      wine: 'Three curated bottles, not fifteen. Chosen by the host or someone they trust.',
      lighting: 'Candles. If not candles, two warm-bulb lamps. Never uplighting.',
    },
    realities: [
      'Guests arrive within a 20-minute window, not precisely on time',
      'Three-course service for 14 takes 2h15-2h45 minimum',
      'The post-dinner lull around 10:30pm is where dinners go flat — a music moment or a change of room rescues it',
      'Private homes almost always lack kitchen space for 14+ — bring mobile catering or commandeer the kitchen',
    ],
    scale: 'Five-figure is standard. Six-figure at the trophy end with named chef and vintage wines. Seven-figure unusual and usually signals misallocation.',
  },

  'private-dinner-party': {
    name: 'Private dinner party', sub: '20-60 guests', flowFamily: 'private',
    guestCount: { min: 20, max: 60, sweet: 30 },
    moments: [
      { label: 'The arrival flow', intent: 'Each guest feels received, not processed. A household member or the host greets every guest personally in the first room.' },
      { label: 'The transition to the table', intent: 'Quiet and ceremonial — a bell, a musician beginning to play, a host leading by example. Where large private dinners most often fall apart.' },
      { label: 'The centrepiece course', intent: 'The one course where the kitchen shows its craft. Not the starter, not the dessert. The dish guests describe tomorrow.' },
      { label: 'The host\'s moment', intent: 'A three-minute toast, timed between centrepiece and dessert. Personal, specific, not read.' },
      { label: 'The after-dinner unstructured time', intent: 'Coffee and digestifs in a different room. Small conversations. A single musician in the corner. Where real relationships form.' },
    ],
    industryMistakes: [
      'Over-programmed schedules that feel corporate rather than hosted',
      'Wrong table shape — one giant rectangle means guests only talk to four neighbours',
      'Too much food — portions sized for stomach capacity, not conversation',
      'Branded or themed elements that don\'t belong in the room',
    ],
    loud: 'Marquee on the lawn, named venue, 60 guests, six-course menu, event photographer, full floral production, uplighting, DJ in a second room',
    quiet: 'Client\'s own dining room, 24 guests, three courses, candlelit, a cellist during the transition, coffee in the library after',
    suppliers: {
      chef: 'Scales to 40-60 with one trusted sous-chef and local day-of help. Retains creative control.',
      floral: 'Two or three focal arrangements, not one per table. Low, seasonal.',
      service: 'One server per 8-10 guests. Dressed normally. Unobtrusive.',
      music: 'Single or duo. Background before dinner, foreground for 20 minutes after.',
      lighting: 'Candles on tables, lamps in corners. Overhead dimmed off.',
    },
    realities: [
      'Home dinners of 30+ almost always need mobile kitchen support, plate storage, and glassware brought in',
      'Acoustics matter more than decor — hard floors and high ceilings amplify 30 guests into a roar',
      'Coat check for 30+ coats needs actual management, not a pile on a bed',
      'Parking and valet for 60 guests — or very clear arrival instructions',
    ],
    scale: 'Solidly six-figure. Five-figure possible at modest scale with a trusted local network.',
  },

  'milestone-celebration': {
    name: 'Milestone celebration', sub: '40-150 guests — birthdays, anniversaries, engagements', flowFamily: 'private',
    guestCount: { min: 40, max: 150, sweet: 80 },
    moments: [
      { label: 'The honouree\'s arrival', intent: 'They enter 20-30 minutes after doors open, when the room is already warm. Their arrival is the opening moment.' },
      { label: 'The centrepiece surprise', intent: 'Five to ten minutes, maximum. A short live performance, a short film, a toast by a guest others didn\'t know was coming.' },
      { label: 'The shared attention moment', intent: 'Dinner, a cake cutting, or a toast. One moment where the entire room is focused on the same thing.' },
      { label: 'The second-room moment', intent: 'After the shared moment, a change of space or mood. Dancing in a different room, a bar opened on a terrace. Guests re-mix.' },
      { label: 'The send-off', intent: 'A final toast, one photograph if used, a small send-off gift. Guests leave with a sense of closure, not dissipation.' },
    ],
    industryMistakes: [
      'Over-celebrating the honouree — photo wall at every age, slideshow during dinner, multiple obligatory speeches',
      'Misjudged entertainment — DJ for a 60-person 60th, swing band for a 40-person 40th',
      'Events that overrun by one to two hours',
      'Weak transitions between arrival, dinner, performance, and dancing',
    ],
    loud: 'Destination event for 120, named venue, marquee, full band, DJ, photographer and videographer, themed decor',
    quiet: '50 guests at the client\'s country property, tented dining, one chef, one musician, one surprise moment',
    suppliers: {
      chef: 'Experienced at scale but refuses tasting menus for 80 people. Three-course menu that works at temperature and timing. Own equipment that travels.',
      entertainment: 'One surprise element, carefully chosen. Not a band for four hours.',
      lighting: 'Ambient and generous, not theatrical. Candles and string lights. Ideally the venue itself needs little addition.',
      photographer: 'If used, one photographer for the first 90 minutes only. Put away after the main moment.',
    },
    realities: [
      'Most milestone events are under-rehearsed — host, surprise speaker, and timing person need a walk-through',
      'Weather risk on outdoor elements is catastrophic — need a real indoor plan, not a marquee backup',
      'The honouree is often exhausted — TGC should check on them mid-event to make sure they\'re a guest, not a performer',
      'Guest-list politics exist; TGC should know the key tensions and seat accordingly',
    ],
    scale: 'Six-figure floor. Seven-figure for 150-guest events at destination venues with named chefs or specific performers.',
  },

  'housewarming-seasonal': {
    name: 'Housewarming / seasonal moment', sub: 'Flexible guest count', flowFamily: 'private',
    guestCount: { min: 20, max: 80, sweet: 35 },
    moments: [
      { label: 'The welcome into the space', intent: 'A short walk-through early in the event, done by the owner — not a tour guide. Ten minutes. Guests oriented and relaxed.' },
      { label: 'The seasonal anchor', intent: 'A fire in winter, garden lanterns in summer, a specific tree in autumn. Design around it; do not compete with it.' },
      { label: 'The grazing table', intent: 'A single long table of beautifully prepared food guests return to throughout the evening. Removes the seated-for-two-hours constraint.' },
      { label: 'The pacing check', intent: '2.5 to 3 hours maximum. A short event that ends warm beats a long one that drifts.' },
      { label: 'The parting gift', intent: 'Specific to the house or the season — honey from the estate, a candle with the garden\'s scent, a bottle of local wine.' },
    ],
    industryMistakes: [
      'Over-formalising an informal event with scripted welcomes and professional service staff',
      'Competing with the house through unnecessary decor',
      'Wrong duration — pitched as dinner when it should be drinks-plus-grazing',
    ],
    loud: 'Full catering, DJ, designed invitations, themed decor, 80 guests, formal dinner',
    quiet: '25-40 guests, grazing table, fire or garden lanterns, one or two staff, a single musician for 30 minutes, 7pm to 9:30pm',
    suppliers: {
      caterer: 'Grazing-table craftsman — terrines, cured meats, aged cheeses, homemade breads, seasonal vegetables done simply. Not a canapé specialist.',
      floral: 'Minimal, seasonal, ideally from the garden itself. A single arrangement or none.',
      staff: '1-2 people, dressed normally, helping the host rather than replacing them.',
    },
    realities: [
      'Housewarmings are often over-attended — plan for 15-20% more guests than confirmed',
      'Seasonal moments work best when they acknowledge the season genuinely',
      'Less infrastructure means more freedom for the host to actually host',
    ],
    scale: 'Low to mid five-figure for genuinely intimate. Six-figure only if scale extends beyond 60 or the venue needs significant setup.',
  },

  'intimate-concert': {
    name: 'Intimate concert / performance evening', sub: '20-80 guests', flowFamily: 'private',
    guestCount: { min: 20, max: 80, sweet: 35 },
    moments: [
      { label: 'The anticipation', intent: 'Guests arrive not knowing exactly what they will see or hear. The mystery is part of the value. Never announce the artist in the invitation.' },
      { label: 'The introduction', intent: 'Two-minute introduction by the host, not a professional MC. Warm, brief, personal. Why this artist, why tonight.' },
      { label: 'The performance', intent: '40-60 minutes. Uninterrupted. Guests seated, phones away, attention full.' },
      { label: 'The aftermath', intent: 'Immediately after, the host invites guests to drinks and light supper in an adjacent room. The energy carries from performance into social.' },
      { label: 'The informal encounter with the artist', intent: 'The artist joins for supper. Conversation natural. The moment guests will talk about the following week.' },
    ],
    industryMistakes: [
      'Applying wedding-reception logic — performance at the end when guests are tired and full. Performance first, always.',
      'Over-producing a solo guitarist with professional stage lighting and sound',
      'Skipping the room rehearsal — acoustics in private spaces vary wildly',
      'Scheduling the performance too late (after dinner) rather than early (7-8pm)',
    ],
    loud: 'A famous artist, hired venue with stage, professional production, named catering, 80 guests',
    quiet: 'A genuinely excellent but not-famous artist, private home or library, 25-40 guests, minimal production, supper together afterwards',
    suppliers: {
      artist: 'Known to TGC personally or through close referral. Vetted for repertoire, temperament, and willingness to engage with guests afterwards.',
      soundLight: 'Minimal. A single piano tuner. Small amplification for jazz ensembles. Natural light transitioning to lamps and candles.',
      venue: 'Resonant but not echoey. High ceilings help. Carpet and curtains matter for acoustics.',
      supper: 'Light, post-performance appropriate. Standing buffet or small seated supper in a second room.',
    },
    realities: [
      'Artist negotiation requires tact — travel and accommodation often matter more than fee',
      'Rehearsal and sound check require 2-3 hours of the venue on the day',
      'Some artists want a green room; others prefer to be among guests. Ask.',
      'Recording is almost always problematic. Most great artists decline. Respect this.',
    ],
    scale: 'Mid-five-figure for an intimate evening with a rising artist. Six to low-seven figures for a named artist. The artist fee is the largest line.',
  },

  'founders-circle': {
    name: 'Founders\' circle / investor dinner', sub: '10-30 guests', flowFamily: 'corporate',
    guestCount: { min: 10, max: 30, sweet: 16 },
    moments: [
      { label: 'The seating moment', intent: 'Who sits next to whom is 80% of the value of this event. Designed two weeks in advance with specific relationship goals for each placement.' },
      { label: 'The framing question', intent: 'Near the start, the host asks one question that gives the evening a purpose. Transforms dinner into gathering.' },
      { label: 'The mid-dinner break', intent: 'Around course two, conversation naturally breaks into smaller groups. The host physically moves — or encourages others to.' },
      { label: 'The specific ask or offer', intent: 'If the event has commercial purpose, it is named briefly near the end. Clean, explicit, unpressured.' },
      { label: 'The post-dinner follow-through', intent: 'Within 24 hours, the host sends personal notes referencing specific conversations. Not a template. This is where relationships deepen.' },
    ],
    industryMistakes: [
      'Too much food — seven courses for an investor dinner makes food an obstacle to conversation',
      'Hotel private dining rooms with generic service',
      'Wrong table shape — a round table of 20 kills the conversation',
      'Host being a bad host because they\'re the founder — they need a one-page brief',
      'Inviting to fill seats rather than choosing guests who belong',
    ],
    loud: 'Hotel private room, printed menus, wine pairing with sommelier commentary, branded signage, photography, 30 guests including 8 "useful to have"',
    quiet: 'Members\' club back room or network member\'s private home. 14-16 guests. Three courses. One excellent wine chosen by the host. Long table.',
    suppliers: {
      venue: 'Members\' clubs, private homes of network members, small named restaurants bought out. Never hotel private dining rooms unless the hotel has genuine craft.',
      food: 'Simple, excellent, seasonal. Three courses. A menu that works for all diets without personalised service.',
      service: 'One senior plus one junior per 10 guests. Briefed on the purpose of the evening.',
      wine: 'One thoughtful selection per course, chosen by host or TGC. Not a sommelier-narrated pairing.',
    },
    realities: [
      'Seating charts get rewritten 3-5 times between RSVP and event day',
      'Last-minute cancellations happen — the event must still work at 12 instead of 14',
      'Phones discouraged but not confiscated — adult professionals do not need their phones taken away',
      'Non-disclosure often appropriate for members\' clubs hosting sensitive commercial discussions',
    ],
    scale: 'Low to mid six-figure. Higher if the wine list reaches for vintage bottles (easily £30-80k). Food and venue less critical than wine and the host\'s time.',
  },

  'board-retreat': {
    name: 'Board / partner retreat', sub: '10-40 guests, 2-3 days', flowFamily: 'corporate',
    guestCount: { min: 10, max: 40, sweet: 22 },
    moments: [
      { label: 'The arrival evening', intent: 'Informal drinks and supper, not a formal dinner. Resetting, allowing decompression. Sets the tone as thinking, not performing.' },
      { label: 'The shared experience (not a meal)', intent: 'Day 2: a hike, a tasting, a winery visit, a short concert. Unlocks connections that wouldn\'t happen in board meetings.' },
      { label: 'The closing conversation', intent: 'Final morning or afternoon. Each participant says what they\'re taking from the retreat. Ten minutes each. Genuinely landing it.' },
      { label: 'The follow-through artefact', intent: 'A document or small book within ten days. Not a deck. A genuine reflection of the retreat\'s content and spirit.' },
    ],
    industryMistakes: [
      'Over-programming — six sessions, two meals, cocktail hour, dinner on day 2. Exhausted by dinner, wasted on final day',
      'Wrong venue — hotel conference centres kill the retreat feeling',
      'Bad AV — ironic but common; distracts from content',
      'Off-the-shelf team building — adult professionals roll their eyes at ropes courses',
      'No capture — two weeks later nobody remembers what was decided',
    ],
    loud: 'Four Seasons conference centre, professional facilitators, branded booklets, 30 participants plus "support team," printed schedules, logo-embossed giveaways',
    quiet: 'Country house rental or small private hotel, 20-40 participants, one trusted facilitator or self-facilitated, simple folders, one shared activity day, closing conversation, follow-through document',
    suppliers: {
      venue: 'Country house hotel, French château with event support, Italian villa with staff, Swiss mountain lodge. Privacy, character, food, grounds.',
      facilitator: 'One trusted individual who knows the client, or self-facilitated. Not a consulting firm.',
      food: 'Variety across days. Breakfast abundant but not formal. Lunch light. Dinner is the evening\'s event.',
      activity: 'Local, specific, excellent. Not team building. Something participants tell a friend about.',
    },
    realities: [
      'Scheduling is usually over-optimistic — build 25% slack into the schedule',
      'Travel logistics are material if participants fly in from six different cities',
      'Dietary and accessibility requirements gathered in advance, not on arrival',
      'Weather risk for outdoor activities must be planned around',
    ],
    scale: 'High six-figure to low seven-figure for 2-3 days, 20-30 people, serious venue, thoughtful activities, follow-through.',
  },

  'strategic-client-dinner': {
    name: 'Strategic client dinner', sub: '8-20 guests', flowFamily: 'corporate',
    guestCount: { min: 8, max: 20, sweet: 12 },
    moments: [
      { label: 'The pre-dinner host brief', intent: '15 minutes before guests arrive. Seating logic, key conversations, sensitive topics to avoid. Usually skipped; the ones that work do not.' },
      { label: 'The arrival conversation', intent: 'Host team scattered, not clustered. Every guest has a principal host speaking with them within 60 seconds.' },
      { label: 'The seating moment', intent: 'Designed around a specific conversational goal. Never random, never alphabetical.' },
      { label: 'The substantive conversation', intent: 'Around course two. Not a presentation, not a pitch — a substantive exchange of views on a topic relevant to both sides.' },
      { label: 'The close', intent: 'A short, specific thank-you from the senior host, referencing something substantive from the conversation. Guests leave clear about why the evening mattered.' },
    ],
    industryMistakes: [
      'Wrong guest ratio — 10 hosts and 4 clients feels like a sales meeting',
      'Over-rehearsed host team all repeating the same talking points',
      'Inviting too many "useful" people who dilute the table',
      'Wine as status signal rather than taste — sophisticated clients recognise the signalling',
    ],
    loud: 'Claridge\'s private dining, 20 people including 12 hosts, printed agenda, opening remarks from the CEO, sommelier commentary, group photo',
    quiet: 'Members\' club back room or small private home. 10 people including 5 hosts. Host brief done in advance. Seating designed around a specific goal. Three courses.',
    suppliers: {
      venue: 'Members\' club back rooms, small high-end restaurants bought out, occasionally private homes. Never hotel ballrooms.',
      food: 'Simple excellent, not presentational.',
      service: 'Invisible. One server per 6-8 guests. Synchronised timing.',
    },
    realities: [
      'Often arranged at 2-3 weeks\' notice because client schedules are tight',
      'Some clients arrive with unstated seniority issues — seating must be defensible on relationship logic',
      'Follow-through is where these events pay off or fail — the host team needs an agreed next-24-hour plan before guests arrive',
    ],
    scale: 'Five-figure for intimate (8-12), six-figure for larger (up to 20). The wine list is the main variable.',
  },

  'product-launch': {
    name: 'Product launch / brand moment', sub: '50-200 guests', flowFamily: 'corporate',
    guestCount: { min: 50, max: 200, sweet: 100 },
    moments: [
      { label: 'The pre-arrival signal', intent: 'A physical invitation, not email. Arrives a month early. Specific and beautiful. Sets expectations before the event.' },
      { label: 'The arrival moment', intent: 'First 60 seconds. Guests understand they are somewhere special — from the space itself, not from signage.' },
      { label: 'The reveal', intent: '5-8 minutes maximum. A specific light change, a short film, a physical demonstration. Longer loses the room.' },
      { label: 'The try-it moment', intent: 'Guests physically engage with the product, not just listen to it described. Event design enables this naturally.' },
      { label: 'The specific departure gift', intent: 'Genuinely useful and specific. Not logo-embossed merchandise. Something guests will actually keep.' },
    ],
    industryMistakes: [
      'Too much stage time — attention is gone by minute 20. Maximum 12 minutes total across all speakers',
      'LED walls as default production — a genuinely beautiful physical environment beats them',
      'Catering as afterthought — guests remember the food',
      'Branded everything — makes the event feel like marketing',
      'Confusion of purpose — press, customers, investors all invited ends up serving none',
    ],
    loud: 'Hotel ballroom, LED walls, 30-minute presentation with four speakers, DJ after, 200 guests, photographer and videographer, branded gift bags',
    quiet: 'A genuinely interesting venue — warehouse, gallery, historic building. 80-100 guests. 8 minutes of stage time total. Physical engagement with the product. Excellent food. A single beautiful departure gift.',
    suppliers: {
      venue: 'Specific to the brand or product story. Never a hotel ballroom unless the hotel itself is the story.',
      production: 'Restraint. One theatrical moment done perfectly.',
      catering: 'Excellent, generous, thematically appropriate but not overtly themed.',
      photography: 'Two photographers, each for specific sections of the evening. Put away after.',
    },
    realities: [
      'Press attendance is a separate planning exercise from guest attendance',
      '6:30pm arrivals, 7:30pm reveal, 9:30pm end is the golden structure',
      'The client will want branded content and experience. TGC\'s job is to argue for less of the former and more of the latter',
      'Weather backup plans for any outdoor element',
    ],
    scale: 'Mid to high six-figure for 80-120 guests. Seven-figure if venue build-out is significant or a named performer is involved.',
  },

  'partner-summit': {
    name: 'Annual partner summit / conference', sub: '50-300 guests, 2-3 days', flowFamily: 'corporate',
    guestCount: { min: 50, max: 300, sweet: 180 },
    moments: [
      { label: 'The opening evening', intent: 'A reception in an unexpected venue, not a formal dinner. Partners see each other before business content begins.' },
      { label: 'The substantive content day', intent: 'Genuine intellectual content. Curation of speakers and content, not just logistics.' },
      { label: 'The exceptional dinner', intent: 'One of the 2-3 evenings is the anchor — in a venue partners will remember for the year. Budget concentrates here.' },
      { label: 'The informal experience day', intent: 'Wine tasting, golf, outdoor activity, cultural experience. Partners bond through shared non-work experience.' },
      { label: 'The closing', intent: 'Substantive close framing the year ahead. Not a motivational speech. Genuine transition from "we gathered" to "now we work."' },
    ],
    industryMistakes: [
      'Generic conference hotels — every year at the same Ritz-Carlton; partners dread it',
      'PowerPoint death march — disengagement by session three',
      'Weak content curation — the smartest people in the room end up bored',
      'Over-catering during sessions — partners stuffed and sluggish',
      'No partner-led content — sessions feel imposed rather than owned',
    ],
    loud: 'Ritz-Carlton convention centre, 280 partners, 6 keynote speakers, 4 breakouts per block, 3 dinners in the hotel ballroom, a headliner on night 2, branded everything',
    quiet: 'Distinctive destination hotel or resort. 120 partners. 2 serious keynote speakers plus partner-led panels. 1 anchor dinner off-site. An unstructured local experience day.',
    suppliers: {
      venue: 'Distinctive, memorable. Country estates, small resort towns, cultural venues. Not convention centres.',
      content: 'Curated speakers for specific fit. Partner-led sessions as backbone. External voices as catalysts.',
      food: 'Variety across days. Quality over uniformity. Surprising element in one or two meals.',
    },
    realities: [
      'Partner RSVPs are fickle — expect 15-20% no-show after confirmation',
      'Spouse programmes, if included, must be genuinely considered — not a spouse tour',
      'Content approval chains internal to client can delay curation — start 4+ months out',
      'AV and technical infrastructure specified precisely — session rooms need audio, sightlines, reliable tech',
    ],
    scale: 'High six-figure to mid seven-figure depending on destination, duration, and guest count. Named speakers of the highest calibre add seven-figure line items alone.',
  },

  'incentive-trip': {
    name: 'Incentive / reward trip', sub: '10-100 guests, 3-5 days', flowFamily: 'corporate',
    guestCount: { min: 10, max: 100, sweet: 30 },
    moments: [
      { label: 'The arrival welcome', intent: 'Specific and surprising — a classic car transfer, a sundowner at a viewpoint, a local craftsperson greeting the group. Sets the whole trip\'s tone.' },
      { label: 'The anchor experience', intent: 'One genuinely once-in-a-lifetime moment. Private after-hours museum tour, an unreachable chef, a dawn balloon, a boat to an empty beach. Budget concentrates here.' },
      { label: 'The unstructured time', intent: 'One afternoon or evening with no programme. Disproportionately appreciated.' },
      { label: 'The farewell dinner', intent: 'Informal celebration somewhere with character, not a formal banquet. Emotional, specific, local.' },
      { label: 'The post-trip artefact', intent: 'Small, specific, personal. A photograph from a particular moment, a recipe, a local craft object. Not a memory book.' },
    ],
    industryMistakes: [
      'Over-programming — 7am to 11pm daily, participants return needing a holiday',
      'Generic luxury — same trip, different destination, indistinguishable experiences',
      'Wrong mix of work and reward — embedded "strategy discussions" guests resent',
      'Group size misjudged — forcing 100 through an experience designed for 20',
    ],
    loud: '80 participants to St Barts on a chartered jet, five-star hotel, branded golf shirts, daily group activities, two formal dinners, a cocktail party',
    quiet: '20 participants to rural Provence. Self-directed villa stay. One private chef experience. One anchor activity — a vintage car rally, a truffle hunt, a vineyard blending session. Abundant free time. One farewell dinner.',
    suppliers: {
      destination: 'Specific and distinctive, not generic luxury. Somewhere participants wouldn\'t have chosen for themselves but will love.',
      accommodation: 'Boutique or villa rental, not chain resort.',
      experiences: 'Local, authentic, real craft, real place, real people.',
    },
    realities: [
      'Group dynamics at 10-100 are politically loaded — TGC manages pacing, dietary needs, interpersonal issues',
      'Travel logistics for international groups are substantial',
      'Travel insurance, health contingency, weather backups',
      'Cultural sensitivity across destinations matters',
    ],
    scale: 'Six-figure for small intimate groups. Low-to-mid seven-figure for 50+ with chartered aviation and named venues.',
  },

  'conference-summit': {
    name: 'Conference / summit', sub: '200-1000+ delegates, multi-day', flowFamily: 'mice',
    guestCount: { min: 200, max: 1000, sweet: 400 },
    moments: [
      { label: 'The pre-delegate experience', intent: 'What arrives before delegates travel — the invitation, the portal, the pre-trip brief. First moment of the event.' },
      { label: 'The arrival into the venue', intent: 'Not registration (transactional), but the moment delegates step into the main space. Where production values register.' },
      { label: 'The opening keynote', intent: 'First substantive content. Must be genuinely excellent. Sets the conference\'s intellectual floor.' },
      { label: 'The anchor dinner', intent: 'Single memorable evening in a distinctive venue. Networking quality, not delegate feeding. Budget concentration.' },
      { label: 'The closing moment', intent: 'A substantive close giving completion rather than dissipation. Brief, clear, memorable.' },
    ],
    industryMistakes: [
      'Content bloat — 40 sessions across 3 days; delegates attend 6-8. Curate to 20-25',
      'Unrelenting schedules — 7:30am breakfast to 10pm dinner, no white space',
      'Catering by volume not craft — buffets for 600 with indifferent food',
      'Breakout rooms with poor AV — delegates spend 60% of time there',
      'Pointless "networking" blocks in rooms with no structure',
      'Weak app strategy — either invest seriously or don\'t have one',
    ],
    loud: 'Convention centre in a tier-1 city, 800 delegates, 40 sessions, 3 evening receptions in the convention centre, a headline entertainer, sponsored branding throughout',
    quiet: 'Distinctive venue in a second-tier destination or off-site from a primary city. 300 delegates. 20 curated sessions. One anchor dinner at a unique venue. Unstructured time. No entertainment beyond content.',
    suppliers: {
      venue: 'Character over capacity. Cultural venues, refurbished industrial spaces, university campuses. Not convention centres.',
      content: 'Dedicated content curator knowing delegate audience and speaker market.',
      production: 'Tech-heavy but invisible. Main stage and breakouts both need professional audio, video, lighting.',
      catering: 'Variety across days, character in one or two meals, genuine coffee, serious vegetarian options.',
      staff: 'Small, visible, consistent team that delegates come to trust.',
    },
    realities: [
      'Delegate arrival logistics matter — 300 people in a 3-hour window must be handled',
      'Speaker management is a specialist discipline',
      'AV and streaming budgets are usually 30% of total — cut other things, not AV',
      'Accessibility planned for from the start, not retrofitted',
      'Post-conference content (recordings, highlights) — decide up front',
    ],
    scale: 'Solidly seven-figure. Higher with big-name speakers, major destination costs, or larger scale.',
  },

  'exhibition-trade-show': {
    name: 'Exhibition / trade show hosting', sub: 'Hosting VIPs at larger exhibitions', flowFamily: 'mice',
    guestCount: { min: 20, max: 200, sweet: 60 },
    moments: [
      { label: 'The pre-exhibition briefing', intent: 'Hosted visitors receive a curated brief — what to see, who to meet, what not to miss. Transforms overwhelming into manageable.' },
      { label: 'The private view / early access', intent: '60-90 minutes before the main doors open. A curator or expert accompanies. The single most valuable moment the host provides.' },
      { label: 'The hosted meal', intent: 'One focused luncheon or dinner where visitors reflect, compare notes, and interact with senior host leadership.' },
      { label: 'The specific access moment', intent: 'A named individual the hosted visitor meets privately — a curator, a key exhibitor, a subject-matter expert.' },
      { label: 'The departure reflection', intent: 'Small curated summary — a catalogue with annotations, a specific gift connected to an exhibitor, a thoughtful follow-up note.' },
    ],
    industryMistakes: [
      'Treating the exhibition itself as the experience — dumping visitors into the general flow',
      'Branded merchandise as value-add — logo tote bags forgotten within 48 hours',
      'Over-scheduled hosting days — 8am to 11pm leaves visitors exhausted',
      'Wrong host-to-visitor ratio — too many host reps feels like a sales pitch',
    ],
    loud: 'Branded reception at the exhibition hall, visitors ushered between booth partners, branded photographer throughout, heavy schedule',
    quiet: 'Private hotel in the exhibition city, small-group early-access tour with a genuine curator, one focused lunch with 2-3 senior host leaders, specific meetings with key exhibitors',
    suppliers: {
      guide: 'Genuine subject-matter expertise — an art historian for an art fair, a designer for a design fair, a vintner for a wine fair.',
      venue: 'Off-site from the exhibition, thematically connected.',
      scheduling: 'Generous white space — 40% of each day unstructured.',
    },
    realities: [
      'Exhibition access and VIP passes are often controlled by the organiser — relationship matters',
      'Major trade show timing is compressed — hotels sell out, restaurants booked, transfers slow',
      'Hosted visitor expectations vary widely by nationality and industry',
    ],
    scale: 'Typically low-to-mid six-figure. Hosting economics are separate from exhibition scale.',
  },

  'association-gathering': {
    name: 'Association / industry gathering', sub: '100-500 delegates, typically annual', flowFamily: 'mice',
    guestCount: { min: 100, max: 500, sweet: 250 },
    moments: [
      { label: 'The returning-delegate recognition', intent: 'Regular attendees greeted by name with acknowledgement of prior attendance or contribution. Small gesture, huge relational value.' },
      { label: 'The new-delegate on-ramp', intent: 'First-time attendees welcomed specifically. An informal first-night mixer. Ensures they return next year.' },
      { label: 'The substantive content anchor', intent: 'A specific keynote or session that gives the year\'s gathering a theme. A specific editorial stance on what "this year is about."' },
      { label: 'The gala dinner', intent: 'Most associations have one. Almost always poorly done. The single highest-leverage redesign opportunity.' },
      { label: 'The closing signal for next year', intent: 'A specific mention of where and when next year\'s event will be held. Builds anticipation.' },
    ],
    industryMistakes: [
      'Identical year-on-year format — delegates stop attending by year three',
      'Award ceremony overreach — 35 awards; nobody cares about award 43',
      'Weak sponsorship integration — logos everywhere, shoehorned sponsor speakers',
      'Under-investing in first-timer experience',
      'Failing to adapt to the industry\'s moment — a 2026 event should feel like 2026',
    ],
    loud: 'Same hotel as last five years, 400 delegates, 35-award gala with long speeches, 6 sponsor-speaker sessions, branded bags, a cover band for the post-gala',
    quiet: 'A different venue this year — a museum, a university, a rented cultural venue. 250 delegates. 8 awards given with genuine craft. 2 sponsor-speakers integrated into sessions. A single strong musician for the gala.',
    suppliers: {
      venue: 'Variety year over year keeps the event fresh. Character matters.',
      content: 'Renewed annually, not recycled.',
      galaFormat: 'Re-imagined away from the hotel-ballroom template.',
      sponsorship: 'Fewer but better-integrated. Each sponsor gets a specific moment that fits naturally.',
    },
    realities: [
      'Association boards are political — changing format requires negotiating internal stakeholders',
      'Sponsorship revenue is often substantial and constrained — redesigning requires early sponsor conversation',
      'Recurring delegate data is gold — who attended last year, who dropped off, who first-timed',
    ],
    scale: 'A 250-delegate association gathering is typically low-seven-figure all-in.',
  },
}

// ──────────────────────────────────────────────────────────────────────────────
// CATCHMENTS — 10 supplier catchments
// ──────────────────────────────────────────────────────────────────────────────

const CATCHMENTS: Record<string, { name: string; sub: string; season: string; coverage: string; venues: string }> = {
  'french-riviera-monaco': {
    name: 'French Riviera + Monaco',
    sub: 'Menton to St Tropez plus Monaco',
    season: 'Year-round. Peak May-September. August quiet for corporate, peak for private.',
    coverage: 'Deep — direct supplier relationships across chefs, florists, musicians, venues.',
    venues: 'Private villas (preferred) · Hotel du Cap-Eden-Roc · Grand-Hôtel du Cap-Ferrat · inland vineyards · yachts',
  },
  'provence-occitanie': {
    name: 'Provence + Occitanie',
    sub: 'Aix, Avignon, Montpellier, south of France interior',
    season: 'Peak May-October. Mistral and summer heat are real operational factors.',
    coverage: 'Very strong — TGC home ground. Direct network across chefs, vignerons, artisans.',
    venues: 'Private estates and châteaux · vineyards · historic village properties · courtyards and gardens',
  },
  'paris-ile-de-france': {
    name: 'Paris + Île-de-France',
    sub: 'Paris extending to Versailles, Chantilly, Fontainebleau',
    season: 'Year-round. September-October and April-June peak. August quiet.',
    coverage: 'Very strong — direct relationships with members\' clubs, named venues, chefs, cultural institutions.',
    venues: 'Members\' clubs · hôtels particuliers · private museums after hours · château venues for retreats',
  },
  'london-home-counties': {
    name: 'London + Home Counties',
    sub: 'London + Oxford, Cotswolds, Sussex, Surrey',
    season: 'Year-round. Country houses peak May-September.',
    coverage: 'Strong — especially for corporate and intimate private events.',
    venues: 'Members\' clubs (Mark\'s, Oswald\'s, 5 Hertford Street) · townhouse venues · country houses · private museums',
  },
  'italian-lakes-milan': {
    name: 'Italian Lakes + Milan',
    sub: 'Como, Garda, and the Milanese supplier base',
    season: 'Lakes peak May-September. Milan year-round, peak September-November and April-June.',
    coverage: 'Partnership — coordinated through trusted Italian specialists in each lake and in Milan.',
    venues: 'Lake villas · Milan palazzi · fashion-industry venues · private gardens',
  },
  'tuscany-umbria': {
    name: 'Tuscany + Umbria',
    sub: 'Inland Italian villa circuit',
    season: 'Peak May-October. Harvest September-October adds specific experience possibilities.',
    coverage: 'Partnership through Chianti/Val d\'Orcia and Umbria-based specialists.',
    venues: 'Private villas · working wine estates · historic farmhouses · select monasteries',
  },
  'amalfi-capri': {
    name: 'Amalfi + Capri',
    sub: 'Sharply seasonal coastal ecosystem',
    season: 'May-early October. Winter closed.',
    coverage: 'Partnership through an Amalfi-based specialist.',
    venues: 'Clifftop hotels (Belmond Caruso, Il San Pietro, Le Sirenuse) · private villas · yacht-based events',
  },
  'swiss-alps-lake-geneva': {
    name: 'Swiss Alps / Lake Geneva',
    sub: 'Winter: St Moritz, Gstaad, Verbier. Summer: Lake Geneva shore',
    season: 'Winter peak December-March. Summer peak June-September.',
    coverage: 'Partnership through Swiss specialist and individual chalet hosts.',
    venues: 'Private chalets · palace hotels (Badrutt\'s, Grand Hotel Gstaad) · lakeside estates',
  },
  'french-alps': {
    name: 'French Alps',
    sub: 'Courchevel, Megève, Chamonix, Val d\'Isère',
    season: 'Winter peak late December-March. Summer July-early September.',
    coverage: 'Partnership through Courchevel/Méribel specialist.',
    venues: 'Private chalets · alpine hotels · mountain refuges',
  },
  'balearics': {
    name: 'Balearics',
    sub: 'Ibiza, Mallorca, Menorca',
    season: 'Sharp May-October. Off-season functionally closed.',
    coverage: 'Partnership through island-specific specialists.',
    venues: 'Fincas · private beaches · yacht-based events · agritourism estates',
  },
}

// ──────────────────────────────────────────────────────────────────────────────
// MOMENT SKETCH GENERATION
// ──────────────────────────────────────────────────────────────────────────────

function generateMomentSketch({ eventType, catchment, guestCount, date, love, hate, budget, timeline, confidentiality }: {
  eventType: string | null; catchment: string | null; guestCount: string; date: string;
  love: string; hate: string; budget: string; timeline: string; confidentiality: string;
}) {
  if (!eventType || !catchment) return ''
  const et = EVENT_TYPES[eventType]
  const ct = CATCHMENTS[catchment]
  if (!et || !ct) return ''

  const chosenMoments = et.moments.slice(0, Math.min(4, et.moments.length))
  const dateLine = date ? ` · ${date}` : ''
  const guestLine = guestCount ? ` · ${guestCount} guests` : ''

  let sketch = ''
  sketch += `${et.name} · ${ct.name}${dateLine}${guestLine}\n\n`
  sketch += `The moments we'll design around\n\n`
  chosenMoments.forEach((m) => {
    sketch += `${m.label}. ${m.intent}\n\n`
  })

  if (love && love.trim()) {
    sketch += `What you told us you'd love\n\n`
    sketch += `${love.trim().replace(/\s+/g, ' ')}\n\n`
  }

  if (hate && hate.trim()) {
    sketch += `What you told us you'd hate — and we'll therefore avoid\n\n`
    sketch += `${hate.trim().replace(/\s+/g, ' ')}\n\n`
  }

  sketch += `The shape of the ${et.flowFamily === 'mice' ? 'gathering' : 'evening'}\n\n`
  sketch += `${et.quiet}\n\n`

  sketch += `Our honest view\n\n`
  sketch += `${ct.name} is a catchment where ${ct.coverage.toLowerCase()} `
  sketch += `The trap we'll help you avoid here is over-production; this event type at this scale benefits from restraint, not scale. `
  sketch += `We'd concentrate budget on the elements that carry memory — the chef, the venue's own character, the specific moment of surprise — and hold it back from the scaffolding that guests won't remember.\n\n`

  sketch += `Next steps\n\n`
  sketch += `Within four hours: your assigned Gatekeeper acknowledges receipt.\n`
  sketch += `Within 24 hours: first considered response with a refined Moment Sketch.\n`
  sketch += `Within 72 hours: discovery call to walk through and refine.\n`
  sketch += `Within two weeks: signed mandate and supplier engagement begins.\n`

  return sketch
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

function TGCEventsProduction() {
  const [screen, setScreen] = useState('welcome')
  const [flowFamily, setFlowFamily] = useState<string | null>(null)
  const [eventTypeId, setEventTypeId] = useState<string | null>(null)
  const [love, setLove] = useState('')
  const [hate, setHate] = useState('')
  const [catchmentId, setCatchmentId] = useState<string | null>(null)
  const [brief, setBrief] = useState({ guestCount: '', date: '', timeline: '', budget: '', confidentiality: '', notes: '' })
  const [client, setClient] = useState({ name: '', email: '', phone: '', organisation: '' })
  const [internalView, setInternalView] = useState(false)
  const [mandateId, setMandateId] = useState<string | null>(null)
  const [loadedDraft, setLoadedDraft] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.flowFamily) setFlowFamily(data.flowFamily)
        if (data.eventTypeId) setEventTypeId(data.eventTypeId)
        if (data.love) setLove(data.love)
        if (data.hate) setHate(data.hate)
        if (data.catchmentId) setCatchmentId(data.catchmentId)
        if (data.brief) setBrief(data.brief)
        if (data.client) setClient(data.client)
        setLoadedDraft(true)
        setTimeout(() => setLoadedDraft(false), 4000)
      }
    } catch { /* first run */ }
  }, [])

  useEffect(() => {
    if (flowFamily || eventTypeId) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          flowFamily, eventTypeId, love, hate, catchmentId, brief, client,
        }))
      } catch { /* storage unavailable */ }
    }
  }, [flowFamily, eventTypeId, love, hate, catchmentId, brief, client])

  const eventType = eventTypeId ? EVENT_TYPES[eventTypeId] : null
  const catchment = catchmentId ? CATCHMENTS[catchmentId] : null

  const momentSketch = useMemo(() => generateMomentSketch({
    eventType: eventTypeId, catchment: catchmentId,
    guestCount: brief.guestCount, date: brief.date,
    love, hate, budget: brief.budget,
    timeline: brief.timeline, confidentiality: brief.confidentiality,
  }), [eventTypeId, catchmentId, brief, love, hate])

  const resetAll = () => {
    setScreen('welcome'); setFlowFamily(null); setEventTypeId(null)
    setLove(''); setHate(''); setCatchmentId(null)
    setBrief({ guestCount: '', date: '', timeline: '', budget: '', confidentiality: '', notes: '' })
    setClient({ name: '', email: '', phone: '', organisation: '' })
    setMandateId(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  const submitMandate = async () => {
    const id = `TGC-EV-${Date.now().toString(36).toUpperCase()}`
    setMandateId(id)
    const payload = {
      type: 'events-production',
      mandateId: id,
      submittedAt: new Date().toISOString(),
      flowFamily, eventType: eventTypeId, catchment: catchmentId,
      love, hate, brief, client, momentSketch,
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

  const downloadMomentSketch = () => {
    const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    const header = `THE GATEKEEPERS CLUB — MOMENT SKETCH\n\nReference: ${mandateId || '[draft]'}\nPrepared: ${today}\nClient: ${client.name || '[client name]'}${client.organisation ? '\nOrganisation: ' + client.organisation : ''}\n\n${'━'.repeat(60)}\n\n`
    const footer = `\n${'━'.repeat(60)}\n\nThis is a working Moment Sketch drawn from your brief — a starting view, not a final commitment. Your Gatekeeper will refine it with you on the discovery call.\n\nThe Gatekeepers Club · thegatekeepers.club\n`
    const text = header + momentSketch + footer
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `TGC-Moment-Sketch-${mandateId || 'draft'}.txt`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const s = {
    root: { minHeight: '100vh', background: '#f5f1ea', color: '#1a1815', fontFamily: "'Inter', system-ui, sans-serif", padding: '40px 20px', lineHeight: 1.6 } as React.CSSProperties,
    container: { maxWidth: 920, margin: '0 auto' } as React.CSSProperties,
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 48, paddingBottom: 16, borderBottom: '1px solid rgba(26, 24, 21, 0.1)' } as React.CSSProperties,
    brand: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 400, letterSpacing: '0.02em', color: '#1a1815' } as React.CSSProperties,
    brandSub: { fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#8b6f3e', marginTop: 4 },
    internalToggle: { fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.15em', background: 'transparent', border: '1px solid rgba(26, 24, 21, 0.2)', color: '#5a4a2a', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit' } as React.CSSProperties,
    h1: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 48, fontWeight: 400, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.01em' } as React.CSSProperties,
    h2: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 400, lineHeight: 1.2, marginBottom: 12 } as React.CSSProperties,
    h3: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 400, lineHeight: 1.3, marginTop: 28, marginBottom: 10 } as React.CSSProperties,
    eyebrow: { fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#8b6f3e', marginBottom: 12 },
    bodyP: { fontSize: 16, marginBottom: 16, color: '#2a2720' } as React.CSSProperties,
    lead: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, lineHeight: 1.5, color: '#2a2720', marginBottom: 28, fontWeight: 400, fontStyle: 'italic' as const } as React.CSSProperties,
    card: { background: '#fdfbf6', border: '1px solid rgba(139, 111, 62, 0.2)', padding: 24, marginBottom: 16, cursor: 'pointer', transition: 'all 0.2s' } as React.CSSProperties,
    cardSelected: { borderColor: '#5a4a2a', background: '#f7efdf', boxShadow: '0 2px 8px rgba(90, 74, 42, 0.08)' } as React.CSSProperties,
    cardTitle: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 400, marginBottom: 4, color: '#1a1815' } as React.CSSProperties,
    cardDesc: { fontSize: 13, color: '#5a4a2a', lineHeight: 1.5 } as React.CSSProperties,
    button: { background: '#1a1815', color: '#f5f1ea', border: 'none', padding: '14px 28px', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.2em', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' } as React.CSSProperties,
    buttonSecondary: { background: 'transparent', color: '#1a1815', border: '1px solid rgba(26, 24, 21, 0.3)', padding: '14px 28px', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.2em', cursor: 'pointer', fontFamily: 'inherit' } as React.CSSProperties,
    buttonGold: { background: '#5a4a2a', color: '#f5f1ea', border: 'none', padding: '16px 32px', fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.2em', cursor: 'pointer', fontFamily: 'inherit' } as React.CSSProperties,
    input: { width: '100%', padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', background: '#fdfbf6', border: '1px solid rgba(26, 24, 21, 0.2)', color: '#1a1815', boxSizing: 'border-box' as const } as React.CSSProperties,
    textarea: { width: '100%', padding: '14px', fontSize: 15, fontFamily: 'inherit', background: '#fdfbf6', border: '1px solid rgba(26, 24, 21, 0.2)', color: '#1a1815', boxSizing: 'border-box' as const, resize: 'vertical' as const, minHeight: 120, lineHeight: 1.55 } as React.CSSProperties,
    label: { display: 'block', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: '#5a4a2a', marginBottom: 6, marginTop: 16 } as React.CSSProperties,
    labelInline: { fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: '#5a4a2a', marginBottom: 6 } as React.CSSProperties,
    flowBadge: { display: 'inline-block', fontSize: 9, textTransform: 'uppercase' as const, letterSpacing: '0.2em', padding: '3px 8px', marginLeft: 10, background: 'transparent', color: '#8b6f3e', border: '1px solid #8b6f3e' } as React.CSSProperties,
    momentCard: { padding: '14px 0', borderBottom: '1px dashed rgba(139, 111, 62, 0.2)' } as React.CSSProperties,
    momentLabel: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, fontWeight: 400, color: '#1a1815', marginBottom: 4 } as React.CSSProperties,
    momentIntent: { fontSize: 14, color: '#2a2720', lineHeight: 1.55 } as React.CSSProperties,
    sketchBox: { background: '#fdf6e9', borderLeft: '3px solid #8b6f3e', padding: '28px 32px', marginTop: 24, marginBottom: 24, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17, lineHeight: 1.65, color: '#1a1815', whiteSpace: 'pre-wrap' as const } as React.CSSProperties,
    list: { paddingLeft: 0, listStyle: 'none' } as React.CSSProperties,
    listItem: { padding: '6px 0 6px 20px', position: 'relative' as const, fontSize: 14, color: '#2a2720', lineHeight: 1.55 } as React.CSSProperties,
    dash: { color: '#8b6f3e', position: 'absolute' as const, left: 0 },
    progress: { display: 'flex', gap: 4, marginBottom: 36 } as React.CSSProperties,
    progressDot: { height: 2, flex: 1, background: 'rgba(26, 24, 21, 0.15)' } as React.CSSProperties,
    progressDotActive: { height: 2, flex: 1, background: '#5a4a2a' } as React.CSSProperties,
    draftNotice: { position: 'fixed' as const, bottom: 20, right: 20, background: '#1a1815', color: '#f5f1ea', padding: '12px 20px', fontSize: 12, letterSpacing: '0.1em', zIndex: 100 } as React.CSSProperties,
    internalPanel: { background: '#1a1815', color: '#f5f1ea', padding: 20, margin: '24px 0', borderLeft: '3px solid #8b6f3e', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.7 } as React.CSSProperties,
    primaryQuote: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, lineHeight: 1.35, color: '#1a1815', fontStyle: 'italic' as const, padding: '32px 40px', background: '#fdf6e9', borderLeft: '3px solid #8b6f3e', marginBottom: 32 } as React.CSSProperties,
  }

  const screens = ['welcome', 'event-type', 'love-hate', 'catchment', 'brief', 'verdict', 'client', 'confirmation']
  const currentIdx = screens.indexOf(screen)

  const renderWelcome = () => (
    <div>
      <div style={s.eyebrow}>Events Production Intelligence</div>
      <h1 style={s.h1}>Less scaffolding. More moments.</h1>
      <div style={s.primaryQuote}>
        "Every event your guests will actually remember is made of three to five moments. Everything else is scaffolding. Most planners sell scaffolding. We don't."
      </div>
      <p style={s.bodyP}>
        Tell us about the moment you're planning. We'll translate it into a formal mandate, a Moment Sketch that names what the evening will be, and put one of our Gatekeepers on it within four hours.
      </p>
      <p style={s.bodyP}>Three flow families. Choose the one that matches the occasion.</p>
      <div style={{ marginTop: 28 }}>
        {[
          { id: 'private', title: 'Private', desc: 'Dinners, celebrations, intimate concerts, seasonal moments. Hosted by you or your family.' },
          { id: 'corporate', title: 'Corporate', desc: "Founders' circles, board retreats, strategic client dinners, launches, partner summits, incentive trips. Where relationships matter more than the deliverable." },
          { id: 'mice', title: 'MICE', desc: "Conferences, exhibitions, association gatherings. Larger scale — where TGC's role is elevating craft above the industry template." },
        ].map(f => (
          <div key={f.id} style={{ ...s.card, ...(flowFamily === f.id ? s.cardSelected : {}) }}
            onClick={() => { setFlowFamily(f.id); setScreen('event-type') }}>
            <div style={s.cardTitle}>{f.title}</div>
            <div style={s.cardDesc}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderEventType = () => {
    const flowTypes = Object.entries(EVENT_TYPES).filter(([, t]) => t.flowFamily === flowFamily)
    return (
      <div>
        <button style={{ ...s.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('welcome')}>← Back</button>
        <div style={s.eyebrow}>
          {flowFamily === 'private' ? 'Private event' : flowFamily === 'corporate' ? 'Corporate event' : 'MICE event'}
        </div>
        <h2 style={s.h2}>What kind of moment?</h2>
        <p style={s.bodyP}>Each event type has its own Moment Framework — the three to five moments that define it at its best, and the patterns we'll refuse to repeat.</p>
        <div style={{ marginTop: 24 }}>
          {flowTypes.map(([id, t]) => (
            <div key={id} style={{ ...s.card, ...(eventTypeId === id ? s.cardSelected : {}) }}
              onClick={() => { setEventTypeId(id); setScreen('love-hate') }}>
              <div style={s.cardTitle}>{t.name}</div>
              <div style={s.cardDesc}>{t.sub}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderLoveHate = () => (
    <div>
      <button style={{ ...s.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('event-type')}>← Back</button>
      <div style={s.eyebrow}>The taste brief</div>
      <h2 style={s.h2}>Two questions.</h2>
      <p style={s.bodyP}>
        Most event briefs capture logistics. We'd rather capture taste — what you'd love and what you'd hate. The answers shape every subsequent decision, from the chef we approach to the light in the room.
      </p>
      <p style={s.bodyP}>
        Be specific. Be honest. <em>"Uniformed staff, orchid walls, anything choreographed"</em> is more useful than <em>"understated elegance."</em>
      </p>
      <div style={{ marginTop: 32 }}>
        <div style={s.labelInline}>What would you love?</div>
        <textarea style={s.textarea}
          placeholder="e.g., The evening should feel like dinner at a friend's house, not at an event. Intimate. Real. The food extraordinary but the service invisible. Candlelight. Maybe a musician at some point — someone we haven't heard before."
          value={love} onChange={e => setLove(e.target.value)} />
      </div>
      <div style={{ marginTop: 24 }}>
        <div style={s.labelInline}>What would you hate?</div>
        <textarea style={s.textarea}
          placeholder="e.g., Uniformed staff. Orchid arrangements. Tasting menus with amuse-bouches. Anything that feels choreographed or corporate. Printed menus. Event photographers."
          value={hate} onChange={e => setHate(e.target.value)} />
      </div>
      <div style={{ marginTop: 32 }}>
        <button style={s.button} onClick={() => setScreen('catchment')} disabled={!love.trim()}>Continue →</button>
      </div>
      <p style={{ fontSize: 12, color: '#8b6f3e', marginTop: 12, fontStyle: 'italic' }}>
        "What would you hate" is optional — but it's usually the more useful answer.
      </p>
    </div>
  )

  const renderCatchment = () => (
    <div>
      <button style={{ ...s.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('love-hate')}>← Back</button>
      <div style={s.eyebrow}>Where</div>
      <h2 style={s.h2}>Which catchment?</h2>
      <p style={s.bodyP}>
        Ten European supplier catchments. Each is a network of chefs, florists, musicians, and venues we know — not just a geography. Choose the one your event will live in.
      </p>
      <div style={{ marginTop: 24 }}>
        {Object.entries(CATCHMENTS).map(([id, c]) => (
          <div key={id} style={{ ...s.card, ...(catchmentId === id ? s.cardSelected : {}) }}
            onClick={() => { setCatchmentId(id); setScreen('brief') }}>
            <div style={s.cardTitle}>{c.name}</div>
            <div style={s.cardDesc}>{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderBrief = () => {
    const budgetOptions = [
      { value: 'five-figure', label: 'Five-figure (€10k–100k)' },
      { value: 'mid-six-figure', label: 'Mid six-figure (€100k–500k)' },
      { value: 'high-six-figure', label: 'High six-figure (€500k–1M)' },
      { value: 'seven-figure', label: 'Seven-figure (€1M+)' },
      { value: 'open', label: 'Open — let\'s discuss' },
    ]
    const timelineOptions = [
      { value: 'urgent', label: 'Under 4 weeks' },
      { value: 'tight', label: '4–12 weeks' },
      { value: 'standard', label: '3–6 months' },
      { value: 'strategic', label: '6+ months' },
    ]
    const confidentialityOptions = [
      { value: 'open', label: 'Open — standard event' },
      { value: 'discreet', label: 'Discreet — no public mention, private invitations' },
      { value: 'ultra-private', label: 'Ultra-private — maximum discretion, NDAs for staff' },
    ]
    return (
      <div>
        <button style={{ ...s.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('catchment')}>← Back</button>
        <div style={s.eyebrow}>The brief</div>
        <h2 style={s.h2}>The practical layer.</h2>
        <p style={s.bodyP}>Five questions. You can come back and refine; we save as you go.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={s.label}>Guest count (approx.)</label>
            <input type="number" style={s.input} value={brief.guestCount}
              placeholder={`e.g., ${eventType?.guestCount.sweet || 30}`}
              onChange={e => setBrief({ ...brief, guestCount: e.target.value })} />
          </div>
          <div>
            <label style={s.label}>Date or date range</label>
            <input type="text" style={s.input} value={brief.date}
              placeholder="e.g., late June, or 14 September 2026"
              onChange={e => setBrief({ ...brief, date: e.target.value })} />
          </div>
        </div>
        <label style={s.label}>Timeline</label>
        <select style={s.input} value={brief.timeline} onChange={e => setBrief({ ...brief, timeline: e.target.value })}>
          <option value="">Select…</option>
          {timelineOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <label style={s.label}>Budget framing</label>
        <select style={s.input} value={brief.budget} onChange={e => setBrief({ ...brief, budget: e.target.value })}>
          <option value="">Select…</option>
          {budgetOptions.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
        <p style={{ fontSize: 12, color: '#8b6f3e', marginTop: 6, fontStyle: 'italic' }}>
          We don't price events in a form — the actual number is a human conversation. This sets the scale we'll work within.
        </p>
        <label style={s.label}>Confidentiality</label>
        <select style={s.input} value={brief.confidentiality} onChange={e => setBrief({ ...brief, confidentiality: e.target.value })}>
          <option value="">Select…</option>
          {confidentialityOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <label style={s.label}>Anything else we should know (optional)</label>
        <textarea rows={3} style={{ ...s.textarea, minHeight: 80 }} value={brief.notes}
          placeholder="e.g., the honouree is publicity-shy; the venue is already decided; one senior guest has specific dietary needs"
          onChange={e => setBrief({ ...brief, notes: e.target.value })} />
        <div style={{ marginTop: 32 }}>
          <button style={s.button} onClick={() => setScreen('verdict')}
            disabled={!brief.guestCount || !brief.timeline || !brief.budget}>
            See the Moment Sketch →
          </button>
        </div>
      </div>
    )
  }

  const renderVerdict = () => {
    if (!eventType || !catchment) return null
    return (
      <div>
        <button style={{ ...s.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('brief')}>← Back</button>
        <div style={s.eyebrow}>Moment Sketch · preview</div>
        <h2 style={s.h2}>{eventType.name} · {catchment.name}</h2>
        <p style={{ fontSize: 14, color: '#5a4a2a', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {eventType.sub}
          <span style={s.flowBadge}>
            {eventType.flowFamily === 'private' ? 'Private' : eventType.flowFamily === 'corporate' ? 'Corporate' : 'MICE'}
          </span>
        </p>
        <p style={s.lead}>
          This is a working Moment Sketch drawn from your brief. Read it as a starting view — your Gatekeeper will refine it with you on the discovery call.
        </p>
        <div style={s.sketchBox}>{momentSketch}</div>

        <h3 style={s.h3}>The canonical moments of this event type</h3>
        <p style={{ fontSize: 13, color: '#5a4a2a', fontStyle: 'italic', marginBottom: 16 }}>The full framework TGC applies — we'll choose three to five to concentrate around, based on your brief.</p>
        <div>
          {eventType.moments.map((m, i) => (
            <div key={i} style={s.momentCard}>
              <div style={s.momentLabel}>{m.label}</div>
              <div style={s.momentIntent}>{m.intent}</div>
            </div>
          ))}
        </div>

        <h3 style={s.h3}>What the industry gets wrong</h3>
        <ul style={s.list}>
          {eventType.industryMistakes.map((m, i) => <li key={i} style={s.listItem}><span style={s.dash}>—</span>{m}</li>)}
        </ul>

        <h3 style={s.h3}>Loud vs quiet · how we'd think about this</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          <div>
            <div style={s.eyebrow}>The loud version (to avoid)</div>
            <p style={{ fontSize: 14, color: '#2a2720', lineHeight: 1.55 }}>{eventType.loud}</p>
          </div>
          <div>
            <div style={s.eyebrow}>The quiet version (what we'll build)</div>
            <p style={{ fontSize: 14, color: '#2a2720', lineHeight: 1.55 }}>{eventType.quiet}</p>
          </div>
        </div>

        <h3 style={s.h3}>What the brochure won't tell you</h3>
        <ul style={s.list}>
          {eventType.realities.map((r, i) => <li key={i} style={s.listItem}><span style={s.dash}>—</span>{r}</li>)}
        </ul>

        <h3 style={s.h3}>Commercial framing</h3>
        <div style={{ ...s.card, background: '#f7efdf', cursor: 'default' }}>
          <p style={{ fontSize: 15, color: '#2a2720', margin: 0, lineHeight: 1.6 }}>{eventType.scale}</p>
          <p style={{ fontSize: 13, color: '#5a4a2a', marginTop: 12, marginBottom: 0, fontStyle: 'italic', lineHeight: 1.55 }}>
            TGC operates on brief + match + oversight. Our fee is a function of mandate complexity, not a percentage of total event cost. We'll discuss specifics on the discovery call.
          </p>
        </div>

        {internalView && (
          <div style={s.internalPanel}>
            <div style={{ color: '#8b6f3e', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.15em' }}>// INTERNAL VIEW — TGC GATEKEEPER ONLY</div>
            <div>Event type ID: {eventTypeId}</div>
            <div>Catchment: {catchmentId}</div>
            <div>Catchment coverage: {catchment.coverage}</div>
            <div>Catchment season: {catchment.season}</div>
            <div>Venue archetypes: {catchment.venues}</div>
            <div>Sweet-spot guest count: {eventType.guestCount.sweet}</div>
            <div>Client stated: {brief.guestCount} guests</div>
            <div>Timeline: {brief.timeline}</div>
            <div>Budget framing: {brief.budget}</div>
            <div>Confidentiality: {brief.confidentiality}</div>
            <div style={{ marginTop: 12, color: '#8b6f3e' }}>── Supplier archetypes ──</div>
            {Object.entries(eventType.suppliers).map(([k, v]) => (
              <div key={k}>• {k}: {v}</div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <button style={s.button} onClick={() => setScreen('client')}>Continue — your details →</button>
        </div>
      </div>
    )
  }

  const renderClient = () => (
    <div>
      <button style={{ ...s.buttonSecondary, marginBottom: 20 }} onClick={() => setScreen('verdict')}>← Back</button>
      <div style={s.eyebrow}>Your details</div>
      <h2 style={s.h2}>One last thing.</h2>
      <p style={s.bodyP}>So we can get a Gatekeeper on this within four hours and send you the Moment Sketch as a document.</p>
      <label style={s.label}>Name</label>
      <input type="text" style={s.input} value={client.name} onChange={e => setClient({ ...client, name: e.target.value })} />
      <label style={s.label}>Email</label>
      <input type="email" style={s.input} value={client.email} onChange={e => setClient({ ...client, email: e.target.value })} />
      <label style={s.label}>Phone (with country code)</label>
      <input type="tel" style={s.input} value={client.phone} placeholder="+33 6 XX XX XX XX" onChange={e => setClient({ ...client, phone: e.target.value })} />
      <label style={s.label}>Organisation (optional — for corporate and MICE mandates)</label>
      <input type="text" style={s.input} value={client.organisation} onChange={e => setClient({ ...client, organisation: e.target.value })} />
      <p style={{ fontSize: 12, color: '#5a4a2a', marginTop: 24, fontStyle: 'italic', lineHeight: 1.6 }}>
        We'll acknowledge within four hours, send a full considered response within twenty-four, and arrange a discovery call within seventy-two. Your brief is visible only to the specific Gatekeeper assigned to you.
      </p>
      <div style={{ marginTop: 32 }}>
        <button style={s.buttonGold} onClick={submitMandate} disabled={!client.name || !client.email}>
          Submit brief
        </button>
      </div>
    </div>
  )

  const renderConfirmation = () => (
    <div>
      <div style={s.eyebrow}>Brief received</div>
      <h2 style={s.h2}>Thank you, {client.name?.split(' ')[0]}.</h2>
      <p style={s.lead}>Your brief is with us. A Gatekeeper has it in hand now.</p>
      <div style={{ ...s.card, background: '#f7efdf', cursor: 'default' }}>
        <div style={s.eyebrow}>Mandate reference</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: '#1a1815', margin: '4px 0 16px' }}>{mandateId}</div>
        <div style={{ fontSize: 14, color: '#5a4a2a', marginBottom: 8 }}>
          <strong style={{ color: '#1a1815' }}>{eventType?.name}</strong> · {catchment?.name} · {brief.guestCount} guests · {brief.date}
        </div>
      </div>
      <h3 style={s.h3}>Your Moment Sketch</h3>
      <div style={s.sketchBox}>{momentSketch}</div>
      <h3 style={s.h3}>What happens next</h3>
      <ul style={s.list}>
        <li style={s.listItem}><span style={s.dash}>—</span><strong>Within 4 hours:</strong> your assigned Gatekeeper will acknowledge receipt personally</li>
        <li style={s.listItem}><span style={s.dash}>—</span><strong>Within 24 hours:</strong> a full considered response with a refined Moment Sketch</li>
        <li style={s.listItem}><span style={s.dash}>—</span><strong>Within 72 hours:</strong> a discovery call to walk through the Sketch and refine</li>
        <li style={s.listItem}><span style={s.dash}>—</span><strong>Within two weeks:</strong> signed mandate and supplier engagement begins</li>
      </ul>
      <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button style={s.button} onClick={downloadMomentSketch}>Download Moment Sketch</button>
        <a href={CALENDAR_URL} target="_blank" rel="noopener noreferrer"
          style={{ ...s.buttonGold, textDecoration: 'none', display: 'inline-block' }}>
          Book discovery call
        </a>
        <button style={s.buttonSecondary} onClick={resetAll}>Start another brief</button>
      </div>
    </div>
  )

  const renderScreen = () => {
    switch (screen) {
      case 'welcome': return renderWelcome()
      case 'event-type': return renderEventType()
      case 'love-hate': return renderLoveHate()
      case 'catchment': return renderCatchment()
      case 'brief': return renderBrief()
      case 'verdict': return renderVerdict()
      case 'client': return renderClient()
      case 'confirmation': return renderConfirmation()
      default: return renderWelcome()
    }
  }

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        input:focus, select:focus, textarea:focus { outline: none; border-color: #5a4a2a; }
        button:hover:not(:disabled) { opacity: 0.85; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%235a4a2a' fill='none' stroke-width='1.5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
      `}</style>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <div style={s.brand}>The Gatekeepers Club</div>
            <div style={s.brandSub}>Events Production Intelligence · v1</div>
          </div>
          <button style={s.internalToggle} onClick={() => setInternalView(!internalView)}>
            {internalView ? '↗ client view' : '↙ internal view'}
          </button>
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

export default function EventsProductionPage() {
  return <TGCEventsProduction />
}
