import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();

  const body = await request.json();

  const { data, error } = await sb
    .from("project_partners")
    .update({ notes: body.notes ?? null })
    .eq("project_id", projectId)
    .eq("partner_id", session.partnerId)
    .eq("status", "active")
    .select("id, notes")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Not found" }, { status: error ? 500 : 404 });
  }

  return NextResponse.json(data);
}
