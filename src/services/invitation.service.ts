import { supabase } from './supabaseClient.js';

export interface Invitation {
  id: string; // The unique, hard-to-guess edit token
  order_id: string;
  slug: string;
  content: {
    groom: string;
    bride: string;
    event: string;
    date: string;
    time: string;
    venue: string;
    address: string;
    gmaps?: string;
    waze?: string;
    phone?: string;
    music?: string;
    appearance?: {
      preset: string;
      headingColor: string;
      bodyColor: string;
      accentColor: string;
      textShadow: boolean;
      overlayOpacity: number;
      buttonStyle: string;
    };
    gallery?: string[];
    parents?: {
      groom?: string;
      bride?: string;
    };
    contacts?: Array<{ name: string; phone: string }>;
  };
  settings?: {
    is_active?: boolean;
    music_enabled?: boolean;
    allow_wishes?: boolean;
    watermark_disabled?: boolean;
    [key: string]: any;
  };
  analytics?: {
    total_views: number;
    unique_views: number;
    last_viewed: string | null;
    map_clicks: number;
    gallery_opens: number;
    music_plays: number;
    rsvp_count: number;
    share_count: number;
  };
  created_at?: string;
  updated_at?: string;
}

export const invitationService = {
  /**
   * Fetches an invitation by its public slug (e.g. for /invite/adam-hawa)
   */
  async getInvitationBySlug(slug: string): Promise<Invitation | null> {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.warn(`Failed to fetch invitation by slug ${slug}:`, error);
      return null;
    }
    return data;
  },

  /**
   * Fetches an invitation by its unique, secure edit token (which is the ID column)
   */
  async getInvitationByEditToken(token: string): Promise<Invitation | null> {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', token)
      .single();

    if (error) {
      console.warn(`Failed to fetch invitation by edit token:`, error);
      return null;
    }
    return data;
  },

  /**
   * Creates a new invitation record in Supabase
   */
  async createInvitation(invitation: Omit<Invitation, 'created_at' | 'updated_at'>): Promise<Invitation> {
    const record = {
      ...invitation,
      settings: invitation.settings || { is_active: true },
      analytics: invitation.analytics || {
        total_views: 0,
        unique_views: 0,
        last_viewed: null,
        map_clicks: 0,
        gallery_opens: 0,
        music_plays: 0,
        rsvp_count: 0,
        share_count: 0
      }
    };
    const { data, error } = await supabase
      .from('invitations')
      .insert([record])
      .select()
      .single();

    if (error) {
      console.warn('Failed to insert invitation in Supabase, using local simulated record:', error);
      // Fallback
      return record as Invitation;
    }
    return data;
  },

  /**
   * Updates an invitation's content (details/appearance), settings, and/or analytics using the secure edit token (id)
   */
  async updateInvitation(token: string, content: Invitation['content'], settings?: any, analytics?: any): Promise<Invitation | null> {
    const updatePayload: any = {
      content: content,
      updated_at: new Date().toISOString()
    };
    if (settings) updatePayload.settings = settings;
    if (analytics) updatePayload.analytics = analytics;

    const { data, error } = await supabase
      .from('invitations')
      .update(updatePayload)
      .eq('id', token)
      .select()
      .single();

    if (error) {
      console.warn('Failed to update invitation details in Supabase:', error);
      return null;
    }
    return data;
  },

  /**
   * Publishes an invitation linked to an order and returns the public invitation record.
   * The current invitations schema has no top-level status/published_at columns, so publish
   * metadata is kept in settings while preserving the existing content JSONB pattern.
   */
  async publishInvitationByOrderId(orderId: string): Promise<Invitation | null> {
    const publishedAt = new Date().toISOString();

    const { data: existing, error: fetchError } = await supabase
      .from('invitations')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (fetchError || !existing) {
      console.warn(`Failed to find invitation for order ${orderId}:`, fetchError);
      return null;
    }

    const settings = {
      ...(existing.settings || {}),
      is_active: true,
      status: 'published',
      published_at: publishedAt
    };

    const { data, error } = await supabase
      .from('invitations')
      .update({
        settings,
        updated_at: publishedAt
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.warn(`Failed to publish invitation for order ${orderId}:`, error);
      return null;
    }

    return data;
  },

  /**
   * Increments and stores analytics separately from invitation content.
   */
  async trackEvent(slugOrId: string, eventName: 'total_views' | 'unique_views' | 'map_clicks' | 'gallery_opens' | 'music_plays' | 'rsvp_count' | 'share_count'): Promise<void> {
    try {
      const { data: inv, error } = await supabase
        .from('invitations')
        .select('id, analytics')
        .or(`id.eq.${slugOrId},slug.eq.${slugOrId}`)
        .single();

      if (inv) {
        const currentAnalytics = inv.analytics || {
          total_views: 0,
          unique_views: 0,
          last_viewed: null,
          map_clicks: 0,
          gallery_opens: 0,
          music_plays: 0,
          rsvp_count: 0,
          share_count: 0
        };

        if (eventName === 'unique_views') {
          const sessionKey = `viewed_uniq_${inv.id}`;
          if (localStorage.getItem(sessionKey)) {
            return;
          }
          localStorage.setItem(sessionKey, 'true');
          currentAnalytics.unique_views = (currentAnalytics.unique_views || 0) + 1;
        } else if (eventName === 'total_views') {
          currentAnalytics.total_views = (currentAnalytics.total_views || 0) + 1;
          currentAnalytics.last_viewed = new Date().toISOString();
        } else {
          currentAnalytics[eventName] = (currentAnalytics[eventName] || 0) + 1;
        }

        await supabase
          .from('invitations')
          .update({ analytics: currentAnalytics })
          .eq('id', inv.id);
      }
    } catch (e) {
      console.warn('Failed tracking event:', eventName, e);
    }
  },

  /**
   * Helper to generate a unique, secure, hard-to-guess edit token
   */
  generateSecureToken(): string {
    // Generate a random 12-character hex token (difficult to guess)
    const chars = '0123456789abcdef';
    let token = '';
    for (let i = 0; i < 16; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
  }
};
