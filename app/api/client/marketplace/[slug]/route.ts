export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyClientSession, CLIENT_COOKIE_NAME } from "@/lib/client-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyClientSession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getSupabaseAdmin();
    const { slug } = params;

    const { data: listing, error } = await supabase
      .from("listings")
      .select("*")
      .eq("slug", slug)
      .eq("status", "live")
      .single();

    if (error || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Fetch related listings (same category, excluding current, max 4)
    const { data: related } = await supabase
      .from("listings")
      .select(
        "id, title, slug, category, price, price_display, hero_image_url, maker_brand, condition"
      )
      .eq("status", "live")
      .eq("category", listing.category)
      .neq("id", listing.id)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(4);

    // Check if this listing is in client's wishlist
    const { data: wishlistEntry } = await supabase
      .from("wishlists")
      .select("listing_id")
      .eq("client_account_id", session.clientId)
      .eq("listing_id", listing.id)
      .maybeSingle();

    return NextResponse.json({
      listing,
      related: related || [],
      wishlisted: !!wishlistEntry,
    });
  } catch (error) {
    console.error("Listing detail error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
