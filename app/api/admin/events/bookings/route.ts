import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get("event_id");

  const sb = getSupabaseAdmin();
  let query = sb
    .from("event_bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (event_id) query = query.eq("event_id", event_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const response = NextResponse.json(data);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status, notes } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (notes !== undefined) updates.notes = notes;

  const { data, error } = await getSupabaseAdmin()
    .from("event_bookings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
