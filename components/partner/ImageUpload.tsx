"use client";

import { useState, useRef, useCallback } from "react";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const MAX_DIM = 1600;
      let width = img.width;
      let height = img.height;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Compression failed"));
          }
        },
        "image/jpeg",
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file.");
        return;
      }

      setUploading(true);
      setError("");

      try {
        const compressed = await compressImage(file);

        const formData = new FormData();
        formData.append(
          "file",
          new File([compressed], file.name.replace(/\.[^.]+$/, ".jpg"), {
            type: "image/jpeg",
          })
        );

        const res = await fetch("/api/partner/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Upload failed");
        }

        const { url } = await res.json();
        onChange(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      {label && (
        <label className="block text-xs text-gray-500 font-body mb-1">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-green/10 bg-white">
          <img
            src={value}
            alt="Uploaded image"
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-2 py-1 text-[10px] bg-white/90 text-green rounded shadow hover:bg-white transition-colors font-body"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-2 py-1 text-[10px] bg-white/90 text-red-500 rounded shadow hover:bg-white transition-colors font-body"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-green bg-green/5"
              : "border-green/20 hover:border-green/40 bg-white"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-green/30 border-t-green rounded-full animate-spin" />
              <p className="text-xs text-gray-400 font-body">
                Compressing and uploading...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg
                className="w-8 h-8 text-green/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-xs text-gray-500 font-body">
                Drag and drop an image, or{" "}
                <span className="text-green font-medium">browse</span>
              </p>
              <p className="text-[10px] text-gray-400 font-body">
                JPG, PNG, HEIC. Max 1600px, auto-compressed.
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-500 font-body mt-1">{error}</p>
      )}
    </div>
  );
}
