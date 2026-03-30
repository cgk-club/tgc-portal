"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import PartnerNav from "@/components/partner/PartnerNav";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  completed_date: string | null;
  sort_order: number;
}

interface Document {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  uploaded_by: string | null;
  uploaded_by_type: string | null;
  notes: string | null;
  created_at: string;
}

interface Update {
  id: string;
  author_type: string;
  author_name: string | null;
  message: string;
  attachments: { url: string; name: string }[];
  created_at: string;
}

interface OtherPartner {
  role: string;
  status: string;
}

interface ProjectDetail {
  project: {
    id: string;
    title: string;
    type: string;
    property_address: string | null;
    property_city: string | null;
    property_country: string | null;
    property_images: string[];
    status: string;
    start_date: string | null;
    target_date: string | null;
  };
  client_first_name: string;
  assignment: {
    role: string;
    status: string;
    notes: string | null;
  };
  milestones: Milestone[];
  documents: Document[];
  updates: Update[];
  other_partners: OtherPartner[];
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

const MILESTONE_STYLES: Record<string, { icon: string; color: string }> = {
  pending: { icon: "○", color: "text-gray-400" },
  in_progress: { icon: "◐", color: "text-gold" },
  completed: { icon: "●", color: "text-green" },
  blocked: { icon: "✕", color: "text-red-500" },
};

const DOC_TYPE_LABELS: Record<string, string> = {
  quote: "Quote",
  invoice: "Invoice",
  contract: "Contract",
  photo: "Photo",
  report: "Report",
  document: "Document",
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

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return `Today at ${formatTime(dateStr)}`;
  if (isYesterday) return `Yesterday at ${formatTime(dateStr)}`;
  return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
}

export default function PartnerProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [data, setData] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "milestones" | "documents" | "activity"
  >("overview");

  // Update form
  const [updateMessage, setUpdateMessage] = useState("");
  const [postingUpdate, setPostingUpdate] = useState(false);

  // Document upload form
  const [showUpload, setShowUpload] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("document");
  const [docNotes, setDocNotes] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/partner/session");
      if (!sessionRes.ok) {
        router.push("/partner/login");
        return;
      }
      await fetchProject();
      setLoading(false);
    }
    load();
  }, [router, projectId]);

  async function fetchProject() {
    const res = await fetch(`/api/partner/projects/${projectId}`);
    if (res.ok) {
      setData(await res.json());
    } else if (res.status === 404) {
      router.push("/partner/projects");
    }
  }

  async function handlePostUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!updateMessage.trim()) return;

    setPostingUpdate(true);
    const res = await fetch(`/api/partner/projects/${projectId}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: updateMessage.trim() }),
    });

    if (res.ok) {
      setUpdateMessage("");
      await fetchProject();
      // Scroll to bottom of feed
      setTimeout(() => {
        feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    setPostingUpdate(false);
  }

  async function handleDeleteDocument(docId: string) {
    if (!confirm("Delete this document?")) return;

    const res = await fetch(
      `/api/partner/projects/${projectId}/documents/${docId}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      await fetchProject();
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Failed to delete document");
    }
  }

  async function handleUploadDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!docFile || !docTitle.trim()) {
      setUploadError("Title and file are required.");
      return;
    }

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", docFile);
    formData.append("title", docTitle.trim());
    formData.append("file_type", docType);
    formData.append("notes", docNotes.trim());

    const res = await fetch(
      `/api/partner/projects/${projectId}/documents`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (res.ok) {
      setDocTitle("");
      setDocType("document");
      setDocNotes("");
      setDocFile(null);
      setShowUpload(false);
      await fetchProject();
    } else {
      const d = await res.json().catch(() => ({}));
      setUploadError(d.error || "Upload failed.");
    }

    setUploading(false);
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <p className="text-gray-400 font-body">Loading...</p>
      </div>
    );
  }

  const { project, client_first_name, assignment, milestones, documents, updates, other_partners } =
    data;

  const typeStyle = TYPE_STYLES[project.type] || {
    bg: "bg-gray-50",
    text: "text-gray-600",
  };
  const completedMilestones = milestones.filter(
    (m) => m.status === "completed"
  ).length;
  const milestonePercent =
    milestones.length > 0
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0;

  const TABS = [
    { key: "overview" as const, label: "Overview" },
    { key: "milestones" as const, label: `Milestones (${milestones.length})` },
    { key: "documents" as const, label: `Documents (${documents.length})` },
    { key: "activity" as const, label: `Activity (${updates.length})` },
  ];

  return (
    <div className="min-h-screen bg-pearl">
      <PartnerNav active="projects" />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        {/* Back link */}
        <Link
          href="/partner/projects"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-green font-body mb-6 transition-colors"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Projects
        </Link>

        {/* Project header */}
        <div className="bg-white border border-green/10 rounded-lg p-5 sm:p-6 mb-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="font-heading text-lg font-semibold text-green">
                  {project.title}
                </h1>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-body capitalize ${typeStyle.bg} ${typeStyle.text}`}
                >
                  {project.type.replace(/_/g, " ")}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-body capitalize ${
                    STATUS_STYLES[project.status] ||
                    "bg-gray-100 text-gray-500"
                  }`}
                >
                  {project.status.replace(/_/g, " ")}
                </span>
              </div>

              {(project.property_address || project.property_city) && (
                <p className="text-sm text-gray-500 font-body">
                  {[
                    project.property_address,
                    project.property_city,
                    project.property_country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-green/5">
            <div>
              <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-0.5">
                Your Role
              </p>
              <p className="text-sm font-medium text-green font-body">
                {assignment.role}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-0.5">
                Client
              </p>
              <p className="text-sm text-gray-700 font-body">
                {client_first_name}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-0.5">
                Start
              </p>
              <p className="text-sm text-gray-700 font-body">
                {formatDate(project.start_date) || "TBD"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-0.5">
                Target
              </p>
              <p className="text-sm text-gray-700 font-body">
                {formatDate(project.target_date) || "TBD"}
              </p>
            </div>
          </div>

          {/* Other partners on project */}
          {other_partners.length > 0 && (
            <div className="mt-3 pt-3 border-t border-green/5">
              <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">
                Other specialists on this project
              </p>
              <div className="flex flex-wrap gap-2">
                {other_partners.map((op, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 bg-green/5 text-green/70 rounded font-body"
                  >
                    {op.role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Milestone progress bar */}
          {milestones.length > 0 && (
            <div className="mt-4 pt-3 border-t border-green/5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider">
                  Progress
                </p>
                <span className="text-[11px] text-gray-500 font-body">
                  {milestonePercent}% complete
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green rounded-full transition-all duration-500"
                  style={{ width: `${milestonePercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Property images */}
        {project.property_images && project.property_images.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {project.property_images.map((url: string, i: number) => (
                <div
                  key={i}
                  className="w-32 h-24 rounded-lg overflow-hidden flex-none border border-green/10"
                >
                  <img
                    src={url}
                    alt={`Property ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-green/10 rounded-lg p-1 mb-6 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-xs font-body whitespace-nowrap px-4 py-2 rounded transition-colors ${
                activeTab === tab.key
                  ? "bg-green/5 text-green font-medium"
                  : "text-gray-400 hover:text-green"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Quick summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white border border-green/10 rounded-lg p-4">
                <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">
                  Milestones
                </p>
                <p className="text-2xl font-heading font-semibold text-green">
                  {completedMilestones}
                  <span className="text-sm text-gray-400 font-body">
                    /{milestones.length}
                  </span>
                </p>
              </div>
              <div className="bg-white border border-green/10 rounded-lg p-4">
                <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">
                  Documents
                </p>
                <p className="text-2xl font-heading font-semibold text-green">
                  {documents.length}
                </p>
              </div>
              <div className="bg-white border border-green/10 rounded-lg p-4">
                <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">
                  Updates
                </p>
                <p className="text-2xl font-heading font-semibold text-green">
                  {updates.length}
                </p>
              </div>
            </div>

            {/* Recent updates preview */}
            {updates.length > 0 && (
              <div className="bg-white border border-green/10 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
                    Recent Activity
                  </h3>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className="text-[11px] text-green hover:underline font-body"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {updates.slice(-3).map((u) => (
                    <div key={u.id} className="flex gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-none text-[10px] font-bold ${
                          u.author_type === "partner"
                            ? "bg-green/10 text-green"
                            : u.author_type === "client"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-gold/10 text-gold"
                        }`}
                      >
                        {u.author_type === "partner"
                          ? "P"
                          : u.author_type === "client"
                          ? "C"
                          : "T"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-700 font-body line-clamp-2">
                          {u.message}
                        </p>
                        <p className="text-[10px] text-gray-400 font-body mt-0.5">
                          {u.author_name || u.author_type} &middot;{" "}
                          {formatDateTime(u.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming milestones preview */}
            {milestones.filter((m) => m.status !== "completed").length > 0 && (
              <div className="bg-white border border-green/10 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
                    Upcoming Milestones
                  </h3>
                  <button
                    onClick={() => setActiveTab("milestones")}
                    className="text-[11px] text-green hover:underline font-body"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-2">
                  {milestones
                    .filter((m) => m.status !== "completed")
                    .slice(0, 3)
                    .map((m) => {
                      const style =
                        MILESTONE_STYLES[m.status] || MILESTONE_STYLES.pending;
                      return (
                        <div
                          key={m.id}
                          className="flex items-center gap-2"
                        >
                          <span className={`text-sm ${style.color}`}>
                            {style.icon}
                          </span>
                          <span className="text-xs text-gray-700 font-body flex-1 truncate">
                            {m.title}
                          </span>
                          {m.due_date && (
                            <span className="text-[10px] text-gray-400 font-body flex-none">
                              Due {formatDate(m.due_date)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "milestones" && (
          <div className="bg-white border border-green/10 rounded-lg p-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">
              Project Milestones
            </h3>
            {milestones.length === 0 ? (
              <p className="text-sm text-gray-400 font-body text-center py-4">
                No milestones defined yet.
              </p>
            ) : (
              <div className="space-y-1">
                {milestones.map((m, index) => {
                  const style =
                    MILESTONE_STYLES[m.status] || MILESTONE_STYLES.pending;
                  const isLast = index === milestones.length - 1;

                  return (
                    <div key={m.id} className="flex gap-3">
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center">
                        <span className={`text-lg leading-none ${style.color}`}>
                          {style.icon}
                        </span>
                        {!isLast && (
                          <div className="w-px flex-1 bg-gray-200 my-1" />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`pb-4 flex-1 ${isLast ? "" : ""}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              className={`text-sm font-body ${
                                m.status === "completed"
                                  ? "text-gray-400 line-through"
                                  : "text-gray-800"
                              }`}
                            >
                              {m.title}
                            </p>
                            {m.description && (
                              <p className="text-xs text-gray-400 font-body mt-0.5">
                                {m.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-0.5 flex-none">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-body capitalize ${
                                m.status === "completed"
                                  ? "bg-green/10 text-green"
                                  : m.status === "in_progress"
                                  ? "bg-gold/15 text-gold"
                                  : m.status === "blocked"
                                  ? "bg-red-50 text-red-500"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {m.status.replace(/_/g, " ")}
                            </span>
                            {m.due_date && (
                              <span className="text-[10px] text-gray-400 font-body">
                                {m.status === "completed" && m.completed_date
                                  ? `Done ${formatDate(m.completed_date)}`
                                  : `Due ${formatDate(m.due_date)}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-4">
            {/* Upload button */}
            {assignment.status === "active" && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowUpload(!showUpload);
                    setUploadError("");
                  }}
                  className="text-xs px-4 py-2 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body"
                >
                  {showUpload ? "Cancel" : "Upload Document"}
                </button>
              </div>
            )}

            {/* Upload form */}
            {showUpload && (
              <form
                onSubmit={handleUploadDocument}
                className="bg-white border border-green/10 rounded-lg p-5 space-y-4"
              >
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
                  Upload Document
                </h3>

                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. Plumbing Quote - March 2026"
                    required
                    className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 font-body mb-1">
                      Document Type
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body bg-white"
                    >
                      <option value="quote">Quote / Devis</option>
                      <option value="invoice">Invoice / Facture</option>
                      <option value="contract">Contract</option>
                      <option value="photo">Photo</option>
                      <option value="report">Report</option>
                      <option value="document">Other Document</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-body mb-1">
                      File
                    </label>
                    <input
                      type="file"
                      onChange={(e) =>
                        setDocFile(e.target.files?.[0] || null)
                      }
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                      required
                      className="w-full text-sm text-gray-500 font-body file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-green/5 file:text-green hover:file:bg-green/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={docNotes}
                    onChange={(e) => setDocNotes(e.target.value)}
                    rows={2}
                    placeholder="Any relevant context..."
                    className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                  />
                </div>

                {uploadError && (
                  <p className="text-sm text-red-500 font-body">
                    {uploadError}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-5 py-2 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpload(false);
                      setUploadError("");
                    }}
                    className="px-5 py-2 border border-green/20 text-green text-sm font-medium rounded-md hover:bg-green/5 transition-colors font-body"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Documents list */}
            <div className="bg-white border border-green/10 rounded-lg p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">
                Project Documents
              </h3>
              {documents.length === 0 ? (
                <p className="text-sm text-gray-400 font-body text-center py-4">
                  No documents yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-green/[0.02] transition-colors"
                    >
                      {/* File icon */}
                      <div className="w-8 h-8 rounded bg-green/5 flex items-center justify-center flex-none">
                        <svg
                          className="w-4 h-4 text-green/50"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-800 font-body truncate">
                            {doc.title}
                          </p>
                          {doc.file_type && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-body flex-none">
                              {DOC_TYPE_LABELS[doc.file_type] || doc.file_type}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-body">
                          {doc.uploaded_by || "Admin"} &middot;{" "}
                          {formatDate(doc.created_at)}
                        </p>
                        {doc.notes && (
                          <p className="text-[10px] text-gray-400 font-body mt-0.5 italic">
                            {doc.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-none">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green hover:underline font-body"
                        >
                          View
                        </a>
                        {doc.uploaded_by_type === "partner" && (
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                            title="Delete document"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            {/* Activity feed */}
            <div className="bg-white border border-green/10 rounded-lg p-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">
                Activity Feed
              </h3>
              {updates.length === 0 ? (
                <p className="text-sm text-gray-400 font-body text-center py-4">
                  No activity yet. Post the first update below.
                </p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {updates.map((u) => (
                    <div key={u.id} className="flex gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-none text-[11px] font-bold ${
                          u.author_type === "partner"
                            ? "bg-green/10 text-green"
                            : u.author_type === "client"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-gold/10 text-gold"
                        }`}
                      >
                        {u.author_type === "partner"
                          ? "P"
                          : u.author_type === "client"
                          ? "C"
                          : "T"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium text-gray-700 font-body">
                            {u.author_name || u.author_type}
                          </span>
                          <span className="text-[10px] text-gray-400 font-body">
                            {formatDateTime(u.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-body whitespace-pre-wrap">
                          {u.message}
                        </p>
                        {u.attachments && u.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {u.attachments.map((att, i) => (
                              <a
                                key={i}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] px-2 py-1 bg-green/5 text-green rounded font-body hover:bg-green/10 transition-colors"
                              >
                                {att.name || "Attachment"}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={feedEndRef} />
                </div>
              )}
            </div>

            {/* Post update form */}
            {assignment.status === "active" && (
              <form
                onSubmit={handlePostUpdate}
                className="bg-white border border-green/10 rounded-lg p-5"
              >
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
                  Post an Update
                </h3>
                <textarea
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  rows={3}
                  placeholder="Share progress, ask a question, or flag an issue..."
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body mb-3"
                />
                <button
                  type="submit"
                  disabled={postingUpdate || !updateMessage.trim()}
                  className="px-5 py-2 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50"
                >
                  {postingUpdate ? "Posting..." : "Post Update"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
