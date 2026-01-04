/*
  # Add phone column to users table

  1. Changes
    - Add phone column to users table to store user phone numbers
  
  2. Details
    - Column is nullable since phone is optional during signup
    - Uses text data type to support international phone formats
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone text;
  END IF;
END $$;
