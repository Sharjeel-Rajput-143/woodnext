"use client";

import { useEffect, useState } from "react";
import { productsByCategory } from "@/lib/products";
import { CategoryIcon, GridIcon, HeartIcon, HomeIcon, SearchIcon, WhatsAppIcon } from "./Icons";
import { scrollToProducts, useShop } from "./ShopProvider";
import WhatsAppLink from "./WhatsAppLink";

/**
 * Phone navigation: a fixed bar at the bottom of the screen (thumb reach) with five buttons that always fit.
 * "Designs" opens a sheet with every category and the page sections. Hidden on larger screens (the top bar is used there).
 */
export default function BottomNav() {
  const { categories, products, videos, category, select, query, setQuery, searchOpen, setSearchOpen, showSaved, toggleSavedView, savedIds } = useShop();
  const [sheet, setSheet] = useState(false);
  const browsing = !sheet && !searchOpen && !showSaved && !query;

  useEffect(() => {
    if (!sheet) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  function home() {
    setSheet(false);
    setSearchOpen(false);
    if (query) setQuery("");
    if (showSaved) toggleSavedView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function pick(id: string) {
    select(id);
    setSheet(false);
    setSearchOpen(false);
    scrollToProducts();
  }

  return (
    <>
      {sheet && (
        <>
          <button type="button" className="bsheet-scrim" aria-label="Close menu" onClick={() => setSheet(false)} />
          <div className="bsheet" role="dialog" aria-modal="true" aria-label="Browse designs">
            <p className="bsheet-title">Browse designs</p>
            <ul className="bsheet-list">
              {categories.map((c) => (
                <li key={c.id}>
                  <button type="button" className={`bsheet-item${!showSaved && !query && category === c.id ? " is-active" : ""}`} onClick={() => pick(c.id)}>
                    <CategoryIcon icon={c.icon} className="bsheet-icon" />
                    <span>{c.label}</span>
                    <span className="bsheet-count">{productsByCategory(products, c.id).length}</span>
                  </button>
                </li>
              ))}
            </ul>
            <ul className="bsheet-list bsheet-links">
              {videos.length > 0 && (
                <li>
                  <a href="#videos" className="bsheet-item" onClick={() => setSheet(false)}>
                    <span>Videos</span>
                  </a>
                </li>
              )}
              <li>
                <a href="#how" className="bsheet-item" onClick={() => setSheet(false)}>
                  <span>How it works</span>
                </a>
              </li>
              <li>
                <a href="#contact" className="bsheet-item" onClick={() => setSheet(false)}>
                  <span>Contact</span>
                </a>
              </li>
            </ul>
          </div>
        </>
      )}

      <nav className="bnav" aria-label="Quick navigation">
        <button type="button" className={`bnav-item${browsing ? " is-active" : ""}`} aria-current={browsing ? "page" : undefined} onClick={home}>
          <HomeIcon />
          <span>Home</span>
        </button>
        <button
          type="button"
          className={`bnav-item${sheet ? " is-active" : ""}`}
          aria-expanded={sheet}
          onClick={() => {
            setSheet((v) => !v);
            setSearchOpen(false);
          }}
        >
          <GridIcon />
          <span>Designs</span>
        </button>
        <button
          type="button"
          className={`bnav-item${searchOpen ? " is-active" : ""}`}
          aria-pressed={searchOpen}
          onClick={() => {
            setSearchOpen((v) => !v);
            setSheet(false);
          }}
        >
          <SearchIcon />
          <span>Search</span>
        </button>
        <button
          type="button"
          className={`bnav-item${showSaved ? " is-active" : ""}`}
          aria-pressed={showSaved}
          aria-label={`Saved designs (${savedIds.length})`}
          onClick={() => {
            toggleSavedView();
            setSheet(false);
            setSearchOpen(false);
            scrollToProducts();
          }}
        >
          <span className="bnav-ico">
            <HeartIcon filled={showSaved} />
            {savedIds.length > 0 && <span className="bnav-badge">{savedIds.length}</span>}
          </span>
          <span>Saved</span>
        </button>
        <WhatsAppLink className="bnav-item bnav-wa">
          <span className="bnav-ico bnav-ico-wa">
            <WhatsAppIcon />
          </span>
          <span>Chat</span>
        </WhatsAppLink>
      </nav>
    </>
  );
}
