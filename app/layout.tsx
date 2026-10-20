import type { ReactNode } from "react";
import { preconnect } from "react-dom";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { BrandProvider } from "@/components/BrandProvider";
import { getCatalog } from "@/lib/catalog";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

// Applies the saved (or system) colour scheme before first paint to avoid a flash.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

const description =
  "Solid wood beds, kitchens and doors made to your size. Pick a design and get the price instantly on WhatsApp.";

// The website name comes from the admin panel, so the page titles are built from it.
export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getCatalog();
  const title = `${brand} | Custom Beds, Kitchens & Doors – Get Price on WhatsApp`;
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: { title, description, type: "website", siteName: brand },
  };
}

export const viewport: Viewport = {
  themeColor: "#1f3a52",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { brand } = await getCatalog();
  // Start the connection to the photo CDN while the page is still loading.
  preconnect("https://images.unsplash.com");
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <BrandProvider brand={brand}>{children}</BrandProvider>
      </body>
    </html>
  );
}
