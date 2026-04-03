interface FicheSplitSectionProps {
  imageUrl: string
  imageAlt: string
  label?: string
  heading?: string
  content: string
  imagePosition: 'left' | 'right'
}

export default function FicheSplitSection({
  imageUrl,
  imageAlt,
  label,
  heading,
  content,
  imagePosition,
}: FicheSplitSectionProps) {
  return (
    <section className="py-16 md:py-20 px-8 md:px-12 lg:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Image — 7 columns on desktop */}
        <div
          className={`lg:col-span-7 ${imagePosition === 'right' ? 'lg:order-2' : ''}`}
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] group">
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
        </div>

        {/* Text — 5 columns on desktop */}
        <div
          className={`lg:col-span-5 ${imagePosition === 'right' ? 'lg:order-1' : ''}`}
        >
          {label && (
            <span className="text-gold text-xs font-body font-medium tracking-widest uppercase mb-4 block">
              {label}
            </span>
          )}
          {heading && (
            <h2 className="font-display text-2xl md:text-3xl text-green font-semibold leading-snug mb-6">
              {heading}
            </h2>
          )}
          <div className="font-body text-gray-600 text-base md:text-lg leading-relaxed whitespace-pre-line">
            {content}
          </div>
        </div>
      </div>
    </section>
  )
}
