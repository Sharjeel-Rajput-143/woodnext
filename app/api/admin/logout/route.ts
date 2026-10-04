import { destroySession } from "@/lib/auth";
import { sameOrigin } from "@/lib/api-guard";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Forbidden." }, { status: 403 });
  await destroySession();
  return Response.json({ ok: true });
}
