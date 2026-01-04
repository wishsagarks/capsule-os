/*
  # Add INSERT policy for users table

  1. Changes
    - Add INSERT policy to allow authenticated users to create their own profile
    - Policy ensures users can only insert their own profile (matching auth.uid())
  
  2. Security
    - Users can only create a profile for themselves
    - The auth_user_id must match the authenticated user's ID
*/

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);
