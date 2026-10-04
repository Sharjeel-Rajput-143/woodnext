import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const secret = () => {
  const value = process.env.SESSION_SECRET;
  return value && value.length >= 16 ? value : null;
};

/** The owner login is only enabled when all three settings exist (never a default password). */
export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && secret());
}

const digest = (value: string) => createHash("sha256").update(value).digest();
const safeEqual = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

export function checkCredentials(username: string, password: string): boolean {
  if (!adminConfigured()) return false;
  // Evaluate both so timing does not reveal which one was wrong.
  const userOk = safeEqual(username, process.env.ADMIN_USERNAME as string);
  const passOk = safeEqual(password, process.env.ADMIN_PASSWORD as string);
  return userOk && passOk;
}

const sign = (expires: number) =>
  createHmac("sha256", secret() as string).update(String(expires)).digest("base64url");

export async function createSession() {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
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
  if (!secret()) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [expires, signature] = token.split(".");
  const exp = Number(expires);
  if (!signature || !Number.isFinite(exp) || exp < Date.now() / 1000) return false;
  try {
    return safeEqual(signature, sign(exp));
  } catch {
    return false;
  }
}
