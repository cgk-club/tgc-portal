import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendPartnerMagicLink } from "@/lib/email";
import { PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Find partner_user by email
  const { data: user } = await sb
    .from("partner_users")
    .select("id, partner_id, name, email")
    .eq("email", email.toLowerCase().trim())
    .single();

  // Always return ok to avoid email enumeration
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  // Check partner account is active
  const { data: partner } = await sb
    .from("partner_accounts")
    .select("id, status")
    .eq("id", user.partner_id)
    .single();

  if (!partner || partner.status !== "active") {
    return NextResponse.json({ ok: true });
  }

  // Generate token and store in partner_magic_tokens
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

  const { error: insertError } = await sb
    .from("partner_magic_tokens")
    .insert({
      partner_id: user.partner_id,
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });

  if (insertError) {
    console.error("Failed to create magic token:", insertError);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  // Send the magic link email
  try {
    await sendPartnerMagicLink(user.email, user.name || "Partner", token);
  } catch (err) {
    console.error("Failed to send partner magic link:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(PARTNER_COOKIE_NAME);
  return response;
}
