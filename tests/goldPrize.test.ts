import test from "node:test";
import assert from "node:assert/strict";

const { GOLD_PRIZE_STEPS, goldPrizeStep, goldReleasePermitted, goldDispatchReady } = await import("../src/lib/goldPrize");

const base = {
  prizeId: "gp_1kg", sourcedFromDealer: null, corporatePurchaseRef: null,
  winnerId: null, idCheckPassed: false, claimsFormSigned: false,
  dispatchedByDealer: false, insuredTransitRef: null,
};

test("the four mandatory steps exist in order", () => {
  assert.deepEqual(GOLD_PRIZE_STEPS.map((s) => s.step), [
    "CORPORATE_SOURCING", "REGULATORY_CODE", "WINNER_VERIFICATION", "FULFILMENT",
  ]);
  assert.ok(GOLD_PRIZE_STEPS[0].requirement.includes("corporate funds"));
  assert.ok(GOLD_PRIZE_STEPS[1].requirement.includes("DCMS Voluntary Code"));
  assert.ok(GOLD_PRIZE_STEPS[2].requirement.includes("ID check"));
  assert.ok(GOLD_PRIZE_STEPS[3].requirement.includes("insured transit"));
});

test("release is blocked until sourcing, ID check and claims form are all complete", () => {
  assert.equal(goldReleasePermitted(base).allowed, false);                          // not sourced
  const sourced = { ...base, sourcedFromDealer: "Sharps Pixley", corporatePurchaseRef: "TX-001", winnerId: "usr_w1" };
  assert.equal(goldReleasePermitted(sourced).allowed, false);                       // no ID check
  const idOk = { ...sourced, idCheckPassed: true };
  assert.equal(goldReleasePermitted(idOk).allowed, false);                          // no claims form
  const verified = { ...idOk, claimsFormSigned: true };
  assert.equal(goldReleasePermitted(verified).allowed, true);                       // all gates pass
});

test("dispatch additionally requires insured transit arranged", () => {
  const verified = { ...base, sourcedFromDealer: "Sharps Pixley", corporatePurchaseRef: "TX-001", winnerId: "usr_w1", idCheckPassed: true, claimsFormSigned: true };
  assert.equal(goldDispatchReady(verified).allowed, false);
  assert.match(goldDispatchReady(verified).reason ?? "", /insured transit/i);
  assert.equal(goldDispatchReady({ ...verified, insuredTransitRef: "INS-99" }).allowed, true);
});

test("step progression is strictly sequential", () => {
  assert.equal(goldPrizeStep(base), "CORPORATE_SOURCING");
  const sourcing = { ...base, sourcedFromDealer: "Sharps Pixley", corporatePurchaseRef: "TX-001" };
  assert.equal(goldPrizeStep(sourcing), "WINNER_VERIFICATION");
  const shipped = { ...sourcing, winnerId: "usr_w1", idCheckPassed: true, claimsFormSigned: true, dispatchedByDealer: true, insuredTransitRef: "INS-99" };
  assert.equal(goldPrizeStep(shipped), "FULFILMENT");
});
