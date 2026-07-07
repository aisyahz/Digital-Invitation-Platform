export type RsvpAttendanceStatus = 'yes' | 'no' | 'maybe';

export interface RsvpModel {
  id: string;
  invitationId: string;
  name: string;
  phone?: string;
  attendance: RsvpAttendanceStatus;
  pax: number;
  message?: string;
  createdAt: string;
}

export type CreateRsvpInput = Omit<RsvpModel, 'id' | 'createdAt'>;

export type UpdateRsvpInput = Partial<
  Omit<RsvpModel, 'id' | 'invitationId' | 'createdAt'>
>;
