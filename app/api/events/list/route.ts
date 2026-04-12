import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await getSupabase()
    .from("events")
    .select("id, title, category, date_display, date_start, date_end, location, price, description, highlights, itinerary, includes, image_url, featured, members_only, ticket_url, ticket_provider, brochure_url, gallery_images, stats")
    .eq("active", true)
    .or(`date_end.gte.${today},date_end.is.null`)
    .order("date_start", { ascending: true });

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
