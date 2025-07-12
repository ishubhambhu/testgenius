import { supabase } from './supabaseClient';

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  tests_completed: number;
  avg_score: number;
  total_questions_attempted: number;
  last_test_date: string;
  normalized_tests: number;
  normalized_score: number;
  normalized_questions: number;
  final_score: number;
}

export class LeaderboardService {
  static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      // Use the existing Supabase view for leaderboard data
      const { data, error } = await supabase
        .from('user_leaderboard_stats')
        .select('*')
        .order('final_score', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Transform the data to match our interface
      return data.map(row => ({
        user_id: row.user_id,
        display_name: row.display_name || row.email?.split('@')[0] || 'Unknown User',
        email: row.email || '',
        avatar_url: row.avatar_url,
        tests_completed: Number(row.tests_completed) || 0,
        avg_score: Number(row.avg_score) || 0,
        total_questions_attempted: Number(row.total_questions_attempted) || 0,
        last_test_date: row.last_test_date || '',
        normalized_tests: Number(row.normalized_tests) || 0,
        normalized_score: Number(row.normalized_score) || 0,
        normalized_questions: Number(row.normalized_questions) || 0,
        final_score: Number(row.final_score) || 0
      }));

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error('Failed to load leaderboard data');
    }
  }

  static async getUserRank(userId: string): Promise<number | null> {
    try {
      const leaderboard = await this.getLeaderboard();
      const userIndex = leaderboard.findIndex(entry => entry.user_id === userId);
      return userIndex >= 0 ? userIndex + 1 : null;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  }
}