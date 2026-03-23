export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: groups, error } = await supabase
      .from("choice_groups")
      .select("*")
      .eq("itinerary_id", id)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    // Fetch options for each group
    const groupIds = (groups || []).map((g: { id: string }) => g.id);
    const { data: options } = groupIds.length > 0
      ? await supabase
          .from("choice_options")
          .select("*")
          .in("group_id", groupIds)
          .order("sort_order", { ascending: true })
      : { data: [] };

    const result = (groups || []).map((g: { id: string }) => ({
      ...g,
      options: (options || []).filter((o: { group_id: string }) => o.group_id === g.id),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Choice groups fetch error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const { data: group, error } = await supabase
      .from("choice_groups")
      .insert({ ...body, itinerary_id: id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Choice group create error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
