import crypto from "node:crypto";

export type EntryRoute = "FREE" | "PAID";
export type AccountStatus = "ACTIVE" | "PAUSED" | "SUSPENDED" | "CLOSED";
export type DrawStatus = "DRAFT" | "OPEN" | "CLOSED" | "DRAWN" | "FULFILLED" | "CANCELLED";

export const CREDIT_CARD_MONTHLY_LIMIT_MINOR = 25_000;

export function ageOn(dateOfBirth: string, now = new Date()): number | null {
  const birth = new Date(`${dateOfBirth}T00:00:00.000Z`);
  if (Number.isNaN(birth.getTime()) || birth > now) return null;
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const anniversary = new Date(Date.UTC(now.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate()));
  if (anniversary > now) age -= 1;
  return age;
}

export function canParticipate(input: { accountStatus: AccountStatus; dateOfBirth: string; ageVerifiedAt: string | null; spendLimitMinor: number; monthlySpendMinor: number; now?: Date }): { allowed: boolean; reason?: string } {
  if (input.accountStatus !== "ACTIVE") return { allowed: false, reason: "ACCOUNT_NOT_ACTIVE" };
  if (!input.ageVerifiedAt || (ageOn(input.dateOfBirth, input.now) ?? 0) < 18) return { allowed: false, reason: "AGE_VERIFICATION_REQUIRED" };
  if (input.spendLimitMinor < 0 || input.monthlySpendMinor > input.spendLimitMinor) return { allowed: false, reason: "SPEND_LIMIT_REACHED" };
  return { allowed: true };
}

export function evaluatePayment(input: { accountStatus: AccountStatus; spendLimitMinor: number; monthlySpendMinor: number; amountMinor: number; cardType: "CREDIT" | "DEBIT" | "OTHER"; creditCardMonthlySpendMinor: number; drawType: "STANDARD" | "INSTANT_WIN" }): { allowed: boolean; reason?: string } {
  if (input.accountStatus !== "ACTIVE") return { allowed: false, reason: "ACCOUNT_NOT_ACTIVE" };
  if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0) return { allowed: false, reason: "INVALID_AMOUNT" };
  if (input.monthlySpendMinor + input.amountMinor > input.spendLimitMinor) return { allowed: false, reason: "SPEND_LIMIT_EXCEEDED" };
  if (input.cardType === "CREDIT" && input.drawType === "INSTANT_WIN") return { allowed: false, reason: "CREDIT_CARD_NOT_ALLOWED_FOR_INSTANT_WIN" };
  if (input.cardType === "CREDIT" && input.creditCardMonthlySpendMinor + input.amountMinor > CREDIT_CARD_MONTHLY_LIMIT_MINOR) return { allowed: false, reason: "CREDIT_CARD_MONTHLY_LIMIT_EXCEEDED" };
  return { allowed: true };
}

export function canCreateEntry(input: { drawStatus: DrawStatus; closesAt: Date; account: ReturnType<typeof canParticipate>; route: EntryRoute; existingEntriesForRoute: number; routeLimit: number; payment?: ReturnType<typeof evaluatePayment> }): { allowed: boolean; reason?: string } {
  if (input.drawStatus !== "OPEN" || input.closesAt.getTime() <= Date.now()) return { allowed: false, reason: "DRAW_CLOSED" };
  if (!input.account.allowed) return input.account;
  if (!Number.isSafeInteger(input.routeLimit) || input.routeLimit < 1 || input.existingEntriesForRoute >= input.routeLimit) return { allowed: false, reason: "ENTRY_LIMIT_REACHED" };
  if (input.route === "PAID" && !input.payment?.allowed) return input.payment || { allowed: false, reason: "PAYMENT_REQUIRED" };
  return { allowed: true };
}

export function validateDrawTransition(from: DrawStatus, to: DrawStatus, reason?: string): { allowed: boolean; reason?: string } {
  const allowed: Record<DrawStatus, DrawStatus[]> = { DRAFT: ["OPEN", "CANCELLED"], OPEN: ["CLOSED"], CLOSED: ["DRAWN"], DRAWN: ["FULFILLED"], FULFILLED: [], CANCELLED: [] };
  if (!allowed[from].includes(to)) return { allowed: false, reason: "INVALID_DRAW_TRANSITION" };
  if (to === "CANCELLED" && !reason?.trim()) return { allowed: false, reason: "CANCELLATION_REASON_REQUIRED" };
  return { allowed: true };
}

export function materialDrawChangeAllowed(status: DrawStatus, field: string): boolean {
  const immutableAfterOpen = new Set(["prize", "ticketPriceMinor", "maximumEntries", "closesAt", "freeEntryMethod", "winnerMethod", "eligibility"]);
  return status === "DRAFT" || !immutableAfterOpen.has(field);
}

export function selectWinner(entryIds: string[], finalSeed: string): { winningEntryId: string; digest: string; index: number } {
  if (!entryIds.length) throw new Error("NO_ELIGIBLE_ENTRIES");
  if (!/^[a-f0-9]{64}$/i.test(finalSeed)) throw new Error("INVALID_FINAL_SEED");
  const canonicalEntries = [...entryIds].sort();
  if (new Set(canonicalEntries).size !== canonicalEntries.length) throw new Error("DUPLICATE_ENTRY_ID");
  const digest = crypto.createHash("sha256").update(`${finalSeed}:${canonicalEntries.join(":")}`).digest("hex");
  const index = Number(BigInt(`0x${digest.slice(0, 16)}`) % BigInt(canonicalEntries.length));
  return { winningEntryId: canonicalEntries[index], digest, index };
}

export function auditHash(previousHash: string | null, event: object): string {
  return crypto.createHash("sha256").update(`${previousHash || "GENESIS"}:${JSON.stringify(event)}`).digest("hex");
}
