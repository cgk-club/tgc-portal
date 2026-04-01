import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await getSupabase()
    .from("events")
    .select(
      "id, title, category, date_display, date_start, date_end, location, price, description, highlights, itinerary, includes, image_url, featured, members_only, ticket_url, ticket_provider, ticket_commission_rate, brochure_url, gallery_images, stats"
    )
    .eq("id", id)
    .eq("active", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
