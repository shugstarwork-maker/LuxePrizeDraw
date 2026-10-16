import assert from "node:assert/strict";
import test from "node:test";
import {
  DRAW_ECONOMICS_TIERS,
  breakEvenEntries,
  economicsForPrize,
  marginSummary,
  netProfitTargetGBP,
  requiredGrossGBP,
  targetEntries,
} from "../src/data/drawEconomics";

test("tier boundaries map to the right multiple (6x headline down to 10x entry)", () => {
  assert.equal(economicsForPrize(100000).multiple, 6);
  assert.equal(economicsForPrize(50000).multiple, 6);
  assert.equal(economicsForPrize(49999.99).multiple, 7);
  assert.equal(economicsForPrize(20000).multiple, 7);
  assert.equal(economicsForPrize(19999.99).multiple, 8);
  assert.equal(economicsForPrize(10000).multiple, 8);
  assert.equal(economicsForPrize(9999.99).multiple, 9);
  assert.equal(economicsForPrize(2000).multiple, 9);
  assert.equal(economicsForPrize(1999.99).multiple, 10);
  assert.equal(economicsForPrize(0).multiple, 10);
});

test("multiple falls as prize value rises across the whole ladder", () => {
  for (let i = 1; i < DRAW_ECONOMICS_TIERS.length; i += 1) {
    assert.ok(DRAW_ECONOMICS_TIERS[i].multiple > DRAW_ECONOMICS_TIERS[i - 1].multiple);
  }
});

test("net profit target is the tier multiple of prize value", () => {
  assert.equal(netProfitTargetGBP(100000), 600000);
  assert.equal(netProfitTargetGBP(25000), 175000);
  assert.equal(netProfitTargetGBP(1000), 10000);
});

test("required gross covers prize and platform costs and still hits the target", () => {
  const gross = requiredGrossGBP(100000);
  const net = Math.round(gross * 0.85) - 100000;
  assert.ok(net >= 600000, `net ${net} should reach the 6x target`);
});

test("entry counts round up and target exceeds break-even", () => {
  const prize = 5000, ticket = 4;
  const breakEven = breakEvenEntries(prize, ticket);
  const target = targetEntries(prize, ticket);
  assert.ok(breakEven > 0);
  assert.ok(target > breakEven);
  assert.equal(target, Math.ceil(requiredGrossGBP(prize) / ticket));
});

test("margin summary reports a consistent worked example", () => {
  const s = marginSummary(100000, 5);
  assert.equal(s.multiple, 6);
  assert.equal(s.netProfitTargetGBP, 600000);
  assert.equal(s.targetEntries, Math.ceil(s.grossRequiredGBP / 5));
  assert.ok(s.netProfitAtTargetGBP >= s.netProfitTargetGBP);
});

test("invalid inputs are rejected", () => {
  assert.throws(() => economicsForPrize(-1));
  assert.throws(() => economicsForPrize(Number.NaN));
  assert.throws(() => breakEvenEntries(1000, 0));
  assert.throws(() => requiredGrossGBP(1000, 1.2));
});
