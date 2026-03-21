import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendClientRequestNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("client_requests").insert({
      client_id: data.client_id || null,
      request_type: data.request_type || "general",
      summary: data.summary || null,
      raw_chat_json: data,
      name: data.name || "Anonymous",
      email: data.email || "",
      phone: data.phone || null,
      communication_pref: data.communication_pref || "email",
      status: "new",
    });

    if (error) {
      console.error("Client request insert error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    sendClientRequestNotification(data).catch((err) =>
      console.error("Request notification error:", err)
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Request submit error:", error);
    return NextResponse.json({ error: "Submit failed" }, { status: 500 });
  }
}
