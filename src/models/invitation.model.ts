export type InvitationStatus = 'draft' | 'published' | 'archived';

export interface InvitationContent {
  bride?: string;
  groom?: string;
  event?: string;
  date?: string;
  time?: string;
  venue?: string;
  address?: string;
  gmaps?: string;
  waze?: string;
  phone?: string;
  music?: string;
  [key: string]: unknown;
}

export interface InvitationSettings {
  is_active?: boolean;
  music_enabled?: boolean;
  allow_wishes?: boolean;
  watermark_disabled?: boolean;
  [key: string]: unknown;
}

export interface InvitationAnalytics {
  total_views?: number;
  unique_views?: number;
  last_viewed?: string | null;
  map_clicks?: number;
  gallery_opens?: number;
  music_plays?: number;
  rsvp_count?: number;
  share_count?: number;
  [key: string]: unknown;
}

export interface InvitationModel {
  id: string;
  orderId?: string;
  slug: string;
  content: InvitationContent;
  settings: InvitationSettings;
  analytics: InvitationAnalytics;
  status?: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateInvitationInput = Omit<
  InvitationModel,
  'createdAt' | 'updatedAt'
>;

export type UpdateInvitationInput = Partial<
  Omit<InvitationModel, 'id' | 'createdAt' | 'updatedAt'>
>;
