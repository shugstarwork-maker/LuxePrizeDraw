-- Apply from an environment with database connectivity before using /api/companies.
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY,
  legal_name TEXT NOT NULL UNIQUE,
  trade_name TEXT,
  jurisdiction TEXT NOT NULL,
  company_type TEXT NOT NULL CHECK (company_type IN ('FREEZONE', 'MAINLAND', 'OFFSHORE', 'OTHER')),
  license_status TEXT NOT NULL CHECK (license_status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'DISSOLVED')) DEFAULT 'PENDING',
  contact_email TEXT NOT NULL,
  website_url TEXT,
  registered_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS companies_jurisdiction_license_status_idx
  ON companies (jurisdiction, license_status);
