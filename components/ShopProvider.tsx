"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CategoryId, SortKey } from "@/lib/products";

type ShopContextValue = {
  category: CategoryId;
  select: (id: CategoryId) => void;
  query: string;
  setQuery: (value: string) => void;
  sort: SortKey;
  setSort: (value: SortKey) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function useShop(): ShopContextValue {
  const value = useContext(ShopContext);
  if (!value) throw new Error("useShop must be used inside <ShopProvider>");
  return value;
}

/** Scrolls to the shop. Honors the page's smooth-scroll CSS. */
export function scrollToShop() {
  document.getElementById("shop")?.scrollIntoView();
}

/** Shared state: selected category (drives hero carousel and product list), search and sort. */
export default function ShopProvider({
  initialCategory,
  children,
}: {
  /** Chosen on the server from `?tab=` so ad deep links render the right category immediately. */
  initialCategory: CategoryId;
  children: ReactNode;
}) {
  const [category, setCategory] = useState<CategoryId>(initialCategory);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");

  const select = useCallback((id: CategoryId) => {
    setCategory(id);
    setQuery("");
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", id);
      window.history.replaceState(window.history.state, "", url);
    } catch {
      // Not critical (e.g. sandboxed previews).
    }
  }, []);

  const value = useMemo<ShopContextValue>(
    () => ({ category, select, query, setQuery, sort, setSort }),
    [category, select, query, sort],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
