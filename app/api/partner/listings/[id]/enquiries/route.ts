import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();

  // Verify listing ownership
  const { data: listing } = await sb
    .from("listings")
    .select("id, partner_account_id, title")
    .eq("id", id)
    .eq("partner_account_id", session.partnerId)
    .single();

  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const { data: enquiries, error } = await sb
    .from("enquiries")
    .select("*")
    .eq("listing_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const enriched = (enquiries || []).map((e: Record<string, unknown>) => ({
    ...e,
    listing_title: listing.title,
  }));

  return NextResponse.json(enriched);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();

  // Verify listing ownership
  const { data: listing } = await sb
    .from("listings")
    .select("id, partner_account_id")
    .eq("id", id)
    .eq("partner_account_id", session.partnerId)
    .single();

  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const body = await request.json();
  const { enquiry_id, status } = body;

  if (!enquiry_id || !status) {
    return NextResponse.json({ error: "enquiry_id and status required" }, { status: 400 });
  }

  const allowedStatuses = ["responded", "negotiating", "declined"];
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("enquiries")
    .update({ status })
    .eq("id", enquiry_id)
    .eq("listing_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
