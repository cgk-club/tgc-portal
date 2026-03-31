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

    const updates: Record<string, unknown> = { ...body, updated_at: new Date().toISOString() };

    // Auto-set payment date fields on status change
    if (body.payment_status) {
      const { data: current } = await supabase
        .from("payment_items")
        .select("payment_status")
        .eq("id", paymentId)
        .single();

      if (current) {
        const oldStatus = current.payment_status;
        const newStatus = body.payment_status;
        const now = new Date().toISOString();

        if (newStatus === "deposit_paid" && oldStatus !== "deposit_paid") {
          updates.deposit_paid_at = now;
        }
        if (["fully_paid", "confirmed"].includes(newStatus) && !["fully_paid", "confirmed"].includes(oldStatus)) {
          updates.paid_at = now;
        }
        if (newStatus === "pending") {
          updates.paid_at = null;
          updates.deposit_paid_at = null;
        }
        if (newStatus === "deposit_paid" && ["fully_paid", "confirmed"].includes(oldStatus)) {
          updates.paid_at = null;
        }
      }
    }

    const { data, error } = await supabase
      .from("payment_items")
      .update(updates)
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
