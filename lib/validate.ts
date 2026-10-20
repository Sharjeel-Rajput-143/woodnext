import { SITE } from "./site";
import { ICONS, type Category, type IconName, type StoredCatalog, type StoredProduct, type Video } from "./products";
import { parseYouTubeId } from "./youtube";

type Result = { ok: true; value: StoredCatalog } | { ok: false; error: string };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CODE = /^[A-Za-z0-9][A-Za-z0-9-]{1,23}$/;
const UPLOAD = /^\/uploads\/[a-f0-9]{16}\.(?:jpg|png|webp)$/;

const text = (value: unknown, max: number): string | null =>
  typeof value === "string" ? value.trim().slice(0, max) : null;

export const BRAND_MAX = 40;

/** Cleans the website name: no control characters, single spaces. Returns an error message for an unusable name. */
export function cleanBrand(value: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== "string") return { ok: false, error: "Enter a name for your website." };
  const brand = value.replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim();
  if (brand.length < 2) return { ok: false, error: "The website name needs at least 2 characters." };
  if (brand.length > BRAND_MAX) return { ok: false, error: `The website name can be at most ${BRAND_MAX} characters.` };
  return { ok: true, value: brand };
}

/**
 * Strictly validates (and cleans) a catalog coming from the admin panel or the JSON file.
 * Nothing the browser sends is trusted: every field is checked and re-built.
 */
export function sanitizeCatalog(input: unknown): Result {
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid data." };
  const raw = input as Record<string, unknown>;
  if (!Array.isArray(raw.categories) || !Array.isArray(raw.products) || !Array.isArray(raw.videos)) {
    return { ok: false, error: "Invalid data." };
  }
  if (raw.categories.length < 1) return { ok: false, error: "Keep at least one category." };
  if (raw.categories.length > 24 || raw.products.length > 600 || raw.videos.length > 100) {
    return { ok: false, error: "Too many items." };
  }

  const categories: Category[] = [];
  const categoryIds = new Set<string>();
  for (const c of raw.categories as Record<string, unknown>[]) {
    const id = text(c?.id, 24);
    const label = text(c?.label, 40);
    const name = text(c?.name, 24);
    const icon = ICONS.includes(c?.icon as IconName) ? (c.icon as IconName) : "tag";
    if (!id || !SLUG.test(id)) return { ok: false, error: "A category has an invalid id." };
    if (!label || !name) return { ok: false, error: "Every category needs a name and a label." };
    if (categoryIds.has(id)) return { ok: false, error: `Duplicate category "${name}".` };
    categoryIds.add(id);
    categories.push({ id, label, name, icon });
  }

  const products: StoredProduct[] = [];
  const productIds = new Set<string>();
  for (const p of raw.products as Record<string, unknown>[]) {
    const id = text(p?.id, 24);
    const category = text(p?.category, 24);
    const title = text(p?.title, 100);
    const description = text(p?.description, 400);
    const image = text(p?.image, 600);
    if (!id || !CODE.test(id)) return { ok: false, error: "A product has an invalid code." };
    if (productIds.has(id)) return { ok: false, error: `Duplicate product code ${id}.` };
    if (!category || !categoryIds.has(category)) return { ok: false, error: `Product ${id} has no valid category.` };
    if (!title) return { ok: false, error: `Product ${id} needs a title.` };
    if (description === null) return { ok: false, error: `Product ${id} has an invalid description.` };
    if (!image || !(/^https:\/\/[^\s]+$/.test(image) || UPLOAD.test(image))) {
      return { ok: false, error: `Product "${title}" needs a photo (upload one or paste an https link).` };
    }
    const specs = Array.isArray(p.specs)
      ? p.specs
          .map((s) => text(s, 60))
          .filter((s): s is string => !!s)
          .slice(0, 12)
      : [];
    productIds.add(id);
    products.push({ id, category, title, description, specs, image });
  }

  const videos: Video[] = [];
  const videoIds = new Set<string>();
  for (const v of raw.videos as Record<string, unknown>[]) {
    const id = text(v?.id, 24);
    const title = text(v?.title, 100);
    const description = text(v?.description, 300) ?? "";
    const youtubeId = typeof v?.youtubeId === "string" ? parseYouTubeId(v.youtubeId) : null;
    if (!id || !CODE.test(id) || videoIds.has(id)) return { ok: false, error: "A video has an invalid id." };
    if (!title) return { ok: false, error: "Every video needs a title." };
    if (!youtubeId) return { ok: false, error: `The YouTube link for "${title}" is not valid.` };
    videoIds.add(id);
    videos.push({ id, title, description, youtubeId });
  }

  // Older data files have no name yet: they keep the built-in one until the owner changes it.
  const brand = raw.brand === undefined ? { ok: true as const, value: SITE.brand } : cleanBrand(raw.brand);
  if (!brand.ok) return brand;

  const rev = typeof raw.rev === "number" && Number.isFinite(raw.rev) ? Math.max(0, Math.floor(raw.rev)) : 0;
  return { ok: true, value: { rev, brand: brand.value, categories, products, videos } };
}
