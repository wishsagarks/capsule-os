/*
  # Enable Row Level Security for integration_health_current

  1. Tables Updated
    - `integration_health_current` - Current health status of integrations

  2. Security Changes
    - Enable RLS on integration_health_current table
    - Add read-only policy for authenticated users
    - Service role maintains full access for health monitoring operations

  3. Policy Details
    - **integration_health_current**: Read-only for authenticated users (current health monitoring data)
*/

-- Enable RLS on integration_health_current table
ALTER TABLE integration_health_current ENABLE ROW LEVEL SECURITY;

-- Integration Health Current Policies (Current Status - Read Only)
CREATE POLICY "Authenticated users can view current integration health"
  ON integration_health_current FOR SELECT
  TO authenticated
  USING (TRUE);
