'use client'

import { useState } from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer'
import { Itinerary, ItineraryDay, ItineraryItem, QuoteCalculation } from '@/types'
import { formatCurrency } from '@/lib/quote'
import Button from '@/components/ui/Button'

const GREEN = '#0e4f51'
const GOLD = '#c8aa4a'

const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF' },
  coverPage: { padding: 50, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  brand: { fontSize: 10, letterSpacing: 3, color: GOLD, marginBottom: 30, textTransform: 'uppercase' as const },
  proposal: { fontSize: 11, color: '#888888', marginBottom: 8 },
  clientName: { fontSize: 28, color: GREEN, fontFamily: 'Helvetica-Bold', marginBottom: 10 },
  ref: { fontSize: 10, color: '#888888', marginBottom: 6 },
  validity: { fontSize: 9, color: '#888888', marginTop: 20 },
  dayHeader: { backgroundColor: GREEN, padding: 8, marginBottom: 8, marginTop: 16 },
  dayHeaderText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Helvetica-Bold' },
  lineItem: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  itemName: { fontSize: 10, color: '#333333', flex: 1 },
  itemNote: { fontSize: 8, color: '#888888', marginTop: 2 },
  itemPrice: { fontSize: 10, color: '#333333', fontFamily: 'Helvetica-Bold', textAlign: 'right' as const, width: 100 },
  zeroLabel: { fontSize: 7, color: GOLD, marginTop: 1 },
  summaryBox: { marginTop: 30, padding: 15, backgroundColor: '#F5F5F5', borderRadius: 4 },
  summaryRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginBottom: 6 },
  summaryLabel: { fontSize: 10, color: '#555555' },
  summaryValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#333333' },
  totalRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, borderTopWidth: 1, borderTopColor: GREEN, paddingTop: 8, marginTop: 8 },
  totalLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: GREEN },
  totalValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: GREEN },
  pointsRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginTop: 8 },
  pointsLabel: { fontSize: 9, color: '#888888' },
  pointsValue: { fontSize: 9, color: GOLD, fontFamily: 'Helvetica-Bold' },
  termsTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: GREEN, marginTop: 30, marginBottom: 10 },
  termsText: { fontSize: 9, color: '#555555', lineHeight: 1.6, marginBottom: 4 },
  footer: { marginTop: 40, alignItems: 'center' as const },
  footerBrand: { fontSize: 10, letterSpacing: 3, color: GOLD, marginBottom: 8, textTransform: 'uppercase' as const },
  footerText: { fontSize: 9, color: '#888888' },
})

function QuotePDFDocument({ itinerary, calc }: { itinerary: Itinerary; calc: QuoteCalculation }) {
  const days = itinerary.days || []
  const currency = itinerary.currency || 'EUR'
  const year = new Date().getFullYear()
  const ref = `TGC-${year}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Document>
      {/* Cover */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.brand}>THE GATEKEEPERS CLUB</Text>
        <Text style={styles.proposal}>A proposal prepared for</Text>
        <Text style={styles.clientName}>{itinerary.client_name}</Text>
        <Text style={styles.ref}>Reference: {ref}</Text>
        <Text style={styles.ref}>Date: {today}</Text>
        <Text style={styles.validity}>Valid for 14 days</Text>
      </Page>

      {/* Line Items */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>THE GATEKEEPERS CLUB</Text>

        {days.map((day: ItineraryDay) => {
          const items = (day.items || []).filter((i: ItineraryItem) => i.is_included)
          if (items.length === 0) return null
          return (
            <View key={day.id}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>
                  Day {day.day_number}{day.title ? ` \u2014 ${day.title}` : ''}
                </Text>
              </View>
              {items.map((item: ItineraryItem) => (
                <View key={item.id}>
                  <View style={styles.lineItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>
                        {item.custom_title || item.fiche?.headline || 'Untitled'}
                      </Text>
                      {item.fiche?.description && (
                        <Text style={styles.itemNote}>
                          {item.fiche.description.slice(0, 120)}{item.fiche.description.length > 120 ? '...' : ''}
                        </Text>
                      )}
                      {item.is_zero_margin && (
                        <Text style={styles.zeroLabel}>Pass-through (zero margin)</Text>
                      )}
                    </View>
                    <Text style={styles.itemPrice}>
                      {item.unit_price != null
                        ? formatCurrency((item.unit_price || 0) * (item.quantity || 1), currency)
                        : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )
        })}

        {/* Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal (commissionable)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(calc.commissionableTotal, currency)}</Text>
          </View>
          {calc.zeroMarginTotal > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Zero-margin items</Text>
              <Text style={styles.summaryValue}>{formatCurrency(calc.zeroMarginTotal, currency)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              TGC Planning Fee {calc.feeRate > 0 ? `(${(calc.feeRate * 100).toFixed(1)}%)` : ''}
            </Text>
            <Text style={styles.summaryValue}>
              {calc.requiresNegotiation ? 'To be agreed' : formatCurrency(calc.feeAmount, currency)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL DUE</Text>
            <Text style={styles.totalValue}>{formatCurrency(calc.clientTotal, currency)}</Text>
          </View>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsLabel}>Gatekeeper Points earned</Text>
            <Text style={styles.pointsValue}>
              {calc.pointsEarned.toLocaleString()} pts ({formatCurrency(calc.pointsValue, currency)})
            </Text>
          </View>
        </View>
      </Page>

      {/* Terms */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>THE GATEKEEPERS CLUB</Text>
        <Text style={styles.termsTitle}>Payment Terms</Text>
        <Text style={styles.termsText}>
          50% due on signing to confirm the booking.
        </Text>
        <Text style={styles.termsText}>
          Balance due 30 days later.
        </Text>
        <Text style={styles.termsText}>
          If delivery is within 60 days of signing, 100% is due on signing.
        </Text>
        <Text style={styles.termsText}>
          Payment by SEPA bank transfer (preferred) or card via invoice link.
        </Text>
        <Text style={styles.termsText}>
          {`Cancellations and refunds are subject to the supplier's own terms.`}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>THE GATEKEEPERS CLUB</Text>
          <Text style={styles.footerText}>christian@thegatekeepers.club</Text>
          <Text style={styles.footerText}>thegatekeepers.club</Text>
        </View>
      </Page>
    </Document>
  )
}

interface QuotePDFProps {
  itinerary: Itinerary
  calc: QuoteCalculation
}

export default function QuotePDF({ itinerary, calc }: QuotePDFProps) {
  const [generating, setGenerating] = useState(false)

  async function handleDownload() {
    setGenerating(true)
    try {
      const blob = await pdf(
        <QuotePDFDocument itinerary={itinerary} calc={calc} />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const fileName = `TGC-Quote-${itinerary.client_name}-${itinerary.title}`
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
      a.href = url
      a.download = `${fileName}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Quote PDF generation failed:', err)
    }
    setGenerating(false)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      disabled={generating}
      className="w-full"
    >
      {generating ? 'Generating...' : 'Generate Quote PDF'}
    </Button>
  )
}
