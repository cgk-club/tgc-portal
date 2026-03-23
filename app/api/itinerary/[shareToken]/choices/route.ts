export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// Public endpoint — works with share token (same as the itinerary page itself)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;
    const supabase = getSupabaseAdmin();

    // Find itinerary by share token
    const { data: itinerary } = await supabase
      .from("itineraries")
      .select("id")
      .eq("share_token", shareToken)
      .single();

    if (!itinerary) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: groups } = await supabase
      .from("choice_groups")
      .select("*")
      .eq("itinerary_id", itinerary.id)
      .order("sort_order", { ascending: true });

    const groupIds = (groups || []).map((g: { id: string }) => g.id);
    const { data: options } = groupIds.length > 0
      ? await supabase
          .from("choice_options")
          .select("id, group_id, title, subtitle, description, price_estimate, currency, image_url, details, is_selected, sort_order")
          .in("group_id", groupIds)
          .order("sort_order", { ascending: true })
      : { data: [] };

    const result = (groups || []).map((g: { id: string }) => ({
      ...g,
      options: (options || []).filter((o: { group_id: string }) => o.group_id === g.id),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Public choices fetch error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Allow client to select an option via share token
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;
    const { groupId, optionId } = await request.json();
    const supabase = getSupabaseAdmin();

    // Verify share token
    const { data: itinerary } = await supabase
      .from("itineraries")
      .select("id")
      .eq("share_token", shareToken)
      .single();

    if (!itinerary) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Deselect all in group
    await supabase
      .from("choice_options")
      .update({ is_selected: false })
      .eq("group_id", groupId);

    // Select chosen
    await supabase
      .from("choice_options")
      .update({ is_selected: true })
      .eq("id", optionId)
      .eq("group_id", groupId);

    // Mark decided
    await supabase
      .from("choice_groups")
      .update({ status: "decided", updated_at: new Date().toISOString() })
      .eq("id", groupId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Public choice select error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
