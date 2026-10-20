import { createSession } from "@/lib/auth";
import { guardAdmin } from "@/lib/api-guard";
import { CatalogError } from "@/lib/catalog";
import { createRecoveryKey, getAccount } from "@/lib/credentials";
import { clientIp, createLimiter, TOO_MANY } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const limiter = createLimiter(8);

/** Creates a new recovery key (the old one stops working). Needs the current password. The key is returned once. */
export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const ip = clientIp(request);
  if (limiter.blocked(ip)) return Response.json({ error: TOO_MANY }, { status: 429 });

  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (!(await getAccount()).checkPassword(password)) {
    await limiter.fail(ip);
    return Response.json({ error: "Your password is not correct." }, { status: 400 });
  }

  try {
    const recoveryKey = await createRecoveryKey(password);
    limiter.clear(ip);
    await createSession(); // the saved login changed, so refresh this device's cookie
    return Response.json({ recoveryKey });
  } catch (error) {
    if (error instanceof CatalogError) return Response.json({ error: error.message }, { status: error.status });
    console.error(error);
    return Response.json({ error: "Could not create the recovery key. Please try again." }, { status: 500 });
  }
}
