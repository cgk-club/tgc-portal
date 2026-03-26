import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ficheId } = await params;

  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();
  const partnerId = session.partnerId;

  // Verify fiche ownership
  const { data: fiche } = await sb
    .from("fiches")
    .select("id, partner_account_id, airtable_record_id")
    .eq("id", ficheId)
    .single();

  if (!fiche) return NextResponse.json({ error: "Fiche not found" }, { status: 404 });

  let isOwner = fiche.partner_account_id === partnerId;
  if (!isOwner) {
    const { data: partner } = await sb
      .from("partner_accounts")
      .select("org_ids")
      .eq("id", partnerId)
      .single();

    const orgIds = partner?.org_ids || [];
    isOwner = !!(fiche.airtable_record_id && orgIds.includes(fiche.airtable_record_id));
  }

  if (!isOwner) return NextResponse.json({ error: "Fiche not found" }, { status: 404 });

  const { changes } = await request.json();
  if (!changes || typeof changes !== "object") {
    return NextResponse.json({ error: "Changes object required" }, { status: 400 });
  }

  const { data: editRequest, error } = await sb
    .from("fiche_edit_requests")
    .insert({
      fiche_id: ficheId,
      partner_id: partnerId,
      changes,
      status: "pending",
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(editRequest, { status: 201 });
}
