import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

export const POSTAL_STATUSES = ["RECEIVED", "VERIFIED", "REJECTED"] as const;
export type PostalStatus = (typeof POSTAL_STATUSES)[number];

export type PostalEntryInput = {
  drawName: string;
  fullName: string;
  address: string;
  email?: string | null;
  phone?: string | null;
  status?: PostalStatus;
  batchRef?: string | null;
  notes?: string | null;
};

export type PostalEntry = PostalEntryInput & { id: string; createdAt: string; updatedAt: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(\+?\d[\d\s().-]{6,}\d)$/;

function limited(value: unknown, maximumLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

export function validatePostalEntry(input: unknown): { ok: true; value: Required<PostalEntryInput> } | { ok: false; errors: string[] } {
  const raw = (input ?? {}) as Record<string, unknown>;
  const errors: string[] = [];
  const drawName = limited(raw.drawName, 120) || "Headline draw";
  const fullName = limited(raw.fullName, 160);
  const address = limited(raw.address, 400);
  const email = limited(raw.email ?? "", 200) || null;
  const phone = limited(raw.phone ?? "", 40) || null;
  const status = (limited(raw.status ?? "", 20) || "RECEIVED") as PostalStatus;
  const batchRef = limited(raw.batchRef ?? "", 60) || null;
  const notes = limited(raw.notes ?? "", 2000) || null;

  if (!fullName) errors.push("fullName is required.");
  if (!address) errors.push("address is required.");
  if (!POSTAL_STATUSES.includes(status)) errors.push(`status must be one of ${POSTAL_STATUSES.join(", ")}.`);
  if (email && !EMAIL_RE.test(email)) errors.push("email is invalid.");
  if (phone && !PHONE_RE.test(phone)) errors.push("phone is invalid.");
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { drawName, fullName, address, email, phone, status, batchRef, notes } };
}

// Heuristic parser for OCR'd entry slips. Pure and deterministic so it can be
// unit-tested; a human always confirms the result before saving.
export type ParsedSlip = { drawName: string; fullName: string; address: string; email: string | null; phone: string | null; notes: string };

export function parseEntrySlip(text: string): ParsedSlip {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const emailLine = lines.find((l) => EMAIL_RE.test(l));
  const phoneLine = lines.find((l) => PHONE_RE.test(l) && !EMAIL_RE.test(l));
  const drawLine = lines.find((l) => /^(draw|competition|prize)\s*:/i.test(l));
  const remaining = lines.filter((l) => l !== emailLine && l !== phoneLine && l !== drawLine);
  const fullName = remaining[0] ?? "";
  const address = remaining.slice(1, 4).join(", ");
  const extra = remaining.slice(4);
  return {
    drawName: drawLine ? drawLine.replace(/^(draw|competition|prize)\s*:\s*/i, "").slice(0, 120) : "Headline draw",
    fullName: fullName.slice(0, 160),
    address,
    email: emailLine ? emailLine.slice(0, 200) : null,
    phone: phoneLine ? phoneLine.slice(0, 40) : null,
    notes: extra.length ? `Unparsed slip lines: ${extra.join(" | ").slice(0, 1900)}` : "",
  };
}

function database() {
  const url = process.env.POSTAL_ENTRIES_DATABASE_URL || process.env.COMPANY_RECORDS_DATABASE_URL || process.env.ENTROPY_AUDIT_DATABASE_URL;
  if (!url) throw new Error("POSTAL_ENTRIES_DATABASE_URL is not configured.");
  return neon(url);
}

let tablesReady: Promise<void> | undefined;
async function ensureTables() {
  if (!tablesReady) tablesReady = (async () => {
    const sql = database();
    await sql`CREATE TABLE IF NOT EXISTS postal_entries (
      id UUID PRIMARY KEY, draw_name TEXT NOT NULL, full_name TEXT NOT NULL, address TEXT NOT NULL,
      email TEXT, phone TEXT, status TEXT NOT NULL CHECK (status IN ('RECEIVED','VERIFIED','REJECTED')) DEFAULT 'RECEIVED',
      batch_ref TEXT, notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS postal_entries_status_idx ON postal_entries (status, created_at DESC)`;
  })();
  try { await tablesReady; } catch (error) { tablesReady = undefined; throw error; }
}

function rowToEntry(row: Record<string, unknown>): PostalEntry {
  return {
    id: String(row.id), drawName: String(row.draw_name), fullName: String(row.full_name),
    address: String(row.address), email: (row.email as string | null) ?? null, phone: (row.phone as string | null) ?? null,
    status: row.status as PostalStatus, batchRef: (row.batch_ref as string | null) ?? null,
    notes: (row.notes as string | null) ?? null, createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

function matchesSecret(actual: string, expected: string) {
  return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function authorized(request: Request) {
  const secret = process.env.POSTAL_ENTRIES_API_TOKEN || process.env.COMPANY_RECORDS_API_TOKEN;
  return Boolean(secret) && matchesSecret(request.headers.get("authorization") || "", `Bearer ${secret}`);
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

export function isInvalidResult(result: ReturnType<typeof validatePostalEntry>): result is { ok: false; errors: string[] } {
  return result.ok === false;
}

export async function listPostalEntries(filter?: { status?: PostalStatus }) {
  await ensureTables();
  const sql = database();
  const rows = filter?.status
    ? await sql`SELECT * FROM postal_entries WHERE status = ${filter.status} ORDER BY created_at DESC LIMIT 500`
    : await sql`SELECT * FROM postal_entries ORDER BY created_at DESC LIMIT 500`;
  return rows.map(rowToEntry);
}

export async function createPostalEntry(input: PostalEntryInput) {
  await ensureTables();
  const sql = database();
  const id = crypto.randomUUID();
  const rows = await sql`INSERT INTO postal_entries (id, draw_name, full_name, address, email, phone, status, batch_ref, notes)
    VALUES (${id}, ${input.drawName}, ${input.fullName}, ${input.address}, ${input.email ?? null}, ${input.phone ?? null}, ${input.status ?? "RECEIVED"}, ${input.batchRef ?? null}, ${input.notes ?? null})
    RETURNING *`;
  return rowToEntry(rows[0]);
}

export function toCSV(entries: PostalEntry[]): string {
  const cell = (value: string | null | undefined) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header = "id,drawName,fullName,address,email,phone,status,batchRef,notes,createdAt";
  const lines = entries.map((e) => [e.id, e.drawName, e.fullName, e.address, e.email, e.phone, e.status, e.batchRef, e.notes, e.createdAt].map(cell).join(","));
  return [header, ...lines].join("\n");
}
