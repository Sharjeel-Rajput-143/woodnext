import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon, LogoMark, WhatsAppIcon } from "@/components/Icons";
import ProductImage from "@/components/ProductImage";
import WhatsAppLink from "@/components/WhatsAppLink";
import { PRODUCTS, categoryLabel, ogImage } from "@/lib/products";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return {};
  const title = `${product.title} | ${SITE.brand}`;
  const image = ogImage(product);
  return {
    title,
    description: product.description,
    openGraph: {
      title,
      description: product.description,
      type: "website",
      siteName: SITE.brand,
      images: [{ url: image, width: 1200, height: 630, alt: product.title }],
    },
    twitter: { card: "summary_large_image", title, images: [image] },
  };
}

/**
 * Product page. Its link is added to the WhatsApp message, so WhatsApp shows a
 * preview card with the product photo and title in the chat.
 */
export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <>
      <header className="pp-bar">
        <div className="container pp-bar-inner">
          <Link href="/" className="logo">
            <LogoMark className="logo-mark" />
            <span>{SITE.brand}</span>
          </Link>
          <Link href={`/?tab=${product.category}#products`} className="btn btn-outline btn-sm">
            All designs
            <ArrowIcon className="btn-icon" />
          </Link>
        </div>
      </header>

      <main className="container pp">
        <div className="pp-media">
          <ProductImage src={product.image} alt={product.title} sizes="(min-width: 860px) 640px, 100vw" priority />
        </div>
        <div className="pp-info">
          <p className="eyebrow">{categoryLabel(product.category)}</p>
          <h1>{product.title}</h1>
          <p className="pp-desc">{product.description}</p>
          <ul className="pp-specs">
            {product.specs.map((spec) => (
              <li key={spec}>{spec}</li>
            ))}
          </ul>
          <p className="pp-note">Product code: {product.id}</p>
          <WhatsAppLink product={product} className="btn btn-wa btn-lg">
            <WhatsAppIcon className="btn-icon" />
            Get Price on WhatsApp
          </WhatsAppLink>
          <p className="pp-note">We reply with the price, size options and delivery time.</p>
        </div>
      </main>
    </>
  );
}
