// Player accounts — email + password sign-up, session tokens, persistent profiles.
// Passwords are salted + SHA-256 hashed (demo-grade; swap for bcrypt/argon2 in production).
// Sessions are random 256-bit tokens stored with a 30-day TTL.
// Storage: Upstash Redis when reachable (production), otherwise a local JSON file
// (demo/offline sandbox). Accounts stay free-play: no payments, no cash value —
// identity exists to protect league integrity and persistence across devices.
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

type Entry = { value: string; expiresAt?: number };

interface Store {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
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
  };
}

let cached: Store | null = null;
async function store(): Promise<Store> {
  if (cached) return cached;
  try {
    const s = redisStore();
    await Promise.race([s.get("acc:__probe__"), new Promise((_, rej) => setTimeout(() => rej(new Error("redis timeout")), 3000))]);
    cached = s;
    console.log("[accounts] storage: Upstash Redis");
  } catch {
    cached = fileStore();
    console.log("[accounts] storage: local file (demo) — Redis unreachable");
  }
  return cached;
}

const hashPassword = (password: string, salt: string) =>
  crypto.createHash("sha256").update(`${salt}:${password}`).digest("hex");

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

function normalizeEmail(email: string) { return email.trim().toLowerCase(); }

function toProfile(rec: AccountRecord): AccountProfile {
  const { salt: _s, passHash: _p, ...profile } = rec;
  return profile;
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
    salt, passHash: hashPassword(password, salt),
    chips: 1000, createdAt: Date.now(), lastSeenAt: Date.now(),
  };
  await s.set(`acc:id:${rec.id}`, JSON.stringify(rec));
  await s.set(`acc:email:${e}`, rec.id);
  const token = crypto.randomBytes(32).toString("hex");
  await s.set(`sess:${token}`, rec.id, SESSION_TTL_S);
  return { ok: true, profile: toProfile(rec), token };
}

export async function login(email: string, password: string): Promise<{ ok: true; profile: AccountProfile; token: string } | { ok: false; error: string }> {
  const e = normalizeEmail(email);
  const s = await store();
  const id = await s.get(`acc:email:${e}`);
  if (!id) return { ok: false, error: "bad_credentials" };
  const rec = await readRecord(s, id);
  if (!rec) return { ok: false, error: "bad_credentials" };
  const attempt = hashPassword(password, rec.salt);
  if (attempt.length !== rec.passHash.length || !crypto.timingSafeEqual(Buffer.from(attempt), Buffer.from(rec.passHash))) {
    return { ok: false, error: "bad_credentials" };
  }
  rec.lastSeenAt = Date.now();
  await s.set(`acc:id:${rec.id}`, JSON.stringify(rec));
  const token = crypto.randomBytes(32).toString("hex");
  await s.set(`sess:${token}`, rec.id, SESSION_TTL_S);
  return { ok: true, profile: toProfile(rec), token };
}

export async function profileForToken(token: string): Promise<AccountProfile | null> {
  if (!token || token.length < 32) return null;
  const s = await store();
  const id = await s.get(`sess:${token}`);
  if (!id) return null;
  const rec = await readRecord(s, id);
  return rec ? toProfile(rec) : null;
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
