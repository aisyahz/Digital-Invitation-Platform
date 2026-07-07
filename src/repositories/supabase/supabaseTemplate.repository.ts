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
    name: row.name,
    slug: row.slug,
    thumbnail: row.thumbnail,
    folder: row.folder,
    price: row.price,
    status: row.status,
    config: row.config,
    createdAt: row.created_at,
    version: row.version,
    previewImage: row.preview_image,
    coverImage: row.cover_image,
    configFile: row.config_file,
    animation: row.animation
  };
}

function toInsert(input: CreateTemplateInput) {
  return {
    name: input.name,
    slug: input.slug,
    thumbnail: input.thumbnail,
    folder: input.folder,
    price: input.price,
    status: input.status,
    config: input.config,
    version: input.version,
    preview_image: input.previewImage,
    cover_image: input.coverImage,
    config_file: input.configFile,
    animation: input.animation
  };
}

function toUpdate(input: UpdateTemplateInput) {
  return {
    name: input.name,
    slug: input.slug,
    thumbnail: input.thumbnail,
    folder: input.folder,
    price: input.price,
    status: input.status,
    config: input.config,
    version: input.version,
    preview_image: input.previewImage,
    cover_image: input.coverImage,
    config_file: input.configFile,
    animation: input.animation
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

  async findBySlug(slug) {
    const { data, error } = await getClient()
      .from(TABLE_NAME)
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throwSupabaseError(`find template by slug ${slug}`, error);
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
