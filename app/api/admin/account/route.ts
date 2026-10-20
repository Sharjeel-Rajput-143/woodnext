import { guardAdmin } from "@/lib/api-guard";
import { storageMode } from "@/lib/catalog";
import { getAccount } from "@/lib/credentials";

export const dynamic = "force-dynamic";

/** What the Account page needs to know: who is signed in, whether a recovery key exists, and whether changes can be saved. */
export async function GET(request: Request) {
  const denied = await guardAdmin(request);
  if (denied) return denied;
  const account = await getAccount();
  return Response.json({ username: account.username, hasRecoveryKey: account.hasRecoveryKey, canChange: storageMode() !== "readonly" });
}
