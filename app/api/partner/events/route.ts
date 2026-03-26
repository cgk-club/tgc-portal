import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("partner_events")
    .select("*")
    .eq("partner_id", session.partnerId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (!body.title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("partner_events")
    .insert({
      partner_id: session.partnerId,
      title: body.title,
      category: body.category || null,
      date_display: body.date_display || null,
      date_start: body.date_start || null,
      date_end: body.date_end || null,
      location: body.location || null,
      capacity: body.capacity || null,
      price: body.price || null,
      description: body.description || null,
      highlights: body.highlights || null,
      image_url: body.image_url || null,
      is_free: body.is_free || false,
      pricing_tiers: body.pricing_tiers || [],
      status: "pending",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
