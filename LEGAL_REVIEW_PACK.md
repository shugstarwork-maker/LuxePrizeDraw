# Legal review pack: pre-launch prize-draw model

## Current operating status
This is a **pre-launch prototype**. Public entry issuance, payment collection, prize issuance, cash-out, crypto, referrals, and any statement that customer money or prize funds are safeguarded are disabled. The site must not launch these features from this codebase until qualified local counsel approves the operating model for each jurisdiction and the controls below are implemented and evidenced.

## Counsel decisions required before launch
1. **Classification and permissions** — determine the promotion/competition/lottery/gambling classification in every target country and subdivision; document the required licence, registration, promoter entity, regulator notices, and prohibited territories.
2. **Official rules** — approve a versioned rules document per competition covering promoter identity, eligibility, free-entry route where required, opening/closing dates, prize description/value/availability, selection method, winner notification, tax, publicity, complaints, cancellation, and data use.
3. **Eligibility controls** — approve minimum age, restricted territories, identity/age verification, geolocation and VPN/proxy policy, sanctions screening, fraud controls, and exclusion/self-exclusion rules where applicable.
4. **Payment model** — approve the merchant of record, payment-service provider, refund/chargeback policy, AML obligations, transaction limits, and the prohibition on using entry funds for unrelated operating costs.
5. **Prize funding and safeguarding** — determine whether prize funds must be held in a trust, escrow, client-money, insurance, bond, or other regulated arrangement. Obtain a bank/trustee/escrow/insurer attestation for each live competition before public claims are made.
6. **Privacy and marketing** — approve privacy notice, consent wording, retention schedule, data-subject workflow, processor agreements, cookies, and marketing opt-in controls.

## Required launch evidence per competition
- Counsel approval reference and jurisdiction matrix
- Regulator/licence reference when required
- Versioned official rules URL and effective date
- Prize inventory or funding attestation, with an expiry date
- Safeguarding arrangement reference and account/trustee/escrow owner
- Payment-provider agreement and refund/chargeback operational procedure
- Age/identity, geo/VPN, sanctions/AML, and fraud-provider test evidence
- Draw pre-commitment, immutable audit trail, and independent draw-verification procedure
- Incident, complaints, dispute, and winner-verification runbooks

## System controls present
- Jurisdictions and competitions default to disabled until a counsel reference and feature switches are recorded.
- Consent is versioned and entry checks run server-side.
- Free draw codes are one-time and atomically redeemed.
- Fiat, prize-liability, and loyalty ledgers are separate, with no conversion path.
- Draw settlement requires a committed server-seed hash and public entropy sources.
- Public pages display a pre-launch notice; they do not claim funds are ring-fenced.

## Controls required before enabling payment or verified entry
Implement a provider-backed, durable transaction workflow. A payment attempt must create a unique idempotency key, record an immutable pending ledger event, verify the provider webhook signature, and settle entries only after payment and eligibility both succeed. Record refunds, chargebacks, prize liabilities, and safeguarding transfers in separate append-only ledgers. Reconcile each competition daily against provider and safeguarding evidence; block new entries automatically on a mismatch or expired funding attestation.

## Lawyer sign-off fields
| Field | Required before launch |
| --- | --- |
| Jurisdiction and legal classification | Yes |
| Promoter entity and licence/registration basis | Yes |
| Official rules version and URL | Yes |
| Free-entry route and equal-treatment analysis | Where required |
| Payment/refund/chargeback model | Before paid entries |
| Safeguarding mechanism and funding evidence | Before any safeguarding claim or prize sale |
| Tax and winner notification procedure | Yes |
| Privacy, marketing, and retention approval | Yes |
| Operational owner and review date | Yes |

This document is an implementation checklist, not legal advice or evidence that any approval has been granted.
