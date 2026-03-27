import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await getSupabase()
    .from("events")
    .select("id, title, category, date_display, date_start, date_end, location, price, description, highlights, itinerary, includes, image_url, featured, members_only, ticket_url, ticket_provider, ticket_commission_rate")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // CORS headers for Squarespace to call this
  return NextResponse.json(data, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
