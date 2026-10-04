"use client";

import type { KeyboardEvent } from "react";
import { productsByCategory } from "@/lib/products";
import { CategoryIcon } from "./Icons";
import { useShop } from "./ShopProvider";

type Props = {
  /** Unique per instance: the page renders two synced tab bars (hero + products). */
  idPrefix: string;
  variant: "glass" | "light";
  /** `null` while a search / saved view is showing (no tab is active). */
  value: string | null;
  onChange: (id: string) => void;
  controls: string;
};

export default function CategoryTabs({ idPrefix, variant, value, onChange, controls }: Props) {
  const { categories, products } = useShop();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const count = categories.length;
    const current = Math.max(0, categories.findIndex((c) => c.id === value));
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % count;
    else if (event.key === "ArrowLeft") next = (current - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else return;

    event.preventDefault();
    const id = categories[next].id;
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
      {categories.map((category, i) => {
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
            <CategoryIcon icon={category.icon} className="tab-icon" />
            <span className="tab-text">{category.label}</span>
            <span className="tab-count">{productsByCategory(products, category.id).length}</span>
          </button>
        );
      })}
    </div>
  );
}
