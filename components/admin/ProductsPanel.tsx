"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { compressImage } from "@/lib/image-client";
import type { StoredCatalog, StoredProduct } from "@/lib/products";
import type { Commit } from "./AdminApp";

type Props = { catalog: StoredCatalog; commit: Commit; saving: boolean };

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

export default function ProductsPanel({ catalog, commit, saving }: Props) {
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<StoredProduct | "new" | null>(null);
  const label = (id: string) => catalog.categories.find((c) => c.id === id)?.label ?? id;
  const list = catalog.products.filter((p) => filter === "all" || p.category === filter);

  async function save(product: StoredProduct) {
    const exists = catalog.products.some((p) => p.id === product.id);
    const products = exists
      ? catalog.products.map((p) => (p.id === product.id ? product : p))
      : [...catalog.products, product];
    const ok = await commit({ ...catalog, products }, exists ? "Product updated." : "Product added.");
    if (ok) setEditing(null);
  }

  async function remove(product: StoredProduct) {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    await commit({ ...catalog, products: catalog.products.filter((p) => p.id !== product.id) }, "Product deleted.");
  }

  async function move(product: StoredProduct, direction: -1 | 1) {
    const siblings = catalog.products.filter((p) => p.category === product.category);
    const at = siblings.findIndex((p) => p.id === product.id);
    const other = siblings[at + direction];
    if (!other) return;
    const products = [...catalog.products];
    const a = products.findIndex((p) => p.id === product.id);
    const b = products.findIndex((p) => p.id === other.id);
    [products[a], products[b]] = [products[b], products[a]];
    await commit({ ...catalog, products }, "Order updated.");
  }

  if (editing) {
    return (
      <ProductForm
        key={editing === "new" ? "new" : editing.id}
        initial={editing === "new" ? null : editing}
        catalog={catalog}
        saving={saving}
        onSave={save}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <section>
      <div className="adm-toolbar">
        <label className="adm-inline">
          <span>Show</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All categories</option>
            {catalog.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-wa btn-sm" onClick={() => setEditing("new")}>
          + Add product
        </button>
      </div>

      {list.length === 0 ? (
        <p className="adm-empty">No products here yet. Click &ldquo;Add product&rdquo; to create the first one.</p>
      ) : (
        <ul className="adm-list">
          {list.map((product) => {
            const siblings = catalog.products.filter((p) => p.category === product.category);
            const at = siblings.findIndex((p) => p.id === product.id);
            return (
              <li className="adm-row" key={product.id}>
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                <img className="adm-thumb" src={product.image} alt="" loading="lazy" />
                <div className="adm-row-main">
                  <strong>{product.title}</strong>
                  <span className="adm-muted">
                    {label(product.category)} · {product.id}
                  </span>
                </div>
                <div className="adm-row-actions">
                  <button type="button" className="adm-icon" aria-label="Move up" disabled={saving || at === 0} onClick={() => move(product, -1)}>
                    ↑
                  </button>
                  <button
                    type="button"
                    className="adm-icon"
                    aria-label="Move down"
                    disabled={saving || at === siblings.length - 1}
                    onClick={() => move(product, 1)}
                  >
                    ↓
                  </button>
                  <a className="adm-btn" href={`/p/${product.id}`} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                  <button type="button" className="adm-btn" disabled={saving} onClick={() => setEditing(product)}>
                    Edit
                  </button>
                  <button type="button" className="adm-btn adm-btn-danger" disabled={saving} onClick={() => remove(product)}>
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ProductForm({
  initial,
  catalog,
  saving,
  onSave,
  onCancel,
}: {
  initial: StoredProduct | null;
  catalog: StoredCatalog;
  saving: boolean;
  onSave: (product: StoredProduct) => Promise<void>;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState(initial?.category ?? catalog.categories[0].id);
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
      <h2>{initial ? `Edit ${initial.title}` : "Add a product"}</h2>
      <div className="adm-grid">
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
          <input value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Royal Tufted King Bed" required />
        </label>
      </div>
      <label className="adm-field">
        <span>Description</span>
        <textarea value={description} maxLength={400} rows={3} onChange={(e) => setDescription(e.target.value)} placeholder="One or two sentences customers will read." />
      </label>
      <label className="adm-field">
        <span>Details (one per line, sent on WhatsApp)</span>
        <textarea value={specs} rows={4} onChange={(e) => setSpecs(e.target.value)} placeholder={"King size\nSolid wood frame\nWalnut finish"} />
      </label>

      <div className="adm-field">
        <span>Photo</span>
        <div className="adm-photo">
          <div className="adm-photo-preview">
            {image && broken !== image ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin preview
              <img src={image} alt="Preview" onError={() => setBroken(image)} />
            ) : image ? (
              <span className="adm-muted">This photo link could not be loaded. Check the link or upload the photo instead.</span>
            ) : (
              <span className="adm-muted">No photo yet</span>
            )}
          </div>
          <div className="adm-photo-controls">
            <label className="btn btn-outline btn-sm adm-upload">
              {uploading ? "Uploading…" : "Upload a photo"}
              <input type="file" accept="image/*" onChange={onFile} disabled={uploading} hidden />
            </label>
            <label className="adm-field adm-field-tight">
              <span>or paste an image link</span>
              <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" inputMode="url" />
            </label>
          </div>
        </div>
      </div>

      {error && (
        <p className="adm-alert adm-alert-error" role="alert">
          {error}
        </p>
      )}
      <div className="adm-form-actions">
        <button type="submit" className="btn btn-wa" disabled={saving || uploading}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add product"}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
