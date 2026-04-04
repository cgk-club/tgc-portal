import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic'

export async function GET() {
  const sb = getSupabaseAdmin();

  // Fetch both client requests and event enquiries
  const [requestsRes, eventsRes] = await Promise.all([
    sb.from("client_requests").select("*").order("created_at", { ascending: false }).limit(50),
    sb.from("event_enquiries").select("*").order("created_at", { ascending: false }).limit(50),
  ]);

  const response = NextResponse.json({
    requests: requestsRes.data || [],
    eventEnquiries: eventsRes.data || [],
  });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return response
}
