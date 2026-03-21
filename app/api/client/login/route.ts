import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createClientSession, CLIENT_COOKIE_NAME } from "@/lib/client-auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const { data: client } = await sb
    .from("client_accounts")
    .select("id, email, name, password_hash")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (!client || !client.password_hash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, client.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Update last login
  await sb
    .from("client_accounts")
    .update({ last_login: new Date().toISOString() })
    .eq("id", client.id);

  const token = await createClientSession(client.id, client.email);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(CLIENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
