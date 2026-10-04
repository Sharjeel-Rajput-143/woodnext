"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
};

// Shown if a remote photo cannot be loaded, so a card never has a broken image.
const FALLBACK = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d8b88a"/><stop offset="1" stop-color="#9c7448"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/></svg>`,
)}`;

export default function ProductImage({ src, alt, sizes, priority }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <Image
      src={failed ? FALLBACK : src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className="media-img"
      onError={() => setFailed(true)}
    />
  );
}
