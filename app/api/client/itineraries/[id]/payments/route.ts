export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyClientSession, CLIENT_COOKIE_NAME } from "@/lib/client-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyClientSession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Verify itinerary belongs to this client
    const { data: itinerary } = await supabase
      .from("itineraries")
      .select("id, title, client_name, currency, client_account_id")
      .eq("id", id)
      .eq("client_account_id", session.clientId)
      .single();

    if (!itinerary) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Fetch payment items (exclude internal notes)
    const { data: payments, error } = await supabase
      .from("payment_items")
      .select("id, itinerary_id, service_name, supplier_name, amount, currency, payment_method, payment_status, cc_payment_url, bank_details, deposit_deadline, client_notes, sort_order, created_at, updated_at")
      .eq("itinerary_id", id)
      .neq("payment_status", "cancelled")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      itinerary: {
        id: itinerary.id,
        title: itinerary.title,
        client_name: itinerary.client_name,
        currency: itinerary.currency,
      },
      payments: payments || [],
    });
  } catch (error) {
    console.error("Client payments fetch error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
