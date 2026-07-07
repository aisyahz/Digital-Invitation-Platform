export type RsvpAttendanceStatus = 'pending' | 'attending' | 'not_attending' | 'maybe';

export interface RsvpModel {
  id: string;
  invitationId: string;
  guestId?: string;
  attendanceStatus: RsvpAttendanceStatus;
  paxCount: number;
  message?: string;
  note?: string;
  status: RsvpAttendanceStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateRsvpInput = Omit<RsvpModel, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateRsvpInput = Partial<
  Omit<RsvpModel, 'id' | 'invitationId' | 'guestId' | 'createdAt' | 'updatedAt'>
>;
