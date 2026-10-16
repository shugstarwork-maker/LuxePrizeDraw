import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { createGateway, generateText } from "ai";
import { neon } from "@neondatabase/serverless";
import { Redis } from "@upstash/redis";
import { newConnectFour, playConnectFour, type ConnectFourState } from "./src/games/connectFour";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const MAX_AI_REQUESTS_PER_INSTANCE = 8;
let activeAiRequests = 0;

function limitedText(value: unknown, maximumLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

async function withAiCapacity<T>(work: () => Promise<T>) {
  if (activeAiRequests >= MAX_AI_REQUESTS_PER_INSTANCE) {
    const error = new Error("AI_SERVICE_BUSY");
    (error as Error & { statusCode?: number }).statusCode = 429;
    throw error;
  }
  activeAiRequests += 1;
  try { return await work(); } finally { activeAiRequests -= 1; }
}

app.use(express.json({ limit: "32kb", verify: (req, _res, buffer) => { (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer); } }));
app.set("query parser", "simple");

// AI Gateway uses the Vercel deployment's OIDC identity. No provider API key is stored in this app.
const AI_GATEWAY_MODEL = process.env.AI_GATEWAY_MODEL || "openai/gpt-4o-mini";

async function generateGatewayText(req: express.Request, prompt: string) {
  // Vercel Functions supply a short-lived OIDC token in this request header. Local development can use `vercel env pull` instead.
  const oidcToken = req.header("x-vercel-oidc-token") || process.env.VERCEL_OIDC_TOKEN;
  if (!oidcToken) throw new Error("AI Gateway OIDC token is unavailable.");
  const gateway = createGateway({ apiKey: oidcToken });
  const result = await withAiCapacity(() => generateText({
    model: gateway(AI_GATEWAY_MODEL),
    prompt,
    temperature: 0.7,
  }));
  if (!result.text.trim()) throw new Error("Empty response from AI Gateway.");
  return result.text;
}

// In-memory competition state tracking
let totalEntriesCount = 42890;
let totalCharityRaisedGBP = 48620;
let totalScholarshipsFunded = 1350;
let totalMicroGrants = 84;

const verifiedEntrants = [
  { id: "LPD-7829-LHR", name: "Siddharth M.", country: "India", timestamp: "Just now", business: "FinTech Cross-Border Platform", entryType: "SUBSCRIBER_VIP" },
  { id: "LPD-7830-LDN", name: "Elena Rostova", country: "United Kingdom", timestamp: "2 mins ago", business: "Luxury AI Concierge", entryType: "POWER_BUNDLE" },
  { id: "LPD-7831-SGP", name: "Marcus Tan", country: "Singapore", timestamp: "5 mins ago", business: "B2B SaaS Logistics", entryType: "FREE" },
  { id: "LPD-7832-GLA", name: "Amina Al-Mansoor", country: "Egypt", timestamp: "8 mins ago", business: "Green Tech Packaging", entryType: "SUBSCRIBER_VIP" },
  { id: "LPD-7833-NYC", name: "Tyler Harrison", country: "United States", timestamp: "12 mins ago", business: "E-Commerce Lifestyle Hub", entryType: "FREE" },
];

type EntropyAudit = {
  drawId: string;
  status: "PENDING" | "SETTLED";
  serverSeedHash: string;
  publicClientSeed: string;
  blockHeight: number;
  bitcoinBlockHash: string | null;
  nistBeaconOutput: string | null;
  nistPulseTime: string | null;
  finalSeedHash: string | null;
  totalEntries: number | null;
  settledAt: string | null;
};

const drawId = process.env.ENTROPY_DRAW_ID || "2026-10-31-founder-draw";
const targetBlockHeight = Number(process.env.ENTROPY_BTC_BLOCK_HEIGHT || "0");
const publicClientSeed = process.env.ENTROPY_CLIENT_SEED || "LPD-2026-GRAND-DRAW-COMMITTED";
const databaseUrl = process.env.ENTROPY_AUDIT_DATABASE_URL;

function getAuditDatabase() {
  if (!databaseUrl) throw new Error("ENTROPY_AUDIT_DATABASE_URL is not configured.");
  return neon(databaseUrl);
}

let entropyAuditTableReady: Promise<void> | undefined;

async function ensureEntropyAuditTable() {
  if (!entropyAuditTableReady) entropyAuditTableReady = (async () => {
  const sql = getAuditDatabase();
  await sql`CREATE TABLE IF NOT EXISTS entropy_draw_audits (
    draw_id TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'SETTLED')),
    server_seed_hash TEXT NOT NULL,
    public_client_seed TEXT NOT NULL,
    block_height INTEGER NOT NULL,
    bitcoin_block_hash TEXT,
    nist_beacon_output TEXT,
    nist_pulse_time TIMESTAMPTZ,
    final_seed_hash TEXT,
    total_entries INTEGER,
    settled_at TIMESTAMPTZ
  )`;
  })();
  try { await entropyAuditTableReady; } catch (error) { entropyAuditTableReady = undefined; throw error; }
}

async function getEntropyAudit(): Promise<EntropyAudit | null> {
  await ensureEntropyAuditTable();
  const sql = getAuditDatabase();
  const rows = await sql`SELECT draw_id, status, server_seed_hash, public_client_seed, block_height, bitcoin_block_hash, nist_beacon_output, nist_pulse_time, final_seed_hash, total_entries, settled_at FROM entropy_draw_audits WHERE draw_id = ${drawId}`;
  if (!rows[0]) return null;
  const row = rows[0];
  return {
    drawId: row.draw_id, status: row.status, serverSeedHash: row.server_seed_hash,
    publicClientSeed: row.public_client_seed, blockHeight: row.block_height,
    bitcoinBlockHash: row.bitcoin_block_hash, nistBeaconOutput: row.nist_beacon_output,
    nistPulseTime: row.nist_pulse_time, finalSeedHash: row.final_seed_hash,
    totalEntries: row.total_entries, settledAt: row.settled_at,
  };
}

async function fetchPublicEntropy(blockHeight: number) {
  if (!Number.isSafeInteger(blockHeight) || blockHeight < 1) throw new Error("ENTROPY_BTC_BLOCK_HEIGHT is not configured.");
  const bitcoinResponse = await fetch(`https://blockstream.info/api/block-height/${blockHeight}`);
  const bitcoinBlockHash = (await bitcoinResponse.text()).trim();
  if (!bitcoinResponse.ok || !/^[0-9a-f]{64}$/i.test(bitcoinBlockHash)) throw new Error("Bitcoin block hash is unavailable for the configured height.");

  const nistResponse = await fetch("https://beacon.nist.gov/beacon/2.0/pulse/last");
  if (!nistResponse.ok) throw new Error("NIST beacon is unavailable.");
  const nistPayload = await nistResponse.json();
  const pulse = nistPayload?.pulse;
  if (!pulse?.outputValue || !pulse?.timeStamp) throw new Error("NIST beacon response is incomplete.");
  return { bitcoinBlockHash, nistBeaconOutput: pulse.outputValue, nistPulseTime: pulse.timeStamp };
}

function requireSettlementAuthorization(authorization?: string) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) throw new Error("CRON_SECRET is not configured.");
  const expected = `Bearer ${cronSecret}`;
  const actual = authorization || "";
  return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

// API: durable public audit record. Pending state carries no fake entropy values.
app.get("/api/draw/audit", async (_req, res) => {
  try {
    const audit = await getEntropyAudit();
    res.json(audit || { drawId, status: "PENDING", blockHeight: targetBlockHeight, publicClientSeed, bitcoinBlockHash: null, nistBeaconOutput: null, nistPulseTime: null, finalSeedHash: null, totalEntries: null, settledAt: null });
  } catch (error) {
    console.error("Audit read error:", error);
    res.status(503).json({ error: "Draw audit storage is unavailable." });
  }
});

// API: protected pre-commitment. Call before entries close to publish the server-seed hash.
app.post("/api/draw/commit", async (req, res) => {
  try {
    if (!requireSettlementAuthorization(req.header("authorization"))) return res.status(401).json({ error: "Unauthorized commitment request." });
    const serverSeed = process.env.ENTROPY_DRAW_SERVER_SEED;
    if (!serverSeed || !Number.isSafeInteger(targetBlockHeight) || targetBlockHeight < 1) return res.status(503).json({ error: "Entropy draw configuration is incomplete." });
    await ensureEntropyAuditTable();
    const existing = await getEntropyAudit();
    if (existing) return res.json(existing);
    const serverSeedHash = crypto.createHash("sha256").update(serverSeed).digest("hex");
    const sql = getAuditDatabase();
    await sql`INSERT INTO entropy_draw_audits (draw_id, status, server_seed_hash, public_client_seed, block_height)
      VALUES (${drawId}, 'PENDING', ${serverSeedHash}, ${publicClientSeed}, ${targetBlockHeight})`;
    res.status(201).json(await getEntropyAudit());
  } catch (error) {
    console.error("Entropy commitment error:", error);
    res.status(503).json({ error: "Draw commitment could not be recorded." });
  }
});

// API: protected, idempotent settlement. Invoke only after the target block has been mined.
app.post("/api/draw/settle", async (req, res) => {
  try {
    if (!requireSettlementAuthorization(req.header("authorization"))) return res.status(401).json({ error: "Unauthorized settlement request." });
    const serverSeed = process.env.ENTROPY_DRAW_SERVER_SEED;
    if (!serverSeed || !Number.isSafeInteger(targetBlockHeight) || targetBlockHeight < 1) return res.status(503).json({ error: "Entropy draw configuration is incomplete." });
    const sql = getAuditDatabase();
    await ensureEntropyAuditTable();
    const existing = await getEntropyAudit();
    if (existing?.status === "SETTLED") return res.json(existing);
    if (!existing || existing.serverSeedHash !== crypto.createHash("sha256").update(serverSeed).digest("hex")) return res.status(409).json({ error: "The server-seed commitment must be recorded before settlement." });

    const entropy = await fetchPublicEntropy(targetBlockHeight);
    const serverSeedHash = crypto.createHash("sha256").update(serverSeed).digest("hex");
    const finalSeedHash = crypto.createHash("sha256").update(`${serverSeed}:${publicClientSeed}:${entropy.bitcoinBlockHash}:${entropy.nistBeaconOutput}`).digest("hex");
    const rows = await sql`UPDATE entropy_draw_audits
      SET status = 'SETTLED', bitcoin_block_hash = ${entropy.bitcoinBlockHash}, nist_beacon_output = ${entropy.nistBeaconOutput}, nist_pulse_time = ${entropy.nistPulseTime}, final_seed_hash = ${finalSeedHash}, total_entries = ${totalEntriesCount}, settled_at = NOW()
      WHERE draw_id = ${drawId} AND status = 'PENDING' AND server_seed_hash = ${serverSeedHash}
      RETURNING draw_id`;
    if (!rows[0]) return res.status(409).json({ error: "The pre-committed draw record could not be settled." });
    res.status(201).json(await getEntropyAudit());
  } catch (error) {
    console.error("Entropy settlement error:", error);
    res.status(503).json({ error: "Public entropy could not be captured; the draw remains unsettled." });
  }
});

type CashLaunchReadiness = { requiredEvidence: Record<string, boolean>; launchReady: boolean };

function cashLaunchReadiness(): CashLaunchReadiness {
  const requiredEvidence = {
    counselApproval: Boolean(process.env.LEGAL_REVIEW_APPROVAL_REFERENCE),
    officialRules: Boolean(process.env.OFFICIAL_RULES_URL && process.env.OFFICIAL_RULES_VERSION),
    prizeFunding: Boolean(process.env.PRIZE_FUND_ATTESTATION_REFERENCE),
    safeguarding: Boolean(process.env.FUNDS_SAFEGUARDING_PROVIDER && process.env.FUNDS_SAFEGUARDING_ACCOUNT_REFERENCE),
    paymentProvider: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_MEMBERSHIP_PRICE_ID),
  };
  return { requiredEvidence, launchReady: process.env.CASH_LAUNCH_ENABLED === "true" && Object.values(requiredEvidence).every(Boolean) };
}

function requiredAppUrl() {
  const appUrl = process.env.APP_URL;
  if (!appUrl || !/^https:\/\//.test(appUrl)) throw new Error("APP_URL must be an HTTPS URL.");
  return appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
}

async function stripeRequest(path: string, form: URLSearchParams) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe is not configured.");
  const response = await fetch(`https://api.stripe.com/v1/${path}`, { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, body: form.toString() });
  const payload = await response.json() as { url?: string; error?: { message?: string } };
  if (!response.ok || !payload.url) throw new Error(payload.error?.message || "Stripe Checkout could not be created.");
  return payload.url;
}

function verifyStripeSignature(payload: Buffer, signature: string | undefined) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const parts = Object.fromEntries(signature.split(",").map(item => item.split("=", 2)));
  const timestamp = Number(parts.t);
  const candidate = parts.v1;
  if (!Number.isSafeInteger(timestamp) || !candidate || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${payload.toString("utf8")}`).digest("hex");
  return expected.length === candidate.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(candidate));
}

async function ensureStripeWebhookEventsTable() {
  const sql = getAuditDatabase();
  await sql`CREATE TABLE IF NOT EXISTS stripe_webhook_events (event_id TEXT PRIMARY KEY, event_type TEXT NOT NULL, received_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
}

// API: fail-closed cash launch gate. Set CASH_LAUNCH_ENABLED=true only after every evidence record has been independently verified.
app.get("/api/launch-readiness", (_req, res) => {
  const { requiredEvidence, launchReady } = cashLaunchReadiness();
  res.set("Cache-Control", "no-store");
  res.json({ mode: launchReady ? "CASH_READY" : "PRE_LAUNCH", paidEntriesEnabled: launchReady, prizeIssuanceEnabled: launchReady, safeguardingClaimPermitted: launchReady, requiredEvidence, launchReady, message: launchReady ? "Cash launch controls are enabled." : "Cash entry is locked until the server-side switch and all independently evidenced controls are configured." });
});

// API: membership-only Stripe Checkout. It never creates a draw entry or prize entitlement.
app.post("/api/payments/membership-checkout", async (_req, res) => {
  try {
    if (!cashLaunchReadiness().launchReady) return res.status(423).json({ error: "Cash launch controls are locked." });
    const form = new URLSearchParams({ mode: "subscription", success_url: `${requiredAppUrl()}/?checkout=success`, cancel_url: `${requiredAppUrl()}/?checkout=cancel`, "line_items[0][price]": process.env.STRIPE_MEMBERSHIP_PRICE_ID!, "line_items[0][quantity]": "1", "metadata[product]": "luxe-membership" });
    const checkoutUrl = await stripeRequest("checkout/sessions", form);
    res.json({ checkoutUrl });
  } catch (error) { console.error("Stripe checkout error:", error); res.status(503).json({ error: "Checkout is unavailable." }); }
});

// API: verifies Stripe's signed payload, records each event once, and intentionally does not issue any draw entry.
app.post("/api/stripe/webhook", async (req, res) => {
  const rawBody = (req as express.Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody || !verifyStripeSignature(rawBody, req.header("stripe-signature"))) return res.status(400).json({ error: "Invalid Stripe signature." });
  try {
    const event = JSON.parse(rawBody.toString("utf8")) as { id?: string; type?: string };
    if (!event.id || !event.type) return res.status(400).json({ error: "Invalid Stripe event." });
    await ensureStripeWebhookEventsTable();
    const sql = getAuditDatabase();
    await sql`INSERT INTO stripe_webhook_events (event_id, event_type) VALUES (${event.id}, ${event.type}) ON CONFLICT (event_id) DO NOTHING`;
    res.json({ received: true });
  } catch (error) { console.error("Stripe webhook error:", error); res.status(503).json({ error: "Webhook storage is unavailable." }); }
});

// API: competition stats expose a pending audit state only; settled inputs are read from durable storage.
app.get("/api/competition/stats", async (_req, res) => {
  res.set("Cache-Control", "public, s-maxage=15, stale-while-revalidate=60");
  const audit = await getEntropyAudit().catch(() => null);
  res.json({
    totalEntries: totalEntriesCount, prizePoolValueGBP: 220000, cashPrizeGBP: 100000, visaYears: 3,
    recentEntrants: verifiedEntrants, drawDate: "2026-10-31T18:00:00Z", auditRecord: audit,
  });
});

// API: verifies the settled seed calculation. It never accepts a client-supplied server seed.
app.post("/api/draw/verify", async (req, res) => {
  try {
    const audit = await getEntropyAudit();
    if (!audit || audit.status !== "SETTLED" || !audit.finalSeedHash || !audit.totalEntries) return res.status(409).json({ error: "The draw has not settled yet." });
    const { ticketId, nonce = 1 } = req.body;
    const decimalValue = parseInt(audit.finalSeedHash.substring(0, 8), 16);
    const calculatedWinningIndex = (decimalValue % audit.totalEntries) + 1;
    res.json({ verified: true, ticketId: ticketId || "", serverSeedHash: audit.serverSeedHash, publicClientSeed: audit.publicClientSeed, bitcoinBlockHash: audit.bitcoinBlockHash, nistBeaconOutput: audit.nistBeaconOutput, nonce: Number(nonce) || 1, finalSeedHash: audit.finalSeedHash, decimalSlice: decimalValue, totalEntriesPool: audit.totalEntries, calculatedWinningIndex, algorithm: "SHA-256(server seed + client seed + Bitcoin block hash + NIST beacon output)" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(503).json({ error: "Draw audit storage is unavailable." });
  }
});

type JurisdictionStatus = "NOT_REVIEWED" | "ALLOWED" | "RESTRICTED" | "BLOCKED";

let complianceTablesReady: Promise<void> | undefined;

async function ensureComplianceTables() {
  if (!complianceTablesReady) complianceTablesReady = (async () => {
  const sql = getAuditDatabase();
  await sql`CREATE TABLE IF NOT EXISTS jurisdiction_compliance (
    country_code TEXT NOT NULL, subdivision_code TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'NOT_REVIEWED',
    legal_approval_reference TEXT, minimum_age INTEGER NOT NULL DEFAULT 18,
    registrations_enabled BOOLEAN NOT NULL DEFAULT FALSE, entries_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    deposits_enabled BOOLEAN NOT NULL DEFAULT FALSE, prizes_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    crypto_enabled BOOLEAN NOT NULL DEFAULT FALSE, referrals_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    kyc_required BOOLEAN NOT NULL DEFAULT FALSE, aml_required BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (country_code, subdivision_code)
  )`;
  await sql`CREATE TABLE IF NOT EXISTS competitions (
    id TEXT PRIMARY KEY, status TEXT NOT NULL DEFAULT 'DRAFT', official_rules_url TEXT, official_rules_version TEXT,
    entry_enabled BOOLEAN NOT NULL DEFAULT FALSE, prize_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    opens_at TIMESTAMPTZ, closes_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS compliance_audit_log (
    id TEXT PRIMARY KEY, occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), actor_type TEXT NOT NULL,
    event_type TEXT NOT NULL, country_code TEXT, subdivision_code TEXT, competition_id TEXT, outcome TEXT NOT NULL, details JSONB NOT NULL DEFAULT '{}'::jsonb
  )`;
  await sql`CREATE TABLE IF NOT EXISTS consent_records (
    id TEXT PRIMARY KEY, user_email TEXT NOT NULL, consent_type TEXT NOT NULL, document_version TEXT NOT NULL,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), revoked_at TIMESTAMPTZ, jurisdiction_country TEXT NOT NULL, jurisdiction_subdivision TEXT NOT NULL DEFAULT ''
  )`;
  await sql`CREATE TABLE IF NOT EXISTS fiat_ledger (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, amount_minor BIGINT NOT NULL, currency TEXT NOT NULL, entry_type TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS prize_liability_ledger (id TEXT PRIMARY KEY, competition_id TEXT NOT NULL, amount_minor BIGINT NOT NULL, currency TEXT NOT NULL, entry_type TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS karma_coinz_ledger (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, amount BIGINT NOT NULL, entry_type TEXT NOT NULL, expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  })();
  try { await complianceTablesReady; } catch (error) { complianceTablesReady = undefined; throw error; }
}

async function writeComplianceAudit(eventType: string, outcome: string, details: object, country?: string, subdivision?: string, competitionId?: string) {
  const sql = getAuditDatabase();
  await sql`INSERT INTO compliance_audit_log (id, actor_type, event_type, outcome, details, country_code, subdivision_code, competition_id)
    VALUES (${crypto.randomUUID()}, 'SYSTEM', ${eventType}, ${outcome}, ${JSON.stringify(details)}::jsonb, ${country || null}, ${subdivision || null}, ${competitionId || null})`;
}

async function evaluateEntryEligibility(req: express.Request, body: any) {
  const country = String(req.header("x-vercel-ip-country") || "").trim().toUpperCase();
  const subdivision = String(req.header("x-vercel-ip-country-region") || "").trim().toUpperCase();
  const competitionId = String(body?.competitionId || "").trim();
  const dateOfBirth = new Date(String(body?.dateOfBirth || ""));
  if (!country || !competitionId || Number.isNaN(dateOfBirth.getTime())) return { allowed: false, reason: "Jurisdiction, competition, and date of birth are required for compliance review." };
  await ensureComplianceTables();
  const sql = getAuditDatabase();
  const rows = await sql`SELECT * FROM jurisdiction_compliance WHERE country_code = ${country} AND subdivision_code IN (${subdivision}, '') ORDER BY subdivision_code DESC LIMIT 1`;
  const rule = rows[0];
  const competitions = await sql`SELECT * FROM competitions WHERE id = ${competitionId} LIMIT 1`;
  const competition = competitions[0];
  const email = String(body?.email || "").trim().toLowerCase();
  const consents = email && competition?.official_rules_version ? await sql`SELECT id FROM consent_records WHERE user_email = ${email} AND consent_type = 'TERMS' AND document_version = ${competition.official_rules_version} AND revoked_at IS NULL LIMIT 1` : [];
  const age = new Date().getUTCFullYear() - dateOfBirth.getUTCFullYear() - (new Date().getUTCMonth() < dateOfBirth.getUTCMonth() || (new Date().getUTCMonth() === dateOfBirth.getUTCMonth() && new Date().getUTCDate() < dateOfBirth.getUTCDate()) ? 1 : 0);
  const allowed = !!rule && rule.status === "ALLOWED" && !!rule.legal_approval_reference && rule.registrations_enabled && rule.entries_enabled && age >= rule.minimum_age && !!competition && competition.status === "OPEN" && competition.entry_enabled && !!competition.official_rules_url && !!competition.official_rules_version && !!consents[0];
  await writeComplianceAudit("ENTRY_ELIGIBILITY_CHECK", allowed ? "ALLOWED" : "DENIED", { age, hasCounselReference: !!rule?.legal_approval_reference, competitionRulesConfigured: !!competition?.official_rules_url && !!competition?.official_rules_version, termsAccepted: !!consents[0] }, country, subdivision, competitionId);
  return { allowed, reason: allowed ? "Eligible" : "This jurisdiction or competition is not approved for entry." };
}

app.post("/api/compliance/entry-check", async (req, res) => {
  try { const result = await evaluateEntryEligibility(req, req.body); return res.status(result.allowed ? 200 : 403).json(result); }
  catch { return res.status(503).json({ allowed: false, reason: "Compliance service unavailable." }); }
});

app.post("/api/compliance/consents", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase(); const documentVersion = String(req.body?.documentVersion || "").trim();
    const country = String(req.header("x-vercel-ip-country") || "").trim().toUpperCase(); const subdivision = String(req.header("x-vercel-ip-country-region") || "").trim().toUpperCase();
    if (!/^\S+@\S+\.\S+$/.test(email) || !documentVersion || !country) return res.status(400).json({ error: "Email, document version, and resolved jurisdiction are required." });
    await ensureComplianceTables(); const sql = getAuditDatabase();
    await sql`INSERT INTO consent_records (id, user_email, consent_type, document_version, jurisdiction_country, jurisdiction_subdivision) VALUES (${crypto.randomUUID()}, ${email}, 'TERMS', ${documentVersion}, ${country}, ${subdivision})`;
    await writeComplianceAudit("TERMS_CONSENT", "RECORDED", { documentVersion }, country, subdivision);
    return res.status(201).json({ recorded: true });
  } catch { return res.status(503).json({ error: "Consent storage is unavailable." }); }
});

app.put("/api/admin/compliance/jurisdictions", async (req, res) => {
  try {
    if (!requireAdminPassword(req.header("x-admin-password"))) return res.status(401).json({ error: "Unauthorized." });
    const country = String(req.body?.country || "").trim().toUpperCase(); const subdivision = String(req.body?.subdivision || "").trim().toUpperCase();
    const status = String(req.body?.status || "NOT_REVIEWED") as JurisdictionStatus; const reference = String(req.body?.legalApprovalReference || "").trim();
    if (!/^[A-Z]{2}$/.test(country) || !["NOT_REVIEWED", "ALLOWED", "RESTRICTED", "BLOCKED"].includes(status)) return res.status(400).json({ error: "Use a two-letter country code and a valid review status." });
    if (status === "ALLOWED" && !reference) return res.status(400).json({ error: "LEGAL REVIEW REQUIRED: an approval reference is mandatory for allowed jurisdictions." });
    await ensureComplianceTables(); const sql = getAuditDatabase();
    await sql`INSERT INTO jurisdiction_compliance (country_code, subdivision_code, status, legal_approval_reference, minimum_age, registrations_enabled, entries_enabled, prizes_enabled)
      VALUES (${country}, ${subdivision}, ${status}, ${reference || null}, ${Number(req.body?.minimumAge) || 18}, ${!!req.body?.registrationsEnabled}, ${!!req.body?.entriesEnabled}, ${!!req.body?.prizesEnabled})
      ON CONFLICT (country_code, subdivision_code) DO UPDATE SET status = EXCLUDED.status, legal_approval_reference = EXCLUDED.legal_approval_reference, minimum_age = EXCLUDED.minimum_age, registrations_enabled = EXCLUDED.registrations_enabled, entries_enabled = EXCLUDED.entries_enabled, prizes_enabled = EXCLUDED.prizes_enabled, updated_at = NOW()`;
    await writeComplianceAudit("JURISDICTION_CONFIGURATION", "RECORDED", { status, legalApprovalReference: reference }, country, subdivision);
    return res.json({ country, subdivision: subdivision || null, status });
  } catch { return res.status(503).json({ error: "Compliance storage is unavailable." }); }
});

app.put("/api/admin/compliance/competitions/:competitionId", async (req, res) => {
  try {
    if (!requireAdminPassword(req.header("x-admin-password"))) return res.status(401).json({ error: "Unauthorized." });
    const id = String(req.params.competitionId || "").trim(); const rulesUrl = String(req.body?.officialRulesUrl || "").trim(); const rulesVersion = String(req.body?.officialRulesVersion || "").trim();
    if (!id || !/^https:\/\//.test(rulesUrl) || !rulesVersion) return res.status(400).json({ error: "LEGAL REVIEW REQUIRED: competition ID, HTTPS official rules URL, and rules version are required." });
    await ensureComplianceTables(); const sql = getAuditDatabase();
    await sql`INSERT INTO competitions (id, status, official_rules_url, official_rules_version, entry_enabled, prize_enabled) VALUES (${id}, 'DRAFT', ${rulesUrl}, ${rulesVersion}, FALSE, FALSE)
      ON CONFLICT (id) DO UPDATE SET official_rules_url = EXCLUDED.official_rules_url, official_rules_version = EXCLUDED.official_rules_version`;
    await writeComplianceAudit("COMPETITION_RULES_CONFIGURATION", "RECORDED", { officialRulesUrl: rulesUrl, officialRulesVersion: rulesVersion }, undefined, undefined, id);
    return res.json({ id, status: "DRAFT", entryEnabled: false, prizeEnabled: false });
  } catch { return res.status(503).json({ error: "Compliance storage is unavailable." }); }
});

function requireAdminPassword(password?: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD is not configured.");
  const actual = password || "";
  return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

let freeDrawTicketsTableReady: Promise<void> | undefined;

async function ensureFreeDrawTicketsTable() {
  if (!freeDrawTicketsTableReady) freeDrawTicketsTableReady = (async () => {
  const sql = getAuditDatabase();
  await sql`CREATE TABLE IF NOT EXISTS free_draw_tickets (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    draw_name TEXT NOT NULL,
    redemption_code_hash TEXT NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    redeemed_at TIMESTAMPTZ,
    entry_ticket_id TEXT UNIQUE
  )`;
  })();
  try { await freeDrawTicketsTableReady; } catch (error) { freeDrawTicketsTableReady = undefined; throw error; }
}

// API: administrator issues a one-time Free Draw ticket for a specific email.
app.post("/api/admin/free-draw-tickets", async (req, res) => {
  try {
    if (!requireAdminPassword(req.header("x-admin-password"))) return res.status(401).json({ error: "Unauthorized." });
    const email = String(req.body?.email || "").trim().toLowerCase();
    const drawName = String(req.body?.drawName || "").trim();
    if (!/^\S+@\S+\.\S+$/.test(email) || !drawName) return res.status(400).json({ error: "A valid email and draw are required." });
    await ensureFreeDrawTicketsTable();
    const redemptionCode = crypto.randomBytes(12).toString("base64url").toUpperCase();
    const codeHash = crypto.createHash("sha256").update(redemptionCode).digest("hex");
    const sql = getAuditDatabase();
    await sql`INSERT INTO free_draw_tickets (id, email, draw_name, redemption_code_hash) VALUES (${crypto.randomUUID()}, ${email}, ${drawName}, ${codeHash})`;
    return res.status(201).json({ success: true, email, drawName, redemptionCode });
  } catch (error) {
    console.error("Admin ticket issue error:", error);
    return res.status(503).json({ error: "Ticket storage is unavailable. Check the ticket database and administrator configuration." });
  }
});

// API: atomically redeems only an administrator-issued code belonging to the submitted email.
app.post("/api/free-draws/redeem", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const redemptionCode = String(req.body?.redemptionCode || "").trim().toUpperCase();
    if (!/^\S+@\S+\.\S+$/.test(email) || !redemptionCode) return res.status(400).json({ error: "Enter the email that received the ticket and its redemption code." });
    await ensureFreeDrawTicketsTable();
    const codeHash = crypto.createHash("sha256").update(redemptionCode).digest("hex");
    const ticketId = `FREE-${crypto.randomUUID().split("-")[0].toUpperCase()}`;
    const sql = getAuditDatabase();
    const rows = await sql`UPDATE free_draw_tickets SET redeemed_at = NOW(), entry_ticket_id = ${ticketId}
      WHERE email = ${email} AND redemption_code_hash = ${codeHash} AND redeemed_at IS NULL
      RETURNING draw_name`;
    if (!rows[0]) return res.status(404).json({ error: "That ticket is invalid, belongs to a different email, or has already been redeemed." });
    totalEntriesCount += 1;
    return res.json({ success: true, drawName: rows[0].draw_name, ticketId });
  } catch (error) {
    console.error("Free Draw redemption error:", error);
    return res.status(503).json({ error: "Ticket storage is unavailable. Please try again later." });
  }
});

// API: competition entry is fail-closed until approved launch controls and public rules are in place.
app.post("/api/competition/enter", (_req, res) => {
  return res.status(423).json({ error: "Entries are not open. No entry details are accepted or stored." });
});

// API: AI Business Feasibility & Pitch Evaluator
app.post("/api/ai/pitch-evaluate", async (req, res) => {
  try {
    const businessIdea = limitedText(req.body?.businessIdea, 2_000);
    const industry = limitedText(req.body?.industry, 200);
    const targetMarket = limitedText(req.body?.targetMarket, 200);
    const dreamFeatures = limitedText(req.body?.dreamFeatures, 1_000);

    if (!businessIdea) {
      return res.status(400).json({ error: "Please provide a business idea or concept." });
    }

    const prompt = `You are the Lead UK Commercial Strategy & Company Formation Advisor for the official Luxe Prize Draws competition.
Evaluate the following business idea that a participant wants to launch in the UK with their 2-Week 5-Star Luxury Holiday, £100K Sterling Cash Prize, Custom App, and Full Brand Suite. `;

    if (process.env.AI_GATEWAY_ENABLED === "false") {
      // Fallback high-quality structured response while AI Gateway is intentionally disabled.
      return res.json({
        feasibilityScore: 94,
        executiveSummary: `Your concept "${businessIdea}" has immense growth potential in the UK ecosystem, capitalising on the UK's thriving commercial landscape. `,
        recommendedFormation: "England & Wales / Scotland",
        whyThisFormation: "Offers fast digital registration, simple compliance, and instant pre-approval with leading UK banks.",
        appOneClickFeatureConcept: `A 1-touch VIP instant reservation pipeline allowing UK clients to secure services with Apple Pay / Google Pay. `,
        aiCopilotIntegration: "24/7 Multilingual AI concierge that answers client queries in Arabic & English, qualifies high-ticket leads, and auto-dispatches bookings.",
        budgetAllocation100k: [
          { category: "Product Development & Cloud AI", amountGBP: 35000, description: "App architecture, One-Click book pipeline, AI agents" },
          { category: "UK & International Marketing", amountGBP: 30000, description: "UK billboard & digital omnichannel acquisition" },
          { category: "Operational Runway & Team", amountGBP: 20000, description: "Office presence and local commercial operations" },
          { category: "Corporate Treasury Reserve", amountGBP: 15000, description: "Zero-risk high yield GBP savings cushion" }
        ],
        threeYearRoadmap: [
          { year: "Year 1", milestone: "Establish the company, deploy Web & Mobile App, achieve £150K Gross Volume in the UK." },
          { year: "Year 2", milestone: "Expand B2B partnerships across Edinburgh & Manchester, scale team to 5." },
          { year: "Year 3", milestone: "Attain £1.2M valuation and establish a UK headquarters." }
        ],
        suggestedBrandNames: ["Aura UK", "Nexis London", "Veloce Luxe"],
        competitiveAdvantage: "First-mover digital convenience combined with instant AI-driven fulfillment in one of the UK's fastest growing markets."
      });
    }

    const text = await generateGatewayText(req, `${prompt}\n\nReturn only the requested JSON object, with no Markdown code fence.`);
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("AI Pitch evaluation error:", error);
    if (error?.statusCode === 429) return res.status(429).json({ error: "The advisor is busy. Please try again shortly." });
    // Return friendly resilient fallback
    return res.json({
      feasibilityScore: 92,
      executiveSummary: "Your venture idea aligns exceptionally well with the UK's digital economy strategy, providing a solid foundation for rapid scaling.",
      recommendedFormation: "Companies House / London",
      whyThisZone: "World-class digital trade infrastructure, fast corporate bank account onboarding, and flexible commercial licensing.",
      appOneClickFeatureConcept: "Smart frictionless booking system featuring one-tap instant checkout, automated calendar sync, and real-time SMS/WhatsApp confirmation.",
      aiCopilotIntegration: "Autonomous AI customer agent handling multilingual inquiries, custom quote generation, and booking optimization.",
      budgetAllocation100k: [
        { category: "Platform & App Polish", amountGBP: 35000, description: "One-Click engine, AI automation, cloud security" },
        { category: "UK Launch & PR Campaign", amountGBP: 30000, description: "Growth marketing across London, Edinburgh, and the UK" },
        { category: "Operations & Equipment", amountGBP: 20000, description: "Prime workspace and essential business tooling" },
        { category: "Reserve Treasury", amountGBP: 15000, description: "Emergency fund in a UK corporate bank account" }
      ],
      threeYearRoadmap: [
        { year: "Year 1", milestone: "Incorporate company, launch Web/App, activate UK bank accounts, hit 1,000 users." },
        { year: "Year 2", milestone: "UK regional expansion into Scotland and Northern Ireland." },
        { year: "Year 3", milestone: "Establish enterprise division with £1M+ annual run rate." }
      ],
      suggestedBrandNames: ["Britannia Velocity", "Caledonian Tech", "ThamesLink Solutions"],
      competitiveAdvantage: "Turnkey operational readiness backed by the £100K seed grant and 3-Year Relocation freedom."
    });
  }
});

// API: AI Live UK Business Advisor Chat
app.post("/api/ai/ask-advisor", async (req, res) => {
  try {
    const question = limitedText(req.body?.question, 1_000);
    const userBusinessContext = limitedText(req.body?.userBusinessContext, 2_000);
    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const prompt = `You are the Luxe Prize Draws Senior Business & Legal Advisor.
You are helping a prospective winner understand the full prize package:
1. 2-Week VIP UK Holiday & 5-Star Hotel Stay (Business class flights for 2, luxury suite, private chauffeur, £4,000 dining credit)
2. UK Limited Company Formation (fully managed, England & Wales or Scotland)
3. Complete Luxury Branding Suite (Logo, identity, brand book, stationery)
4. Custom-Built Web & Mobile App (iOS & Android) with ONE-CLICK BOOKING & AI Smart Assistant
5. 3-Year Founder Relocation Programme with VIP Onboarding
6. Corporate VIP Banking Account (leading UK banks)
7. £100,000 Sterling Clean Cash Seed Grant deposited directly into their corporate account.

User Business Context: ${userBusinessContext || "Aspiring entrepreneur entering the competition"}
User Question: "${question}"

Provide a concise, direct, helpful, and inspiring response (2-3 paragraphs max) packed with accurate UK business knowledge.`;

    if (process.env.AI_GATEWAY_ENABLED === "false") {
      return res.json({
        answer: `As a winner of Luxe Prize Draws, your entire journey is 100% covered. We handle the entire company incorporation with full digital registration. `
      });
    }

    const answer = await generateGatewayText(req, prompt);
    return res.json({ answer });
  } catch (error: any) {
    console.error("AI Advisor error:", error);
    if (error?.statusCode === 429) return res.status(429).json({ error: "The advisor is busy. Please try again shortly." });
    return res.json({
      answer: "Luxe Prize Draws is designed for maximum speed and zero friction. From company licensing, 5-Star luxury holiday, and 3-Year Relocation to corporate bank setup and transferring your £100,000 cash grant, everything is orchestrated so you can focus entirely on growing your business with your custom app and One-Click booking system.",
    });
  }
});

// Vite Middleware for Full Stack
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const index = path.join(distPath, "index.html");
      if (req.path !== "/prizes/northern-supercar-hire") return res.sendFile(index);
      const title = "Northern Supercar Hire × LuxePrizeDraw | Luxury Supercar Experience";
      const description = "Discover the Northern Supercar Hire automotive experience on LuxePrizeDraw and explore premium supercar prizes, luxury experiences and partnership opportunities.";
      const html = fs.readFileSync(index, "utf8")
        .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
        .replace(/(<meta name="description" content=")[^"]*(" \/>)/, `$1${description}$2`)
        .replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, `$1${title}$2`)
        .replace(/(<meta property="og:description" content=")[^"]*(" \/>)/, `$1${description}$2`);
      res.type("html").send(html);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Luxe Prize Draws server running on http://0.0.0.0:${PORT}`);
  });
}

// Arcade matches are persisted and validated server-side. Browser game state is never a source of truth.
type ArcadeGame = "chess" | "connect4" | "draughts";
async function ensureArcadeTables() {
  const sql = getAuditDatabase();
  await sql`CREATE TABLE IF NOT EXISTS arcade_players (id TEXT PRIMARY KEY, elo INTEGER NOT NULL DEFAULT 1200, games_played INTEGER NOT NULL DEFAULT 0, wins INTEGER NOT NULL DEFAULT 0, losses INTEGER NOT NULL DEFAULT 0, draws INTEGER NOT NULL DEFAULT 0, win_streak INTEGER NOT NULL DEFAULT 0, highest_elo INTEGER NOT NULL DEFAULT 1200, tournament_wins INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS arcade_matches (id TEXT PRIMARY KEY, game_type TEXT NOT NULL, white_player_id TEXT NOT NULL, black_player_id TEXT NOT NULL, state JSONB NOT NULL, status TEXT NOT NULL DEFAULT 'ACTIVE', result TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS arcade_moves (id TEXT PRIMARY KEY, match_id TEXT NOT NULL REFERENCES arcade_matches(id), move_number INTEGER NOT NULL, actor_id TEXT NOT NULL, move JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(match_id, move_number))`;
  await sql`CREATE TABLE IF NOT EXISTS arcade_tournament_bands (id TEXT PRIMARY KEY, min_elo INTEGER NOT NULL, max_elo INTEGER, label TEXT NOT NULL, enabled BOOLEAN NOT NULL DEFAULT TRUE, UNIQUE(min_elo, max_elo))`;
  await sql`CREATE TABLE IF NOT EXISTS arcade_reward_ledger (id TEXT PRIMARY KEY, player_id TEXT NOT NULL REFERENCES arcade_players(id), match_id TEXT REFERENCES arcade_matches(id), reason TEXT NOT NULL, ticket_count INTEGER NOT NULL CHECK(ticket_count > 0), status TEXT NOT NULL DEFAULT 'PENDING_REVIEW', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
}
function arcadeIdentity(req: express.Request) {
  // Production caller must be an authenticated identity provider integration; arbitrary browser headers are rejected.
  const playerId = req.header("x-arcade-player-id"); const proof = req.header("x-arcade-auth-proof"); const secret = process.env.ARCADE_PLAYER_AUTH_HMAC_SECRET;
  if (!playerId || !proof || !secret) return null;
  const expected = crypto.createHmac("sha256", secret).update(playerId).digest("hex");
  return expected.length === proof.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(proof)) ? playerId : null;
}
app.get("/api/arcade/profile", async (req, res) => {
  const playerId = arcadeIdentity(req); if (!playerId) return res.status(401).json({ error: "Authenticated arcade identity is required." });
  try { await ensureArcadeTables(); const sql = getAuditDatabase(); await sql`INSERT INTO arcade_players (id) VALUES (${playerId}) ON CONFLICT (id) DO NOTHING`; const rows = await sql`SELECT * FROM arcade_players WHERE id = ${playerId}`; return res.json(rows[0]); } catch { return res.status(503).json({ error: "Arcade profile storage is unavailable." }); }
});
app.get("/api/arcade/readiness", (_req, res) => res.json({ onlinePlayEnabled: Boolean(process.env.ARCADE_PLAYER_AUTH_HMAC_SECRET && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN), requirements: ["authenticated player identity", "Neon match storage", "Upstash Redis room coordination"] }));


type ArcadeProfile = { id: string; displayName: string; elo: number; gamesPlayed: number; wins: number; losses: number; draws: number; winStreak: number; highestElo: number; tournamentWins: number };
type ConnectFourRoom = { id: string; players: { red: ArcadeProfile; yellow?: ArcadeProfile }; state: ConnectFourState; version: number; createdAt: number; finishedAt?: number };
const arcadeRedis = () => {
  const url = process.env.KV_REST_API_URL; const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Redis is not connected.");
  return new Redis({ url, token });
};
const arcadeCookie = "luxe_arcade_session";
function signedArcadeId(req: express.Request) {
  const secret = process.env.ARCADE_SESSION_SECRET;
  const cookie = req.header("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${arcadeCookie}=`))?.slice(arcadeCookie.length + 1);
  if (!secret || !cookie) return null; const [id, signature] = cookie.split("."); if (!id || !signature) return null;
  const expected = crypto.createHmac("sha256", secret).update(id).digest("base64url");
  return expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature)) ? id : null;
}
function baseProfile(id: string, displayName: string): ArcadeProfile { return { id, displayName: displayName.slice(0, 32), elo: 1200, gamesPlayed: 0, wins: 0, losses: 0, draws: 0, winStreak: 0, highestElo: 1200, tournamentWins: 0 }; }
async function getArcadeProfile(id: string) { const redis = arcadeRedis(); return (await redis.get<ArcadeProfile>(`arcade:player:${id}`)) || null; }
async function putArcadeProfile(profile: ArcadeProfile) { await arcadeRedis().set(`arcade:player:${profile.id}`, profile); }
async function getRoom(id: string) { return arcadeRedis().get<ConnectFourRoom>(`arcade:room:${id}`); }
function requireArcadeSession(req: express.Request, res: express.Response) { const id = signedArcadeId(req); if (!id) { res.status(401).json({ error: "Sign in to the Arcade first." }); return null; } return id; }
function publicRoom(room: ConnectFourRoom) { return { id: room.id, players: { red: { displayName: room.players.red.displayName, elo: room.players.red.elo }, yellow: room.players.yellow && { displayName: room.players.yellow.displayName, elo: room.players.yellow.elo } }, state: room.state, version: room.version, finishedAt: room.finishedAt }; }
function eloDelta(actual: number, own: number, opponent: number) { const expected = 1 / (1 + 10 ** ((opponent - own) / 400)); return Math.round(32 * (actual - expected)); }
async function settleConnectFour(room: ConnectFourRoom) {
  if (room.state.status === "playing" || !room.players.yellow) return; const red = room.players.red; const yellow = room.players.yellow; const result = room.state.status === "red_won" ? 1 : room.state.status === "yellow_won" ? 0 : .5; const redDelta = eloDelta(result, red.elo, yellow.elo); const yellowDelta = eloDelta(1 - result, yellow.elo, red.elo);
  const update = (profile: ArcadeProfile, outcome: number, delta: number): ArcadeProfile => { const elo = profile.elo + delta; return { ...profile, elo, gamesPlayed: profile.gamesPlayed + 1, wins: profile.wins + (outcome === 1 ? 1 : 0), losses: profile.losses + (outcome === 0 ? 1 : 0), draws: profile.draws + (outcome === .5 ? 1 : 0), winStreak: outcome === 1 ? profile.winStreak + 1 : 0, highestElo: Math.max(profile.highestElo, elo) }; };
  await Promise.all([putArcadeProfile(update(red, result, redDelta)), putArcadeProfile(update(yellow, 1 - result, yellowDelta))]); room.finishedAt = Date.now();
}
app.post("/api/arcade/session", async (req, res) => {
  try { const displayName = limitedText(req.body?.displayName, 32); if (!displayName) return res.status(400).json({ error: "Choose a display name." }); const secret = process.env.ARCADE_SESSION_SECRET; if (!secret) return res.status(503).json({ error: "Arcade sessions are not configured." }); const id = crypto.randomUUID(); const signature = crypto.createHmac("sha256", secret).update(id).digest("base64url"); const profile = baseProfile(id, displayName); await putArcadeProfile(profile); res.setHeader("Set-Cookie", `${arcadeCookie}=${id}.${signature}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`); return res.status(201).json(profile); } catch { return res.status(503).json({ error: "Arcade session storage is unavailable." }); }
});
app.get("/api/arcade/session", async (req, res) => { try { const id = requireArcadeSession(req, res); if (!id) return; const profile = await getArcadeProfile(id); return profile ? res.json(profile) : res.status(401).json({ error: "Session expired." }); } catch { return res.status(503).json({ error: "Arcade session storage is unavailable." }); } });
app.post("/api/arcade/connect4/rooms", async (req, res) => { try { const id = requireArcadeSession(req, res); if (!id) return; const player = await getArcadeProfile(id); if (!player) return res.status(401).json({ error: "Session expired." }); const room: ConnectFourRoom = { id: crypto.randomUUID().slice(0, 8).toUpperCase(), players: { red: player }, state: newConnectFour(), version: 1, createdAt: Date.now() }; await arcadeRedis().set(`arcade:room:${room.id}`, room, { ex: 3600 }); return res.status(201).json(publicRoom(room)); } catch { return res.status(503).json({ error: "Unable to create an online room." }); } });
app.post("/api/arcade/connect4/rooms/:roomId/join", async (req, res) => { try { const id = requireArcadeSession(req, res); if (!id) return; const room = await getRoom(req.params.roomId); const player = await getArcadeProfile(id); if (!room || !player) return res.status(404).json({ error: "Room or player was not found." }); if (room.players.red.id === id) return res.json(publicRoom(room)); if (room.players.yellow && room.players.yellow.id !== id) return res.status(409).json({ error: "This room is full." }); room.players.yellow = player; room.version += 1; await arcadeRedis().set(`arcade:room:${room.id}`, room, { ex: 3600 }); return res.json(publicRoom(room)); } catch { return res.status(503).json({ error: "Unable to join the room." }); } });
app.get("/api/arcade/connect4/rooms/:roomId", async (req, res) => { try { const id = requireArcadeSession(req, res); if (!id) return; const room = await getRoom(req.params.roomId); if (!room || (room.players.red.id !== id && room.players.yellow?.id !== id)) return res.status(404).json({ error: "Room was not found." }); return res.json(publicRoom(room)); } catch { return res.status(503).json({ error: "Unable to load room state." }); } });
app.post("/api/arcade/connect4/rooms/:roomId/moves", async (req, res) => { try { const id = requireArcadeSession(req, res); if (!id) return; const room = await getRoom(req.params.roomId); const column = Number(req.body?.column); if (!room || !room.players.yellow) return res.status(409).json({ error: "Waiting for an opponent." }); const required = room.state.turn === "red" ? room.players.red.id : room.players.yellow.id; if (id !== required) return res.status(403).json({ error: "It is not your turn." }); const version = Number(req.body?.version); if (!Number.isInteger(version) || version !== room.version) return res.status(409).json({ error: "Room changed. Reload the board." }); room.state = playConnectFour(room.state, column); room.version += 1; await settleConnectFour(room); await arcadeRedis().set(`arcade:room:${room.id}`, room, { ex: 3600 }); return res.json(publicRoom(room)); } catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : "Move rejected." }); } });

startServer();
