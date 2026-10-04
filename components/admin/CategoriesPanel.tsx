"use client";

import { useState, type FormEvent } from "react";
import { ICONS, slugify, type Category, type IconName, type StoredCatalog } from "@/lib/products";
import { CategoryIcon } from "../Icons";
import type { Commit } from "./AdminApp";

type Props = { catalog: StoredCatalog; commit: Commit; saving: boolean };

function uniqueId(base: string, taken: Set<string>): string {
  const root = slugify(base) || "category";
  let id = root;
  for (let n = 2; taken.has(id); n++) id = `${root}-${n}`.slice(0, 24);
  return id;
}

/** Categories are the site navigation: the navbar, hero tabs, category tiles, filters and footer all follow this list. */
export default function CategoriesPanel({ catalog, commit, saving }: Props) {
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const count = (id: string) => catalog.products.filter((p) => p.category === id).length;

  async function save(category: Category) {
    const exists = catalog.categories.some((c) => c.id === category.id);
    const categories = exists
      ? catalog.categories.map((c) => (c.id === category.id ? category : c))
      : [...catalog.categories, category];
    const ok = await commit({ ...catalog, categories }, exists ? "Category updated." : "Category added to the navigation.");
    if (ok) setEditing(null);
  }

  async function remove(category: Category) {
    const n = count(category.id);
    const warning = n
      ? `Delete "${category.label}" and its ${n} product${n === 1 ? "" : "s"}? This cannot be undone.`
      : `Delete "${category.label}"?`;
    if (!window.confirm(warning)) return;
    await commit(
      {
        ...catalog,
        categories: catalog.categories.filter((c) => c.id !== category.id),
        products: catalog.products.filter((p) => p.category !== category.id),
      },
      "Category removed from the navigation.",
    );
  }

  async function move(index: number, direction: -1 | 1) {
    const categories = [...catalog.categories];
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    [categories[index], categories[target]] = [categories[target], categories[index]];
    await commit({ ...catalog, categories }, "Navigation order updated.");
  }

  if (editing) {
    return (
      <CategoryForm
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
        <p className="adm-muted">
          These are the tabs on your website (navbar, hero, category tiles, footer). Add one, such as &ldquo;Chairs&rdquo;,
          and it appears everywhere with its own products.
        </p>
        <button type="button" className="btn btn-wa btn-sm" onClick={() => setEditing("new")}>
          + Add category
        </button>
      </div>
      <ul className="adm-list">
        {catalog.categories.map((category, index) => (
          <li className="adm-row" key={category.id}>
            <span className="adm-cat-icon">
              <CategoryIcon icon={category.icon} />
            </span>
            <div className="adm-row-main">
              <strong>{category.label}</strong>
              <span className="adm-muted">
                Navbar: {category.name} · {count(category.id)} product{count(category.id) === 1 ? "" : "s"}
              </span>
            </div>
            <div className="adm-row-actions">
              <button type="button" className="adm-icon" aria-label="Move up" disabled={saving || index === 0} onClick={() => move(index, -1)}>
                ↑
              </button>
              <button
                type="button"
                className="adm-icon"
                aria-label="Move down"
                disabled={saving || index === catalog.categories.length - 1}
                onClick={() => move(index, 1)}
              >
                ↓
              </button>
              <button type="button" className="adm-btn" disabled={saving} onClick={() => setEditing(category)}>
                Edit
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-danger"
                disabled={saving || catalog.categories.length <= 1}
                title={catalog.categories.length <= 1 ? "Keep at least one category" : undefined}
                onClick={() => remove(category)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CategoryForm({
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
    await onSave({
      id: initial?.id ?? uniqueId(name, taken),
      name: name.trim(),
      label: label.trim(),
      icon,
    });
  }

  return (
    <form className="adm-form" onSubmit={onSubmit}>
      <h2>{initial ? `Edit ${initial.label}` : "Add a category"}</h2>
      <div className="adm-grid">
        <label className="adm-field">
          <span>Navbar name</span>
          <input
            value={name}
            maxLength={24}
            onChange={(e) => {
              setName(e.target.value);
              if (!initial && !label.trim()) setLabel("");
            }}
            onBlur={() => {
              if (!initial && !label.trim() && name.trim()) setLabel(`${name.trim()} Designs`);
            }}
            placeholder="e.g. Chairs"
            required
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
        <button type="submit" className="btn btn-wa" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add category"}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
