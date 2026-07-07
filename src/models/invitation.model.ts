export type InvitationPublishStatus = 'draft' | 'published' | 'unpublished' | 'archived';

export interface InvitationVenue {
  name: string;
  address: string;
  mapUrl?: string;
  wazeUrl?: string;
}

export interface InvitationModel {
  id: string;
  brideName: string;
  groomName: string;
  eventDate: string;
  eventTime: string;
  venue: InvitationVenue;
  templateId: string;
  templateKey: string;
  slug: string;
  status: InvitationPublishStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type CreateInvitationInput = Omit<
  InvitationModel,
  'id' | 'createdAt' | 'updatedAt' | 'publishedAt'
>;

export type UpdateInvitationInput = Partial<
  Omit<InvitationModel, 'id' | 'createdAt' | 'updatedAt'>
>;
