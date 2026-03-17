import Badge from '@/components/ui/Badge'

interface FicheHeroProps {
  name: string
  headline?: string | null
  category: string
  categorySub?: string
  location: string
  heroImageUrl?: string | null
}

export default function FicheHero({
  name,
  headline,
  category,
  categorySub,
  location,
  heroImageUrl,
}: FicheHeroProps) {
  const displayCategory = categorySub || category
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
