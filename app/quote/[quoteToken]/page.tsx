import { notFound } from 'next/navigation'
import { getItineraryByQuoteToken } from '@/lib/itineraries'
import { calculateQuote, formatCurrency } from '@/lib/quote'

interface PageProps {
  params: Promise<{ quoteToken: string }>
}

export default async function QuotePage({ params }: PageProps) {
  const { quoteToken } = await params
  const itinerary = await getItineraryByQuoteToken(quoteToken)

  if (!itinerary) {
    notFound()
  }

  const days = itinerary.days || []
  const allItems = days.flatMap(d => d.items || [])
  const currency = itinerary.currency || 'EUR'
  const calc = calculateQuote(allItems, itinerary.is_member || false)
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-pearl">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 border-b border-gray-100">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          THE GATEKEEPERS CLUB
        </span>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Title */}
        <div className="text-center mb-10">
          <p className="text-sm text-gray-400 font-body mb-2">A proposal prepared for</p>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-green mb-2">
            {itinerary.client_name}
          </h1>
          <p className="font-heading text-lg text-gold mb-4">{itinerary.title}</p>
          <p className="text-xs text-gray-400 font-body">{today}</p>
        </div>

        {/* Line items */}
        {days.map(day => {
          const items = (day.items || []).filter(i => i.is_included)
          if (items.length === 0) return null
          return (
            <div key={day.id} className="mb-6">
              <div className="bg-green text-white px-4 py-2 rounded-t-[8px]">
                <h3 className="font-heading text-sm font-semibold">
                  Day {day.day_number}{day.title ? ` \u2014 ${day.title}` : ''}
                </h3>
              </div>
              <div className="bg-white border border-gray-100 rounded-b-[8px] divide-y divide-gray-100">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {item.custom_title || item.fiche?.headline || 'Untitled'}
                      </p>
                      {item.fiche?.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {item.fiche.description.slice(0, 100)}
                        </p>
                      )}
                    </div>
                    {item.unit_price != null && (
                      <span className="text-sm font-medium text-gray-700 ml-4 flex-shrink-0">
                        {formatCurrency((item.unit_price || 0) * (item.quantity || 1), currency)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Total */}
        <div className="bg-green-muted rounded-[8px] p-6 mt-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-body">Subtotal</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(calc.commissionableTotal + calc.zeroMarginTotal, currency)}
            </span>
          </div>
          {calc.feeAmount > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 font-body">Planning fee</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(calc.feeAmount, currency)}
              </span>
            </div>
          )}
          <div className="border-t border-green/20 pt-3 mt-3 flex justify-between">
            <span className="font-heading font-semibold text-green text-base">Total</span>
            <span className="font-heading font-bold text-green text-xl">
              {formatCurrency(calc.clientTotal, currency)}
            </span>
          </div>
          <div className="flex justify-between text-xs mt-3">
            <span className="text-gray-500 font-body">Gatekeeper Points earned</span>
            <span className="text-gold font-medium">
              {calc.pointsEarned.toLocaleString()} pts
            </span>
          </div>
        </div>

        {/* Payment terms */}
        <div className="mt-8 text-xs text-gray-400 font-body space-y-1">
          <p className="font-medium text-gray-500 text-sm mb-2">Payment terms</p>
          <p>50% due on signing to confirm the booking.</p>
          <p>Balance due 30 days later.</p>
          <p>If delivery is within 60 days of signing, 100% is due on signing.</p>
          <p>Payment by SEPA bank transfer (preferred) or card via invoice link.</p>
          <p>Cancellations and refunds are subject to the supplier&apos;s own terms.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 text-center">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          THE GATEKEEPERS CLUB
        </span>
        <p className="text-sm text-gray-400 font-body mt-2">
          christian@thegatekeepers.club
        </p>
        <p className="text-xs text-gray-300 font-body mt-1">
          thegatekeepers.club
        </p>
      </footer>
    </div>
  )
}
