import { isSupabaseConfigured, supabase } from '../../services/supabaseClient.js';
import type { InvitationRepository } from '../invitation.repository';
import type {
  CreateInvitationInput,
  InvitationModel,
  UpdateInvitationInput
} from '../../models';

const TABLE_NAME = 'invitations';

function getClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using invitation repositories.');
  }

  return supabase;
}

function toModel(row: any): InvitationModel {
  return {
    id: row.id,
    orderId: row.order_id,
    slug: row.slug,
    content: row.content || {},
    settings: row.settings || {},
    analytics: row.analytics || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toInsert(input: CreateInvitationInput) {
  return {
    id: input.id,
    order_id: input.orderId,
    slug: input.slug,
    content: input.content,
    settings: input.settings,
    analytics: input.analytics
  };
}

function toUpdate(input: UpdateInvitationInput) {
  return {
    order_id: input.orderId,
    slug: input.slug,
    content: input.content,
    settings: input.settings,
    analytics: input.analytics
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

export const supabaseInvitationRepository: InvitationRepository = {
  async findById(id) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throwSupabaseError(`find invitation by id ${id}`, error);
    return data ? toModel(data) : null;
  },

  async findBySlug(slug) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throwSupabaseError(`find invitation by slug ${slug}`, error);
    return data ? toModel(data) : null;
  },

  async findAll() {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throwSupabaseError('list invitations', error);
    return (data || []).map(toModel);
  },

  async create(input) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .insert(compact(toInsert(input)))
      .select('*')
      .single();

    if (error) throwSupabaseError('create invitation', error);
    return toModel(data);
  },

  async update(id, input) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .update(compact(toUpdate(input)))
      .eq('id', id)
      .select('*')
      .single();

    if (error) throwSupabaseError(`update invitation ${id}`, error);
    return toModel(data);
  },

  async delete(id) {
    const { error } = await getClient()
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throwSupabaseError(`delete invitation ${id}`, error);
  }
};
