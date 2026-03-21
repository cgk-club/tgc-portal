import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = getSupabaseAdmin();

  const { data: history } = await sb
    .from("points_history")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ history: history || [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { points, description } = await request.json();

  if (!points || !description) {
    return NextResponse.json({ error: "Points and description required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Get current balance
  const { data: client } = await sb
    .from("client_accounts")
    .select("points_balance")
    .eq("id", id)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const currentBalance = client.points_balance || 0;
  const newBalance = currentBalance + points;

  // Update balance
  await sb
    .from("client_accounts")
    .update({ points_balance: newBalance })
    .eq("id", id);

  // Add history entry
  await sb.from("points_history").insert({
    client_id: id,
    description,
    points,
    balance_after: newBalance,
  });

  return NextResponse.json({ ok: true, balance: newBalance });
}
