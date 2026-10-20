"use client";

import { useState, type FormEvent } from "react";
import { cleanBrand, BRAND_MAX } from "@/lib/validate";

/** Website settings: the name shown in the header, footer, browser tab and WhatsApp messages. */
export default function WebsitePanel({
  brand,
  saving,
  onSave,
}: {
  brand: string;
  saving: boolean;
  onSave: (brand: string) => Promise<boolean>;
}) {
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
