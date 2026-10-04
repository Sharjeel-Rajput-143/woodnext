import { guardAdmin } from "@/lib/api-guard";
import { CatalogError, saveUpload } from "@/lib/catalog";

export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;

  // Refuse oversized bodies before reading them (photos are shrunk to well under 1 MB in the browser).
  if (Number(request.headers.get("content-length") ?? 0) > 3_000_000) {
    return Response.json({ error: "Photo is too large (max 2.5 MB)." }, { status: 413 });
  }
  const buffer = Buffer.from(await request.arrayBuffer());
  try {
    return Response.json({ path: await saveUpload(buffer) });
  } catch (error) {
    if (error instanceof CatalogError) return Response.json({ error: error.message }, { status: error.status });
    console.error(error);
    return Response.json({ error: "Upload failed." }, { status: 500 });
  }
}
