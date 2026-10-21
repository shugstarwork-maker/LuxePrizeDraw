// ── League & prize eligibility + provably fair shuffle verification ──
// Kept in its own module so the core league ledger stays untouched.
import { trustState, loadReviewQueue, provisionalXP } from "./pokerLeague";

/** Only validated rankings release rewards: confirmed points, clean trust, no pending reviews. */
export function prizeEligibility(): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const trust = trustState();
  if (trust.score < 100 || trust.flags.length > 0) reasons.push("A flagged pattern is awaiting review — trust must be clean before rewards are released.");
  const pending = loadReviewQueue().filter((r) => r.status === "pending");
  if (pending.length > 0) reasons.push(`${pending.length} result${pending.length === 1 ? "" : "s"} still awaiting review.`);
  if (provisionalXP() > 0) reasons.push("Provisional points are still inside their review window.");
  return { eligible: reasons.length === 0, reasons };
}

// ── Provably fair shuffle (client-side verification) ──
// The server commits to SHA-256(handSecret) before dealing and reveals the secret and deck
// after the hand. Here we re-run the identical shuffle locally and re-hash the secret, so
// verification doesn't depend on trusting the server's own "verified" flag.
function mulberry32client(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
async function sha256hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
export type FairnessProof = { hand: number; commitment: string; secret?: string; deck?: string[]; revealed: boolean; serverVerified?: boolean; localVerified?: boolean };

/** Fetch a real dealt hand (demo table) and independently verify the commit–reveal locally. */
export async function verifyShuffleFairness(): Promise<FairnessProof | null> {
  try {
    const res = await fetch("/api/poker/fairness/demo");
    if (!res.ok) return null;
    const data = (await res.json()) as { hand: number; commitment: string; secret: string; deck: string[]; verified: boolean };
    let localVerified = false;
    try {
      const seed = parseInt(data.secret.slice(0, 8), 16);
      // identical to the server's shuffle: same deck order, same Fisher–Yates, same RNG
      const deck = (["♠", "♥", "♦", "♣"] as const).flatMap((suit) => (["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"] as const).map((rank) => `${rank}${suit}`));
      const rng = mulberry32client(seed);
      for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
      localVerified = (await sha256hex(data.secret)) === data.commitment && JSON.stringify(deck) === JSON.stringify(data.deck);
    } catch { localVerified = false; }
    return { hand: data.hand, commitment: data.commitment, secret: data.secret, deck: data.deck, revealed: true, serverVerified: data.verified, localVerified };
  } catch { return null; }
}
