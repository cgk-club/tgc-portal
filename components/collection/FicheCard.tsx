import Link from "next/link";
import Image from "next/image";

interface FicheCardProps {
  slug: string;
  headline: string;
  heroImageUrl: string | null;
  tags: string[];
  templateType: string;
}

const templateLabels: Record<string, string> = {
  hospitality: "Hotel",
  dining: "Dining",
  maker: "Artisan",
  transport: "Transport",
  wine_estate: "Wine Estate",
  wellness: "Wellness",
  experience: "Experience",
  events_sport: "Events & Sport",
  arts_culture: "Arts & Culture",
  real_estate: "Real Estate",
  default: "",
};

export default function FicheCard({
  slug,
  headline,
  heroImageUrl,
  tags,
  templateType,
}: FicheCardProps) {
  const label = templateLabels[templateType] || templateType;
  const locationTags = tags.filter(
    (t) =>
      !["Hotel", "Restaurant", "Artisan", "Transport", "Events", "Sport", "Wine", "Luxury", "Heritage", "Boutique", "Fine Dining", "Michelin", "Story", "Seasonal", "Pool", "Garden", "Palazzo", "Masseria", "Driving", "Experiences", "Lagoon", "Tasting Menu", "Chauffeur", "Global", "Transfers", "VIP Hospitality", "TEFAF", "Accommodation", "Terroir", "Gold Leaf", "Belmond", "Supercar"].includes(t)
  );

  return (
    <Link href={`/fiche/${slug}`} className="group block">
      <div className="border border-green/10 rounded-lg overflow-hidden bg-white transition-shadow hover:shadow-lg">
        <div className="relative h-52 sm:h-56 bg-green-muted overflow-hidden">
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt={headline}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-green/30 text-sm font-body">No image</span>
            </div>
          )}
          {label && (
            <span className="absolute top-3 left-3 bg-green/90 text-white text-[10px] tracking-[1.5px] uppercase px-3 py-1 rounded-sm font-body">
              {label}
            </span>
          )}
        </div>
        <div className="p-4 sm:p-5">
          <h3 className="font-heading text-base font-semibold text-gray-800 leading-snug mb-2 group-hover:text-green transition-colors">
            {slug
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}
          </h3>
          <p className="text-sm text-gray-500 font-body leading-relaxed line-clamp-2">
            {headline}
          </p>
          {locationTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {locationTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-green/70 bg-green-muted px-2 py-0.5 rounded-sm font-body"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
