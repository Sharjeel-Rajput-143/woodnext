import { SITE } from "./site";
import type { Product } from "./products";

export type AdSource = { source?: string; campaign?: string };

const clean = (value: string | null) => value?.trim().slice(0, 60) || undefined;

/** Reads Meta/UTM tracking params so we know which ad the enquiry came from. */
export function readAdSource(search: string): AdSource | undefined {
  const params = new URLSearchParams(search);
  const source = clean(params.get("utm_source"));
  const campaign = clean(params.get("utm_campaign"));
  if (source || campaign) return { source, campaign };
  if (params.get("fbclid")) return { source: "Meta Ads" };
  return undefined;
}

function chatUrl(text: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function sourceLine(ad?: AdSource): string | null {
  if (!ad) return null;
  const parts = [ad.source, ad.campaign].filter(Boolean);
  return parts.length ? `Came from: ${parts.join(" / ")}` : null;
}

/**
 * Link added to the message so the shop owner sees the product photo.
 * With a site URL it points to the product page (WhatsApp shows a preview card with the photo);
 * otherwise it falls back to the direct image URL.
 */
function productLink(product: Product): string | null {
  if (SITE.url) return `${SITE.url.replace(/\/$/, "")}/p/${product.id}`;
  return product.image.startsWith("http") ? product.image : null;
}

export function productWhatsappUrl(product: Product, brand: string, ad?: AdSource): string {
  const lines = [
    `Hello ${brand}! 👋`,
    "I'd like to know the price of this product:",
    "",
    `*Product:* ${product.title}`,
    `*Code:* ${product.id}`,
    `*Category:* ${product.categoryLabel}`,
    `*Details:* ${product.description}`,
  ];
  if (product.specs.length) lines.push(`*Specs:* ${product.specs.join(", ")}`);
  const link = productLink(product);
  if (link) lines.push(`*Photo:* ${link}`);
  const source = sourceLine(ad);
  if (source) lines.push("", source);
  lines.push("", "Please share the price and availability. Thank you!");
  return chatUrl(lines.join("\n"));
}

export function generalWhatsappUrl(brand: string, ad?: AdSource): string {
  const lines = [
    `Hello ${brand}! 👋`,
    "I'm interested in your wood designs (beds, kitchens, doors). Please share more details.",
  ];
  const source = sourceLine(ad);
  if (source) lines.push("", source);
  return chatUrl(lines.join("\n"));
}
