import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

let clientInstance: any = null;

function getClient() {
  if (!clientInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables are missing. Creating fallback mock client to prevent crash.');
      // Return a mock Proxy that throws a helpful message when any method is invoked
      const handler = {
        get(target: any, prop: string): any {
          if (prop === 'auth') {
            return {
              onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
              getSession: async () => ({ data: { session: null }, error: null }),
              signInWithPassword: async () => ({ data: { session: null }, error: new Error('Supabase is not configured yet.') }),
              signOut: async () => ({ error: null })
            };
          }
          if (prop === 'storage') {
            return {
              from: () => ({
                getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
                upload: async () => { throw new Error('Supabase storage is not configured yet.'); }
              })
            };
          }
          // Chainable query builder mock
          const mockQueryBuilder = () => {
            const builder: any = {
              select: () => builder,
              insert: () => builder,
              update: () => builder,
              eq: () => builder,
              order: () => builder,
              single: async () => ({ data: null, error: new Error('Supabase is not configured yet.') }),
              then: (onfulfilled: any) => Promise.resolve(onfulfilled({ data: null, error: new Error('Supabase is not configured yet.') }))
            };
            return builder;
          };
          return mockQueryBuilder;
        }
      };
      return new Proxy({}, handler);
    }
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
}

export const supabase = new Proxy({}, {
  get(target: any, prop: string) {
    const client = getClient();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
}) as any;
