/*
  # CapsuleOS: Generic Personal Intelligence Platform Schema

  1. New Tables
    - `intelligence_sources` - Available integrations (Spotify, GitHub, YouTube, etc.)
    - `user_data_sources` - User's connected data sources
    - `behavioral_metrics` - Generic metrics across all sources
    - `insight_capsules` - Daily synthesis of all behavioral data
    - `metric_definitions` - Versioned metric schemas
    - `system_health` - Platform health and integration status

  2. Security
    - Enable RLS on all user-scoped tables
    - Service role policies for background jobs
    - Integration-agnostic design

  3. Key Changes
    - Removed spotify_user_id reference
    - Made schema integration-agnostic
    - Added metric versioning for future analytics improvements
*/

-- Drop old spotify-specific tables if needed (backward compatible)
DROP TABLE IF EXISTS insight_capsules CASCADE;
DROP TABLE IF EXISTS daily_metrics CASCADE;
DROP TABLE IF EXISTS integration_tokens CASCADE;

-- Intelligence Sources Registry
CREATE TABLE IF NOT EXISTS intelligence_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon_type TEXT,
  category TEXT NOT NULL, -- 'music', 'developer', 'content', 'wellness', 'productivity'
  is_enabled BOOLEAN DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Connected Data Sources (replaces integration_tokens)
CREATE TABLE IF NOT EXISTS user_data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  source_id UUID REFERENCES intelligence_sources(id) NOT NULL,
  source_user_id TEXT, -- External platform user ID (spotify user ID, github username, etc.)
  auth_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  expires_at TIMESTAMPTZ,
  scopes TEXT[],
  last_synced TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending', -- 'synced', 'syncing', 'error', 'pending'
  metadata JSONB, -- Source-specific metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, source_id)
);

ALTER TABLE user_data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data sources"
  ON user_data_sources FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can manage own data sources"
  ON user_data_sources FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Metric Definitions (versioned)
CREATE TABLE IF NOT EXISTS metric_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  metric_type TEXT NOT NULL, -- 'ratio', 'count', 'trend', 'score', 'distribution'
  unit TEXT,
  source_id UUID REFERENCES intelligence_sources(id),
  min_value DECIMAL,
  max_value DECIMAL,
  interpretation_guide JSONB, -- Guidance for narrative interpretation
  version TEXT NOT NULL DEFAULT '1.0',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(metric_name, version)
);

-- Behavioral Metrics (source-agnostic time-series)
CREATE TABLE IF NOT EXISTS behavioral_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  metric_date DATE NOT NULL,
  source_id UUID REFERENCES intelligence_sources(id) NOT NULL,
  metric_name TEXT NOT NULL,
  value DECIMAL(10,6) NOT NULL,
  unit TEXT NOT NULL,
  confidence DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  metadata JSONB, -- Metric-specific context
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, metric_date, source_id, metric_name)
);

ALTER TABLE behavioral_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metrics"
  ON behavioral_metrics FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Service role can insert metrics"
  ON behavioral_metrics FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- Insight Capsules (daily synthesis)
CREATE TABLE IF NOT EXISTS insight_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  capsule_date DATE NOT NULL,
  -- Core Insights
  personality_label TEXT,
  behavioral_insights JSONB, -- [{insight_text, source_ids, confidence, insight_type}]
  trend_explanation TEXT,
  shareable_summary TEXT,
  -- Metadata
  generation_method TEXT NOT NULL, -- 'llm' or 'template'
  llm_provider TEXT,
  prompt_version TEXT,
  source_metrics JSONB, -- [metric_ids used]
  confidence_score DECIMAL(3,2),
  -- Multi-source awareness
  active_sources JSONB, -- [{source_id, had_data, contributed_to_insights}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, capsule_date)
);

ALTER TABLE insight_capsules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own capsules"
  ON insight_capsules FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Service role can insert capsules"
  ON insight_capsules FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- System Health & Platform Monitoring
CREATE TABLE IF NOT EXISTS system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name TEXT NOT NULL,
  component_type TEXT NOT NULL, -- 'integration', 'service', 'api'
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'down'
  last_check TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT,
  response_time_ms INTEGER,
  success_rate DECIMAL(5,2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_user_data_sources_user_id ON user_data_sources(user_id);
CREATE INDEX idx_user_data_sources_source_id ON user_data_sources(source_id);
CREATE INDEX idx_behavioral_metrics_user_date ON behavioral_metrics(user_id, metric_date DESC);
CREATE INDEX idx_behavioral_metrics_user_source ON behavioral_metrics(user_id, source_id, metric_date DESC);
CREATE INDEX idx_insight_capsules_user_date ON insight_capsules(user_id, capsule_date DESC);
CREATE INDEX idx_system_health_component ON system_health(component_name, last_check DESC);

-- Insert Common Intelligence Sources
INSERT INTO intelligence_sources (source_name, display_name, description, category, icon_type) 
VALUES
  ('spotify', 'Spotify', 'Music streaming and taste profile', 'music', 'music'),
  ('github', 'GitHub', 'Developer activity and coding patterns', 'developer', 'code'),
  ('youtube', 'YouTube', 'Watch patterns and content interests', 'content', 'video'),
  ('reading', 'Reading Platforms', 'Book and article consumption', 'content', 'book'),
  ('fitness', 'Fitness Tracker', 'Physical activity and wellness', 'wellness', 'activity'),
  ('calendar', 'Calendar', 'Time allocation and focus patterns', 'productivity', 'calendar')
ON CONFLICT (source_name) DO NOTHING;
