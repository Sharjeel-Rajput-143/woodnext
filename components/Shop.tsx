"use client";

import {
  CATEGORIES,
  categoryLabel,
  productsByCategory,
  searchProducts,
  sortProducts,
  type SortKey,
} from "@/lib/products";
import { CategoryIcon, WhatsAppIcon } from "./Icons";
import ProductCard from "./ProductCard";
import { useShop } from "./ShopProvider";
import WhatsAppLink from "./WhatsAppLink";

const PANEL_ID = "shop-panel";

export default function Shop() {
  const { category, select, query, setQuery, sort, setSort } = useShop();
  const searching = query.trim().length > 0;

  const list = searching ? searchProducts(query) : productsByCategory(category);
  const products = sortProducts(list, sort);
  const heading = searching ? `Results for “${query.trim()}”` : categoryLabel(category);

  return (
    <section className="section" id="shop">
      <div className="container shop">
        <aside className="filters" aria-label="Filter designs">
          <h2 className="filters-title">Categories</h2>
          <ul className="filter-list">
            {CATEGORIES.map((c) => {
              const active = !searching && c.id === category;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`filter${active ? " is-active" : ""}`}
                    aria-pressed={active}
                    aria-controls={PANEL_ID}
                    onClick={() => select(c.id)}
                  >
                    <CategoryIcon id={c.id} className="filter-icon" />
                    <span className="filter-name">{c.label}</span>
                    <span className="filter-count">{productsByCategory(c.id).length}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="help-card">
            <p className="help-title">Need something custom?</p>
            <p className="help-text">Send us your size or a photo and we&rsquo;ll build it.</p>
            <WhatsAppLink className="btn btn-wa btn-sm btn-block">
              <WhatsAppIcon className="btn-icon" />
              Ask on WhatsApp
            </WhatsAppLink>
          </div>
        </aside>

        <div className="shop-main">
          <div className="toolbar">
            <div>
              <h2 className="toolbar-title">{heading}</h2>
              <p className="toolbar-count" role="status">
                {products.length} {products.length === 1 ? "design" : "designs"}
              </p>
            </div>
            <label className="sort">
              <span className="sort-label">Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                <option value="featured">Featured</option>
                <option value="az">Name: A to Z</option>
                <option value="za">Name: Z to A</option>
              </select>
            </label>
          </div>

          <div id={PANEL_ID} aria-label={heading}>
            {products.length > 0 ? (
              <div className="product-grid" key={`${searching ? `q:${query.trim()}` : category}:${sort}`}>
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            ) : (
              <div className="empty">
                <h3>No designs match “{query.trim()}”</h3>
                <p>Tell us what you need on WhatsApp and we&rsquo;ll make it for you.</p>
                <div className="empty-actions">
                  <WhatsAppLink className="btn btn-wa">
                    <WhatsAppIcon className="btn-icon" />
                    Ask on WhatsApp
                  </WhatsAppLink>
                  <button type="button" className="btn btn-outline" onClick={() => setQuery("")}>
                    Clear search
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
