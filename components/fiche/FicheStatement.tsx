interface FicheStatementProps {
  statement: string
  backgroundImageUrl?: string | null
  variant?: 'dark' | 'image'
}

export default function FicheStatement({
  statement,
  backgroundImageUrl,
  variant = 'dark',
}: FicheStatementProps) {
  if (variant === 'image' && backgroundImageUrl) {
    return (
      <section className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-4xl mx-auto px-8 md:px-12 text-center">
          <p className="font-display italic text-2xl md:text-3xl lg:text-4xl text-white leading-relaxed">
            &ldquo;{statement}&rdquo;
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative w-full py-24 md:py-32 lg:py-40 bg-green overflow-hidden">
      <div className="max-w-4xl mx-auto px-8 md:px-12 text-center">
        <p className="font-display italic text-2xl md:text-3xl lg:text-4xl text-gold leading-relaxed">
          &ldquo;{statement}&rdquo;
        </p>
      </div>
    </section>
  )
}
