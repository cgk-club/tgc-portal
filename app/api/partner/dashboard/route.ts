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

  // Get org's org_ids for fiche lookup
  const { data: org } = await sb
    .from("partner_accounts")
    .select("org_ids")
    .eq("id", partnerId)
    .single();

  const orgIds = org?.org_ids || [];

  // Fiche count: fiches linked by partner_account_id OR airtable_record_id in org_ids
  let ficheCount = 0;
  const { count: ficheByAccount } = await sb
    .from("fiches")
    .select("id", { count: "exact", head: true })
    .eq("partner_account_id", partnerId);
  ficheCount += ficheByAccount || 0;

  if (orgIds.length > 0) {
    const { count: ficheByOrg } = await sb
      .from("fiches")
      .select("id", { count: "exact", head: true })
      .in("airtable_record_id", orgIds)
      .neq("partner_account_id", partnerId);
    ficheCount += ficheByOrg || 0;
  }

  // Referral stats
  const { data: referrals } = await sb
    .from("partner_referrals")
    .select("status, revenue_attributed")
    .eq("partner_id", partnerId);

  const referralStats = {
    total: referrals?.length || 0,
    visited: referrals?.filter((r) => r.status === "visited").length || 0,
    contacted: referrals?.filter((r) => r.status === "contacted").length || 0,
    converted: referrals?.filter((r) => r.status === "converted").length || 0,
    totalRevenue: referrals?.reduce((sum, r) => sum + (r.revenue_attributed || 0), 0) || 0,
  };

  // Active offers count
  const { count: activeOffers } = await sb
    .from("partner_offers")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partnerId)
    .eq("status", "active");

  // Upcoming events count
  const { count: upcomingEvents } = await sb
    .from("partner_events")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partnerId)
    .in("status", ["pending", "approved"])
    .gte("date_end", new Date().toISOString());

  return NextResponse.json({
    ficheCount,
    referralStats,
    activeOffers: activeOffers || 0,
    upcomingEvents: upcomingEvents || 0,
  });
}
