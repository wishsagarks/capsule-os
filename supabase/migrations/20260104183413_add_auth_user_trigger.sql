/*
  # Add Auto-Create User Trigger

  ## Overview
  Automatically creates a user record in the public users table when a new user signs up

  ## Changes
  1. Function: handle_new_user()
    - Automatically creates a public users record when auth.users record is created
    - Copies relevant metadata from auth user to public user
    - Runs on INSERT to auth.users table

  2. Trigger: on_auth_user_created
    - Fires after INSERT on auth.users
    - Calls handle_new_user() for each new user

  ## Security
  - Function uses SECURITY DEFINER to bypass RLS
  - Only triggers on new user creation in auth schema
  - Ensures data consistency between auth.users and public.users
*/

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (
    auth_user_id,
    email,
    display_name,
    avatar_url,
    provider_type,
    created_at,
    updated_at,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    NOW(),
    NOW(),
    true
  );
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();