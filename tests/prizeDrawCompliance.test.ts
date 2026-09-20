import assert from "node:assert/strict";
import test from "node:test";
import { CREDIT_CARD_MONTHLY_LIMIT_MINOR, ageOn, auditHash, canCreateEntry, canParticipate, evaluatePayment, materialDrawChangeAllowed, selectWinner, validateDrawTransition } from "../src/lib/prizeDrawCompliance";

const adult = { accountStatus: "ACTIVE" as const, dateOfBirth: "1990-01-01", ageVerifiedAt: "2026-01-01T00:00:00Z", spendLimitMinor: 10_000, monthlySpendMinor: 0 };
test("under-18 and unverified accounts cannot participate", () => {
  assert.equal(canParticipate({ ...adult, dateOfBirth: "2010-01-01" }).allowed, false);
  assert.equal(canParticipate({ ...adult, ageVerifiedAt: null }).allowed, false);
});
test("a £0 limit blocks payment", () => assert.equal(evaluatePayment({ ...adult, spendLimitMinor: 0, amountMinor: 1, cardType: "DEBIT", creditCardMonthlySpendMinor: 0, drawType: "STANDARD" }).reason, "SPEND_LIMIT_EXCEEDED"));
test("credit-card controls enforce £250 monthly cap and instant-win prohibition", () => {
  assert.equal(evaluatePayment({ ...adult, amountMinor: 1, cardType: "CREDIT", creditCardMonthlySpendMinor: CREDIT_CARD_MONTHLY_LIMIT_MINOR, drawType: "STANDARD" }).reason, "CREDIT_CARD_MONTHLY_LIMIT_EXCEEDED");
  assert.equal(evaluatePayment({ ...adult, amountMinor: 1, cardType: "CREDIT", creditCardMonthlySpendMinor: 0, drawType: "INSTANT_WIN" }).reason, "CREDIT_CARD_NOT_ALLOWED_FOR_INSTANT_WIN");
});
test("free and paid entries use one eligibility decision and route limits", () => {
  const account = canParticipate(adult);
  assert.equal(canCreateEntry({ drawStatus: "OPEN", closesAt: new Date(Date.now() + 10_000), account, route: "FREE", existingEntriesForRoute: 0, routeLimit: 1 }).allowed, true);
  assert.equal(canCreateEntry({ drawStatus: "OPEN", closesAt: new Date(Date.now() + 10_000), account, route: "FREE", existingEntriesForRoute: 1, routeLimit: 1 }).reason, "ENTRY_LIMIT_REACHED");
});
test("closed draws and suspended accounts cannot create entries", () => {
  assert.equal(canCreateEntry({ drawStatus: "CLOSED", closesAt: new Date(Date.now() + 10_000), account: canParticipate(adult), route: "FREE", existingEntriesForRoute: 0, routeLimit: 1 }).reason, "DRAW_CLOSED");
  assert.equal(canParticipate({ ...adult, accountStatus: "SUSPENDED" }).reason, "ACCOUNT_NOT_ACTIVE");
});
test("draw locks prevent material changes after opening and invalid lifecycle transitions", () => {
  assert.equal(materialDrawChangeAllowed("OPEN", "closesAt"), false);
  assert.equal(materialDrawChangeAllowed("OPEN", "publicSummary"), true);
  assert.equal(validateDrawTransition("OPEN", "CANCELLED", "low sales").allowed, false);
  assert.equal(validateDrawTransition("CLOSED", "DRAWN").allowed, true);
});
test("winner selection is reproducible, unique, and order independent", () => {
  const seed = "a".repeat(64);
  assert.deepEqual(selectWinner(["B", "A", "C"], seed), selectWinner(["C", "B", "A"], seed));
  assert.throws(() => selectWinner(["A", "A"], seed), /DUPLICATE_ENTRY_ID/);
});
test("audit events chain cryptographically", () => assert.notEqual(auditHash(null, { type: "DRAW_OPENED" }), auditHash("x", { type: "DRAW_OPENED" })));
test("age calculation rejects future dates", () => assert.equal(ageOn("2999-01-01"), null));
