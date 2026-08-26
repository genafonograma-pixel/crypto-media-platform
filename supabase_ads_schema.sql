-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  format TEXT NOT NULL,
  image_url TEXT,
  target_url TEXT,
  cta_text TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ads"
  ON ads FOR SELECT
  USING (true);

CREATE POLICY "Service role full access ads"
  ON ads FOR ALL
  USING (auth.role() = 'service_role');
