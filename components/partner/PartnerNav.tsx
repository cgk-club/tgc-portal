"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationBell from "@/components/shared/NotificationBell";

interface PartnerNavProps {
  active?: string;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/partner", key: "dashboard", tourId: "tour-partner-dashboard" },
  { label: "My Fiche", href: "/partner/fiche", key: "fiche", tourId: "tour-partner-fiche" },
  { label: "Offers", href: "/partner/offers", key: "offers", tourId: "tour-partner-offers" },
  { label: "Events", href: "/partner/events", key: "events", tourId: "tour-partner-events" },
  { label: "Listings", href: "/partner/listings", key: "listings", tourId: "tour-partner-listings" },
  { label: "Projects", href: "/partner/projects", key: "projects", tourId: "tour-partner-projects" },
  { label: "Referrals", href: "/partner/referrals", key: "referrals", tourId: "tour-partner-referrals" },
  { label: "Content", href: "/partner/content", key: "content", tourId: "tour-partner-content" },
  { label: "Availability", href: "/partner/availability", key: "availability", tourId: "tour-partner-availability" },
  { label: "Toolkit", href: "/partner/toolkit", key: "toolkit", tourId: "tour-partner-toolkit" },
  { label: "Network", href: "/partner/network", key: "network", tourId: "tour-partner-network" },
  { label: "Settings", href: "/partner/settings", key: "settings", tourId: "tour-partner-settings" },
];

export default function PartnerNav({ active }: PartnerNavProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  async function handleLogout() {
    await fetch("/api/partner/session", { method: "DELETE" });
    router.push("/partner/login");
  }

  return (
    <>
      <header className={`nav-portal sticky top-0 z-40${scrolled ? " scrolled" : ""}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Top bar */}
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link
                href="/partner"
                className="font-heading text-xs font-semibold tracking-[0.18em] text-gold uppercase"
              >
                The Gatekeepers Club
              </Link>
              <span className="hidden sm:block text-[10px] font-body text-mist tracking-widest uppercase border border-rule px-1.5 py-0.5 rounded">
                Partner
              </span>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />

              {/* Desktop sign out */}
              <button
                onClick={handleLogout}
                className="hidden sm:block text-xs text-mist hover:text-ink font-body transition-colors"
              >
                Sign out
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="sm:hidden w-8 h-8 flex flex-col justify-center items-center gap-1.5"
                aria-label="Open menu"
              >
                <span className="w-5 h-px bg-ink block" />
                <span className="w-5 h-px bg-ink block" />
              </button>
            </div>
          </div>

          {/* Desktop tab row */}
          <nav id="tour-partner-nav" className="hidden sm:flex gap-0.5 overflow-x-auto scrollbar-hide -mb-px">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                id={item.tourId}
                href={item.href}
                className={`
                  relative text-xs font-body whitespace-nowrap px-3 py-2.5 transition-colors
                  ${active === item.key
                    ? "text-green font-medium"
                    : "text-mist hover:text-ink"
                  }
                `}
              >
                {item.label}
                {active === item.key && (
                  <span className="absolute bottom-0 left-3 right-3 h-px bg-green" />
                )}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile slide-out menu */}
      <div className={`mobile-nav${mobileOpen ? " open" : ""}`}>
        <div className="flex items-center justify-between px-6 h-14 border-b border-rule">
          <div className="flex items-center gap-2">
            <span className="font-heading text-xs font-semibold tracking-[0.18em] text-gold uppercase">
              The Gatekeepers Club
            </span>
            <span className="text-[9px] font-body text-mist tracking-widest uppercase border border-rule px-1.5 py-0.5 rounded">
              Partner
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-mist hover:text-ink"
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center justify-between px-3 py-3.5 rounded-md mb-1 text-sm font-body transition-colors
                ${active === item.key
                  ? "bg-green/5 text-green font-medium"
                  : "text-ink hover:bg-pearl-dark"
                }
              `}
            >
              {item.label}
              {active === item.key && (
                <span className="w-1.5 h-1.5 rounded-full bg-green" />
              )}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-rule">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-3 text-sm text-mist hover:text-ink font-body transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
