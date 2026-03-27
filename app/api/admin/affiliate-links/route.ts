export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("affiliate_links")
    .select("*")
    .order("category", { ascending: true })
    .order("event_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by category
  const grouped: Record<string, typeof data> = {};
  for (const link of data || []) {
    const cat = link.category || "Uncategorised";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(link);
  }

  return NextResponse.json({ links: data, grouped });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.event_name || !body.url) {
    return NextResponse.json(
      { error: "event_name and url are required" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("affiliate_links")
    .insert({
      event_name: body.event_name,
      url: body.url,
      category: body.category || "Uncategorised",
      provider: body.provider || "GooTickets",
      affiliate_id: body.affiliate_id || "13569",
      commission_rate: body.commission_rate || 2.5,
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
