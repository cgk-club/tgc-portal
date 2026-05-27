import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const YACHT_IDS = [
  "3532839c-fefd-445c-8d14-cc5a5277a586", // Pavilion Twin
  "f2d42f8a-0bcc-4599-a119-926bf425bae6", // Pavilion Guest Suite
  "8d7221c9-1d37-4ebf-bd52-cce032be914e", // Pavilion Master Suite
  "3832d96b-4750-44de-8e17-46e6559869d9", // Daytime Pass (Yacht)
  "ac13ca25-a729-4eb7-94a5-19e77fb2e058", // Evening Cocktail
];

const BROCHURES = [
  {
    title: "The Pavilion Residences",
    url: "https://vxmrvnmtauqqqjikhjbh.supabase.co/storage/v1/object/public/project-documents/7593a2ec-c2c2-4813-ba12-9f0372d37780/1779542566550-The_Pavilion_Residences_v5.pdf",
  },
];

export async function GET() {
  const sb = getSupabaseAdmin();
  const { data: packages } = await sb
    .from("event_packages")
    .select("id, name, name_fr, description, description_fr, price, currency, capacity, sold_count, included_services, included_services_fr, sort_order, price_options")
    .in("id", YACHT_IDS)
    .order("sort_order", { ascending: true });

  const res = NextResponse.json({ packages: packages || [], brochures: BROCHURES });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
