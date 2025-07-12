/*
  # Fix permissions for user_leaderboard_stats view

  1. Security
    - Grant necessary permissions for the leaderboard view to work
    - Add RLS policy for authenticated users to read leaderboard data
    - Ensure the view can access auth.users table

  2. Changes
    - Grant SELECT on auth.users to authenticated role
    - Add RLS policy for user_leaderboard_stats view
    - Ensure proper permissions for the existing view
*/

-- Grant permission to read from auth.users table (needed by the view)
GRANT SELECT ON auth.users TO authenticated;

-- Ensure RLS is enabled on user_leaderboard_stats if it's a table
-- (Skip if it's a view, as views inherit permissions from underlying tables)
DO $$
BEGIN
  -- Check if user_leaderboard_stats is a table (not a view)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_leaderboard_stats'
    AND table_type = 'BASE TABLE'
  ) THEN
    ALTER TABLE user_leaderboard_stats ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for authenticated users to read leaderboard data
    DROP POLICY IF EXISTS "Authenticated users can read leaderboard" ON user_leaderboard_stats;
    CREATE POLICY "Authenticated users can read leaderboard"
      ON user_leaderboard_stats
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- If it's a view, ensure the underlying tables have proper permissions
-- Grant permissions on user_profiles and user_test_history (already should exist)
GRANT SELECT ON user_profiles TO authenticated;
GRANT SELECT ON user_test_history TO authenticated;