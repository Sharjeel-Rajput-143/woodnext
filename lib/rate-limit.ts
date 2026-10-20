import "server-only";

/** Best-effort brute-force protection (per server instance): too many failures from one address lock it out for a while. */
export function createLimiter(maxFailures: number, windowMs = 15 * 60 * 1000) {
  const attempts = new Map<string, { count: number; reset: number }>();
  const MAX_TRACKED = 5000;

  /** Keeps the map small: drops expired entries and, as a hard limit, the oldest ones. */
  function prune(now: number) {
    if (attempts.size < 500) return;
    for (const [ip, entry] of attempts) if (entry.reset <= now) attempts.delete(ip);
    while (attempts.size > MAX_TRACKED) {
      const oldest = attempts.keys().next().value;
      if (oldest === undefined) break;
      attempts.delete(oldest);
    }
  }

  return {
    blocked(ip: string): boolean {
      const now = Date.now();
      prune(now);
      const record = attempts.get(ip);
      return Boolean(record && record.reset > now && record.count >= maxFailures);
    },
    /** Records a failure and slows the answer down a little. */
    async fail(ip: string) {
      const now = Date.now();
      const record = attempts.get(ip);
      const active = record && record.reset > now;
      attempts.set(ip, { count: active ? record.count + 1 : 1, reset: active ? record.reset : now + windowMs });
      await new Promise((resolve) => setTimeout(resolve, 700));
    },
    clear(ip: string) {
      attempts.delete(ip);
    },
  };
}

export const clientIp = (request: Request) => (request.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();

export const TOO_MANY = "Too many attempts. Try again in a few minutes.";
