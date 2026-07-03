import { supabase } from './supabaseClient.js';

export const authService = {
  /**
   * Signs in an admin user using email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Signs out the current user session
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Gets the currently authenticated user
   */
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  },

  /**
   * Checks if an admin session is currently active
   */
  async isAdminLoggedIn(): Promise<boolean> {
    const user = await this.getUser();
    return !!user;
  }
};
