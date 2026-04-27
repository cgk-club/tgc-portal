import { Highlight } from '@/types'
import { getFeatureIcon } from '@/lib/ficheIconMap'

interface FicheHighlightsProps {
  highlights: Highlight[]
}

export default function FicheHighlights({ highlights }: FicheHighlightsProps) {
  if (!highlights.length) return null

  return (
    <div className="bg-green-muted py-10 px-8 md:px-12 lg:px-16">
      <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-8">
        {highlights.map((h, i) => {
          // Label may carry the value inline ("Bedrooms: 6") when value is empty
          const displayLabel = h.value ? h.label : h.label.replace(/:.*$/, '').trim()
          const displayValue = h.value || h.label.replace(/^[^:]+:\s*/, '').trim()
          const iconSrc = h.value ? h.label : h.label

          return (
            <div key={i} className="flex flex-col items-center text-center gap-2">
              <div className="text-green opacity-70">
                {getFeatureIcon(iconSrc)}
              </div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-widest font-body leading-tight">
                  {displayLabel}
                </div>
                {displayValue && (
                  <div className="text-sm font-medium text-green font-body mt-0.5 leading-snug">
                    {displayValue}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
