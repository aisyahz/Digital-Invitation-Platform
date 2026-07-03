import { supabaseService } from './supabase.service.js';

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

