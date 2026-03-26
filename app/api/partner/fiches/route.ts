import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();
  const partnerId = session.partnerId;

  // Get org's org_ids
  const { data: org } = await sb
    .from("partner_accounts")
    .select("org_ids")
    .eq("id", partnerId)
    .single();

  const orgIds = org?.org_ids || [];

  // Fetch fiches by partner_account_id
  const { data: fichesByAccount, error: err1 } = await sb
    .from("fiches")
    .select("*")
    .eq("partner_account_id", partnerId)
    .order("updated_at", { ascending: false });

  if (err1) return NextResponse.json({ error: err1.message }, { status: 500 });

  // Fetch fiches by org_ids (airtable_record_id)
  let fichesByOrg: typeof fichesByAccount = [];
  if (orgIds.length > 0) {
    const { data, error: err2 } = await sb
      .from("fiches")
      .select("*")
      .in("airtable_record_id", orgIds)
      .order("updated_at", { ascending: false });

    if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
    fichesByOrg = data || [];
  }

  // Merge and deduplicate
  const seen = new Set<string>();
  const fiches = [];
  for (const f of [...(fichesByAccount || []), ...fichesByOrg]) {
    if (!seen.has(f.id)) {
      seen.add(f.id);
      fiches.push(f);
    }
  }

  return NextResponse.json(fiches);
}
