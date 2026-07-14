import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendClientRequestNotification } from "@/lib/email";
import { verifyClientSession, CLIENT_COOKIE_NAME } from "@/lib/client-auth";
import { syncToCrm } from "@/lib/crm-sync";

export async function POST(request: NextRequest) {
  // Never-fail intake: a lead must never be lost to a DB hiccup or shown a
  // resubmit prompt. We attempt a durable DB write AND an admin notification;
  // the submission only "fails" if it landed in neither place.
  let data: Record<string, any> = {};
  try {
    data = await request.json();
  } catch (parseErr) {
    console.error("Client request body parse error:", parseErr);
  }

  // Never trust a body-supplied client_id (attribution IDOR): a public caller
  // could otherwise forge requests against any account. Attribute only to the
  // caller's own session if they are logged in; otherwise leave unattributed.
  let sessionClientId: string | null = null;
  const clientToken = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
  if (clientToken) {
    const session = await verifyClientSession(clientToken);
    if (session) sessionClientId = session.clientId;
  }

  let captured = false;

  // 1. Durable DB capture
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("client_requests").insert({
      client_id: sessionClientId,
      request_type: data.request_type || "general",
      summary: data.summary || null,
      raw_chat_json: data,
      name: data.name || "Anonymous",
      email: data.email || "",
      phone: data.phone || null,
      communication_pref: data.communication_pref || "email",
      status: "new",
    });
    if (error) console.error("Client request insert error:", error);
    else captured = true;
  } catch (dbErr) {
    console.error("Client request insert threw:", dbErr);
  }

  // 2. Notification to the monitored inbox — lands the lead even if the DB write failed
  try {
    await sendClientRequestNotification(data);
    captured = true;
  } catch (notifyErr) {
    console.error("Request notification error:", notifyErr);
  }

  if (!captured) {
    console.error("Client request captured NOWHERE:", JSON.stringify(data).slice(0, 500));
    return NextResponse.json(
      { error: "We could not record your request. Please email christian@thegatekeepers.club and we will pick it up right away." },
      { status: 500 },
    );
  }

  // Surface the lead in the CGK CRM as a TGC lead (only when identifiable, so
  // the CRM does not fill with anonymous rows). Fire-and-forget.
  if (data.email) {
    syncToCrm({
      record_type: "client",
      person_name: data.name || data.email,
      email: data.email,
      phone: data.phone || undefined,
      stage: "lead",
      subject: `Concierge request: ${data.request_type || "general"}`,
      summary: data.summary || undefined,
    });
  }

  return NextResponse.json({ ok: true });
}
