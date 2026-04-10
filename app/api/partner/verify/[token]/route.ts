import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";

export const dynamic = "force-dynamic";

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
    .select("id, partner_id, user_id, expires_at, used_at")
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

  // Get the partner user (use user_id if set, otherwise fall back to finding owner user for the partner)
  let userId = magicToken.user_id;
  let user: { id: string; email: string; name: string | null; partner_id: string } | null = null;

  if (userId) {
    const { data } = await sb
      .from("partner_users")
      .select("id, email, name, partner_id")
      .eq("id", userId)
      .single();
    user = data;
  } else {
    // Legacy tokens without user_id: find the owner user for this partner
    const { data } = await sb
      .from("partner_users")
      .select("id, email, name, partner_id")
      .eq("partner_id", magicToken.partner_id)
      .eq("role", "owner")
      .single();
    user = data;
  }

  if (!user) {
    return NextResponse.json({ error: "User account not found" }, { status: 404 });
  }

  // Check partner account is active
  const { data: partner } = await sb
    .from("partner_accounts")
    .select("id, status")
    .eq("id", user.partner_id)
    .single();

  if (!partner || partner.status !== "active") {
    return NextResponse.json({ error: "Account is not active" }, { status: 403 });
  }

  // Update last login on partner_users
  await sb
    .from("partner_users")
    .update({ last_login: new Date().toISOString() })
    .eq("id", user.id);

  const sessionToken = await createPartnerSession(user.partner_id, user.id, user.email);

  const response = NextResponse.json({ ok: true, needsPassword: !user.name });
  response.cookies.set(PARTNER_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
