import "server-only";
import { createHash, createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Built-in owner login. The ADMIN_USERNAME / ADMIN_PASSWORD / SESSION_SECRET environment variables
// override these if you set them. The password is stored only as a scrypt hash, never as plain text.
const DEFAULT_USERNAME = "Waqar";
const DEFAULT_PASSWORD_HASH = "scrypt:36e4854071583bdd97ffd345e5c1536d:0f0a75a5cd9a94b2d864832d2e1771b79c81afe37144abe4a7ac24e2014d0da0b674ccc9166852840f524382465ab716576fd70bb9b0e0055dc406dde39fbde8";
const DEFAULT_SESSION_SECRET = "18c654852d9b6224b3d74d777ae4f6a6d0cbf121d02156ce3f71a4cef7c637c2";

const secret = () => {
  const value = process.env.SESSION_SECRET;
  return value && value.length >= 16 ? value : DEFAULT_SESSION_SECRET;
};

const digest = (value: string) => createHash("sha256").update(value).digest();
const safeEqual = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

function passwordMatches(password: string): boolean {
  if (process.env.ADMIN_PASSWORD) return safeEqual(password, process.env.ADMIN_PASSWORD);
  const [, salt, hash] = DEFAULT_PASSWORD_HASH.split(":");
  const candidate = scryptSync(password, Buffer.from(salt, "hex"), 64);
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}

export function checkCredentials(username: string, password: string): boolean {
  const expected = process.env.ADMIN_USERNAME || DEFAULT_USERNAME;
  // Evaluate both so timing does not reveal which one was wrong.
  const userOk = safeEqual(username.trim().toLowerCase(), expected.toLowerCase());
  const passOk = passwordMatches(password);
  return userOk && passOk;
}

const sign = (expires: number) =>
  createHmac("sha256", secret()).update(String(expires)).digest("base64url");

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
