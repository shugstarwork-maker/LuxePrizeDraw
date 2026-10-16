// Self-contained serverless function — shared logic is inlined because Vercel's Node
// runtime resolves extensionless relative imports unreliably (Node 24 type-stripping:
// ERR_MODULE_NOT_FOUND on ./shared). Keep this file free of relative imports; the
// canonical copy lives in ./shared.ts (used by the frontend and the tests).

import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

export const COMPANY_STATUSES = ["CONFIRMED", "OPPORTUNITY", "ARCHIVED"] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export type CompanyRecordInput = {
  companyName: string;
  companyNumber?: string | null;
  status?: CompanyStatus;
  category?: string;
  contactReference: string;
  evidenceReference?: string | null;
  notes?: string | null;
};

export type CompanyRecord = CompanyRecordInput & { id: string; createdAt: string; updatedAt: string };

function limited(value: unknown, maximumLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

// Returns a normalised record on success or a list of field errors; never throws on bad input.
export function validateCompanyRecord(input: unknown): { ok: true; value: Required<Omit<CompanyRecordInput, "companyNumber" | "evidenceReference" | "notes">> & Pick<CompanyRecordInput, "companyNumber" | "evidenceReference" | "notes"> } | { ok: false; errors: string[] } {
  const raw = (input ?? {}) as Record<string, unknown>;
  const errors: string[] = [];
  const companyName = limited(raw.companyName, 160);
  const companyNumber = limited(raw.companyNumber ?? "", 20) || null;
  const status = (limited(raw.status ?? "", 20) || "OPPORTUNITY") as CompanyStatus;
  const category = limited(raw.category ?? "", 60) || "partnership";
  const contactReference = limited(raw.contactReference, 200);
  const evidenceReference = limited(raw.evidenceReference ?? "", 120) || null;
  const notes = limited(raw.notes ?? "", 2000) || null;

  if (!companyName) errors.push("companyName is required.");
  if (!COMPANY_STATUSES.includes(status)) errors.push(`status must be one of ${COMPANY_STATUSES.join(", ")}.`);
  if (!contactReference) errors.push("contactReference is required.");
  if (status === "CONFIRMED" && !evidenceReference) errors.push("evidenceReference is required when status is CONFIRMED.");
  if (raw.companyName !== undefined && typeof raw.companyName !== "string") errors.push("companyName must be a string.");
  if (errors.length) return { ok: false, errors };

  return { ok: true, value: { companyName, companyNumber, status, category, contactReference, evidenceReference, notes } };
}

function database() {
  const url = process.env.COMPANY_RECORDS_DATABASE_URL || process.env.ENTROPY_AUDIT_DATABASE_URL;
  if (!url) throw new Error("COMPANY_RECORDS_DATABASE_URL is not configured.");
  return neon(url);
}

let tablesReady: Promise<void> | undefined;
async function ensureTables() {
  if (!tablesReady) tablesReady = (async () => {
    const sql = database();
    await sql`CREATE TABLE IF NOT EXISTS company_records (
      id UUID PRIMARY KEY,
      company_name TEXT NOT NULL,
      company_number TEXT,
      status TEXT NOT NULL CHECK (status IN ('CONFIRMED','OPPORTUNITY','ARCHIVED')) DEFAULT 'OPPORTUNITY',
      category TEXT NOT NULL DEFAULT 'partnership',
      contact_reference TEXT NOT NULL,
      evidence_reference TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS company_records_status_idx ON company_records (status, company_name)`;
  })();
  try { await tablesReady; } catch (error) { tablesReady = undefined; throw error; }
}

function rowToRecord(row: Record<string, unknown>): CompanyRecord {
  return {
    id: String(row.id),
    companyName: String(row.company_name),
    companyNumber: (row.company_number as string | null) ?? null,
    status: row.status as CompanyStatus,
    category: String(row.category),
    contactReference: String(row.contact_reference),
    evidenceReference: (row.evidence_reference as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function matchesSecret(actual: string, expected: string) {
  return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function authorized(request: Request) {
  const secret = process.env.COMPANY_RECORDS_API_TOKEN;
  return Boolean(secret) && matchesSecret(request.headers.get("authorization") || "", `Bearer ${secret}`);
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

export function isValidId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function listCompanyRecords(filter?: { status?: CompanyStatus }) {
  await ensureTables();
  const sql = database();
  const rows = filter?.status
    ? await sql`SELECT * FROM company_records WHERE status = ${filter.status} ORDER BY company_name ASC`
    : await sql`SELECT * FROM company_records ORDER BY company_name ASC`;
  return rows.map(rowToRecord);
}

export async function createCompanyRecord(input: CompanyRecordInput) {
  await ensureTables();
  const sql = database();
  const id = crypto.randomUUID();
  const rows = await sql`INSERT INTO company_records (id, company_name, company_number, status, category, contact_reference, evidence_reference, notes)
    VALUES (${id}, ${input.companyName}, ${input.companyNumber ?? null}, ${input.status ?? "OPPORTUNITY"}, ${input.category ?? "partnership"}, ${input.contactReference}, ${input.evidenceReference ?? null}, ${input.notes ?? null})
    RETURNING *`;
  return rowToRecord(rows[0]);
}

export async function getCompanyRecord(id: string) {
  await ensureTables();
  const sql = database();
  const rows = await sql`SELECT * FROM company_records WHERE id = ${id}`;
  return rows[0] ? rowToRecord(rows[0]) : null;
}

export async function replaceCompanyRecord(id: string, input: CompanyRecordInput) {
  await ensureTables();
  const sql = database();
  const rows = await sql`UPDATE company_records SET
      company_name = ${input.companyName}, company_number = ${input.companyNumber ?? null}, status = ${input.status ?? "OPPORTUNITY"},
      category = ${input.category ?? "partnership"}, contact_reference = ${input.contactReference},
      evidence_reference = ${input.evidenceReference ?? null}, notes = ${input.notes ?? null}, updated_at = NOW()
    WHERE id = ${id} RETURNING *`;
  return rows[0] ? rowToRecord(rows[0]) : null;
}

export async function deleteCompanyRecord(id: string) {
  await ensureTables();
  const sql = database();
  const rows = await sql`DELETE FROM company_records WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export type CompanyRecordValue = Required<Omit<CompanyRecordInput, "companyNumber" | "evidenceReference" | "notes">> & Pick<CompanyRecordInput, "companyNumber" | "evidenceReference" | "notes">;
export type CompanyRecordValidation = { ok: true; value: CompanyRecordValue } | { ok: false; errors: string[] };
export function isInvalidResult(result: CompanyRecordValidation): result is { ok: false; errors: string[] } {
  return result.ok === false;
}

// ---- route handlers ----
function recordId(url: string) {
  const id = new URL(url).pathname.split("/").filter(Boolean).pop() || "";
  return isValidId(id) ? id : null;
}

export async function GET(request: Request) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  const id = recordId(request.url);
  if (!id) return json({ error: "A valid record id is required." }, 400);
  const record = await getCompanyRecord(id);
  return record ? json({ record }) : json({ error: "Company record not found." }, 404);
}

export async function PUT(request: Request) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  const id = recordId(request.url);
  if (!id) return json({ error: "A valid record id is required." }, 400);
  try {
    const parsed = validateCompanyRecord(await request.json());
    if (isInvalidResult(parsed)) {
      return json({ error: "Invalid company record.", details: parsed.errors }, 400);
    }
    const record = await replaceCompanyRecord(id, parsed.value);
    return record ? json({ record }) : json({ error: "Company record not found." }, 404);
  } catch {
    return json({ error: "Invalid company record." }, 400);
  }
}

export async function DELETE(request: Request) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  const id = recordId(request.url);
  if (!id) return json({ error: "A valid record id is required." }, 400);
  return (await deleteCompanyRecord(id)) ? json({ deleted: true }) : json({ error: "Company record not found." }, 404);
}
