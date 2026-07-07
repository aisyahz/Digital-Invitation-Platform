import { isSupabaseConfigured, supabase } from '../../services/supabaseClient.js';
import type { GuestRepository } from '../guest.repository';
import type {
  CreateGuestInput,
  GuestModel,
  UpdateGuestInput
} from '../../models';

const TABLE_NAME = 'guest_messages';

function getClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using guest message repositories.');
  }

  return supabase;
}

function toModel(row: any): GuestModel {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    guestName: row.guest_name,
    message: row.message,
    createdAt: row.created_at
  };
}

function toInsert(input: CreateGuestInput) {
  return {
    invitation_id: input.invitationId,
    guest_name: input.guestName,
    message: input.message
  };
}

function toUpdate(input: UpdateGuestInput) {
  return {
    guest_name: input.guestName,
    message: input.message
  };
}

function compact(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined)
  );
}

function throwSupabaseError(action: string, error: { message?: string }) {
  throw new Error(`Failed to ${action}: ${error.message || 'Unknown Supabase error'}`);
}

export const supabaseGuestRepository: GuestRepository = {
  async findById(id) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throwSupabaseError(`find guest message by id ${id}`, error);
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
    if (error) throwSupabaseError('list guest messages', error);
    return (data || []).map(toModel);
  },

  async findByInvitationId(invitationId) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false });

    if (error) throwSupabaseError(`find guest messages for invitation ${invitationId}`, error);
    return (data || []).map(toModel);
  },

  async create(input) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .insert(compact(toInsert(input)))
      .select('*')
      .single();

    if (error) throwSupabaseError('create guest message', error);
    return toModel(data);
  },

  async update(id, input) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .update(compact(toUpdate(input)))
      .eq('id', id)
      .select('*')
      .single();

    if (error) throwSupabaseError(`update guest message ${id}`, error);
    return toModel(data);
  },

  async delete(id) {
    const { error } = await getClient()
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throwSupabaseError(`delete guest message ${id}`, error);
  }
};
