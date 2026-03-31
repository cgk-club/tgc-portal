export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string; docId: string }> }
) {
  try {
    const { docId } = await params;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("payment_documents")
      .select("*, signatures:document_signatures(*)")
      .eq("id", docId)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Payment document fetch error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string; docId: string }> }
) {
  try {
    const { docId } = await params;
    const supabase = getSupabaseAdmin();

    // Fetch document to get storage path
    const { data: doc } = await supabase
      .from("payment_documents")
      .select("file_url")
      .eq("id", docId)
      .single();

    if (doc?.file_url && doc.file_url.includes("supabase.co")) {
      const url = new URL(doc.file_url);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/fiche-images\/(.*)/);
      if (pathMatch) {
        await supabase.storage.from("fiche-images").remove([pathMatch[1]]);
      }
    }

    const { error } = await supabase
      .from("payment_documents")
      .delete()
      .eq("id", docId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment document delete error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
