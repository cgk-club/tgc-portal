"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface ClientNavProps {
  active?: string;
}

const NAV_ITEMS = [
  { label: "Home", href: "/client", key: "home" },
  { label: "Our Collection", href: "/client/collection", key: "collection" },
  { label: "Marketplace", href: "/client/marketplace", key: "marketplace" },
  { label: "My Journeys", href: "/client/journeys", key: "journeys" },
  { label: "Events", href: "/client/events", key: "events" },
  { label: "Payments", href: "/client/payments", key: "payments" },
  { label: "Points", href: "/client/points", key: "points" },
];

export default function ClientNav({ active }: ClientNavProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/client/session", { method: "DELETE" });
    router.push("/client/login");
  }

  return (
    <header className="border-b border-green/10 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          <Link href="/client" className="font-heading text-sm font-semibold tracking-wider text-gold">
            THE GATEKEEPERS CLUB
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-600 font-body sm:block hidden"
          >
            Sign out
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-2 -mb-px scrollbar-hide">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
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
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-600 font-body whitespace-nowrap px-3 py-2 sm:hidden"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
