import { supabase } from './supabaseClient.js';

export interface RSVP {
  id?: string;
  invitation_id: string;
  name: string;
  phone: string;
  attendance: 'yes' | 'no';
  pax: number;
  message?: string;
  created_at?: string;
}

export interface GuestMessage {
  id?: string;
  invitation_id: string;
  guest_name: string;
  message: string;
  created_at?: string;
}

export const rsvpService = {
  /**
   * Submits a guest RSVP response
   */
  async submitRSVP(rsvp: RSVP): Promise<RSVP> {
    const { data, error } = await supabase
      .from('rsvps')
      .insert([rsvp])
      .select()
      .single();

    if (error) {
      console.warn('Failed to submit RSVP to Supabase, saving locally:', error);
      // Simulate local save in case of demo fallback
      const localRSVPs = JSON.parse(localStorage.getItem('localRSVPs') || '[]');
      localRSVPs.push(rsvp);
      localStorage.setItem('localRSVPs', JSON.stringify(localRSVPs));
      return rsvp;
    }
    return data;
  },

  /**
   * Fetches all RSVPs for a given invitation (useful for Admin or exports)
   */
  async getRSVPs(invitationId: string): Promise<RSVP[]> {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn(`Failed to fetch RSVPs for invitation ${invitationId}:`, error);
      // Fallback to local
      const localRSVPs = JSON.parse(localStorage.getItem('localRSVPs') || '[]');
      return localRSVPs.filter((r: RSVP) => r.invitation_id === invitationId);
    }
    return data || [];
  },

  /**
   * Submits a guest congratulatory wish / message
   */
  async submitGuestMessage(message: GuestMessage): Promise<GuestMessage> {
    const { data, error } = await supabase
      .from('guest_messages')
      .insert([message])
      .select()
      .single();

    if (error) {
      console.warn('Failed to submit guest message to Supabase, saving locally:', error);
      // Simulate local save in case of demo fallback
      const localWishes = JSON.parse(localStorage.getItem('localWishes') || '[]');
      localWishes.push(message);
      localStorage.setItem('localWishes', JSON.stringify(localWishes));
      return message;
    }
    return data;
  },

  /**
   * Fetches congratulatory wishes / messages for an invitation
   */
  async getGuestMessages(invitationId: string): Promise<GuestMessage[]> {
    const { data, error } = await supabase
      .from('guest_messages')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn(`Failed to fetch guest wishes for invitation ${invitationId}:`, error);
      // Fallback to local
      const localWishes = JSON.parse(localStorage.getItem('localWishes') || '[]');
      return localWishes.filter((w: GuestMessage) => w.invitation_id === invitationId);
    }
    return data || [];
  }
};
