"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PartnerNav from "@/components/partner/PartnerNav";

interface ProjectMilestones {
  total: number;
  completed: number;
}

interface PartnerProject {
  id: string;
  title: string;
  type: string;
  property_address: string | null;
  property_city: string | null;
  property_country: string | null;
  status: string;
  start_date: string | null;
  target_date: string | null;
  client_first_name: string | null;
  partner_role: string;
  partner_status: string;
  milestones: ProjectMilestones;
  last_update: string;
}

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  renovation: { bg: "bg-amber-50", text: "text-amber-700" },
  purchase: { bg: "bg-blue-50", text: "text-blue-700" },
  sale: { bg: "bg-emerald-50", text: "text-emerald-700" },
  maintenance: { bg: "bg-purple-50", text: "text-purple-700" },
  relocation: { bg: "bg-rose-50", text: "text-rose-700" },
  construction: { bg: "bg-orange-50", text: "text-orange-700" },
  legal: { bg: "bg-slate-100", text: "text-slate-700" },
  interior_design: { bg: "bg-pink-50", text: "text-pink-700" },
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green/10 text-green",
  on_hold: "bg-gold/15 text-gold",
  completed: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-50 text-red-500",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export default function PartnerProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<PartnerProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/partner/session");
      if (!sessionRes.ok) {
        router.push("/partner/login");
        return;
      }
      const res = await fetch("/api/partner/projects");
      if (res.ok) {
        setProjects(await res.json());
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const filtered = projects.filter((p) => {
    if (filter === "active") return p.status === "active";
    if (filter === "completed") return p.status === "completed";
    return true;
  });

  const activeCount = projects.filter((p) => p.status === "active").length;
  const completedCount = projects.filter(
    (p) => p.status === "completed"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <p className="text-gray-400 font-body">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl">
      <PartnerNav active="projects" />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-xl font-semibold text-green">
            Projects
          </h1>
          {projects.length > 0 && (
            <div className="flex items-center gap-1 bg-white border border-green/10 rounded-md p-0.5">
              {(
                [
                  { key: "all", label: `All (${projects.length})` },
                  { key: "active", label: `Active (${activeCount})` },
                  { key: "completed", label: `Done (${completedCount})` },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`text-[11px] px-3 py-1.5 rounded font-body transition-colors ${
                    filter === f.key
                      ? "bg-green/5 text-green font-medium"
                      : "text-gray-400 hover:text-green"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
            <div className="w-12 h-12 bg-green/5 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-green/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-400 font-body mb-1">
              {filter === "all"
                ? "No projects yet."
                : `No ${filter} projects.`}
            </p>
            <p className="text-xs text-gray-400 font-body">
              When you are assigned to a client project, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((project) => {
              const typeStyle = TYPE_STYLES[project.type] || {
                bg: "bg-gray-50",
                text: "text-gray-600",
              };
              const milestonePercent =
                project.milestones.total > 0
                  ? Math.round(
                      (project.milestones.completed /
                        project.milestones.total) *
                        100
                    )
                  : 0;

              return (
                <Link
                  key={project.id}
                  href={`/partner/projects/${project.id}`}
                  className="block bg-white border border-green/10 rounded-lg hover:border-green/20 transition-colors"
                >
                  <div className="p-5">
                    {/* Top row: title + badges */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-heading text-sm font-semibold text-gray-800 truncate">
                            {project.title}
                          </h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-body flex-none capitalize ${typeStyle.bg} ${typeStyle.text}`}
                          >
                            {project.type.replace(/_/g, " ")}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-body flex-none capitalize ${
                              STATUS_STYLES[project.status] ||
                              "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {project.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-body flex-none whitespace-nowrap">
                        {timeAgo(project.last_update)}
                      </span>
                    </div>

                    {/* Address */}
                    {(project.property_address || project.property_city) && (
                      <p className="text-xs text-gray-500 font-body mb-2">
                        {[project.property_address, project.property_city, project.property_country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}

                    {/* Role + client */}
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-[11px] font-body text-green/70">
                        Your role:{" "}
                        <span className="font-medium text-green">
                          {project.partner_role}
                        </span>
                      </span>
                      {project.client_first_name && (
                        <span className="text-[11px] text-gray-400 font-body">
                          Client: {project.client_first_name}
                        </span>
                      )}
                    </div>

                    {/* Milestone progress */}
                    {project.milestones.total > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green rounded-full transition-all duration-500"
                            style={{ width: `${milestonePercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 font-body flex-none">
                          {project.milestones.completed}/
                          {project.milestones.total} milestones
                        </span>
                      </div>
                    )}

                    {/* Date range */}
                    {(project.start_date || project.target_date) && (
                      <div className="flex items-center gap-2 mt-2">
                        <svg
                          className="w-3 h-3 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-[10px] text-gray-400 font-body">
                          {project.start_date
                            ? formatDate(project.start_date)
                            : "TBD"}
                          {" "}
                          &rarr;{" "}
                          {project.target_date
                            ? formatDate(project.target_date)
                            : "TBD"}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
