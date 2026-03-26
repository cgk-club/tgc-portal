import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data: collections, error } = await supabase
    .from("collections")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get listing counts per collection
  const collectionIds = (collections || []).map((c) => c.id);
  let countMap: Record<string, number> = {};

  if (collectionIds.length > 0) {
    const { data: links } = await supabase
      .from("collection_listings")
      .select("collection_id")
      .in("collection_id", collectionIds);

    if (links) {
      for (const link of links) {
        countMap[link.collection_id] = (countMap[link.collection_id] || 0) + 1;
      }
    }
  }

  const enriched = (collections || []).map((c) => ({
    ...c,
    listing_count: countMap[c.id] || 0,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await getSupabaseAdmin()
    .from("collections")
    .insert({
      name: body.name,
      slug: body.slug || null,
      editorial_intro: body.editorial_intro || null,
      hero_image_url: body.hero_image_url || null,
      published: body.published || false,
      season: body.season || null,
      newsletter_link: body.newsletter_link || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
