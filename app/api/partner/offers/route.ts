import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { partnerOwnsFiche } from "@/lib/partner-fiches";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("partner_offers")
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
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // If the offer is tied to a fiche, ensure it belongs to this partner.
  if (body.fiche_id && !(await partnerOwnsFiche(sb, session.partnerId, body.fiche_id))) {
    return NextResponse.json({ error: "Fiche not found" }, { status: 404 });
  }

  const { data, error } = await sb
    .from("partner_offers")
    .insert({
      partner_id: session.partnerId,
      fiche_id: body.fiche_id || null,
      title: body.title,
      description: body.description || null,
      discount_type: body.discount_type || null,
      discount_value: body.discount_value || null,
      valid_from: body.valid_from || null,
      valid_to: body.valid_to || null,
      terms: body.terms || null,
      tier: body.tier || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
