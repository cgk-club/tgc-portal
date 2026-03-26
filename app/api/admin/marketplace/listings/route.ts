import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  let query = getSupabaseAdmin()
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await getSupabaseAdmin()
    .from("listings")
    .insert({
      title: body.title,
      slug: body.slug || null,
      category: body.category || null,
      price: body.price || null,
      price_display: body.price_display || null,
      status: body.status || "draft",
      featured: body.featured || false,
      editorial_hook: body.editorial_hook || null,
      editorial_description: body.editorial_description || null,
      seller_raw_input: body.seller_raw_input || null,
      hero_image_url: body.hero_image_url || null,
      gallery_image_urls: body.gallery_image_urls || null,
      maker_brand: body.maker_brand || null,
      year: body.year || null,
      condition: body.condition || null,
      location: body.location || null,
      commission_rate: body.commission_rate || null,
      category_fields: body.category_fields || null,
      seller_id: body.seller_id || null,
      seller_type: body.seller_type || null,
      seller_display_name: body.seller_display_name || null,
      partner_account_id: body.partner_account_id || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
