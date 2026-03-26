export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyClientSession, CLIENT_COOKIE_NAME } from "@/lib/client-auth";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyClientSession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { listing_id, message } = body;

    if (!listing_id || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get client details
    const { data: client } = await supabase
      .from("client_accounts")
      .select("id, name, email")
      .eq("id", session.clientId)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Verify the listing exists and is live
    const { data: listing } = await supabase
      .from("listings")
      .select("id, title")
      .eq("id", listing_id)
      .eq("status", "live")
      .single();

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Create the enquiry
    const { data: enquiry, error } = await supabase
      .from("enquiries")
      .insert({
        listing_id,
        name: client.name || "",
        email: client.email,
        message,
        status: "new",
        source: "portal",
      })
      .select()
      .single();

    if (error) {
      console.error("Enquiry creation error:", error);
      return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, enquiry });
  } catch (error) {
    console.error("Enquiry API error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
