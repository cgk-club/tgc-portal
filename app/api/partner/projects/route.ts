import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();

  // Get all project assignments for this partner
  const { data: assignments, error: assignErr } = await sb
    .from("project_partners")
    .select("id, project_id, role, status, notes, created_at")
    .eq("partner_id", session.partnerId)
    .in("status", ["active", "completed"]);

  if (assignErr)
    return NextResponse.json({ error: assignErr.message }, { status: 500 });

  if (!assignments || assignments.length === 0) {
    return NextResponse.json([]);
  }

  const projectIds = assignments.map((a) => a.project_id);

  // Get projects
  const { data: projects, error: projErr } = await sb
    .from("client_projects")
    .select(
      "id, client_id, type, title, property_address, property_city, property_country, status, start_date, target_date, updated_at"
    )
    .in("id", projectIds);

  if (projErr)
    return NextResponse.json({ error: projErr.message }, { status: 500 });

  if (!projects || projects.length === 0) {
    return NextResponse.json([]);
  }

  // Get client first names only (privacy)
  const clientIds = Array.from(
    new Set(projects.map((p) => p.client_id).filter(Boolean))
  );
  let clientMap: Record<string, string> = {};
  if (clientIds.length > 0) {
    const { data: clients } = await sb
      .from("client_accounts")
      .select("id, name")
      .in("id", clientIds);
    if (clients) {
      clientMap = Object.fromEntries(
        clients.map((c) => [c.id, (c.name || "").split(" ")[0] || "Client"])
      );
    }
  }

  // Get milestone counts per project
  const { data: milestones } = await sb
    .from("project_milestones")
    .select("id, project_id, status")
    .in("project_id", projectIds);

  const milestoneCounts: Record<
    string,
    { total: number; completed: number }
  > = {};
  if (milestones) {
    for (const m of milestones) {
      if (!milestoneCounts[m.project_id]) {
        milestoneCounts[m.project_id] = { total: 0, completed: 0 };
      }
      milestoneCounts[m.project_id].total++;
      if (m.status === "completed") {
        milestoneCounts[m.project_id].completed++;
      }
    }
  }

  // Get latest update date per project
  const { data: latestUpdates } = await sb
    .from("project_updates")
    .select("project_id, created_at")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false });

  const lastUpdateMap: Record<string, string> = {};
  if (latestUpdates) {
    for (const u of latestUpdates) {
      if (!lastUpdateMap[u.project_id]) {
        lastUpdateMap[u.project_id] = u.created_at;
      }
    }
  }

  // Merge everything
  const assignmentMap = Object.fromEntries(
    assignments.map((a) => [a.project_id, a])
  );

  const result = projects.map((p) => ({
    id: p.id,
    title: p.title,
    type: p.type,
    property_address: p.property_address,
    property_city: p.property_city,
    property_country: p.property_country,
    status: p.status,
    start_date: p.start_date,
    target_date: p.target_date,
    client_first_name: p.client_id ? clientMap[p.client_id] || "Client" : null,
    partner_role: assignmentMap[p.id]?.role || "",
    partner_status: assignmentMap[p.id]?.status || "active",
    milestones: milestoneCounts[p.id] || { total: 0, completed: 0 },
    last_update: lastUpdateMap[p.id] || p.updated_at,
  }));

  // Sort: active first, then by last_update desc
  result.sort((a, b) => {
    if (a.status === "active" && b.status !== "active") return -1;
    if (a.status !== "active" && b.status === "active") return 1;
    return (
      new Date(b.last_update).getTime() - new Date(a.last_update).getTime()
    );
  });

  return NextResponse.json(result);
}
