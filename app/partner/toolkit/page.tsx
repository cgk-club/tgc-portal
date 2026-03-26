"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PartnerNav from "@/components/partner/PartnerNav";

interface PartnerInfo {
  id: string;
  name: string;
  email: string;
  org_ids: string[];
}

interface FicheInfo {
  slug: string;
}

export default function PartnerToolkitPage() {
  const router = useRouter();
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [ficheSlug, setFicheSlug] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFiche, setCopiedFiche] = useState(false);

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/partner/session");
      if (!sessionRes.ok) {
        router.push("/partner/login");
        return;
      }
      const { partner: p } = await sessionRes.json();
      setPartner(p);

      const [fichesRes, referralsRes] = await Promise.all([
        fetch("/api/partner/fiches"),
        fetch("/api/partner/referrals"),
      ]);

      if (fichesRes.ok) {
        const fiches: FicheInfo[] = await fichesRes.json();
        if (fiches.length > 0) setFicheSlug(fiches[0].slug);
      }

      if (referralsRes.ok) {
        const data = await referralsRes.json();
        setReferralCode(data.referralCode || null);
      }

      setLoading(false);
    }
    load();
  }, [router]);

  function copyReferralLink() {
    if (!referralCode) return;
    navigator.clipboard.writeText(
      `https://portal.thegatekeepers.club/ref/${referralCode}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function copyFicheUrl() {
    if (!ficheSlug) return;
    navigator.clipboard.writeText(
      `https://portal.thegatekeepers.club/fiche/${ficheSlug}`
    );
    setCopiedFiche(true);
    setTimeout(() => setCopiedFiche(false), 2000);
  }

  function downloadBadgeSVG() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="60" viewBox="0 0 240 60">
  <rect width="240" height="60" rx="6" fill="#0e4f51"/>
  <text x="120" y="24" text-anchor="middle" font-family="Poppins, sans-serif" font-size="8" font-weight="600" letter-spacing="1.5" fill="#c8aa4a">RECOMMENDED BY</text>
  <text x="120" y="42" text-anchor="middle" font-family="Poppins, sans-serif" font-size="11" font-weight="600" letter-spacing="2" fill="#ffffff">THE GATEKEEPERS CLUB</text>
</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tgc-partner-badge.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <p className="text-gray-400 font-body">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl">
      <PartnerNav active="toolkit" />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <h1 className="font-heading text-xl font-semibold text-green mb-2">
          Co-Marketing Toolkit
        </h1>
        <p className="text-sm text-gray-500 font-body mb-8">
          Tools and assets to promote your partnership with The Gatekeepers Club.
        </p>

        {/* Partner Badge */}
        <div className="bg-white border border-green/10 rounded-lg p-6 mb-6">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">
            Partner Badge
          </h2>
          <p className="text-xs text-gray-500 font-body mb-4">
            Use this badge on your website, email signatures, or printed
            materials to show your partnership with TGC.
          </p>

          {/* Inline SVG Preview */}
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="240"
              height="60"
              viewBox="0 0 240 60"
            >
              <rect width="240" height="60" rx="6" fill="#0e4f51" />
              <text
                x="120"
                y="24"
                textAnchor="middle"
                fontFamily="Poppins, sans-serif"
                fontSize="8"
                fontWeight="600"
                letterSpacing="1.5"
                fill="#c8aa4a"
              >
                RECOMMENDED BY
              </text>
              <text
                x="120"
                y="42"
                textAnchor="middle"
                fontFamily="Poppins, sans-serif"
                fontSize="11"
                fontWeight="600"
                letterSpacing="2"
                fill="#ffffff"
              >
                THE GATEKEEPERS CLUB
              </text>
            </svg>
          </div>

          <div className="text-center">
            <button
              onClick={downloadBadgeSVG}
              className="text-xs px-4 py-2 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body"
            >
              Download Badge (SVG)
            </button>
          </div>
        </div>

        {/* Referral Link */}
        {referralCode && (
          <div className="bg-white border border-green/10 rounded-lg p-6 mb-6">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
              Referral Link for Social Media
            </h2>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 bg-green/5 rounded-md px-4 py-2.5 font-mono text-sm text-green truncate">
                portal.thegatekeepers.club/ref/{referralCode}
              </div>
              <button
                onClick={copyReferralLink}
                className="flex-none px-4 py-2.5 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body"
              >
                {copiedLink ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 font-body">
              Share this link on Instagram, LinkedIn, or your website. All visits
              and conversions are tracked in your Referrals dashboard.
            </p>
          </div>
        )}

        {/* Fiche URL */}
        {ficheSlug && (
          <div className="bg-white border border-green/10 rounded-lg p-6 mb-6">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
              Your Fiche URL
            </h2>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 bg-green/5 rounded-md px-4 py-2.5 font-mono text-sm text-green truncate">
                portal.thegatekeepers.club/fiche/{ficheSlug}
              </div>
              <button
                onClick={copyFicheUrl}
                className="flex-none px-4 py-2.5 border border-green/20 text-green text-sm font-medium rounded-md hover:bg-green/5 transition-colors font-body"
              >
                {copiedFiche ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 font-body">
              Direct link to your fiche on the TGC portal.
            </p>
          </div>
        )}

        {/* Usage Guidelines */}
        <div className="bg-white border border-green/10 rounded-lg p-6">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
            Guidelines
          </h2>
          <ul className="space-y-2">
            {[
              'Use "Recommended by The Gatekeepers Club" as the preferred phrasing.',
              "The badge should appear on a light or neutral background.",
              "Do not alter the badge colours or proportions.",
              "For questions about co-marketing, contact hello@thegatekeepers.club.",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-gray-600 font-body"
              >
                <span className="text-gold mt-0.5">&#8226;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
