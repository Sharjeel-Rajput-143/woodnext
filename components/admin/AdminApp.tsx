"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StorageMode } from "@/lib/catalog";
import type { StoredCatalog } from "@/lib/products";
import CategoriesPanel from "./CategoriesPanel";
import ProductsPanel from "./ProductsPanel";
import VideosPanel from "./VideosPanel";

type Tab = "products" | "categories" | "videos";
type Toast = { kind: "ok" | "error"; text: string } | null;

export type Commit = (next: StoredCatalog, successText: string) => Promise<boolean>;

const TABS: { id: Tab; label: string }[] = [
  { id: "products", label: "Products" },
  { id: "categories", label: "Categories & navigation" },
  { id: "videos", label: "Videos" },
];

/** The owner's control panel: add, edit, delete and re-order products, categories and videos. */
export default function AdminApp({
  initialCatalog,
  initialMode,
  brand,
}: {
  initialCatalog: StoredCatalog;
  initialMode: StorageMode;
  brand: string;
}) {
  const router = useRouter();
  const [catalog, setCatalog] = useState(initialCatalog);
  const [mode, setMode] = useState(initialMode);
  const [tab, setTab] = useState<Tab>("products");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const commit: Commit = async (next, successText) => {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalog: next }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        catalog?: StoredCatalog;
        mode?: StorageMode;
      };
      if (res.status === 401) {
        router.replace("/admin/login");
        return false;
      }
      if (!res.ok || !data.catalog) {
        setToast({ kind: "error", text: data.error ?? "Could not save. Please try again." });
        return false;
      }
      setCatalog(data.catalog);
      if (data.mode) setMode(data.mode);
      setToast({ kind: "ok", text: successText });
      return true;
    } catch {
      setToast({ kind: "error", text: "Network error. Please try again." });
      return false;
    } finally {
      setSaving(false);
    }
  };

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="adm">
      <header className="adm-bar">
        <div className="adm-bar-inner">
          <div className="adm-title">
            <strong>{brand}</strong>
            <span>Owner panel</span>
          </div>
          <div className="adm-bar-actions">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              View site
            </a>
            <button type="button" className="btn btn-dark btn-sm" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="adm-main">
        {mode === "readonly" && (
          <p className="adm-alert adm-alert-warn">
            Changes can&rsquo;t be saved on this host yet. Add GITHUB_TOKEN and GITHUB_REPO in the hosting settings (or
            connect a database) to turn saving on. You can still look around.
          </p>
        )}
        {mode === "github" && (
          <p className="adm-alert adm-alert-info">
            Changes are saved to GitHub. The live site updates about a minute after each save.
          </p>
        )}

        <nav className="adm-tabs" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`adm-tab${tab === t.id ? " is-active" : ""}`}
              aria-current={tab === t.id}
              onClick={() => {
                setTab(t.id);
                setToast(null);
              }}
            >
              {t.label}
              <span className="adm-count">
                {t.id === "products" ? catalog.products.length : t.id === "categories" ? catalog.categories.length : catalog.videos.length}
              </span>
            </button>
          ))}
        </nav>

        {toast && (
          <p className={`adm-alert ${toast.kind === "ok" ? "adm-alert-ok" : "adm-alert-error"}`} role="status">
            {toast.text}
            {toast.kind === "error" && toast.text.includes("Reload") && (
              <>
                {" "}
                <button type="button" className="adm-link" onClick={() => window.location.reload()}>
                  Reload now
                </button>
              </>
            )}
          </p>
        )}

        {tab === "products" && <ProductsPanel catalog={catalog} commit={commit} saving={saving} />}
        {tab === "categories" && <CategoriesPanel catalog={catalog} commit={commit} saving={saving} />}
        {tab === "videos" && <VideosPanel catalog={catalog} commit={commit} saving={saving} />}
      </main>
    </div>
  );
}
