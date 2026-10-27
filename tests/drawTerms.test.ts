import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { drawKeyTerms, categoryFor } = await import("../src/components/DrawTermsSheet.tsx");
const general = readFileSync(new URL("../src/components/GeneralDrawTerms.tsx", import.meta.url), "utf8");
const schedules = readFileSync(new URL("../src/components/DrawSchedules.tsx", import.meta.url), "utf8");

test("every draw section passes key terms to its cards", () => {
  for (const f of ["CategoryDrawCarousel", "LuxuryHolidaysSection", "CashPrizesCarousel", "FeaturedDraws", "PartnershipCampaignPage", "HomePage"]) {
    const src = readFileSync(new URL(`../src/components/${f}.tsx`, import.meta.url), "utf8");
    assert.match(src, /terms=\{\{ drawName:/, `${f} renders draw cards without terms`);
  }
});

test("key terms say the draw is not open and include the free postal route", () => {
  const t = drawKeyTerms({ drawName: "Test Draw", category: "cash", prize: "£1,000 cash", entry: "£1" });
  const all = t.map((x) => x.text).join(" ");
  assert.match(all, /not open/);
  assert.match(all, /free postal entry route/);
  assert.match(all, /£1,000 cash/);
  assert.match(all, /SC888447/);
});

test("every 'read the full section' link points at a real section of the general terms", () => {
  const ids = new Set([...general.matchAll(/"id": "([^"]+)"/g)].map((m) => m[1]));
  if (schedules.includes('id="draw-schedules"')) ids.add("draw-schedules");
  for (const c of ["vehicle", "cash", "bitcoin", "gaming", "holiday", "other"] as const) {
    for (const x of drawKeyTerms({ drawName: "X", category: c, prize: "P", entry: "E" })) if (x.ref) assert.ok(ids.has(x.ref), `missing #${x.ref}`);
  }
});

test("draw names map to the right prize schedule", () => {
  assert.equal(categoryFor("Ferrari 488 GTB Sports car"), "vehicle");
  assert.equal(categoryFor("£100K Bitcoin Prize or £100K Cash"), "bitcoin");
  assert.equal(categoryFor("Cash £5,000"), "cash");
  assert.equal(categoryFor("Maldives holiday"), "holiday");
  assert.equal(categoryFor("1kg Solid Gold Bar Bullion prize"), "other");
});
