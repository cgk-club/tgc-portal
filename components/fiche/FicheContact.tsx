interface FicheContactProps {
  name: string
}

export default function FicheContact({ name }: FicheContactProps) {
  const subject = encodeURIComponent(`Enquiry: ${name}`)
  const mailto = `mailto:hello@thegatekeepers.club?subject=${subject}`

  return (
    <div className="py-12 px-8 md:px-12 lg:px-16 bg-green-muted">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="font-heading text-2xl font-semibold text-green mb-3">
          Interested in {name}?
        </h2>
        <p className="text-gray-600 font-body mb-6">
          Get in touch and we will tailor this to your plans.
        </p>
        <a
          href={mailto}
          className="inline-flex items-center justify-center rounded-[4px] bg-green text-white px-8 py-3 font-body font-medium hover:bg-green-light transition-colors"
        >
          Enquire about this property
        </a>
      </div>
    </div>
  )
}
