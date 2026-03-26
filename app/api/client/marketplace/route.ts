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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("listings")
      .select(
        "id, title, slug, category, price, price_display, status, featured, editorial_hook, hero_image_url, maker_brand, year, condition, location, created_at"
      )
      .eq("status", "live");

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,maker_brand.ilike.%${search}%`
      );
    }

    switch (sort) {
      case "price_asc":
        query = query.order("price", { ascending: true, nullsFirst: false });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false, nullsFirst: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    const { data, error } = await query.limit(60);

    if (error) {
      console.error("Marketplace listings fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Marketplace API error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
