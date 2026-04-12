import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Look up user in partner_users table
  const { data: user } = await sb
    .from("partner_users")
    .select("id, partner_id, email, name, password_hash, role")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (!user || !user.password_hash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Check the parent partner account is active
  const { data: partner } = await sb
    .from("partner_accounts")
    .select("id, status")
    .eq("id", user.partner_id)
    .single();

  if (!partner || partner.status !== "active") {
    return NextResponse.json({ error: "Account is not active" }, { status: 403 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Update last login on partner_users
  await sb
    .from("partner_users")
    .update({ last_login: new Date().toISOString() })
    .eq("id", user.id);

  const token = await createPartnerSession(user.partner_id, user.id, user.email);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(PARTNER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
