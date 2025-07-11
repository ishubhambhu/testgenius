import { supabase } from './supabaseClient';
import { TestHistoryEntry } from '../types';
import { AuthService } from './authService';

export class HistoryService {
  static async saveTestHistory(historyEntry: TestHistoryEntry): Promise<void> {
    const user = await AuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_test_history')
      .upsert({
        id: historyEntry.id,
        user_id: user.id,
        test_name: historyEntry.testName,
        date_completed: new Date(historyEntry.dateCompleted).toISOString(),
        score_percentage: historyEntry.scorePercentage,
        total_questions: historyEntry.totalQuestions,
        correct_answers: historyEntry.correctAnswers,
        attempted_questions: historyEntry.attemptedQuestions,
        negative_marking_settings: historyEntry.negativeMarkingSettings,
        original_config: historyEntry.originalConfig,
        questions: historyEntry.questions,
        was_corrected_by_user: historyEntry.wasCorrectedByUser || false,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  static async getTestHistory(): Promise<TestHistoryEntry[]> {
    const user = await AuthService.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_test_history')
      .select('*')
      .eq('user_id', user.id)
      .order('date_completed', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      testName: row.test_name,
      dateCompleted: new Date(row.date_completed).getTime(),
      scorePercentage: row.score_percentage,
      totalQuestions: row.total_questions,
      correctAnswers: row.correct_answers,
      attemptedQuestions: row.attempted_questions,
      negativeMarkingSettings: row.negative_marking_settings,
      originalConfig: row.original_config,
      questions: row.questions,
      wasCorrectedByUser: row.was_corrected_by_user,
    }));
  }

  static async deleteTestHistory(historyId: string): Promise<void> {
    const user = await AuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_test_history')
      .delete()
      .eq('id', historyId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  static async clearAllHistory(): Promise<void> {
    const user = await AuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_test_history')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  }
}