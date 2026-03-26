import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });

  const { data: partner } = await getSupabaseAdmin()
    .from("partner_accounts")
    .select("id, email, name, org_ids, status, password_hash")
    .eq("id", session.partnerId)
    .single();

  if (!partner) return NextResponse.json({ authenticated: false }, { status: 401 });

  return NextResponse.json({
    authenticated: true,
    partner: {
      id: partner.id,
      email: partner.email,
      name: partner.name,
      org_ids: partner.org_ids,
      status: partner.status,
      hasPassword: !!partner.password_hash,
    },
  });
}
