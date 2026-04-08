import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const FROM_EMAIL = process.env.FROM_EMAIL || "jeeves@thegatekeepers.club";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();
  const {
    action,
    ref_code,
    name,
    email,
    phone,
    company,
    package_interest,
    attending_as,
  } = body;

  if (!action) {
    return NextResponse.json({ error: "Action required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Find the event
  const { data: event } = await sb
    .from("events")
    .select("id, title, project_id, lead_capture_enabled")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Resolve referrer from ref_code
  let referrerId: string | null = null;
  if (ref_code) {
    const { data: partner } = await sb
      .from("partner_accounts")
      .select("id")
      .eq("referral_code", ref_code)
      .eq("status", "active")
      .single();
    if (partner) {
      referrerId = partner.id;
    }
  }

  // Action: view (track page view with ref code)
  if (action === "view") {
    if (!ref_code || !referrerId) {
      return NextResponse.json({ ok: true }); // No ref code, nothing to track
    }

    // Check if this ref_code already has a "sent" entry (avoid duplicates per session)
    const { data: existing } = await sb
      .from("event_referrals")
      .select("id")
      .eq("event_id", event.id)
      .eq("referrer_code", ref_code)
      .eq("stage", "sent")
      .is("prospect_email", null)
      .limit(1)
      .single();

    if (!existing) {
      await sb.from("event_referrals").insert({
        event_id: event.id,
        project_id: event.project_id,
        referrer_id: referrerId,
        referrer_code: ref_code,
        stage: "sent",
        source: "link_click",
        viewed_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true });
  }

  // Action: enquire (lead capture)
  if (action === "enquire") {
    if (!email || !name) {
      return NextResponse.json(
        { error: "Name and email required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Check if this email already has a referral for this event
    const { data: existingLead } = await sb
      .from("event_referrals")
      .select("id, referrer_id, stage")
      .eq("event_id", event.id)
      .eq("prospect_email", emailLower)
      .single();

    if (existingLead) {
      // Update existing record (don't change referrer, first referrer wins)
      await sb
        .from("event_referrals")
        .update({
          prospect_name: name,
          prospect_phone: phone || null,
          prospect_company: company || null,
          package_interest: package_interest || null,
          attending_as: attending_as || null,
          stage:
            existingLead.stage === "client" ? "client" : "lead",
          enquired_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingLead.id);
    } else {
      // Create new referral record
      await sb.from("event_referrals").insert({
        event_id: event.id,
        project_id: event.project_id,
        referrer_id: referrerId,
        referrer_code: ref_code || null,
        prospect_name: name,
        prospect_email: emailLower,
        prospect_phone: phone || null,
        prospect_company: company || null,
        stage: "lead",
        package_interest: package_interest || null,
        attending_as: attending_as || null,
        source: ref_code ? "link_click" : "enquiry_form",
        enquired_at: new Date().toISOString(),
      });
    }

    // Admin notification
    try {
      // Get admin user ID (Christian)
      const { data: adminAccounts } = await sb
        .from("client_accounts")
        .select("id")
        .limit(1);

      // Use a fixed admin notification approach
      await sb.from("notifications").insert({
        user_type: "admin",
        user_id: "00000000-0000-0000-0000-000000000000",
        title: `New lead: ${name}`,
        body: `${name} is interested in ${package_interest || "The Pavilion"}${attending_as === "couple" ? " (couple)" : ""}. Email: ${emailLower}${ref_code ? `. Referred by: ${ref_code}` : ""}`,
        type: "general",
        link: event.project_id
          ? `/admin/projects/${event.project_id}`
          : null,
      });
    } catch {
      // Non-critical
    }

    // Partner notification (if referred)
    if (referrerId) {
      try {
        await createNotification({
          user_type: "partner",
          user_id: referrerId,
          title: `Your referral ${name} registered interest`,
          body: `${name} is interested in ${package_interest || "The Pavilion"}${attending_as === "couple" ? " (couple)" : ""}.`,
          type: "general",
          link: event.project_id
            ? `/partner/projects/${event.project_id}`
            : undefined,
        });
      } catch {
        // Non-critical
      }
    }

    // Send confirmation email to prospect
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        "https://portal.thegatekeepers.club";

      await resend.emails.send({
        from: `The Gatekeepers Club <${FROM_EMAIL}>`,
        to: emailLower,
        subject: "The Pavilion, Monaco Grand Prix 2026",
        html: `<div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <p style="font-size: 10px; letter-spacing: 3px; color: #c8aa4a; text-transform: uppercase; margin-bottom: 30px;">THE PAVILION</p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">${name},</p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Thank you for your interest in The Pavilion at the Monaco Grand Prix, 5-8 June 2026.</p>
          ${package_interest ? `<p style="color: #333; font-size: 16px; line-height: 1.6;">You expressed interest in: <strong>${package_interest}</strong>${attending_as === "couple" ? " (couple)" : ""}.</p>` : ""}
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Christian de Jabrun from The Gatekeepers Club will be in touch shortly with full details and next steps.</p>
          <p style="margin: 30px 0;"><a href="${appUrl}/event/the-pavilion" style="display: inline-block; background: #0e4f51; color: white; text-decoration: none; padding: 12px 24px; font-size: 14px; letter-spacing: 1px;">View The Pavilion</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 10px; letter-spacing: 3px; color: #c8aa4a; text-transform: uppercase;">The Gatekeepers Club</p>
          <p style="color: #999; font-size: 12px;">christian@thegatekeepers.club</p>
        </div>`,
      });
    } catch {
      // Non-critical: email failure shouldn't break lead capture
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
