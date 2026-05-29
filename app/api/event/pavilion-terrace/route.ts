import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const TERRACE_IDS = [
  "a35b160a-1b56-4c4f-b823-4936a3086906", // Single Day — VIP Terrace
  "c3cc1b10-7b7a-44b8-bce7-9d1379c4f89f", // Weekend Package — VIP Terrace
];

const BROCHURES = [
  {
    title: "The Pavilion Experience",
    url: "https://vxmrvnmtauqqqjikhjbh.supabase.co/storage/v1/object/public/project-documents/7593a2ec-c2c2-4813-ba12-9f0372d37780/The_Pavilion_Experience_v8.pdf",
  },
];

export async function GET() {
  const sb = getSupabaseAdmin();
  const { data: packages } = await sb
    .from("event_packages")
    .select("id, name, name_fr, description, description_fr, price, currency, capacity, sold_count, included_services, included_services_fr, sort_order, price_options")
    .in("id", TERRACE_IDS)
    .order("sort_order", { ascending: true });

  const res = NextResponse.json({ packages: packages || [], brochures: BROCHURES });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
