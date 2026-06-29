/* eslint-disable react/no-unescaped-entities */
'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'

// ── TGC RELOCATION · SCOUTING INTELLIGENCE (Part 1, lifestyle) ───────────────
// Clickable-first conversational intake. Captures the lifestyle picture so we
// can hand back a tailored Scouting Dossier (3 second-base options) within 48h.
// No instant recommendations: the value is the back-of-house work.

type Val = string | string[]
type Data = Record<string, Val>
interface Client { firstName: string; lastName: string; email: string; phone: string; anything: string }

type QType = 'single' | 'multi' | 'multimax' | 'text'
interface Opt { value: string; label: string; note?: string }
interface Q {
  id: string
  type: QType
  prompt: string
  help?: string
  options?: Opt[]
  optional?: boolean
  max?: number
  placeholder?: string
}
interface Chapter { key: string; eyebrow: string; title: string; intro?: string; questions: Q[] }

// ── THE QUESTIONS ────────────────────────────────────────────────────────────
const CHAPTERS: Chapter[] = [
  {
    key: 'picture', eyebrow: 'The picture', title: 'What is drawing you to France?',
    intro: 'A relaxed start. Tap whatever rings true, and add a line if you like.',
    questions: [
      { id: 'whyFrance', type: 'multi', prompt: 'What is pulling you here?', options: [
        { value: 'pace', label: 'A gentler pace of life' },
        { value: 'food', label: 'Food, wine and markets' },
        { value: 'culture', label: 'Culture and history' },
        { value: 'family', label: 'A better setting for the family' },
        { value: 'health', label: 'Health and quality of life' },
        { value: 'adventure', label: 'A change and an adventure' },
        { value: 'business', label: 'Work or a project here' },
        { value: 'roots', label: 'Ties or roots to France' },
      ] },
      { id: 'whyFranceText', type: 'text', prompt: 'Anything you want to add, in your own words?', optional: true,
        placeholder: 'What are you moving toward, or away from?' },
      { id: 'horizon', type: 'single', prompt: 'How are you thinking about this move?', options: [
        { value: 'trial-year', label: 'A trial year', note: 'Test it, see how it feels' },
        { value: 'long-stay', label: 'A long stay', note: 'Several years in mind' },
        { value: 'permanent', label: 'A permanent move', note: 'Putting down roots' },
        { value: 'unsure', label: 'Still deciding', note: 'Part of what the trip is for' },
      ] },
    ],
  },
  {
    key: 'family', eyebrow: 'The family', title: 'Who is making the move?',
    questions: [
      { id: 'who', type: 'single', prompt: 'Your household', options: [
        { value: 'solo', label: 'Just me' },
        { value: 'couple', label: 'A couple' },
        { value: 'family', label: 'Family with children' },
      ] },
      { id: 'childrenAges', type: 'multi', prompt: 'Ages along for the ride', help: 'Skip if not applicable.', optional: true, options: [
        { value: 'expecting', label: 'Expecting' },
        { value: 'under1', label: 'Baby under 1' },
        { value: '1-3', label: '1 to 3' },
        { value: '4-6', label: '4 to 6' },
        { value: '7-11', label: '7 to 11' },
        { value: '12plus', label: '12 and over' },
      ] },
      { id: 'work', type: 'multi', prompt: 'Will either of you be working during the stay?', optional: true, options: [
        { value: 'not-working', label: 'Not working' },
        { value: 'remote-us', label: 'Remote, US hours' },
        { value: 'remote-flex', label: 'Remote, flexible hours' },
        { value: 'business', label: 'Starting something here' },
        { value: 'travel', label: 'Travelling for work' },
      ] },
      { id: 'schooling', type: 'single', prompt: 'How much should schooling shape the search?', help: 'Even if it is years away.', options: [
        { value: 'not-yet', label: 'Not a factor yet' },
        { value: 'eventually', label: 'Worth keeping in mind' },
        { value: 'important', label: 'Important' },
        { value: 'critical', label: 'A deciding factor' },
      ] },
    ],
  },
  {
    key: 'setting', eyebrow: 'The setting', title: 'Where do you picture yourselves?',
    intro: 'We lean toward cities and lively towns, with the countryside close at hand.',
    questions: [
      { id: 'feel', type: 'single', prompt: 'The feel of the place you would weigh against Paris', options: [
        { value: 'big-city', label: 'A big city', note: 'Energy, culture, everything to hand' },
        { value: 'mid-city', label: 'An elegant mid-size city', note: 'Walkable, characterful, easy' },
        { value: 'market-town', label: 'A lively market town', note: 'Smaller, with a real centre' },
        { value: 'coastal-town', label: 'A coastal town', note: 'By the sea' },
        { value: 'countryside', label: 'The countryside', note: 'Quieter, more space' },
      ] },
      { id: 'climate', type: 'single', prompt: 'The climate you want', options: [
        { value: 'warm-sunny', label: 'Warm and sunny' },
        { value: 'mediterranean', label: 'Mediterranean' },
        { value: 'four-seasons', label: 'Four real seasons' },
        { value: 'mild-green', label: 'Mild and green' },
      ] },
      { id: 'landscapes', type: 'multi', prompt: 'What would you love nearby?', optional: true, options: [
        { value: 'sea', label: 'The sea' },
        { value: 'mountains', label: 'Mountains' },
        { value: 'vineyards', label: 'Vineyards' },
        { value: 'lakes', label: 'Lakes' },
        { value: 'forest', label: 'Forest' },
        { value: 'river', label: 'A river' },
      ] },
      { id: 'walkability', type: 'single', prompt: 'Day to day, how do you want to get around?', options: [
        { value: 'no-car', label: 'On foot, no car' },
        { value: 'occasional-car', label: 'Mostly walking, a car sometimes' },
        { value: 'happy-drive', label: 'Happy to drive' },
      ] },
    ],
  },
  {
    key: 'taste', eyebrow: 'Daily life and taste', title: 'What makes a place feel right?',
    questions: [
      { id: 'priorities', type: 'multi', prompt: 'What matters most day to day?', help: 'Pick as many as you like.', options: [
        { value: 'food', label: 'Food and markets' },
        { value: 'arts', label: 'Arts and culture' },
        { value: 'sport', label: 'Sport and the outdoors' },
        { value: 'wellness', label: 'Wellness' },
        { value: 'social', label: 'A social scene' },
        { value: 'history', label: 'History and architecture' },
        { value: 'cafes', label: 'Cafés and slow mornings' },
        { value: 'nature', label: 'Nature on the doorstep' },
      ] },
      { id: 'sports', type: 'multi', prompt: 'Which of these do you actually want to do there?', optional: true, options: [
        { value: 'golf', label: 'Golf' }, { value: 'sailing', label: 'Sailing' },
        { value: 'tennis', label: 'Tennis' }, { value: 'padel', label: 'Padel' },
        { value: 'skiing', label: 'Skiing' }, { value: 'cycling', label: 'Cycling' },
        { value: 'hiking', label: 'Hiking' }, { value: 'riding', label: 'Riding' },
        { value: 'surf', label: 'Surf' }, { value: 'gym', label: 'Gym and studios' },
      ] },
      { id: 'amenities', type: 'multi', prompt: 'Your non-negotiable everyday amenities', optional: true, options: [
        { value: 'healthcare', label: 'Quality healthcare nearby' },
        { value: 'intl-grocery', label: 'International groceries' },
        { value: 'coffee', label: 'Good coffee' },
        { value: 'gym', label: 'A proper gym or studio' },
        { value: 'coworking', label: 'Coworking or fast internet' },
        { value: 'parks', label: 'Parks and playgrounds' },
        { value: 'nightlife', label: 'Evening life' },
      ] },
      { id: 'amenitiesText', type: 'text', prompt: 'Anything else that has to be within reach?', optional: true, placeholder: 'A particular community, a specialist, a kind of school...' },
    ],
  },
  {
    key: 'community', eyebrow: 'Community and language', title: 'How do you want to settle in?',
    questions: [
      { id: 'community', type: 'single', prompt: 'The community around you', options: [
        { value: 'international', label: 'An international circle', note: 'Familiar faces, English easy to find' },
        { value: 'mix', label: 'A mix of both' },
        { value: 'immersion', label: 'Full immersion', note: 'French life, French neighbours' },
      ] },
      { id: 'frenchLevel', type: 'single', prompt: 'Your French today', options: [
        { value: 'none', label: 'None yet' },
        { value: 'a-little', label: 'A little' },
        { value: 'conversational', label: 'Conversational' },
        { value: 'fluent', label: 'Fluent' },
      ] },
      { id: 'learn', type: 'single', prompt: 'Appetite to learn or improve', options: [
        { value: 'keen', label: 'Keen' },
        { value: 'some', label: 'Some' },
        { value: 'minimal', label: 'Minimal for now' },
      ] },
    ],
  },
  {
    key: 'access', eyebrow: 'Paris, and the alternative', title: 'How much does Paris itself pull at you?',
    intro: 'You already love Paris. This trip also lets you discover one real alternative, so that wherever you land is a choice made with open eyes. This helps us weigh that.',
    questions: [
      { id: 'parisLeaning', type: 'single', prompt: 'Going into the trip, where does your heart sit?', options: [
        { value: 'love-paris', label: 'We love Paris, but want to be sure' },
        { value: 'open', label: 'Genuinely open, surprise us' },
        { value: 'hope-better', label: 'Half hoping to find somewhere we love even more' },
      ] },
      { id: 'parisProximity', type: 'single', prompt: 'If you settled away from Paris, how close would you want to stay?', options: [
        { value: 'under2', label: 'Within 2 hours by train' },
        { value: '2-3', label: '2 to 3 hours is fine' },
        { value: '3-4', label: '3 to 4 hours, no issue' },
        { value: 'no-object', label: 'Distance is no object' },
      ] },
      { id: 'parisReturn', type: 'single', prompt: 'And how often would you want to be back in Paris?', options: [
        { value: 'often', label: 'Often, it is part of life' },
        { value: 'monthly', label: 'Monthly or so' },
        { value: 'occasionally', label: 'Now and then' },
        { value: 'rarely', label: 'Rarely, once settled elsewhere' },
      ] },
      { id: 'airport', type: 'single', prompt: 'A nearby airport with good links to the US', options: [
        { value: 'essential', label: 'Essential' },
        { value: 'nice', label: 'Nice to have' },
        { value: 'not-important', label: 'Not important' },
      ] },
    ],
  },
  {
    key: 'home', eyebrow: 'The home', title: 'And the home itself?',
    questions: [
      { id: 'homeType', type: 'single', prompt: 'What feels right?', options: [
        { value: 'apt-character', label: 'An apartment with character' },
        { value: 'apt-modern', label: 'A modern apartment' },
        { value: 'house-garden', label: 'A house with a garden' },
        { value: 'townhouse', label: 'A townhouse' },
      ] },
      { id: 'rentBuy', type: 'single', prompt: 'Rent or buy?', options: [
        { value: 'rent', label: 'Rent' },
        { value: 'rent-then-buy', label: 'Rent first, then buy' },
        { value: 'buy', label: 'Buy' },
        { value: 'undecided', label: 'Undecided' },
      ] },
      { id: 'outdoor', type: 'single', prompt: 'Outdoor space', options: [
        { value: 'essential', label: 'Essential' },
        { value: 'preferred', label: 'Preferred' },
        { value: 'not-fussed', label: 'Not fussed' },
      ] },
    ],
  },
  {
    key: 'budget', eyebrow: 'Budget', title: 'A sense of the numbers',
    intro: 'Rough is fine. It helps us match places that fit the life you want to live, not just the postcard.',
    questions: [
      { id: 'monthlyLifestyle', type: 'single', prompt: 'Monthly lifestyle budget, excluding housing', help: 'Car and transport, groceries, dining, childcare and the rest.', options: [
        { value: 'under3k', label: 'Under €3k' },
        { value: '3-6k', label: '€3k to €6k' },
        { value: '6-10k', label: '€6k to €10k' },
        { value: '10k-plus', label: '€10k and up' },
        { value: 'discuss', label: 'Rather discuss' },
      ] },
      { id: 'homeBudget', type: 'single', prompt: 'Budget for the second-base home', help: 'Whichever way you are leaning.', options: [
        { value: 'rent-2-4', label: 'Rent, €2k to €4k per month' },
        { value: 'rent-4-7', label: 'Rent, €4k to €7k per month' },
        { value: 'rent-7-plus', label: 'Rent, €7k and up per month' },
        { value: 'buy-under1', label: 'Buy, under €1M' },
        { value: 'buy-1-2', label: 'Buy, €1M to €2M' },
        { value: 'buy-2-plus', label: 'Buy, €2M and up' },
        { value: 'discuss', label: 'Rather discuss' },
      ] },
      { id: 'carTrip', type: 'single', prompt: 'A car during the scouting trip?', options: [
        { value: 'yes', label: 'Yes' },
        { value: 'prefer-not', label: 'Prefer not' },
        { value: 'undecided', label: 'Undecided' },
      ] },
    ],
  },
  {
    key: 'priorities', eyebrow: 'Priorities and trade-offs', title: 'The honest part',
    intro: 'No place has everything. This is where we learn what truly matters, so the recommendations are real rather than a wish list.',
    questions: [
      { id: 'mustHaves', type: 'multimax', max: 5, prompt: 'Pick your top five must-haves', help: 'Up to five.', options: [
        { value: 'warm-climate', label: 'A warm climate' },
        { value: 'near-paris', label: 'Close to Paris' },
        { value: 'walkable', label: 'Walkable daily life' },
        { value: 'sea', label: 'The sea nearby' },
        { value: 'intl-community', label: 'An international community' },
        { value: 'great-food', label: 'A great food scene' },
        { value: 'good-schools', label: 'Good schools in reach' },
        { value: 'healthcare', label: 'Excellent healthcare' },
        { value: 'outdoors', label: 'The outdoors on the doorstep' },
        { value: 'culture', label: 'Culture and the arts' },
        { value: 'airport', label: 'An easy airport' },
        { value: 'space', label: 'Space and a garden' },
        { value: 'safe-quiet', label: 'Safe and quiet' },
        { value: 'value', label: 'Good value for money' },
      ] },
      { id: 'flexText', type: 'text', prompt: 'Where will you flex, and where will you not?',
        help: 'Honestly: warm and coastal usually means farther from Paris; a small charming town means fewer amenities and schools; a big international set means less immersion.',
        placeholder: 'For example: happy to be 3 hours from Paris for real warmth, but walkability is non-negotiable.' },
      { id: 'instantNo', type: 'text', prompt: 'Anything that is an instant no?', optional: true, placeholder: 'A climate, a setting, a vibe you know is not for you.' },
    ],
  },
  {
    key: 'trip', eyebrow: 'The scouting trip', title: 'How the three months take shape',
    questions: [
      { id: 'startMonth', type: 'single', prompt: 'When does the trip begin?', options: [
        { value: 'aug', label: 'August' }, { value: 'sep', label: 'September' },
        { value: 'oct', label: 'October' }, { value: 'flexible', label: 'Flexible' },
      ] },
      { id: 'tripLength', type: 'single', prompt: 'How long, in all?', options: [
        { value: '1m', label: 'Around a month' },
        { value: '2m', label: 'Around two months' },
        { value: '3m', label: 'Around three months' },
        { value: '3m-plus', label: 'Three months or more' },
      ] },
      { id: 'parisFirst', type: 'single', prompt: 'The Paris stay lasts...', options: [
        { value: '4w', label: 'Four weeks' },
        { value: '6w', label: 'Six weeks' },
        { value: '8w', label: 'Eight weeks' },
        { value: 'flexible', label: 'Flexible' },
      ] },
      { id: 'secondBaseTime', type: 'single', prompt: 'Time to explore the alternative', options: [
        { value: '1-2w', label: '1 to 2 weeks' },
        { value: '3-4w', label: '3 to 4 weeks' },
        { value: '5-6w', label: '5 to 6 weeks' },
        { value: 'flexible', label: 'Flexible' },
      ] },
      { id: 'successText', type: 'text', prompt: 'What would make this trip a success, in one line?', placeholder: 'When we look back in December, what happened?' },
    ],
  },
]

const TOTAL = CHAPTERS.length + 1 // chapters + contact

// ── PREFILLS (for William) ─────────────────────────────────────────────────
const INITIAL_DATA: Data = {
  who: 'family',
  childrenAges: ['under1'],
  tripLength: '3m',
  parisFirst: '6w',
  startMonth: 'sep',
}
const INITIAL_CLIENT: Client = {
  firstName: 'William', lastName: '', email: 'williambamf@gmail.com', phone: '+1 (310) 598-8036', anything: '',
}

const STORAGE_KEY = 'tgc-relocation-scouting-draft'

// ── STYLES ────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Lato:ital,wght@0,300;0,400;0,700;1,400&display=swap');
  .tgc-serif { font-family: 'Poppins', sans-serif; }
  .tgc-sans  { font-family: 'Lato', sans-serif; }
  .tgc-mono  { font-family: 'Lato', sans-serif; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }
  .chip { display: inline-flex; align-items: center; gap: 0.4rem; transition: all 0.15s ease; cursor: pointer; border-radius: 999px; border: 1.5px solid #d8dcd9; padding: 0.6rem 1.05rem; background: #fff; font-family: 'Lato', sans-serif; font-size: 0.92rem; color: #1a1815; user-select: none; }
  .chip:hover { border-color: #0e4f51; background: #f6faf9; }
  .chip.sel { border-color: #0e4f51; background: #0e4f51; color: #fff; }
  .chip.dim { opacity: 0.4; cursor: not-allowed; }
  .chip .tick { font-size: 0.7rem; }
  .opt-card { transition: all 0.15s ease; cursor: pointer; border-radius: 8px; border: 1.5px solid #e2e6e3; padding: 0.95rem 1.1rem; background: #fff; }
  .opt-card:hover { border-color: #0e4f51; }
  .opt-card.sel { border-color: #0e4f51; background: #f0f7f7; }
  .btn-p { background: #0e4f51; color: #fff; border: none; padding: 0.85rem 2rem; font-family: 'Lato', sans-serif; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; cursor: pointer; border-radius: 4px; transition: background 0.2s; }
  .btn-p:hover { background: #0a3a3c; }
  .btn-p:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-g { background: transparent; color: #0e4f51; border: 1.5px solid #0e4f51; padding: 0.75rem 1.75rem; font-family: 'Lato', sans-serif; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; cursor: pointer; border-radius: 4px; transition: all 0.2s; text-decoration: none; display: inline-block; }
  .btn-g:hover { background: #f0f7f7; }
  input, textarea { font-family: 'Lato', sans-serif; font-size: 0.95rem; border: 1px solid #d1d5db; border-radius: 4px; padding: 0.7rem 0.9rem; width: 100%; box-sizing: border-box; background: #fff; color: #1a1815; }
  input:focus, textarea:focus { outline: none; border-color: #0e4f51; }
  .field-label { font-family: 'Lato', sans-serif; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #6b7280; display: block; margin-bottom: 0.4rem; }
  .back-btn { background: none; border: none; cursor: pointer; color: #9ca3af; font-family: 'Lato', sans-serif; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; margin-bottom: 1.6rem; padding: 0; }
  .back-btn:hover { color: #0e4f51; }
  .progress-track { height: 3px; background: #e6e9e7; border-radius: 2px; overflow: hidden; margin-bottom: 2.4rem; }
  .progress-fill { height: 100%; background: #c8aa4a; transition: width 0.3s ease; }
  .q-prompt { font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 1.15rem; color: #1a1815; margin-bottom: 0.3rem; }
  .q-help { font-family: 'Lato', sans-serif; font-size: 0.85rem; color: #8a8f8c; margin-bottom: 1rem; line-height: 1.5; }
`

// ── COMPONENT ────────────────────────────────────────────────────────────
type Screen = 'welcome' | 'chapter' | 'contact' | 'submitted'

export default function ScoutingPage() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [ci, setCi] = useState(0) // chapter index
  const [data, setData] = useState<Data>(INITIAL_DATA)
  const [client, setClient] = useState<Client>(INITIAL_CLIENT)
  const [submitting, setSubmitting] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // restore draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const p = JSON.parse(raw)
        if (p.data) setData(p.data)
        if (p.client) setClient(p.client)
      }
    } catch { /* ignore */ }
    setLoaded(true)
  }, [])
  // persist draft
  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, client })) } catch { /* ignore */ }
  }, [data, client, loaded])

  function setSingle(id: string, v: string) {
    setData(d => ({ ...d, [id]: d[id] === v ? '' : v }))
  }
  function toggleMulti(id: string, v: string, max?: number) {
    setData(d => {
      const cur = Array.isArray(d[id]) ? (d[id] as string[]) : []
      if (cur.includes(v)) return { ...d, [id]: cur.filter(x => x !== v) }
      if (max && cur.length >= max) return d
      return { ...d, [id]: [...cur, v] }
    })
  }
  function setText(id: string, v: string) { setData(d => ({ ...d, [id]: v })) }

  function chapterComplete(ch: Chapter): boolean {
    return ch.questions.every(q => {
      if (q.optional) return true
      const v = data[q.id]
      if (q.type === 'multi' || q.type === 'multimax') return Array.isArray(v) && v.length > 0
      return typeof v === 'string' && v.trim().length > 0
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await fetch('/api/intelligence/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'relocation-scouting',
          brief: data,
          summary: buildSummary(),
          client: { ...client, name: `${client.firstName} ${client.lastName}`.trim(), message: client.anything },
          submittedAt: new Date().toISOString(),
        }),
      })
      setScreen('submitted')
      try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    } catch {
      alert('Something went wrong. Please email jeeves@thegatekeepers.club directly.')
    } finally {
      setSubmitting(false)
    }
  }

  // Ordered, human-readable answers for the back-of-house brief email.
  function buildSummary(): { chapter: string; rows: { q: string; a: string }[] }[] {
    const out: { chapter: string; rows: { q: string; a: string }[] }[] = []
    for (const ch of CHAPTERS) {
      const rows: { q: string; a: string }[] = []
      for (const q of ch.questions) {
        const v = data[q.id]
        let a = ''
        if (Array.isArray(v)) {
          a = v.map(val => q.options?.find(o => o.value === val)?.label || val).join(', ')
        } else if (typeof v === 'string' && v.trim()) {
          a = q.options?.find(o => o.value === v)?.label || v.trim()
        }
        if (a) rows.push({ q: q.prompt, a })
      }
      if (rows.length) out.push({ chapter: ch.eyebrow, rows })
    }
    return out
  }

  const shell = (children: React.ReactNode) => (
    <div style={{ minHeight: '100vh', background: '#F9F8F5', color: '#1a1815', fontFamily: "'Lato', sans-serif" }}>
      <style>{CSS}</style>
      <header style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="https://thegatekeepers.club" style={{ textDecoration: 'none' }}>
          <span className="tgc-serif" style={{ fontSize: '1rem', color: '#0e4f51' }}>The Gatekeepers Club</span>
        </a>
        <span className="tgc-mono" style={{ color: '#c8aa4a' }}>Relocation · Scouting</span>
      </header>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(2.5rem, 6vw, 4.5rem) 2.5rem' }}>
        {children}
      </div>
    </div>
  )

  // ── WELCOME ───────────────────────────────────────────────────────────
  if (screen === 'welcome') return shell(
    <>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1.5rem' }}>Relocation Intelligence · The Scouting Trip</p>
      <h1 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(2.3rem, 6vw, 4rem)', lineHeight: 1.07, letterSpacing: '-0.01em', marginBottom: '1.75rem', maxWidth: '640px' }}>
        Let's design your<br />discovery of France.
      </h1>
      <p className="tgc-sans" style={{ fontSize: 'clamp(1.02rem, 1.8vw, 1.25rem)', color: '#6b7280', maxWidth: '560px', lineHeight: 1.65, marginBottom: '2.5rem' }}>
        You already love Paris, but it is the only France you know. This trip is about two things: living Paris as a local, and discovering what else the country offers, so that where you settle becomes a real, informed choice. Tell us how you want to live and we will craft a scouting plan with three places worth weighing against Paris. It takes about five minutes, and most of it is just tapping.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.1rem', marginBottom: '3rem' }}>
        {[
          { label: 'Relaxed', text: 'Mostly clickable. Add a few words only where it helps. No wrong answers.' },
          { label: 'Considered', text: 'We read every answer, then research properly. No instant list of the usual suspects.' },
          { label: 'Within 48 hours', text: 'You receive a tailored response and a Scouting Dossier with three second-base options.' },
        ].map(item => (
          <div key={item.label} style={{ padding: '1.4rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '0.6rem' }}>{item.label}</p>
            <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.86rem', lineHeight: 1.6, color: '#6b7280' }}>{item.text}</p>
          </div>
        ))}
      </div>
      <button className="btn-p" onClick={() => { setScreen('chapter'); setCi(0) }}>Begin →</button>
      <p style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: '#9ca3af' }}>
        <a href="/intelligence/relocation" style={{ color: '#9ca3af', textDecoration: 'none' }}>← Relocation Intelligence</a>
      </p>
    </>
  )

  // ── CONTACT ───────────────────────────────────────────────────────────
  if (screen === 'contact') return shell(
    <>
      <button className="back-btn" onClick={() => { setScreen('chapter'); setCi(CHAPTERS.length - 1) }}>← Back</button>
      <div className="progress-track"><div className="progress-fill" style={{ width: '100%' }} /></div>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '0.8rem' }}>Last step</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', marginBottom: '0.5rem' }}>Where shall we send it?</h2>
      <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2.2rem', lineHeight: 1.55 }}>
        Your Scouting Dossier and a tailored note will reach you within 48 hours.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div><label className="field-label">First name</label><input value={client.firstName} onChange={e => setClient(c => ({ ...c, firstName: e.target.value }))} /></div>
        <div><label className="field-label">Last name</label><input value={client.lastName} onChange={e => setClient(c => ({ ...c, lastName: e.target.value }))} /></div>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label className="field-label">Email</label>
        <input type="email" value={client.email} onChange={e => setClient(c => ({ ...c, email: e.target.value }))} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label className="field-label">Phone</label>
        <input type="tel" value={client.phone} onChange={e => setClient(c => ({ ...c, phone: e.target.value }))} />
      </div>
      <div style={{ marginBottom: '2.2rem' }}>
        <label className="field-label">Anything else we should know? (optional)</label>
        <textarea rows={3} value={client.anything} onChange={e => setClient(c => ({ ...c, anything: e.target.value }))} style={{ resize: 'vertical' }}
          placeholder="A neighbourhood you already love, a constraint, a dream. Anything at all." />
      </div>
      <button className="btn-p" disabled={!client.firstName || !client.email || submitting} onClick={handleSubmit}>
        {submitting ? 'Sending...' : 'Send my brief →'}
      </button>
      <p style={{ marginTop: '1rem', fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.6 }}>
        We will not recommend anything on the spot. Good scouting takes a little research, and we would rather do it properly.
      </p>
    </>
  )

  // ── SUBMITTED ─────────────────────────────────────────────────────────
  if (screen === 'submitted') return shell(
    <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '2rem' }}>The quiet part begins</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 3.3rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
        Thank you, {client.firstName || 'and welcome'}.
      </h2>
      <p className="tgc-sans" style={{ fontSize: '1.15rem', color: '#4b5563', maxWidth: '460px', margin: '0 auto 1.4rem', lineHeight: 1.7 }}>
        We are already reading every answer with care.
      </p>
      <p className="tgc-sans" style={{ fontSize: '1.15rem', color: '#4b5563', maxWidth: '460px', margin: '0 auto 3rem', lineHeight: 1.7 }}>
        Give us 48 hours. What comes back will be considered, personal, and made for you alone.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="/intelligence" className="btn-g">Back to Intelligence Suite</a>
      </div>
    </div>
  )

  // ── CHAPTER ───────────────────────────────────────────────────────────
  const ch = CHAPTERS[ci]
  const complete = chapterComplete(ch)
  const pct = Math.round(((ci) / TOTAL) * 100)

  function goNext() {
    if (ci < CHAPTERS.length - 1) setCi(ci + 1)
    else setScreen('contact')
  }
  function goBack() {
    if (ci === 0) setScreen('welcome')
    else setCi(ci - 1)
  }

  return shell(
    <>
      <button className="back-btn" onClick={goBack}>← Back</button>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.max(pct, 4)}%` }} /></div>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '0.7rem' }}>{ch.eyebrow} · {ci + 1} of {TOTAL}</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', marginBottom: ch.intro ? '0.6rem' : '2rem', lineHeight: 1.1 }}>{ch.title}</h2>
      {ch.intro && <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2.2rem', lineHeight: 1.55, maxWidth: '560px' }}>{ch.intro}</p>}

      {ch.questions.map(q => {
        const v = data[q.id]
        const arr = Array.isArray(v) ? v : []
        const atMax = q.type === 'multimax' && q.max ? arr.length >= q.max : false
        return (
          <div key={q.id} style={{ marginBottom: '2.2rem' }}>
            <p className="q-prompt">{q.prompt}{q.optional && <span style={{ color: '#b9bdba', fontSize: '0.85rem', fontFamily: "'Lato', sans-serif" }}>  ·  optional</span>}</p>
            {q.help && <p className="q-help">{q.help}</p>}

            {(q.type === 'multi' || q.type === 'multimax') && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                {q.options!.map(o => {
                  const sel = arr.includes(o.value)
                  const dim = !sel && atMax
                  return (
                    <span key={o.value} className={`chip${sel ? ' sel' : ''}${dim ? ' dim' : ''}`}
                      onClick={() => !dim && toggleMulti(q.id, o.value, q.max)}>
                      {sel && <span className="tick">✓</span>}{o.label}
                    </span>
                  )
                })}
              </div>
            )}

            {q.type === 'single' && (
              q.options!.some(o => o.note) ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.7rem' }}>
                  {q.options!.map(o => (
                    <div key={o.value} className={`opt-card${v === o.value ? ' sel' : ''}`} onClick={() => setSingle(q.id, o.value)}>
                      <p className="tgc-serif" style={{ fontWeight: 400, fontSize: '1rem', color: '#1a1815', marginBottom: o.note ? '0.2rem' : 0 }}>{o.label}</p>
                      {o.note && <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.8rem', color: '#6b7280' }}>{o.note}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                  {q.options!.map(o => (
                    <span key={o.value} className={`chip${v === o.value ? ' sel' : ''}`} onClick={() => setSingle(q.id, o.value)}>
                      {v === o.value && <span className="tick">✓</span>}{o.label}
                    </span>
                  ))}
                </div>
              )
            )}

            {q.type === 'text' && (
              <textarea rows={3} value={typeof v === 'string' ? v : ''} onChange={e => setText(q.id, e.target.value)}
                style={{ resize: 'vertical' }} placeholder={q.placeholder || ''} />
            )}
          </div>
        )
      })}

      <button className="btn-p" disabled={!complete} onClick={goNext}>
        {ci < CHAPTERS.length - 1 ? 'Continue →' : 'Almost done →'}
      </button>
      {!complete && <p style={{ marginTop: '0.9rem', fontSize: '0.78rem', color: '#b9bdba' }}>A couple of answers left on this page.</p>}
    </>
  )
}
