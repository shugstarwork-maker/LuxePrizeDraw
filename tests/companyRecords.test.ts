import assert from "node:assert/strict";
import test from "node:test";
import { authorized, CompanyInputError, parseCompanyInput } from "../api/companies/shared.ts";

const validCompany = {
  legalName: "Example Holdings LLC",
  jurisdiction: "Dubai, UAE",
  companyType: "MAINLAND",
  contactEmail: "admin@example.test",
  websiteUrl: "https://example.test",
};

test("company records normalize valid input", () => {
  assert.deepEqual(parseCompanyInput(validCompany), {
    legalName: "Example Holdings LLC",
    tradeName: null,
    jurisdiction: "Dubai, UAE",
    companyType: "MAINLAND",
    licenseStatus: "PENDING",
    contactEmail: "admin@example.test",
    websiteUrl: "https://example.test/",
    registeredAddress: null,
    notes: null,
  });
});

test("company records reject invalid enum values and URLs", () => {
  assert.throws(() => parseCompanyInput({ ...validCompany, companyType: "BRANCH" }), CompanyInputError);
  assert.throws(() => parseCompanyInput({ ...validCompany, websiteUrl: "ftp://example.test" }), CompanyInputError);
});

test("company record endpoints require the configured bearer token", () => {
  process.env.COMPANY_RECORDS_ADMIN_SECRET = "test-secret";
  assert.equal(authorized(new Request("https://example.test", { headers: { authorization: "Bearer test-secret" } })), true);
  assert.equal(authorized(new Request("https://example.test", { headers: { authorization: "Bearer wrong-secret" } })), false);
  delete process.env.COMPANY_RECORDS_ADMIN_SECRET;
});
