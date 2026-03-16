interface FicheTagsProps {
  tags: string[]
}

export default function FicheTags({ tags }: FicheTagsProps) {
  if (!tags.length) return null

  return (
    <div className="py-8 px-8 md:px-12 lg:px-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-gold-light px-3 py-1 text-sm font-medium text-yellow-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
