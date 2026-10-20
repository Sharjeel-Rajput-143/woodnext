import CategoryTiles from "@/components/CategoryTiles";
import BottomNav from "@/components/BottomNav";
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
import type { Catalog } from "@/lib/products";

/** The whole landing page. Rendered ahead of time (one static page per category tab). */
export default function HomeView({ catalog, initialCategory }: { catalog: Catalog; initialCategory: string }) {
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
      <Footer brand={catalog.brand} categories={catalog.categories} />
      <WhatsAppFab />
      <BottomNav />
    </ShopProvider>
  );
}
