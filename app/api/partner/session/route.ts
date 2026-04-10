import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });

  const sb = getSupabaseAdmin();

  // Get user from partner_users
  const { data: user } = await sb
    .from("partner_users")
    .select("id, email, name, role, password_hash, partner_id")
    .eq("id", session.userId)
    .single();

  if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });

  // Get org from partner_accounts
  const { data: partner } = await sb
    .from("partner_accounts")
    .select("id, org_name, org_ids, status, primary_org_id")
    .eq("id", user.partner_id)
    .single();

  if (!partner) return NextResponse.json({ authenticated: false }, { status: 401 });

  return NextResponse.json({
    authenticated: true,
    partner: {
      id: partner.id,
      org_name: partner.org_name,
      org_ids: partner.org_ids,
      status: partner.status,
    },
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword: !!user.password_hash,
    },
  });
}
