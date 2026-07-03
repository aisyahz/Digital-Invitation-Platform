/**
 * Supabase configuration module.
 * Reads SUPABASE_URL and SUPABASE_ANON_KEY environment variables.
 * Supports both standard and VITE-prefixed environment variables.
 */

const getEnvValue = (key) => {
  // 1. Try Vite's import.meta.env (for client-side/bundler environments)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env[key]) {
      return import.meta.env[key];
    }
    if (import.meta.env[`VITE_${key}`]) {
      return import.meta.env[`VITE_${key}`];
    }
  }

  // 2. Try Node's process.env (for SSR, testing, or server environments)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) {
      return process.env[key];
    }
    if (process.env[`VITE_${key}`]) {
      return process.env[`VITE_${key}`];
    }
  }

  return '';
};

export const supabaseConfig = {
  url: getEnvValue('SUPABASE_URL'),
  anonKey: getEnvValue('SUPABASE_ANON_KEY')
};
