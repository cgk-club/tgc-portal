export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyClientSession, CLIENT_COOKIE_NAME } from "@/lib/client-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string; docId: string }> }
) {
  try {
    const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = await verifyClientSession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, docId } = await params;
    const supabase = getSupabaseAdmin();

    // Verify client owns this itinerary
    const { data: itinerary } = await supabase
      .from("itineraries")
      .select("id")
      .eq("id", id)
      .eq("client_account_id", session.clientId)
      .single();

    if (!itinerary) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Verify document exists and requires signature
    const { data: doc } = await supabase
      .from("payment_documents")
      .select("id, requires_signature, signature_status")
      .eq("id", docId)
      .single();

    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    if (!doc.requires_signature) return NextResponse.json({ error: "Document does not require signature" }, { status: 400 });
    if (doc.signature_status === "signed") return NextResponse.json({ error: "Already signed" }, { status: 400 });

    const body = await request.json();
    const { signed_by_name, signed_by_email, signature_data } = body;

    if (!signed_by_name || !signed_by_email || !signature_data) {
      return NextResponse.json({ error: "Name, email, and signature required" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create signature record
    const { data: signature, error: sigError } = await supabase
      .from("document_signatures")
      .insert({
        payment_document_id: docId,
        signed_by_name,
        signed_by_email,
        ip_address: ip,
        user_agent: userAgent,
        signature_data,
      })
      .select()
      .single();

    if (sigError) throw sigError;

    // Update document status
    await supabase
      .from("payment_documents")
      .update({ signature_status: "signed" })
      .eq("id", docId);

    return NextResponse.json(signature, { status: 201 });
  } catch (error) {
    console.error("Signature submission error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
