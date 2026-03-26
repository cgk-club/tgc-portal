import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const { data, error } = await getSupabaseAdmin()
    .from("collection_listings")
    .insert({
      collection_id: id,
      listing_id: body.listing_id,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listing_id");

  if (!listingId) {
    return NextResponse.json({ error: "listing_id required" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("collection_listings")
    .delete()
    .eq("collection_id", id)
    .eq("listing_id", listingId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
