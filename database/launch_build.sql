-- Apply to the database selected by LAUNCH_BUILD_DATABASE_URL before enabling admin writes.
BEGIN;
CREATE TABLE IF NOT EXISTS launch_build_draw_controls (
  draw_id TEXT PRIMARY KEY,
  paused BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS launch_build_proof_notes (
  proof_key TEXT PRIMARY KEY CHECK (proof_key IN ('officialRules','prizeFunding','fundSafeguards','paymentControls','counselSignoff')),
  reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS launch_build_audit (
  id BIGSERIAL PRIMARY KEY,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT NOT NULL
);
COMMIT;
