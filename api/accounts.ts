// Player accounts — email + password sign-up, session tokens, persistent profiles.
// Passwords are hashed with scrypt (salted, memory-hard). Older accounts hashed with
// salted SHA-256 still sign in and are re-hashed with scrypt on their next login.
// Sessions are random 256-bit tokens stored with a 30-day TTL; "sign out everywhere"
// revokes every session issued before it. Repeated failed sign-ins are rate limited.
// Players can export or delete their account, and reset a forgotten password by email.
// Storage: Redis when configured (REDIS_URL, as Render Key Value provides, or the Upstash REST pair). If Redis is configured but unreachable the
// account API fails closed (503) instead of writing accounts to a local file. The
// local JSON file is only used when Redis is not configured at all (demo/offline
// sandbox), and can be forbidden with ACCOUNTS_REQUIRE_REDIS=true. Accounts stay free-play: no payments, no cash value —
// identity exists to protect league integrity and persistence across devices.
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { createClient } from "redis";
import { emailConfigured, sendEmail } from "./mailer";

type Entry = { value: string; expiresAt?: number };

export interface Store {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  /** Atomically add 1 and return the new count; the TTL is set when the key is created. */
  incr(key: string, ttlSeconds: number): Promise<number>;
  /** Atomically read and delete a key, so only one caller ever gets its value. */
  take(key: string): Promise<string | null>;
  del(key: string): Promise<void>;
}

function redisStore(): Store {
  const url = process.env.KV_REST_API_URL; const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("no redis env");
  const r = new Redis({ url, token });
  return {
    async get(key) { const v = await r.get<string>(key); return v == null ? null : typeof v === "string" ? v : JSON.stringify(v); },
    async set(key, value, ttl) { if (ttl) await r.set(key, value, { ex: ttl }); else await r.set(key, value); },
    async del(key) { await r.del(key); },
    async take(key) { const v = await r.getdel<string>(key); return v == null ? null : typeof v === "string" ? v : JSON.stringify(v); },
    async incr(key, ttl) {
      const n = await r.incr(key);
      // Also repair a key left without a TTL (e.g. if a previous EXPIRE call failed).
      if (n === 1 || (await r.ttl(key)) === -1) await r.expire(key, ttl);
      return n;
    },
  };
}

/** The open Redis connection, kept so it can be closed (tests and shutdown). */
let redisClient: ReturnType<typeof createClient> | null = null;

/** Closes the Redis connection if one is open, so a process can exit. */
export async function closeAccountStore(): Promise<void> {
  if (redisClient) { await redisClient.quit().catch(() => undefined); redisClient = null; }
  cached = null;
}

/** Redis over the standard protocol, as Render Key Value provides (REDIS_URL). */
async function redisUrlStore(url: string): Promise<Store> {
  const client = createClient({ url });
  redisClient = client;
  client.on("error", (err) => console.error("[accounts] redis error", err.message));
  await client.connect();
  return {
    async get(key) { return client.get(key); },
    async set(key, value, ttl) { if (ttl) await client.set(key, value, { EX: ttl }); else await client.set(key, value); },
    async del(key) { await client.del(key); },
    async take(key) { return client.getDel(key); },
    async incr(key, ttl) {
      const n = await client.incr(key);
      // Also repair a key left without a TTL (e.g. if a previous EXPIRE call failed).
      if (n === 1 || (await client.ttl(key)) === -1) await client.expire(key, ttl);
      return n;
    },
  };
}

const FILE = path.join(process.cwd(), "data", "accounts.json");
function fileStore(): Store {
  const read = (): Record<string, Entry> => {
    try {
      const all = JSON.parse(fs.readFileSync(FILE, "utf8")) as Record<string, Entry>;
      const now = Date.now();
      for (const k of Object.keys(all)) if (all[k].expiresAt && all[k].expiresAt < now) delete all[k];
      return all;
    } catch { return {}; }
  };
  const write = (all: Record<string, Entry>) => {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    const tmp = `${FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(all));
    fs.renameSync(tmp, FILE);
  };
  return {
    async get(key) { return read()[key]?.value ?? null; },
    async set(key, value, ttl) { const all = read(); all[key] = { value, expiresAt: ttl ? Date.now() + ttl * 1000 : undefined }; write(all); },
    async del(key) { const all = read(); delete all[key]; write(all); },
    async take(key) { const all = read(); const v = all[key]?.value ?? null; if (v !== null) { delete all[key]; write(all); } return v; },
    // Synchronous read-modify-write, so atomic within this single-process demo store.
    async incr(key, ttl) {
      const all = read();
      const n = (Number(all[key]?.value) || 0) + 1;
      all[key] = { value: String(n), expiresAt: all[key]?.expiresAt ?? Date.now() + ttl * 1000 };
      write(all);
      return n;
    },
  };
}

let cached: Store | null = null;
/** The shared account store, for other server modules (e.g. the world ranking). */
export function worldStore(): Promise<Store> { return store(); }

/** True when a Redis store is configured, either as REDIS_URL or as the Upstash REST pair. */
const redisConfigured = () => Boolean(process.env.REDIS_URL || (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN));

async function store(): Promise<Store> {
  if (cached) return cached;
  if (process.env.REDIS_URL) {
    // Render Key Value: a failed connection is not cached, so the next request retries.
    const s = await redisUrlStore(process.env.REDIS_URL);
    await Promise.race([s.get("acc:__probe__"), new Promise((_, rej) => setTimeout(() => rej(new Error("redis timeout")), 3000))]);
    cached = s;
    console.log("[accounts] storage: Redis (REDIS_URL)");
    return cached;
  }
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    // Redis is configured: never fall back to a file, or accounts would split
    // between two stores. A failed probe is not cached, so the next request retries.
    const s = redisStore();
    await Promise.race([s.get("acc:__probe__"), new Promise((_, rej) => setTimeout(() => rej(new Error("redis timeout")), 3000))]);
    cached = s;
    console.log("[accounts] storage: Upstash Redis");
    return cached;
  }
  if (process.env.ACCOUNTS_REQUIRE_REDIS === "true") throw new Error("account storage not configured");
  cached = fileStore();
  console.warn("[accounts] storage: local file (demo only) — set KV_REST_API_URL/KV_REST_API_TOKEN for real accounts");
  return cached;
}

// scrypt cost parameters are stored in the hash ("scrypt$N$r$p$hex") so they can be
// raised later without breaking existing accounts. N=2^15, r=8 uses ~32 MiB per hash.
const SCRYPT = { N: 1 << 15, r: 8, p: 1, keylen: 32 };
const scryptAsync = (password: string, salt: string, N: number, r: number, p: number, keylen: number) =>
  new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt(password, salt, keylen, { N, r, p, maxmem: 256 * N * r }, (err, key) => (err ? reject(err) : resolve(key))));

export async function hashPassword(password: string, salt: string): Promise<string> {
  const { N, r, p, keylen } = SCRYPT;
  const key = await scryptAsync(password, salt, N, r, p, keylen);
  return `scrypt$${N}$${r}$${p}$${key.toString("hex")}`;
}

/** Legacy hashes are bare SHA-256 hex; anything not using the current scrypt params needs re-hashing. */
export function needsRehash(passHash: string): boolean {
  const { N, r, p } = SCRYPT;
  return !passHash.startsWith(`scrypt$${N}$${r}$${p}$`);
}

export async function verifyPassword(password: string, salt: string, passHash: string): Promise<boolean> {
  let attempt: Buffer, expected: Buffer;
  if (passHash.startsWith("scrypt$")) {
    const [, n, r, p, hex] = passHash.split("$");
    expected = Buffer.from(hex ?? "", "hex");
    if (!expected.length) return false;
    attempt = await scryptAsync(password, salt, Number(n), Number(r), Number(p), expected.length);
  } else {
    expected = Buffer.from(passHash, "hex");
    attempt = crypto.createHash("sha256").update(`${salt}:${password}`).digest();
  }
  return attempt.length === expected.length && crypto.timingSafeEqual(attempt, expected);
}

export type AccountProfile = {
  id: string;            // ACC-XXXXXXXX
  email: string;
  name: string;
  chips: number;
  createdAt: number;
  lastSeenAt: number;
};

type AccountRecord = AccountProfile & { salt: string; passHash: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SESSION_TTL_S = 30 * 24 * 3600;
// Sign-in attempts per email: after MAX_FAILED_LOGINS within the window, refuse until it expires.
const MAX_FAILED_LOGINS = 10;
const FAILED_LOGIN_WINDOW_S = 15 * 60;

// Session values are "<accountId>:<issuedAtMs>". Older bare-id sessions (issued before
// this format) are treated as revoked, which signs out any token from the leaked store.
async function issueSession(s: Store, accountId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  await s.set(`sess:${token}`, `${accountId}:${Date.now()}`, SESSION_TTL_S);
  return token;
}

function normalizeEmail(email: string) { return email.trim().toLowerCase(); }

function toProfile(rec: AccountRecord): AccountProfile {
  const { salt: _s, passHash: _p, ...profile } = rec;
  return profile;
}

/** Finds an account by its ID or by email, for staff support. Returns null if there is none. */
export async function findProfile(input: string): Promise<AccountProfile | null> {
  const s = await store();
  const q = input.trim();
  const id = q.includes("@") ? await s.get(`acc:email:${normalizeEmail(q)}`) : q;
  if (!id) return null;
  const rec = await readRecord(s, id);
  return rec ? toProfile(rec) : null;
}

async function readRecord(s: Store, id: string): Promise<AccountRecord | null> {
  const raw = await s.get(`acc:id:${id}`);
  if (!raw) return null;
  try { return JSON.parse(raw) as AccountRecord; } catch { return null; }
}

export async function createAccount(email: string, password: string, name: string): Promise<{ ok: true; profile: AccountProfile; token: string } | { ok: false; error: string }> {
  const e = normalizeEmail(email);
  if (!EMAIL_RE.test(e)) return { ok: false, error: "invalid_email" };
  if (password.length < 8) return { ok: false, error: "password_too_short" };
  const s = await store();
  const existing = await s.get(`acc:email:${e}`);
  if (existing) return { ok: false, error: "email_taken" };
  const salt = crypto.randomBytes(16).toString("hex");
  const rec: AccountRecord = {
    id: `ACC-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    email: e, name: name.trim().slice(0, 24) || "Player",
    salt, passHash: await hashPassword(password, salt),
    chips: 1000, createdAt: Date.now(), lastSeenAt: Date.now(),
  };
  await s.set(`acc:id:${rec.id}`, JSON.stringify(rec));
  await s.set(`acc:email:${e}`, rec.id);
  const token = await issueSession(s, rec.id);
  return { ok: true, profile: toProfile(rec), token };
}

export async function login(email: string, password: string): Promise<{ ok: true; profile: AccountProfile; token: string } | { ok: false; error: string }> {
  const e = normalizeEmail(email);
  const s = await store();
  // Every attempt is counted atomically *before* the password is checked, so parallel
  // guesses can't share a stale count. A successful sign-in clears the counter. The
  // window starts at the first attempt and is not extended by later ones.
  const attemptKey = `attempts:${e}`;
  const attempts = await s.incr(attemptKey, FAILED_LOGIN_WINDOW_S);
  if (attempts > MAX_FAILED_LOGINS) return { ok: false, error: "too_many_attempts" };
  const id = await s.get(`acc:email:${e}`);
  const rec = id ? await readRecord(s, id) : null;
  if (!rec || !(await verifyPassword(password, rec.salt, rec.passHash))) {
    return { ok: false, error: "bad_credentials" };
  }
  await s.del(attemptKey);
  const rehashed = needsRehash(rec.passHash) ? await hashPassword(password, rec.salt) : null;
  // Re-read just before writing: if the account was deleted or its password reset while
  // this sign-in was hashing, don't write the stale record back.
  const latest = await readRecord(s, rec.id);
  if (!latest || latest.passHash !== rec.passHash) return { ok: false, error: "bad_credentials" };
  if (rehashed) latest.passHash = rehashed;
  latest.lastSeenAt = Date.now();
  await s.set(`acc:id:${latest.id}`, JSON.stringify(latest));
  const token = await issueSession(s, latest.id);
  return { ok: true, profile: toProfile(latest), token };
}

async function recordForToken(s: Store, token: string): Promise<AccountRecord | null> {
  if (!token || token.length < 32) return null;
  const value = await s.get(`sess:${token}`);
  if (!value) return null;
  const [id, issued] = value.split(":");
  const issuedAt = Number(issued);
  if (!id || !Number.isFinite(issuedAt)) return null;
  const rec = await readRecord(s, id);
  // Kept under its own key so profile writes (sign-in, chip saves) can't overwrite a revocation.
  if (!rec || issuedAt < (Number(await s.get(`acc:revoked:${id}`)) || 0)) return null;
  return rec;
}

export async function profileForToken(token: string): Promise<AccountProfile | null> {
  const rec = await recordForToken(await store(), token);
  return rec ? toProfile(rec) : null;
}

/** Revoke every session for the token's account, including this one. */
export async function logoutEverywhere(token: string): Promise<boolean> {
  const s = await store();
  const rec = await recordForToken(s, token);
  if (!rec) return false;
  await s.set(`acc:revoked:${rec.id}`, String(Date.now() + 1));
  await s.del(`sess:${token}`);
  return true;
}

export async function logout(token: string): Promise<void> {
  try { const s = await store(); await s.del(`sess:${token}`); } catch { /* storage offline */ }
}

/** Persist chip balance for a signed-in account (free-play chips only). */
export async function saveChips(accountId: string, chips: number): Promise<void> {
  const s = await store();
  const rec = await readRecord(s, accountId);
  if (!rec) return;
  rec.chips = Math.max(0, Math.min(1_000_000, Math.floor(chips)));
  await s.set(`acc:id:${accountId}`, JSON.stringify(rec));
}

/** Which account store is in use, for the health endpoint. Never throws. */
export async function storageStatus(): Promise<"redis" | "file" | "unavailable"> {
  try {
    const s = await store();
    if (!redisConfigured()) return "file";
    // Probe on every call: the cached client says nothing about whether Redis is up now.
    await Promise.race([s.get("acc:__probe__"), new Promise((_, rej) => setTimeout(() => rej(new Error("redis timeout")), 3000))]);
    return "redis";
  } catch { return "unavailable"; }
}

/** Everything held on the server about the token's account (UK GDPR access/portability). */
export async function exportAccount(token: string): Promise<Record<string, unknown> | null> {
  const rec = await recordForToken(await store(), token);
  if (!rec) return null;
  return {
    exportedAt: new Date().toISOString(),
    account: { ...toProfile(rec), createdAt: new Date(rec.createdAt).toISOString(), lastSeenAt: new Date(rec.lastSeenAt).toISOString() },
    notes: [
      "Your password is stored only as a scrypt hash and is not included.",
      "Game progress and settings kept in your browser's local storage are not held on our server.",
    ],
  };
}

/** Permanently delete the token's account after re-checking the password. */
export async function deleteAccount(token: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const s = await store();
  const rec = await recordForToken(s, token);
  if (!rec) return { ok: false, error: "not_signed_in" };
  const attemptKey = `attempts:${rec.email}`;
  if ((await s.incr(attemptKey, FAILED_LOGIN_WINDOW_S)) > MAX_FAILED_LOGINS) return { ok: false, error: "too_many_attempts" };
  if (!(await verifyPassword(password, rec.salt, rec.passHash))) return { ok: false, error: "bad_credentials" };
  // Revoke first so any session (on any device) stops working even if a later write lags.
  // The marker holds only the random account id and is kept so revoked tokens stay dead.
  await s.set(`acc:revoked:${rec.id}`, String(Number.MAX_SAFE_INTEGER));
  await s.del(`acc:email:${rec.email}`);
  await s.del(`acc:id:${rec.id}`);
  await s.del(`sess:${token}`);
  await s.del(attemptKey);
  return { ok: true };
}

const RESET_TTL_S = 30 * 60;
const MAX_RESET_REQUESTS = 3;
const RESET_REQUEST_WINDOW_S = 60 * 60;
const resetKey = (token: string) => `reset:${crypto.createHash("sha256").update(token).digest("hex")}`;

/**
 * Email a one-time reset link if the address has an account. The result is the same
 * whether or not it does, so the endpoint can't be used to discover accounts.
 */
export async function requestPasswordReset(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const appUrl = process.env.APP_URL;
  if (!emailConfigured() || !appUrl || !/^https?:\/\//.test(appUrl)) return { ok: false, error: "email_unavailable" };
  const e = normalizeEmail(email);
  if (!EMAIL_RE.test(e)) return { ok: false, error: "invalid_email" };
  const s = await store();
  if ((await s.incr(`resetreq:${e}`, RESET_REQUEST_WINDOW_S)) > MAX_RESET_REQUESTS) return { ok: true };
  const id = await s.get(`acc:email:${e}`);
  if (!id) return { ok: true };
  const token = crypto.randomBytes(32).toString("hex");
  await s.set(resetKey(token), id, RESET_TTL_S);
  const link = `${appUrl.replace(/\/$/, "")}/reset-password?token=${token}`;
  await sendEmail({
    to: e,
    subject: "Reset your LuxePrizeDraw password",
    text: `Someone asked to reset the password for your LuxePrizeDraw free-play account.\n\nTo choose a new password, open this link within 30 minutes:\n${link}\n\nIf you didn't ask for this, ignore this email and your password stays the same.`,
  });
  return { ok: true };
}

/** Set a new password from a reset link; signs the account out everywhere. */
export async function confirmPasswordReset(token: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (password.length < 8) return { ok: false, error: "password_too_short" };
  if (!/^[0-9a-f]{64}$/.test(token)) return { ok: false, error: "invalid_reset_link" };
  const s = await store();
  // take() reads and deletes in one step, so two simultaneous uses of a link can't both succeed.
  const id = await s.take(resetKey(token));
  if (!id) return { ok: false, error: "invalid_reset_link" };
  // Hash before reading the record so the read-modify-write window stays short.
  const salt = crypto.randomBytes(16).toString("hex");
  const passHash = await hashPassword(password, salt);
  const rec = await readRecord(s, id);
  if (!rec) return { ok: false, error: "invalid_reset_link" };
  rec.salt = salt;
  rec.passHash = passHash;
  await s.set(`acc:id:${rec.id}`, JSON.stringify(rec));
  await s.set(`acc:revoked:${rec.id}`, String(Date.now() + 1));
  await s.del(`attempts:${rec.email}`);
  return { ok: true };
}
