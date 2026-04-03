import Badge from '@/components/ui/Badge'

interface FicheHeroProps {
  name: string
  headline?: string | null
  category: string
  categorySub?: string
  location: string
  heroImageUrl?: string | null
  variant?: 'standard' | 'cinematic'
}

export default function FicheHero({
  name,
  headline,
  category,
  categorySub,
  location,
  heroImageUrl,
  variant = 'standard',
}: FicheHeroProps) {
  const displayCategory = categorySub || category

  // ── Cinematic variant (editorial templates) ──────────────────
  if (variant === 'cinematic') {
    return (
      <div className="relative w-full h-screen min-h-[600px] overflow-hidden">
        {heroImageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{ backgroundImage: `url(${heroImageUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-green" />
        )}
        {/* Multi-layer gradient for cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.3)_100%)]" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          {displayCategory && (
            <span className="inline-flex items-center rounded-full bg-white/15 backdrop-blur-sm border border-white/10 px-3 py-1 text-xs font-medium text-white tracking-wider uppercase mb-6">
              {displayCategory}
            </span>
          )}
          <h1 className="text-white font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 max-w-4xl">
            {name}
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-px bg-gold" />
            <p className="text-white/60 font-body text-sm md:text-base tracking-wide">
              {location}
            </p>
            <div className="w-8 h-px bg-gold" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/40 text-xs font-body tracking-widest uppercase">Scroll</span>
          <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    )
  }

  // ── Standard variant (unchanged, for non-migrated templates) ─
  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] min-h-[300px] sm:min-h-[400px] overflow-hidden">
      {heroImageUrl ? (
        <img
          src={heroImageUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-green" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16">
        <Badge variant="gold" className="mb-4 w-fit text-sm">
          {displayCategory}
        </Badge>
        <p className="text-white/70 font-body text-sm md:text-base mb-2">
          {location}
        </p>
        <h1 className="text-white font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 break-words">
          {name}
        </h1>
        {headline && (
          <p className="text-white/70 font-body text-lg md:text-xl max-w-2xl">
            {headline}
          </p>
        )}
      </div>
    </div>
  )
}
