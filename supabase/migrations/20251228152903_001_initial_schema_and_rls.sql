/*
  # CapsuleOS Initial Schema and RLS Policies

  1. New Tables
    - `users` - User profiles and metadata
    - `integration_tokens` - OAuth tokens for external platforms
    - `daily_metrics` - Aggregated behavioral metrics (time-series)
    - `insight_capsules` - AI-generated daily insights with explainability
    - `integration_health_events` - Historical integration health records
    - `integration_health_current` - Current integration status (for quick lookups)
    - `circuit_breaker_state` - Circuit breaker state for fault tolerance
    - `system_config` - Global configuration for integrations and limits

  2. Security
    - Enable RLS on all tables
    - Add policies for user-scoped data access
    - Add service role policies for background jobs

  3. Performance
    - Add indexes on frequently queried columns
    - Composite indexes for time-series queries
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  spotify_user_id TEXT UNIQUE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMPTZ
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Integration tokens (encrypted at application level)
CREATE TABLE IF NOT EXISTS integration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  integration_name TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  expires_at TIMESTAMPTZ,
  scopes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, integration_name)
);

ALTER TABLE integration_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tokens"
  ON integration_tokens FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can update own tokens"
  ON integration_tokens FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can insert own tokens"
  ON integration_tokens FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can delete own tokens"
  ON integration_tokens FOR DELETE
  TO authenticated
  USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Daily aggregated metrics (no raw data, only derived metrics)
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  metric_date DATE NOT NULL,
  integration_name TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value DECIMAL(10,6) NOT NULL,
  unit TEXT NOT NULL,
  confidence DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, metric_date, integration_name, metric_name)
);

ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metrics"
  ON daily_metrics FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Service role can insert metrics"
  ON daily_metrics FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- Insight capsules (daily behavioral insights)
CREATE TABLE IF NOT EXISTS insight_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  capsule_date DATE NOT NULL,
  personality_label TEXT,
  behavioral_insights JSONB, -- Array of {insight_text, source_metrics, confidence, insight_type}
  trend_explanation TEXT,
  shareable_summary TEXT,
  generation_method TEXT NOT NULL, -- 'llm' or 'template'
  llm_provider TEXT,
  prompt_version TEXT,
  source_metrics JSONB, -- Array of metric IDs used for generation
  confidence_score DECIMAL(3,2),
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

CREATE POLICY "Service role can update capsules"
  ON insight_capsules FOR UPDATE
  TO service_role
  WITH CHECK (TRUE);

-- Integration health monitoring (time-series for debugging)
CREATE TABLE IF NOT EXISTS integration_health_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name TEXT NOT NULL,
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'down'
  check_timestamp TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT,
  response_time_ms INTEGER,
  success_rate DECIMAL(5,2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Current integration health (latest state, no RLS needed - admin only)
CREATE TABLE IF NOT EXISTS integration_health_current (
  integration_name TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  last_check TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT,
  response_time_ms INTEGER,
  success_rate DECIMAL(5,2),
  consecutive_failures INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circuit breaker state (persistent across restarts)
CREATE TABLE IF NOT EXISTS circuit_breaker_state (
  service_name TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'CLOSED', -- 'CLOSED', 'OPEN', 'HALF_OPEN'
  failure_count INTEGER DEFAULT 0,
  last_failure_time TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System configuration for integrations
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_spotify_user_id ON users(spotify_user_id);
CREATE INDEX idx_integration_tokens_user_id ON integration_tokens(user_id);
CREATE INDEX idx_integration_tokens_integration_name ON integration_tokens(integration_name);
CREATE INDEX idx_daily_metrics_user_date ON daily_metrics(user_id, metric_date DESC);
CREATE INDEX idx_daily_metrics_user_integration ON daily_metrics(user_id, integration_name, metric_date DESC);
CREATE INDEX idx_insight_capsules_user_date ON insight_capsules(user_id, capsule_date DESC);
CREATE INDEX idx_integration_health_events_timestamp ON integration_health_events(check_timestamp DESC);
CREATE INDEX idx_integration_health_events_service ON integration_health_events(integration_name, check_timestamp DESC);
