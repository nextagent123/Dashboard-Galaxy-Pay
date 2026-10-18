-- Merchant Onboarding tables for Galaxy Pay
-- Run this in Supabase SQL Editor

-- Main merchant table
CREATE TABLE IF NOT EXISTS merchant_onboarding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  tax_id TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  sales_owner TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'moi_tao' CHECK (status IN (
    'moi_tao', 'da_khai_bao', 'can_bo_sung', 'cho_duyet',
    'da_duyet', 'tu_choi', 'da_sinh_hd', 'da_ky', 'hoat_dong'
  )),
  form_token TEXT UNIQUE,
  declaration_data JSONB,
  documents JSONB,
  risk_review JSONB,
  contract_data JSONB,
  fee_schedule JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Status history table
CREATE TABLE IF NOT EXISTS merchant_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES merchant_onboarding(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  note TEXT DEFAULT '',
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_merchant_status ON merchant_onboarding(status);
CREATE INDEX IF NOT EXISTS idx_merchant_token ON merchant_onboarding(form_token);
CREATE INDEX IF NOT EXISTS idx_merchant_sales ON merchant_onboarding(sales_owner);
CREATE INDEX IF NOT EXISTS idx_history_merchant ON merchant_status_history(merchant_id);

-- RLS Policies (enable RLS)
ALTER TABLE merchant_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_status_history ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon key (dashboard handles auth)
CREATE POLICY "Allow all for anon" ON merchant_onboarding
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon" ON merchant_status_history
  FOR ALL USING (true) WITH CHECK (true);
