"use client";

import PortalHelpButton from "@/components/shared/PortalHelpButton";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-pearl">
      {children}
      <PortalHelpButton userType="partner" />
    </div>
  );
}
