import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Find the magic token
  const { data: magicToken } = await sb
    .from("partner_magic_tokens")
    .select("id, partner_id, expires_at, used_at")
    .eq("token", token)
    .single();

  if (!magicToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (magicToken.used_at) {
    return NextResponse.json({ error: "Token already used" }, { status: 401 });
  }

  if (new Date(magicToken.expires_at) < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 401 });
  }

  // Mark token as used
  await sb
    .from("partner_magic_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", magicToken.id);

  // Get partner account
  const { data: partner } = await sb
    .from("partner_accounts")
    .select("id, email, name, status")
    .eq("id", magicToken.partner_id)
    .single();

  if (!partner) {
    return NextResponse.json({ error: "Partner account not found" }, { status: 404 });
  }

  if (partner.status !== "active") {
    return NextResponse.json({ error: "Account is not active" }, { status: 403 });
  }

  // Update last login
  await sb
    .from("partner_accounts")
    .update({ last_login: new Date().toISOString() })
    .eq("id", partner.id);

  const sessionToken = await createPartnerSession(partner.id, partner.email);

  const response = NextResponse.json({ ok: true, needsPassword: !partner.name });
  response.cookies.set(PARTNER_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
