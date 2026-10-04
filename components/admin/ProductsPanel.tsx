"use client";

import { useState } from "react";
import type { StoredCatalog, StoredProduct } from "@/lib/products";
import type { Actions } from "./actions";
import AdmIcon from "./AdmIcons";

export default function ProductsPanel({
  catalog,
  saving,
  actions,
  onAdd,
  onEdit,
  onDelete,
}: {
  catalog: StoredCatalog;
  saving: boolean;
  actions: Actions;
  onAdd: (category?: string) => void;
  onEdit: (product: StoredProduct) => void;
  onDelete: (product: StoredProduct) => void;
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const label = (id: string) => catalog.categories.find((c) => c.id === id)?.label ?? id;
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  const list = catalog.products.filter(
    (p) =>
      (filter === "all" || p.category === filter) &&
      words.every((w) => `${p.title} ${p.id} ${label(p.category)}`.toLowerCase().includes(w)),
  );

  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        <label className="adm-search">
          <AdmIcon name="search" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" aria-label="Search products" />
        </label>
        <label className="adm-inline">
          <span>Category</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All categories</option>
            {catalog.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="adm-btn adm-btn-primary adm-push" onClick={() => onAdd(filter === "all" ? undefined : filter)}>
          <AdmIcon name="plus" /> Add product
        </button>
      </div>

      {list.length === 0 ? (
        <p className="adm-empty">
          {catalog.products.length === 0 ? "No products yet. Click “Add product” to create the first one." : "No products match your search."}
        </p>
      ) : (
        <div className="adm-table adm-table-products">
          <div className="adm-tr adm-th">
            <span>Photo</span>
            <span>Product</span>
            <span className="adm-hide-sm">Category</span>
            <span className="adm-th-actions">Actions</span>
          </div>
          {list.map((product) => {
            const siblings = catalog.products.filter((p) => p.category === product.category);
            const at = siblings.findIndex((p) => p.id === product.id);
            return (
              <div className="adm-tr" key={product.id}>
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                <img className="adm-thumb" src={product.image} alt="" loading="lazy" />
                <span className="adm-cell-main">
                  <strong>{product.title}</strong>
                  <small>
                    <span className="adm-show-sm">{label(product.category)} · </span>
                    {product.id}
                  </small>
                </span>
                <span className="adm-hide-sm">
                  <span className="adm-chip">{label(product.category)}</span>
                </span>
                <span className="adm-actions">
                  <button type="button" className="adm-iconbtn" aria-label="Move up" title="Move up" disabled={saving || at === 0} onClick={() => actions.moveProduct(product, -1)}>
                    <AdmIcon name="up" />
                  </button>
                  <button
                    type="button"
                    className="adm-iconbtn"
                    aria-label="Move down"
                    title="Move down"
                    disabled={saving || at === siblings.length - 1}
                    onClick={() => actions.moveProduct(product, 1)}
                  >
                    <AdmIcon name="down" />
                  </button>
                  <a className="adm-iconbtn" href={`/p/${product.id}`} target="_blank" rel="noopener noreferrer" aria-label="View on website" title="View on website">
                    <AdmIcon name="eye" />
                  </a>
                  <button type="button" className="adm-iconbtn" aria-label="Edit" title="Edit" disabled={saving} onClick={() => onEdit(product)}>
                    <AdmIcon name="edit" />
                  </button>
                  <button type="button" className="adm-iconbtn adm-iconbtn-danger" aria-label="Delete" title="Delete" disabled={saving} onClick={() => onDelete(product)}>
                    <AdmIcon name="trash" />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
