import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data: orders, error } = await supabase
    .from("marketplace_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with listing titles and client names
  const listingIds = Array.from(new Set((orders || []).map((o: Record<string, unknown>) => o.listing_id).filter(Boolean))) as string[];
  const clientIds = Array.from(new Set((orders || []).map((o: Record<string, unknown>) => o.client_id).filter(Boolean))) as string[];

  let listingsMap: Record<string, string> = {};
  let clientsMap: Record<string, string> = {};

  if (listingIds.length > 0) {
    const { data: listings } = await supabase
      .from("listings")
      .select("id, title")
      .in("id", listingIds);
    if (listings) {
      listingsMap = Object.fromEntries(listings.map((l) => [l.id, l.title]));
    }
  }

  if (clientIds.length > 0) {
    const { data: clients } = await supabase
      .from("client_accounts")
      .select("id, name")
      .in("id", clientIds);
    if (clients) {
      clientsMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));
    }
  }

  const enriched = (orders || []).map((o) => ({
    ...o,
    listing_title: listingsMap[o.listing_id] || null,
    client_name: clientsMap[o.client_id] || null,
  }));

  return NextResponse.json(enriched);
}
