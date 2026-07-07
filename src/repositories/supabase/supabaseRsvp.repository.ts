import { isSupabaseConfigured, supabase } from '../../services/supabaseClient.js';
import type { RsvpRepository } from '../rsvp.repository';
import type {
  CreateRsvpInput,
  RsvpModel,
  UpdateRsvpInput
} from '../../models';

const TABLE_NAME = 'rsvps';

function getClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using RSVP repositories.');
  }

  return supabase;
}

function toModel(row: any): RsvpModel {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    name: row.name,
    phone: row.phone,
    attendance: row.attendance,
    pax: row.pax,
    message: row.message,
    createdAt: row.created_at
  };
}

function toInsert(input: CreateRsvpInput) {
  return {
    invitation_id: input.invitationId,
    name: input.name,
    phone: input.phone,
    attendance: input.attendance,
    pax: input.pax,
    message: input.message
  };
}

function toUpdate(input: UpdateRsvpInput) {
  return {
    name: input.name,
    phone: input.phone,
    attendance: input.attendance,
    pax: input.pax,
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

export const supabaseRsvpRepository: RsvpRepository = {
  async findById(id) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throwSupabaseError(`find RSVP by id ${id}`, error);
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
    if (error) throwSupabaseError('list RSVPs', error);
    return (data || []).map(toModel);
  },

  async findByInvitationId(invitationId) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false });

    if (error) throwSupabaseError(`find RSVPs for invitation ${invitationId}`, error);
    return (data || []).map(toModel);
  },

  async create(input) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .insert(compact(toInsert(input)))
      .select('*')
      .single();

    if (error) throwSupabaseError('create RSVP', error);
    return toModel(data);
  },

  async update(id, input) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .update(compact(toUpdate(input)))
      .eq('id', id)
      .select('*')
      .single();

    if (error) throwSupabaseError(`update RSVP ${id}`, error);
    return toModel(data);
  },

  async delete(id) {
    const { error } = await getClient()
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throwSupabaseError(`delete RSVP ${id}`, error);
  }
};
