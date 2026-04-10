import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();

  // First get partner's listing IDs
  const { data: listings } = await sb
    .from("listings")
    .select("id, title")
    .eq("partner_account_id", session.partnerId);

  if (!listings || listings.length === 0) {
    return NextResponse.json([]);
  }

  const listingIds = listings.map((l: { id: string }) => l.id);
  const listingTitleMap: Record<string, string> = {};
  for (const l of listings) {
    listingTitleMap[l.id] = l.title;
  }

  // Fetch orders for these listings
  const { data: orders, error } = await sb
    .from("marketplace_orders")
    .select("*")
    .in("listing_id", listingIds)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with listing titles and client names
  const enrichedOrders = await Promise.all(
    (orders || []).map(async (order: Record<string, unknown>) => {
      let clientName = "Unknown";
      if (order.client_id) {
        const { data: client } = await sb
          .from("client_accounts")
          .select("name")
          .eq("id", order.client_id)
          .single();
        if (client) clientName = client.name;
      }

      return {
        ...order,
        listing_title: listingTitleMap[order.listing_id as string] || "Unknown",
        client_name: clientName,
      };
    })
  );

  return NextResponse.json(enrichedOrders);
}
