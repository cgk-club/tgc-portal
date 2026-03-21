import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyClientSession, CLIENT_COOKIE_NAME } from "@/lib/client-auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyClientSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { password } = await request.json();
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 12);

  const { error } = await getSupabaseAdmin()
    .from("client_accounts")
    .update({ password_hash: hash })
    .eq("id", session.clientId);

  if (error) {
    return NextResponse.json({ error: "Failed to set password" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
