// Self-contained serverless function — shared logic is inlined because Vercel's Node
// runtime resolves extensionless relative imports unreliably (Node 24 type-stripping:
// ERR_MODULE_NOT_FOUND on ./shared). Keep this file free of relative imports; the
// canonical copy lives in ./shared.ts (used by the frontend and the tests).

import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

const ALLOWED_EVENTS = ["view", "wishlist", "entry_interest", "ticket_game_interest"] as const;
type TrendEvent = typeof ALLOWED_EVENTS[number];

type Supplier = {
  id: "moss-prestige" | "veno-corp-gaming" | "luxe-gaming-bundles";
  name: string;
  category: string;
  emailEnv: "MOSS_PRESTIGE_ALERT_EMAIL" | "VENO_CORP_GAMING_ALERT_EMAIL" | "LUXE_GAMING_BUNDLES_ALERT_EMAIL";
};

const suppliers: Supplier[] = [
  { id: "moss-prestige", name: "Moss Prestige", category: "cars", emailEnv: "MOSS_PRESTIGE_ALERT_EMAIL" },
  { id: "veno-corp-gaming", name: "Veno Corp Gaming", category: "gaming", emailEnv: "VENO_CORP_GAMING_ALERT_EMAIL" },
  { id: "luxe-gaming-bundles", name: "Luxe Gaming Bundles", category: "gaming-bundles", emailEnv: "LUXE_GAMING_BUNDLES_ALERT_EMAIL" },
];

function database() {
  const url = process.env.ENTROPY_AUDIT_DATABASE_URL;
  if (!url) throw new Error("ENTROPY_AUDIT_DATABASE_URL is not configured.");
  return neon(url);
}

let tablesReady: Promise<void> | undefined;
async function ensureTables() {
  if (!tablesReady) tablesReady = (async () => {
    const sql = database();
    await sql`CREATE TABLE IF NOT EXISTS supplier_trend_events (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL,
      category TEXT NOT NULL,
      item_name TEXT NOT NULL,
      event_type TEXT NOT NULL,
      occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS supplier_trend_events_supplier_category_time_idx
      ON supplier_trend_events (supplier_id, category, occurred_at DESC)`;
  })();
  try { await tablesReady; } catch (error) { tablesReady = undefined; throw error; }
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

export function supplierFor(id: string) { return suppliers.find((supplier) => supplier.id === id); }

export async function recordTrendEvent(input: { supplierId: string; category: string; itemName: string; eventType: string }) {
  const supplier = supplierFor(input.supplierId);
  const category = input.category.trim().toLowerCase();
  const itemName = input.itemName.trim().slice(0, 120);
  if (!supplier || supplier.category !== category || !itemName || !ALLOWED_EVENTS.includes(input.eventType as TrendEvent)) throw new Error("Invalid supplier trend event.");
  await ensureTables();
  const sql = database();
  await sql`INSERT INTO supplier_trend_events (id, supplier_id, category, item_name, event_type)
    VALUES (${crypto.randomUUID()}, ${supplier.id}, ${category}, ${itemName}, ${input.eventType})`;
}

export async function prepareDigests() {
  await ensureTables();
  const sql = database();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const digests = [];
  for (const supplier of suppliers) {
    const rows = await sql`SELECT item_name,
      COUNT(*)::int AS interactions,
      COUNT(*) FILTER (WHERE event_type = 'entry_interest')::int AS entry_interest,
      COUNT(*) FILTER (WHERE event_type = 'wishlist')::int AS wishlists,
      COUNT(*) FILTER (WHERE event_type = 'ticket_game_interest')::int AS ticket_game_interest
      FROM supplier_trend_events
      WHERE supplier_id = ${supplier.id} AND occurred_at >= ${since}
      GROUP BY item_name
      ORDER BY interactions DESC, entry_interest DESC, wishlists DESC, item_name ASC
      LIMIT 5`;
    const topItems = rows.map((row) => ({ itemName: row.item_name, interactions: row.interactions, entryInterest: row.entry_interest, wishlists: row.wishlists, ticketGameInterest: row.ticket_game_interest }));
    digests.push({
      supplier: supplier.name,
      category: supplier.category,
      recipientConfigured: Boolean(process.env[supplier.emailEnv]),
      deliveryStatus: "PREPARED_NOT_SENT",
      subject: `LuxePrizeDraw Ltd: ${supplier.category} trend digest`,
      topItems,
      text: topItems.length ? [`Top ${supplier.category} trends from the last 24 hours:`, ...topItems.map((item, index) => `${index + 1}. ${item.itemName} — ${item.interactions} interactions (${item.entryInterest} entry interest, ${item.wishlists} wishlists, ${item.ticketGameInterest} ticket-game interest)`)].join("\n") : `No ${supplier.category} trend activity was recorded in the last 24 hours.`,
    });
  }
  return { generatedAt: new Date().toISOString(), window: "last 24 hours", delivery: "disabled", digests };
}

function matchesSecret(actual: string, expected: string) {
  return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && matchesSecret(request.headers.get("authorization") || "", `Bearer ${secret}`);
}

export function writeAuthorized(request: Request) {
  const secret = process.env.TREND_EVENT_WRITE_SECRET;
  return Boolean(secret) && matchesSecret(request.headers.get("x-trend-event-key") || "", secret);
}

// ---- route handlers ----
export async function GET(request: Request) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  try {
    return json(await prepareDigests());
  } catch (error) {
    console.error("Supplier trend digest error:", error);
    return json({ error: "Trend digest preparation is unavailable." }, 503);
  }
}
