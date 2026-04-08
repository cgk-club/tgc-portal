import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: "Slug required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Fetch event by slug
  const { data: event, error: eventErr } = await sb
    .from("events")
    .select(
      "id, title, category, date_display, date_start, date_end, location, description, highlights, itinerary, includes, image_url, brochure_url, gallery_images, stats, slug, project_id, lead_capture_enabled"
    )
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (eventErr || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Fetch active packages
  const { data: packages } = await sb
    .from("event_packages")
    .select(
      "id, name, description, price, currency, capacity, sold_count, included_services, sort_order"
    )
    .eq("event_id", event.id)
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  // Fetch brochure URLs from project documents if available
  let brochures: { title: string; url: string }[] = [];
  if (event.project_id) {
    const { data: docs } = await sb
      .from("project_documents")
      .select("title, file_url")
      .eq("project_id", event.project_id)
      .in("title", [
        "The Pavilion Residences — Client Brochure v4",
        "The Pavilion Experience — Client Brochure v4",
      ]);

    brochures = (docs || []).map((d) => ({
      title: d.title.replace(" — Client Brochure v4", ""),
      url: d.file_url,
    }));
  }

  const response = NextResponse.json({
    event,
    packages: packages || [],
    brochures,
  });
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate"
  );
  return response;
}
