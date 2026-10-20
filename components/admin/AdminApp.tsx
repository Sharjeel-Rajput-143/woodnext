"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { StorageMode } from "@/lib/catalog";
import type { Category, StoredCatalog, StoredProduct, Video } from "@/lib/products";
import { LogoMark } from "../Icons";
import ThemeToggle from "../ThemeToggle";
import { createActions } from "./actions";
import AccountPanel from "./AccountPanel";
import AdmIcon, { type AdmIconName } from "./AdmIcons";
import CategoriesPanel from "./CategoriesPanel";
import CategoryForm from "./CategoryForm";
import DashboardPanel, { type View } from "./DashboardPanel";
import Modal from "./Modal";
import ProductDetail from "./ProductDetail";
import ProductForm from "./ProductForm";
import ProductsPanel from "./ProductsPanel";
import VideoForm from "./VideoForm";
import VideosPanel from "./VideosPanel";

type Toast = { kind: "ok" | "error"; text: string } | null;
type Editor =
  | { kind: "product"; item: StoredProduct | null; category?: string }
  | { kind: "category"; item: Category | null }
  | { kind: "video"; item: Video | null }
  | null;
type Confirm = { title: string; message: string; run: () => Promise<boolean> } | null;

export type Commit = (next: StoredCatalog, successText: string) => Promise<boolean>;

const NAV: { id: View; label: string; icon: AdmIconName }[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "products", label: "Products", icon: "products" },
  { id: "categories", label: "Categories", icon: "categories" },
  { id: "videos", label: "Videos", icon: "videos" },
];

const SETTINGS_NAV: { id: View; label: string; icon: AdmIconName }[] = [{ id: "account", label: "Account", icon: "key" }];

const HEAD: Record<View, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Overview of your website" },
  products: { title: "Products", subtitle: "Add, edit and re-order your designs" },
  categories: { title: "Categories & navigation", subtitle: "These are the tabs on your website" },
  videos: { title: "Videos", subtitle: "YouTube videos shown on your website" },
  account: { title: "Account", subtitle: "Change your password and set up a recovery key" },
};

/** The owner's control panel: sidebar, header and pages for products, categories (navigation) and videos. */
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
  const [view, setView] = useState<View>("dashboard");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [editor, setEditor] = useState<Editor>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);

  // Success messages hide themselves; errors stay until dismissed.
  useEffect(() => {
    if (toast?.kind !== "ok") return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = setToast;
  const goToLogin = useCallback(() => router.replace("/admin/login"), [router]);

  const commit: Commit = async (next, successText) => {
    setSaving(true);
    showToast(null);
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
        showToast({ kind: "error", text: data.error ?? "Could not save. Please try again." });
        return false;
      }
      setCatalog(data.catalog);
      if (data.mode) setMode(data.mode);
      showToast({ kind: "ok", text: successText });
      return true;
    } catch {
      showToast({ kind: "error", text: "Network error. Please try again." });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const actions = createActions(catalog, commit);

  function open(next: View) {
    setView(next);
    setDetailId(null);
    setMenuOpen(false);
    showToast(null);
  }

  function openProduct(id: string) {
    setView("products");
    setDetailId(id);
    setMenuOpen(false);
    showToast(null);
  }

  function add(kind: "product" | "category" | "video", category?: string) {
    setMenuOpen(false);
    if (kind === "product") setEditor({ kind, item: null, category });
    else if (kind === "category") setEditor({ kind, item: null });
    else setEditor({ kind, item: null });
  }

  function ask(title: string, message: string, run: () => Promise<boolean>) {
    setConfirm({ title, message, run });
  }

  const askDeleteProduct = (p: StoredProduct) =>
    ask("Delete product", `Delete “${p.title}”? This cannot be undone.`, async () => {
      const ok = await actions.removeProduct(p.id);
      if (ok) setDetailId(null);
      return ok;
    });
  const askDeleteCategory = (c: Category) => {
    const n = catalog.products.filter((p) => p.category === c.id).length;
    ask(
      "Delete category",
      n
        ? `Delete “${c.label}” and its ${n} product${n === 1 ? "" : "s"}? This cannot be undone.`
        : `Delete “${c.label}” from the navigation?`,
      () => actions.removeCategory(c.id),
    );
  };
  const askDeleteVideo = (v: Video) =>
    ask("Remove video", `Remove “${v.title}” from the website?`, () => actions.removeVideo(v.id));

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const closeEditor = () => setEditor(null);
  const detail = view === "products" && detailId ? catalog.products.find((p) => p.id === detailId) : undefined;
  const head = detail ? { title: detail.title, subtitle: "Product details" } : HEAD[view];

  return (
    <div className="adm">
      <aside className={`adm-side${menuOpen ? " is-open" : ""}`} aria-label="Admin menu">
        <div className="adm-side-brand">
          <LogoMark className="logo-mark" />
          <span>
            <strong>{brand}</strong>
            <small>Owner panel</small>
          </span>
        </div>

        <nav className="adm-nav" aria-label="Sections">
          <span className="adm-nav-label">Manage</span>
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`adm-nav-item${view === item.id ? " is-active" : ""}`}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => open(item.id)}
            >
              <AdmIcon name={item.icon} />
              <span>{item.label}</span>
              {item.id !== "dashboard" && (
                <span className="adm-nav-count">
                  {item.id === "products" ? catalog.products.length : item.id === "categories" ? catalog.categories.length : catalog.videos.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <nav className="adm-nav" aria-label="Settings">
          <span className="adm-nav-label">Settings</span>
          {SETTINGS_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`adm-nav-item${view === item.id ? " is-active" : ""}`}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => open(item.id)}
            >
              <AdmIcon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="adm-side-foot">
          <a className="adm-nav-item" href="/" target="_blank" rel="noopener noreferrer">
            <AdmIcon name="external" />
            <span>View website</span>
          </a>
          <button type="button" className="adm-nav-item" onClick={logout}>
            <AdmIcon name="logout" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
      {menuOpen && <button type="button" className="adm-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      <div className="adm-content">
        <header className="adm-head">
          <button type="button" className="adm-iconbtn adm-menu" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <AdmIcon name="menu" />
          </button>
          <div className="adm-head-title">
            <h1>{head.title}</h1>
            <p>{head.subtitle}</p>
          </div>
          <div className="adm-head-actions">
            <ThemeToggle />
          </div>
        </header>

        <main className="adm-main">
          {mode === "readonly" && (
            <p className="adm-alert adm-alert-warn">
              Changes can&rsquo;t be saved on this host yet. Add GITHUB_TOKEN in the hosting settings (or connect a database)
              to turn saving on. You can still look around.
            </p>
          )}
          {view === "dashboard" && <DashboardPanel catalog={catalog} mode={mode} go={open} onAdd={(kind) => add(kind)} onOpenProduct={openProduct} />}
          {detail && (
            <ProductDetail
              product={detail}
              catalog={catalog}
              saving={saving}
              onBack={() => setDetailId(null)}
              onEdit={(item) => setEditor({ kind: "product", item })}
              onDelete={askDeleteProduct}
            />
          )}
          {view === "products" && !detail && (
            <ProductsPanel
              catalog={catalog}
              saving={saving}
              actions={actions}
              onAdd={(category) => add("product", category)}
              onOpen={(item) => setDetailId(item.id)}
              onEdit={(item) => setEditor({ kind: "product", item })}
              onDelete={askDeleteProduct}
            />
          )}
          {view === "categories" && (
            <CategoriesPanel
              catalog={catalog}
              saving={saving}
              actions={actions}
              onAdd={() => add("category")}
              onEdit={(item) => setEditor({ kind: "category", item })}
              onDelete={askDeleteCategory}
            />
          )}
          {view === "account" && <AccountPanel mode={mode} onSignedOut={goToLogin} notify={showToast} />}
          {view === "videos" && (
            <VideosPanel
              catalog={catalog}
              saving={saving}
              actions={actions}
              onAdd={() => add("video")}
              onEdit={(item) => setEditor({ kind: "video", item })}
              onDelete={askDeleteVideo}
            />
          )}
        </main>
      </div>

      {editor?.kind === "product" && (
        <Modal title={editor.item ? "Edit product" : "Add a product"} onClose={closeEditor}>
          <ProductForm
            initial={editor.item}
            defaultCategory={editor.category}
            catalog={catalog}
            saving={saving}
            onSave={async (product) => {
              if (await actions.saveProduct(product)) closeEditor();
            }}
            onCancel={closeEditor}
          />
        </Modal>
      )}
      {editor?.kind === "category" && (
        <Modal title={editor.item ? "Edit category" : "Add a category"} onClose={closeEditor} size="sm">
          <CategoryForm
            initial={editor.item}
            catalog={catalog}
            saving={saving}
            onSave={async (category) => {
              if (await actions.saveCategory(category)) closeEditor();
            }}
            onCancel={closeEditor}
          />
        </Modal>
      )}
      {editor?.kind === "video" && (
        <Modal title={editor.item ? "Edit video" : "Add a video"} onClose={closeEditor} size="sm">
          <VideoForm
            initial={editor.item}
            catalog={catalog}
            saving={saving}
            onSave={async (video) => {
              if (await actions.saveVideo(video)) closeEditor();
            }}
            onCancel={closeEditor}
          />
        </Modal>
      )}

      {confirm && (
        <Modal title={confirm.title} onClose={() => setConfirm(null)} size="sm">
          <div className="adm-form">
            <p>{confirm.message}</p>
            <div className="adm-form-actions">
              <button type="button" className="adm-btn" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-danger-solid"
                disabled={saving}
                onClick={async () => {
                  await confirm.run();
                  setConfirm(null);
                }}
              >
                {saving ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div className={`adm-toast adm-toast-${toast.kind}`} role="status">
          <AdmIcon name={toast.kind === "ok" ? "check" : "close"} />
          <span>
            {toast.text}
            {toast.kind === "error" && toast.text.includes("Reload") && (
              <>
                {" "}
                <button type="button" className="adm-link" onClick={() => window.location.reload()}>
                  Reload now
                </button>
              </>
            )}
          </span>
          <button type="button" className="adm-toast-close" aria-label="Dismiss" onClick={() => setToast(null)}>
            <AdmIcon name="close" />
          </button>
        </div>
      )}
    </div>
  );
}
