"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CATEGORIES } from "@/lib/products";
import { SITE } from "@/lib/site";
import { CloseIcon, HeartIcon, LogoMark, SearchIcon, WhatsAppIcon } from "./Icons";
import { scrollToProducts, useShop } from "./ShopProvider";
import ThemeToggle from "./ThemeToggle";
import WhatsAppLink from "./WhatsAppLink";

export default function Header() {
  const { category, select, query, setQuery, showSaved, toggleSavedView, savedIds } = useShop();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const browsing = !query && !showSaved;
  const solid = scrolled || menuOpen || searchOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setSearchOpen(false);
    scrollToProducts();
  }

  function goCategory(id: (typeof CATEGORIES)[number]["id"]) {
    select(id);
    setMenuOpen(false);
    scrollToProducts();
  }

  return (
    <header className={`site-header${solid ? " is-solid" : ""}`}>
      <div className="container header-bar">
        <a href="#top" className="logo" onClick={() => setMenuOpen(false)}>
          <LogoMark className="logo-mark" />
          <span>{SITE.brand}</span>
        </a>

        <nav id="main-nav" className={`main-nav${menuOpen ? " open" : ""}`} aria-label="Primary">
          <a href="#top" className="nav-link" onClick={() => setMenuOpen(false)}>
            Home
          </a>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`nav-link${browsing && category === c.id ? " is-active" : ""}`}
              onClick={() => goCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
          <a href="#how" className="nav-link" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a href="#contact" className="nav-link" onClick={() => setMenuOpen(false)}>
            Contact
          </a>
          <WhatsAppLink className="btn btn-wa nav-cta">
            <WhatsAppIcon className="btn-icon" />
            Chat on WhatsApp
          </WhatsAppLink>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className={`icon-btn${searchOpen ? " is-active" : ""}`}
            aria-label="Search designs"
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((v) => !v);
              setMenuOpen(false);
            }}
          >
            <SearchIcon />
          </button>
          <ThemeToggle />
          <button
            type="button"
            className={`icon-btn${showSaved ? " is-active" : ""}`}
            aria-label={`Saved designs (${savedIds.length})`}
            aria-pressed={showSaved}
            onClick={() => {
              toggleSavedView();
              setMenuOpen(false);
              scrollToProducts();
            }}
          >
            <HeartIcon filled={showSaved} />
            {savedIds.length > 0 && <span className="icon-badge">{savedIds.length}</span>}
          </button>
          <WhatsAppLink className="btn btn-wa btn-sm header-wa">
            <WhatsAppIcon className="btn-icon" />
            WhatsApp
          </WhatsAppLink>
          <button
            type="button"
            className="menu-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => {
              setMenuOpen((v) => !v);
              setSearchOpen(false);
            }}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="search-panel">
          <div className="container">
            <form className="search" role="search" onSubmit={onSearch}>
              <SearchIcon className="search-icon" />
              <input
                ref={searchInput}
                type="search"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search beds, kitchens, doors…"
                aria-label="Search designs"
                autoComplete="off"
                enterKeyHint="search"
              />
              {query && (
                <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setQuery("")}>
                  <CloseIcon />
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
