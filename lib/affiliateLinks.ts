import { getSupabase } from "@/lib/supabase";

export const AFFILIATE_ID = "13569";

export const COMMISSION_RATES = {
  standard: 2.5,
  monaco_terraces: 5,
} as const;

interface AffiliateLink {
  id: string;
  event_name: string;
  url: string;
  category: string;
  provider: string;
  affiliate_id: string;
  commission_rate: number;
  notes: string | null;
}

/**
 * Searches affiliate_links by event name (fuzzy match) and returns the URL.
 * Falls back to null if no match found.
 */
export async function getAffiliateUrl(
  eventName: string,
  affiliateId: string = AFFILIATE_ID
): Promise<string | null> {
  const supabase = getSupabase();

  // Try exact match first
  const { data: exact } = await supabase
    .from("affiliate_links")
    .select("url")
    .ilike("event_name", eventName)
    .limit(1)
    .single();

  if (exact?.url) {
    return appendAffiliateId(exact.url, affiliateId);
  }

  // Fuzzy match: search for links where event_name is contained in the search term or vice versa
  const { data: allLinks } = await supabase
    .from("affiliate_links")
    .select("event_name, url");

  if (!allLinks || allLinks.length === 0) return null;

  const normalised = eventName.toLowerCase().trim();

  // Score each link by how well it matches
  let bestMatch: { url: string; score: number } | null = null;

  for (const link of allLinks) {
    const linkName = link.event_name.toLowerCase().trim();
    let score = 0;

    if (normalised.includes(linkName)) {
      score = linkName.length / normalised.length;
    } else if (linkName.includes(normalised)) {
      score = normalised.length / linkName.length;
    } else {
      // Check word overlap
      const searchWords = normalised.split(/\s+/);
      const linkWords = linkName.split(/\s+/);
      const overlap = searchWords.filter((w) => linkWords.includes(w)).length;
      if (overlap > 0) {
        score = overlap / Math.max(searchWords.length, linkWords.length);
      }
    }

    if (score > 0.3 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { url: link.url, score };
    }
  }

  if (bestMatch) {
    return appendAffiliateId(bestMatch.url, affiliateId);
  }

  return null;
}

/**
 * Fetches all affiliate links grouped by category.
 */
export async function getAffiliateLinksByCategory(): Promise<
  Record<string, AffiliateLink[]>
> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("affiliate_links")
    .select("*")
    .order("event_name", { ascending: true });

  if (error || !data) return {};

  const grouped: Record<string, AffiliateLink[]> = {};
  for (const link of data) {
    const cat = link.category || "Uncategorised";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(link);
  }

  return grouped;
}

function appendAffiliateId(url: string, affiliateId: string): string {
  // If URL already contains the affiliate ID param, return as-is
  if (url.includes(`affiliate=${affiliateId}`) || url.includes(`aff=${affiliateId}`)) {
    return url;
  }
  // Otherwise just return the URL as stored (it should already have the affiliate param)
  return url;
}
