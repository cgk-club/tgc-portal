"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PartnerNav from "@/components/partner/PartnerNav";
import ImageUpload from "@/components/partner/ImageUpload";
import { getGuidance } from "@/lib/ficheGuidance";

interface HighlightItem {
  icon?: string;
  label: string;
  value: string;
}

interface Fiche {
  id: string;
  slug: string;
  headline: string;
  description: string;
  highlights: HighlightItem[] | null;
  hero_image_url: string | null;
  gallery_urls: string[] | null;
  price_display: string | null;
  show_price: boolean;
  template_type: string;
  template_fields: Record<string, string> | null;
  tgc_note: string | null;
  status: string;
  enrichment_score?: number;
  updated_at: string;
}

interface EditRequest {
  id: string;
  fiche_id: string;
  status: string;
  created_at: string;
}

export default function PartnerFichePage() {
  const router = useRouter();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [selectedFicheId, setSelectedFicheId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editRequests, setEditRequests] = useState<
    Record<string, EditRequest | null>
  >({});
  const [successMessage, setSuccessMessage] = useState("");

  // Editable fields
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [priceDisplay, setPriceDisplay] = useState("");
  const [templateFields, setTemplateFields] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/partner/session");
      if (!sessionRes.ok) {
        router.push("/partner/login");
        return;
      }

      const fichesRes = await fetch("/api/partner/fiches");
      if (fichesRes.ok) {
        const data = await fichesRes.json();
        setFiches(data);
        if (data.length > 0) {
          setSelectedFicheId(data[0].id);
          populateFields(data[0]);
        }
      }

      setLoading(false);
    }
    load();
  }, [router]);

  function populateFields(fiche: Fiche) {
    setHeadline(fiche.headline || "");
    setDescription(fiche.description || "");
    if (fiche.highlights && Array.isArray(fiche.highlights)) {
      setHighlights(fiche.highlights.map((h) =>
        typeof h === 'string' ? h : `${h.label}: ${h.value}`
      ));
    } else {
      setHighlights([]);
    }
    setHeroImageUrl(fiche.hero_image_url || null);
    setGalleryUrls(fiche.gallery_urls || []);
    setPriceDisplay(fiche.price_display || "");
    setTemplateFields(fiche.template_fields || {});
  }

  function handleFicheSelect(ficheId: string) {
    setSelectedFicheId(ficheId);
    const fiche = fiches.find((f) => f.id === ficheId);
    if (fiche) populateFields(fiche);
    setSuccessMessage("");
  }

  function addHighlight() {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight("");
    }
  }

  function removeHighlight(index: number) {
    setHighlights(highlights.filter((_, i) => i !== index));
  }

  function removeGalleryUrl(index: number) {
    setGalleryUrls(galleryUrls.filter((_, i) => i !== index));
  }

  async function handleGalleryUpload(files: FileList) {
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/partner/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) newUrls.push(data.url);
      }
    }
    setGalleryUrls([...galleryUrls, ...newUrls]);
    setUploading(false);
  }

  function updateTemplateField(key: string, value: string) {
    setTemplateFields({ ...templateFields, [key]: value });
  }

  async function handleSubmitForReview() {
    if (!selectedFicheId) return;
    setSaving(true);
    setSuccessMessage("");

    const res = await fetch(
      `/api/partner/fiches/${selectedFicheId}/edit-request`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          description,
          highlights: highlights.join("\n"),
          hero_image_url: heroImageUrl,
          gallery_urls: galleryUrls,
          price_display: priceDisplay,
          template_fields: templateFields,
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      setEditRequests({
        ...editRequests,
        [selectedFicheId]: data.editRequest || { status: "pending" },
      });
      setSuccessMessage("Edit request submitted for review.");
    }

    setSaving(false);
  }

  const selectedFiche = fiches.find((f) => f.id === selectedFicheId);
  const pendingRequest = editRequests[selectedFicheId];
  const guidance = selectedFiche ? getGuidance(selectedFiche.template_type) : getGuidance('default');

  // Calculate enrichment score
  function getEnrichmentScore(fiche: Fiche): number {
    let score = 0;
    if (fiche.headline) score += 15;
    if (fiche.description && fiche.description.length > 50) score += 20;
    if (fiche.highlights && Array.isArray(fiche.highlights) && fiche.highlights.length > 0) score += 15;
    if (fiche.hero_image_url) score += 20;
    if (fiche.gallery_urls && fiche.gallery_urls.length >= 4) score += 15;
    else if (fiche.gallery_urls && fiche.gallery_urls.length > 0) score += 7;
    if (fiche.price_display) score += 10;
    if (
      fiche.template_fields &&
      Object.keys(fiche.template_fields).length > 0
    )
      score += 5;
    return Math.min(score, 100);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <p className="text-gray-400 font-body">Loading...</p>
      </div>
    );
  }

  if (fiches.length === 0) {
    return (
      <div className="min-h-screen bg-pearl">
        <PartnerNav active="fiche" />
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14 text-center">
          <h1 className="font-heading text-xl font-semibold text-green mb-2">
            My Fiche
          </h1>
          <p className="text-sm text-gray-500 font-body">
            No fiches are linked to your account yet. Please contact us to get
            started.
          </p>
        </div>
      </div>
    );
  }

  const enrichmentScore = selectedFiche
    ? getEnrichmentScore(selectedFiche)
    : 0;

  return (
    <div className="min-h-screen bg-pearl">
      <PartnerNav active="fiche" />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <h1 className="font-heading text-xl font-semibold text-green mb-2">
          My Fiche
        </h1>
        <p className="text-sm text-gray-500 font-body mb-6">
          {guidance.completionTip}
        </p>

        {/* Fiche selector (if multiple) */}
        {fiches.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {fiches.map((f) => (
              <button
                key={f.id}
                onClick={() => handleFicheSelect(f.id)}
                className={`text-xs font-body whitespace-nowrap px-4 py-2 rounded-md border transition-colors ${
                  selectedFicheId === f.id
                    ? "border-green bg-green/5 text-green font-medium"
                    : "border-green/10 text-gray-500 hover:border-green/30"
                }`}
              >
                {f.slug
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </button>
            ))}
          </div>
        )}

        {/* Pending Edit Request Banner */}
        {pendingRequest && pendingRequest.status === "pending" && (
          <div className="bg-gold/5 border border-gold/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-green font-body">
              An edit request is pending review. You can still submit a new one,
              which will replace the previous.
            </p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green/5 border border-green/20 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-green font-body">{successMessage}</p>
          </div>
        )}

        {selectedFiche && (
          <div className="space-y-6">
            {/* Hero Image */}
            <div className="bg-white border border-green/10 rounded-lg p-5">
              <ImageUpload
                value={heroImageUrl}
                onChange={(url) => setHeroImageUrl(url)}
                label="Hero Image"
              />
              <p className="text-[11px] text-gray-400 font-body mt-2 italic">
                {guidance.heroHint}
              </p>
            </div>

            {/* Enrichment Score */}
            <div className="bg-white border border-green/10 rounded-lg p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
                  Fiche Completeness
                </h2>
                <span className="text-sm font-medium text-green font-body">
                  {enrichmentScore}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    enrichmentScore >= 80
                      ? "bg-green"
                      : enrichmentScore >= 50
                      ? "bg-gold"
                      : "bg-red-400"
                  }`}
                  style={{ width: `${enrichmentScore}%` }}
                />
              </div>
              {enrichmentScore < 80 && (
                <p className="text-[11px] text-gray-400 font-body mt-2">
                  A complete fiche helps us market you to the right clients. Add images, a headline, and detailed descriptions to reach 100%.
                </p>
              )}
              {enrichmentScore >= 80 && enrichmentScore < 100 && (
                <p className="text-[11px] text-green font-body mt-2">
                  Looking great. A few more details will bring your fiche to its full potential.
                </p>
              )}
              {enrichmentScore >= 100 && (
                <p className="text-[11px] text-green font-body mt-2">
                  Your fiche is fully complete. Thank you for providing such rich content.
                </p>
              )}
            </div>

            {/* Read-only fields */}
            <div className="bg-white border border-green/10 rounded-lg p-5">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body mb-3">
                Fiche Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-body mb-0.5">
                    Slug
                  </p>
                  <p className="text-sm text-gray-700 font-body">
                    {selectedFiche.slug}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-body mb-0.5">
                    Template
                  </p>
                  <p className="text-sm text-gray-700 font-body capitalize">
                    {selectedFiche.template_type?.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-body mb-0.5">
                    Status
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-body ${
                      selectedFiche.status === "live"
                        ? "bg-green/10 text-green"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {selectedFiche.status}
                  </span>
                </div>
              </div>
              {selectedFiche.tgc_note && (
                <div className="mt-4 pt-4 border-t border-green/5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-body mb-1">
                    Note from TGC
                  </p>
                  <p className="text-xs text-gray-500 font-body">
                    {selectedFiche.tgc_note}
                  </p>
                </div>
              )}
            </div>

            {/* Editable Form */}
            <div className="bg-white border border-green/10 rounded-lg p-5 space-y-5">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
                Edit Your Information
              </h2>

              {/* Headline */}
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="A single, evocative sentence that captures your essence"
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
                <p className="text-[11px] text-gray-400 font-body mt-1 italic">
                  This appears as a pull quote on your fiche page. Make it count.
                </p>
              </div>

              {/* Description with writing prompts */}
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  placeholder={guidance.descriptionPrompt}
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
                <p className="text-[11px] text-gray-400 font-body mt-1 italic">
                  Separate paragraphs with a blank line. Each paragraph is paired with an image in the editorial layout.
                </p>
              </div>

              {/* Highlights with suggested tags */}
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Highlights & Amenities
                </label>
                <div className="space-y-2 mb-2">
                  {highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-green/5 rounded-md px-3 py-2"
                    >
                      <span className="text-gold text-xs">&#8226;</span>
                      <span className="text-sm text-gray-700 font-body flex-1">
                        {h}
                      </span>
                      <button
                        onClick={() => removeHighlight(i)}
                        className="text-gray-400 hover:text-red-400 text-xs"
                      >
                        &#10005;
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    placeholder="e.g. Pool: Heated outdoor infinity pool"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                    className="flex-1 rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                  />
                  <button
                    onClick={addHighlight}
                    className="px-3 py-2 text-xs bg-green/5 text-green rounded-md hover:bg-green/10 transition-colors font-body"
                  >
                    Add
                  </button>
                </div>
                {/* Suggested highlights */}
                {guidance.suggestedHighlights.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] text-gray-400 font-body mb-2">Suggested for your category:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {guidance.suggestedHighlights
                        .filter(s => !highlights.some(h => h.toLowerCase().startsWith(s.toLowerCase())))
                        .map(s => (
                          <button
                            key={s}
                            onClick={() => { setNewHighlight(`${s}: `); }}
                            className="text-[11px] px-2 py-1 rounded-full border border-green/15 text-green/60 hover:bg-green/5 hover:text-green transition-colors font-body"
                          >
                            + {s}
                          </button>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery Images — file upload with labeled slots */}
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Gallery Images
                </label>
                <p className="text-[11px] text-gray-400 font-body mb-3 italic">
                  Upload at least 4 images. Each image is used in a specific section of your editorial fiche. The order matters.
                </p>

                {/* Image slots with guidance */}
                <div className="space-y-3 mb-4">
                  {guidance.imageSlots.map((slot, i) => (
                    <div key={i} className="flex items-center gap-3 bg-green/[0.02] border border-green/10 rounded-md p-3">
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                        {galleryUrls[i] ? (
                          <img src={galleryUrls[i]} alt={slot.label} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 font-body">
                          {i + 1}. {slot.label}
                        </p>
                        <p className="text-[10px] text-gray-400 font-body">{slot.hint}</p>
                      </div>
                      {galleryUrls[i] && (
                        <button
                          onClick={() => removeGalleryUrl(i)}
                          className="text-gray-400 hover:text-red-400 text-xs flex-shrink-0"
                          title="Remove"
                        >
                          &#10005;
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Extra images beyond the slots */}
                  {galleryUrls.slice(guidance.imageSlots.length).map((url, i) => (
                    <div key={`extra-${i}`} className="flex items-center gap-3 bg-green/[0.02] border border-green/10 rounded-md p-3">
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                        <img src={url} alt={`Extra ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 font-body">
                          {guidance.imageSlots.length + i + 1}. Additional image
                        </p>
                        <p className="text-[10px] text-gray-400 font-body">Extra gallery image</p>
                      </div>
                      <button
                        onClick={() => removeGalleryUrl(guidance.imageSlots.length + i)}
                        className="text-gray-400 hover:text-red-400 text-xs flex-shrink-0"
                        title="Remove"
                      >
                        &#10005;
                      </button>
                    </div>
                  ))}
                </div>

                {/* Upload button */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
                />
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-3 border-2 border-dashed border-green/20 rounded-md text-sm text-green/60 hover:border-green/40 hover:text-green hover:bg-green/[0.02] transition-colors font-body disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : `Upload images (${galleryUrls.length} of ${Math.max(guidance.imageSlots.length, 4)} recommended)`}
                </button>
                {galleryUrls.length < 4 && (
                  <p className="text-[11px] text-amber-600 font-body mt-2">
                    At least 4 images are required for your fiche to go live.
                  </p>
                )}
              </div>

              {/* Price Display */}
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Price Display
                </label>
                <input
                  type="text"
                  value={priceDisplay}
                  onChange={(e) => setPriceDisplay(e.target.value)}
                  placeholder="e.g. From EUR 250 per night"
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
                <p className="text-[11px] text-gray-400 font-body mt-1 italic">
                  Optional. Displayed on your fiche if enabled.
                </p>
              </div>

              {/* Template-Specific Fields */}
              {selectedFiche.template_fields &&
                Object.keys(selectedFiche.template_fields).length > 0 && (
                  <div>
                    <label className="block text-xs text-gray-500 font-body mb-1">
                      Additional Details
                    </label>
                    <p className="text-[11px] text-gray-400 font-body mb-3 italic">
                      These fields are specific to your category. The more you fill in, the richer your fiche presentation.
                    </p>
                    <div className="space-y-3">
                      {Object.entries(
                        selectedFiche.template_fields
                      ).map(([key]) => (
                        <div key={key}>
                          <label className="block text-[11px] text-gray-400 font-body mb-0.5 capitalize">
                            {key.replace(/_/g, " ")}
                          </label>
                          <input
                            type="text"
                            value={templateFields[key] || ""}
                            onChange={(e) =>
                              updateTemplateField(key, e.target.value)
                            }
                            className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Submit */}
              <div className="pt-3 border-t border-green/5">
                <button
                  onClick={handleSubmitForReview}
                  disabled={saving}
                  className="px-6 py-2.5 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50"
                >
                  {saving ? "Submitting..." : "Submit for Review"}
                </button>
                <p className="text-[11px] text-gray-400 font-body mt-2">
                  Changes will be reviewed by the TGC team before going live.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
