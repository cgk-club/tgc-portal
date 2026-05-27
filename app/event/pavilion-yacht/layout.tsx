import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Pavilion — Yacht · Monaco Grand Prix 2026",
  description: "Three nights aboard Private Superyacht in Monaco harbour. Private accommodation, daytime hospitality on the water, and evening cocktail dinatoire with international athletes.",
  openGraph: {
    title: "The Pavilion — Yacht · Monaco GP 2026",
    description: "Three nights aboard Private Superyacht. Accommodation, daytime hospitality, and evening cocktail dinatoire in Monaco.",
    type: "website",
    siteName: "The Gatekeepers Club",
    images: [{ url: "https://vxmrvnmtauqqqjikhjbh.supabase.co/storage/v1/object/public/project-documents/pavilion-terrace/yachts-circuit.jpg", width: 1200, height: 630, alt: "The Pavilion Yacht Monaco" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Pavilion — Yacht · Monaco GP 2026",
    description: "Three nights aboard Private Superyacht in Monaco harbour.",
    images: ["https://vxmrvnmtauqqqjikhjbh.supabase.co/storage/v1/object/public/project-documents/pavilion-terrace/yachts-circuit.jpg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
