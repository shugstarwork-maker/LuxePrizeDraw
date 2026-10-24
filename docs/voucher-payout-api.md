# Voucher Payout API Integration Spec (Tango Card / Giftbit)

Status: **pre-launch draft** — no live keys, no real orders. Demo ledger in
`src/lib/redemptionEngine.ts` mirrors this spec.

## Goal

When a player redeems Prize Points for a digital voucher, the backend buys the
voucher from a B2B gift-card API and emails the code automatically. No manual
bank transfers, no physical shipping at launch.

## Flow

```
[ User taps Redeem in app ]
        │
        ▼
┌──────────────────────────────┐
│ 1. Gate checks               │  KYC approved (kyc_verifications.status='approved')
│                              │  Prize Points balance sufficient (prize_points ledger)
│                              │  Geo allowed (UK only at launch)
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ 2. AML ceiling               │  value > £500 → status 'pending_review',
│                              │  24h hold, manual anti-cheat log check,
│                              │  then approve/reject (see withdrawals table)
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ 3. Provider order            │  Tango Card: POST /raas/v2/orders
│                              │  Giftbit:    POST /api/v1/gifts
│                              │  Idempotency key = redemption_orders.id
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ 4. Delivery                  │  Provider emails code to verified account
│                              │  email; order → 'fulfilled' via webhook
└──────────────────────────────┘
```

## Provider mapping

| Brand  | Value    | Provider    | Provider SKU (placeholder) |
|--------|----------|-------------|----------------------------|
| Amazon | £10      | Tango Card  | `AMZN-UK-10`               |
| Tesco  | £25      | Giftbit     | `TESCO-UK-25`              |
| Uber   | £25      | Tango Card  | `UBER-UK-25`               |
| Amazon | £50      | Giftbit     | `AMZN-UK-50`               |
| Tesco  | £100     | Tango Card  | `TESCO-UK-100`             |

## Hard rules

1. `prize_points` is a separate ledger. Gold Coins and Sweep Tickets can never
   convert into Prize Points; the redeem API reads only `prize_points`.
2. Every redemption requires an approved KYC row; the voucher email must equal
   the verified account email.
3. Over-£500 orders hold 24h in `pending_review` — no voucher is issued until a
   human approves the player's anti-cheat logs.
4. All provider calls are server-side only; keys live in Railway env vars,
   never in the client bundle.
5. Failed provider calls auto-refund points to the user's ledger (compensating
   transaction), never leave points debited without a voucher.

## Demo parity

`redeemVoucher()` in `src/lib/redemptionEngine.ts` already enforces the balance
check, the £500 AML hold (`pending_review` + `reviewReleaseAt`) and the order
record shape (`PrizeOrder`) that the live `redemption_orders` table will store.
