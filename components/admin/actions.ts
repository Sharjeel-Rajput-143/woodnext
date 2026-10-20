import type { Category, StoredCatalog, StoredProduct, Video } from "@/lib/products";
import type { Commit } from "./AdminApp";

/** Every change the owner can make. Each one saves the whole catalog and resolves to `true` on success. */
export function createActions(catalog: StoredCatalog, commit: Commit) {
  function swap<T>(list: T[], a: number, b: number): T[] {
    const next = [...list];
    [next[a], next[b]] = [next[b], next[a]];
    return next;
  }

  return {
    // ----- website
    saveBrand(brand: string) {
      return commit({ ...catalog, brand }, "Website name updated.");
    },

    // ----- products
    saveProduct(product: StoredProduct) {
      const exists = catalog.products.some((p) => p.id === product.id);
      const products = exists
        ? catalog.products.map((p) => (p.id === product.id ? product : p))
        : [...catalog.products, product];
      return commit({ ...catalog, products }, exists ? "Product updated." : "Product added.");
    },
    removeProduct(id: string) {
      return commit({ ...catalog, products: catalog.products.filter((p) => p.id !== id) }, "Product deleted.");
    },
    moveProduct(product: StoredProduct, direction: -1 | 1) {
      const siblings = catalog.products.filter((p) => p.category === product.category);
      const other = siblings[siblings.findIndex((p) => p.id === product.id) + direction];
      if (!other) return Promise.resolve(false);
      const a = catalog.products.findIndex((p) => p.id === product.id);
      const b = catalog.products.findIndex((p) => p.id === other.id);
      return commit({ ...catalog, products: swap(catalog.products, a, b) }, "Order updated.");
    },

    // ----- categories (= site navigation)
    saveCategory(category: Category) {
      const exists = catalog.categories.some((c) => c.id === category.id);
      const categories = exists
        ? catalog.categories.map((c) => (c.id === category.id ? category : c))
        : [...catalog.categories, category];
      return commit({ ...catalog, categories }, exists ? "Category updated." : "Category added to the navigation.");
    },
    removeCategory(id: string) {
      return commit(
        {
          ...catalog,
          categories: catalog.categories.filter((c) => c.id !== id),
          products: catalog.products.filter((p) => p.category !== id),
        },
        "Category removed from the navigation.",
      );
    },
    moveCategory(index: number, direction: -1 | 1) {
      const target = index + direction;
      if (target < 0 || target >= catalog.categories.length) return Promise.resolve(false);
      return commit({ ...catalog, categories: swap(catalog.categories, index, target) }, "Navigation order updated.");
    },

    // ----- videos
    saveVideo(video: Video) {
      const exists = catalog.videos.some((v) => v.id === video.id);
      const videos = exists ? catalog.videos.map((v) => (v.id === video.id ? video : v)) : [...catalog.videos, video];
      return commit({ ...catalog, videos }, exists ? "Video updated." : "Video added to the website.");
    },
    removeVideo(id: string) {
      return commit({ ...catalog, videos: catalog.videos.filter((v) => v.id !== id) }, "Video removed.");
    },
    moveVideo(index: number, direction: -1 | 1) {
      const target = index + direction;
      if (target < 0 || target >= catalog.videos.length) return Promise.resolve(false);
      return commit({ ...catalog, videos: swap(catalog.videos, index, target) }, "Video order updated.");
    },
  };
}

export type Actions = ReturnType<typeof createActions>;
