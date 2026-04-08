import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const sb = getSupabaseAdmin();

  // Build update object
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.stage !== undefined) update.stage = body.stage;
  if (body.admin_notes !== undefined) update.admin_notes = body.admin_notes;
  if (body.payment_amount !== undefined) update.payment_amount = body.payment_amount;
  if (body.payment_status !== undefined) update.payment_status = body.payment_status;
  if (body.package_interest !== undefined) update.package_interest = body.package_interest;

  // Set timestamp based on stage change
  if (body.stage === "lead") update.enquired_at = new Date().toISOString();
  if (body.stage === "client") update.converted_at = new Date().toISOString();

  const { data, error } = await sb
    .from("event_referrals")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify referrer on stage change
  if (body.stage && data.referrer_id) {
    try {
      const stageLabels: Record<string, string> = {
        lead: "registered interest",
        client: "confirmed and is now a client",
      };
      const label = stageLabels[body.stage];
      if (label) {
        await createNotification({
          user_type: "partner",
          user_id: data.referrer_id,
          title: `${data.prospect_name} has ${label}`,
          body: data.package_interest
            ? `Package: ${data.package_interest}`
            : undefined,
          type: "general",
          link: data.project_id
            ? `/partner/projects/${data.project_id}`
            : undefined,
        });
      }
    } catch {
      // Non-critical
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sb = getSupabaseAdmin();

  const { error } = await sb
    .from("event_referrals")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
