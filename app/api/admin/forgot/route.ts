import { sameOrigin } from "@/lib/api-guard";
import { CatalogError } from "@/lib/catalog";
import { getAccount, passwordProblem, resetPasswordWithRecoveryKey, safeEqual } from "@/lib/credentials";
import { clientIp, createLimiter, TOO_MANY } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const limiter = createLimiter(5);

/**
 * "Forgot password": username + recovery key + a new password. Works while signed out.
 * The recovery key can be used once; a fresh one is returned (shown to the owner once).
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Forbidden." }, { status: 403 });
  const ip = clientIp(request);
  if (limiter.blocked(ip)) return Response.json({ error: TOO_MANY }, { status: 429 });

  const body = (await request.json().catch(() => null)) as { username?: unknown; recoveryKey?: unknown; newPassword?: unknown } | null;
  const username = typeof body?.username === "string" ? body.username : "";
  const recoveryKey = typeof body?.recoveryKey === "string" ? body.recoveryKey.slice(0, 64) : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  const account = await getAccount();
  // Evaluate both so timing does not reveal which one was wrong.
  const userOk = safeEqual(username.trim().toLowerCase(), account.username.toLowerCase());
  const keyOk = account.checkRecoveryKey(recoveryKey);
  if (!(userOk && keyOk)) {
    await limiter.fail(ip);
    return Response.json(
      { error: "That username or recovery key is not right. If you have no recovery key, ask the person who manages your website to reset the login." },
      { status: 401 },
    );
  }
  const problem = passwordProblem(newPassword, account.username);
  if (problem) return Response.json({ error: problem }, { status: 400 });

  try {
    const newRecoveryKey = await resetPasswordWithRecoveryKey(newPassword);
    limiter.clear(ip);
    return Response.json({ ok: true, recoveryKey: newRecoveryKey });
  } catch (error) {
    if (error instanceof CatalogError) return Response.json({ error: error.message }, { status: error.status });
    console.error(error);
    return Response.json({ error: "Could not save the new password. Please try again." }, { status: 500 });
  }
}
