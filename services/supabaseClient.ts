import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_test_history: {
        Row: {
          id: string;
          user_id: string;
          test_name: string;
          date_completed: string;
          score_percentage: number;
          total_questions: number;
          correct_answers: number;
          attempted_questions: number;
          negative_marking_settings: any;
          original_config: any;
          questions: any;
          was_corrected_by_user: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          test_name: string;
          date_completed: string;
          score_percentage: number;
          total_questions: number;
          correct_answers: number;
          attempted_questions: number;
          negative_marking_settings: any;
          original_config: any;
          questions: any;
          was_corrected_by_user?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          test_name?: string;
          date_completed?: string;
          score_percentage?: number;
          total_questions?: number;
          correct_answers?: number;
          attempted_questions?: number;
          negative_marking_settings?: any;
          original_config?: any;
          questions?: any;
          was_corrected_by_user?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};