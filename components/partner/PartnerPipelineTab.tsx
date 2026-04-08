"use client";

import { useState, useEffect } from "react";

interface Referral {
  id: string;
  prospect_name: string;
  package_interest: string | null;
  attending_as: string | null;
  stage: string;
  created_at: string;
  enquired_at: string | null;
  converted_at: string | null;
}

interface Stats {
  sent: number;
  lead: number;
  client: number;
  total: number;
}

const STAGE_LABELS: Record<string, string> = {
  sent: "Viewed",
  prospect: "Prospect",
  lead: "Lead",
  client: "Client",
};

const STAGE_COLORS: Record<string, string> = {
  sent: "bg-gray-100 text-gray-600",
  prospect: "bg-blue-50 text-blue-600",
  lead: "bg-amber-50 text-amber-700",
  client: "bg-emerald-50 text-emerald-700",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default function PartnerPipelineTab({
  projectId,
}: {
  projectId: string;
}) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<Stats>({
    sent: 0,
    lead: 0,
    client: 0,
    total: 0,
  });
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/partner/projects/${projectId}/referrals`);
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.referrals || []);
        setStats(data.stats || { sent: 0, lead: 0, client: 0, total: 0 });
        setShareableLink(data.shareable_link);
        setReferralCode(data.referral_code);
      }
      setLoading(false);
    }
    load();
  }, [projectId]);

  function handleCopy() {
    if (!shareableLink) return;
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <p className="text-sm text-gray-400 font-body py-8 text-center">
        Loading pipeline...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shareable Link */}
      {shareableLink ? (
        <div className="bg-white border border-green/10 rounded-lg p-5">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
            Your Shareable Link
          </h3>
          <p className="text-xs text-gray-500 font-body mb-3">
            Share this link with your contacts. When they register interest, it
            will be attributed to you.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareableLink}
              className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-xs font-body text-gray-600 bg-gray-50"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-green text-white rounded-md text-xs font-body hover:bg-green-light transition-colors whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-green/10 rounded-lg p-5">
          <p className="text-sm text-gray-500 font-body">
            No referral code assigned yet. Contact the organisers to get your
            shareable link.
          </p>
        </div>
      )}

      {/* Funnel */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Views", count: stats.sent, color: "text-gray-600" },
          { label: "Leads", count: stats.lead, color: "text-amber-700" },
          { label: "Clients", count: stats.client, color: "text-emerald-700" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-green/10 rounded-lg p-4 text-center"
          >
            <p className={`text-2xl font-heading font-semibold ${s.color}`}>
              {s.count}
            </p>
            <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Referrals List */}
      <div className="bg-white border border-green/10 rounded-lg p-5">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">
          Your Referrals ({stats.total})
        </h3>
        {referrals.length === 0 ? (
          <p className="text-sm text-gray-400 font-body text-center py-4">
            No referrals yet. Share your link to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {referrals.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-green/[0.02] transition-colors"
              >
                <div>
                  <p className="text-sm font-body text-gray-800">
                    {r.prospect_name || "Anonymous visitor"}
                  </p>
                  {r.package_interest && (
                    <p className="text-[11px] text-gray-400 font-body">
                      {r.package_interest}
                      {r.attending_as === "couple" ? " (couple)" : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-400 font-body">
                    {formatDate(r.enquired_at || r.created_at)}
                  </span>
                  <span
                    className={`text-[10px] font-body px-2 py-0.5 rounded-full ${
                      STAGE_COLORS[r.stage] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {STAGE_LABELS[r.stage] || r.stage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
