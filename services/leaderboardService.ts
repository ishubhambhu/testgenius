import { supabase } from './supabaseClient';

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  total_tests: number;
  avg_score: number;
  total_questions: number;
  final_score: number;
}

export class LeaderboardService {
  static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      // Get aggregated test data with user profiles
      const { data: testData, error: testError } = await supabase
        .from('user_test_history')
        .select(`
          user_id,
          score_percentage,
          total_questions
        `);

      if (testError) throw testError;

      if (!testData || testData.length === 0) {
        return [];
      }

      // Get user profiles
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          email,
          avatar_url
        `);

      if (profileError) throw profileError;

      // Create a map of user profiles for quick lookup
      const profileMap = new Map(
        (profileData || []).map(profile => [profile.id, profile])
      );

      // Group test data by user and calculate stats
      const userStats = new Map<string, {
        total_tests: number;
        total_score: number;
        total_questions: number;
      }>();

      testData.forEach(test => {
        const existing = userStats.get(test.user_id) || {
          total_tests: 0,
          total_score: 0,
          total_questions: 0
        };

        userStats.set(test.user_id, {
          total_tests: existing.total_tests + 1,
          total_score: existing.total_score + test.score_percentage,
          total_questions: existing.total_questions + test.total_questions
        });
      });

      // Create leaderboard entries
      const leaderboardEntries: LeaderboardEntry[] = [];

      userStats.forEach((stats, userId) => {
        const profile = profileMap.get(userId);
        if (!profile) return; // Skip if no profile found

        const avgScore = stats.total_score / stats.total_tests;
        const finalScore = this.calculateFinalScore(avgScore, stats.total_tests, stats.total_questions);

        leaderboardEntries.push({
          user_id: userId,
          name: profile.name || profile.email?.split('@')[0] || 'Unknown User',
          email: profile.email || '',
          avatar_url: profile.avatar_url,
          total_tests: stats.total_tests,
          avg_score: avgScore,
          total_questions: stats.total_questions,
          final_score: finalScore
        });
      });

      // Sort by final score (descending)
      return leaderboardEntries.sort((a, b) => b.final_score - a.final_score);

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

  private static calculateFinalScore(avgScore: number, totalTests: number, totalQuestions: number): number {
    // Normalize values to 0-100 scale
    const normalizedAvgScore = Math.min(avgScore, 100);
    const normalizedTests = Math.min(totalTests * 10, 100); // Cap at 10 tests = 100 points
    const normalizedQuestions = Math.min(totalQuestions * 2, 100); // Cap at 50 questions = 100 points

    // Weighted calculation: 50% avg score, 30% tests completed, 20% questions attempted
    const finalScore = (normalizedAvgScore * 0.5) + (normalizedTests * 0.3) + (normalizedQuestions * 0.2);
    
    return Math.min(finalScore, 100);
  }
}