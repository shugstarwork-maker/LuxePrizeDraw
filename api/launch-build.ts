// Adapted from the owner-supplied server.js. Keep payments and entry issuance
// behind the existing compliance system; these records are proposals, not open draws.
import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

export const MAX_PER_DRAW = 10;
export const PROOF_KEYS = ["officialRules", "prizeFunding", "fundSafeguards", "paymentControls", "counselSignoff"] as const;
export const SEED_DRAWS = [
  /* --- cash ladder --- */
  { id: 'cash10',    cat: 'Cash',        title: '£10 Cash Prize',           grade: 'TIER 1 · 6×',     mult: 6,  price: 0.10,  target: 60,      sold: 0, revenue: 0, paused: false, winner: null },
  { id: 'cash25',    cat: 'Cash',        title: '£25 Cash Prize',           grade: 'TIER 1 · 6×',     mult: 6,  price: 0.25,  target: 150,     sold: 0, revenue: 0, paused: false, winner: null },
  { id: 'cash50',    cat: 'Cash',        title: '£50 Cash Prize',           grade: 'TIER 1 · 6×',     mult: 6,  price: 0.50,  target: 300,     sold: 0, revenue: 0, paused: false, winner: null },
  { id: 'cash100',   cat: 'Cash',        title: '£100 Cash Prize',          grade: 'TIER 2 · 7×',     mult: 7,  price: 0.50,  target: 700,     sold: 0, revenue: 0, paused: false, winner: null },
  { id: 'cash250',   cat: 'Cash',        title: '£250 Cash Prize',          grade: 'TIER 2 · 7×',     mult: 7,  price: 1.00,  target: 1750,    sold: 0, revenue: 0, paused: false, winner: null },
  { id: 'cash500',   cat: 'Cash',        title: '£500 Cash Prize',          grade: 'TIER 2 · 8×',     mult: 8,  price: 2.00,  target: 4000,    sold: 0, revenue: 0, paused: false, winner: null },
  { id: 'cash1000',  cat: 'Cash',        title: '£1,000 Cash Prize',        grade: 'TIER 3 · 8×',     mult: 8,  price: 2.00,  target: 8000,    sold: 0, revenue: 0, paused: false, winner: null },
  { id: 'cash2500',  cat: 'Cash',        title: '£2,500 Cash Prize',        grade: 'TIER 3 · 9×',     mult: 9,  price: 5.00,  target: 22500,   sold: 0, revenue: 0, paused: false, winner: null },
  { id: 'cash5000',  cat: 'Cash',        title: '£5,000 Cash Prize',        grade: 'TIER 3 · 9×',     mult: 9,  price: 5.00,  target: 45000,   sold: 0, revenue: 0, paused: false, winner: null },
  { id: 'cash10000', cat: 'Cash',        title: '£10,000 Cash Prize',       grade: 'TIER 4 · 10×',    mult: 10, price: 10.00, target: 100000,  sold: 0, revenue: 0, paused: false, winner: null },
  { id: 'cash25000', cat: 'Cash',        title: '£25,000 Cash Prize',       grade: 'TIER 4 · 10×',    mult: 10, price: 10.00, target: 250000,  sold: 0, revenue: 0, paused: false, winner: null },
  { id: 'cash50000', cat: 'Cash',        title: '£50,000 Cash Prize',       grade: 'TIER 5 · 10×',    mult: 10, price: 20.00, target: 500000,  sold: 0, revenue: 0, paused: false, winner: null },
  /* --- headline & experiences --- */
  { id: 'paris',     cat: 'Holidays',    title: 'Paris Luxury Escape',      grade: 'TIER 2 · 7×',     mult: 7,  price: 2.50,  target: 14000,   sold: 0, revenue: 0, paused: false, winner: null },
  { id: 'dubai',     cat: 'Holidays',    title: 'Dubai 5-Star Week',        grade: 'TIER 2 · 8×',     mult: 8,  price: 3.00,  target: 16000,   sold: 0, revenue: 0, paused: false, winner: null },
  { id: 'nyc',       cat: 'Holidays',    title: 'New York Festive Break',   grade: 'TIER 3 · 9×',     mult: 9,  price: 2.00,  target: 9000,    sold: 0, revenue: 0, paused: false, winner: null },
  { id: 'supercar',  cat: 'Experiences', title: 'Supercar Driving Day',     grade: 'TIER 2 · 10×',    mult: 10, price: 5.00,  target: 8000,    sold: 0, revenue: 0, paused: false, winner: null },
  { id: 'btc100',    cat: 'Cash',        title: '£100K Bitcoin or Cash',    grade: 'HEADLINE · 6×',   mult: 6,  price: 10.00, target: 500000,  sold: 0, revenue: 0, paused: false, winner: null },
];

export function launchConfig() {
  const proofs = {
    officialRules: Boolean(process.env.OFFICIAL_RULES_URL && process.env.OFFICIAL_RULES_VERSION),
    prizeFunding: Boolean(process.env.PRIZE_FUND_ATTESTATION_REFERENCE),
    fundSafeguards: Boolean(process.env.FUNDS_SAFEGUARDING_PROVIDER && process.env.FUNDS_SAFEGUARDING_ACCOUNT_REFERENCE),
    paymentControls: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_MEMBERSHIP_PRICE_ID),
    counselSignoff: Boolean(process.env.LEGAL_REVIEW_APPROVAL_REFERENCE),
  };
  return {
    mode: "pre-launch", approvalStatus: "pending", approvalLabel: "Approval pending", launchReady: false, paidEntriesEnabled: false, prizeIssuanceEnabled: false,
    maxPerDraw: MAX_PER_DRAW, storageConfigured: Boolean(process.env.LAUNCH_BUILD_DATABASE_URL),
    proofs: PROOF_KEYS.map(key => ({ key, ok: proofs[key] })),
    message: "Approval pending. Proposed catalogue only. No entry, payment or prize entitlement is created. Proof notes cannot enable launch.",
  };
}

// Evidence presence is not approval or proof of an operational provider integration.
export function launchReadiness() {
  const config = launchConfig();
  return {
    approvalStatus: "pending", approvalLabel: "Approval pending", launchReady: false,
    capabilities: {
      catalogue: "available", reviewControls: config.storageConfigured ? "requires_database_verification" : "not_configured",
      checkout: "blocked", postalEntryIssuance: "blocked", selfExclusion: "requires_verified_account_integration",
      paymentWebhook: "requires_entry_ledger_integration", winnerSelection: "blocked",
    },
    evidence: config.proofs,
    blockers: [
      "Formal jurisdiction-specific legal and operational approval is pending.",
      "Verify identity, age, jurisdiction, consent and self-exclusion before accepting entries.",
      "Implement and verify transactional entry reservations, per-person caps and expiry.",
      "Verify provider-approved entry payments, signed webhooks, refunds and reconciliation against the entry ledger.",
      "Reconcile catalogue economics and skill challenges with approved official rules.",
      "Verify postal eligibility and audited winner selection against the same entry ledger.",
      "Apply and verify database migrations, backups and separate preview/production configuration.",
    ],
  };
}

// Admin-only rehearsal: no customer data, Stripe call, payment or ticket is created.
export function rehearseCheckout(body: Record<string, unknown>) {
  const seed = SEED_DRAWS.find(draw => draw.id === body.drawId);
  if (!seed) return { status: 404, body: { error: "no_draw" } };
  if (typeof body.qty !== "number" || !Number.isInteger(body.qty) || body.qty < 1 || body.qty > MAX_PER_DRAW)
    return { status: 400, body: { error: "bad_qty" } };
  const unitAmountPence = Math.round(seed.price * 100);
  return { status: 200, body: {
    approvalStatus: "pending", approvalLabel: "Approval pending", rehearsal: true,
    drawId: seed.id, qty: body.qty, currency: "gbp", unitAmountPence,
    totalAmountPence: unitAmountPence * body.qty, maxPerDraw: MAX_PER_DRAW,
    createsEntry: false, createsPayment: false, launchReady: false,
    message: "Quote rehearsal only. No eligibility check, reservation, entry or payment has occurred.",
  } };
}

export function publicDraw(seed: (typeof SEED_DRAWS)[number], paused = false) {
  // No verified sales ledger is connected. Never present the seed's zero as live sales.
  return { id: seed.id, cat: seed.cat, title: seed.title, grade: seed.grade, mult: seed.mult,
    price: seed.price, target: seed.target, sold: null, revenue: null, pct: null,
    unlocked: false, paused, winner: null, proposed: true };
}

export function authorized(request: Request) {
  const token = process.env.LAUNCH_BUILD_ADMIN_TOKEN;
  if (!token) return false;
  const actual = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${token}`);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

function database() {
  if (!process.env.LAUNCH_BUILD_DATABASE_URL) throw new Error("Launch database is not configured.");
  return neon(process.env.LAUNCH_BUILD_DATABASE_URL);
}

export async function GET(request: Request) {
  const action = new URL(request.url).searchParams.get("action") || "config";
  if (action === "config") return json(launchConfig());
  if (action === "readiness") return json(launchReadiness());
  if (action !== "draws" && action !== "admin/state") return json({ error: "no_route" }, 404);
  if (action === "admin/state" && !authorized(request)) return json({ error: "unauthorized" }, 401);
  // The proposed catalogue works before provisioning, but a configured store failure
  // must not silently discard saved pause controls.
  try {
    const states = process.env.LAUNCH_BUILD_DATABASE_URL
      ? await database()`SELECT draw_id, paused FROM launch_build_draw_controls` : [];
    const draws = SEED_DRAWS.map(seed => publicDraw(seed, states.find(row => row.draw_id === seed.id)?.paused === true));
    if (action === "draws") return json({ draws, storageConfigured: Boolean(process.env.LAUNCH_BUILD_DATABASE_URL) });
    const sql = database();
    const [proofNotes, audit] = await Promise.all([
      sql`SELECT proof_key, reviewed, note, updated_at FROM launch_build_proof_notes ORDER BY proof_key`,
      sql`SELECT at, actor, action, detail FROM launch_build_audit ORDER BY id DESC LIMIT 50`,
    ]);
    return json({ ...launchConfig(), draws, proofNotes, audit });
  } catch { return json({ error: "launch_store_unavailable" }, 503); }
}

export async function POST(request: Request) {
  const action = new URL(request.url).searchParams.get("action") || "";
  // Do not import the attachment's automatic demo payments or random winner route:
  // either would bypass this application's verified-account and draw audit controls.
  if (["checkout", "self-exclude"].includes(action)) return json({ error: "launch_locked", message: "No entries or account changes are accepted here. Use the approved account workflow after launch." }, 423);
  if (!action.startsWith("admin/")) return json({ error: "no_route" }, 404);
  if (!authorized(request)) return json({ error: "unauthorized" }, 401);
  if (action === "admin/postal") return json({ error: "use_postal_intake", path: "/postal-intake", message: "Use the existing protected postal intake. Recording a slip does not issue an entry." }, 409);
  const match = action.match(/^admin\/draws\/([a-z0-9]+)\/(pause|resume|draw)$/);
  if (match?.[2] === "draw") return json({ error: "prize_issuance_locked" }, 423);
  if (action !== "admin/proofs" && action !== "admin/checkout-rehearsal" && !match) return json({ error: "no_route" }, 404);
  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 32_768) return json({ error: "body_too_large" }, 413);
    const parsed = JSON.parse(raw || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid object");
    body = parsed;
  } catch { return json({ error: "invalid_json" }, 400); }
  if (action === "admin/checkout-rehearsal") {
    const result = rehearseCheckout(body);
    return json(result.body, result.status);
  }
  if (match && !SEED_DRAWS.some(draw => draw.id === match[1])) return json({ error: "no_draw" }, 404);
  if (action === "admin/proofs" && (!PROOF_KEYS.includes(body.key as typeof PROOF_KEYS[number]) || typeof body.ok !== "boolean" || (body.note !== undefined && typeof body.note !== "string"))) return json({ error: "invalid_proof" }, 400);
  try {
    const sql = database();
    // The control update and its audit record commit in the same SQL statement.
    if (action === "admin/proofs") {
      const key = String(body.key), note = String(body.note || "").slice(0, 300), ok = body.ok === true;
      await sql`WITH updated AS (
        INSERT INTO launch_build_proof_notes (proof_key, reviewed, note) VALUES (${key}, ${ok}, ${note})
        ON CONFLICT (proof_key) DO UPDATE SET reviewed = EXCLUDED.reviewed, note = EXCLUDED.note, updated_at = NOW()
        RETURNING proof_key
      ) INSERT INTO launch_build_audit (actor, action, detail)
        SELECT 'admin', 'proof_note_updated', ${JSON.stringify({ key, ok, note })} FROM updated`;
    } else {
      const id = match![1], paused = match![2] === "pause";
      await sql`WITH updated AS (
        INSERT INTO launch_build_draw_controls (draw_id, paused) VALUES (${id}, ${paused})
        ON CONFLICT (draw_id) DO UPDATE SET paused = EXCLUDED.paused, updated_at = NOW()
        RETURNING draw_id
      ) INSERT INTO launch_build_audit (actor, action, detail)
        SELECT 'admin', ${paused ? "pause" : "resume"}, draw_id FROM updated`;
    }
    return json({ ok: true, launchReady: false });
  } catch { return json({ error: "launch_store_unavailable" }, 503); }
}
