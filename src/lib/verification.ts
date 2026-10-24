// Verification & payout compliance — demo layer.
// Mirrors db/schema.sql so the front-end can render the real data model
// before any provider keys (Yoti/Veriff/Onfido, Twilio/Firebase) exist.
// Everything here is a pre-launch simulation: no real identity data is
// collected, and no verification decision is enforced yet.

export const WITHDRAWAL_MIN_PENCE = 2000;      // £20 minimum
export const WITHDRAWAL_DAILY_CAP_PENCE = 50000; // £500 daily maximum
export const KYC_PROVIDERS = ["yoti", "veriff", "onfido"] as const;
export const OTP_PROVIDERS = ["twilio", "firebase"] as const;

export type KycProvider = (typeof KYC_PROVIDERS)[number];
export type KycStatus = "pending" | "approved" | "rejected" | "expired";

// ── Schema map (kept in sync with db/schema.sql) ────────────────────────────

export type SchemaTable = {
  name: string;
  module: "A" | "B" | "C" | "payout" | "redemption" | "core" | "anticheat";
  purpose: string;
  keyColumns: string[];
  links: { to: string; via: string }[];
};

export const SCHEMA_MAP: SchemaTable[] = [
  {
    name: "users",
    module: "core",
    purpose: "Core player profile — display name, email, DOB, account status.",
    keyColumns: ["id", "email (unique)", "date_of_birth", "status"],
    links: [],
  },
  {
    name: "device_fingerprints",
    module: "A",
    purpose: "Hardware identity per device. The same hash under a second account is a duplicate signal.",
    keyColumns: ["user_id → users", "fingerprint_hash", "attestation_token"],
    links: [{ to: "users", via: "user_id" }],
  },
  {
    name: "phone_verifications",
    module: "A",
    purpose: "SMS OTP gate. phone_e164 is unique — one phone ever verifies one account.",
    keyColumns: ["user_id → users", "phone_e164 (unique)", "provider", "status"],
    links: [{ to: "users", via: "user_id" }],
  },
  {
    name: "kyc_verifications",
    module: "B",
    purpose: "Yoti / Veriff / Onfido session decisions. Partial unique index allows ≤1 approved per user.",
    keyColumns: ["user_id → users", "provider", "status", "age_verified", "name_on_document"],
    links: [{ to: "users", via: "user_id" }],
  },
  {
    name: "payout_methods",
    module: "payout",
    purpose: "PayPal / bank rails. account_hash unique index is the duplicate-payout lock; name_match mirrors KYC name.",
    keyColumns: ["user_id → users", "account_hash (unique)", "holder_name", "name_match"],
    links: [
      { to: "users", via: "user_id" },
      { to: "kyc_verifications", via: "holder_name ↔ name_on_document" },
    ],
  },
  {
    name: "withdrawals",
    module: "payout",
    purpose: "Payout requests. £20 min by CHECK, £500/day cap via v_daily_withdrawal_totals, KYC required by constraint.",
    keyColumns: ["user_id → users", "payout_method_id → payout_methods", "amount_pence ≥ 2000", "kyc_approved_at NOT NULL"],
    links: [
      { to: "users", via: "user_id" },
      { to: "payout_methods", via: "payout_method_id" },
    ],
  },
  {
    name: "collusion_signals",
    module: "C",
    purpose: "Peer-to-peer flags: shared device / IP / Wi-Fi / payout between two accounts at the same table.",
    keyColumns: ["signal_type", "user_id_a → users", "user_id_b → users", "resolved"],
    links: [{ to: "users", via: "user_id_a / user_id_b" }],
  },
  {
    name: "enforcement_actions",
    module: "C",
    purpose: "What happened after a signal: watch, payout lock, suspend or ban.",
    keyColumns: ["user_id → users", "reason", "action"],
    links: [{ to: "users", via: "user_id" }],
  },
  {
    name: "redemption_items",
    module: "redemption",
    purpose: "Prize store catalogue. Priced in winnings credit — chips never convert.",
    keyColumns: ["name", "category", "cost_pence", "stock"],
    links: [],
  },
  {
    name: "redemption_orders",
    module: "redemption",
    purpose: "Prize claims. Same KYC gate as withdrawals — no approved KYC, no prize.",
    keyColumns: ["user_id → users", "item_id → redemption_items", "kyc_approved_at NOT NULL"],
    links: [
      { to: "users", via: "user_id" },
      { to: "redemption_items", via: "item_id" },
    ],
  },
  {
    name: "arena_matches",
    module: "anticheat",
    purpose: "Every board-game match (casual or prize). Server-authoritative: clients send coordinates, the server validates legality.",
    keyColumns: ["game", "format", "user_id_a/b → users", "entry_tickets (never Gold Coins)", "status"],
    links: [{ to: "users", via: "user_id_a / user_id_b" }],
  },
  {
    name: "move_telemetry",
    module: "anticheat",
    purpose: "Per-move stream: think time, engine-match flag, centipawn loss, focus loss, ping. Feeds the risk engine.",
    keyColumns: ["match_id → arena_matches", "think_ms", "engine_match", "focus_lost_before"],
    links: [
      { to: "arena_matches", via: "match_id" },
      { to: "users", via: "user_id" },
    ],
  },
  {
    name: "integrity_flags",
    module: "anticheat",
    purpose: "Risk report per player per match. Tier drives the 3-strike pipeline: shadow flag → match kill → hardware ban (human-reviewed).",
    keyColumns: ["risk_score 0–100", "tier", "module_quality/timing/focus", "reviewed_by"],
    links: [
      { to: "arena_matches", via: "match_id" },
      { to: "users", via: "user_id" },
    ],
  },
  {
    name: "hardware_bans",
    module: "anticheat",
    purpose: "Confirmed cheaters blacklisted by device fingerprint, payout hash and IP range so they cannot re-register.",
    keyColumns: ["fingerprint_hash ↔ device_fingerprints", "payout_hash ↔ payout_methods", "ip_range"],
    links: [
      { to: "users", via: "user_id" },
      { to: "integrity_flags", via: "flag_id" },
    ],
  },
];

// ── Demo device fingerprint ─────────────────────────────────────────────────
// A real build uses FingerprintJS (web) or DeviceCheck / App Attest (native).
// The demo derives a stable, anonymous hash from coarse browser traits only —
// no canvas/audio probing, nothing leaves the device.

const DEVICE_KEY = "luxe-verify-device-v1";

function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function demoDeviceFingerprint(): string {
  try {
    const cached = localStorage.getItem(DEVICE_KEY);
    if (cached) return cached;
    const nav = typeof navigator !== "undefined" ? navigator : ({} as Navigator);
    const scr = typeof screen !== "undefined" ? screen : ({} as Screen);
    const traits = [
      nav.userAgent ?? "ua?",
      nav.language ?? "en",
      String(new Date().getTimezoneOffset()),
      `${scr.width ?? 0}x${scr.height ?? 0}`,
      String(nav.hardwareConcurrency ?? 0),
    ].join("|");
    const hash = `demo-${fnv1a(traits)}${fnv1a(traits.split("").reverse().join(""))}`;
    localStorage.setItem(DEVICE_KEY, hash);
    return hash;
  } catch {
    return "demo-offline";
  }
}

// ── Verification checklist ──────────────────────────────────────────────────

export type VerificationStepId = "account" | "device" | "sms" | "kyc" | "payout";

export type VerificationStep = {
  id: VerificationStepId;
  label: string;
  module: "A" | "B";
  table: string;
  status: "done" | "demo" | "locked";
  detail: string;
};

export function verificationSteps(): VerificationStep[] {
  return [
    {
      id: "account",
      label: "Account profile",
      module: "A",
      table: "users",
      status: "done",
      detail: "Display name and email live in the users table.",
    },
    {
      id: "device",
      label: "Device fingerprint",
      module: "A",
      table: "device_fingerprints",
      status: "demo",
      detail: `This browser hashes to ${demoDeviceFingerprint()} — one account per device at launch.`,
    },
    {
      id: "sms",
      label: "SMS code check",
      module: "A",
      table: "phone_verifications",
      status: "locked",
      detail: "Twilio / Firebase OTP connects once provider contracts are signed. One phone, one account.",
    },
    {
      id: "kyc",
      label: "Age & ID check (18+)",
      module: "B",
      table: "kyc_verifications",
      status: "locked",
      detail: "Yoti, Veriff or Onfido will confirm passport / driving licence before any prize or payout.",
    },
    {
      id: "payout",
      label: "Payout method match",
      module: "A",
      table: "payout_methods",
      status: "locked",
      detail: `PayPal or bank holder name must match the verified ID. £${WITHDRAWAL_MIN_PENCE / 100} minimum, £${WITHDRAWAL_DAILY_CAP_PENCE / 100} daily maximum.`,
    },
  ];
}

export function verificationProgress(steps: VerificationStep[]): number {
  if (steps.length === 0) return 0;
  const score = steps.reduce((acc, s) => acc + (s.status === "done" ? 1 : s.status === "demo" ? 0.5 : 0), 0);
  return Math.round((score / steps.length) * 100);
}
