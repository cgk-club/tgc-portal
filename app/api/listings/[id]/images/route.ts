import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Upload images to a listing. Accepts multipart form data with "files" field.
 * Stores in Supabase storage, updates listing with URLs.
 * No auth required beyond knowing the listing ID (just created by the caller).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = getSupabaseAdmin();

  // Verify listing exists
  const { data: listing, error: fetchErr } = await sb
    .from("listings")
    .select("id, hero_image_url, gallery_image_urls")
    .eq("id", id)
    .single();

  if (fetchErr || !listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const uploadedUrls: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      errors.push(`${file.name}: not an image`);
      continue;
    }

    if (file.size > 20 * 1024 * 1024) {
      errors.push(`${file.name}: exceeds 20MB limit`);
      continue;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 60);
    const path = `listings/${id}/${Date.now()}-${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { data: uploaded, error: uploadErr } = await sb.storage
      .from("fiche-images")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadErr) {
      errors.push(`${file.name}: ${uploadErr.message}`);
      continue;
    }

    const { data: urlData } = sb.storage
      .from("fiche-images")
      .getPublicUrl(uploaded.path);

    uploadedUrls.push(urlData.publicUrl);
  }

  if (uploadedUrls.length === 0) {
    return NextResponse.json(
      { error: "No images uploaded", errors },
      { status: 400 }
    );
  }

  // First uploaded image becomes hero if none exists
  const existingGallery: string[] = listing.gallery_image_urls || [];
  const allUrls = [...existingGallery, ...uploadedUrls];
  const heroUrl = listing.hero_image_url || allUrls[0];
  const galleryUrls = allUrls.filter((url) => url !== heroUrl);

  const { data: updated, error: updateErr } = await sb
    .from("listings")
    .update({
      hero_image_url: heroUrl,
      gallery_image_urls: galleryUrls,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({
    urls: uploadedUrls,
    hero_image_url: heroUrl,
    gallery_count: galleryUrls.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
