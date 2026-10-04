import "server-only";
import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { withLabels, type Catalog, type StoredCatalog } from "./products";
import { sanitizeCatalog } from "./validate";

/**
 * Where catalog data is stored:
 * - "file":     data/catalog.json in the project (local / your own server).
 * - "github":   data/catalog.json is committed to the GitHub repo (works on Vercel; each save redeploys the site).
 * - "readonly": hosted without a writable disk and no GitHub token, so changes cannot be saved.
 */
export type StorageMode = "file" | "github" | "readonly";

const DATA_DIR = path.join(process.cwd(), "data");
const CATALOG_FILE = path.join(DATA_DIR, "catalog.json");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const GH_CATALOG_PATH = "data/catalog.json";
const DEFAULT_GITHUB_REPO = "Sharjeel-Rajput-143/woodnext";

export function storageMode(): StorageMode {
  if (process.env.GITHUB_TOKEN) return "github";
  if (process.env.VERCEL) return "readonly";
  return "file";
}

export class CatalogError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const EMPTY: StoredCatalog = {
  rev: 0,
  categories: [{ id: "designs", label: "Designs", name: "Designs", icon: "tag" }],
  products: [],
  videos: [],
};

// ----------------------------------------------------------------------------- GitHub helpers
function ghRepo() {
  return {
    repo: process.env.GITHUB_REPO || DEFAULT_GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || "main",
    token: process.env.GITHUB_TOKEN as string,
  };
}

async function gh(pathname: string, init: RequestInit & { raw?: boolean } = {}) {
  const { repo, token, branch } = ghRepo();
  const url = `https://api.github.com/repos/${repo}/contents/${pathname}${init.method === "PUT" ? "" : `?ref=${branch}`}`;
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: init.raw ? "application/vnd.github.raw+json" : "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
  });
  return res;
}

async function ghRead(pathname: string): Promise<{ text: string; sha: string } | null> {
  const res = await gh(pathname);
  if (res.status === 404) return null;
  if (!res.ok) throw new CatalogError(`GitHub could not be read (${res.status}).`, 502);
  const json = (await res.json()) as { content: string; sha: string };
  return { text: Buffer.from(json.content, "base64").toString("utf8"), sha: json.sha };
}

async function ghWrite(pathname: string, content: Buffer, message: string, sha?: string) {
  const { branch } = ghRepo();
  const res = await gh(pathname, {
    method: "PUT",
    body: JSON.stringify({ message, content: content.toString("base64"), branch, ...(sha ? { sha } : {}) }),
  });
  if (res.status === 409 || res.status === 422) {
    throw new CatalogError("The data changed elsewhere. Reload the page and try again.", 409);
  }
  if (!res.ok) throw new CatalogError(`GitHub rejected the save (${res.status}). Check GITHUB_TOKEN permissions.`, 502);
}

// ----------------------------------------------------------------------------- read
async function readFromDisk(): Promise<StoredCatalog> {
  const parsed = sanitizeCatalog(JSON.parse(await fs.readFile(CATALOG_FILE, "utf8")));
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.value;
}

/** Catalog for the public site. Never throws: falls back to an empty catalog if the file is damaged. */
export async function getCatalog(): Promise<Catalog> {
  try {
    return withLabels(await readFromDisk());
  } catch (error) {
    console.error("Could not read data/catalog.json:", error);
    return withLabels(EMPTY);
  }
}

/** Latest catalog for the admin panel (read straight from GitHub in "github" mode so edits show at once). */
export async function getStoredCatalog(): Promise<StoredCatalog> {
  if (storageMode() === "github") {
    const file = await ghRead(GH_CATALOG_PATH);
    if (file) {
      const parsed = sanitizeCatalog(JSON.parse(file.text));
      if (parsed.ok) return parsed.value;
    }
  }
  try {
    return await readFromDisk();
  } catch {
    return EMPTY;
  }
}

// ----------------------------------------------------------------------------- write
export async function saveCatalog(input: unknown, expectedRev: number): Promise<StoredCatalog> {
  const mode = storageMode();
  if (mode === "readonly") {
    throw new CatalogError(
      "Saving is not available on this host yet. Add GITHUB_TOKEN in the hosting settings, or connect a database.",
      501,
    );
  }

  const parsed = sanitizeCatalog(input);
  if (!parsed.ok) throw new CatalogError(parsed.error, 400);

  if (mode === "github") {
    const current = await ghRead(GH_CATALOG_PATH);
    const currentRev = current ? (sanitizeCatalog(JSON.parse(current.text)) as { value?: StoredCatalog }).value?.rev ?? 0 : 0;
    if (currentRev !== expectedRev) {
      throw new CatalogError("The data changed elsewhere. Reload the page and try again.", 409);
    }
    const next = { ...parsed.value, rev: currentRev + 1 };
    await ghWrite(GH_CATALOG_PATH, Buffer.from(JSON.stringify(next, null, 2) + "\n"), "Update catalog from admin panel", current?.sha);
    return next;
  }

  const current = await getStoredCatalog();
  if (current.rev !== expectedRev) {
    throw new CatalogError("The data changed elsewhere. Reload the page and try again.", 409);
  }
  const next = { ...parsed.value, rev: current.rev + 1 };
  const tmp = `${CATALOG_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2) + "\n");
  await fs.rename(tmp, CATALOG_FILE);
  await cleanupUploads(next);
  return next;
}

// ----------------------------------------------------------------------------- uploads
const UPLOAD_NAME = /^[a-f0-9]{16}\.(jpg|png|webp)$/;
const MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

function detectImage(buf: Buffer): "jpg" | "png" | "webp" | null {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 12 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 12 && buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

/** Saves an uploaded photo and returns its public path (/uploads/<name>). */
export async function saveUpload(buf: Buffer): Promise<string> {
  const mode = storageMode();
  if (mode === "readonly") throw new CatalogError("Uploads are not available on this host yet.", 501);
  if (buf.length > 2_500_000) throw new CatalogError("Photo is too large (max 2.5 MB).", 413);
  const ext = detectImage(buf);
  if (!ext) throw new CatalogError("Only JPG, PNG or WebP photos are allowed.", 415);
  const name = `${randomBytes(8).toString("hex")}.${ext}`;
  if (mode === "github") {
    await ghWrite(`data/uploads/${name}`, buf, "Upload product photo from admin panel");
  } else {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  }
  return `/uploads/${name}`;
}

export async function readUpload(name: string): Promise<{ data: Buffer; type: string } | null> {
  if (!UPLOAD_NAME.test(name)) return null;
  const type = MIME[name.split(".")[1]];
  try {
    return { data: await fs.readFile(path.join(UPLOAD_DIR, name)), type };
  } catch {
    // Just uploaded and not deployed yet: fetch it from GitHub.
    if (storageMode() !== "github") return null;
    const res = await gh(`data/uploads/${name}`, { raw: true });
    if (!res.ok) return null;
    return { data: Buffer.from(await res.arrayBuffer()), type };
  }
}

/** Deletes uploaded photos that no product uses any more (local file mode only). */
async function cleanupUploads(catalog: StoredCatalog) {
  try {
    const used = new Set(catalog.products.map((p) => p.image.replace("/uploads/", "")));
    const hourAgo = Date.now() - 60 * 60 * 1000;
    for (const file of await fs.readdir(UPLOAD_DIR)) {
      if (!UPLOAD_NAME.test(file) || used.has(file)) continue;
      const full = path.join(UPLOAD_DIR, file);
      if ((await fs.stat(full)).mtimeMs < hourAgo) await fs.unlink(full);
    }
  } catch {
    // Not critical.
  }
}
