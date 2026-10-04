import Image from "next/image";
import { CATEGORIES, photo } from "@/lib/products";
import { SITE } from "@/lib/site";
import CategoryLink from "./CategoryLink";
import { FeatureIcon, LogoMark, WhatsAppIcon, type FeatureIconName } from "./Icons";
import Reveal from "./Reveal";
import WhatsAppLink from "./WhatsAppLink";

const PERKS: { icon: FeatureIconName; title: string; text: string }[] = [
  { icon: "leaf", title: "Solid seasoned wood", text: "Durable, termite-treated timber" },
  { icon: "ruler", title: "Made to your size", text: "Custom dimensions & finishes" },
  { icon: "chat", title: "Free consultation", text: "Design advice on WhatsApp" },
  { icon: "truck", title: "Delivery & fitting", text: "Safe delivery to your door" },
];

const STEPS = [
  { title: "Pick a design", text: "Browse beds, kitchens and doors and choose the style you like." },
  { title: "Tap Get Price", text: "WhatsApp opens with the product name and details already filled in." },
  { title: "Get your quote", text: "We reply with the price, size options and delivery time." },
];

export function Perks() {
  return (
    <section className="perks" aria-label="Why choose us">
      <div className="container">
        <ul className="perks-card">
          {PERKS.map((perk) => (
            <li className="perk" key={perk.title}>
              <span className="perk-icon">
                <FeatureIcon name={perk.icon} />
              </span>
              <div>
                <h3>{perk.title}</h3>
                <p>{perk.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section className="process" id="process">
      <div className="container">
        <Reveal className="process-head">
          <p className="eyebrow">How ordering works</p>
          <h2>From idea to quote in three steps</h2>
        </Reveal>
        <ol className="steps">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <Reveal className="step" delay={i * 100}>
                <span className="step-num">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section className="section" id="contact">
      <div className="container">
        <Reveal className="contact-card">
          <div className="contact-copy">
            <p className="eyebrow">Talk to us</p>
            <h2>Can&rsquo;t find your perfect design?</h2>
            <p>Send us a photo or your idea on WhatsApp and our team will build it for you.</p>
            <WhatsAppLink className="btn btn-wa btn-lg">
              <WhatsAppIcon className="btn-icon" />
              Chat on WhatsApp
            </WhatsAppLink>
            <p className="contact-phone">
              Or call: <a href={`tel:+${SITE.whatsappNumber}`}>{SITE.phoneDisplay}</a>
            </p>
          </div>
          <div className="contact-media">
            <Image
              src={photo("photo-1687422810663-c316494f725a")}
              alt="Carpenter working on a piece of wood in the workshop"
              fill
              sizes="(min-width: 900px) 520px, 100vw"
              className="media-img"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="#top" className="brand">
            <LogoMark className="brand-mark" />
            <span>{SITE.brand}</span>
          </a>
          <p>{SITE.tagline}. Beds, kitchens and doors built to order.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <CategoryLink id={c.id} className="footer-link">
                  {c.label}
                </CategoryLink>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>
              <a href={`tel:+${SITE.whatsappNumber}`}>{SITE.phoneDisplay}</a>
            </li>
            <li>
              <WhatsAppLink className="footer-link">Chat on WhatsApp</WhatsAppLink>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        © {new Date().getFullYear()} {SITE.brand}. All rights reserved.
      </div>
    </footer>
  );
}

export function WhatsAppFab() {
  return (
    <WhatsAppLink className="fab">
      <WhatsAppIcon className="fab-icon" />
      <span className="sr-only">Chat on WhatsApp</span>
    </WhatsAppLink>
  );
}
