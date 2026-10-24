-- LuxePrizeDraw — Verification, Fraud Prevention & Payout Compliance schema
-- ---------------------------------------------------------------------------
-- Maps the three compliance modules to relational tables:
--   Module A: One Person, One Account   -> device_fingerprints, phone_verifications, payout_methods (duplicate locks)
--   Module B: UK Age & Identity (KYC)   -> kyc_verifications (Yoti / Veriff / Onfido sessions)
--   Module C: Collusion analytics       -> collusion_signals, enforcement_actions
--   Payout rails                        -> payout_methods, withdrawals (+ £20 min / £500 daily cap)
--   Prize redemption                    -> redemption_items, redemption_orders (gated on KYC)
--
-- Target engine: PostgreSQL 14+. Money is stored in pence (integer) to avoid
-- float rounding. All timestamps are timestamptz in UTC.

create extension if not exists pgcrypto;  -- gen_random_uuid()
create extension if not exists citext;    -- case-insensitive email

-- ── Core profile ────────────────────────────────────────────────────────────

create table users (
  id              uuid primary key default gen_random_uuid(),
  display_name    text        not null check (char_length(display_name) between 2 and 40),
  email           citext      not null unique,
  date_of_birth   date        not null,               -- re-checked at KYC; never trusted alone
  country_code    char(2)     not null default 'GB',
  status          text        not null default 'active'
                  check (status in ('active','suspended','closed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Module A: device fingerprints ───────────────────────────────────────────
-- One row per (user, device). The same fingerprint_hash appearing under a
-- second user is a duplicate-account signal (see collusion_signals).

create table device_fingerprints (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references users(id) on delete cascade,
  fingerprint_hash   text not null,                   -- sha256 of FingerprintJS visitor id / hardware hash
  platform           text not null default 'web'
                     check (platform in ('web','ios','android')),
  attestation_token  text,                            -- DeviceCheck / App Attest / Play Integrity payload
  trusted            boolean not null default false,
  first_seen_at      timestamptz not null default now(),
  last_seen_at       timestamptz not null default now(),
  unique (user_id, fingerprint_hash)
);
-- Cross-account duplicate lookup: "has this device been seen on another account?"
create index device_fingerprints_hash_idx on device_fingerprints (fingerprint_hash);

-- ── Module A: SMS OTP phone verification (Twilio / Firebase) ────────────────
-- One phone number can only ever verify one account.

create table phone_verifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  phone_e164    text not null unique,                 -- +44… normalised; unique = one-phone-one-account lock
  provider      text not null check (provider in ('twilio','firebase')),
  otp_channel   text not null default 'sms' check (otp_channel in ('sms','voice')),
  status        text not null default 'pending'
                check (status in ('pending','verified','failed','expired')),
  attempts      smallint not null default 0,
  verified_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- ── Module B: UK age & identity verification (Yoti / Veriff / Onfido) ───────
-- Stores the provider decision, never the document images themselves.

create table kyc_verifications (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references users(id) on delete cascade,
  provider            text not null check (provider in ('yoti','veriff','onfido')),
  provider_session_id text not null unique,           -- idempotency on provider webhooks
  document_type       text check (document_type in ('passport','driving_licence','national_id')),
  status              text not null default 'pending'
                      check (status in ('pending','approved','rejected','expired')),
  age_verified        boolean not null default false, -- true only when provider confirms 18+
  name_on_document    text,                           -- must match payout holder name (payout_methods.name_match)
  rejection_reason    text,
  submitted_at        timestamptz not null default now(),
  decided_at          timestamptz
);
-- At most one APPROVED KYC per user.
create unique index kyc_one_approved_per_user
  on kyc_verifications (user_id) where status = 'approved';
create index kyc_user_idx on kyc_verifications (user_id, status);

-- ── Payout methods — duplicate PayPal / bank lock ───────────────────────────
-- account_hash is sha256 of the normalised identifier (lowercased PayPal email,
-- or sort-code+account-number). The unique index is the duplicate-payout lock:
-- a second account attaching the same PayPal/bank fails at insert time.

create table payout_methods (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  kind          text not null check (kind in ('paypal','bank_account')),
  account_hash  text not null unique,                 -- duplicate payout lock (Module A)
  holder_name   text not null,
  name_match    boolean not null default false,       -- holder_name == kyc_verifications.name_on_document
  status        text not null default 'pending'
                check (status in ('pending','verified','rejected','removed')),
  added_at      timestamptz not null default now()
);

-- ── Withdrawals — thresholds: £20 minimum, £500 daily maximum ───────────────

create table withdrawals (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete restrict,
  payout_method_id uuid not null references payout_methods(id),
  amount_pence     integer not null check (amount_pence >= 2000),  -- £20.00 minimum
  currency         char(3) not null default 'GBP',
  status           text not null default 'requested'
                   check (status in ('requested','approved','paid','rejected','cancelled')),
  -- Gating enforced by the app layer AND this generated snapshot:
  kyc_approved_at  timestamptz,                       -- copied from kyc_verifications at request time
  requested_at     timestamptz not null default now(),
  processed_at     timestamptz,
  constraint withdrawals_requires_kyc check (kyc_approved_at is not null)
);
create index withdrawals_user_day_idx
  on withdrawals (user_id, date_trunc('day', requested_at));

-- Daily total per user — the £500/day cap reads from this view.
create view v_daily_withdrawal_totals as
select user_id,
       date_trunc('day', requested_at) as day,
       sum(amount_pence)               as total_pence
from withdrawals
where status in ('requested','approved','paid')
group by user_id, date_trunc('day', requested_at);
-- App rule: insert is refused when existing total + new amount > 50000 (£500.00).

-- ── Module C: collusion & multi-account signals ─────────────────────────────

create table collusion_signals (
  id          uuid primary key default gen_random_uuid(),
  signal_type text not null check (signal_type in
              ('shared_device','shared_ip','shared_wifi','shared_payout','shared_phone')),
  user_id_a   uuid not null references users(id) on delete cascade,
  user_id_b   uuid not null references users(id) on delete cascade,
  detail      jsonb not null default '{}',            -- e.g. {"ip":"203.0.113.7","seen_at":"…"}
  detected_at timestamptz not null default now(),
  resolved    boolean not null default false,
  check (user_id_a <> user_id_b)
);
create index collusion_signals_users_idx on collusion_signals (user_id_a, user_id_b);
-- Table-level rule (Module C): two accounts flagged on the same table session
-- are blocked from sitting together until the signal is resolved.

create table enforcement_actions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  reason     text not null,                           -- e.g. 'duplicate_payout_method', 'kyc_name_mismatch'
  action     text not null check (action in ('watch','payout_lock','suspend','ban')),
  created_by text not null default 'system',          -- 'system' or an admin id
  created_at timestamptz not null default now()
);

-- ── Anti-cheat engine (board games: chess, draughts, Connect Four) ─────────
-- Perfect-information games are vulnerable to solver assistance, so every
-- move in a prize match streams telemetry into these tables and the risk
-- engine scores the match (shadow flag ≥60, match kill ≥75).

create table arena_matches (
  id           uuid primary key default gen_random_uuid(),
  game         text not null check (game in ('chess','draughts','connect4')),
  format       text not null check (format in ('casual','prize')),
  user_id_a    uuid not null references users(id) on delete cascade,
  user_id_b    uuid not null references users(id) on delete cascade,
  entry_tickets integer not null default 0,           -- prize matches only; never Gold Coins
  status       text not null default 'active'
               check (status in ('active','completed','killed','forfeit')),
  winner_id    uuid references users(id),
  started_at   timestamptz not null default now(),
  ended_at     timestamptz
);

create table move_telemetry (
  id                uuid primary key default gen_random_uuid(),
  match_id          uuid not null references arena_matches(id) on delete cascade,
  user_id           uuid not null references users(id) on delete cascade,
  move_number       smallint not null,
  think_ms          integer not null,                 -- Module B: timing rhythm (σ < 400ms = robotic)
  engine_match      boolean not null default false,   -- Module A: matched engine #1 choice
  centipawn_loss    smallint,                         -- Module A: engine evaluation delta
  focus_lost_before boolean not null default false,   -- Module C: alt-tab before the move
  client_ping_ms    smallint,                         -- latency audit (eu-west-2 target)
  recorded_at       timestamptz not null default now(),
  unique (match_id, user_id, move_number)
);
create index move_telemetry_match_idx on move_telemetry (match_id);

-- One risk report per player per match; drives the 3-strike pipeline.
create table integrity_flags (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid not null references arena_matches(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  risk_score  smallint not null check (risk_score between 0 and 100),
  tier        text not null check (tier in ('clean','shadow_flag','match_kill','hardware_ban')),
  module_quality smallint not null default 0,
  module_timing  smallint not null default 0,
  module_focus   smallint not null default 0,
  reasons     jsonb not null default '[]',
  reviewed_by uuid,                                   -- human review required before hardware_ban
  created_at  timestamptz not null default now()
);
create index integrity_flags_user_idx on integrity_flags (user_id, tier);

-- Hardware bans blacklist device + payout identity so banned players cannot
-- simply register a fresh account.
create table hardware_bans (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  fingerprint_hash text not null,                     -- device_fingerprints.fingerprint_hash
  payout_hash     text,                               -- payout_methods.account_hash
  ip_range        cidr,
  flag_id         uuid not null references integrity_flags(id),
  created_at      timestamptz not null default now()
);
create index hardware_bans_fingerprint_idx on hardware_bans (fingerprint_hash);

-- ── Prize redemption (front-end preview gates on these) ─────────────────────
-- Chips NEVER convert to cash or prizes. Redemption spends verified winnings
-- credit only, and every order requires an approved KYC row.

create table redemption_items (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text not null check (category in ('cash_credit','gift_card','tech','experience','merch')),
  cost_pence   integer not null check (cost_pence > 0),  -- price in winnings-credit pence
  stock        integer,                                  -- null = unlimited
  active       boolean not null default true
);

create table redemption_orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete restrict,
  item_id          uuid not null references redemption_items(id),
  status           text not null default 'pending'
                   check (status in ('pending','approved','fulfilled','rejected','cancelled')),
  kyc_approved_at  timestamptz,                          -- same gate as withdrawals
  created_at       timestamptz not null default now(),
  fulfilled_at     timestamptz,
  constraint redemption_requires_kyc check (kyc_approved_at is not null)
);

-- ── Relationship map ────────────────────────────────────────────────────────
-- users 1───* device_fingerprints      (Module A: hardware identity)
-- users 1───1 phone_verifications      (Module A: SMS OTP, unique phone_e164)
-- users 1───* kyc_verifications        (Module B: ≤1 approved per user)
-- users 1───* payout_methods           (duplicate lock via unique account_hash)
-- users 1───* withdrawals *───1 payout_methods
-- kyc_verifications.name_on_document ── payout_methods.holder_name  (name_match)
-- users *───* users via collusion_signals (Module C)
-- users 1───* enforcement_actions
-- users 1───* redemption_orders *───1 redemption_items
