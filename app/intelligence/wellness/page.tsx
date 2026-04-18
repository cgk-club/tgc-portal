'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { ChevronRight, ChevronLeft, RotateCcw, Clock, Heart, Zap, Shield, Sparkles, Activity, Moon, AlertCircle } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// TGC WELLNESS INTELLIGENCE · v1
// Twelve clinics · six questions · annual programme economics
// Paper #f5f1ea · Ink #1a1815 · Gold #8b6f3e → #5a4a2a
// ─────────────────────────────────────────────────────────────────────────────

type Goal = 'diagnostic' | 'detox' | 'sleep-stress' | 'longevity' | 'performance' | 'injury'
type Duration = '3-5' | '7' | '14-21' | 'open'
type Style = 'clinical' | 'spa' | 'nature' | 'hybrid'
type Companion = 'solo' | 'partner' | 'family' | 'medical'
type Location = 'europe' | 'longhaul' | 'open'
type Budget = 'under-600' | '600-1200' | '1200-plus'
type Screen = 'welcome' | 'questions' | 'result' | 'programmes' | 'confirm'

interface Answers {
  goal: Goal | null
  duration: Duration | null
  style: Style | null
  companion: Companion | null
  location: Location | null
  budget: Budget | null
}

interface ClientDetails {
  name: string
  email: string
  phone: string
  targetMonth: string
  message: string
}

interface Clinic {
  id: string
  name: string
  location: string
  country: string
  region: 'europe' | 'longhaul'
  tag: string
  goals: Goal[]
  styles: Style[]
  minNights: number
  priceNightFrom: number
  priceNightTo: number
  budgetTier: Budget[]
  summary: string
  brochureRealities: string[]
  tgcActive?: boolean
  loudQuiet?: { loud: string; quiet: string }
  programmes?: { name: string; duration: string; price: string; description: string }[]
}

// ─────────────────────────────────────────────────────────────────────────────
// CLINIC DATA
// ─────────────────────────────────────────────────────────────────────────────

const CLINICS: Clinic[] = [
  {
    id: 'lanserhof-sylt',
    name: 'Lanserhof Sylt',
    location: 'Sylt, Germany',
    country: 'DE',
    region: 'europe',
    tag: 'TGC Active — FAM visit completed',
    goals: ['diagnostic', 'detox', 'longevity', 'performance'],
    styles: ['clinical', 'hybrid'],
    minNights: 5,
    priceNightFrom: 650,
    priceNightTo: 1400,
    budgetTier: ['600-1200', '1200-plus'],
    summary: 'The most rigorous medical wellness clinic in Europe. Lanserhof Method combines Mayr medicine, advanced diagnostics, and performance optimisation. Sylt is the marine location — the North Sea island setting is either a feature or a drawback depending on the client.',
    brochureRealities: [
      'Minimum 5 nights — 3-day stays are not permitted',
      'North Sea weather is genuinely rough October through April',
      'No alcohol. The Mayr diet is restrictive — prepare clients accordingly',
      'Medical consultations are included; the programme is individually tailored from day one',
      'The island access (fly to Sylt GWT or overnight train) adds a half-day each direction',
    ],
    tgcActive: true,
    loudQuiet: {
      loud: 'Sylt in summer is peak German UHNW — busy island, social atmosphere',
      quiet: 'Lanserhof Tegernsee (Bavaria) is quieter, more monastic — better for clients who want no distractions',
    },
    programmes: [
      { name: 'Detox & Regeneration', duration: '7 nights', price: '€6,500-9,800', description: 'Classic Mayr cure, liver detox, colonics, fasting therapy, manual treatments' },
      { name: 'Advanced Diagnostics', duration: '5 nights', price: '€5,000-8,500', description: 'Full blood panel, cardiac screening, body composition, microbiome analysis, specialist consultations' },
      { name: 'Performance & Longevity', duration: '10-14 nights', price: '€10,000-18,000', description: 'Sports science, VO2 max testing, sleep optimisation, performance nutrition, HRV monitoring' },
    ],
  },
  {
    id: 'lanserhof-tegernsee',
    name: 'Lanserhof Tegernsee',
    location: 'Tegernsee, Bavaria',
    country: 'DE',
    region: 'europe',
    tag: 'The original Lanserhof — quieter, more focused',
    goals: ['diagnostic', 'detox', 'longevity'],
    styles: ['clinical'],
    minNights: 5,
    priceNightFrom: 600,
    priceNightTo: 1300,
    budgetTier: ['600-1200', '1200-plus'],
    summary: 'The founding Lanserhof site in Alpine Bavaria. Less socially busy than Sylt; Tegernsee is the choice for clients who want no distractions. The Alpine lake setting is more restorative than the North Sea island in winter.',
    brochureRealities: [
      'Same medical rigour as Sylt, fewer social distractions',
      'Access: Munich airport 1h by car — simplest of the Lanserhof network to reach',
      'Minimum 5 nights applies here too',
      'Snow in winter means the outdoor programme is weather-dependent',
    ],
    tgcActive: true,
    loudQuiet: {
      loud: 'Lanserhof Sylt is more social (summer island scene)',
      quiet: 'Tegernsee is the right choice for clients who mean business about the programme',
    },
  },
  {
    id: 'sha-wellness',
    name: 'SHA Wellness Clinic',
    location: 'Alicante, Spain',
    country: 'ES',
    region: 'europe',
    tag: 'Europe\'s leading integrative wellness destination',
    goals: ['detox', 'sleep-stress', 'longevity'],
    styles: ['hybrid', 'spa'],
    minNights: 7,
    priceNightFrom: 450,
    priceNightTo: 900,
    budgetTier: ['600-1200'],
    summary: 'SHA is Europe\'s most well-known integrative wellness clinic. Macrobiotic nutrition, naturopathy, TCM, advanced medicine. The Mediterranean setting (Altea hills above the sea) is genuinely beautiful. The food programme is strict and the results are real — but this is not a hotel spa.',
    brochureRealities: [
      'Heavily booked — 6-12 months lead time in peak periods',
      'Food programme is macrobiotics-based; strict and unfamiliar for most European clients',
      'The social atmosphere is high — you will see other guests, hear about their programmes',
      'Minimum 7 nights for meaningful results',
      'Alicante airport is 60-90 min by car — no private aviation advantage on this corridor',
    ],
    loudQuiet: {
      loud: 'SHA is the best-known and most socially visible European wellness clinic',
      quiet: 'Buchinger Wilhelmi (fasting-only) or Viva Mayr (gut-focused) are quieter and less marketed',
    },
    programmes: [
      { name: 'SHA Optimal Health', duration: '7 nights', price: '€5,500-8,000', description: 'Personalised health optimisation, diagnostics, SHA method introduction' },
      { name: 'SHA Emotional Wellbeing', duration: '10 nights', price: '€8,000-12,000', description: 'Stress, burnout, anxiety. Combines neuroscience, therapy, movement, nutrition' },
      { name: 'SHA Healthy Ageing', duration: '14-28 nights', price: '€14,000-32,000', description: 'Longevity protocols, telomere testing, cellular regeneration, full medical workup' },
    ],
  },
  {
    id: 'clinique-la-prairie',
    name: 'Clinique La Prairie',
    location: 'Montreux, Switzerland',
    country: 'CH',
    region: 'europe',
    tag: 'The original longevity clinic, since 1931',
    goals: ['longevity', 'diagnostic'],
    styles: ['clinical'],
    minNights: 4,
    priceNightFrom: 1500,
    priceNightTo: 4500,
    budgetTier: ['1200-plus'],
    summary: 'Clinique La Prairie is the most medically credentialed longevity clinic in the world, but also the most clinical atmosphere of any on this list. Lake Geneva view from almost every room. The Revitalisation programme (cell therapy, pioneered here in 1931) remains their signature. Swiss prices throughout.',
    brochureRealities: [
      'The atmosphere is genuinely medical — not spa-like',
      'Prices are the highest on this list by a significant margin',
      'Cell therapy and longevity programmes are 4-7 night minimum',
      'Montreux is accessible from Geneva airport in 1h by car or 55 min by train',
      'Summer is the most expensive and socially active period; spring and autumn are quieter and 15-20% cheaper',
    ],
    loudQuiet: {
      loud: 'CLP is the most famous longevity clinic — high name recognition, high prices',
      quiet: 'Buchinger Wilhelmi delivers comparable detox outcomes at 30-40% of CLP\'s price',
    },
    programmes: [
      { name: 'Revitalisation', duration: '7 nights', price: '€28,000-45,000', description: 'The original cell therapy programme, updated with modern regenerative medicine' },
      { name: 'Healthy Ageing Master Programme', duration: '7 nights', price: '€25,000-40,000', description: 'Comprehensive longevity assessment, biomarkers, targeted therapies' },
      { name: 'Prevention & Diagnostics', duration: '4 nights', price: '€12,000-20,000', description: 'Full body scan, genomics, epigenetics, cardiac and metabolic screening' },
    ],
  },
  {
    id: 'buchinger-wilhelmi',
    name: 'Buchinger Wilhelmi',
    location: 'Lake Constance, Germany',
    country: 'DE',
    region: 'europe',
    tag: 'The world authority on medical fasting',
    goals: ['detox'],
    styles: ['clinical'],
    minNights: 7,
    priceNightFrom: 320,
    priceNightTo: 700,
    budgetTier: ['under-600', '600-1200'],
    summary: 'The single correct answer if the goal is a genuine medically supervised fast. Buchinger Wilhelmi pioneered therapeutic fasting and has the most robust evidence base of any fasting clinic. The catch: this is a fasting clinic. Clients must understand they will not eat solid food for the duration.',
    brochureRealities: [
      'FASTING ONLY. No solid food for the programme duration. Clients who do not know this leave early.',
      'The experience is transformative for those who commit; brutal for those who arrive expecting a spa',
      'Lake Constance location (Überlingen) is genuinely beautiful; Marbella location for warmer weather',
      'Medical supervision is rigorous — some health conditions are contraindicated (check before booking)',
      'The Buchinger family still runs the clinic — it has not been sold to a hotel group',
    ],
    loudQuiet: {
      loud: 'SHA is the social, known option for detox',
      quiet: 'Buchinger is what serious fasting practitioners choose — no noise, clinical rigour, lower price',
    },
  },
  {
    id: 'viva-mayr',
    name: 'Viva Mayr',
    location: 'Maria Wörth, Austria',
    country: 'AT',
    region: 'europe',
    tag: 'Gut health and Mayr medicine on a lake',
    goals: ['detox', 'sleep-stress'],
    styles: ['clinical', 'hybrid'],
    minNights: 7,
    priceNightFrom: 450,
    priceNightTo: 850,
    budgetTier: ['600-1200'],
    summary: 'Viva Mayr on Lake Wörth in Austria is the elegant answer if the goal is gut health, detox, and reset without the medical intensity of Lanserhof or the austerity of Buchinger. Carinthia in summer is genuinely beautiful. Less known than SHA, which is part of the appeal.',
    brochureRealities: [
      'The Mayr diet is strict — chewing 40 times per mouthful is not a metaphor',
      'Kärntner summer can be warm and humid — the lake swimming makes up for it',
      'Minimum 7 nights for a meaningful Mayr programme',
      'Less well-known than SHA or Lanserhof, which is part of its value',
      'Austria access: fly to Klagenfurt (KLU) or Ljubljana (LJU), 45-60 min by car',
    ],
    loudQuiet: {
      loud: 'SHA (Alicante) is more social and better-known',
      quiet: 'Viva Mayr delivers comparable gut-reset outcomes in a quieter, less branded setting',
    },
  },
  {
    id: 'chiva-som',
    name: 'Chiva-Som',
    location: 'Hua Hin, Thailand',
    country: 'TH',
    region: 'longhaul',
    tag: 'Asia\'s most complete wellness resort',
    goals: ['detox', 'sleep-stress', 'longevity'],
    styles: ['spa', 'hybrid'],
    minNights: 7,
    priceNightFrom: 600,
    priceNightTo: 1300,
    budgetTier: ['600-1200', '1200-plus'],
    summary: 'Chiva-Som is the most comprehensive wellness resort in Asia — spa, medical, fitness, nutrition and mind all integrated at a high level. Hua Hin is quieter than Phuket or Koh Samui. The access is straightforward (Bangkok then 2.5h drive or 50 min helicopter). For clients who want a long-haul escape with real programme depth, this is the benchmark.',
    brochureRealities: [
      'Hua Hin is a Thai royal resort town — quieter and less tourist-heavy than the islands',
      'Humidity is high year-round; the resort is designed for it',
      'Flights: Bangkok (BKK) then ground transfer or helicopter. 11-12h from London.',
      'High season December-March books up fast — plan 4-6 months ahead',
      'The food is excellent and health-oriented but not punishing',
    ],
    loudQuiet: {
      loud: 'Phuket and Koh Samui wellness options are more social and tourist-adjacent',
      quiet: 'Hua Hin and Chiva-Som are the quieter, more serious long-haul answer',
    },
    programmes: [
      { name: 'Absolute Sanctuary Package', duration: '7 nights', price: '€7,500-11,000', description: 'Signature Chiva-Som programme with daily treatments, health consultations, fitness assessment' },
      { name: 'De-Stress & Rebalance', duration: '10 nights', price: '€11,000-16,000', description: 'Burnout recovery, sleep therapy, mindfulness, gentle movement, nutrition reset' },
    ],
  },
  {
    id: 'kamalaya',
    name: 'Kamalaya',
    location: 'Koh Samui, Thailand',
    country: 'TH',
    region: 'longhaul',
    tag: 'Burnout and emotional recovery on a hillside',
    goals: ['sleep-stress', 'detox'],
    styles: ['nature', 'hybrid'],
    minNights: 5,
    priceNightFrom: 350,
    priceNightTo: 800,
    budgetTier: ['under-600', '600-1200'],
    summary: 'Kamalaya is built into a hillside on Koh Samui and has the most holistic and emotionally oriented programme on this list. The setting — jungle, ocean views, traditional Thai sala architecture — is genuinely restorative. Best for burnout, emotional recovery, grief, and serious stress. Not a party island resort.',
    brochureRealities: [
      'Koh Samui requires a connection flight via Bangkok — add a half-day each way',
      'Samui can be very hot and humid May through October',
      'The programme is gentle and emotionally focused — not for clients wanting clinical diagnostics',
      'Internet connectivity can be slow — which is often the point',
      'Access: BKK transfer to USM, then 30 min by road. Total: 13-14h from London.',
    ],
    loudQuiet: {
      loud: 'Koh Samui has a party reputation from its other beach clubs — Kamalaya is entirely separate',
      quiet: 'Kamalaya is the quietest and most emotionally serious retreat on the island',
    },
  },
  {
    id: 'six-senses-douro',
    name: 'Six Senses Douro Valley',
    location: 'Douro Valley, Portugal',
    country: 'PT',
    region: 'europe',
    tag: 'Sleep and stress reset in wine country',
    goals: ['sleep-stress', 'detox'],
    styles: ['nature', 'spa'],
    minNights: 3,
    priceNightFrom: 450,
    priceNightTo: 950,
    budgetTier: ['600-1200'],
    summary: 'Six Senses Douro Valley is the most accessible serious wellness destination on this list. Converted quinta in the UNESCO wine country, 1.5h from Porto. The Sleep programme is the best-structured of any Six Senses property in Europe. The wine country context is a genuine temptation management challenge.',
    brochureRealities: [
      'The wine country setting is beautiful and also the obvious irony for a wellness retreat',
      'Porto airport is 1.5h by car — accessible from most of Europe in a half-day',
      'The Sleep programme is the standout; request it by name at booking',
      'Summer is hot and very busy — spring and autumn are significantly better for a wellness stay',
      'Less medically oriented than Lanserhof or SHA — this is restorative wellness, not clinical',
    ],
    loudQuiet: {
      loud: 'Six Senses has become a well-known luxury brand — this property is busier than a few years ago',
      quiet: 'The lesser-known Bairro Alto Hotel wellness programmes in Lisbon are an urban alternative',
    },
  },
  {
    id: 'como-shambhala',
    name: 'COMO Shambhala Estate',
    location: 'Ubud, Bali',
    country: 'ID',
    region: 'longhaul',
    tag: 'Yoga, movement, and jungle immersion',
    goals: ['sleep-stress', 'performance', 'injury'],
    styles: ['nature', 'spa'],
    minNights: 5,
    priceNightFrom: 700,
    priceNightTo: 1600,
    budgetTier: ['600-1200', '1200-plus'],
    summary: 'COMO Shambhala Estate is set in jungle above the Ayung River in Ubud. The focus is yoga, movement, and Ayurvedic-influenced wellness. For clients seeking a genuine long-haul immersion with excellent food, movement instruction, and physical rehabilitation capability, this is the right answer.',
    brochureRealities: [
      'Ubud is 1h from Bali\'s Ngurah Rai airport — transfers by private car (60-90 min)',
      'Bali from London is 14-16h with at least one connection',
      'Ubud humidity and rain (wet season November through March) are intense',
      'The property is deeply private — paparazzi are not a concern here',
      'Movement and yoga instruction is the genuine differentiator; medical capability is supportive not primary',
    ],
    loudQuiet: {
      loud: 'Seminyak and Canggu have the UHNW social villa scene',
      quiet: 'Ubud and COMO Shambhala are the retreat answer — genuinely separate from tourist Bali',
    },
  },
  {
    id: 'ananda-himalayas',
    name: 'Ananda in the Himalayas',
    location: 'Rishikesh, India',
    country: 'IN',
    region: 'longhaul',
    tag: 'Ayurveda and yoga at altitude',
    goals: ['detox', 'sleep-stress', 'longevity'],
    styles: ['nature', 'hybrid'],
    minNights: 7,
    priceNightFrom: 450,
    priceNightTo: 1000,
    budgetTier: ['600-1200'],
    summary: 'Ananda is the most medically credentialed Ayurvedic retreat outside Kerala. Set in a palace estate above Rishikesh, it combines classical Panchakarma Ayurveda with Himalayan trekking and yoga. For clients with a specific interest in Ayurvedic medicine or a genuine Himalayan experience, this has no European equivalent.',
    brochureRealities: [
      'Access: Delhi (DEL) then 6h by road or domestic flight to Jolly Grant (DED), 45 min by car',
      'Minimum 7 nights for Panchakarma to have meaningful effect',
      'Rishikesh is at altitude (1,048m) — acclimatisation day one is typical',
      'Ayurvedic treatments can be intense (oil therapies, steam, enemas) — prepare clients fully',
      'Monsoon (July-September) is the low season; October-March is optimal',
    ],
    loudQuiet: {
      loud: 'Kerala Ayurvedic retreats are well-known and more marketed to package tour market',
      quiet: 'Ananda in the Himalayas is quieter, higher-grade, and more medically serious',
    },
  },
  {
    id: 'prevention-medical',
    name: 'Prevention Medical',
    location: 'London / Paris / Zurich',
    country: 'EU',
    region: 'europe',
    tag: 'Advanced diagnostics without a retreat',
    goals: ['diagnostic'],
    styles: ['clinical'],
    minNights: 0,
    priceNightFrom: 0,
    priceNightTo: 0,
    budgetTier: ['under-600', '600-1200', '1200-plus'],
    summary: 'For clients whose goal is purely diagnostic (comprehensive blood work, cancer screening, cardiac imaging, genetic testing) without committing to a retreat format, several London and European clinics offer executive health screens in 1-2 days. Often the right first step before selecting a longer retreat.',
    brochureRealities: [
      'BUPA Cromwell, the London Clinic, and One Welbeck in London offer multi-day diagnostic programmes',
      'Biomarkers, full body MRI, cardiac CT, genomics: 1-2 days, €3,000-15,000',
      'Not a retreat experience — you go home after the tests',
      'Best used as a baseline before selecting the right longer programme',
      'Results take 2-7 days to compile; a follow-up consultation is essential',
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// MATCHING LOGIC
// ─────────────────────────────────────────────────────────────────────────────

function matchClinics(answers: Answers): Clinic[] {
  const { goal, duration, style, location, budget } = answers

  const scored = CLINICS.map((clinic) => {
    let score = 0

    // Goal match (most important)
    if (goal && clinic.goals.includes(goal)) score += 3

    // Style match
    if (style && clinic.styles.includes(style)) score += 2

    // Location match
    if (location === 'europe' && clinic.region === 'europe') score += 2
    if (location === 'longhaul' && clinic.region === 'longhaul') score += 2
    if (location === 'open') score += 1

    // Budget match
    if (budget && clinic.budgetTier.includes(budget)) score += 2

    // Duration fit
    if (duration === '3-5' && clinic.minNights <= 5) score += 1
    if (duration === '7' && clinic.minNights <= 7) score += 1
    if (duration === '14-21') score += 1
    if (duration === 'open') score += 1

    return { clinic, score }
  })

  return scored
    .filter((s) => s.score >= 3)
    .sort((a, b) => {
      // TGC active clinics bubble up
      if (a.clinic.tgcActive && !b.clinic.tgcActive) return -1
      if (!a.clinic.tgcActive && b.clinic.tgcActive) return 1
      return b.score - a.score
    })
    .slice(0, 3)
    .map((s) => s.clinic)
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRAMMES ECONOMICS
// ─────────────────────────────────────────────────────────────────────────────

type ProgrammeMode = 'single' | 'biannual' | 'annual' | 'membership'

function getProgrammeEconomics(mode: ProgrammeMode): { verdict: string; rationale: string; estimatedAnnual: string } {
  const data: Record<ProgrammeMode, { verdict: string; rationale: string; estimatedAnnual: string }> = {
    single: {
      verdict: 'One-off visit',
      rationale: 'A single well-chosen retreat delivers meaningful results. The correct format for first-timers and for addressing a specific acute need.',
      estimatedAnnual: '€5,000 – €18,000',
    },
    biannual: {
      verdict: 'Twice-yearly',
      rationale: 'Spring and autumn, each 5-7 nights. The maintenance cadence most medically serious clients settle into after their first visit. Body responds better with regularity.',
      estimatedAnnual: '€10,000 – €36,000',
    },
    annual: {
      verdict: 'Annual programme',
      rationale: 'Some clinics (Lanserhof, SHA) offer annual programme pricing at 10-20% discount with priority booking. Correct for clients who have committed to a specific clinic and method.',
      estimatedAnnual: '€16,000 – €50,000',
    },
    membership: {
      verdict: 'Full membership',
      rationale: 'CLP, Chiva-Som and Lanserhof each offer membership tiers with quarterly priority access, dedicated physician relationship, and between-visit remote monitoring. For clients where wellness is a primary lifestyle commitment.',
      estimatedAnnual: '€40,000 – €120,000+',
    },
  }
  return data[mode]
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const TGCWellnessIntelligence = () => {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({
    goal: null, duration: null, style: null, companion: null, location: null, budget: null,
  })
  const [programmeMode, setProgrammeMode] = useState<ProgrammeMode>('biannual')
  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    name: '', email: '', phone: '', targetMonth: '', message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const matches = matchClinics(answers)
  const economics = getProgrammeEconomics(programmeMode)

  const questions = [
    {
      key: 'goal' as keyof Answers,
      question: "What's driving this?",
      subtitle: 'The goal determines the clinic. They are different products.',
      options: [
        { value: 'diagnostic', label: 'Diagnostic check-up', desc: 'Understand what is actually happening inside', icon: Activity },
        { value: 'detox', label: 'Detox and reset', desc: 'Clear the system, reduce inflammation, restart', icon: RotateCcw },
        { value: 'sleep-stress', label: 'Sleep and stress', desc: 'Burnout recovery, anxiety, sleep restoration', icon: Moon },
        { value: 'longevity', label: 'Longevity programme', desc: 'Slow the process, extend healthy years', icon: Sparkles },
        { value: 'performance', label: 'Athletic performance', desc: 'Optimise output, recover faster, go further', icon: Zap },
        { value: 'injury', label: 'Recovery and rehabilitation', desc: 'Specific injury, post-surgery, chronic condition', icon: Shield },
      ],
    },
    {
      key: 'duration' as keyof Answers,
      question: 'How long can you commit?',
      subtitle: 'Under 5 nights, most serious programmes cannot begin.',
      options: [
        { value: '3-5', label: 'Long weekend (3-5 nights)', desc: 'Diagnostics, initial reset, introduction' },
        { value: '7', label: 'One week', desc: 'The standard minimum for a meaningful programme' },
        { value: '14-21', label: 'Two weeks or more', desc: 'Transformative — most protocols work at this length' },
        { value: 'open', label: 'Open', desc: 'Whatever the right programme requires' },
      ],
    },
    {
      key: 'style' as keyof Answers,
      question: 'What atmosphere suits you?',
      subtitle: 'Clinical and spa are different experiences.',
      options: [
        { value: 'clinical', label: 'Clinical and medical', desc: 'Physician-led, lab results, protocols. Minimal luxury theatre.', icon: Activity },
        { value: 'spa', label: 'Spa-led and restorative', desc: 'Treatment-heavy, beautiful setting, gentler approach.', icon: Heart },
        { value: 'nature', label: 'Nature immersive', desc: 'Remote, outdoor, walking. The setting is the medicine.', icon: Sparkles },
        { value: 'hybrid', label: 'Hybrid', desc: 'Medical depth in a beautiful setting. The harder brief.', icon: Shield },
      ],
    },
    {
      key: 'companion' as keyof Answers,
      question: 'Travelling with someone?',
      subtitle: 'Some clinics suit couples well; others are designed for solo programmes.',
      options: [
        { value: 'solo', label: 'Solo', desc: 'This is my programme, uninterrupted' },
        { value: 'partner', label: 'With a partner', desc: 'Different programmes, same location' },
        { value: 'family', label: 'With family', desc: 'Not the primary wellness client' },
        { value: 'medical', label: 'With a medical companion', desc: 'Condition requires accompaniment' },
      ],
    },
    {
      key: 'location' as keyof Answers,
      question: 'Where in the world?',
      subtitle: 'Long-haul travel adds recovery time at each end.',
      options: [
        { value: 'europe', label: 'Europe', desc: 'Accessible from home base, no jet-lag adjustment' },
        { value: 'longhaul', label: 'Long-haul', desc: 'Asia, South Asia. Worth it for the right programme.' },
        { value: 'open', label: 'Open to either', desc: 'The right clinic, wherever it is' },
      ],
    },
    {
      key: 'budget' as keyof Answers,
      question: 'Budget per night (all-in)?',
      subtitle: 'Most clinics include medical consultations and treatments in the nightly rate.',
      options: [
        { value: 'under-600', label: 'Under €600 per night', desc: 'Buchinger, Viva Mayr, Kamalaya, Ananda' },
        { value: '600-1200', label: '€600-1,200 per night', desc: 'SHA, Lanserhof, Chiva-Som, Six Senses' },
        { value: '1200-plus', label: 'Over €1,200 per night', desc: 'CLP, COMO Shambhala, Lanserhof premium suites' },
      ],
    },
  ]

  const currentQ = questions[step]
  const allAnswered = Object.values(answers).every((v) => v !== null)

  const handleAnswer = (key: keyof Answers, value: string) => {
    const newAnswers = { ...answers, [key]: value as never }
    setAnswers(newAnswers)
    setTimeout(() => {
      if (step < questions.length - 1) setStep(step + 1)
      else setScreen('result')
    }, 280)
  }

  const submitBrief = async () => {
    setSubmitting(true)
    try {
      await fetch('/api/intelligence/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'wellness',
          submittedAt: new Date().toISOString(),
          brief: { ...answers },
          client: { ...clientDetails },
          matches: matches.map((c) => ({ id: c.id, name: c.name, location: c.location })),
        }),
      })
    } catch (e) {
      console.error('Submit error:', e)
    }
    setSubmitting(false)
    setSubmitted(true)
  }

  const reset = () => {
    setAnswers({ goal: null, duration: null, style: null, companion: null, location: null, budget: null })
    setStep(0)
    setScreen('welcome')
    setSubmitted(false)
    setClientDetails({ name: '', email: '', phone: '', targetMonth: '', message: '' })
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────

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
        .tgc-serif { font-family: 'Poppins', sans-serif; }
        .tgc-sans { font-family: 'Lato', sans-serif; }
        .tgc-mono { font-family: 'Lato', sans-serif; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }
        .tgc-fade { animation: tgcFade 0.55s ease forwards; }
        @keyframes tgcFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .tgc-option:hover { background: rgba(200,170,74,0.06) !important; border-color: #c8aa4a !important; }
        .tgc-input { width: 100%; padding: 0.8rem 1rem; border: 1px solid #e5e7eb; background: white; font-size: 1rem; font-family: 'Lato', sans-serif; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .tgc-input:focus { border-color: #0e4f51; }
        .tgc-dot { width: 6px; height: 6px; border-radius: 50%; background: #e5e7eb; transition: all 0.3s ease; }
        .tgc-dot.active { background: #0e4f51; width: 28px; border-radius: 3px; }
        .tgc-dot.done { background: #c8aa4a; }
      `}</style>

      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>

        {/* Suite Nav */}
        <div style={{ marginBottom: '1.75rem' }}>
          <a href="/intelligence" style={{ display: 'inline-block', color: '#6b7280', fontSize: '0.75rem', textDecoration: 'none', fontFamily: "'Lato', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            ← Intelligence Suite
          </a>
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
            {[
              { num: '01', label: 'Transport', href: '/intelligence/transport', active: false },
              { num: '02', label: 'Real Estate', href: '/intelligence/realestate', active: false },
              { num: '03', label: 'Wellness', href: '/intelligence/wellness', active: true },
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

        {/* Header */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <a href="/intelligence" style={{ textDecoration: 'none' }}>
            <span className="tgc-serif" style={{ fontSize: '1.1rem', color: '#0e4f51' }}>
              The Gatekeepers Club
            </span>
          </a>
          <span className="tgc-mono" style={{ color: '#6b7280' }}>Wellness Intelligence · v.1</span>
        </div>

        {/* ── WELCOME ─────────────────────────────────────────────────── */}
        {screen === 'welcome' && (
          <div className="tgc-fade">
            <h1 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(2.8rem, 6vw, 4.8rem)', lineHeight: 1.03, letterSpacing: '-0.01em', marginBottom: '1.5rem' }}>
              The right clinic, for the right reason.
            </h1>
            <p className="tgc-sans" style={{ fontSize: 'clamp(1.15rem, 2vw, 1.45rem)', color: '#6b7280', maxWidth: '620px', lineHeight: 1.55, marginBottom: '3rem' }}>
              Most retreats are bought on reputation. The right one depends on what you actually need. Answer six questions and we will tell you which clinic matches your brief, with the realities they do not put in the brochure.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <button
                onClick={() => setScreen('questions')}
                style={{ background: '#0e4f51', color: '#ffffff', padding: '2.5rem 2rem', border: 'none', textAlign: 'left', cursor: 'pointer', transition: 'all 0.25s', borderRadius: '8px' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <div className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Tool 01 · The Brief</div>
                <div className="tgc-serif" style={{ fontSize: '1.8rem', marginBottom: '0.6rem', lineHeight: 1.15 }}>
                  Match me to a clinic
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.85, lineHeight: 1.5, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
                  Six questions. An honest recommendation from twelve carefully selected clinics.
                </div>
                <div className="tgc-mono" style={{ marginTop: '1.5rem', color: '#c8aa4a' }}>Begin →</div>
              </button>

              <button
                onClick={() => setScreen('programmes')}
                style={{ background: 'transparent', color: '#1a1815', padding: '2.5rem 2rem', border: '1.5px solid #e5e7eb', textAlign: 'left', cursor: 'pointer', transition: 'all 0.25s', borderRadius: '8px' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#0e4f51'; e.currentTarget.style.color = '#ffffff' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1a1815' }}
              >
                <div className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Tool 02 · The Programme</div>
                <div className="tgc-serif" style={{ fontSize: '1.8rem', marginBottom: '0.6rem', lineHeight: 1.15 }}>
                  How often, at what cost?
                </div>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.5, fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
                  Model the annual economics of single visits, biannual programmes, or full memberships.
                </div>
                <div className="tgc-mono" style={{ marginTop: '1.5rem' }}>Calculate →</div>
              </button>
            </div>

            {/* The honest framing */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {[
                { label: 'Diagnostic', clinics: 'Lanserhof, Clinique La Prairie, Prevention Medical' },
                { label: 'Detox', clinics: 'Buchinger Wilhelmi, Lanserhof, SHA, Viva Mayr' },
                { label: 'Sleep & stress', clinics: 'Kamalaya, Six Senses Douro, SHA' },
                { label: 'Longevity', clinics: 'CLP, Lanserhof, SHA, Ananda' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '0.4rem' }}>{item.label}</div>
                  <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5 }}>{item.clinics}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── QUESTIONS ─────────────────────────────────────────────── */}
        {screen === 'questions' && currentQ && (
          <div className="tgc-fade">
            {/* Progress */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '2.5rem', alignItems: 'center' }}>
              {questions.map((_, i) => (
                <div key={i} className={`tgc-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
              ))}
              <span style={{ marginLeft: '1rem', fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.78rem', color: '#c8aa4a' }}>
                {step + 1} of {questions.length}
              </span>
            </div>

            <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1.1, marginBottom: '0.7rem' }}>
              {currentQ.question}
            </h2>
            <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '2rem' }}>
              {currentQ.subtitle}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
              {currentQ.options.map((opt) => {
                const Icon = 'icon' in opt ? opt.icon : null
                const isSelected = answers[currentQ.key] === opt.value
                return (
                  <button
                    key={opt.value}
                    className="tgc-option"
                    onClick={() => handleAnswer(currentQ.key, opt.value)}
                    style={{
                      background: isSelected ? 'rgba(200,170,74,0.08)' : '#F9F8F5',
                      border: isSelected ? '1.5px solid #c8aa4a' : '1.5px solid #e5e7eb',
                      padding: '1.2rem 1.4rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      borderRadius: '8px',
                    }}
                  >
                    {Icon && <Icon size={18} style={{ color: '#c8aa4a', marginBottom: '0.6rem', display: 'block' }} />}
                    <div className="tgc-serif" style={{ fontSize: '1.15rem', marginBottom: '0.3rem', fontWeight: isSelected ? 500 : 400 }}>
                      {opt.label}
                    </div>
                    <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5 }}>
                      {opt.desc}
                    </div>
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c8aa4a', fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
                  <ChevronLeft size={16} /> Back
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── RESULT ─────────────────────────────────────────────────── */}
        {screen === 'result' && (
          <div className="tgc-fade">
            <div className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1.2rem' }}>Your recommendation</div>
            <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1, marginBottom: '0.6rem' }}>
              {matches.length > 0 ? (
                <>
                  {matches.length === 1 ? 'One clinic stands out.' : `${matches.length} clinics match your brief.`}
                </>
              ) : (
                'Tell us more and we will find the right match.'
              )}
            </h2>
            <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.5 }}>
              Below is our honest assessment. No brochure language.
            </p>

            {matches.length === 0 && (
              <div style={{ padding: '2rem', background: '#F9F8F5', border: '1px solid #e5e7eb', marginBottom: '2rem', borderRadius: '8px' }}>
                <p className="tgc-sans" style={{ color: '#6b7280' }}>
                  Your brief is specific enough that a direct conversation will serve better than a filtered list. Submit your brief below and your Gatekeeper will be in touch.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {matches.map((clinic, index) => (
                <div key={clinic.id} style={{ background: index === 0 ? '#0e4f51' : '#F9F8F5', color: index === 0 ? '#ffffff' : '#1a1815', padding: '2rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                    <div>
                      <div className="tgc-mono" style={{ color: index === 0 ? '#c8aa4a' : '#c8aa4a', marginBottom: '0.4rem' }}>
                        {index === 0 ? 'Primary recommendation' : `Alternative ${index}`}
                        {clinic.tgcActive ? ' · TGC Active' : ''}
                      </div>
                      <h3 className="tgc-serif" style={{ fontWeight: 400, fontSize: '1.8rem', lineHeight: 1.1 }}>{clinic.name}</h3>
                      <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.85rem', opacity: 0.7, marginTop: '0.25rem' }}>{clinic.location}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {clinic.priceNightFrom > 0 && (
                        <div>
                          <div className="tgc-mono" style={{ color: index === 0 ? '#c9a870' : '#8b6f3e', fontSize: '0.65rem' }}>from per night</div>
                          <div className="tgc-serif" style={{ fontSize: '1.4rem' }}>€{clinic.priceNightFrom.toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.65, opacity: index === 0 ? 0.85 : 0.75, marginBottom: '1.2rem' }}>
                    {clinic.summary}
                  </p>

                  {clinic.loudQuiet && (
                    <div style={{ background: index === 0 ? 'rgba(255,255,255,0.07)' : 'rgba(26,24,21,0.04)', padding: '1rem', marginBottom: '1.2rem' }}>
                      <div className="tgc-mono" style={{ color: index === 0 ? '#c8aa4a' : '#c8aa4a', marginBottom: '0.5rem', fontSize: '0.62rem' }}>Loud vs quiet</div>
                      <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.82rem', lineHeight: 1.6, opacity: 0.8 }}>
                        <strong>Louder:</strong> {clinic.loudQuiet.loud}<br />
                        <strong>Quieter:</strong> {clinic.loudQuiet.quiet}
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="tgc-mono" style={{ color: index === 0 ? '#c8aa4a' : '#c8aa4a', marginBottom: '0.6rem', fontSize: '0.62rem' }}>
                      What the brochure won&apos;t tell you
                    </div>
                    <ul style={{ margin: 0, padding: '0 0 0 1.2rem', listStyle: 'disc' }}>
                      {clinic.brochureRealities.slice(0, 3).map((r, i) => (
                        <li key={i} style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.82rem', lineHeight: 1.65, opacity: 0.8, marginBottom: '0.2rem' }}>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Brief submission */}
            {!submitted ? (
              <div style={{ padding: '2rem', background: '#F9F8F5', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <div className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1.2rem' }}>Submit your brief</div>
                <p className="tgc-sans" style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Your Gatekeeper will review the recommendation and be in touch to discuss timing, availability, and how to structure the visit.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                  {(['name', 'email', 'phone', 'targetMonth'] as const).map((field) => (
                    <div key={field}>
                      <label className="tgc-mono" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.62rem', color: '#c8aa4a' }}>
                        {field === 'targetMonth' ? 'Target month' : field}
                      </label>
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        className="tgc-input"
                        placeholder={field === 'targetMonth' ? 'e.g. October 2025' : field === 'name' ? 'Your name' : field === 'email' ? 'Email address' : 'Phone number'}
                        value={clientDetails[field]}
                        onChange={(e) => setClientDetails({ ...clientDetails, [field]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="tgc-mono" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.62rem', color: '#c8aa4a' }}>
                    Any other context (optional)
                  </label>
                  <textarea
                    className="tgc-input"
                    rows={3}
                    placeholder="Health context, previous retreats, specific clinic requests..."
                    value={clientDetails.message}
                    onChange={(e) => setClientDetails({ ...clientDetails, message: e.target.value })}
                    style={{ resize: 'vertical', minHeight: '80px' }}
                  />
                </div>
                <button
                  onClick={submitBrief}
                  disabled={submitting || !clientDetails.name || !clientDetails.email}
                  style={{
                    background: '#0e4f51', color: '#ffffff', border: 'none',
                    padding: '1rem 2.5rem', cursor: 'pointer',
                    fontFamily: "'Lato', sans-serif", fontSize: '0.72rem',
                    letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
                    opacity: (submitting || !clientDetails.name || !clientDetails.email) ? 0.4 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {submitting ? 'Sending...' : 'Submit brief →'}
                </button>
              </div>
            ) : (
              <div style={{ padding: '2.5rem 2rem', background: '#0e4f51', color: '#ffffff', textAlign: 'center', borderRadius: '8px' }}>
                <div className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Brief received</div>
                <h3 className="tgc-serif" style={{ fontWeight: 400, fontSize: '2rem', marginBottom: '0.75rem' }}>
                  Thank you, {clientDetails.name.split(' ')[0]}.
                </h3>
                <p className="tgc-sans" style={{ color: '#c8aa4a', lineHeight: 1.6 }}>
                  Your Gatekeeper will be in touch shortly to discuss the recommendation and next steps.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c8aa4a', fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.9rem' }}>
                <RotateCcw size={14} /> Start again
              </button>
              <button onClick={() => setScreen('programmes')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c8aa4a', fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.9rem' }}>
                <ChevronRight size={14} /> Programme economics
              </button>
            </div>
          </div>
        )}

        {/* ── PROGRAMMES ECONOMICS ────────────────────────────────────── */}
        {screen === 'programmes' && (
          <div className="tgc-fade">
            <div className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1.2rem' }}>Programme economics</div>
            <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1.1, marginBottom: '0.6rem' }}>
              Once, twice, or annual commitment?
            </h2>
            <p className="tgc-sans" style={{ color: '#6b7280', marginBottom: '2.5rem', lineHeight: 1.5, fontSize: '1.05rem' }}>
              Most serious wellness clients settle into a biannual cadence after their first visit. The body responds better with regularity.
            </p>

            {/* Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '2rem', maxWidth: '600px' }}>
              {([
                { value: 'single', label: 'Once a year', sub: 'One well-chosen stay' },
                { value: 'biannual', label: 'Twice a year', sub: 'Spring and autumn' },
                { value: 'annual', label: 'Annual programme', sub: 'Committed to one clinic' },
                { value: 'membership', label: 'Full membership', sub: 'Wellness as primary lifestyle' },
              ] as { value: ProgrammeMode; label: string; sub: string }[]).map((opt) => (
                <button
                  key={opt.value}
                  className="tgc-option"
                  onClick={() => setProgrammeMode(opt.value)}
                  style={{
                    background: programmeMode === opt.value ? 'rgba(200,170,74,0.08)' : '#F9F8F5',
                    border: programmeMode === opt.value ? '1.5px solid #c8aa4a' : '1.5px solid #e5e7eb',
                    padding: '1.2rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '8px',
                  }}
                >
                  <div className="tgc-serif" style={{ fontSize: '1.05rem', fontWeight: programmeMode === opt.value ? 500 : 400, marginBottom: '0.2rem' }}>{opt.label}</div>
                  <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.78rem', color: '#c8aa4a' }}>{opt.sub}</div>
                </button>
              ))}
            </div>

            {/* Verdict */}
            <div style={{ background: '#0e4f51', color: '#ffffff', padding: '2.5rem 2rem', marginBottom: '2rem', maxWidth: '640px', borderRadius: '8px' }}>
              <div className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '0.8rem' }}>Verdict</div>
              <h3 className="tgc-serif" style={{ fontWeight: 400, fontSize: '1.8rem', marginBottom: '0.6rem' }}>{economics.verdict}</h3>
              <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, lineHeight: 1.65, opacity: 0.9, marginBottom: '1.2rem' }}>
                {economics.rationale}
              </p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1rem' }}>
                <div className="tgc-mono" style={{ color: '#c8aa4a', fontSize: '0.62rem', marginBottom: '0.4rem' }}>Annual investment range</div>
                <div className="tgc-serif" style={{ fontSize: '1.5rem' }}>{economics.estimatedAnnual}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setScreen('questions')}
                style={{
                  background: '#0e4f51', color: '#ffffff', border: 'none',
                  padding: '1rem 2rem', cursor: 'pointer',
                  fontFamily: "'Lato', sans-serif", fontSize: '0.72rem',
                  letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
                  transition: 'all 0.2s',
                  borderRadius: '8px',
                }}
              >
                Match me to a clinic →
              </button>
              <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c8aa4a', fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <a href="/intelligence" className="tgc-mono" style={{ color: '#c8aa4a', textDecoration: 'none', marginRight: '1.5rem' }}>← All tools</a>
          </div>
          <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.75rem', color: '#6b7280' }}>
            The Gatekeepers Club · Wellness Intelligence v.1 · 12 clinics
          </span>
        </div>

      </div>
    </div>
  )
}

export default function WellnessIntelligencePage() {
  return <TGCWellnessIntelligence />
}
