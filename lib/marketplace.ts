import { getSupabaseAdmin } from "./supabase";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function getCommissionRate(price: number): number {
  if (price <= 10_000) return 0.10;
  if (price <= 50_000) return 0.075;
  if (price <= 100_000) return 0.05;
  if (price <= 500_000) return 0.03;
  return 0.02;
}

interface ChatListingData {
  title?: string;
  category: string;
  maker_brand?: string;
  year?: string;
  condition?: string;
  location?: string;
  price?: number;
  price_display?: string;
  hero_image_url?: string;
  gallery_image_urls?: string[];
  editorial_description?: string;
  seller_raw_input?: string;
  category_fields?: Record<string, unknown>;
}

export async function createListingFromChat(
  data: ChatListingData,
  partnerId: string,
  partnerName: string
) {
  const sb = getSupabaseAdmin();
  const title = data.title || "Untitled Listing";
  const slug = slugify(title);
  const uniqueSlug = `${slug}-${Date.now().toString(36)}`;

  const commissionRate = data.price ? getCommissionRate(data.price) : null;

  const { data: listing, error } = await sb
    .from("listings")
    .insert({
      title,
      slug: uniqueSlug,
      category: data.category,
      maker_brand: data.maker_brand || null,
      year: data.year || null,
      condition: data.condition || null,
      location: data.location || null,
      price: data.price || null,
      price_display: data.price_display || "show_price",
      hero_image_url: data.hero_image_url || null,
      gallery_image_urls: data.gallery_image_urls || [],
      editorial_description: data.editorial_description || null,
      seller_raw_input: data.seller_raw_input || null,
      category_fields: data.category_fields || {},
      commission_rate: commissionRate,
      seller_type: "partner",
      seller_display_name: partnerName,
      partner_account_id: partnerId,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create listing: ${error.message}`);
  return listing;
}
