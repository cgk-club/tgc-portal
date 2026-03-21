import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendEventEnquiryNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const data = await request.json();

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

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    // Send notification (fire and forget)
    sendEventEnquiryNotification(data).catch((err) =>
      console.error("Notification email error:", err)
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Enquiry submit error:", error);
    return NextResponse.json({ error: "Submit failed" }, { status: 500 });
  }
}
