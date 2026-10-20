"use client";

import { useMemo, type MouseEvent, type ReactNode } from "react";
import type { Product } from "@/lib/products";
import { useBrand } from "./BrandProvider";
import { generalWhatsappUrl, productWhatsappUrl, readAdSource } from "@/lib/whatsapp";

type Props = {
  /** Omit for a general enquiry. */
  product?: Product;
  className?: string;
  tabIndex?: number;
  children: ReactNode;
};

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

export default function WhatsAppLink({ product, className, tabIndex, children }: Props) {
  const brand = useBrand();
  const href = useMemo(
    () => (product ? productWhatsappUrl(product, brand) : generalWhatsappUrl(brand)),
    [product, brand],
  );

  // Add Meta ad / UTM info at click time (the page is statically rendered, so it is not known earlier).
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const ad = readAdSource(window.location.search);
    event.currentTarget.href = product
      ? productWhatsappUrl(product, brand, ad)
      : generalWhatsappUrl(brand, ad);

    // Reports the lead to the Meta Pixel when one is installed on the site.
    (window as FbqWindow).fbq?.("track", "Contact", {
      content_name: product?.title ?? "General enquiry",
      content_category: product?.category,
      content_ids: product ? [product.id] : undefined,
    });
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      tabIndex={tabIndex}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
