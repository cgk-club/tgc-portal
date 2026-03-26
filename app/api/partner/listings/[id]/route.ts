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

  const { data: listing, error } = await sb
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("partner_account_id", session.partnerId)
    .single();

  if (error || !listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json(listing);
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

  // Verify ownership
  const { data: listing } = await sb
    .from("listings")
    .select("id, partner_account_id, status")
    .eq("id", id)
    .eq("partner_account_id", session.partnerId)
    .single();

  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const body = await request.json();
  const allowedFields = [
    "title", "price", "price_display", "location", "condition",
    "maker_brand", "year", "hero_image_url", "gallery_image_urls",
    "editorial_description", "category_fields", "status",
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  // Only allow certain status transitions from the partner side
  if (body.status) {
    const allowed = ["withdrawn"];
    if (!allowed.includes(body.status)) {
      delete updates.status;
    }
  }

  // If editing a live listing, set back to review
  if (listing.status === "live" && !body.status) {
    updates.status = "review";
  }

  const { data, error } = await sb
    .from("listings")
    .update(updates)
    .eq("id", id)
    .eq("partner_account_id", session.partnerId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();

  // Verify ownership and only allow deletion of draft/withdrawn
  const { data: listing } = await sb
    .from("listings")
    .select("id, partner_account_id, status")
    .eq("id", id)
    .eq("partner_account_id", session.partnerId)
    .single();

  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  if (!["draft", "withdrawn"].includes(listing.status)) {
    return NextResponse.json(
      { error: "Can only delete draft or withdrawn listings" },
      { status: 400 }
    );
  }

  const { error } = await sb
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("partner_account_id", session.partnerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
