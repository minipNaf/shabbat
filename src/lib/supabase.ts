import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SavedCity {
  id: string;
  user_id: string;
  city_name: string;
  latitude: number;
  longitude: number;
  country: string;
  updated_at: string;
  created_at: string;
}
