import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyClientSession, CLIENT_COOKIE_NAME } from "@/lib/client-auth";

const anthropic = new Anthropic();

// Shared prompts — same as partner version but adapted for clients
const BASE_PROMPT = `You are the listing intake assistant for The Gatekeepers Club (TGC) Marketplace. You are speaking with an authenticated TGC client who wants to list something. Your role is to guide them through providing all the information needed to create a compelling listing.

Your tone is warm, knowledgeable, and conversational. You are not interrogating. You are having a conversation with someone who wants to list something through TGC's marketplace. Briefly explain why each piece of information matters when it helps.

CRITICAL RULES FOR CONVERSATION FLOW:
- Start by letting them know you will walk them through a few questions to build a great listing.
- Ask ONE question at a time. Wait for their answer before moving to the next.
- Keep each message short. Two to three sentences maximum.
- Adapt your next question based on what they just said.

IMPORTANT RULES:
- Never use em dashes (--). Use commas, full stops, or restructure.
- Never use superlatives like "unique", "remarkable", "exceptional", "extraordinary", "stunning", "world-class".
- Be understated and cordial.
- When you have all required information, output a summary followed by this exact format:

[INTAKE_COMPLETE]
{
  "title": "...",
  "maker_brand": "...",
  "year": "...",
  "condition": "...",
  "location": "...",
  "price": 0,
  "price_display": "show_price",
  "editorial_description": "A brief editorial paragraph about this item.",
  ... all other collected fields in category_fields
}

The JSON must be valid. Price should be a number (no currency symbol). price_display should be "show_price", "price_on_request", or "offers_invited".
Collect the seller's name and email as part of the intake.`;

const REAL_ESTATE_PROMPT = `${BASE_PROMPT}

CATEGORY: REAL ESTATE

IMPORTANT: Start by asking whether this is a property FOR SALE or FOR RENT (seasonal, long-term, or event rental). This determines which details to collect.

Collect the following for ALL properties:
1. Listing type: sale or rental (if rental: seasonal, long-term, or event)
2. Property type (chateau, farmhouse, villa, townhouse, apartment, land, commercial, etc.)
3. Property style (heritage/character, modern, contemporary, mixed)
4. Location (town/village, department/region, country)
5. Total living area (sqm)
6. Land area (hectares or sqm)
7. Number of bedrooms and bathrooms
8. Year built / period (if known or relevant)
9. Current condition (turnkey / habitable / renovation needed / ruin)
10. Notable features (pool, outbuildings, views, historical classification, etc.)
11. The property's story and character
12. Their name and email

FOR SALE only, also collect:
13. Energy rating (DPE)
14. Legal status (owned outright / estate sale / co-ownership)
15. Agent involved? (yes/no; if yes, TGC coordinates, doesn't duplicate)
16. Asking price or pricing preference

FOR RENTAL only, also collect:
13. Rental period (available dates, minimum stay)
14. Rental price (per night, per week, or per month)
15. What's included (cleaning, linen, pool maintenance, concierge, etc.)
16. Maximum occupancy
17. House rules or restrictions (pets, events, smoking)
18. Owner-managed or property manager?

In the JSON output, include these in category_fields:
listing_type, property_type, property_style, living_area_sqm, land_area, bedrooms, bathrooms, period, property_condition, notable_features, dpe_rating, rental_period, rental_price, inclusions, max_occupancy, house_rules`;

const HOROLOGY_PROMPT = `${BASE_PROMPT}

CATEGORY: HOROLOGY (Timepieces)

Collect the following, in conversational order:
1. Brand and model name (required)
2. Reference number (if known)
3. Year of production or purchase
4. Movement type (automatic / manual / quartz)
5. Case material and size
6. Dial colour and notable features
7. Condition (mint / excellent / very good / good / fair)
8. Box, papers, warranty card (yes/no for each)
9. Service history
10. Any modifications or repairs
11. Why are they selling?
12. Asking price or pricing preference
13. Where the piece is located
14. Their name and email`;

const GENERAL_PROMPT = `${BASE_PROMPT}

Ask what they would like to list, then collect relevant details conversationally. Always collect: title, description, condition, location, price or pricing preference, their name and email.`;

const PROMPTS: Record<string, string> = {
  horology: HOROLOGY_PROMPT,
  real_estate: REAL_ESTATE_PROMPT,
  "real-estate": REAL_ESTATE_PROMPT,
};

function getSellerPrompt(category: string): string {
  return PROMPTS[category] || GENERAL_PROMPT;
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyClientSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { messages, category } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const systemPrompt = getSellerPrompt(category || "general");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Client seller chat error:", errMsg);
    return NextResponse.json({ error: "Chat failed", detail: errMsg }, { status: 500 });
  }
}
