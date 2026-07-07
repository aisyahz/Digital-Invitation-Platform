export interface GuestMessageModel {
  id: string;
  invitationId: string;
  guestName: string;
  message: string;
  createdAt: string;
}

export type CreateGuestMessageInput = Omit<GuestMessageModel, 'id' | 'createdAt'>;

export type UpdateGuestMessageInput = Partial<
  Omit<GuestMessageModel, 'id' | 'invitationId' | 'createdAt'>
>;

export type GuestModel = GuestMessageModel;
export type CreateGuestInput = CreateGuestMessageInput;
export type UpdateGuestInput = UpdateGuestMessageInput;
