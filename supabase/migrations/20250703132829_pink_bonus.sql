/*
  # Create user test history table

  1. New Tables
    - `user_test_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `test_name` (text)
      - `date_completed` (timestamptz)
      - `score_percentage` (numeric)
      - `total_questions` (integer)
      - `correct_answers` (integer)
      - `attempted_questions` (integer)
      - `negative_marking_settings` (jsonb)
      - `original_config` (jsonb)
      - `questions` (jsonb)
      - `was_corrected_by_user` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_test_history` table
    - Add policy for authenticated users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS user_test_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_name text NOT NULL,
  date_completed timestamptz NOT NULL,
  score_percentage numeric NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  correct_answers integer NOT NULL DEFAULT 0,
  attempted_questions integer NOT NULL DEFAULT 0,
  negative_marking_settings jsonb NOT NULL DEFAULT '{}',
  original_config jsonb NOT NULL DEFAULT '{}',
  questions jsonb NOT NULL DEFAULT '[]',
  was_corrected_by_user boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_test_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own test history"
  ON user_test_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test history"
  ON user_test_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test history"
  ON user_test_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own test history"
  ON user_test_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_test_history_user_id ON user_test_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_test_history_date_completed ON user_test_history(date_completed DESC);