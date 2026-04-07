"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ClientNav from "@/components/client/ClientNav";

interface ProjectListItem {
  id: string;
  type: string;
  title: string;
  property_address: string | null;
  property_city: string | null;
  property_country: string | null;
  status: string;
  budget: number | null;
  actual_spend: number | null;
  currency: string | null;
  start_date: string | null;
  target_date: string | null;
  milestones_total: number;
  milestones_completed: number;
  last_update_at: string | null;
  updated_at: string;
  property_images: string[] | null;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  renovation: { label: "Renovation", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  rental_management: { label: "Rental Management", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  property_search: { label: "Property Search", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  acquisition: { label: "Acquisition", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  appraisal: { label: "Appraisal", color: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
  tenant_management: { label: "Tenant Management", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
  upgrade: { label: "Upgrade", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
  other: { label: "Other", color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
};

const STATUS_STYLES: Record<string, { label: string; style: string }> = {
  planning: { label: "Planning", style: "bg-amber-100 text-amber-800" },
  active: { label: "Active", style: "bg-green-100 text-green-800" },
  on_hold: { label: "On Hold", style: "bg-gray-200 text-gray-600" },
  completed: { label: "Completed", style: "bg-blue-100 text-blue-700" },
  cancelled: { label: "Cancelled", style: "bg-red-100 text-red-600" },
};

function formatCurrency(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = now.getTime() - then.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(dateStr);
}

type FilterStatus = "all" | "active" | "completed";

export default function ClientProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/client/session");
      if (!sessionRes.ok) {
        router.push("/client/login");
        return;
      }

      const res = await fetch("/api/client/projects");
      if (res.ok) {
        setProjects(await res.json());
      }
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-pearl">
        <ClientNav active="projects" />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-green/20 border-t-green rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 font-body text-sm">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  const filtered = projects.filter((p) => {
    if (filter === "all") return true;
    if (filter === "active") return ["planning", "active", "on_hold"].includes(p.status);
    if (filter === "completed") return ["completed", "cancelled"].includes(p.status);
    return true;
  });

  const activeCount = projects.filter((p) => ["planning", "active", "on_hold"].includes(p.status)).length;
  const completedCount = projects.filter((p) => ["completed", "cancelled"].includes(p.status)).length;

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="projects" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[2px] text-gold uppercase mb-2 font-body">
            My Projects
          </p>
          <h1 className="font-heading text-xl sm:text-2xl font-semibold text-green mb-2">
            My Projects
          </h1>
          <p className="text-sm text-gray-500 font-body">
            Track your projects, events, and experiences.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6">
          {[
            { key: "all" as FilterStatus, label: "All", count: projects.length },
            { key: "active" as FilterStatus, label: "Active", count: activeCount },
            { key: "completed" as FilterStatus, label: "Completed", count: completedCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`text-xs font-body whitespace-nowrap px-3 py-2 rounded-sm transition-colors ${
                filter === tab.key
                  ? "bg-green/10 text-green font-medium"
                  : "text-gray-500 hover:text-green hover:bg-green/5"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-[10px] opacity-60">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Projects grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-green/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 font-body mb-1">
              {filter === "all"
                ? "No projects yet."
                : `No ${filter} projects.`}
            </p>
            <p className="text-xs text-gray-400 font-body">
              Your concierge will set up projects here as needed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((project) => {
              const typeConf = TYPE_CONFIG[project.type] || TYPE_CONFIG.other;
              const statusConf = STATUS_STYLES[project.status] || STATUS_STYLES.planning;
              const progress = project.milestones_total > 0
                ? Math.round((project.milestones_completed / project.milestones_total) * 100)
                : 0;
              const heroImage = Array.isArray(project.property_images) && project.property_images.length > 0
                ? project.property_images[0]
                : null;

              return (
                <Link
                  key={project.id}
                  href={`/client/projects/${project.id}`}
                  className="block group"
                >
                  <div className="bg-white border border-green/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {/* Cover image or type indicator */}
                    <div className="h-32 bg-green/5 overflow-hidden relative">
                      {heroImage ? (
                        <img
                          src={heroImage}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-green/10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                          </svg>
                        </div>
                      )}
                      {/* Type badge overlay */}
                      <span className={`absolute top-2 left-2 text-[10px] font-body font-medium px-2 py-0.5 rounded border ${typeConf.bg} ${typeConf.color}`}>
                        {typeConf.label}
                      </span>
                      {/* Status badge */}
                      <span className={`absolute top-2 right-2 text-[10px] font-body font-medium px-2 py-0.5 rounded-full ${statusConf.style}`}>
                        {statusConf.label}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-heading text-sm font-semibold text-green truncate mb-1">
                        {project.title}
                      </h3>

                      {/* Address */}
                      {(project.property_address || project.property_city) && (
                        <p className="text-xs text-gray-400 font-body mb-3 truncate">
                          {[project.property_address, project.property_city, project.property_country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}

                      {/* Progress bar */}
                      {project.milestones_total > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-gray-400 font-body">Progress</span>
                            <span className="text-[10px] text-gray-500 font-body font-medium">
                              {project.milestones_completed}/{project.milestones_total}
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Budget + Last update */}
                      <div className="flex items-center justify-between">
                        {project.budget ? (
                          <span className="text-xs font-body text-gray-500">
                            {formatCurrency(project.budget, project.currency || "EUR")}
                          </span>
                        ) : (
                          <span />
                        )}
                        {project.last_update_at && (
                          <span className="text-[10px] text-gray-400 font-body">
                            {timeAgo(project.last_update_at)}
                          </span>
                        )}
                      </div>
                    </div>
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
