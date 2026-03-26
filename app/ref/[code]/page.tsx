"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ReferralPartner {
  name: string;
  ficheSlug: string | null;
  ficheHeadline: string | null;
  ficheHeroUrl: string | null;
  templateType: string | null;
}

export default function ReferralLandingPage() {
  const params = useParams();
  const code = params.code as string;
  const [partner, setPartner] = useState<ReferralPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!code) {
      setError(true);
      setLoading(false);
      return;
    }

    async function load() {
      try {
        // Fetch partner info (public API)
        const res = await fetch(`/api/ref/${code}`);
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setPartner(data);

        // Record the visit
        await fetch(`/api/ref/${code}`, {
          method: "POST",
        });

        // Set referral cookie (30 day expiry)
        document.cookie = `tgc_ref=${code}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      } catch {
        setError(true);
      }

      setLoading(false);
    }

    load();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <div className="w-8 h-8 border-2 border-green/20 border-t-green rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-pearl">
        <div className="text-center max-w-sm">
          <p className="font-heading text-sm font-semibold tracking-wider text-gold mb-6">
            THE GATEKEEPERS CLUB
          </p>
          <h1 className="font-heading text-xl font-semibold text-green mb-3">
            Link not found
          </h1>
          <p className="text-sm text-gray-500 font-body mb-6">
            This referral link may have expired or is no longer valid.
          </p>
          <Link
            href="https://thegatekeepers.club"
            className="inline-block px-6 py-3 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body"
          >
            Visit The Gatekeepers Club
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl">
      {/* Hero */}
      <div className="relative">
        {partner.ficheHeroUrl ? (
          <div className="h-64 sm:h-80 overflow-hidden">
            <img
              src={partner.ficheHeroUrl}
              alt={partner.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="h-48 sm:h-64 bg-green" />
        )}

        {/* Overlay branding */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <p className="font-heading text-xs sm:text-sm font-semibold tracking-widest text-gold mb-3">
              THE GATEKEEPERS CLUB
            </p>
            <h1 className="font-heading text-2xl sm:text-4xl font-semibold text-white mb-2 drop-shadow-lg">
              {partner.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="bg-white border border-green/10 rounded-lg p-8 shadow-sm">
          <p className="text-xs text-gold uppercase tracking-widest font-body mb-3">
            Recommended by our partner
          </p>
          <h2 className="font-heading text-lg font-semibold text-green mb-3">
            {partner.name}
          </h2>
          {partner.ficheHeadline && (
            <p className="text-sm text-gray-500 font-body mb-6">
              {partner.ficheHeadline}
            </p>
          )}

          <p className="text-sm text-gray-500 font-body mb-8">
            The Gatekeepers Club is a curated concierge service for discerning
            travellers. Explore our collection of handpicked hotels, dining,
            artisans, and experiences.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/client/login"
              className="px-6 py-3 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body"
            >
              Explore Our Collection
            </Link>
            {partner.ficheSlug && (
              <Link
                href={`/fiche/${partner.ficheSlug}`}
                className="px-6 py-3 border border-green/20 text-green text-sm font-medium rounded-md hover:bg-green/5 transition-colors font-body"
              >
                View {partner.name}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-green/10 py-8 text-center">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          THE GATEKEEPERS CLUB
        </span>
        <p className="text-sm text-gray-400 font-body mt-2">
          hello@thegatekeepers.club
        </p>
        <p className="text-xs text-gray-300 font-body mt-1">
          thegatekeepers.club
        </p>
      </footer>
    </div>
  );
}
