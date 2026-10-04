"use client";

import type { KeyboardEvent } from "react";
import { CATEGORIES, productsByCategory, type CategoryId } from "@/lib/products";
import { CategoryIcon } from "./Icons";

type Props = {
  /** Unique per instance: the page renders two synced tab bars (hero + products). */
  idPrefix: string;
  variant: "glass" | "light";
  /** `null` while a search / saved view is showing (no tab is active). */
  value: CategoryId | null;
  onChange: (id: CategoryId) => void;
  controls: string;
};

export default function CategoryTabs({ idPrefix, variant, value, onChange, controls }: Props) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = Math.max(0, CATEGORIES.findIndex((c) => c.id === value));
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % CATEGORIES.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + CATEGORIES.length) % CATEGORIES.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = CATEGORIES.length - 1;
    else return;

    event.preventDefault();
    const id = CATEGORIES[next].id;
    onChange(id);
    document.getElementById(`${idPrefix}-tab-${id}`)?.focus();
  }

  return (
    <div
      className={`tabs tabs-${variant}`}
      role="tablist"
      aria-label="Design categories"
      onKeyDown={handleKeyDown}
    >
      {CATEGORIES.map((category, i) => {
        const active = category.id === value;
        const focusable = active || (value === null && i === 0);
        return (
          <button
            key={category.id}
            id={`${idPrefix}-tab-${category.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={controls}
            tabIndex={focusable ? 0 : -1}
            className={`tab${active ? " is-active" : ""}`}
            onClick={() => onChange(category.id)}
          >
            <CategoryIcon id={category.id} className="tab-icon" />
            <span className="tab-text">{category.label}</span>
            <span className="tab-count">{productsByCategory(category.id).length}</span>
          </button>
        );
      })}
    </div>
  );
}
