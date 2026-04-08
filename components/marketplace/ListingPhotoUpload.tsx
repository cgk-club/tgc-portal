"use client";

import { useState, useRef, useCallback } from "react";

interface ListingPhotoUploadProps {
  listingId: string;
  listingTitle: string;
  onComplete: () => void;
  onSkip: () => void;
}

export default function ListingPhotoUpload({
  listingId,
  listingTitle,
  onComplete,
  onSkip,
}: ListingPhotoUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 20;
  const MAX_SIZE = 20 * 1024 * 1024;

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const remaining = MAX_FILES - files.length;
      const valid = newFiles
        .filter((f) => {
          if (!f.type.startsWith("image/")) return false;
          if (f.size > MAX_SIZE) return false;
          return true;
        })
        .slice(0, remaining);

      if (valid.length === 0) return;

      const newPreviews = valid.map((f) => URL.createObjectURL(f));
      setFiles((prev) => [...prev, ...valid]);
      setPreviews((prev) => [...prev, ...newPreviews]);
      setError("");
    },
    [files.length]
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function setAsHero(index: number) {
    if (index === 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
    setPreviews((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  }

  async function handleUpload() {
    if (files.length === 0) return;

    setUploading(true);
    setError("");
    setProgress(`Uploading ${files.length} photo${files.length > 1 ? "s" : ""}...`);

    const formData = new FormData();
    // Add hero first, then the rest
    files.forEach((f) => formData.append("files", f));

    try {
      const res = await fetch(`/api/listings/${listingId}/images`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Upload failed");
      }

      const result = await res.json();

      if (result.errors?.length > 0) {
        console.warn("Some uploads had issues:", result.errors);
      }

      setProgress("");
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setUploading(false);
      setProgress("");
    }
  }

  return (
    <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
      <div className="border-b border-green/10 px-5 py-3">
        <h3 className="font-heading text-sm font-semibold text-green">
          Add Photos
        </h3>
        <p className="text-[10px] text-gray-400 font-body mt-0.5">
          {listingTitle} — Photos make your listing stand out. The first image becomes the hero.
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-green bg-green/5"
              : "border-gray-200 hover:border-green/30"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="text-3xl mb-2 opacity-30">
            {"\ud83d\udcf7"}
          </div>
          <p className="text-sm text-gray-500 font-body">
            Drag and drop images here, or click to browse
          </p>
          <p className="text-[10px] text-gray-400 font-body mt-1">
            Up to {MAX_FILES} images, max 20MB each. JPG, PNG, WebP.
          </p>
        </div>

        {/* Preview grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative group aspect-square">
                <img
                  src={src}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-full object-cover rounded-md border border-gray-100"
                />
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-gold text-white text-[9px] font-medium px-1.5 py-0.5 rounded font-body">
                    Hero
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-1">
                  {i !== 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAsHero(i);
                      }}
                      className="text-[10px] bg-white/90 text-green px-2 py-1 rounded font-body font-medium"
                    >
                      Set hero
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    className="text-[10px] bg-white/90 text-red-600 px-2 py-1 rounded font-body font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Counter */}
        {files.length > 0 && (
          <p className="text-xs text-gray-400 font-body">
            {files.length} / {MAX_FILES} photos selected
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 font-body bg-red-50 px-3 py-2 rounded">
            {error}
          </p>
        )}

        {/* Progress */}
        {progress && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-green/30 border-t-green rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-body">{progress}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="px-5 py-2.5 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50"
          >
            {uploading
              ? "Uploading..."
              : files.length > 0
              ? `Upload ${files.length} photo${files.length > 1 ? "s" : ""}`
              : "Select photos first"}
          </button>
          <button
            onClick={onSkip}
            disabled={uploading}
            className="px-5 py-2.5 border border-green/20 text-green text-sm font-medium rounded-md hover:bg-green/5 transition-colors font-body disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>

        <p className="text-[10px] text-gray-400 font-body">
          You can always add or change photos later. We may also reach out to help curate the best images for your listing.
        </p>
      </div>
    </div>
  );
}
