import { getSupabaseAdmin } from "@/lib/supabase";
import CollectionGrid from "@/components/collection/CollectionGrid";
import Link from "next/link";

export default async function CollectionPage() {
  const supabase = getSupabaseAdmin();

  const { data: fiches } = await supabase
    .from("fiches")
    .select("slug, headline, hero_image_url, tags, template_type")
    .eq("status", "live")
    .order("headline");

  return (
    <div className="min-h-screen bg-pearl">
      {/* Header */}
      <header className="border-b border-green/10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[3px] text-gold uppercase">
              The Gatekeepers Club
            </p>
            <h1 className="font-heading text-lg font-semibold text-green mt-0.5">
              Our Collection
            </h1>
          </div>
          <Link
            href="/client"
            className="text-xs text-green/60 hover:text-green font-body transition-colors"
          >
            Back to portal
          </Link>
        </div>
      </header>

      {/* Intro */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-2">
        <p className="text-sm text-gray-500 font-body max-w-xl">
          A curated selection of the properties, restaurants, artisans, and
          experiences we work with. Each has been personally vetted and reflects
          the standard we hold for our clients.
        </p>
      </div>

      {/* Collection */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <CollectionGrid fiches={fiches || []} />
      </div>
    </div>
  );
}
