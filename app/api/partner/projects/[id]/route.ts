import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
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

  // Verify partner is assigned to this project
  const { data: assignment, error: assignErr } = await sb
    .from("project_partners")
    .select("id, role, status, notes")
    .eq("project_id", projectId)
    .eq("partner_id", session.partnerId)
    .in("status", ["active", "completed"])
    .single();

  if (assignErr || !assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get project
  const { data: project, error: projErr } = await sb
    .from("client_projects")
    .select(
      "id, client_id, type, title, property_address, property_city, property_country, property_images, status, start_date, target_date, updated_at"
    )
    .eq("id", projectId)
    .single();

  if (projErr || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Get client first name only (privacy)
  let clientFirstName = "Client";
  if (project.client_id) {
    const { data: client } = await sb
      .from("client_accounts")
      .select("name")
      .eq("id", project.client_id)
      .single();
    if (client?.name) {
      clientFirstName = client.name.split(" ")[0] || "Client";
    }
  }

  // Get milestones
  const { data: milestones } = await sb
    .from("project_milestones")
    .select("id, title, description, status, due_date, completed_date, sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  // Get documents
  const { data: documents } = await sb
    .from("project_documents")
    .select(
      "id, title, file_url, file_type, uploaded_by, uploaded_by_type, notes, created_at"
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  // Get recent updates (last 50)
  const { data: updates } = await sb
    .from("project_updates")
    .select(
      "id, author_type, author_name, message, attachments, created_at"
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(50);

  // Get other partners on the project (just roles, no sensitive info)
  const { data: otherPartners } = await sb
    .from("project_partners")
    .select("role, status")
    .eq("project_id", projectId)
    .neq("partner_id", session.partnerId)
    .in("status", ["active", "completed"]);

  // Get tasks assigned to this partner
  const { data: tasks } = await sb
    .from("project_tasks")
    .select("*")
    .eq("project_id", projectId)
    .contains("assigned_to", [session.partnerId])
    .order("created_at", { ascending: false });

  return NextResponse.json({
    project: {
      id: project.id,
      title: project.title,
      type: project.type,
      property_address: project.property_address,
      property_city: project.property_city,
      property_country: project.property_country,
      property_images: project.property_images || [],
      status: project.status,
      start_date: project.start_date,
      target_date: project.target_date,
    },
    client_first_name: clientFirstName,
    assignment: {
      role: assignment.role,
      status: assignment.status,
      notes: assignment.notes,
    },
    milestones: milestones || [],
    documents: documents || [],
    updates: (updates || []).reverse(),
    other_partners: (otherPartners || []).map((p) => ({
      role: p.role,
      status: p.status,
    })),
    tasks: tasks || [],
  });
}
