/*
  # YouTube Integration Schema

  ## Overview
  This migration adds YouTube integration support to CapsuleOS, including:
  - YouTube subscription tracking
  - Quota usage monitoring
  - Cross-platform insights
  - YouTube-specific metrics storage

  ## New Tables
  
  ### `youtube_subscriptions`
  Tracks user's YouTube channel subscriptions and interaction patterns
  - `user_id` (uuid, foreign key to users)
  - `channel_id` (text, YouTube channel ID)
  - `channel_title` (text, channel name)
  - `subscribed_at` (timestamptz, subscription date)
  - `last_interaction_at` (timestamptz, last engagement date)
  - `interaction_count` (integer, number of interactions)
  - `is_decayed` (boolean, indicates inactive subscription)
  - `created_at` (timestamptz, record creation)
  - `updated_at` (timestamptz, last update)

  ### `youtube_quota_usage`
  Monitors YouTube API quota consumption for rate limiting
  - `user_id` (uuid, foreign key to users)
  - `date` (date, usage date)
  - `quota_used` (integer, units consumed)
  - `operations_performed` (jsonb, operation details)
  - `created_at` (timestamptz, record creation)

  ### `youtube_videos`
  Stores video metadata for analysis
  - `id` (uuid, primary key)
  - `video_id` (text, YouTube video ID)
  - `title` (text, video title)
  - `channel_id` (text, channel ID)
  - `channel_title` (text, channel name)
  - `duration_seconds` (integer, video length)
  - `category` (text, content category)
  - `published_at` (timestamptz, publication date)
  - `metadata` (jsonb, additional data)
  - `created_at` (timestamptz, record creation)

  ### `youtube_interactions`
  Tracks user interactions with YouTube content
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to users)
  - `video_id` (text, YouTube video ID)
  - `interaction_type` (text, liked/playlist_add/etc)
  - `interaction_at` (timestamptz, when interaction occurred)
  - `playlist_id` (text, optional playlist ID)
  - `metadata` (jsonb, additional context)
  - `created_at` (timestamptz, record creation)

  ### `cross_platform_insights`
  Stores correlations between Spotify and YouTube behavior
  - `user_id` (uuid, foreign key to users)
  - `date` (date, insight date)
  - `integrations` (text[], active integrations)
  - `insight_type` (text, type of correlation)
  - `insight_value` (decimal, numeric value)
  - `confidence` (decimal, confidence score 0-1)
  - `metadata` (jsonb, additional details)
  - `created_at` (timestamptz, record creation)

  ## Security
  - Enable RLS on all new tables
  - Users can only access their own data
  - Authenticated users only
  - Separate policies for each operation type

  ## Integration Notes
  - YouTube metrics stored in existing `daily_metrics` table with `integration_name='youtube'`
  - YouTube tokens stored in existing `integration_tokens` table
  - Designed for zero-impact on existing Spotify integration
*/

-- YouTube Subscriptions Table
CREATE TABLE IF NOT EXISTS youtube_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    channel_id text NOT NULL,
    channel_title text NOT NULL,
    subscribed_at timestamptz,
    last_interaction_at timestamptz,
    interaction_count integer DEFAULT 0,
    is_decayed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, channel_id)
);

-- YouTube Quota Usage Tracking
CREATE TABLE IF NOT EXISTS youtube_quota_usage (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    quota_used integer NOT NULL DEFAULT 0,
    operations_performed jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, date)
);

-- YouTube Videos Metadata
CREATE TABLE IF NOT EXISTS youtube_videos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id text UNIQUE NOT NULL,
    title text NOT NULL,
    channel_id text NOT NULL,
    channel_title text NOT NULL,
    duration_seconds integer DEFAULT 0,
    category text,
    published_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- YouTube User Interactions
CREATE TABLE IF NOT EXISTS youtube_interactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    video_id text NOT NULL,
    interaction_type text NOT NULL,
    interaction_at timestamptz DEFAULT now(),
    playlist_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_youtube_interactions_user_date ON youtube_interactions(user_id, interaction_at DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_interactions_video ON youtube_interactions(video_id);

-- Cross-Platform Insights
CREATE TABLE IF NOT EXISTS cross_platform_insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    integrations text[] NOT NULL,
    insight_type text NOT NULL,
    insight_value decimal(10,6) NOT NULL,
    confidence decimal(3,2) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, date, insight_type)
);

-- Enable RLS on all tables
ALTER TABLE youtube_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_quota_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_platform_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for youtube_subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON youtube_subscriptions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
    ON youtube_subscriptions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
    ON youtube_subscriptions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
    ON youtube_subscriptions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS Policies for youtube_quota_usage
CREATE POLICY "Users can view own quota usage"
    ON youtube_quota_usage FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quota usage"
    ON youtube_quota_usage FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quota usage"
    ON youtube_quota_usage FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for youtube_videos (public read for metadata)
CREATE POLICY "Anyone can view video metadata"
    ON youtube_videos FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service can insert video metadata"
    ON youtube_videos FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policies for youtube_interactions
CREATE POLICY "Users can view own interactions"
    ON youtube_interactions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
    ON youtube_interactions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions"
    ON youtube_interactions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions"
    ON youtube_interactions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS Policies for cross_platform_insights
CREATE POLICY "Users can view own cross-platform insights"
    ON cross_platform_insights FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cross-platform insights"
    ON cross_platform_insights FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cross-platform insights"
    ON cross_platform_insights FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cross-platform insights"
    ON cross_platform_insights FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_youtube_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for youtube_subscriptions
DROP TRIGGER IF EXISTS youtube_subscriptions_updated_at ON youtube_subscriptions;
CREATE TRIGGER youtube_subscriptions_updated_at
    BEFORE UPDATE ON youtube_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_youtube_subscriptions_updated_at();