"use client";

import type { Category, StoredCatalog } from "@/lib/products";
import { CategoryIcon } from "../Icons";
import type { Actions } from "./actions";
import AdmIcon from "./AdmIcons";

/** Categories are the site navigation: the navbar, hero tabs, category tiles, filters and footer all follow this list. */
export default function CategoriesPanel({
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
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  const count = (id: string) => catalog.products.filter((p) => p.category === id).length;

  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        <p className="adm-muted adm-toolbar-note">
          These are the tabs on your website. Add one, such as &ldquo;Chairs&rdquo;, and it appears everywhere with its own products.
        </p>
        <button type="button" className="adm-btn adm-btn-primary adm-push" onClick={onAdd}>
          <AdmIcon name="plus" /> Add category
        </button>
      </div>

      <div className="adm-table adm-table-categories">
        <div className="adm-tr adm-th">
          <span>Icon</span>
          <span>Category</span>
          <span className="adm-hide-sm">Products</span>
          <span className="adm-th-actions">Actions</span>
        </div>
        {catalog.categories.map((category, index) => (
          <div className="adm-tr" key={category.id}>
            <span className="adm-cat-icon">
              <CategoryIcon icon={category.icon} />
            </span>
            <span className="adm-cell-main">
              <strong>{category.label}</strong>
              <small>
                Navbar: {category.name}
                <span className="adm-show-sm">
                  {" "}
                  · {count(category.id)} product{count(category.id) === 1 ? "" : "s"}
                </span>
              </small>
            </span>
            <span className="adm-hide-sm">
              <span className="adm-chip">{count(category.id)}</span>
            </span>
            <span className="adm-actions">
              <button type="button" className="adm-iconbtn" aria-label="Move up" title="Move up" disabled={saving || index === 0} onClick={() => actions.moveCategory(index, -1)}>
                <AdmIcon name="up" />
              </button>
              <button
                type="button"
                className="adm-iconbtn"
                aria-label="Move down"
                title="Move down"
                disabled={saving || index === catalog.categories.length - 1}
                onClick={() => actions.moveCategory(index, 1)}
              >
                <AdmIcon name="down" />
              </button>
              <button type="button" className="adm-iconbtn" aria-label="Edit" title="Edit" disabled={saving} onClick={() => onEdit(category)}>
                <AdmIcon name="edit" />
              </button>
              <button
                type="button"
                className="adm-iconbtn adm-iconbtn-danger"
                aria-label="Delete"
                title={catalog.categories.length <= 1 ? "Keep at least one category" : "Delete"}
                disabled={saving || catalog.categories.length <= 1}
                onClick={() => onDelete(category)}
              >
                <AdmIcon name="trash" />
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
