"use client";

import type { ReactNode } from "react";
import type { CategoryId } from "@/lib/products";
import { scrollToProducts, useShop } from "./ShopProvider";

/** Button that switches category and jumps to the product list (used in the footer). */
export default function CategoryLink({
  id,
  className,
  children,
}: {
  id: CategoryId;
  className?: string;
  children: ReactNode;
}) {
  const { select } = useShop();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        select(id);
        scrollToProducts();
      }}
    >
      {children}
    </button>
  );
}
