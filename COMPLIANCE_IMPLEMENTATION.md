# Compliance-first foundation

## Status
All sensitive capabilities are disabled by default. **LEGAL REVIEW REQUIRED** applies before enabling registrations, entries, payments, prizes, crypto, referrals, or any competition in a jurisdiction.

## Database records
- `jurisdiction_compliance`: country and optional subdivision status, counsel reference, age and feature controls.
- `competitions`: lifecycle, official rules URL/version, entry and prize configuration.
- `compliance_audit_log`: append-only decisions and administrative changes.
- `consent_records`: Terms, privacy, marketing and responsible-play consent versions.
- `fiat_ledger`, `prize_liability_ledger`, `karma_coinz_ledger`: separate accounting boundaries; no cross-ledger conversion.

## Rules engine
`POST /api/compliance/entry-check` resolves the Vercel geo headers and the country/state record, checks legal-review status, age, registration/entry switches, competition availability, and recorded Terms consent. The same check must run in the backend before any future entry is accepted.

## Feature safety
Cash payments, token purchases, token transfers, cash-out, staking/yield, crypto entry, and wagering remain disabled. Karma Coinz is reserved as a non-monetary loyalty configuration only, with separate jurisdiction flags and no operating-revenue treatment.

## Required provider integrations before launch
- Age / identity verification provider
- Geolocation and VPN/proxy-risk provider
- Sanctions and AML screening provider
- Fraud/risk provider
- Privacy export/delete workflow processor
- Jurisdiction-specific counsel-approved official rules and tax handling

## Acceptance tests
1. Unconfigured country returns `NOT_REVIEWED` and rejects registration/entry.
2. Blocked country/state rejects all enabled features.
3. Allowed jurisdiction without a counsel reference is rejected.
4. Under-minimum-age participant is rejected.
5. Disabled registrations or entries reject requests in the backend.
6. Missing required Terms version rejects entry.
7. Geo country differing from supplied profile country creates an audit event and rejects until reviewed.
8. Any enabled cash/crypto feature without its explicit jurisdiction switch is rejected.
9. Fiat, prize-liability, and Karma Coinz records never share a transaction ID or conversion path.
10. Administrative jurisdiction changes append an audit record with the counsel reference.
