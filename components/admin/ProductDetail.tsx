"use client";

import type { StoredCatalog, StoredProduct } from "@/lib/products";
import imageLoader from "@/lib/image-loader";
import AdmIcon from "./AdmIcons";

/** One product's full details, shown inside the admin panel with its edit and delete actions. */
export default function ProductDetail({
  product,
  catalog,
  saving,
  onBack,
  onEdit,
  onDelete,
}: {
  product: StoredProduct;
  catalog: StoredCatalog;
  saving: boolean;
  onBack: () => void;
  onEdit: (product: StoredProduct) => void;
  onDelete: (product: StoredProduct) => void;
}) {
  const category = catalog.categories.find((c) => c.id === product.category);
  const siblings = catalog.products.filter((p) => p.category === product.category);
  const position = siblings.findIndex((p) => p.id === product.id) + 1;

  return (
    <div className="adm-stack">
      <div className="adm-toolbar">
        <button type="button" className="adm-btn" onClick={onBack}>
          <AdmIcon name="back" /> All products
        </button>
        <span className="adm-push adm-actions">
          <button type="button" className="adm-btn" disabled={saving} onClick={() => onEdit(product)}>
            <AdmIcon name="edit" /> Edit
          </button>
          <button type="button" className="adm-btn adm-btn-danger-solid" disabled={saving} onClick={() => onDelete(product)}>
            <AdmIcon name="trash" /> Delete
          </button>
        </span>
      </div>

      <section className="adm-card adm-detail">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
        <img className="adm-detail-photo" src={imageLoader({ src: product.image, width: 900 })} alt={product.title} />
        <div className="adm-detail-body">
          <span className="adm-chip">{category?.label ?? product.category}</span>
          <h2>{product.title}</h2>
          <p className="adm-muted">{product.description || "No description."}</p>

          {product.specs.length > 0 && (
            <>
              <h3 className="adm-card-title">Details</h3>
              <ul className="adm-detail-specs">
                {product.specs.map((spec) => (
                  <li key={spec}>
                    <AdmIcon name="check" /> {spec}
                  </li>
                ))}
              </ul>
            </>
          )}

          <dl className="adm-detail-meta">
            <div>
              <dt>Product ID</dt>
              <dd>{product.id}</dd>
            </div>
            <div>
              <dt>Position</dt>
              <dd>
                {position} of {siblings.length} in {category?.label ?? product.category}
              </dd>
            </div>
          </dl>

          <a className="adm-link" href={`/p/${product.id}`} target="_blank" rel="noopener noreferrer">
            Preview on website ↗
          </a>
        </div>
      </section>
    </div>
  );
}
