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
