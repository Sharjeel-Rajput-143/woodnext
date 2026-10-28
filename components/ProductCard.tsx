"use client";

import Link from "next/link";
import type { Product } from "@/lib/products";
import { HeartIcon, WhatsAppIcon } from "./Icons";
import ProductImage from "./ProductImage";
import { useShop } from "./ShopProvider";
import WhatsAppLink from "./WhatsAppLink";

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const { isSaved, toggleSave } = useShop();
  const saved = isSaved(product.id);

  return (
    <article className="card" style={{ animationDelay: `${Math.min(index, 7) * 60}ms` }}>
      <div className="card-media">
        <ProductImage
          src={product.image}
          alt={product.title}
          sizes="(min-width: 1100px) 300px, (min-width: 760px) 30vw, 50vw"
        />
        <span className="chip">Made to order</span>
        <button
          type="button"
          className={`heart${saved ? " is-saved" : ""}`}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.title} from saved` : `Save ${product.title}`}
          onClick={() => toggleSave(product.id)}
        >
          <HeartIcon filled={saved} />
        </button>
      </div>
      <div className="card-body">
        <p className="card-cat">{product.categoryLabel}</p>
        <h3 className="card-title">
          {/* One link covers the whole card (see .card-link in the CSS), so a click or tap anywhere opens the details page. */}
          <Link href={`/p/${product.id}`} className="card-link">
            {product.title}
          </Link>
        </h3>
        <p className="card-desc">{product.description}</p>
        <p className="card-more" aria-hidden="true">
          View details →
        </p>
        <p className="card-price">Price on WhatsApp</p>
        <WhatsAppLink product={product} className="btn btn-wa btn-block">
          <WhatsAppIcon className="btn-icon" />
          Get Price
        </WhatsAppLink>
      </div>
    </article>
  );
}
