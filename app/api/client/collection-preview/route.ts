import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const { data } = await getSupabase()
    .from("fiches")
    .select("slug, headline, hero_image_url, template_type")
    .eq("status", "live")
    .not("hero_image_url", "is", null)
    .order("headline")
    .limit(8);

  return NextResponse.json(data || []);
}
