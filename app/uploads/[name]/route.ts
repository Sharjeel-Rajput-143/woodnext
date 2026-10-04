import { readUpload } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/** Serves photos uploaded from the admin panel (stored in data/uploads). */
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const file = await readUpload(name);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.type,
      // File names are random, so a given name never changes.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
