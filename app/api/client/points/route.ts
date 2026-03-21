import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { verifyClientSession, CLIENT_COOKIE_NAME } from "@/lib/client-auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CLIENT_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyClientSession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getSupabaseAdmin();

    const { data: client } = await supabase
      .from("client_accounts")
      .select("points_balance")
      .eq("id", session.clientId)
      .single();

    const { data: history } = await supabase
      .from("points_history")
      .select("*")
      .eq("client_id", session.clientId)
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json({
      balance: client?.points_balance || 0,
      history: history || [],
    });
  } catch (error) {
    console.error("Points fetch error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
