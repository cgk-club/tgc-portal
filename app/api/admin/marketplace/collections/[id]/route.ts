import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: collection, error } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get listings in this collection
  const { data: links } = await supabase
    .from("collection_listings")
    .select("listing_id, sort_order")
    .eq("collection_id", id)
    .order("sort_order", { ascending: true });

  let listings: unknown[] = [];
  if (links && links.length > 0) {
    const listingIds = links.map((l) => l.listing_id);
    const { data: listingData } = await supabase
      .from("listings")
      .select("id, title, category, price_display, status, hero_image_url")
      .in("id", listingIds);

    if (listingData) {
      const sortMap = Object.fromEntries(links.map((l) => [l.listing_id, l.sort_order]));
      listings = listingData
        .map((l) => ({ ...l, sort_order: sortMap[l.id] ?? 0 }))
        .sort((a, b) => (a.sort_order as number) - (b.sort_order as number));
    }
  }

  return NextResponse.json({ ...collection, listings });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  const allowed = ["name", "slug", "editorial_intro", "hero_image_url", "published", "season", "newsletter_link"];
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await getSupabaseAdmin()
    .from("collections")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  // Delete collection_listings first
  await supabase
    .from("collection_listings")
    .delete()
    .eq("collection_id", id);

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
