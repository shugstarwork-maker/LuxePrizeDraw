import assert from "node:assert/strict";
import test from "node:test";
import { COMPANY_STATUSES, isValidId, validateCompanyRecord } from "../api/company-records/shared";

const validInput = {
  companyName: "Northern Supercar Hire",
  contactReference: "partnerships@luxeprizedraw.com",
};

test("a minimal record validates as an OPPORTUNITY by default", () => {
  const parsed = validateCompanyRecord(validInput);
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.value.status, "OPPORTUNITY");
    assert.equal(parsed.value.category, "partnership");
  }
});

test("required fields and status values are enforced", () => {
  assert.equal(validateCompanyRecord({}).ok, false);
  assert.equal(validateCompanyRecord({ ...validInput, companyName: "  " }).ok, false);
  assert.equal(validateCompanyRecord({ ...validInput, contactReference: "" }).ok, false);
  const bad = validateCompanyRecord({ ...validInput, status: "SIGNED" });
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.match(bad.errors.join(" "), /status must be one of/);
});

test("CONFIRMED status requires an evidence reference", () => {
  assert.equal(validateCompanyRecord({ ...validInput, status: "CONFIRMED" }).ok, false);
  const confirmed = validateCompanyRecord({ ...validInput, status: "CONFIRMED", evidenceReference: "EV-2026-001" });
  assert.equal(confirmed.ok, true);
});

test("long inputs are truncated to safe lengths, never stored raw", () => {
  const parsed = validateCompanyRecord({ ...validInput, companyName: "A".repeat(500), notes: "n".repeat(5000) });
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.value.companyName.length, 160);
    assert.equal(parsed.value.notes?.length, 2000);
  }
});

test("non-string field types are rejected", () => {
  const parsed = validateCompanyRecord({ ...validInput, companyName: 42 });
  assert.equal(parsed.ok, false);
});

test("every advertised status round-trips through validation", () => {
  for (const status of COMPANY_STATUSES) {
    const parsed = validateCompanyRecord({ ...validInput, status, evidenceReference: status === "CONFIRMED" ? "EV-1" : null });
    assert.equal(parsed.ok, true, `status ${status} should validate`);
  }
});

test("record ids must be UUID-shaped", () => {
  assert.equal(isValidId("d5f5a8b1-2c3d-4e5f-9a0b-c1d2e3f4a5b6"), true);
  assert.equal(isValidId("not-a-uuid"), false);
  assert.equal(isValidId(""), false);
});
