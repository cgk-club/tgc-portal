interface Stat {
  label: string
  value: string
}

interface FicheStatsRibbonProps {
  stats: Stat[]
}

export default function FicheStatsRibbon({ stats }: FicheStatsRibbonProps) {
  if (!stats.length) return null

  const colClass =
    stats.length <= 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : stats.length === 4
        ? 'grid-cols-2 sm:grid-cols-4'
        : stats.length === 5
          ? 'grid-cols-2 sm:grid-cols-5'
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6'

  return (
    <section className="border-y border-gold/30 bg-pearl">
      <div className="max-w-5xl mx-auto px-8 md:px-12 lg:px-16 py-8">
        <dl className={`grid gap-6 ${colClass}`}>
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <dt className="text-[11px] font-body text-gray-400 uppercase tracking-widest mb-1">
                {stat.label}
              </dt>
              <dd className="text-base font-body font-semibold text-green">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
