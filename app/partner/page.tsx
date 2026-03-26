"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PartnerNav from "@/components/partner/PartnerNav";

interface PartnerInfo {
  id: string;
  org_name: string | null;
  org_ids: string[];
  status: string;
}

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  role: string;
  hasPassword: boolean;
}

interface DashboardData {
  ficheCount: number;
  referralStats: {
    total: number;
    visited: number;
    contacted: number;
    converted: number;
    totalRevenue: number;
  };
  activeOffers: number;
  upcomingEvents: number;
}

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/partner/session");
      if (!sessionRes.ok) {
        router.push("/partner/login");
        return;
      }
      const data = await sessionRes.json();
      setPartner(data.partner);
      setUser(data.user);

      const dashRes = await fetch("/api/partner/dashboard");
      if (dashRes.ok) {
        setDashboard(await dashRes.json());
      }

      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <p className="text-gray-400 font-body">Loading...</p>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || user?.email || "";
  const orgName = partner?.org_name;
  const stats = dashboard?.referralStats;
  const commissionRate = 0.1;
  const commissionEarned = (stats?.totalRevenue || 0) * commissionRate;

  const funnelMax = Math.max(stats?.visited || 0, 1);

  return (
    <div className="min-h-screen bg-pearl">
      <PartnerNav active="dashboard" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Welcome */}
        <div className="mb-10">
          <p className="text-sm text-gray-400 font-body mb-1">Welcome back,</p>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-green">
            {firstName}
          </h1>
          {orgName && (
            <p className="text-sm text-gray-500 font-body mt-1">{orgName}</p>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border border-green/10 rounded-lg p-5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-body mb-1">
              Fiche Views (30d)
            </p>
            <p className="font-heading text-2xl font-semibold text-green">
              {stats?.visited || 0}
            </p>
          </div>
          <div className="bg-white border border-green/10 rounded-lg p-5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-body mb-1">
              Enquiries
            </p>
            <p className="font-heading text-2xl font-semibold text-green">
              {stats?.contacted || 0}
            </p>
          </div>
          <div className="bg-white border border-green/10 rounded-lg p-5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-body mb-1">
              Referrals Converted
            </p>
            <p className="font-heading text-2xl font-semibold text-green">
              {stats?.converted || 0}
            </p>
          </div>
          <div className="bg-white border border-green/10 rounded-lg p-5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-body mb-1">
              Active Offers
            </p>
            <p className="font-heading text-2xl font-semibold text-green">
              {dashboard?.activeOffers || 0}
            </p>
          </div>
        </div>

        {/* Referral Funnel + Commission */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
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
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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

          {/* Commission Summary */}
          <div className="bg-white border border-green/10 rounded-lg p-5">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">
              Commission Summary
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
                  {commissionEarned.toLocaleString("en-GB", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/partner/fiche"
              className="bg-white border border-green/10 rounded-lg p-4 hover:border-green/30 transition-colors text-center"
            >
              <h3 className="font-heading text-sm font-semibold text-green mb-0.5">
                Edit Fiche
              </h3>
              <p className="text-[11px] text-gray-400 font-body">
                Update your presentation
              </p>
            </Link>
            <Link
              href="/partner/offers"
              className="bg-white border border-green/10 rounded-lg p-4 hover:border-green/30 transition-colors text-center"
            >
              <h3 className="font-heading text-sm font-semibold text-green mb-0.5">
                Create Offer
              </h3>
              <p className="text-[11px] text-gray-400 font-body">
                Propose a new offer
              </p>
            </Link>
            <Link
              href="/partner/events"
              className="bg-white border border-green/10 rounded-lg p-4 hover:border-green/30 transition-colors text-center"
            >
              <h3 className="font-heading text-sm font-semibold text-green mb-0.5">
                Add Event
              </h3>
              <p className="text-[11px] text-gray-400 font-body">
                List an upcoming event
              </p>
            </Link>
            <Link
              href="/partner/content"
              className="bg-white border border-green/10 rounded-lg p-4 hover:border-green/30 transition-colors text-center"
            >
              <h3 className="font-heading text-sm font-semibold text-green mb-0.5">
                Submit Content
              </h3>
              <p className="text-[11px] text-gray-400 font-body">
                Share a story or update
              </p>
            </Link>
          </div>
        </div>

        {/* Upcoming Partner Events */}
        {(dashboard?.upcomingEvents || 0) > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
                Your Upcoming Events
              </h2>
              <Link
                href="/partner/events"
                className="text-xs text-green hover:underline font-body"
              >
                View all
              </Link>
            </div>
            <div className="bg-white border border-green/10 rounded-lg p-5">
              <p className="text-sm text-gray-500 font-body">
                You have {dashboard?.upcomingEvents} upcoming{" "}
                {dashboard?.upcomingEvents === 1 ? "event" : "events"}.
              </p>
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-green/10 py-8 text-center">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          THE GATEKEEPERS CLUB
        </span>
        <p className="text-sm text-gray-400 font-body mt-2">
          hello@thegatekeepers.club
        </p>
      </footer>
    </div>
  );
}
