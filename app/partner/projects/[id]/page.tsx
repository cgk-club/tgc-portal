"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import PartnerNav from "@/components/partner/PartnerNav";
import Breadcrumb from "@/components/shared/Breadcrumb";
import EventBudgetTracker from "@/components/partner/EventBudgetTracker";
import PartnerPipelineTab from "@/components/partner/PartnerPipelineTab";

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

interface PartnerTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  completed_date: string | null;
  created_at: string;
}

interface OtherPartner {
  role: string;
  status: string;
}

interface AssignablePartner {
  id: string;
  name: string;
  role: string;
}

interface VisibilitySettings {
  financials: "hidden" | "read_only" | "full_access";
  tasks: "own_only" | "all";
  documents: "own_only" | "all";
  activity: "filtered" | "all";
  guests: "hidden" | "view";
  sponsors: "hidden" | "view";
  budget: "hidden" | "view";
}

interface PartnerFinancial {
  id: string;
  type: string;
  description: string;
  amount: number;
  currency: string;
  date: string | null;
  status: string | null;
  document_url?: string | null;
  notes?: string | null;
}

interface PartnerGuest {
  id: string;
  name: string;
  company: string | null;
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
    budget?: number | null;
    actual_spend?: number | null;
    currency?: string;
  };
  client_first_name: string;
  assignment: {
    role: string;
    status: string;
    notes: string | null;
    notes_visibility: "private" | "partners";
  };
  shared_notes: { author: string; role: string; notes: string }[];
  visibility_settings: VisibilitySettings;
  milestones: Milestone[];
  documents: Document[];
  updates: Update[];
  other_partners: OtherPartner[];
  assignable_partners: AssignablePartner[];
  tasks: PartnerTask[];
  financials?: PartnerFinancial[];
  guests?: PartnerGuest[];
  sponsors?: string[];
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
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Update form
  const [updateMessage, setUpdateMessage] = useState("");
  const [postingUpdate, setPostingUpdate] = useState(false);

  // Milestone editing
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: "", description: "", due_date: "" });
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [milestoneEditForm, setMilestoneEditForm] = useState({ title: "", description: "", due_date: "" });
  const [savingMilestone, setSavingMilestone] = useState(false);

  // Task creation form
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium", due_date: "", assigned_to: [] as string[] });
  const [creatingTask, setCreatingTask] = useState(false);

  // Notes editing
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [notesVis, setNotesVis] = useState<"private" | "partners">("private");
  const [savingNotes, setSavingNotes] = useState(false);

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

  async function handleUpdateTaskStatus(taskId: string, status: string) {
    const res = await fetch(`/api/partner/projects/${projectId}/tasks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status }),
    });
    if (res.ok) {
      await fetchProject();
    }
  }

  async function handleCreateMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!milestoneForm.title.trim()) return;
    setSavingMilestone(true);
    await fetch(`/api/partner/projects/${projectId}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: milestoneForm.title.trim(),
        description: milestoneForm.description.trim() || null,
        due_date: milestoneForm.due_date || null,
      }),
    });
    setMilestoneForm({ title: "", description: "", due_date: "" });
    setShowAddMilestone(false);
    setSavingMilestone(false);
    await fetchProject();
  }

  async function handleEditMilestone() {
    if (!editingMilestoneId || !milestoneEditForm.title.trim()) return;
    setSavingMilestone(true);
    await fetch(`/api/partner/projects/${projectId}/milestones/${editingMilestoneId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: milestoneEditForm.title.trim(),
        description: milestoneEditForm.description.trim() || null,
        due_date: milestoneEditForm.due_date || null,
      }),
    });
    setEditingMilestoneId(null);
    setSavingMilestone(false);
    await fetchProject();
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    setCreatingTask(true);

    const res = await fetch(`/api/partner/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || null,
        priority: taskForm.priority,
        due_date: taskForm.due_date || null,
        assigned_to: taskForm.assigned_to,
      }),
    });

    if (res.ok) {
      setShowAddTask(false);
      setTaskForm({ title: "", description: "", priority: "medium", due_date: "", assigned_to: [] });
      await fetchProject();
    }
    setCreatingTask(false);
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    const res = await fetch(`/api/partner/projects/${projectId}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notesValue || null, notes_visibility: notesVis }),
    });
    if (res.ok) {
      setEditingNotes(false);
      await fetchProject();
    }
    setSavingNotes(false);
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <p className="text-gray-400 font-body">Loading...</p>
      </div>
    );
  }

  const { project, client_first_name, assignment, shared_notes, milestones, documents, updates, other_partners, assignable_partners, tasks,
    visibility_settings: vis, financials, guests, sponsors } = data;

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

  const formatCurrency = (amount: number, currency: string = "EUR") =>
    new Intl.NumberFormat("en-GB", {
      style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);

  const TABS: { key: string; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "milestones", label: `Milestones (${milestones.length})` },
    ...(tasks && tasks.length > 0 ? [{ key: "tasks", label: `Tasks (${tasks.length})` }] : []),
    { key: "documents", label: `Documents (${documents.length})` },
    ...(vis?.financials && vis.financials !== "hidden" && financials && financials.length > 0
      ? [{ key: "financials", label: `Financials (${financials.length})` }] : []),
    ...(vis?.budget === "view" || (vis?.financials && vis.financials !== "hidden")
      ? [{ key: "budget", label: "Budget" }] : []),
    ...(vis?.guests === "view" && guests && guests.length > 0
      ? [{ key: "guests", label: `Guests (${guests.length})` }] : []),
    { key: "pipeline", label: "My Pipeline" },
    { key: "activity", label: `Activity (${updates.length})` },
  ];

  return (
    <div className="min-h-screen bg-pearl">
      <PartnerNav active="projects" />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <Breadcrumb
          segments={[
            { label: "Projects", href: "/partner/projects" },
            { label: project.title },
          ]}
          className="mb-6"
        />

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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                  {vis?.tasks === "all" ? "All Tasks" : "Your Tasks"}
                </p>
                <p className="text-2xl font-heading font-semibold text-green">
                  {tasks.filter((t) => t.status !== "completed").length}
                  <span className="text-sm text-gray-400 font-body ml-1">
                    active
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
              {vis?.budget === "view" && project.budget ? (
                <div className="bg-white border border-green/10 rounded-lg p-4">
                  <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">
                    Budget
                  </p>
                  <p className="text-2xl font-heading font-semibold text-green">
                    {formatCurrency(project.budget, project.currency || "EUR")}
                  </p>
                  {project.actual_spend != null && project.actual_spend > 0 && (
                    <p className="text-[10px] text-gray-400 font-body mt-0.5">
                      {formatCurrency(project.actual_spend, project.currency || "EUR")} spent
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-green/10 rounded-lg p-4">
                  <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">
                    Updates
                  </p>
                  <p className="text-2xl font-heading font-semibold text-green">
                    {updates.length}
                  </p>
                </div>
              )}
            </div>

            {/* Sponsors section (if visible) */}
            {vis?.sponsors === "view" && sponsors && sponsors.length > 0 && (
              <div className="bg-white border border-green/10 rounded-lg p-5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
                  Sponsors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sponsors.map((name, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1.5 bg-gold/10 text-gold rounded-full font-body font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Milestone progress */}
            {milestones.length > 0 && (
              <div className="bg-white border border-green/10 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
                    Project Progress
                  </h3>
                  <span className="text-sm font-heading font-semibold text-green">
                    {milestonePercent}%
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green rounded-full transition-all duration-500"
                    style={{ width: `${milestonePercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-body mt-1.5">
                  {completedMilestones} of {milestones.length} milestones completed
                </p>
              </div>
            )}

            {/* Two columns: Tasks + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Your assigned tasks */}
              <div className="bg-white border border-green/10 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
                    Your Tasks
                  </h3>
                  {tasks.length > 0 && (
                    <button
                      onClick={() => setActiveTab("tasks")}
                      className="text-[11px] text-green hover:underline font-body"
                    >
                      View all
                    </button>
                  )}
                </div>
                {tasks.filter((t) => t.status !== "completed").length === 0 ? (
                  <p className="text-sm text-gray-400 font-body text-center py-3">
                    No active tasks assigned to you.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {tasks
                      .filter((t) => t.status !== "completed")
                      .slice(0, 4)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between gap-2 p-2 rounded hover:bg-pearl/50"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-800 font-body truncate">
                              {task.title}
                            </p>
                            {task.due_date && (
                              <p className="text-[10px] text-gray-400 font-body">
                                Due {formatDate(task.due_date)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                                task.status === "in_progress"
                                  ? "bg-gold/15 text-gold"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {task.status === "in_progress"
                                ? "Active"
                                : "Pending"}
                            </span>
                            {assignment.status === "active" &&
                              task.status !== "completed" && (
                                <button
                                  onClick={() =>
                                    handleUpdateTaskStatus(
                                      task.id,
                                      task.status === "pending"
                                        ? "in_progress"
                                        : "completed"
                                    )
                                  }
                                  className="text-[10px] px-2 py-0.5 bg-green/5 text-green rounded hover:bg-green/10 font-body"
                                >
                                  {task.status === "pending"
                                    ? "Start"
                                    : "Done"}
                                </button>
                              )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Recent activity preview */}
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
                {updates.length === 0 ? (
                  <p className="text-sm text-gray-400 font-body text-center py-3">
                    No activity yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {updates.slice(-4).map((u) => (
                      <div key={u.id} className="flex gap-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-none text-[9px] font-bold mt-0.5 ${
                            u.author_type === "partner"
                              ? "bg-green/10 text-green"
                              : "bg-gold/10 text-gold"
                          }`}
                        >
                          {u.author_type === "partner" ? "P" : "T"}
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
                )}
              </div>
            </div>

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
                    .slice(0, 5)
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

            {/* Other partners on project */}
            {other_partners.length > 0 && (
              <div className="bg-white border border-green/10 rounded-lg p-5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
                  Other Specialists
                </h3>
                <div className="flex flex-wrap gap-2">
                  {other_partners.map((op, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2.5 py-1 bg-green/5 text-green/70 rounded font-body"
                    >
                      {op.role}
                      {op.status === "completed" && (
                        <span className="text-gray-400 ml-1">(completed)</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Shared notes from other partners */}
            {shared_notes && shared_notes.length > 0 && (
              <div className="bg-white border border-green/10 rounded-lg p-5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
                  Shared Notes
                </h3>
                <div className="space-y-3">
                  {shared_notes.map((sn, i) => (
                    <div key={i} className="border-l-2 border-green/20 pl-3">
                      <p className="text-[10px] text-gray-400 font-body mb-1">
                        {sn.author} &middot; {sn.role}
                      </p>
                      <p className="text-sm text-gray-600 font-body whitespace-pre-wrap">
                        {sn.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partner notes */}
            <div className="bg-white border border-green/10 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
                    My Notes
                  </h3>
                  {!editingNotes && assignment.notes && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-body ${
                      assignment.notes_visibility === "partners"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {assignment.notes_visibility === "partners" ? "Shared" : "Private"}
                    </span>
                  )}
                </div>
                {assignment.status === "active" && !editingNotes && (
                  <button
                    onClick={() => {
                      setNotesValue(assignment.notes || "");
                      setNotesVis(assignment.notes_visibility || "private");
                      setEditingNotes(true);
                    }}
                    className="text-[11px] text-green hover:underline font-body"
                  >
                    {assignment.notes ? "Edit" : "Add notes"}
                  </button>
                )}
              </div>
              {editingNotes ? (
                <div>
                  <textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    rows={4}
                    placeholder="Your notes on this project..."
                    className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body mb-2"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="notes_vis"
                          checked={notesVis === "private"}
                          onChange={() => setNotesVis("private")}
                          className="text-green focus:ring-green/30"
                        />
                        <span className="text-xs text-gray-600 font-body">Private</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="notes_vis"
                          checked={notesVis === "partners"}
                          onChange={() => setNotesVis("partners")}
                          className="text-green focus:ring-green/30"
                        />
                        <span className="text-xs text-gray-600 font-body">Visible to all partners</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className="text-xs px-4 py-1.5 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50"
                      >
                        {savingNotes ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingNotes(false)}
                        className="text-xs px-4 py-1.5 border border-green/20 text-green rounded-md hover:bg-green/5 transition-colors font-body"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : assignment.notes ? (
                <p className="text-sm text-gray-600 font-body whitespace-pre-wrap">
                  {assignment.notes}
                </p>
              ) : (
                <p className="text-sm text-gray-400 font-body">
                  No notes yet.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "milestones" && (
          <div className="space-y-4">
            {/* Add milestone button */}
            {assignment.status === "active" && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddMilestone(!showAddMilestone)}
                  className="text-xs px-4 py-2 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body"
                >
                  {showAddMilestone ? "Cancel" : "Add Milestone"}
                </button>
              </div>
            )}

            {/* Add milestone form */}
            {showAddMilestone && (
              <form onSubmit={handleCreateMilestone} className="bg-white border border-green/10 rounded-lg p-5 space-y-3">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">New Milestone</h3>
                <input value={milestoneForm.title} onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                  placeholder="Milestone title" required
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body" />
                <textarea value={milestoneForm.description} onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                  placeholder="Description (optional)" rows={2}
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body" />
                <div className="flex items-center gap-3">
                  <input type="date" value={milestoneForm.due_date} onChange={(e) => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })}
                    className="rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body" />
                  <button type="submit" disabled={savingMilestone || !milestoneForm.title.trim()}
                    className="px-5 py-2 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50">
                    {savingMilestone ? "Adding..." : "Add"}
                  </button>
                </div>
              </form>
            )}

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
                    const style = MILESTONE_STYLES[m.status] || MILESTONE_STYLES.pending;
                    const isLast = index === milestones.length - 1;
                    const isEditing = editingMilestoneId === m.id;

                    return (
                      <div key={m.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className={`text-lg leading-none ${style.color}`}>{style.icon}</span>
                          {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
                        </div>

                        <div className={`pb-4 flex-1`}>
                          {isEditing ? (
                            <div className="space-y-2">
                              <input value={milestoneEditForm.title}
                                onChange={(e) => setMilestoneEditForm({ ...milestoneEditForm, title: e.target.value })}
                                className="w-full rounded-md border border-green/20 px-3 py-1.5 text-sm text-gray-800 focus:border-green focus:outline-none font-body" />
                              <textarea value={milestoneEditForm.description} rows={2}
                                onChange={(e) => setMilestoneEditForm({ ...milestoneEditForm, description: e.target.value })}
                                placeholder="Description (optional)"
                                className="w-full rounded-md border border-green/20 px-3 py-1.5 text-sm text-gray-800 focus:border-green focus:outline-none font-body" />
                              <div className="flex items-center gap-2">
                                <input type="date" value={milestoneEditForm.due_date}
                                  onChange={(e) => setMilestoneEditForm({ ...milestoneEditForm, due_date: e.target.value })}
                                  className="rounded-md border border-green/20 px-3 py-1.5 text-sm text-gray-800 focus:border-green focus:outline-none font-body" />
                                <button onClick={handleEditMilestone} disabled={savingMilestone}
                                  className="text-xs px-3 py-1.5 bg-green text-white rounded-md hover:bg-green-light font-body disabled:opacity-50">
                                  {savingMilestone ? "Saving..." : "Save"}
                                </button>
                                <button onClick={() => setEditingMilestoneId(null)}
                                  className="text-xs px-3 py-1.5 border border-green/20 text-green rounded-md hover:bg-green/5 font-body">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className={`text-sm font-body ${m.status === "completed" ? "text-gray-400 line-through" : "text-gray-800"}`}>
                                  {m.title}
                                </p>
                                {m.description && (
                                  <p className="text-xs text-gray-400 font-body mt-0.5">{m.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-none">
                                <div className="flex flex-col items-end gap-0.5">
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-body capitalize ${
                                    m.status === "completed" ? "bg-green/10 text-green"
                                      : m.status === "in_progress" ? "bg-gold/15 text-gold"
                                      : m.status === "blocked" ? "bg-red-50 text-red-500"
                                      : "bg-gray-100 text-gray-500"
                                  }`}>
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
                                {assignment.status === "active" && (
                                  <button
                                    onClick={() => {
                                      setEditingMilestoneId(m.id);
                                      setMilestoneEditForm({
                                        title: m.title,
                                        description: m.description || "",
                                        due_date: m.due_date || "",
                                      });
                                    }}
                                    className="text-[10px] text-gray-400 hover:text-green font-body"
                                    title="Edit"
                                  >
                                    &#9998;
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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

        {activeTab === "tasks" && (
          <div className="space-y-4">
            {/* Add task button */}
            {assignment.status === "active" && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddTask(!showAddTask)}
                  className="text-xs px-4 py-2 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body"
                >
                  {showAddTask ? "Cancel" : "Add Task"}
                </button>
              </div>
            )}

            {/* Add task form */}
            {showAddTask && (
              <form
                onSubmit={handleCreateTask}
                className="bg-white border border-green/10 rounded-lg p-5 space-y-4"
              >
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
                  New Task
                </h3>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Title</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="What needs to be done?"
                    required
                    className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-body mb-1">Description (optional)</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    rows={2}
                    placeholder="Additional details..."
                    className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 font-body mb-1">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-body mb-1">Due Date (optional)</label>
                    <input
                      type="date"
                      value={taskForm.due_date}
                      onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                      className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-body mb-1">Assign To</label>
                    <div className="space-y-1 max-h-28 overflow-y-auto border border-green/20 rounded-md p-2">
                      {assignable_partners && assignable_partners.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={taskForm.assigned_to.includes(p.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTaskForm({ ...taskForm, assigned_to: [...taskForm.assigned_to, p.id] });
                              } else {
                                setTaskForm({ ...taskForm, assigned_to: taskForm.assigned_to.filter((id) => id !== p.id) });
                              }
                            }}
                            className="rounded border-gray-300 text-green focus:ring-green/30"
                          />
                          <span className="text-xs text-gray-700 font-body">{p.name}</span>
                        </label>
                      ))}
                      {(!assignable_partners || assignable_partners.length === 0) && (
                        <p className="text-[10px] text-gray-400 font-body">No partners to assign</p>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-body mt-1">Leave empty for unassigned</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creatingTask || !taskForm.title.trim()}
                    className="px-5 py-2 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50"
                  >
                    {creatingTask ? "Creating..." : "Create Task"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTask(false)}
                    className="px-5 py-2 border border-green/20 text-green text-sm font-medium rounded-md hover:bg-green/5 transition-colors font-body"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* In Progress tasks */}
            {tasks.filter((t) => t.status === "in_progress").length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gold uppercase tracking-wider font-body mb-3">
                  In Progress
                </h3>
                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.status === "in_progress")
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-white border border-green/10 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="text-sm font-body font-medium text-gray-800">
                                {task.title}
                              </p>
                              <span
                                className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                                  task.priority === "urgent"
                                    ? "bg-red-50 text-red-600"
                                    : task.priority === "high"
                                    ? "bg-amber-50 text-amber-600"
                                    : task.priority === "medium"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-xs text-gray-500 font-body mb-1">
                                {task.description}
                              </p>
                            )}
                            {task.due_date && (
                              <span className="text-xs text-gray-400 font-body">
                                Due: {formatDate(task.due_date)}
                              </span>
                            )}
                          </div>
                          {assignment.status === "active" && (
                            <button
                              onClick={() =>
                                handleUpdateTaskStatus(task.id, "completed")
                              }
                              className="text-xs px-3 py-1.5 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body flex-none"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Pending tasks */}
            {tasks.filter((t) => t.status === "pending").length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
                  Pending
                </h3>
                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.status === "pending")
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-white border border-green/10 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="text-sm font-body font-medium text-gray-800">
                                {task.title}
                              </p>
                              <span
                                className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                                  task.priority === "urgent"
                                    ? "bg-red-50 text-red-600"
                                    : task.priority === "high"
                                    ? "bg-amber-50 text-amber-600"
                                    : task.priority === "medium"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-xs text-gray-500 font-body mb-1">
                                {task.description}
                              </p>
                            )}
                            {task.due_date && (
                              <span className="text-xs text-gray-400 font-body">
                                Due: {formatDate(task.due_date)}
                              </span>
                            )}
                          </div>
                          {assignment.status === "active" && (
                            <button
                              onClick={() =>
                                handleUpdateTaskStatus(task.id, "in_progress")
                              }
                              className="text-xs px-3 py-1.5 border border-green/20 text-green rounded-md hover:bg-green/5 transition-colors font-body flex-none"
                            >
                              Start
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Completed tasks */}
            {tasks.filter((t) => t.status === "completed").length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider font-body mb-3">
                  Completed
                </h3>
                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.status === "completed")
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-white border border-green/10 rounded-lg p-4 opacity-60"
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-body text-gray-400 line-through">
                            {task.title}
                          </p>
                          <span className="inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium bg-green/10 text-green">
                            done
                          </span>
                          {task.completed_date && (
                            <span className="text-[10px] text-gray-400 font-body ml-auto">
                              {formatDate(task.completed_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {tasks.length === 0 && !showAddTask && (
              <div className="bg-white border border-green/10 rounded-lg p-5 text-center">
                <p className="text-sm text-gray-400 font-body">
                  No tasks yet. Create one to get started.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "financials" && vis?.financials !== "hidden" && financials && (
          <div className="bg-white border border-green/10 rounded-lg p-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">
              Financials
            </h3>
            {financials.length === 0 ? (
              <p className="text-sm text-gray-400 font-body text-center py-4">
                No financial records yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-green/10">
                      <th className="text-left px-3 py-2 text-[10px] text-gray-400 font-body uppercase">Type</th>
                      <th className="text-left px-3 py-2 text-[10px] text-gray-400 font-body uppercase">Description</th>
                      <th className="text-right px-3 py-2 text-[10px] text-gray-400 font-body uppercase">Amount</th>
                      <th className="text-left px-3 py-2 text-[10px] text-gray-400 font-body uppercase">Date</th>
                      <th className="text-left px-3 py-2 text-[10px] text-gray-400 font-body uppercase">Status</th>
                      {vis.financials === "full_access" && (
                        <th className="text-left px-3 py-2 text-[10px] text-gray-400 font-body uppercase">Notes</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {financials.map((f) => (
                      <tr key={f.id} className="border-b border-green/5 last:border-0">
                        <td className="px-3 py-2 text-gray-600 font-body capitalize">{f.type.replace(/_/g, " ")}</td>
                        <td className="px-3 py-2 text-gray-800 font-body">{f.description}</td>
                        <td className="px-3 py-2 text-right font-body font-medium text-green">
                          {formatCurrency(f.amount, f.currency)}
                        </td>
                        <td className="px-3 py-2 text-gray-500 font-body">{f.date ? formatDate(f.date) : "-"}</td>
                        <td className="px-3 py-2">
                          {f.status && (
                            <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                              f.status === "paid" ? "bg-green/10 text-green"
                                : f.status === "pending" ? "bg-gold/15 text-gold"
                                : "bg-gray-100 text-gray-500"
                            }`}>
                              {f.status}
                            </span>
                          )}
                        </td>
                        {vis.financials === "full_access" && (
                          <td className="px-3 py-2 text-xs text-gray-400 font-body">{f.notes || "-"}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "budget" && (
          <EventBudgetTracker projectId={projectId} isActive={activeTab === "budget"} />
        )}

        {activeTab === "guests" && vis?.guests === "view" && guests && (
          <div className="bg-white border border-green/10 rounded-lg p-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-4">
              Guest List
            </h3>
            {guests.length === 0 ? (
              <p className="text-sm text-gray-400 font-body text-center py-4">
                No guests registered yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-green/10">
                      <th className="text-left px-3 py-2 text-[10px] text-gray-400 font-body uppercase">Name</th>
                      <th className="text-left px-3 py-2 text-[10px] text-gray-400 font-body uppercase">Company</th>
                      <th className="text-left px-3 py-2 text-[10px] text-gray-400 font-body uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map((g) => (
                      <tr key={g.id} className="border-b border-green/5 last:border-0">
                        <td className="px-3 py-2 text-gray-800 font-body font-medium">{g.name}</td>
                        <td className="px-3 py-2 text-gray-500 font-body">{g.company || "-"}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                            g.status === "confirmed" ? "bg-green/10 text-green"
                              : g.status === "invited" ? "bg-blue-50 text-blue-600"
                              : g.status === "declined" ? "bg-red-50 text-red-500"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {g.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "pipeline" && (
          <PartnerPipelineTab projectId={projectId} />
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
