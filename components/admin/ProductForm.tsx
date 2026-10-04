"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { compressImage } from "@/lib/image-client";
import type { StoredCatalog, StoredProduct } from "@/lib/products";
import AdmIcon from "./AdmIcons";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function newCode(category: string, taken: Set<string>): string {
  const prefix = (category.replace(/[^a-z]/gi, "").slice(0, 3) || "PRD").toUpperCase().padEnd(3, "X");
  for (;;) {
    let suffix = "";
    for (let i = 0; i < 4; i++) suffix += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    const code = `${prefix}-${suffix}`;
    if (!taken.has(code)) return code;
  }
}

export default function ProductForm({
  initial,
  defaultCategory,
  catalog,
  saving,
  onSave,
  onCancel,
}: {
  initial: StoredProduct | null;
  defaultCategory?: string;
  catalog: StoredCatalog;
  saving: boolean;
  onSave: (product: StoredProduct) => Promise<void>;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState(initial?.category ?? defaultCategory ?? catalog.categories[0].id);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [specs, setSpecs] = useState((initial?.specs ?? []).join("\n"));
  const [image, setImage] = useState(initial?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [broken, setBroken] = useState<string | null>(null);

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
      setImage(data.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!title.trim()) return setError("Please enter a title.");
    if (!image.trim()) return setError("Please upload a photo or paste an image link.");
    const taken = new Set(catalog.products.map((p) => p.id));
    await onSave({
      id: initial?.id ?? newCode(category, taken),
      category,
      title: title.trim(),
      description: description.trim(),
      specs: specs.split("\n").map((s) => s.trim()).filter(Boolean),
      image: image.trim(),
    });
  }

  return (
    <form className="adm-form" onSubmit={onSubmit}>
      <div className="adm-form-cols">
        <div className="adm-form-main">
          <label className="adm-field">
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {catalog.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field">
            <span>Title</span>
            <input value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Royal Tufted King Bed" required autoFocus />
          </label>
          <label className="adm-field">
            <span>Description</span>
            <textarea value={description} maxLength={400} rows={3} onChange={(e) => setDescription(e.target.value)} placeholder="One or two sentences customers will read." />
          </label>
          <label className="adm-field">
            <span>Details (one per line, sent on WhatsApp)</span>
            <textarea value={specs} rows={4} onChange={(e) => setSpecs(e.target.value)} placeholder={"King size\nSolid wood frame\nWalnut finish"} />
          </label>
        </div>

        <div className="adm-form-side">
          <span className="adm-label">Photo</span>
          <div className="adm-photo-preview">
            {image && broken !== image ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin preview
              <img src={image} alt="Preview" onError={() => setBroken(image)} />
            ) : image ? (
              <span className="adm-muted">This photo link could not be loaded. Check the link or upload the photo instead.</span>
            ) : (
              <span className="adm-muted">
                <AdmIcon name="image" className="adm-photo-empty" />
                No photo yet
              </span>
            )}
          </div>
          <label className="adm-btn adm-btn-block adm-upload">
            <AdmIcon name="plus" />
            {uploading ? "Uploading…" : "Upload a photo"}
            <input type="file" accept="image/*" onChange={onFile} disabled={uploading} hidden />
          </label>
          <label className="adm-field">
            <span>or paste an image link</span>
            <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" inputMode="url" />
          </label>
        </div>
      </div>

      {error && (
        <p className="adm-alert adm-alert-error" role="alert">
          {error}
        </p>
      )}
      <div className="adm-form-actions">
        <button type="button" className="adm-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="adm-btn adm-btn-primary" disabled={saving || uploading}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add product"}
        </button>
      </div>
    </form>
  );
}
