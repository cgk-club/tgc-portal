import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface VisibilitySettings {
  financials: "hidden" | "read_only" | "full_access";
  tasks: "own_only" | "all";
  documents: "own_only" | "all";
  activity: "filtered" | "all";
  guests: "hidden" | "view";
  sponsors: "hidden" | "view";
  budget: "hidden" | "view";
}

const DEFAULT_VISIBILITY: VisibilitySettings = {
  financials: "hidden",
  tasks: "own_only",
  documents: "own_only",
  activity: "filtered",
  guests: "hidden",
  sponsors: "hidden",
  budget: "hidden",
};

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

  // Verify partner is assigned to this project — include visibility_settings
  const { data: assignment, error: assignErr } = await sb
    .from("project_partners")
    .select("id, role, status, notes, visibility_settings")
    .eq("project_id", projectId)
    .eq("partner_id", session.partnerId)
    .in("status", ["active", "completed"])
    .single();

  if (assignErr || !assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const visibility: VisibilitySettings = {
    ...DEFAULT_VISIBILITY,
    ...(assignment.visibility_settings as Partial<VisibilitySettings> || {}),
  };

  // Always fetch all fields we might need, then filter in response
  const { data: rawProject, error: projErr } = await sb
    .from("client_projects")
    .select(
      "id, client_id, type, title, property_address, property_city, property_country, property_images, property_details, status, start_date, target_date, updated_at, budget, actual_spend, currency"
    )
    .eq("id", projectId)
    .single();

  const project = rawProject as Record<string, unknown>;

  if (projErr || !rawProject) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Get client first name only (privacy) — NO email, NO phone, NO full name
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

  // Get milestones (shared view — safe for partners)
  const { data: milestones } = await sb
    .from("project_milestones")
    .select("id, title, description, status, due_date, completed_date, sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  // Get documents based on visibility
  const { data: allDocuments } = await sb
    .from("project_documents")
    .select(
      "id, title, file_url, file_type, uploaded_by, uploaded_by_type, notes, created_at"
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  let filteredDocuments = allDocuments || [];
  if (visibility.documents === "own_only") {
    filteredDocuments = filteredDocuments.filter(
      (doc) =>
        doc.uploaded_by_type === "admin" ||
        (doc.uploaded_by_type === "partner" && doc.uploaded_by === session.partnerId)
    );
  }
  // If "all", return all documents unfiltered

  // Get updates based on visibility
  const { data: allUpdates } = await sb
    .from("project_updates")
    .select(
      "id, author_type, author_name, message, attachments, created_at"
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(50);

  let filteredUpdates = allUpdates || [];
  if (visibility.activity === "filtered") {
    // Only admin posts and this partner's own posts
    filteredUpdates = filteredUpdates.filter(
      (u) => u.author_type === "admin" || u.author_type === "partner"
    );
  }
  // If "all", return all updates unfiltered

  // Get all partners on the project (IDs + roles for task assignment, org names for display)
  const { data: allProjectPartners } = await sb
    .from("project_partners")
    .select("partner_id, role, status, partner:partner_accounts!partner_id(org_name)")
    .eq("project_id", projectId)
    .in("status", ["active", "completed"]);

  const otherPartners = (allProjectPartners || []).filter(
    (p) => p.partner_id !== session.partnerId
  );

  // Get tasks based on visibility
  let tasks;
  if (visibility.tasks === "all") {
    const { data: allTasks } = await sb
      .from("project_tasks")
      .select("id, title, description, priority, status, due_date, completed_date, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    tasks = allTasks || [];
  } else {
    // own_only — tasks assigned to this partner + unassigned tasks
    const { data: allProjectTasks } = await sb
      .from("project_tasks")
      .select("id, title, description, priority, status, due_date, completed_date, assigned_to, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    tasks = (allProjectTasks || []).filter((t) => {
      const assignees = t.assigned_to as string[] | null;
      return !assignees || assignees.length === 0 || assignees.includes(session.partnerId);
    }).map(({ assigned_to, ...rest }) => rest);
  }

  // Build financials based on visibility
  let financials: unknown[] = [];
  if (visibility.financials !== "hidden") {
    const { data: allFinancials } = await sb
      .from("project_financials")
      .select("id, type, description, amount, currency, date, document_url, status, notes, created_at")
      .eq("project_id", projectId)
      .order("date", { ascending: false, nullsFirst: false });

    if (visibility.financials === "read_only") {
      // Strip notes and internal fields
      financials = (allFinancials || []).map((f) => ({
        id: f.id,
        type: f.type,
        description: f.description,
        amount: f.amount,
        currency: f.currency,
        date: f.date,
        status: f.status,
      }));
    } else {
      // full_access
      financials = allFinancials || [];
    }
  }

  // Build guests based on visibility
  // Partners only see first names for client-type guests (privacy rule)
  let guests: unknown[] = [];
  if (visibility.guests === "view") {
    const { data: projectGuests } = await sb
      .from("event_guests")
      .select("id, name, guest_type, company, status, created_at")
      .eq("project_id", projectId)
      .order("name", { ascending: true });
    guests = (projectGuests || []).map((g) => ({
      id: g.id,
      name: g.guest_type === "client"
        ? (g.name?.split(" ")[0] || "Guest")
        : g.name,
      company: g.company,
      status: g.status,
    }));
  }

  // Build sponsors based on visibility
  let sponsors: string[] = [];
  if (visibility.sponsors === "view") {
    const pd = project.property_details as Record<string, unknown> | null;
    if (pd?.sponsors) {
      sponsors = Array.isArray(pd.sponsors) ? pd.sponsors as string[] : [];
    }
  }

  // Build project response
  const projectResponse: Record<string, unknown> = {
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
  };

  // Budget visible only if allowed
  if (visibility.budget === "view") {
    projectResponse.budget = project.budget;
    projectResponse.actual_spend = project.actual_spend;
    projectResponse.currency = project.currency;
  }

  const responseBody: Record<string, unknown> = {
    project: projectResponse,
    client_first_name: clientFirstName,
    assignment: {
      role: assignment.role,
      status: assignment.status,
      notes: assignment.notes,
    },
    visibility_settings: visibility,
    milestones: milestones || [],
    documents: filteredDocuments,
    updates: filteredUpdates.reverse(),
    other_partners: (otherPartners || []).map((p) => ({
      role: p.role,
      status: p.status,
    })),
    // All active partners for task assignment (id + name + role)
    assignable_partners: (allProjectPartners || [])
      .filter((p) => p.status === "active")
      .map((p) => ({
        id: p.partner_id,
        name: (p.partner as unknown as Record<string, unknown>)?.org_name || "Partner",
        role: p.role,
      })),
    tasks: tasks,
  };

  // Include extra sections based on visibility
  if (visibility.financials !== "hidden") {
    responseBody.financials = financials;
  }
  if (visibility.guests === "view") {
    responseBody.guests = guests;
  }
  if (visibility.sponsors === "view") {
    responseBody.sponsors = sponsors;
  }

  const response = NextResponse.json(responseBody);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}
