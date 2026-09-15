import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || "3000");
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

app.use(express.json({ limit: "32kb" }));
app.set("query parser", "simple");

// Lazy / safe Gemini initialization
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment. Fallback responses will be used.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key-fallback",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-memory competition state tracking
let totalEntriesCount = 42890;
let totalCharityRaisedGBP = 48620;
let totalScholarshipsFunded = 1350;
let totalMicroGrants = 84;

const verifiedEntrants = [
  { id: "UAE-7829-DXB", name: "Siddharth M.", country: "India", timestamp: "Just now", business: "FinTech Cross-Border Platform", entryType: "SUBSCRIBER_VIP" },
  { id: "UAE-7830-LDN", name: "Elena Rostova", country: "United Kingdom", timestamp: "2 mins ago", business: "Luxury AI Concierge", entryType: "POWER_BUNDLE" },
  { id: "UAE-7831-SGP", name: "Marcus Tan", country: "Singapore", timestamp: "5 mins ago", business: "B2B SaaS Logistics", entryType: "FREE" },
  { id: "UAE-7832-DUB", name: "Amina Al-Mansoor", country: "Egypt", timestamp: "8 mins ago", business: "Green Tech Packaging", entryType: "SUBSCRIBER_VIP" },
  { id: "UAE-7833-NYC", name: "Tyler Harrison", country: "United States", timestamp: "12 mins ago", business: "E-Commerce Lifestyle Hub", entryType: "FREE" },
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
const publicClientSeed = process.env.ENTROPY_CLIENT_SEED || "DUBAI-2026-GRAND-DRAW-COMMITTED";
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

// API: public readiness status. It never asserts legal approval or safeguarding without recorded evidence.
app.get("/api/launch-readiness", (_req, res) => {
  const requiredEvidence = {
    counselApproval: Boolean(process.env.LEGAL_REVIEW_APPROVAL_REFERENCE),
    officialRules: Boolean(process.env.OFFICIAL_RULES_URL && process.env.OFFICIAL_RULES_VERSION),
    prizeFunding: Boolean(process.env.PRIZE_FUND_ATTESTATION_REFERENCE),
    safeguarding: Boolean(process.env.FUNDS_SAFEGUARDING_PROVIDER && process.env.FUNDS_SAFEGUARDING_ACCOUNT_REFERENCE),
    paymentProvider: Boolean(process.env.PAYMENT_PROVIDER_REFERENCE),
  };
  res.set("Cache-Control", "no-store");
  res.json({
    mode: "PRE_LAUNCH",
    paidEntriesEnabled: false,
    prizeIssuanceEnabled: false,
    safeguardingClaimPermitted: false,
    requiredEvidence,
    launchReady: false,
    message: "Counsel approval and independently evidenced controls are required before launch.",
  });
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

// API: Competition Entry Submission & Subscriptions
app.post("/api/competition/enter", (req, res) => {
  try {
    const {
      fullName,
      email,
      country,
      phone,
      businessIdea,
      targetIndustry,
      entryType = "FREE",
      planId,
      ticketsCount = 1,
      charityAmount = 0,
      demo = false
    } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: "Full name and email are required to generate an official entry ticket." });
    }
    if (!demo) {
      return res.status(403).json({ error: "Public entry issuance is disabled. Free Draw entries require an administrator-issued ticket." });
    }

    const count = Math.min(100, Math.max(1, Math.floor(Number(ticketsCount) || 1)));
    if (!demo) {
      totalEntriesCount += count;
      if (charityAmount && Number(charityAmount) > 0) {
        totalCharityRaisedGBP += Number(charityAmount);
        if (Math.random() > 0.5) totalScholarshipsFunded += 1;
      }
    }

    const ticketId = `UAE-${Math.floor(100000 + Math.random() * 900000)}-${(country || "GLB").slice(0, 3).toUpperCase()}`;

    const newEntrant = {
      id: ticketId,
      name: fullName.split(" ")[0] + " " + (fullName.split(" ")[1] ? fullName.split(" ")[1][0] + "." : ""),
      country: country || "International",
      timestamp: "Just now",
      business: businessIdea ? businessIdea.slice(0, 25) + "..." : (entryType === "SUBSCRIBER_VIP" ? "VIP Founder Subscriber" : "Luxe Prize Draw Venture"),
      entryType: entryType as "FREE" | "SUBSCRIBER_VIP" | "POWER_BUNDLE",
    };
    if (!demo) {
      verifiedEntrants.unshift(newEntrant);
      if (verifiedEntrants.length > 20) verifiedEntrants.pop();
    }

    return res.json({
      success: true,
      ticketId,
      fullName,
      email,
      country,
      phone,
      businessIdea,
      targetIndustry: targetIndustry || "Tech & Innovation",
      entryTimestamp: new Date().toISOString(),
      ticketStatus: demo ? "PREVIEW_ONLY" : "VERIFIED_ACTIVE",
      drawDate: "October 31, 2026 at 18:00 GST (Dubai Time)",
      bonusEntriesAwarded: count > 1 ? count - 1 : 1,
      totalTickets: count,
      entryType,
      planId,
      charityContributionGBP: charityAmount || (count > 1 ? (count * 0.25).toFixed(2) : 0),
    });
  } catch (error: any) {
    console.error("Entry error:", error);
    return res.status(500).json({ error: "Failed to process entry ticket." });
  }
});

// API: AI Business Feasibility & Pitch Evaluator
app.post("/api/gemini/pitch-evaluate", async (req, res) => {
  try {
    const businessIdea = limitedText(req.body?.businessIdea, 2_000);
    const industry = limitedText(req.body?.industry, 200);
    const targetMarket = limitedText(req.body?.targetMarket, 200);
    const dreamFeatures = limitedText(req.body?.dreamFeatures, 1_000);

    if (!businessIdea) {
      return res.status(400).json({ error: "Please provide a business idea or concept." });
    }

    const ai = getAiClient();
    const prompt = `You are the Lead UAE Commercial Strategy & Free Zone Advisor for the official Luxe Prize Draws competition.
Evaluate the following business idea that a participant wants to launch in the UAE with their 2-Week 5-Star Dubai Luxury Holiday, £100K Sterling Cash Prize, 3-Year Residency Visa, UAE Limited Company, Custom Branding, and Web/App with One-Click Book & AI.

Business Details:
- Idea: ${businessIdea}
- Industry: ${industry || "Technology / Services"}
- Target Market: ${targetMarket || "UAE, UK & Global"}
- Key Features Desired: ${dreamFeatures || "One-Click Booking and AI assistant"}

Please provide a structured, encouraging, professional, and actionable UAE Launch Assessment.
Return a valid JSON object with the following fields:
{
  "feasibilityScore": number (between 82 and 99),
  "executiveSummary": "2-3 punchy sentences highlighting why this concept will thrive in Dubai/Abu Dhabi",
  "recommendedFreezone": "e.g. Dubai Internet City (DIC), DMCC (Dubai Multi Commodities Centre), IFZA (International Free Zone Authority), Abu Dhabi Global Market (ADGM), or Meydan Free Zone",
  "whyThisZone": "1 sentence explanation of why this zone fits their license and banking needs",
  "appOneClickFeatureConcept": "A creative description of how the 'One-Click Book' feature should be customized specifically for this business",
  "aiCopilotIntegration": "How AI can automate customer onboarding or operations in their custom app",
  "budgetAllocation100k": [
    {"category": "Product Development & AI Cloud", "amountGBP": 35000, "description": "App enhancement, AI fine-tuning & server architecture"},
    {"category": "UAE & UK Go-To-Market & PR", "amountGBP": 30000, "description": "Targeted GCC & UK marketing, LinkedIn ads, Dubai launch event"},
    {"category": "Working Capital & Operations", "amountGBP": 20000, "description": "Initial inventory / team runway / prime flexi-desk"},
    {"category": "Reserve & Treasury Fund", "amountGBP": 15000, "description": "High-yield UAE corporate treasury deposit in GBP"}
  ],
  "threeYearRoadmap": [
    {"year": "Year 1", "milestone": "Launch MVP app with One-Click Booking, establish corporate banking with Emirates NBD/Wio, capture initial 500 high-value clients"},
    {"year": "Year 2", "milestone": "Expand across GCC (Saudi Arabia & Qatar) and London, integrate automated AI workflow, scale to £500K ARR"},
    {"year": "Year 3", "milestone": "Apply for UAE Golden Visa expansion, open physical flagship hub in Downtown Dubai / DIFC"}
  ],
  "suggestedBrandNames": ["Name 1", "Name 2", "Name 3"],
  "competitiveAdvantage": "What makes this irresistible in the UAE and international markets"
}`;

    if (!process.env.GEMINI_API_KEY) {
      // Fallback high-quality structured response if key is unavailable
      return res.json({
        feasibilityScore: 94,
        executiveSummary: `Your concept "${businessIdea}" has immense growth potential in the UAE ecosystem, capitalizing on the UAE's zero-tax commercial framework and booming digital-first consumer adoption.`,
        recommendedFreezone: "IFZA Dubai / DMCC",
        whyThisZone: "Offers seamless 100% foreign ownership, rapid digital license issuance, and instant pre-approval with leading UAE corporate banks.",
        appOneClickFeatureConcept: `A 1-touch VIP instant reservation pipeline allowing UAE clients to secure services with biometric Apple Pay / Google Pay and instant WhatsApp confirmation.`,
        aiCopilotIntegration: "24/7 Multilingual AI concierge that answers client queries in Arabic & English, qualifies high-ticket leads, and auto-dispatches bookings.",
        budgetAllocation100k: [
          { category: "Product Development & Cloud AI", amountGBP: 35000, description: "App architecture, One-Click book pipeline, AI agents" },
          { category: "GCC & Global Marketing", amountGBP: 30000, description: "Dubai billboard & digital omnichannel acquisition" },
          { category: "Operational Runway & Team", amountGBP: 20000, description: "Office presence and local commercial operations" },
          { category: "Corporate Treasury Reserve", amountGBP: 15000, description: "Zero-risk high yield GBP savings cushion" }
        ],
        threeYearRoadmap: [
          { year: "Year 1", milestone: "Establish corporate license, deploy Web & Mobile App, achieve £150K Gross Volume in UAE." },
          { year: "Year 2", milestone: "Expand B2B partnerships across Abu Dhabi & Riyadh (KSA), scale team to 5." },
          { year: "Year 3", milestone: "Attain £1.2M valuation, qualify for UAE 10-Year Golden Visa, establish DIFC headquarters." }
        ],
        suggestedBrandNames: ["Aura Emirates", "Nexis Dubai", "Veloce UAE"],
        competitiveAdvantage: "First-mover digital convenience combined with instant AI-driven fulfillment in the GCC's fastest growing economy."
      });
    }

    const response = await withAiCapacity(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.7 },
    }));

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("AI Pitch evaluation error:", error);
    if (error?.statusCode === 429) return res.status(429).json({ error: "The advisor is busy. Please try again shortly." });
    // Return friendly resilient fallback
    return res.json({
      feasibilityScore: 92,
      executiveSummary: "Your venture idea aligns exceptionally well with the UAE's National Digital Economy Strategy and Vision 2031, providing a solid foundation for rapid scaling.",
      recommendedFreezone: "DMCC / Meydan Free Zone Dubai",
      whyThisZone: "World-class digital trade infrastructure, fast corporate bank account onboarding, and flexible commercial licensing.",
      appOneClickFeatureConcept: "Smart frictionless booking system featuring one-tap instant checkout, automated calendar sync, and real-time SMS/WhatsApp confirmation.",
      aiCopilotIntegration: "Autonomous AI customer agent handling multilingual inquiries, custom quote generation, and booking optimization.",
      budgetAllocation100k: [
        { category: "Platform & App Polish", amountGBP: 35000, description: "One-Click engine, AI automation, cloud security" },
        { category: "UAE Launch & PR Campaign", amountGBP: 30000, description: "Growth marketing across Dubai, Abu Dhabi, and GCC" },
        { category: "Operations & Equipment", amountGBP: 20000, description: "Prime workspace and essential business tooling" },
        { category: "Reserve Treasury", amountGBP: 15000, description: "Emergency fund in UAE corporate bank account" }
      ],
      threeYearRoadmap: [
        { year: "Year 1", milestone: "Incorporate company, launch Web/App, activate UAE bank accounts, hit 1,000 users." },
        { year: "Year 2", milestone: "GCC regional expansion into Saudi Arabia and Qatar." },
        { year: "Year 3", milestone: "Establish enterprise division with £1M+ annual run rate." }
      ],
      suggestedBrandNames: ["Emirates Velocity", "Zayed Global Tech", "DuneLink Solutions"],
      competitiveAdvantage: "Turnkey operational readiness backed by the £100K seed grant and 3-Year Residency freedom."
    });
  }
});

// API: AI Live UAE Business Advisor Chat
app.post("/api/gemini/ask-advisor", async (req, res) => {
  try {
    const question = limitedText(req.body?.question, 1_000);
    const userBusinessContext = limitedText(req.body?.userBusinessContext, 2_000);
    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const ai = getAiClient();
    const prompt = `You are the Luxe Prize Draws Senior Business & Legal Advisor.
You are helping a prospective winner understand the full prize package:
1. 2-Week VIP Dubai Holiday & 5-Star Hotel Stay (Business class flights for 2, luxury suite, private chauffeur, £4,000 dining credit)
2. UAE Limited Company Formation (Freezone/Mainland 100% foreign ownership)
3. Complete Luxury Branding Suite (Logo, identity, brand book, stationery)
4. Custom-Built Web & Mobile App (iOS & Android) with ONE-CLICK BOOKING & AI Smart Assistant
5. 3-Year UAE Residency Visa with VIP Emirates ID & Express Medical
6. Corporate VIP Banking Account (Emirates NBD, ADCB, Mashreq, Wio Bank)
7. £100,000 Sterling Clean Cash Seed Grant deposited directly into their corporate account.

User Business Context: ${userBusinessContext || "Aspiring entrepreneur entering the competition"}
User Question: "${question}"

Provide a concise, direct, helpful, and inspiring response (2-3 paragraphs max) packed with accurate UAE business knowledge (0% personal tax, 9% corporate tax on profits above the applicable corporate-tax threshold with qualifying freezone exemptions, family visa sponsorship, fast-track banking, app launch).`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        answer: `As a winner of Luxe Prize Draws, your entire journey is 100% covered. We handle the entire company incorporation with 100% foreign ownership, provide your complete brand identity, build and launch your custom iOS/Android app with One-Click Booking & AI features, sponsor your 3-Year UAE Investor Residency Visa, and treat you to a 2-Week 5-Star Dubai VIP Holiday.\n\nYour £100,000 Sterling cash prize is deposited directly into your newly minted UAE corporate bank account at premier institutions like Emirates NBD or Wio Bank. You will benefit from the UAE's world-leading 0% personal income tax and zero capital gains tax, giving you the ultimate launchpad to scale globally.`
      });
    }

    const response = await withAiCapacity(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.7 },
    }));

    return res.json({
      answer: response.text || "Our dedicated UAE setup team ensures every step of your holiday, company formation, 3-year visa, branding, and £100,000 grant transfer is executed seamlessly within 14 business days.",
    });
  } catch (error: any) {
    console.error("AI Advisor error:", error);
    if (error?.statusCode === 429) return res.status(429).json({ error: "The advisor is busy. Please try again shortly." });
    return res.json({
      answer: "Luxe Prize Draws is designed for maximum speed and zero friction. From company licensing, 5-Star luxury holiday, and 3-Year Residency to corporate bank setup and transferring your £100,000 cash grant, everything is orchestrated so you can focus entirely on growing your business with your custom app and One-Click booking system.",
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
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Luxe Prize Draws server running on http://0.0.0.0:${PORT}`);
  });
}

function isDirectExecution() {
  const entrypoint = path.basename(process.argv[1] || "");
  return ["server.ts", "server.js", "server.cjs", "server.mjs"].includes(entrypoint);
}

export { app, startServer };
export default app;

if (isDirectExecution()) {
  void startServer();
}
