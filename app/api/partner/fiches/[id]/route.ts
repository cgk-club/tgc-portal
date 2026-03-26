import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

async function verifyFicheOwnership(partnerId: string, ficheId: string) {
  const sb = getSupabaseAdmin();

  const { data: fiche } = await sb
    .from("fiches")
    .select("*")
    .eq("id", ficheId)
    .single();

  if (!fiche) return null;

  // Check ownership: partner_account_id matches OR airtable_record_id is in partner's org_ids
  if (fiche.partner_account_id === partnerId) return fiche;

  const { data: org } = await sb
    .from("partner_accounts")
    .select("org_ids")
    .eq("id", partnerId)
    .single();

  const orgIds = org?.org_ids || [];
  if (fiche.airtable_record_id && orgIds.includes(fiche.airtable_record_id)) {
    return fiche;
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fiche = await verifyFicheOwnership(session.partnerId, id);
  if (!fiche) return NextResponse.json({ error: "Fiche not found" }, { status: 404 });

  return NextResponse.json(fiche);
}
