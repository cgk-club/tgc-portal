import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();

  // Verify partner is assigned to this project (active only)
  const { data: assignment } = await sb
    .from("project_partners")
    .select("id, role")
    .eq("project_id", projectId)
    .eq("partner_id", session.partnerId)
    .eq("status", "active")
    .single();

  if (!assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();

  if (!body.message || !body.message.trim()) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 }
    );
  }

  // Get partner user name
  const { data: user } = await sb
    .from("partner_users")
    .select("name")
    .eq("id", session.userId)
    .single();

  // Get partner org name as fallback
  const { data: partner } = await sb
    .from("partner_accounts")
    .select("org_name")
    .eq("id", session.partnerId)
    .single();

  const authorName =
    user?.name || partner?.org_name || "Partner";

  const { data, error } = await sb
    .from("project_updates")
    .insert({
      project_id: projectId,
      author_type: "partner",
      author_name: `${authorName} (${assignment.role})`,
      author_id: session.partnerId,
      message: body.message.trim(),
      attachments: body.attachments || [],
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
