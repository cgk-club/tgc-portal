/* eslint-disable react/no-unescaped-entities */
'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'

// ── TGC RELOCATION & FAMILY OFFICE INTELLIGENCE · v1 ─────────────────────────
// French visa pathways · schools coordination · domestic infrastructure

type Destination = 'france' | 'monaco' | 'switzerland' | 'other-europe' | 'us-canada' | 'other'
type Origin = 'us-canada' | 'uk' | 'middle-east' | 'asia-pacific' | 'europe' | 'south-africa' | 'latin-america' | 'other'
type FamilyProfile = 'solo' | 'couple' | 'family-young' | 'family-teen' | 'retirees'
type ServiceId = 'visa' | 'scouting' | 'real-estate' | 'schools' | 'banking' | 'domestic-staff' | 'healthcare' | 'utilities' | 'full'
type VisaRoute = 'visitor' | 'passeport-talent-entrepreneur' | 'passeport-talent-investor' | 'salarie' | 'retraite' | 'unsure'
type SchoolType = 'french-national' | 'french-international' | 'british' | 'ib' | 'american' | 'bilingual' | 'home-ed'
type Urgency = 'asap' | '3months' | '6months' | '1year' | 'open'
type Screen = 'welcome' | 'destination' | 'profile' | 'services' | 'visa' | 'schools' | 'timeline' | 'brief' | 'submitted'

interface Answers {
  destination: Destination | null
  origin: Origin | null
  family: FamilyProfile | null
  services: ServiceId[]
  visaRoute: VisaRoute | null
  schoolTypes: SchoolType[]
  childrenAges: string
  urgency: Urgency | null
  targetDate: string
}
interface ClientDetails { firstName: string; lastName: string; email: string; phone: string; message: string }

// ── VISA PATHWAY DATA ─────────────────────────────────────────────────────────

const VISA_ROUTES: Record<VisaRoute, {
  label: string; tagline: string; description: string
  keyRequirements: string[]; timeline: string; renewalPath: string
}> = {
  visitor: {
    label: 'Long Stay Visitor (VLS-TS)',
    tagline: 'Passive income, no employment in France.',
    description: 'For those with sufficient passive income — dividends, rental income, pensions, investments — who will not work in France. The most common route for early retirees and the independently wealthy. Annual renewal in France, with a path to Carte de Séjour after three years and Carte de Résident after five.',
    keyRequirements: [
      'Proof of resources sufficient to support yourself and dependants without working (typically €2,500+/month net in practice for HNW profiles)',
      'French private health insurance for the first year (before PUMA eligibility)',
      'Proof of accommodation — lease or property purchase',
      'Clean criminal record and valid passport',
    ],
    timeline: '2–4 months from application to arrival', renewalPath: 'Annual → CDS after 3 years → Carte de Résident after 5',
  },
  'passeport-talent-entrepreneur': {
    label: 'Passeport Talent — Entrepreneur',
    tagline: 'Company creation or professional project in France.',
    description: 'For founders, entrepreneurs, or professionals creating a business or bringing a project to France. Requires a viable business plan and, in practice, demonstration of sufficient funding or a letter of support from an incubator, public body, or credible investor. One of the cleaner long-stay routes for active professionals.',
    keyRequirements: [
      'Detailed business plan and evidence of funding or backing',
      'Project must be of economic or cultural interest to France — not strictly defined, but reviewed case by case',
      'No minimum investment threshold, but projects with clear economic impact are favoured',
      'Professional profile supporting the project (CV, previous ventures, qualifications)',
    ],
    timeline: '3–6 months from application', renewalPath: '4-year Carte de Séjour, renewable. Path to Carte de Résident after 5 years.',
  },
  'passeport-talent-investor': {
    label: 'Passeport Talent — Investor',
    tagline: 'Significant economic investment in France.',
    description: 'France does not have a simple golden visa, but the Passeport Talent investor route is the closest equivalent. A minimum investment of €300,000 in a French company (direct or via a holding), with evidence that the investment maintains or creates employment. The investment must be operational, not passive.',
    keyRequirements: [
      'Minimum €300,000 investment in a French company (operational, not passive)',
      'Evidence that investment maintains or creates employment in France',
      'Investment must be in a company active in France — not real estate alone',
      'Proof of personal resources to support the application',
    ],
    timeline: '4–6 months from application', renewalPath: '4-year Carte de Séjour, renewable. Path to Carte de Résident after 5 years.',
  },
  salarie: {
    label: 'Salarié / Détaché',
    tagline: 'Work contract with a French employer, or secondment.',
    description: 'For those with an employment contract with a French company, or those seconded (détaché) from a foreign employer to work in France for a defined period. The employer is typically the driver for this route. The détachement route is common for international executives relocating to a French subsidiary.',
    keyRequirements: [
      'Employment contract or secondment agreement with a French-registered entity',
      'Employer files the initial work permit application (Cerfa)',
      'Proof of qualifications relevant to the role',
      'Détachement: maximum 3 years before local contract conversion is typically required',
    ],
    timeline: '3–5 months (employer-led process)', renewalPath: 'Annual renewal tied to employment, Carte de Résident after 5 years.',
  },
  retraite: {
    label: 'Retraité (Retirement)',
    tagline: 'Pension or retirement income, no employment.',
    description: 'Similar in structure to the Visitor visa, but specifically for those receiving pension or retirement income. The key distinction in practice is marginal — both require proof of sufficient resources and health insurance. French pension income (if applicable) simplifies the proof-of-resources requirement significantly.',
    keyRequirements: [
      'Proof of pension, annuity, or retirement fund distributions sufficient to cover living costs',
      'French private health insurance or proof of European health coverage',
      'Proof of accommodation in France',
      'No employment or active business activity in France permitted',
    ],
    timeline: '2–4 months from application', renewalPath: 'Annual → CDS after 3 years → Carte de Résident after 5',
  },
  unsure: {
    label: 'Not sure — advise me',
    tagline: 'We will map the right route based on your profile.',
    description: 'Visa strategy is specific to the individual profile: income sources, nationality, family situation, intended activity in France. If you are unsure which route fits, your Gatekeeper will map the options and introduce you to a specialised immigration lawyer for the legal advice. We coordinate the process, not the legal opinion.',
    keyRequirements: [],
    timeline: 'To be determined with specialist advice', renewalPath: 'To be determined',
  },
}

// ── SCHOOL DATA ───────────────────────────────────────────────────────────────

const SCHOOL_TYPES: Record<SchoolType, { label: string; description: string; note: string }> = {
  'french-national': {
    label: 'French National Curriculum',
    description: 'French state or private schools following the Education Nationale programme. Delivered in French. Appropriate for children who will integrate fully into French-speaking life. The strongest long-term route for children who will remain in France.',
    note: 'Language immersion is significant in the first year. Tutoring support during transition is standard.',
  },
  'french-international': {
    label: 'French International Sections (DNL / OIB)',
    description: 'Selected French lycées offer international sections with bilingual instruction and the Option Internationale du Baccalauréat (OIB) — a French Bac with enhanced foreign language and culture content. Not available at every school; major cities and some international hubs only.',
    note: 'OIB is recognised by UK universities and most international institutions. A strong middle path for mobile families.',
  },
  british: {
    label: 'British Curriculum (IGCSE / A-Level)',
    description: 'British international schools following the Cambridge or Edexcel curriculum, leading to IGCSEs and A-Levels. Widely available in major French cities (Paris, Bordeaux, Lyon, Nice). Ensures continuity for children previously in British education and direct UK university eligibility.',
    note: 'Usually private with significant fees. Waitlists for good schools can be 12–18 months.',
  },
  ib: {
    label: 'International Baccalaureate (IB)',
    description: 'The IB Diploma Programme is widely recognised by universities globally and is the default choice for highly mobile families. Available at a limited number of schools in France. Strong academic rigour; good preparation for US, UK, and European university systems.',
    note: 'IB schools in France are concentrated in Paris and a few other cities. School availability shapes this choice significantly.',
  },
  american: {
    label: 'American Curriculum',
    description: 'American international schools following the US curriculum, typically accredited by regional US accreditation bodies. The right choice for families planning to return to the US or whose children are embedded in the US university preparation track.',
    note: 'Paris has the best options (American School of Paris, the International School of Paris). Limited availability outside major centres.',
  },
  bilingual: {
    label: 'Bilingual French / English',
    description: 'Private bilingual schools offering instruction in both French and English from an early age. Appropriate for younger children and families with long-term roots in France who want both language and cultural integration.',
    note: 'Quality varies significantly. Visit before committing. Some bilingual schools have stronger French instruction than English.',
  },
  'home-ed': {
    label: 'Home Education / Private Tuition',
    description: 'An increasing number of international families opt for structured home education — often with a combination of a full-time travelling tutor and supplementary local classes. Provides maximum flexibility for mobile families. Requires a strong brief and the right tutor appointment.',
    note: 'TGC can coordinate both the curriculum choice and the tutor placement. Treated as an infrastructure project, not an ad hoc arrangement.',
  },
}

// ── SERVICES ─────────────────────────────────────────────────────────────────

const SERVICES: { id: ServiceId; label: string; description: string }[] = [
  { id: 'visa', label: 'Visa & residency pathway', description: 'Route mapping, specialist legal introduction, application coordination.' },
  { id: 'scouting', label: 'Scouting trip', description: 'Structured scouting visit: neighbourhoods, properties, schools, lifestyle calibration.' },
  { id: 'real-estate', label: 'Real estate research', description: 'Rental or purchase mandate coordination. Off-market access where relevant.' },
  { id: 'schools', label: 'Schools coordination', description: 'School shortlist, visits, applications, and waiting list management.' },
  { id: 'banking', label: 'Banking & financial setup', description: 'Bank account opening, financial adviser introduction, tax residence structuring.' },
  { id: 'domestic-staff', label: 'Domestic staff sourcing', description: 'Housekeeper, nanny, chef, PA — placed through Household Staffing Intelligence.' },
  { id: 'healthcare', label: 'Healthcare registration', description: 'PUMA / CMU registration, mutuelle, specialist GP and consultants.' },
  { id: 'utilities', label: 'Utilities & domestic setup', description: 'Telecoms, utilities, postal address, vehicle importation, French driving licence.' },
  { id: 'full', label: 'Full relocation management', description: 'All of the above, coordinated as a single project with a dedicated Gatekeeper.' },
]

// ── STYLES ────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Lato:ital,wght@0,300;0,400;0,700;1,400&display=swap');
  .tgc-serif { font-family: 'Poppins', sans-serif; }
  .tgc-sans  { font-family: 'Lato', sans-serif; }
  .tgc-mono  { font-family: 'Lato', sans-serif; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }
  .card-opt  { transition: all 0.2s ease; cursor: pointer; border-radius: 6px; border: 1.5px solid #e5e7eb; padding: 1.1rem 1.25rem; background: #fff; }
  .card-opt:hover { border-color: #0e4f51; }
  .card-opt.sel { border-color: #0e4f51; background: #f0f7f7; }
  .svc-card  { transition: all 0.2s ease; cursor: pointer; border-radius: 6px; border: 1.5px solid #e5e7eb; padding: 1.1rem 1.25rem; background: #fff; display: flex; gap: 0.8rem; align-items: flex-start; }
  .svc-card:hover { border-color: #0e4f51; }
  .svc-card.sel { border-color: #0e4f51; background: #f0f7f7; }
  .visa-card { transition: all 0.2s ease; cursor: pointer; border-radius: 8px; padding: 1.5rem; border: 1.5px solid #e5e7eb; background: #fff; }
  .visa-card:hover { border-color: #0e4f51; }
  .visa-card.sel { border-color: #0e4f51; background: #f0f7f7; }
  .btn-p { background: #0e4f51; color: #fff; border: none; padding: 0.85rem 2rem; font-family: 'Lato', sans-serif; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; cursor: pointer; border-radius: 4px; transition: background 0.2s; }
  .btn-p:hover { background: #0a3a3c; }
  .btn-p:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-g  { background: transparent; color: #0e4f51; border: 1.5px solid #0e4f51; padding: 0.75rem 1.75rem; font-family: 'Lato', sans-serif; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; cursor: pointer; border-radius: 4px; transition: all 0.2s; text-decoration: none; display: inline-block; }
  .btn-g:hover { background: #f0f7f7; }
  input, textarea, select { font-family: 'Lato', sans-serif; font-size: 0.95rem; border: 1px solid #d1d5db; border-radius: 4px; padding: 0.7rem 0.9rem; width: 100%; box-sizing: border-box; background: #fff; color: #1a1815; }
  input:focus, textarea:focus, select:focus { outline: none; border-color: #0e4f51; }
  .field-label { font-family: 'Lato', sans-serif; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #6b7280; display: block; margin-bottom: 0.4rem; }
  .back-btn { background: none; border: none; cursor: pointer; color: #9ca3af; font-family: 'Lato', sans-serif; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; margin-bottom: 2rem; padding: 0; }
  .back-btn:hover { color: #0e4f51; }
  .checkbox { width: 16px; height: 16px; min-width: 16px; border-radius: 3px; border: 2px solid #d1d5db; background: #fff; display: flex; align-items: center; justify-content: center; margin-top: 2px; transition: all 0.15s; }
  .checkbox.checked { background: #0e4f51; border-color: #0e4f51; }
`

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function RelocationPage() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [answers, setAnswers] = useState<Answers>({
    destination: null, origin: null, family: null, services: [],
    visaRoute: null, schoolTypes: [], childrenAges: '', urgency: null, targetDate: '',
  })
  const [showInternal, setShowInternal] = useState(false)
  const [client, setClient] = useState<ClientDetails>({ firstName: '', lastName: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const needsVisa = answers.destination === 'france' || answers.destination === 'monaco' || answers.destination === 'switzerland'
  const hasChildren = answers.family === 'family-young' || answers.family === 'family-teen'

  function toggleService(id: ServiceId) {
    setAnswers(a => {
      if (id === 'full') return { ...a, services: a.services.includes('full') ? [] : ['full'] }
      const without = a.services.filter(s => s !== 'full')
      return { ...a, services: without.includes(id) ? without.filter(s => s !== id) : [...without, id] }
    })
  }

  function toggleSchool(id: SchoolType) {
    setAnswers(a => ({ ...a, schoolTypes: a.schoolTypes.includes(id) ? a.schoolTypes.filter(s => s !== id) : [...a.schoolTypes, id] }))
  }

  function getNextScreen(): Screen {
    if (screen === 'services') {
      if (needsVisa) return 'visa'
      if (hasChildren) return 'schools'
      return 'timeline'
    }
    if (screen === 'visa') return hasChildren ? 'schools' : 'timeline'
    return 'timeline'
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await fetch('/api/intelligence/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'relocation',
          brief: answers,
          client: { ...client, name: `${client.firstName} ${client.lastName}`.trim() },
          submittedAt: new Date().toISOString(),
        }),
      })
      setScreen('submitted')
    } catch {
      alert('Something went wrong. Please email jeeves@thegatekeepers.club directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const shell = (children: React.ReactNode) => (
    <div style={{ minHeight: '100vh', background: '#F9F8F5', color: '#1a1815', fontFamily: "'Lato', sans-serif" }}>
      <style>{CSS}</style>
      <header style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="https://thegatekeepers.club" style={{ textDecoration: 'none' }}>
          <span className="tgc-serif" style={{ fontSize: '1rem', color: '#0e4f51' }}>The Gatekeepers Club</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {screen !== 'welcome' && screen !== 'submitted' && (
            <button onClick={() => setShowInternal(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Lato', sans-serif", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, color: showInternal ? '#c8aa4a' : '#9ca3af' }}>
              {showInternal ? '— Internal' : '+ Internal'}
            </button>
          )}
          <span className="tgc-mono" style={{ color: '#c8aa4a' }}>Tool 08</span>
        </div>
      </header>
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) 2.5rem' }}>
        {children}
      </div>
    </div>
  )

  // ── WELCOME ────────────────────────────────────────────────────────────────
  if (screen === 'welcome') return shell(
    <>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1.5rem' }}>Relocation & Family Office Intelligence</p>
      <h1 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: '2rem', maxWidth: '700px' }}>
        Domestic infrastructure,<br />built properly.
      </h1>
      <p className="tgc-sans" style={{ fontSize: 'clamp(1.05rem, 1.8vw, 1.3rem)', color: '#6b7280', maxWidth: '580px', lineHeight: 1.65, marginBottom: '3rem' }}>
        Relocating is a project. Visa pathways, school coordination, real estate research, banking, healthcare, domestic staff, and utilities — each is a separate process. This tool maps your scope and builds a brief for your Gatekeeper.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '3.5rem' }}>
        {[
          { label: 'The scope', text: 'Most people underestimate relocation by half. We map the full list of what needs to happen — not just the first three items.' },
          { label: 'France first', text: 'We have the deepest coverage in France and Monaco: visa pathways, schools, trusted legal and financial contacts, and property access.' },
          { label: 'The model', text: 'We coordinate, introduce, and manage. Legal advice comes from specialist lawyers we introduce. We are project managers, not practitioners.' },
        ].map(item => (
          <div key={item.label} style={{ padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '0.7rem' }}>{item.label}</p>
            <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.88rem', lineHeight: 1.65, color: '#6b7280' }}>{item.text}</p>
          </div>
        ))}
      </div>
      <button className="btn-p" onClick={() => setScreen('destination')}>Start your brief →</button>
      <p style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: '#9ca3af', fontFamily: "'Lato', sans-serif" }}>
        <a href="/intelligence" style={{ color: '#9ca3af', textDecoration: 'none' }}>← Back to Intelligence Suite</a>
      </p>
    </>
  )

  // ── DESTINATION ────────────────────────────────────────────────────────────
  if (screen === 'destination') return shell(
    <>
      <button className="back-btn" onClick={() => setScreen('welcome')}>← Back</button>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Step 1 of {needsVisa && hasChildren ? '6' : needsVisa || hasChildren ? '5' : '4'}</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '0.5rem' }}>Where are you relocating to?</h2>
      <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.55 }}>Primary destination country or region.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.9rem', marginBottom: '3rem' }}>
        {([
          { id: 'france' as Destination, label: 'France', note: 'TGC Active · Full coverage' },
          { id: 'monaco' as Destination, label: 'Monaco', note: 'TGC Active · Residency coordination' },
          { id: 'switzerland' as Destination, label: 'Switzerland', note: 'Forfait fiscal · Canton research' },
          { id: 'other-europe' as Destination, label: 'Other Europe', note: 'Spain, Portugal, Italy, Benelux...' },
          { id: 'us-canada' as Destination, label: 'US / Canada', note: 'EB-5, O-1, investor routes' },
          { id: 'other' as Destination, label: 'Other', note: 'Global coverage on request' },
        ]).map(opt => (
          <div key={opt.id} className={`card-opt${answers.destination === opt.id ? ' sel' : ''}`}
            onClick={() => setAnswers(a => ({ ...a, destination: opt.id }))}>
            <p className="tgc-serif" style={{ fontWeight: 400, fontSize: '1.05rem', color: '#1a1815', marginBottom: '0.25rem' }}>{opt.label}</p>
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.78rem', color: '#6b7280' }}>{opt.note}</p>
          </div>
        ))}
      </div>
      <button className="btn-p" disabled={!answers.destination} onClick={() => setScreen('profile')}>Continue →</button>
    </>
  )

  // ── PROFILE ────────────────────────────────────────────────────────────────
  if (screen === 'profile') return shell(
    <>
      <button className="back-btn" onClick={() => setScreen('destination')}>← Back</button>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Step 2</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '0.5rem' }}>Your profile</h2>
      <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.55 }}>
        Helps us understand the scope and the right contacts to involve.
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <p className="tgc-mono" style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.68rem' }}>Moving from</p>
        <select value={answers.origin || ''} onChange={e => setAnswers(a => ({ ...a, origin: e.target.value as Origin || null }))}>
          <option value="">Select origin country / region</option>
          <option value="us-canada">United States / Canada</option>
          <option value="uk">United Kingdom</option>
          <option value="middle-east">Middle East (UAE, Saudi, Kuwait...)</option>
          <option value="asia-pacific">Asia Pacific (Singapore, HK, Australia...)</option>
          <option value="europe">Europe (other)</option>
          <option value="south-africa">South Africa</option>
          <option value="latin-america">Latin America</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <p className="tgc-mono" style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.68rem' }}>Moving as</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '560px' }}>
          {([
            { id: 'solo' as FamilyProfile, label: 'Solo', note: 'Individual relocation.' },
            { id: 'couple' as FamilyProfile, label: 'Couple', note: 'Two adults, no children in scope.' },
            { id: 'family-young' as FamilyProfile, label: 'Family — young children', note: 'Children under 12. Schools and childcare in scope.' },
            { id: 'family-teen' as FamilyProfile, label: 'Family — teenagers', note: 'Children 12+. Secondary school and exam pathway in scope.' },
            { id: 'retirees' as FamilyProfile, label: 'Retirees', note: 'Pension or retirement income. Healthcare and quality of life primary.' },
          ]).map(opt => (
            <div key={opt.id} className={`card-opt${answers.family === opt.id ? ' sel' : ''}`}
              onClick={() => setAnswers(a => ({ ...a, family: opt.id }))}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="tgc-serif" style={{ fontWeight: 400, fontSize: '1.05rem', color: '#1a1815', marginBottom: '0.2rem' }}>{opt.label}</p>
                  <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.82rem', color: '#6b7280' }}>{opt.note}</p>
                </div>
                {answers.family === opt.id && <span style={{ color: '#0e4f51' }}>✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className="btn-p" disabled={!answers.origin || !answers.family} onClick={() => setScreen('services')}>Continue →</button>
    </>
  )

  // ── SERVICES ──────────────────────────────────────────────────────────────
  if (screen === 'services') return shell(
    <>
      <button className="back-btn" onClick={() => setScreen('profile')}>← Back</button>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Step 3</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '0.5rem' }}>What do you need?</h2>
      <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.55 }}>
        Select all that apply. If you want us to handle everything, select Full relocation management.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
        {SERVICES.map(svc => {
          const sel = answers.services.includes(svc.id)
          return (
            <div key={svc.id} className={`svc-card${sel ? ' sel' : ''}`} onClick={() => toggleService(svc.id)}>
              <div className={`checkbox${sel ? ' checked' : ''}`}>
                {sel && <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>}
              </div>
              <div>
                <p className="tgc-serif" style={{ fontWeight: 400, fontSize: '1rem', color: '#1a1815', marginBottom: '0.2rem' }}>{svc.label}</p>
                <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.82rem', color: '#6b7280', fontWeight: 300 }}>{svc.description}</p>
              </div>
            </div>
          )
        })}
      </div>
      <button className="btn-p" disabled={answers.services.length === 0} onClick={() => setScreen(getNextScreen())}>Continue →</button>
    </>
  )

  // ── VISA SCREEN (conditional: France, Monaco, Switzerland) ─────────────────
  if (screen === 'visa') return shell(
    <>
      <button className="back-btn" onClick={() => setScreen('services')}>← Back</button>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>
        {answers.destination === 'france' ? 'French Visa Pathways' : answers.destination === 'monaco' ? 'Monaco Residency' : 'Swiss Residency'}
      </p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '0.5rem' }}>
        Which route fits your situation?
      </h2>
      <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.55 }}>
        {answers.destination === 'france'
          ? 'France has no simple golden visa. The right route depends on your income structure, nationality, and intended activity. Select the closest fit — your Gatekeeper will refine this with a specialist.'
          : answers.destination === 'monaco'
          ? 'Monaco residency requires a Monaco bank account, proof of accommodation, and a clean background check. It is not a visa process — it is a residency permit application managed through the Sûreté Publique.'
          : 'Swiss residency pathways vary significantly by canton. EU/EFTA citizens have free movement; non-EU nationals need a work permit or can explore lump-sum taxation (forfait fiscal) in certain cantons.'}
      </p>

      {answers.destination === 'monaco' ? (
        <div style={{ background: '#0e4f51', borderRadius: '8px', padding: '2rem', marginBottom: '2.5rem' }}>
          <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1.2rem' }}>Monaco residency in brief</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {[
              'Open a Monaco bank account with a minimum deposit of €500,000+ (in practice, private banks require considerably more for a new relationship).',
              'Secure accommodation in Monaco — rental or purchase. Average rental price is among the highest globally.',
              'Clean criminal record certificate from your country of origin (apostilled).',
              'Application submitted to the Sûreté Publique. No specific visa required if entering from Schengen.',
              'Residency card valid for one year, then three years, then ten years.',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.8rem' }}>
                <span style={{ color: '#c8aa4a', fontFamily: "'Lato', sans-serif", fontWeight: 700, flexShrink: 0 }}>—</span>
                <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.88rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.88)', margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      ) : answers.destination === 'switzerland' ? (
        <div style={{ background: '#0e4f51', borderRadius: '8px', padding: '2rem', marginBottom: '2.5rem' }}>
          <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1.2rem' }}>Switzerland residency in brief</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {[
              'EU/EFTA nationals: free movement. Register at the commune within 14 days of arrival. Work and residence unrestricted.',
              'Non-EU/EFTA nationals: need a work permit (Permit B) tied to employment, or the lump-sum taxation (forfait fiscal) route in eligible cantons.',
              'Forfait fiscal: for those without Swiss-source income. Tax is calculated on a multiple of your Swiss housing costs rather than worldwide income. Requires minimum annual tax payment (varies by canton; typically CHF 150,000–400,000).',
              'Geneva, Vaud, Valais, Ticino, Graubünden are most common for lump-sum arrangements. Zurich and Bern do not offer it.',
              'Total cost of Swiss residency — housing, banking, tax — should be modelled carefully before committing.',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.8rem' }}>
                <span style={{ color: '#c8aa4a', fontFamily: "'Lato', sans-serif", fontWeight: 700, flexShrink: 0 }}>—</span>
                <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.88rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.88)', margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // France: show visa route cards
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '2.5rem' }}>
          {(Object.entries(VISA_ROUTES) as [VisaRoute, (typeof VISA_ROUTES)[VisaRoute]][]).map(([id, v]) => (
            <div key={id} className={`visa-card${answers.visaRoute === id ? ' sel' : ''}`}
              onClick={() => setAnswers(a => ({ ...a, visaRoute: id }))}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <p className="tgc-serif" style={{ fontWeight: 400, fontSize: '1.05rem', color: '#1a1815', marginBottom: '0.2rem' }}>{v.label}</p>
                  <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.82rem', color: '#c8aa4a', marginBottom: '0.6rem', fontStyle: 'italic' }}>{v.tagline}</p>
                  <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.86rem', color: '#374151', lineHeight: 1.6 }}>{v.description}</p>
                  {answers.visaRoute === id && v.keyRequirements.length > 0 && (
                    <div style={{ marginTop: '1rem', background: '#f9f8f5', borderRadius: '6px', padding: '1rem' }}>
                      <p className="tgc-mono" style={{ color: '#6b7280', marginBottom: '0.7rem', fontSize: '0.62rem' }}>Key requirements</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {v.keyRequirements.map((r, i) => (
                          <div key={i} style={{ display: 'flex', gap: '0.6rem' }}>
                            <span style={{ color: '#c8aa4a', fontWeight: 700, flexShrink: 0, fontSize: '0.8rem' }}>—</span>
                            <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.82rem', lineHeight: 1.55, color: '#374151', margin: 0 }}>{r}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.8rem' }}>
                        <div>
                          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline</p>
                          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.82rem', color: '#374151' }}>{v.timeline}</p>
                        </div>
                        <div>
                          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Renewal path</p>
                          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.82rem', color: '#374151' }}>{v.renewalPath}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {answers.visaRoute === id && <span style={{ color: '#0e4f51', flexShrink: 0 }}>✓</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showInternal && answers.destination === 'france' && (
        <div style={{ background: '#fdf6e9', border: '1.5px solid #c8aa4a', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
          <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '0.8rem' }}>Internal note</p>
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.82rem', color: '#374151', lineHeight: 1.65 }}>
            We do not give immigration legal advice. Our role is to map the options, introduce to a specialist (Maître Emmanuel Raskin, Paris; or Stéphane Jacquier, Lyon, depending on profile), and coordinate the process thereafter. TGC fee for visa coordination is included in the relocation project fee. Standalone visa coordination: €500–1,500 depending on complexity.
          </p>
        </div>
      )}

      <button className="btn-p"
        disabled={answers.destination === 'france' && !answers.visaRoute}
        onClick={() => setScreen(hasChildren ? 'schools' : 'timeline')}>
        Continue →
      </button>
    </>
  )

  // ── SCHOOLS (conditional: family with children) ────────────────────────────
  if (screen === 'schools') return shell(
    <>
      <button className="back-btn" onClick={() => needsVisa ? setScreen('visa') : setScreen('services')}>← Back</button>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Schools</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '0.5rem' }}>Education preferences</h2>
      <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.55 }}>
        The school decision shapes the neighbourhood. Select the system or systems you are considering — we will map availability against your location preferences.
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {(Object.entries(SCHOOL_TYPES) as [SchoolType, (typeof SCHOOL_TYPES)[SchoolType]][]).map(([id, s]) => {
            const sel = answers.schoolTypes.includes(id)
            return (
              <div key={id} className={`svc-card${sel ? ' sel' : ''}`} onClick={() => toggleSchool(id)}>
                <div className={`checkbox${sel ? ' checked' : ''}`}>
                  {sel && <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>}
                </div>
                <div>
                  <p className="tgc-serif" style={{ fontWeight: 400, fontSize: '1rem', color: '#1a1815', marginBottom: '0.2rem' }}>{s.label}</p>
                  <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.55, marginBottom: sel ? '0.5rem' : 0 }}>{s.description}</p>
                  {sel && (
                    <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.78rem', color: '#c8aa4a', fontStyle: 'italic' }}>{s.note}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <label className="field-label">Children's ages (optional — helps with school mapping)</label>
        <input type="text" placeholder="e.g. 8, 11, 15 — or date ranges: 2015, 2019"
          value={answers.childrenAges} onChange={e => setAnswers(a => ({ ...a, childrenAges: e.target.value }))} />
      </div>

      <button className="btn-p" onClick={() => setScreen('timeline')}>Continue →</button>
    </>
  )

  // ── TIMELINE ──────────────────────────────────────────────────────────────
  if (screen === 'timeline') return shell(
    <>
      <button className="back-btn" onClick={() => hasChildren ? setScreen('schools') : needsVisa ? setScreen('visa') : setScreen('services')}>← Back</button>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Timeline</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '0.5rem' }}>When are you moving?</h2>
      <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.55 }}>
        Visa processing times and school application deadlines are both sensitive to timeline. The earlier we start, the better the options.
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <p className="tgc-mono" style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.68rem' }}>Urgency</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.7rem' }}>
          {([
            { id: 'asap' as Urgency, label: 'As soon as possible', note: 'Within 3 months' },
            { id: '3months' as Urgency, label: '3–6 months', note: 'Moderate lead time' },
            { id: '6months' as Urgency, label: '6–12 months', note: 'Good lead time' },
            { id: '1year' as Urgency, label: 'Over 12 months', note: 'Planning ahead' },
            { id: 'open' as Urgency, label: 'Open', note: 'No fixed date' },
          ]).map(opt => (
            <div key={opt.id} className={`card-opt${answers.urgency === opt.id ? ' sel' : ''}`}
              onClick={() => setAnswers(a => ({ ...a, urgency: opt.id }))}>
              <p className="tgc-serif" style={{ fontWeight: 400, fontSize: '0.95rem', color: '#1a1815', marginBottom: '0.2rem' }}>{opt.label}</p>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.78rem', color: '#6b7280' }}>{opt.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <label className="field-label">Target arrival date or school term (optional)</label>
        <input type="text" placeholder="e.g. September 2026, before school starts autumn, Q1 2027"
          value={answers.targetDate} onChange={e => setAnswers(a => ({ ...a, targetDate: e.target.value }))} />
      </div>

      <button className="btn-p" disabled={!answers.urgency} onClick={() => setScreen('brief')}>Continue →</button>
    </>
  )

  // ── BRIEF ─────────────────────────────────────────────────────────────────
  if (screen === 'brief') return shell(
    <>
      <button className="back-btn" onClick={() => setScreen('timeline')}>← Back</button>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Your details</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '0.5rem' }}>Almost there</h2>
      <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.55 }}>
        Your Gatekeeper will review the brief and propose a first call to clarify scope and next steps.
      </p>

      {/* Brief summary */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
        <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem', fontSize: '0.62rem' }}>Your brief summary</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem 2rem' }}>
          {[
            { label: 'Destination', value: answers.destination ? ({ france: 'France', monaco: 'Monaco', switzerland: 'Switzerland', 'other-europe': 'Other Europe', 'us-canada': 'US / Canada', other: 'Other' } as Record<string,string>)[answers.destination] : '-' },
            { label: 'Family profile', value: answers.family ? ({ solo: 'Solo', couple: 'Couple', 'family-young': 'Family — young children', 'family-teen': 'Family — teenagers', retirees: 'Retirees' } as Record<string,string>)[answers.family] : '-' },
            { label: 'Services', value: answers.services.length > 0 ? answers.services.join(', ').replace(/-/g, ' ') : '-' },
            { label: 'Urgency', value: answers.urgency ? ({ asap: 'As soon as possible', '3months': '3–6 months', '6months': '6–12 months', '1year': 'Over 12 months', open: 'Open' } as Record<string,string>)[answers.urgency] : '-' },
            { label: 'Target date', value: answers.targetDate || 'Not specified' },
            ...(answers.visaRoute ? [{ label: 'Visa route', value: VISA_ROUTES[answers.visaRoute]?.label || '-' }] : []),
          ].map(row => (
            <div key={row.label}>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>{row.label}</p>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.88rem', color: '#374151' }}>{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div><label className="field-label">First name</label><input value={client.firstName} onChange={e => setClient(c => ({ ...c, firstName: e.target.value }))} /></div>
        <div><label className="field-label">Last name</label><input value={client.lastName} onChange={e => setClient(c => ({ ...c, lastName: e.target.value }))} /></div>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label className="field-label">Email</label>
        <input type="email" value={client.email} onChange={e => setClient(c => ({ ...c, email: e.target.value }))} />
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="field-label">Phone (optional)</label>
        <input type="tel" value={client.phone} onChange={e => setClient(c => ({ ...c, phone: e.target.value }))} />
      </div>
      <div style={{ marginBottom: '2.5rem' }}>
        <label className="field-label">Anything else to add (optional)</label>
        <textarea rows={3} value={client.message} onChange={e => setClient(c => ({ ...c, message: e.target.value }))} style={{ resize: 'vertical' }}
          placeholder="Specific neighbourhoods, property budget, current school, nationality details, anything useful for scoping..." />
      </div>

      <button className="btn-p" disabled={!client.firstName || !client.email || submitting} onClick={handleSubmit}>
        {submitting ? 'Sending...' : 'Submit brief →'}
      </button>
      <p style={{ marginTop: '1rem', fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.6 }}>
        Your brief goes directly to christian@thegatekeepers.club. We will propose a first call to map scope and next steps.
      </p>
    </>
  )

  // ── SUBMITTED ─────────────────────────────────────────────────────────────
  if (screen === 'submitted') return shell(
    <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '2rem' }}>Brief received</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
        We have your brief,<br />{client.firstName || 'thank you'}.
      </h2>
      <p className="tgc-sans" style={{ fontSize: '1.05rem', color: '#6b7280', maxWidth: '480px', margin: '0 auto 3rem', lineHeight: 1.65 }}>
        Your Gatekeeper will review the scope and propose a first call to align on priorities and introductions needed.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="/intelligence" className="btn-g">Back to Intelligence Suite</a>
        <a href="https://thegatekeepers.club" style={{ textDecoration: 'none', display: 'inline-block', padding: '0.75rem 1.75rem', color: '#9ca3af', fontFamily: "'Lato', sans-serif", fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Main site →</a>
      </div>
    </div>
  )

  return null
}
