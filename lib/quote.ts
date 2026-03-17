import { ItineraryItem, QuoteCalculation } from '@/types'

export function calculateQuote(
  items: ItineraryItem[],
  isMember: boolean
): QuoteCalculation {
  const commissionableTotal = items
    .filter(i => i.is_included && !i.is_zero_margin)
    .reduce((sum, i) => sum + ((i.unit_price || 0) * (i.quantity || 1)), 0)

  const zeroMarginTotal = items
    .filter(i => i.is_included && i.is_zero_margin)
    .reduce((sum, i) => sum + ((i.unit_price || 0) * (i.quantity || 1)), 0)

  let feeRate = 0
  let feeAmount = 0

  if (!isMember) {
    if (commissionableTotal < 50000) feeRate = 0.05
    else if (commissionableTotal < 100000) feeRate = 0.04
    else if (commissionableTotal < 250000) feeRate = 0.03
    else if (commissionableTotal < 500000) feeRate = 0.02
    else if (commissionableTotal <= 1000000) feeRate = 0.015
    else feeRate = 0 // flag for negotiation

    if (commissionableTotal > 0 && commissionableTotal <= 1000000) {
      feeAmount = Math.max(commissionableTotal * feeRate, 500) // minimum 500
    } else if (commissionableTotal > 1000000) {
      feeAmount = 0 // requires negotiation
    }
  }

  const clientTotal = commissionableTotal + zeroMarginTotal + feeAmount
  const pointsEarned = Math.round(clientTotal * (isMember ? 1 : 0.5))

  return {
    commissionableTotal,
    zeroMarginTotal,
    feeRate,
    feeAmount,
    clientTotal,
    pointsEarned,
    pointsValue: pointsEarned / 100,
    requiresNegotiation: !isMember && commissionableTotal > 1000000,
  }
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}
