// Production (and any process with SITE_ACCESS_CODE) does not serve the public site.
// Render's health check, the signed Stripe webhook, and the ticket worker stay
// reachable because each has its own check. The access code is never stored in the repo.
import crypto from "crypto";
import type { Express, Request, Response, NextFunction } from "express";
import type { IncomingMessage } from "http";

export const SITE_ACCESS_COOKIE = "luxe_site_access";
const SEAL_LABEL = "luxe-site-access-v1";
const COOKIE_MAX_AGE = 14 * 24 * 3600;
const FAILURE_LIMIT = 8;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;

const failures = new Map<string, { count: number; resetAt: number }>();

export function siteAccessCode(): string {
  return process.env.SITE_ACCESS_CODE?.trim() ?? "";
}

/** The live host always runs with NODE_ENV=production, so the site is private there. */
export function siteIsPrivate(): boolean {
  return process.env.NODE_ENV === "production" || siteAccessCode().length > 0;
}

export function siteAccessSeal(code: string): string {
  return crypto.createHmac("sha256", code).update(SEAL_LABEL).digest("base64url");
}

export function cookieValue(header: string | undefined, name: string): string {
  if (!header) return "";
  const part = header.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  if (!part) return "";
  try { return decodeURIComponent(part.slice(name.length + 1)); } catch { return ""; }
}

export function sealMatches(presented: string, code: string): boolean {
  if (!code || !presented) return false;
  const expected = Buffer.from(siteAccessSeal(code));
  const actual = Buffer.from(presented);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function codeMatches(given: string, code: string): boolean {
  return sealMatches(siteAccessSeal(given), code);
}

export function requestHasSiteAccess(req: { headers: IncomingMessage["headers"] }): boolean {
  if (!siteIsPrivate()) return true;
  const code = siteAccessCode();
  if (!code) return false;
  return sealMatches(cookieValue(req.headers.cookie, SITE_ACCESS_COOKIE), code);
}

export function siteAccessExempt(method: string, path: string): boolean {
  if (path === "/health" || path === "/robots.txt") return true;
  if (method === "POST" && (path === "/api/site-access" || path === "/api/stripe/webhook" || path === "/api/ticket-draws/worker")) return true;
  return false;
}

function tooManyAttempts(ip: string): boolean {
  const now = Date.now();
  const slot = failures.get(ip);
  if (!slot || slot.resetAt <= now) return false;
  return slot.count >= FAILURE_LIMIT;
}

function noteFailure(ip: string) {
  const now = Date.now();
  const slot = failures.get(ip);
  if (!slot || slot.resetAt <= now) failures.set(ip, { count: 1, resetAt: now + FAILURE_WINDOW_MS });
  else slot.count += 1;
}

function clearFailures(ip: string) {
  failures.delete(ip);
}

export function privatePage(state: { locked: boolean; rejected?: boolean; limited?: boolean }): string {
  const message = state.locked
    ? "This preview is private. It is not open to the public, and no entry or payment is accepted here."
    : state.limited
      ? "Too many attempts. Wait a few minutes and try again."
      : state.rejected
        ? "That code is not recognised."
        : "This preview is private. Enter the access code to continue. No entry or payment is accepted here.";
  const form = state.locked ? "" : `<form id="gate">
      <label for="code">Access code</label>
      <input id="code" name="code" type="password" autocomplete="current-password" required />
      <button type="submit">Continue</button>
    </form>
    <script>
      document.getElementById("gate").addEventListener("submit", async (event) => {
        event.preventDefault();
        const code = new FormData(event.currentTarget).get("code");
        const response = await fetch("/api/site-access", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
        if (response.ok) { location.replace("/"); return; }
        const note = document.getElementById("note");
        note.textContent = response.status === 429 ? "Too many attempts. Wait a few minutes and try again." : "That code is not recognised.";
      });
    </script>`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Private preview · LuxePrizeDraw</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #070604; color: #f6edd4; font-family: Georgia, "Times New Roman", serif; }
    main { width: min(28rem, calc(100% - 2rem)); }
    p.brand { margin: 0; letter-spacing: .22em; text-transform: uppercase; font-size: .72rem; color: #e7c56a; }
    h1 { margin: .6rem 0 0; font-size: 2.1rem; font-weight: 700; }
    #note { margin: 1rem 0 0; line-height: 1.5; color: #f0e2b8; }
    form { margin-top: 1.25rem; display: grid; gap: .55rem; }
    label { font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; color: #e7c56a; }
    input { font: inherit; font-size: 1rem; padding: .75rem .85rem; border-radius: .8rem; border: 1px solid #e7c56a88; background: #120e08; color: white; }
    button { font: inherit; font-weight: 700; padding: .8rem 1rem; border: 0; border-radius: 999px; background: linear-gradient(#fff0b0, #e0b03a); color: #1a1204; cursor: pointer; }
  </style>
</head>
<body>
  <main>
    <p class="brand">LuxePrizeDraw</p>
    <h1>Private preview</h1>
    <p id="note">${message}</p>
    ${form}
  </main>
</body>
</html>`;
}

export function installSitePrivacy(app: Express) {
  app.get("/robots.txt", (_req, res) => {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.type("text/plain").send("User-agent: *\nDisallow: /\n");
  });

  app.post("/api/site-access", (req, res) => {
    const code = siteAccessCode();
    if (!siteIsPrivate()) return res.json({ ok: true, private: false });
    if (!code) return res.status(403).json({ error: "private" });
    const ip = req.ip || "unknown";
    if (tooManyAttempts(ip)) return res.status(429).json({ error: "private" });
    const given = typeof req.body?.code === "string" ? req.body.code : "";
    if (!codeMatches(given, code)) {
      noteFailure(ip);
      return res.status(tooManyAttempts(ip) ? 429 : 401).json({ error: "private" });
    }
    clearFailures(ip);
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.append("Set-Cookie", `${SITE_ACCESS_COOKIE}=${siteAccessSeal(code)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}${secure}`);
    res.json({ ok: true });
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!siteIsPrivate()) return next();
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    if (siteAccessExempt(req.method, req.path)) return next();
    if (requestHasSiteAccess(req)) return next();
    if (req.path.startsWith("/api/") || req.path.startsWith("/ws/")) return res.status(401).json({ error: "private" });
    const locked = siteAccessCode().length === 0;
    res.status(401).type("html").send(privatePage({ locked }));
  });
}
