import CategoryTiles from "@/components/CategoryTiles";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductsSection from "@/components/ProductsSection";
import ShopProvider from "@/components/ShopProvider";
import {
  CtaBand,
  Footer,
  HowItWorks,
  Lifestyle,
  TrustStrip,
  WhatsAppFab,
} from "@/components/Sections";
import { DEFAULT_CATEGORY, isCategoryId } from "@/lib/products";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  // Meta ads can deep-link to a tab, e.g. https://your-site.com/?tab=kitchen
  const { tab } = await searchParams;
  const initialCategory = isCategoryId(tab) ? tab : DEFAULT_CATEGORY;

  return (
    <ShopProvider initialCategory={initialCategory}>
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
        <HowItWorks />
        <CtaBand />
      </main>
      <Footer />
      <WhatsAppFab />
    </ShopProvider>
  );
}
