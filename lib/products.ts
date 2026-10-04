// Shared (client + server safe) types and helpers. The data itself lives in data/catalog.json
// and is edited from the /admin panel.

export const ICONS = ["bed", "kitchen", "door", "chair", "sofa", "table", "wardrobe", "tag"] as const;
export type IconName = (typeof ICONS)[number];

export type Category = {
  /** URL-safe id, e.g. "bed". Used in `?tab=` links. */
  id: string;
  /** Long label, e.g. "Bed Designs". */
  label: string;
  /** Short name used in the navbar, e.g. "Beds". */
  name: string;
  icon: IconName;
};

export type StoredProduct = {
  id: string;
  category: string;
  title: string;
  description: string;
  /** Extra details sent to WhatsApp with the product. */
  specs: string[];
  /** https URL, or "/uploads/<file>" for photos uploaded in the admin panel. */
  image: string;
};

/** Product as shown on the site (the category label is added when the catalog is loaded). */
export type Product = StoredProduct & { categoryLabel: string };

export type Video = {
  id: string;
  title: string;
  description: string;
  /** The 11-character YouTube video id. */
  youtubeId: string;
};

export type StoredCatalog = {
  /** Increases on every save; used to detect two people editing at once. */
  rev: number;
  categories: Category[];
  products: StoredProduct[];
  videos: Video[];
};

export type Catalog = {
  categories: Category[];
  products: Product[];
  videos: Video[];
};

export function withLabels(stored: StoredCatalog): Catalog {
  const labels = new Map(stored.categories.map((c) => [c.id, c.label]));
  return {
    categories: stored.categories,
    videos: stored.videos,
    products: stored.products.map((p) => ({ ...p, categoryLabel: labels.get(p.category) ?? p.category })),
  };
}

export function productsByCategory(products: Product[], category: string): Product[] {
  return products.filter((p) => p.category === category);
}

/** Simple "all words must match" search across title, description, specs, code and category. */
export function searchProducts(products: Product[], query: string): Product[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return products.filter((p) => {
    const haystack = [p.title, p.description, p.id, p.categoryLabel, ...p.specs].join(" ").toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
}

/** Unsplash photo by id (used for the static section photos). */
export const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

/** Landscape crop of the product photo used for link previews (WhatsApp, Facebook). */
export function ogImage(product: Product): string {
  if (!product.image.startsWith("https://images.unsplash.com/")) return product.image;
  const url = new URL(product.image);
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  url.searchParams.set("w", "1200");
  url.searchParams.set("h", "630");
  url.searchParams.set("q", "70");
  return url.toString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}
