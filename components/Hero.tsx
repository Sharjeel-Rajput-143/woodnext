"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { CATEGORIES, categoryLabel, productsByCategory } from "@/lib/products";
import { ArrowIcon, CategoryIcon, CheckIcon, WhatsAppIcon } from "./Icons";
import ProductImage from "./ProductImage";
import { useShop } from "./ShopProvider";
import WhatsAppLink from "./WhatsAppLink";

const MAX_SLIDES = 6;
const AUTOPLAY_MS = 5000;
const SWIPE_PX = 45;

const POINTS = ["Solid, seasoned wood", "Made to your exact size", "Free design advice on WhatsApp"];

/**
 * Split hero: copy on the left, auto-playing image carousel on the right.
 * The carousel shows the products of the selected category.
 */
export default function Hero() {
  const { category, select } = useShop();
  const slides = productsByCategory(category).slice(0, MAX_SLIDES);
  const count = slides.length;

  // Index resets to the first slide whenever the category changes.
  const [state, setState] = useState({ category, index: 0 });
  const index = state.category === category ? state.index : 0;
  const swipeStart = useRef<number | null>(null);

  const go = (to: number) => setState({ category, index: ((to % count) + count) % count });

  useEffect(() => {
    if (count < 2) return;
    const timer = window.setTimeout(
      () => setState({ category, index: (index + 1) % count }),
      AUTOPLAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [category, index, count]);

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
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Handcrafted · Made to measure</p>
          <h1>
            Wood furniture that fits your home <em>perfectly</em>
          </h1>
          <p className="lead">
            Beds, kitchens and doors built by skilled carpenters. Pick a design, tap{" "}
            <strong>Get Price</strong> and we&rsquo;ll reply on WhatsApp.
          </p>

          <div className="hero-cats" role="group" aria-label="Choose a category">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`cat-chip${c.id === category ? " is-active" : ""}`}
                aria-pressed={c.id === category}
                onClick={() => select(c.id)}
              >
                <CategoryIcon id={c.id} className="cat-chip-icon" />
                {c.name}
              </button>
            ))}
          </div>

          <div className="hero-cta">
            <a href="#shop" className="btn btn-primary btn-lg">
              Browse designs
              <ArrowIcon className="btn-icon" />
            </a>
            <WhatsAppLink className="btn btn-outline btn-lg">
              <WhatsAppIcon className="btn-icon" />
              Chat on WhatsApp
            </WhatsAppLink>
          </div>

          <ul className="hero-points">
            {POINTS.map((point) => (
              <li key={point}>
                <CheckIcon className="point-icon" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="hero-visual"
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured designs"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipeStart.current = null)}
        >
          <div className="hero-frame">
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
                  <ProductImage
                    src={product.image}
                    alt={product.title}
                    sizes="(min-width: 960px) 600px, 100vw"
                    priority={i === 0}
                  />
                  <div className="slide-card">
                    <div className="slide-card-text">
                      <span className="slide-card-cat">{categoryLabel(product.category)}</span>
                      <span className="slide-card-title">{product.title}</span>
                    </div>
                    <WhatsAppLink product={product} className="btn btn-wa btn-sm">
                      <WhatsAppIcon className="btn-icon" />
                      Get Price
                    </WhatsAppLink>
                  </div>
                </div>
              );
            })}
          </div>

          {count > 1 && (
            <div className="dots">
              {slides.map((product, i) => (
                <button
                  key={product.id}
                  type="button"
                  className={`dot${i === index ? " is-active" : ""}`}
                  aria-label={`Show ${product.title}`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
