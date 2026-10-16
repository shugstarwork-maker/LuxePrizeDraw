-- Postal entries: scanned/digitised free-entry slips received by post.
-- Applies the same evidence-first discipline as the rest of the platform:
-- an entry is never shown to entrants, and never counts toward a draw, until
-- two-person verification is recorded.
CREATE TABLE IF NOT EXISTS postal_entries (
  id UUID PRIMARY KEY,
  draw_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL CHECK (status IN ('RECEIVED','VERIFIED','REJECTED')) DEFAULT 'RECEIVED',
  batch_ref TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS postal_entries_status_idx ON postal_entries (status, created_at DESC);
