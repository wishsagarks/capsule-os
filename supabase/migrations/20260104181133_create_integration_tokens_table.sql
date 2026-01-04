/*
  # Create integration_tokens table

  1. New Tables
    - `integration_tokens`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid) - Reference to users table
      - `integration_name` (text) - Name of the integration (spotify, youtube, etc.)
      - `access_token` (text) - OAuth access token
      - `refresh_token` (text, nullable) - OAuth refresh token
      - `expires_at` (timestamptz, nullable) - Token expiration time
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `integration_tokens` table
    - Add policy for users to read their own tokens
    - Add policy for users to insert their own tokens
    - Add policy for users to update their own tokens
    - Add policy for users to delete their own tokens

  3. Indexes
    - Unique index on (user_id, integration_name) to prevent duplicate connections
*/

CREATE TABLE IF NOT EXISTS integration_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  integration_name text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, integration_name)
);

ALTER TABLE integration_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own integration tokens"
  ON integration_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own integration tokens"
  ON integration_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own integration tokens"
  ON integration_tokens
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = user_id))
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own integration tokens"
  ON integration_tokens
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE INDEX IF NOT EXISTS idx_integration_tokens_user_id ON integration_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_integration_name ON integration_tokens(integration_name);