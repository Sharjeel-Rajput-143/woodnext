import { redirect } from "next/navigation";
import AdminApp from "@/components/admin/AdminApp";
import { isAdmin } from "@/lib/auth";
import { getStoredCatalog, storageMode } from "@/lib/catalog";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminApp initialCatalog={await getStoredCatalog()} initialMode={storageMode()} brand={SITE.brand} />;
}
