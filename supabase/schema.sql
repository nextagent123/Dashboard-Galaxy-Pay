-- Dashboard Galaxy Pay — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

CREATE TABLE IF NOT EXISTS dashboard_data (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dashboard_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON dashboard_data
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated update" ON dashboard_data
  FOR ALL USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON dashboard_data
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();
