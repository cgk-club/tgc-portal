import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

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

  // Verify ownership and draft status
  const { data: content } = await sb
    .from("partner_content")
    .select("id, partner_id, status")
    .eq("id", id)
    .eq("partner_id", session.partnerId)
    .single();

  if (!content) return NextResponse.json({ error: "Content not found" }, { status: 404 });

  if (content.status !== "draft") {
    return NextResponse.json({ error: "Only draft content can be edited" }, { status: 403 });
  }

  const body = await request.json();
  const allowedFields = ["type", "title", "body", "images"];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  const { data, error } = await sb
    .from("partner_content")
    .update(updates)
    .eq("id", id)
    .eq("partner_id", session.partnerId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();

  // Verify ownership and draft status
  const { data: content } = await sb
    .from("partner_content")
    .select("id, partner_id, status")
    .eq("id", id)
    .eq("partner_id", session.partnerId)
    .single();

  if (!content) return NextResponse.json({ error: "Content not found" }, { status: 404 });

  if (content.status !== "draft") {
    return NextResponse.json({ error: "Only draft content can be deleted" }, { status: 403 });
  }

  const { error } = await sb
    .from("partner_content")
    .delete()
    .eq("id", id)
    .eq("partner_id", session.partnerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
