import { NextRequest, NextResponse } from 'next/server'
import { getCalendarEvents } from '@/lib/google-calendar'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month') // YYYY-MM

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: 'Missing or invalid month parameter. Expected YYYY-MM.' },
      { status: 400 }
    )
  }

  const [yearStr, monthStr] = month.split('-')
  const year = parseInt(yearStr, 10)
  const monthNum = parseInt(monthStr, 10) // 1-based

  // First day of month at midnight UTC
  const timeMin = new Date(Date.UTC(year, monthNum - 1, 1)).toISOString()
  // First day of next month at midnight UTC (exclusive upper bound)
  const timeMax = new Date(Date.UTC(year, monthNum, 1)).toISOString()

  try {
    const events = await getCalendarEvents(timeMin, timeMax)
    return NextResponse.json({ events })
  } catch {
    // Graceful fallback: return empty array on any failure
    return NextResponse.json({ events: [] })
  }
}
