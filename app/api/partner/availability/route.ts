import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const ficheId = searchParams.get("fiche_id");

  let query = getSupabaseAdmin()
    .from("partner_availability")
    .select("*")
    .eq("partner_id", session.partnerId)
    .order("date_start", { ascending: true });

  if (ficheId) {
    query = query.eq("fiche_id", ficheId);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (!body.fiche_id || !body.date_start || !body.date_end || !body.availability_type) {
    return NextResponse.json(
      { error: "fiche_id, date_start, date_end, and availability_type required" },
      { status: 400 }
    );
  }

  const { data, error } = await getSupabaseAdmin()
    .from("partner_availability")
    .insert({
      partner_id: session.partnerId,
      fiche_id: body.fiche_id,
      date_start: body.date_start,
      date_end: body.date_end,
      availability_type: body.availability_type,
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
