import { isSupabaseConfigured, supabase } from '../../services/supabaseClient.js';
import type { GuestRepository } from '../guest.repository';
import type {
  CreateGuestInput,
  GuestModel,
  UpdateGuestInput
} from '../../models';

const TABLE_NAME = 'guests';

function getClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using guest repositories.');
  }

  return supabase;
}

function toModel(row: any): GuestModel {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    status: row.status,
    rsvpStatus: row.rsvp_status,
    rsvpId: row.rsvp_id,
    rsvpAt: row.rsvp_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toInsert(input: CreateGuestInput) {
  return {
    invitation_id: input.invitationId,
    name: input.name,
    phone: input.phone,
    email: input.email,
    status: input.status,
    rsvp_status: input.rsvpStatus
  };
}

function toUpdate(input: UpdateGuestInput) {
  return {
    name: input.name,
    phone: input.phone,
    email: input.email,
    status: input.status,
    rsvp_status: input.rsvpStatus,
    rsvp_id: input.rsvpId,
    rsvp_at: input.rsvpAt
  };
}

function compact(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined)
  );
}

function throwSupabaseError(action: string, error: { message?: string }) {
  throw new Error(`Failed to ${action} guest: ${error.message || 'Unknown Supabase error'}`);
}

export const supabaseGuestRepository: GuestRepository = {
  async findById(id) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throwSupabaseError(`find guest by id ${id}`, error);
    return data ? toModel(data) : null;
  },

  async findAll(invitationId) {
    let query = getClient()
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (invitationId) {
      query = query.eq('invitation_id', invitationId);
    }

    const { data, error } = await query;
    if (error) throwSupabaseError('list guests', error);
    return (data || []).map(toModel);
  },

  async findByInvitationId(invitationId) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false });

    if (error) throwSupabaseError(`find guests for invitation ${invitationId}`, error);
    return (data || []).map(toModel);
  },

  async create(input) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .insert(compact(toInsert(input)))
      .select('*')
      .single();

    if (error) throwSupabaseError('create guest', error);
    return toModel(data);
  },

  async update(id, input) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .update(compact(toUpdate(input)))
      .eq('id', id)
      .select('*')
      .single();

    if (error) throwSupabaseError(`update guest ${id}`, error);
    return toModel(data);
  },

  async delete(id) {
    const { error } = await getClient()
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throwSupabaseError(`delete guest ${id}`, error);
  }
};
