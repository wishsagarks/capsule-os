/*
  # Add User Profile Fields

  1. Changes to Tables
    - `users` - Add profile fields:
      - `first_name` (text) - User's first name
      - `last_name` (text) - User's last name
      - `phone` (text) - User's phone number (optional)
      - `country` (text) - User's country
      - `provider_type` (text) - Authentication provider (email, google, etc.)
      - `avatar_url` (text) - Profile picture URL

  2. Notes
    - All fields are optional to support existing users
    - Provider type tracks how the user signed up
    - Phone and country can be used for future features
*/

DO $$
BEGIN
  -- Add first_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE users ADD COLUMN first_name TEXT;
  END IF;

  -- Add last_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE users ADD COLUMN last_name TEXT;
  END IF;

  -- Add phone if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone TEXT;
  END IF;

  -- Add country if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'country'
  ) THEN
    ALTER TABLE users ADD COLUMN country TEXT;
  END IF;

  -- Add provider_type if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'provider_type'
  ) THEN
    ALTER TABLE users ADD COLUMN provider_type TEXT DEFAULT 'email';
  END IF;

  -- Add avatar_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;
END $$;
