import { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params;

  const { data: event } = await getSupabaseAdmin()
    .from("events")
    .select("title, description, image_url, date_display, location")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!event) {
    return {
      title: "Event — The Gatekeepers Club",
    };
  }

  const title = `${event.title} — The Gatekeepers Club`;
  const description = event.description
    ? event.description.slice(0, 200)
    : `${event.title}, ${event.date_display}${event.location ? ` — ${event.location}` : ""}`;

  return {
    title,
    description,
    openGraph: {
      title: event.title,
      description,
      type: "website",
      siteName: "The Gatekeepers Club",
      ...(event.image_url ? { images: [{ url: event.image_url, width: 1200, height: 630, alt: event.title }] } : {}),
    },
    twitter: {
      card: event.image_url ? "summary_large_image" : "summary",
      title: event.title,
      description,
      ...(event.image_url ? { images: [event.image_url] } : {}),
    },
  };
}

export default function EventLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
