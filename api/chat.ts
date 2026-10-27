// Lounge chat with safety controls. Off unless CHAT_ENABLED=true. Every rule here runs on the
// server: a signed-in account is required, the account must confirm it is 18 or over, bans
// and rate limits are enforced, banned words are blocked, every message can be reported,
// players can block one another, and every action is written to a log for review.
import { withLock } from "./lock";
import type { Store } from "./accounts";

export const CHAT_MAX_LENGTH = 200;
export const CHAT_MESSAGES_KEPT = 200;
export const CHAT_PER_MINUTE = 5;
const ROOM = "lounge";
const messagesKey = `chat:messages:${ROOM}`;
const reportsKey = "chat:reports";
const logKey = "chat:log";

/** Starter list of blocked words. Staff can extend it with CHAT_BLOCKED_WORDS (comma separated). */
const STARTER_BLOCKED = ["slur1", "slur2", "kill yourself", "kys"];

export const chatEnabled = (): boolean => process.env.CHAT_ENABLED === "true";

export function blockedWords(): string[] {
  const extra = (process.env.CHAT_BLOCKED_WORDS ?? "").split(",").map((w) => w.trim().toLowerCase()).filter(Boolean);
  return [...STARTER_BLOCKED, ...extra];
}

/** Returns the banned word found in the text, or null. Matching ignores case and simple spacing tricks. */
export function findBlockedWord(text: string, words: string[] = blockedWords()): string | null {
  const lower = text.toLowerCase();
  const squashed = lower.replace(/[^a-z0-9]/g, "");
  for (const w of words) {
    const plain = w.toLowerCase();
    if (lower.includes(plain) || squashed.includes(plain.replace(/[^a-z0-9]/g, ""))) return w;
  }
  return null;
}

export type ChatMessage = { id: string; authorId: string; authorName: string; text: string; at: number };
type Ban = { reason: string; at: number };

async function appendLog(s: Store, entry: Record<string, unknown>): Promise<void> {
  await withLock(s, "chat:log", async () => {
    const log = JSON.parse((await s.get(logKey)) ?? "[]") as unknown[];
    log.push({ ...entry, at: Date.now() });
    await s.set(logKey, JSON.stringify(log.slice(-5000)));
  });
}

async function readMessages(s: Store): Promise<ChatMessage[]> {
  return JSON.parse((await s.get(messagesKey)) ?? "[]") as ChatMessage[];
}

export async function isBanned(s: Store, accountId: string): Promise<Ban | null> {
  const raw = await s.get(`chat:ban:${accountId}`);
  return raw ? (JSON.parse(raw) as Ban) : null;
}

export async function hasConfirmedAge(s: Store, accountId: string): Promise<boolean> {
  return (await s.get(`chat:age:${accountId}`)) === "18+";
}

export async function confirmAge(s: Store, accountId: string): Promise<void> {
  await s.set(`chat:age:${accountId}`, "18+");
  await appendLog(s, { type: "age-confirmed", accountId });
}

export type ChatResult<T = unknown> = { ok: true; value: T } | { ok: false; error: string };

export async function postMessage(s: Store, author: { id: string; name: string }, text: string, now = Date.now()): Promise<ChatResult<ChatMessage>> {
  if (!chatEnabled()) return { ok: false, error: "chat_disabled" };
  const body = text.trim();
  if (!body) return { ok: false, error: "empty_message" };
  if (body.length > CHAT_MAX_LENGTH) return { ok: false, error: "too_long" };
  if (!(await hasConfirmedAge(s, author.id))) return { ok: false, error: "age_not_confirmed" };
  const ban = await isBanned(s, author.id);
  if (ban) return { ok: false, error: "banned" };
  const word = findBlockedWord(body);
  if (word) {
    await appendLog(s, { type: "blocked-word", accountId: author.id, word });
    return { ok: false, error: "blocked_words" };
  }
  const minute = Math.floor(now / 60000);
  const hits = await s.incr(`chat:rl:${author.id}:${minute}`, 90);
  if (hits > CHAT_PER_MINUTE) return { ok: false, error: "slow_down" };

  const message: ChatMessage = { id: `${now.toString(36)}${Math.random().toString(36).slice(2, 7)}`, authorId: author.id, authorName: author.name.slice(0, 24), text: body, at: now };
  await withLock(s, `chat:${ROOM}`, async () => {
    const list = await readMessages(s);
    list.push(message);
    await s.set(messagesKey, JSON.stringify(list.slice(-CHAT_MESSAGES_KEPT)));
  });
  return { ok: true, value: message };
}

/** Recent messages for a viewer, without anyone that viewer has blocked. */
export async function listMessages(s: Store, viewerId: string | null): Promise<ChatMessage[]> {
  const blocked = new Set(viewerId ? (JSON.parse((await s.get(`chat:blocks:${viewerId}`)) ?? "[]") as string[]) : []);
  return (await readMessages(s)).filter((m) => !blocked.has(m.authorId));
}

export async function blockAuthor(s: Store, viewerId: string, authorId: string): Promise<void> {
  await withLock(s, `chat:blocks:${viewerId}`, async () => {
    const list = JSON.parse((await s.get(`chat:blocks:${viewerId}`)) ?? "[]") as string[];
    if (!list.includes(authorId)) list.push(authorId);
    await s.set(`chat:blocks:${viewerId}`, JSON.stringify(list));
  });
}

export async function report(s: Store, reporterId: string, messageId: string, reason: string): Promise<ChatResult<string>> {
  if (!chatEnabled()) return { ok: false, error: "chat_disabled" };
  const message = (await readMessages(s)).find((m) => m.id === messageId);
  if (!message) return { ok: false, error: "no_such_message" };
  const id = `rep-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  await withLock(s, "chat:reports", async () => {
    const list = JSON.parse((await s.get(reportsKey)) ?? "[]") as unknown[];
    list.push({ id, messageId, authorId: message.authorId, text: message.text, reporterId, reason: reason.slice(0, 200), status: "open", at: Date.now() });
    await s.set(reportsKey, JSON.stringify(list.slice(-2000)));
  });
  await appendLog(s, { type: "report", reportId: id, messageId, reporterId });
  return { ok: true, value: id };
}

export async function openReports(s: Store): Promise<unknown[]> {
  return (JSON.parse((await s.get(reportsKey)) ?? "[]") as { status: string }[]).filter((r) => r.status === "open");
}

export async function banAccount(s: Store, accountId: string, reason: string): Promise<void> {
  await s.set(`chat:ban:${accountId}`, JSON.stringify({ reason: reason.slice(0, 200), at: Date.now() }));
  await appendLog(s, { type: "ban", accountId, reason: reason.slice(0, 200) });
}

export async function unbanAccount(s: Store, accountId: string): Promise<void> {
  await s.del(`chat:ban:${accountId}`);
  await appendLog(s, { type: "unban", accountId });
}

export async function resolveReport(s: Store, reportId: string, outcome: "upheld" | "dismissed"): Promise<boolean> {
  let found = false;
  await withLock(s, "chat:reports", async () => {
    const list = JSON.parse((await s.get(reportsKey)) ?? "[]") as { id: string; status: string }[];
    for (const r of list) if (r.id === reportId) { r.status = outcome; found = true; }
    await s.set(reportsKey, JSON.stringify(list));
  });
  if (found) await appendLog(s, { type: "report-resolved", reportId, outcome });
  return found;
}
