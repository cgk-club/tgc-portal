import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();
  const partnerId = session.partnerId;

  const { data: referrals, error } = await sb
    .from("partner_referrals")
    .select("*")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = referrals || [];

  const stats = {
    total: list.length,
    visited: list.filter((r) => r.status === "visited").length,
    contacted: list.filter((r) => r.status === "contacted").length,
    converted: list.filter((r) => r.status === "converted").length,
    totalRevenue: list.reduce((sum, r) => sum + (r.revenue_attributed || 0), 0),
  };

  return NextResponse.json({ stats, referrals: list });
}
