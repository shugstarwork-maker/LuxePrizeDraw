-- Company records: durable register of confirmed and prospective partner/company relationships.
-- Apply this migration from an environment with database connectivity.
-- Records publish publicly only after the evidence and publishing checks described in docs/ are recorded.
CREATE TABLE IF NOT EXISTS company_records (
  id UUID PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_number TEXT,
  status TEXT NOT NULL CHECK (status IN ('CONFIRMED','OPPORTUNITY','ARCHIVED')) DEFAULT 'OPPORTUNITY',
  category TEXT NOT NULL DEFAULT 'partnership',
  contact_reference TEXT NOT NULL,
  evidence_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS company_records_status_idx ON company_records (status, company_name);
