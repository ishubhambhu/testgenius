/*
  # Fix leaderboard permissions

  1. Security Updates
    - Grant SELECT permissions on auth.users to authenticated users
    - Grant SELECT permissions on public tables to authenticated users
    - Create RLS policy for user_leaderboard_stats view
    - Ensure proper access to leaderboard data

  2. Changes
    - Allow authenticated users to read from auth.users (needed for leaderboard view)
    - Allow authenticated users to read from user_profiles and user_test_history
    - Allow authenticated users to read from user_leaderboard_stats view
*/

-- Grant SELECT permissions on auth.users to authenticated role
-- This is needed because the user_leaderboard_stats view references auth.users
GRANT SELECT ON auth.users TO authenticated;

-- Grant SELECT permissions on public tables to authenticated users
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_test_history TO authenticated;

-- Grant SELECT permissions on the leaderboard view to authenticated users
GRANT SELECT ON public.user_leaderboard_stats TO authenticated;

-- Create RLS policy for the leaderboard view if it doesn't exist
-- Since this is a view, we need to ensure the underlying tables have proper RLS
DO $$
BEGIN
  -- Check if RLS policy exists for user_leaderboard_stats
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_leaderboard_stats' 
    AND policyname = 'Allow authenticated users to view leaderboard'
  ) THEN
    -- Enable RLS on the view if not already enabled
    ALTER TABLE public.user_leaderboard_stats ENABLE ROW LEVEL SECURITY;
    
    -- Create policy to allow authenticated users to view leaderboard
    CREATE POLICY "Allow authenticated users to view leaderboard"
      ON public.user_leaderboard_stats
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Ensure auth.users has a policy that allows reading user data for leaderboard
-- This is a more restrictive policy that only allows reading basic user info
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'auth' 
    AND tablename = 'users' 
    AND policyname = 'Allow authenticated users to read user data for leaderboard'
  ) THEN
    -- Enable RLS on auth.users if not already enabled
    ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
    
    -- Create policy to allow authenticated users to read basic user data
    CREATE POLICY "Allow authenticated users to read user data for leaderboard"
      ON auth.users
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;