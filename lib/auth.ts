import "server-only";
import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { getAccount, safeEqual } from "./credentials";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Used to sign login cookies. Set SESSION_SECRET (random text, 32+ characters) in the hosting settings to use your own.
const DEFAULT_SESSION_SECRET = "18c654852d9b6224b3d74d777ae4f6a6d0cbf121d02156ce3f71a4cef7c637c2";

const secret = () => {
  const value = process.env.SESSION_SECRET;
  return value && value.length >= 16 ? value : DEFAULT_SESSION_SECRET;
};

export async function checkCredentials(username: string, password: string): Promise<boolean> {
  const account = await getAccount();
  // Evaluate both so timing does not reveal which one was wrong.
  const userOk = safeEqual(username.trim().toLowerCase(), account.username.toLowerCase());
  const passOk = account.checkPassword(password);
  return userOk && passOk;
}

// The cookie is `<expires>.<password fingerprint>.<signature>`. The fingerprint changes with the password,
// so changing or resetting the password also logs out every other device.
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export async function createSession() {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${expires}.${(await getAccount()).fingerprint(secret())}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [expires, fingerprint, signature] = token.split(".");
  const exp = Number(expires);
  if (!fingerprint || !signature || !Number.isFinite(exp) || exp < Date.now() / 1000) return false;
  try {
    if (!safeEqual(signature, sign(`${expires}.${fingerprint}`))) return false;
    return safeEqual(fingerprint, (await getAccount()).fingerprint(secret()));
  } catch {
    return false;
  }
}
