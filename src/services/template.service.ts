import { supabase } from './supabaseClient.js';
import { templates as localTemplates } from '../config/templates.js';

export interface Template {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  folder: string;
  price: string;
  status: string;
  created_at?: string;
  config?: any; // To store design config like colors, fonts, particles
  version?: number;
  preview_image?: string;
  cover_image?: string;
  config_file?: string;
  animation?: string;
}

export const templateService = {
  /**
   * Fetches all active templates from the Supabase database.
   * If there is an issue or database is empty/unconfigured, falls back to the local templates configuration.
   */
  async getTemplates(): Promise<Template[]> {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('status', 'active');

      if (error || !data || data.length === 0) {
        console.log('Using local fallback templates.');
        return Object.values(localTemplates).map(tpl => ({
          id: tpl.id,
          name: tpl.name,
          slug: tpl.id,
          thumbnail: tpl.thumbnail,
          folder: tpl.id,
          price: tpl.price,
          status: 'active',
          version: 1,
          config: {
            colors: tpl.colors,
            particleType: tpl.particleType,
            decorations: tpl.decorations,
            appearanceDefaults: tpl.appearanceDefaults,
            background: tpl.background,
            overlay: tpl.overlay,
            backgroundMusic: `/music/${tpl.id}.mp3`
          }
        }));
      }

      // Automatically construct template structures with dynamic config if stored or fetched
      const templates = await Promise.all(data.map(async (row) => {
        let configObj = row.config;

        // If config is not pre-populated in DB as a column, try fetching it from storage
        if (!configObj) {
          try {
            const configUrl = `${supabase.storage.from('templates').getPublicUrl(`${row.folder}/config.json`).data.publicUrl}`;
            const res = await fetch(configUrl);
            if (res.ok) {
              configObj = await res.json();
            }
          } catch (e) {
            console.warn(`Could not load config.json for template folder: ${row.folder}`, e);
          }
        }

        // Standardize colors and appearance fields based on config.json parameters
        const backgroundMusicUrl = configObj?.backgroundMusic || `${supabase.storage.from('templates').getPublicUrl(`${row.folder}/music.mp3`).data.publicUrl}`;
        const finalColors = {
          background: configObj?.secondaryColor || configObj?.colors?.background || '#fdfbf7',
          primary: configObj?.primaryColor || configObj?.colors?.primary || '#f0b4b9',
          dark: configObj?.primaryColor || configObj?.colors?.dark || '#a8936d',
          gold: configObj?.primaryColor || configObj?.colors?.gold || '#dfc384',
          text: configObj?.headingColor || configObj?.colors?.text || '#2d2a26',
          muted: configObj?.primaryColor || configObj?.colors?.muted || '#8c7251'
        };

        const appearanceDefaults = configObj?.appearanceDefaults || {
          preset: 'designer',
          headingColor: finalColors.text,
          bodyColor: finalColors.muted,
          accentColor: finalColors.gold,
          textShadow: false,
          overlayOpacity: 0.0,
          buttonStyle: 'filled'
        };

        let decorations = configObj?.decorations || [];
        if (decorations.length === 0) {
          if (configObj?.particleEffect === 'shimmer' || row.id === 'royal' || row.slug === 'royal') {
            decorations = [{ type: "shimmer" }];
          } else if (row.id === 'islamic' || row.slug === 'islamic') {
            decorations = [{ type: "arch" }];
          } else {
            decorations = [
              { type: "petal", char: "🌸", style: "top: 25%; left: 35%; animation-delay: 0s;" },
              { type: "petal", char: "🌸", style: "top: 55%; left: 75%; animation-delay: 1.2s;" }
            ];
          }
        }

        // Return standardized template structure
        return {
          id: row.id,
          name: row.name,
          slug: row.slug,
          thumbnail: row.thumbnail || `${supabase.storage.from('templates').getPublicUrl(`${row.folder}/thumbnail.webp`).data.publicUrl}`,
          folder: row.folder,
          price: row.price || 'RM 99',
          status: row.status,
          created_at: row.created_at,
          version: row.version || 1,
          preview_image: row.preview_image || `${supabase.storage.from('templates').getPublicUrl(`${row.folder}/preview.webp`).data.publicUrl}`,
          cover_image: row.cover_image || `${supabase.storage.from('templates').getPublicUrl(`${row.folder}/cover.webp`).data.publicUrl}`,
          config_file: row.config_file || `${row.folder}/config.json`,
          animation: row.animation || configObj?.openingAnimation || 'fade-in',
          config: {
            colors: finalColors,
            particleType: configObj?.particleEffect || configObj?.particleType || 'garden',
            decorations: decorations,
            appearanceDefaults: appearanceDefaults,
            background: `${supabase.storage.from('templates').getPublicUrl(`${row.folder}/background.webp`).data.publicUrl}`,
            overlay: `${supabase.storage.from('templates').getPublicUrl(`${row.folder}/overlay.webp`).data.publicUrl}`,
            backgroundMusic: backgroundMusicUrl,
            ...configObj
          }
        };
      }));

      return templates;
    } catch (err) {
      console.warn('Error fetching templates from Supabase, using local defaults:', err);
      return Object.values(localTemplates).map(tpl => ({
        id: tpl.id,
        name: tpl.name,
        slug: tpl.id,
        thumbnail: tpl.thumbnail,
        folder: tpl.id,
        price: tpl.price,
        status: 'active',
        version: 1,
        config: {
          colors: tpl.colors,
          particleType: tpl.particleType,
          decorations: tpl.decorations,
          appearanceDefaults: tpl.appearanceDefaults,
          background: tpl.background,
          overlay: tpl.overlay,
          backgroundMusic: `/music/${tpl.id}.mp3`
        }
      }));
    }
  },

  /**
   * Fetches a single template configuration by its slug/id
   */
  async getTemplateById(idOrSlug: string): Promise<Template | null> {
    const all = await this.getTemplates();
    return all.find(t => t.id === idOrSlug || t.slug === idOrSlug) || null;
  },

  /**
   * Inserts a new template metadata row into Supabase templates table
   */
  async addTemplate(tpl: Omit<Template, 'created_at'>): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .insert([{
        id: tpl.id,
        name: tpl.name,
        slug: tpl.id,
        thumbnail: tpl.thumbnail || `${supabase.storage.from('templates').getPublicUrl(`${tpl.folder}/thumbnail.webp`).data.publicUrl}`,
        folder: tpl.folder,
        price: tpl.price,
        status: tpl.status,
        version: tpl.version || 1,
        preview_image: tpl.preview_image || `${supabase.storage.from('templates').getPublicUrl(`${tpl.folder}/preview.webp`).data.publicUrl}`,
        cover_image: tpl.cover_image || `${supabase.storage.from('templates').getPublicUrl(`${tpl.folder}/cover.webp`).data.publicUrl}`,
        config_file: tpl.config_file || `${tpl.folder}/config.json`,
        animation: tpl.animation || 'fade-in'
      }])
      .select()
      .single();

    if (error) {
      console.error("Error adding template to DB:", error);
      throw error;
    }
    return data;
  },

  /**
   * Updates an existing template metadata row in Supabase
   */
  async updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating template in DB:", error);
      throw error;
    }
    return data;
  },

  /**
   * Deletes a template metadata row in Supabase
   */
  async deleteTemplate(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting template from DB:", error);
      return false;
    }
    return true;
  }
};
