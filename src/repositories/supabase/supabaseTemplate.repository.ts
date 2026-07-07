import { isSupabaseConfigured, supabase } from '../../services/supabaseClient.js';
import type { TemplateRepository } from '../template.repository';
import type {
  CreateTemplateInput,
  TemplateModel,
  UpdateTemplateInput
} from '../../models';

const TABLE_NAME = 'templates';

function getClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using template repositories.');
  }

  return supabase;
}

function toModel(row: any): TemplateModel {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    category: row.category,
    previewImage: row.preview_image,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    description: row.description,
    price: row.price
  };
}

function toInsert(input: CreateTemplateInput) {
  return {
    key: input.key,
    name: input.name,
    category: input.category,
    preview_image: input.previewImage,
    status: input.status,
    description: input.description,
    price: input.price
  };
}

function toUpdate(input: UpdateTemplateInput) {
  return {
    name: input.name,
    category: input.category,
    preview_image: input.previewImage,
    status: input.status,
    description: input.description,
    price: input.price
  };
}

function compact(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined)
  );
}

function throwSupabaseError(action: string, error: { message?: string }) {
  throw new Error(`Failed to ${action} template: ${error.message || 'Unknown Supabase error'}`);
}

export const supabaseTemplateRepository: TemplateRepository = {
  async findById(id) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throwSupabaseError(`find template by id ${id}`, error);
    return data ? toModel(data) : null;
  },

  async findByKey(key) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (error) throwSupabaseError(`find template by key ${key}`, error);
    return data ? toModel(data) : null;
  },

  async findAll() {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throwSupabaseError('list templates', error);
    return (data || []).map(toModel);
  },

  async listActive() {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) throwSupabaseError('list active templates', error);
    return (data || []).map(toModel);
  },

  async create(input) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .insert(compact(toInsert(input)))
      .select('*')
      .single();

    if (error) throwSupabaseError('create template', error);
    return toModel(data);
  },

  async update(id, input) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .update(compact(toUpdate(input)))
      .eq('id', id)
      .select('*')
      .single();

    if (error) throwSupabaseError(`update template ${id}`, error);
    return toModel(data);
  },

  async delete(id) {
    const { error } = await getClient()
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throwSupabaseError(`delete template ${id}`, error);
  }
};
