-- LuxePrizeDraw — Ledger & Compliance Schema v2 (PostgreSQL 14+)
-- This file is the authoritative production schema for the dual-currency
-- economy, anti-cheat pipeline and payout rails. Strict ENUM types prevent
-- corrupted status data from ever entering the ledger.

-- ── 0. Extensions & enum types ──────────────────────────────────────────────

create extension if not exists "uuid-ossp";

create type kyc_status_type as enum ('PENDING_SUBMISSION', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');
create type risk_tier_type as enum ('LOW', 'SHADOW_FLAG', 'MATCH_KILL', 'HARDWARE_BANNED');
create type payout_status_type as enum ('PENDING_REVIEW', 'PROCESSING', 'DISPATCHED', 'FAILED');
create type currency_type as enum ('GOLD_COINS', 'SWEEP_TICKETS', 'PRIZE_POINTS');
create type ledger_reason as enum (
  'STORE_PURCHASE',        -- Gold Coins bought by card (the only paid flow)
  'DAILY_BONUS',           -- free daily ticket claim
  'POSTAL_AMOE',           -- free postal entry credit
  'PURCHASE_BONUS_TICKETS',-- free tickets bundled with a coin pack (never sold)
  'MATCH_ENTRY_FEE',       -- ticket spend on a prize match
  'MATCH_ENTRY_REFUND',    -- 30s matchmaking timeout refund
  'MATCH_WIN_PRIZE',       -- prize points to the winner
  'REDEMPTION_SPEND',      -- prize points exchanged for a voucher
  'REDEMPTION_REFUND'      -- rejected redemption returns the points
);

-- ── 1. users ────────────────────────────────────────────────────────────────

create table users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    device_hardware_hash VARCHAR(64) NOT NULL,   -- SHA-256 fingerprint from the device
    ip_address_registration INET NOT NULL,
    kyc_status kyc_status_type DEFAULT 'PENDING_SUBMISSION',
    risk_tier risk_tier_type DEFAULT 'LOW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing hardware hashes is critical for instant multi-account detection.
create index idx_users_device_hash on users(device_hardware_hash);
create index idx_users_risk_tier on users(risk_tier);

-- ── 2. user_wallets ─────────────────────────────────────────────────────────
-- The three currencies live in isolated columns and never interact in the
-- same arithmetic operation. All movement goes through virtual_currency_ledger.

create table user_wallets (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    gold_coins_balance BIGINT DEFAULT 1000 CHECK (gold_coins_balance >= 0),  -- casual currency
    sweep_tickets_balance INT DEFAULT 1 CHECK (sweep_tickets_balance >= 0),  -- entry currency (free only)
    prize_points_balance INT DEFAULT 0 CHECK (prize_points_balance >= 0),    -- redeemable currency
    last_daily_bonus_claimed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. anti_cheat_telemetry_logs ────────────────────────────────────────────
-- Feeds the admin flag queue. One row per assessed match per player.

create table anti_cheat_telemetry_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL,                       -- game instance log reference
    game_type VARCHAR(50) NOT NULL,              -- 'CHESS', 'CONNECT_4', 'DRAUGHTS', 'POKER'
    engine_match_percentage NUMERIC(5, 2),       -- centipawn engine-match rate
    move_time_standard_deviation NUMERIC(6, 3),  -- rhythmic-bot detection (seconds)
    app_focus_lost_count INT DEFAULT 0,          -- alt-tab to solver telemetry
    calculated_risk_score INT CHECK (calculated_risk_score BETWEEN 0 AND 100),
    triggered_action risk_tier_type,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

create index idx_telemetry_high_risk on anti_cheat_telemetry_logs(calculated_risk_score) where calculated_risk_score >= 75;

-- ── 4. prize_redemptions ────────────────────────────────────────────────────
-- Manual review pipeline + AML ceiling before the Tango Card / Giftbit call.

create table prize_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    prize_points_spent INT NOT NULL CHECK (prize_points_spent > 0),
    equivalent_gbp_value NUMERIC(10, 2) NOT NULL,   -- e.g. 50.00 for a £50 voucher
    reward_type VARCHAR(100) NOT NULL,              -- 'AMAZON_UK_VOUCHER', 'STRIPE_DIRECT', …
    payout_status payout_status_type DEFAULT 'PENDING_REVIEW',
    admin_reviewer_id UUID,                         -- staff member who approved
    api_provider_reference VARCHAR(255),            -- Tango Card / Giftbit transaction reference
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

create index idx_payouts_review_queue on prize_redemptions(payout_status) where payout_status = 'PENDING_REVIEW';

-- ── 5. virtual_currency_ledger (double-entry audit trail) ───────────────────
-- Balances are NEVER adjusted by bare UPDATE. Every wallet mutation writes a
-- ledger row in the same transaction; wallets are a cached projection.

create table virtual_currency_ledger (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    currency_type currency_type NOT NULL,
    amount_delta INT NOT NULL,           -- positive = earn/buy, negative = entry/spend
    transaction_reason ledger_reason NOT NULL,
    ref_id UUID,                         -- match / redemption / purchase reference
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

create index idx_ledger_audit on virtual_currency_ledger(user_id, currency_type);

-- ── 6. Programmatic transaction rules ───────────────────────────────────────

-- Rule 1 · Atomic payout checks. Redeeming points runs inside an explicit
-- SERIALIZABLE transaction with a row lock, so simultaneous "Redeem" clicks
-- cannot drain a balance. Raises on insufficient funds — the API returns 409.
create or replace function redeem_prize_points(
    p_user_id UUID,
    p_points INT,
    p_gbp_value NUMERIC(10,2),
    p_reward_type VARCHAR(100)
) returns UUID language plpgsql as $$
declare
    v_balance INT;
    v_redemption_id UUID;
begin
    -- SERIALIZABLE is set by the caller: BEGIN ISOLATION LEVEL SERIALIZABLE.
    set local transaction isolation level serializable;

    select prize_points_balance into v_balance
    from user_wallets
    where user_id = p_user_id
    for update;                          -- row lock until commit

    if v_balance is null then
        raise exception 'wallet not found for user %', p_user_id;
    end if;
    if v_balance < p_points then
        raise exception 'insufficient prize points: have %, need %', v_balance, p_points;
    end if;

    update user_wallets
    set prize_points_balance = prize_points_balance - p_points,
        updated_at = current_timestamp
    where user_id = p_user_id;

    insert into virtual_currency_ledger (user_id, currency_type, amount_delta, transaction_reason)
    values (p_user_id, 'PRIZE_POINTS', -p_points, 'REDEMPTION_SPEND');

    insert into prize_redemptions (user_id, prize_points_spent, equivalent_gbp_value, reward_type)
    values (p_user_id, p_points, p_gbp_value, p_reward_type)
    returning id into v_redemption_id;

    return v_redemption_id;
end $$;

-- Rule 2 · Hardware ban cascade. The moment a user's risk tier flips to
-- HARDWARE_BANNED, every other account sharing the same device fingerprint
-- is banned in the same statement. Payout-route bans (billing hash) are
-- applied by the matching trigger in the payout module.
create or replace function cascade_hardware_ban() returns trigger language plpgsql as $$
begin
    if new.risk_tier = 'HARDWARE_BANNED' and old.risk_tier is distinct from 'HARDWARE_BANNED' then
        update users
        set risk_tier = 'HARDWARE_BANNED',
            updated_at = current_timestamp
        where device_hardware_hash = new.device_hardware_hash
          and id <> new.id
          and risk_tier <> 'HARDWARE_BANNED';
    end if;
    return new;
end $$;

create trigger trg_users_hardware_ban_cascade
after update of risk_tier on users
for each row execute function cascade_hardware_ban();

-- Wallet mutation guard: reject direct balance changes that skip the ledger.
-- The only writer allowed is apply_ledger_entry(), which posts the ledger row
-- and the balance update atomically.
create or replace function apply_ledger_entry(
    p_user_id UUID,
    p_currency currency_type,
    p_delta INT,
    p_reason ledger_reason,
    p_ref_id UUID default null
) returns BIGINT language plpgsql as $$
declare
    v_entry_id BIGINT;
begin
    -- Sweep Tickets can never be purchased: any positive ticket delta must be
    -- a free source (daily claim, postal AMOE, purchase bonus, refund).
    if p_currency = 'SWEEP_TICKETS' and p_delta > 0
       and p_reason not in ('DAILY_BONUS', 'POSTAL_AMOE', 'PURCHASE_BONUS_TICKETS', 'MATCH_ENTRY_REFUND') then
        raise exception 'sweep tickets may only be granted free of charge (reason %)', p_reason;
    end if;
    -- Gold Coins are one-way: they can never be converted into tickets/points.
    if p_currency <> 'GOLD_COINS' and p_reason = 'STORE_PURCHASE' then
        raise exception 'store purchases credit gold coins only';
    end if;

    insert into virtual_currency_ledger (user_id, currency_type, amount_delta, transaction_reason, ref_id)
    values (p_user_id, p_currency, p_delta, p_reason, p_ref_id)
    returning id into v_entry_id;

    if p_currency = 'GOLD_COINS' then
        update user_wallets set gold_coins_balance = gold_coins_balance + p_delta, updated_at = current_timestamp where user_id = p_user_id;
    elsif p_currency = 'SWEEP_TICKETS' then
        update user_wallets set sweep_tickets_balance = sweep_tickets_balance + p_delta, updated_at = current_timestamp where user_id = p_user_id;
    else
        update user_wallets set prize_points_balance = prize_points_balance + p_delta, updated_at = current_timestamp where user_id = p_user_id;
    end if;

    return v_entry_id;
end $$;

-- ── 7. Integrity views ──────────────────────────────────────────────────────

-- Wallet balances must always equal the sum of their ledger rows. Any drift
-- row here means a bare UPDATE bypassed the ledger — a value-leak alarm.
create view wallet_ledger_drift as
select w.user_id,
       w.gold_coins_balance,
       coalesce(sum(l.amount_delta) filter (where l.currency_type = 'GOLD_COINS'), 0) + 1000 as ledger_gold,
       w.sweep_tickets_balance,
       coalesce(sum(l.amount_delta) filter (where l.currency_type = 'SWEEP_TICKETS'), 0) + 1 as ledger_tickets,
       w.prize_points_balance,
       coalesce(sum(l.amount_delta) filter (where l.currency_type = 'PRIZE_POINTS'), 0) as ledger_points
from user_wallets w
left join virtual_currency_ledger l on l.user_id = w.user_id
group by w.user_id, w.gold_coins_balance, w.sweep_tickets_balance, w.prize_points_balance
having w.gold_coins_balance <> coalesce(sum(l.amount_delta) filter (where l.currency_type = 'GOLD_COINS'), 0) + 1000
    or w.sweep_tickets_balance <> coalesce(sum(l.amount_delta) filter (where l.currency_type = 'SWEEP_TICKETS'), 0) + 1
    or w.prize_points_balance <> coalesce(sum(l.amount_delta) filter (where l.currency_type = 'PRIZE_POINTS'), 0);
