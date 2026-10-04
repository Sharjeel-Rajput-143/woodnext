"use client";

import { useState, type FormEvent } from "react";
import { ICONS, slugify, type Category, type IconName, type StoredCatalog } from "@/lib/products";
import { CategoryIcon } from "../Icons";

function uniqueId(base: string, taken: Set<string>): string {
  const root = slugify(base) || "category";
  let id = root;
  for (let n = 2; taken.has(id); n++) id = `${root}-${n}`.slice(0, 24);
  return id;
}

export default function CategoryForm({
  initial,
  catalog,
  saving,
  onSave,
  onCancel,
}: {
  initial: Category | null;
  catalog: StoredCatalog;
  saving: boolean;
  onSave: (category: Category) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [icon, setIcon] = useState<IconName>(initial?.icon ?? "tag");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !label.trim()) return setError("Please fill in both names.");
    const taken = new Set(catalog.categories.map((c) => c.id));
    await onSave({ id: initial?.id ?? uniqueId(name, taken), name: name.trim(), label: label.trim(), icon });
  }

  return (
    <form className="adm-form" onSubmit={onSubmit}>
      <p className="adm-muted">
        A category is a tab on your website. It appears in the navbar, hero, category tiles, product filters and footer.
      </p>
      <div className="adm-grid">
        <label className="adm-field">
          <span>Navbar name</span>
          <input
            value={name}
            maxLength={24}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (!initial && !label.trim() && name.trim()) setLabel(`${name.trim()} Designs`);
            }}
            placeholder="e.g. Chairs"
            required
            autoFocus
          />
        </label>
        <label className="adm-field">
          <span>Full title</span>
          <input value={label} maxLength={40} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Chair Designs" required />
        </label>
      </div>
      <div className="adm-field">
        <span>Icon</span>
        <div className="adm-icons" role="radiogroup" aria-label="Icon">
          {ICONS.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={icon === value}
              aria-label={value}
              title={value}
              className={`adm-icon-choice${icon === value ? " is-active" : ""}`}
              onClick={() => setIcon(value)}
            >
              <CategoryIcon icon={value} />
            </button>
          ))}
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
        <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add category"}
        </button>
      </div>
    </form>
  );
}
