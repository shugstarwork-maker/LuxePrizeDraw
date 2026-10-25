# High-Risk Merchant Account — Application Pack

**Business action for the founder — not automatable.** Standard processors (basic Stripe/PayPal) freeze funds when metadata contains "prize draw" or card games. Apply manually to high-risk providers that explicitly support the UK prize draw / free competition market.

## Target providers
- **Cashflows** (UK) — high-risk friendly, UK acquiring.
- **Total Processing** (Manchester) — prize competition sector experience.
- **Specialist broker route** — a high-risk broker can place LuxePrizeDraw with the high-risk tier of Stripe/PayPal or a niche acquirer.

## Documents to prepare before applying
1. LuxePrizeDraw Ltd certificate of incorporation + Companies House number.
2. Registered office address proof (the AMOE postal address).
3. Director ID + proof of address for all directors (they will run KYC on you).
4. Business bank account details (a high-street or EMI business account).
5. Legal opinion letter confirming the free-entry / prize-competition model (from the counsel reviewing `docs/challenge-lounge-terms.md`).
6. The app's compliance artefacts, exported from the build:
   - £250/month card cap + player custom limits (Responsible Play Centre).
   - AMOE postal route and daily free claim (no purchase necessary).
   - Self-exclusion, reality checks, GamCare/BeGambleAware/GAMSTOP signposting.
   - Anti-cheat and collusion controls for skill games.
   - Draft T&Cs (`docs/challenge-lounge-terms.md`).
7. Processing forecast: expected monthly volume, average ticket (pack prices £4.99–£49.99), refund/chargeback policy.

## Integration notes for when keys land
- `CheckoutStubDialog` is the single checkout surface — swap the disabled button for the provider's payment element.
- Call `recordCardPurchase(packId)` only from the **payment success webhook**, never from the client.
- `purchaseWithinCap(packId)` must also be re-checked server-side at capture time (client check is UX only).
- Descriptor: use "LUXEPRIZEDRAW-ENTERTAINMENT" style soft descriptors agreed with the acquirer.
