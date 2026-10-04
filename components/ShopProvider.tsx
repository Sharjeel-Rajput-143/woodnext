"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CategoryId } from "@/lib/products";
import { useSavedIds } from "@/lib/saved";

type ShopContextValue = {
  category: CategoryId;
  select: (id: CategoryId) => void;
  query: string;
  setQuery: (value: string) => void;
  showSaved: boolean;
  toggleSavedView: () => void;
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function useShop(): ShopContextValue {
  const value = useContext(ShopContext);
  if (!value) throw new Error("useShop must be used inside <ShopProvider>");
  return value;
}

/** Scrolls to the product list. Honors the page's smooth-scroll / reduced-motion CSS. */
export function scrollToProducts() {
  document.getElementById("products")?.scrollIntoView();
}

/**
 * Shared shop state: selected category (drives hero carousel, tabs and grid),
 * search text and saved designs.
 */
export default function ShopProvider({
  initialCategory,
  children,
}: {
  /** Chosen on the server from `?tab=` so Meta ad deep links render the right tab immediately. */
  initialCategory: CategoryId;
  children: ReactNode;
}) {
  const [category, setCategory] = useState<CategoryId>(initialCategory);
  const [query, setQueryState] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const { ids: savedIds, toggle: toggleSave } = useSavedIds();

  const select = useCallback((id: CategoryId) => {
    setCategory(id);
    setQueryState("");
    setShowSaved(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", id);
      window.history.replaceState(window.history.state, "", url);
    } catch {
      // Not critical (e.g. sandboxed previews).
    }
  }, []);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    if (value) setShowSaved(false);
  }, []);

  const toggleSavedView = useCallback(() => {
    setShowSaved((v) => !v);
    setQueryState("");
  }, []);

  const value = useMemo<ShopContextValue>(
    () => ({
      category,
      select,
      query,
      setQuery,
      showSaved,
      toggleSavedView,
      savedIds,
      isSaved: (id) => savedIds.includes(id),
      toggleSave,
    }),
    [category, select, query, setQuery, showSaved, toggleSavedView, savedIds, toggleSave],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
