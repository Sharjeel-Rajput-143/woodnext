import CategoryTiles from "@/components/CategoryTiles";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductsSection from "@/components/ProductsSection";
import ShopProvider from "@/components/ShopProvider";
import VideoGallery from "@/components/VideoGallery";
import {
  CtaBand,
  Footer,
  HowItWorks,
  Lifestyle,
  TrustStrip,
  WhatsAppFab,
} from "@/components/Sections";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  // Products, categories and videos are managed from /admin (data/catalog.json).
  const catalog = await getCatalog();
  // Ads can deep-link to a tab, e.g. https://your-site.com/?tab=kitchen
  const { tab } = await searchParams;
  const initialCategory = catalog.categories.some((c) => c.id === tab)
    ? (tab as string)
    : catalog.categories[0].id;

  return (
    <ShopProvider catalog={catalog} initialCategory={initialCategory}>
      <a className="skip-link" href="#products">
        Skip to designs
      </a>
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <CategoryTiles />
        <ProductsSection />
        <Lifestyle />
        <VideoGallery />
        <HowItWorks />
        <CtaBand />
      </main>
      <Footer categories={catalog.categories} />
      <WhatsAppFab />
    </ShopProvider>
  );
}
