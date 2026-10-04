import { checkCredentials, createSession } from "@/lib/auth";
import { sameOrigin } from "@/lib/api-guard";

// Best-effort brute-force protection (per server instance).
const attempts = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const MAX_TRACKED = 5000;

/** Keeps the map small: drops expired entries and, as a hard limit, the oldest ones. */
function prune(now: number) {
  if (attempts.size < 500) return;
  for (const [ip, entry] of attempts) if (entry.reset <= now) attempts.delete(ip);
  while (attempts.size > MAX_TRACKED) {
    const oldest = attempts.keys().next().value;
    if (oldest === undefined) break;
    attempts.delete(oldest);
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Forbidden." }, { status: 403 });
  const ip = (request.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const now = Date.now();
  prune(now);
  const record = attempts.get(ip);
  if (record && record.reset > now && record.count >= MAX_ATTEMPTS) {
    return Response.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { username?: unknown; password?: unknown } | null;
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!checkCredentials(username, password)) {
    attempts.set(ip, {
      count: record && record.reset > now ? record.count + 1 : 1,
      reset: record && record.reset > now ? record.reset : now + WINDOW_MS,
    });
    await new Promise((resolve) => setTimeout(resolve, 700));
    return Response.json({ error: "Wrong username or password." }, { status: 401 });
  }

  attempts.delete(ip);
  await createSession();
  return Response.json({ ok: true });
}
