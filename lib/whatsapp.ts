import { SITE } from "./site";
import { categoryLabel, type Product } from "./products";

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

export function productWhatsappUrl(product: Product, ad?: AdSource): string {
  const lines = [
    `Hello ${SITE.brand}! 👋`,
    "I'd like to know the price of this product:",
    "",
    `*Product:* ${product.title}`,
    `*Code:* ${product.id}`,
    `*Category:* ${categoryLabel(product.category)}`,
    `*Details:* ${product.description}`,
  ];
  if (product.specs.length) lines.push(`*Specs:* ${product.specs.join(", ")}`);
  if (SITE.url) lines.push(`*Link:* ${SITE.url}/?tab=${product.category}`);
  const source = sourceLine(ad);
  if (source) lines.push("", source);
  lines.push("", "Please share the price and availability. Thank you!");
  return chatUrl(lines.join("\n"));
}

export function generalWhatsappUrl(ad?: AdSource): string {
  const lines = [
    `Hello ${SITE.brand}! 👋`,
    "I'm interested in your wood designs (beds, kitchens, doors). Please share more details.",
  ];
  const source = sourceLine(ad);
  if (source) lines.push("", source);
  return chatUrl(lines.join("\n"));
}
