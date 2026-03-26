import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const { data: partner } = await sb
    .from("partner_accounts")
    .select("id, email, name, password_hash, status, org_ids")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (!partner || !partner.password_hash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (partner.status !== "active") {
    return NextResponse.json({ error: "Account is not active" }, { status: 403 });
  }

  const valid = await bcrypt.compare(password, partner.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Update last login
  await sb
    .from("partner_accounts")
    .update({ last_login: new Date().toISOString() })
    .eq("id", partner.id);

  const token = await createPartnerSession(partner.id, partner.email);

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
