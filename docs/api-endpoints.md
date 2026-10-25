# LuxePrizeDraw — Production API Specification (Node.js / Express)

Endpoints connecting the frontend to `db/schema_v2_ledger.sql`. All money and
token mutations run inside explicit transactions; balances are never written
except via `apply_ledger_entry()`. Auth: player JWT on `/api/v1/*`, admin
role + 2FA on `/api/admin/v1/*`.

## Player endpoints

### POST /api/v1/wallet/daily-bonus
Claims the free daily Sweep Tickets (idempotent per UTC day).
```sql
-- tx (READ COMMITTED):
-- 1. SELECT last_daily_bonus_claimed_at FROM user_wallets WHERE user_id=$1 FOR UPDATE
-- 2. if already claimed today → 409 { "error": "already_claimed" }
-- 3. SELECT apply_ledger_entry($1,'SWEEP_TICKETS',2,'DAILY_BONUS')
-- 4. UPDATE user_wallets SET last_daily_bonus_claimed_at=now() WHERE user_id=$1
```
→ `200 { sweepTickets: n }` · `409 already_claimed`

### POST /api/v1/store/purchase
Creates a Gold Coin purchase intent (high-risk gateway). On the provider
webhook (server-to-server only), settles:
```sql
-- webhook tx:
-- 1. INSERT coin purchase row (status 'PENDING' → 'SETTLED' on capture)
-- 2. SELECT apply_ledger_entry($user,'GOLD_COINS', pack.coins, 'STORE_PURCHASE', purchase_id)
-- 3. SELECT apply_ledger_entry($user,'SWEEP_TICKETS', pack.bonusTickets, 'PURCHASE_BONUS_TICKETS', purchase_id)
-- hard gate: monthly card spend + pack price <= LEAST(spend_limits.monthly_cap_pence, 25000)
```
→ `402 cap_exceeded` when over the custom/legal monthly cap.

### POST /api/v1/arena/matchmaking
Joins the skill-match queue (SBMM band ±150 ELO). 30s timeout → auto-refund:
```sql
-- on timeout: SELECT apply_ledger_entry($user,'SWEEP_TICKETS', entry, 'MATCH_ENTRY_REFUND', match_id)
```

### POST /api/v1/arena/matches/:id/result
Server-authoritative result (server validates every move). Winner:
```sql
-- tx: UPDATE arena_matches … ; SELECT apply_ledger_entry($winner,'PRIZE_POINTS',250,'MATCH_WIN_PRIZE', match_id)
-- telemetry row → anti_cheat_telemetry_logs; score >= 75 sets users.risk_tier (cascades via trigger)
```

### POST /api/v1/redemptions
Redeem Prize Points for a voucher. Body: `{ rewardType, points }`.
```sql
-- BEGIN ISOLATION LEVEL SERIALIZABLE;
-- SELECT redeem_prize_points($user, points, gbp, rewardType)   -- 409 on insufficient
-- COMMIT;
```
→ `201 { redemptionId, payoutStatus: "PENDING_REVIEW" }` — over £500 the row
lands in `idx_payouts_review_queue` for the manual approver.

### POST /api/v1/compliance/self-exclusion
`{ period: "24h"|"7d"|"30d"|"180d"|"permanent" }` → writes enforcement action;
all wallet/queue endpoints return `423 excluded` until expiry.

## Admin endpoints (role + 2FA)

### GET /api/admin/v1/flags?status=open
Anti-cheat queue: joins `anti_cheat_telemetry_logs` (score ≥ 75 first) with `users.risk_tier`.

### POST /api/admin/v1/flags/:id/clear · POST /api/admin/v1/flags/:id/hardware-ban
```sql
-- ban tx:
-- 1. UPDATE users SET risk_tier='HARDWARE_BANNED' WHERE id=$user
--    → trg_users_hardware_ban_cascade bans every account on the same device_hardware_hash
-- 2. UPDATE users … same billing payout hash (payout module)
-- 3. INSERT admin_audit_log
```

### GET /api/admin/v1/payouts?status=PENDING_REVIEW
The manual approver queue — KYC status, name-match, match-log and open-flag context per row.

### POST /api/admin/v1/payouts/:id/approve
```sql
-- tx: UPDATE prize_redemptions SET payout_status='PROCESSING', admin_reviewer_id=$admin, processed_at=now()
-- → call Tango Card/Giftbit → store api_provider_reference → payout_status='DISPATCHED'
-- on failure: 'FAILED' + SELECT apply_ledger_entry($user,'PRIZE_POINTS', points, 'REDEMPTION_REFUND', id)
```

### POST /api/admin/v1/amoe/postal-credit
`{ userId, letterRef }` → one per account per ISO week:
```sql
-- SELECT apply_ledger_entry($user,'SWEEP_TICKETS',5,'POSTAL_AMOE') + postal_amoe_grants row (unique week index)
```

### GET /api/admin/v1/ledger/drift
`SELECT * FROM wallet_ledger_drift` — must always return zero rows; non-empty = value leak alarm.

## Invariants enforced in code (not convention)
1. `redeem_prize_points()` runs SERIALIZABLE + `FOR UPDATE` — double-click drains are impossible.
2. `trg_users_hardware_ban_cascade` bans all accounts on the banned device hash in the same statement.
3. `apply_ledger_entry()` rejects any paid Sweep Ticket grant and any store purchase crediting non-Gold currency.
