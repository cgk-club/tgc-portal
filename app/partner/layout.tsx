"use client";

import { usePathname } from "next/navigation";
import PortalHelpButton from "@/components/shared/PortalHelpButton";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The on-location phone view has its own bottom tab bar; the floating help
  // button sat on top of "Movements", so it is left off that screen.
  const pathname = usePathname();
  const onLocationEvent = /^\/partner\/on-location\/[^/]+/.test(pathname || "");
  return (
    <div className="min-h-screen bg-pearl">
      {children}
      {!onLocationEvent && <PortalHelpButton userType="partner" />}
    </div>
  );
}
