interface HighlightCard {
  imageUrl: string
  heading: string
  description?: string
}

interface FicheHighlightsEditorialProps {
  cards: HighlightCard[]
  stats?: { label: string; value: string }[]
}

export default function FicheHighlightsEditorial({
  cards,
  stats,
}: FicheHighlightsEditorialProps) {
  if (!cards.length) return null

  return (
    <section className="bg-green py-16 md:py-20 px-8 md:px-12 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Image cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className="relative aspect-[4/3] rounded-[8px] overflow-hidden group"
            >
              <img
                src={card.imageUrl}
                alt={card.heading}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-display text-lg text-gold font-semibold mb-1">
                  {card.heading}
                </h3>
                {card.description && (
                  <p className="text-white/70 text-sm font-body leading-snug">
                    {card.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Optional stats within dark section */}
        {stats && stats.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gold/20">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <dt className="text-[11px] font-body text-white/40 uppercase tracking-widest mb-1">
                    {stat.label}
                  </dt>
                  <dd className="text-base font-body font-semibold text-gold">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  )
}
