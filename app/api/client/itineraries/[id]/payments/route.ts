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
      .select("id, title, client_name, currency, client_account_id, share_token, default_bank_details")
      .eq("id", id)
      .eq("client_account_id", session.clientId)
      .single();

    if (!itinerary) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Fetch payment items (exclude internal notes)
    const { data: payments, error } = await supabase
      .from("payment_items")
      .select("id, itinerary_id, service_name, supplier_name, amount, currency, client_amount, payment_method, payment_status, cc_payment_url, bank_details, deposit_deadline, paid_at, deposit_paid_at, client_notes, sort_order, created_at, updated_at")
      .eq("itinerary_id", id)
      .neq("payment_status", "cancelled")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    // Fetch documents for all payment items
    const paymentIds = (payments || []).map((p: { id: string }) => p.id);
    let documents: Record<string, unknown[]> = {};
    if (paymentIds.length > 0) {
      const { data: docs } = await supabase
        .from("payment_documents")
        .select("id, payment_item_id, title, file_url, file_type, document_category, requires_signature, signature_status, created_at")
        .in("payment_item_id", paymentIds);
      if (docs) {
        for (const doc of docs) {
          const pid = (doc as { payment_item_id: string }).payment_item_id;
          if (!documents[pid]) documents[pid] = [];
          documents[pid].push(doc);
        }
      }
    }

    // Attach documents to each payment
    const paymentsWithDocs = (payments || []).map((p: { id: string }) => ({
      ...p,
      documents: documents[p.id] || [],
    }));

    return NextResponse.json({
      itinerary: {
        id: itinerary.id,
        title: itinerary.title,
        client_name: itinerary.client_name,
        currency: itinerary.currency,
        share_token: itinerary.share_token,
        default_bank_details: itinerary.default_bank_details,
      },
      payments: paymentsWithDocs,
    });
  } catch (error) {
    console.error("Client payments fetch error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
