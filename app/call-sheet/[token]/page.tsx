import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCallSheet } from '@/lib/events'
import CallSheetView from '@/components/event/CallSheetView'
import PrintButton from '@/components/event/PrintButton'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export const metadata: Metadata = {
  title: 'Your call sheet',
  robots: { index: false, follow: false },
}

// A guest's private call sheet. It exists only while the event's call-sheet
// switch is on; otherwise, and for any unknown link, it is simply not found.
export default async function CallSheetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const sheet = await getCallSheet(token)
  if (!sheet) notFound()

  return (
    <div className="min-h-screen bg-pearl print:bg-white">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 print:hidden">
        <span className="font-heading text-xs font-semibold tracking-[0.18em] text-gold uppercase">The Gatekeepers Club</span>
        <PrintButton />
      </header>
      <main className="max-w-xl mx-auto px-4 py-8 print:p-0">
        <p className="text-sm text-gray-500 font-body mb-6 print:hidden">
          {sheet.event.title}. Times are Paris time. This page updates as your plans change.
        </p>
        {sheet.days.length ? (
          <CallSheetView sheet={sheet} pageBreaks />
        ) : (
          <p className="text-sm text-gray-500 font-body">Your plans will appear here as they are confirmed.</p>
        )}
      </main>
    </div>
  )
}
