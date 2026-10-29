// Vercel Routing Middleware: Vercel serves the built SPA and /api functions directly, so the
// Express gate in server.ts never runs there. This applies the same access-code gate (same
// SITE_ACCESS_CODE, same cookie seal) in front of every request on the Vercel deployment.
import {
  SITE_ACCESS_COOKIE,
  codeMatches,
  privatePage,
  requestHasSiteAccess,
  siteAccessCode,
  siteAccessExempt,
  siteAccessSeal,
  siteIsPrivate,
} from "./api/sitePrivacy";

export const config = { runtime: "nodejs" };

const COOKIE_MAX_AGE = 14 * 24 * 3600;
const FAILURE_LIMIT = 8;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; resetAt: number }>();

const ROBOTS = { "X-Robots-Tag": "noindex, nofollow" };

function continueRequest(): Response {
  return new Response(null, { headers: { "x-middleware-next": "1", ...ROBOTS } });
}

function json(status: number, body: unknown, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...ROBOTS, ...extra },
  });
}

function limited(ip: string): boolean {
  const slot = failures.get(ip);
  return !!slot && slot.resetAt > Date.now() && slot.count >= FAILURE_LIMIT;
}

function noteFailure(ip: string) {
  const now = Date.now();
  const slot = failures.get(ip);
  if (!slot || slot.resetAt <= now) failures.set(ip, { count: 1, resetAt: now + FAILURE_WINDOW_MS });
  else slot.count += 1;
}

async function readCode(request: Request): Promise<string> {
  try {
    const type = request.headers.get("content-type") ?? "";
    if (type.includes("application/json")) {
      const body = (await request.json()) as { code?: unknown };
      return typeof body.code === "string" ? body.code : "";
    }
    const form = await request.formData();
    const code = form.get("code");
    return typeof code === "string" ? code : "";
  } catch {
    return "";
  }
}

async function handleLogin(request: Request): Promise<Response> {
  const code = siteAccessCode();
  if (!code) return json(403, { error: "private" });
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return json(429, { error: "private" });
  if (!codeMatches(await readCode(request), code)) {
    noteFailure(ip);
    return json(limited(ip) ? 429 : 401, { error: "private" });
  }
  failures.delete(ip);
  return json(200, { ok: true }, {
    "set-cookie": `${SITE_ACCESS_COOKIE}=${siteAccessSeal(code)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`,
  });
}

export default async function middleware(request: Request): Promise<Response> {
  if (!siteIsPrivate()) return continueRequest();

  const { pathname } = new URL(request.url);
  const method = request.method.toUpperCase();

  if (pathname === "/robots.txt") {
    return new Response("User-agent: *\nDisallow: /\n", { headers: { "content-type": "text/plain", ...ROBOTS } });
  }
  if (method === "POST" && pathname === "/api/site-access") return handleLogin(request);
  if (siteAccessExempt(method, pathname)) return continueRequest();
  // Vercel Cron calls carry a bearer token that the cron handler verifies against CRON_SECRET.
  if (pathname === "/api/supplier-trends/cron" && request.headers.get("authorization")?.startsWith("Bearer ")) {
    return continueRequest();
  }

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => { headers[key] = value; });
  if (requestHasSiteAccess({ headers })) return continueRequest();

  if (pathname.startsWith("/api/") || pathname.startsWith("/ws/")) return json(401, { error: "private" });
  return new Response(privatePage({ locked: siteAccessCode().length === 0 }), {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", ...ROBOTS },
  });
}
