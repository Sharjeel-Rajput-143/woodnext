import "server-only";
import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { CatalogError, ghRead, ghWrite, storageMode } from "./catalog";

// Built-in owner login. The ADMIN_USERNAME / ADMIN_PASSWORD environment variables override these, and a password
// the owner sets from the panel (saved in data/auth.json) overrides both. Passwords are only ever stored as scrypt hashes.
const DEFAULT_USERNAME = "Waqar";
const DEFAULT_PASSWORD_HASH = "scrypt:938bc2f26b1e6f9ba95988ce0ca2b657:6672decfdf37dec360f1245f9649188c255a4a5e06b813a3c752852f12aecbb9a87cde23db59d9a8fa99b5b3b4ec1f1838ed38cee23d9e24c2f9df2d862ea43d";

const AUTH_FILE = path.join(process.cwd(), "data", "auth.json");
const GH_AUTH_PATH = "data/auth.json";
const HASH_FORMAT = /^scrypt:([0-9a-f]{32}):([0-9a-f]{128})$/;
const CACHE_MS = 5_000;

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

/** What data/auth.json holds. Only hashes, never the password or recovery key themselves. */
type StoredAuth = {
  rev: number;
  username: string;
  passwordHash: string;
  recoveryHash?: string;
  updatedAt: string;
};

export type Account = {
  username: string;
  hasRecoveryKey: boolean;
  checkPassword(password: string): boolean;
  checkRecoveryKey(key: string): boolean;
  /** Changes whenever the password changes, so old login cookies stop working. */
  fingerprint(key: string): string;
};

// ----------------------------------------------------------------------------- hashing
export function safeEqual(a: string, b: string): boolean {
  const hash = (value: string) => createHmac("sha256", "compare").update(value).digest();
  return timingSafeEqual(hash(a), hash(b));
}

function hashSecret(value: string): string {
  const salt = randomBytes(16);
  return `scrypt:${salt.toString("hex")}:${scryptSync(value, salt, 64).toString("hex")}`;
}

function verifySecret(value: string, stored: string): boolean {
  const match = HASH_FORMAT.exec(stored);
  if (!match) return false;
  return timingSafeEqual(scryptSync(value, Buffer.from(match[1], "hex"), 64), Buffer.from(match[2], "hex"));
}

// ----------------------------------------------------------------------------- recovery key
// No look-alike characters (0/O, 1/I/L), so it is easy to copy by hand.
const KEY_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** 20 random characters (about 99 bits), shown as XXXX-XXXX-XXXX-XXXX-XXXX. */
function newRecoveryKey(): string {
  let key = "";
  for (let i = 0; i < 20; i++) key += KEY_CHARS[randomInt(KEY_CHARS.length)];
  return key.match(/.{4}/g)!.join("-");
}

const normalizeKey = (key: string) => key.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** Returns a message when the password is not acceptable, or null when it is fine. */
export function passwordProblem(password: string, username: string): string | null {
  if (password.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters. A few random words work well.`;
  if (password.length > PASSWORD_MAX) return `Use at most ${PASSWORD_MAX} characters.`;
  if (!password.trim()) return "The password can't be only spaces.";
  if (password.trim().toLowerCase() === username.trim().toLowerCase()) return "The password can't be the same as the username.";
  return null;
}

// ----------------------------------------------------------------------------- storage
function parseStored(text: string): StoredAuth | null {
  try {
    const raw = JSON.parse(text) as Partial<StoredAuth>;
    if (typeof raw.username !== "string" || !raw.username || typeof raw.passwordHash !== "string" || !HASH_FORMAT.test(raw.passwordHash)) return null;
    const recoveryHash = typeof raw.recoveryHash === "string" && HASH_FORMAT.test(raw.recoveryHash) ? raw.recoveryHash : undefined;
    return {
      rev: typeof raw.rev === "number" ? raw.rev : 0,
      username: raw.username,
      passwordHash: raw.passwordHash,
      recoveryHash,
      updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : "",
    };
  } catch {
    return null;
  }
}

async function readDisk(): Promise<{ stored: StoredAuth | null; sha?: string }> {
  try {
    return { stored: parseStored(await fs.readFile(AUTH_FILE, "utf8")) };
  } catch {
    return { stored: null };
  }
}

/**
 * Reads the saved login. In "github" mode the live copy comes straight from GitHub (so a change shows at once,
 * before the redeploy that it also triggers). `strict` makes a failed GitHub read an error; it is used before writing.
 */
async function readStored(strict: boolean): Promise<{ stored: StoredAuth | null; sha?: string }> {
  if (storageMode() === "github" && process.env.NEXT_PHASE !== "phase-production-build") {
    try {
      const file = await ghRead(GH_AUTH_PATH);
      return file ? { stored: parseStored(file.text), sha: file.sha } : { stored: null };
    } catch (error) {
      if (strict) throw error;
      console.error("Could not read the owner login from GitHub, using the deployed copy:", error);
    }
  }
  return readDisk();
}

let cache: { at: number; stored: StoredAuth | null } | null = null;

async function loadStored(): Promise<StoredAuth | null> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.stored;
  const { stored } = await readStored(false);
  cache = { at: Date.now(), stored };
  return stored;
}

async function updateStored(change: (current: StoredAuth | null) => Pick<StoredAuth, "username" | "passwordHash" | "recoveryHash">): Promise<void> {
  const mode = storageMode();
  if (mode === "readonly") {
    throw new CatalogError("Changing the password isn't available on this host yet. Add GITHUB_TOKEN in the hosting settings.", 501);
  }
  const { stored: current, sha } = await readStored(true);
  const next: StoredAuth = { ...change(current), rev: (current?.rev ?? 0) + 1, updatedAt: new Date().toISOString() };
  const body = JSON.stringify(next, null, 2) + "\n";
  if (mode === "github") {
    await ghWrite(GH_AUTH_PATH, Buffer.from(body), "Update owner login from admin panel", sha);
  } else {
    await fs.mkdir(path.dirname(AUTH_FILE), { recursive: true });
    const tmp = `${AUTH_FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, body, { mode: 0o600 });
    await fs.rename(tmp, AUTH_FILE);
  }
  cache = { at: Date.now(), stored: next };
}

// ----------------------------------------------------------------------------- the account
export async function getAccount(): Promise<Account> {
  const stored = await loadStored();
  const hmac = (key: string, value: string) => createHmac("sha256", key).update(value).digest("hex").slice(0, 16);

  if (stored) {
    return {
      username: stored.username,
      hasRecoveryKey: Boolean(stored.recoveryHash),
      checkPassword: (password) => verifySecret(password, stored.passwordHash),
      checkRecoveryKey: (key) => Boolean(stored.recoveryHash) && verifySecret(normalizeKey(key), stored.recoveryHash as string),
      fingerprint: (key) => hmac(key, stored.passwordHash),
    };
  }

  const username = process.env.ADMIN_USERNAME || DEFAULT_USERNAME;
  const envPassword = process.env.ADMIN_PASSWORD;
  return {
    username,
    hasRecoveryKey: false,
    checkPassword: (password) => (envPassword ? safeEqual(password, envPassword) : verifySecret(password, DEFAULT_PASSWORD_HASH)),
    checkRecoveryKey: () => false,
    fingerprint: (key) => hmac(key, envPassword ? `env:${envPassword}` : DEFAULT_PASSWORD_HASH),
  };
}

/** Saves a new password. The recovery key (if any) is kept. */
export async function changePassword(newPassword: string): Promise<void> {
  const account = await getAccount();
  await updateStored((current) => ({
    username: current?.username ?? account.username,
    passwordHash: hashSecret(newPassword),
    recoveryHash: current?.recoveryHash,
  }));
}

/**
 * Creates a new recovery key (the old one stops working) and returns it. It is shown to the owner only once.
 * `currentPassword` must already be verified. It is saved as the login if none has been saved from the panel yet.
 */
export async function createRecoveryKey(currentPassword: string): Promise<string> {
  const account = await getAccount();
  const key = newRecoveryKey();
  await updateStored((current) => ({
    username: current?.username ?? account.username,
    passwordHash: current?.passwordHash ?? hashSecret(currentPassword),
    recoveryHash: hashSecret(normalizeKey(key)),
  }));
  return key;
}

/** Sets a new password after a correct recovery key and issues a fresh recovery key (each one works only once). */
export async function resetPasswordWithRecoveryKey(newPassword: string): Promise<string> {
  const account = await getAccount();
  const key = newRecoveryKey();
  await updateStored((current) => ({
    username: current?.username ?? account.username,
    passwordHash: hashSecret(newPassword),
    recoveryHash: hashSecret(normalizeKey(key)),
  }));
  return key;
}
