"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PartnerNav from "@/components/partner/PartnerNav";

interface Referral {
  id: string;
  referral_code: string;
  visitor_name: string | null;
  visitor_email: string | null;
  status: string;
  revenue_attributed: number;
  created_at: string;
}

interface ReferralData {
  referralCode: string;
  referrals: Referral[];
  stats: {
    visited: number;
    contacted: number;
    converted: number;
    totalRevenue: number;
    commissionEarned: number;
  };
}

const STATUS_STYLES: Record<string, string> = {
  visited: "bg-gray-200 text-gray-600",
  contacted: "bg-gold/15 text-gold",
  converted: "bg-green/10 text-green",
};

export default function PartnerReferralsPage() {
  const router = useRouter();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedSocial, setCopiedSocial] = useState(false);

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/partner/session");
      if (!sessionRes.ok) {
        router.push("/partner/login");
        return;
      }

      const res = await fetch("/api/partner/referrals");
      if (res.ok) {
        setData(await res.json());
      }

      setLoading(false);
    }
    load();
  }, [router]);

  function copyReferralLink() {
    if (!data?.referralCode) return;
    const link = `https://portal.thegatekeepers.club/ref/${data.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copySocialText() {
    if (!data?.referralCode) return;
    const text = `Discover The Gatekeepers Club, a curated concierge service for discerning travellers.\n\nhttps://portal.thegatekeepers.club/ref/${data.referralCode}`;
    navigator.clipboard.writeText(text);
    setCopiedSocial(true);
    setTimeout(() => setCopiedSocial(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <p className="text-gray-400 font-body">Loading...</p>
      </div>
    );
  }

  const stats = data?.stats;
  const funnelMax = Math.max(stats?.visited || 0, 1);

  return (
    <div className="min-h-screen bg-pearl">
      <PartnerNav active="referrals" />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <h1 className="font-heading text-xl font-semibold text-green mb-6">
          Referrals
        </h1>

        {/* Referral Link */}
        <div className="bg-white border border-green/10 rounded-lg p-5 mb-6">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
            Your Referral Link
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-green/5 rounded-md px-4 py-2.5 font-mono text-sm text-green truncate">
              portal.thegatekeepers.club/ref/{data?.referralCode || "..."}
            </div>
            <button
              onClick={copyReferralLink}
              className="flex-none px-4 py-2.5 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 font-body mt-2">
            Share this link to track referrals. Visits and conversions will
            appear below.
          </p>
        </div>

        {/* Funnel + Commission */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Funnel */}
          <div className="bg-white border border-green/10 rounded-lg p-5">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">
              Referral Funnel
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: "Visited",
                  count: stats?.visited || 0,
                  color: "bg-green/20",
                },
                {
                  label: "Enquired",
                  count: stats?.contacted || 0,
                  color: "bg-green/50",
                },
                {
                  label: "Converted",
                  count: stats?.converted || 0,
                  color: "bg-green",
                },
              ].map((step) => (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 font-body">
                      {step.label}
                    </span>
                    <span className="text-xs font-medium text-green font-body">
                      {step.count}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${step.color} rounded-full transition-all duration-500`}
                      style={{
                        width: `${Math.max(
                          (step.count / funnelMax) * 100,
                          step.count > 0 ? 5 : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white border border-green/10 rounded-lg p-5">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">
              Revenue
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-body mb-1">
                  Total Revenue Attributed
                </p>
                <p className="font-heading text-xl font-semibold text-green">
                  EUR{" "}
                  {(stats?.totalRevenue || 0).toLocaleString("en-GB", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-body mb-1">
                  Commission Earned
                </p>
                <p className="font-heading text-xl font-semibold text-gold">
                  EUR{" "}
                  {(stats?.commissionEarned || 0).toLocaleString("en-GB", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Share */}
        <div className="bg-white border border-green/10 rounded-lg p-5 mb-6">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
            Share
          </h2>
          <button
            onClick={copySocialText}
            className="text-xs px-4 py-2 border border-green/20 text-green rounded-md hover:bg-green/5 transition-colors font-body"
          >
            {copiedSocial ? "Copied to clipboard" : "Copy formatted referral text"}
          </button>
        </div>

        {/* Referrals Table */}
        <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
          <div className="p-5 border-b border-green/5">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
              Referral Activity
            </h2>
          </div>
          {!data?.referrals || data.referrals.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400 font-body">
                No referral activity yet. Share your link to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-green/5">
                    <th className="px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-body font-medium">
                      Date
                    </th>
                    <th className="px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-body font-medium">
                      Name / Email
                    </th>
                    <th className="px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-body font-medium">
                      Status
                    </th>
                    <th className="px-5 py-3 text-[10px] text-gray-400 uppercase tracking-wider font-body font-medium text-right">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.referrals.map((ref) => (
                    <tr
                      key={ref.id}
                      className="border-b border-green/5 last:border-0"
                    >
                      <td className="px-5 py-3 text-xs text-gray-500 font-body whitespace-nowrap">
                        {new Date(ref.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-700 font-body">
                        {ref.visitor_name || ref.visitor_email || "Anonymous"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-body ${
                            STATUS_STYLES[ref.status] || STATUS_STYLES.visited
                          }`}
                        >
                          {ref.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-700 font-body text-right whitespace-nowrap">
                        {ref.revenue_attributed
                          ? `EUR ${ref.revenue_attributed.toLocaleString(
                              "en-GB",
                              { minimumFractionDigits: 2 }
                            )}`
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
