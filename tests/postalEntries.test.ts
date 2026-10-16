import assert from "node:assert/strict";
import test from "node:test";
import { parseEntrySlip, toCSV, validatePostalEntry, POSTAL_STATUSES } from "../api/postal-entries/shared";

const valid = { fullName: "Fiona MacLeod", address: "12 Royal Mile, Edinburgh, EH1 1AA" };

test("a minimal slip validates as RECEIVED by default", () => {
  const parsed = validatePostalEntry(valid);
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.value.status, "RECEIVED");
    assert.equal(parsed.value.drawName, "Headline draw");
  }
});

test("name and address are required; email and phone are format-checked", () => {
  assert.equal(validatePostalEntry({ fullName: "", address: "x" }).ok, false);
  assert.equal(validatePostalEntry({ fullName: "Fiona", address: "" }).ok, false);
  assert.equal(validatePostalEntry({ ...valid, email: "not-an-email" }).ok, false);
  assert.equal(validatePostalEntry({ ...valid, phone: "abc" }).ok, false);
  assert.equal(validatePostalEntry({ ...valid, email: "fiona@example.com", phone: "+44 7700 900123" }).ok, true);
});

test("slip parser extracts name, address, email, phone and draw line", () => {
  const slip = "Draw: £100K Headline\nFiona MacLeod\n12 Royal Mile\nEdinburgh\nEH1 1AA\nfiona@example.com\n+44 7700 900123\nPosted 16 Oct";
  const p = parseEntrySlip(slip);
  assert.equal(p.drawName, "£100K Headline");
  assert.equal(p.fullName, "Fiona MacLeod");
  assert.match(p.address, /12 Royal Mile.*Edinburgh/);
  assert.equal(p.email, "fiona@example.com");
  assert.equal(p.phone, "+44 7700 900123");
  assert.match(p.notes, /Posted 16 Oct/);
});

test("slip parser defaults the draw and leaves unknown lines as notes", () => {
  const p = parseEntrySlip("Hamish Brown\n1 Loch View\nGlasgow");
  assert.equal(p.drawName, "Headline draw");
  assert.equal(p.fullName, "Hamish Brown");
  assert.equal(p.email, null);
});

test("csv output escapes quotes and commas", () => {
  const parsed = validatePostalEntry({ ...valid, fullName: 'Fiona "Fi" MacLeod', notes: "a, b" });
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    const csv = toCSV([{ ...parsed.value, id: "1", createdAt: "t", updatedAt: "t" } as never]);
    assert.match(csv, /"Fiona ""Fi"" MacLeod"/);
    assert.match(csv, /"a, b"/);
  }
});

test("every advertised status validates", () => {
  for (const status of POSTAL_STATUSES) {
    assert.equal(validatePostalEntry({ ...valid, status }).ok, true, status);
  }
});
