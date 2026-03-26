import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

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
  const { data: event } = await sb
    .from("partner_events")
    .select("id, partner_id, status")
    .eq("id", id)
    .eq("partner_id", session.partnerId)
    .single();

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const body = await request.json();
  const allowedFields = [
    "title", "category", "date_display", "date_start", "date_end",
    "location", "capacity", "price", "description", "highlights", "image_url",
    "is_free", "pricing_tiers",
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  // If editing an approved/active event, reset status to pending for re-approval
  if (event.status === "approved") {
    updates.status = "pending";
    updates.admin_note = "Updated by partner, pending re-approval";
  }

  const { data, error } = await sb
    .from("partner_events")
    .update(updates)
    .eq("id", id)
    .eq("partner_id", session.partnerId)
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

  // Verify ownership and draft status
  const { data: event } = await sb
    .from("partner_events")
    .select("id, partner_id, status")
    .eq("id", id)
    .eq("partner_id", session.partnerId)
    .single();

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  if (event.status !== "draft") {
    return NextResponse.json({ error: "Only draft events can be deleted" }, { status: 403 });
  }

  const { error } = await sb
    .from("partner_events")
    .delete()
    .eq("id", id)
    .eq("partner_id", session.partnerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
