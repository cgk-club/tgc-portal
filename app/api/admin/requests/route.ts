import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const sb = getSupabaseAdmin();

  // Fetch both client requests and event enquiries
  const [requestsRes, eventsRes] = await Promise.all([
    sb.from("client_requests").select("*").order("created_at", { ascending: false }).limit(50),
    sb.from("event_enquiries").select("*").order("created_at", { ascending: false }).limit(50),
  ]);

  return NextResponse.json({
    requests: requestsRes.data || [],
    eventEnquiries: eventsRes.data || [],
  });
}
