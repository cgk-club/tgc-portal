import { NextRequest, NextResponse } from 'next/server'
import { generateQuoteToken } from '@/lib/itineraries'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const token = await generateQuoteToken(id)
    return NextResponse.json({ quote_token: token })
  } catch (error) {
    console.error('Generate quote token error:', error)
    return NextResponse.json({ error: 'Failed to generate quote token' }, { status: 500 })
  }
}
