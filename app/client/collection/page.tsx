import { getSupabaseAdmin } from "@/lib/supabase";
import CollectionGrid from "@/components/collection/CollectionGrid";
import ClientNavServer from "@/components/client/ClientNavServer";

export const dynamic = "force-dynamic";

export default async function CollectionPage() {
  const supabase = getSupabaseAdmin();

  const { data: fiches, error } = await supabase
    .from("fiches")
    .select("slug, headline, hero_image_url, tags, template_type")
    .eq("status", "live")
    .order("headline");

  if (error) {
    console.error("Failed to load fiches:", error);
  }

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNavServer active="collection" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-2">
        <p className="text-sm text-gray-500 font-body max-w-xl">
          A curated selection of the properties, restaurants, artisans, and
          experiences we work with. Each has been personally vetted and reflects
          the standard we hold for our clients.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <CollectionGrid fiches={fiches || []} />
      </div>
    </div>
  );
}
