import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data: enquiries, error } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch listing titles for all enquiries
  const listingIds = Array.from(new Set((enquiries || []).map((e: Record<string, unknown>) => e.listing_id).filter(Boolean))) as string[];
  let listingsMap: Record<string, string> = {};

  if (listingIds.length > 0) {
    const { data: listings } = await supabase
      .from("listings")
      .select("id, title")
      .in("id", listingIds);

    if (listings) {
      listingsMap = Object.fromEntries(listings.map((l) => [l.id, l.title]));
    }
  }

  const enriched = (enquiries || []).map((e) => ({
    ...e,
    listing_title: listingsMap[e.listing_id] || null,
  }));

  return NextResponse.json(enriched);
}
