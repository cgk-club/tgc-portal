export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("payment_documents")
      .select("*, signatures:document_signatures(*)")
      .eq("payment_item_id", paymentId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Payment documents fetch error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const supabase = getSupabaseAdmin();
    const formData = await request.formData();

    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const documentCategory = formData.get("document_category") as string || "other";
    const requiresSignature = formData.get("requires_signature") === "true";

    if (!file || !title) {
      return NextResponse.json({ error: "File and title required" }, { status: 400 });
    }

    // Upload to storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const path = `payments/${paymentId}/${timestamp}-${random}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("fiche-images")
      .upload(path, buffer, { contentType: file.type });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("fiche-images")
      .getPublicUrl(path);

    // Create document record
    const { data, error } = await supabase
      .from("payment_documents")
      .insert({
        payment_item_id: paymentId,
        title,
        file_url: publicUrl,
        file_type: ext.toUpperCase(),
        document_category: documentCategory,
        uploaded_by: "Admin",
        uploaded_by_type: "admin",
        requires_signature: requiresSignature,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Payment document upload error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
