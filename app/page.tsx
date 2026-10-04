import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { Contact, Footer, Perks, Process, WhatsAppFab } from "@/components/Sections";
import ShopProvider from "@/components/ShopProvider";
import Shop from "@/components/Shop";
import { DEFAULT_CATEGORY, isCategoryId } from "@/lib/products";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  // Ads can deep-link to a category, e.g. https://your-site.com/?tab=kitchen
  const { tab } = await searchParams;
  const initialCategory = isCategoryId(tab) ? tab : DEFAULT_CATEGORY;

  return (
    <ShopProvider initialCategory={initialCategory}>
      <a className="skip-link" href="#shop">
        Skip to designs
      </a>
      <Header />
      <main>
        <Hero />
        <Perks />
        <Shop />
        <Process />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
    </ShopProvider>
  );
}
