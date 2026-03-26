import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from "@/lib/partner-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createListingFromChat } from "@/lib/marketplace";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();
  const includeEnquiries = request.nextUrl.searchParams.get("include") === "enquiries";

  // Fetch partner's listings
  const { data: listings, error } = await sb
    .from("listings")
    .select("*")
    .eq("partner_account_id", session.partnerId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (includeEnquiries && listings && listings.length > 0) {
    const listingIds = listings.map((l: { id: string }) => l.id);
    const { data: enquiries } = await sb
      .from("enquiries")
      .select("*")
      .in("listing_id", listingIds)
      .order("created_at", { ascending: false });

    // Map listing titles to enquiries
    const listingTitleMap: Record<string, string> = {};
    for (const l of listings) {
      listingTitleMap[l.id] = l.title;
    }

    const enrichedEnquiries = (enquiries || []).map((e: Record<string, unknown>) => ({
      ...e,
      listing_title: listingTitleMap[e.listing_id as string] || "Unknown",
    }));

    return NextResponse.json({ listings, enquiries: enrichedEnquiries });
  }

  // Also get enquiry counts per listing
  if (listings && listings.length > 0) {
    const listingIds = listings.map((l: { id: string }) => l.id);
    const { data: enquiryCounts } = await sb
      .from("enquiries")
      .select("listing_id")
      .in("listing_id", listingIds);

    const countMap: Record<string, number> = {};
    if (enquiryCounts) {
      for (const e of enquiryCounts) {
        countMap[e.listing_id] = (countMap[e.listing_id] || 0) + 1;
      }
    }

    const enriched = listings.map((l: Record<string, unknown>) => ({
      ...l,
      enquiry_count: countMap[l.id as string] || 0,
    }));

    return NextResponse.json(enriched);
  }

  return NextResponse.json(listings || []);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifyPartnerSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();

  // Get partner org name
  const { data: partner } = await sb
    .from("partner_accounts")
    .select("org_name")
    .eq("id", session.partnerId)
    .single();

  const partnerName = partner?.org_name || "Partner";

  const body = await request.json();

  try {
    const listing = await createListingFromChat(
      {
        title: body.title,
        category: body.category,
        maker_brand: body.maker_brand,
        year: body.year,
        condition: body.condition,
        location: body.location,
        price: body.price ? parseFloat(body.price) : undefined,
        price_display: body.price_display,
        hero_image_url: body.hero_image_url,
        gallery_image_urls: body.gallery_image_urls,
        editorial_description: body.editorial_description,
        seller_raw_input: body.seller_raw_input,
        category_fields: body.category_fields || body,
      },
      session.partnerId,
      partnerName
    );

    return NextResponse.json(listing, { status: 201 });
  } catch (err) {
    console.error("Listing creation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create listing" },
      { status: 500 }
    );
  }
}
