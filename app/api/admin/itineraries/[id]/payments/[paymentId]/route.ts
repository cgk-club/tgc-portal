export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const { id, paymentId } = await params;
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("payment_items")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", paymentId)
      .eq("itinerary_id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Payment item update error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const { id, paymentId } = await params;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("payment_items")
      .delete()
      .eq("id", paymentId)
      .eq("itinerary_id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment item delete error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
