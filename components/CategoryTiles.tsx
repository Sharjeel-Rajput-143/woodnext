"use client";

import { productsByCategory } from "@/lib/products";
import { ArrowIcon } from "./Icons";
import ProductImage from "./ProductImage";
import Reveal from "./Reveal";
import { scrollToProducts, useShop } from "./ShopProvider";

/** "Shop by category" tiles. Each tile switches the category and jumps to the products. */
export default function CategoryTiles() {
  const { categories, products, select } = useShop();

  return (
    <section className="section section-tight" aria-labelledby="shop-by-category">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Browse</p>
          <h2 id="shop-by-category">Shop by category</h2>
        </Reveal>
        <div className="tiles">
          {categories.map((category, i) => {
            const items = productsByCategory(products, category.id);
            return (
              <Reveal key={category.id} delay={i * 90}>
                <button
                  type="button"
                  className="tile"
                  onClick={() => {
                    select(category.id);
                    scrollToProducts();
                  }}
                >
                  {items[0] && (
                    <ProductImage
                      src={items[0].image}
                      alt=""
                      sizes="(min-width: 900px) 420px, 100vw"
                    />
                  )}
                  <span className="tile-shade" />
                  <span className="tile-text">
                    <span className="tile-title">{category.label}</span>
                    <span className="tile-count">
                      {items.length} {items.length === 1 ? "design" : "designs"}
                    </span>
                  </span>
                  <span className="tile-go" aria-hidden="true">
                    <ArrowIcon />
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
