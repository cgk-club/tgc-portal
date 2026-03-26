"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PartnerNav from "@/components/partner/PartnerNav";

interface ContentSubmission {
  id: string;
  type: string;
  title: string;
  body: string;
  image_urls: string[] | null;
  status: string;
  published_url: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-200 text-gray-600",
  pending: "bg-gold/15 text-gold",
  approved: "bg-green/10 text-green",
  published: "bg-green/10 text-green",
  rejected: "bg-red-100 text-red-600",
};

const CONTENT_TYPES = [
  { value: "story", label: "Story" },
  { value: "seasonal", label: "Seasonal Update" },
  { value: "update", label: "News / Update" },
  { value: "highlight", label: "Highlight" },
];

export default function PartnerContentPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [type, setType] = useState("story");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/partner/session");
      if (!sessionRes.ok) {
        router.push("/partner/login");
        return;
      }
      await fetchContent();
      setLoading(false);
    }
    load();
  }, [router]);

  async function fetchContent() {
    const res = await fetch("/api/partner/content");
    if (res.ok) {
      setSubmissions(await res.json());
    }
  }

  function resetForm() {
    setType("story");
    setTitle("");
    setBody("");
    setImageUrls([]);
    setNewImageUrl("");
    setEditingId(null);
    setError("");
  }

  function startEdit(item: ContentSubmission) {
    setType(item.type);
    setTitle(item.title);
    setBody(item.body);
    setImageUrls(item.image_urls || []);
    setEditingId(item.id);
    setShowForm(true);
    setError("");
  }

  function addImageUrl() {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  }

  function removeImageUrl(index: number) {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      type,
      title: title.trim(),
      body: body.trim(),
      image_urls: imageUrls.length > 0 ? imageUrls : null,
    };

    const url = editingId
      ? `/api/partner/content/${editingId}`
      : "/api/partner/content";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await fetchContent();
      resetForm();
      setShowForm(false);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save content.");
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this submission?")) return;
    const res = await fetch(`/api/partner/content/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchContent();
    }
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
      <PartnerNav active="content" />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-xl font-semibold text-green">
            Content
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="text-xs px-4 py-2 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body"
          >
            {showForm ? "Cancel" : "Submit Content"}
          </button>
        </div>

        {/* Submit Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-green/10 rounded-lg p-5 mb-8 space-y-4"
          >
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
              {editingId ? "Edit Submission" : "New Submission"}
            </h2>

            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Content Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body bg-white"
              >
                {CONTENT_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                required
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Images
              </label>
              <div className="space-y-2 mb-2">
                {imageUrls.map((url, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-green/5 rounded-md px-3 py-2"
                  >
                    <span className="text-sm text-gray-700 font-body flex-1 truncate">
                      {url}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImageUrl(i)}
                      className="text-gray-400 hover:text-red-400 text-xs flex-none"
                    >
                      &#10005;
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Image URL"
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addImageUrl())
                  }
                  className="flex-1 rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="px-3 py-2 text-xs bg-green/5 text-green rounded-md hover:bg-green/10 transition-colors font-body"
                >
                  Add
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 font-body">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Submit"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-5 py-2 border border-green/20 text-green text-sm font-medium rounded-md hover:bg-green/5 transition-colors font-body"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="bg-white rounded-lg border border-green/10 p-8 text-center">
            <p className="text-sm text-gray-400 font-body mb-2">
              No content submissions yet.
            </p>
            <p className="text-xs text-gray-400 font-body">
              Share your stories, seasonal updates, and highlights with the TGC
              community.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-green/10 rounded-lg p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-sm font-semibold text-gray-800 truncate">
                        {item.title}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-body flex-none ${
                          STATUS_STYLES[item.status] || STATUS_STYLES.draft
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-green/50 uppercase tracking-wide font-body mb-1">
                      {CONTENT_TYPES.find((ct) => ct.value === item.type)
                        ?.label || item.type}
                    </p>
                    <p className="text-xs text-gray-500 font-body line-clamp-2">
                      {item.body}
                    </p>
                    {item.published_url && (
                      <a
                        href={item.published_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green hover:underline font-body mt-2 inline-block"
                      >
                        View published
                      </a>
                    )}
                    <p className="text-[10px] text-gray-300 font-body mt-2">
                      {new Date(item.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-none">
                    {(item.status === "draft" || item.status === "pending") && (
                      <button
                        onClick={() => startEdit(item)}
                        className="text-xs text-green hover:underline font-body"
                      >
                        Edit
                      </button>
                    )}
                    {item.status === "draft" && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs text-red-400 hover:text-red-600 font-body"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
