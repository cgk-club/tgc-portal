import { NextRequest, NextResponse } from "next/server";
import { verifyClientSession, CLIENT_COOKIE_NAME } from "@/lib/client-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyClientSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();

  // Get client name
  const { data: client } = await sb
    .from("client_accounts")
    .select("name, email")
    .eq("id", session.clientId)
    .single();

  const clientName = client?.name || client?.email || "Private Seller";

  const body = await request.json();

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80);
  }

  const title = body.title || "Untitled Listing";
  const slug = slugify(title);
  const uniqueSlug = `${slug}-${Date.now().toString(36)}`;

  const price = body.price ? parseFloat(body.price) : null;

  const { data: listing, error } = await sb
    .from("listings")
    .insert({
      title,
      slug: uniqueSlug,
      category: body.category,
      maker_brand: body.maker_brand || null,
      year: body.year || null,
      condition: body.condition || null,
      location: body.location || null,
      price,
      price_display: body.price_display || "show_price",
      hero_image_url: body.hero_image_url || null,
      gallery_image_urls: body.gallery_image_urls || [],
      editorial_description: body.editorial_description || null,
      seller_raw_input: body.seller_raw_input || null,
      category_fields: body.category_fields || body,
      seller_type: "private",
      seller_display_name: clientName,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    console.error("Client listing creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify admin
  createNotification({
    user_type: "admin",
    user_id: "admin",
    title: `New marketplace listing from ${clientName}`,
    body: `${title} (${body.category}) — submitted by client, awaiting photos and review`,
    type: "general",
    link: "/admin/marketplace",
  }).catch(() => {});

  return NextResponse.json(listing, { status: 201 });
}
