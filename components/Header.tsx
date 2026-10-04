"use client";

import type { FormEvent } from "react";
import { SITE } from "@/lib/site";
import { CloseIcon, LogoMark, SearchIcon, WhatsAppIcon } from "./Icons";
import { scrollToShop, useShop } from "./ShopProvider";
import ThemeToggle from "./ThemeToggle";
import WhatsAppLink from "./WhatsAppLink";

export default function Header() {
  const { query, setQuery } = useShop();

  function onSearch(event: FormEvent) {
    event.preventDefault();
    scrollToShop();
  }

  return (
    <header className="header">
      <div className="container header-bar">
        <a href="#top" className="brand">
          <LogoMark className="brand-mark" />
          <span>{SITE.brand}</span>
        </a>

        <form className="search" role="search" onSubmit={onSearch}>
          <SearchIcon className="search-icon" />
          <input
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

        <nav className="header-links" aria-label="Primary">
          <a href="#shop">Shop</a>
          <a href="#process">Process</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          <WhatsAppLink className="btn btn-wa btn-sm header-wa">
            <WhatsAppIcon className="btn-icon" />
            <span className="header-wa-label">WhatsApp</span>
          </WhatsAppLink>
        </div>
      </div>
    </header>
  );
}
