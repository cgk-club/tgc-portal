import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await getSupabaseAdmin()
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const allowed = [
    "title", "slug", "category", "price", "price_display", "status",
    "featured", "editorial_hook", "editorial_description", "seller_raw_input",
    "hero_image_url", "gallery_image_urls", "maker_brand", "year", "condition",
    "location", "commission_rate", "category_fields", "seller_id", "seller_type",
    "seller_display_name", "partner_account_id",
  ];
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await getSupabaseAdmin()
    .from("listings")
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

  const { error } = await getSupabaseAdmin()
    .from("listings")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
