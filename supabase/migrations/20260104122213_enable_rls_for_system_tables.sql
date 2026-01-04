/*
  # Enable Row Level Security for System Tables

  1. Tables Updated
    - `circuit_breaker_state` - Circuit breaker state tracking
    - `integration_health_events` - Integration health event logs
    - `intelligence_sources` - Available data sources registry
    - `metric_definitions` - Metric schema definitions
    - `system_config` - System configuration settings
    - `system_health` - System health monitoring data

  2. Security Changes
    - Enable RLS on all listed tables
    - Add read-only policies for authenticated users on public data
    - Add restrictive policies for system-level tables
    - Service role maintains full access for background operations

  3. Policy Details
    - **intelligence_sources**: Read-only for all authenticated users (public registry)
    - **metric_definitions**: Read-only for all authenticated users (public schemas)
    - **system_health**: Read-only for authenticated users (health monitoring)
    - **integration_health_events**: Read-only for authenticated users (audit trail)
    - **system_config**: No user access (service role only)
    - **circuit_breaker_state**: No user access (service role only)
*/

-- Enable RLS on all system tables
ALTER TABLE circuit_breaker_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;

-- Intelligence Sources Policies (Public Registry - Read Only)
CREATE POLICY "Authenticated users can view intelligence sources"
  ON intelligence_sources FOR SELECT
  TO authenticated
  USING (TRUE);

-- Metric Definitions Policies (Public Schemas - Read Only)
CREATE POLICY "Authenticated users can view metric definitions"
  ON metric_definitions FOR SELECT
  TO authenticated
  USING (TRUE);

-- System Health Policies (Monitoring Data - Read Only)
CREATE POLICY "Authenticated users can view system health"
  ON system_health FOR SELECT
  TO authenticated
  USING (TRUE);

-- Integration Health Events Policies (Audit Trail - Read Only)
CREATE POLICY "Authenticated users can view integration health events"
  ON integration_health_events FOR SELECT
  TO authenticated
  USING (TRUE);

-- System Config Policies (Admin/Service Only - No User Access)
-- No user policies - only service role can access

-- Circuit Breaker State Policies (System Only - No User Access)
-- No user policies - only service role can access
