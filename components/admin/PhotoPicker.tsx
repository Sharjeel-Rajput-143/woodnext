"use client";

import { useState, type ChangeEvent } from "react";
import { compressImage } from "@/lib/image-client";
import AdmIcon from "./AdmIcons";

/**
 * Choose a photo: upload one from the computer or phone, or paste an image link.
 * `fallback` is the photo the website uses while this is empty (shown as the preview).
 */
export default function PhotoPicker({
  label,
  help,
  value,
  fallback,
  onChange,
  resetLabel = "Use the original photo",
}: {
  label: string;
  help?: string;
  value: string;
  fallback?: string;
  onChange: (value: string) => void;
  resetLabel?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [broken, setBroken] = useState<string | null>(null);
  const shown = value || fallback || "";

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const blob = await compressImage(file);
      const res = await fetch("/api/admin/upload", { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: blob });
      const data = (await res.json().catch(() => ({}))) as { path?: string; error?: string };
      if (!res.ok || !data.path) throw new Error(data.error ?? "Upload failed.");
      onChange(data.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="adm-photo-picker">
      <div className="adm-photo-picker-preview">
        {shown && broken !== shown ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview
          <img src={shown} alt="" onError={() => setBroken(shown)} />
        ) : (
          <span className="adm-muted">
            <AdmIcon name="image" className="adm-photo-empty" />
            {shown ? "This photo could not be loaded" : "No photo"}
          </span>
        )}
        {!value && fallback && <span className="adm-photo-picker-tag">Original</span>}
      </div>
      <div className="adm-photo-picker-body">
        <strong>{label}</strong>
        {help && <p className="adm-muted">{help}</p>}
        <div className="adm-photo-picker-actions">
          <label className="adm-btn adm-upload">
            <AdmIcon name="plus" />
            {uploading ? "Uploading…" : value ? "Change photo" : "Upload a photo"}
            <input type="file" accept="image/*" onChange={onFile} disabled={uploading} hidden />
          </label>
          {value && (
            <button type="button" className="adm-btn" onClick={() => onChange("")}>
              {resetLabel}
            </button>
          )}
        </div>
        <label className="adm-field">
          <span>or paste an image link</span>
          <input value={value} onChange={(e) => onChange(e.target.value.trim())} placeholder="https://…" inputMode="url" />
        </label>
        {error && (
          <p className="adm-alert adm-alert-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
