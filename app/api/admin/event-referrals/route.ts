import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = request.nextUrl.searchParams.get("project_id");
  const eventId = request.nextUrl.searchParams.get("event_id");

  const sb = getSupabaseAdmin();

  let query = sb
    .from("event_referrals")
    .select("*")
    .order("created_at", { ascending: false });

  if (projectId) query = query.eq("project_id", projectId);
  if (eventId) query = query.eq("event_id", eventId);

  const { data: referrals, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich with referrer names
  const referrerIds = Array.from(
    new Set(
      (referrals || [])
        .map((r: { referrer_id: string | null }) => r.referrer_id)
        .filter(Boolean) as string[]
    )
  );

  let referrerMap: Record<string, string> = {};
  if (referrerIds.length > 0) {
    const { data: partners } = await sb
      .from("partner_accounts")
      .select("id, org_name, name")
      .in("id", referrerIds);

    referrerMap = (partners || []).reduce(
      (acc, p) => ({
        ...acc,
        [p.id]: p.org_name || p.name || "Unknown",
      }),
      {}
    );
  }

  const enriched = (referrals || []).map((r) => ({
    ...r,
    referrer_name: r.referrer_id
      ? referrerMap[r.referrer_id] || "Unknown"
      : null,
  }));

  // Stats
  const stats = {
    sent: enriched.filter((r) => r.stage === "sent").length,
    prospect: enriched.filter((r) => r.stage === "prospect").length,
    lead: enriched.filter((r) => r.stage === "lead").length,
    client: enriched.filter((r) => r.stage === "client").length,
    total: enriched.length,
  };

  const response = NextResponse.json({ referrals: enriched, stats });
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate"
  );
  return response;
}

export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    project_id,
    event_id,
    prospect_name,
    prospect_email,
    prospect_phone,
    prospect_company,
    package_interest,
    attending_as,
    stage,
    referrer_id,
    admin_notes,
  } = body;

  if (!prospect_name || !prospect_email) {
    return NextResponse.json(
      { error: "Name and email required" },
      { status: 400 }
    );
  }

  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from("event_referrals")
    .insert({
      project_id: project_id || null,
      event_id: event_id || null,
      referrer_id: referrer_id || null,
      prospect_name,
      prospect_email: prospect_email.toLowerCase().trim(),
      prospect_phone: prospect_phone || null,
      prospect_company: prospect_company || null,
      package_interest: package_interest || null,
      attending_as: attending_as || null,
      stage: stage || "lead",
      source: "manual_entry",
      admin_notes: admin_notes || null,
      enquired_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
