-- Apply this migration from an environment with database connectivity before enabling public entries.
-- It stores technical evidence and controls; legal eligibility remains subject to professional review.
CREATE TABLE IF NOT EXISTS prize_accounts (
  id UUID PRIMARY KEY, email TEXT NOT NULL UNIQUE, date_of_birth DATE NOT NULL,
  age_verified_at TIMESTAMPTZ, status TEXT NOT NULL CHECK (status IN ('ACTIVE','PAUSED','SUSPENDED','CLOSED')) DEFAULT 'ACTIVE',
  spend_limit_minor BIGINT NOT NULL DEFAULT 0 CHECK (spend_limit_minor >= 0), pause_until TIMESTAMPTZ, suspended_until TIMESTAMPTZ,
  closed_at TIMESTAMPTZ, marketing_suppressed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS prize_draws (
  id TEXT PRIMARY KEY, status TEXT NOT NULL CHECK (status IN ('DRAFT','OPEN','CLOSED','DRAWN','FULFILLED','CANCELLED')) DEFAULT 'DRAFT',
  title TEXT NOT NULL, prize_description TEXT NOT NULL, prize_value_minor BIGINT NOT NULL CHECK (prize_value_minor >= 0),
  opens_at TIMESTAMPTZ NOT NULL, closes_at TIMESTAMPTZ NOT NULL CHECK (closes_at > opens_at), maximum_entries INTEGER NOT NULL CHECK (maximum_entries > 0),
  ticket_price_minor BIGINT NOT NULL CHECK (ticket_price_minor >= 0), free_entry_method TEXT NOT NULL, free_entry_deadline TIMESTAMPTZ NOT NULL,
  entry_limit_per_account INTEGER NOT NULL DEFAULT 1 CHECK (entry_limit_per_account > 0), rules_url TEXT NOT NULL, rules_version TEXT NOT NULL,
  draw_type TEXT NOT NULL CHECK (draw_type IN ('STANDARD','INSTANT_WIN')), randomization_version TEXT NOT NULL,
  supplier_id UUID, charity_program_id UUID, opened_at TIMESTAMPTZ, closed_at TIMESTAMPTZ, drawn_at TIMESTAMPTZ, cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS prize_draw_versions (
  id UUID PRIMARY KEY, draw_id TEXT NOT NULL REFERENCES prize_draws(id), version INTEGER NOT NULL, reason TEXT NOT NULL,
  snapshot JSONB NOT NULL, actor_id UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(draw_id, version)
);
CREATE TABLE IF NOT EXISTS prize_payments (
  id UUID PRIMARY KEY, account_id UUID NOT NULL REFERENCES prize_accounts(id), draw_id TEXT NOT NULL REFERENCES prize_draws(id),
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0), currency CHAR(3) NOT NULL, card_type TEXT NOT NULL CHECK (card_type IN ('CREDIT','DEBIT','OTHER')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('PENDING','SUCCEEDED','REFUNDED','CHARGEBACK','FAILED')), provider_event_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS prize_entries (
  id UUID PRIMARY KEY, draw_id TEXT NOT NULL REFERENCES prize_draws(id), account_id UUID NOT NULL REFERENCES prize_accounts(id),
  route TEXT NOT NULL CHECK (route IN ('FREE','PAID')), status TEXT NOT NULL CHECK (status IN ('ELIGIBLE','INVALID','WINNER','CANCELLED')) DEFAULT 'ELIGIBLE',
  payment_id UUID REFERENCES prize_payments(id), source_reference TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(draw_id, account_id, source_reference)
);
CREATE INDEX IF NOT EXISTS prize_entries_eligible_pool_idx ON prize_entries(draw_id, status, id);
CREATE TABLE IF NOT EXISTS prize_draw_results (
  draw_id TEXT PRIMARY KEY REFERENCES prize_draws(id), eligible_entry_count INTEGER NOT NULL CHECK (eligible_entry_count > 0), entry_set_hash TEXT NOT NULL,
  final_seed_hash TEXT NOT NULL, selection_hash TEXT NOT NULL, winning_entry_id UUID NOT NULL REFERENCES prize_entries(id), randomization_version TEXT NOT NULL,
  winner_verified_at TIMESTAMPTZ, fulfilled_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS prize_audit_events (
  id UUID PRIMARY KEY, occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), actor_id UUID, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL, event JSONB NOT NULL, previous_hash TEXT, event_hash TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS prize_complaints (
  id UUID PRIMARY KEY, account_id UUID REFERENCES prize_accounts(id), draw_id TEXT REFERENCES prize_draws(id), email TEXT NOT NULL, category TEXT NOT NULL,
  description TEXT NOT NULL, evidence_url TEXT, status TEXT NOT NULL CHECK (status IN ('OPEN','INVESTIGATING','AWAITING_INFORMATION','RESOLVED','ESCALATED')) DEFAULT 'OPEN',
  assigned_to UUID, resolution TEXT, resolved_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS prize_suppliers (id UUID PRIMARY KEY, company_name TEXT NOT NULL, contact_reference TEXT NOT NULL, contract_status TEXT NOT NULL, fulfilment_status TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS prize_charity_programs (id UUID PRIMARY KEY, charity_name TEXT NOT NULL, registration_reference TEXT, contribution_basis TEXT NOT NULL, contribution_minor BIGINT, payment_frequency TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS prize_marketing_campaigns (id UUID PRIMARY KEY, target_audience TEXT NOT NULL, age_restriction INTEGER NOT NULL CHECK (age_restriction >= 18), creative_reference TEXT NOT NULL, approval_status TEXT NOT NULL CHECK (approval_status IN ('DRAFT','REVIEW','APPROVED','REJECTED')), reviewer_id UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS prize_affiliates (id UUID PRIMARY KEY, name TEXT NOT NULL, compliance_status TEXT NOT NULL CHECK (compliance_status IN ('PENDING','ACTIVE','SUSPENDED','TERMINATED')), contract_accepted_at TIMESTAMPTZ, suspended_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
