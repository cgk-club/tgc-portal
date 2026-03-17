import { Highlight } from '@/types'

interface FicheHighlightsProps {
  highlights: Highlight[]
}

export default function FicheHighlights({ highlights }: FicheHighlightsProps) {
  if (!highlights.length) return null

  return (
    <div className="bg-green-muted py-8 px-8 md:px-12 lg:px-16">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {highlights.map((h, i) => (
          <div key={i} className="text-center">
            <div className="text-2xl mb-1">{h.icon}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-body">
              {h.label}
            </div>
            <div className="text-sm font-medium text-green font-body mt-0.5">
              {h.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
