import Link from 'next/link'

export default function QuickActions() {
  const actions = [
    { label: 'New Itinerary', href: '/admin/itineraries', primary: true },
    { label: 'Add Client', href: '/admin/clients', primary: false },
    { label: 'New Fiche', href: '/admin/fiches', primary: false },
    { label: 'Supplier Rates', href: '/admin/rates', primary: false },
  ]

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
      {actions.map((a) => (
        <Link
          key={a.label}
          href={a.href}
          className={`inline-flex items-center justify-center rounded-[4px] px-5 py-3 font-body font-medium text-sm transition-colors ${
            a.primary
              ? 'bg-green text-white hover:bg-green-light'
              : 'border border-green text-green hover:bg-green-muted'
          }`}
        >
          {a.label}
        </Link>
      ))}
    </div>
  )
}
