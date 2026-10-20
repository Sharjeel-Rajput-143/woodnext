import { createSession } from "@/lib/auth";
import { guardAdmin } from "@/lib/api-guard";
import { CatalogError } from "@/lib/catalog";
import { changePassword, getAccount, passwordProblem } from "@/lib/credentials";
import { clientIp, createLimiter, TOO_MANY } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const limiter = createLimiter(8);

/** Change the password while signed in: needs the current password. */
export async function POST(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const ip = clientIp(request);
  if (limiter.blocked(ip)) return Response.json({ error: TOO_MANY }, { status: 429 });

  const body = (await request.json().catch(() => null)) as { currentPassword?: unknown; newPassword?: unknown } | null;
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  const account = await getAccount();
  if (!account.checkPassword(currentPassword)) {
    await limiter.fail(ip);
    return Response.json({ error: "Your current password is not correct." }, { status: 400 });
  }
  const problem = passwordProblem(newPassword, account.username);
  if (problem) return Response.json({ error: problem }, { status: 400 });
  if (newPassword === currentPassword) return Response.json({ error: "Choose a password you have not used just now." }, { status: 400 });

  try {
    await changePassword(newPassword);
  } catch (error) {
    if (error instanceof CatalogError) return Response.json({ error: error.message }, { status: error.status });
    console.error(error);
    return Response.json({ error: "Could not save the new password. Please try again." }, { status: 500 });
  }
  limiter.clear(ip);
  // Other devices are signed out by the password change; keep this one signed in.
  await createSession();
  return Response.json({ ok: true });
}
