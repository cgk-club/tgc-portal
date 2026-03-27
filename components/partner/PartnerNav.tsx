"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PartnerNavProps {
  active?: string;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/partner", key: "dashboard", tourId: "tour-partner-dashboard" },
  { label: "My Fiche", href: "/partner/fiche", key: "fiche", tourId: "tour-partner-fiche" },
  { label: "Offers", href: "/partner/offers", key: "offers", tourId: "tour-partner-offers" },
  { label: "Events", href: "/partner/events", key: "events", tourId: "tour-partner-events" },
  { label: "Listings", href: "/partner/listings", key: "listings", tourId: "tour-partner-listings" },
  { label: "Referrals", href: "/partner/referrals", key: "referrals", tourId: "tour-partner-referrals" },
  { label: "Content", href: "/partner/content", key: "content", tourId: "tour-partner-content" },
  { label: "Availability", href: "/partner/availability", key: "availability", tourId: "tour-partner-availability" },
  { label: "Toolkit", href: "/partner/toolkit", key: "toolkit", tourId: "tour-partner-toolkit" },
  { label: "Network", href: "/partner/network", key: "network", tourId: "tour-partner-network" },
];

export default function PartnerNav({ active }: PartnerNavProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/partner/session", { method: "DELETE" });
    router.push("/partner/login");
  }

  return (
    <header className="border-b border-green/10 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          <Link
            href="/partner"
            className="font-heading text-sm font-semibold tracking-wider text-gold"
          >
            TGC PARTNER
          </Link>

          {/* Desktop sign out */}
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-600 font-body hidden sm:block"
          >
            Sign out
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden text-gray-500 hover:text-green p-1"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Desktop nav */}
        <nav id="tour-partner-nav" className="hidden sm:flex gap-1 overflow-x-auto pb-2 -mb-px scrollbar-hide">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              id={item.tourId}
              href={item.href}
              className={`text-xs font-body whitespace-nowrap px-3 py-2 rounded-sm transition-colors ${
                active === item.key
                  ? "bg-green/5 text-green font-medium"
                  : "text-gray-500 hover:text-green hover:bg-green/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <nav className="sm:hidden pb-4 border-t border-green/5 mt-2 pt-3">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-body px-3 py-2.5 rounded-md transition-colors ${
                    active === item.key
                      ? "bg-green/5 text-green font-medium"
                      : "text-gray-500 hover:text-green hover:bg-green/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-gray-600 font-body px-3 py-2.5 text-left mt-2 border-t border-green/5 pt-3"
              >
                Sign out
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
