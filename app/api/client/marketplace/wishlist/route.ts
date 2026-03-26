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

    // Get all wishlist listing IDs for this client
    const { data: wishlistItems, error: wError } = await supabase
      .from("wishlists")
      .select("listing_id, created_at")
      .eq("client_account_id", session.clientId)
      .order("created_at", { ascending: false });

    if (wError) {
      console.error("Wishlist fetch error:", wError);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }

    if (!wishlistItems || wishlistItems.length === 0) {
      return NextResponse.json({ listings: [], listing_ids: [] });
    }

    const listingIds = wishlistItems.map((w) => w.listing_id);

    // Fetch the actual listing data
    const { data: listings } = await supabase
      .from("listings")
      .select(
        "id, title, slug, category, price, price_display, hero_image_url, maker_brand, condition, status"
      )
      .in("id", listingIds)
      .eq("status", "live");

    return NextResponse.json({
      listings: listings || [],
      listing_ids: listingIds,
    });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyClientSession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { listing_id } = await request.json();
    if (!listing_id) {
      return NextResponse.json({ error: "Missing listing_id" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Check if already wishlisted
    const { data: existing } = await supabase
      .from("wishlists")
      .select("listing_id")
      .eq("client_account_id", session.clientId)
      .eq("listing_id", listing_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, action: "already_exists" });
    }

    const { error } = await supabase.from("wishlists").insert({
      client_account_id: session.clientId,
      listing_id,
    });

    if (error) {
      console.error("Wishlist add error:", error);
      return NextResponse.json({ error: "Failed to add" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, action: "added" });
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyClientSession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { listing_id } = await request.json();
    if (!listing_id) {
      return NextResponse.json({ error: "Missing listing_id" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("client_account_id", session.clientId)
      .eq("listing_id", listing_id);

    if (error) {
      console.error("Wishlist remove error:", error);
      return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, action: "removed" });
  } catch (error) {
    console.error("Wishlist DELETE error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
