/*
  # Fix YouTube RLS Policies

  ## Overview
  Updates RLS policies for YouTube tables to correctly map auth.uid() to users.id

  ## Changes
  All YouTube table policies now properly check:
  - auth.uid() matches the auth_user_id in the users table
  - Then verify that user's id matches the user_id in the YouTube tables

  ## Tables Updated
  - youtube_subscriptions
  - youtube_quota_usage
  - youtube_interactions
  - cross_platform_insights
*/

-- Drop existing policies for youtube_subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON youtube_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON youtube_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON youtube_subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON youtube_subscriptions;

-- Recreate policies with correct auth checks
CREATE POLICY "Users can view own subscriptions"
    ON youtube_subscriptions FOR SELECT
    TO authenticated
    USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert own subscriptions"
    ON youtube_subscriptions FOR INSERT
    TO authenticated
    WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own subscriptions"
    ON youtube_subscriptions FOR UPDATE
    TO authenticated
    USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()))
    WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete own subscriptions"
    ON youtube_subscriptions FOR DELETE
    TO authenticated
    USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Drop existing policies for youtube_quota_usage
DROP POLICY IF EXISTS "Users can view own quota usage" ON youtube_quota_usage;
DROP POLICY IF EXISTS "Users can insert own quota usage" ON youtube_quota_usage;
DROP POLICY IF EXISTS "Users can update own quota usage" ON youtube_quota_usage;

-- Recreate policies
CREATE POLICY "Users can view own quota usage"
    ON youtube_quota_usage FOR SELECT
    TO authenticated
    USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert own quota usage"
    ON youtube_quota_usage FOR INSERT
    TO authenticated
    WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own quota usage"
    ON youtube_quota_usage FOR UPDATE
    TO authenticated
    USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()))
    WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Drop existing policies for youtube_interactions
DROP POLICY IF EXISTS "Users can view own interactions" ON youtube_interactions;
DROP POLICY IF EXISTS "Users can insert own interactions" ON youtube_interactions;
DROP POLICY IF EXISTS "Users can update own interactions" ON youtube_interactions;
DROP POLICY IF EXISTS "Users can delete own interactions" ON youtube_interactions;

-- Recreate policies
CREATE POLICY "Users can view own interactions"
    ON youtube_interactions FOR SELECT
    TO authenticated
    USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert own interactions"
    ON youtube_interactions FOR INSERT
    TO authenticated
    WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own interactions"
    ON youtube_interactions FOR UPDATE
    TO authenticated
    USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()))
    WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete own interactions"
    ON youtube_interactions FOR DELETE
    TO authenticated
    USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Drop existing policies for cross_platform_insights
DROP POLICY IF EXISTS "Users can view own cross-platform insights" ON cross_platform_insights;
DROP POLICY IF EXISTS "Users can insert own cross-platform insights" ON cross_platform_insights;
DROP POLICY IF EXISTS "Users can update own cross-platform insights" ON cross_platform_insights;
DROP POLICY IF EXISTS "Users can delete own cross-platform insights" ON cross_platform_insights;

-- Recreate policies
CREATE POLICY "Users can view own cross-platform insights"
    ON cross_platform_insights FOR SELECT
    TO authenticated
    USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert own cross-platform insights"
    ON cross_platform_insights FOR INSERT
    TO authenticated
    WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own cross-platform insights"
    ON cross_platform_insights FOR UPDATE
    TO authenticated
    USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()))
    WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete own cross-platform insights"
    ON cross_platform_insights FOR DELETE
    TO authenticated
    USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));