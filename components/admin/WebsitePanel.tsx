"use client";

import { useState, type FormEvent } from "react";
import { SITE_IMAGES, type SiteImageKey, type SiteImageOverrides } from "@/lib/products";
import { cleanBrand, BRAND_MAX } from "@/lib/validate";
import PhotoPicker from "./PhotoPicker";

/** Website settings: the name shown in the header, footer, browser tab and WhatsApp messages. */
export default function WebsitePanel({
  brand,
  siteImages,
  saving,
  onSave,
  onSaveImages,
}: {
  brand: string;
  siteImages: SiteImageOverrides;
  saving: boolean;
  onSave: (brand: string) => Promise<boolean>;
  onSaveImages: (images: SiteImageOverrides) => Promise<boolean>;
}) {
  const [photos, setPhotos] = useState<Record<SiteImageKey, string>>(() => ({
    lifestyleMain: siteImages.lifestyleMain ?? "",
    lifestyleInset: siteImages.lifestyleInset ?? "",
    ctaBackground: siteImages.ctaBackground ?? "",
  }));
  const photosChanged = SITE_IMAGES.some(({ key }) => photos[key].trim() !== (siteImages[key] ?? ""));
  const [value, setValue] = useState(brand);
  const [error, setError] = useState("");
  const cleaned = cleanBrand(value);
  const preview = cleaned.ok ? cleaned.value : brand;
  const unchanged = cleaned.ok && cleaned.value === brand;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!cleaned.ok) return setError(cleaned.error);
    setError("");
    if (await onSave(cleaned.value)) setValue(cleaned.value);
  }

  return (
    <div className="adm-account">
      <section className="adm-card">
        <h2 className="adm-card-title">Website name</h2>
        <p className="adm-muted">
          Shown in the top bar and footer of your website, the browser tab, link previews and the start of every WhatsApp message
          customers send you.
        </p>
        <form className="adm-form" onSubmit={onSubmit}>
          <label className="adm-field">
            <span>Name</span>
            <input value={value} maxLength={BRAND_MAX} onChange={(e) => setValue(e.target.value)} required />
          </label>
          {error && (
            <p className="adm-alert adm-alert-error" role="alert">
              {error}
            </p>
          )}
          <div className="adm-form-actions">
            <button type="submit" className="adm-btn adm-btn-primary" disabled={saving || unchanged}>
              {saving ? "Saving…" : "Save name"}
            </button>
          </div>
        </form>
      </section>

      <section className="adm-card">
        <h2 className="adm-card-title">Section photos</h2>
        <p className="adm-muted">
          Photos on the home page that are not product photos. Upload your own, or go back to the original at any time. Changes show
          on the website after you press <strong>Save photos</strong>.
        </p>
        <div className="adm-photo-list">
          {SITE_IMAGES.map(({ key, label, help, default: fallback }) => (
            <PhotoPicker key={key} label={label} help={help} value={photos[key]} fallback={fallback} onChange={(v) => setPhotos((p) => ({ ...p, [key]: v }))} />
          ))}
        </div>
        <div className="adm-form-actions">
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            disabled={saving || !photosChanged}
            onClick={() => onSaveImages(Object.fromEntries(SITE_IMAGES.map(({ key }) => [key, photos[key].trim()]).filter(([, v]) => v)))}
          >
            {saving ? "Saving…" : "Save photos"}
          </button>
        </div>
      </section>

      <section className="adm-card">
        <h2 className="adm-card-title">Other photos on your website</h2>
        <ul className="adm-notes">
          <li>
            <strong>Top banner (the big sliding photos):</strong> these are the photos of the products in the selected category. To change one,
            open <strong>Products</strong> and change that product&rsquo;s photo.
          </li>
          <li>
            <strong>&ldquo;Shop by category&rdquo; tiles:</strong> each uses the first product&rsquo;s photo. To pick a different one, open{" "}
            <strong>Categories</strong>, edit the category and set its photo. A category with no products yet also uses that photo as its banner.
          </li>
        </ul>
      </section>

      <section className="adm-card">
        <h2 className="adm-card-title">How it will look</h2>
        <dl className="adm-preview">
          <dt>Browser tab</dt>
          <dd>{preview} | Custom Beds, Kitchens &amp; Doors – Get Price on WhatsApp</dd>
          <dt>WhatsApp message</dt>
          <dd>Hello {preview}! 👋 I&rsquo;d like to know the price of this product…</dd>
          <dt>Footer</dt>
          <dd>© {new Date().getFullYear()} {preview}. All rights reserved.</dd>
        </dl>
        <p className="adm-muted">
          The logo picture next to the name isn&rsquo;t part of this setting. It stays the same until the logo file is replaced.
        </p>
      </section>
    </div>
  );
}
