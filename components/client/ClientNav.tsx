"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationBell from "@/components/shared/NotificationBell";

interface ClientNavProps {
  active?: string;
}

const NAV_ITEMS = [
  { label: "Home", href: "/client", key: "home", tourId: "tour-nav-home" },
  { label: "Our Collection", href: "/client/collection", key: "collection", tourId: "tour-nav-collection" },
  { label: "Marketplace", href: "/client/marketplace", key: "marketplace", tourId: "tour-nav-marketplace" },
  { label: "My Journeys", href: "/client/journeys", key: "journeys", tourId: "tour-nav-journeys" },
  { label: "My Projects", href: "/client/projects", key: "projects", tourId: "tour-nav-projects" },
  { label: "Events", href: "/client/events", key: "events", tourId: "tour-nav-events" },
  { label: "Payments", href: "/client/payments", key: "payments", tourId: "tour-nav-payments" },
  { label: "Points", href: "/client/points", key: "points", tourId: "tour-nav-points" },
];

export default function ClientNav({ active }: ClientNavProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  async function handleLogout() {
    await fetch("/api/client/session", { method: "DELETE" });
    router.push("/client/login");
  }

  return (
    <>
      <header className={`nav-portal sticky top-0 z-40${scrolled ? " scrolled" : ""}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Top bar */}
          <div className="flex items-center justify-between h-14">
            <Link
              href="/client"
              className="font-heading text-xs font-semibold tracking-[0.18em] text-gold uppercase"
            >
              The Gatekeepers Club
            </Link>

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
          <nav id="tour-nav" className="hidden sm:flex gap-0.5 overflow-x-auto scrollbar-hide -mb-px">
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
          <span className="font-heading text-xs font-semibold tracking-[0.18em] text-gold uppercase">
            The Gatekeepers Club
          </span>
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
