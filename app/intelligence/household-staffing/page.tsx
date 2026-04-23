/* eslint-disable react/no-unescaped-entities */
'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'

// ── TGC HOUSEHOLD STAFFING INTELLIGENCE · v1 ─────────────────────────────────
// Nine placement types · Temporary + Permanent · TGC Active

type RoleType = 'chef' | 'housekeeper' | 'house-manager' | 'butler' | 'pa' | 'estate-manager' | 'nanny' | 'tutor' | 'team'
type Placement = 'permanent' | 'temporary' | 'trial-to-perm'
type LiveIn = 'live-in' | 'live-out' | 'flexible'
type Location = 'france' | 'monaco' | 'switzerland' | 'uk' | 'us' | 'middle-east' | 'other'
type Budget = 'under-50k' | '50-80k' | '80-120k' | '120-200k' | 'over-200k' | 'open'
type Screen = 'welcome' | 'role' | 'role-detail' | 'placement' | 'property' | 'requirements' | 'brief' | 'submitted'

interface Answers {
  role: RoleType | null
  placement: Placement | null
  liveIn: LiveIn | null
  location: Location | null
  budget: Budget | null
  startTimeline: string
  requirements: string
}
interface ClientDetails { firstName: string; lastName: string; email: string; phone: string; message: string }

// ── ROLE DATA ─────────────────────────────────────────────────────────────────

const ROLES: Record<RoleType, {
  number: string; label: string; tagline: string; description: string
  brochureRealities: string[]; salaryRange: string; tempRange: string
}> = {
  chef: {
    number: '01', label: 'Private Chef', tagline: 'Cuisine calibrated to the household.',
    description: 'A private chef is not a restaurant chef. The role requires adaptability, discretion, and the ability to travel with the family. Menu planning, dietary management, and provisioning are the daily reality — not performance cooking for rotating dinner guests.',
    brochureRealities: [
      'Michelin training does not mean household-ready. Adaptability and discretion outperform prestige at this level.',
      'Travel means cooking in under-equipped kitchens. This is a skill, not an inconvenience to be managed.',
      'Principals usually want the same seven dishes on rotation. The job is consistency, not creativity on demand.',
      'Live-in arrangements require careful compensation structuring. Accommodation value must be factored against salary.',
    ],
    salaryRange: '€45,000 – €120,000+', tempRange: '€350 – €800 / day',
  },
  housekeeper: {
    number: '02', label: 'Housekeeper', tagline: 'The household runs through this person.',
    description: 'A strong housekeeper is the operational spine of a private home. Presentation standards, laundry protocols, supplier coordination, and household rhythm fall within scope. At senior level, the role is management of a private environment — not cleaning.',
    brochureRealities: [
      'Properties with art, antiques, or specialist materials require specific care knowledge. Ask directly during interview.',
      'Principal relationships are close and constant. Emotional intelligence and discretion matter more than technical method.',
      'Managing external contractors — cleaners, gardeners — is common at senior level. Verify management experience.',
      'The housekeeper absorbs pressure that would otherwise reach the principal. Build that into the brief.',
    ],
    salaryRange: '€28,000 – €65,000', tempRange: '€200 – €400 / day',
  },
  'house-manager': {
    number: '03', label: 'House Manager', tagline: 'Operations, not service.',
    description: 'The house manager sits above service delivery. Budget oversight, staff coordination, contractor management, and principal interface are the core. This is operational leadership of a private household — general management that happens to be in a private context.',
    brochureRealities: [
      'A good house manager pays for themselves in contractor savings alone. Do not under-brief on this role.',
      'The boundary between house manager and EA must be defined before the brief goes to market.',
      'Multi-property households require systems thinking and travel flexibility. Single-property experience does not transfer directly.',
      'References from comparable principal households are non-negotiable. Verify the scale of previous properties.',
    ],
    salaryRange: '€55,000 – €130,000', tempRange: '€400 – €700 / day',
  },
  butler: {
    number: '04', label: 'Butler', tagline: 'Service as a discipline.',
    description: 'The private butler is a rare appointment. Formal training, table and cellar knowledge, and intuitive understanding of principal preferences are the baseline. Most households requesting a butler actually need a house manager. We will tell you the difference.',
    brochureRealities: [
      'Formally trained butlers (ISGB, Ivor Spencer) have different expectations. Match the principal profile before approaching that market.',
      'A butler without adequate support staff is misdeployed. The household structure needs to be able to support the role.',
      'Silver service and cellar management require specific experience. Do not assume either is included.',
      'This is the most personality-driven placement in private staffing. A mismatched hire costs six months.',
    ],
    salaryRange: '€45,000 – €100,000', tempRange: '€350 – €600 / day',
  },
  pa: {
    number: '05', label: 'Personal Assistant', tagline: 'The calendar is the least of it.',
    description: 'A principal PA is not a corporate EA. Personal logistics, family coordination, travel management, and discretion at a level that would surprise a corporate context. Trust is the primary qualification, and the scope will expand beyond the original brief.',
    brochureRealities: [
      'Principals who have not previously had a PA take longer to onboard. Scope clarity prevents early departures.',
      'The role evolves. Calendar management becomes life management. Brief honestly about the real scope.',
      'Language requirements for international principals are specific. Native versus fluent matters in a PA context.',
      'The best PAs are protective of their principals. That quality can read as difficult in interviews. Recruit for it.',
    ],
    salaryRange: '€40,000 – €90,000', tempRange: '€300 – €600 / day',
  },
  'estate-manager': {
    number: '06', label: 'Estate Manager', tagline: 'Multi-property, multi-discipline.',
    description: 'An estate manager oversees a portfolio of properties: maintenance programmes, staffing structures, contractor relationships, budgets across locations. The role requires a general management mindset. Property operations, not hospitality.',
    brochureRealities: [
      'Genuine multi-property management experience is rare. Verify the brief before going to market.',
      'Technical knowledge of building systems and maintenance contracts matters as much as people management.',
      'Accommodation is usually expected at estate manager level. Factor this into compensation modelling.',
      'Commercial management backgrounds often outperform pure hospitality backgrounds at this level.',
    ],
    salaryRange: '€70,000 – €180,000+', tempRange: '€500 – €900 / day',
  },
  nanny: {
    number: '07', label: 'Nanny / Childcare', tagline: 'Qualified, consistent, trusted.',
    description: 'Placement spans maternity nurses through to travelling nannies for older children. The brief must specify travel requirements, language needs, and whether the role is standalone or part of a wider household team. Scope overlap with housekeeping is the most common brief error.',
    brochureRealities: [
      'Travelling nannies earn a significant premium. Extended travel changes the role structurally.',
      'Language requirements — French, English, bilingual — are usually the primary filter. Be precise in the brief.',
      'Nanny-housekeeper combinations are common but frequently under-compensated. Separate the roles if workload warrants it.',
      'References from comparable family setups are the most predictive indicator of placement success.',
    ],
    salaryRange: '€28,000 – €70,000+', tempRange: '€180 – €400 / day',
  },
  tutor: {
    number: '08', label: 'Private Tutor', tagline: 'Education as infrastructure.',
    description: 'Private tutors for international families cover curriculum continuity during travel, language acquisition, entrance exam preparation, and gifted programme enrichment. The brief must specify curriculum system (French, British, IB, US), subjects, age range, and the nature of the engagement.',
    brochureRealities: [
      'A travelling tutor is a different profile from a school-supplementing tutor. Pastoral flexibility alongside academic depth is the requirement.',
      'IB and A-Level are specialist markets. Subject depth matters more than generalist teaching experience.',
      'Language tutors for adult principals are a distinct market. Specify the distinction in the brief.',
      'Some families use tutors informally for children\'s logistics as well. Clarify scope before placing.',
    ],
    salaryRange: '€30,000 – €80,000', tempRange: '€80 – €300 / day',
  },
  team: {
    number: '09', label: 'Full Household Team', tagline: 'Building a household from scratch.',
    description: 'Setting up a new household requires sequenced placements. The house manager or senior housekeeper comes first, then the team is built around them. We structure the placement order, manage the process, and ensure the team coheres around the principal\'s operating style.',
    brochureRealities: [
      'The first appointment sets the culture of the household. Prioritise the senior position before all others.',
      'A brilliant individual who disrupts the team is a net negative. Cohesion is a brief requirement, not an afterthought.',
      'Phased hiring is usually better than simultaneous placements. Allow each hire to settle before the next.',
      'Full team budget should include accommodation, payroll administration, and a 15% contingency for first-year turnover.',
    ],
    salaryRange: 'Project basis', tempRange: 'Project basis',
  },
}

// ── SHARED STYLES ─────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Lato:ital,wght@0,300;0,400;0,700;1,400&display=swap');
  .tgc-serif { font-family: 'Poppins', sans-serif; }
  .tgc-sans  { font-family: 'Lato', sans-serif; }
  .tgc-mono  { font-family: 'Lato', sans-serif; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }
  .card-opt  { transition: all 0.2s ease; cursor: pointer; border-radius: 6px; border: 1.5px solid #e5e7eb; padding: 1.1rem 1.25rem; background: #fff; }
  .card-opt:hover { border-color: #0e4f51; }
  .card-opt.sel { border-color: #0e4f51; background: #f0f7f7; }
  .role-card { transition: all 0.2s ease; cursor: pointer; border-radius: 8px; padding: 1.25rem 1.5rem; background: #fff; border: 1.5px solid #e5e7eb; }
  .role-card:hover { border-color: #0e4f51; transform: translateY(-1px); }
  .role-card.sel { border-color: #0e4f51; background: #f0f7f7; }
  .btn-p { background: #0e4f51; color: #fff; border: none; padding: 0.85rem 2rem; font-family: 'Lato', sans-serif; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; cursor: pointer; border-radius: 4px; transition: background 0.2s; }
  .btn-p:hover { background: #0a3a3c; }
  .btn-p:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-g  { background: transparent; color: #0e4f51; border: 1.5px solid #0e4f51; padding: 0.75rem 1.75rem; font-family: 'Lato', sans-serif; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; cursor: pointer; border-radius: 4px; transition: all 0.2s; text-decoration: none; display: inline-block; }
  .btn-g:hover { background: #f0f7f7; }
  input, textarea, select { font-family: 'Lato', sans-serif; font-size: 0.95rem; border: 1px solid #d1d5db; border-radius: 4px; padding: 0.7rem 0.9rem; width: 100%; box-sizing: border-box; background: #fff; color: #1a1815; }
  input:focus, textarea:focus, select:focus { outline: none; border-color: #0e4f51; }
  .field-label { font-family: 'Lato', sans-serif; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #6b7280; display: block; margin-bottom: 0.4rem; }
  .back-btn { background: none; border: none; cursor: pointer; color: #9ca3af; font-family: 'Lato', sans-serif; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; margin-bottom: 2rem; padding: 0; display: flex; align-items: center; gap: 0.4rem; }
  .back-btn:hover { color: #0e4f51; }
`

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function HouseholdStaffingPage() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [answers, setAnswers] = useState<Answers>({
    role: null, placement: null, liveIn: null, location: null, budget: null, startTimeline: '', requirements: '',
  })
  const [showInternal, setShowInternal] = useState(false)
  const [client, setClient] = useState<ClientDetails>({ firstName: '', lastName: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const role = answers.role ? ROLES[answers.role] : null

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await fetch('/api/intelligence/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'household-staffing',
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
          <span className="tgc-mono" style={{ color: '#c8aa4a' }}>Tool 07</span>
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
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1.5rem' }}>Household Staffing Intelligence</p>
      <h1 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: '2rem', maxWidth: '680px' }}>
        The right person<br />in the right role.
      </h1>
      <p className="tgc-sans" style={{ fontSize: 'clamp(1.05rem, 1.8vw, 1.3rem)', color: '#6b7280', maxWidth: '580px', lineHeight: 1.65, marginBottom: '3rem' }}>
        Nine placement categories: chef, housekeeper, house manager, butler, PA, estate manager, nanny, tutor, and full household team. Temporary and permanent. We advise on the brief, go to market quietly, and charge one fee paid by the principal.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '3.5rem' }}>
        {[
          { label: 'The brief', text: 'Most placement failures start with a poor brief. We help write it before approaching the market.' },
          { label: 'The fee', text: 'Permanent: 10–15% of annual gross salary. Temporary: 20% markup on day rate. One fee, one process.' },
          { label: 'The method', text: 'We do not post positions publicly. Candidates come through our network and verified specialist agencies, quietly.' },
        ].map(item => (
          <div key={item.label} style={{ padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '0.7rem' }}>{item.label}</p>
            <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.88rem', lineHeight: 1.65, color: '#6b7280' }}>{item.text}</p>
          </div>
        ))}
      </div>
      <button className="btn-p" onClick={() => setScreen('role')}>Start your brief →</button>
      <p style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: '#9ca3af', fontFamily: "'Lato', sans-serif" }}>
        <a href="/intelligence" style={{ color: '#9ca3af', textDecoration: 'none' }}>← Back to Intelligence Suite</a>
      </p>
    </>
  )

  // ── ROLE SELECTION ─────────────────────────────────────────────────────────
  if (screen === 'role') return shell(
    <>
      <button className="back-btn" onClick={() => setScreen('welcome')}>← Back</button>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Step 1 of 5</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '0.5rem' }}>Which role are you placing?</h2>
      <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.55 }}>
        Select the primary role. If building a full team, select the first appointment.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.9rem', marginBottom: '2.5rem' }}>
        {(Object.entries(ROLES) as [RoleType, (typeof ROLES)[RoleType]][]).map(([id, r]) => (
          <div key={id} className={`role-card${answers.role === id ? ' sel' : ''}`}
            onClick={() => setAnswers(a => ({ ...a, role: id }))}>
            <div className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '0.5rem', fontSize: '0.62rem' }}>{r.number}</div>
            <div className="tgc-serif" style={{ fontWeight: 400, fontSize: '1.05rem', color: '#1a1815', marginBottom: '0.25rem' }}>{r.label}</div>
            <div style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' }}>{r.tagline}</div>
          </div>
        ))}
      </div>
      <button className="btn-p" disabled={!answers.role} onClick={() => setScreen('role-detail')}>Continue →</button>
    </>
  )

  // ── ROLE DETAIL ────────────────────────────────────────────────────────────
  if (screen === 'role-detail' && role) return shell(
    <>
      <button className="back-btn" onClick={() => setScreen('role')}>← Change role</button>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Role overview</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '0.4rem' }}>{role.label}</h2>
      <p className="tgc-sans" style={{ fontSize: '1rem', color: '#c8aa4a', marginBottom: '1.5rem', fontStyle: 'italic' }}>{role.tagline}</p>
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '1rem', lineHeight: 1.7, color: '#374151', marginBottom: '2.5rem', maxWidth: '660px' }}>
        {role.description}
      </p>
      <div style={{ background: '#0e4f51', borderRadius: '8px', padding: '2rem', marginBottom: '2rem' }}>
        <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1.2rem' }}>Brochure realities</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {role.brochureRealities.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.8rem' }}>
              <span style={{ color: '#c8aa4a', fontFamily: "'Lato', sans-serif", fontWeight: 700, flexShrink: 0, marginTop: '0.1rem' }}>—</span>
              <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.88rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.88)', margin: 0 }}>{r}</p>
            </div>
          ))}
        </div>
      </div>

      {showInternal && (
        <div style={{ background: '#fdf6e9', border: '1.5px solid #c8aa4a', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
          <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Internal — fee reference</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.8rem' }}>
            <div>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Permanent salary range</p>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.95rem', color: '#374151' }}>{role.salaryRange}</p>
            </div>
            <div>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Temporary day rate</p>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.95rem', color: '#374151' }}>{role.tempRange}</p>
            </div>
          </div>
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#6b7280' }}>
            TGC fee: 10–15% of annual gross (permanent) · 20% on day rate (temporary). One fee. No candidate contribution.
          </p>
        </div>
      )}

      <button className="btn-p" onClick={() => setScreen('placement')}>Continue to placement type →</button>
    </>
  )

  // ── PLACEMENT ─────────────────────────────────────────────────────────────
  if (screen === 'placement') return shell(
    <>
      <button className="back-btn" onClick={() => setScreen('role-detail')}>← Back</button>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Step 2 of 5</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '0.5rem' }}>Temporary or permanent?</h2>
      <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.55 }}>
        This shapes the market we approach and the fee structure.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '2.5rem', maxWidth: '560px' }}>
        {([
          { id: 'permanent' as Placement, label: 'Permanent', note: 'Long-term appointment. One placement fee on successful completion (10–15% of annual gross).' },
          { id: 'temporary' as Placement, label: 'Temporary', note: 'Fixed-term or day-rate engagement. 20% markup on agreed day rate. Minimum 5-day engagement.' },
          { id: 'trial-to-perm' as Placement, label: 'Trial to permanent', note: 'Short engagement with a view to a long-term appointment. Trial and permanent fees structured accordingly.' },
        ]).map(opt => (
          <div key={opt.id} className={`card-opt${answers.placement === opt.id ? ' sel' : ''}`}
            onClick={() => setAnswers(a => ({ ...a, placement: opt.id }))}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="tgc-serif" style={{ fontWeight: 400, fontSize: '1.1rem', color: '#1a1815', marginBottom: '0.3rem' }}>{opt.label}</p>
                <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.86rem', color: '#6b7280', lineHeight: 1.55 }}>{opt.note}</p>
              </div>
              {answers.placement === opt.id && <span style={{ color: '#0e4f51', fontSize: '1rem', marginLeft: '1rem' }}>✓</span>}
            </div>
          </div>
        ))}
      </div>
      <button className="btn-p" disabled={!answers.placement} onClick={() => setScreen('property')}>Continue →</button>
    </>
  )

  // ── PROPERTY ──────────────────────────────────────────────────────────────
  if (screen === 'property') return shell(
    <>
      <button className="back-btn" onClick={() => setScreen('placement')}>← Back</button>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Step 3 of 5</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '0.5rem' }}>Where is the role based?</h2>
      <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.55 }}>
        Primary location and live-in arrangement help us target the right candidates.
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <p className="tgc-mono" style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.68rem' }}>Primary location</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.7rem' }}>
          {([
            { id: 'france' as Location, label: 'France' },
            { id: 'monaco' as Location, label: 'Monaco' },
            { id: 'switzerland' as Location, label: 'Switzerland' },
            { id: 'uk' as Location, label: 'United Kingdom' },
            { id: 'us' as Location, label: 'United States' },
            { id: 'middle-east' as Location, label: 'Middle East' },
            { id: 'other' as Location, label: 'Other / Multiple' },
          ]).map(opt => (
            <div key={opt.id} className={`card-opt${answers.location === opt.id ? ' sel' : ''}`}
              style={{ textAlign: 'center' }}
              onClick={() => setAnswers(a => ({ ...a, location: opt.id }))}>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.92rem', color: '#1a1815', fontWeight: answers.location === opt.id ? 600 : 400 }}>{opt.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <p className="tgc-mono" style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.68rem' }}>Live-in arrangement</p>
        <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
          {([
            { id: 'live-in' as LiveIn, label: 'Live-in' },
            { id: 'live-out' as LiveIn, label: 'Live-out' },
            { id: 'flexible' as LiveIn, label: 'Flexible' },
          ]).map(opt => (
            <div key={opt.id} className={`card-opt${answers.liveIn === opt.id ? ' sel' : ''}`}
              style={{ minWidth: '120px', textAlign: 'center' }}
              onClick={() => setAnswers(a => ({ ...a, liveIn: opt.id }))}>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.92rem', color: '#1a1815', fontWeight: answers.liveIn === opt.id ? 600 : 400 }}>{opt.label}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-p" disabled={!answers.location || !answers.liveIn} onClick={() => setScreen('requirements')}>Continue →</button>
    </>
  )

  // ── REQUIREMENTS ──────────────────────────────────────────────────────────
  if (screen === 'requirements') return shell(
    <>
      <button className="back-btn" onClick={() => setScreen('property')}>← Back</button>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Step 4 of 5</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '0.5rem' }}>Budget and timing</h2>
      <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.55 }}>
        Honest budget ranges help us brief the market accurately from the start.
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <p className="tgc-mono" style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.68rem' }}>
          {answers.placement === 'temporary' ? 'Day rate budget (candidate gross)' : 'Annual gross salary budget'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.7rem' }}>
          {([
            { id: 'under-50k' as Budget, label: 'Under €50,000' },
            { id: '50-80k' as Budget, label: '€50,000 – €80,000' },
            { id: '80-120k' as Budget, label: '€80,000 – €120,000' },
            { id: '120-200k' as Budget, label: '€120,000 – €200,000' },
            { id: 'over-200k' as Budget, label: 'Over €200,000' },
            { id: 'open' as Budget, label: 'Open — right person first' },
          ]).map(opt => (
            <div key={opt.id} className={`card-opt${answers.budget === opt.id ? ' sel' : ''}`}
              onClick={() => setAnswers(a => ({ ...a, budget: opt.id }))}>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.92rem', color: '#1a1815', fontWeight: answers.budget === opt.id ? 600 : 400 }}>{opt.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label className="field-label">Start date / timeline</label>
        <input type="text" placeholder="e.g. July 2026, as soon as possible, within 3 months"
          value={answers.startTimeline} onChange={e => setAnswers(a => ({ ...a, startTimeline: e.target.value }))} />
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <label className="field-label">Key requirements or context (optional)</label>
        <textarea placeholder="Languages required, dietary protocols, pets, household routines, travel schedule, specific experience required..."
          rows={4} value={answers.requirements}
          onChange={e => setAnswers(a => ({ ...a, requirements: e.target.value }))}
          style={{ resize: 'vertical' }} />
      </div>

      <button className="btn-p" disabled={!answers.budget} onClick={() => setScreen('brief')}>Continue →</button>
    </>
  )

  // ── BRIEF ─────────────────────────────────────────────────────────────────
  if (screen === 'brief') return shell(
    <>
      <button className="back-btn" onClick={() => setScreen('requirements')}>← Back</button>
      <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem' }}>Step 5 of 5</p>
      <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '0.5rem' }}>Your details</h2>
      <p className="tgc-sans" style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.55 }}>
        Your Gatekeeper will review the brief and be in touch to confirm next steps.
      </p>

      {/* Brief summary */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
        <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1rem', fontSize: '0.62rem' }}>Your brief summary</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem 2rem' }}>
          {([
            { label: 'Role', value: role?.label },
            { label: 'Placement', value: answers.placement ? ({ permanent: 'Permanent', temporary: 'Temporary', 'trial-to-perm': 'Trial to permanent' } as Record<string,string>)[answers.placement] : '-' },
            { label: 'Location', value: answers.location ? ({ france: 'France', monaco: 'Monaco', switzerland: 'Switzerland', uk: 'United Kingdom', us: 'United States', 'middle-east': 'Middle East', other: 'Other / Multiple' } as Record<string,string>)[answers.location] : '-' },
            { label: 'Live-in', value: answers.liveIn ? ({ 'live-in': 'Live-in', 'live-out': 'Live-out', flexible: 'Flexible' } as Record<string,string>)[answers.liveIn] : '-' },
            { label: 'Budget', value: answers.budget ? ({ 'under-50k': 'Under €50k', '50-80k': '€50–80k', '80-120k': '€80–120k', '120-200k': '€120–200k', 'over-200k': 'Over €200k', open: 'Open' } as Record<string,string>)[answers.budget] : '-' },
            { label: 'Timeline', value: answers.startTimeline || 'Not specified' },
          ]).map(row => (
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
        <textarea rows={3} value={client.message} onChange={e => setClient(c => ({ ...c, message: e.target.value }))} style={{ resize: 'vertical' }} />
      </div>

      <button className="btn-p" disabled={!client.firstName || !client.email || submitting} onClick={handleSubmit}>
        {submitting ? 'Sending...' : 'Submit brief →'}
      </button>
      <p style={{ marginTop: '1rem', fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.6 }}>
        Your brief goes directly to christian@thegatekeepers.club. No automated responses. No databases shared with agencies.
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
        Your Gatekeeper will review it and be in touch. If anything changes or you have further context to share, reply to the confirmation email.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="/intelligence" className="btn-g">Back to Intelligence Suite</a>
        <a href="https://thegatekeepers.club" style={{ textDecoration: 'none', display: 'inline-block', padding: '0.75rem 1.75rem', color: '#9ca3af', fontFamily: "'Lato', sans-serif", fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Main site →</a>
      </div>
    </div>
  )

  return null
}
