"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { productsByCategory } from "@/lib/products";
import CategoryTabs from "./CategoryTabs";
import { ArrowIcon, WhatsAppIcon } from "./Icons";
import ProductImage from "./ProductImage";
import { scrollToProducts, useShop } from "./ShopProvider";
import WhatsAppLink from "./WhatsAppLink";

const MAX_SLIDES = 6;
const AUTOPLAY_MS = 5500;
const SWIPE_PX = 45;

/**
 * Full-screen slider. It shows the products of the selected category tab and auto-plays.
 */
export default function Hero() {
  const { categories, products, category, select } = useShop();
  const slides = productsByCategory(products, category).slice(0, MAX_SLIDES);
  const categoryName = categories.find((c) => c.id === category)?.label ?? "designs";
  const count = slides.length;

  // Index resets to the first slide whenever the category changes.
  // `reach` = how many slides have been needed so far. Photos are only loaded for slides up to `reach`
  // (the shown slide plus the next one), instead of downloading all of them up front.
  const [state, setState] = useState({ category, index: 0, reach: 1 });
  const current = state.category === category ? state : { category, index: 0, reach: 1 };
  const index = current.index;
  const reach = current.reach;
  const swipeStart = useRef<number | null>(null);

  const go = (to: number) => {
    const next = ((to % count) + count) % count;
    setState({ category, index: next, reach: Math.max(reach, next + 1) });
  };

  useEffect(() => {
    if (count < 2) return;
    const timer = window.setTimeout(
      () => {
        const next = (index + 1) % count;
        setState({ category, index: next, reach: Math.max(reach, next + 1) });
      },
      AUTOPLAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [category, index, count, reach]);

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    swipeStart.current = event.clientX;
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    if (swipeStart.current === null) return;
    const delta = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(delta) >= SWIPE_PX) go(index + (delta < 0 ? 1 : -1));
  }

  return (
    <section
      className="hero"
      id="top"
      aria-roledescription="carousel"
      aria-label="Featured designs"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipeStart.current = null)}
    >
      <h1 className="sr-only">Custom wood beds, kitchens and doors. Get the price on WhatsApp.</h1>

      <div className="hero-stage">
        {slides.length === 0 && (
          <div className="slide slide-empty is-active">
            <div className="container slide-inner">
              <div className="slide-copy">
                <h2 className="slide-title">{categoryName}</h2>
                <p className="slide-desc">New designs are coming soon. Message us on WhatsApp and we will build it for you.</p>
                <div className="slide-actions">
                  <WhatsAppLink className="btn btn-wa btn-lg">
                    <WhatsAppIcon className="btn-icon" />
                    Ask on WhatsApp
                  </WhatsAppLink>
                </div>
              </div>
            </div>
          </div>
        )}
        {slides.map((product, i) => {
          const active = i === index;
          return (
            <div
              key={product.id}
              className={`slide${active ? " is-active" : ""}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              inert={!active}
            >
              {i <= reach && (
                <ProductImage src={product.image} alt={product.title} sizes="100vw" priority={i === 0} />
              )}
              <div className="slide-shade" />
              <div className="container slide-inner">
                <div className="slide-copy">
                  <h2 className="slide-title">{product.title}</h2>
                  <p className="slide-desc">{product.description}</p>
                  <ul className="slide-specs">
                    {product.specs.slice(0, 3).map((spec) => (
                      <li key={spec}>{spec}</li>
                    ))}
                  </ul>
                  <div className="slide-actions">
                    <WhatsAppLink product={product} className="btn btn-wa btn-lg">
                      <WhatsAppIcon className="btn-icon" />
                      Get Price
                    </WhatsAppLink>
                    <button type="button" className="btn btn-glass btn-lg" onClick={scrollToProducts}>
                      View all designs
                      <ArrowIcon className="btn-icon" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hero-bottom">
        <div className="container hero-bottom-inner">
          <CategoryTabs
            idPrefix="hero"
            variant="glass"
            value={category}
            onChange={select}
            controls="products-panel"
          />

        </div>
      </div>
    </section>
  );
}
