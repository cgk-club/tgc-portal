import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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

  // Verify ownership
  const { data: entry } = await sb
    .from("partner_availability")
    .select("id, partner_id")
    .eq("id", id)
    .eq("partner_id", session.partnerId)
    .single();

  if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

  const { error } = await sb
    .from("partner_availability")
    .delete()
    .eq("id", id)
    .eq("partner_id", session.partnerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
