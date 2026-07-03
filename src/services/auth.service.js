import { supabase } from './supabaseClient.js';
import { adminConfig } from '../config/admin.config.js';
import { supabaseConfig } from '../config/supabase.config.js';

export const authService = {
  /**
   * Signs in an admin user using email and password.
   * If Supabase is not fully configured, it validates against adminConfig.admins in prototype mode.
   * If Supabase is configured, it signs in and ensures the email/UID belongs to the adminConfig.admins list.
   */
  async signIn(email, password) {
    const isSupabaseConfigured = !!supabaseConfig.url && !!supabaseConfig.anonKey;

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
    } catch (err) {
      return { session: null, error: err };
    }
  },

  /**
   * Registers a new customer using email and password.
   * If Supabase is not configured, it simulates registration and persists to local storage.
   */
  async registerCustomer(email, password, metadata = {}) {
    const isSupabaseConfigured = !!supabaseConfig.url && !!supabaseConfig.anonKey;

    if (!isSupabaseConfigured) {
      console.log("Supabase is not configured yet. Simulating registration in prototype mode.");
      
      // Check if email already exists in mock database
      const mockUsers = JSON.parse(localStorage.getItem('kb-customer-users') || '[]');
      const userExists = mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (userExists) {
        return {
          user: null,
          error: new Error("An account with this email already exists.")
        };
      }

      // Create mock user
      const mockUser = {
        id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
        email: email.toLowerCase(),
        user_metadata: {
          role: 'customer',
          ...metadata
        },
        created_at: new Date().toISOString()
      };

      // Add to mock database
      mockUsers.push({
        ...mockUser,
        password // Stored for simple prototype validation
      });
      localStorage.setItem('kb-customer-users', JSON.stringify(mockUsers));

      // Log them in immediately
      const mockSession = {
        user: mockUser,
        access_token: 'mock-token-' + Math.random().toString(36).substr(2, 9),
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };
      // Clear admin session to prevent conflict
      localStorage.removeItem('sb-mock-session');
      localStorage.setItem('kb-customer-session', JSON.stringify(mockSession));

      return {
        user: mockUser,
        error: null
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'customer',
            ...metadata
          }
        }
      });

      if (error) {
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: err };
    }
  },

  /**
   * Logs in a customer using email and password.
   * If Supabase is not configured, it validates against the simulated local storage users.
   */
  async loginCustomer(email, password) {
    const isSupabaseConfigured = !!supabaseConfig.url && !!supabaseConfig.anonKey;

    if (!isSupabaseConfigured) {
      console.log("Supabase is not configured yet. Checking credentials in prototype mode.");
      
      const mockUsers = JSON.parse(localStorage.getItem('kb-customer-users') || '[]');
      const matchedUser = mockUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (matchedUser) {
        const { password: _, ...userWithoutPassword } = matchedUser;
        const mockSession = {
          user: userWithoutPassword,
          access_token: 'mock-token-' + Math.random().toString(36).substr(2, 9),
          expires_at: Math.floor(Date.now() / 1000) + 3600
        };
        // Clear admin session to prevent conflict
        localStorage.removeItem('sb-mock-session');
        localStorage.setItem('kb-customer-session', JSON.stringify(mockSession));

        return {
          session: mockSession,
          error: null
        };
      } else {
        return {
          session: null,
          error: new Error("Invalid login credentials.")
        };
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { session: null, error };
      }

      return { session: data.session, error: null };
    } catch (err) {
      return { session: null, error: err };
    }
  },

  /**
   * Sends password reset instructions.
   * In prototype mode, simulates sending and returns success.
   */
  async forgotPassword(email, redirectTo = null) {
    const isSupabaseConfigured = !!supabaseConfig.url && !!supabaseConfig.anonKey;

    if (!isSupabaseConfigured) {
      console.log("Supabase is not configured yet. Simulating forgot password in prototype mode.");
      const mockUsers = JSON.parse(localStorage.getItem('kb-customer-users') || '[]');
      const userExists = mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase());

      if (!userExists) {
        return {
          data: null,
          error: new Error("No account was found with that email address.")
        };
      }

      return {
        data: { message: "Simulated password reset email sent successfully." },
        error: null
      };
    }

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || `${window.location.origin}/pages/reset-password.html`
      });

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Signs out the current user session (both Admin and Customer)
   */
  async signOut() {
    const isSupabaseConfigured = !!supabaseConfig.url && !!supabaseConfig.anonKey;
    
    // Always clear local mock storage sessions
    localStorage.removeItem('sb-mock-session');
    localStorage.removeItem('kb-customer-session');

    if (!isSupabaseConfigured) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      return { error: err };
    }
  },

  /**
   * Gets the currently authenticated user
   */
  async getUser() {
    const isSupabaseConfigured = !!supabaseConfig.url && !!supabaseConfig.anonKey;
    if (!isSupabaseConfigured) {
      const adminStored = localStorage.getItem('sb-mock-session');
      if (adminStored) {
        try {
          return JSON.parse(adminStored).user;
        } catch (e) {
          return null;
        }
      }
      const customerStored = localStorage.getItem('kb-customer-session');
      if (customerStored) {
        try {
          return JSON.parse(customerStored).user;
        } catch (e) {
          return null;
        }
      }
      return null;
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return null;
      return user;
    } catch (e) {
      return null;
    }
  },

  /**
   * Gets the current session
   */
  async getSession() {
    const isSupabaseConfigured = !!supabaseConfig.url && !!supabaseConfig.anonKey;
    if (!isSupabaseConfigured) {
      const adminStored = localStorage.getItem('sb-mock-session');
      if (adminStored) {
        try {
          return JSON.parse(adminStored);
        } catch (e) {
          return null;
        }
      }
      const customerStored = localStorage.getItem('kb-customer-session');
      if (customerStored) {
        try {
          return JSON.parse(customerStored);
        } catch (e) {
          return null;
        }
      }
      return null;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) return null;
      return session;
    } catch (e) {
      return null;
    }
  },

  /**
   * Checks if an admin session is currently active and matches any user in adminConfig.admins
   */
  async isAdminLoggedIn() {
    const user = await this.getUser();
    if (!user) return false;
    
    // Check against authorized adminConfig.admins
    return adminConfig.admins.some(
      admin => admin.email.toLowerCase() === user.email?.toLowerCase() || admin.uid === user.id
    );
  },

  /**
   * Checks if a customer session is currently active.
   */
  async isCustomerLoggedIn() {
    const user = await this.getUser();
    if (!user) return false;
    
    // If the user is logged in but not an admin, they are a customer
    const isAdmin = adminConfig.admins.some(
      admin => admin.email.toLowerCase() === user.email?.toLowerCase() || admin.uid === user.id
    );
    
    return !isAdmin;
  }
};
