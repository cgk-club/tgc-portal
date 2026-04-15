import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";
import { sendFicheEditSubmittedNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ficheId } = await params;

  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();
  const partnerId = session.partnerId;

  // Verify fiche ownership
  const { data: fiche } = await sb
    .from("fiches")
    .select("id, partner_account_id, airtable_record_id, slug, headline")
    .eq("id", ficheId)
    .single();

  if (!fiche) return NextResponse.json({ error: "Fiche not found" }, { status: 404 });

  let isOwner = fiche.partner_account_id === partnerId;
  if (!isOwner) {
    const { data: org } = await sb
      .from("partner_accounts")
      .select("org_ids")
      .eq("id", partnerId)
      .single();

    const orgIds = org?.org_ids || [];
    isOwner = !!(fiche.airtable_record_id && orgIds.includes(fiche.airtable_record_id));
  }

  if (!isOwner) return NextResponse.json({ error: "Fiche not found" }, { status: 404 });

  const body = await request.json();
  // Accept either { changes: {...} } or flat fields directly
  const changes = body.changes || body;
  if (!changes || typeof changes !== "object" || Object.keys(changes).length === 0) {
    return NextResponse.json({ error: "Changes object required" }, { status: 400 });
  }

  // Supersede any earlier pending requests for the same fiche+partner so the
  // approvals queue shows only the latest intent. The schema's status CHECK
  // constraint only allows pending/approved/rejected, so older rows are marked
  // rejected with a note.
  await sb
    .from("fiche_edit_requests")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      admin_note: "Superseded by a later submission from the same partner.",
    })
    .eq("fiche_id", ficheId)
    .eq("partner_id", partnerId)
    .eq("status", "pending");

  const { data: editRequest, error } = await sb
    .from("fiche_edit_requests")
    .insert({
      fiche_id: ficheId,
      partner_id: partnerId,
      changes,
      status: "pending",
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Push-notify admin: in-app activity row + email ping to christian@.
  // Fire-and-forget so delivery issues never block the partner response.
  const { data: partnerAccount } = await sb
    .from("partner_accounts")
    .select("org_name, email")
    .eq("id", partnerId)
    .single();

  const partnerName = partnerAccount?.org_name || partnerAccount?.email || "Unknown partner";
  const ficheLabel = fiche.headline || fiche.slug || "a fiche";
  const changedFields = Object.keys(changes);

  createNotification({
    user_type: "admin",
    user_id: "admin",
    title: `Fiche edit submitted: ${ficheLabel}`,
    body: `${partnerName} submitted changes to ${changedFields.length} field(s). Review in Approvals.`,
    type: "approval",
    link: "/admin/approvals",
  }).catch(() => {});

  sendFicheEditSubmittedNotification({
    partnerName,
    partnerEmail: partnerAccount?.email || "",
    ficheHeadline: fiche.headline || "",
    ficheSlug: fiche.slug || "",
    changedFields,
  }).catch(() => {});

  return NextResponse.json(editRequest, { status: 201 });
}
