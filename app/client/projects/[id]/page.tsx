"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ClientNav from "@/components/client/ClientNav";

// ── Types ───────────────────────────────────────────────────────────

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed" | "skipped";
  due_date: string | null;
  completed_date: string | null;
  sort_order: number;
}

interface Document {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  uploaded_by: string;
  uploaded_by_type: "admin" | "client" | "partner";
  version: number | null;
  notes: string | null;
  created_at: string;
}

interface Update {
  id: string;
  author_type: "admin" | "client" | "partner";
  author_name: string;
  author_id: string | null;
  message: string;
  attachments: string[] | null;
  created_at: string;
}

interface Financial {
  id: string;
  type: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  document_url: string | null;
  status: string | null;
  notes: string | null;
}

interface ProjectDetail {
  id: string;
  type: string;
  title: string;
  property_address: string | null;
  property_city: string | null;
  property_country: string | null;
  property_details: Record<string, unknown> | null;
  property_images: string[] | null;
  status: string;
  budget: number | null;
  actual_spend: number | null;
  currency: string | null;
  monthly_retainer: number | null;
  admin_fee: number | null;
  start_date: string | null;
  target_date: string | null;
  completed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  milestones: Milestone[];
  documents: Document[];
  updates: Update[];
  financials: Financial[];
}

// ── Constants ───────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; accent: string }> = {
  renovation: { label: "Renovation", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", accent: "bg-amber-500" },
  rental_management: { label: "Rental Management", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", accent: "bg-blue-500" },
  property_search: { label: "Property Search", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", accent: "bg-emerald-500" },
  acquisition: { label: "Acquisition", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", accent: "bg-purple-500" },
  appraisal: { label: "Appraisal", color: "text-teal-700", bg: "bg-teal-50 border-teal-200", accent: "bg-teal-500" },
  tenant_management: { label: "Tenant Management", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200", accent: "bg-indigo-500" },
  upgrade: { label: "Upgrade", color: "text-rose-700", bg: "bg-rose-50 border-rose-200", accent: "bg-rose-500" },
  other: { label: "Other", color: "text-gray-600", bg: "bg-gray-50 border-gray-200", accent: "bg-gray-500" },
};

const STATUS_STYLES: Record<string, { label: string; style: string }> = {
  planning: { label: "Planning", style: "bg-amber-100 text-amber-800" },
  active: { label: "Active", style: "bg-green-100 text-green-800" },
  on_hold: { label: "On Hold", style: "bg-gray-200 text-gray-600" },
  completed: { label: "Completed", style: "bg-blue-100 text-blue-700" },
  cancelled: { label: "Cancelled", style: "bg-red-100 text-red-600" },
};

const AUTHOR_ICONS: Record<string, { icon: string; bg: string; color: string }> = {
  admin: { icon: "TGC", bg: "bg-green", color: "text-white" },
  client: { icon: "You", bg: "bg-gold/20", color: "text-gold" },
  partner: { icon: "P", bg: "bg-purple-100", color: "text-purple-700" },
};

const FILE_ICONS: Record<string, string> = {
  pdf: "PDF",
  doc: "DOC",
  docx: "DOC",
  xls: "XLS",
  xlsx: "XLS",
  jpg: "IMG",
  jpeg: "IMG",
  png: "IMG",
  gif: "IMG",
  zip: "ZIP",
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

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Component ───────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [activeTab, setActiveTab] = useState<"updates" | "documents" | "financials">("updates");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadProject() {
    const res = await fetch(`/api/client/projects/${projectId}`);
    if (res.ok) {
      setProject(await res.json());
    } else {
      setError("Project not found");
    }
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      const sessionRes = await fetch("/api/client/session");
      if (!sessionRes.ok) {
        router.push("/client/login");
        return;
      }
      loadProject();
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, projectId]);

  async function handlePostUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || postingUpdate) return;

    setPostingUpdate(true);
    const res = await fetch(`/api/client/projects/${projectId}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: newMessage.trim() }),
    });

    if (res.ok) {
      setNewMessage("");
      loadProject();
    }
    setPostingUpdate(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);

    const res = await fetch(`/api/client/projects/${projectId}/documents`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      loadProject();
      setActiveTab("documents");
    }
    setUploadingDoc(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Loading / Error states ──────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-pearl">
        <ClientNav active="projects" />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-green/20 border-t-green rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 font-body text-sm">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-pearl">
        <ClientNav active="projects" />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-400 font-body mb-4">Project not found.</p>
          <Link href="/client/projects" className="text-sm text-green hover:underline font-body">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  // ── Computed values ─────────────────────────────────────────────

  const typeConf = TYPE_CONFIG[project.type] || TYPE_CONFIG.other;
  const statusConf = STATUS_STYLES[project.status] || STATUS_STYLES.planning;
  const currency = project.currency || "EUR";

  const milestonesTotal = project.milestones.length;
  const milestonesCompleted = project.milestones.filter((m) => m.status === "completed").length;
  const progressPct = milestonesTotal > 0 ? Math.round((milestonesCompleted / milestonesTotal) * 100) : 0;

  const addressParts = [project.property_address, project.property_city, project.property_country].filter(Boolean);
  const fullAddress = addressParts.join(", ");
  const mapsUrl = fullAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}` : null;

  // Financial summaries
  const totalInvoiced = project.financials
    .filter((f) => f.type === "invoice")
    .reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = project.financials
    .filter((f) => ["payment", "income"].includes(f.type))
    .reduce((sum, f) => sum + f.amount, 0);

  const images = Array.isArray(project.property_images) ? project.property_images : [];

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="projects" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <Link href="/client/projects" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-green font-body mb-6 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All projects
        </Link>

        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="bg-white border border-green/10 rounded-lg p-5 sm:p-6 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded border ${typeConf.bg} ${typeConf.color}`}>
                  {typeConf.label}
                </span>
                <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded-full ${statusConf.style}`}>
                  {statusConf.label}
                </span>
              </div>
              <h1 className="font-heading text-xl sm:text-2xl font-semibold text-green mb-2">
                {project.title}
              </h1>
              {fullAddress && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-400 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                  <p className="text-sm text-gray-500 font-body">{fullAddress}</p>
                  {mapsUrl && (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-green hover:underline font-body ml-1">
                      View map
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Key dates */}
            <div className="flex gap-5 text-right shrink-0">
              {project.start_date && (
                <div>
                  <p className="text-[10px] text-gray-400 font-body uppercase tracking-wide mb-0.5">Started</p>
                  <p className="text-xs font-body text-gray-600 font-medium">{formatDate(project.start_date)}</p>
                </div>
              )}
              {project.target_date && (
                <div>
                  <p className="text-[10px] text-gray-400 font-body uppercase tracking-wide mb-0.5">Target</p>
                  <p className="text-xs font-body text-gray-600 font-medium">{formatDate(project.target_date)}</p>
                </div>
              )}
              {project.completed_date && (
                <div>
                  <p className="text-[10px] text-gray-400 font-body uppercase tracking-wide mb-0.5">Completed</p>
                  <p className="text-xs font-body text-green font-medium">{formatDate(project.completed_date)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {milestonesTotal > 0 && (
            <div className="mt-5 pt-4 border-t border-green/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-body">Overall progress</span>
                <span className="text-xs text-green font-body font-medium">{progressPct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 font-body mt-1">
                {milestonesCompleted} of {milestonesTotal} milestones completed
              </p>
            </div>
          )}
        </div>

        {/* ─── Two-column layout ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column (2 cols wide) */}
          <div className="lg:col-span-2 space-y-5">

            {/* ─── Property Images ──────────────────────────── */}
            {images.length > 0 && (
              <div className="bg-white border border-green/10 rounded-lg p-5">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
                  Property Images
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className="aspect-[4/3] rounded-md overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
                    >
                      <img src={url} alt={`Property ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Milestones Timeline ──────────────────────── */}
            {milestonesTotal > 0 && (
              <div className="bg-white border border-green/10 rounded-lg p-5">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">
                  Milestones
                </h2>
                <div className="relative">
                  {project.milestones.map((m, idx) => {
                    const isLast = idx === project.milestones.length - 1;
                    return (
                      <div key={m.id} className="flex gap-4 relative">
                        {/* Timeline line + dot */}
                        <div className="flex flex-col items-center flex-none w-6">
                          {/* Dot */}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-none z-10 ${
                            m.status === "completed"
                              ? "bg-green border-green"
                              : m.status === "in_progress"
                              ? "bg-white border-green"
                              : m.status === "skipped"
                              ? "bg-gray-200 border-gray-300"
                              : "bg-white border-gray-300"
                          }`}>
                            {m.status === "completed" && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            {m.status === "in_progress" && (
                              <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
                            )}
                            {m.status === "skipped" && (
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          {/* Connecting line */}
                          {!isLast && (
                            <div className={`w-0.5 flex-1 min-h-[24px] ${
                              m.status === "completed" ? "bg-green" : "bg-gray-200"
                            }`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className={`pb-5 flex-1 ${isLast ? "pb-0" : ""}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className={`font-heading text-sm font-semibold ${
                                m.status === "skipped" ? "text-gray-400 line-through" : "text-gray-800"
                              }`}>
                                {m.title}
                              </h3>
                              {m.description && (
                                <p className="text-xs text-gray-500 font-body mt-0.5 leading-relaxed">
                                  {m.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-none">
                              {m.completed_date && (
                                <p className="text-[10px] text-green font-body">{formatDate(m.completed_date)}</p>
                              )}
                              {m.due_date && m.status !== "completed" && (
                                <p className="text-[10px] text-gray-400 font-body">Due {formatDate(m.due_date)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Tabbed Section: Updates / Documents / Financials ── */}
            <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
              {/* Tab headers */}
              <div className="flex border-b border-green/10">
                {(["updates", "documents", "financials"] as const).map((tab) => {
                  const counts = {
                    updates: project.updates.length,
                    documents: project.documents.length,
                    financials: project.financials.length,
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 text-xs font-body py-3 px-4 transition-colors capitalize ${
                        activeTab === tab
                          ? "text-green border-b-2 border-green font-medium -mb-px"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {tab}
                      {counts[tab] > 0 && (
                        <span className="ml-1 text-[10px] opacity-60">({counts[tab]})</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-5">
                {/* ─── Updates tab ────────────────────────────── */}
                {activeTab === "updates" && (
                  <div>
                    {/* Post update form */}
                    <form onSubmit={handlePostUpdate} className="mb-5">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-none">
                          <span className="text-[10px] font-body font-medium text-gold">You</span>
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Post an update or question..."
                            rows={2}
                            className="w-full px-3 py-2 border border-green/15 rounded text-sm font-body focus:outline-none focus:ring-1 focus:ring-green/30 bg-white resize-none"
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              type="submit"
                              disabled={!newMessage.trim() || postingUpdate}
                              className="px-4 py-1.5 bg-green text-white text-xs font-body rounded hover:bg-green-light transition-colors disabled:opacity-50"
                            >
                              {postingUpdate ? "Posting..." : "Post update"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>

                    {/* Updates list */}
                    {project.updates.length === 0 ? (
                      <p className="text-center text-sm text-gray-400 font-body py-6">
                        No updates yet.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {project.updates.map((u) => {
                          const authorConf = AUTHOR_ICONS[u.author_type] || AUTHOR_ICONS.client;
                          return (
                            <div key={u.id} className="flex gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-none ${authorConf.bg}`}>
                                <span className={`text-[10px] font-body font-medium ${authorConf.color}`}>
                                  {authorConf.icon}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-body font-medium text-gray-700">
                                    {u.author_type === "admin" ? "Your Concierge" : u.author_name}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-body">
                                    {formatDateTime(u.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 font-body leading-relaxed whitespace-pre-wrap">
                                  {u.message}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Documents tab ─────────────────────────── */}
                {activeTab === "documents" && (
                  <div>
                    {/* Upload button */}
                    <div className="mb-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingDoc}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-green/20 text-xs text-green font-body rounded hover:bg-green/5 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        {uploadingDoc ? "Uploading..." : "Upload document"}
                      </button>
                    </div>

                    {project.documents.length === 0 ? (
                      <p className="text-center text-sm text-gray-400 font-body py-6">
                        No documents yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {project.documents.map((doc) => {
                          const typeLabel = FILE_ICONS[doc.file_type?.toLowerCase()] || "FILE";
                          const uploaderColors = doc.uploaded_by_type === "admin"
                            ? "bg-green/10 text-green"
                            : doc.uploaded_by_type === "partner"
                            ? "bg-purple-50 text-purple-600"
                            : "bg-gold/10 text-gold";

                          return (
                            <a
                              key={doc.id}
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-3 p-3 border border-green/10 rounded-lg hover:border-green/25 transition-colors group"
                            >
                              <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-none">
                                <span className="text-[10px] font-body font-bold text-gray-500">{typeLabel}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-body font-medium text-gray-700 truncate group-hover:text-green transition-colors">
                                  {doc.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`text-[10px] font-body px-1.5 py-0.5 rounded ${uploaderColors}`}>
                                    {doc.uploaded_by}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-body">
                                    {formatDate(doc.created_at)}
                                  </span>
                                  {doc.version && doc.version > 1 && (
                                    <span className="text-[10px] text-gray-400 font-body">v{doc.version}</span>
                                  )}
                                </div>
                                {doc.notes && (
                                  <p className="text-[10px] text-gray-400 font-body mt-1 line-clamp-1">{doc.notes}</p>
                                )}
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Financials tab ────────────────────────── */}
                {activeTab === "financials" && (
                  <div>
                    {project.financials.length === 0 ? (
                      <p className="text-center text-sm text-gray-400 font-body py-6">
                        No financial records yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {project.financials.map((f) => {
                          const isIncome = ["payment", "income"].includes(f.type);
                          const typeStyles: Record<string, string> = {
                            invoice: "bg-amber-50 text-amber-700",
                            quote: "bg-blue-50 text-blue-700",
                            payment: "bg-green-50 text-green-700",
                            income: "bg-green-50 text-green-700",
                            retainer: "bg-indigo-50 text-indigo-700",
                            admin_fee: "bg-purple-50 text-purple-700",
                            expense: "bg-red-50 text-red-700",
                          };

                          return (
                            <div key={f.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                              <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded capitalize ${typeStyles[f.type] || "bg-gray-50 text-gray-600"}`}>
                                {f.type.replace("_", " ")}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-body text-gray-700 truncate">{f.description}</p>
                                <p className="text-[10px] text-gray-400 font-body">{formatDate(f.date)}</p>
                              </div>
                              <div className="text-right flex-none">
                                <p className={`text-sm font-body font-medium ${isIncome ? "text-green" : "text-gray-700"}`}>
                                  {isIncome ? "+" : ""}{formatCurrency(f.amount, f.currency || currency)}
                                </p>
                                {f.status && (
                                  <p className={`text-[10px] font-body ${
                                    f.status === "paid" ? "text-green" : f.status === "pending" ? "text-amber-600" : "text-gray-400"
                                  }`}>
                                    {f.status}
                                  </p>
                                )}
                              </div>
                              {f.document_url && (
                                <a href={f.document_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green transition-colors">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                  </svg>
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Right sidebar ────────────────────────────────── */}
          <div className="space-y-5">

            {/* Financial Summary Card */}
            <div className="bg-white border border-green/10 rounded-lg p-5">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">
                Financial Summary
              </h2>

              {/* Budget vs actual */}
              {project.budget && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-400 font-body">Budget</span>
                    <span className="text-xs font-body font-medium text-gray-700">
                      {formatCurrency(project.budget, currency)}
                    </span>
                  </div>
                  {project.actual_spend !== null && project.actual_spend !== undefined && (
                    <>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-gray-400 font-body">Spent</span>
                        <span className={`text-xs font-body font-medium ${
                          (project.actual_spend || 0) > project.budget ? "text-red-600" : "text-gray-700"
                        }`}>
                          {formatCurrency(project.actual_spend || 0, currency)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            ((project.actual_spend || 0) / project.budget) > 1 ? "bg-red-500" : "bg-green"
                          }`}
                          style={{ width: `${Math.min(100, ((project.actual_spend || 0) / project.budget) * 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-body mt-1">
                        {Math.round(((project.actual_spend || 0) / project.budget) * 100)}% of budget
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Divider */}
              {(project.budget || project.monthly_retainer || project.admin_fee) && (
                <div className="border-t border-green/5 pt-3 mb-3" />
              )}

              {/* Monthly retainer */}
              {project.monthly_retainer && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-body">Monthly retainer</span>
                  <span className="text-xs font-body font-medium text-gray-700">
                    {formatCurrency(project.monthly_retainer, currency)}/mo
                  </span>
                </div>
              )}

              {/* Admin fee */}
              {project.admin_fee && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-body">Admin fee</span>
                  <span className="text-xs font-body font-medium text-gray-700">
                    {formatCurrency(project.admin_fee, currency)}
                  </span>
                </div>
              )}

              {/* Invoiced / Paid */}
              {project.financials.length > 0 && (
                <>
                  <div className="border-t border-green/5 pt-3 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 font-body">Total invoiced</span>
                      <span className="text-xs font-body font-medium text-gray-700">
                        {formatCurrency(totalInvoiced, currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-body">Total paid</span>
                      <span className="text-xs font-body font-medium text-green">
                        {formatCurrency(totalPaid, currency)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Empty state */}
              {!project.budget && !project.monthly_retainer && !project.admin_fee && project.financials.length === 0 && (
                <p className="text-xs text-gray-400 font-body text-center py-2">
                  No financial data yet.
                </p>
              )}
            </div>

            {/* Key Dates Card */}
            <div className="bg-white border border-green/10 rounded-lg p-5">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
                Key Dates
              </h2>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-body">Created</span>
                  <span className="text-xs font-body text-gray-600">{formatDate(project.created_at)}</span>
                </div>
                {project.start_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-body">Started</span>
                    <span className="text-xs font-body text-gray-600">{formatDate(project.start_date)}</span>
                  </div>
                )}
                {project.target_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-body">Target</span>
                    <span className="text-xs font-body text-gray-600">{formatDate(project.target_date)}</span>
                  </div>
                )}
                {project.completed_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-body">Completed</span>
                    <span className="text-xs font-body text-green font-medium">{formatDate(project.completed_date)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-body">Last updated</span>
                  <span className="text-xs font-body text-gray-600">{formatDate(project.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Notes card (if project has notes) */}
            {project.notes && (
              <div className="bg-white border border-green/10 rounded-lg p-5">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
                  Notes
                </h2>
                <p className="text-sm text-gray-600 font-body leading-relaxed whitespace-pre-wrap">
                  {project.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Image Lightbox ──────────────────────────────────── */}
      {selectedImage !== null && images.length > 0 && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[selectedImage]}
              alt={`Property ${selectedImage + 1}`}
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedImage((selectedImage + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            {/* Image counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-body px-3 py-1 rounded-full">
              {selectedImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
