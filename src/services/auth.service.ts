import { supabase } from './supabaseClient.js';
import { adminConfig } from '../config/admin.config.js';

export const authService = {
  /**
   * Signs in an admin user using email and password.
   * If Supabase is not fully configured, it validates against adminConfig.admins in prototype mode.
   * If Supabase is configured, it signs in and ensures the email/UID belongs to the adminConfig.admins list.
   */
  async signIn(email: string, password: string) {
    const metaEnv = (import.meta as any).env || {};
    const isSupabaseConfigured = !!metaEnv.VITE_SUPABASE_URL && !!metaEnv.VITE_SUPABASE_ANON_KEY;

    if (!isSupabaseConfigured) {
      console.log("Supabase is not configured yet. Checking against adminConfig.admins in prototype mode.");
      
      const adminUser = adminConfig.admins.find(admin => admin.email.toLowerCase() === email.toLowerCase());
      if (adminUser) {
        const mockSession = {
          user: {
            id: adminUser.uid,
            email: adminUser.email,
            role: adminUser.role
          }
        };
        // Persist local mock session for prototype experience
        localStorage.setItem('sb-mock-session', JSON.stringify(mockSession));
        return {
          session: mockSession,
          error: null
        };
      } else {
        return {
          session: null,
          error: new Error(`You are not authorized to access this page. Email '${email}' is not in the adminConfig.admins list.`)
        };
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { session: null, error };
      }

      const user = data?.user;
      if (user) {
        // Validation check: Validate the logged-in user's email/UID against adminConfig.admins list
        const isAuthorizedAdmin = adminConfig.admins.some(
          admin => admin.email.toLowerCase() === user.email?.toLowerCase() || admin.uid === user.id
        );

        if (!isAuthorizedAdmin) {
          // Immediately sign out unauthorized users
          await supabase.auth.signOut();
          return {
            session: null,
            error: new Error("You are not authorized to access this page. Email/UID not matched in adminConfig.admins.")
          };
        }
      }

      return { session: data?.session, error: null };
    } catch (err: any) {
      return { session: null, error: err };
    }
  },

  /**
   * Signs out the current user session
   */
  async signOut() {
    const metaEnv = (import.meta as any).env || {};
    const isSupabaseConfigured = !!metaEnv.VITE_SUPABASE_URL && !!metaEnv.VITE_SUPABASE_ANON_KEY;
    if (!isSupabaseConfigured) {
      localStorage.removeItem('sb-mock-session');
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Gets the currently authenticated user
   */
  async getUser() {
    const metaEnv = (import.meta as any).env || {};
    const isSupabaseConfigured = !!metaEnv.VITE_SUPABASE_URL && !!metaEnv.VITE_SUPABASE_ANON_KEY;
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('sb-mock-session');
      if (stored) {
        try {
          return JSON.parse(stored).user;
        } catch (e) {
          return null;
        }
      }
      return null;
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  },

  /**
   * Gets the current session
   */
  async getSession() {
    const metaEnv = (import.meta as any).env || {};
    const isSupabaseConfigured = !!metaEnv.VITE_SUPABASE_URL && !!metaEnv.VITE_SUPABASE_ANON_KEY;
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('sb-mock-session');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return null;
        }
      }
      return null;
    }
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return null;
    return session;
  },

  /**
   * Checks if an admin session is currently active and matches any user in adminConfig.admins
   */
  async isAdminLoggedIn(): Promise<boolean> {
    const user = await this.getUser();
    if (!user) return false;
    
    // Check against authorized adminConfig.admins
    return adminConfig.admins.some(
      admin => admin.email.toLowerCase() === user.email?.toLowerCase() || admin.uid === user.id
    );
  }
};
