// Prize Points & voucher payout engine — demo layer.
// Prize Points are the third, separate ledger: they are ONLY ever won in
// Sweep Ticket prize matches and ONLY ever redeemed for vouchers or credit.
// Gold Coins and Sweep Tickets can never convert into Prize Points.
//
// Pre-launch: everything here is a simulation. At launch, redemptions call a
// B2B gift-card API (Tango Card / Giftbit) that buys and emails the voucher
// automatically — no manual bank transfers, no physical shipping.

const POINTS_KEY = "luxe-prize-points-v1";
const ORDERS_KEY = "luxe-prize-orders-v1";

export const POINTS_PER_POUND = 1000;              // 1,000 points = £1
export const AML_REVIEW_THRESHOLD_PENCE = 50000;   // £500 → 24h manual review hold
export const AML_REVIEW_HOURS = 24;

// ── Prize Points wallet ─────────────────────────────────────────────────────

export function prizePoints(): number {
  try { return Number(localStorage.getItem(POINTS_KEY)) || 0; } catch { return 0; }
}

export function grantPrizePoints(amount: number): number {
  const next = prizePoints() + Math.max(0, Math.floor(amount));
  try { localStorage.setItem(POINTS_KEY, String(next)); } catch { /* demo only */ }
  return next;
}

// ── Voucher catalogue (Tango Card / Giftbit brand stubs) ───────────────────

export type VoucherBrand = {
  id: string;
  brand: string;
  valuePence: number;
  provider: "tango" | "giftbit";
  delivery: "email";
};

export const VOUCHER_BRANDS: VoucherBrand[] = [
  { id: "amazon-10", brand: "Amazon", valuePence: 1000, provider: "tango", delivery: "email" },
  { id: "tesco-25", brand: "Tesco", valuePence: 2500, provider: "giftbit", delivery: "email" },
  { id: "uber-25", brand: "Uber", valuePence: 2500, provider: "tango", delivery: "email" },
  { id: "amazon-50", brand: "Amazon", valuePence: 5000, provider: "giftbit", delivery: "email" },
  { id: "tesco-100", brand: "Tesco", valuePence: 10000, provider: "tango", delivery: "email" },
];

export function pointsCost(valuePence: number): number {
  return (valuePence / 100) * POINTS_PER_POUND;
}

// ── Redemption orders with AML hold ─────────────────────────────────────────

export type RedemptionOrderStatus = "processing" | "pending_review" | "fulfilled" | "rejected";

export type PrizeOrder = {
  id: string;
  voucherId: string;
  pointsSpent: number;
  valuePence: number;
  status: RedemptionOrderStatus;
  createdAt: number;
  reviewReleaseAt: number | null; // set when AML hold applies
};

function orders(): PrizeOrder[] {
  try { return (JSON.parse(localStorage.getItem(ORDERS_KEY) ?? "[]") as PrizeOrder[]) ?? []; } catch { return []; }
}

function saveOrders(list: PrizeOrder[]): void {
  try { localStorage.setItem(ORDERS_KEY, JSON.stringify(list.slice(-50))); } catch { /* demo only */ }
}

export function prizeOrders(): PrizeOrder[] {
  return orders();
}

export type RedeemResult =
  | { ok: true; order: PrizeOrder; points: number }
  | { ok: false; reason: string };

/**
 * Redeem Prize Points for a digital voucher.
 * AML ceiling: anything over £500 holds in pending_review for 24h so the
 * player's anti-cheat logs can be checked before the voucher is issued.
 */
export function redeemVoucher(voucherId: string): RedeemResult {
  const voucher = VOUCHER_BRANDS.find((v) => v.id === voucherId);
  if (!voucher) return { ok: false, reason: "Unknown voucher." };
  const cost = pointsCost(voucher.valuePence);
  const balance = prizePoints();
  if (balance < cost) return { ok: false, reason: `You need ${cost.toLocaleString()} Prize Points — you have ${balance.toLocaleString()}. Win prize matches to earn more.` };

  const amlHold = voucher.valuePence > AML_REVIEW_THRESHOLD_PENCE;
  const order: PrizeOrder = {
    id: `po_${Date.now().toString(36)}`,
    voucherId,
    pointsSpent: cost,
    valuePence: voucher.valuePence,
    status: amlHold ? "pending_review" : "processing",
    createdAt: Date.now(),
    reviewReleaseAt: amlHold ? Date.now() + AML_REVIEW_HOURS * 3600 * 1000 : null,
  };
  try { localStorage.setItem(POINTS_KEY, String(balance - cost)); } catch { /* demo only */ }
  saveOrders([...orders(), order]);
  return { ok: true, order, points: balance - cost };
}
