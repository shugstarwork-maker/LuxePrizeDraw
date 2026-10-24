// Module C — peer-to-peer collusion & proximity gate.
// Before two players sit at the same competitive prize table, this gate checks
// shared IP, shared local network, and historic repeat-opponent patterns.
// Pre-launch simulation: pure functions over injected connection facts; the
// live server reads real IPs / Wi-Fi BSSIDs from the socket handshake and
// match history from arena_matches.

export type ConnectionFacts = {
  ip: string;            // public IP seen by the server
  networkId?: string;    // local network fingerprint (BSSID hash where the OS allows it)
};

export type MatchHistoryEntry = {
  opponentId: string;
  stakes: "casual" | "prize";
  at: number;
};

// Repeatedly meeting the same opponent in prize rooms is a collusion signal.
export const REPEAT_OPPONENT_WINDOW_DAYS = 30;
export const REPEAT_OPPONENT_FLAG_COUNT = 5;  // ≥5 prize matches vs same player in 30 days

export type ProximityVerdict =
  | { allowed: true }
  | { allowed: false; reason: "shared_ip" | "shared_network" | "repeat_opponent"; detail: string };

/**
 * The prize-table seating gate. Casual rooms are never blocked (Module C only
 * guards prize play); prize matches refuse seating on any proximity signal.
 */
export function checkPrizeSeating(
  you: ConnectionFacts & { userId: string },
  opponent: ConnectionFacts & { userId: string },
  history: MatchHistoryEntry[],
  now = Date.now(),
): ProximityVerdict {
  if (you.ip && you.ip === opponent.ip) {
    return {
      allowed: false,
      reason: "shared_ip",
      detail: "This device shares an internet address with another player at the table. Prize matches require separate connections — try a casual social room instead.",
    };
  }
  if (you.networkId && opponent.networkId && you.networkId === opponent.networkId) {
    return {
      allowed: false,
      reason: "shared_network",
      detail: "You appear to be on the same local network as another player. Prize matches can't run between players on shared Wi-Fi.",
    };
  }
  const windowStart = now - REPEAT_OPPONENT_WINDOW_DAYS * 24 * 3600 * 1000;
  const recent = history.filter((h) => h.opponentId === opponent.userId && h.stakes === "prize" && h.at >= windowStart);
  if (recent.length >= REPEAT_OPPONENT_FLAG_COUNT) {
    return {
      allowed: false,
      reason: "repeat_opponent",
      detail: `You've played ${recent.length} prize matches against this opponent in ${REPEAT_OPPONENT_WINDOW_DAYS} days. Matchmaking will pair you with someone new to keep prize play fair.`,
    };
  }
  return { allowed: true };
}

/** Signal type mapping for collusion_signals table inserts. */
export const SIGNAL_BY_REASON = {
  shared_ip: "shared_ip",
  shared_network: "shared_wifi",
  repeat_opponent: "shared_ip", // repeat-opponent records as a pattern signal
} as const;

// ── SMS OTP (Twilio / Firebase) — demo flow ─────────────────────────────────
// Pre-launch: no SMS is sent. The flow enforces UK mobile format, the
// one-phone-one-account lock, and a deterministic demo code (last 4 digits).
// At launch, requestCode calls Twilio Verify / Firebase Auth server-side.

const PHONE_LOCK_KEY = "luxe-phone-lock-v1";

export function normaliseUKMobile(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  const e164 = digits.startsWith("+44") ? digits : digits.startsWith("07") ? "+44" + digits.slice(1) : null;
  if (!e164 || !/^\+447\d{9}$/.test(e164)) return null;
  return e164;
}

/** One phone number ever verifies one account (phone_verifications.phone_e164 UNIQUE). */
export function phoneAlreadyLocked(phoneE164: string, userId: string): boolean {
  try {
    const lock = JSON.parse(localStorage.getItem(PHONE_LOCK_KEY) ?? "{}") as Record<string, string>;
    return lock[phoneE164] !== undefined && lock[phoneE164] !== userId;
  } catch {
    return false;
  }
}

export function requestDemoCode(phoneE164: string, userId: string): { ok: boolean; reason?: string } {
  if (phoneAlreadyLocked(phoneE164, userId)) {
    return { ok: false, reason: "This number is already verified on another account — one phone, one account." };
  }
  return { ok: true };
}

/** Demo code is the last 4 digits of the number — the UI never says so. */
export function verifyDemoCode(phoneE164: string, code: string, userId: string): { ok: boolean; reason?: string } {
  if (phoneAlreadyLocked(phoneE164, userId)) {
    return { ok: false, reason: "This number is already verified on another account." };
  }
  const expected = phoneE164.slice(-4);
  if (code.trim() !== expected) return { ok: false, reason: "That code doesn't match — check the message and try again." };
  try {
    const lock = JSON.parse(localStorage.getItem(PHONE_LOCK_KEY) ?? "{}") as Record<string, string>;
    lock[phoneE164] = userId;
    localStorage.setItem(PHONE_LOCK_KEY, JSON.stringify(lock));
  } catch { /* demo only */ }
  return { ok: true };
}

// ── Payout name matching ────────────────────────────────────────────────────
// Payouts only go to an account holder whose name matches the verified ID.

export function normaliseName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z\s-]/g, "").replace(/\s+/g, " ");
}

export function payoutNameMatches(kycName: string, holderName: string): boolean {
  const a = normaliseName(kycName);
  const b = normaliseName(holderName);
  if (!a || !b) return false;
  if (a === b) return true;
  // Allow reordered or partially-initialled forms ("J Smith" vs "John Smith"
  // still needs review — only exact token-set matches pass automatically).
  const ta = new Set(a.split(" "));
  const tb = new Set(b.split(" "));
  return ta.size === tb.size && [...ta].every((t) => tb.has(t));
}
