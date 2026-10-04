import HomeView from "@/components/HomeView";
import { getCatalog } from "@/lib/catalog";

// Static page: built once per deployment and served from the CDN (no per-visit rendering).
// `/?tab=kitchen` links are served from the pre-built /t/kitchen page (see proxy.ts).
export default async function Home() {
  const catalog = await getCatalog();
  return <HomeView catalog={catalog} initialCategory={catalog.categories[0].id} />;
}
