import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

function generateReference(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix || "TGC"}-${code}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    event_id,
    event_title,
    tier_id,
    tier_name,
    tier_option,
    guest_name,
    guest_email,
    guest_phone,
    payment_method,
    base_amount,
    notes,
  } = body;

  if (!event_id || !guest_name || !guest_email || !payment_method) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Fetch event payment_config for bank details + reference prefix
  const { data: event } = await sb
    .from("events")
    .select("id, title, payment_config")
    .eq("id", event_id)
    .single();

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const config = event.payment_config as {
    account_name?: string;
    bank_name?: string;
    iban?: string;
    bic?: string;
    reference_prefix?: string;
  } | null;

  const cc_surcharge = payment_method === "credit_card" ? 1.035 : 1;
  const total_amount = base_amount ? Math.round(base_amount * cc_surcharge * 100) / 100 : null;
  const reference = generateReference(config?.reference_prefix || "TGC");

  const { data: booking, error } = await sb
    .from("event_bookings")
    .insert({
      event_id,
      event_title: event_title || event.title,
      tier_id: tier_id || null,
      tier_name: tier_name || null,
      tier_option: tier_option || null,
      guest_name,
      guest_email,
      guest_phone: guest_phone || null,
      payment_method,
      base_amount: base_amount || null,
      total_amount,
      currency: "EUR",
      status: "pending",
      reference,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify christian@
  const tierLabel = tier_name ? `${tier_name}${tier_option ? ` — ${tier_option}` : ""}` : "Not specified";
  const payLabel = payment_method === "bank_transfer" ? "Bank Transfer" : "Credit Card";
  const amountLabel = total_amount ? `€${total_amount.toLocaleString("fr-FR")}` : "TBC";

  await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: "jeeves@thegatekeepers.club",
    to: "christian@thegatekeepers.club",
    subject: `New Booking — ${event.title} — ${guest_name}`,
    html: `
      <p><strong>New event booking received.</strong></p>
      <table cellpadding="6" style="font-family:sans-serif;font-size:14px">
        <tr><td><strong>Event</strong></td><td>${event.title}</td></tr>
        <tr><td><strong>Reference</strong></td><td>${reference}</td></tr>
        <tr><td><strong>Tier</strong></td><td>${tierLabel}</td></tr>
        <tr><td><strong>Guest</strong></td><td>${guest_name}</td></tr>
        <tr><td><strong>Email</strong></td><td>${guest_email}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${guest_phone || "—"}</td></tr>
        <tr><td><strong>Payment</strong></td><td>${payLabel}</td></tr>
        <tr><td><strong>Amount</strong></td><td>${amountLabel}${payment_method === "credit_card" ? " (incl. 3.5% CC fee)" : ""}</td></tr>
        ${notes ? `<tr><td><strong>Notes</strong></td><td>${notes}</td></tr>` : ""}
      </table>
    `,
  }).catch(() => {}); // Non-fatal

  const response: Record<string, unknown> = { ok: true, reference, payment_method, total_amount };

  if (payment_method === "bank_transfer" && config) {
    response.bank_details = {
      account_name: config.account_name || "The Gatekeepers Club",
      bank_name: config.bank_name || "",
      iban: config.iban || "",
      bic: config.bic || "",
      amount: total_amount,
      reference,
    };
  }

  return NextResponse.json(response, { status: 201 });
}
