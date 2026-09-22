import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

export const companyTypes = ["FREEZONE", "MAINLAND", "OFFSHORE", "OTHER"] as const;
export const licenseStatuses = ["PENDING", "ACTIVE", "SUSPENDED", "EXPIRED", "DISSOLVED"] as const;
type CompanyType = typeof companyTypes[number];
type LicenseStatus = typeof licenseStatuses[number];

type CompanyInput = {
  legalName: string;
  tradeName: string | null;
  jurisdiction: string;
  companyType: CompanyType;
  licenseStatus: LicenseStatus;
  contactEmail: string;
  websiteUrl: string | null;
  registeredAddress: string | null;
  notes: string | null;
};

export class CompanyInputError extends Error {}

const text = (value: unknown, max: number, required = false) => {
  if (typeof value !== "string") {
    if (required) throw new CompanyInputError("Required text field is missing.");
    return null;
  }
  const normalized = value.trim();
  if (!normalized) {
    if (required) throw new CompanyInputError("Required text field is missing.");
    return null;
  }
  if (normalized.length > max) throw new CompanyInputError("Text field exceeds its limit.");
  return normalized;
};

function enumValue<T extends readonly string[]>(value: unknown, allowed: T, fallback?: T[number]) {
  if (value === undefined && fallback) return fallback;
  if (typeof value !== "string" || !allowed.includes(value)) throw new CompanyInputError("Invalid enum value.");
  return value as T[number];
}

function email(value: unknown) {
  const normalized = text(value, 254, true)!;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new CompanyInputError("Invalid email address.");
  return normalized.toLowerCase();
}

function url(value: unknown) {
  const normalized = text(value, 2048);
  if (!normalized) return null;
  try {
    const parsed = new URL(normalized);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new CompanyInputError("Invalid protocol.");
    return parsed.toString();
  } catch {
    throw new CompanyInputError("Invalid website URL.");
  }
}

export function parseCompanyInput(body: unknown): CompanyInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new CompanyInputError("A JSON object is required.");
  const input = body as Record<string, unknown>;
  return {
    legalName: text(input.legalName, 160, true)!,
    tradeName: text(input.tradeName, 160),
    jurisdiction: text(input.jurisdiction, 120, true)!,
    companyType: enumValue(input.companyType, companyTypes),
    licenseStatus: enumValue(input.licenseStatus, licenseStatuses, "PENDING"),
    contactEmail: email(input.contactEmail),
    websiteUrl: url(input.websiteUrl),
    registeredAddress: text(input.registeredAddress, 500),
    notes: text(input.notes, 5_000),
  };
}

function database() {
  const connectionString = process.env.ENTROPY_AUDIT_DATABASE_URL;
  if (!connectionString) throw new Error("Company database is not configured.");
  return neon(connectionString);
}

function matchesSecret(actual: string, expected: string) {
  return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function authorized(request: Request) {
  const secret = process.env.COMPANY_RECORDS_ADMIN_SECRET;
  return Boolean(secret) && matchesSecret(request.headers.get("authorization") || "", `Bearer ${secret}`);
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

export async function listCompanies() {
  const sql = database();
  return sql`SELECT id, legal_name AS "legalName", trade_name AS "tradeName", jurisdiction,
    company_type AS "companyType", license_status AS "licenseStatus", contact_email AS "contactEmail",
    website_url AS "websiteUrl", registered_address AS "registeredAddress", notes,
    created_at AS "createdAt", updated_at AS "updatedAt"
    FROM companies ORDER BY legal_name ASC`;
}

export async function createCompany(input: CompanyInput) {
  const sql = database();
  const id = crypto.randomUUID();
  const rows = await sql`INSERT INTO companies (
    id, legal_name, trade_name, jurisdiction, company_type, license_status, contact_email,
    website_url, registered_address, notes
  ) VALUES (
    ${id}, ${input.legalName}, ${input.tradeName}, ${input.jurisdiction}, ${input.companyType},
    ${input.licenseStatus}, ${input.contactEmail}, ${input.websiteUrl}, ${input.registeredAddress}, ${input.notes}
  ) RETURNING id, legal_name AS "legalName", trade_name AS "tradeName", jurisdiction,
    company_type AS "companyType", license_status AS "licenseStatus", contact_email AS "contactEmail",
    website_url AS "websiteUrl", registered_address AS "registeredAddress", notes,
    created_at AS "createdAt", updated_at AS "updatedAt"`;
  return rows[0];
}


function validId(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new CompanyInputError("Invalid company ID.");
  }
  return id;
}

export async function getCompany(id: string) {
  const sql = database();
  const rows = await sql`SELECT id, legal_name AS "legalName", trade_name AS "tradeName", jurisdiction,
    company_type AS "companyType", license_status AS "licenseStatus", contact_email AS "contactEmail",
    website_url AS "websiteUrl", registered_address AS "registeredAddress", notes,
    created_at AS "createdAt", updated_at AS "updatedAt"
    FROM companies WHERE id = ${validId(id)}`;
  return rows[0] || null;
}

export async function replaceCompany(id: string, input: CompanyInput) {
  const sql = database();
  const rows = await sql`UPDATE companies SET legal_name = ${input.legalName}, trade_name = ${input.tradeName},
    jurisdiction = ${input.jurisdiction}, company_type = ${input.companyType}, license_status = ${input.licenseStatus},
    contact_email = ${input.contactEmail}, website_url = ${input.websiteUrl}, registered_address = ${input.registeredAddress},
    notes = ${input.notes}, updated_at = NOW()
    WHERE id = ${validId(id)}
    RETURNING id, legal_name AS "legalName", trade_name AS "tradeName", jurisdiction,
    company_type AS "companyType", license_status AS "licenseStatus", contact_email AS "contactEmail",
    website_url AS "websiteUrl", registered_address AS "registeredAddress", notes,
    created_at AS "createdAt", updated_at AS "updatedAt"`;
  return rows[0] || null;
}

export async function deleteCompany(id: string) {
  const sql = database();
  const rows = await sql`DELETE FROM companies WHERE id = ${validId(id)} RETURNING id`;
  return Boolean(rows[0]);
}
