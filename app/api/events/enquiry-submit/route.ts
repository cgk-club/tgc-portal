import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendEventEnquiryNotification } from "@/lib/email";

export async function POST(request: Request) {
  // Never-fail intake: capture the enquiry in the DB AND notify the monitored
  // inbox; only report failure if it landed in neither place.
  let data: Record<string, any> = {};
  try {
    data = await request.json();
  } catch (parseErr) {
    console.error("Event enquiry body parse error:", parseErr);
  }

  let captured = false;

  // 1. Durable DB capture
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("event_enquiries").insert({
      event_name: data.event_name || "Not specified",
      access_type: data.access_type || null,
      group_size: data.group_size || null,
      accommodation_needs: data.accommodation_needs || null,
      transfers_logistics: data.transfers_logistics || null,
      dining_preferences: data.dining_preferences || null,
      budget_range: data.budget_range || null,
      special_requests: data.special_requests || null,
      raw_chat_json: data,
      name: data.name || "Anonymous",
      email: data.email || "",
      phone: data.phone || null,
      communication_pref: data.communication_pref || "email",
      status: "new",
    });
    if (error) console.error("Supabase insert error:", error);
    else captured = true;
  } catch (dbErr) {
    console.error("Event enquiry insert threw:", dbErr);
  }

  // 2. Notification to the monitored inbox — lands the lead even if the DB write failed
  try {
    await sendEventEnquiryNotification(data);
    captured = true;
  } catch (notifyErr) {
    console.error("Notification email error:", notifyErr);
  }

  if (!captured) {
    console.error("Event enquiry captured NOWHERE:", JSON.stringify(data).slice(0, 500));
    return NextResponse.json(
      { error: "We could not record your enquiry. Please email christian@thegatekeepers.club and we will pick it up right away." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
