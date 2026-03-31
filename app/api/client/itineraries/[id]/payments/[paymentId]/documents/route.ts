export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyClientSession, CLIENT_COOKIE_NAME } from "@/lib/client-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = await verifyClientSession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, paymentId } = await params;
    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: itinerary } = await supabase
      .from("itineraries")
      .select("id")
      .eq("id", id)
      .eq("client_account_id", session.clientId)
      .single();

    if (!itinerary) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data, error } = await supabase
      .from("payment_documents")
      .select("id, payment_item_id, title, file_url, file_type, document_category, requires_signature, signature_status, created_at")
      .eq("payment_item_id", paymentId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Client payment documents fetch error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = await verifyClientSession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, paymentId } = await params;
    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: itinerary } = await supabase
      .from("itineraries")
      .select("id")
      .eq("id", id)
      .eq("client_account_id", session.clientId)
      .single();

    if (!itinerary) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;

    if (!file || !title) {
      return NextResponse.json({ error: "File and title required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const path = `payments/${paymentId}/client/${timestamp}-${random}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("fiche-images")
      .upload(path, buffer, { contentType: file.type });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("fiche-images")
      .getPublicUrl(path);

    const { data, error } = await supabase
      .from("payment_documents")
      .insert({
        payment_item_id: paymentId,
        title,
        file_url: publicUrl,
        file_type: ext.toUpperCase(),
        document_category: "other",
        uploaded_by: session.email || "Client",
        uploaded_by_type: "client",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Client document upload error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
