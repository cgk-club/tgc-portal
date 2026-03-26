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
import { Itinerary, ItineraryDay, ItineraryItem } from '@/types'
import Button from '@/components/ui/Button'

const GREEN = '#0e4f51'
const GOLD = '#c8aa4a'
const PEARL = '#F9F8F5'

const TIME_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  morning: 'Morning',
  lunch: 'Lunch',
  afternoon: 'Afternoon',
  evening: 'Evening',
  dinner: 'Dinner',
  late_night: 'Late Night',
}

const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF' },
  coverPage: { padding: 50, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  brand: { fontSize: 10, letterSpacing: 3, color: GOLD, marginBottom: 30, textTransform: 'uppercase' as const },
  curatedFor: { fontSize: 11, color: '#888888', marginBottom: 8 },
  clientName: { fontSize: 28, color: GREEN, fontFamily: 'Helvetica-Bold', marginBottom: 10 },
  itineraryTitle: { fontSize: 16, color: GOLD, marginBottom: 20 },
  dateRange: { fontSize: 10, color: '#888888', marginBottom: 6 },
  stats: { fontSize: 10, color: '#888888', marginBottom: 40 },
  tagline: { fontSize: 10, color: '#888888', fontStyle: 'italic', marginTop: 30 },
  dayHeader: { backgroundColor: GREEN, padding: 10, marginBottom: 12, marginTop: 20 },
  dayHeaderText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Helvetica-Bold' },
  dayDate: { color: '#FFFFFF', fontSize: 9, opacity: 0.8, marginTop: 2 },
  ficheItem: { marginBottom: 10, padding: 10, backgroundColor: PEARL, borderRadius: 4 },
  ficheName: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: GREEN, marginBottom: 2 },
  ficheTime: { fontSize: 9, color: GOLD, marginBottom: 4 },
  ficheDesc: { fontSize: 9, color: '#555555', lineHeight: 1.4 },
  noteItem: { marginBottom: 10, padding: 10, borderLeftWidth: 3, borderLeftColor: GOLD, backgroundColor: PEARL, borderRadius: 4 },
  noteTitle: { fontSize: 10, fontStyle: 'italic', color: '#555555', marginBottom: 2 },
  noteText: { fontSize: 9, fontStyle: 'italic', color: '#777777' },
  footer: { padding: 50, fontFamily: 'Helvetica', justifyContent: 'center', alignItems: 'center' },
  footerBrand: { fontSize: 10, letterSpacing: 3, color: GOLD, marginBottom: 20, textTransform: 'uppercase' as const },
  footerText: { fontSize: 10, color: '#888888', marginBottom: 4 },
  footerEmail: { fontSize: 10, color: GREEN, marginTop: 10 },
  footerUrl: { fontSize: 9, color: '#888888', marginTop: 4 },
})

function formatDayDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatTimeLabel(item: ItineraryItem) {
  const parts: string[] = []
  if (item.time_of_day) parts.push(TIME_LABELS[item.time_of_day] || item.time_of_day)
  if (item.exact_time) parts.push(item.exact_time)
  return parts.join(' \u00B7 ')
}

function ItineraryPDF({ itinerary }: { itinerary: Itinerary }) {
  const days = itinerary.days || []
  const destinations = new Set<string>()
  for (const day of days) {
    for (const item of day.items || []) {
      if (item.fiche) destinations.add(item.custom_title || item.fiche.headline || '')
    }
  }

  let dateRange = ''
  if (itinerary.start_date) {
    const start = new Date(itinerary.start_date + 'T00:00:00')
    const end = new Date(start)
    end.setDate(end.getDate() + days.length - 1)
    dateRange = `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} \u2013 ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
  }

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.brand}>THE GATEKEEPERS CLUB</Text>
        <Text style={styles.curatedFor}>A journey curated for</Text>
        <Text style={styles.clientName}>{itinerary.client_name}</Text>
        <Text style={styles.itineraryTitle}>{itinerary.title}</Text>
        {dateRange && <Text style={styles.dateRange}>{dateRange}</Text>}
        <Text style={styles.stats}>
          {days.length} days {destinations.size > 0 ? `\u00B7 ${destinations.size} destinations` : ''}
        </Text>
        <Text style={styles.tagline}>Curated travel, crafted personally</Text>
      </Page>

      {/* Day Pages - one page per day */}
      {days.map((day: ItineraryDay) => (
        <Page key={day.id} size="A4" style={styles.page} wrap>
          <View style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>
              Day {day.day_number}{day.title ? ` \u2014 ${day.title}` : ''}
            </Text>
            {day.date && (
              <Text style={styles.dayDate}>{formatDayDate(day.date)}</Text>
            )}
          </View>

          {day.notes && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 10, color: '#777777', fontStyle: 'italic', lineHeight: 1.5 }}>
                {day.notes}
              </Text>
            </View>
          )}

          {(day.items || []).map((item: ItineraryItem) =>
            item.item_type === 'note' ? (
              <View key={item.id} style={styles.noteItem} wrap={false}>
                {formatTimeLabel(item) && (
                  <Text style={styles.ficheTime}>{formatTimeLabel(item)}</Text>
                )}
                {item.custom_title && (
                  <Text style={styles.noteTitle}>{item.custom_title}</Text>
                )}
                {item.custom_note && (
                  <Text style={styles.noteText}>{item.custom_note}</Text>
                )}
              </View>
            ) : (
              <View key={item.id} style={styles.ficheItem} wrap={false}>
                {formatTimeLabel(item) && (
                  <Text style={styles.ficheTime}>{formatTimeLabel(item)}</Text>
                )}
                <Text style={styles.ficheName}>
                  {item.custom_title || item.fiche?.headline || 'Untitled'}
                </Text>
                {item.custom_note && (
                  <Text style={{ fontSize: 9, color: '#555555', lineHeight: 1.5, marginTop: 4 }}>
                    {item.custom_note}
                  </Text>
                )}
              </View>
            )
          )}
        </Page>
      ))}

      {/* Contact Footer Page */}
      <Page size="A4" style={[styles.page, styles.footer]}>
        <Text style={styles.footerBrand}>THE GATEKEEPERS CLUB</Text>
        <Text style={styles.footerText}>To discuss any element of your journey:</Text>
        <Text style={styles.footerEmail}>christian@thegatekeepers.club</Text>
        <Text style={styles.footerUrl}>thegatekeepers.club</Text>
      </Page>
    </Document>
  )
}

interface PDFExportProps {
  itinerary: Itinerary
}

export default function PDFExport({ itinerary }: PDFExportProps) {
  const [generating, setGenerating] = useState(false)

  async function handleDownload() {
    setGenerating(true)
    try {
      const blob = await pdf(<ItineraryPDF itinerary={itinerary} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const fileName = `TGC-${itinerary.client_name}-${itinerary.title}`
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
      a.href = url
      a.download = `${fileName}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation failed:', err)
    }
    setGenerating(false)
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDownload} disabled={generating}>
      {generating ? 'Generating...' : 'Download PDF'}
    </Button>
  )
}
