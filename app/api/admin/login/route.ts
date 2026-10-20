import { checkCredentials, createSession } from "@/lib/auth";
import { sameOrigin } from "@/lib/api-guard";
import { clientIp, createLimiter, TOO_MANY } from "@/lib/rate-limit";

const limiter = createLimiter(8);

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Forbidden." }, { status: 403 });
  const ip = clientIp(request);
  if (limiter.blocked(ip)) return Response.json({ error: TOO_MANY }, { status: 429 });

  const body = (await request.json().catch(() => null)) as { username?: unknown; password?: unknown } | null;
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!(await checkCredentials(username, password))) {
    await limiter.fail(ip);
    return Response.json({ error: "Wrong username or password." }, { status: 401 });
  }

  limiter.clear(ip);
  await createSession();
  return Response.json({ ok: true });
}
