import { supabaseService } from './supabase.service.js';
import { supabaseConfig } from '../config/supabase.config.js';

export const isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

export const supabase = new Proxy({}, {
  get(target: any, prop: string) {
    const client = supabaseService.getClient();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
}) as any;

