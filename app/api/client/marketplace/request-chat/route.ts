import { NextRequest, NextResponse } from 'next/server'
import { verifyClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are the concierge at The Gatekeepers Club, a luxury concierge service. A client wants to find something specific. Your job is to understand exactly what they are looking for so the team can source it.

Guide the conversation warmly and professionally.

CRITICAL RULES FOR CONVERSATION FLOW:
- Start by letting them know you will ask a few quick questions to understand what they are after.
- Ask ONE question at a time. Wait for their answer before moving to the next.
- Keep each message short. Two to three sentences maximum.
- Adapt your next question based on what they just said.

You need to collect:
1. Category: horology, art, automobiles, real_estate, artisan_products, the_marina, or the_hangar
2. What specifically they are looking for (brand, model, style, period, etc.)
3. Budget range (minimum and maximum)
4. Timeline (how urgently they need it)
5. Flexibility (are they open to alternatives, or is it very specific?)
6. Any other details that would help (condition preferences, provenance requirements, location preferences for property)

When you have collected enough information, output the marker [REQUEST_COMPLETE] followed by a JSON object on the next line with these fields:
{
  "category": "...",
  "description": "detailed description of what they want",
  "budget_min": number or null,
  "budget_max": number or null,
  "timeline": "urgent/this_month/this_quarter/flexible",
  "flexibility": "exact/somewhat_flexible/very_flexible",
  "is_public": false
}

Rules:
- Be warm and knowledgeable, not formal
- Never use em dashes
- No superlatives (unique, remarkable, exceptional, extraordinary)
- ONE question at a time, never more
- If the client is vague, help them narrow down with specific options
- After collecting the info, summarise what you understood and confirm before completing`

export async function POST(request: NextRequest) {
  const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const session = await verifyClientSession(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages } = await request.json()
  const anthropic = new Anthropic()

  const chatMessages = messages.length === 0
    ? [{ role: 'user' as const, content: 'Hello, I am looking for something.' }]
    : messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: chatMessages,
  })

  const reply = response.content[0].type === 'text' ? response.content[0].text : ''

  // Check for completion marker
  const completeIdx = reply.indexOf('[REQUEST_COMPLETE]')
  if (completeIdx !== -1) {
    const cleanReply = reply.substring(0, completeIdx).trim()
    const jsonStr = reply.substring(completeIdx + '[REQUEST_COMPLETE]'.length).trim()
    try {
      const requestData = JSON.parse(jsonStr)
      return NextResponse.json({ reply: cleanReply, complete: true, requestData })
    } catch {
      return NextResponse.json({ reply: cleanReply, complete: false })
    }
  }

  return NextResponse.json({ reply, complete: false })
}
