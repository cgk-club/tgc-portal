'use client'

import { QuoteCalculation } from '@/types'
import { formatCurrency } from '@/lib/quote'

interface QuoteSummaryProps {
  calc: QuoteCalculation
  currency: string
}

export default function QuoteSummary({ calc, currency }: QuoteSummaryProps) {
  return (
    <div className="bg-green-muted rounded-[8px] p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-gray-900">
          {formatCurrency(calc.commissionableTotal, currency)}
        </span>
      </div>

      {calc.zeroMarginTotal > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Zero-margin items</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(calc.zeroMarginTotal, currency)}
          </span>
        </div>
      )}

      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          TGC Planning Fee {calc.feeRate > 0 ? `(${(calc.feeRate * 100).toFixed(1)}%)` : ''}
        </span>
        <span className="font-medium text-gray-900">
          {calc.requiresNegotiation
            ? 'Negotiate'
            : formatCurrency(calc.feeAmount, currency)}
        </span>
      </div>

      <div className="border-t border-green/20 pt-2 flex justify-between text-sm">
        <span className="font-semibold text-green">Client Total</span>
        <span className="font-bold text-green text-base">
          {formatCurrency(calc.clientTotal, currency)}
        </span>
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Gatekeeper Points</span>
        <span className="text-gold font-medium">
          {calc.pointsEarned.toLocaleString()} pts ({formatCurrency(calc.pointsValue, currency)})
        </span>
      </div>

      {calc.requiresNegotiation && (
        <p className="text-xs text-red-500 mt-2">
          Service value exceeds {formatCurrency(1000000, currency)}. Fee requires negotiation.
        </p>
      )}
    </div>
  )
}
