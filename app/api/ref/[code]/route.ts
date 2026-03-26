import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET: Lookup partner by referral_code, return public partner + fiche info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code) {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Find partner account with this referral code
  const { data: partner, error: partnerErr } = await sb
    .from("partner_accounts")
    .select("id, name, org_ids, referral_code")
    .eq("referral_code", code)
    .eq("status", "active")
    .single();

  if (partnerErr || !partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  // Find associated fiche (first live one)
  let ficheSlug: string | null = null;
  let ficheHeadline: string | null = null;
  let ficheHeroUrl: string | null = null;
  let templateType: string | null = null;

  // Try fiches linked by partner_account_id
  const { data: ficheByAccount } = await sb
    .from("fiches")
    .select("slug, headline, hero_image_url, template_type")
    .eq("partner_account_id", partner.id)
    .eq("status", "live")
    .limit(1)
    .single();

  if (ficheByAccount) {
    ficheSlug = ficheByAccount.slug;
    ficheHeadline = ficheByAccount.headline;
    ficheHeroUrl = ficheByAccount.hero_image_url;
    templateType = ficheByAccount.template_type;
  } else if (partner.org_ids && partner.org_ids.length > 0) {
    // Try fiches linked by org_ids
    const { data: ficheByOrg } = await sb
      .from("fiches")
      .select("slug, headline, hero_image_url, template_type")
      .in("airtable_record_id", partner.org_ids)
      .eq("status", "live")
      .limit(1)
      .single();

    if (ficheByOrg) {
      ficheSlug = ficheByOrg.slug;
      ficheHeadline = ficheByOrg.headline;
      ficheHeroUrl = ficheByOrg.hero_image_url;
      templateType = ficheByOrg.template_type;
    }
  }

  return NextResponse.json({
    name: partner.name,
    ficheSlug,
    ficheHeadline,
    ficheHeroUrl,
    templateType,
  });
}

// POST: Record a visit from this referral code
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code) {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Find partner
  const { data: partner } = await sb
    .from("partner_accounts")
    .select("id")
    .eq("referral_code", code)
    .eq("status", "active")
    .single();

  if (!partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  // Record visit in partner_referrals
  const { error: insertErr } = await sb.from("partner_referrals").insert({
    partner_id: partner.id,
    referral_code: code,
    status: "visited",
    created_at: new Date().toISOString(),
  });

  if (insertErr) {
    // Non-critical: don't fail the page load if tracking fails
    console.error("Failed to record referral visit:", insertErr.message);
  }

  return NextResponse.json({ ok: true });
}
