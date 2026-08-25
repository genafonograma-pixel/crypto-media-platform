-- ============================================================
-- Supabase Schema for Crypto Media Platform
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Articles table: stores all AI-processed news articles
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT,
  link TEXT,
  description TEXT,
  pub_date TIMESTAMPTZ,
  image_url TEXT,
  source_id TEXT,
  category JSONB DEFAULT '["News"]',
  headline TEXT,
  seo_title TEXT,
  ai_meta_description TEXT,
  rewritten_content TEXT,
  ai_summary JSONB,
  classification TEXT,
  quality_score INTEGER,
  related_sources JSONB,
  research_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast feed queries (published articles sorted by date)
CREATE INDEX IF NOT EXISTS idx_articles_quality_date
  ON articles (quality_score DESC, pub_date DESC)
  WHERE quality_score >= 70;

-- Quota table: tracks daily AI processing usage
CREATE TABLE IF NOT EXISTS quota (
  date DATE PRIMARY KEY,
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Enable Row Level Security (RLS) — allow public reads
-- ============================================================
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quota ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published articles
CREATE POLICY "Public read articles"
  ON articles FOR SELECT
  USING (true);

-- Allow service role to do everything (server uses service key)
CREATE POLICY "Service role full access articles"
  ON articles FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access quota"
  ON quota FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- Bitcoin Intelligence table: stores the AI-generated page state
-- for the /bitcoin-news page (singleton row, id='singleton')
-- ============================================================

CREATE TABLE IF NOT EXISTS bitcoin_intelligence (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  situation_text TEXT,
  why_moving_text TEXT,
  etf_text TEXT,
  regulation_text TEXT,
  institutional_text TEXT,
  network_text TEXT,
  macro_text TEXT,
  key_levels_text TEXT,
  etf_flows_text TEXT,
  events_today_text TEXT,
  events_week_text TEXT,
  source_metrics JSONB,
  quiet_market BOOLEAN DEFAULT false,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  btc_price_at_update NUMERIC,
  btc_change_at_update NUMERIC
);

ALTER TABLE bitcoin_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read bitcoin_intelligence"
  ON bitcoin_intelligence FOR SELECT
  USING (true);

CREATE POLICY "Service role full access bitcoin_intelligence"
  ON bitcoin_intelligence FOR ALL
  USING (auth.role() = 'service_role');
