export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyClientSession, CLIENT_COOKIE_NAME } from "@/lib/client-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyClientSession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Verify itinerary belongs to client
    const { data: itinerary } = await supabase
      .from("itineraries")
      .select("id")
      .eq("id", id)
      .eq("client_account_id", session.clientId)
      .single();

    if (!itinerary) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: groups } = await supabase
      .from("choice_groups")
      .select("*")
      .eq("itinerary_id", id)
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
    console.error("Client choices fetch error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Client can select an option
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyClientSession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { groupId, optionId } = await request.json();
    const supabase = getSupabaseAdmin();

    // Verify itinerary belongs to client
    const { data: itinerary } = await supabase
      .from("itineraries")
      .select("id")
      .eq("id", id)
      .eq("client_account_id", session.clientId)
      .single();

    if (!itinerary) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Deselect all in group
    await supabase
      .from("choice_options")
      .update({ is_selected: false })
      .eq("group_id", groupId);

    // Select chosen option
    await supabase
      .from("choice_options")
      .update({ is_selected: true })
      .eq("id", optionId)
      .eq("group_id", groupId);

    // Mark group as decided
    await supabase
      .from("choice_groups")
      .update({ status: "decided", updated_at: new Date().toISOString() })
      .eq("id", groupId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Client choice select error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
