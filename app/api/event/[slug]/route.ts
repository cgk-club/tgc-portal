import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const lang = request.nextUrl.searchParams.get("lang") || "en";

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

  // Fetch active packages (including French fields)
  const { data: rawPackages } = await sb
    .from("event_packages")
    .select(
      "id, name, name_fr, description, description_fr, price, currency, capacity, sold_count, included_services, included_services_fr, sort_order, price_options"
    )
    .eq("event_id", event.id)
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  // Apply language
  const packages = (rawPackages || []).map((pkg) => ({
    id: pkg.id,
    name: lang === "fr" && pkg.name_fr ? pkg.name_fr : pkg.name,
    description: lang === "fr" && pkg.description_fr ? pkg.description_fr : pkg.description,
    price: pkg.price,
    currency: pkg.currency,
    capacity: pkg.capacity,
    sold_count: pkg.sold_count,
    included_services: lang === "fr" && pkg.included_services_fr ? pkg.included_services_fr : pkg.included_services,
    sort_order: pkg.sort_order,
    price_options: pkg.price_options || null,
  }));

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
