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

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string) || "";
  const fileType = (formData.get("file_type") as string) || "document";
  const notes = (formData.get("notes") as string) || "";

  if (!file) {
    return NextResponse.json(
      { error: "No file provided" },
      { status: 400 }
    );
  }

  if (!title.trim()) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  // Upload file to storage
  const ext = file.name.split(".").pop() || "pdf";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `projects/${projectId}/partner-${session.partnerId}/${fileName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadErr } = await sb.storage
    .from("fiche-images")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadErr) {
    return NextResponse.json(
      { error: uploadErr.message },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = sb.storage.from("fiche-images").getPublicUrl(filePath);

  // Get partner org name
  const { data: partner } = await sb
    .from("partner_accounts")
    .select("org_name")
    .eq("id", session.partnerId)
    .single();

  const uploaderName = partner?.org_name || "Partner";

  // Create document record
  const { data, error } = await sb
    .from("project_documents")
    .insert({
      project_id: projectId,
      title: title.trim(),
      file_url: publicUrl,
      file_type: fileType,
      uploaded_by: `${uploaderName} (${assignment.role})`,
      uploaded_by_type: "partner",
      notes: notes.trim() || null,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Also post an update about the document
  await sb.from("project_updates").insert({
    project_id: projectId,
    author_type: "partner",
    author_name: `${uploaderName} (${assignment.role})`,
    author_id: session.partnerId,
    message: `Uploaded ${fileType}: ${title.trim()}`,
    attachments: [{ url: publicUrl, name: file.name }],
  });

  return NextResponse.json(data, { status: 201 });
}
