export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TGC Intelligence Suite',
  description: 'Decision-support tools for transport, real estate, wellness and more. Honest answers for considered decisions.',
  openGraph: {
    title: 'TGC Intelligence Suite',
    description: 'Honest optimization over flattery. Quiet beats loud. Time is the real metric.',
    siteName: 'The Gatekeepers Club',
  },
}

const tools = [
  {
    id: 'transport',
    number: '01',
    href: '/intelligence/transport',
    title: 'Transport Intelligence',
    subtitle: 'Getting there, considered.',
    description: '60 curated corridors across the US, UK, Europe and transatlantic. We tell you the right way to travel each one, honestly. Plus an asset calculator for when to book, share or own.',
    cta: 'Plan a journey',
    live: true,
    tgcActive: true,
  },
  {
    id: 'realestate',
    number: '02',
    href: '/intelligence/realestate',
    title: 'Real Estate Intelligence',
    subtitle: 'Quiet beats loud. Structuring is half the cost.',
    description: '31 micro-markets across 12 jurisdictions. Honest editorial on market cycles, the quiet versus loud framework, and structuring considerations before you search, not after.',
    cta: 'Open a mandate',
    live: true,
    tgcActive: true,
  },
  {
    id: 'wellness',
    number: '03',
    href: '/intelligence/wellness',
    title: 'Wellness Intelligence',
    subtitle: 'The right clinic for the right reason.',
    description: 'Not all retreats are the same product. Diagnostic, detox, longevity, performance, sleep, fasting. We match your brief to the right clinic, honestly, with brochure realities included.',
    cta: 'Build your brief',
    live: true,
    tgcActive: true,
  },
  {
    id: 'events',
    number: '04',
    href: '/intelligence/events-production',
    title: 'Events Production Intelligence',
    subtitle: 'Less scaffolding. More moments.',
    description: '14 event types across private, corporate and MICE. The Moment Framework: three to five moments that define an event at its best. Taste-primer before logistics. Moment Sketch generated and handed to a Gatekeeper.',
    cta: 'Build a brief',
    live: true,
    tgcActive: false,
  },
  {
    id: 'vip',
    number: '05',
    href: '/intelligence/vip-hospitality',
    title: 'VIP Hospitality Intelligence',
    subtitle: 'Access is the question. Attendance is easy.',
    description: '20 curated events across motorsport, polo, horse racing, tennis, sailing, art fairs, performance, golf and film. For each, the difference between attending and being inside. TGC Active events where we have a direct offer.',
    cta: 'Browse events',
    live: true,
    tgcActive: false,
  },
  {
    id: 'art',
    number: '06',
    href: '/intelligence/art-collectables',
    title: 'Art & Collectables Intelligence',
    subtitle: 'Structuring is almost never considered at acquisition.',
    description: 'Contemporary, Old Masters, watches, wine, classic cars. Private sales versus auction. The import VAT, resale rights, freeport and estate planning questions that most buyers never ask.',
    cta: 'Open a mandate',
    live: true,
    tgcActive: false,
  },
]

export default function IntelligenceLandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F9F8F5',
      color: '#1a1815',
      fontFamily: "'Lato', sans-serif",
      padding: '0',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Lato:ital,wght@0,300;0,400;0,700;1,400&display=swap');
        .tgc-serif { font-family: 'Poppins', sans-serif; }
        .tgc-sans { font-family: 'Lato', sans-serif; }
        .tgc-mono { font-family: 'Lato', sans-serif; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }
        .tool-card { transition: all 0.25s ease; }
        .tool-card:hover { transform: translateY(-2px); }
        .tool-card-live:hover { box-shadow: 0 8px 32px rgba(26,24,21,0.12); }
      `}</style>

      {/* Header */}
      <header style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="https://thegatekeepers.club" style={{ textDecoration: 'none' }}>
          <span className="tgc-serif" style={{ fontSize: '1.1rem', color: '#0e4f51' }}>
            The Gatekeepers Club
          </span>
        </a>
        <span className="tgc-mono" style={{ color: '#c8aa4a' }}>Intelligence Suite</span>
      </header>

      {/* Hero */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 2.5rem clamp(3rem, 6vw, 5rem)', maxWidth: '1100px', margin: '0 auto' }}>
        <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1.5rem' }}>TGC Intelligence Suite</p>
        <h1 className="tgc-serif" style={{
          fontWeight: 400,
          fontSize: 'clamp(3rem, 7vw, 5.5rem)',
          lineHeight: 1.02,
          letterSpacing: '-0.01em',
          marginBottom: '2rem',
          maxWidth: '820px',
        }}>
          Honest answers<br />
          for considered decisions.
        </h1>
        <p className="tgc-sans" style={{
          fontSize: 'clamp(1.15rem, 2vw, 1.45rem)',
          color: '#6b7280',
          maxWidth: '620px',
          lineHeight: 1.6,
        }}>
          Five intelligence tools for transport, property, wellness, events and collecting. Each one built on the same thesis: quiet beats loud, structuring matters, and time is the real cost.
        </p>
      </section>

      {/* Tools grid */}
      <section style={{ padding: '0 2.5rem 6rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {tools.map((tool) => (
            tool.live ? (
              <Link
                key={tool.id}
                href={tool.href}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  className="tool-card tool-card-live"
                  style={{
                    background: '#0e4f51',
                    color: '#ffffff',
                    padding: '2.5rem 2rem',
                    height: '100%',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    position: 'relative',
                    borderRadius: '8px',
                  }}
                >
                  <div className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1.2rem' }}>
                    Tool {tool.number}{tool.tgcActive ? ' · TGC Active' : ''}
                  </div>
                  <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: '1.75rem', lineHeight: 1.15, marginBottom: '0.5rem' }}>
                    {tool.title}
                  </h2>
                  <p className="tgc-sans" style={{ fontSize: '1rem', color: '#c8aa4a', marginBottom: '1.2rem' }}>
                    {tool.subtitle}
                  </p>
                  <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.85, marginBottom: '2rem' }}>
                    {tool.description}
                  </p>
                  <div className="tgc-mono" style={{ color: '#c8aa4a', position: 'absolute', bottom: '2rem', left: '2rem' }}>
                    {tool.cta} →
                  </div>
                </div>
              </Link>
            ) : (
              <div
                key={tool.id}
                className="tool-card"
                style={{
                  background: 'transparent',
                  border: '1.5px solid #e5e7eb',
                  color: '#1a1815',
                  padding: '2.5rem 2rem',
                  height: '100%',
                  boxSizing: 'border-box',
                  opacity: 0.65,
                  position: 'relative',
                  borderRadius: '8px',
                }}
              >
                <div className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '1.2rem' }}>
                  Tool {tool.number}
                </div>
                <h2 className="tgc-serif" style={{ fontWeight: 400, fontSize: '1.75rem', lineHeight: 1.15, marginBottom: '0.5rem' }}>
                  {tool.title}
                </h2>
                <p className="tgc-sans" style={{ fontSize: '1rem', color: '#c8aa4a', marginBottom: '1.2rem' }}>
                  {tool.subtitle}
                </p>
                <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.7, marginBottom: '2rem' }}>
                  {tool.description}
                </p>
                <div className="tgc-mono" style={{ color: '#6b7280', position: 'absolute', bottom: '2rem', left: '2rem' }}>
                  {tool.cta}
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* Footer thesis */}
      <section style={{ borderTop: '1px solid #e5e7eb', padding: '3rem 2.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          {[
            { label: 'The thesis', text: 'Quiet beats loud. Adjacent markets, smaller airports, and the clinic nobody markets heavily are almost always the better answer.' },
            { label: 'The model', text: 'We advise first, then execute. Every tool captures your brief and hands off to a Gatekeeper. No bots, no auto-booking.' },
            { label: 'The edge', text: 'Off-market access, structuring before search, and a network built over time in markets that reward patience.' },
          ].map((item) => (
            <div key={item.label}>
              <p className="tgc-mono" style={{ color: '#c8aa4a', marginBottom: '0.8rem' }}>{item.label}</p>
              <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.7, color: '#6b7280' }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span className="tgc-serif" style={{ color: '#6b7280' }}>
            The Gatekeepers Club
          </span>
          <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#6b7280' }}>
            thegatekeepers.club &middot; jeeves@thegatekeepers.club
          </span>
        </div>
      </section>
    </div>
  )
}
