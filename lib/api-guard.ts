import "server-only";
import { isAdmin } from "./auth";

/**
 * Guard for state-changing admin requests:
 * - the request must come from this same site (blocks cross-site requests), and
 * - the visitor must be logged in as the owner.
 * Returns an error Response, or null when the request may continue.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin fetches from older browsers may omit it; cookies are SameSite=Lax anyway
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return Boolean(host) && new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function guardAdmin(request: Request): Promise<Response | null> {
  if (!sameOrigin(request)) return Response.json({ error: "Forbidden." }, { status: 403 });
  if (!(await isAdmin())) return Response.json({ error: "Please log in." }, { status: 401 });
  return null;
}
