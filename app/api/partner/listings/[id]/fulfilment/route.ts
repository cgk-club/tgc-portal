import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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
  const { order_id, fulfilment_status, tracking_number } = body;

  if (!order_id || !fulfilment_status) {
    return NextResponse.json(
      { error: "order_id and fulfilment_status required" },
      { status: 400 }
    );
  }

  const allowedStatuses = ["processing", "shipped", "delivered", "cancelled"];
  if (!allowedStatuses.includes(fulfilment_status)) {
    return NextResponse.json({ error: "Invalid fulfilment status" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    fulfilment_status,
    updated_at: new Date().toISOString(),
  };

  if (tracking_number) {
    updates.tracking_number = tracking_number;
  }

  const { data, error } = await sb
    .from("marketplace_orders")
    .update(updates)
    .eq("id", order_id)
    .eq("listing_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
