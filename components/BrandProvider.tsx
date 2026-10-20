"use client";

import { createContext, useContext, type ReactNode } from "react";
import { SITE } from "@/lib/site";

const BrandContext = createContext<string>(SITE.brand);

/** Gives every client component the website name chosen in the admin panel (set once, in the root layout). */
export function BrandProvider({ brand, children }: { brand: string; children: ReactNode }) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export const useBrand = () => useContext(BrandContext);
