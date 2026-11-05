// Shared (client + server safe) types and helpers. The data itself lives in data/catalog.json
// and is edited from the /admin panel.

export const ICONS = ["bed", "kitchen", "door", "chair", "sofa", "table", "wardrobe", "tag"] as const;
export type IconName = (typeof ICONS)[number];

export type Category = {
  /** URL-safe id, e.g. "bed". Used in `?tab=` links. */
  id: string;
  /** Optional photo for this category's tile (and the top banner while it has no products). Defaults to its first product's photo. */
  image?: string;
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

/** Photos on the landing page that are not product photos. The owner can replace each one from the admin panel. */
export const SITE_IMAGES = [
  {
    key: "lifestyleMain",
    label: "Large photo (\u201CFurniture made to fit your home\u201D)",
    help: "The big photo next to the \u201CCrafted around your space\u201D text. Landscape or square photos work best.",
    alt: "Living room with a warm wooden feature wall",
    default: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    key: "lifestyleInset",
    label: "Small photo on top of it",
    help: "The smaller photo that overlaps the large one (a workshop or close-up of your work works well).",
    alt: "Carpenter working on a piece of wood in the workshop",
    default: "https://images.unsplash.com/photo-1687422810663-c316494f725a?auto=format&fit=crop&w=1600&q=80",
  },
  {
    key: "ctaBackground",
    label: "Background of \u201CCan\u2019t find your perfect design?\u201D",
    help: "The wide photo behind the contact section near the bottom of the page. Use a darker photo so the white text stays easy to read.",
    alt: "",
    default: "https://images.unsplash.com/photo-1683115099191-51e617fc5ff1?auto=format&fit=crop&w=1600&q=80",
  },
] as const;
export type SiteImageKey = (typeof SITE_IMAGES)[number]["key"];
/** Only the photos the owner has replaced; the rest use the defaults above. */
export type SiteImageOverrides = Partial<Record<SiteImageKey, string>>;

export type StoredCatalog = {
  /** Increases on every save; used to detect two people editing at once. */
  rev: number;
  /** Replacement photos for the landing-page sections (see SITE_IMAGES). */
  siteImages?: SiteImageOverrides;
  /** The website name shown in the header, footer, page titles and WhatsApp messages. Edited in the admin panel. */
  brand: string;
  categories: Category[];
  products: StoredProduct[];
  videos: Video[];
};

export type Catalog = {
  /** Every landing-page photo, with the owner's replacements applied. */
  siteImages: Record<SiteImageKey, string>;
  brand: string;
  categories: Category[];
  products: Product[];
  videos: Video[];
};

export function withLabels(stored: StoredCatalog): Catalog {
  const labels = new Map(stored.categories.map((c) => [c.id, c.label]));
  const siteImages = Object.fromEntries(SITE_IMAGES.map((s) => [s.key, stored.siteImages?.[s.key] || s.default])) as Record<SiteImageKey, string>;
  return {
    siteImages,
    brand: stored.brand,
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
