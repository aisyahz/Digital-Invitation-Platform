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
    guestId: row.guest_id,
    attendanceStatus: row.attendance_status,
    paxCount: row.pax_count,
    message: row.message,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toInsert(input: CreateRsvpInput) {
  return {
    invitation_id: input.invitationId,
    guest_id: input.guestId,
    attendance_status: input.attendanceStatus,
    pax_count: input.paxCount,
    message: input.message,
    note: input.note,
    status: input.status
  };
}

function toUpdate(input: UpdateRsvpInput) {
  return {
    attendance_status: input.attendanceStatus,
    pax_count: input.paxCount,
    message: input.message,
    note: input.note,
    status: input.status
  };
}

function compact(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined)
  );
}

function throwSupabaseError(action: string, error: { message?: string }) {
  throw new Error(`Failed to ${action} RSVP: ${error.message || 'Unknown Supabase error'}`);
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

  async findByGuestId(guestId) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('guest_id', guestId)
      .maybeSingle();

    if (error) throwSupabaseError(`find RSVP for guest ${guestId}`, error);
    return data ? toModel(data) : null;
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
