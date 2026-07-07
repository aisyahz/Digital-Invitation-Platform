export type GuestStatus = 'invited' | 'opened' | 'responded' | 'cancelled';
export type GuestRsvpStatus = 'pending' | 'attending' | 'not_attending' | 'maybe';

export interface GuestModel {
  id: string;
  invitationId: string;
  name: string;
  phone?: string;
  email?: string;
  status: GuestStatus;
  rsvpStatus: GuestRsvpStatus;
  rsvpId?: string;
  rsvpAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateGuestInput = Omit<
  GuestModel,
  'id' | 'createdAt' | 'updatedAt' | 'rsvpId' | 'rsvpAt'
>;

export type UpdateGuestInput = Partial<
  Omit<GuestModel, 'id' | 'invitationId' | 'createdAt' | 'updatedAt'>
>;
