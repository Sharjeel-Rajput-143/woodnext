import { revalidatePath } from "next/cache";
import { guardAdmin } from "@/lib/api-guard";
import { CatalogError, getStoredCatalog, saveCatalog, storageMode } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  return Response.json({ catalog: await getStoredCatalog(), mode: storageMode() });
}

export async function PUT(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as { catalog?: { rev?: unknown } } | null;
  if (!body?.catalog) return Response.json({ error: "Invalid data." }, { status: 400 });
  const expectedRev = typeof body.catalog.rev === "number" ? body.catalog.rev : -1;

  try {
    const saved = await saveCatalog(body.catalog, expectedRev);
    // Rebuild the pre-built pages with the new data (on Vercel the redeploy does this too).
    revalidatePath("/", "layout");
    return Response.json({ catalog: saved, mode: storageMode() });
  } catch (error) {
    if (error instanceof CatalogError) return Response.json({ error: error.message }, { status: error.status });
    console.error(error);
    return Response.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}
