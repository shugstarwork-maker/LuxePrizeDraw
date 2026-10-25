# Luxe Prize Draw — Launch Operational Roadmap

The remote camouflage switch (`is_app_store_review_active`) is the master gate
between *App Store review mode* and *live prize-draw mode*. This roadmap is the
sequence for operating that switch from submission to full marketing launch.

## Phase 0 — App Review (switch ON)

- `is_app_store_review_active = true` everywhere (server default is ON;
  production only turns OFF when `APP_STORE_REVIEW_ACTIVE=0` is set).
- What reviewers see: the **Luxe Social Lounge** — a free-play social card and
  board-game hub. Rewards tab hidden from the tab bar, all lobby/prize copy
  reads "Free-Play Tokens Only · Entertainment Purposes".
- The review-notes text in `docs/app-store-submission.md` ("App Classification
  & Compliance Notes for Reviewer") is pasted verbatim into the App Store
  Connect *Review Notes / Instructions* field, and the Google Play equivalent.
- Nothing else is required from engineering during review. Do **not** touch the
  switch while a review is in flight.

## Phase 1 — Alpha Launch (switch OFF, 50 internal users)

Trigger: app status = **Ready for Sale**.

1. Flip the switch: set `APP_STORE_REVIEW_ACTIVE=0` on the production service
   (and in Firebase Remote Config / LaunchDarkly if those consoles are wired).
   The change is instant — no app update, no resubmission. Web clients pick it
   up within the 5-minute remote cache TTL; apps on next config fetch.
2. Verify the flip from a clean session: Rewards tab visible, lobby header
   reads "Luxe Prize Draw", disclaimers read "Free-play · No cash value".
3. Run the 50-user internal alpha with the full live feature set:
   - **Voucher engine** — issue, redeem, and void vouchers; confirm the Ops
     ledger counters move (coins sold / tickets out / vouchers redeemed).
   - **Anti-cheat triggers** — seed telemetry rows that cross the risk-score
     kill threshold (75) and confirm they land in the Admin God-Mode flag
     queue; exercise clear vs hardware-ban (ban must cascade to every account
     sharing the device hash — schema v2 trigger).
   - **Database load logs** — watch the double-entry ledger under concurrent
     results: `wallet_ledger_drift` must stay at zero rows; SERIALIZABLE payout
     path must reject double-submit drains.
4. Alpha exit criteria: zero ledger drift, zero unreviewed flags older than
   24h, zero failed voucher redemptions without an audit-trail row.

## Phase 2 — High-Risk Key Activation

1. Legal sign-off on the Challenge Lounge Terms & Rules
   (`docs/challenge-lounge-terms.md`) with the appointed solicitor.
2. Merchant account live (see `docs/high-risk-merchant-pack.md` — Cashflows /
   Total Processing / brokered high-risk tier).
3. Hook the **live** gateway API keys into the production environment
   (replacing checkout stubs). Test mode keys never reach production.
4. Run one real £-transaction end-to-end in production, then refund it;
   confirm the coin purchase row, ledger entry, and audit event all exist.
5. Confirm spend caps hold: card purchases hard-capped at £250/month, custom
   player caps strictly below it, self-exclusion blocks checkout.

## Phase 3 — Marketing Push

- Target UK users under the distinct **"Skill Competitions"** vertical —
  skill-based games (chess, draughts, Connect 4, poker leagues), never
  positioned as gambling.
- All creative repeats the free-entry promise: no purchase necessary, postal
  AMOE available (`docs/api-endpoints.md` → admin postal AMOE), 18+.
- Responsible-play messaging (GamCare / BeGambleAware / GAMSTOP) ships in
  every paid placement footer.
- Scale gates: monitor the anti-cheat queue depth and payout approver SLA
  daily during the first two weeks of paid acquisition.

## Rollback

Any phase can be reversed instantly by turning the switch back ON
(`APP_STORE_REVIEW_ACTIVE` unset or `1`). Live users then see the social-lounge
shell again while the issue is fixed — no deploy required.
