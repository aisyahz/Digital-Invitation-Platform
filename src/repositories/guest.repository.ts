import type {
  CreateGuestInput,
  GuestModel,
  UpdateGuestInput
} from '../models';

export interface GuestRepository {
  findById(id: string): Promise<GuestModel | null>;
  findAll(invitationId?: string): Promise<GuestModel[]>;
  findByInvitationId(invitationId: string): Promise<GuestModel[]>;
  create(input: CreateGuestInput): Promise<GuestModel>;
  update(id: string, input: UpdateGuestInput): Promise<GuestModel>;
  delete(id: string): Promise<void>;
}

export type GuestMessageRepository = GuestRepository;
