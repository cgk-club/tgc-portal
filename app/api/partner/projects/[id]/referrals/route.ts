import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;
  const sb = getSupabaseAdmin();

  // Verify partner is linked to this project
  const { data: assignment } = await sb
    .from("project_partners")
    .select("id")
    .eq("project_id", projectId)
    .eq("partner_id", session.partnerId)
    .eq("status", "active")
    .single();

  if (!assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get partner's referral code
  const { data: partner } = await sb
    .from("partner_accounts")
    .select("referral_code")
    .eq("id", session.partnerId)
    .single();

  // Get referrals for this partner on this project
  const { data: referrals } = await sb
    .from("event_referrals")
    .select(
      "id, prospect_name, package_interest, attending_as, stage, created_at, enquired_at, converted_at"
    )
    .eq("project_id", projectId)
    .eq("referrer_id", session.partnerId)
    .order("created_at", { ascending: false });

  // Stats
  const list = referrals || [];
  const stats = {
    sent: list.filter((r) => r.stage === "sent").length,
    lead: list.filter((r) => r.stage === "lead").length,
    client: list.filter((r) => r.stage === "client").length,
    total: list.length,
  };

  // Build the shareable link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://portal.thegatekeepers.club";

  // Find the event slug for this project
  const { data: event } = await sb
    .from("events")
    .select("slug")
    .eq("project_id", projectId)
    .single();

  const shareableLink = event?.slug && partner?.referral_code
    ? `${appUrl}/event/${event.slug}?ref=${partner.referral_code}`
    : null;

  const response = NextResponse.json({
    referrals: list,
    stats,
    referral_code: partner?.referral_code || null,
    shareable_link: shareableLink,
  });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}
