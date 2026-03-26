export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyClientSession, CLIENT_COOKIE_NAME } from "@/lib/client-auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyClientSession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getSupabaseAdmin();

    const { data: orders, error } = await supabase
      .from("marketplace_orders")
      .select("*")
      .eq("client_id", session.clientId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    // Fetch listing titles for each order
    const listingIds = Array.from(new Set(orders.map((o) => o.listing_id).filter(Boolean)));
    const { data: listings } = await supabase
      .from("listings")
      .select("id, title, slug, hero_image_url")
      .in("id", listingIds);

    const listingMap = new Map(
      (listings || []).map((l) => [l.id, l])
    );

    const enrichedOrders = orders.map((order) => ({
      ...order,
      listing: listingMap.get(order.listing_id) || null,
    }));

    return NextResponse.json({ orders: enrichedOrders });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
