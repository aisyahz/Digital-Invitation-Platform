import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else if (import.meta.env.DEV) {
  console.warn(
    'Supabase client not initialized. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Supabase.'
  );
}

export { supabase };
export const isSupabaseConfigured = Boolean(supabase);
