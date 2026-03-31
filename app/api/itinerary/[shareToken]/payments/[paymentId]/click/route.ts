export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string; paymentId: string }> }
) {
  try {
    const { shareToken, paymentId } = await params;
    const supabase = getSupabaseAdmin();

    const { data: itinerary } = await supabase
      .from("itineraries")
      .select("id")
      .eq("share_token", shareToken)
      .single();

    if (!itinerary) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: payment } = await supabase
      .from("payment_items")
      .select("id, link_click_count")
      .eq("id", paymentId)
      .eq("itinerary_id", itinerary.id)
      .single();

    if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await supabase
      .from("payment_items")
      .update({
        link_click_count: (payment.link_click_count || 0) + 1,
        last_clicked_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Click tracking error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
