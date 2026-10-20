"use client";

import type { StorageMode } from "@/lib/catalog";
import type { StoredCatalog } from "@/lib/products";
import { youtubeThumb } from "@/lib/youtube";
import imageLoader from "@/lib/image-loader";
import AdmIcon, { type AdmIconName } from "./AdmIcons";

export type View = "dashboard" | "products" | "categories" | "videos" | "website" | "account";

const STORAGE_TEXT: Record<StorageMode, { title: string; text: string }> = {
  github: {
    title: "Saving to GitHub",
    text: "Every change you save is stored in your GitHub project. The live website updates about a minute after each save.",
  },
  file: {
    title: "Saving to this computer",
    text: "Changes are written to the project's data file on this computer and show on the website straight away.",
  },
  readonly: {
    title: "Read-only",
    text: "Changes can't be saved on this host yet. Add GITHUB_TOKEN in the hosting settings to turn saving on.",
  },
};

export default function DashboardPanel({
  catalog,
  mode,
  go,
  onAdd,
  onOpenProduct,
}: {
  catalog: StoredCatalog;
  mode: StorageMode;
  go: (view: View) => void;
  onAdd: (kind: "product" | "category" | "video") => void;
  onOpenProduct: (id: string) => void;
}) {
  const counts = catalog.categories.map((c) => ({
    category: c,
    count: catalog.products.filter((p) => p.category === c.id).length,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));
  const recent = [...catalog.products].reverse().slice(0, 5);
  const label = (id: string) => catalog.categories.find((c) => c.id === id)?.label ?? id;
  const storage = STORAGE_TEXT[mode];

  const stats: { icon: AdmIconName; value: number; label: string; view: View }[] = [
    { icon: "products", value: catalog.products.length, label: "Products", view: "products" },
    { icon: "categories", value: catalog.categories.length, label: "Categories", view: "categories" },
    { icon: "videos", value: catalog.videos.length, label: "Videos", view: "videos" },
  ];

  return (
    <div className="adm-stack">
      <section className="adm-card adm-welcome">
        <div>
          <h2>Welcome back 👋</h2>
          <p className="adm-muted">Add new designs, change your website tabs and share your videos from here.</p>
        </div>
        <div className="adm-quick">
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => onAdd("product")}>
            <AdmIcon name="plus" /> Add product
          </button>
          <button type="button" className="adm-btn" onClick={() => onAdd("category")}>
            <AdmIcon name="plus" /> Add category
          </button>
          <button type="button" className="adm-btn" onClick={() => onAdd("video")}>
            <AdmIcon name="plus" /> Add video
          </button>
        </div>
      </section>

      <div className="adm-stats">
        {stats.map((stat) => (
          <button key={stat.label} type="button" className="adm-card adm-stat" onClick={() => go(stat.view)}>
            <span className="adm-stat-icon">
              <AdmIcon name={stat.icon} />
            </span>
            <span>
              <strong>{stat.value}</strong>
              <small>{stat.label}</small>
            </span>
          </button>
        ))}
        <div className={`adm-card adm-stat adm-stat-${mode}`}>
          <span className="adm-stat-icon">
            <AdmIcon name="cloud" />
          </span>
          <span>
            <strong className="adm-stat-text">{storage.title}</strong>
            <small>Storage</small>
          </span>
        </div>
      </div>

      <div className="adm-grid-2">
        <section className="adm-card">
          <h3 className="adm-card-title">Products by category</h3>
          <ul className="adm-bars">
            {counts.map(({ category, count }) => (
              <li key={category.id}>
                <span className="adm-bar-name">{category.label}</span>
                <span className="adm-bar-track">
                  <span className="adm-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
                </span>
                <span className="adm-bar-count">{count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="adm-card">
          <div className="adm-card-head">
            <h3 className="adm-card-title">Recently added</h3>
            <button type="button" className="adm-link" onClick={() => go("products")}>
              View all
            </button>
          </div>
          {recent.length === 0 ? (
            <p className="adm-muted">No products yet.</p>
          ) : (
            <ul className="adm-recent">
              {recent.map((product) => (
                <li key={product.id}>
                  <button type="button" className="adm-recent-item" onClick={() => onOpenProduct(product.id)}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                    <img src={imageLoader({ src: product.image, width: 160 })} alt="" loading="lazy" />
                    <span>
                      <strong>{product.title}</strong>
                      <small>{label(product.category)}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="adm-grid-2">
        <section className="adm-card">
          <h3 className="adm-card-title">How saving works</h3>
          <p className="adm-muted">{storage.text}</p>
        </section>
        <section className="adm-card">
          <div className="adm-card-head">
            <h3 className="adm-card-title">Latest video</h3>
            <button type="button" className="adm-link" onClick={() => go("videos")}>
              Manage
            </button>
          </div>
          {catalog.videos.length === 0 ? (
            <p className="adm-muted">No videos yet. Upload one to YouTube and paste its link to show it on your website.</p>
          ) : (
            <div className="adm-latest-video">
              {/* eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail */}
              <img src={youtubeThumb(catalog.videos[catalog.videos.length - 1].youtubeId)} alt="" loading="lazy" />
              <strong>{catalog.videos[catalog.videos.length - 1].title}</strong>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
