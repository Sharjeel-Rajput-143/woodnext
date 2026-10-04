"use client";

import type { ReactNode } from "react";
import type { CategoryId } from "@/lib/products";
import { scrollToShop, useShop } from "./ShopProvider";

/** Button that switches category and jumps to the shop (used in the footer). */
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
        scrollToShop();
      }}
    >
      {children}
    </button>
  );
}
