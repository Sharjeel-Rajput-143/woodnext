import { categoryLabel, type Product } from "@/lib/products";
import { WhatsAppIcon } from "./Icons";
import ProductImage from "./ProductImage";
import WhatsAppLink from "./WhatsAppLink";

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <article className="card" style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}>
      <div className="card-media">
        <ProductImage
          src={product.image}
          alt={product.title}
          sizes="(min-width: 960px) 330px, (min-width: 560px) 45vw, 50vw"
        />
        <span className="chip">{product.id}</span>
      </div>
      <div className="card-body">
        <p className="card-cat">{categoryLabel(product.category)}</p>
        <h3 className="card-title">{product.title}</h3>
        <p className="card-desc">{product.description}</p>
        <WhatsAppLink product={product} className="btn btn-wa btn-block">
          <WhatsAppIcon className="btn-icon" />
          Get Price
        </WhatsAppLink>
      </div>
    </article>
  );
}
