import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from("events")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await getSupabaseAdmin()
    .from("events")
    .insert({
      title: body.title,
      category: body.category,
      date_display: body.date_display,
      date_start: body.date_start || null,
      date_end: body.date_end || null,
      location: body.location || null,
      price: body.price || "On application",
      description: body.description || null,
      highlights: body.highlights || null,
      itinerary: body.itinerary || null,
      includes: body.includes || null,
      image_url: body.image_url || null,
      featured: body.featured || false,
      members_only: body.members_only || false,
      active: body.active !== false,
      sort_order: body.sort_order || 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
