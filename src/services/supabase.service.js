import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase.config.js';

let clientInstance = null;
let cachedConnectionStatus = null; // null: unknown, true: connected, false: failed

/**
 * Creates a mock/fallback client to prevent application crashes when Supabase is unconfigured or offline.
 */
function createMockClient() {
  const handler = {
    get(target, prop) {
      if (prop === '__isMock') {
        return true;
      }
      if (prop === 'auth') {
        return {
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          getSession: async () => ({ data: { session: null }, error: null }),
          signInWithPassword: async () => ({ data: { session: null }, error: new Error('Supabase is not configured yet.') }),
          signOut: async () => ({ error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          getUserMetadata: () => ({})
        };
      }
      if (prop === 'storage') {
        return {
          from: () => ({
            getPublicUrl: (path) => ({ data: { publicUrl: '' } }),
            upload: async () => { throw new Error('Supabase storage is not configured yet.'); }
          })
        };
      }

      // Chainable query builder mock
      const mockQueryBuilder = () => {
        const builder = {
          select: () => builder,
          insert: () => builder,
          update: () => builder,
          eq: () => builder,
          order: () => builder,
          single: async () => ({ data: null, error: new Error('Supabase is not configured yet.') }),
          then: (onfulfilled) => Promise.resolve(onfulfilled({ data: null, error: new Error('Supabase is not configured yet.') }))
        };
        return builder;
      };

      return mockQueryBuilder;
    }
  };
  return new Proxy({}, handler);
}

/**
 * Gets the Supabase client instance. If config is invalid or initialization fails,
 * returns a safe mock client to ensure the application continues working.
 * 
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getClient() {
  if (clientInstance) {
    return clientInstance;
  }

  const { url, anonKey } = supabaseConfig;

  if (!url || !anonKey) {
    console.warn('Supabase configuration is missing (SUPABASE_URL and/or SUPABASE_ANON_KEY). Falling back to mock client.');
    clientInstance = createMockClient();
    return clientInstance;
  }

  try {
    clientInstance = createClient(url, anonKey);
    return clientInstance;
  } catch (error) {
    console.error('Critical: Failed to initialize Supabase client:', error);
    clientInstance = createMockClient();
    return clientInstance;
  }
}

/**
 * Checks if Supabase client is connected and can reach the database.
 * 
 * @returns {Promise<boolean>}
 */
export async function isConnected() {
  const { url, anonKey } = supabaseConfig;
  if (!url || !anonKey) {
    return false;
  }

  try {
    const client = getClient();
    if (client.__isMock) {
      return false;
    }

    // Perform a lightweight check using the auth getSession endpoint
    const { error } = await client.auth.getSession();
    if (error) {
      console.warn('Supabase connection check returned an error:', error.message);
      return false;
    }

    cachedConnectionStatus = true;
    return true;
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    cachedConnectionStatus = false;
    return false;
  }
}

export const supabaseService = {
  getClient,
  isConnected
};
