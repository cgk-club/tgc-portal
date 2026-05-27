import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Pavilion — VIP Terraces · Monaco Grand Prix 2026",
  description: "Three days on the Monaco Grand Prix circuit. Breakfast, lunch and open champagne bar at the Silver VIP Terraces. A curated crowd of athletes, entrepreneurs and media.",
  openGraph: {
    title: "The Pavilion — VIP Terraces · Monaco GP 2026",
    description: "Three days on the Monaco Grand Prix circuit. Breakfast, lunch and open champagne bar at the Silver VIP Terraces.",
    type: "website",
    siteName: "The Gatekeepers Club",
    images: [{ url: "https://vxmrvnmtauqqqjikhjbh.supabase.co/storage/v1/object/public/project-documents/pavilion-terrace/hero.jpg", width: 1200, height: 630, alt: "The Pavilion VIP Terraces" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Pavilion — VIP Terraces · Monaco GP 2026",
    description: "Three days on the Monaco Grand Prix circuit.",
    images: ["https://vxmrvnmtauqqqjikhjbh.supabase.co/storage/v1/object/public/project-documents/pavilion-terrace/hero.jpg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
