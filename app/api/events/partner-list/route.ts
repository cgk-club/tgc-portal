import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Public feed of APPROVED (status='active') partner-submitted events, for the
// marketing site to merge into its curated events list. Read-only, anon client,
// gated by the "Public read active partner_events" RLS policy (status='active').
export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await getSupabase()
    .from("partner_events")
    .select(
      "id, title, category, date_display, date_start, date_end, location, price, description, highlights, image_url, brochure_url, gallery_images, stats, pricing_tiers"
    )
    .eq("status", "active")
    .or(`date_end.gte.${today},date_end.is.null`)
    .order("date_start", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? [], {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
